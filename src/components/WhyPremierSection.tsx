"use client";

import { Target, Zap, Users } from "lucide-react";
import { cn } from "@/lib/utils";
import { AnimateIn } from "@/components/AnimateIn";
import { useI18n } from "@/hooks/useI18n";

export function WhyPremierSection() {
  const { tt } = useI18n();

  const features = [
    { id: "personalization", icon: Target, title: tt("whyFeature1Title"), description: tt("whyFeature1Desc") },
    { id: "real-opportunities", icon: Zap, title: tt("whyFeature2Title"), description: tt("whyFeature2Desc") },
    { id: "ai-mentors", icon: Users, title: tt("whyFeature3Title"), description: tt("whyFeature3Desc") },
  ] as const;

  const stats = [
    { value: "8–11", label: tt("statGradesLabel"), className: "bg-white text-black" },
    { value: "AI", label: tt("statAiMentorLabel"), className: "bg-[#5400e9] text-white" },
    { value: "500+", label: tt("statOppsShortLabel"), className: "bg-[#e4e7f2] text-black" },
    { value: "0 ₸", label: tt("statFreeAccessLabel"), className: "bg-[#5400e9] text-white" },
  ] as const;

  return (
    <section
      className="bg-black py-20 lg:py-32 px-6"
      aria-label="Why Mentoria Hub"
    >
      <div className="max-w-6xl mx-auto">
        {/* Heading */}
        <h2 className="text-3xl lg:text-4xl text-white text-center max-w-4xl mx-auto leading-tight mb-16">
          {tt("whyHeading")}
        </h2>

        {/* Feature rows — staggered entrance */}
        <div className="mb-16">
          {features.map(({ id, icon: Icon, title, description }, idx) => (
            <AnimateIn key={id} direction="up" delay={idx * 100}>
              <div className="flex flex-col lg:flex-row items-start gap-4 py-8 border-b border-white/10">
                <div className="shrink-0 w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center">
                  <Icon className="w-5 h-5 text-[#5400e9]" />
                </div>
                <div className="flex flex-col lg:flex-row lg:items-start gap-2 lg:gap-8">
                  <p className="text-xl font-medium text-white whitespace-nowrap min-w-[280px]">
                    {title}
                  </p>
                  <p className="text-base text-white/70 leading-relaxed">
                    {description}
                  </p>
                </div>
              </div>
            </AnimateIn>
          ))}
        </div>

        {/* Vision card */}
        <div className="bg-[#0a0a0a] rounded-3xl border border-white/10 overflow-hidden mb-20">
          <div className="flex flex-col lg:flex-row">
            {/* Decorative left panel */}
            <div className="w-full lg:w-1/2 min-h-[280px] lg:min-h-[360px] bg-gradient-to-br from-[#5941ff]/30 via-[#5400e9]/20 to-transparent flex items-center justify-center">
              <div className="text-center px-8">
                <div className="text-7xl mb-4">🚀</div>
                <p className="text-white/60 text-base leading-relaxed max-w-xs">
                  {tt("visionDecorative")}
                </p>
              </div>
            </div>

            {/* Content */}
            <div className="flex-1 p-8 lg:p-12 flex flex-col justify-center gap-6">
              <h3 className="text-3xl text-white font-normal leading-snug">
                {tt("visionTitle")}
              </h3>
              <p className="text-base text-white/60 leading-relaxed">
                {tt("visionText1")}
              </p>
              <p className="text-base text-white/60 leading-relaxed">
                {tt("visionText2")}
              </p>
              <div>
                <a
                  href="/onboarding"
                  className="rounded-full bg-[#5400e9] text-white px-6 py-3 text-sm font-semibold hover:opacity-90 transition-opacity inline-block"
                >
                  {tt("generateRoadmap")}
                </a>
              </div>
            </div>
          </div>
        </div>

        {/* Stats grid */}
        <div className="relative">
          {/* Decorative background text */}
          <div
            className="pointer-events-none select-none absolute inset-0 flex items-center justify-center overflow-hidden"
            aria-hidden="true"
          >
            <span className="text-[180px] lg:text-[260px] font-bold text-[#111111] leading-none tracking-tighter whitespace-nowrap">
              #рост每天
            </span>
          </div>

          <div className="relative z-10 grid grid-cols-2 gap-4 max-w-2xl mx-auto">
            {stats.map(({ value, label, className }) => (
              <div
                key={label}
                className={cn(
                  "rounded-2xl p-6 flex flex-col items-start gap-1",
                  className
                )}
              >
                <span className="text-4xl lg:text-5xl font-bold leading-none">
                  {value}
                </span>
                <span className="text-sm font-medium opacity-70">{label}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
