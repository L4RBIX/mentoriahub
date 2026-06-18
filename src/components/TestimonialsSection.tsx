"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";
import { useI18n } from "@/hooks/useI18n";

interface Testimonial {
  id: number;
  name: string;
  grade: number;
  city: string;
  quoteKey: string;
  initials: string;
}

const testimonials: Testimonial[] = [
  { id: 1, name: "Айгерим", grade: 11, city: "Алматы", quoteKey: "testimonial1Quote", initials: "А" },
  { id: 2, name: "Данияр", grade: 10, city: "Астана", quoteKey: "testimonial2Quote", initials: "Д" },
  { id: 3, name: "Зарина", grade: 9, city: "Шымкент", quoteKey: "testimonial3Quote", initials: "З" },
];

function TestimonialCard({ testimonial, gradeLabel, quote }: { testimonial: Testimonial; gradeLabel: string; quote: string }) {
  return (
    <div className="bg-[#0a0a0a] rounded-2xl overflow-hidden border border-white/10 flex-shrink-0 w-full flex flex-col">
      {/* Avatar area */}
      <div className="relative w-full aspect-video bg-gradient-to-br from-[#5941ff]/30 to-[#5400e9]/10 flex items-center justify-center">
        <div className="w-20 h-20 rounded-full bg-[#5941ff] flex items-center justify-center">
          <span className="text-3xl font-bold text-white">{testimonial.initials}</span>
        </div>
      </div>

      {/* Content */}
      <div className="p-5 flex flex-col flex-1">
        <p className="text-xl font-medium text-white">{testimonial.name}</p>
        <p className="text-sm text-white/60 mt-1">
          {gradeLabel}
          <span className="mx-2 text-white/30">·</span>
          {testimonial.city}
        </p>
        <div className="w-12 h-px bg-[#5941ff] my-3" />
        <p className="text-lg text-white/90 italic leading-snug flex-1">
          &ldquo;{quote}&rdquo;
        </p>
      </div>
    </div>
  );
}

export function TestimonialsSection() {
  const { tt, language } = useI18n();
  const [currentIndex, setCurrentIndex] = useState(0);
  const visibleCount = 3;
  const maxIndex = Math.max(0, testimonials.length - visibleCount);

  const gradeLabel = (g: number) =>
    language === "en" ? `Grade ${g}` : language === "kz" ? `${g} сынып` : `${g} класс`;

  const handlePrev = () => {
    setCurrentIndex((prev) => Math.max(prev - 1, 0));
  };

  const handleNext = () => {
    setCurrentIndex((prev) => Math.min(prev + 1, maxIndex));
  };

  const stats = [
    { value: "500+", label: tt("testimonialStatOppsLabel"), color: "bg-white text-black" },
    { value: "AI", label: tt("testimonialStatNastavLabel"), color: "bg-[#5400e9] text-white" },
    { value: "0 ₸", label: tt("testimonialStatFreeLabel"), color: "bg-[#e4e7f2] text-black" },
  ];

  return (
    <section className="bg-black py-20 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex flex-col items-center text-center mb-12 gap-4">
          <span className="text-sm text-white/60 border border-white/20 rounded-full px-4 py-1.5 font-mono">
            {tt("testimonialsKicker")}
          </span>
          <h2 className="text-5xl font-normal text-white max-w-2xl">
            {tt("testimonialsHeading")}
          </h2>
          <a
            href="/onboarding"
            className="bg-[#5400e9] text-white rounded-full px-6 py-3 inline-flex items-center gap-3 hover:bg-[#5400e9]/90 transition-colors mt-2 text-sm font-medium"
          >
            {tt("testimonialsCta")}
            <svg viewBox="0 0 20 20" fill="currentColor" className="size-4">
              <path fillRule="evenodd" d="M5.22 14.78a.75.75 0 0 0 1.06 0l7.22-7.22v5.69a.75.75 0 0 0 1.5 0v-7.5a.75.75 0 0 0-.75-.75h-7.5a.75.75 0 0 0 0 1.5h5.69L5.22 13.72a.75.75 0 0 0 0 1.06z" clipRule="evenodd" />
            </svg>
          </a>
        </div>

        {/* Slider */}
        <div className="relative">
          <div className="overflow-hidden">
            <div
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 transition-transform duration-300"
              style={{ transform: `translateX(-${currentIndex * (100 / visibleCount)}%)` }}
            >
              {testimonials.map((t) => (
                <TestimonialCard key={t.id} testimonial={t} gradeLabel={gradeLabel(t.grade)} quote={tt(t.quoteKey)} />
              ))}
            </div>
          </div>

          {/* Prev / Next */}
          <div className="flex items-center gap-3 mt-8 justify-center lg:justify-end">
            <button
              onClick={handlePrev}
              disabled={currentIndex === 0}
              className={cn(
                "bg-white/10 rounded-xl p-3 hover:bg-white/20 transition-colors",
                currentIndex === 0 && "opacity-40 cursor-not-allowed"
              )}
              aria-label="Previous testimonial"
            >
              <svg viewBox="0 0 20 20" fill="currentColor" className="size-5 text-white rotate-180">
                <path fillRule="evenodd" d="M8.661 10 3.369 4.708l1.414-1.414L11.489 10l-6.706 6.706-1.414-1.414z" clipRule="evenodd" />
              </svg>
            </button>
            <button
              onClick={handleNext}
              disabled={currentIndex >= maxIndex}
              className={cn(
                "bg-white/10 rounded-xl p-3 hover:bg-white/20 transition-colors",
                currentIndex >= maxIndex && "opacity-40 cursor-not-allowed"
              )}
              aria-label="Next testimonial"
            >
              <svg viewBox="0 0 20 20" fill="currentColor" className="size-5 text-white">
                <path fillRule="evenodd" d="M8.661 10 3.369 4.708l1.414-1.414L11.489 10l-6.706 6.706-1.414-1.414z" clipRule="evenodd" />
              </svg>
            </button>
          </div>
        </div>

        {/* Stats row */}
        <div className="mt-16 grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
          {stats.map(({ value, label, color }) => (
            <div
              key={label}
              className={cn("rounded-2xl border border-white/10 p-8 text-center flex flex-col items-center gap-2", color)}
            >
              <div className="flex gap-0.5 text-[#5941ff] text-xl">
                {Array.from({ length: 5 }).map((_, i) => (
                  <span key={i}>★</span>
                ))}
              </div>
              <p className="text-5xl font-bold mt-2">{value}</p>
              <p className="text-sm opacity-60">{label}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
