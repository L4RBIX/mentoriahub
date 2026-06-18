"use client";

import { useState, useEffect, useRef } from "react";
import { cn } from "@/lib/utils";
import { useI18n } from "@/hooks/useI18n";
import { MentoriaProductMockup, type MockupVariant } from "@/components/MentoriaProductMockup";

interface TabContent {
  subtitleKey: string;
  featureKeys: string[];
  mockupVariant: MockupVariant;
  learnMoreHref: string;
}

interface Tab {
  id: string;
  labelKey: string;
  content: TabContent;
}

const tabs: Tab[] = [
  {
    id: "roadmap",
    labelKey: "tabRoadmap",
    content: {
      subtitleKey: "featureRoadmapText",
      featureKeys: ["gradeHelper", "upcomingDeadlines", "firstCourse", "suitablePrograms", "courseProgress", "planSaved"],
      mockupVariant: "roadmap",
      learnMoreHref: "/roadmap",
    },
  },
  {
    id: "catalog",
    labelKey: "tabCatalog",
    content: {
      subtitleKey: "featureCatalogText",
      featureKeys: ["grade", "search", "deadline", "save", "telegramReminder", "savedOpportunities"],
      mockupVariant: "opportunities",
      learnMoreHref: "/opportunities",
    },
  },
  {
    id: "courses",
    labelKey: "tabCourses",
    content: {
      subtitleKey: "featureCoursesText",
      featureKeys: ["lessons", "miniTask", "courseProgress", "certificates", "openCourse", "mentorPortal"],
      mockupVariant: "courses",
      learnMoreHref: "/courses",
    },
  },
  {
    id: "telegram",
    labelKey: "tabTelegram",
    content: {
      subtitleKey: "featureTelegramText",
      featureKeys: ["telegramReminder", "savedOpportunities", "openOpportunity", "upcomingDeadlines", "footerBot", "planSaved"],
      mockupVariant: "telegram",
      learnMoreHref: "#",
    },
  },
];

const row1Ids = ["roadmap", "catalog", "courses", "telegram"];

export function FeatureTabs() {
  const { tt } = useI18n();
  const [activeTabId, setActiveTabId] = useState<string>("roadmap");
  const [visible, setVisible] = useState(true);
  const pendingTabRef = useRef<string | null>(null);

  const activeTab = tabs.find((t) => t.id === activeTabId) ?? tabs[0];

  function switchTab(id: string) {
    if (id === activeTabId) return;
    pendingTabRef.current = id;
    setVisible(false);
  }

  useEffect(() => {
    if (!visible && pendingTabRef.current) {
      const timer = setTimeout(() => {
        setActiveTabId(pendingTabRef.current!);
        pendingTabRef.current = null;
        setVisible(true);
      }, 200);
      return () => clearTimeout(timer);
    }
  }, [visible]);

  const renderTabButton = (tab: Tab) => {
    const isActive = tab.id === activeTabId;
    return (
      <button
        key={tab.id}
        onClick={() => switchTab(tab.id)}
        className={cn(
          "rounded-full px-5 py-2 text-sm font-medium transition-colors whitespace-nowrap",
          isActive
            ? "bg-[#5400e9] text-white"
            : "border border-[#5941ff]/60 text-white/70 hover:border-[#5400e9]"
        )}
      >
        {tt(tab.labelKey)}
      </button>
    );
  };

  return (
    <section className="bg-black py-20 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex flex-col items-center text-center mb-12 gap-4">
          <div className="flex items-center gap-2 border border-white/20 rounded-full px-4 py-1.5 text-xs text-white/70">
            <span>{tt("tabsKicker")}</span>
          </div>
          <h2 className="text-5xl font-normal text-white max-w-2xl leading-tight">
            {tt("tabsTitle")}
          </h2>
        </div>

        {/* Tab row */}
        <div className="flex flex-col items-center gap-3 mb-10">
          <div className="flex flex-wrap justify-center gap-3">
            {row1Ids.map((id) => {
              const tab = tabs.find((t) => t.id === id);
              return tab ? renderTabButton(tab) : null;
            })}
          </div>
        </div>

        {/* Content card */}
        <div
          className={cn(
            "bg-[#0a0a0a] rounded-3xl border border-white/10 p-8 flex flex-col lg:flex-row gap-8 items-center",
            "transition-all duration-200 ease-in-out",
            visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-2"
          )}
        >
          {/* Left: product preview */}
          <div className="w-full lg:w-1/2 flex-shrink-0">
            <MentoriaProductMockup
              variant={activeTab.content.mockupVariant}
              className="w-full max-w-lg mx-auto aspect-[8/5]"
            />
          </div>

          {/* Right: feature list */}
          <div className="w-full lg:w-1/2 flex flex-col">
            <p className="text-white/70 text-base mb-6 leading-relaxed">
              {tt(activeTab.content.subtitleKey)}
            </p>

            <div className="grid grid-cols-2 gap-x-8 gap-y-3">
              {activeTab.content.featureKeys.map((key) => (
                <div key={key} className="flex items-start gap-3">
                  <span className="w-4 h-4 rounded-full bg-[#5941ff] flex-shrink-0 mt-1" />
                  <span className="text-base text-white">{tt(key)}</span>
                </div>
              ))}
            </div>

            <a
              href={activeTab.content.learnMoreHref}
              className="text-white flex items-center gap-2 mt-6 hover:text-[#5941ff] transition-colors text-sm font-medium w-fit"
            >
              {tt("learnMore")}
              <span aria-hidden="true">→</span>
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
