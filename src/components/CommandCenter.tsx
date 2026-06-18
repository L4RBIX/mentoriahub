"use client";

import Link from "next/link";
import { useI18n } from "@/hooks/useI18n";
import { MentoriaProductMockup } from "@/components/MentoriaProductMockup";

export function CommandCenter() {
  const { tt } = useI18n();

  return (
    <section
      className="bg-black py-20 lg:py-32 px-6"
      aria-label="AI-наставник Настав"
    >
      <div className="max-w-6xl mx-auto flex flex-col lg:flex-row items-center gap-12 lg:gap-16">
        {/* Text */}
        <div className="flex-1 text-center lg:text-left">
          <p className="text-sm font-medium text-white/40 tracking-widest uppercase mb-6">
            {tt("commandLabel")}
          </p>
          <h2 className="text-4xl lg:text-5xl font-normal text-white leading-tight mb-6">
            {tt("commandTitle")}
          </h2>
          <p className="text-base lg:text-lg text-white/60 leading-relaxed max-w-xl lg:max-w-none">
            {tt("commandText")}
          </p>
          <div className="mt-8">
            <Link
              href="/roadmap"
              className="inline-flex items-center gap-2 bg-[#5400e9] text-white rounded-full px-6 py-3 text-base font-medium hover:bg-[#4500c4] transition-colors"
            >
              {tt("generateRoadmap")}
              <span aria-hidden="true">→</span>
            </Link>
          </div>
        </div>

        {/* Nastav / roadmap product preview */}
        <div className="flex-1 w-full flex justify-center">
          <MentoriaProductMockup
            variant="roadmap"
            className="w-full max-w-lg aspect-[8/5]"
          />
        </div>
      </div>
    </section>
  );
}
