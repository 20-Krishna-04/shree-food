"use client";

import React, { useState, useEffect, useCallback, useMemo } from "react";
import AdminSidebar from "@/components/admin/AdminSidebar";
import AdminOrderCard from "@/components/admin/AdminOrderCard";
import { Order, OrderStatus } from "@/types";
import { createClient } from "@/lib/supabase/client";
import { formatCurrency, formatDate } from "@/lib/utils";
import {
  ClipboardList,
  Search,
  RefreshCw,
  Clock,
  Flame,
  CheckCircle2,
  Kanban,
  Table as TableIcon,
  Bell,
  SlidersHorizontal,
} from "lucide-react";

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [search, setSearch] = useState("");
  const [viewMode, setViewMode] = useState<"board" | "table">("board");
  const [onlyPaid, setOnlyPaid] = useState(true);

  const supabase = createClient();

  const loadOrders = useCallback(async () => {
    setIsRefreshing(true);
    try {
      const res = await fetch("/api/orders");
      const json = await res.json();
      if (json.success && json.data) {
        setOrders(json.data);
      }
    } catch (e) {
      console.warn("Failed to load orders:", e);
    } finally {
      setIsRefreshing(false);
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadOrders();

    // Subscribe to Supabase Realtime
    const channel = supabase
      .channel("admin_orders_kanban_channel")
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
          } else if (payload.eventType === "UPDATE") {
            const updated = payload.new as Order;
            setOrders((prev) =>
              prev.map((o) => (o.id === updated.id ? { ...o, ...updated } : o))
            );
          }
        }
      )
      .subscribe();

    const interval = setInterval(loadOrders, 10000);

    return () => {
      supabase.removeChannel(channel);
      clearInterval(interval);
    };
  }, [loadOrders, supabase]);

  const handleStatusChange = async (orderId: string, nextStatus: OrderStatus) => {
    try {
      const res = await fetch(`/api/orders/${orderId}/status`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ order_status: nextStatus }),
      });
      const json = await res.json();
      if (json.success) {
        setOrders((prev) =>
          prev.map((o) => (o.id === orderId ? { ...o, order_status: nextStatus } : o))
        );
      }
    } catch (e) {
      console.error(e);
    }
  };

  // Filter orders according to search and onlyPaid flag
  const filteredOrders = useMemo(() => {
    return orders.filter((o) => {
      if (onlyPaid && o.payment_status !== "paid") return false;
      if (search.trim()) {
        const q = search.toLowerCase();
        return (
          o.id.toLowerCase().includes(q) ||
          o.customer_name.toLowerCase().includes(q) ||
          o.customer_phone.includes(q)
        );
      }
      return true;
    });
  }, [orders, onlyPaid, search]);

  const pendingOrders = filteredOrders.filter((o) => o.order_status === "pending");
  const inProcessOrders = filteredOrders.filter((o) => o.order_status === "in_process");
  const completedOrders = filteredOrders.filter((o) => o.order_status === "completed");

  return (
    <div className="flex flex-col md:flex-row min-h-[calc(100vh-5rem)] bg-slate-50">
      <AdminSidebar />

      <main className="flex-1 p-4 sm:p-8 space-y-6 max-w-7xl">
        {/* Header */}
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-ping" />
              <h1 className="font-display font-extrabold text-2xl sm:text-3xl text-navy">
                Order Management Board
              </h1>
            </div>
            <p className="text-xs text-slate-500 mt-1">
              Live three-column kitchen pipeline with real-time status transitions
            </p>
          </div>

          <div className="flex items-center gap-3">
            {/* View Mode Toggle */}
            <div className="flex items-center bg-white border border-slate-200 rounded-xl p-1 shadow-xs">
              <button
                type="button"
                onClick={() => setViewMode("board")}
                className={`p-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-colors ${
                  viewMode === "board"
                    ? "bg-primary text-white shadow-xs"
                    : "text-slate-600 hover:text-navy"
                }`}
                title="Kanban Board View"
              >
                <Kanban className="w-4 h-4" />
                <span className="hidden sm:inline">Board</span>
              </button>
              <button
                type="button"
                onClick={() => setViewMode("table")}
                className={`p-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-colors ${
                  viewMode === "table"
                    ? "bg-primary text-white shadow-xs"
                    : "text-slate-600 hover:text-navy"
                }`}
                title="Table Log View"
              >
                <TableIcon className="w-4 h-4" />
                <span className="hidden sm:inline">Table</span>
              </button>
            </div>

            <button
              type="button"
              onClick={loadOrders}
              disabled={isRefreshing}
              className="p-2 rounded-xl bg-white border border-slate-200 text-xs font-bold text-slate-700 hover:text-primary transition-all flex items-center gap-1.5 shadow-xs"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? "animate-spin text-primary" : ""}`} />
              <span className="hidden sm:inline">Refresh</span>
            </button>
          </div>
        </div>

        {/* Toolbar: Search & Queue Controls */}
        <div className="flex flex-wrap items-center justify-between gap-4 bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
          <div className="relative flex-1 min-w-[240px]">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by Order ID, Customer name or mobile..."
              className="w-full pl-10 pr-4 py-2 rounded-xl border border-slate-200 text-xs text-navy focus:outline-none focus:ring-2 focus:ring-primary/20"
            />
          </div>

          <div className="flex items-center gap-3 text-xs">
            <label className="flex items-center gap-2 cursor-pointer font-semibold text-slate-700 select-none">
              <input
                type="checkbox"
                checked={onlyPaid}
                onChange={(e) => setOnlyPaid(e.target.checked)}
                className="rounded text-primary focus:ring-primary h-4 w-4"
              />
              <span>Kitchen Queue (Paid orders only)</span>
            </label>
          </div>
        </div>

        {/* --- VIEW 1: THREE-COLUMN KANBAN BOARD (Section 5.B) --- */}
        {viewMode === "board" ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-start">
            {/* COLUMN 1: PENDING */}
            <div className="bg-slate-100/80 rounded-3xl p-4 border border-slate-200/80 space-y-4">
              <div className="flex items-center justify-between px-2">
                <div className="flex items-center gap-2">
                  <span className="w-3 h-3 rounded-full bg-amber-500" />
                  <h2 className="font-display font-extrabold text-sm sm:text-base text-navy uppercase tracking-wider">
                    1. Pending
                  </h2>
                </div>
                <span className="px-2.5 py-0.5 rounded-full bg-amber-200/70 text-amber-900 font-extrabold text-xs">
                  {pendingOrders.length}
                </span>
              </div>

              <div className="space-y-4 max-h-[calc(100vh-18rem)] overflow-y-auto pr-1">
                {pendingOrders.length > 0 ? (
                  pendingOrders.map((order) => (
                    <AdminOrderCard
                      key={order.id}
                      order={order}
                      onUpdateStatus={handleStatusChange}
                    />
                  ))
                ) : (
                  <div className="text-center py-12 bg-white/60 rounded-2xl border border-dashed border-slate-300 p-4 space-y-2">
                    <Clock className="w-8 h-8 text-slate-300 mx-auto" />
                    <p className="text-xs text-slate-400 font-medium">
                      No incoming pending orders
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* COLUMN 2: IN PROCESS */}
            <div className="bg-slate-100/80 rounded-3xl p-4 border border-slate-200/80 space-y-4">
              <div className="flex items-center justify-between px-2">
                <div className="flex items-center gap-2">
                  <span className="w-3 h-3 rounded-full bg-blue-500 animate-pulse" />
                  <h2 className="font-display font-extrabold text-sm sm:text-base text-navy uppercase tracking-wider">
                    2. In Process
                  </h2>
                </div>
                <span className="px-2.5 py-0.5 rounded-full bg-blue-200/70 text-blue-900 font-extrabold text-xs">
                  {inProcessOrders.length}
                </span>
              </div>

              <div className="space-y-4 max-h-[calc(100vh-18rem)] overflow-y-auto pr-1">
                {inProcessOrders.length > 0 ? (
                  inProcessOrders.map((order) => (
                    <AdminOrderCard
                      key={order.id}
                      order={order}
                      onUpdateStatus={handleStatusChange}
                    />
                  ))
                ) : (
                  <div className="text-center py-12 bg-white/60 rounded-2xl border border-dashed border-slate-300 p-4 space-y-2">
                    <Flame className="w-8 h-8 text-slate-300 mx-auto" />
                    <p className="text-xs text-slate-400 font-medium">
                      No dishes currently in kitchen preparation
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* COLUMN 3: COMPLETED */}
            <div className="bg-slate-100/80 rounded-3xl p-4 border border-slate-200/80 space-y-4">
              <div className="flex items-center justify-between px-2">
                <div className="flex items-center gap-2">
                  <span className="w-3 h-3 rounded-full bg-emerald-500" />
                  <h2 className="font-display font-extrabold text-sm sm:text-base text-navy uppercase tracking-wider">
                    3. Completed
                  </h2>
                </div>
                <span className="px-2.5 py-0.5 rounded-full bg-emerald-200/70 text-emerald-900 font-extrabold text-xs">
                  {completedOrders.length}
                </span>
              </div>

              <div className="space-y-4 max-h-[calc(100vh-18rem)] overflow-y-auto pr-1">
                {completedOrders.length > 0 ? (
                  completedOrders.map((order) => (
                    <AdminOrderCard
                      key={order.id}
                      order={order}
                      onUpdateStatus={handleStatusChange}
                    />
                  ))
                ) : (
                  <div className="text-center py-12 bg-white/60 rounded-2xl border border-dashed border-slate-300 p-4 space-y-2">
                    <CheckCircle2 className="w-8 h-8 text-slate-300 mx-auto" />
                    <p className="text-xs text-slate-400 font-medium">
                      Completed orders will appear here
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        ) : (
          /* --- VIEW 2: LOG TABLE VIEW --- */
          <div className="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-xs">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-bold uppercase text-[10px] tracking-wider">
                  <tr>
                    <th className="py-4 px-6">Order ID & Date</th>
                    <th className="py-4 px-6">Customer</th>
                    <th className="py-4 px-6">Items Ordered</th>
                    <th className="py-4 px-6">Total Amount</th>
                    <th className="py-4 px-6">Payment</th>
                    <th className="py-4 px-6">Status & Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-slate-700">
                  {filteredOrders.length > 0 ? (
                    filteredOrders.map((order) => (
                      <tr key={order.id} className="hover:bg-slate-50/70 transition-colors">
                        <td className="py-4 px-6">
                          <span className="font-mono font-bold text-slate-800 block">
                            #{order.id.slice(0, 16)}
                          </span>
                          <span className="text-[11px] text-slate-400">
                            {formatDate(order.created_at)}
                          </span>
                        </td>

                        <td className="py-4 px-6">
                          <span className="font-bold text-navy block">
                            {order.customer_name}
                          </span>
                          <span className="text-slate-500 text-[11px] block">
                            {order.customer_phone}
                          </span>
                        </td>

                        <td className="py-4 px-6 max-w-xs">
                          <span className="font-semibold text-slate-800">
                            {order.items?.map((i) => `${i.quantity}x ${i.product?.name}`).join(", ") ||
                              "Dishes"}
                          </span>
                        </td>

                        <td className="py-4 px-6 font-display font-extrabold text-sm text-navy">
                          {formatCurrency(order.total_amount)}
                        </td>

                        <td className="py-4 px-6">
                          <span
                            className={`px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase ${
                              order.payment_status === "paid"
                                ? "bg-emerald-100 text-emerald-800"
                                : "bg-amber-100 text-amber-800"
                            }`}
                          >
                            {order.payment_status}
                          </span>
                        </td>

                        <td className="py-4 px-6">
                          <div className="flex items-center gap-2">
                            {order.order_status === "pending" && (
                              <button
                                type="button"
                                onClick={() => handleStatusChange(order.id, "in_process")}
                                className="px-3 py-1.5 rounded-xl bg-primary text-white text-xs font-bold hover:bg-primary-hover shadow-xs flex items-center gap-1"
                              >
                                <Flame className="w-3.5 h-3.5" />
                                <span>Accept & Process</span>
                              </button>
                            )}

                            {order.order_status === "in_process" && (
                              <button
                                type="button"
                                onClick={() => handleStatusChange(order.id, "completed")}
                                className="px-3 py-1.5 rounded-xl bg-emerald-600 text-white text-xs font-bold hover:bg-emerald-700 shadow-xs flex items-center gap-1"
                              >
                                <CheckCircle2 className="w-3.5 h-3.5" />
                                <span>Mark Completed</span>
                              </button>
                            )}

                            {order.order_status === "completed" && (
                              <span className="px-2.5 py-1 rounded-xl bg-slate-100 text-slate-500 text-xs font-bold flex items-center gap-1">
                                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                                Completed
                              </span>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={6} className="text-center py-12 text-slate-400">
                        No orders found in queue.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
