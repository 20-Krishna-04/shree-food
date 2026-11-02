"use client";

import React from "react";
import Image from "next/image";
import Link from "next/link";
import { Product } from "@/types";
import { useCart } from "@/contexts/cart-context";
import { formatCurrency } from "@/lib/utils";
import { Clock, Plus, Minus, Check } from "lucide-react";

interface FoodCardProps {
  product: Product;
}

export default function FoodCard({ product }: FoodCardProps) {
  const { addItem, updateQuantity, getItemQuantity } = useCart();
  const quantityInCart = getItemQuantity(product.id);

  return (
    <div className="group bg-white rounded-3xl border border-orange-100/80 shadow-sm hover:shadow-xl hover:border-orange-200 transition-all duration-300 flex flex-col overflow-hidden">
      {/* Image Container with Link to Product Details */}
      <Link
        href={`/menu/${product.id}`}
        className="relative h-52 w-full overflow-hidden bg-slate-100 block focus:outline-none"
      >
        <Image
          src={product.image_url}
          alt={product.name}
          fill
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          className="object-cover group-hover:scale-105 transition-transform duration-500"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-60" />

        {/* Veg / Non-Veg Indicator */}
        <div className="absolute top-3 left-3 bg-white/90 backdrop-blur-sm p-1.5 rounded-lg shadow-sm">
          <div
            className={`w-4 h-4 border-2 flex items-center justify-center ${
              product.is_vegetarian
                ? "border-emerald-600"
                : "border-rose-600"
            }`}
          >
            <div
              className={`w-2 h-2 rounded-full ${
                product.is_vegetarian ? "bg-emerald-600" : "bg-rose-600"
              }`}
            />
          </div>
        </div>

        {/* Prep Time Badge */}
        {product.preparation_time_mins && (
          <div className="absolute top-3 right-3 bg-navy/80 backdrop-blur-sm text-white px-2.5 py-1 rounded-full text-xs font-semibold flex items-center gap-1 shadow-sm">
            <Clock className="w-3 h-3 text-orange-400" />
            <span>{product.preparation_time_mins} mins</span>
          </div>
        )}

        {/* Availability Badge */}
        {!product.is_available && (
          <div className="absolute inset-0 bg-navy/70 backdrop-blur-[2px] flex items-center justify-center">
            <span className="bg-rose-600 text-white font-bold text-xs uppercase tracking-wider px-3 py-1.5 rounded-full shadow-lg">
              Sold Out for Today
            </span>
          </div>
        )}
      </Link>

      {/* Card Content */}
      <div className="p-5 flex-1 flex flex-col justify-between">
        <div>
          <div className="flex items-start justify-between gap-2 mb-1.5">
            <Link
              href={`/menu/${product.id}`}
              className="font-display font-bold text-lg text-navy group-hover:text-primary transition-colors block"
            >
              {product.name}
            </Link>
          </div>
          <p className="text-slate-500 text-xs sm:text-sm line-clamp-2 leading-relaxed">
            {product.description}
          </p>
        </div>

        {/* Price and Cart Action */}
        <div className="mt-5 pt-3 border-t border-slate-100 flex items-center justify-between">
          <div>
            <span className="text-[11px] text-slate-400 uppercase tracking-wider font-semibold block">
              Price
            </span>
            <span className="text-xl font-extrabold text-navy font-display">
              {formatCurrency(product.price)}
            </span>
          </div>

          <div>
            {!product.is_available ? (
              <button
                disabled
                className="px-3.5 py-1.5 rounded-xl bg-slate-100 text-slate-400 text-xs font-bold cursor-not-allowed"
              >
                Unavailable
              </button>
            ) : quantityInCart > 0 ? (
              /* Quantity Stepper when in cart */
              <div className="flex items-center bg-orange-50 border border-primary/30 rounded-2xl p-1 gap-2 shadow-sm">
                <button
                  type="button"
                  onClick={() => updateQuantity(product.id, quantityInCart - 1)}
                  className="w-7 h-7 rounded-xl bg-white hover:bg-orange-100 text-primary flex items-center justify-center shadow-xs transition-colors"
                  aria-label="Decrease quantity"
                >
                  <Minus className="w-3.5 h-3.5" />
                </button>
                <span className="w-5 text-center font-bold text-sm text-navy">
                  {quantityInCart}
                </span>
                <button
                  type="button"
                  onClick={() => updateQuantity(product.id, quantityInCart + 1)}
                  className="w-7 h-7 rounded-xl bg-primary hover:bg-primary-hover text-white flex items-center justify-center shadow-xs transition-colors"
                  aria-label="Increase quantity"
                >
                  <Plus className="w-3.5 h-3.5" />
                </button>
              </div>
            ) : (
              /* Add to Cart button */
              <button
                type="button"
                onClick={() => addItem(product)}
                id={`add-to-cart-${product.id}`}
                className="px-4 py-2 rounded-2xl bg-primary hover:bg-primary-hover text-white font-bold text-xs sm:text-sm shadow-md shadow-orange-500/20 active:scale-95 transition-all flex items-center gap-1.5"
              >
                <Plus className="w-4 h-4" />
                <span>Add</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
