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
  return (
    <nav
      aria-label="Mobile navigation"
      className="fixed inset-x-0 bottom-0 z-40 flex justify-center px-4 md:hidden"
      style={{ paddingBottom: "max(env(safe-area-inset-bottom), 1rem)" }}
    >
      <div className="flex items-center gap-1 rounded-full border border-white/60 bg-white/85 p-1.5 shadow-[0_18px_50px_rgba(0,88,190,0.22)] backdrop-blur-xl">
        {NAV_LINKS.map(({ href, mobileLabel, icon: Icon }) => {
          const active = isActive(pathname, href);
          const badge = href === "/shortlist" ? shortlistCount : 0;
          return (
            <Link
              key={href}
              href={href}
              aria-current={active ? "page" : undefined}
              className={`relative flex flex-col items-center justify-center gap-0.5 rounded-full px-4 py-2 transition-all duration-200 ease-out ${
                active
                  ? "bg-gradient-to-b from-[#0068df] to-[#0058be] text-white shadow-[0_10px_22px_rgba(0,88,190,0.38)] -translate-y-0.5"
                  : "text-gray-500 hover:text-gray-800"
              }`}
            >
              <Icon className="h-5 w-5" strokeWidth={active ? 2.5 : 2} />
              <span className={`text-[10px] font-medium leading-none ${active ? "text-white" : "text-gray-500"}`}>
                {mobileLabel}
              </span>
              {badge > 0 && (
                <span className="absolute -top-0.5 right-1 inline-flex h-4 min-w-4 items-center justify-center rounded-full bg-[#14b8a6] px-1 text-[9px] font-bold text-white ring-2 ring-white">
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