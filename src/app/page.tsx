import React from "react";
import Link from "next/link";
import Image from "next/image";
import { MOCK_CATEGORIES, MOCK_PRODUCTS } from "@/lib/mock-data";
import FoodCard from "@/components/customer/FoodCard";
import {
  ArrowRight,
  Flame,
  Phone,
  MessageCircle,
  Sparkles,
  ShieldCheck,
  Heart,
  Calendar,
} from "lucide-react";

export default function HomePage() {
  const dishes = MOCK_PRODUCTS;

  return (
    <div className="space-y-16 sm:space-y-24 pb-20 overflow-hidden">
      {/* 1. HERO SECTION */}
      <section className="relative pt-6 sm:pt-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            {/* Left Content */}
            <div className="lg:col-span-7 space-y-6 text-center lg:text-left">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-orange-100/90 border border-orange-200 text-orange-900 text-xs sm:text-sm font-bold shadow-xs">
                <Flame className="w-4 h-4 text-primary animate-bounce" />
                <span>वाढदिवस व पार्टी ऑर्डर स्विकारली जाईल • संपर्क: 9284366544</span>
              </div>

              <h1 className="font-display font-extrabold text-4xl sm:text-6xl lg:text-7xl text-navy tracking-tight leading-[1.15]">
                शुद्ध व स्वादिष्ट पदार्थ, <br />
                <span className="text-primary bg-gradient-to-r from-primary to-primary-hover bg-clip-text text-transparent">
                  थेट आपल्या दारी!
                </span>
              </h1>

              <p className="text-slate-600 text-base sm:text-lg max-w-2xl leading-relaxed">
                <strong className="text-navy font-bold">श्री फूड</strong> — व्हेज बिर्याणी, पुलाव, गरमागरम पाव भाजी, गुलाब जाम, कुरकुरीत बटाटा वडा आणि साजूक तुपातील पुरण पोळी! अस्सल घरगुती चव आणि ताजी तयारी.
              </p>

              {/* Action Buttons */}
              <div className="flex flex-wrap items-center justify-center lg:justify-start gap-4 pt-2">
                <Link
                  href="/menu"
                  id="hero-order-now-btn"
                  className="px-8 py-4 rounded-2xl bg-primary hover:bg-primary-hover text-white font-extrabold text-base shadow-xl shadow-orange-500/25 active:scale-95 transition-all flex items-center gap-2 group"
                >
                  <span>Order Now (ऑर्डर करा)</span>
                  <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </Link>

                <a
                  href="https://wa.me/919284366544?text=Hello%20Shree%20Food,%20I%20would%20like%20to%20order"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-6 py-4 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-base shadow-lg shadow-emerald-600/20 active:scale-95 transition-all flex items-center gap-2"
                >
                  <MessageCircle className="w-5 h-5" />
                  <span>WhatsApp: 9284366544</span>
                </a>
              </div>
            </div>

            {/* Right Hero: Authentic Shree Food Menu Poster */}
            <div className="lg:col-span-5 relative">
              <div className="relative mx-auto max-w-md lg:max-w-none">
                {/* Glowing Backdrop */}
                <div className="absolute -inset-4 bg-gradient-to-tr from-orange-400/30 to-amber-300/30 rounded-3xl blur-2xl -z-10" />

                <div className="relative rounded-3xl overflow-hidden shadow-2xl border-4 border-white bg-cream">
                  <Image
                    src="/images/menu-poster.jpg"
                    alt="श्री फूड आपले पदार्थ — Official Menu"
                    width={738}
                    height={1024}
                    priority
                    className="w-full h-auto object-cover rounded-2xl"
                  />
                  <div className="absolute bottom-4 left-4 right-4 bg-white/95 backdrop-blur-md p-3.5 rounded-2xl shadow-xl flex items-center justify-between border border-orange-100">
                    <div>
                      <span className="text-[10px] font-extrabold uppercase text-primary tracking-wider flex items-center gap-1">
                        <Sparkles className="w-3 h-3 text-primary" /> आपले पदार्थ
                      </span>
                      <h4 className="font-display font-extrabold text-sm text-navy">
                        श्री फूड स्पेशल मेनू
                      </h4>
                    </div>
                    <Link
                      href="/menu"
                      className="px-3.5 py-1.5 rounded-xl bg-primary text-white text-xs font-bold shadow-sm hover:bg-primary-hover transition-colors"
                    >
                      View All
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 2. POPULAR CATEGORIES */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-10">
          <span className="text-xs font-extrabold text-primary uppercase tracking-wider">
            आपले पदार्थ
          </span>
          <h2 className="font-display font-extrabold text-3xl sm:text-4xl text-navy mt-1">
            Food Categories
          </h2>
          <p className="text-slate-600 text-sm mt-2">
            ताजे, चविष्ट आणि गरमागरम पदार्थ — बिर्याणी, पुलाव, स्नॅक्स आणि पारंपारिक मिठाई.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 max-w-3xl mx-auto">
          {MOCK_CATEGORIES.map((cat) => (
            <Link
              key={cat.id}
              href={`/menu?category=${cat.id}`}
              className="group bg-white p-6 rounded-3xl border border-orange-100 hover:border-orange-300 shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col items-center text-center"
            >
              <div className="relative w-28 h-28 rounded-2xl overflow-hidden mb-3 bg-slate-100 group-hover:scale-105 transition-transform shadow-xs">
                <Image
                  src={cat.image_url}
                  alt={cat.name}
                  fill
                  sizes="120px"
                  className="object-cover"
                />
              </div>
              <h3 className="font-display font-bold text-base text-navy group-hover:text-primary transition-colors">
                {cat.name}
              </h3>
            </Link>
          ))}
        </div>
      </section>

      {/* 3. ALL 6 FOOD DISHES (आपले पदार्थ) */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mb-10">
          <div>
            <span className="text-xs font-extrabold text-primary uppercase tracking-wider">
              श्री फूड आपले पदार्थ
            </span>
            <h2 className="font-display font-extrabold text-3xl sm:text-4xl text-navy mt-1">
              Our Complete Menu (सर्व पदार्थ)
            </h2>
          </div>
          <Link
            href="/menu"
            className="text-xs sm:text-sm font-bold text-primary hover:text-primary-hover flex items-center gap-1 group"
          >
            <span>Explore All 6 Dishes</span>
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {dishes.map((dish) => (
            <FoodCard key={dish.id} product={dish} />
          ))}
        </div>
      </section>

      {/* 4. WHY CHOOSE SHREE FOOD */}
      <section className="bg-white py-16 border-y border-orange-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <span className="text-xs font-extrabold text-primary uppercase tracking-wider">
              The श्री फूड Advantage
            </span>
            <h2 className="font-display font-extrabold text-3xl sm:text-4xl text-navy mt-1">
              Why Choose श्री फूड
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-cream/60 p-8 rounded-3xl border border-orange-100 text-center space-y-3">
              <div className="w-14 h-14 rounded-2xl bg-primary text-white flex items-center justify-center mx-auto shadow-md">
                <Heart className="w-7 h-7" />
              </div>
              <h3 className="font-display font-bold text-lg text-navy">
                अस्सल घरगुती चव
              </h3>
              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                कोणतेही प्रिझर्व्हेटिव्ह नाही! ताजे मसाले, साजूक तूप आणि अस्सल चव प्रत्येक पदार्थात.
              </p>
            </div>

            <div className="bg-cream/60 p-8 rounded-3xl border border-orange-100 text-center space-y-3">
              <div className="w-14 h-14 rounded-2xl bg-emerald-600 text-white flex items-center justify-center mx-auto shadow-md">
                <ShieldCheck className="w-7 h-7" />
              </div>
              <h3 className="font-display font-bold text-lg text-navy">
                १००% शुद्ध शाकाहारी व स्वच्छ
              </h3>
              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                स्वच्छ व हायजेनिक स्वयंपाकघर. ऑर्डर मिळाल्यावरच गरमागरम तयार केले जाते.
              </p>
            </div>

            <div className="bg-cream/60 p-8 rounded-3xl border border-orange-100 text-center space-y-3">
              <div className="w-14 h-14 rounded-2xl bg-navy text-white flex items-center justify-center mx-auto shadow-md">
                <Calendar className="w-7 h-7 text-primary" />
              </div>
              <h3 className="font-display font-bold text-lg text-navy">
                पार्टी व वाढदिवस ऑर्डर्स
              </h3>
              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                वाढदिवस, सण व पार्टीसाठी मोठ्या ऑर्डर्स वेळेवर तयार करून दिल्या जातात.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 5. PARTY ORDERS & WHATSAPP BANNER */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-gradient-to-r from-navy via-slate-900 to-navy rounded-3xl p-8 sm:p-12 text-white text-center relative overflow-hidden shadow-2xl border border-slate-800">
          <div className="relative z-10 max-w-2xl mx-auto space-y-4">
            <span className="inline-block px-3 py-1 rounded-full bg-primary/20 text-orange-400 text-xs font-bold uppercase tracking-wider">
              पार्टी व घरगुती कार्यक्रम
            </span>
            <h2 className="font-display font-extrabold text-3xl sm:text-5xl tracking-tight">
              वाढदिवस व पार्टी ऑर्डर स्विकारली जाईल!
            </h2>
            <p className="text-slate-300 text-xs sm:text-sm leading-relaxed">
              कोणत्याही कौटुंबिक कार्यक्रमासाठी अथवा पार्टीसाठी अस्सल महाराष्ट्रीयन जेवणाची ऑर्डर देण्यासाठी त्वरित संपर्क साधा.
            </p>
            <div className="pt-2 flex flex-wrap items-center justify-center gap-4">
              <a
                href="tel:9284366544"
                className="inline-flex items-center gap-2 px-6 py-3.5 rounded-2xl bg-white text-navy font-extrabold text-sm shadow-lg hover:bg-orange-50 transition-all active:scale-95"
              >
                <Phone className="w-4 h-4 text-primary" />
                <span>कॉल करा: 9284366544</span>
              </a>

              <a
                href="https://wa.me/919284366544?text=Hello%20Shree%20Food,%20I%20want%20to%20order%20for%20a%20party"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-6 py-3.5 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-sm shadow-xl shadow-emerald-600/30 transition-all active:scale-95"
              >
                <MessageCircle className="w-4 h-4" />
                <span>WhatsApp ग्रुप / ऑर्डर</span>
              </a>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
