"use client";

import React, { useState, useEffect } from "react";
import AdminSidebar from "@/components/admin/AdminSidebar";
import { formatCurrency } from "@/lib/utils";
import {
  Settings,
  Store,
  Phone,
  Mail,
  MapPin,
  Truck,
  Clock,
  CreditCard,
  ShieldCheck,
  CheckCircle2,
  AlertTriangle,
  Save,
} from "lucide-react";

export default function AdminSettingsPage() {
  const [kitchenName, setKitchenName] = useState("श्री फूड");
  const [supportPhone, setSupportPhone] = useState("+91 92843 66544");
  const [supportEmail, setSupportEmail] = useState("orders@shreefood.com");
  const [kitchenAddress, setKitchenAddress] = useState(
    "Plot 42, Food Tech Park, Cyber City, Bangalore — 560100"
  );
  const [deliveryFee, setDeliveryFee] = useState(40);
  const [freeDeliveryThreshold, setFreeDeliveryThreshold] = useState(499);
  const [openingTime, setOpeningTime] = useState("11:00");
  const [closingTime, setClosingTime] = useState("23:30");
  const [isOpenToday, setIsOpenToday] = useState(true);

  const [savedSuccess, setSavedSuccess] = useState(false);

  // Load saved settings if any in localStorage
  useEffect(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("ck_kitchen_settings");
      if (saved) {
        try {
          const parsed = JSON.parse(saved);
          if (parsed.kitchenName) setKitchenName(parsed.kitchenName);
          if (parsed.supportPhone) setSupportPhone(parsed.supportPhone);
          if (parsed.supportEmail) setSupportEmail(parsed.supportEmail);
          if (parsed.kitchenAddress) setKitchenAddress(parsed.kitchenAddress);
          if (parsed.deliveryFee !== undefined) setDeliveryFee(parsed.deliveryFee);
          if (parsed.freeDeliveryThreshold !== undefined) setFreeDeliveryThreshold(parsed.freeDeliveryThreshold);
          if (parsed.openingTime) setOpeningTime(parsed.openingTime);
          if (parsed.closingTime) setClosingTime(parsed.closingTime);
        } catch {
          // Default settings
        }
      }
    }
  }, []);

  const handleSaveSettings = (e: React.FormEvent) => {
    e.preventDefault();
    const config = {
      kitchenName,
      supportPhone,
      supportEmail,
      kitchenAddress,
      deliveryFee,
      freeDeliveryThreshold,
      openingTime,
      closingTime,
      isOpenToday,
    };

    if (typeof window !== "undefined") {
      localStorage.setItem("ck_kitchen_settings", JSON.stringify(config));
    }

    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 3000);
  };

  return (
    <div className="flex flex-col md:flex-row min-h-[calc(100vh-5rem)] bg-slate-50">
      <AdminSidebar />

      <main className="flex-1 p-4 sm:p-8 space-y-8 max-w-5xl">
        {/* Header */}
        <div>
          <div className="flex items-center gap-2">
            <Settings className="w-6 h-6 text-primary" />
            <h1 className="font-display font-extrabold text-2xl sm:text-3xl text-navy">
              Kitchen & Operations Settings
            </h1>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Configure kitchen store details, operational hours, delivery logistics, and payment verification
          </p>
        </div>

        {savedSuccess && (
          <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs sm:text-sm font-bold flex items-center gap-2 animate-fade-in shadow-xs">
            <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
            <span>Settings updated and saved successfully!</span>
          </div>
        )}

        <form onSubmit={handleSaveSettings} className="space-y-8">
          {/* 1. KITCHEN STORE IDENTITY */}
          <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-xs space-y-5">
            <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
              <Store className="w-5 h-5 text-primary" />
              <h2 className="font-display font-bold text-base text-navy">
                Kitchen Store Identity
              </h2>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Cloud Kitchen Name
                </label>
                <input
                  type="text"
                  required
                  value={kitchenName}
                  onChange={(e) => setKitchenName(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-slate-800 focus:outline-none focus:ring-2 focus:ring-primary/20"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Customer Support Phone
                </label>
                <div className="relative">
                  <Phone className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input
                    type="text"
                    required
                    value={supportPhone}
                    onChange={(e) => setSupportPhone(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 text-slate-800 focus:outline-none focus:ring-2 focus:ring-primary/20"
                  />
                </div>
              </div>

              <div className="sm:col-span-2">
                <label className="block font-bold text-slate-700 mb-1">
                  Operations & Orders Email
                </label>
                <div className="relative">
                  <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input
                    type="email"
                    required
                    value={supportEmail}
                    onChange={(e) => setSupportEmail(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 text-slate-800 focus:outline-none focus:ring-2 focus:ring-primary/20"
                  />
                </div>
              </div>

              <div className="sm:col-span-2">
                <label className="block font-bold text-slate-700 mb-1">
                  Physical Kitchen Facility Address
                </label>
                <div className="relative">
                  <MapPin className="absolute left-3.5 top-3 w-4 h-4 text-slate-400" />
                  <textarea
                    rows={2}
                    required
                    value={kitchenAddress}
                    onChange={(e) => setKitchenAddress(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 text-slate-800 focus:outline-none focus:ring-2 focus:ring-primary/20"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* 2. DELIVERY & LOGISTICS SETTINGS */}
          <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-xs space-y-5">
            <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
              <Truck className="w-5 h-5 text-primary" />
              <h2 className="font-display font-bold text-base text-navy">
                Delivery & Shipping Logistics
              </h2>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Standard Delivery Fee (₹)
                </label>
                <input
                  type="number"
                  min="0"
                  value={deliveryFee}
                  onChange={(e) => setDeliveryFee(Number(e.target.value))}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-slate-800 focus:outline-none focus:ring-2 focus:ring-primary/20"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Free Delivery Cart Minimum (₹)
                </label>
                <input
                  type="number"
                  min="0"
                  value={freeDeliveryThreshold}
                  onChange={(e) => setFreeDeliveryThreshold(Number(e.target.value))}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-slate-800 focus:outline-none focus:ring-2 focus:ring-primary/20"
                />
              </div>
            </div>
          </div>

          {/* 3. BUSINESS & OPERATIONAL HOURS */}
          <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-xs space-y-5">
            <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
              <Clock className="w-5 h-5 text-primary" />
              <h2 className="font-display font-bold text-base text-navy">
                Kitchen Operating Hours
              </h2>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Daily Opening Time (IST)
                </label>
                <input
                  type="time"
                  value={openingTime}
                  onChange={(e) => setOpeningTime(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-slate-800 focus:outline-none focus:ring-2 focus:ring-primary/20"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Daily Closing Time (IST)
                </label>
                <input
                  type="time"
                  value={closingTime}
                  onChange={(e) => setClosingTime(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-slate-800 focus:outline-none focus:ring-2 focus:ring-primary/20"
                />
              </div>
            </div>
          </div>

          {/* 4. PAYMENT CONFIGURATION STATUS (SAFE - NO KEYS EXPOSED) */}
          <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-xs space-y-5">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <CreditCard className="w-5 h-5 text-primary" />
                <h2 className="font-display font-bold text-base text-navy">
                  Payment Configuration & Gateway Status
                </h2>
              </div>
              <span className="px-2.5 py-1 rounded-full bg-slate-100 text-slate-700 text-[10px] font-extrabold uppercase">
                Zero Key Exposure
              </span>
            </div>

            <div className="space-y-3 text-xs">
              <div className="flex items-center justify-between p-3.5 rounded-2xl bg-slate-50 border border-slate-200">
                <div>
                  <p className="font-bold text-navy">UPI QR Payment System</p>
                  <p className="text-slate-500 text-[11px]">
                    Universal Indian UPI QR generated at <code>/images/qr-code.png</code>
                  </p>
                </div>
                <span className="px-3 py-1 rounded-xl bg-emerald-100 text-emerald-800 font-bold text-xs">
                  Active & Enabled
                </span>
              </div>

              <div className="flex items-center justify-between p-3.5 rounded-2xl bg-slate-50 border border-slate-200">
                <div>
                  <p className="font-bold text-navy">Development Simulation Payment Mode</p>
                  <p className="text-slate-500 text-[11px]">
                    Secure simulated verification mode for sandbox testing and demonstrations
                  </p>
                </div>
                <span className="px-3 py-1 rounded-xl bg-amber-100 text-amber-800 font-bold text-xs">
                  Active (Demo Safe)
                </span>
              </div>

              <div className="flex items-center justify-between p-3.5 rounded-2xl bg-slate-50 border border-slate-200">
                <div>
                  <p className="font-bold text-navy">Razorpay Production Gateway</p>
                  <p className="text-slate-500 text-[11px]">
                    Server-side HMAC-SHA256 signature verification & idempotent webhook listener
                  </p>
                </div>
                <span className="px-3 py-1 rounded-xl bg-slate-200 text-slate-700 font-bold text-xs">
                  Configured via .env.local
                </span>
              </div>
            </div>

            <p className="text-[11px] text-slate-400 italic">
              🔒 In compliance with cloud security policies, secret payment keys and webhook secrets remain strictly confined to the server-side environment variables and are never rendered to the browser.
            </p>
          </div>

          {/* Submit Button */}
          <div className="flex justify-end pt-2">
            <button
              type="submit"
              id="save-settings-btn"
              className="px-8 py-3.5 rounded-2xl bg-primary hover:bg-primary-hover text-white font-extrabold text-sm shadow-xl shadow-orange-500/25 active:scale-95 transition-all flex items-center gap-2"
            >
              <Save className="w-4 h-4" />
              <span>Save Kitchen Settings</span>
            </button>
          </div>
        </form>
      </main>
    </div>
  );
}
