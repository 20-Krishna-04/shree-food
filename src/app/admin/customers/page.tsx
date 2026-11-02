"use client";

import React, { useState, useEffect } from "react";
import AdminSidebar from "@/components/admin/AdminSidebar";
import { formatCurrency, formatDate } from "@/lib/utils";
import {
  Users,
  Search,
  RefreshCw,
  Mail,
  Phone,
  Calendar,
  ShoppingBag,
  ShieldCheck,
  UserCheck,
  TrendingUp,
} from "lucide-react";

interface CustomerRecord {
  id: string;
  full_name: string;
  email: string;
  phone: string;
  address?: string;
  created_at: string;
  total_orders: number;
  total_spent: number;
}

export default function AdminCustomersPage() {
  const [customers, setCustomers] = useState<CustomerRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [search, setSearch] = useState("");

  const loadCustomers = async () => {
    setIsRefreshing(true);
    try {
      const res = await fetch("/api/admin/customers");
      const json = await res.json();
      if (json.success && json.data) {
        setCustomers(json.data);
      }
    } catch (e) {
      console.warn("Failed to load customers:", e);
    } finally {
      setIsRefreshing(false);
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadCustomers();
  }, []);

  const filtered = customers.filter((c) => {
    if (!search.trim()) return true;
    const q = search.toLowerCase();
    return (
      c.full_name.toLowerCase().includes(q) ||
      c.email.toLowerCase().includes(q) ||
      c.phone.includes(q)
    );
  });

  const totalRegistered = customers.length;
  const totalLifetimeOrders = customers.reduce((sum, c) => sum + c.total_orders, 0);
  const totalCustomerSpend = customers.reduce((sum, c) => sum + c.total_spent, 0);

  return (
    <div className="flex flex-col md:flex-row min-h-[calc(100vh-5rem)] bg-slate-50">
      <AdminSidebar />

      <main className="flex-1 p-4 sm:p-8 space-y-6 max-w-7xl">
        {/* Header */}
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <Users className="w-6 h-6 text-primary" />
              <h1 className="font-display font-extrabold text-2xl sm:text-3xl text-navy">
                Customer Management
              </h1>
            </div>
            <p className="text-xs text-slate-500 mt-1">
              Registered customers directory, lifetime ordering metrics, and accounts
            </p>
          </div>

          <button
            type="button"
            onClick={loadCustomers}
            disabled={isRefreshing}
            className="p-2.5 rounded-xl bg-white border border-slate-200 text-xs font-bold text-slate-700 hover:text-primary transition-all flex items-center gap-2 shadow-xs"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? "animate-spin text-primary" : ""}`} />
            <span>Refresh</span>
          </button>
        </div>

        {/* Stats Summary Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="bg-white p-5 rounded-3xl border border-slate-200/80 shadow-xs space-y-1">
            <div className="flex items-center justify-between text-slate-400">
              <span className="text-[11px] font-bold uppercase tracking-wider">
                Total Customers
              </span>
              <UserCheck className="w-4 h-4 text-primary" />
            </div>
            <p className="font-display font-extrabold text-2xl text-navy">
              {totalRegistered}
            </p>
          </div>

          <div className="bg-white p-5 rounded-3xl border border-slate-200/80 shadow-xs space-y-1">
            <div className="flex items-center justify-between text-slate-400">
              <span className="text-[11px] font-bold uppercase tracking-wider">
                Total Customer Orders
              </span>
              <ShoppingBag className="w-4 h-4 text-emerald-600" />
            </div>
            <p className="font-display font-extrabold text-2xl text-emerald-600">
              {totalLifetimeOrders}
            </p>
          </div>

          <div className="bg-white p-5 rounded-3xl border border-slate-200/80 shadow-xs space-y-1">
            <div className="flex items-center justify-between text-slate-400">
              <span className="text-[11px] font-bold uppercase tracking-wider">
                Gross Customer Value
              </span>
              <TrendingUp className="w-4 h-4 text-orange-500" />
            </div>
            <p className="font-display font-extrabold text-2xl text-primary">
              {formatCurrency(totalCustomerSpend)}
            </p>
          </div>
        </div>

        {/* Search Bar */}
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
          <div className="relative">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by customer name, email, or mobile..."
              className="w-full pl-10 pr-4 py-2 rounded-xl border border-slate-200 text-xs text-navy focus:outline-none focus:ring-2 focus:ring-primary/20"
            />
          </div>
        </div>

        {/* Customers Table */}
        <div className="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-xs">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-bold uppercase text-[10px] tracking-wider">
                <tr>
                  <th className="py-4 px-6">Customer Name</th>
                  <th className="py-4 px-6">Email Address</th>
                  <th className="py-4 px-6">Mobile Phone</th>
                  <th className="py-4 px-6">Delivery Address</th>
                  <th className="py-4 px-6">Registration Date</th>
                  <th className="py-4 px-6">Total Orders</th>
                  <th className="py-4 px-6">Total Spent</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {isLoading ? (
                  <tr>
                    <td colSpan={7} className="text-center py-12 text-slate-400">
                      Loading customer records...
                    </td>
                  </tr>
                ) : filtered.length > 0 ? (
                  filtered.map((customer) => (
                    <tr key={customer.id} className="hover:bg-slate-50/70 transition-colors">
                      <td className="py-4 px-6">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-orange-100 text-primary font-bold text-xs flex items-center justify-center">
                            {customer.full_name.charAt(0)}
                          </div>
                          <span className="font-bold text-navy text-sm">
                            {customer.full_name}
                          </span>
                        </div>
                      </td>

                      <td className="py-4 px-6 text-slate-600">
                        <span className="flex items-center gap-1.5 font-mono text-[11px]">
                          <Mail className="w-3.5 h-3.5 text-slate-400" />
                          {customer.email}
                        </span>
                      </td>

                      <td className="py-4 px-6 text-slate-600">
                        <span className="flex items-center gap-1.5">
                          <Phone className="w-3.5 h-3.5 text-slate-400" />
                          {customer.phone}
                        </span>
                      </td>

                      <td className="py-4 px-6 text-slate-600 max-w-xs truncate" title={customer.address}>
                        {customer.address || "N/A"}
                      </td>

                      <td className="py-4 px-6 text-slate-500">
                        <span className="flex items-center gap-1.5">
                          <Calendar className="w-3.5 h-3.5 text-slate-400" />
                          {formatDate(customer.created_at)}
                        </span>
                      </td>

                      <td className="py-4 px-6 font-bold text-navy">
                        <span className="px-2.5 py-1 rounded-xl bg-slate-100 text-slate-800">
                          {customer.total_orders} {customer.total_orders === 1 ? "order" : "orders"}
                        </span>
                      </td>

                      <td className="py-4 px-6 font-display font-extrabold text-sm text-primary">
                        {formatCurrency(customer.total_spent)}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={7} className="text-center py-12 text-slate-400">
                      No customer records yet. When customers register, they will appear here.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-orange-50/60 border border-orange-100 text-slate-600 text-xs flex items-center gap-2">
          <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>Customer personal information is protected under role-based authorization and accessible exclusively to administrators.</span>
        </div>
      </main>
    </div>
  );
}
