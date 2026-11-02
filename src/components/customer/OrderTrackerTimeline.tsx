"use client";

import React, { useEffect, useState, useCallback } from "react";
import { Order, OrderStatus } from "@/types";
import { createClient } from "@/lib/supabase/client";
import { formatCurrency, formatDate } from "@/lib/utils";
import {
  Clock,
  Flame,
  CheckCircle2,
  PackageCheck,
  AlertCircle,
  RefreshCw,
  MapPin,
  Phone,
  UtensilsCrossed,
  Sparkles,
} from "lucide-react";

interface OrderTrackerTimelineProps {
  initialOrder: Order;
}

export default function OrderTrackerTimeline({
  initialOrder,
}: OrderTrackerTimelineProps) {
  const [order, setOrder] = useState<Order>(initialOrder);
  const [isConnected, setIsConnected] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [lastUpdated, setLastUpdated] = useState<string>(new Date().toLocaleTimeString());

  const supabase = createClient();

  const refetchOrder = useCallback(async () => {
    setIsRefreshing(true);
    try {
      const res = await fetch(`/api/orders/${order.id}`);
      const json = await res.json();
      if (json.success && json.data) {
        setOrder(json.data);
        setLastUpdated(new Date().toLocaleTimeString());
      }
    } catch (e) {
      console.warn("Error refetching order:", e);
    } finally {
      setIsRefreshing(false);
    }
  }, [order.id]);

  useEffect(() => {
    // 1. Subscribe to Realtime updates on this specific order
    const channel = supabase
      .channel(`order_tracking_${order.id}`)
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "orders",
          filter: `id=eq.${order.id}`,
        },
        (payload) => {
          if (payload.new) {
            setOrder((prev) => ({
              ...prev,
              ...(payload.new as Partial<Order>),
            }));
            setLastUpdated(new Date().toLocaleTimeString());
          }
        }
      )
      .subscribe((status) => {
        setIsConnected(status === "SUBSCRIBED");
      });

    // Also poll every 8 seconds as safety net for missed events
    const interval = setInterval(refetchOrder, 8000);

    return () => {
      supabase.removeChannel(channel);
      clearInterval(interval);
    };
  }, [order.id, refetchOrder, supabase]);

  // Stage steps
  const steps: { status: OrderStatus; title: string; desc: string; icon: React.ReactNode }[] = [
    {
      status: "pending",
      title: "Order Placed",
      desc: "Order confirmed & sent to kitchen handi",
      icon: <Clock className="w-5 h-5" />,
    },
    {
      status: "in_process",
      title: "Kitchen Preparing",
      desc: "Chefs are cooking your meal fresh with authentic spices",
      icon: <Flame className="w-5 h-5 text-orange-500 animate-bounce" />,
    },
    {
      status: "completed",
      title: "Delivered & Enjoyed",
      desc: "Delivered hot and ready to eat. Bon Appétit!",
      icon: <CheckCircle2 className="w-5 h-5 text-emerald-500" />,
    },
  ];

  const getStepProgress = (current: OrderStatus): number => {
    if (current === "pending") return 1;
    if (current === "in_process") return 2;
    if (current === "completed") return 3;
    return 0; // cancelled
  };

  const currentStep = getStepProgress(order.order_status);

  return (
    <div className="space-y-6">
      {/* Realtime Live Pulse Header */}
      <div className="bg-white rounded-3xl border border-orange-100 p-6 shadow-sm flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-ping" />
            <h1 className="font-display font-extrabold text-2xl text-navy">
              Live Order Tracker
            </h1>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Order <span className="font-mono font-semibold text-slate-700">#{order.id.slice(0, 16)}</span>
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="text-right hidden sm:block">
            <p className="text-[11px] text-slate-400">Live Realtime Sync</p>
            <p className="text-xs font-semibold text-emerald-600 flex items-center gap-1 justify-end">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" /> Connected
            </p>
          </div>
          <button
            type="button"
            onClick={refetchOrder}
            disabled={isRefreshing}
            className="p-2.5 rounded-xl bg-orange-50 text-slate-700 hover:text-primary hover:bg-orange-100 transition-all"
            title="Refresh Order Status"
          >
            <RefreshCw className={`w-4 h-4 ${isRefreshing ? "animate-spin text-primary" : ""}`} />
          </button>
        </div>
      </div>

      {/* Progress Stepper Timeline Card */}
      <div className="bg-white rounded-3xl border border-orange-100 p-6 sm:p-8 shadow-sm">
        <h2 className="text-xs uppercase font-extrabold text-slate-400 tracking-wider mb-6">
          Order Progress
        </h2>

        {order.order_status === "cancelled" ? (
          <div className="p-4 bg-rose-50 border border-rose-200 rounded-2xl flex items-center gap-3 text-rose-800">
            <AlertCircle className="w-6 h-6 text-rose-600 shrink-0" />
            <div>
              <p className="font-bold text-sm">Order Cancelled</p>
              <p className="text-xs text-rose-600">This order was cancelled. Any deductions will be refunded.</p>
            </div>
          </div>
        ) : (
          <div className="relative">
            {/* Connecting Progress Line */}
            <div className="hidden md:block absolute top-1/2 left-12 right-12 h-1 bg-slate-100 -translate-y-1/2 z-0">
              <div
                className="h-full bg-gradient-to-r from-primary to-emerald-500 transition-all duration-700 rounded-full"
                style={{
                  width:
                    currentStep === 1
                      ? "15%"
                      : currentStep === 2
                      ? "65%"
                      : "100%",
                }}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 relative z-10">
              {steps.map((step, idx) => {
                const stepNum = idx + 1;
                const isDone = currentStep >= stepNum;
                const isCurrent = currentStep === stepNum;

                return (
                  <div
                    key={step.title}
                    className={`flex md:flex-col items-center md:text-center gap-4 p-4 rounded-2xl transition-all ${
                      isCurrent
                        ? "bg-orange-50/80 border border-primary/30 shadow-sm"
                        : "bg-white"
                    }`}
                  >
                    <div
                      className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 transition-all shadow-sm ${
                        isDone
                          ? isCurrent
                            ? "bg-primary text-white scale-110 shadow-orange-500/30"
                            : "bg-emerald-600 text-white"
                          : "bg-slate-100 text-slate-400"
                      }`}
                    >
                      {step.icon}
                    </div>

                    <div>
                      <div className="flex items-center gap-2 md:justify-center">
                        <span className="text-[11px] font-bold text-slate-400">
                          Step 0{stepNum}
                        </span>
                        {isCurrent && (
                          <span className="px-2 py-0.5 rounded-full bg-primary text-white text-[10px] font-extrabold uppercase animate-pulse">
                            Active
                          </span>
                        )}
                      </div>
                      <h3 className="font-display font-bold text-base text-navy mt-0.5">
                        {step.title}
                      </h3>
                      <p className="text-xs text-slate-500 mt-1 max-w-xs leading-relaxed">
                        {step.desc}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* Order Details Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Items Ordered List */}
        <div className="lg:col-span-2 bg-white rounded-3xl border border-orange-100 p-6 shadow-sm">
          <h3 className="font-display font-bold text-lg text-navy mb-4 flex items-center gap-2">
            <UtensilsCrossed className="w-5 h-5 text-primary" />
            Items Ordered
          </h3>

          <div className="divide-y divide-slate-100">
            {order.items && order.items.length > 0 ? (
              order.items.map((item, idx) => (
                <div key={idx} className="py-3.5 flex items-center justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-orange-50 flex items-center justify-center text-primary font-bold text-sm">
                      {item.quantity}x
                    </div>
                    <div>
                      <h4 className="font-bold text-sm text-navy">{item.product.name}</h4>
                      <p className="text-xs text-slate-400">
                        {formatCurrency(item.product.price)} each
                      </p>
                    </div>
                  </div>
                  <span className="font-display font-bold text-sm text-navy">
                    {formatCurrency(item.product.price * item.quantity)}
                  </span>
                </div>
              ))
            ) : (
              <p className="text-xs text-slate-500 py-4">No item details available</p>
            )}
          </div>

          {/* Pricing summary */}
          <div className="mt-6 pt-4 border-t border-slate-100 space-y-2 text-xs text-slate-600">
            <div className="flex justify-between">
              <span>Subtotal</span>
              <span className="font-semibold">{formatCurrency(order.subtotal)}</span>
            </div>
            <div className="flex justify-between">
              <span>Delivery Charges</span>
              <span className="font-semibold">
                {order.delivery_fee === 0 ? "FREE" : formatCurrency(order.delivery_fee)}
              </span>
            </div>
            <div className="flex justify-between text-base font-extrabold text-navy pt-2 border-t border-slate-100 font-display">
              <span>Total Paid</span>
              <span className="text-primary">{formatCurrency(order.total_amount)}</span>
            </div>
          </div>
        </div>

        {/* Delivery & Payment Information */}
        <div className="space-y-6">
          {/* Delivery Details */}
          <div className="bg-white rounded-3xl border border-orange-100 p-6 shadow-sm space-y-4">
            <h3 className="font-display font-bold text-base text-navy flex items-center gap-2">
              <MapPin className="w-4 h-4 text-primary" />
              Delivery Address
            </h3>
            <div className="text-xs space-y-1.5 text-slate-600">
              <p className="font-bold text-navy text-sm">{order.customer_name}</p>
              <p className="flex items-center gap-1.5 text-slate-500">
                <Phone className="w-3.5 h-3.5 text-slate-400" />
                {order.customer_phone}
              </p>
              <p className="text-slate-600 leading-relaxed bg-slate-50 p-3 rounded-xl border border-slate-100">
                {order.delivery_address}
              </p>
            </div>
          </div>

          {/* Payment Status Card */}
          <div className="bg-white rounded-3xl border border-orange-100 p-6 shadow-sm space-y-3">
            <h3 className="font-display font-bold text-base text-navy flex items-center gap-2">
              <PackageCheck className="w-4 h-4 text-emerald-600" />
              Payment Status
            </h3>
            <div className="flex items-center justify-between text-xs">
              <span className="text-slate-500">Status</span>
              <span
                className={`px-3 py-1 rounded-full font-bold uppercase text-[10px] ${
                  order.payment_status === "paid"
                    ? "bg-emerald-100 text-emerald-800 border border-emerald-200"
                    : "bg-amber-100 text-amber-800 border border-amber-200"
                }`}
              >
                {order.payment_status}
              </span>
            </div>
            <div className="flex items-center justify-between text-xs text-slate-500">
              <span>Placed At</span>
              <span>{formatDate(order.created_at)}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
