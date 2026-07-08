"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect } from "react";
import { Bell, GraduationCap, Home, Search, Star } from "lucide-react";
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
    { href: "/shortlist", label: "Shortlist", Icon: Star },
  ];
  return (
    <header className="bg-white/78 backdrop-blur-xl border-b border-white/70 sticky top-0 z-30 shadow-[0_10px_30px_rgba(15,23,42,0.04)]">
      <CursorGlow />
      <div className="max-w-[1280px] mx-auto px-4 h-[72px] flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2 shrink-0">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#0058be] via-[#2170e4] to-[#14b8a6] text-white flex items-center justify-center shadow-[0_10px_24px_rgba(0,88,190,0.28)]">
            <GraduationCap className="h-4.5 w-4.5" />
          </div>
          <span className="font-bold text-[20px] bg-gradient-to-r from-[#0058be] to-[#0f766e] bg-clip-text text-transparent tracking-tight">
            MahaPoly
          </span>
        </Link>
        <nav className="hidden md:flex items-center gap-1 bg-[#f1f5f9]/80 border border-white rounded-full p-1 shadow-inner">
          {links.map((l) => {
            const active = pathname === l.href;
            return (
              <Link
                key={l.href}
                href={l.href}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                  active ? "bg-white text-[#0058be] shadow-sm" : "text-[#424754] hover:bg-white/70 hover:text-[#191b23]"
                }`}
              >
                {l.label}
              </Link>
            );
          })}
        </nav>
        <button className="w-10 h-10 rounded-full flex items-center justify-center hover:bg-black/[0.03] transition-colors text-[#424754]">
          <Bell className="h-4 w-4" />
        </button>
      </div>
      <nav className="md:hidden px-3 pb-3">
        <div className="grid grid-cols-3 gap-2 rounded-2xl border border-[#e2e8f0] bg-white/85 p-1.5 shadow-[0_12px_30px_rgba(15,23,42,0.08)]">
          {links.map(({ href, label, Icon }) => {
            const active = pathname === href;
            return (
              <Link
                key={href}
                href={href}
                className={`flex min-h-11 items-center justify-center gap-1.5 rounded-xl text-xs font-semibold transition-all ${
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
