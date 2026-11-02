"use client";

import React, { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { useAuth } from "@/contexts/auth-context";
import {
  LayoutDashboard,
  ClipboardList,
  UtensilsCrossed,
  Users,
  BarChart3,
  Settings,
  LogOut,
  ChefHat,
  ArrowLeft,
  Menu,
  X,
} from "lucide-react";

export default function AdminSidebar() {
  const pathname = usePathname();
  const { logout, profile } = useAuth();
  const [isOpen, setIsOpen] = useState(false);

  const links = [
    {
      name: "Dashboard",
      href: "/admin/dashboard",
      icon: <LayoutDashboard className="w-4 h-4" />,
    },
    {
      name: "Orders",
      href: "/admin/orders",
      icon: <ClipboardList className="w-4 h-4" />,
    },
    {
      name: "Menu Management",
      href: "/admin/menu",
      icon: <UtensilsCrossed className="w-4 h-4" />,
    },
    {
      name: "Customers",
      href: "/admin/customers",
      icon: <Users className="w-4 h-4" />,
    },
    {
      name: "Analytics",
      href: "/admin/analytics",
      icon: <BarChart3 className="w-4 h-4" />,
    },
    {
      name: "Settings",
      href: "/admin/settings",
      icon: <Settings className="w-4 h-4" />,
    },
  ];

  const sidebarContent = (
    <div className="flex flex-col justify-between h-full p-5 text-white">
      <div className="space-y-6">
        {/* Brand Header */}
        <Link href="/" className="flex items-center gap-3 px-1 py-1 group">
          <div className="relative w-10 h-10 rounded-xl overflow-hidden bg-amber-50 border border-amber-200/50 p-0.5 shadow-md flex items-center justify-center shrink-0">
            <Image
              src="/images/logo.png"
              alt="श्री फूड Logo"
              width={40}
              height={40}
              className="w-full h-full object-contain"
            />
          </div>
          <div>
            <span className="font-display font-extrabold text-xl tracking-tight text-white flex items-center gap-1">
              श्री <span className="text-primary">फूड</span>
            </span>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
              Cloud Kitchen Admin
            </p>
          </div>
        </Link>

        {/* Admin Badge */}
        <div className="bg-slate-800/90 p-3.5 rounded-2xl border border-slate-700/60 shadow-xs">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-primary flex items-center justify-center text-white shadow-md">
              <ChefHat className="w-4 h-4" />
            </div>
            <div className="overflow-hidden">
              <p className="text-[10px] uppercase font-extrabold tracking-wider text-orange-400">
                Kitchen Admin
              </p>
              <p className="text-xs font-bold text-white truncate">
                {profile?.full_name || "श्री फूड Admin"}
              </p>
            </div>
          </div>
        </div>

        {/* Navigation Links */}
        <nav className="space-y-1.5">
          {links.map((link) => {
            const isActive = pathname === link.href;
            return (
              <Link
                key={link.name}
                href={link.href}
                onClick={() => setIsOpen(false)}
                className={`flex items-center gap-3 px-4 py-2.5 rounded-2xl text-xs sm:text-sm font-semibold transition-all ${
                  isActive
                    ? "bg-primary text-white shadow-md shadow-orange-500/20 font-bold"
                    : "text-slate-300 hover:bg-slate-800 hover:text-white"
                }`}
              >
                {link.icon}
                <span>{link.name}</span>
              </Link>
            );
          })}
        </nav>
      </div>

      {/* Bottom Actions */}
      <div className="pt-6 border-t border-slate-800 space-y-2">
        <Link
          href="/"
          className="flex items-center gap-2.5 px-4 py-2.5 rounded-xl text-xs font-semibold text-slate-400 hover:text-white hover:bg-slate-800/60 transition-all"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Storefront</span>
        </Link>

        <button
          type="button"
          onClick={() => logout()}
          className="w-full flex items-center gap-2.5 px-4 py-2.5 rounded-xl text-xs font-semibold text-rose-400 hover:bg-rose-950/40 hover:text-rose-300 transition-all text-left"
        >
          <LogOut className="w-4 h-4" />
          <span>Sign Out</span>
        </button>
      </div>
    </div>
  );

  return (
    <>
      {/* Mobile Drawer Toggle Header */}
      <div className="md:hidden bg-navy text-white px-4 py-3 flex items-center justify-between border-b border-slate-800 sticky top-20 z-40">
        <div className="flex items-center gap-2">
          <Image
            src="/images/logo.png"
            alt="श्री फूड"
            width={24}
            height={24}
            className="rounded-full bg-amber-50 p-0.5"
          />
          <span className="font-bold text-xs uppercase tracking-wider">
            श्री फूड Admin
          </span>
        </div>
        <button
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          className="p-1.5 rounded-xl bg-slate-800 text-slate-300 hover:text-white"
          aria-label="Toggle admin sidebar"
        >
          {isOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </div>

      {/* Mobile Backdrop & Drawer */}
      {isOpen && (
        <div className="fixed inset-0 z-50 md:hidden flex">
          <div
            className="fixed inset-0 bg-black/60 backdrop-blur-xs"
            onClick={() => setIsOpen(false)}
          />
          <aside className="relative w-72 bg-navy h-full shadow-2xl z-10">
            {sidebarContent}
          </aside>
        </div>
      )}

      {/* Desktop Sidebar */}
      <aside className="hidden md:flex w-64 bg-navy text-white min-h-[calc(100vh-5rem)] flex-col justify-between border-r border-slate-800 shrink-0">
        {sidebarContent}
      </aside>
    </>
  );
}
