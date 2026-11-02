"use client";

import React, { useState } from "react";
import { Order, OrderStatus } from "@/types";
import { formatCurrency, formatDate } from "@/lib/utils";
import {
  Clock,
  Flame,
  CheckCircle2,
  MapPin,
  Phone,
  User,
  ArrowRight,
  ShieldCheck,
} from "lucide-react";

interface AdminOrderCardProps {
  order: Order;
  onUpdateStatus: (orderId: string, newStatus: OrderStatus) => Promise<void>;
}

export default function AdminOrderCard({
  order,
  onUpdateStatus,
}: AdminOrderCardProps) {
  const [isUpdating, setIsUpdating] = useState(false);

  const handleStatusChange = async (nextStatus: OrderStatus) => {
    setIsUpdating(true);
    try {
      await onUpdateStatus(order.id, nextStatus);
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <div className="bg-white rounded-3xl border border-orange-100/90 shadow-sm hover:shadow-md transition-all p-5 sm:p-6 flex flex-col justify-between">
      <div>
        {/* Top Header: Order ID & Status */}
        <div className="flex flex-wrap items-center justify-between gap-2 pb-4 border-b border-slate-100">
          <div>
            <div className="flex items-center gap-2">
              <span className="font-mono text-xs font-bold text-slate-800">
                #{order.id.slice(0, 16)}
              </span>
              <span
                className={`px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wider ${
                  order.payment_status === "paid"
                    ? "bg-emerald-100 text-emerald-800 border border-emerald-200"
                    : "bg-amber-100 text-amber-800 border border-amber-200"
                }`}
              >
                {order.payment_status}
              </span>
            </div>
            <p className="text-[11px] text-slate-400 mt-0.5">
              {formatDate(order.created_at)}
            </p>
          </div>

          <div>
            <span
              className={`px-3 py-1 rounded-xl text-xs font-bold flex items-center gap-1.5 ${
                order.order_status === "pending"
                  ? "bg-amber-100 text-amber-800"
                  : order.order_status === "in_process"
                  ? "bg-blue-100 text-blue-800"
                  : order.order_status === "completed"
                  ? "bg-emerald-100 text-emerald-800"
                  : "bg-rose-100 text-rose-800"
              }`}
            >
              {order.order_status === "pending" && <Clock className="w-3.5 h-3.5" />}
              {order.order_status === "in_process" && (
                <Flame className="w-3.5 h-3.5 text-orange-500 animate-pulse" />
              )}
              {order.order_status === "completed" && (
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
              )}
              <span className="capitalize">{order.order_status.replace("_", " ")}</span>
            </span>
          </div>
        </div>

        {/* Customer Information */}
        <div className="py-3 text-xs space-y-1 text-slate-600">
          <p className="font-bold text-navy text-sm flex items-center gap-1.5">
            <User className="w-3.5 h-3.5 text-primary" />
            {order.customer_name}
          </p>
          <p className="flex items-center gap-1.5 text-slate-500">
            <Phone className="w-3 h-3 text-slate-400" />
            {order.customer_phone}
          </p>
          <p className="flex items-start gap-1.5 text-slate-500 line-clamp-1">
            <MapPin className="w-3 h-3 text-slate-400 mt-0.5 shrink-0" />
            {order.delivery_address}
          </p>
        </div>

        {/* Ordered Items List */}
        <div className="bg-slate-50/80 rounded-2xl p-3 border border-slate-100 my-2 space-y-2">
          <p className="text-[11px] uppercase font-bold text-slate-400 tracking-wider">
            Items ({order.items?.length || 0})
          </p>
          <div className="space-y-1.5">
            {order.items?.map((item, idx) => (
              <div
                key={idx}
                className="flex items-center justify-between text-xs text-slate-700"
              >
                <span className="font-semibold">
                  <span className="text-primary font-bold mr-1">
                    {item.quantity}x
                  </span>
                  {item.product?.name}
                </span>
                <span className="text-slate-500">
                  {formatCurrency((item.product?.price || 0) * item.quantity)}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Footer: Total & Dynamic Action Button */}
      <div className="pt-4 border-t border-slate-100 mt-3 flex items-center justify-between gap-3">
        <div>
          <span className="text-[10px] uppercase font-bold text-slate-400 block">
            Total Revenue
          </span>
          <span className="font-display font-extrabold text-lg text-navy">
            {formatCurrency(order.total_amount)}
          </span>
        </div>

        <div>
          {order.order_status === "pending" && (
            <button
              type="button"
              onClick={() => handleStatusChange("in_process")}
              disabled={isUpdating}
              id={`accept-order-${order.id}`}
              className="px-4 py-2 rounded-xl bg-primary hover:bg-primary-hover text-white text-xs font-bold shadow-md shadow-orange-500/20 active:scale-95 transition-all flex items-center gap-1.5 disabled:opacity-60"
            >
              {isUpdating ? (
                "Updating..."
              ) : (
                <>
                  <Flame className="w-3.5 h-3.5" />
                  <span>Accept & Process</span>
                </>
              )}
            </button>
          )}

          {order.order_status === "in_process" && (
            <button
              type="button"
              onClick={() => handleStatusChange("completed")}
              disabled={isUpdating}
              id={`complete-order-${order.id}`}
              className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-md shadow-emerald-600/20 active:scale-95 transition-all flex items-center gap-1.5 disabled:opacity-60"
            >
              {isUpdating ? (
                "Updating..."
              ) : (
                <>
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>Mark Completed</span>
                </>
              )}
            </button>
          )}

          {order.order_status === "completed" && (
            <span className="px-3 py-1.5 rounded-xl bg-slate-100 text-slate-500 text-xs font-bold flex items-center gap-1">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
              Order Completed
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
