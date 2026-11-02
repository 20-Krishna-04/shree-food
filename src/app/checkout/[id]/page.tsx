"use client";

import React, { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import QRPaymentModal from "@/components/checkout/QRPaymentModal";
import { formatCurrency } from "@/lib/utils";
import { Order } from "@/types";
import {
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  ArrowLeft,
  Sparkles,
} from "lucide-react";

export default function CheckoutPage() {
  const params = useParams();
  const router = useRouter();
  const orderId = params.id as string;

  const [order, setOrder] = useState<Order | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isVerifying, setIsVerifying] = useState(false);
  const [error, setError] = useState("");
  const [paymentSuccess, setPaymentSuccess] = useState(false);

  useEffect(() => {
    async function fetchOrderDetails() {
      try {
        const res = await fetch(`/api/orders/${orderId}`);
        const json = await res.json();
        if (json.success && json.data) {
          setOrder(json.data);
          if (json.data.payment_status === "paid") {
            setPaymentSuccess(true);
          }
        } else {
          // If in local mock store or newly generated order
          setOrder({
            id: orderId,
            user_id: "u1111111-1111-1111-1111-111111111111",
            customer_name: "Customer",
            customer_phone: "9876543210",
            delivery_address: "Delivery Address",
            items: [],
            subtotal: 199,
            delivery_fee: 40,
            total_amount: 239,
            payment_status: "pending",
            order_status: "pending",
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          });
        }
      } catch (e) {
        console.warn("Could not fetch order from API:", e);
      } finally {
        setIsLoading(false);
      }
    }

    if (orderId) {
      fetchOrderDetails();
    }
  }, [orderId]);

  const handleVerifyPayment = async (payload: {
    order_id: string;
    provider_payment_id?: string;
    provider_order_id?: string;
    signature?: string;
    is_simulation?: boolean;
  }) => {
    setIsVerifying(true);
    setError("");

    try {
      const res = await fetch("/api/payments/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const json = await res.json();

      if (!res.ok || !json.success) {
        throw new Error(json.error || "Payment verification failed");
      }

      setPaymentSuccess(true);

      // Redirect to live tracking after brief celebration delay
      setTimeout(() => {
        router.push(`/order-tracking/${orderId}`);
      }, 1500);
    } catch (err: unknown) {
      setError(
        err instanceof Error ? err.message : "Payment verification failed"
      );
    } finally {
      setIsVerifying(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center p-8 space-y-4">
        <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin" />
        <p className="text-sm font-semibold text-slate-600">
          Loading secure checkout session...
        </p>
      </div>
    );
  }

  if (paymentSuccess) {
    return (
      <div className="max-w-md mx-auto px-4 py-20 text-center space-y-6">
        <div className="w-20 h-20 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto shadow-md">
          <CheckCircle2 className="w-10 h-10" />
        </div>
        <h1 className="font-display font-extrabold text-3xl text-navy">
          Payment Verified!
        </h1>
        <p className="text-xs sm:text-sm text-slate-600">
          Your payment of {formatCurrency(order?.total_amount || 0)} was verified successfully.
          The kitchen has received your order!
        </p>
        <div className="pt-2">
          <button
            type="button"
            onClick={() => router.push(`/order-tracking/${orderId}`)}
            className="px-8 py-3.5 rounded-2xl bg-primary text-white font-bold text-sm shadow-lg shadow-orange-500/25"
          >
            Track Order Status Now
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-16">
      {error && (
        <div className="mb-6 p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-700 text-xs sm:text-sm font-semibold flex items-center gap-3">
          <AlertCircle className="w-5 h-5 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Render QR Payment Modal Component */}
      <QRPaymentModal
        orderId={orderId}
        amount={order?.total_amount || 239}
        customerName={order?.customer_name || "Customer"}
        isRazorpayConfigured={false}
        onVerifyPayment={handleVerifyPayment}
        isVerifying={isVerifying}
      />
    </div>
  );
}
