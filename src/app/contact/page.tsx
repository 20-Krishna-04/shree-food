"use client";

import React, { useState } from "react";
import {
  Phone,
  Mail,
  MapPin,
  Clock,
  Send,
  CheckCircle2,
  MessageSquare,
} from "lucide-react";

export default function ContactPage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [isSent, setIsSent] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSent(true);
    setName("");
    setEmail("");
    setMessage("");
    setTimeout(() => setIsSent(false), 5000);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-20 space-y-12">
      <div className="text-center max-w-2xl mx-auto space-y-3">
        <span className="text-xs font-extrabold text-primary uppercase tracking-wider">
          Support & Feedback
        </span>
        <h1 className="font-display font-extrabold text-4xl sm:text-5xl text-navy">
          Get in Touch With Us
        </h1>
        <p className="text-slate-600 text-sm">
          Have a question about your order, special catering request, or kitchen hygiene? Our support team is here for you.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Contact Info Cards */}
        <div className="lg:col-span-5 space-y-4">
          <div className="bg-white p-6 rounded-3xl border border-orange-100 shadow-sm flex items-start gap-4">
            <div className="w-12 h-12 rounded-2xl bg-orange-100 text-primary flex items-center justify-center shrink-0">
              <Phone className="w-6 h-6" />
            </div>
            <div>
              <h3 className="font-bold text-navy text-base">Direct Contact & WhatsApp</h3>
              <p className="text-xs text-slate-500 mt-0.5">Order support & Party Bookings</p>
              <a
                href="tel:9284366544"
                className="font-display font-extrabold text-base text-primary mt-1 block hover:underline"
              >
                +91 92843 66544
              </a>
            </div>
          </div>

          <div className="bg-white p-6 rounded-3xl border border-orange-100 shadow-sm flex items-start gap-4">
            <div className="w-12 h-12 rounded-2xl bg-orange-100 text-primary flex items-center justify-center shrink-0">
              <Mail className="w-6 h-6" />
            </div>
            <div>
              <h3 className="font-bold text-navy text-base">Email Support</h3>
              <p className="text-xs text-slate-500 mt-0.5">Guaranteed response in 2 hours</p>
              <p className="font-bold text-sm text-navy mt-1">
                orders@shreefood.com
              </p>
            </div>
          </div>

          <div className="bg-white p-6 rounded-3xl border border-orange-100 shadow-sm flex items-start gap-4">
            <div className="w-12 h-12 rounded-2xl bg-orange-100 text-primary flex items-center justify-center shrink-0">
              <MapPin className="w-6 h-6" />
            </div>
            <div>
              <h3 className="font-bold text-navy text-base">श्री फूड Kitchen Facility</h3>
              <p className="text-xs text-slate-500 mt-0.5">Commercial Dispatch Hub</p>
              <p className="text-xs text-slate-700 leading-relaxed mt-1">
                Plot 42, Food Tech Park, Cyber City, Indiranagar, Bangalore — 560100
              </p>
            </div>
          </div>
        </div>

        {/* Message Form */}
        <div className="lg:col-span-7 bg-white p-8 sm:p-10 rounded-3xl border border-orange-100 shadow-sm">
          <h2 className="font-display font-bold text-2xl text-navy mb-2">
            Send Us a Message
          </h2>
          <p className="text-xs text-slate-500 mb-6">
            We value your suggestions and reply promptly to all inquiries.
          </p>

          {isSent && (
            <div className="mb-6 p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
              <span>Thank you! Your message has been sent to our kitchen team.</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4 text-xs">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Your Name *
                </label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Rahul Sharma"
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Email Address *
                </label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="rahul@example.com"
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                />
              </div>
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">
                Your Message *
              </label>
              <textarea
                required
                rows={4}
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="How can our kitchen help you today?"
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
              />
            </div>

            <button
              type="submit"
              className="px-8 py-3.5 rounded-2xl bg-primary hover:bg-primary-hover text-white font-extrabold text-xs sm:text-sm shadow-lg shadow-orange-500/20 active:scale-95 transition-all flex items-center gap-2"
            >
              <Send className="w-4 h-4" />
              <span>Send Message</span>
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
