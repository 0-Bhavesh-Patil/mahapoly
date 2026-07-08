"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect } from "react";
import { GraduationCap, LoaderCircle, Sparkles } from "lucide-react";
import type { MatchBucket } from "../lib/data";

export function CursorGlow() {
  useEffect(() => {
    const move = (event: PointerEvent) => {
      document.documentElement.style.setProperty("--cursor-x", `${event.clientX}px`);
      document.documentElement.style.setProperty("--cursor-y", `${event.clientY}px`);
    };

    window.addEventListener("pointermove", move, { passive: true });
    return () => window.removeEventListener("pointermove", move);
  }, []);

  return <div className="cursor-glow" aria-hidden="true" />;
}

export function TopNav() {
  const pathname = usePathname();
  const links = [
    { href: "/", label: "Overview" },
    { href: "/results", label: "Colleges" },
    { href: "/onboarding", label: "Cut-offs" },
  ];

  const isActive = (href: string) =>
    pathname === href || (href === "/onboarding" && pathname.startsWith("/onboarding"));

  return (
    <header className="sticky top-0 z-30 border-b border-[#edf0f5] bg-white/95 shadow-[0_8px_22px_rgba(15,23,42,0.04)] backdrop-blur-xl">
      <div className="mx-auto grid min-h-[64px] max-w-[1280px] grid-cols-[1fr_auto_1fr] items-center gap-3 px-4 py-2 sm:px-6">
        <Link href="/" className="flex min-w-0 shrink-0 items-center gap-2.5 justify-self-start">
          <div className="flex h-8 w-8 items-center justify-center rounded-md border border-[#d9e5ff] bg-[#eef5ff] text-[#2f80ed]">
            <GraduationCap className="h-4 w-4" />
          </div>
          <span className="truncate text-[22px] font-bold tracking-tight text-[#101828]">
            MahaPoly
          </span>
        </Link>

        <nav
          aria-label="Primary navigation"
          className="hide-scrollbar flex max-w-full items-center gap-1 overflow-x-auto rounded-full border border-[#dee3ec] bg-[#f1f2f5] p-1"
        >
          {links.map((l) => {
            const active = isActive(l.href);
            return (
              <Link
                key={l.href}
                href={l.href}
                aria-current={active ? "page" : undefined}
                className={`whitespace-nowrap rounded-full px-4 py-2 text-xs font-semibold transition-all sm:px-5 ${
                  active
                    ? "bg-white text-[#101828] shadow-[0_1px_3px_rgba(15,23,42,0.10)]"
                    : "text-[#4b5565] hover:bg-white/70 hover:text-[#101828]"
                }`}
              >
                {l.label}
              </Link>
            );
          })}
        </nav>

        <div className="flex items-center gap-3 justify-self-end">
          <Link href="/" className="hidden text-sm font-medium text-[#344054] hover:text-[#0058be] sm:inline-flex">
            Sign In
          </Link>
          <Link
            href="/onboarding"
            className="inline-flex min-h-10 items-center justify-center rounded-xl bg-[#2f80ed] px-4 text-sm font-semibold text-white shadow-[0_10px_22px_rgba(47,128,237,0.30)] transition-all hover:-translate-y-0.5 hover:bg-[#1f6fd5] sm:px-5"
          >
            Get Started
          </Link>
        </div>
      </div>
    </header>
  );
}

