"use client";

import React from "react";
import { Category } from "@/types";

interface CategoryFilterProps {
  categories: Category[];
  selectedCategoryId: string;
  onSelectCategory: (categoryId: string) => void;
}

export default function CategoryFilter({
  categories,
  selectedCategoryId,
  onSelectCategory,
}: CategoryFilterProps) {
  return (
    <div className="w-full overflow-x-auto pb-2 scrollbar-none">
      <div className="flex items-center gap-2.5 min-w-max">
        {/* All Dishes Pill */}
        <button
          type="button"
          onClick={() => onSelectCategory("all")}
          className={`px-5 py-2.5 rounded-2xl font-bold text-xs sm:text-sm transition-all flex items-center gap-2 ${
            selectedCategoryId === "all"
              ? "bg-primary text-white shadow-md shadow-orange-500/25 scale-102"
              : "bg-white text-slate-700 hover:bg-orange-50 border border-orange-100"
          }`}
        >
          <span>🔥 All Dishes</span>
        </button>

        {/* Categories */}
        {categories.map((cat) => {
          const isSelected = selectedCategoryId === cat.id;
          return (
            <button
              key={cat.id}
              type="button"
              onClick={() => onSelectCategory(cat.id)}
              className={`px-5 py-2.5 rounded-2xl font-bold text-xs sm:text-sm transition-all flex items-center gap-2 ${
                isSelected
                  ? "bg-primary text-white shadow-md shadow-orange-500/25 scale-102"
                  : "bg-white text-slate-700 hover:bg-orange-50 border border-orange-100"
              }`}
            >
              <span>{cat.name}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
