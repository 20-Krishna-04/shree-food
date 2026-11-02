"use client";

import React, { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/auth-context";
import {
  User,
  Mail,
  Lock,
  Phone,
  MapPin,
  Eye,
  EyeOff,
  ArrowRight,
  AlertCircle,
  CheckCircle2,
} from "lucide-react";

export default function RegisterPage() {
  const router = useRouter();
  const { register } = useAuth();

  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage("");
    setSuccessMessage("");

    if (!fullName.trim()) {
      setErrorMessage("Please enter your name.");
      return;
    }

    if (!email.trim()) {
      setErrorMessage("Please enter your email ID.");
      return;
    }

    if (!phone.trim()) {
      setErrorMessage("Please enter your contact number.");
      return;
    }

    if (!address.trim()) {
      setErrorMessage("Please enter your delivery address.");
      return;
    }

    if (password.length < 6) {
      setErrorMessage("Password must be at least 6 characters.");
      return;
    }

    if (password !== confirmPassword) {
      setErrorMessage("Passwords do not match. Please re-enter your confirm password.");
      return;
    }

    setIsLoading(true);

    try {
      const res = await register(fullName, email, password, phone, address);
      if (res.success) {
        setSuccessMessage("Registration successful! Logging you in...");
        setTimeout(() => {
          router.push("/menu");
        }, 1200);
      } else {
        setErrorMessage(res.error || "Failed to create account");
      }
    } catch (err: unknown) {
      setErrorMessage(err instanceof Error ? err.message : "Registration error");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-[85vh] flex items-center justify-center px-4 py-12">
      <div className="bg-white rounded-3xl border border-orange-100 shadow-xl max-w-lg w-full p-6 sm:p-8 space-y-6">
        {/* Brand Header */}
        <div className="text-center space-y-2">
          <div className="relative w-14 h-14 rounded-2xl overflow-hidden bg-amber-50 border border-amber-200/60 p-0.5 mx-auto shadow-md flex items-center justify-center">
            <Image
              src="/images/logo.png"
              alt="श्री फूड Logo"
              width={56}
              height={56}
              className="w-full h-full object-contain"
              priority
            />
          </div>
          <h1 className="font-display font-extrabold text-2xl text-navy">
            Customer Registration
          </h1>
          <p className="text-xs text-slate-500">
            Create your <span className="font-bold text-primary">श्री फूड</span> customer account to order and track food
          </p>
        </div>

        {errorMessage && (
          <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-semibold flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{errorMessage}</span>
          </div>
        )}

        {successMessage && (
          <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 shrink-0" />
            <span>{successMessage}</span>
          </div>
        )}

        {/* Register Form */}
        <form onSubmit={handleRegister} className="space-y-4 text-xs">
          {/* 1. Name */}
          <div>
            <label className="block font-bold text-slate-700 mb-1">
              Full Name *
            </label>
            <div className="relative">
              <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="text"
                required
                id="register-name-input"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="e.g. Rahul Sharma"
                className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
              />
            </div>
          </div>

          {/* 2. Email ID */}
          <div>
            <label className="block font-bold text-slate-700 mb-1">
              Email ID *
            </label>
            <div className="relative">
              <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="email"
                required
                id="register-email-input"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="e.g. rahul@example.com"
                className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
              />
            </div>
            <p className="text-[10px] text-slate-400 mt-1">
              You will use this Email ID to sign in to your account
            </p>
          </div>

          {/* 3. Contact Number */}
          <div>
            <label className="block font-bold text-slate-700 mb-1">
              Contact Number *
            </label>
            <div className="relative">
              <Phone className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="tel"
                required
                id="register-phone-input"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="e.g. 9876543210"
                className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
              />
            </div>
          </div>

          {/* 4. Address */}
          <div>
            <label className="block font-bold text-slate-700 mb-1">
              Delivery Address *
            </label>
            <div className="relative">
              <MapPin className="absolute left-3.5 top-3 w-4 h-4 text-slate-400" />
              <textarea
                required
                rows={2}
                id="register-address-input"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                placeholder="Flat / House No., Building, Street, Area, City, Pincode"
                className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary resize-none"
              />
            </div>
          </div>

          {/* 5. Password */}
          <div>
            <label className="block font-bold text-slate-700 mb-1">
              Password (min 6 characters) *
            </label>
            <div className="relative">
              <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type={showPassword ? "text" : "password"}
                required
                id="register-password-input"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full pl-10 pr-10 py-2.5 rounded-xl border border-slate-200 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {/* 6. Confirm Password */}
          <div>
            <label className="block font-bold text-slate-700 mb-1">
              Confirm Password *
            </label>
            <div className="relative">
              <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type={showPassword ? "text" : "password"}
                required
                id="register-confirm-password-input"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            id="register-submit-btn"
            className="w-full py-3.5 rounded-2xl bg-primary hover:bg-primary-hover text-white font-extrabold text-sm shadow-lg shadow-orange-500/25 active:scale-98 transition-all flex items-center justify-center gap-2 disabled:opacity-60"
          >
            {isLoading ? (
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                <span>Registering Account...</span>
              </div>
            ) : (
              <>
                <span>Create Customer Account</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>

        <div className="pt-2 text-center text-xs text-slate-500">
          Already have an account?{" "}
          <Link
            href="/login"
            className="font-bold text-primary hover:underline"
          >
            Sign in with Email ID & Password
          </Link>
        </div>
      </div>
    </div>
  );
}
