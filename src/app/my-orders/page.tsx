"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { Order } from "@/types";
import { formatCurrency, formatDate } from "@/lib/utils";
import {
  ClipboardList,
  Clock,
  ArrowRight,
  ShoppingBag,
  Flame,
  CheckCircle2,
} from "lucide-react";

export default function MyOrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function loadOrders() {
      try {
        const res = await fetch("/api/orders");
        const json = await res.json();
        if (json.success && json.data) {
          setOrders(json.data);
        }
      } catch (e) {
        console.warn("Failed to load orders:", e);
      } finally {
        setIsLoading(false);
      }
    }
    loadOrders();
  }, []);

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
      <div className="mb-8">
        <h1 className="font-display font-extrabold text-3xl sm:text-4xl text-navy">
          My Order History
        </h1>
        <p className="text-slate-500 text-xs sm:text-sm mt-1">
          Track active food preparation and review your past orders
        </p>
      </div>

      {isLoading ? (
        <div className="space-y-4">
          {[...Array(3)].map((_, i) => (
            <div
              key={i}
              className="bg-white rounded-3xl h-36 border border-orange-100 p-6 animate-pulse"
            />
          ))}
        </div>
      ) : orders.length > 0 ? (
        <div className="space-y-5">
          {orders.map((order) => (
            <div
              key={order.id}
              className="bg-white rounded-3xl border border-orange-100 p-6 shadow-sm hover:shadow-md transition-all flex flex-col md:flex-row md:items-center justify-between gap-6"
            >
              <div className="space-y-2">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="font-mono text-xs font-bold text-slate-800">
                    #{order.id.slice(0, 16)}
                  </span>
                  <span
                    className={`px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase ${
                      order.payment_status === "paid"
                        ? "bg-emerald-100 text-emerald-800"
                        : "bg-amber-100 text-amber-800"
                    }`}
                  >
                    {order.payment_status}
                  </span>
                  <span
                    className={`px-3 py-0.5 rounded-full text-xs font-bold capitalize ${
                      order.order_status === "pending"
                        ? "bg-amber-100 text-amber-800"
                        : order.order_status === "in_process"
                        ? "bg-blue-100 text-blue-800"
                        : order.order_status === "completed"
                        ? "bg-emerald-100 text-emerald-800"
                        : "bg-rose-100 text-rose-800"
                    }`}
                  >
                    {order.order_status.replace("_", " ")}
                  </span>
                </div>

                <p className="text-xs text-slate-500">
                  Placed on {formatDate(order.created_at)}
                </p>

                <div className="text-xs text-slate-700">
                  <span className="font-semibold">
                    {order.items?.length || 0} items:{" "}
                  </span>
                  <span className="text-slate-500">
                    {order.items?.map((i) => `${i.quantity}x ${i.product?.name}`).join(", ") ||
                      "Delicious meal"}
                  </span>
                </div>
              </div>

              <div className="flex items-center justify-between md:justify-end gap-6 pt-4 md:pt-0 border-t md:border-t-0 border-slate-100">
                <div className="text-left md:text-right">
                  <span className="text-[10px] font-bold text-slate-400 uppercase block">
                    Total Amount
                  </span>
                  <span className="font-display font-extrabold text-lg text-navy">
                    {formatCurrency(order.total_amount)}
                  </span>
                </div>

                <Link
                  href={`/order-tracking/${order.id}`}
                  className="px-5 py-2.5 rounded-2xl bg-orange-50 hover:bg-primary hover:text-white text-primary text-xs font-bold transition-all flex items-center gap-1.5 shadow-xs"
                >
                  <span>Track Order</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-16 bg-white rounded-3xl border border-orange-100 p-8 space-y-4 max-w-md mx-auto">
          <div className="w-16 h-16 rounded-2xl bg-orange-50 text-primary flex items-center justify-center mx-auto">
            <ClipboardList className="w-8 h-8" />
          </div>
          <h3 className="font-display font-bold text-xl text-navy">
            No Orders Placed Yet
          </h3>
          <p className="text-xs text-slate-500">
            You haven&apos;t placed any orders yet. Check out our delicious menu and treat yourself today!
          </p>
          <Link
            href="/menu"
            className="inline-block px-6 py-3 rounded-2xl bg-primary text-white text-xs font-bold shadow-md shadow-orange-500/20"
          >
            Explore Menu
          </Link>
        </div>
      )}
    </div>
  );
}
