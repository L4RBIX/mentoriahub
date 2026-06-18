'use client';

import {
  Sparkles,
  Map,
  Search,
  BookOpen,
  Bell,
  BarChart3,
  ArrowRight,
} from "lucide-react";
import { type LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { AnimateIn } from "@/components/AnimateIn";
import { useI18n } from "@/hooks/useI18n";

interface Feature {
  id: string;
  icon: LucideIcon;
  title: string;
  description: string;
}

function FeatureCard({ feature }: { feature: Feature }) {
  const Icon = feature.icon;
  return (
    <div className="flex flex-col gap-3">
      <Icon className="w-8 h-8 text-white stroke-[1.5]" />
      <h3 className="text-xl font-medium text-white leading-snug">
        {feature.title}
      </h3>
      <div className="w-12 h-px bg-[#5941ff]" />
      <p className="text-base text-white/70 leading-relaxed">
        {feature.description}
      </p>
    </div>
  );
}

export function FeaturesGrid({ className }: { className?: string }) {
  const { tt } = useI18n();

  const features: Feature[] = [
    { id: 'nastav', icon: Sparkles, title: tt('featureNastavTitle'), description: tt('featureNastavText') },
    { id: 'roadmap', icon: Map, title: tt('featureRoadmapTitle'), description: tt('featureRoadmapText') },
    { id: 'catalog', icon: Search, title: tt('featureCatalogTitle'), description: tt('featureCatalogText') },
    { id: 'courses', icon: BookOpen, title: tt('featureCoursesTitle'), description: tt('featureCoursesText') },
    { id: 'telegram', icon: Bell, title: tt('featureTelegramTitle'), description: tt('featureTelegramText') },
    { id: 'dashboard', icon: BarChart3, title: tt('featureDashboardTitle'), description: tt('featureDashboardText') },
  ];

  return (
    <section className={cn("bg-black py-20", className)}>
      <div className="container mx-auto px-4 lg:px-8">
        {/* Header row */}
        <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-6 mb-4">
          <div className="flex flex-col gap-6">
            {/* Pill label */}
            <span className="border border-white/30 rounded-full px-4 py-1 text-sm text-white/70 w-fit">
              {tt('featuresLabel')}
            </span>
            <h2 className="text-5xl font-normal text-white max-w-2xl leading-tight">
              {tt('featuresTitle')}
            </h2>
          </div>
          {/* CTA button — visible on desktop, aligned top-right */}
          <div className="hidden lg:flex items-start pt-2">
            <a
              href="/onboarding"
              className="bg-[#5400e9] text-white rounded-full px-6 py-3 inline-flex items-center gap-3 hover:bg-[#4500c4] transition-colors whitespace-nowrap"
            >
              {tt('startFree')}
              <ArrowRight className="w-4 h-4" />
            </a>
          </div>
        </div>

        {/* Feature cards grid — staggered entrance */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mt-16">
          {features.map((feature, i) => (
            <AnimateIn key={feature.id} direction="up" delay={i * 80}>
              <FeatureCard feature={feature} />
            </AnimateIn>
          ))}
        </div>

        {/* CTA button — visible on mobile */}
        <div className="flex lg:hidden mt-10">
          <a
            href="/onboarding"
            className="bg-[#5400e9] text-white rounded-full px-6 py-3 inline-flex items-center gap-3 hover:bg-[#4500c4] transition-colors"
          >
            {tt('startFree')}
            <ArrowRight className="w-4 h-4" />
          </a>
        </div>
      </div>
    </section>
  );
}
