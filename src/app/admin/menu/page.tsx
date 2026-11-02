"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import AdminSidebar from "@/components/admin/AdminSidebar";
import ProductModal from "@/components/admin/ProductModal";
import { Product, Category } from "@/types";
import { MOCK_CATEGORIES, MOCK_PRODUCTS } from "@/lib/mock-data";
import { formatCurrency } from "@/lib/utils";
import {
  UtensilsCrossed,
  Plus,
  Edit2,
  Trash2,
  Search,
  CheckCircle2,
  XCircle,
  Clock,
  Sparkles,
} from "lucide-react";

export default function AdminMenuPage() {
  const [products, setProducts] = useState<Product[]>(MOCK_PRODUCTS);
  const [categories, setCategories] = useState<Category[]>(MOCK_CATEGORIES);
  const [isLoading, setIsLoading] = useState(false);
  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [modalOpen, setModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);

  const loadProducts = async () => {
    setIsLoading(true);
    try {
      const res = await fetch("/api/products");
      const json = await res.json();
      if (json.success && json.data) {
        setProducts(json.data);
      }
    } catch (e) {
      console.warn("Using local catalog", e);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadProducts();
  }, []);

  const handleSaveProduct = async (productData: Partial<Product>) => {
    if (editingProduct) {
      // Update
      try {
        await fetch(`/api/products/${editingProduct.id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(productData),
        });
      } catch (e) {
        console.warn(e);
      }

      setProducts((prev) =>
        prev.map((p) =>
          p.id === editingProduct.id ? ({ ...p, ...productData } as Product) : p
        )
      );
    } else {
      // Create new
      const newProduct: Product = {
        id: `p-${Date.now()}`,
        name: productData.name!,
        description: productData.description!,
        category_id: productData.category_id!,
        price: productData.price!,
        image_url: productData.image_url!,
        is_vegetarian: productData.is_vegetarian ?? true,
        is_available: productData.is_available ?? true,
        preparation_time_mins: productData.preparation_time_mins || 20,
      };

      try {
        await fetch("/api/products", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(productData),
        });
      } catch (e) {
        console.warn(e);
      }

      setProducts((prev) => [newProduct, ...prev]);
    }
  };

  const handleDeleteProduct = async (productId: string) => {
    if (!confirm("Are you sure you want to remove this dish from the menu?")) return;

    try {
      await fetch(`/api/products/${productId}`, { method: "DELETE" });
    } catch (e) {
      console.warn(e);
    }

    setProducts((prev) => prev.filter((p) => p.id !== productId));
  };

  const handleToggleAvailability = async (product: Product) => {
    const updatedStatus = !product.is_available;
    try {
      await fetch(`/api/products/${product.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ is_available: updatedStatus }),
      });
    } catch (e) {
      console.warn(e);
    }

    setProducts((prev) =>
      prev.map((p) =>
        p.id === product.id ? { ...p, is_available: updatedStatus } : p
      )
    );
  };

  const filteredProducts = products.filter((p) => {
    if (selectedCategory !== "all" && p.category_id !== selectedCategory) return false;
    if (search.trim()) {
      const q = search.toLowerCase();
      return p.name.toLowerCase().includes(q) || p.description.toLowerCase().includes(q);
    }
    return true;
  });

  return (
    <div className="flex flex-col md:flex-row min-h-[calc(100vh-5rem)] bg-slate-50">
      <AdminSidebar />

      <main className="flex-1 p-4 sm:p-8 space-y-6 max-w-7xl">
        {/* Header */}
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h1 className="font-display font-extrabold text-2xl sm:text-3xl text-navy">
              Food Menu Management
            </h1>
            <p className="text-xs text-slate-500 mt-1">
              Add new kitchen dishes, adjust prices, and toggle daily availability
            </p>
          </div>

          <button
            type="button"
            onClick={() => {
              setEditingProduct(null);
              setModalOpen(true);
            }}
            id="add-dish-btn"
            className="px-5 py-2.5 rounded-2xl bg-primary hover:bg-primary-hover text-white text-xs font-bold shadow-md shadow-orange-500/20 flex items-center gap-2 active:scale-95 transition-all"
          >
            <Plus className="w-4 h-4" />
            <span>Add New Dish</span>
          </button>
        </div>

        {/* Toolbar */}
        <div className="flex flex-wrap items-center gap-4 bg-white p-4 rounded-2xl border border-slate-200">
          <div className="relative flex-1 min-w-[240px]">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search dishes by name or ingredients..."
              className="w-full pl-10 pr-4 py-2 rounded-xl border border-slate-200 text-xs text-navy focus:outline-none focus:ring-2 focus:ring-primary/20"
            />
          </div>

          <div className="flex items-center gap-2 text-xs">
            <span className="font-bold text-slate-600">Category:</span>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="px-3 py-2 rounded-xl border border-slate-200 font-semibold text-slate-700 focus:outline-none"
            >
              <option value="all">All Categories</option>
              {categories.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Dishes Table */}
        <div className="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-xs">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-bold uppercase text-[10px] tracking-wider">
                <tr>
                  <th className="py-4 px-6">Dish</th>
                  <th className="py-4 px-6">Type</th>
                  <th className="py-4 px-6">Price</th>
                  <th className="py-4 px-6">Prep Time</th>
                  <th className="py-4 px-6">Availability</th>
                  <th className="py-4 px-6 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {filteredProducts.map((p) => (
                  <tr key={p.id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="py-4 px-6">
                      <div className="flex items-center gap-3">
                        <div className="relative w-12 h-12 rounded-xl overflow-hidden bg-slate-100 shrink-0">
                          <Image
                            src={p.image_url}
                            alt={p.name}
                            fill
                            sizes="50px"
                            className="object-cover"
                          />
                        </div>
                        <div>
                          <span className="font-bold text-navy text-sm block">
                            {p.name}
                          </span>
                          <span className="text-slate-400 text-[11px] line-clamp-1 max-w-xs">
                            {p.description}
                          </span>
                        </div>
                      </div>
                    </td>

                    <td className="py-4 px-6">
                      <span
                        className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold ${
                          p.is_vegetarian
                            ? "bg-emerald-100 text-emerald-800"
                            : "bg-rose-100 text-rose-800"
                        }`}
                      >
                        <span
                          className={`w-1.5 h-1.5 rounded-full ${
                            p.is_vegetarian ? "bg-emerald-600" : "bg-rose-600"
                          }`}
                        />
                        {p.is_vegetarian ? "Pure Veg" : "Non-Veg"}
                      </span>
                    </td>

                    <td className="py-4 px-6 font-display font-extrabold text-sm text-navy">
                      {formatCurrency(p.price)}
                    </td>

                    <td className="py-4 px-6 text-slate-500">
                      <span className="flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5 text-slate-400" />
                        {p.preparation_time_mins || 20}m
                      </span>
                    </td>

                    <td className="py-4 px-6">
                      <button
                        type="button"
                        onClick={() => handleToggleAvailability(p)}
                        className={`px-3 py-1 rounded-xl text-[11px] font-bold transition-all ${
                          p.is_available
                            ? "bg-emerald-100 text-emerald-800 hover:bg-emerald-200"
                            : "bg-rose-100 text-rose-800 hover:bg-rose-200"
                        }`}
                      >
                        {p.is_available ? "In Stock (Available)" : "Out of Stock"}
                      </button>
                    </td>

                    <td className="py-4 px-6 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          type="button"
                          onClick={() => {
                            setEditingProduct(p);
                            setModalOpen(true);
                          }}
                          className="p-2 rounded-xl text-slate-500 hover:text-primary hover:bg-orange-50 transition-colors"
                          title="Edit Dish"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDeleteProduct(p.id)}
                          className="p-2 rounded-xl text-slate-500 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                          title="Delete Dish"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Product Modal */}
        <ProductModal
          product={editingProduct}
          categories={categories}
          isOpen={modalOpen}
          onClose={() => setModalOpen(false)}
          onSave={handleSaveProduct}
        />
      </main>
    </div>
  );
}
