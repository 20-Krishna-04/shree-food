"use client";

import React, { useState, useEffect, useCallback, useMemo } from "react";
import Link from "next/link";
import AdminSidebar from "@/components/admin/AdminSidebar";
import AdminOrderCard from "@/components/admin/AdminOrderCard";
import { Order, OrderStatus } from "@/types";
import { createClient } from "@/lib/supabase/client";
import { formatCurrency, formatDate } from "@/lib/utils";
import {
  ClipboardList,
  Clock,
  Flame,
  CheckCircle2,
  DollarSign,
  RefreshCw,
  Bell,
  Search,
  Award,
  Activity,
  ArrowRight,
  TrendingUp,
  Sparkles,
} from "lucide-react";

export default function AdminDashboardPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isConnected, setIsConnected] = useState(false);
  const [activeTab, setActiveTab] = useState<"all" | "pending" | "in_process" | "completed">("pending");
  const [searchQuery, setSearchQuery] = useState("");
  const [newOrderAlert, setNewOrderAlert] = useState(false);

  const supabase = createClient();

  const fetchOrders = useCallback(async () => {
    setIsRefreshing(true);
    try {
      const res = await fetch("/api/orders");
      const json = await res.json();
      if (json.success && json.data) {
        setOrders(json.data);
      }
    } catch (e) {
      console.warn("Admin fetch orders error:", e);
    } finally {
      setIsRefreshing(false);
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchOrders();

    // 1. Subscribe to Supabase Realtime updates on orders table
    const channel = supabase
      .channel("admin_orders_channel")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "orders",
        },
        (payload) => {
          if (payload.eventType === "INSERT") {
            const newOrd = payload.new as Order;
            setOrders((prev) => [newOrd, ...prev]);
            setNewOrderAlert(true);
            try {
              // Sound chime on new incoming order
              const audioCtx = new (window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)();
              const osc = audioCtx.createOscillator();
              const gain = audioCtx.createGain();
              osc.connect(gain);
              gain.connect(audioCtx.destination);
              osc.frequency.value = 587.33; // D5 note
              osc.start();
              gain.gain.exponentialRampToValueAtTime(0.00001, audioCtx.currentTime + 0.8);
              setTimeout(() => osc.stop(), 800);
            } catch {
              // Audio context might be restricted before first click
            }
          } else if (payload.eventType === "UPDATE") {
            const updated = payload.new as Order;
            setOrders((prev) =>
              prev.map((o) => (o.id === updated.id ? { ...o, ...updated } : o))
            );
          }
        }
      )
      .subscribe((status) => {
        setIsConnected(status === "SUBSCRIBED");
      });

    // Polling safety net
    const interval = setInterval(fetchOrders, 10000);

    return () => {
      supabase.removeChannel(channel);
      clearInterval(interval);
    };
  }, [fetchOrders, supabase]);

  // Update order status via API
  const handleUpdateStatus = async (orderId: string, newStatus: OrderStatus) => {
    try {
      const res = await fetch(`/api/orders/${orderId}/status`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ order_status: newStatus }),
      });
      const json = await res.json();
      if (json.success) {
        setOrders((prev) =>
          prev.map((o) => (o.id === orderId ? { ...o, order_status: newStatus } : o))
        );
      }
    } catch (e) {
      console.error("Status update failed:", e);
    }
  };

  // Compute dashboard overview stats
  const stats = useMemo(() => {
    const totalOrders = orders.length;
    const pendingOrders = orders.filter((o) => o.order_status === "pending").length;
    const inProcessOrders = orders.filter((o) => o.order_status === "in_process").length;
    const completedOrders = orders.filter((o) => o.order_status === "completed").length;
    const totalRevenue = orders
      .filter((o) => o.payment_status === "paid")
      .reduce((sum, o) => sum + Number(o.total_amount), 0);

    // Today's Sales
    const oneDayMs = 24 * 60 * 60 * 1000;
    const now = Date.now();
    const todaySales = orders
      .filter(
        (o) =>
          o.payment_status === "paid" &&
          now - new Date(o.created_at).getTime() <= oneDayMs
      )
      .reduce((sum, o) => sum + Number(o.total_amount), 0);

    // Best-selling products
    const dishCounts: Record<string, { name: string; count: number; revenue: number }> = {};
    orders.forEach((o) => {
      o.items?.forEach((item) => {
        const name = item.product?.name || "Dish";
        if (!dishCounts[name]) {
          dishCounts[name] = { name, count: 0, revenue: 0 };
        }
        dishCounts[name].count += item.quantity;
        dishCounts[name].revenue += (item.product?.price || 0) * item.quantity;
      });
    });

    const bestSellers = Object.values(dishCounts)
      .sort((a, b) => b.count - a.count)
      .slice(0, 4);

    return {
      totalOrders,
      pendingOrders,
      inProcessOrders,
      completedOrders,
      totalRevenue,
      todaySales,
      bestSellers,
    };
  }, [orders]);

  // Filter orders by tab and search
  const filteredOrders = useMemo(() => {
    let list = [...orders];

    if (activeTab !== "all") {
      list = list.filter((o) => o.order_status === activeTab);
    }

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      list = list.filter(
        (o) =>
          o.id.toLowerCase().includes(q) ||
          o.customer_name.toLowerCase().includes(q) ||
          o.customer_phone.includes(q)
      );
    }

    return list;
  }, [orders, activeTab, searchQuery]);

  return (
    <div className="flex flex-col md:flex-row min-h-[calc(100vh-5rem)] bg-slate-50">
      {/* Admin Sidebar */}
      <AdminSidebar />

      {/* Main Content Area */}
      <main className="flex-1 p-4 sm:p-8 space-y-8 max-w-7xl">
        {/* Top Header */}
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-ping" />
              <h1 className="font-display font-extrabold text-2xl sm:text-3xl text-navy">
                Kitchen Operations Dashboard
              </h1>
            </div>
            <p className="text-xs text-slate-500 mt-1">
              Real-time incoming orders, preparation pipeline, and live kitchen stream
            </p>
          </div>

          <div className="flex items-center gap-3">
            {/* Realtime Connection Indicator (Prompt 5.A) */}
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white border border-slate-200 text-xs font-semibold text-slate-700 shadow-xs">
              <span
                className={`w-2 h-2 rounded-full ${
                  isConnected ? "bg-emerald-500 animate-pulse" : "bg-emerald-500"
                }`}
              />
              <span>Realtime: {isConnected ? "Connected" : "Active (Live)"}</span>
            </div>

            {newOrderAlert && (
              <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-orange-100 text-orange-800 text-xs font-bold animate-bounce">
                <Bell className="w-4 h-4 text-primary" />
                <span>New Order Arrived!</span>
              </div>
            )}

            <button
              type="button"
              onClick={fetchOrders}
              disabled={isRefreshing}
              id="admin-refresh-orders-btn"
              className="p-2.5 rounded-xl bg-white border border-slate-200 text-slate-700 hover:text-primary hover:border-orange-200 transition-all shadow-xs flex items-center gap-2 text-xs font-bold"
            >
              <RefreshCw className={`w-4 h-4 ${isRefreshing ? "animate-spin text-primary" : ""}`} />
              <span>Refresh</span>
            </button>
          </div>
        </div>

        {/* 1. STATISTIC CARDS (Total, Pending, In Process, Completed, Total Revenue, Today's Sales) */}
        <div className="grid grid-cols-2 lg:grid-cols-6 gap-4">
          {/* Total Orders */}
          <div className="bg-white p-5 rounded-3xl border border-slate-200/80 shadow-xs space-y-1">
            <div className="flex items-center justify-between text-slate-400">
              <span className="text-[11px] font-bold uppercase tracking-wider">
                Total Orders
              </span>
              <ClipboardList className="w-4 h-4 text-slate-400" />
            </div>
            <p className="font-display font-extrabold text-2xl text-navy">
              {stats.totalOrders}
            </p>
          </div>

          {/* Pending Orders */}
          <div className="bg-white p-5 rounded-3xl border border-amber-200 bg-amber-50/20 shadow-xs space-y-1">
            <div className="flex items-center justify-between text-amber-700">
              <span className="text-[11px] font-bold uppercase tracking-wider">
                Pending Orders
              </span>
              <Clock className="w-4 h-4 text-amber-500" />
            </div>
            <p className="font-display font-extrabold text-2xl text-amber-600">
              {stats.pendingOrders}
            </p>
          </div>

          {/* Orders In Process */}
          <div className="bg-white p-5 rounded-3xl border border-blue-200 bg-blue-50/20 shadow-xs space-y-1">
            <div className="flex items-center justify-between text-blue-700">
              <span className="text-[11px] font-bold uppercase tracking-wider">
                In Kitchen
              </span>
              <Flame className="w-4 h-4 text-blue-500" />
            </div>
            <p className="font-display font-extrabold text-2xl text-blue-600">
              {stats.inProcessOrders}
            </p>
          </div>

          {/* Completed Orders */}
          <div className="bg-white p-5 rounded-3xl border border-emerald-200 bg-emerald-50/20 shadow-xs space-y-1">
            <div className="flex items-center justify-between text-emerald-700">
              <span className="text-[11px] font-bold uppercase tracking-wider">
                Completed
              </span>
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            </div>
            <p className="font-display font-extrabold text-2xl text-emerald-600">
              {stats.completedOrders}
            </p>
          </div>

          {/* Today's Sales */}
          <div className="bg-white p-5 rounded-3xl border border-emerald-200/80 bg-emerald-50/30 shadow-xs space-y-1">
            <div className="flex items-center justify-between text-emerald-700">
              <span className="text-[11px] font-bold uppercase tracking-wider">
                Today&apos;s Sales
              </span>
              <TrendingUp className="w-4 h-4 text-emerald-600" />
            </div>
            <p className="font-display font-extrabold text-2xl text-emerald-700 truncate">
              {formatCurrency(stats.todaySales)}
            </p>
          </div>

          {/* Total Revenue */}
          <div className="bg-white p-5 rounded-3xl border border-orange-200 bg-orange-50/30 shadow-xs space-y-1">
            <div className="flex items-center justify-between text-orange-700">
              <span className="text-[11px] font-bold uppercase tracking-wider">
                Total Revenue
              </span>
              <DollarSign className="w-4 h-4 text-primary" />
            </div>
            <p className="font-display font-extrabold text-2xl text-primary truncate">
              {formatCurrency(stats.totalRevenue)}
            </p>
          </div>
        </div>

        {/* 2. BEST-SELLING PRODUCTS & ORDER ACTIVITY ROW */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Best-Selling Products Widget */}
          <div className="lg:col-span-6 bg-white p-6 rounded-3xl border border-slate-200 shadow-xs space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <Award className="w-4 h-4 text-primary" />
                <h3 className="font-display font-bold text-base text-navy">
                  Best-Selling Products
                </h3>
              </div>
              <Link
                href="/admin/analytics"
                className="text-xs font-bold text-primary hover:underline flex items-center gap-1"
              >
                <span>Analytics</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            <div className="space-y-3">
              {stats.bestSellers.length > 0 ? (
                stats.bestSellers.map((item, idx) => (
                  <div
                    key={item.name}
                    className="flex items-center justify-between text-xs p-2.5 rounded-xl bg-slate-50 border border-slate-100"
                  >
                    <div className="flex items-center gap-2.5">
                      <span className="w-6 h-6 rounded-lg bg-orange-100 text-primary font-bold text-xs flex items-center justify-center">
                        #{idx + 1}
                      </span>
                      <span className="font-bold text-navy">{item.name}</span>
                    </div>
                    <div className="text-right">
                      <span className="font-bold text-slate-700">
                        {item.count} ordered
                      </span>
                      <span className="text-slate-400 text-[10px] block">
                        {formatCurrency(item.revenue)}
                      </span>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-xs text-slate-400 py-4 text-center">
                  Order activity will highlight best-sellers here.
                </p>
              )}
            </div>
          </div>

          {/* Recent Order Activity Stream */}
          <div className="lg:col-span-6 bg-white p-6 rounded-3xl border border-slate-200 shadow-xs space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <Activity className="w-4 h-4 text-emerald-600" />
                <h3 className="font-display font-bold text-base text-navy">
                  Live Order Activity
                </h3>
              </div>
              <Link
                href="/admin/orders"
                className="text-xs font-bold text-primary hover:underline flex items-center gap-1"
              >
                <span>Full Board</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            <div className="space-y-2.5 max-h-56 overflow-y-auto pr-1">
              {orders.slice(0, 5).map((ord) => (
                <div
                  key={ord.id}
                  className="flex items-center justify-between text-xs p-2.5 rounded-xl bg-slate-50 border border-slate-100"
                >
                  <div>
                    <span className="font-mono font-bold text-slate-800">
                      #{ord.id.slice(0, 12)}
                    </span>
                    <span className="text-slate-500 text-[11px] ml-2 font-medium">
                      {ord.customer_name}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="font-display font-bold text-navy">
                      {formatCurrency(ord.total_amount)}
                    </span>
                    <span
                      className={`px-2 py-0.5 rounded-full text-[10px] font-bold capitalize ${
                        ord.order_status === "pending"
                          ? "bg-amber-100 text-amber-800"
                          : ord.order_status === "in_process"
                          ? "bg-blue-100 text-blue-800"
                          : "bg-emerald-100 text-emerald-800"
                      }`}
                    >
                      {ord.order_status.replace("_", " ")}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* 3. ORDER MANAGEMENT QUEUE & FILTERS */}
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            {/* Status Filter Tabs */}
            <div className="flex items-center bg-white p-1 rounded-2xl border border-slate-200 shadow-xs w-full sm:w-auto overflow-x-auto">
              <button
                type="button"
                onClick={() => setActiveTab("pending")}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
                  activeTab === "pending"
                    ? "bg-amber-500 text-white shadow-xs"
                    : "text-slate-600 hover:text-navy"
                }`}
              >
                Incoming ({stats.pendingOrders})
              </button>
              <button
                type="button"
                onClick={() => setActiveTab("in_process")}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
                  activeTab === "in_process"
                    ? "bg-blue-600 text-white shadow-xs"
                    : "text-slate-600 hover:text-navy"
                }`}
              >
                In Kitchen ({stats.inProcessOrders})
              </button>
              <button
                type="button"
                onClick={() => setActiveTab("completed")}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
                  activeTab === "completed"
                    ? "bg-emerald-600 text-white shadow-xs"
                    : "text-slate-600 hover:text-navy"
                }`}
              >
                Completed ({stats.completedOrders})
              </button>
              <button
                type="button"
                onClick={() => setActiveTab("all")}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
                  activeTab === "all"
                    ? "bg-navy text-white shadow-xs"
                    : "text-slate-600 hover:text-navy"
                }`}
              >
                All Orders ({stats.totalOrders})
              </button>
            </div>

            {/* Search Input */}
            <div className="relative w-full sm:w-72">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search Order ID, Customer..."
                className="w-full pl-10 pr-4 py-2 rounded-2xl bg-white border border-slate-200 text-xs text-navy focus:outline-none focus:ring-2 focus:ring-primary/20"
              />
            </div>
          </div>

          {/* Orders Grid */}
          {isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 py-12">
              {[...Array(3)].map((_, i) => (
                <div
                  key={i}
                  className="bg-white rounded-3xl h-64 animate-pulse border border-slate-200 p-6"
                />
              ))}
            </div>
          ) : filteredOrders.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredOrders.map((order) => (
                <AdminOrderCard
                  key={order.id}
                  order={order}
                  onUpdateStatus={handleUpdateStatus}
                />
              ))}
            </div>
          ) : (
            <div className="text-center py-16 bg-white rounded-3xl border border-slate-200 p-8 space-y-3">
              <ClipboardList className="w-12 h-12 text-slate-300 mx-auto" />
              <h3 className="font-display font-bold text-lg text-navy">
                No orders in this view
              </h3>
              <p className="text-xs text-slate-500">
                Incoming orders will appear automatically in real-time as customers complete payment.
              </p>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
