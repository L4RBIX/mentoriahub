"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import {
  Bell,
  Bookmark,
  BookOpen,
  CheckCircle2,
  ChevronLeft,
  Circle,
  Clock,
  MessageSquare,
  Play,
  Send,
  Sparkles,
  Trophy,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useI18n } from "@/hooks/useI18n";

// ---------------------------------------------------------------------------
// Preview-only data (Mentoria-realistic, not random SaaS)
// ---------------------------------------------------------------------------

type OppItem = { id: number; title: string; tag: string; deadline: string; saved: boolean };
const PREVIEW_OPPS: OppItem[] = [
  { id: 1, title: "NYAS Junior Academy", tag: "Research", deadline: "15 сент", saved: true },
  { id: 2, title: "Lumiere Research Program", tag: "STEM", deadline: "1 нояб", saved: false },
  { id: 3, title: "IRPrO Science Olympiad", tag: "Olympiad", deadline: "20 окт", saved: false },
];

type StepItem = { step: number; title: string; done?: boolean; active?: boolean };
const PREVIEW_STEPS: StepItem[] = [
  { step: 1, title: "Academic English", done: true },
  { step: 2, title: "CS & Алгоритмы", active: true },
  { step: 3, title: "IRPrO Research" },
  { step: 4, title: "Поступление в вуз" },
];

type LessonItem = { id: number; title: string; done?: boolean; active?: boolean };
const PREVIEW_LESSONS: LessonItem[] = [
  { id: 1, title: "Academic Writing", done: true },
  { id: 2, title: "IELTS Reading Strategies", active: true },
  { id: 3, title: "University Essays" },
  { id: 4, title: "Academic Vocabulary" },
];

// ---------------------------------------------------------------------------
// Tiny shared atoms
// ---------------------------------------------------------------------------

type PillProps = {
  children: React.ReactNode;
  violet?: boolean;
  teal?: boolean;
  className?: string;
};
function Pill({ children, violet, teal, className }: PillProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-medium leading-none whitespace-nowrap",
        violet && "bg-[#5941ff]/20 text-[#7c6fff] border border-[#5941ff]/30",
        teal && "bg-[#0d9488]/20 text-[#2dd4bf] border border-[#0d9488]/30",
        !violet && !teal && "bg-[#14141a] text-[#6f6f7a] border border-[#1c1c24]",
        className,
      )}
    >
      {children}
    </span>
  );
}

