"use client";

import { useMemo, useState, useEffect } from "react";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import { Canvas } from "@react-three/fiber";
import { OrbitControls, Icosahedron, MeshDistortMaterial } from "@react-three/drei";
import { Search, Activity, ShieldCheck, Info, ChevronDown, ChevronUp, Star, X, Check, Share2, Printer } from "lucide-react";
import raw from "../data.json";
import { decodeSeat, resolveSeatCodes, type Candidature, type Gender, type Level } from "../lib/seatTypes";

// ==========================================
// 1. DATA LAYER (FULLY RESTORED)
// ==========================================
const DATA = raw as any;
const FLAT = DATA.colleges.flatMap((c: any, ci: number) => c.courses.flatMap(([b, c_offs]: any) => c_offs.map(([r, s, st, m]: any) => ({ ci, branch: b, round: r, seat: s, stage: st, merit: m }))));
const SEAT_INDEX = new Map(DATA.seatTypes.map((s: any, i: number) => [s, i]));
const BRANCH_LIST = DATA.branches.map((name: string, idx: number) => ({ idx, name })).sort((a, b) => a.name.localeCompare(b.name));

const CATEGORIES = [
  { id: "OPEN", label: "Open", color: "bg-[#F4F6FA] text-black border-transparent" },
  { id: "OBC", label: "OBC", color: "bg-[#5B6CFF] text-white border-transparent" },
  { id: "SC", label: "SC", color: "bg-[#9D4EDD] text-white border-transparent" },
  { id: "ST", label: "ST", color: "bg-[#F59E0B] text-black border-transparent" },
  { id: "SEBC", label: "SEBC", color: "bg-[#EC4899] text-white border-transparent" },
  { id: "NTA", label: "NT-A", color: "bg-[#14B8A6] text-black border-transparent" },
  { id: "NTB", label: "NT-B", color: "bg-[#0EA5E9] text-black border-transparent" },
  { id: "NTC", label: "NT-C", color: "bg-[#3B82F6] text-white border-transparent" },
  { id: "NTD", label: "NT-D", color: "bg-[#6366F1] text-white border-transparent" },
  { id: "EWS", label: "EWS", color: "bg-[#10B981] text-black border-transparent" },
  { id: "TFWS", label: "TFWS", color: "bg-[#84CC16] text-black border-transparent" },
  { id: "DEF", label: "Defence", color: "bg-[#EF4444] text-white border-transparent" },
  { id: "ORPHAN", label: "Orphan", color: "bg-[#A8A29E] text-black border-transparent" },
  { id: "PWD", label: "PWD", color: "bg-[#F43F5E] text-white border-transparent" }
];

// ==========================================
// 2. 3D LOADER (RESPECTS REDUCED MOTION)
// ==========================================
function SpatialLoader({ onComplete }: { onComplete: () => void }) {
  const prefersReducedMotion = useReducedMotion();
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const duration = 1800;
    const interval = 20;
    let current = 0;
    const timer = setInterval(() => {
      current += interval;
      setProgress((current / duration) * 100);
      if (current >= duration) { clearInterval(timer); onComplete(); }
    }, interval);
    return () => clearInterval(timer);
  }, [onComplete]);

  if (prefersReducedMotion) {
    return (
      <motion.div exit={{ opacity: 0 }} className="fixed inset-0 z-[100] bg-[#0B0E14] flex flex-col items-center justify-center p-6">
        <Activity className="text-[#5B6CFF] w-8 h-8 mb-6 animate-pulse" />
        <div className="w-full max-w-md h-1 bg-[#141922] rounded-full overflow-hidden">
          <motion.div className="h-full bg-[#5B6CFF]" style={{ width: `${progress}%` }} />
        </div>
        <p className="font-mono text-xs text-[#8A93A6] tracking-widest mt-4 uppercase">Initializing Matrices...</p>
      </motion.div>
    );
  }

  return (
    <motion.div exit={{ opacity: 0, filter: "blur(10px)" }} transition={{ duration: 0.4 }} className="fixed inset-0 z-[100] bg-[#0B0E14] flex flex-col items-center justify-center">
      <div className="w-64 h-64 relative">
        <Canvas camera={{ position: [0, 0, 3] }}>
          <ambientLight intensity={0.5} />
          <directionalLight position={[2, 2, 5]} intensity={1} />
          <Icosahedron args={[1, 1]}>
            <MeshDistortMaterial color="#5B6CFF" wireframe distort={0.3} speed={2} />
          </Icosahedron>
          <OrbitControls autoRotate autoRotateSpeed={4} enableZoom={false} />
        </Canvas>
      </div>
      <div className="mt-8 text-center space-y-2">
        <h2 className="font-display font-bold text-[#F4F6FA] tracking-widest uppercase">MahaPoly Engine</h2>
        <p className="font-mono text-xs text-[#8A93A6] tracking-[0.2em] uppercase">Indexing Data {Math.round(progress)}%</p>
      </div>
    </motion.div>
  );
}

