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
    <header className="sticky top-0 z-30 flex w-full flex-col items-center justify-center border-b border-black/[0.05] bg-[#FFFFFFB0] backdrop-blur-[10px]">
      <div className="flex w-full max-w-[1280px] items-center justify-between pt-3.5 pb-[15px] px-4 sm:px-6">
        
        {/* Left: Logo */}
        <Link href="/" className="flex shrink-0 items-center gap-3">
          <div className="flex h-8 w-8 items-center justify-center rounded-md border border-[#dbeafe] bg-[#eff6ff] text-blue-500">
            <GraduationCap className="h-5 w-5" strokeWidth={2.5} />
          </div>
          <span className="text-[#191B23] text-[28px] font-bold">
            MahaPoly
          </span>
        </Link>

        {/* Center: Navigation Pill */}
        <nav
          aria-label="Primary navigation"
          className="hidden md:flex shrink-0 items-center bg-[#0000000D] p-[5px] rounded-[9999px] border border-solid border-[#0000000D]"
        >
          {links.map((l) => {
            const active = isActive(l.href);
            return (
              <Link
                key={l.href}
                href={l.href}
                aria-current={active ? "page" : undefined}
                className={`flex items-center justify-center rounded-[9999px] transition-all ${
                  active
                    ? "bg-white text-left py-1.5 px-[21px] mx-[2px] border border-solid border-[#0000000D] shadow-[0px_1px_2px_rgba(0,0,0,0.05)] text-[#191B23] text-sm"
                    : "py-1.5 px-5 text-[#565E74] text-sm hover:text-[#191B23]"
                }`}
              >
                {l.label}
              </Link>
            );
          })}
        </nav>

        {/* Right: Actions */}
        <div className="flex shrink-0 items-center gap-5">
          <Link href="/" className="hidden text-sm text-[#565E74] hover:text-[#191B23] sm:block">
            Sign In
          </Link>
          <div className="flex flex-col shrink-0 items-center bg-blue-500 pb-[1px] rounded-[9999px]">
            <Link
              href="/onboarding"
              className="flex flex-col items-start bg-blue-500 text-left py-[7px] px-5 rounded-[9999px] shadow-[0px_0px_20px_rgba(59,130,246,0.3)] text-white text-sm transition-all hover:bg-blue-600"
            >
              Get Started
            </Link>
          </div>
        </div>
      </div>
    </header>
  );
}

export function SiteFooter() {
  return (
    <footer className="flex flex-col items-center self-stretch bg-[#F9F9FF] py-16 gap-8 border-t border-black/5">
      {/* Brand Logo & Name */}
      <Link href="/" className="flex items-center gap-[11px]">
        <GraduationCap className="h-5 w-5 text-[#565E74]" />
        <span className="text-[#565E74] text-lg font-bold">
          MahaPoly
        </span>
      </Link>

      {/* Disclaimer & Copyright */}
      <div className="flex flex-col items-center self-stretch mx-6">
        <div className="flex flex-col items-center gap-4">
          <p className="text-[#565E74] text-xs text-center max-w-[626px]">
            Disclaimer: MahaPoly is an independent predictive tool based on historical CAP data. It is not affiliated with the DTE Maharashtra. Predictions do not guarantee admission.
          </p>
          <div className="flex flex-col items-start">
            <span className="text-[#565E74] text-xs">
              © 2024 MAHAPOLY. ALL RIGHTS RESERVED.
            </span>
          </div>
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