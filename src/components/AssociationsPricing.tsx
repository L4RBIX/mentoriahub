"use client";

import { cn } from "@/lib/utils";
import Link from "next/link";
import { useI18n } from "@/hooks/useI18n";

interface PricingCardProps {
  title: string;
  price: string;
  priceNote: string;
  features: string[];
  ctaLabel: string;
  ctaHref: string;
  highlighted?: boolean;
  badge?: string;
}

function PricingCard({
  title,
  price,
  priceNote,
  features,
  ctaLabel,
  ctaHref,
  highlighted = false,
  badge,
}: PricingCardProps) {
  return (
    <div
      className={cn(
        "rounded-3xl p-8 flex flex-col gap-6 bg-white",
        highlighted
          ? "border-2 border-[#5400e9] scale-105 shadow-xl z-10"
          : "border border-black/10"
      )}
    >
      {badge && (
        <span className="self-start bg-black text-white rounded-full px-3 py-1 text-xs font-medium tracking-wide">
          {badge}
        </span>
      )}

      <div>
        <p className="text-sm font-medium text-black/50 uppercase tracking-widest mb-1">
          {title}
        </p>
        <div className="flex items-end gap-1">
          <span className="text-5xl font-bold text-black">{price}</span>
          <span className="text-sm text-black/50 mb-2">{priceNote}</span>
        </div>
      </div>

      <div className="border-t border-black/10 pt-6 flex flex-col gap-3">
        {features.map((f) => (
          <div key={f} className="flex items-start gap-2">
            <span className="text-[#5941ff] font-bold mt-0.5 flex-shrink-0">✓</span>
            <p className="text-sm text-black/70">{f}</p>
          </div>
        ))}
      </div>

      <Link
        href={ctaHref}
        className={cn(
          "mt-auto rounded-full px-6 py-3 text-sm font-semibold transition-opacity hover:opacity-90 text-center",
          "bg-[#5400e9] text-white"
        )}
      >
        {ctaLabel}
      </Link>
    </div>
  );
}

export function AssociationsPricing() {
  const { tt } = useI18n();

  return (
    <section
      className="relative bg-[#e4e7f2] overflow-hidden"
      aria-label="Plans and pricing"
    >
      {/* Decorative gradient blobs */}
      <div className="pointer-events-none absolute left-0 top-1/4 -translate-x-1/2 z-0 w-64 h-64 rounded-full bg-[#5941ff]/10 blur-3xl" />
      <div className="pointer-events-none absolute right-0 bottom-1/4 translate-x-1/2 z-0 w-64 h-64 rounded-full bg-[#5400e9]/10 blur-3xl" />

      {/* Part A: Partners */}
      <div className="relative z-10 px-6 pt-24 pb-16 max-w-6xl mx-auto">
        <p className="text-center text-sm font-medium text-black/50 tracking-widest uppercase mb-4">
          {tt("partnersKicker")}
        </p>
        <h2 className="text-5xl font-normal text-black text-center mb-10">
          {tt("partnersHeading")}
        </h2>
        <div className="flex flex-wrap justify-center gap-4 mt-10">
          {["Nazarbayev University", "British Council", "Junior Achievement KZ", "Google CS First", "KAZMUN", "MIT OpenCourseWare"].map((name) => (
            <div
              key={name}
              className="px-5 py-3 rounded-xl bg-white border border-black/10 text-sm font-medium text-black/70 hover:border-[#5941ff]/40 transition-colors"
            >
              {name}
            </div>
          ))}
        </div>
      </div>

      {/* Divider */}
      <div className="relative z-10 max-w-6xl mx-auto px-6">
        <hr className="border-black/10" />
      </div>

      {/* Part B: Pricing */}
      <div className="relative z-10 px-6 pt-16 pb-24 max-w-6xl mx-auto">
        <p className="text-center text-sm font-medium text-black/50 tracking-widest uppercase mb-4">
          {tt("pricingKicker")}
        </p>
        <h2 className="text-5xl font-normal text-black text-center mb-4">
          {tt("pricingHeading")}
        </h2>
        <p className="text-center text-black/60 max-w-2xl mx-auto mb-12 text-base leading-relaxed">
          {tt("pricingSubtitle")}
        </p>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 max-w-3xl mx-auto items-center">
          <PricingCard
            title={tt("planFreeTitle")}
            price="0 ₸"
            priceNote={tt("planFreePriceNote")}
            features={[
              tt("planFreeFeature1"),
              tt("planFreeFeature2"),
              tt("planFreeFeature3"),
              tt("planFreeFeature4"),
            ]}
            ctaLabel={tt("startFree")}
            ctaHref="/onboarding"
          />
          <PricingCard
            title={tt("planPremiumTitle")}
            price={tt("planPremiumPrice")}
            priceNote={tt("planPremiumPriceNote")}
            features={[
              tt("planPremiumFeature1"),
              tt("planPremiumFeature2"),
              tt("planPremiumFeature3"),
              tt("planPremiumFeature4"),
            ]}
            ctaLabel={tt("planPremiumCta")}
            ctaHref="#"
            highlighted
            badge={tt("planPremiumPrice")}
          />
        </div>
      </div>
    </section>
  );
}