// ==========================================
// 3. UI COMPONENTS
// ==========================================
function MarginIndicator({ merit, cutoff }: { merit: number; cutoff: number }) {
  const margin = merit - cutoff;
  // Semantic Colors per your specification
  const color = margin >= 5 ? "#33D69F" : margin >= 0 ? "#FFB020" : "#FF5D5D";
  const label = margin >= 5 ? "Safe" : margin >= 0 ? "Borderline" : "Reach";
  
  return (
    <div className="flex flex-col gap-1.5 w-full max-w-[140px]">
      <div className="flex items-center justify-between">
         <span className="font-mono text-[10px] uppercase font-bold" style={{ color }}>{label}</span>
         <span className="font-mono text-xs font-bold tabular-nums" style={{ color }}>
          {margin >= 0 ? '+' : ''}{margin.toFixed(2)}%
        </span>
      </div>
      <div className="relative w-full h-1 rounded-full bg-[#0B0E14] overflow-hidden border border-[#2A3441]">
        <div className="absolute inset-y-0 left-0 rounded-full transition-all duration-700 ease-out" style={{ width: `${Math.max(5, Math.min(100, (cutoff / 100) * 100))}%`, backgroundColor: color }} />
      </div>
    </div>
  );
}

function ContentSkeleton() {
  return (
    <div className="w-full space-y-3">
      {[1, 2, 3].map(i => (
        <div key={i} className="w-full h-24 bg-[#141922] border border-[#2A3441] rounded-xl relative overflow-hidden">
          <div className="absolute inset-0 -translate-x-full animate-[shimmer_1.5s_infinite] bg-gradient-to-r from-transparent via-white/5 to-transparent" />
        </div>
      ))}
    </div>
  );
}

