 "use client";

import { cn } from "@/lib/utils";
import { useI18n } from "@/hooks/useI18n";

const partners: string[] = [
  "Nazarbayev University",
  "NU School",
  "Bolashak",
  "KAZMUN",
  "Google CS First",
  "Junior Achievement KZ",
  "MIT OpenCourseWare",
  "British Council",
];

export function ClientLogos({ className }: { className?: string }) {
  const { tt } = useI18n();

  return (
    <section className={cn("py-20", className)} style={{ backgroundColor: "#e4e7f2" }}>
      <div className="container mx-auto px-4 lg:px-8">
        {/* Stars */}
        <div className="flex justify-center gap-1 mb-4">
          {Array.from({ length: 5 }).map((_, i) => (
            <span key={i} className="text-[#5941ff] text-2xl leading-none">
              ★
            </span>
          ))}
        </div>

        {/* Heading */}
        <h2 className="text-4xl font-normal text-black text-center max-w-2xl mx-auto leading-tight">
          {tt("trustedPartnersHeading")}
        </h2>

        {/* Partner badges grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-10 items-center">
          {partners.map((name) => (
            <div
              key={name}
              className="flex items-center justify-center h-14 px-4 rounded-xl bg-black/5 border border-black/10 hover:bg-black/10 transition-colors"
            >
              <span className="text-sm font-medium text-black/60 text-center leading-tight">
                {name}
              </span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
