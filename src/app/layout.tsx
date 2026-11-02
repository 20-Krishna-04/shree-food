import type { Metadata } from "next";
import { Inter, Outfit } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/contexts/auth-context";
import { CartProvider } from "@/contexts/cart-context";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

const outfit = Outfit({
  subsets: ["latin"],
  variable: "--font-outfit",
  display: "swap",
});

export const metadata: Metadata = {
  title: "श्री फूड — आपले पदार्थ | Veg Biryani, Pav Bhaji, Pulao, Puran Poli",
  description:
    "श्री फूड - शुद्ध व स्वादिष्ट पदार्थ थेट आपल्या दारी! व्हेज बिर्याणी, पुलाव, पाव भाजी, गुलाब जाम, बटाटा वडा व साजूक तुपातील पुरण पोळी. वाढदिवस व पार्टी ऑर्डर्स स्विकारल्या जातात. संपर्क: 9284366544.",
  keywords: [
    "श्री फूड",
    "shree food",
    "आपले पदार्थ",
    "व्हेज बिर्याणी",
    "veg biryani",
    "पुलाव",
    "pulao",
    "पाव भाजी",
    "pav bhaji",
    "गुलाब जाम",
    "gulab jamun",
    "बटाटा वडा",
    "batata vada",
    "पुरण पोळी",
    "puran poli",
    "cloud kitchen",
    "food delivery",
    "party order",
  ],
  authors: [{ name: "श्री फूड" }],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${inter.variable} ${outfit.variable} scroll-smooth`}>
      <body className="min-h-screen flex flex-col bg-cream text-navy selection:bg-primary/20 selection:text-primary-hover">
        <AuthProvider>
          <CartProvider>
            <Navbar />
            <main className="flex-1">{children}</main>
            <Footer />
          </CartProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
