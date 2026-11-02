"use client";

import React, { useState } from "react";
import { Category, Product } from "@/types";
import { X, Sparkles, Upload } from "lucide-react";

interface ProductModalProps {
  product?: Product | null;
  categories: Category[];
  isOpen: boolean;
  onClose: () => void;
  onSave: (productData: Partial<Product>) => Promise<void>;
}

export default function ProductModal({
  product,
  categories,
  isOpen,
  onClose,
  onSave,
}: ProductModalProps) {
  const [name, setName] = useState(product?.name || "");
  const [description, setDescription] = useState(product?.description || "");
  const [price, setPrice] = useState(product ? String(product.price) : "");
  const [categoryId, setCategoryId] = useState(
    product?.category_id || (categories[0]?.id || "")
  );
  const [imageUrl, setImageUrl] = useState(product?.image_url || "");
  const [isVegetarian, setIsVegetarian] = useState(product?.is_vegetarian ?? true);
  const [isAvailable, setIsAvailable] = useState(product?.is_available ?? true);
  const [prepTime, setPrepTime] = useState(product ? String(product.preparation_time_mins) : "20");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!name || !description || !price || !categoryId || !imageUrl) {
      setError("Please fill in all required fields.");
      return;
    }

    setIsSubmitting(true);
    try {
      await onSave({
        name,
        description,
        price: parseFloat(price),
        category_id: categoryId,
        image_url: imageUrl,
        is_vegetarian: isVegetarian,
        is_available: isAvailable,
        preparation_time_mins: parseInt(prepTime) || 20,
      });
      onClose();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to save product");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white rounded-3xl border border-orange-100 shadow-2xl max-w-xl w-full p-6 sm:p-8 relative max-h-[90vh] overflow-y-auto">
        <button
          type="button"
          onClick={onClose}
          className="absolute top-5 right-5 p-2 rounded-xl text-slate-400 hover:text-navy hover:bg-slate-100"
        >
          <X className="w-5 h-5" />
        </button>

        <h2 className="font-display font-extrabold text-2xl text-navy">
          {product ? "Edit Dish Details" : "Add New Dish to Menu"}
        </h2>
        <p className="text-xs text-slate-500 mt-1">
          Configure dish pricing, availability, and description
        </p>

        {error && (
          <div className="mt-4 p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-semibold">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="mt-6 space-y-4 text-xs">
          {/* Dish Name */}
          <div>
            <label className="block font-bold text-slate-700 mb-1">
              Dish Name *
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. व्हेज बिर्याणी (Veg Biryani)"
              required
              className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
            />
          </div>

          {/* Description */}
          <div>
            <label className="block font-bold text-slate-700 mb-1">
              Description *
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
              placeholder="Appetizing description of ingredients and flavors..."
              required
              className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
            />
          </div>

          {/* Category & Price */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block font-bold text-slate-700 mb-1">
                Category *
              </label>
              <select
                value={categoryId}
                onChange={(e) => setCategoryId(e.target.value)}
                required
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
              >
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">
                Price (₹ INR) *
              </label>
              <input
                type="number"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                placeholder="199"
                min="1"
                step="1"
                required
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
              />
            </div>
          </div>

          {/* Image URL & Prep Time */}
          <div className="space-y-2">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="sm:col-span-2">
                <label className="block font-bold text-slate-700 mb-1">
                  Photograph URL or File Upload *
                </label>
                <div className="flex gap-2">
                  <input
                    type="url"
                    value={imageUrl}
                    onChange={(e) => setImageUrl(e.target.value)}
                    placeholder="https://images.unsplash.com/... or upload"
                    required
                    className="w-full px-4 py-2 rounded-xl border border-slate-200 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                  />
                  <label className="px-3 py-2 rounded-xl bg-orange-50 border border-orange-200 text-primary font-bold text-xs hover:bg-orange-100 cursor-pointer flex items-center gap-1 shrink-0">
                    <Upload className="w-4 h-4" />
                    <span>Upload</span>
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) {
                          const reader = new FileReader();
                          reader.onloadend = () => {
                            if (typeof reader.result === "string") {
                              setImageUrl(reader.result);
                            }
                          };
                          reader.readAsDataURL(file);
                        }
                      }}
                    />
                  </label>
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Prep Time (mins)
                </label>
                <input
                  type="number"
                  value={prepTime}
                  onChange={(e) => setPrepTime(e.target.value)}
                  placeholder="20"
                  min="5"
                  max="120"
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
                />
              </div>
            </div>

            {imageUrl && (
              <div className="flex items-center gap-3 p-2 bg-slate-50 rounded-xl border border-slate-200">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={imageUrl}
                  alt="Preview"
                  className="w-12 h-12 object-cover rounded-lg border border-slate-300"
                />
                <span className="text-[11px] text-slate-500 truncate max-w-xs">
                  Image preview active
                </span>
              </div>
            )}
          </div>

          {/* Toggles: Pure Veg & Available */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
            <label className="flex items-center gap-3 p-3 rounded-2xl bg-slate-50 border border-slate-200 cursor-pointer">
              <input
                type="checkbox"
                checked={isVegetarian}
                onChange={(e) => setIsVegetarian(e.target.checked)}
                className="w-4 h-4 text-emerald-600 rounded"
              />
              <span className="font-bold text-slate-700">Pure Vegetarian Dish</span>
            </label>

            <label className="flex items-center gap-3 p-3 rounded-2xl bg-slate-50 border border-slate-200 cursor-pointer">
              <input
                type="checkbox"
                checked={isAvailable}
                onChange={(e) => setIsAvailable(e.target.checked)}
                className="w-4 h-4 text-primary rounded"
              />
              <span className="font-bold text-slate-700">Available to Order</span>
            </label>
          </div>

          {/* Submit Button */}
          <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2.5 rounded-xl border border-slate-200 text-slate-700 font-bold hover:bg-slate-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-6 py-2.5 rounded-xl bg-primary hover:bg-primary-hover text-white font-extrabold shadow-md shadow-orange-500/20 disabled:opacity-60"
            >
              {isSubmitting ? "Saving..." : product ? "Update Dish" : "Create Dish"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
