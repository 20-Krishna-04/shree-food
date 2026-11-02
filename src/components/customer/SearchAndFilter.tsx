"use client";

import React from "react";
import { Search, X, ArrowDownUp, Sparkles } from "lucide-react";

interface SearchAndFilterProps {
  searchTerm: string;
  onSearchChange: (value: string) => void;
  vegOnly: boolean;
  onVegOnlyToggle: (value: boolean) => void;
  sortBy: string;
  onSortByChange: (value: string) => void;
}

export default function SearchAndFilter({
  searchTerm,
  onSearchChange,
  vegOnly,
  onVegOnlyToggle,
  sortBy,
  onSortByChange,
}: SearchAndFilterProps) {
  return (
    <div className="bg-white p-4 sm:p-5 rounded-3xl border border-orange-100 shadow-sm flex flex-col md:flex-row gap-4 items-center justify-between">
      {/* Search Bar */}
      <div className="relative w-full md:w-96">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder="Search व्हेज बिर्याणी, पुलाव, पाव भाजी, पुरण पोळी..."
          id="menu-search-input"
          className="w-full pl-11 pr-10 py-2.5 rounded-2xl bg-cream/70 border border-orange-200/70 text-sm font-medium text-navy placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all"
        />
        {searchTerm && (
          <button
            type="button"
            onClick={() => onSearchChange("")}
            className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-1"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        )}
      </div>

      {/* Filter and Sort Controls */}
      <div className="flex flex-wrap items-center gap-3 w-full md:w-auto justify-end">
        {/* Vegetarian Only Switch */}
        <button
          type="button"
          onClick={() => onVegOnlyToggle(!vegOnly)}
          id="veg-only-filter-toggle"
          className={`px-4 py-2 rounded-2xl text-xs sm:text-sm font-bold flex items-center gap-2 border transition-all ${
            vegOnly
              ? "bg-emerald-50 text-emerald-800 border-emerald-300 shadow-xs"
              : "bg-white text-slate-600 border-slate-200 hover:bg-slate-50"
          }`}
        >
          <div className="w-3.5 h-3.5 border-2 border-emerald-600 flex items-center justify-center">
            <div className="w-1.5 h-1.5 rounded-full bg-emerald-600" />
          </div>
          <span>Pure Veg</span>
        </button>

        {/* Sort Select */}
        <div className="relative flex items-center">
          <ArrowDownUp className="absolute left-3 w-3.5 h-3.5 text-slate-400 pointer-events-none" />
          <select
            value={sortBy}
            onChange={(e) => onSortByChange(e.target.value)}
            id="sort-select"
            className="pl-8 pr-8 py-2 rounded-2xl bg-white border border-slate-200 text-xs sm:text-sm font-semibold text-slate-700 hover:border-slate-300 focus:outline-none focus:ring-2 focus:ring-primary/20 appearance-none cursor-pointer"
          >
            <option value="featured">Featured Dishes</option>
            <option value="price_low">Price: Low to High</option>
            <option value="price_high">Price: High to Low</option>
          </select>
        </div>
      </div>
    </div>
  );
}