type StatCardProps = { icon: React.ElementType; value: string; label: string };
function StatCard({ icon: Icon, value, label }: StatCardProps) {
  return (
    <div className="flex flex-col items-center gap-0.5 bg-[#111116] border border-[#1c1c24] rounded-xl px-3 py-2">
      <Icon className="w-3.5 h-3.5 text-[#5941ff] mb-0.5" />
      <span className="text-sm font-semibold text-[#f0f0f5] leading-none">{value}</span>
      <span className="text-[10px] text-[#6f6f7a] leading-none mt-0.5">{label}</span>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Scene A — Opportunities catalog
// ---------------------------------------------------------------------------

function OpportunitiesScene({ tt }: { tt: (k: string) => string }) {
  return (
    <div className="h-full flex flex-col bg-[#07070a] text-[#f0f0f5] overflow-hidden">
      {/* Topbar */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-[#19191f]">
        <span className="text-xs font-semibold text-[#f0f0f5]">{tt("opportunities")}</span>
        <div className="flex items-center gap-1.5">
          <Pill>10 класс</Pill>
          <Pill violet>STEM</Pill>
        </div>
      </div>

      {/* Search bar */}
      <div className="px-4 pt-3 pb-2">
        <div className="bg-[#111116] border border-[#1c1c24] rounded-lg px-3 py-2 flex items-center gap-2">
          <span className="text-[10px] text-[#525258]">🔍</span>
          <span className="text-[10px] text-[#525258] truncate">
            Олимпиады, стажировки, летние школы...
          </span>
        </div>
      </div>

      {/* Cards */}
      <div className="flex-1 overflow-hidden px-4 flex flex-col gap-2 pb-2">
        {PREVIEW_OPPS.map((opp) => (
          <div
            key={opp.id}
            className="bg-[#111116] border border-[#1b1b22] rounded-2xl p-3 flex items-start justify-between gap-2"
          >
            <div className="min-w-0">
              <p className="text-[11px] font-semibold text-[#f0f0f5] truncate">{opp.title}</p>
              <div className="flex items-center gap-1.5 mt-1.5 flex-wrap">
                <Pill violet>{opp.tag}</Pill>
                <span className="flex items-center gap-1 text-[10px] text-[#676772]">
                  <Clock className="w-2.5 h-2.5" />
                  {opp.deadline}
                </span>
              </div>
            </div>
            <button
              className={cn(
                "flex-shrink-0 flex items-center gap-1 rounded-full px-2 py-1 text-[10px] font-medium border",
                opp.saved
                  ? "bg-[#5941ff]/15 text-[#7c6fff] border-[#5941ff]/25"
                  : "bg-[#111116] text-[#6f6f7a] border-[#1c1c24]",
              )}
            >
              <Bookmark className="w-2.5 h-2.5" />
              {opp.saved ? tt("saved") : tt("save")}
            </button>
          </div>
        ))}
      </div>

      {/* Telegram badge */}
      <div className="px-4 pb-4">
        <div className="bg-[#229ED9]/[0.08] border border-[#229ED9]/20 rounded-xl px-3 py-2 flex items-center gap-2">
          <Send className="w-3 h-3 text-[#229ED9] flex-shrink-0" />
          <span className="text-[10px] text-[#229ED9]">
            {tt("telegramReminder")} — активно
          </span>
        </div>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Scene B — Roadmap / Nastav
// ---------------------------------------------------------------------------

function RoadmapScene({ tt }: { tt: (k: string) => string }) {
  return (
    <div className="h-full flex flex-col bg-[#07070a] text-[#f0f0f5] overflow-hidden">
      {/* Header */}
      <div className="px-4 py-3 border-b border-[#19191f]">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-semibold text-[#f0f0f5]">
            {tt("personalRoadmap") || "Персональный маршрут"}
          </span>
          <Sparkles className="w-3.5 h-3.5 text-[#5941ff]" />
        </div>
        <div className="flex items-center gap-1.5 flex-wrap">
          <Pill>Мадина</Pill>
          <Pill>10 класс</Pill>
          <Pill violet>Цель: MIT</Pill>
        </div>
      </div>

      {/* Steps */}
      <div className="flex-1 overflow-hidden px-4 py-3 flex flex-col gap-2">
        {PREVIEW_STEPS.map((s) => (
          <div
            key={s.step}
            className={cn(
              "flex items-center gap-3 rounded-xl px-3 py-2.5 border",
              s.done
                ? "bg-[#5941ff]/[0.08] border-[#5941ff]/20"
                : s.active
                  ? "bg-[#14141a] border-[#5941ff]/35"
                  : "bg-[#0e0e12] border-[#181820]",
            )}
          >
            {s.done ? (
              <CheckCircle2 className="w-4 h-4 text-[#5941ff] flex-shrink-0" />
            ) : s.active ? (
              <div className="w-4 h-4 rounded-full border-2 border-[#5941ff] flex-shrink-0 flex items-center justify-center">
                <div className="w-1.5 h-1.5 rounded-full bg-[#5941ff]" />
              </div>
            ) : (
              <Circle className="w-4 h-4 text-[#454548] flex-shrink-0" />
            )}
            <span
              className={cn(
                "text-[11px] font-medium flex-1 truncate",
                s.done
                  ? "text-[#808088] line-through"
                  : s.active
                    ? "text-[#f0f0f5]"
                    : "text-[#676772]",
              )}
            >
              {s.title}
            </span>
            {s.active && (
              <span className="text-[10px] text-[#5941ff] font-medium flex-shrink-0">
                В процессе
              </span>
            )}
          </div>
        ))}
      </div>

      {/* Nastav message */}
      <div className="px-4 pb-4">
        <div className="bg-[#111116] border border-[#1c1c24] rounded-2xl p-3">
          <div className="flex items-center gap-1.5 mb-1.5">
            <MessageSquare className="w-3 h-3 text-[#5941ff]" />
            <span className="text-[10px] font-semibold text-[#5941ff]">Настав</span>
          </div>
          <p className="text-[10px] text-[#a3a3a7] leading-relaxed">
            &quot;Начни с академического английского — это база для поступления в международный
            вуз.&quot;
          </p>
        </div>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Scene C — Dashboard
// ---------------------------------------------------------------------------

function DashboardScene({ tt }: { tt: (k: string) => string }) {
  return (
    <div className="h-full flex flex-col bg-[#07070a] text-[#f0f0f5] overflow-hidden">
      {/* Greeting */}
      <div className="px-4 py-3 border-b border-[#19191f]">
        <p className="text-[10px] text-[#6f6f7a]">Добро пожаловать</p>
        <p className="text-sm font-semibold text-[#f0f0f5]">Мадина 👋</p>
      </div>

      {/* Stats */}
      <div className="px-4 pt-3 grid grid-cols-3 gap-2">
        <StatCard icon={Bookmark} value="4" label="Сохранено" />
        <StatCard icon={BookOpen} value="2" label={tt("courses")} />
        <StatCard icon={Trophy} value="3" label="Шага" />
      </div>

      {/* Next lesson */}
      <div className="px-4 pt-3">
        <p className="text-[10px] text-[#6f6f7a] mb-1.5">Следующий урок</p>
        <div className="bg-[#111116] border border-[#1b1b22] rounded-2xl p-3">
          <div className="flex items-start justify-between gap-2 mb-2.5">
            <div>
              <p className="text-[11px] font-semibold text-[#f0f0f5]">Academic English</p>
              <p className="text-[10px] text-[#6f6f7a] mt-0.5">Урок 2 · IELTS Reading</p>
            </div>
            <button className="flex-shrink-0 bg-[#5941ff] rounded-full px-2.5 py-1 text-[10px] text-[#f0f0f5] font-medium">
              {tt("openCourse")}
            </button>
          </div>
          <div className="flex items-center gap-2">
            <div className="flex-1 h-1 bg-[#17171e] rounded-full overflow-hidden">
              <div className="w-[60%] h-full bg-[#5941ff] rounded-full" />
            </div>
            <span className="text-[10px] text-[#6f6f7a] flex-shrink-0">60%</span>
          </div>
        </div>
      </div>

      {/* Deadline */}
      <div className="px-4 pt-3">
        <p className="text-[10px] text-[#6f6f7a] mb-1.5">Ближайший дедлайн</p>
        <div className="bg-[#111116] border border-[#1b1b22] rounded-2xl px-3 py-2 flex items-center justify-between gap-2">
          <div className="min-w-0">
            <p className="text-[11px] font-semibold text-[#f0f0f5] truncate">NYAS Junior Academy</p>
            <p className="text-[10px] text-[#6f6f7a]">До 15 сентября 2026</p>
          </div>
          <Pill teal>Скоро</Pill>
        </div>
      </div>

      {/* Telegram */}
      <div className="px-4 pt-3 pb-4">
        <div className="bg-[#229ED9]/[0.08] border border-[#229ED9]/20 rounded-xl px-3 py-2 flex items-center gap-2">
          <Bell className="w-3 h-3 text-[#229ED9] flex-shrink-0" />
          <span className="text-[10px] text-[#229ED9]">Telegram активен · 2 напоминания</span>
        </div>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Scene D — Course lesson + quiz
// ---------------------------------------------------------------------------

function CoursesScene({ tt }: { tt: (k: string) => string }) {
  void tt;
  return (
    <div className="h-full flex flex-col bg-[#07070a] text-[#f0f0f5] overflow-hidden">
      {/* Header */}
      <div className="flex items-center gap-2 px-4 py-3 border-b border-[#19191f]">
        <ChevronLeft className="w-4 h-4 text-[#676772] flex-shrink-0" />
        <div className="flex-1 min-w-0">
          <p className="text-[11px] font-semibold text-[#f0f0f5] truncate">Academic English</p>
          <p className="text-[10px] text-[#6f6f7a]">Урок 2 из 5</p>
        </div>
        <div className="flex items-center gap-1 bg-[#5941ff]/15 border border-[#5941ff]/25 rounded-full px-2 py-0.5">
          <div className="w-1.5 h-1.5 rounded-full bg-[#5941ff]" />
          <span className="text-[10px] text-[#7c6fff] font-medium">60%</span>
        </div>
      </div>

      {/* Video preview */}
      <div className="px-4 pt-3">
        <div className="bg-[#0a0a14] border border-[#1c1c24] rounded-xl aspect-video flex flex-col items-center justify-center gap-1.5 relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-[#5941ff]/[0.08] to-transparent" />
          <div className="w-8 h-8 rounded-full bg-[#17171e] border border-[#27272e] flex items-center justify-center">
            <Play className="w-3.5 h-3.5 text-[#f0f0f5] fill-[#f0f0f5] ml-0.5" />
          </div>
          <p className="text-[10px] text-[#797982] text-center px-6 leading-tight relative z-10">
            IELTS Reading: Skimming &amp; Scanning
          </p>
          <span className="text-[10px] text-[#525258]">12 мин</span>
        </div>
      </div>

      {/* Lesson list */}
      <div className="px-4 pt-2.5 flex flex-col gap-1">
        {PREVIEW_LESSONS.map((lesson) => (
          <div
            key={lesson.id}
            className={cn(
              "flex items-center gap-2 rounded-lg px-2.5 py-1.5",
              lesson.active ? "bg-[#5941ff]/10 border border-[#5941ff]/20" : "",
            )}
          >
            {lesson.done ? (
              <CheckCircle2 className="w-3 h-3 text-[#5941ff] flex-shrink-0" />
            ) : (
              <Circle
                className={cn(
                  "w-3 h-3 flex-shrink-0",
                  lesson.active ? "text-[#5941ff]" : "text-[#454548]",
                )}
              />
            )}
            <span
              className={cn(
                "text-[10px] truncate",
                lesson.active
                  ? "text-[#f0f0f5] font-medium"
                  : lesson.done
                    ? "text-[#676772] line-through"
                    : "text-[#676772]",
              )}
            >
              {lesson.title}
            </span>
          </div>
        ))}
      </div>

      {/* Quiz */}
      <div className="px-4 pt-2 pb-3 mt-auto">
        <div className="bg-[#111116] border border-[#1b1b22] rounded-xl p-2.5">
          <p className="text-[10px] font-semibold text-[#f0f0f5] mb-1.5">
            Quiz · Что такое skimming?
          </p>
          <div className="space-y-1">
            <div className="flex items-center gap-1.5 rounded-lg bg-[#5941ff]/15 border border-[#5941ff]/25 px-2 py-1">
              <div className="w-2.5 h-2.5 rounded-full border-2 border-[#5941ff] flex-shrink-0 flex items-center justify-center">
                <div className="w-1 h-1 rounded-full bg-[#5941ff]" />
              </div>
              <span className="text-[10px] text-[#7c6fff]">Быстрое чтение для понимания</span>
            </div>
            <div className="flex items-center gap-1.5 px-2 py-1">
              <div className="w-2.5 h-2.5 rounded-full border border-[#333339] flex-shrink-0" />
              <span className="text-[10px] text-[#676772]">Поиск конкретного слова</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Scene E — Telegram reminders
// ---------------------------------------------------------------------------

function TelegramScene({ tt }: { tt: (k: string) => string }) {
  return (
    <div className="h-full flex flex-col bg-[#07070a] text-[#f0f0f5] overflow-hidden">
      <div className="px-4 py-3 border-b border-[#19191f]">
        <div className="flex items-center gap-2">
          <Send className="w-4 h-4 text-[#229ED9]" />
          <span className="text-xs font-semibold text-[#f0f0f5]">Telegram-бот</span>
        </div>
      </div>

      <div className="flex-1 px-4 py-3 flex flex-col gap-3 overflow-hidden">
        {/* Bot message bubble */}
        <div className="bg-[#229ED9]/[0.08] border border-[#229ED9]/15 rounded-2xl rounded-tl-none p-3 max-w-[88%]">
          <div className="flex items-center gap-1.5 mb-1.5">
            <Send className="w-2.5 h-2.5 text-[#229ED9]" />
            <span className="text-[10px] font-semibold text-[#229ED9]">Mentoria Bot</span>
          </div>
          <p className="text-[10px] text-[#b4b4b8] leading-relaxed">
            🔔 Напоминание: NYAS Junior Academy
          </p>
          <p className="text-[10px] text-[#797982] mt-0.5">До дедлайна 3 дня (15 сент)</p>
          <button className="mt-2 text-[10px] text-[#229ED9]">Открыть →</button>
        </div>

        {/* Saved list */}
        <div className="bg-[#111116] border border-[#1c1c24] rounded-2xl p-3">
          <p className="text-[10px] font-semibold text-[#f0f0f5] mb-2">
            {tt("savedOpportunities") || "Сохранённые"}
          </p>
          {PREVIEW_OPPS.slice(0, 2).map((opp) => (
            <div key={opp.id} className="flex items-center gap-2 py-0.5">
              <Bookmark className="w-3 h-3 text-[#5941ff] flex-shrink-0" />
              <span className="text-[10px] text-[#9898a0] truncate">{opp.title}</span>
            </div>
          ))}
        </div>

        {/* Toggle */}
        <div className="bg-[#0d9488]/[0.08] border border-[#0d9488]/20 rounded-xl px-3 py-2 flex items-center justify-between">
          <span className="text-[10px] text-[#2dd4bf]">Напоминания активны</span>
          <div className="w-7 h-4 bg-[#2dd4bf] rounded-full relative flex-shrink-0">
            <div className="absolute right-0.5 top-0.5 w-3 h-3 bg-white rounded-full shadow-sm" />
          </div>
        </div>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Browser-window frame (used in FeatureTabs / CommandCenter)
// ---------------------------------------------------------------------------

function AppFrame({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <div
      className={cn(
        "rounded-2xl overflow-hidden border border-[#1c1c24] flex flex-col",
        "shadow-[0_24px_60px_-12px_rgba(89,65,255,0.15),0_0_0_1px_rgba(89,65,255,0.06)]",
        className,
      )}
    >
      {/* Window chrome */}
      <div className="bg-[#0c0c10] border-b border-[#19191f] px-4 py-2.5 flex items-center gap-2 flex-shrink-0">
        <div className="flex gap-1.5">
          <div className="w-2.5 h-2.5 rounded-full bg-[#17171e]" />
          <div className="w-2.5 h-2.5 rounded-full bg-[#17171e]" />
          <div className="w-2.5 h-2.5 rounded-full bg-[#17171e]" />
        </div>
        <div className="flex-1 flex justify-center">
          <div className="bg-[#131318] rounded-full px-4 py-1 text-[10px] text-[#525258]">
            hub.mentoria.kz
          </div>
        </div>
      </div>
      {/* Content area fills remainder */}
      <div className="flex-1 overflow-hidden">{children}</div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Public API — static mockup (FeatureTabs / CommandCenter)
// ---------------------------------------------------------------------------

export type MockupVariant =
  | "opportunities"
  | "roadmap"
  | "dashboard"
  | "courses"
  | "telegram";

interface MentoriaProductMockupProps {
  variant: MockupVariant;
  className?: string;
  showFrame?: boolean;
}

function SceneSwitch({ variant, tt }: { variant: MockupVariant; tt: (k: string) => string }) {
  switch (variant) {
    case "opportunities":
      return <OpportunitiesScene tt={tt} />;
    case "roadmap":
      return <RoadmapScene tt={tt} />;
    case "dashboard":
      return <DashboardScene tt={tt} />;
    case "courses":
      return <CoursesScene tt={tt} />;
    case "telegram":
      return <TelegramScene tt={tt} />;
  }
}

export function MentoriaProductMockup({
  variant,
  className,
  showFrame = true,
}: MentoriaProductMockupProps) {
  const { tt } = useI18n();

  if (!showFrame) {
    return (
      <div className={cn("h-full overflow-hidden", className)}>
        <SceneSwitch variant={variant} tt={tt} />
      </div>
    );
  }

  return (
    <AppFrame className={className}>
      <SceneSwitch variant={variant} tt={tt} />
    </AppFrame>
  );
}

// ---------------------------------------------------------------------------
// Public API — scroll-driven cycler for the hero MacBook screen
//
// Divides the hero scroll progress (p = 0→1 over the first 80% of one
// viewport-height of scroll, matching HeroSection's own formula) into 4
// equal bands and crossfades between scenes as the MacBook rises.
//
//   p 0.00–0.25  →  Opportunities
//   p 0.25–0.50  →  Roadmap
//   p 0.50–0.75  →  Dashboard
//   p 0.75–1.00  →  Courses
// ---------------------------------------------------------------------------

const HERO_SCENES: MockupVariant[] = [
  "opportunities",
  "roadmap",
  "dashboard",
  "courses",
];

export function HeroScreenCycler({ className }: { className?: string }) {
  const { tt } = useI18n();
  const [mounted, setMounted] = useState(false);
  const [sceneIndex, setSceneIndex] = useState(0);
  const [visible, setVisible] = useState(true);

  // Refs so scroll handler never captures stale closure values
  const prefersReducedRef = useRef(false);
  const pendingIndexRef = useRef(0);   // latest scroll-requested scene
  const fadingRef = useRef(false);      // crossfade in-flight?

  useEffect(() => {
    // This component intentionally renders a stable server placeholder first.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setMounted(true);
    if (typeof window !== "undefined") {
      prefersReducedRef.current = window.matchMedia(
        "(prefers-reduced-motion: reduce)",
      ).matches;
    }
  }, []);

  // changeScene: initiates a crossfade to `newIndex`.
  // If a fade is already running, the timeout will pick up the latest
  // pendingIndexRef when it fires, so rapid scrolling always lands on the
  // correct final scene without queueing multiple fades.
  const changeScene = useCallback((newIndex: number) => {
    if (newIndex === pendingIndexRef.current && !fadingRef.current) return;
    pendingIndexRef.current = newIndex;

    if (prefersReducedRef.current) {
      setSceneIndex(newIndex);
      return;
    }

    if (fadingRef.current) return; // ongoing fade will pick up pendingIndexRef

    fadingRef.current = true;
    setVisible(false);
    setTimeout(() => {
      setSceneIndex(pendingIndexRef.current);
      setVisible(true);
      fadingRef.current = false;
    }, 280);
  }, []);

  useEffect(() => {
    if (!mounted) return;

    const onScroll = () => {
      const scrollY = window.scrollY;
      const vh = window.innerHeight;
      // Spread 4 scenes across the desktop hero scroll range. The mobile hero
      // is static, but this still allows the embedded screen to cycle gently
      // if the user scrolls past it.
      const p = Math.min(scrollY / (vh * 1.25), 1);
      const idx = Math.min(Math.floor(p * HERO_SCENES.length), HERO_SCENES.length - 1);
      changeScene(idx);
    };

    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll(); // sync to current scroll position on mount
    return () => window.removeEventListener("scroll", onScroll);
  }, [mounted, changeScene]);

  // Dark placeholder on server — prevents hydration mismatch
  if (!mounted) {
    return <div className={cn("bg-[#07070a] overflow-hidden", className)} />;
  }

  return (
    <div className={cn("bg-[#07070a] overflow-hidden", className)}>
      <div
        className="h-full w-full"
        style={{
          opacity: visible ? 1 : 0,
          transition: "opacity 280ms ease-out",
        }}
      >
        <SceneSwitch variant={HERO_SCENES[sceneIndex]} tt={tt} />
      </div>
    </div>
  );
}
