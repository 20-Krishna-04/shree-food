"use client";

import React, { useState, useEffect, useMemo } from "react";
import AdminSidebar from "@/components/admin/AdminSidebar";
import { Order } from "@/types";
import { formatCurrency } from "@/lib/utils";
import {
  BarChart3,
  TrendingUp,
  DollarSign,
  ClipboardList,
  CheckCircle2,
  Calendar,
  Flame,
  Award,
  RefreshCw,
  PieChart,
} from "lucide-react";

export default function AdminAnalyticsPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [timeRange, setTimeRange] = useState<"all" | "month" | "week">("all");

  const loadOrders = async () => {
    setIsRefreshing(true);
    try {
      const res = await fetch("/api/orders");
      const json = await res.json();
      if (json.success && json.data) {
        setOrders(json.data);
      }
    } catch (e) {
      console.warn("Analytics fetch error:", e);
    } finally {
      setIsRefreshing(false);
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadOrders();
  }, []);

  // Compute metrics from actual orders
  const metrics = useMemo(() => {
    const now = new Date();
    const oneDayMs = 24 * 60 * 60 * 1000;

    const totalOrders = orders.length;
    const paidOrders = orders.filter((o) => o.payment_status === "paid");
    const completedOrders = orders.filter((o) => o.order_status === "completed").length;
    const pendingOrders = orders.filter((o) => o.order_status === "pending").length;
    const inProcessOrders = orders.filter((o) => o.order_status === "in_process").length;
    const cancelledOrders = orders.filter((o) => o.order_status === "cancelled").length;

    const totalSales = paidOrders.reduce((sum, o) => sum + Number(o.total_amount), 0);

    // Daily Revenue (last 24 hours)
    const dailyRevenue = paidOrders
      .filter((o) => now.getTime() - new Date(o.created_at).getTime() <= oneDayMs)
      .reduce((sum, o) => sum + Number(o.total_amount), 0);

    // Weekly Revenue (last 7 days)
    const weeklyRevenue = paidOrders
      .filter((o) => now.getTime() - new Date(o.created_at).getTime() <= 7 * oneDayMs)
      .reduce((sum, o) => sum + Number(o.total_amount), 0);

    // Monthly Revenue (last 30 days)
    const monthlyRevenue = paidOrders
      .filter((o) => now.getTime() - new Date(o.created_at).getTime() <= 30 * oneDayMs)
      .reduce((sum, o) => sum + Number(o.total_amount), 0);

    // Average Order Value
    const aov = paidOrders.length > 0 ? Math.round(totalSales / paidOrders.length) : 0;

    // Aggregate Most Popular Food Items
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

    const popularDishes = Object.values(dishCounts)
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);

    // Daily Trend for last 7 days (Day 1 to Day 7)
    const daysData = Array.from({ length: 7 }, (_, i) => {
      const d = new Date(now.getTime() - (6 - i) * oneDayMs);
      const dayLabel = d.toLocaleDateString("en-IN", { weekday: "short" });
      const dayStart = new Date(d.setHours(0, 0, 0, 0)).getTime();
      const dayEnd = dayStart + oneDayMs;

      const dayRevenue = paidOrders
        .filter((o) => {
          const t = new Date(o.created_at).getTime();
          return t >= dayStart && t < dayEnd;
        })
        .reduce((sum, o) => sum + Number(o.total_amount), 0);

      const dayOrderCount = orders.filter((o) => {
        const t = new Date(o.created_at).getTime();
        return t >= dayStart && t < dayEnd;
      }).length;

      return {
        label: dayLabel,
        revenue: dayRevenue,
        orders: dayOrderCount,
      };
    });

    return {
      totalSales,
      dailyRevenue,
      weeklyRevenue,
      monthlyRevenue,
      totalOrders,
      completedOrders,
      pendingOrders,
      inProcessOrders,
      cancelledOrders,
      aov,
      popularDishes,
      daysData,
    };
  }, [orders]);

  const maxDayRevenue = Math.max(...metrics.daysData.map((d) => d.revenue), 100);

  return (
    <div className="flex flex-col md:flex-row min-h-[calc(100vh-5rem)] bg-slate-50">
      <AdminSidebar />

      <main className="flex-1 p-4 sm:p-8 space-y-8 max-w-7xl">
        {/* Header */}
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <BarChart3 className="w-6 h-6 text-primary" />
              <h1 className="font-display font-extrabold text-2xl sm:text-3xl text-navy">
                Business & Sales Analytics
              </h1>
            </div>
            <p className="text-xs text-slate-500 mt-1">
              Live database-computed revenue metrics, order velocity, and popular culinary dishes
            </p>
          </div>

          <button
            type="button"
            onClick={loadOrders}
            disabled={isRefreshing}
            className="p-2.5 rounded-xl bg-white border border-slate-200 text-xs font-bold text-slate-700 hover:text-primary transition-all flex items-center gap-2 shadow-xs"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? "animate-spin text-primary" : ""}`} />
            <span>Refresh Analytics</span>
          </button>
        </div>

        {/* 1. TOP METRIC CARDS: Total, Daily, Weekly, Monthly Revenue & Orders */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
          {/* Total Sales */}
          <div className="bg-white p-6 rounded-3xl border border-orange-200 bg-orange-50/20 shadow-xs space-y-2">
            <div className="flex items-center justify-between text-orange-700">
              <span className="text-[11px] font-bold uppercase tracking-wider">
                Total Sales
              </span>
              <DollarSign className="w-5 h-5 text-primary" />
            </div>
            <p className="font-display font-extrabold text-2xl sm:text-3xl text-primary">
              {formatCurrency(metrics.totalSales)}
            </p>
            <p className="text-[11px] text-slate-500">
              Avg Order Value: <strong>{formatCurrency(metrics.aov)}</strong>
            </p>
          </div>

          {/* Daily Revenue */}
          <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-xs space-y-2">
            <div className="flex items-center justify-between text-slate-500">
              <span className="text-[11px] font-bold uppercase tracking-wider">
                Daily Revenue
              </span>
              <Calendar className="w-5 h-5 text-slate-400" />
            </div>
            <p className="font-display font-extrabold text-2xl sm:text-3xl text-navy">
              {formatCurrency(metrics.dailyRevenue)}
            </p>
            <p className="text-[11px] text-slate-500">Revenue last 24h</p>
          </div>

          {/* Weekly Revenue */}
          <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-xs space-y-2">
            <div className="flex items-center justify-between text-slate-500">
              <span className="text-[11px] font-bold uppercase tracking-wider">
                Weekly Revenue
              </span>
              <TrendingUp className="w-5 h-5 text-emerald-600" />
            </div>
            <p className="font-display font-extrabold text-2xl sm:text-3xl text-emerald-600">
              {formatCurrency(metrics.weeklyRevenue)}
            </p>
            <p className="text-[11px] text-slate-500">Revenue trailing 7 days</p>
          </div>

          {/* Monthly Revenue */}
          <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-xs space-y-2">
            <div className="flex items-center justify-between text-slate-500">
              <span className="text-[11px] font-bold uppercase tracking-wider">
                Monthly Revenue
              </span>
              <Award className="w-5 h-5 text-blue-600" />
            </div>
            <p className="font-display font-extrabold text-2xl sm:text-3xl text-blue-600">
              {formatCurrency(metrics.monthlyRevenue)}
            </p>
            <p className="text-[11px] text-slate-500">Revenue trailing 30 days</p>
          </div>
        </div>

        {/* 2. REVENUE TREND CHART & STATUS DISTRIBUTION */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Revenue Velocity Chart (7-Day Interactive Visual Bar Chart) */}
          <div className="lg:col-span-8 bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-xs space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="font-display font-bold text-lg text-navy">
                  7-Day Revenue Velocity
                </h2>
                <p className="text-xs text-slate-500">
                  Daily incoming revenue trend calculated from verified database orders
                </p>
              </div>
              <span className="px-3 py-1 rounded-full bg-orange-100 text-orange-800 text-xs font-bold">
                Live Data
              </span>
            </div>

            {/* Visual SVG / Bar Graph */}
            <div className="pt-6">
              <div className="h-64 flex items-end justify-between gap-2 sm:gap-6 border-b border-slate-200 pb-2">
                {metrics.daysData.map((d, idx) => {
                  const heightPercent = maxDayRevenue > 0
                    ? Math.max(12, Math.round((d.revenue / maxDayRevenue) * 100))
                    : 12;

                  return (
                    <div
                      key={idx}
                      className="flex-1 flex flex-col items-center gap-2 group h-full justify-end"
                    >
                      {/* Tooltip on hover */}
                      <div className="opacity-0 group-hover:opacity-100 transition-opacity bg-navy text-white text-[10px] font-bold py-1 px-2 rounded-lg pointer-events-none whitespace-nowrap shadow-md mb-1">
                        {formatCurrency(d.revenue)} ({d.orders} orders)
                      </div>

                      {/* Bar */}
                      <div
                        className="w-full max-w-[48px] rounded-t-xl bg-gradient-to-t from-orange-500 to-primary group-hover:from-orange-600 group-hover:to-primary-hover transition-all shadow-xs"
                        style={{ height: `${heightPercent}%` }}
                      />

                      {/* X-Axis Label */}
                      <span className="text-[11px] font-bold text-slate-500 mt-1">
                        {d.label}
                      </span>
                    </div>
                  );
                })}
              </div>
              <div className="flex items-center justify-between text-[11px] text-slate-400 pt-3">
                <span>0 — Trailing 7 Days</span>
                <span>Peak Daily: {formatCurrency(maxDayRevenue)}</span>
              </div>
            </div>
          </div>

          {/* Order Status Distribution Card */}
          <div className="lg:col-span-4 bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-xs space-y-6">
            <div>
              <h2 className="font-display font-bold text-lg text-navy">
                Order Status Distribution
              </h2>
              <p className="text-xs text-slate-500">
                Breakdown across total {metrics.totalOrders} order records
              </p>
            </div>

            <div className="space-y-4">
              {/* Completed */}
              <div className="space-y-1.5">
                <div className="flex justify-between text-xs font-bold">
                  <span className="text-emerald-700 flex items-center gap-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> Completed
                  </span>
                  <span className="text-navy">{metrics.completedOrders} orders</span>
                </div>
                <div className="w-full h-2.5 rounded-full bg-slate-100 overflow-hidden">
                  <div
                    className="h-full bg-emerald-500 rounded-full transition-all"
                    style={{
                      width: `${
                        metrics.totalOrders > 0
                          ? (metrics.completedOrders / metrics.totalOrders) * 100
                          : 0
                      }%`,
                    }}
                  />
                </div>
              </div>

              {/* In Process */}
              <div className="space-y-1.5">
                <div className="flex justify-between text-xs font-bold">
                  <span className="text-blue-700 flex items-center gap-1.5">
                    <Flame className="w-3.5 h-3.5 text-blue-500" /> In Kitchen
                  </span>
                  <span className="text-navy">{metrics.inProcessOrders} orders</span>
                </div>
                <div className="w-full h-2.5 rounded-full bg-slate-100 overflow-hidden">
                  <div
                    className="h-full bg-blue-500 rounded-full transition-all"
                    style={{
                      width: `${
                        metrics.totalOrders > 0
                          ? (metrics.inProcessOrders / metrics.totalOrders) * 100
                          : 0
                      }%`,
                    }}
                  />
                </div>
              </div>

              {/* Pending */}
              <div className="space-y-1.5">
                <div className="flex justify-between text-xs font-bold">
                  <span className="text-amber-700 flex items-center gap-1.5">
                    <ClipboardList className="w-3.5 h-3.5 text-amber-500" /> Incoming Pending
                  </span>
                  <span className="text-navy">{metrics.pendingOrders} orders</span>
                </div>
                <div className="w-full h-2.5 rounded-full bg-slate-100 overflow-hidden">
                  <div
                    className="h-full bg-amber-500 rounded-full transition-all"
                    style={{
                      width: `${
                        metrics.totalOrders > 0
                          ? (metrics.pendingOrders / metrics.totalOrders) * 100
                          : 0
                      }%`,
                    }}
                  />
                </div>
              </div>

              {/* Cancelled */}
              <div className="space-y-1.5">
                <div className="flex justify-between text-xs font-bold">
                  <span className="text-rose-700">Cancelled / Refunded</span>
                  <span className="text-navy">{metrics.cancelledOrders} orders</span>
                </div>
                <div className="w-full h-2.5 rounded-full bg-slate-100 overflow-hidden">
                  <div
                    className="h-full bg-rose-500 rounded-full transition-all"
                    style={{
                      width: `${
                        metrics.totalOrders > 0
                          ? (metrics.cancelledOrders / metrics.totalOrders) * 100
                          : 0
                      }%`,
                    }}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* 3. MOST POPULAR FOOD ITEMS */}
        <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-xs space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="font-display font-bold text-lg text-navy">
                Most Popular Dishes (Best Sellers)
              </h2>
              <p className="text-xs text-slate-500">
                Ranked by actual quantity sold and total revenue contribution
              </p>
            </div>
            <span className="text-xs font-bold text-primary uppercase tracking-wider">
              Top 5 Performers
            </span>
          </div>

          <div className="divide-y divide-slate-100">
            {metrics.popularDishes.length > 0 ? (
              metrics.popularDishes.map((dish, rank) => (
                <div
                  key={dish.name}
                  className="py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                >
                  <div className="flex items-center gap-4">
                    <span className="w-8 h-8 rounded-xl bg-orange-100 text-primary font-display font-extrabold text-sm flex items-center justify-center shrink-0">
                      #{rank + 1}
                    </span>
                    <div>
                      <h4 className="font-bold text-sm text-navy">{dish.name}</h4>
                      <p className="text-xs text-slate-400">
                        {dish.count} {dish.count === 1 ? "unit" : "units"} ordered by customers
                      </p>
                    </div>
                  </div>

                  <div className="text-left sm:text-right">
                    <span className="font-display font-extrabold text-base text-navy">
                      {formatCurrency(dish.revenue)}
                    </span>
                    <span className="text-[11px] text-slate-400 block font-medium">
                      Gross Dish Revenue
                    </span>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-xs text-slate-400 py-6 text-center">
                Order data is aggregating. Popular dishes will automatically rank here as customers order.
              </p>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
