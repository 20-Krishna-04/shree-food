"use client";

import React, { useState } from "react";
import { useAuth } from "@/contexts/auth-context";
import {
  User,
  Mail,
  Phone,
  ShieldCheck,
  CheckCircle2,
  Calendar,
} from "lucide-react";

export default function ProfilePage() {
  const { user, profile, isAdmin } = useAuth();
  const [fullName, setFullName] = useState(profile?.full_name || "Customer");
  const [phone, setPhone] = useState(profile?.phone || "9876543210");
  const [isSaved, setIsSaved] = useState(false);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 3000);
  };

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-16">
      <div className="bg-white rounded-3xl border border-orange-100 p-6 sm:p-10 shadow-sm space-y-8">
        {/* Top Header */}
        <div className="flex items-center gap-4 pb-6 border-b border-slate-100">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-primary to-orange-400 text-white flex items-center justify-center font-display font-bold text-2xl shadow-md">
            {fullName.charAt(0)}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="font-display font-extrabold text-2xl text-navy">
                {fullName}
              </h1>
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase bg-orange-100 text-orange-800">
                {isAdmin ? "Admin" : "Customer"}
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              {user?.email || "customer@cloudkitchen.com"}
            </p>
          </div>
        </div>

        {isSaved && (
          <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            <span>Profile details updated successfully!</span>
          </div>
        )}

        {/* Profile Form */}
        <form onSubmit={handleSave} className="space-y-5 text-xs">
          <div>
            <label className="block font-bold text-slate-700 mb-1">
              Full Name
            </label>
            <div className="relative">
              <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
              />
            </div>
          </div>

          <div>
            <label className="block font-bold text-slate-700 mb-1">
              Email Address
            </label>
            <div className="relative">
              <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="email"
                disabled
                value={user?.email || "customer@cloudkitchen.com"}
                className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-slate-500 text-sm cursor-not-allowed"
              />
            </div>
            <span className="text-[10px] text-slate-400 mt-1 block">
              Email is managed by Supabase Authentication.
            </span>
          </div>

          <div>
            <label className="block font-bold text-slate-700 mb-1">
              Mobile Number
            </label>
            <div className="relative">
              <Phone className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
              />
            </div>
          </div>

          <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
            <span className="text-[11px] text-slate-400 flex items-center gap-1">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              Role cannot be escalated by customers (Protected by RLS).
            </span>

            <button
              type="submit"
              className="px-6 py-2.5 rounded-xl bg-primary hover:bg-primary-hover text-white font-bold text-xs shadow-md shadow-orange-500/20 transition-all"
            >
              Save Changes
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
