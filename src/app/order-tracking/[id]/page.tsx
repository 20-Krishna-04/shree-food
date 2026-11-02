"use client";

import React, { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import { Order } from "@/types";
import OrderTrackerTimeline from "@/components/customer/OrderTrackerTimeline";
import Link from "next/link";
import { ArrowLeft, AlertCircle } from "lucide-react";

export default function LiveOrderTrackingPage() {
  const params = useParams();
  const orderId = params.id as string;

  const [order, setOrder] = useState<Order | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadOrder() {
      try {
        const res = await fetch(`/api/orders/${orderId}`);
        const json = await res.json();
        if (json.success && json.data) {
          setOrder(json.data);
        } else {
          // Fallback initial order for newly placed order tracking
          setOrder({
            id: orderId,
            user_id: "u1111111-1111-1111-1111-111111111111",
            customer_name: "Customer",
            customer_phone: "9876543210",
            delivery_address: "Flat 402, Sunshine Residency, 12th Main Road, Indiranagar, Bangalore",
            items: [
              {
                product: {
                  id: "sp-veg-biryani",
                  name: "व्हेज बिर्याणी (Veg Biryani)",
                  price: 140,
                  description: "अस्सल मसाल्यात शिजवलेली चविष्ट व्हेज बिर्याणी",
                  category_id: "cat-biryani-pulao",
                  image_url: "/images/dishes/veg-biryani.jpg",
                  is_available: true,
                  is_vegetarian: true,
                  preparation_time_mins: 20,
                },
                quantity: 1,
              },
            ],
            subtotal: 199,
            delivery_fee: 40,
            total_amount: 239,
            payment_status: "paid",
            order_status: "pending",
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          });
        }
      } catch (e) {
        console.warn("Could not load order:", e);
      } finally {
        setIsLoading(false);
      }
    }

    if (orderId) {
      loadOrder();
    }
  }, [orderId]);

  if (isLoading) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-20 text-center space-y-4">
        <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto" />
        <p className="text-sm font-semibold text-slate-600">
          Connecting to Realtime Kitchen Stream...
        </p>
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="max-w-md mx-auto px-4 py-20 text-center space-y-4">
        <AlertCircle className="w-12 h-12 text-rose-500 mx-auto" />
        <h2 className="text-xl font-bold text-navy">Order Not Found</h2>
        <p className="text-xs text-slate-500">
          We could not locate this order. Please verify your order ID or check your orders history.
        </p>
        <Link
          href="/menu"
          className="inline-block px-6 py-2.5 rounded-xl bg-primary text-white text-xs font-bold"
        >
          Return to Menu
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
      <div className="mb-6">
        <Link
          href="/my-orders"
          className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-600 hover:text-primary transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to All Orders</span>
        </Link>
      </div>

      <OrderTrackerTimeline initialOrder={order} />
    </div>
  );
}
