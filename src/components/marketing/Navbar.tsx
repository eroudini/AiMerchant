"use client";
import React, { useEffect, useState } from "react";
import Link from "next/link";
import { Sparkles } from "lucide-react";
import { track } from "@/lib/analytics";

const navItems = [
  { href: "#platform", label: "Plateforme", dropdown: true },
  { href: "/blog", label: "Blog" },
  { href: "/pricing", label: "Tarification" }, // déplacé vers page dédiée
  { href: "#faq", label: "FAQ" },
];

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [openPlatform, setOpenPlatform] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <nav
      className={` ${
        scrolled
          ? "bg-white/70 backdrop-blur-md border-b border-gray-200 shadow-sm"
          : "bg-transparent"
      }`}
    >
      <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-12">
        <div className="flex items-center justify-between py-4">
          {/* ==== LOGO ==== */}
          <Link
            href="/"
            className="flex items-center gap-2 group"
            aria-label="Accueil AIMerchant"
          >
            <div className="relative flex items-center justify-center w-9 h-9 rounded-xl bg-gradient-to-br from-[#FF6A00] to-[#FF9330] text-white shadow-md transition-transform duration-300 group-hover:rotate-6">
              <Sparkles className="w-5 h-5" aria-hidden="true" />
            </div>
            <span className="font-semibold text-lg tracking-tight text-gray-900 group-hover:text-[#FF6A00] transition-colors duration-200">
              AIMerchant
            </span>
          </Link>

          {/* ==== NAVIGATION ==== */}
          <div className="hidden md:flex items-center justify-center bg-white/80 backdrop-blur-sm border border-gray-200 rounded-full shadow-sm h-11 px-2 ml-6 lg:ml-12 relative">
            {navItems.map((item) => {
              if (item.dropdown) {
                return (
                  <div key={item.label} className="relative">
                    <button
                      type="button"
                      onClick={() => setOpenPlatform((o) => !o)}
                      onBlur={() => setTimeout(() => setOpenPlatform(false), 150)}
                      className="px-5 py-2 text-sm font-medium text-gray-700 hover:text-[#FF6A00] transition-colors duration-200 flex items-center gap-1"
                    >
                      {item.label}
                      <span className={`transition-transform ${openPlatform ? "rotate-180" : "rotate-0"}`}>▾</span>
                    </button>
                    {openPlatform && (
                      <div className="absolute left-1/2 -translate-x-1/2 mt-2 w-48 rounded-xl border bg-white shadow-lg py-2 z-50">
                        {[
                          { name: "Amazon", slug: "amazon" },
                          { name: "Shopify", slug: "shopify" },
                          { name: "WooCommerce", slug: "woocommerce" },
                          { name: "CSV / Fichier", slug: "csv" },
                        ].map((p) => (
                          <div
                            key={p.slug}
                            className="px-4 py-2 text-sm text-gray-700 hover:bg-orange-50 hover:text-[#FF6A00] cursor-pointer"
                          >
                            {p.name}
                          </div>
                        ))}
                        <div className="px-4 pt-2">
                          <Link
                            href="/register"
                            className="text-xs text-[#FF6A00] font-medium hover:underline"
                            onClick={() => track("cta_click", { location: "navbar_platform_dropdown", label: "Connecter une plateforme", href: "/register" })}
                          >
                            Connecter une plateforme →
                          </Link>
                        </div>
                      </div>
                    )}
                  </div>
                );
              }
              return (
                <a
                  key={item.href + item.label}
                  href={item.href}
                  className="px-5 py-2 text-sm font-medium text-gray-700 hover:text-[#FF6A00] transition-colors duration-200"
                >
                  {item.label}
                </a>
              );
            })}
          </div>

          {/* ==== ACTIONS ==== */}
          <div className="flex items-center gap-3">
            <Link
              href="/login"
              onClick={() => track("cta_click", { location: "navbar", label: "Connexion", href: "/login" })}
              className="hidden sm:inline-block px-5 py-2.5 rounded-full border border-gray-900 text-gray-900 text-sm font-medium hover:bg-gray-100 transition-all duration-200"
            >
              Connexion
            </Link>

            <Link
              href="/register"
              onClick={() => track("cta_click", { location: "navbar", label: "Commencer", href: "/register" })}
              className="px-5 py-2.5 rounded-full bg-[#FF6A00] text-white text-sm font-semibold shadow-md hover:shadow-lg hover:bg-[#e35d00] transition-all duration-200"
            >
              Commencer
            </Link>
          </div>
        </div>
      </div>
    </nav>
  );
}