// ==========================================
// 4. MAIN DASHBOARD ENGINE
// ==========================================
export default function MahaPolyDashboard() {
  const [isBooting, setIsBooting] = useState(true);
  const [mode, setMode] = useState<"engine" | "staged">("engine");
  const [shortlist, setShortlist] = useState<Set<string>>(new Set());

  // Engine State
  const [merit, setMerit] = useState<string>("");
  const [category, setCategory] = useState("OPEN");
  const [candidature, setCandidature] = useState<Candidature>("N");
  const [gender, setGender] = useState<Gender>("G");
  const [level, setLevel] = useState<Level>("H");
  const [rounds, setRounds] = useState<number[]>([1, 2, 3]);
  const [branchFilter, setBranchFilter] = useState<Set<number>>(new Set());
  const [branchQuery, setBranchQuery] = useState("");
  const [isCalculating, setIsCalculating] = useState(false);
  const [visibleCount, setVisibleCount] = useState(30);

  const isSpecialCategory = ["EWS", "TFWS", "DEF", "ORPHAN", "PWD"].includes(category);
  const meritNum = parseFloat(merit);
  const hasValidMerit = merit.trim() !== "" && !isNaN(meritNum) && meritNum >= 0 && meritNum <= 100;

  useEffect(() => {
    if (sessionStorage.getItem("mahapoly-booted")) setIsBooting(false);
    const savedList = localStorage.getItem("mahapoly-shortlist");
    if (savedList) setShortlist(new Set(JSON.parse(savedList)));
  }, []);

  useEffect(() => {
    if (hasValidMerit) {
      setIsCalculating(true);
      const timer = setTimeout(() => setIsCalculating(false), 500);
      return () => clearTimeout(timer);
    }
  }, [merit, category, candidature, gender, level, rounds, branchFilter, hasValidMerit]);

  const results = useMemo(() => {
    if (!hasValidMerit) return [];
    const codes = resolveSeatCodes({ category, candidature, gender, level });
    const seatIdxs = new Set(codes.map((c) => SEAT_INDEX.get(c)).filter((v): v is number => v !== undefined));
    if (seatIdxs.size === 0) return [];

    const best = new Map<string, any>();
    for (const row of FLAT) {
      if (!rounds.includes(row.round) || !seatIdxs.has(row.seat)) continue;
      // Show results even if reaching, but sort by delta
      if (branchFilter.size > 0 && !branchFilter.has(row.branch)) continue;
      const key = `${row.ci}-${row.branch}`;
      if (!best.has(key) || row.merit > best.get(key)!.merit) best.set(key, row);
    }
    return Array.from(best.values()).sort((a, b) => (meritNum - b.merit) - (meritNum - a.merit));
  }, [hasValidMerit, meritNum, category, candidature, gender, level, rounds, branchFilter]);

  const filteredBranchList = branchQuery ? BRANCH_LIST.filter((b) => b.name.toLowerCase().includes(branchQuery.toLowerCase())) : BRANCH_LIST;

  const toggleShortlist = (key: string) => {
    setShortlist(prev => {
      const next = new Set(prev);
      next.has(key) ? next.delete(key) : next.add(key);
      localStorage.setItem("mahapoly-shortlist", JSON.stringify(Array.from(next)));
      return next;
    });
  };

  return (
    <div className="min-h-screen bg-[#0B0E14] text-[#F4F6FA] font-ui selection:bg-[#5B6CFF] selection:text-white flex flex-col">
      <style dangerouslySetInnerHTML={{__html: `@keyframes shimmer { 100% { transform: translateX(100%); } }`}} />
      
      <AnimatePresence>
        {isBooting && <SpatialLoader onComplete={() => { setIsBooting(false); sessionStorage.setItem("mahapoly-booted", "true"); }} />}
      </AnimatePresence>

      {/* 1. BRAND HEADER */}
      <header className="border-b border-[#141922] px-6 py-4 flex flex-col md:flex-row items-start md:items-center justify-between bg-[#0B0E14]/80 backdrop-blur-md sticky top-0 z-40 gap-4">
        <div className="flex items-center gap-4">
          <Activity className="text-[#5B6CFF]" />
          <h1 className="font-display font-bold text-xl tracking-tight leading-none">MAHAPOLY <span className="text-[#8A93A6] font-normal">ENGINE</span></h1>
          <div className="hidden md:flex items-center gap-2 px-3 py-1 bg-[#33D69F]/10 border border-[#33D69F]/20 rounded-full ml-4">
            <div className="w-1.5 h-1.5 rounded-full bg-[#33D69F] animate-pulse" />
            <span className="font-mono text-[9px] text-[#33D69F] uppercase tracking-widest font-bold">DTE Data Indexed</span>
          </div>
        </div>
        <div className="flex bg-[#141922] p-1 rounded-lg border border-[#2A3441]">
          <button onClick={() => setMode("engine")} className={`px-4 py-1.5 text-xs font-bold rounded-md transition-all ${mode === "engine" ? "bg-[#2A3441] text-white" : "text-[#8A93A6] hover:text-white"}`}>Discovery</button>
          <button onClick={() => setMode("staged")} className={`px-4 py-1.5 text-xs font-bold rounded-md transition-all flex items-center gap-2 ${mode === "staged" ? "bg-[#2A3441] text-white" : "text-[#8A93A6] hover:text-white"}`}>
            <Star size={12} className={shortlist.size > 0 ? "fill-[#5B6CFF] text-[#5B6CFF]" : ""} /> Staged ({shortlist.size})
          </button>
        </div>
      </header>

      {mode === "engine" ? (
        <main className="flex-1 max-w-[1600px] w-full mx-auto grid grid-cols-1 lg:grid-cols-12 gap-8 p-6">
          
          {/* LEFT RAIL: PERSISTENT STEPPER & FILTERS */}
          <aside className="lg:col-span-4 xl:col-span-3">
            <div className="bg-[#141922] border border-[#2A3441] p-6 rounded-xl space-y-8 sticky top-24 shadow-2xl">
              
              {/* STEP 1: MERIT */}
              <div>
                <label className="font-mono text-xs text-[#8A93A6] uppercase tracking-widest mb-3 block">01 / Merit Score</label>
                <input 
                  type="number" step="0.01" placeholder="00.00" value={merit} onChange={(e) => setMerit(e.target.value)}
                  className="w-full bg-transparent border-b-2 border-[#2A3441] pb-2 text-4xl font-display font-bold text-[#F4F6FA] placeholder:text-[#2A3441] focus:border-[#5B6CFF] outline-none transition-colors tabular-nums"
                />
              </div>

              {/* STEP 2: FULL CATEGORY CHIPS */}
              <div>
                <div className="flex justify-between items-center mb-3">
                  <label className="font-mono text-xs text-[#8A93A6] uppercase tracking-widest block">02 / Category</label>
                  <Info size={14} className="text-[#8A93A6] cursor-help" title="Select your specific category to see accurate cutoffs." />
                </div>
                <div className="flex flex-wrap gap-2">
                  {CATEGORIES.map(c => (
                    <button 
                      key={c.id} onClick={() => setCategory(c.id)}
                      className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-all border ${category === c.id ? c.color : "bg-[#0B0E14] text-[#8A93A6] border-[#2A3441] hover:border-[#8A93A6]"}`}
                    >
                      {c.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* STEP 3: SEAT TYPE TOGGLES */}
              {!isSpecialCategory && (
                <div className="space-y-4 pt-4 border-t border-[#2A3441]">
                  <div>
                    <label className="font-mono text-[10px] text-[#8A93A6] uppercase tracking-widest mb-2 block">Candidature & Gender</label>
                    <div className="flex gap-2 mb-2">
                      {CANDIDATURE_OPTIONS.map(o => <button key={o.value} onClick={() => setCandidature(o.value as any)} className={`flex-1 py-1.5 text-[10px] font-bold uppercase rounded border ${candidature === o.value ? "bg-[#2A3441] border-[#5B6CFF] text-white" : "bg-[#0B0E14] border-[#2A3441] text-[#8A93A6]"}`}>{o.label}</button>)}
                    </div>
                    <div className="flex gap-2">
                      {GENDER_OPTIONS.map(o => <button key={o.value} onClick={() => setGender(o.value as any)} className={`flex-1 py-1.5 text-[10px] font-bold uppercase rounded border ${gender === o.value ? "bg-[#2A3441] border-[#5B6CFF] text-white" : "bg-[#0B0E14] border-[#2A3441] text-[#8A93A6]"}`}>{o.label}</button>)}
                    </div>
                  </div>
                  <div>
                    <label className="font-mono text-[10px] text-[#8A93A6] uppercase tracking-widest mb-2 block">Seat Level</label>
                    <div className="flex gap-2">
                      {LEVEL_OPTIONS.map(o => <button key={o.value} onClick={() => setLevel(o.value as any)} className={`flex-1 py-1.5 text-[10px] font-bold uppercase rounded border ${level === o.value ? "bg-[#2A3441] border-[#5B6CFF] text-white" : "bg-[#0B0E14] border-[#2A3441] text-[#8A93A6]"}`}>{o.label}</button>)}
                    </div>
                  </div>
                </div>
              )}

              {/* STEP 4: CAP ROUND */}
              <div className="pt-4 border-t border-[#2A3441]">
                <label className="font-mono text-xs text-[#8A93A6] uppercase tracking-widest mb-3 block">03 / CAP Rounds</label>
                <div className="flex gap-2">
                  {[1, 2, 3, 4].map(r => (
                    <button 
                      key={r} onClick={() => setRounds(prev => prev.includes(r) ? prev.filter(x => x !== r) : [...prev, r])}
                      className={`flex-1 py-2 text-xs font-bold font-mono rounded-md transition-colors border ${rounds.includes(r) ? "bg-[#5B6CFF] border-[#5B6CFF] text-white" : "bg-[#0B0E14] border-[#2A3441] text-[#8A93A6] hover:border-[#8A93A6]"}`}
                    >
                      R{r}
                    </button>
                  ))}
                </div>
                <p className="text-[10px] text-[#8A93A6] mt-2 font-ui">Cutoffs shift per round. Select multiple to broaden search.</p>
              </div>

              {/* STEP 5: BRANCH SELECTOR (RESTORED) */}
              <details className="group pt-4 border-t border-[#2A3441]">
                <summary className="flex justify-between items-center font-mono text-xs text-[#8A93A6] uppercase tracking-widest cursor-pointer hover:text-white transition-colors">
                  <span>04 / Target Branch {branchFilter.size > 0 && <span className="text-[#5B6CFF]">({branchFilter.size})</span>}</span>
                  <ChevronDown size={14} className="group-open:rotate-180 transition-transform" />
                </summary>
                <div className="mt-4 bg-[#0B0E14] border border-[#2A3441] rounded-xl p-3 space-y-3">
                  <div className="relative">
                    <Search className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-[#8A93A6]" />
                    <input type="text" placeholder="Fuzzy search..." value={branchQuery} onChange={(e) => setBranchQuery(e.target.value)} className="w-full bg-[#141922] border border-[#2A3441] rounded-lg pl-8 pr-3 py-2 text-xs outline-none text-white focus:border-[#5B6CFF] transition-colors" />
                  </div>
                  <div className="flex flex-col gap-1 max-h-48 overflow-y-auto custom-scrollbar pr-1">
                    {filteredBranchList.map(b => (
                      <button key={b.idx} onClick={() => { const next = new Set(branchFilter); branchFilter.has(b.idx) ? next.delete(b.idx) : next.add(b.idx); setBranchFilter(next); }} className={`px-3 py-2 text-left text-[11px] font-bold rounded-lg transition-colors ${branchFilter.has(b.idx) ? "bg-[#5B6CFF]/20 text-[#5B6CFF]" : "text-[#8A93A6] hover:bg-[#141922] hover:text-white"}`}>
                        {b.name}
                      </button>
                    ))}
                  </div>
                </div>
              </details>
            </div>
          </aside>

          {/* RIGHT RAIL: DATA HONEST RESULTS */}
          <section className="lg:col-span-8 xl:col-span-9">
            {!hasValidMerit ? (
              <div className="h-full min-h-[60vh] flex flex-col items-center justify-center border border-dashed border-[#2A3441] rounded-2xl bg-[#141922]/30">
                <Search className="w-12 h-12 text-[#2A3441] mb-6" />
                <h2 className="font-display text-2xl font-bold text-[#F4F6FA] mb-2">Awaiting Parameters</h2>
                <p className="text-[#8A93A6] text-sm max-w-md text-center">Input your merit score and category to index real-time DTE cutoffs. Options will appear here instantly.</p>
              </div>
            ) : isCalculating ? (
              <ContentSkeleton />
            ) : results.length === 0 ? (
              <div className="h-full min-h-[60vh] flex flex-col items-center justify-center border border-dashed border-[#2A3441] rounded-2xl bg-[#141922]/30">
                <h2 className="font-display text-2xl font-bold text-[#F4F6FA] mb-2">0 Vectors Identified</h2>
                <p className="text-[#8A93A6] text-sm">No institutions match this precise criteria. Try expanding CAP rounds or adjusting seat level.</p>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="flex items-center justify-between pb-4 border-b border-[#141922]">
                  <h3 className="font-mono text-xs text-[#8A93A6] uppercase tracking-widest"><span className="text-white font-bold">{results.length}</span> Matched Branches</h3>
                  <span className="text-xs text-[#8A93A6]">Ranked by Delta Margin</span>
                </div>

                {/* DENSE DESKTOP TABLE */}
                <div className="bg-[#141922] border border-[#2A3441] rounded-xl overflow-hidden hidden md:block">
                  <table className="w-full text-left">
                    <thead className="bg-[#0B0E14] border-b border-[#2A3441] font-mono text-[10px] text-[#8A93A6] uppercase tracking-widest">
                      <tr>
                        <th className="px-5 py-4 w-12 text-center">Form</th>
                        <th className="px-5 py-4">Institution</th>
                        <th className="px-5 py-4">Branch</th>
                        <th className="px-5 py-4 text-right">Historic Cutoff</th>
                        <th className="px-5 py-4 w-40">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#2A3441]">
                      {results.slice(0, visibleCount).map((r, i) => {
                        const col = DATA.colleges[r.ci];
                        const key = `${r.ci}-${r.branch}`;
                        const starred = shortlist.has(key);
                        return (
                          <tr key={i} className="hover:bg-[#0B0E14] transition-colors">
                            <td className="px-5 py-4 text-center">
                              <button onClick={() => toggleShortlist(key)} className={starred ? "text-[#FFB020]" : "text-[#2A3441] hover:text-[#8A93A6]"}>
                                <Star size={18} fill={starred ? "currentColor" : "none"} />
                              </button>
                            </td>
                            <td className="px-5 py-4">
                              <p className="font-bold text-sm text-[#F4F6FA]">{col.name}</p>
                              <p className="font-mono text-[10px] text-[#8A93A6] mt-1">ID: {col.code}</p>
                            </td>
                            <td className="px-5 py-4 text-sm text-[#F4F6FA]">{DATA.branches[r.branch]}</td>
                            <td className="px-5 py-4 font-mono font-bold text-right text-[#F4F6FA]">{r.merit.toFixed(2)}%</td>
                            <td className="px-5 py-4"><MarginIndicator merit={meritNum} cutoff={r.merit} /></td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>

                {/* MOBILE CARDS */}
                <div className="md:hidden space-y-4">
                   {results.slice(0, visibleCount).map((r, i) => {
                      const col = DATA.colleges[r.ci];
                      const key = `${r.ci}-${r.branch}`;
                      const starred = shortlist.has(key);
                      return (
                        <div key={i} className="bg-[#141922] border border-[#2A3441] p-5 rounded-xl">
                          <div className="flex justify-between items-start mb-4">
                            <p className="font-mono text-[10px] text-[#8A93A6]">ID: {col.code}</p>
                            <button onClick={() => toggleShortlist(key)} className={starred ? "text-[#FFB020]" : "text-[#2A3441]"}>
                              <Star size={18} fill={starred ? "currentColor" : "none"} />
                            </button>
                          </div>
                          <h3 className="font-bold text-sm text-[#F4F6FA] mb-1">{col.name}</h3>
                          <p className="text-xs text-[#8A93A6] mb-4">{DATA.branches[r.branch]}</p>
                          <div className="flex justify-between items-end border-t border-[#2A3441] pt-4">
                            <MarginIndicator merit={meritNum} cutoff={r.merit} />
                            <div className="text-right">
                              <p className="font-mono text-[10px] text-[#8A93A6] uppercase">Cutoff</p>
                              <p className="font-mono font-bold text-[#F4F6FA] text-lg">{r.merit.toFixed(2)}%</p>
                            </div>
                          </div>
                        </div>
                      )
                   })}
                </div>

                {visibleCount < results.length && (
                  <button onClick={() => setVisibleCount(v => v + 50)} className="w-full py-4 rounded-xl border border-[#2A3441] text-[#8A93A6] hover:bg-[#141922] hover:text-[#F4F6FA] transition-colors text-xs font-bold uppercase tracking-widest mt-6">
                    Load Additional Vectors
                  </button>
                )}
              </div>
            )}
          </section>
        </main>
      ) : (
        /* STAGED OPTION FORM VIEW */
        <main className="flex-1 max-w-[1200px] w-full mx-auto p-6 animate-in fade-in duration-300">
          <div className="hidden print:block mb-8 border-b-2 border-black pb-4"><h1 className="text-4xl font-black text-black">DTE Form 2026</h1></div>
          <div className="bg-[#141922] border border-[#2A3441] rounded-[2rem] p-8 md:p-12 print:bg-transparent print:border-none print:p-0">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-10 print:hidden">
              <div>
                <h2 className="font-display text-3xl font-bold text-[#F4F6FA] tracking-tight">Staged Form</h2>
                <p className="text-xs font-mono text-[#8A93A6] mt-2 uppercase tracking-widest">Ready for portal execution.</p>
              </div>
              <div className="flex gap-3">
                <button disabled={shortlist.size === 0} className="px-6 py-3 bg-[#0B0E14] border border-[#2A3441] text-[#F4F6FA] font-bold text-xs uppercase tracking-widest rounded-xl flex items-center gap-2 hover:bg-[#2A3441] transition-colors disabled:opacity-50">
                  <Share2 size={16} /> Share
                </button>
                <button onClick={() => window.print()} disabled={shortlist.size === 0} className="px-6 py-3 bg-[#5B6CFF] text-white font-bold text-xs uppercase tracking-widest rounded-xl flex items-center gap-2 hover:bg-[#4A5BE6] transition-colors shadow-[0_0_20px_rgba(91,108,255,0.3)] disabled:opacity-50">
                  <Printer size={16} /> Print Document
                </button>
              </div>
            </div>

            {shortlist.size === 0 ? (
              <div className="py-24 text-center border border-dashed border-[#2A3441] rounded-2xl bg-[#0B0E14]">
                <Star className="h-10 w-10 text-[#2A3441] mx-auto mb-4" />
                <p className="text-xl font-display font-bold text-[#8A93A6]">0 Staged Options</p>
                <p className="text-sm text-[#8A93A6] mt-2">Return to Discovery and use the star icon to stage choices.</p>
              </div>
            ) : (
              <div className="overflow-x-auto rounded-xl border border-[#2A3441] print:border-gray-300">
                <table className="w-full text-left print:text-black">
                  <thead className="bg-[#0B0E14] font-mono text-[10px] text-[#8A93A6] uppercase tracking-widest border-b border-[#2A3441] print:bg-gray-100 print:text-black">
                    <tr><th className="px-6 py-4 w-16 text-center">Pref</th><th className="px-6 py-4">ID</th><th className="px-6 py-4">Institution</th><th className="px-6 py-4">Branch</th><th className="px-6 py-4 text-right">Cutoff</th><th className="px-6 py-4 print:hidden"></th></tr>
                  </thead>
                  <tbody className="divide-y divide-[#2A3441] print:divide-gray-300">
                    {Array.from(shortlist).map((key, index) => {
                      const [ci, branchIdx, round, seatIdx] = key.split('-').map(Number);
                      const col = DATA.colleges[ci];
                      const meritVal = FLAT.find(f => f.ci === ci && f.branch === branchIdx && f.round === round && f.seat === seatIdx)?.merit || 0;
                      return (
                        <tr key={key} className="hover:bg-[#0B0E14] transition-colors print:bg-transparent">
                          <td className="px-6 py-4 font-black text-xl text-center text-[#5B6CFF] print:text-black">{index + 1}</td>
                          <td className="px-6 py-4 font-mono text-sm text-[#8A93A6] print:text-gray-600">{col.code}</td>
                          <td className="px-6 py-4 font-bold text-sm text-[#F4F6FA] print:text-black">{col.name}</td>
                          <td className="px-6 py-4 text-sm text-[#8A93A6] print:text-gray-800">{DATA.branches[branchIdx]}</td>
                          <td className="px-6 py-4 font-mono font-bold text-right text-[#F4F6FA] text-lg tabular-nums print:text-black">{meritVal.toFixed(2)}%</td>
                          <td className="px-6 py-4 text-center print:hidden"><button onClick={() => toggleShortlist(key)} className="text-[#8A93A6] hover:text-[#FF5D5D] p-2 bg-[#0B0E14] rounded-lg transition-colors"><X size={16} /></button></td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </main>
      )}

      {/* DISCLAIMER FOOTER */}
      <footer className="bg-[#141922] border-t border-[#2A3441] py-6 px-6 mt-auto">
        <div className="max-w-[1600px] mx-auto flex flex-col md:flex-row items-center gap-4 text-center md:text-left">
          <ShieldCheck className="text-[#5B6CFF] shrink-0" />
          <p className="text-xs text-[#8A93A6] max-w-4xl leading-relaxed">
            <strong className="text-[#F4F6FA]">Decision-Support Tool:</strong> This engine aggregates historical CAP round data. Cutoffs fluctuate annually. Always verify final seat matrices with the official <span className="text-[#F4F6FA] font-bold">Maharashtra CET Cell / DTE portal</span> prior to submitting option forms.
          </p>
        </div>
      </footer>
    </div>
  );
}