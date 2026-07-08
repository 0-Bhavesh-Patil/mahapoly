"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { GraduationCap, Bell } from "lucide-react";
import type { MatchBucket } from "../lib/data";

export function TopNav() {
  const pathname = usePathname();
  const links = [
    { href: "/", label: "Home" },
    { href: "/onboarding", label: "Search" },
    { href: "/shortlist", label: "Shortlist" },
  ];
  return (
    <header className="bg-[#f9f9ff]/90 backdrop-blur-md border-b border-black/[0.05] sticky top-0 z-30">
      <div className="max-w-[1280px] mx-auto px-4 h-[72px] flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2 shrink-0">
          <div className="w-8 h-8 rounded-md bg-[#0058be] text-white flex items-center justify-center">
            <GraduationCap className="h-4.5 w-4.5" />
          </div>
          <span className="font-bold text-[20px] text-[#0058be] tracking-tight">MahaPoly</span>
        </Link>
        <nav className="hidden md:flex items-center gap-1">
          {links.map((l) => {
            const active = pathname === l.href;
            return (
              <Link
                key={l.href}
                href={l.href}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                  active ? "bg-[#0058be]/10 text-[#0058be]" : "text-[#424754] hover:bg-black/[0.03]"
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
      className={`px-5 py-2 rounded-full text-sm font-medium border transition-colors ${
        active ? "bg-[#0058be] border-[#0058be] text-white" : "border-[#e5e7eb] text-[#191b23] hover:border-[#c2c6d6]"
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
      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold border transition-colors ${
        active ? "bg-[#0058be] border-[#0058be] text-white" : "bg-[#ecedf7] border-transparent text-[#424754] hover:border-[#c2c6d6]"
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
