"use client";

import React, { useState } from "react";
import { formatCurrency } from "@/lib/utils";
import {
  QrCode,
  ShieldCheck,
  CheckCircle2,
  Copy,
  Check,
  CreditCard,
  AlertCircle,
  ExternalLink,
  Sparkles,
} from "lucide-react";

interface QRPaymentModalProps {
  orderId: string;
  amount: number;
  customerName: string;
  isRazorpayConfigured: boolean;
  onVerifyPayment: (payload: {
    order_id: string;
    provider_payment_id?: string;
    provider_order_id?: string;
    signature?: string;
    is_simulation?: boolean;
  }) => Promise<void>;
  isVerifying: boolean;
}

export default function QRPaymentModal({
  orderId,
  amount,
  customerName,
  isRazorpayConfigured,
  onVerifyPayment,
  isVerifying,
}: QRPaymentModalProps) {
  const [copiedUpi, setCopiedUpi] = useState(false);
  const upiId = "cloudkitchen@icici";

  const handleCopyUpi = () => {
    navigator.clipboard.writeText(upiId);
    setCopiedUpi(true);
    setTimeout(() => setCopiedUpi(false), 2000);
  };

  // Generate UPI payment URI string
  const upiUri = `upi://pay?pa=${upiId}&pn=Cloud+Kitchen&am=${amount}&cu=INR&tn=Order_${orderId.slice(0, 8)}`;
  const qrSvgUrl = `https://api.qrserver.com/v1/create-qr-code/?size=220x220&data=${encodeURIComponent(
    upiUri
  )}&margin=10`;

  return (
    <div className="bg-white rounded-3xl border border-orange-200/80 shadow-2xl p-6 sm:p-8 max-w-lg mx-auto overflow-hidden">
      {/* Header */}
      <div className="text-center pb-6 border-b border-slate-100">
        <span className="inline-block px-3 py-1 bg-orange-100 text-orange-800 text-xs font-bold rounded-full uppercase tracking-wider mb-2">
          Secure Payment Portal
        </span>
        <h2 className="font-display font-extrabold text-2xl text-navy">
          Scan & Pay with UPI QR
        </h2>
        <p className="text-xs sm:text-sm text-slate-500 mt-1">
          Scan the QR code below using any UPI app or run simulated payment
        </p>
      </div>

      {/* Amount Display */}
      <div className="my-6 bg-cream/70 border border-orange-200/60 rounded-2xl p-4 text-center">
        <span className="text-xs uppercase tracking-wider font-semibold text-slate-500">
          Total Amount Payable
        </span>
        <div className="text-3xl sm:text-4xl font-extrabold text-navy font-display mt-0.5">
          {formatCurrency(amount)}
        </div>
        <p className="text-[11px] text-slate-500 mt-1">
          Order ID: <span className="font-mono font-semibold">{orderId.slice(0, 16)}</span>
        </p>
      </div>

      {/* QR Code Section */}
      <div className="flex flex-col items-center justify-center py-4 bg-slate-50/70 rounded-2xl border border-slate-200/80 mb-6">
        <div className="relative p-3 bg-white rounded-2xl shadow-md border border-slate-200">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/images/qr-code.png"
            alt="UPI QR Payment Code"
            onError={(e) => {
              // Fallback to dynamic QR if image path encounters an error
              (e.currentTarget as HTMLImageElement).src = qrSvgUrl;
            }}
            className="w-48 h-48 sm:w-52 sm:h-52 object-contain rounded-xl"
          />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-white/95 p-1.5 rounded-full shadow-md border border-orange-100">
            <QrCode className="w-6 h-6 text-primary" />
          </div>
        </div>

        {/* UPI Details */}
        <div className="mt-4 flex items-center gap-2 bg-white px-3.5 py-1.5 rounded-xl border border-slate-200 text-xs font-semibold text-slate-700">
          <span>UPI ID:</span>
          <span className="font-mono text-primary font-bold">{upiId}</span>
          <button
            type="button"
            onClick={handleCopyUpi}
            className="text-slate-400 hover:text-slate-700 ml-1"
            title="Copy UPI ID"
          >
            {copiedUpi ? (
              <Check className="w-3.5 h-3.5 text-emerald-600" />
            ) : (
              <Copy className="w-3.5 h-3.5" />
            )}
          </button>
        </div>
      </div>

      {/* Payment Instructions */}
      <div className="space-y-2 mb-6 text-xs text-slate-600 bg-orange-50/60 p-4 rounded-2xl border border-orange-100">
        <p className="font-bold text-slate-800 flex items-center gap-1.5">
          <ShieldCheck className="w-4 h-4 text-emerald-600" />
          Scan and Pay Instructions:
        </p>
        <ol className="list-decimal list-inside space-y-1 pl-1 text-[11px] sm:text-xs">
          <li>Open GPay, PhonePe, Paytm, or BHIM on your smartphone.</li>
          <li>Point your camera at the QR code above or pay to UPI ID <strong className="font-mono">{upiId}</strong>.</li>
          <li>Authorize the payment for {formatCurrency(amount)}.</li>
          <li>Click the <strong>Done (I Have Paid)</strong> button below to complete confirmation.</li>
        </ol>
      </div>

      {/* Payment Action Buttons */}
      <div className="space-y-3">
        {/* Done (I Have Paid) Simulation Button */}
        <div className="bg-amber-50 border border-amber-200 rounded-2xl p-3 text-center">
          <span className="inline-block px-2.5 py-0.5 bg-amber-200/80 text-amber-900 rounded-full text-[10px] font-extrabold uppercase tracking-wide mb-1">
            DEMO SIMULATION MODE
          </span>
          <p className="text-[11px] text-amber-800 leading-tight mb-2.5">
            This mode simulates successful payment confirmation for demonstration and testing purposes.
          </p>
          <button
            type="button"
            onClick={() =>
              onVerifyPayment({
                order_id: orderId,
                is_simulation: true,
              })
            }
            disabled={isVerifying}
            id="done-paid-btn"
            className="w-full py-3.5 px-4 rounded-2xl bg-primary hover:bg-primary-hover text-white font-extrabold text-sm shadow-lg shadow-orange-500/25 active:scale-98 transition-all flex items-center justify-center gap-2 disabled:opacity-60"
          >
            {isVerifying ? (
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                <span>Simulating Verification...</span>
              </div>
            ) : (
              <>
                <CheckCircle2 className="w-5 h-5" />
                <span>Done (I Have Paid) — Simulate Confirmation</span>
              </>
            )}
          </button>
        </div>

        <p className="text-[11px] text-center text-slate-400">
          🔒 Secure 256-bit Encrypted Checkout. In production, Razorpay webhooks and server signatures verify real bank transactions.
        </p>
      </div>
    </div>
  );
}
