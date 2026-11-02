"use client";

import React, { useState, useEffect, useMemo, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { Category, Product } from "@/types";
import { MOCK_CATEGORIES, MOCK_PRODUCTS } from "@/lib/mock-data";
import FoodCard from "@/components/customer/FoodCard";
import CategoryFilter from "@/components/customer/CategoryFilter";
import SearchAndFilter from "@/components/customer/SearchAndFilter";
import { AlertCircle } from "lucide-react";

function MenuContent() {
  const searchParams = useSearchParams();
  const initialCategory = searchParams.get("category") || "all";

  const [categories, setCategories] = useState<Category[]>(MOCK_CATEGORIES);
  const [products, setProducts] = useState<Product[]>(MOCK_PRODUCTS);
  const [selectedCategory, setSelectedCategory] = useState<string>(initialCategory);
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [vegOnly, setVegOnly] = useState<boolean>(false);
  const [sortBy, setSortBy] = useState<string>("featured");
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Sync category from URL param if user clicked a homepage category
  useEffect(() => {
    const cat = searchParams.get("category");
    if (cat) {
      setSelectedCategory(cat);
    }
  }, [searchParams]);

  // Fetch products and categories from Supabase API (with mock fallback)
  useEffect(() => {
    async function loadMenu() {
      try {
        const res = await fetch("/api/products");
        const json = await res.json();
        if (json.success && json.data && json.data.length > 0) {
          setProducts(json.data);
        }
      } catch (e) {
        console.warn("Failed to fetch products API, using catalog fallback", e);
      } finally {
        setIsLoading(false);
      }
    }
    loadMenu();
  }, []);

  // Filter and sort products client-side for ultra-responsive instant UI
  const filteredProducts = useMemo(() => {
    let result = [...products];

    // Category filter
    if (selectedCategory !== "all") {
      result = result.filter((p) => p.category_id === selectedCategory);
    }

    // Pure Veg filter
    if (vegOnly) {
      result = result.filter((p) => p.is_vegetarian);
    }

    // Search filter
    if (searchTerm.trim()) {
      const term = searchTerm.toLowerCase();
      result = result.filter(
        (p) =>
          p.name.toLowerCase().includes(term) ||
          p.description.toLowerCase().includes(term)
      );
    }

    // Sorting
    if (sortBy === "price_low") {
      result.sort((a, b) => a.price - b.price);
    } else if (sortBy === "price_high") {
      result.sort((a, b) => b.price - a.price);
    }

    return result;
  }, [products, selectedCategory, vegOnly, searchTerm, sortBy]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 space-y-8">
      {/* Page Title Header */}
      <div>
        <h1 className="font-display font-extrabold text-3xl sm:text-5xl text-navy">
          Explore Our Food Menu
        </h1>
        <p className="text-slate-600 text-sm mt-1 max-w-xl">
          आपले आवडते पदार्थ: व्हेज बिर्याणी, पुलाव, पाव भाजी, गुलाब जाम, बटाटा वडा व पुरण पोळी — ताजे व चविष्ट!
        </p>
      </div>

      {/* Category Pills Filter */}
      <CategoryFilter
        categories={categories}
        selectedCategoryId={selectedCategory}
        onSelectCategory={setSelectedCategory}
      />

      {/* Search & Secondary Filter Toolbar */}
      <SearchAndFilter
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
        vegOnly={vegOnly}
        onVegOnlyToggle={setVegOnly}
        sortBy={sortBy}
        onSortByChange={setSortBy}
      />

      {/* Food Cards Grid */}
      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 py-12">
          {[...Array(6)].map((_, i) => (
            <div
              key={i}
              className="bg-white rounded-3xl h-80 animate-pulse border border-orange-100 p-5 space-y-4"
            >
              <div className="bg-slate-200 h-44 rounded-2xl w-full" />
              <div className="bg-slate-200 h-4 rounded w-3/4" />
              <div className="bg-slate-200 h-4 rounded w-1/2" />
            </div>
          ))}
        </div>
      ) : filteredProducts.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredProducts.map((product) => (
            <FoodCard key={product.id} product={product} />
          ))}
        </div>
      ) : (
        /* Empty State */
        <div className="text-center py-16 bg-white rounded-3xl border border-orange-100 p-8 space-y-4 max-w-md mx-auto">
          <div className="w-16 h-16 rounded-2xl bg-orange-50 text-primary flex items-center justify-center mx-auto">
            <AlertCircle className="w-8 h-8" />
          </div>
          <h3 className="font-display font-bold text-xl text-navy">
            No dishes found
          </h3>
          <p className="text-xs sm:text-sm text-slate-500">
            We couldn&apos;t find any items matching your current filters. Try resetting the search or category filter.
          </p>
          <button
            type="button"
            onClick={() => {
              setSelectedCategory("all");
              setSearchTerm("");
              setVegOnly(false);
              setSortBy("featured");
            }}
            className="px-5 py-2.5 rounded-2xl bg-primary text-white font-bold text-xs hover:bg-primary-hover shadow-md shadow-orange-500/20"
          >
            Reset Filters
          </button>
        </div>
      )}
    </div>
  );
}

export default function MenuPage() {
  return (
    <Suspense
      fallback={
        <div className="max-w-7xl mx-auto px-4 py-16 text-center">
          <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-sm font-semibold text-slate-500 mt-4">
            Loading Fresh Kitchen Menu...
          </p>
        </div>
      }
    >
      <MenuContent />
    </Suspense>
  );
}
