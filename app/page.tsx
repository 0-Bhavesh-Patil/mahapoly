"use client";

import { useMemo, useState, useEffect } from "react";
import { motion, AnimatePresence, useMotionValue, useSpring, useTransform } from "framer-motion";
import {
  Search, Building2, ChevronDown, ChevronUp, GraduationCap, SlidersHorizontal,
  Star, X, Share2, Printer, Check, Cpu, Database, Layers, ArrowRight, Activity, MapPin
} from "lucide-react";
import raw from "../data.json";
import {
  decodeSeat, resolveSeatCodes, CATEGORY_OPTIONS, LEVEL_OPTIONS,
  CANDIDATURE_OPTIONS, GENDER_OPTIONS, type Candidature, type Gender, type Level
} from "../lib/seatTypes";

// ==========================================
// 1. CORE DATA LAYER (STRICTLY PRESERVED)
// ==========================================
const DATA = raw as any;
const FLAT = DATA.colleges.flatMap((c: any, ci: number) => c.courses.flatMap(([b, c_offs]: any) => c_offs.map(([r, s, st, m]: any) => ({ ci, branch: b, round: r, seat: s, stage: st, merit: m }))));
const SEAT_INDEX = new Map(DATA.seatTypes.map((s: any, i: number) => [s, i]));
const BRANCH_LIST = DATA.branches.map((name: string, idx: number) => ({ idx, name })).sort((a, b) => a.name.localeCompare(b.name));

// ==========================================
// 2. SPATIAL 3D ATOMS & PHYSICS
// ==========================================

// 3D Tilt Card Wrapper
const SpatialCard = ({ children, className }: { children: React.ReactNode, className?: string }) => {
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const mouseXSpring = useSpring(x);
  const mouseYSpring = useSpring(y);
  const rotateX = useTransform(mouseYSpring, [-0.5, 0.5], ["7deg", "-7deg"]);
  const rotateY = useTransform(mouseXSpring, [-0.5, 0.5], ["-7deg", "7deg"]);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const width = rect.width;
    const height = rect.height;
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;
    const xPct = mouseX / width - 0.5;
    const yPct = mouseY / height - 0.5;
    x.set(xPct);
    y.set(yPct);
  };

  const handleMouseLeave = () => {
    x.set(0);
    y.set(0);
  };

  return (
    <motion.div
      style={{ rotateX, rotateY, transformStyle: "preserve-3d" }}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      className={`relative perspective-[1000px] ${className}`}
    >
      <div style={{ transform: "translateZ(30px)", transformStyle: "preserve-3d" }} className="w-full h-full">
        {children}
      </div>
    </motion.div>
  );
};

// ==========================================
// 3. THE 3 LOADING ANIMATIONS
// ==========================================

// Loader 1: Global System Boot (3D Gyroscope)
function SystemBootLoader({ onComplete }: { onComplete: () => void }) {
  useEffect(() => { const t = setTimeout(onComplete, 2800); return () => clearTimeout(t); }, [onComplete]);
  return (
    <motion.div exit={{ opacity: 0, scale: 1.1, filter: "blur(10px)" }} transition={{ duration: 0.8 }} className="fixed inset-0 z-[100] bg-[#020202] flex flex-col items-center justify-center">
      <div className="relative w-40 h-40 perspective-[1000px]">
        <motion.div animate={{ rotateX: [0, 360], rotateY: [0, 360] }} transition={{ duration: 3, repeat: Infinity, ease: "linear" }} className="w-full h-full absolute border border-cyan-500/50 rounded-full" style={{ transformStyle: "preserve-3d" }} />
        <motion.div animate={{ rotateX: [360, 0], rotateY: [0, 360] }} transition={{ duration: 2.5, repeat: Infinity, ease: "linear" }} className="w-full h-full absolute border border-blue-500/50 rounded-full" style={{ transformStyle: "preserve-3d", transform: "rotateZ(45deg)" }} />
        <div className="absolute inset-0 flex items-center justify-center"><Cpu className="text-cyan-400 w-8 h-8 animate-pulse" /></div>
      </div>
      <div className="mt-12 space-y-2 text-center">
        <h2 className="text-white font-black tracking-[0.3em] text-xl">MAHAPOLY ENGINE</h2>
        <p className="text-cyan-500/60 font-mono text-xs uppercase tracking-widest animate-pulse">Initializing Spatial Matrices...</p>
      </div>
    </motion.div>
  );
}

