"use client";

import React, { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/auth-context";
import {
  Mail,
  Lock,
  Eye,
  EyeOff,
  ArrowRight,
  AlertCircle,
  ShieldAlert,
} from "lucide-react";

export default function LoginPage() {
  const router = useRouter();
  const { login } = useAuth();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage("");
    setIsLoading(true);

    try {
      const res = await login(email, password);
      if (res.success) {
        if (email.toLowerCase().includes("admin")) {
          router.push("/admin/dashboard");
        } else {
          router.push("/menu");
        }
      } else {
        setErrorMessage(
          res.error || "Invalid email ID or password. Please verify or register a new customer account."
        );
      }
    } catch (err: unknown) {
      setErrorMessage(err instanceof Error ? err.message : "Failed to sign in");
    } finally {
      setIsLoading(false);
    }
  };

  const fillAdminCredentials = () => {
    setEmail("admin@shreefood.com");
    setPassword("admin123");
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 py-12">
      <div className="bg-white rounded-3xl border border-orange-100 shadow-xl max-w-md w-full p-6 sm:p-8 space-y-6">
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
            Sign In to <span className="text-primary">श्री फूड</span>
          </h1>
          <p className="text-xs text-slate-500">
            Enter your registered Email ID and password to access your account
          </p>
        </div>

        {/* Single Admin Quick Access Helper */}
        <div className="bg-slate-50 border border-slate-200/80 rounded-2xl p-3 flex items-center justify-between text-xs">
          <div>
            <p className="text-[11px] font-bold text-navy flex items-center gap-1.5">
              <ShieldAlert className="w-3.5 h-3.5 text-orange-500" />
              Kitchen Admin Portal
            </p>
            <p className="text-[10px] text-slate-500 font-mono">
              admin@shreefood.com
            </p>
          </div>
          <button
            type="button"
            onClick={fillAdminCredentials}
            className="px-2.5 py-1.5 rounded-xl bg-navy hover:bg-slate-800 text-[11px] font-bold text-white shadow-xs transition-colors"
          >
            Fill Admin
          </button>
        </div>

        {errorMessage && (
          <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-semibold flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{errorMessage}</span>
          </div>
        )}

        {/* Login Form */}
        <form onSubmit={handleLogin} className="space-y-4 text-xs">
          <div>
            <label className="block font-bold text-slate-700 mb-1">
              Email ID *
            </label>
            <div className="relative">
              <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="email"
                required
                id="login-email-input"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@example.com"
                className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
              />
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="font-bold text-slate-700">Password *</label>
            </div>
            <div className="relative">
              <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type={showPassword ? "text" : "password"}
                required
                id="login-password-input"
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

          <button
            type="submit"
            disabled={isLoading}
            id="login-submit-btn"
            className="w-full py-3.5 rounded-2xl bg-primary hover:bg-primary-hover text-white font-extrabold text-sm shadow-lg shadow-orange-500/25 active:scale-98 transition-all flex items-center justify-center gap-2 disabled:opacity-60"
          >
            {isLoading ? (
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                <span>Signing in...</span>
              </div>
            ) : (
              <>
                <span>Sign In</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>

        <div className="pt-2 text-center text-xs text-slate-500 space-y-1">
          <p>
            New customer?{" "}
            <Link
              href="/register"
              className="font-bold text-primary hover:underline"
            >
              Register here with Name, Email & Address
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
