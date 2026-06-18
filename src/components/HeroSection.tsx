"use client";
/* eslint-disable react-hooks/set-state-in-effect */
import Image from "next/image";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { ArrowUpRightIcon } from "@/components/icons";
import { BrandLogo } from "@/components/BrandLogo";
import { HeroScreenCycler } from "@/components/MentoriaProductMockup";
import { t } from "@/lib/i18n";
import { storage } from "@/lib/storage";
import type { AppLanguage } from "@/types/mentoria";

export function HeroSection() {
  const [language, setLanguage] = useState<AppLanguage>("ru");
  const macbookWrapperRef = useRef<HTMLDivElement>(null);
  const videoLayerRef = useRef<HTMLDivElement>(null);
  const textRef = useRef<HTMLDivElement>(null);
  const macbookRef = useRef<HTMLDivElement>(null);
  const gradientRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleLanguage = (event: Event) => {
      setLanguage((event as CustomEvent<AppLanguage>).detail);
    };
    setLanguage(storage.getLanguage());
    window.addEventListener("mentoria-language-change", handleLanguage);

    if (!window.matchMedia("(min-width: 1024px)").matches) {
      return () => window.removeEventListener("mentoria-language-change", handleLanguage);
    }

    const macbookWrapper = macbookWrapperRef.current;
    const videoLayer = videoLayerRef.current;
    const text = textRef.current;
    const macbook = macbookRef.current;
    const gradient = gradientRef.current;
    if (!macbookWrapper || !videoLayer || !text || !macbook || !gradient) {
      return () => window.removeEventListener("mentoria-language-change", handleLanguage);
    }

    // — Initial state (matches original's JS-applied inline styles at scroll=0) —
    const applyClip = (top: number, side: number, bottom: number, radius: number) => {
      const clip = `inset(${top}px ${side}px ${bottom}px round ${radius}px)`;
      macbookWrapper.style.clipPath = clip;
      videoLayer.style.clipPath = clip;
    };

    applyClip(92, 47, 34, 24);
    macbookWrapper.style.paddingInline = "47px";
    macbook.style.willChange = "transform";
    macbook.style.transform = "translateY(60vh)";
    gradient.style.opacity = "0";

    // Text stays at translateY(10vh) permanently (matches original DOM at scroll=0)
    text.style.willChange = "transform";
    text.style.opacity = "1";
    text.style.transform = "translateY(10vh)";

    // — Scroll-driven animations —
    const onScroll = () => {
      const scrollY = window.scrollY;
      const vh = window.innerHeight;
      const p = Math.min(scrollY / (vh * 0.8), 1); // 0→1 over first 80% of viewport scroll

      // MacBook rises
      macbook.style.transform = `translateY(${60 * (1 - p)}vh)`;

      // Clip-path frame opens (insets shrink to 0)
      applyClip(
        Math.round(92 * (1 - p)),
        Math.round(47 * (1 - p)),
        Math.round(34 * (1 - p)),
        Math.round(24 * (1 - p)),
      );
      macbookWrapper.style.paddingInline = `${Math.round(47 * (1 - p))}px`;

      // Gradient fades in as MacBook rises
      gradient.style.opacity = String(p);
    };

    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("mentoria-language-change", handleLanguage);
    };
  }, []);

  return (
    <div className="mentoria-hero hero-dark-surface w-full select-none lg:h-[300lvh]">
      <section className="relative flex min-h-[100svh] flex-col items-center justify-start overflow-hidden bg-black px-5 pb-10 pt-24 text-white lg:hidden">
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute left-1/2 top-8 h-64 w-64 -translate-x-1/2 rounded-full bg-[#5400e9]/22 blur-3xl" />
          <div className="absolute inset-x-0 bottom-0 h-2/5 bg-gradient-to-t from-[#170036] via-black/70 to-transparent" />
        </div>

        <div className="relative z-10 flex w-full max-w-[360px] flex-col items-center text-center">
          <BrandLogo size="sm" showText={false} variant="dark" />

          <p className="mt-4 max-w-[320px] text-sm font-normal leading-6 text-white/78">
            {t(language, "heroKicker")}
          </p>

          <h1 className="mt-3 max-w-[360px] text-center text-[clamp(40px,11vw,52px)] font-normal leading-[0.98] tracking-normal text-white">
            {t(language, "heroTitle")}
          </h1>

          <p className="mt-4 max-w-[320px] text-center text-sm font-light leading-6 text-white/72">
            {t(language, "heroSubtitle")}
          </p>

          <Link
            href="/onboarding"
            className="mt-6 inline-flex items-center gap-0 rounded-full bg-[#5400e9] text-white transition-opacity hover:opacity-90"
          >
            <span className="py-3 pl-6 pr-3 text-sm font-medium">
              {t(language, "startFree")}
            </span>
            <span className="mr-1.5 rounded-full bg-white p-2">
              <ArrowUpRightIcon className="h-4 w-4 text-[#5400e9]" />
            </span>
          </Link>
        </div>

        <div className="relative z-10 mt-8 w-[112%] max-w-[520px] shrink-0">
          <div className="relative aspect-[5/3] w-full">
            <HeroScreenCycler className="absolute left-1/2 top-[3%] bottom-[13%] z-10 w-4/5 -translate-x-1/2 overflow-hidden" />
            <Image
              src="/images/macbook-mock.0u.q-f025el5l.png"
              alt="Mentoria Hub dashboard on MacBook"
              fill
              priority
              sizes="(max-width: 767px) 112vw, 520px"
              className="object-contain"
            />
          </div>
        </div>
      </section>

      <div
        className="sticky top-0 hidden overflow-hidden transition-[height] duration-500 lg:block"
        style={{ height: "100lvh" }}
      >
        {/* Layer 0 — base fill: shows through the clip-path corners as the "white frame" */}
        <div className="absolute inset-x-0 bottom-px top-0 bg-[#e4e7f2]" />

        {/* Layer 1 (z=10) — MacBook frame + dashboard video; clip-path applied by JS */}
        <div
          ref={macbookWrapperRef}
          className="pointer-events-none absolute inset-0 z-10 grid place-items-center"
        >
          <div
            ref={macbookRef}
            className="relative me-[2.6%]"
            style={{ height: "min(86lvh, calc(90vw * 3 / 5))", aspectRatio: "5 / 3" }}
          >
            <HeroScreenCycler className="absolute left-1/2 -translate-x-1/2 top-[3%] bottom-[13%] w-4/5 overflow-hidden" />
            <Image
              src="/images/macbook-mock.0u.q-f025el5l.png"
              alt="Mentoria Hub dashboard on MacBook"
              fill
              priority
              className="object-contain"
            />
          </div>
        </div>

        {/* Layer 2 — looping background video; same clip-path applied by JS */}
        <div
          ref={videoLayerRef}
          className="absolute inset-0 grid place-items-center bg-black"
        >
          <div className="relative size-full">
            <video
              src="/videos/loop_optimized.mp4"
              autoPlay
              loop
              muted
              playsInline
              className="absolute inset-0 size-full object-contain brightness-75"
            />
          </div>
        </div>

        {/* Layer 3 — bottom-to-top gradient; fades in as MacBook rises */}
        <div
          ref={gradientRef}
          className="absolute inset-0 bg-gradient-to-t from-black via-black/45 to-black/25"
        />

        {/* Layer 4 — text; slides in on mount, scroll-independent */}
        <div
          ref={textRef}
          className="absolute top-20 flex h-auto w-full flex-col items-center text-white"
        >
          <span className="flex items-center gap-2">
            <BrandLogo size="sm" showText={false} variant="dark" />
          </span>

          <p className="mt-4 text-base font-normal lg:text-lg">
            {t(language, "heroKicker")}
          </p>

          <h1 className="relative mt-2 max-w-5xl px-8 text-center text-[40px] font-normal leading-10 lg:mt-4 lg:text-[64px] lg:leading-[1.1]">
            {t(language, "heroTitle")}
          </h1>

          <p className="mt-4 max-w-2xl px-8 text-center text-sm font-light text-white/80 lg:text-lg">
            {t(language, "heroSubtitle")}
          </p>

          <div className="mt-8">
            <Link
              href="/onboarding"
              className="inline-flex items-center gap-0 rounded-full bg-[#5400e9] text-white transition-opacity hover:opacity-90"
            >
              <span className="py-3 pl-6 pr-3 text-base font-medium">
                {t(language, "startFree")}
              </span>
              <span className="mr-1.5 rounded-full bg-white p-2">
                <ArrowUpRightIcon className="h-4 w-4 text-[#5400e9]" />
              </span>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
