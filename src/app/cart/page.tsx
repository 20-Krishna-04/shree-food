"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useCart } from "@/contexts/cart-context";
import { useAuth } from "@/contexts/auth-context";
import { formatCurrency } from "@/lib/utils";
import {
  ShoppingBag,
  Trash2,
  Plus,
  Minus,
  ArrowRight,
  ShieldCheck,
  MapPin,
  Phone,
  User,
  AlertCircle,
  Truck,
} from "lucide-react";

export default function CartPage() {
  const router = useRouter();
  const { items, itemCount, subtotal, deliveryFee, totalAmount, updateQuantity, removeItem, clearCart } = useCart();
  const { user, profile } = useAuth();

  const [customerName, setCustomerName] = useState(profile?.full_name || "");
  const [customerPhone, setCustomerPhone] = useState(profile?.phone || "");
  const [deliveryAddress, setDeliveryAddress] = useState(profile?.address || "");
  const [notes, setNotes] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    if (profile) {
      if (profile.full_name) setCustomerName(profile.full_name);
      if (profile.phone) setCustomerPhone(profile.phone);
      if (profile.address) setDeliveryAddress(profile.address);
    }
  }, [profile]);

  const handleCheckout = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage("");

    if (items.length === 0) {
      setErrorMessage("Your cart is empty. Please add items before checking out.");
      return;
    }

    if (!customerName || !customerPhone || !deliveryAddress) {
      setErrorMessage("Please complete all delivery details.");
      return;
    }

    setIsSubmitting(true);
    try {
      // Send payload with ONLY product_id and quantity (prices are recalculated independently on the server)
      const payload = {
        customer_name: customerName,
        customer_phone: customerPhone,
        delivery_address: deliveryAddress,
        items: items.map((i) => ({
          product_id: i.product.id,
          quantity: i.quantity,
        })),
        notes: notes || null,
      };

      const res = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const json = await res.json();

      if (!res.ok || !json.success) {
        throw new Error(json.error || "Failed to create order");
      }

      // Clear cart and navigate to checkout payment page
      clearCart();
      router.push(`/checkout/${json.data.id}`);
    } catch (err: unknown) {
      setErrorMessage(err instanceof Error ? err.message : "Something went wrong creating your order");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (itemCount === 0) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-20 text-center space-y-6">
        <div className="w-20 h-20 rounded-3xl bg-orange-100 text-primary flex items-center justify-center mx-auto shadow-sm">
          <ShoppingBag className="w-10 h-10" />
        </div>
        <h1 className="font-display font-extrabold text-3xl text-navy">
          Your Shopping Cart is Empty
        </h1>
        <p className="text-slate-500 text-sm max-w-sm mx-auto">
          Looks like you haven&apos;t added any delicious food yet. Explore our fresh menu to satisfy your cravings!
        </p>
        <div className="pt-2">
          <Link
            href="/menu"
            className="inline-flex items-center gap-2 px-8 py-3.5 rounded-2xl bg-primary hover:bg-primary-hover text-white font-bold text-sm shadow-lg shadow-orange-500/25 active:scale-95 transition-all"
          >
            <span>Explore Food Menu</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
      <div className="mb-8">
        <h1 className="font-display font-extrabold text-3xl sm:text-4xl text-navy">
          Review Your Shopping Cart
        </h1>
        <p className="text-slate-500 text-xs sm:text-sm mt-1">
          {itemCount} {itemCount === 1 ? "dish" : "dishes"} selected for contactless delivery
        </p>
      </div>

      {errorMessage && (
        <div className="mb-6 p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-700 text-xs sm:text-sm font-semibold flex items-center gap-3">
          <AlertCircle className="w-5 h-5 shrink-0" />
          <span>{errorMessage}</span>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left: Cart Items List */}
        <div className="lg:col-span-7 bg-white rounded-3xl border border-orange-100 p-6 sm:p-8 shadow-sm">
          <div className="flex items-center justify-between pb-4 border-b border-slate-100">
            <h2 className="font-display font-bold text-lg text-navy">
              Selected Dishes
            </h2>
            <button
              type="button"
              onClick={clearCart}
              className="text-xs font-semibold text-rose-600 hover:text-rose-700 hover:underline"
            >
              Clear Cart
            </button>
          </div>

          <div className="divide-y divide-slate-100">
            {items.map((item) => (
              <div
                key={item.product.id}
                className="py-4 sm:py-5 flex items-center justify-between gap-4"
              >
                {/* Product Thumbnail & Details */}
                <div className="flex items-center gap-3 sm:gap-4 flex-1 min-w-0">
                  <div className="relative w-16 h-16 sm:w-20 sm:h-20 rounded-2xl overflow-hidden bg-slate-100 shrink-0">
                    <Image
                      src={item.product.image_url}
                      alt={item.product.name}
                      fill
                      sizes="80px"
                      className="object-cover"
                    />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-1.5">
                      <div
                        className={`w-3 h-3 border flex items-center justify-center shrink-0 ${
                          item.product.is_vegetarian
                            ? "border-emerald-600"
                            : "border-rose-600"
                        }`}
                      >
                        <div
                          className={`w-1.5 h-1.5 rounded-full ${
                            item.product.is_vegetarian
                              ? "bg-emerald-600"
                              : "bg-rose-600"
                          }`}
                        />
                      </div>
                      <h3 className="font-bold text-sm text-navy truncate">
                        {item.product.name}
                      </h3>
                    </div>
                    <p className="text-xs text-slate-500 mt-0.5">
                      {formatCurrency(item.product.price)} each
                    </p>
                    <span className="font-display font-bold text-sm text-primary block sm:hidden mt-1">
                      {formatCurrency(item.product.price * item.quantity)}
                    </span>
                  </div>
                </div>

                {/* Stepper & Subtotal */}
                <div className="flex items-center gap-4 shrink-0">
                  <div className="flex items-center bg-orange-50 border border-primary/20 rounded-2xl p-1 gap-2">
                    <button
                      type="button"
                      onClick={() =>
                        updateQuantity(item.product.id, item.quantity - 1)
                      }
                      className="w-7 h-7 rounded-xl bg-white hover:bg-orange-100 text-primary flex items-center justify-center transition-colors"
                      aria-label="Decrease quantity"
                    >
                      <Minus className="w-3.5 h-3.5" />
                    </button>
                    <span className="w-5 text-center font-bold text-xs sm:text-sm text-navy">
                      {item.quantity}
                    </span>
                    <button
                      type="button"
                      onClick={() =>
                        updateQuantity(item.product.id, item.quantity + 1)
                      }
                      className="w-7 h-7 rounded-xl bg-primary hover:bg-primary-hover text-white flex items-center justify-center transition-colors"
                      aria-label="Increase quantity"
                    >
                      <Plus className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  <span className="hidden sm:block font-display font-bold text-base text-navy w-20 text-right">
                    {formatCurrency(item.product.price * item.quantity)}
                  </span>

                  <button
                    type="button"
                    onClick={() => removeItem(item.product.id)}
                    className="p-1.5 text-slate-400 hover:text-rose-600 transition-colors"
                    title="Remove item"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>

          <div className="pt-4 border-t border-slate-100">
            <Link
              href="/menu"
              className="text-xs font-bold text-primary hover:text-primary-hover flex items-center gap-1"
            >
              <Plus className="w-4 h-4" />
              <span>Add more dishes from menu</span>
            </Link>
          </div>
        </div>

        {/* Right: Checkout & Delivery Form */}
        <div className="lg:col-span-5 space-y-6">
          <form
            onSubmit={handleCheckout}
            className="bg-white rounded-3xl border border-orange-100 p-6 sm:p-8 shadow-sm space-y-5"
          >
            <h2 className="font-display font-bold text-lg text-navy pb-3 border-b border-slate-100">
              Delivery Information
            </h2>

            {/* Customer Name */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Full Name *
              </label>
              <div className="relative">
                <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type="text"
                  required
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  placeholder="e.g. Rahul Sharma"
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                />
              </div>
            </div>

            {/* Phone */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Mobile Number (10 digits) *
              </label>
              <div className="relative">
                <Phone className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type="tel"
                  required
                  pattern="[6-9][0-9]{9}"
                  value={customerPhone}
                  onChange={(e) => setCustomerPhone(e.target.value)}
                  placeholder="9876543210"
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                />
              </div>
            </div>

            {/* Delivery Address */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Delivery Address *
              </label>
              <div className="relative">
                <MapPin className="absolute left-3.5 top-3 w-4 h-4 text-slate-400" />
                <textarea
                  required
                  rows={2}
                  value={deliveryAddress}
                  onChange={(e) => setDeliveryAddress(e.target.value)}
                  placeholder="Flat no, building, street, landmark..."
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                />
              </div>
            </div>

            {/* Special Cooking Instructions */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Cooking Notes (Optional)
              </label>
              <input
                type="text"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="e.g. Extra spicy, less oil, leave at door..."
                className="w-full px-4 py-2 rounded-xl border border-slate-200 text-xs focus:outline-none focus:ring-2 focus:ring-primary/20"
              />
            </div>

            {/* Bill Details */}
            <div className="pt-4 border-t border-slate-100 space-y-2 text-xs sm:text-sm text-slate-600">
              <div className="flex justify-between">
                <span>Items Subtotal</span>
                <span className="font-semibold text-navy">
                  {formatCurrency(subtotal)}
                </span>
              </div>

              <div className="flex justify-between items-center">
                <span className="flex items-center gap-1.5">
                  <Truck className="w-4 h-4 text-primary" /> Delivery Charges
                </span>
                <span className="font-semibold text-navy">
                  {deliveryFee === 0 ? (
                    <span className="text-emerald-600 font-bold uppercase text-xs">
                      FREE
                    </span>
                  ) : (
                    formatCurrency(deliveryFee)
                  )}
                </span>
              </div>

              {subtotal < 499 && (
                <p className="text-[11px] text-orange-600 font-medium">
                  Add {formatCurrency(499 - subtotal)} more for FREE Delivery!
                </p>
              )}

              <div className="flex justify-between text-base sm:text-lg font-extrabold text-navy pt-3 border-t border-slate-100 font-display">
                <span>To Pay</span>
                <span className="text-primary">{formatCurrency(totalAmount)}</span>
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isSubmitting}
              id="proceed-to-checkout-btn"
              className="w-full py-4 rounded-2xl bg-primary hover:bg-primary-hover text-white font-extrabold text-sm sm:text-base shadow-xl shadow-orange-500/25 active:scale-98 transition-all flex items-center justify-center gap-2 disabled:opacity-60"
            >
              {isSubmitting ? (
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>Validating Prices & Generating Order...</span>
                </div>
              ) : (
                <>
                  <span>Proceed to Checkout</span>
                  <ArrowRight className="w-5 h-5" />
                </>
              )}
            </button>

            <div className="flex items-center justify-center gap-1.5 text-[11px] text-slate-400">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              <span>Prices are verified securely against authoritative kitchen menu records.</span>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
