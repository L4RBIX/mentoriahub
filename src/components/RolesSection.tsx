"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";
import { useI18n } from "@/hooks/useI18n";

interface Role {
  id: number;
  name: string;
  emoji: string;
  description: string;
  learnMoreHref: string;
}

export function RolesSection() {
  const { tt } = useI18n();
  const [activeRole, setActiveRole] = useState<number>(0);

  const roles: Role[] = [
    {
      id: 0,
      name: tt("roleStudentName"),
      emoji: "🎓",
      description: tt("roleStudentDesc"),
      learnMoreHref: "/onboarding",
    },
    {
      id: 1,
      name: tt("roleMentorName"),
      emoji: "🧑‍🏫",
      description: tt("roleMentorDesc"),
      learnMoreHref: "#",
    },
    {
      id: 2,
      name: tt("roleSchoolName"),
      emoji: "🏫",
      description: tt("roleSchoolDesc"),
      learnMoreHref: "#",
    },
  ];

  const currentRole = roles[activeRole];

  const handlePrev = () => {
    setActiveRole((prev) => (prev === 0 ? roles.length - 1 : prev - 1));
  };

  const handleNext = () => {
    setActiveRole((prev) => (prev === roles.length - 1 ? 0 : prev + 1));
  };

  return (
    <section className="bg-black py-20 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex flex-col items-center text-center mb-12 gap-4">
          <div className="flex items-center gap-2 border border-white/20 rounded-full px-4 py-1.5 text-xs text-white/70">
            <span>{tt("rolesKicker")}</span>
          </div>
          <h2 className="text-5xl font-normal text-white max-w-3xl leading-tight">
            {tt("rolesHeading")}
          </h2>
          <p className="text-white/60 text-base max-w-2xl leading-relaxed">
            {tt("rolesSubtitle")}
          </p>
        </div>

        {/* Card container */}
        <div className="bg-[#0a0a0a] rounded-3xl border border-white/10 overflow-hidden">
          <div className="p-8 lg:p-12">
            {/* Main content: left list | center visual | right description */}
            <div className="flex flex-col lg:flex-row gap-8 items-center">
              {/* Left: role list with vertical dot indicators */}
              <div className="flex flex-col gap-4 w-full lg:w-56 flex-shrink-0">
                {roles.map((role) => {
                  const isActive = role.id === activeRole;
                  return (
                    <button
                      key={role.id}
                      onClick={() => setActiveRole(role.id)}
                      className="flex items-center gap-3 text-left group"
                    >
                      <span
                        className={cn(
                          "w-2.5 h-2.5 rounded-full flex-shrink-0 transition-colors",
                          isActive ? "bg-[#5941ff]" : "bg-white/20"
                        )}
                      />
                      <span
                        className={cn(
                          "text-sm font-medium transition-colors leading-snug",
                          isActive
                            ? "text-white"
                            : "text-white/40 group-hover:text-white/70"
                        )}
                      >
                        {role.name}
                      </span>
                    </button>
                  );
                })}
              </div>

              {/* Center: emoji visual */}
              <div className="w-full lg:flex-1 flex justify-center">
                <div className="w-full max-w-md aspect-square rounded-2xl bg-[#5941ff]/10 border border-[#5941ff]/20 flex items-center justify-center">
                  <span className="text-[120px] leading-none select-none">
                    {currentRole.emoji}
                  </span>
                </div>
              </div>

              {/* Right: description + link */}
              <div className="w-full lg:w-72 flex-shrink-0 flex flex-col justify-center gap-6">
                <h3 className="text-2xl font-normal text-white">
                  {currentRole.name}
                </h3>
                <p className="text-white/60 text-base leading-relaxed">
                  {currentRole.description}
                </p>
                <a
                  href={currentRole.learnMoreHref}
                  className="text-white flex items-center gap-2 hover:text-[#5941ff] transition-colors text-sm font-medium w-fit"
                >
                  {tt("learnMore")}
                  <span aria-hidden="true">→</span>
                </a>
              </div>
            </div>

            {/* Bottom: tab labels + prev/next arrows */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-6 mt-10 pt-8 border-t border-white/10">
              {/* Tab labels */}
              <div className="flex flex-wrap justify-center sm:justify-start gap-x-6 gap-y-2">
                {roles.map((role) => {
                  const isActive = role.id === activeRole;
                  return (
                    <button
                      key={role.id}
                      onClick={() => setActiveRole(role.id)}
                      className={cn(
                        "text-sm font-medium transition-colors",
                        isActive ? "text-white" : "text-white/40 hover:text-white/70"
                      )}
                    >
                      {role.name}
                    </button>
                  );
                })}
              </div>

              {/* Prev / next arrows */}
              <div className="flex items-center gap-3 flex-shrink-0">
                <button
                  onClick={handlePrev}
                  aria-label="Previous role"
                  className="bg-white/10 rounded-xl p-3 hover:bg-white/20 transition-colors"
                >
                  <svg
                    width="20"
                    height="20"
                    viewBox="0 0 20 20"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                    aria-hidden="true"
                  >
                    <path
                      d="M12.5 15L7.5 10L12.5 5"
                      stroke="white"
                      strokeWidth="1.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </button>
                <button
                  onClick={handleNext}
                  aria-label="Next role"
                  className="bg-white/10 rounded-xl p-3 hover:bg-white/20 transition-colors"
                >
                  <svg
                    width="20"
                    height="20"
                    viewBox="0 0 20 20"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                    aria-hidden="true"
                  >
                    <path
                      d="M7.5 5L12.5 10L7.5 15"
                      stroke="white"
                      strokeWidth="1.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
