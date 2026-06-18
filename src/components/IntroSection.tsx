"use client";

import { ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { AnimateIn } from "@/components/AnimateIn";
import { useI18n } from "@/hooks/useI18n";

export function IntroSection({ className }: { className?: string }) {
  const { tt } = useI18n();

  return (
    <section
      className={cn("dark-surface relative z-10 overflow-hidden", className)}
      style={{
        background:
          "radial-gradient(ellipse at center, #1a0050 0%, #0a0020 50%, #000 100%)",
      }}
    >
      <div className="container mx-auto px-4 lg:px-8 flex flex-col lg:flex-row justify-between gap-8 pb-24 pt-24 text-white lg:items-end">
        <AnimateIn direction="left" className="flex-1 max-w-2xl">
          <h2 className="text-5xl lg:text-6xl font-normal text-white leading-tight">
            {tt("introTitle")}
          </h2>
        </AnimateIn>

        <AnimateIn direction="right" delay={100} className="max-w-md self-end flex flex-col">
          <p className="text-lg text-white/80 leading-relaxed">
            {tt("introText")}
          </p>
          <a
            href="/onboarding"
            className="bg-[#5400e9] text-white rounded-full px-6 py-3 inline-flex items-center gap-3 mt-6 w-fit hover:bg-[#4500c4] transition-colors"
          >
            {tt("startFree")}
            <ArrowRight className="w-4 h-4" />
          </a>
        </AnimateIn>
      </div>
    </section>
  );
}
