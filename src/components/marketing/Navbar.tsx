"use client";
import React, { useEffect, useRef, useState } from "react";
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
  const platformRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Fermer le menu plateforme sur clic extérieur ou ESC
  useEffect(() => {
    const onClickOutside = (e: MouseEvent) => {
      if (!platformRef.current) return;
      if (!platformRef.current.contains(e.target as Node)) {
        setOpenPlatform(false);
      }
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpenPlatform(false);
    };
    document.addEventListener("mousedown", onClickOutside);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onClickOutside);
      document.removeEventListener("keydown", onKey);
    };
  }, []);

  return (
    <nav
      className={`fixed inset-x-0 top-0 z-50 ${
        scrolled
          ? "bg-black/40 backdrop-blur-md border-b border-white/10 shadow-sm"
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
            <span className="font-semibold text-lg tracking-tight text-white group-hover:text-[#FF6A00] transition-colors duration-200">
              AIMerchant
            </span>
          </Link>

          {/* ==== NAVIGATION ==== */}
          <div className="hidden md:flex items-center justify-center bg-white/10 backdrop-blur-sm border border-white/20 rounded-full shadow-sm h-11 px-2 ml-6 lg:ml-12 relative text-white">
            {navItems.map((item) => {
              if (item.dropdown) {
                return (
                  <div key={item.label} className="relative" ref={platformRef}>
                    <button
                      type="button"
                      id="platform-trigger"
                      aria-haspopup="true"
                      aria-expanded={openPlatform}
                      aria-controls="platform-menu"
                      onClick={() => setOpenPlatform((o) => !o)}
                      onBlur={() => setTimeout(() => setOpenPlatform(false), 150)}
                      className="px-5 py-2 text-sm font-medium text-white/80 hover:text-[#FF6A00] transition-colors duration-200 flex items-center gap-1"
                      onKeyDown={(e) => {
                        if (e.key === "ArrowDown" || e.key === "Enter" || e.key === " ") {
                          e.preventDefault();
                          setOpenPlatform(true);
                          // focus first item après ouverture
                          setTimeout(() => {
                            const firstItem = document.querySelector<HTMLButtonElement>("#platform-menu [data-menu-item]");
                            firstItem?.focus();
                          }, 0);
                        }
                      }}
                    >
                      {item.label}
                      <span className={`transition-transform ${openPlatform ? "rotate-180" : "rotate-0"}`}>▾</span>
                    </button>
                    {openPlatform && (
                      <div
                        id="platform-menu"
                        role="menu"
                        aria-labelledby="platform-trigger"
                        className="absolute left-1/2 -translate-x-1/2 mt-2 w-56 rounded-xl border border-white/10 bg-black/80 backdrop-blur-md shadow-lg py-2 z-50"
                      >
                        {[
                          { name: "Amazon", slug: "amazon" },
                          { name: "Shopify", slug: "shopify" },
                          { name: "WooCommerce", slug: "woocommerce" },
                          { name: "CSV / Fichier", slug: "csv" },
                        ].map((p) => (
                          <button
                            key={p.slug}
                            type="button"
                            data-menu-item
                            role="menuitem"
                            className="w-full text-left px-4 py-2 text-sm text-white/90 hover:bg-white/10 hover:text-[#FF6A00] cursor-pointer focus:outline-none focus:bg-white/10"
                            onClick={() => {
                              track("platform_select", { platform: p.slug, location: "navbar_platform_dropdown" });
                              setOpenPlatform(false);
                            }}
                          >
                            {p.name}
                          </button>
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
                  className="px-5 py-2 text-sm font-medium text-white/80 hover:text-[#FF6A00] transition-colors duration-200"
                  onClick={() => track("nav_click", { location: "navbar", label: item.label, href: item.href })}
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
              className="hidden sm:inline-block px-5 py-2.5 rounded-full border border-white/20 text-white text-sm font-medium hover:bg-white/10 transition-all duration-200"
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
