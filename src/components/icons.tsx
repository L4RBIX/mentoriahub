import { cn } from "@/lib/utils";

interface IconProps {
  className?: string;
  size?: number;
}

export function LogoIcon({ className }: IconProps) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 40 40" fill="none" className={cn("h-auto", className)}>
      <path d="M20 4L24 16H36L26.5 23.5L30 36L20 29L10 36L13.5 23.5L4 16H16L20 4Z" fill="currentColor"/>
    </svg>
  );
}

export function ChevronDownIcon({ className }: IconProps) {
  return (
    <svg viewBox="0 0 20 20" fill="none" className={cn("size-5", className)}>
      <path fill="currentColor" fillRule="evenodd" d="m10 11.339 5.292-5.292 1.414 1.414L10 14.167 3.294 7.461l1.414-1.414z" clipRule="evenodd" />
    </svg>
  );
}

export function ChevronRightIcon({ className }: IconProps) {
  return (
    <svg viewBox="0 0 20 20" fill="none" className={cn("size-5", className)}>
      <path fill="currentColor" fillRule="evenodd" d="M8.661 10 3.369 4.708l1.414-1.414L11.489 10l-6.706 6.706-1.414-1.414z" clipRule="evenodd" />
    </svg>
  );
}

export function ArrowUpRightIcon({ className }: IconProps) {
  return (
    <svg viewBox="0 0 20 20" fill="none" className={cn("size-5", className)}>
      <path fill="currentColor" fillRule="evenodd" d="M5.22 14.78a.75.75 0 0 0 1.06 0l7.22-7.22v5.69a.75.75 0 0 0 1.5 0v-7.5a.75.75 0 0 0-.75-.75h-7.5a.75.75 0 0 0 0 1.5h5.69L5.22 13.72a.75.75 0 0 0 0 1.06z" clipRule="evenodd" />
    </svg>
  );
}

export function GlobeIcon({ className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={cn("size-6", className)}>
      <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="1.5" />
      <path d="M12 2a14.5 14.5 0 0 1 0 20M12 2a14.5 14.5 0 0 0 0 20M2 12h20" stroke="currentColor" strokeWidth="1.5" />
    </svg>
  );
}

export function StreamlineIcon({ className }: IconProps) {
  return (
    <svg viewBox="0 0 32 32" fill="none" className={cn("size-8", className)}>
      <path d="M8.783 23.291L25.2 23.291" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M8.783 16L25.2 16" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M8.783 8.709L25.2 8.709" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export function AutomationIcon({ className }: IconProps) {
  return (
    <svg viewBox="0 0 28 28" fill="none" className={cn("size-7", className)}>
      <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M10 4H6a2 2 0 0 0-2 2v4m6-6h12a2 2 0 0 1 2 2v4M10 4v6m0 0H4m6 0h14M4 10v12a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V10" />
    </svg>
  );
}

export function AlertIcon({ className }: IconProps) {
  return (
    <svg viewBox="0 0 28 28" fill="none" className={cn("size-7", className)}>
      <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M14 9v5m0 4h.01M10.268 4h7.464l5.196 9-5.196 9h-7.464L5.072 13z" />
    </svg>
  );
}

export function ScaleIcon({ className }: IconProps) {
  return (
    <svg viewBox="0 0 28 28" fill="none" className={cn("size-7", className)}>
      <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M4 20h20M4 20V8l8-4 8 4v12M4 20l4-4h4l4 4" />
    </svg>
  );
}

export function RealtimeIcon({ className }: IconProps) {
  return (
    <svg viewBox="0 0 28 28" fill="none" className={cn("size-7", className)}>
      <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M2 12c0 5.523 4.477 10 10 10s10-4.477 10-10S17.523 2 12 2 2 6.477 2 12zm10-4v4l3 3" />
    </svg>
  );
}

export function ProjectMgmtIcon({ className }: IconProps) {
  return (
    <svg viewBox="0 0 28 28" fill="none" className={cn("size-7", className)}>
      <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M9 5H7a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2h-2M9 5a2 2 0 0 0 2 2h2a2 2 0 0 0 2-2M9 5a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2m-6 9 2 2 4-4" />
    </svg>
  );
}

export function StarIcon({ className, filled = false }: IconProps & { filled?: boolean }) {
  return (
    <svg viewBox="0 0 20 20" className={cn("size-5", className)}>
      <path
        fill={filled ? "currentColor" : "none"}
        stroke="currentColor"
        strokeWidth={filled ? 0 : 1.5}
        d="M10 1l2.39 7.26H19l-5.43 4.07 2.07 7.26L10 15.52l-5.64 4.07 2.07-7.26L.97 8.26H7.6z"
      />
    </svg>
  );
}

export function PlayIcon({ className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={cn("size-6", className)}>
      <path d="M8 5v14l11-7z" />
    </svg>
  );
}

export function InstagramIcon({ className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={cn("size-6", className)}>
      <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
    </svg>
  );
}

export function LinkedInIcon({ className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={cn("size-6", className)}>
      <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
    </svg>
  );
}

export function YouTubeIcon({ className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={cn("size-6", className)}>
      <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
    </svg>
  );
}

export function MenuIcon({ className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={cn("size-6", className)}>
      <path stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" d="M3 6h18M3 12h18M3 18h18" />
    </svg>
  );
}

export function PurpleDotIcon({ className }: IconProps) {
  return (
    <svg viewBox="0 0 83 17" fill="none" className={cn("w-20", className)}>
      <path fill="#5941FF" d="M7.693 1.869c.19-.588 1.023-.588 1.213 0l1.073 3.3a.638.638 0 0 0 .606.44h3.469c.617 0 .874.79.375 1.152L11.527 8.47a.637.637 0 0 0-.231.712l1.072 3.301c.19.587-.481 1.075-.981.712L8.99 11.487a.636.636 0 0 0-.748 0L5.843 13.195c-.5.363-1.171-.125-.981-.712l1.072-3.301a.638.638 0 0 0-.232-.712L3.304 6.76c-.5-.362-.242-1.152.375-1.152h3.469a.637.637 0 0 0 .605-.44l1.073-3.3h-.133z" />
    </svg>
  );
}
