"use client";

import Link from "next/link";
import { cn } from "@/lib/utils";
import { ArrowUpRightIcon } from "@/components/icons";
import { BrandLogo } from "@/components/BrandLogo";
import { useI18n } from "@/hooks/useI18n";

const navColumns = [
  {
    headingKey: "footerPlatform",
    links: [
      { labelKey: "opportunities", href: "/opportunities" },
      { labelKey: "courses", href: "/courses" },
      { labelKey: "roadmap", href: "/roadmap" },
      { labelKey: "calendar", href: "/calendar" },
      { labelKey: "dashboard", href: "/dashboard" },
    ],
  },
  {
    headingKey: "footerAudience",
    links: [
      { labelKey: "footerStudents", href: "#" },
      { labelKey: "footerMentors", href: "/mentor" },
      { labelKey: "schools", href: "#" },
      { labelKey: "footerAdmins", href: "/admin" },
    ],
  },
  {
    headingKey: "footerGrowth",
    links: [
      { labelKey: "leaderboard", href: "/leaderboard" },
      { labelKey: "certificates", href: "/certificates" },
      { labelKey: "nastav", href: "/roadmap" },
      { labelKey: "admin", href: "/admin" },
    ],
  },
];

export function Footer() {
  const { tt } = useI18n();

  return (
    <footer className="bg-black pb-8 pt-14 relative overflow-hidden">
      <div className="max-w-7xl mx-auto px-4">
        {/* Top row: logo + tagline */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex flex-col gap-1.5">
            <BrandLogo size="sm" variant="dark" />
            <p className="text-[10px] text-white/38 tracking-wide">{tt("footerTagline")}</p>
          </div>

          {/* Social links as text */}
          <div className="hidden sm:flex items-center gap-4">
            <a
              href="#"
              className="text-sm text-white/50 hover:text-white transition-colors"
            >
              Telegram
            </a>
            <a
              href="#"
              className="text-sm text-white/50 hover:text-white transition-colors"
            >
              Instagram
            </a>
          </div>
        </div>

        {/* Contact row */}
        <div className="flex flex-wrap gap-8 mb-8">
          <div className="flex flex-col gap-1">
            <span className="text-xs text-white/50 uppercase tracking-wider">
              {tt("footerContact")}
            </span>
            <a
              href="mailto:hello@mentoria.kz"
              className="text-sm text-white/70 hover:text-white transition-colors"
            >
              hello@mentoria.kz
            </a>
          </div>
          <div className="flex flex-col gap-1">
            <span className="text-xs text-white/50 uppercase tracking-wider">
              {tt("footerSupport")}
            </span>
            <a
              href="#"
              className="text-sm text-white/70 hover:text-white transition-colors"
            >
              {tt("footerBot")}
            </a>
          </div>
        </div>

        {/* Divider */}
        <div className="border-t border-white/10 my-8" />

        {/* Bottom section: 3-col nav + CTA card */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8">
          {/* Nav columns */}
          {navColumns.map((col) => (
            <div key={col.headingKey} className="flex flex-col">
              <p className={cn("text-xs text-white/50 uppercase tracking-wider mb-4")}>
                {tt(col.headingKey)}
              </p>
              {col.links.map((link) => (
                <Link
                  key={link.labelKey}
                  href={link.href}
                  className="text-sm text-white/70 hover:text-white transition-colors block mb-2"
                >
                  {tt(link.labelKey)}
                </Link>
              ))}
            </div>
          ))}

          {/* CTA card */}
          <div className="col-span-2 md:col-span-3 lg:col-span-1">
            <div className="bg-[#0a0a0a] rounded-2xl border border-white/10 p-6 flex flex-col gap-4 max-w-xs">
              <div className="flex items-center justify-center h-20 w-full rounded-xl bg-gradient-to-br from-[#5941ff]/30 to-[#5400e9]/10">
                <span className="text-4xl">🚀</span>
              </div>
              <p className="text-2xl text-white font-medium leading-tight">
                {tt("footerCta")}
              </p>
              <Link
                href="/onboarding"
                className="bg-[#5400e9] text-white rounded-full px-5 py-2.5 text-sm inline-flex items-center gap-2 hover:bg-[#5400e9]/90 transition-colors self-start"
              >
                {tt("startFree")}
                <ArrowUpRightIcon className="size-4" />
              </Link>
            </div>
          </div>
        </div>

        {/* Copyright */}
        <div className="border-t border-white/10 mt-12 pt-6 text-center">
          <p className="text-sm text-white/30">
            {tt("footerCopyright")}
          </p>
        </div>
      </div>
    </footer>
  );
}