// Loader 2: Matrix Query Scanner (Grid Skeleton)
function MatrixScanner() {
  return (
    <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 w-full">
      {[1, 2, 3, 4].map(i => (
        <div key={i} className="bg-[#0A0A0A] border border-[#1A1A1A] rounded-2xl h-40 relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-[2px] bg-cyan-400/50 shadow-[0_0_15px_#00E5FF] animate-[scan_1.5s_ease-in-out_infinite]" />
          <div className="p-6 h-full flex flex-col justify-between opacity-30">
            <div className="flex justify-between"><div className="w-20 h-4 bg-[#222] rounded" /><div className="w-8 h-8 bg-[#222] rounded" /></div>
            <div className="w-3/4 h-6 bg-[#333] rounded" />
            <div className="flex justify-between items-end"><div className="w-1/2 h-3 bg-[#222] rounded" /><div className="w-16 h-8 bg-[#222] rounded" /></div>
          </div>
        </div>
      ))}
    </div>
  );
}

// Loader 3: Action Micro-Loader
function ActionSpinner() {
  return <div className="w-5 h-5 border-2 border-zinc-600 border-t-cyan-400 rounded-full animate-spin" />;
}

// ==========================================
// 4. MATURE SPATIAL ONBOARDING
// ==========================================
function SystemArchitectureGuide({ onDismiss }: { onDismiss: () => void }) {
  const [step, setStep] = useState(0);
  const steps = [
    { icon: <SlidersHorizontal size={32} />, title: "Parameter Calibration", desc: "Input your precise merit variables into the side control matrix. The engine processes real-time strict filtering against historic databases." },
    { icon: <Database size={32} />, title: "Spatial Data Analysis", desc: "Results are rendered as 3D spatial cards. Hover to inspect delta margins and exact historical thresholds." },
    { icon: <Layers size={32} />, title: "Staging & Export", desc: "Engage the star protocol to stage optimal vectors. The system generates a compliant, printable Option Form instantly." }
  ];

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-2xl p-4">
      <div className="w-full max-w-4xl relative perspective-[1200px]">
        <AnimatePresence mode="wait">
          <motion.div key={step} initial={{ opacity: 0, rotateY: 20, z: -100 }} animate={{ opacity: 1, rotateY: 0, z: 0 }} exit={{ opacity: 0, rotateY: -20, z: -100 }} transition={{ duration: 0.5 }} className="bg-[#050505] border border-[#1A1A1A] rounded-[2rem] p-10 md:p-16 flex flex-col md:flex-row items-center gap-12 shadow-[0_0_50px_rgba(0,0,0,0.8)]" style={{ transformStyle: "preserve-3d" }}>
            <div className="w-40 h-40 shrink-0 bg-gradient-to-br from-[#111] to-[#0A0A0A] border border-[#222] rounded-3xl flex items-center justify-center text-cyan-400 shadow-[0_0_30px_rgba(6,182,212,0.15)]" style={{ transform: "translateZ(50px)" }}>
              {steps[step].icon}
            </div>
            <div className="flex-1 text-center md:text-left">
              <h2 className="text-xs font-mono text-cyan-400 tracking-[0.3em] uppercase mb-2" style={{ transform: "translateZ(30px)" }}>System Guide {step + 1}/3</h2>
              <h3 className="text-3xl md:text-4xl font-black text-white tracking-tight mb-4" style={{ transform: "translateZ(40px)" }}>{steps[step].title}</h3>
              <p className="text-[#888] text-sm md:text-base leading-relaxed" style={{ transform: "translateZ(20px)" }}>{steps[step].desc}</p>
              
              <div className="mt-10 flex items-center gap-4 justify-center md:justify-start" style={{ transform: "translateZ(40px)" }}>
                {step < 2 ? (
                  <button onClick={() => setStep(s => s + 1)} className="px-8 py-3 bg-white text-black text-sm font-bold uppercase tracking-widest rounded-full hover:bg-cyan-400 transition-colors">Next Sequence</button>
                ) : (
                  <button onClick={onDismiss} className="px-8 py-3 bg-cyan-500 text-black text-sm font-bold uppercase tracking-widest rounded-full shadow-[0_0_20px_rgba(6,182,212,0.4)] hover:bg-white transition-colors">Initialize Engine</button>
                )}
                <button onClick={onDismiss} className="px-6 py-3 text-sm font-bold text-[#666] hover:text-white uppercase tracking-widest">Skip</button>
              </div>
            </div>
          </motion.div>
        </AnimatePresence>
      </div>
    </motion.div>
  );
}

