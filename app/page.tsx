"use client";

import Link from "next/link";
import { ArrowRight, GraduationCap, ListChecks, Target } from "lucide-react";
import { DATA, FLAT } from "../lib/data";

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
    <div className="min-h-screen bg-white text-[#191b23]">
      {/* Header */}
      <header className="backdrop-blur-md bg-white/70 border-b border-black/[0.05] sticky top-0 z-30">
        <div className="max-w-[1280px] mx-auto px-4 h-[72px] flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-md bg-[#3b82f6]/10 border border-[#3b82f6]/20 flex items-center justify-center">
              <GraduationCap className="h-4.5 w-4.5 text-[#3b82f6]" />
            </div>
            <span className="font-bold text-[22px] tracking-tight">MahaPoly</span>
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
              className="px-5 py-2 rounded-full text-sm font-medium text-white bg-[#3b82f6] shadow-[0_0_20px_rgba(59,130,246,0.3)] hover:brightness-110 transition-all"
            >
              Get Started
            </Link>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="relative overflow-hidden pt-16 pb-24 px-6">
        <div
          className="pointer-events-none absolute -top-64 left-1/2 -translate-x-1/2 w-[800px] h-[800px] rounded-full blur-[80px] opacity-60"
          style={{ background: "radial-gradient(circle, rgba(59,130,246,0.15), transparent 60%)" }}
        />
        <div
          className="pointer-events-none absolute -bottom-48 -right-48 w-[800px] h-[800px] rounded-full blur-[80px] opacity-40"
          style={{ background: "radial-gradient(circle, rgba(139,92,246,0.15), transparent 60%)" }}
        />
        <div className="relative max-w-[1280px] mx-auto flex flex-col items-center text-center">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/50 backdrop-blur border border-black/[0.05] shadow-sm mb-8">
            <span className="w-1.5 h-1.5 rounded-full bg-[#10b981]" />
            <span className="text-xs font-medium text-[#424754] tracking-wide">Live CAP Data 2026</span>
          </div>
          <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight leading-[1.05] bg-gradient-to-b from-[#191b23] to-[#565e74] bg-clip-text text-transparent max-w-4xl">
            Find the right Polytechnic college for your merit.
          </h1>
          <p className="mt-8 text-lg text-[#565e74] max-w-2xl leading-relaxed">
            Navigate the complex admissions process with clarity. Get personalized college recommendations based on
            your exact merit and category, drawn from real CAP cutoff records.
          </p>
          <div className="mt-10 flex flex-col sm:flex-row gap-4">
            <Link
              href="/onboarding"
              className="inline-flex items-center gap-2 px-8 py-4 rounded-full text-sm font-medium text-white bg-[#3b82f6] shadow-[0_0_30px_rgba(59,130,246,0.4)] hover:brightness-110 transition-all"
            >
              Check My Chances <ArrowRight className="h-3.5 w-3.5" />
            </Link>
            <Link
              href="/results"
              className="inline-flex items-center px-8 py-4 rounded-full text-sm font-medium bg-white/50 backdrop-blur border border-black/[0.05] hover:bg-white transition-colors"
            >
              Explore Cut-offs
            </Link>
          </div>

          {/* Floating preview card */}
          <div className="mt-20 w-full max-w-3xl">
            <div className="relative rounded-3xl backdrop-blur-xl bg-white/60 border border-black/[0.08] p-1.5 shadow-[0_24px_60px_rgba(0,0,0,0.08)]">
              <div className="absolute -top-5 -right-5 bg-white border border-[#10b981]/20 rounded-full px-4 py-2 shadow-lg flex items-center gap-2">
                <Target className="h-3 w-3 text-[#059669]" />
                <span className="text-[11px] font-medium text-[#059669] tracking-wide uppercase">
                  High Probability Match
                </span>
              </div>
              <div className="bg-white/90 rounded-[20px] border border-black/[0.05] p-8 md:p-10 grid md:grid-cols-2 gap-8 items-center text-left">
                <div>
                  <h3 className="text-xl md:text-2xl font-semibold tracking-tight mb-2">Your Profile Prediction</h3>
                  <p className="text-[#565e74] mb-6">Merit Score: 82.40%</p>
                  <div className="bg-white border border-black/[0.05] rounded-xl p-4 shadow-sm mb-3">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm text-[#565e74]">Matching Colleges</span>
                      <span className="text-lg font-medium text-[#3b82f6]">12</span>
                    </div>
                    <div className="h-1 rounded-full bg-[#e1e2ec]">
                      <div className="h-1 rounded-full bg-[#3b82f6] w-[70%]" />
                    </div>
                  </div>
                  <div className="bg-white border border-black/[0.04] rounded-xl p-3.5 flex items-center justify-between">
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
                  <div className="relative w-40 h-40 rounded-full border-8 border-[#eff6ff] flex items-center justify-center">
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
      <div className="border-y border-black/[0.04] bg-black/[0.01] overflow-hidden py-4">
        <div className="flex gap-16 whitespace-nowrap animate-[scroll_30s_linear_infinite]">
          {[...TICKER_ITEMS, ...TICKER_ITEMS].map((t, i) => (
            <span key={i} className="flex items-center gap-2 text-sm font-medium text-[#565e74]">
              <span className="text-[#10b981]">●</span> {t}
            </span>
          ))}
        </div>
      </div>

      {/* Stats */}
      <section className="border-b border-black/[0.04] py-20 px-6">
        <div className="max-w-[1280px] mx-auto grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
          {[
            { value: `${DATA.colleges.length}+`, label: "Colleges" },
            { value: `${branchCount}`, label: "Branches" },
            { value: `${Math.round(recordCount / 1000)}k+`, label: "Records" },
            { value: "2026", label: "Data Year" },
          ].map((s, i) => (
            <div key={i} className={i > 0 ? "md:border-l border-black/[0.05] md:pl-8" : ""}>
              <div className="text-4xl md:text-5xl font-light tracking-tight">{s.value}</div>
              <div className="mt-3 text-xs font-medium text-[#565e74] tracking-[0.2em] uppercase">{s.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* How it works */}
      <section className="py-24 px-6">
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
                className="relative bg-white/50 border border-black/[0.05] rounded-3xl p-10 flex flex-col items-center text-center shadow-[0_4px_20px_rgba(0,0,0,0.02)]"
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
      <footer className="bg-[#f9f9ff] border-t border-black/[0.05] py-16 px-6">
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
