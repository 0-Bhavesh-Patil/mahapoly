"use client";

import Link from "next/link";
import { ArrowRight, GraduationCap, ListChecks, Target } from "lucide-react";
import { DATA, FLAT } from "../lib/data";
import { CursorGlow } from "../components/ui";

const TICKER_ITEMS = [
  "418+ colleges mapped",
  "77,000+ real CAP cutoff records",
  "63 branches covered",
  "CAP Round 1 predictions",
  "Built from official DTE data",
];

export default function LandingPage() {
  const branchCount = DATA.branches.length;
  const recordCount = FLAT.length;

  return (
    <div className="min-h-screen aurora-bg text-[#191b23]">
      <CursorGlow />
      {/* Header */}
      <header className="backdrop-blur-xl bg-white/78 border-b border-white/70 sticky top-0 z-30 shadow-[0_10px_30px_rgba(15,23,42,0.04)]">
        <div className="max-w-[1280px] mx-auto px-4 h-[72px] flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#0058be] via-[#2170e4] to-[#14b8a6] text-white flex items-center justify-center shadow-[0_10px_24px_rgba(0,88,190,0.28)]">
              <GraduationCap className="h-4.5 w-4.5" />
            </div>
            <span className="font-bold text-[22px] tracking-tight bg-gradient-to-r from-[#0058be] to-[#0f766e] bg-clip-text text-transparent">MahaPoly</span>
          </div>
          <nav className="hidden md:flex items-center gap-1 bg-black/[0.04] border border-black/[0.05] rounded-full p-1">
            <Link href="/" className="px-5 py-1.5 rounded-full text-sm font-medium bg-white shadow-sm">
              Overview
            </Link>
            <Link href="/results" className="px-5 py-1.5 rounded-full text-sm font-medium text-[#565e74] hover:text-[#191b23]">
              Colleges
            </Link>
            <Link href="/onboarding" className="px-5 py-1.5 rounded-full text-sm font-medium text-[#565e74] hover:text-[#191b23]">
              Cut-offs
            </Link>
          </nav>
          <div className="flex items-center gap-5">
            <Link href="/onboarding" className="text-sm font-medium text-[#565e74] hover:text-[#191b23] hidden sm:block">
              Skip to search
            </Link>
            <Link
              href="/onboarding"
              className="px-5 py-2 rounded-full text-sm font-medium text-white bg-gradient-to-r from-[#0058be] to-[#14b8a6] shadow-[0_12px_28px_rgba(0,88,190,0.26)] hover:-translate-y-0.5 hover:shadow-[0_16px_34px_rgba(0,88,190,0.32)] transition-all"
            >
              Get Started
            </Link>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="relative overflow-hidden pt-12 md:pt-16 pb-20 md:pb-24 px-4 sm:px-6">
        <div
          className="pointer-events-none absolute -top-64 left-1/2 -translate-x-1/2 w-[800px] h-[800px] rounded-full blur-[80px] opacity-60"
          style={{ background: "radial-gradient(circle, rgba(59,130,246,0.15), transparent 60%)" }}
        />
        <div
          className="pointer-events-none absolute -bottom-48 -right-48 w-[800px] h-[800px] rounded-full blur-[80px] opacity-40"
          style={{ background: "radial-gradient(circle, rgba(139,92,246,0.15), transparent 60%)" }}
        />
        <div className="relative max-w-[1280px] mx-auto flex flex-col items-center text-center">
          <div className="inline-flex animate-rise-in items-center gap-2 px-4 py-1.5 rounded-full bg-white/70 backdrop-blur border border-white shadow-sm mb-8">
            <span className="w-1.5 h-1.5 rounded-full bg-[#10b981]" />
            <span className="text-xs font-medium text-[#424754] tracking-wide">Live CAP Data 2026</span>
          </div>
          <h1 className="animate-rise-in text-4xl sm:text-5xl md:text-7xl font-extrabold tracking-tight leading-[1.05] bg-gradient-to-b from-[#08111f] via-[#172554] to-[#0f766e] bg-clip-text text-transparent max-w-4xl" style={{ animationDelay: "80ms" }}>
            Find the right Polytechnic college for your merit.
          </h1>
          <p className="animate-rise-in mt-6 md:mt-8 text-base md:text-lg text-[#565e74] max-w-2xl leading-relaxed" style={{ animationDelay: "160ms" }}>
            Navigate the complex admissions process with clarity. Get personalized college recommendations based on
            your exact merit and category, drawn from real CAP cutoff records.
          </p>
          <div className="animate-rise-in mt-8 md:mt-10 flex w-full max-w-sm flex-col sm:max-w-none sm:w-auto sm:flex-row gap-4" style={{ animationDelay: "240ms" }}>
            <Link
              href="/onboarding"
              className="inline-flex items-center justify-center gap-2 px-8 py-4 rounded-full text-sm font-medium text-white bg-gradient-to-r from-[#0058be] to-[#14b8a6] shadow-[0_18px_36px_rgba(0,88,190,0.28)] hover:-translate-y-0.5 hover:shadow-[0_22px_46px_rgba(0,88,190,0.34)] transition-all"
            >
              Check My Chances <ArrowRight className="h-3.5 w-3.5" />
            </Link>
            <Link
              href="/results"
              className="inline-flex items-center justify-center px-8 py-4 rounded-full text-sm font-medium bg-white/70 backdrop-blur border border-white hover:bg-white transition-colors shadow-sm"
            >
              Explore Cut-offs
            </Link>
          </div>

          {/* Floating preview card */}
          <div className="mt-14 md:mt-20 w-full max-w-3xl animate-rise-in" style={{ animationDelay: "320ms" }}>
            <div className="relative rounded-[28px] glass-card p-1.5 tilt-card">
              <div className="absolute -top-4 right-4 md:-top-5 md:-right-5 bg-white border border-[#10b981]/20 rounded-full px-4 py-2 shadow-lg flex items-center gap-2">
                <Target className="h-3 w-3 text-[#059669]" />
                <span className="text-[11px] font-medium text-[#059669] tracking-wide uppercase">
                  High Probability Match
                </span>
              </div>
              <div className="bg-white/90 rounded-[22px] border border-white p-5 sm:p-8 md:p-10 grid md:grid-cols-2 gap-8 items-center text-left">
                <div>
                  <h3 className="text-xl md:text-2xl font-semibold tracking-tight mb-2">Your Profile Prediction</h3>
                  <p className="text-[#565e74] mb-6">Merit Score: 82.40%</p>
                  <div className="bg-white border border-black/[0.05] rounded-xl p-4 shadow-sm mb-3 lift-card">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm text-[#565e74]">Matching Colleges</span>
                      <span className="text-lg font-medium text-[#3b82f6]">12</span>
                    </div>
                    <div className="h-1 rounded-full bg-[#e1e2ec]">
                      <div className="h-1 rounded-full bg-[#3b82f6] w-[70%]" />
                    </div>
                  </div>
                  <div className="bg-white border border-black/[0.04] rounded-xl p-3.5 flex items-center justify-between lift-card">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-[#3b82f6]/10 border border-[#3b82f6]/20 flex items-center justify-center">
                        <GraduationCap className="h-4 w-4 text-[#3b82f6]" />
                      </div>
                      <div>
                        <div className="text-sm font-medium">Govt. Poly Pune</div>
                        <div className="text-xs text-[#565e74]">Computer Tech</div>
                      </div>
                    </div>
                    <span className="text-xs font-medium text-[#047857] bg-[#ecfdf5] border border-[#a7f3d0] px-2.5 py-1 rounded-md">
                      Safe
                    </span>
                  </div>
                </div>
                <div className="flex flex-col items-center justify-center">
                  <div className="relative w-40 h-40 rounded-full border-8 border-[#eff6ff] flex items-center justify-center shadow-[inset_0_0_30px_rgba(59,130,246,0.08)]">
                    <div
                      className="absolute inset-0 rounded-full"
                      style={{
                        background: "conic-gradient(#3b82f6 0% 82%, transparent 82% 100%)",
                        mask: "radial-gradient(farthest-side, transparent calc(100% - 8px), black calc(100% - 8px))",
                        WebkitMask: "radial-gradient(farthest-side, transparent calc(100% - 8px), black calc(100% - 8px))",
                      }}
                    />
                    <span className="text-3xl font-bold">82%</span>
                  </div>
                  <span className="mt-3 text-xs font-medium text-[#565e74] tracking-widest uppercase">Match rate</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Ticker */}
      <div className="border-y border-black/[0.04] bg-white/45 backdrop-blur overflow-hidden py-4">
        <div className="flex gap-16 whitespace-nowrap animate-[scroll_30s_linear_infinite]">
          {[...TICKER_ITEMS, ...TICKER_ITEMS].map((t, i) => (
            <span key={i} className="flex items-center gap-2 text-sm font-medium text-[#565e74]">
              <span className="text-[#10b981]">●</span> {t}
            </span>
          ))}
        </div>
      </div>

      {/* Stats */}
      <section className="border-b border-black/[0.04] py-16 md:py-20 px-4 sm:px-6">
        <div className="max-w-[1280px] mx-auto grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
          {[
            { value: `${DATA.colleges.length}+`, label: "Colleges" },
            { value: `${branchCount}`, label: "Branches" },
            { value: `${Math.round(recordCount / 1000)}k+`, label: "Records" },
            { value: "2026", label: "Data Year" },
          ].map((s, i) => (
            <div key={i} className={`rounded-2xl bg-white/55 p-5 shadow-sm border border-white/70 ${i > 0 ? "md:border-l md:pl-8" : ""}`}>
              <div className="text-4xl md:text-5xl font-light tracking-tight">{s.value}</div>
              <div className="mt-3 text-xs font-medium text-[#565e74] tracking-[0.2em] uppercase">{s.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* How it works */}
      <section className="py-20 md:py-24 px-4 sm:px-6">
        <div className="max-w-[1280px] mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-semibold tracking-tight mb-4">How it works</h2>
            <p className="text-lg text-[#565e74] max-w-xl mx-auto">
              Three simple steps to demystify your admission journey.
            </p>
          </div>
          <div className="relative grid md:grid-cols-3 gap-8">
            <div className="hidden md:block absolute top-[47px] left-[16%] right-[16%] h-px bg-gradient-to-r from-transparent via-black/10 to-transparent" />
            {[
              {
                Icon: Target,
                color: "#3b82f6",
                bg: "#eff6ff",
                border: "#bfdbfe",
                title: "1. Enter Profile",
                desc: "Input your merit percentage, category, and preferences to build your admission profile.",
              },
              {
                Icon: GraduationCap,
                color: "#a855f7",
                bg: "#faf5ff",
                border: "#e9d5ff",
                title: "2. Choose Branches",
                desc: "Select your desired engineering branches to narrow down the relevant cutoff data.",
              },
              {
                Icon: ListChecks,
                color: "#10b981",
                bg: "#ecfdf5",
                border: "#a7f3d0",
                title: "3. Get Matches",
                desc: "Instantly see Safe, Competitive, and Aspirational colleges based on real cutoff data.",
              },
            ].map((step, i) => (
              <div
                key={i}
                className="relative glass-card lift-card rounded-[28px] p-7 md:p-10 flex flex-col items-center text-center"
              >
                <div
                  className="w-16 h-16 rounded-2xl flex items-center justify-center mb-6 border"
                  style={{ backgroundColor: step.bg, borderColor: step.border }}
                >
                  <step.Icon className="h-6 w-6" style={{ color: step.color }} />
                </div>
                <h3 className="text-xl font-medium tracking-tight mb-3">{step.title}</h3>
                <p className="text-[#565e74] leading-relaxed">{step.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-white/70 backdrop-blur border-t border-black/[0.05] py-16 px-6">
        <div className="max-w-[1280px] mx-auto flex flex-col items-center gap-8">
          <div className="flex items-center gap-3">
            <GraduationCap className="h-5 w-5 text-[#565e74] opacity-40" />
            <span className="font-semibold text-lg text-[#565e74]">MahaPoly</span>
          </div>
          <div className="text-center max-w-xl space-y-2">
            <p className="text-xs text-[#565e74]/70 leading-relaxed">
              Disclaimer: MahaPoly is an independent tool built on historical DTE Maharashtra CAP cutoff data. It is
              not affiliated with DTE Maharashtra. Predictions do not guarantee admission — always verify against
              your official CAP login.
            </p>
            <p className="text-xs text-[#565e74]/60 tracking-widest uppercase">© 2026 MahaPoly.</p>
          </div>
        </div>
      </footer>

      <style jsx global>{`
        @keyframes scroll {
          from { transform: translateX(0); }
          to { transform: translateX(-50%); }
        }
      `}</style>
    </div>
  );
}
