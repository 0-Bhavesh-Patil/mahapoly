"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { GraduationCap, LoaderCircle, Sparkles, Bookmark, Home, Building2, SlidersHorizontal } from "lucide-react";
import type { MatchBucket } from "../lib/data";
import { loadShortlist } from "../lib/shortlist";

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

// Single source of truth for both the desktop pill nav and the mobile floating nav.
const NAV_LINKS = [
  { href: "/", label: "Overview", mobileLabel: "Home", icon: Home },
  { href: "/results", label: "Colleges", mobileLabel: "Colleges", icon: Building2 },
  { href: "/onboarding", label: "Cut-offs", mobileLabel: "Cut-offs", icon: SlidersHorizontal },
  { href: "/shortlist", label: "Shortlist", mobileLabel: "Saved", icon: Bookmark },
];

function useShortlistCount(pathname: string) {
  const [count, setCount] = useState(0);
  useEffect(() => {
    const refresh = () => setCount(loadShortlist().length);
    refresh();
    window.addEventListener("storage", refresh);
    window.addEventListener("focus", refresh);
    return () => {
      window.removeEventListener("storage", refresh);
      window.removeEventListener("focus", refresh);
    };
  }, [pathname]);
  return count;
}

const isActive = (pathname: string, href: string) =>
  pathname === href || (href === "/onboarding" && pathname.startsWith("/onboarding"));

export function TopNav() {
  const pathname = usePathname();
  const shortlistCount = useShortlistCount(pathname);

  return (
    <>
      <header className="sticky top-0 z-30 flex w-full flex-col items-center justify-center bg-white/80 backdrop-blur-md border-b border-gray-100">
        <div className="flex w-full max-w-[1280px] items-center justify-between py-4 px-6">
          
          {/* Left: Logo */}
          <Link href="/" className="flex shrink-0 items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg border border-blue-100 bg-blue-50 text-blue-500">
              <GraduationCap className="h-6 w-6" strokeWidth={2} />
            </div>
            <span className="text-gray-900 text-2xl font-bold tracking-tight">
              MahaPoly
            </span>
          </Link>

          {/* Center: Navigation Pill */}
          <nav
            aria-label="Primary navigation"
            className="hidden md:flex shrink-0 items-center bg-gray-100/70 p-1 rounded-full border border-gray-200/50"
          >
            {NAV_LINKS.map(({ href, label }) => {
              const active = isActive(pathname, href);
              const isShortlist = href === "/shortlist";
              return (
                <Link
                  key={href}
                  href={href}
                  aria-current={active ? "page" : undefined}
                  className={`flex items-center justify-center gap-1.5 rounded-full transition-all duration-200 ease-in-out ${
                    active
                      ? "bg-white py-2 px-6 shadow-sm border border-gray-200/50 text-gray-900 font-medium text-sm"
                      : "py-2 px-6 text-gray-500 font-medium text-sm hover:text-gray-900"
                  }`}
                >
                  {isShortlist && <Bookmark className="h-3.5 w-3.5" strokeWidth={2.5} />}
                  {label}
                  {isShortlist && shortlistCount > 0 && (
                    <span className="inline-flex h-4 min-w-4 items-center justify-center rounded-full bg-blue-500 px-1 text-[10px] font-semibold text-white">
                      {shortlistCount}
                    </span>
                  )}
                </Link>
              );
            })}
          </nav>

          {/* Right: Actions */}
          <div className="flex shrink-0 items-center gap-6">
            <Link href="/signin" className="hidden text-sm font-medium text-gray-600 hover:text-gray-900 sm:block transition-colors">
              Sign In
            </Link>
            <Link
              href="/onboarding"
              className="flex items-center justify-center bg-blue-500 py-2.5 px-6 rounded-full shadow-[0_0_24px_rgba(59,130,246,0.35)] text-white text-sm font-medium transition-all hover:bg-blue-600 hover:shadow-[0_0_28px_rgba(59,130,246,0.45)]"
            >
              Get Started
            </Link>
          </div>
        </div>
      </header>

      <MobileFloatingNav pathname={pathname} shortlistCount={shortlistCount} />
    </>
  );
}

