"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";
import { ChevronDownIcon } from "@/components/icons";
import { useI18n } from "@/hooks/useI18n";

interface FAQItem {
  id: number;
  question: string;
  answer: string;
}

function AccordionItem({
  item,
  isOpen,
  onToggle,
  isFirst = false,
}: {
  item: FAQItem;
  isOpen: boolean;
  onToggle: () => void;
  isFirst?: boolean;
}) {
  return (
    <div
      className={cn(
        "cursor-pointer",
        isFirst && isOpen
          ? "bg-[#141414] rounded-2xl p-6 border border-white/10"
          : "border-b border-white/10 py-5"
      )}
      onClick={onToggle}
    >
      <div className="flex justify-between items-center gap-4">
        <p className="text-lg text-white font-normal leading-snug">
          {item.question}
        </p>
        <ChevronDownIcon
          className={cn(
            "size-5 text-white/60 flex-shrink-0 transition-transform duration-200",
            isOpen && "rotate-180"
          )}
        />
      </div>
      {isOpen && (
        <p className="text-base text-white/70 mt-3 leading-relaxed">
          {item.answer}
        </p>
      )}
    </div>
  );
}

export function FAQSection() {
  const { tt } = useI18n();
  const [openId, setOpenId] = useState<number>(1);

  const allFaqs: FAQItem[] = Array.from({ length: 10 }, (_, i) => ({
    id: i + 1,
    question: tt(`faqQ${i + 1}`),
    answer: tt(`faqA${i + 1}`),
  }));
  const leftFaqs = allFaqs.slice(0, 5);
  const rightFaqs = allFaqs.slice(5);

  const handleToggle = (id: number) => {
    setOpenId((prev) => (prev === id ? -1 : id));
  };

  return (
    <section className="faq-section bg-black py-20 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-14">
          <h2 className="text-5xl font-normal text-white">
            {tt("faqHeading")}
          </h2>
        </div>

        {/* 2-column grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Left column */}
          <div className="flex flex-col gap-0">
            {leftFaqs.map((item, idx) => (
              <AccordionItem
                key={item.id}
                item={item}
                isOpen={openId === item.id}
                onToggle={() => handleToggle(item.id)}
                isFirst={idx === 0}
              />
            ))}
          </div>

          {/* Right column */}
          <div className="flex flex-col gap-0">
            {rightFaqs.map((item) => (
              <AccordionItem
                key={item.id}
                item={item}
                isOpen={openId === item.id}
                onToggle={() => handleToggle(item.id)}
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
