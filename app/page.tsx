"use client";

import { useMemo, useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Search, Building2, GraduationCap, Star, X, Share2, Printer, Check, Info, SlidersHorizontal, ChevronDown, ChevronUp, Cpu } from "lucide-react";
import raw from "../data.json";
import { decodeSeat, resolveSeatCodes, CATEGORY_OPTIONS, LEVEL_OPTIONS, CANDIDATURE_OPTIONS, GENDER_OPTIONS, type Candidature, type Gender, type Level } from "../lib/seatTypes";

// ---------- CORE DATA LAYER ----------
const DATA = raw as any;
const FLAT = DATA.colleges.flatMap((c: any, ci: number) => c.courses.flatMap(([b, c_offs]: any) => c_offs.map(([r, s, st, m]: any) => ({ ci, branch: b, round: r, seat: s, stage: st, merit: m }))));
const SEAT_INDEX = new Map(DATA.seatTypes.map((s: any, i: number) => [s, i]));
const BRANCH_LIST = DATA.branches.map((name: string, idx: number) => ({ idx, name })).sort((a, b) => a.name.localeCompare(b.name));

// ---------- ENTERPRISE UI ATOMS ----------

function StatusBadge({ status }: { status: string }) {
  const isGovt = status.startsWith("Government") && !status.includes("Aided");
  return (
    <span className={`px-2 py-0.5 text-[9px] font-bold tracking-widest uppercase rounded border ${isGovt ? "bg-blue-900/20 border-blue-900 text-blue-400" : "bg-zinc-800 border-zinc-700 text-zinc-400"}`}>
      {status}
    </span>
  );
}

function LoadingSkeleton() {
  return (
    <div className="space-y-4">
      {[1, 2, 3, 4, 5].map((i) => (
        <div key={i} className="h-24 w-full bg-zinc-900 rounded-2xl animate-pulse border border-zinc-800" />
      ))}
    </div>
  );
}

// ---------- MATCH ENGINE LOGIC ----------

