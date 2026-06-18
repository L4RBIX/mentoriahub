'use client';

import Link from "next/link";
import { cn } from "@/lib/utils";
import { ArrowUpRightIcon } from "@/components/icons";
import { AnimateIn } from "@/components/AnimateIn";
import { useI18n } from "@/hooks/useI18n";

export function CTASection() {
  const { tt } = useI18n();

  return (
    <section className={cn("py-24 md:py-32 px-4 bg-[#e4e7f2]")}>
      <AnimateIn className="max-w-4xl mx-auto flex flex-col items-center text-center gap-6">
        <span className="text-sm text-black/70 border border-black/20 rounded-full px-4 py-1.5 font-mono">
          {tt('ctaKicker')}
        </span>

        <h2
          className="font-normal text-black leading-tight"
          style={{ fontSize: "60px" }}
        >
          {tt('ctaTitle')}
        </h2>

        <p className="text-lg text-black/70 max-w-xl leading-relaxed">
          {tt('ctaText')}
        </p>

        <Link
          href="/onboarding"
          className="bg-[#5400e9] text-white rounded-full px-6 py-3 inline-flex items-center gap-2 hover:bg-[#5400e9]/90 transition-colors mt-2"
        >
          {tt('startFree')}
          <ArrowUpRightIcon className="size-4" />
        </Link>
      </AnimateIn>
    </section>
  );
}
