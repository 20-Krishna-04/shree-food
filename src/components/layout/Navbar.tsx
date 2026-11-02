"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "@/contexts/auth-context";
import { useCart } from "@/contexts/cart-context";
import Image from "next/image";
import {
  ShoppingBag,
  User as UserIcon,
  Menu as MenuIcon,
  X,
  ShieldAlert,
  LogOut,
  ChevronDown,
  ClipboardList,
} from "lucide-react";

export default function Navbar() {
  const pathname = usePathname();
  const { user, profile, isAdmin, logout, switchDemoRole } = useAuth();
  const { itemCount } = useCart();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);

  const navLinks = [
    { name: "Home", href: "/" },
    { name: "Food Menu", href: "/menu" },
    { name: "About Us", href: "/about" },
    { name: "Contact", href: "/contact" },
  ];

  const isActive = (href: string) => {
    if (href === "/") return pathname === "/";
    return pathname.startsWith(href);
  };

  return (
    <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-md border-b border-orange-100 shadow-sm transition-all">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          {/* Logo */}
          <Link
            href="/"
            className="flex items-center gap-3 group focus:outline-none"
            id="nav-logo"
          >
            <div className="relative w-12 h-12 rounded-2xl overflow-hidden shadow-md shadow-amber-500/20 group-hover:scale-105 transition-transform bg-amber-50 border border-amber-200/70 p-0.5 flex items-center justify-center">
              <Image
                src="/images/logo.png"
                alt="श्री फूड Logo"
                width={48}
                height={48}
                className="w-full h-full object-contain"
                priority
              />
            </div>
            <div>
              <span className="font-display font-extrabold text-2xl tracking-tight text-navy flex items-center gap-1.5">
                श्री <span className="text-primary">फूड</span>
              </span>
              <p className="text-[11px] font-bold text-orange-600/90 -mt-0.5 tracking-wider uppercase">
                Cloud Kitchen
              </p>
            </div>
          </Link>

          {/* Desktop Navigation Links */}
          <nav className="hidden md:flex items-center gap-1 lg:gap-2">
            {navLinks.map((link) => {
              const active = isActive(link.href);
              return (
                <Link
                  key={link.name}
                  href={link.href}
                  className={`px-4 py-2 rounded-xl text-sm font-semibold transition-all ${
                    active
                      ? "text-primary bg-orange-50 font-bold"
                      : "text-slate-700 hover:text-primary hover:bg-orange-50/50"
                  }`}
                >
                  {link.name}
                </Link>
              );
            })}

            {isAdmin && (
              <Link
                href="/admin/dashboard"
                className="ml-2 px-3.5 py-1.5 rounded-xl text-xs font-bold bg-navy text-white hover:bg-slate-800 transition-all flex items-center gap-1.5 shadow-sm"
                id="nav-admin-dashboard-btn"
              >
                <ShieldAlert className="w-3.5 h-3.5 text-primary" />
                Kitchen Admin
              </Link>
            )}
          </nav>

          {/* Right Action Buttons */}
          <div className="flex items-center gap-3 sm:gap-4">
            {/* Shopping Cart Button */}
            <Link
              href="/cart"
              id="nav-cart-btn"
              className="relative p-2.5 rounded-xl bg-orange-50 text-slate-800 hover:bg-orange-100 hover:text-primary transition-all flex items-center justify-center focus:outline-none"
              aria-label="Shopping Cart"
            >
              <ShoppingBag className="w-5 h-5 text-slate-800" />
              {itemCount > 0 && (
                <span className="absolute -top-1.5 -right-1.5 bg-primary text-white text-[11px] font-extrabold w-5 h-5 rounded-full flex items-center justify-center shadow-md animate-scale">
                  {itemCount}
                </span>
              )}
            </Link>

            {/* User Account / Login */}
            {user ? (
              <div className="relative">
                <button
                  type="button"
                  id="nav-user-menu-btn"
                  onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                  className="flex items-center gap-2 p-1.5 sm:px-3 sm:py-2 rounded-xl bg-slate-100 hover:bg-slate-200/80 transition-all text-xs font-semibold text-slate-800"
                >
                  <div className="w-7 h-7 rounded-lg bg-orange-500 text-white flex items-center justify-center font-bold text-xs">
                    {profile?.full_name?.charAt(0) || "U"}
                  </div>
                  <span className="hidden sm:inline-block max-w-[100px] truncate">
                    {profile?.full_name?.split(" ")[0]}
                  </span>
                  <ChevronDown className="w-3.5 h-3.5 text-slate-500" />
                </button>

                {/* Dropdown Menu */}
                {userDropdownOpen && (
                  <div className="absolute right-0 mt-2 w-56 rounded-2xl bg-white shadow-xl border border-slate-100 py-2 z-50 animate-fade-in">
                    <div className="px-4 py-2 border-b border-slate-100">
                      <p className="text-xs text-slate-500 font-medium">Signed in as</p>
                      <p className="text-sm font-bold text-navy truncate">
                        {profile?.full_name}
                      </p>
                      <span className="inline-block mt-1 px-2 py-0.5 text-[10px] font-bold rounded-md bg-orange-100 text-orange-800 uppercase tracking-wider">
                        {isAdmin ? "Admin" : "Customer"}
                      </span>
                    </div>

                    {isAdmin && (
                      <Link
                        href="/admin/dashboard"
                        onClick={() => setUserDropdownOpen(false)}
                        className="flex items-center gap-2.5 px-4 py-2.5 text-xs font-semibold text-slate-700 hover:bg-orange-50 hover:text-primary transition-all"
                      >
                        <ShieldAlert className="w-4 h-4 text-orange-500" />
                        Admin Dashboard
                      </Link>
                    )}

                    <Link
                      href="/my-orders"
                      onClick={() => setUserDropdownOpen(false)}
                      className="flex items-center gap-2.5 px-4 py-2.5 text-xs font-semibold text-slate-700 hover:bg-orange-50 hover:text-primary transition-all"
                    >
                      <ClipboardList className="w-4 h-4 text-slate-500" />
                      My Orders
                    </Link>

                    <Link
                      href="/profile"
                      onClick={() => setUserDropdownOpen(false)}
                      className="flex items-center gap-2.5 px-4 py-2.5 text-xs font-semibold text-slate-700 hover:bg-orange-50 hover:text-primary transition-all"
                    >
                      <UserIcon className="w-4 h-4 text-slate-500" />
                      Profile Settings
                    </Link>

                    <div className="border-t border-slate-100 mt-1 pt-1">
                      <button
                        type="button"
                        onClick={() => {
                          setUserDropdownOpen(false);
                          logout();
                        }}
                        className="w-full flex items-center gap-2.5 px-4 py-2 text-xs font-semibold text-rose-600 hover:bg-rose-50 transition-all text-left"
                      >
                        <LogOut className="w-4 h-4" />
                        Sign Out
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Link
                  href="/login"
                  id="nav-login-btn"
                  className="px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold text-slate-700 hover:text-primary hover:bg-orange-50 transition-all"
                >
                  Log In
                </Link>
                <Link
                  href="/register"
                  id="nav-register-btn"
                  className="hidden sm:inline-flex px-4 py-2 rounded-xl text-xs sm:text-sm font-bold bg-primary hover:bg-primary-hover text-white shadow-md shadow-orange-500/20 transition-all"
                >
                  Sign Up
                </Link>
              </div>
            )}

            {/* Mobile menu toggle */}
            <button
              type="button"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 rounded-xl text-slate-700 hover:bg-orange-50 hover:text-primary focus:outline-none"
              aria-label="Toggle menu"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <MenuIcon className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-orange-100 bg-white px-4 pt-3 pb-6 space-y-2 shadow-lg animate-fade-in">
          {navLinks.map((link) => (
            <Link
              key={link.name}
              href={link.href}
              onClick={() => setMobileMenuOpen(false)}
              className={`block px-4 py-2.5 rounded-xl text-base font-semibold ${
                isActive(link.href)
                  ? "bg-orange-50 text-primary font-bold"
                  : "text-slate-700 hover:bg-orange-50/50"
              }`}
            >
              {link.name}
            </Link>
          ))}

          {isAdmin && (
            <Link
              href="/admin/dashboard"
              onClick={() => setMobileMenuOpen(false)}
              className="block px-4 py-2.5 rounded-xl text-base font-bold bg-navy text-white"
            >
              Kitchen Admin Dashboard
            </Link>
          )}
        </div>
      )}
    </header>
  );
}