export default function PolytechnicDashboard() {
  const [mode, setMode] = useState<"engine" | "directory" | "shortlist">("engine");
  const [shortlist, setShortlist] = useState<Set<string>>(new Set());
  const [merit, setMerit] = useState("");
  const [category, setCategory] = useState("OPEN");
  const [candidature, setCandidature] = useState<Candidature>("N");
  const [gender, setGender] = useState<Gender>("G");
  const [level, setLevel] = useState<Level>("H");
  const [round, setRound] = useState(1);
  const [branchFilter, setBranchFilter] = useState<Set<number>>(new Set());
  const [loading, setLoading] = useState(false);

  // Logic to process the raw data
  const results = useMemo(() => {
    if (!merit) return [];
    setLoading(true);
    const meritNum = parseFloat(merit);
    const codes = resolveSeatCodes({ category, candidature, gender, level });
    const seatIdxs = new Set(codes.map((c) => SEAT_INDEX.get(c)).filter((v): v is number => v !== undefined));
    const best = new Map<string, any>();
    
    for (const row of FLAT) {
      if (row.round !== round || !seatIdxs.has(row.seat) || row.merit > meritNum) continue;
      if (branchFilter.size > 0 && !branchFilter.has(row.branch)) continue;
      const key = `${row.ci}-${row.branch}`;
      if (!best.has(key) || row.merit > best.get(key)!.merit) best.set(key, row);
    }
    setTimeout(() => setLoading(false), 400);
    return Array.from(best.values()).sort((a, b) => b.merit - a.merit);
  }, [merit, category, candidature, gender, level, round, branchFilter]);

  const toggleShortlist = (key: string) => {
    setShortlist(prev => {
      const next = new Set(prev);
      next.has(key) ? next.delete(key) : next.add(key);
      return next;
    });
  };

  return (
    <div className="min-h-screen bg-[#030303] text-zinc-100 font-sans selection:bg-white selection:text-black">
      <main className="max-w-[1600px] mx-auto p-6 md:p-12">
        
        {/* HEADER */}
        <header className="flex justify-between items-center mb-16 border-b border-zinc-900 pb-8">
          <div>
            <h1 className="text-3xl font-light tracking-tight text-white">MAHA<span className="font-bold text-zinc-500">POLY</span></h1>
            <p className="text-[10px] uppercase tracking-[0.2em] text-zinc-600 mt-1">Enterprise Admission Engine</p>
          </div>
          <nav className="flex gap-1 bg-[#0A0A0A] p-1 rounded-full border border-zinc-900">
            {["engine", "directory", "shortlist"].map((m) => (
              <button key={m} onClick={() => setMode(m as any)} className={`px-6 py-2 rounded-full text-[10px] font-bold uppercase tracking-widest transition-all ${mode === m ? "bg-white text-black" : "text-zinc-600 hover:text-white"}`}>
                {m}
              </button>
            ))}
          </nav>
        </header>

        {/* DASHBOARD GRID */}
        <div className="grid grid-cols-12 gap-12">
          
          {/* CONTROL SIDEBAR */}
          <aside className="col-span-12 lg:col-span-4 xl:col-span-3">
             <div className="bg-[#050505] border border-zinc-900 rounded-[2rem] p-8 sticky top-8">
               <div className="mb-8">
                 <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest mb-3 block">Target Merit %</label>
                 <input 
                   value={merit} onChange={(e) => setMerit(e.target.value)}
                   className="w-full text-5xl font-black bg-transparent outline-none tabular-nums text-white placeholder-zinc-800" placeholder="00.00"
                 />
               </div>
               
               <div className="space-y-6">
                 <div>
                    <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest mb-3 block">Selection Matrix</label>
                    <select className="w-full p-4 bg-[#0A0A0A] border border-zinc-900 rounded-xl text-sm" value={category} onChange={(e) => setCategory(e.target.value)}>
                       {CATEGORY_OPTIONS.map(c => <option key={c.value} value={c.value}>{c.label}</option>)}
                    </select>
                 </div>
                 
                 <div className="flex gap-2">
                    {[1,2,3,4].map(r => (
                      <button key={r} onClick={() => setRound(r)} className={`flex-1 py-3 text-xs font-bold rounded-lg transition-all ${round === r ? "bg-white text-black" : "bg-zinc-900 text-zinc-500"}`}>R{r}</button>
                    ))}
                 </div>
               </div>
             </div>
          </aside>

          {/* DATA STAGE */}
          <section className="col-span-12 lg:col-span-8 xl:col-span-9">
            {loading ? <LoadingSkeleton /> : (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="grid gap-4">
                 {results.map((r, i) => {
                   const col = DATA.colleges[r.ci];
                   const key = `${r.ci}-${r.branch}`;
                   const starred = shortlist.has(key);
                   return (
                     <motion.div 
                       key={i}
                       initial={{ opacity: 0, x: 20 }}
                       animate={{ opacity: 1, x: 0 }}
                       transition={{ delay: i * 0.02 }}
                       className="flex items-center justify-between bg-[#050505] border border-zinc-900 p-6 rounded-2xl hover:border-zinc-700 transition-all"
                     >
                       <div className="flex items-center gap-6">
                         <div className="w-12 h-12 flex items-center justify-center bg-[#0A0A0A] rounded-xl border border-zinc-900 font-mono text-sm text-zinc-400">{col.code}</div>
                         <div>
                           <h3 className="text-sm font-bold text-white">{col.name}</h3>
                           <p className="text-xs text-zinc-500 mt-1">{DATA.branches[r.branch]}</p>
                         </div>
                       </div>
                       <div className="flex items-center gap-8">
                         <div className="text-right">
                           <p className="text-lg font-black tabular-nums">{r.merit.toFixed(2)}%</p>
                           <p className="text-[10px] text-zinc-500 uppercase tracking-widest">Cutoff</p>
                         </div>
                         <button onClick={() => toggleShortlist(key)} className={starred ? "text-white" : "text-zinc-700"}>
                           <Star size={20} fill={starred ? "currentColor" : "none"} />
                         </button>
                       </div>
                     </motion.div>
                   )
                 })}
              </motion.div>
            )}
          </section>
        </div>
      </main>
    </div>
  );
}