function MobileFloatingNav({ pathname, shortlistCount }: { pathname: string; shortlistCount: number }) {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia("(max-width: 767px)");
    const update = () => setIsMobile(mq.matches);
    update();
    mq.addEventListener("change", update);
    return () => mq.removeEventListener("change", update);
  }, []);

  if (!isMobile) return null;

  return (
    <nav
      aria-label="Mobile navigation"
      style={{
        position: "fixed",
        left: 0,
        right: 0,
        bottom: 0,
        zIndex: 40,
        display: "flex",
        justifyContent: "center",
        padding: "0 16px",
        paddingBottom: "max(env(safe-area-inset-bottom), 16px)",
        pointerEvents: "none",
      }}
    >
      <div
        style={{
          pointerEvents: "auto",
          display: "flex",
          alignItems: "center",
          gap: 4,
          borderRadius: 9999,
          border: "1px solid rgba(255,255,255,0.6)",
          background: "rgba(255,255,255,0.9)",
          padding: 6,
          boxShadow: "0 18px 50px rgba(0,88,190,0.28)",
          backdropFilter: "blur(18px)",
          WebkitBackdropFilter: "blur(18px)",
        }}
      >
        {NAV_LINKS.map(({ href, mobileLabel, icon: Icon }) => {
          const active = isActive(pathname, href);
          const badge = href === "/shortlist" ? shortlistCount : 0;
          return (
            <Link
              key={href}
              href={href}
              aria-current={active ? "page" : undefined}
              style={{
                position: "relative",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                gap: 2,
                borderRadius: 9999,
                padding: "8px 16px",
                textDecoration: "none",
                transition: "all 200ms ease-out",
                transform: active ? "translateY(-2px)" : "none",
                background: active ? "linear-gradient(to bottom, #0068df, #0058be)" : "transparent",
                boxShadow: active ? "0 10px 22px rgba(0,88,190,0.38)" : "none",
                color: active ? "#ffffff" : "#6b7280",
              }}
            >
              <Icon className="h-5 w-5" strokeWidth={active ? 2.5 : 2} />
              <span style={{ fontSize: 10, fontWeight: 500, lineHeight: 1, color: active ? "#ffffff" : "#6b7280" }}>
                {mobileLabel}
              </span>
              {badge > 0 && (
                <span
                  style={{
                    position: "absolute",
                    top: -2,
                    right: 4,
                    display: "inline-flex",
                    height: 16,
                    minWidth: 16,
                    alignItems: "center",
                    justifyContent: "center",
                    borderRadius: 9999,
                    background: "#14b8a6",
                    padding: "0 4px",
                    fontSize: 9,
                    fontWeight: 700,
                    color: "#ffffff",
                    boxShadow: "0 0 0 2px #ffffff",
                  }}
                >
                  {badge}
                </span>
              )}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}

export function SiteFooter() {
  return (
    <footer className="flex flex-col items-center justify-center w-full bg-white py-8 px-6 border-t border-gray-200">
      <div className="flex flex-col items-center w-full gap-3">
        
        {/* Brand Logo & Name */}
        <Link href="/" className="flex items-center gap-2">
          <GraduationCap className="h-5 w-5 text-gray-900" strokeWidth={2.5} />
          <span className="text-gray-900 text-lg font-bold">
            MahaPoly
          </span>
        </Link>

        {/* Disclaimer */}
        <p className="text-gray-800 text-[13px] sm:text-sm text-center">
          Disclaimer: MahaPoly is an independent predictive tool based on historical CAP data. It is not affiliated with the DTEMaharashtra. Predictions do not guarantee admission.
        </p>

        {/* Copyright */}
        <span className="text-gray-800 text-[13px] sm:text-sm font-medium">
          © 2024 MAHAPOLY. ALL RIGHTS RESERVED.
        </span>
        
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