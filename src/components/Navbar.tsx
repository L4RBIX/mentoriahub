"use client";
/* eslint-disable react-hooks/set-state-in-effect */

import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowUpRightIcon, MenuIcon } from "@/components/icons";
import { BrandLogo } from "@/components/BrandLogo";
import { PlatformControls } from "@/components/PlatformControls";
import { t } from "@/lib/i18n";
import { storage } from "@/lib/storage";
import type { AppLanguage } from "@/types/mentoria";

const navLinks: { key: Parameters<typeof t>[1]; href: string; isAI?: boolean }[] = [
  { key: "opportunities", href: "/opportunities" },
  { key: "courses", href: "/courses" },
  { key: "nastav", href: "/roadmap", isAI: true },
  { key: "calendar", href: "/calendar" },
  { key: "dashboard", href: "/dashboard" },
  { key: "mentor", href: "/mentor" },
];

export function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [language, setLanguage] = useState<AppLanguage>("ru");
  const [mobileOpen, setMobileOpen] = useState(false);
  const [isMobileViewport, setIsMobileViewport] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 80);
    const handleLanguage = (event: Event) => {
      setLanguage((event as CustomEvent<AppLanguage>).detail);
    };
    const mobileQuery = window.matchMedia("(max-width: 1023px)");
    const handleViewport = () => setIsMobileViewport(mobileQuery.matches);

    handleScroll();
    handleViewport();
    setLanguage(storage.getLanguage());

    window.addEventListener("scroll", handleScroll, { passive: true });
    window.addEventListener("mentoria-language-change", handleLanguage);
    mobileQuery.addEventListener("change", handleViewport);
    return () => {
      window.removeEventListener("scroll", handleScroll);
      window.removeEventListener("mentoria-language-change", handleLanguage);
      mobileQuery.removeEventListener("change", handleViewport);
    };
  }, []);

  // All colours are inline styles — completely immune to the .theme-light broad
  // CSS overrides (which use !important on class selectors). Inline styles only
  // lose to !important on the *same element*, which our globals.css never does.
  //
  // Before scroll (≤80px) — navbar floats over the hero's lavender clip-path
  // frame (bg-[#e4e7f2]). Dark text (#1e293b) is readable on that light surface.
  //
  // After scroll — navbar overlays any homepage section. A strong dark-glass pill
  // (82% opaque, blur 18px) provides enough contrast for white text regardless of
  // whether the section beneath is dark or light.
  const topOverDarkHero = isMobileViewport && !scrolled;
  const inkColor  = scrolled || topOverDarkHero ? "rgba(255,255,255,0.88)" : "#1e293b";
  const inkMuted  = scrolled || topOverDarkHero ? "rgba(255,255,255,0.46)" : "rgba(30,41,59,0.50)";

  const pillStyle: React.CSSProperties = scrolled
    ? {
        background:           "rgba(8,8,14,0.82)",
        backdropFilter:       "blur(18px)",
        WebkitBackdropFilter: "blur(18px)",
        border:               "1px solid rgba(255,255,255,0.12)",
        boxShadow:            "0 8px 32px rgba(0,0,0,0.28)",
      }
    : {};

  return (
    <nav className="fixed z-50 w-full transition-all duration-300 ease-linear lg:top-5">
      <div className="container relative mx-auto h-full px-4 lg:px-8">
        <div className="relative flex h-16 items-center justify-between gap-2 lg:h-12 lg:w-full xl:gap-4">

          {/* ── Logo ── */}
          {/* Inline style on the Link sets `color` for the entire subtree via CSS
              cascade. LogoIcon uses fill="currentColor" so it inherits correctly.
              No text-white/text-black class is set, so the broad .theme-light rules
              never fire here. */}
          <Link href="/" className="flex shrink-0 items-center transition-opacity hover:opacity-80">
            <BrandLogo
              size="md"
              variant={scrolled || topOverDarkHero ? "dark" : "light"}
              textColor={inkColor}
              mutedColor={inkMuted}
            />
          </Link>

          {/* ── Desktop nav links pill ── */}
          <div
            className="hidden h-12 items-center rounded-2xl py-2 pr-2 transition-all duration-300 lg:flex lg:gap-2 lg:pl-2"
            style={pillStyle}
          >
            {navLinks.map((link) => (
              <Link
                key={link.key}
                href={link.href}
                className={
                  // hover:bg-white/[0.10] uses the bracket form so the broad
                  // .theme-light [class~="hover:bg-white/10"] rule never matches it.
                  scrolled
                    ? "flex items-center gap-1.5 rounded-lg px-3 py-1 text-sm transition-colors hover:bg-white/[0.10]"
                    : "flex items-center gap-1.5 rounded-lg px-3 py-1 text-sm transition-colors hover:bg-black/[0.06]"
                }
                style={{ color: inkColor }}
              >
                {link.isAI && (
                  <span className="h-1.5 w-1.5 shrink-0 animate-pulse rounded-full bg-[#5941ff]" />
                )}
                {t(language, link.key)}
              </Link>
            ))}

            {/* CTA — only visible when scrolled */}
            <Link
              href="/onboarding"
              className={
                "items-center gap-1.5 rounded-full bg-[#5400e9] px-5 py-2 text-sm font-medium transition-all duration-300 hover:bg-[#4600c5] btn-primary-violet" +
                (scrolled ? " flex" : " hidden")
              }
              style={{ color: "#ffffff" }}
            >
              {t(language, "startFree")}
              <ArrowUpRightIcon className="h-3.5 w-3.5" />
            </Link>
          </div>

          {/* ── Desktop PlatformControls ── */}
          <div className="hidden lg:block">
            <PlatformControls variant="hero" />
          </div>

          {/* ── Mobile hamburger ── */}
          <button
            onClick={() => setMobileOpen((open) => !open)}
            className="cursor-pointer rounded-lg p-2 transition-all duration-300 lg:hidden"
            style={
              scrolled
                ? {
                    color:               "rgba(255,255,255,0.85)",
                    background:          "rgba(8,8,14,0.72)",
                    border:              "1px solid rgba(255,255,255,0.10)",
                    backdropFilter:      "blur(12px)",
                    WebkitBackdropFilter:"blur(12px)",
                  }
                : { color: inkColor }
            }
            aria-label="Toggle navigation"
          >
            <MenuIcon className="h-5 w-5" />
          </button>
        </div>

        {/* ── Mobile menu — always dark glass so it's readable over any section ── */}
        {mobileOpen && (
          <div className="absolute left-4 right-4 top-16 rounded-2xl border border-white/10 bg-black/90 p-3 text-white shadow-2xl backdrop-blur-xl lg:hidden">
            <div className="grid grid-cols-2 gap-2">
              {navLinks.map((link) => (
                <Link
                  key={link.key}
                  href={link.href}
                  onClick={() => setMobileOpen(false)}
                  className="rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm"
                  style={{ color: "rgba(255,255,255,0.75)" }}
                >
                  {t(language, link.key)}
                </Link>
              ))}
              <Link
                href="/leaderboard"
                onClick={() => setMobileOpen(false)}
                className="rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm"
                style={{ color: "rgba(255,255,255,0.75)" }}
              >
                {t(language, "leaderboard")}
              </Link>
              <Link
                href="/certificates"
                onClick={() => setMobileOpen(false)}
                className="rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm"
                style={{ color: "rgba(255,255,255,0.75)" }}
              >
                {t(language, "certificates")}
              </Link>
            </div>
            <div className="mt-3 flex items-center justify-between gap-3">
              <PlatformControls variant="hero" />
              <Link
                href="/onboarding"
                onClick={() => setMobileOpen(false)}
                className="rounded-full bg-[#5400e9] px-4 py-2 text-sm font-medium btn-primary-violet"
                style={{ color: "#ffffff" }}
              >
                {t(language, "startFree")}
              </Link>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}
