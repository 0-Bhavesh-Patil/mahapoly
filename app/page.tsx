"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Search, Activity, ShieldCheck, Database, Info } from "lucide-react";
import SpatialLoader from "../components/SpatialLoader";

// Simulated Data Structure
const CATEGORIES = [
  { id: "OPEN", label: "Open", color: "bg-[#F4F6FA] text-black" },
  { id: "OBC", label: "OBC", color: "bg-[#5B6CFF] text-white" },
  { id: "SC", label: "SC", color: "bg-[#9D4EDD] text-white" },
  { id: "EWS", label: "EWS", color: "bg-[#10B981] text-white" }
];

export default function MahaPolyDashboard() {
  const [isBooting, setIsBooting] = useState(true);
  const [merit, setMerit] = useState<string>("");
  const [category, setCategory] = useState("OPEN");
  const [round, setRound] = useState<number[]>([1]);

  useEffect(() => {
    // Cache check for boot sequence
    if (sessionStorage.getItem("mahapoly-booted")) {
      setIsBooting(false);
    }
  }, []);

  const finishBoot = () => {
    setIsBooting(false);
    sessionStorage.setItem("mahapoly-booted", "true");
  };

  return (
    <div className="min-h-screen bg-[#0B0E14] text-[#F4F6FA] font-ui selection:bg-[#5B6CFF] selection:text-white flex flex-col">
      
      <AnimatePresence>
        {isBooting && <SpatialLoader onComplete={finishBoot} />}
      </AnimatePresence>

      {/* 1. BRAND HEADER */}
      <header className="border-b border-[#141922] px-6 py-4 flex items-center justify-between bg-[#0B0E14]/80 backdrop-blur-md sticky top-0 z-40">
        <div className="flex items-center gap-4">
          <Activity className="text-[#5B6CFF]" />
          <div>
            <h1 className="font-display font-bold text-lg tracking-tight leading-none">MAHAPOLY <span className="text-[#8A93A6] font-normal">ENGINE</span></h1>
          </div>
        </div>
        <div className="hidden md:flex items-center gap-2 px-3 py-1 bg-[#33D69F]/10 border border-[#33D69F]/20 rounded-full">
          <div className="w-2 h-2 rounded-full bg-[#33D69F] animate-pulse" />
          <span className="font-mono text-[10px] text-[#33D69F] uppercase tracking-widest font-bold">DTE Data Indexed</span>
        </div>
      </header>

      {/* MAIN LAYOUT */}
      <main className="flex-1 max-w-[1600px] w-full mx-auto grid grid-cols-1 lg:grid-cols-12 gap-8 p-6">
        
        {/* LEFT RAIL: PERSISTENT STEPPER & FILTERS */}
        <aside className="lg:col-span-4 xl:col-span-3 space-y-8">
          
          <div className="bg-[#141922] border border-[#2A3441] p-6 rounded-xl space-y-8 sticky top-24">
            {/* STEP 1: MERIT */}
            <div>
              <label className="font-mono text-xs text-[#8A93A6] uppercase tracking-widest mb-3 block">01 / Merit Score</label>
              <input 
                type="number" 
                placeholder="00.00"
                value={merit}
                onChange={(e) => setMerit(e.target.value)}
                className="w-full bg-transparent border-b-2 border-[#2A3441] pb-2 text-[clamp(2rem,3vw,3rem)] font-display font-bold text-[#F4F6FA] placeholder:text-[#2A3441] focus:border-[#5B6CFF] outline-none transition-colors tabular-nums"
              />
            </div>

            {/* STEP 2: CATEGORY (Semantic Colors) */}
            <div>
              <div className="flex justify-between items-center mb-3">
                <label className="font-mono text-xs text-[#8A93A6] uppercase tracking-widest block">02 / Category</label>
                <Info size={14} className="text-[#8A93A6] cursor-help" />
              </div>
              <div className="flex flex-wrap gap-2">
                {CATEGORIES.map(c => (
                  <button 
                    key={c.id} 
                    onClick={() => setCategory(c.id)}
                    className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-all ${category === c.id ? c.color + " shadow-[0_0_15px_currentColor]" : "bg-[#0B0E14] text-[#8A93A6] border border-[#2A3441] hover:border-[#8A93A6]"}`}
                  >
                    {c.label}
                  </button>
                ))}
              </div>
            </div>

            {/* STEP 3: CAP ROUND */}
            <div>
              <label className="font-mono text-xs text-[#8A93A6] uppercase tracking-widest mb-3 block">03 / CAP Round</label>
              <div className="flex gap-2">
                {[1, 2, 3].map(r => (
                  <button 
                    key={r}
                    onClick={() => setRound(prev => prev.includes(r) ? prev.filter(x => x !== r) : [...prev, r])}
                    className={`flex-1 py-2 text-xs font-bold font-mono rounded-md transition-colors border ${round.includes(r) ? "bg-[#5B6CFF] border-[#5B6CFF] text-white" : "bg-transparent border-[#2A3441] text-[#8A93A6] hover:border-[#8A93A6]"}`}
                  >
                    R{r}
                  </button>
                ))}
              </div>
              <p className="text-[10px] text-[#8A93A6] mt-2 font-ui">Cutoffs generally decrease in later rounds.</p>
            </div>
          </div>
        </aside>

        {/* RIGHT RAIL: DATA HONEST RESULTS */}
        <section className="lg:col-span-8 xl:col-span-9">
          
          {!merit ? (
            <div className="h-full min-h-[60vh] flex flex-col items-center justify-center border border-dashed border-[#2A3441] rounded-xl bg-[#141922]/50">
              <Search className="w-12 h-12 text-[#2A3441] mb-6" />
              <h2 className="font-display text-2xl font-bold text-[#F4F6FA] mb-2">Awaiting Parameters</h2>
              <p className="text-[#8A93A6] text-sm">Input your merit score to initiate real-time cutoff indexing.</p>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="flex items-center justify-between pb-4 border-b border-[#141922]">
                <h3 className="font-mono text-xs text-[#8A93A6] uppercase tracking-widest">Matched Vectors</h3>
                <span className="text-xs text-[#8A93A6]">Ranked by Delta</span>
              </div>

              {/* DENSE DESKTOP TABLE / MOBILE CARDS */}
              <div className="bg-[#141922] border border-[#2A3441] rounded-xl overflow-x-auto">
                <table className="w-full text-left">
                  <thead className="bg-[#0B0E14] border-b border-[#2A3441] font-mono text-[10px] text-[#8A93A6] uppercase tracking-widest">
                    <tr>
                      <th className="px-6 py-4">Institution</th>
                      <th className="px-6 py-4">Branch</th>
                      <th className="px-6 py-4 text-right">Historic Cutoff</th>
                      <th className="px-6 py-4">Delta Margin</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#2A3441]">
                    {/* Mock Data Row - Eligible */}
                    <tr className="hover:bg-[#0B0E14] transition-colors">
                      <td className="px-6 py-4">
                        <p className="font-bold text-sm text-[#F4F6FA]">Government Polytechnic, Pune</p>
                        <p className="font-mono text-[10px] text-[#8A93A6] mt-1">ID: 6015</p>
                      </td>
                      <td className="px-6 py-4 text-sm text-[#F4F6FA]">Computer Engineering</td>
                      <td className="px-6 py-4 font-mono font-bold text-right text-[#F4F6FA]">89.50%</td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="flex-1 h-1.5 bg-[#0B0E14] rounded-full overflow-hidden">
                            <div className="h-full bg-[#33D69F] w-[85%]" />
                          </div>
                          <span className="font-mono text-xs font-bold text-[#33D69F]">+2.40%</span>
                        </div>
                      </td>
                    </tr>
                    
                    {/* Mock Data Row - Borderline */}
                    <tr className="hover:bg-[#0B0E14] transition-colors">
                      <td className="px-6 py-4">
                        <p className="font-bold text-sm text-[#F4F6FA]">VJTI, Mumbai</p>
                        <p className="font-mono text-[10px] text-[#8A93A6] mt-1">ID: 3012</p>
                      </td>
                      <td className="px-6 py-4 text-sm text-[#F4F6FA]">Information Technology</td>
                      <td className="px-6 py-4 font-mono font-bold text-right text-[#F4F6FA]">91.80%</td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="flex-1 h-1.5 bg-[#0B0E14] rounded-full overflow-hidden">
                            <div className="h-full bg-[#FFB020] w-[95%]" />
                          </div>
                          <span className="font-mono text-xs font-bold text-[#FFB020]">+0.10%</span>
                        </div>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </section>
      </main>

      {/* 13. TRUST DISCLAIMER FOOTER */}
      <footer className="bg-[#141922] border-t border-[#2A3441] py-6 px-6 mt-12">
        <div className="max-w-[1600px] mx-auto flex flex-col md:flex-row items-center gap-4 text-center md:text-left">
          <ShieldCheck className="text-[#5B6CFF] shrink-0" />
          <p className="text-xs text-[#8A93A6] font-ui max-w-3xl">
            <strong className="text-[#F4F6FA]">Decision-Support Tool:</strong> This engine aggregates historical CAP round data to forecast probabilities. Cutoffs fluctuate annually. Always verify final seat matrices with the official <span className="text-[#5B6CFF]">Maharashtra CET Cell / DTE portal</span> prior to submitting option forms.
          </p>
        </div>
      </footer>
    </div>
  );
}