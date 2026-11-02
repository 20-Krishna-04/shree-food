import React from "react";
import Image from "next/image";
import Link from "next/link";
import { ArrowRight } from "lucide-react";

export default function AboutPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-24 space-y-12 text-center">
      <div className="relative w-24 h-24 mx-auto rounded-3xl overflow-hidden bg-amber-50 border border-amber-200/70 p-2 shadow-lg flex items-center justify-center">
        <Image
          src="/images/logo.png"
          alt="श्री फूड"
          width={96}
          height={96}
          className="w-full h-full object-contain"
          priority
        />
      </div>

      <div className="space-y-4 max-w-2xl mx-auto">
        <h1 className="font-display font-extrabold text-4xl sm:text-5xl text-navy">
          About <span className="text-primary">श्री फूड</span>
        </h1>
        <p className="text-slate-600 text-base sm:text-lg leading-relaxed">
          श्री फूड brings you pure, authentic, and delicious culinary specialties prepared fresh to order in our modern cloud kitchen facility. We focus on premium ingredients, exceptional taste, and superfast delivery straight to your doorstep.
        </p>
      </div>

      <div className="pt-4 flex items-center justify-center gap-4">
        <Link
          href="/menu"
          className="px-8 py-4 rounded-2xl bg-primary hover:bg-primary-hover text-white font-extrabold text-sm shadow-xl shadow-orange-500/25 active:scale-95 transition-all flex items-center gap-2"
        >
          <span>Explore Our Menu</span>
          <ArrowRight className="w-4 h-4" />
        </Link>
        <Link
          href="/contact"
          className="px-7 py-4 rounded-2xl bg-white hover:bg-orange-50 text-slate-800 font-bold text-sm border border-orange-200/80 shadow-sm transition-all"
        >
          Contact Us
        </Link>
      </div>
    </div>
  );
}
