import React from "react";
import Link from "next/link";
import Image from "next/image";
import {
  Phone,
  Mail,
  MapPin,
  Clock,
  Heart,
} from "lucide-react";

export default function Footer() {
  return (
    <footer className="bg-navy text-white pt-16 pb-12 border-t border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10">
          {/* Brand Info */}
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="relative w-11 h-11 rounded-2xl overflow-hidden shadow-md shadow-amber-500/20 bg-amber-50 border border-amber-200/50 p-0.5 flex items-center justify-center">
                <Image
                  src="/images/logo.png"
                  alt="श्री फूड Logo"
                  width={44}
                  height={44}
                  className="w-full h-full object-contain"
                />
              </div>
              <span className="font-display font-extrabold text-2xl tracking-tight text-white">
                श्री <span className="text-primary">फूड</span>
              </span>
            </div>
            <p className="text-slate-400 text-sm leading-relaxed">
              अस्सल घरगुती चव आणि शुद्ध शाकाहारी पदार्थ — व्हेज बिर्याणी, पुलाव, पाव भाजी, गुलाब जाम, बटाटा वडा आणि पुरण पोळी! वाढदिवस व पार्टी ऑर्डर्स स्विकारल्या जातात.
            </p>
          </div>

          {/* Quick Links */}
          <div className="space-y-3">
            <h4 className="font-display font-bold text-base text-white tracking-wide uppercase text-xs">
              Quick Links
            </h4>
            <ul className="space-y-2 text-sm text-slate-300">
              <li>
                <Link href="/" className="hover:text-primary transition-colors">
                  Home (मुख्य पान)
                </Link>
              </li>
              <li>
                <Link href="/menu" className="hover:text-primary transition-colors">
                  Explore Menu (आपले पदार्थ)
                </Link>
              </li>
              <li>
                <Link href="/about" className="hover:text-primary transition-colors">
                  About Our Kitchen
                </Link>
              </li>
              <li>
                <Link href="/contact" className="hover:text-primary transition-colors">
                  Contact & Support
                </Link>
              </li>
              <li>
                <Link href="/my-orders" className="hover:text-primary transition-colors">
                  Order Tracking
                </Link>
              </li>
            </ul>
          </div>

          {/* Opening Hours */}
          <div className="space-y-3">
            <h4 className="font-display font-bold text-base text-white tracking-wide uppercase text-xs">
              Kitchen Hours
            </h4>
            <div className="space-y-3 text-sm text-slate-300">
              <div className="flex items-start gap-2.5">
                <Clock className="w-4 h-4 text-primary mt-0.5 shrink-0" />
                <div>
                  <p className="font-medium text-white">Monday — Sunday</p>
                  <p className="text-slate-400 text-xs">11:00 AM — 11:00 PM (IST)</p>
                </div>
              </div>
              <div className="bg-slate-800/60 p-3 rounded-xl border border-slate-700/50">
                <p className="text-xs font-semibold text-emerald-400 flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
                  Kitchen is OPEN & taking orders!
                </p>
                <p className="text-[11px] text-slate-400 mt-1">
                  वाढदिवस व पार्टी ऑर्डर्स स्विकारल्या जातात
                </p>
              </div>
            </div>
          </div>

          {/* Contact Details */}
          <div className="space-y-3">
            <h4 className="font-display font-bold text-base text-white tracking-wide uppercase text-xs">
              Get In Touch
            </h4>
            <ul className="space-y-3 text-sm text-slate-300">
              <li className="flex items-center gap-2.5">
                <Phone className="w-4 h-4 text-primary shrink-0" />
                <a href="tel:9284366544" className="hover:text-primary transition-colors">
                  +91 92843 66544
                </a>
              </li>
              <li className="flex items-center gap-2.5">
                <Mail className="w-4 h-4 text-primary shrink-0" />
                <span>orders@shreefood.com</span>
              </li>
              <li className="flex items-start gap-2.5">
                <MapPin className="w-4 h-4 text-primary shrink-0 mt-0.5" />
                <span>Plot 42, Food Tech Park, Cyber City, Bangalore — 560100</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-slate-800/80 mt-12 pt-8 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-400 gap-4">
          <p>© {new Date().getFullYear()} श्री फूड (Cloud Kitchen). All rights reserved.</p>
          <div className="flex items-center gap-1">
            <span>Prepared with</span>
            <Heart className="w-3.5 h-3.5 text-primary fill-primary" />
            <span>fresh ingredients for food lovers everywhere.</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
