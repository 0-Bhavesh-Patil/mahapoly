"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect } from "react";
import { ArrowRight, Building2, GraduationCap, Home, LoaderCircle, Search, Sparkles, Star } from "lucide-react";
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
    { href: "/", label: "Home", Icon: Home },
    { href: "/onboarding", label: "Search", Icon: Search },
    { href: "/results", label: "Colleges", Icon: Building2 },
    { href: "/shortlist", label: "Shortlist", Icon: Star },
  ];
  return (
    <header className="bg-white/76 backdrop-blur-2xl border-b border-white/70 sticky top-0 z-30 shadow-[0_14px_36px_rgba(15,23,42,0.06)]">
      <div className="max-w-[1280px] mx-auto px-4 h-[72px] flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2 shrink-0">
          <div className="w-9 h-9 rounded-xl bg-[linear-gradient(135deg,#004aad,#2170e4_50%,#14b8a6)] text-white flex items-center justify-center shadow-[0_12px_26px_rgba(0,88,190,0.30)] ring-1 ring-white/40">
            <GraduationCap className="h-4.5 w-4.5" />
          </div>
          <span className="font-bold text-[20px] bg-gradient-to-r from-[#0058be] to-[#0f766e] bg-clip-text text-transparent tracking-tight">
            MahaPoly
          </span>
        </Link>
        <nav className="hidden md:flex items-center gap-1 bg-[#eef5ff]/82 border border-white rounded-full p-1 shadow-[inset_0_1px_2px_rgba(15,23,42,0.05),0_10px_24px_rgba(15,23,42,0.04)]">
          {links.map((l) => {
            const active = pathname === l.href || (l.href === "/onboarding" && pathname.startsWith("/onboarding"));
            return (
              <Link
                key={l.href}
                href={l.href}
                className={`flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-medium transition-all ${
                  active ? "bg-white text-[#0058be] shadow-[0_8px_18px_rgba(15,23,42,0.08)]" : "text-[#424754] hover:bg-white/70 hover:text-[#191b23]"
                }`}
              >
                <l.Icon className="h-3.5 w-3.5" />
                {l.label}
              </Link>
            );
          })}
        </nav>
        <Link
          href="/onboarding"
          className="hidden sm:inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-[#0058be] to-[#14b8a6] px-4 py-2 text-sm font-semibold text-white shadow-[0_14px_28px_rgba(0,88,190,0.24)] transition-all hover:-translate-y-0.5 hover:shadow-[0_18px_36px_rgba(0,88,190,0.30)]"
        >
          Start <ArrowRight className="h-3.5 w-3.5" />
        </Link>
      </div>
      <nav className="md:hidden px-3 pb-3">
        <div className="grid grid-cols-4 gap-1.5 rounded-2xl border border-[#e2e8f0] bg-white/88 p-1.5 shadow-[0_12px_30px_rgba(15,23,42,0.08)]">
          {links.map(({ href, label, Icon }) => {
            const active = pathname === href;
            return (
              <Link
                key={href}
                href={href}
                className={`flex min-h-11 flex-col items-center justify-center gap-0.5 rounded-xl text-[11px] font-semibold transition-all ${
                  active ? "bg-[#0058be] text-white shadow-[0_10px_20px_rgba(0,88,190,0.22)]" : "text-[#424754] hover:bg-[#f1f5f9]"
                }`}
              >
                <Icon className="h-3.5 w-3.5" />
                {label}
              </Link>
            );
          })}
        </div>
      </nav>
    </header>
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