export function SiteFooter() {
  return (
    <footer className="border-t border-[#eef1f6] bg-[#f7f8fd] px-6 py-14">
      <div className="mx-auto flex max-w-[1280px] flex-col items-center gap-5 text-center">
        <Link href="/" className="flex items-center gap-2 text-[#667085]">
          <GraduationCap className="h-3.5 w-3.5" />
          <span className="text-sm font-bold tracking-tight">
            MahaPoly
          </span>
        </Link>
        <div className="max-w-2xl space-y-3">
          <p className="text-[11px] leading-relaxed text-[#8a93a6]">
            Disclaimer: MahaPoly is an independent predictive tool based on historical CAP data. It is not affiliated
            with the DTE Maharashtra. Predictions do not guarantee admission.
          </p>
          <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-[#a0a7b8]">
            (c) 2026 Mahapoly. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}

export function Loading3D() {
  return (
    <div className="min-h-screen aurora-bg grid place-items-center px-6">
      <div className="relative flex flex-col items-center">
        <div className="loading-orbit" aria-hidden="true">
          <div className="loading-cube">
            <span />
            <span />
            <span />
          </div>
        </div>
        <div className="mt-8 inline-flex items-center gap-2 rounded-full border border-white/80 bg-white/72 px-4 py-2 text-sm font-semibold text-[#0058be] shadow-[0_14px_36px_rgba(15,23,42,0.08)] backdrop-blur">
          <LoaderCircle className="h-4 w-4 animate-spin" />
          Preparing MahaPoly
          <Sparkles className="h-4 w-4 text-[#14b8a6]" />
        </div>
      </div>
    </div>
  );
}

export function Pill({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`px-5 py-2 rounded-full text-sm font-medium border transition-all ${
        active ? "bg-[#0058be] border-[#0058be] text-white shadow-[0_8px_18px_rgba(0,88,190,0.20)]" : "border-[#e5e7eb] text-[#191b23] hover:border-[#c2c6d6] hover:bg-white"
      }`}
    >
      {children}
    </button>
  );
}

export function CheckPill({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold border transition-all ${
        active ? "bg-[#0058be] border-[#0058be] text-white shadow-[0_8px_16px_rgba(0,88,190,0.18)]" : "bg-[#ecedf7] border-transparent text-[#424754] hover:border-[#c2c6d6] hover:bg-white"
      }`}
    >
      {children}
    </button>
  );
}

const BUCKET_META: Record<MatchBucket, { label: string; border: string; bg: string; text: string; softBg: string }> = {
  safe: { label: "Safe Match", border: "#10b981", bg: "#d1fae5", text: "#059669", softBg: "#ecfdf5" },
  competitive: { label: "Competitive", border: "#3b82f6", bg: "#dbeafe", text: "#2563eb", softBg: "#eff6ff" },
  aspirational: { label: "Aspirational", border: "#f59e0b", bg: "#fef3c7", text: "#b45309", softBg: "#fffbeb" },
};

export function bucketMeta(bucket: MatchBucket) {
  return BUCKET_META[bucket];
}

export function BucketBadge({ bucket }: { bucket: MatchBucket }) {
  const m = bucketMeta(bucket);
  return (
    <span
      className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold border"
      style={{ backgroundColor: m.bg, color: m.text, borderColor: `${m.border}4D` }}
    >
      {m.label}
    </span>
  );
}

export function MarginBadge({ margin }: { margin: number }) {
  const bucket: MatchBucket = margin > 2 ? "safe" : margin >= -2 ? "competitive" : "aspirational";
  const m = bucketMeta(bucket);
  const sign = margin >= 0 ? "+" : "";
  return (
    <span className="inline-flex px-2 py-0.5 rounded text-sm font-medium tabular-nums" style={{ backgroundColor: m.bg, color: m.text }}>
      {sign}
      {margin.toFixed(2)}%
    </span>
  );
}

export function CollegeTypeTag({ type }: { type: "government" | "aided" | "unaided" }) {
  const styles: Record<string, string> = {
    government: "bg-[#ecfdf5] border-[#d1fae5] text-[#047857]",
    aided: "bg-[#eff6ff] border-[#dbeafe] text-[#1d4ed8]",
    unaided: "bg-[#f1f5f9] border-[#e2e8f0] text-[#334155]",
  };
  const labels: Record<string, string> = { government: "Government", aided: "Govt. Aided", unaided: "Un-Aided" };
  return (
    <span className={`inline-flex px-2.5 py-1 rounded-md text-xs border ${styles[type]}`}>{labels[type]}</span>
  );
}
