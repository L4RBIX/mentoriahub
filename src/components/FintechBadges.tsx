"use client";

import { cn } from "@/lib/utils";
import { AnimateIn } from "@/components/AnimateIn";
import { useI18n } from "@/hooks/useI18n";

export function FintechBadges({ className }: { className?: string }) {
  const { tt } = useI18n();

  const stats: { value: string; label: string }[] = [
    { value: "500+", label: tt("statOppsInCatalog") },
    { value: "3", label: tt("statAuthorCourses") },
    { value: "AI", label: tt("statNastavMentor") },
    { value: "📱", label: tt("statTelegramReminders") },
  ];

  const allStats = [...stats, ...stats];

  return (
    <section className={cn("fintech-badges bg-black py-20 overflow-hidden", className)}>
      <AnimateIn className="mb-10 text-center">
        <h2 className="text-4xl font-normal text-white">
          {tt("growthEverythingNeeded")}
        </h2>
      </AnimateIn>

      {/* Infinite marquee strip */}
      <div className="relative w-full overflow-hidden">
        {/* Left/right fade masks */}
        <div className="pointer-events-none absolute left-0 top-0 z-10 h-full w-24 bg-gradient-to-r from-black to-transparent" />
        <div className="pointer-events-none absolute right-0 top-0 z-10 h-full w-24 bg-gradient-to-l from-black to-transparent" />

        <div className="animate-marquee flex gap-14 w-max">
          {allStats.map((stat, i) => (
            <div
              key={i}
              className="flex-shrink-0 flex flex-col items-center justify-center bg-white/5 border border-white/10 rounded-2xl px-8 py-5 min-w-[160px] hover:bg-white/10 transition-colors"
            >
              <span className="text-3xl font-bold text-white">{stat.value}</span>
              <span className="text-sm text-white/60 mt-1 text-center leading-snug">
                {stat.label}
              </span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
