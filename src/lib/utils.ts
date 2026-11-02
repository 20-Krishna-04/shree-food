import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import { OrderStatus, PaymentStatus } from "@/types";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatCurrency(amount: number | string): string {
  const numericAmount = typeof amount === "string" ? parseFloat(amount) : amount;
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(numericAmount || 0);
}

export function formatDate(dateString: string): string {
  if (!dateString) return "";
  const date = new Date(dateString);
  return new Intl.DateTimeFormat("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  }).format(date);
}

export function getOrderStatusBadge(status: OrderStatus): {
  label: string;
  className: string;
  step: number;
} {
  switch (status) {
    case "pending":
      return {
        label: "Order Placed",
        className: "bg-amber-100 text-amber-800 border-amber-200",
        step: 1,
      };
    case "in_process":
      return {
        label: "Kitchen Preparing",
        className: "bg-blue-100 text-blue-800 border-blue-200",
        step: 2,
      };
    case "completed":
      return {
        label: "Completed & Delivered",
        className: "bg-emerald-100 text-emerald-800 border-emerald-200",
        step: 3,
      };
    case "cancelled":
      return {
        label: "Cancelled",
        className: "bg-rose-100 text-rose-800 border-rose-200",
        step: 0,
      };
    default:
      return {
        label: status,
        className: "bg-slate-100 text-slate-800 border-slate-200",
        step: 1,
      };
  }
}

export function getPaymentStatusBadge(status: PaymentStatus): {
  label: string;
  className: string;
} {
  switch (status) {
    case "paid":
      return {
        label: "Paid",
        className: "bg-emerald-100 text-emerald-800 border-emerald-200",
      };
    case "pending":
      return {
        label: "Payment Pending",
        className: "bg-amber-100 text-amber-800 border-amber-200",
      };
    case "failed":
      return {
        label: "Payment Failed",
        className: "bg-rose-100 text-rose-800 border-rose-200",
      };
    default:
      return {
        label: status,
        className: "bg-slate-100 text-slate-800 border-slate-200",
      };
  }
}
