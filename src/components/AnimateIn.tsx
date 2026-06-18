"use client";
import { useInView } from "@/hooks/useInView";
import { cn } from "@/lib/utils";

type Direction = "up" | "left" | "right" | "none";

interface AnimateInProps {
  children: React.ReactNode;
  className?: string;
  direction?: Direction;
  delay?: number;
}

const HIDDEN: Record<Direction, string> = {
  up: "opacity-0 translate-y-10",
  left: "opacity-0 -translate-x-10",
  right: "opacity-0 translate-x-10",
  none: "opacity-0",
};

export function AnimateIn({
  children,
  className,
  direction = "up",
  delay = 0,
}: AnimateInProps) {
  const { ref, inView } = useInView(0.1);

  return (
    <div
      ref={ref}
      style={{ transitionDelay: `${delay}ms` }}
      className={cn(
        "transition-all duration-700 ease-out",
        inView ? "opacity-100 translate-y-0 translate-x-0" : HIDDEN[direction],
        className
      )}
    >
      {children}
    </div>
  );
}