// ==========================================
// 5. THE ENGINE VIEWS
// ==========================================

function MatchMode({ shortlist, toggleShortlist }: { shortlist: Set<string>; toggleShortlist: (key: string) => void; }) {
  const [merit, setMerit] = useState<string>("");
  const [category, setCategory] = useState("OPEN");
  const [candidature, setCandidature] = useState<Candidature>("N");
  const [gender, setGender] = useState<Gender>("G");
  const [level, setLevel] = useState<Level>("H");
  const [round, setRound] = useState(1);
  const [branchFilter, setBranchFilter] = useState<Set<number>>(new Set());
  const [branchQuery, setBranchQuery] = useState("");
  const [isCalculating, setIsCalculating] = useState(false);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  const isSpecialCategory = ["EWS", "TFWS", "DEFOPENS", "ORPHAN", "PWDOPENH"].includes(category);
  const meritNum = parseFloat(merit);
  const hasValidMerit = merit.trim() !== "" && !isNaN(meritNum) && meritNum >= 0 && meritNum <= 100;

  useEffect(() => {
    if (hasValidMerit) {
      setIsCalculating(true);
      const timer = setTimeout(() => setIsCalculating(false), 800);
      return () => clearTimeout(timer);
    }
  }, [merit, category, candidature, gender, level, round, branchFilter, hasValidMerit]);

  const results = useMemo(() => {
    if (!hasValidMerit) return [];
    const codes = resolveSeatCodes({ category, candidature, gender, level });
    const seatIdxs = new Set(codes.map((c) => SEAT_INDEX.get(c)).filter((v): v is number => v !== undefined));
    if (seatIdxs.size === 0) return [];

    const best = new Map<string, any>();
    for (const row of FLAT) {
      if (row.round !== round || !seatIdxs.has(row.seat) || row.merit > meritNum) continue;
      if (branchFilter.size > 0 && !branchFilter.has(row.branch)) continue;
      const key = `${row.ci}-${row.branch}`;
      if (!best.has(key) || row.merit > best.get(key)!.merit) best.set(key, row);
    }
    return Array.from(best.values()).sort((a, b) => b.merit - a.merit);
  }, [hasValidMerit, meritNum, category, candidature, gender, level, round, branchFilter]);

  const filteredBranchList = branchQuery ? BRANCH_LIST.filter((b) => b.name.toLowerCase().includes(branchQuery.toLowerCase())) : BRANCH_LIST;

  const handleStageOption = (key: string) => {
    setActionLoading(key);
    setTimeout(() => {
      toggleShortlist(key);
      setActionLoading(null);
    }, 400); // Micro-interaction delay
  };

  return (
    <div className="grid grid-cols-1 xl:grid-cols-12 gap-8 w-full animate-in fade-in duration-500">
      
      {/* FULLY PRESERVED CONTROL SIDEBAR */}
      <aside className="xl:col-span-4 2xl:col-span-3">
        <div className="bg-[#050505] border border-[#1A1A1A] rounded-[2rem] p-6 lg:p-8 sticky top-8 shadow-2xl">
          <label className="text-[10px] font-mono text-cyan-500/70 uppercase tracking-[0.2em] mb-4 block">Target Merit Constraint</label>
          <input 
            type="number" step="0.01" placeholder="00.00" value={merit} onChange={(e) => setMerit(e.target.value)}
            className="w-full bg-transparent border-b border-[#222] pb-4 text-5xl font-black text-white placeholder:text-[#222] focus:outline-none focus:border-cyan-400 transition-colors mb-8"
          />

          <div className="space-y-6">
            <div>
              <label className="text-[10px] font-mono text-[#666] uppercase tracking-[0.2em] mb-2 block">Category Matrix</label>
              <select value={category} onChange={(e) => setCategory(e.target.value)} className="w-full bg-[#0A0A0A] border border-[#222] rounded-xl px-4 py-3 text-white focus:border-cyan-400 outline-none text-sm font-bold appearance-none">
                {CATEGORY_OPTIONS.map(c => <option key={c.value} value={c.value}>{c.label}</option>)}
              </select>
            </div>

            {!isSpecialCategory && (
              <div className="space-y-4 pt-4 border-t border-[#111]">
                <div className="flex gap-2">
                  {CANDIDATURE_OPTIONS.map(o => <button key={o.value} onClick={() => setCandidature(o.value as any)} className={`flex-1 py-2 rounded-lg text-xs font-bold uppercase transition-all border ${candidature === o.value ? "bg-white text-black border-white" : "bg-[#0A0A0A] border-[#222] text-[#666] hover:text-white"}`}>{o.label}</button>)}
                </div>
                <div className="flex gap-2">
                  {GENDER_OPTIONS.map(o => <button key={o.value} onClick={() => setGender(o.value as any)} className={`flex-1 py-2 rounded-lg text-xs font-bold uppercase transition-all border ${gender === o.value ? "bg-white text-black border-white" : "bg-[#0A0A0A] border-[#222] text-[#666] hover:text-white"}`}>{o.label}</button>)}
                </div>
                <div className="flex gap-2">
                  {LEVEL_OPTIONS.map(o => <button key={o.value} onClick={() => setLevel(o.value as any)} className={`flex-1 py-2 rounded-lg text-[10px] font-bold uppercase transition-all border ${level === o.value ? "bg-white text-black border-white" : "bg-[#0A0A0A] border-[#222] text-[#666] hover:text-white"}`}>{o.label}</button>)}
                </div>
              </div>
            )}

            <div className="pt-4 border-t border-[#111]">
               <label className="text-[10px] font-mono text-[#666] uppercase tracking-[0.2em] mb-2 block">CAP Round</label>
               <div className="flex gap-2">
                  {[1,2,3,4].map(r => <button key={r} onClick={() => setRound(r)} className={`flex-1 py-2 rounded-lg text-xs font-black transition-all ${round === r ? "bg-cyan-500 text-black shadow-[0_0_15px_rgba(6,182,212,0.4)]" : "bg-[#0A0A0A] border border-[#222] text-[#666] hover:text-white"}`}>R{r}</button>)}
               </div>
            </div>

            {/* PRESERVED BRANCH FILTER */}
            <details className="group pt-4 border-t border-[#111]">
              <summary className="flex justify-between items-center text-[10px] font-mono font-bold uppercase tracking-widest text-[#888] cursor-pointer hover:text-white transition-colors">
                <span className="flex items-center gap-2"><SlidersHorizontal size={14}/> Branch Constraint {branchFilter.size > 0 && <span className="text-cyan-400">({branchFilter.size})</span>}</span>
                <ChevronDown size={14} className="group-open:rotate-180 transition-transform" />
              </summary>
              <div className="mt-4 bg-[#0A0A0A] border border-[#222] rounded-xl p-3 space-y-3">
                <input type="text" placeholder="Search parameters..." value={branchQuery} onChange={(e) => setBranchQuery(e.target.value)} className="w-full bg-[#050505] border border-[#222] rounded-lg px-3 py-2 text-xs outline-none text-white focus:border-cyan-400" />
                <div className="flex flex-col gap-1 max-h-40 overflow-y-auto custom-scrollbar">
                  {filteredBranchList.map(b => (
                    <button key={b.idx} onClick={() => { const next = new Set(branchFilter); branchFilter.has(b.idx) ? next.delete(b.idx) : next.add(b.idx); setBranchFilter(next); }} className={`px-3 py-2 text-left text-[10px] font-bold rounded-lg transition-colors ${branchFilter.has(b.idx) ? "bg-cyan-500/20 text-cyan-400" : "text-[#666] hover:bg-[#111] hover:text-white"}`}>
                      {b.name}
                    </button>
                  ))}
                </div>
              </div>
            </details>
          </div>
        </div>
      </aside>

      {/* SPATIAL DATA RENDERER */}
      <main className="xl:col-span-8 2xl:col-span-9 w-full">
        {!hasValidMerit ? (
          <div className="flex flex-col items-center justify-center h-full min-h-[500px] border border-dashed border-[#222] rounded-[2rem] bg-[#050505]/50">
            <Activity className="h-12 w-12 text-[#222] mb-6" />
            <p className="text-2xl font-black text-[#444] uppercase tracking-widest">Awaiting Parameters</p>
          </div>
        ) : isCalculating ? (
          <MatrixScanner />
        ) : results.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full min-h-[500px] border border-dashed border-[#222] rounded-[2rem] bg-[#050505]/50">
            <p className="text-3xl font-black text-white tracking-tighter">0 VECTORS IDENTIFIED</p>
            <p className="text-sm font-mono text-[#666] mt-2 uppercase tracking-widest">Adjust constraints to broaden search.</p>
          </div>
        ) : (
          <div className="space-y-6">
            <div className="flex items-center gap-4">
               <div className="h-px bg-[#222] flex-1" />
               <span className="text-[10px] font-mono font-bold text-cyan-400 uppercase tracking-widest">{results.length} Valid Options</span>
               <div className="h-px bg-[#222] flex-1" />
            </div>

            <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
              {results.map(r => {
                const college = DATA.colleges[r.ci];
                const key = `${r.ci}-${r.branch}-${r.round}-${r.seat}`;
                const starred = shortlist.has(key);
                const isLoadingAction = actionLoading === key;

                return (
                  <SpatialCard key={key} className="h-full">
                    <div className="bg-gradient-to-br from-[#0A0A0A] to-[#050505] border border-[#1A1A1A] p-6 rounded-2xl h-full flex flex-col justify-between hover:border-[#333] transition-colors shadow-[0_10px_30px_rgba(0,0,0,0.5)]">
                      <div className="mb-6">
                        <div className="flex justify-between items-center mb-3">
                          <span className="px-2 py-0.5 bg-[#111] text-[#666] text-[9px] font-mono uppercase tracking-widest rounded border border-[#222]">SYS_ID: {college.code}</span>
                          <span className="px-2 py-0.5 bg-blue-900/20 text-blue-400 text-[9px] font-bold uppercase tracking-widest rounded border border-blue-900/50">{college.status}</span>
                        </div>
                        <h3 className="text-lg font-bold text-white leading-tight mb-2 pr-4">{college.name}</h3>
                        <p className="text-xs text-[#888] font-medium flex items-center gap-2"><GraduationCap size={14} className="text-purple-500" /> {DATA.branches[r.branch]}</p>
                      </div>

                      <div className="flex items-end justify-between border-t border-[#111] pt-4">
                        <div>
                          <p className="text-[9px] font-mono text-[#666] uppercase tracking-widest mb-1">Delta Margin</p>
                          <p className={`text-sm font-black tabular-nums ${(meritNum - r.merit) >= 5 ? "text-emerald-400" : "text-cyan-400"}`}>+{(meritNum - r.merit).toFixed(2)}%</p>
                        </div>
                        <div className="text-right flex items-center gap-4">
                          <div>
                            <p className="text-[9px] font-mono text-[#666] uppercase tracking-widest mb-1">Threshold</p>
                            <p className="text-xl font-black text-white tabular-nums">{r.merit.toFixed(2)}%</p>
                          </div>
                          <button
                            onClick={() => handleStageOption(key)}
                            disabled={isLoadingAction}
                            className={`w-12 h-12 flex items-center justify-center rounded-xl border transition-all ${starred ? "bg-white text-black border-white shadow-[0_0_15px_rgba(255,255,255,0.3)]" : "bg-[#111] border-[#222] text-[#666] hover:text-white hover:border-[#444]"}`}
                          >
                            {isLoadingAction ? <ActionSpinner /> : <Star size={20} className={starred ? "fill-current" : ""} />}
                          </button>
                        </div>
                      </div>
                    </div>
                  </SpatialCard>
                );
              })}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

// ---------- DIRECTORY & OPTION FORM VIEWS ----------

function BrowseMode({ expandedCourse, setExpandedCourse }: { expandedCourse: string | null; setExpandedCourse: (val: string | null) => void; }) {
  const [query, setQuery] = useState("");
  const filtered = useMemo(() => {
    if (!query.trim()) return DATA.colleges.slice(0, 30);
    return DATA.colleges.filter((c: any) => c.name.toLowerCase().includes(query.toLowerCase()) || c.code.includes(query.toLowerCase()));
  }, [query]);

  return (
    <div className="w-full animate-in fade-in duration-500">
      <div className="max-w-3xl mx-auto mb-10 relative">
        <Search className="absolute left-6 top-5 h-6 w-6 text-[#444]" />
        <input type="text" placeholder="Query global database by name or ID..." value={query} onChange={(e) => setQuery(e.target.value)} className="w-full bg-[#050505] border border-[#1A1A1A] rounded-full pl-16 pr-6 py-5 text-white outline-none focus:border-cyan-400 font-mono text-sm transition-colors" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 2xl:grid-cols-3 gap-6">
        {filtered.map((college: any) => (
          <div key={college.code} className="bg-[#050505] border border-[#1A1A1A] rounded-[2rem] overflow-hidden flex flex-col">
            <div className="p-6 md:p-8 border-b border-[#111] flex-1">
              <span className="text-[10px] font-mono text-[#666] uppercase bg-[#111] px-2 py-1 rounded">ID: {college.code}</span>
              <h2 className="text-xl font-bold mt-4">{college.name}</h2>
            </div>
            <div className="p-4 bg-[#0A0A0A] space-y-2">
              {college.courses.map(([branchIdx, cutoffs]: any, idx: number) => {
                const courseId = `${college.code}-${idx}`;
                const isOpen = expandedCourse === courseId;
                return (
                  <div key={courseId} className="bg-[#050505] border border-[#111] rounded-xl overflow-hidden">
                    <button onClick={() => setExpandedCourse(isOpen ? null : courseId)} className="w-full p-4 flex justify-between items-center hover:bg-[#111]">
                      <span className="font-bold text-xs text-left pr-4">{DATA.branches[branchIdx]}</span>
                      {isOpen ? <ChevronUp size={16} className="text-cyan-400" /> : <ChevronDown size={16} className="text-[#666]" />}
                    </button>
                    {isOpen && (
                      <div className="border-t border-[#111] overflow-x-auto bg-[#020202]">
                        <table className="w-full text-left text-xs">
                          <thead className="text-[9px] font-mono text-[#666] uppercase tracking-widest"><tr className="bg-[#0A0A0A]"><th className="p-3">Rnd</th><th className="p-3">Type</th><th className="p-3 text-right">Cutoff</th></tr></thead>
                          <tbody className="divide-y divide-[#111]">
                            {cutoffs.slice().sort((a:any, b:any) => a[0] - b[0] || b[3] - a[3]).map(([round, seatIdx, stageIdx, merit]: any, cIdx: number) => (
                              <tr key={cIdx} className="hover:bg-[#111]">
                                <td className="p-3 font-bold">R{round}</td>
                                <td className="p-3"><span title={decodeSeat(DATA.seatTypes[seatIdx]).code} className="text-[#CCC] cursor-help">{decodeSeat(DATA.seatTypes[seatIdx]).label}</span></td>
                                <td className="p-3 font-black text-cyan-400 text-right tabular-nums">{merit.toFixed(2)}%</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function OptionFormMode({ shortlist, toggleShortlist }: { shortlist: Set<string>; toggleShortlist: (key: string) => void; }) {
  const rows = Array.from(shortlist).map(key => {
    const [ci, branchIdx, round, seatIdx] = key.split('-').map(Number);
    const college = DATA.colleges[ci];
    return { key, code: college.code, name: college.name, branch: DATA.branches[branchIdx], merit: FLAT.find(f => f.ci === ci && f.branch === branchIdx && f.round === round && f.seat === seatIdx)?.merit || 0 };
  });

  return (
    <div className="animate-in fade-in duration-500 w-full max-w-6xl mx-auto">
      <div className="hidden print:block mb-8 border-b-2 border-black pb-4"><h1 className="text-4xl font-black text-black">DTE Form 2026</h1></div>
      <div className="bg-[#050505] border border-[#1A1A1A] rounded-[2rem] p-8 md:p-12 print:bg-transparent print:border-none print:p-0 shadow-2xl">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-10 print:hidden">
          <div>
            <h2 className="text-3xl font-black text-white tracking-tighter">STAGED VECTORS</h2>
            <p className="text-xs font-mono text-[#666] mt-2 uppercase tracking-widest">Ready for portal execution.</p>
          </div>
          <button onClick={() => window.print()} disabled={shortlist.size === 0} className="px-8 py-4 bg-white text-black font-bold text-xs uppercase tracking-widest rounded-xl flex items-center gap-3 disabled:opacity-50 hover:bg-cyan-400 transition-colors shadow-[0_0_20px_rgba(255,255,255,0.2)]">
            <Printer size={18} /> Print Form
          </button>
        </div>

        {shortlist.size === 0 ? (
          <div className="py-32 text-center border border-dashed border-[#222] rounded-3xl bg-[#0A0A0A]">
            <p className="text-2xl font-black text-[#444] mb-2 tracking-tighter">0 STAGED OPTIONS</p>
          </div>
        ) : (
          <div className="overflow-x-auto border border-[#1A1A1A] rounded-2xl print:border-gray-300">
            <table className="w-full text-left print:text-black">
              <thead className="bg-[#0A0A0A] text-[10px] font-mono tracking-widest uppercase font-bold text-[#666] border-b border-[#1A1A1A] print:bg-gray-100">
                <tr><th className="p-6 text-center">Pref</th><th className="p-6">Sys_Code</th><th className="p-6">Institution</th><th className="p-6">Branch</th><th className="p-6 text-right">Cutoff</th><th className="p-6 print:hidden"></th></tr>
              </thead>
              <tbody className="divide-y divide-[#1A1A1A] print:divide-gray-300">
                {rows.map((item, index) => (
                  <tr key={item.key} className="hover:bg-[#0A0A0A] transition-colors print:bg-transparent">
                    <td className="p-6 font-black text-xl text-center text-cyan-400 print:text-black">{index + 1}</td>
                    <td className="p-6 font-mono text-[#888] print:text-gray-600">{item.code}</td>
                    <td className="p-6 font-bold text-white print:text-black">{item.name}</td>
                    <td className="p-6 text-[#888] font-medium print:text-gray-800">{item.branch}</td>
                    <td className="p-6 font-black text-right text-white text-lg tabular-nums print:text-black">{item.merit.toFixed(2)}%</td>
                    <td className="p-6 text-center print:hidden"><button onClick={() => toggleShortlist(item.key)} className="text-[#444] hover:text-red-500 bg-[#111] p-3 rounded-xl transition-colors"><X size={18} /></button></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

// ==========================================
// 6. MASTER APP SHELL
// ==========================================

export default function PolytechnicDashboard() {
  const [booting, setBooting] = useState(true);
  const [showTutorial, setShowTutorial] = useState(false);
  const [mode, setMode] = useState<"engine" | "directory" | "option-form">("engine");
  const [shortlist, setShortlist] = useState<Set<string>>(new Set());
  const [expandedCourse, setExpandedCourse] = useState<string | null>(null);

  // Custom Cursor Physics
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);
  const cursorX = useSpring(mouseX, { stiffness: 400, damping: 28 });
  const cursorY = useSpring(mouseY, { stiffness: 400, damping: 28 });

  useEffect(() => {
    const moveCursor = (e: MouseEvent) => { mouseX.set(e.clientX - 16); mouseY.set(e.clientY - 16); };
    window.addEventListener("mousemove", moveCursor);
    
    const savedList = localStorage.getItem("mahapoly-shortlist");
    if (savedList) setShortlist(new Set(JSON.parse(savedList)));

    if (!sessionStorage.getItem("mahapoly-booted")) {
      setBooting(true);
    } else {
      setBooting(false);
      if (!localStorage.getItem("mahapoly-tutorial-seen")) setShowTutorial(true);
    }
    return () => window.removeEventListener("mousemove", moveCursor);
  }, []);

  const handleBootComplete = () => {
    setBooting(false);
    sessionStorage.setItem("mahapoly-booted", "true");
    if (!localStorage.getItem("mahapoly-tutorial-seen")) setShowTutorial(true);
  };

  const toggleShortlist = (key: string) => {
    setShortlist((prev) => {
      const next = new Set(prev);
      next.has(key) ? next.delete(key) : next.add(key);
      localStorage.setItem("mahapoly-shortlist", JSON.stringify(Array.from(next)));
      return next;
    });
  };

  return (
    <div className="min-h-screen bg-[#000000] text-white font-sans overflow-x-hidden selection:bg-cyan-500 selection:text-black">
      
      {/* GLOBAL 3D UTILITIES & KEYFRAMES */}
      <style dangerouslySetInnerHTML={{__html: `
        .preserve-3d { transform-style: preserve-3d; }
        @keyframes scan { 0% { top: -10px; opacity: 0; } 10% { opacity: 1; } 90% { opacity: 1; } 100% { top: 100%; opacity: 0; } }
        .custom-scrollbar::-webkit-scrollbar { width: 4px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: #0A0A0A; border-radius: 10px; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #222; border-radius: 10px; }
      `}} />

      {/* HARDWARE ACCELERATED CUSTOM CURSOR */}
      <motion.div 
        className="fixed w-8 h-8 border border-cyan-400 rounded-full pointer-events-none z-[9999] print:hidden mix-blend-screen shadow-[0_0_15px_#00E5FF]"
        style={{ x: cursorX, y: cursorY }}
      />

      {/* OVERLAYS */}
      <AnimatePresence>
        {booting && <SystemBootLoader onComplete={handleBootComplete} />}
      </AnimatePresence>
      <AnimatePresence>
        {(!booting && showTutorial) && <SystemArchitectureGuide onDismiss={() => { setShowTutorial(false); localStorage.setItem("mahapoly-tutorial-seen", "true"); }} />}
      </AnimatePresence>

      <div className="w-full px-4 sm:px-8 xl:px-12 py-10 print:p-0">
        
        {/* TOP NAVIGATION */}
        <header className="flex flex-col md:flex-row md:items-end justify-between gap-8 mb-16 print:hidden relative z-10">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-[#111] border border-[#222] rounded-full text-[10px] font-mono tracking-widest uppercase text-cyan-400 mb-4 shadow-[0_0_15px_rgba(6,182,212,0.1)]">
              <MapPin size={12} /> Maharashtra DTE Indexed
            </div>
            <h1 className="text-5xl md:text-7xl font-black tracking-tighter text-white leading-none">MAHA<span className="text-[#333]">POLY</span></h1>
          </div>

          <div className="flex bg-[#050505] p-1.5 rounded-2xl border border-[#1A1A1A] w-full md:w-auto shadow-2xl">
            <button onClick={() => setMode("engine")} className={`px-8 py-3 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${mode === "engine" ? "bg-white text-black shadow-[0_0_20px_rgba(255,255,255,0.2)]" : "text-[#666] hover:text-white"}`}>Engine</button>
            <button onClick={() => setMode("directory")} className={`px-8 py-3 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${mode === "directory" ? "bg-white text-black shadow-[0_0_20px_rgba(255,255,255,0.2)]" : "text-[#666] hover:text-white"}`}>Directory</button>
            <button onClick={() => setMode("option-form")} className={`px-8 py-3 rounded-xl text-xs font-black uppercase tracking-widest transition-all flex items-center justify-center gap-2 ${mode === "option-form" ? "bg-white text-black shadow-[0_0_20px_rgba(255,255,255,0.2)]" : "text-[#666] hover:text-white"}`}>
              <Star size={14} className={shortlist.size > 0 ? "fill-current" : ""} /> Form {shortlist.size > 0 && <span className="bg-[#111] text-white px-2 py-0.5 rounded-md">{shortlist.size}</span>}
            </button>
          </div>
        </header>

        {/* VIEW ROUTER */}
        {mode === "engine" && <MatchMode shortlist={shortlist} toggleShortlist={toggleShortlist} />}
        {mode === "directory" && <BrowseMode expandedCourse={expandedCourse} setExpandedCourse={setExpandedCourse} />}
        {mode === "option-form" && <OptionFormMode shortlist={shortlist} toggleShortlist={toggleShortlist} />}
        
      </div>
    </div>
  );
}