"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { Product } from "@/types";
import { MOCK_PRODUCTS } from "@/lib/mock-data";
import { useCart } from "@/contexts/cart-context";
import { formatCurrency } from "@/lib/utils";
import FoodCard from "@/components/customer/FoodCard";
import {
  ArrowLeft,
  Clock,
  Plus,
  Minus,
  ShoppingBag,
  ShieldCheck,
  Flame,
  CheckCircle2,
  AlertCircle,
  Sparkles,
} from "lucide-react";

export default function ProductDetailPage() {
  const params = useParams();
  const router = useRouter();
  const productId = params.id as string;

  const [product, setProduct] = useState<Product | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);
  const [addedNotice, setAddedNotice] = useState(false);

  const { addItem, updateQuantity, getItemQuantity } = useCart();

  useEffect(() => {
    async function fetchProduct() {
      setIsLoading(true);
      try {
        const res = await fetch(`/api/products/${productId}`);
        const json = await res.json();
        if (json.success && json.data) {
          setProduct(json.data);
        } else {
          // Fallback to mock product
          const found = MOCK_PRODUCTS.find((p) => p.id === productId);
          if (found) setProduct(found);
        }
      } catch (err) {
        console.warn("Failed to load product details:", err);
        const found = MOCK_PRODUCTS.find((p) => p.id === productId);
        if (found) setProduct(found);
      } finally {
        setIsLoading(false);
      }
    }

    if (productId) {
      fetchProduct();
    }
  }, [productId]);

  const handleAddToCart = () => {
    if (!product || !product.is_available) return;
    const currentQtyInCart = getItemQuantity(product.id);
    if (currentQtyInCart > 0) {
      updateQuantity(product.id, currentQtyInCart + quantity);
    } else {
      for (let i = 0; i < quantity; i++) {
        addItem(product);
      }
    }
    setAddedNotice(true);
    setTimeout(() => setAddedNotice(false), 2500);
  };

  if (isLoading) {
    return (
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-16 text-center space-y-4">
        <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto" />
        <p className="text-sm font-semibold text-slate-600">
          Loading gourmet dish recipe & details...
        </p>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="max-w-md mx-auto px-4 py-20 text-center space-y-5">
        <AlertCircle className="w-14 h-14 text-rose-500 mx-auto" />
        <h2 className="font-display font-extrabold text-2xl text-navy">
          Dish Not Found
        </h2>
        <p className="text-xs text-slate-500">
          The requested dish might have been rotated from our daily cloud kitchen menu.
        </p>
        <Link
          href="/menu"
          className="inline-flex items-center gap-2 px-6 py-3 rounded-2xl bg-primary text-white text-xs font-bold shadow-md shadow-orange-500/20"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Return to Menu</span>
        </Link>
      </div>
    );
  }

  const relatedDishes = MOCK_PRODUCTS.filter(
    (p) => p.id !== product.id && p.category_id === product.category_id
  ).slice(0, 3);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 space-y-12">
      {/* Back button & Breadcrumb */}
      <div>
        <Link
          href="/menu"
          className="inline-flex items-center gap-2 text-xs font-bold text-slate-600 hover:text-primary transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to All Menu Dishes</span>
        </Link>
      </div>

      {/* Main Product Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-start">
        {/* Left: Large Product Image */}
        <div className="lg:col-span-6 relative">
          <div className="relative w-full aspect-square sm:aspect-[4/3] lg:aspect-square rounded-3xl overflow-hidden shadow-xl border-4 border-white bg-slate-100">
            <Image
              src={product.image_url}
              alt={product.name}
              fill
              priority
              sizes="(max-width: 768px) 100vw, 50vw"
              className="object-cover hover:scale-105 transition-transform duration-500"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent opacity-60" />

            {/* Veg / Non-Veg badge */}
            <div className="absolute top-4 left-4 bg-white/95 backdrop-blur-md p-2 rounded-xl shadow-md">
              <div
                className={`w-5 h-5 border-2 flex items-center justify-center ${
                  product.is_vegetarian
                    ? "border-emerald-600"
                    : "border-rose-600"
                }`}
              >
                <div
                  className={`w-2.5 h-2.5 rounded-full ${
                    product.is_vegetarian ? "bg-emerald-600" : "bg-rose-600"
                  }`}
                />
              </div>
            </div>

            {/* Availability Overlay */}
            {!product.is_available && (
              <div className="absolute inset-0 bg-navy/70 backdrop-blur-xs flex items-center justify-center">
                <span className="bg-rose-600 text-white font-extrabold text-sm uppercase tracking-wider px-4 py-2 rounded-full shadow-xl">
                  Sold Out for Today
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Right: Product Details & Cart Action */}
        <div className="lg:col-span-6 space-y-6">
          {/* Category & Status Pill */}
          <div className="flex flex-wrap items-center gap-2">
            <span className="px-3 py-1 rounded-full bg-orange-100 text-orange-800 text-xs font-bold uppercase tracking-wider">
              {product.category_name || "Cloud Kitchen Specialty"}
            </span>

            <span
              className={`px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1.5 ${
                product.is_vegetarian
                  ? "bg-emerald-100 text-emerald-800"
                  : "bg-rose-100 text-rose-800"
              }`}
            >
              <span
                className={`w-2 h-2 rounded-full ${
                  product.is_vegetarian ? "bg-emerald-600" : "bg-rose-600"
                }`}
              />
              {product.is_vegetarian ? "Pure Vegetarian" : "Non-Vegetarian"}
            </span>

            <span className="px-3 py-1 rounded-full bg-slate-100 text-slate-700 text-xs font-semibold flex items-center gap-1">
              <Clock className="w-3.5 h-3.5 text-primary" />
              <span>{product.preparation_time_mins || 20} mins prep</span>
            </span>
          </div>

          {/* Dish Name */}
          <h1 className="font-display font-extrabold text-3xl sm:text-4xl lg:text-5xl text-navy">
            {product.name}
          </h1>

          {/* Price */}
          <div className="flex items-baseline gap-3">
            <span className="font-display font-extrabold text-3xl sm:text-4xl text-primary">
              {formatCurrency(product.price)}
            </span>
            <span className="text-xs text-slate-400 font-semibold uppercase">
              Taxes Included • Prepared Fresh to Order
            </span>
          </div>

          {/* Description */}
          <div className="bg-white rounded-2xl border border-orange-100/80 p-5 shadow-xs">
            <h3 className="font-bold text-xs uppercase tracking-wider text-slate-400 mb-2">
              Chef&apos;s Recipe & Taste Notes
            </h3>
            <p className="text-slate-600 text-sm sm:text-base leading-relaxed">
              {product.description}
            </p>
          </div>

          {/* Kitchen Highlights */}
          <div className="grid grid-cols-2 gap-3 text-xs text-slate-600">
            <div className="bg-cream/60 border border-orange-200/60 p-3 rounded-xl flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>100% Sealed Packaging</span>
            </div>
            <div className="bg-cream/60 border border-orange-200/60 p-3 rounded-xl flex items-center gap-2">
              <Flame className="w-4 h-4 text-primary shrink-0" />
              <span>Slow Cooked with Ghee</span>
            </div>
          </div>

          {/* Quantity Selector & Add to Cart */}
          {product.is_available ? (
            <div className="space-y-4 pt-2">
              <div className="flex flex-wrap items-center gap-4">
                {/* Quantity Stepper */}
                <div className="flex items-center bg-white border border-slate-200 rounded-2xl p-1.5 gap-3 shadow-xs">
                  <button
                    type="button"
                    onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                    disabled={quantity <= 1}
                    className="w-9 h-9 rounded-xl bg-slate-50 hover:bg-orange-100 text-slate-700 hover:text-primary flex items-center justify-center transition-colors disabled:opacity-40"
                    aria-label="Decrease quantity"
                  >
                    <Minus className="w-4 h-4" />
                  </button>

                  <span className="w-8 text-center font-bold text-base text-navy">
                    {quantity}
                  </span>

                  <button
                    type="button"
                    onClick={() => setQuantity((q) => q + 1)}
                    className="w-9 h-9 rounded-xl bg-primary hover:bg-primary-hover text-white flex items-center justify-center transition-colors shadow-xs"
                    aria-label="Increase quantity"
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                </div>

                {/* Add to Cart CTA */}
                <button
                  type="button"
                  onClick={handleAddToCart}
                  id="product-details-add-to-cart-btn"
                  className="flex-1 py-4 px-6 rounded-2xl bg-primary hover:bg-primary-hover text-white font-extrabold text-sm sm:text-base shadow-xl shadow-orange-500/25 active:scale-98 transition-all flex items-center justify-center gap-2"
                >
                  <ShoppingBag className="w-5 h-5" />
                  <span>
                    Add to Cart • {formatCurrency(product.price * quantity)}
                  </span>
                </button>
              </div>

              {addedNotice && (
                <div className="p-3.5 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold flex items-center justify-between gap-2 animate-fade-in">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span>Added {quantity}x {product.name} to your cart!</span>
                  </div>
                  <Link
                    href="/cart"
                    className="underline text-emerald-900 font-extrabold hover:text-emerald-700"
                  >
                    View Cart
                  </Link>
                </div>
              )}
            </div>
          ) : (
            <div className="p-4 bg-slate-100 border border-slate-200 rounded-2xl text-slate-500 text-xs font-semibold">
              This item is temporarily sold out for today. Please explore our other dishes!
            </div>
          )}
        </div>
      </div>

      {/* Related Dishes Section */}
      {relatedDishes.length > 0 && (
        <div className="pt-8 border-t border-orange-100 space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <span className="text-xs font-extrabold text-primary uppercase tracking-wider">
                Pair With
              </span>
              <h2 className="font-display font-extrabold text-2xl text-navy mt-0.5">
                More Delicious Options
              </h2>
            </div>
            <Link
              href="/menu"
              className="text-xs font-bold text-primary hover:underline"
            >
              View Full Menu
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {relatedDishes.map((dish) => (
              <FoodCard key={dish.id} product={dish} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
