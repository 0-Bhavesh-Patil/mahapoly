"use client";

import { useMemo, useState, useEffect } from "react";
import { Canvas } from "@react-three/fiber";
import { OrbitControls, Icosahedron, MeshDistortMaterial } from "@react-three/drei";
import { motion, AnimatePresence, useReducedMotion, useMotionValue, useSpring, useTransform } from "framer-motion";
import { Search, Activity, ShieldCheck, Info, ChevronDown, ChevronUp, Star, X, Printer, Share2, Layers, Cpu, MapPin } from "lucide-react";
import raw from "../data.json";
import { decodeSeat, resolveSeatCodes, CANDIDATURE_OPTIONS, GENDER_OPTIONS, LEVEL_OPTIONS, type Candidature, type Gender, type Level } from "../lib/seatTypes";

// ==========================================
// 1. CORE DATA LAYER & SEMANTICS
// ==========================================
const DATA = raw as any;
const FLAT = DATA.colleges.flatMap((c: any, ci: number) => c.courses.flatMap(([b, c_offs]: any) => c_offs.map(([r, s, st, m]: any) => ({ ci, branch: b, round: r, seat: s, stage: st, merit: m }))));
const SEAT_INDEX = new Map(DATA.seatTypes.map((s: any, i: number) => [s, i]));
const BRANCH_LIST = DATA.branches.map((name: string, idx: number) => ({ idx, name })).sort((a, b) => a.name.localeCompare(b.name));

const CATEGORIES = [
  { id: "OPEN", label: "Open", color: "bg-[#F4F6FA] text-black" },
  { id: "OBC", label: "OBC", color: "bg-[#5B6CFF] text-white" },
  { id: "SC", label: "SC", color: "bg-[#9D4EDD] text-white" },
  { id: "ST", label: "ST", color: "bg-[#F59E0B] text-black" },
  { id: "SEBC", label: "SEBC", color: "bg-[#EC4899] text-white" },
  { id: "NTA", label: "NT-A", color: "bg-[#14B8A6] text-black" },
  { id: "NTB", label: "NT-B", color: "bg-[#0EA5E9] text-black" },
  { id: "NTC", label: "NT-C", color: "bg-[#3B82F6] text-white" },
  { id: "NTD", label: "NT-D", color: "bg-[#6366F1] text-white" },
  { id: "EWS", label: "EWS", color: "bg-[#10B981] text-black" },
  { id: "TFWS", label: "TFWS", color: "bg-[#84CC16] text-black" },
  { id: "DEF", label: "Defence", color: "bg-[#EF4444] text-white" },
  { id: "ORPHAN", label: "Orphan", color: "bg-[#A8A29E] text-black" },
  { id: "PWD", label: "PWD", color: "bg-[#F43F5E] text-white" }
];

// ==========================================
// 2. 3D & KINETIC COMPONENTS
// ==========================================

// Real 3D Boot Sequence
function SpatialBootLoader({ onComplete }: { onComplete: () => void }) {
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
        <Cpu className="text-[#5B6CFF] w-8 h-8 mb-6 animate-pulse" />
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
        <h2 className="font-display font-bold text-[#F4F6FA] tracking-widest uppercase text-xl">MahaPoly Engine</h2>
        <p className="font-mono text-xs text-[#8A93A6] tracking-[0.2em] uppercase">Indexing Data {Math.round(progress)}%</p>
      </div>
    </motion.div>
  );
}

// Kinetic Spatial Hover Card
function SpatialCard({ children }: { children: React.ReactNode }) {
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const mouseXSpring = useSpring(x, { stiffness: 300, damping: 30 });
  const mouseYSpring = useSpring(y, { stiffness: 300, damping: 30 });
  const rotateX = useTransform(mouseYSpring, [-0.5, 0.5], ["5deg", "-5deg"]);
  const rotateY = useTransform(mouseXSpring, [-0.5, 0.5], ["-5deg", "5deg"]);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    x.set((e.clientX - rect.left) / rect.width - 0.5);
    y.set((e.clientY - rect.top) / rect.height - 0.5);
  };

  return (
    <motion.div
      style={{ rotateX, rotateY, transformStyle: "preserve-3d" }}
      onMouseMove={handleMouseMove}
      onMouseLeave={() => { x.set(0); y.set(0); }}
      className="perspective-[1000px] w-full"
    >
      <div style={{ transform: "translateZ(20px)", transformStyle: "preserve-3d" }}>
        {children}
      </div>
    </motion.div>
  );
}

// ==========================================
// 3. UI COMPONENTS & TUTORIAL
// ==========================================

function SpatialTutorial({ onDismiss }: { onDismiss: () => void }) {
  const [step, setStep] = useState(0);
  const steps = [
    { icon: <Activity size={32} />, title: "Parameter Calibration", desc: "Input your merit score and specific demographic categories. The engine filters 400+ institutions in real-time." },
    { icon: <Layers size={32} />, title: "Spatial Analysis", desc: "Results render as spatial vectors. Review your Delta Margin to instantly see if a cutoff is a Safe, Borderline, or Reach match." },
    { icon: <Printer size={32} />, title: "Option Form Export", desc: "Stage your preferred branches using the star icon, then export a compliant Option Form directly for printing." }
  ];

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-50 flex items-center justify-center bg-[#0B0E14]/90 backdrop-blur-md p-6">
      <div className="w-full max-w-3xl bg-[#141922] border border-[#2A3441] rounded-[2rem] p-10 flex flex-col md:flex-row gap-10 items-center shadow-2xl">
        <div className="w-32 h-32 shrink-0 bg-[#0B0E14] border border-[#2A3441] rounded-2xl flex items-center justify-center text-[#5B6CFF] shadow-[0_0_30px_rgba(91,108,255,0.2)]">
          {steps[step].icon}
        </div>
        <div className="flex-1 text-center md:text-left">
          <h2 className="text-[10px] font-mono text-[#5B6CFF] tracking-[0.2em] uppercase mb-2">System Guide {step + 1}/3</h2>
          <h3 className="text-2xl font-bold text-white mb-3">{steps[step].title}</h3>
          <p className="text-[#8A93A6] text-sm leading-relaxed mb-8">{steps[step].desc}</p>
          <div className="flex items-center gap-4 justify-center md:justify-start">
            {step < 2 ? (
              <button onClick={() => setStep(s => s + 1)} className="px-6 py-2 bg-white text-black text-xs font-bold uppercase tracking-widest rounded-lg hover:bg-[#5B6CFF] hover:text-white transition-colors">Next Sequence</button>
            ) : (
              <button onClick={onDismiss} className="px-6 py-2 bg-[#5B6CFF] text-white text-xs font-bold uppercase tracking-widest rounded-lg shadow-[0_0_15px_rgba(91,108,255,0.4)] hover:bg-white hover:text-black transition-colors">Initialize</button>
            )}
            <button onClick={onDismiss} className="text-xs font-bold text-[#8A93A6] uppercase tracking-widest hover:text-white">Skip</button>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

function MarginIndicator({ merit, cutoff }: { merit: number; cutoff: number }) {
  const margin = merit - cutoff;
  const color = margin >= 5 ? "#33D69F" : margin >= 0 ? "#FFB020" : "#FF5D5D";
  
  return (
    <div className="flex flex-col gap-1.5 w-full max-w-[140px]">
      <div className="flex items-center justify-between">
         <span className="font-mono text-[9px] uppercase tracking-widest text-[#8A93A6]">Delta</span>
         <span className="font-mono text-xs font-bold tabular-nums" style={{ color }}>{margin >= 0 ? '+' : ''}{margin.toFixed(2)}%</span>
      </div>
      <div className="relative w-full h-1.5 rounded-full bg-[#0B0E14] overflow-hidden border border-[#2A3441]">
        <div className="absolute inset-y-0 left-0 rounded-full transition-all duration-1000 ease-out shadow-[0_0_10px_currentColor]" style={{ width: `${Math.max(5, Math.min(100, (cutoff / 100) * 100))}%`, backgroundColor: color }} />
      </div>
    </div>
  );
}

// ==========================================
// 4. THE MASTER DASHBOARD
// ==========================================

export default function MahaPolyDashboard() {
  // App State
  const [isBooting, setIsBooting] = useState(true);
  const [showTutorial, setShowTutorial] = useState(false);
  const [mode, setMode] = useState<"engine" | "directory" | "staged">("engine");
  const [shortlist, setShortlist] = useState<Set<string>>(new Set());

  // Engine Filters
  const [merit, setMerit] = useState<string>("");
  const [category, setCategory] = useState("OPEN");
  const [candidature, setCandidature] = useState<Candidature>("N");
  const [gender, setGender] = useState<Gender>("G");
  const [level, setLevel] = useState<Level>("H");
  const [rounds, setRounds] = useState<number[]>([1, 2, 3]);
  const [branchFilter, setBranchFilter] = useState<Set<number>>(new Set());
  const [branchQuery, setBranchQuery] = useState("");
  const [dirQuery, setDirQuery] = useState("");
  const [expandedCourse, setExpandedCourse] = useState<string | null>(null);

  const isSpecialCategory = ["EWS", "TFWS", "DEF", "ORPHAN", "PWD"].includes(category);
  const meritNum = parseFloat(merit);
  const hasValidMerit = merit.trim() !== "" && !isNaN(meritNum) && meritNum >= 0 && meritNum <= 100;

  // Lifecycle
  useEffect(() => {
    const savedList = localStorage.getItem("mahapoly-shortlist");
    if (savedList) setShortlist(new Set(JSON.parse(savedList)));

    if (sessionStorage.getItem("mahapoly-booted")) {
      setIsBooting(false);
      if (!localStorage.getItem("mahapoly-tutorial-seen")) setShowTutorial(true);
    }
  }, []);

  const finishBoot = () => {
    setIsBooting(false);
    sessionStorage.setItem("mahapoly-booted", "true");
    if (!localStorage.getItem("mahapoly-tutorial-seen")) setShowTutorial(true);
  };

  // Engine Logic
  const results = useMemo(() => {
    if (!hasValidMerit) return [];
    const codes = resolveSeatCodes({ category, candidature, gender, level });
    const seatIdxs = new Set(codes.map((c) => SEAT_INDEX.get(c)).filter((v): v is number => v !== undefined));
    if (seatIdxs.size === 0) return [];

    const best = new Map<string, any>();
    for (const row of FLAT) {
      if (!rounds.includes(row.round) || !seatIdxs.has(row.seat)) continue;
      // Filter out absolute impossibilities (> 15% away), but show borderline/reach
      if (row.merit > meritNum + 15) continue; 
      if (branchFilter.size > 0 && !branchFilter.has(row.branch)) continue;
      const key = `${row.ci}-${row.branch}`;
      if (!best.has(key) || row.merit > best.get(key)!.merit) best.set(key, row);
    }
    return Array.from(best.values()).sort((a, b) => (meritNum - b.merit) - (meritNum - a.merit));
  }, [hasValidMerit, meritNum, category, candidature, gender, level, rounds, branchFilter]);

  const directoryResults = useMemo(() => {
    if (!dirQuery.trim()) return DATA.colleges.slice(0, 30);
    return DATA.colleges.filter((c: any) => c.name.toLowerCase().includes(dirQuery.toLowerCase()) || c.code.includes(dirQuery));
  }, [dirQuery]);

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
    <div className="min-h-screen bg-[#0B0E14] text-[#F4F6FA] font-ui selection:bg-[#5B6CFF] selection:text-white flex flex-col overflow-x-hidden">
      
      <AnimatePresence>
        {isBooting && <SpatialBootLoader onComplete={finishBoot} />}
        {(!isBooting && showTutorial) && <SpatialTutorial onDismiss={() => { setShowTutorial(false); localStorage.setItem("mahapoly-tutorial-seen", "true"); }} />}
      </AnimatePresence>

      {/* TOP COMMAND NAVIGATION */}
      <header className="border-b border-[#141922] bg-[#0B0E14]/90 backdrop-blur-md sticky top-0 z-40 print:hidden">
        <div className="max-w-[1600px] mx-auto px-6 py-4 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <Activity className="text-[#5B6CFF]" />
            <div>
              <h1 className="font-display font-bold text-xl tracking-tight leading-none text-white">MAHAPOLY <span className="text-[#8A93A6] font-normal">ENGINE</span></h1>
              <div className="flex items-center gap-2 mt-1">
                <div className="w-1.5 h-1.5 rounded-full bg-[#33D69F] animate-pulse" />
                <span className="font-mono text-[9px] text-[#33D69F] uppercase tracking-widest font-bold">DTE Real-time Indexed</span>
              </div>
            </div>
          </div>
          
          <nav className="flex bg-[#141922] p-1.5 rounded-xl border border-[#2A3441] shadow-lg w-full md:w-auto">
            <button onClick={() => setMode("engine")} className={`flex-1 md:flex-none px-6 py-2 text-xs font-bold uppercase tracking-widest rounded-lg transition-all ${mode === "engine" ? "bg-[#2A3441] text-white shadow-md" : "text-[#8A93A6] hover:text-white"}`}>Discovery</button>
            <button onClick={() => setMode("directory")} className={`flex-1 md:flex-none px-6 py-2 text-xs font-bold uppercase tracking-widest rounded-lg transition-all ${mode === "directory" ? "bg-[#2A3441] text-white shadow-md" : "text-[#8A93A6] hover:text-white"}`}>Directory</button>
            <button onClick={() => setMode("staged")} className={`flex-1 md:flex-none px-6 py-2 text-xs font-bold uppercase tracking-widest rounded-lg transition-all flex items-center justify-center gap-2 ${mode === "staged" ? "bg-[#2A3441] text-white shadow-md" : "text-[#8A93A6] hover:text-white"}`}>
              <Star size={14} className={shortlist.size > 0 ? "fill-[#5B6CFF] text-[#5B6CFF]" : ""} /> Form {shortlist.size > 0 && <span className="bg-[#0B0E14] border border-[#2A3441] text-white px-1.5 py-0.5 rounded-md text-[10px] leading-none">{shortlist.size}</span>}
            </button>
          </nav>
        </div>
      </header>

      {/* VIEW 1: ENGINE / DISCOVERY */}
      {mode === "engine" && (
        <main className="flex-1 max-w-[1600px] w-full mx-auto grid grid-cols-1 lg:grid-cols-12 gap-8 p-6 animate-in fade-in duration-500">
          
          {/* LEFT RAIL: FULL DATA FILTERS */}
          <aside className="lg:col-span-4 xl:col-span-3">
            <div className="bg-[#141922] border border-[#2A3441] p-6 rounded-2xl sticky top-28 shadow-2xl space-y-8">
              
              <div>
                <label className="font-mono text-[10px] text-[#8A93A6] uppercase tracking-widest mb-3 block">01 / Target Merit</label>
                <input 
                  type="number" step="0.01" placeholder="00.00" value={merit} onChange={(e) => setMerit(e.target.value)}
                  className="w-full bg-transparent border-b-2 border-[#2A3441] pb-2 text-5xl font-display font-black text-[#F4F6FA] placeholder:text-[#2A3441] focus:border-[#5B6CFF] outline-none transition-colors tabular-nums"
                />
              </div>

              <div>
                <div className="flex justify-between items-center mb-3">
                  <label className="font-mono text-[10px] text-[#8A93A6] uppercase tracking-widest block">02 / Classification</label>
                  <span title="Select your specific category to see accurate cutoffs.">
                    <Info size={14} className="text-[#8A93A6] cursor-help" />
                  </span>
                </div>
                <div className="flex flex-wrap gap-2">
                  {CATEGORIES.map(c => (
                    <button 
                      key={c.id} onClick={() => setCategory(c.id)}
                      className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-all border ${category === c.id ? c.color + " shadow-[0_0_15px_currentColor]" : "bg-[#0B0E14] text-[#8A93A6] border-[#2A3441] hover:border-[#8A93A6]"}`}
                    >
                      {c.label}
                    </button>
                  ))}
                </div>
              </div>

              {!isSpecialCategory && (
                <div className="space-y-4 pt-4 border-t border-[#2A3441]">
                  <div>
                    <label className="font-mono text-[9px] text-[#8A93A6] uppercase tracking-widest mb-2 block">Demographics</label>
                    <div className="flex gap-2 mb-2">
                      {CANDIDATURE_OPTIONS.map(o => <button key={o.value} onClick={() => setCandidature(o.value as any)} className={`flex-1 py-1.5 text-[10px] font-bold uppercase rounded border transition-colors ${candidature === o.value ? "bg-[#2A3441] border-[#5B6CFF] text-white" : "bg-[#0B0E14] border-[#2A3441] text-[#8A93A6] hover:text-white"}`}>{o.label}</button>)}
                    </div>
                    <div className="flex gap-2">
                      {GENDER_OPTIONS.map(o => <button key={o.value} onClick={() => setGender(o.value as any)} className={`flex-1 py-1.5 text-[10px] font-bold uppercase rounded border transition-colors ${gender === o.value ? "bg-[#2A3441] border-[#5B6CFF] text-white" : "bg-[#0B0E14] border-[#2A3441] text-[#8A93A6] hover:text-white"}`}>{o.label}</button>)}
                    </div>
                  </div>
                  <div>
                    <label className="font-mono text-[9px] text-[#8A93A6] uppercase tracking-widest mb-2 block">Seat Matrix Level</label>
                    <div className="flex gap-2">
                      {LEVEL_OPTIONS.map(o => <button key={o.value} onClick={() => setLevel(o.value as any)} className={`flex-1 py-1.5 text-[10px] font-bold uppercase rounded border transition-colors ${level === o.value ? "bg-[#2A3441] border-[#5B6CFF] text-white" : "bg-[#0B0E14] border-[#2A3441] text-[#8A93A6] hover:text-white"}`}>{o.label}</button>)}
                    </div>
                  </div>
                </div>
              )}

              <div className="pt-4 border-t border-[#2A3441]">
                <label className="font-mono text-[10px] text-[#8A93A6] uppercase tracking-widest mb-3 block">03 / CAP Rounds</label>
                <div className="flex gap-2">
                  {[1, 2, 3, 4].map(r => (
                    <button 
                      key={r} onClick={() => setRounds(prev => prev.includes(r) ? prev.filter(x => x !== r) : [...prev, r])}
                      className={`flex-1 py-2 text-xs font-bold font-mono rounded-md transition-colors border ${rounds.includes(r) ? "bg-[#5B6CFF] border-[#5B6CFF] text-white shadow-[0_0_10px_rgba(91,108,255,0.3)]" : "bg-[#0B0E14] border-[#2A3441] text-[#8A93A6] hover:text-white"}`}
                    >
                      R{r}
                    </button>
                  ))}
                </div>
              </div>

              <details className="group pt-4 border-t border-[#2A3441]">
                <summary className="flex justify-between items-center font-mono text-[10px] text-[#8A93A6] uppercase tracking-widest cursor-pointer hover:text-white transition-colors">
                  <span>04 / Branch Filter {branchFilter.size > 0 && <span className="text-[#5B6CFF]">({branchFilter.size})</span>}</span>
                  <ChevronDown size={14} className="group-open:rotate-180 transition-transform" />
                </summary>
                <div className="mt-4 bg-[#0B0E14] border border-[#2A3441] rounded-xl p-3 space-y-3">
                  <div className="relative">
                    <Search className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-[#8A93A6]" />
                    <input type="text" placeholder="Fuzzy search branches..." value={branchQuery} onChange={(e) => setBranchQuery(e.target.value)} className="w-full bg-[#141922] border border-[#2A3441] rounded-lg pl-8 pr-3 py-2 text-xs outline-none text-white focus:border-[#5B6CFF] transition-colors" />
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

          {/* RIGHT RAIL: 3D SPATIAL RESULTS */}
          <section className="lg:col-span-8 xl:col-span-9">
            {!hasValidMerit ? (
              <div className="h-full min-h-[60vh] flex flex-col items-center justify-center border border-dashed border-[#2A3441] rounded-2xl bg-[#141922]/30">
                <Search className="w-12 h-12 text-[#2A3441] mb-6" />
                <h2 className="font-display text-2xl font-bold text-[#F4F6FA] mb-2">Awaiting Parameters</h2>
                <p className="text-[#8A93A6] text-sm max-w-md text-center">Input your precise merit score to index real-time DTE cutoffs. Results will render spatially.</p>
              </div>
            ) : results.length === 0 ? (
              <div className="h-full min-h-[60vh] flex flex-col items-center justify-center border border-dashed border-[#2A3441] rounded-2xl bg-[#141922]/30">
                <h2 className="font-display text-2xl font-bold text-[#F4F6FA] mb-2">0 Vectors Identified</h2>
                <p className="text-[#8A93A6] text-sm">No institutions match this criteria. Expand CAP rounds or adjust category.</p>
              </div>
            ) : (
              <div className="space-y-6">
                <div className="flex items-center justify-between pb-4 border-b border-[#141922]">
                  <h3 className="font-mono text-xs text-[#8A93A6] uppercase tracking-widest"><span className="text-white font-bold">{results.length}</span> Matched Branches</h3>
                  <span className="text-xs text-[#8A93A6]">Ranked by Delta Margin</span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                  {results.slice(0, 50).map((r, i) => {
                    const col = DATA.colleges[r.ci];
                    const key = `${r.ci}-${r.branch}-${r.round}-${r.seat}`;
                    const starred = shortlist.has(key);
                    const isGovt = col.status.startsWith("Government") && !col.status.includes("Aided");
                    
                    return (
                      <SpatialCard key={i}>
                        <div className="bg-[#141922] border border-[#2A3441] rounded-2xl p-6 h-full flex flex-col justify-between hover:border-[#5B6CFF]/50 transition-colors shadow-lg">
                          <div className="mb-6">
                            <div className="flex justify-between items-center mb-4">
                              <span className={`px-2 py-0.5 text-[9px] font-bold uppercase tracking-widest rounded border ${isGovt ? "bg-blue-900/30 border-blue-800 text-blue-400" : "bg-[#0B0E14] border-[#2A3441] text-[#8A93A6]"}`}>{col.status}</span>
                              <button onClick={() => toggleShortlist(key)} className={`p-1.5 rounded-md transition-colors ${starred ? "text-[#FFB020] bg-[#FFB020]/10" : "text-[#2A3441] hover:text-[#F4F6FA] hover:bg-[#2A3441]"}`}>
                                <Star size={16} fill={starred ? "currentColor" : "none"} />
                              </button>
                            </div>
                            <p className="font-mono text-[10px] text-[#8A93A6] mb-1">ID: {col.code} &middot; R{r.round}</p>
                            <h3 className="font-bold text-[#F4F6FA] text-sm leading-snug mb-2">{col.name}</h3>
                            <p className="text-xs text-[#8A93A6]">{DATA.branches[r.branch]}</p>
                          </div>

                          <div className="border-t border-[#2A3441] pt-4 flex items-end justify-between">
                            <MarginIndicator merit={meritNum} cutoff={r.merit} />
                            <div className="text-right">
                              <p className="font-mono text-[9px] text-[#8A93A6] uppercase tracking-widest mb-1">Historic Cutoff</p>
                              <p className="font-mono font-bold text-[#F4F6FA] text-lg tabular-nums">{r.merit.toFixed(2)}%</p>
                            </div>
                          </div>
                        </div>
                      </SpatialCard>
                    );
                  })}
                </div>
              </div>
            )}
          </section>
        </main>
      )}

      {/* VIEW 2: DIRECTORY SEARCH */}
      {mode === "directory" && (
        <main className="flex-1 max-w-[1600px] w-full mx-auto p-6 animate-in fade-in duration-300">
          <div className="max-w-2xl mx-auto mb-10 relative">
            <Search className="absolute left-4 top-4 h-5 w-5 text-[#8A93A6]" />
            <input 
              type="text" placeholder="Search full directory by institute name or ID code..." 
              value={dirQuery} onChange={(e) => setDirQuery(e.target.value)}
              className="w-full bg-[#141922] border border-[#2A3441] rounded-xl pl-12 pr-4 py-4 text-sm text-[#F4F6FA] outline-none focus:border-[#5B6CFF] transition-colors shadow-lg"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            {directoryResults.map((college: any) => (
              <div key={college.code} className="bg-[#141922] border border-[#2A3441] rounded-2xl overflow-hidden flex flex-col">
                <div className="p-6 border-b border-[#2A3441] flex-1">
                  <span className="font-mono text-[10px] text-[#8A93A6] uppercase tracking-widest bg-[#0B0E14] border border-[#2A3441] px-2 py-1 rounded">ID: {college.code}</span>
                  <h2 className="text-lg font-bold text-[#F4F6FA] mt-4">{college.name}</h2>
                </div>
                <div className="p-4 bg-[#0B0E14] space-y-2">
                  {college.courses.map(([branchIdx, cutoffs]: any, idx: number) => {
                    const courseId = `${college.code}-${idx}`;
                    const isOpen = expandedCourse === courseId;
                    return (
                      <div key={courseId} className="bg-[#141922] border border-[#2A3441] rounded-xl overflow-hidden">
                        <button onClick={() => setExpandedCourse(isOpen ? null : courseId)} className="w-full p-4 flex justify-between items-center hover:bg-[#2A3441]/50 transition-colors">
                          <span className="font-bold text-xs text-left text-[#F4F6FA] pr-4">{DATA.branches[branchIdx]}</span>
                          {isOpen ? <ChevronUp size={16} className="text-[#5B6CFF]" /> : <ChevronDown size={16} className="text-[#8A93A6]" />}
                        </button>
                        {isOpen && (
                          <div className="border-t border-[#2A3441] overflow-x-auto bg-[#0B0E14]">
                            <table className="w-full text-left text-xs">
                              <thead className="text-[9px] font-mono text-[#8A93A6] uppercase tracking-widest bg-[#141922] border-b border-[#2A3441]">
                                <tr><th className="p-3">Rnd</th><th className="p-3">Type</th><th className="p-3 text-right">Cutoff</th></tr>
                              </thead>
                              <tbody className="divide-y divide-[#2A3441]">
                                {cutoffs.slice().sort((a:any, b:any) => a[0] - b[0] || b[3] - a[3]).map(([round, seatIdx, stageIdx, merit]: any, cIdx: number) => (
                                  <tr key={cIdx} className="hover:bg-[#141922]">
                                    <td className="p-3 font-bold text-[#F4F6FA]">R{round}</td>
                                    <td className="p-3"><span title={decodeSeat(DATA.seatTypes[seatIdx]).code} className="text-[#8A93A6] cursor-help">{decodeSeat(DATA.seatTypes[seatIdx]).label}</span></td>
                                    <td className="p-3 font-mono font-bold text-[#5B6CFF] text-right tabular-nums">{merit.toFixed(2)}%</td>
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
        </main>
      )}

      {/* VIEW 3: STAGED OPTION FORM (PRINTABLE) */}
      {mode === "staged" && (
        <main className="flex-1 max-w-[1200px] w-full mx-auto p-6 animate-in fade-in duration-300">
          <div className="hidden print:block mb-8 border-b-2 border-black pb-4"><h1 className="text-4xl font-black text-black">DTE Form 2026</h1><p className="text-xs text-gray-500 mt-1 uppercase tracking-widest font-mono">MahaPoly Decision Tool</p></div>
          <div className="bg-[#141922] border border-[#2A3441] rounded-[2rem] p-8 md:p-12 print:bg-transparent print:border-none print:p-0 shadow-2xl">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-10 print:hidden">
              <div>
                <h2 className="font-display text-3xl font-bold text-[#F4F6FA] tracking-tight">Staged Vectors</h2>
                <p className="text-xs font-mono text-[#8A93A6] mt-2 uppercase tracking-widest">Ready for official portal execution.</p>
              </div>
              <button onClick={() => window.print()} disabled={shortlist.size === 0} className="px-8 py-3 bg-[#5B6CFF] text-white font-bold text-xs uppercase tracking-widest rounded-xl flex items-center gap-3 disabled:opacity-50 hover:bg-white hover:text-black transition-colors shadow-[0_0_20px_rgba(91,108,255,0.3)]">
                <Printer size={16} /> Print Document
              </button>
            </div>

            {shortlist.size === 0 ? (
              <div className="py-32 text-center border border-dashed border-[#2A3441] rounded-3xl bg-[#0B0E14]">
                <Star className="h-10 w-10 text-[#2A3441] mx-auto mb-4" />
                <p className="text-2xl font-black text-[#F4F6FA] mb-2 tracking-tighter">0 STAGED OPTIONS</p>
                <p className="text-[#8A93A6] text-sm">Return to the Discovery engine and use the star icon to stage preferences here.</p>
              </div>
            ) : (
              <div className="overflow-x-auto border border-[#2A3441] rounded-2xl print:border-gray-300">
                <table className="w-full text-left print:text-black">
                  <thead className="bg-[#0B0E14] text-[10px] font-mono tracking-widest uppercase font-bold text-[#8A93A6] border-b border-[#2A3441] print:bg-gray-100">
                    <tr><th className="p-6 text-center">Pref</th><th className="p-6">Sys_Code</th><th className="p-6">Institution</th><th className="p-6">Branch</th><th className="p-6 text-right">Historic Cutoff</th><th className="p-6 print:hidden"></th></tr>
                  </thead>
                  <tbody className="divide-y divide-[#2A3441] print:divide-gray-300">
                    {Array.from(shortlist).map((key, index) => {
                      const [ci, branchIdx, round, seatIdx] = key.split('-').map(Number);
                      const col = DATA.colleges[ci];
                      const meritVal = FLAT.find((f:any) => f.ci === ci && f.branch === branchIdx && f.round === round && f.seat === seatIdx)?.merit || 0;
                      return (
                        <tr key={key} className="hover:bg-[#0B0E14] transition-colors print:bg-transparent">
                          <td className="p-6 font-black text-xl text-center text-[#5B6CFF] print:text-black">{index + 1}</td>
                          <td className="p-6 font-mono text-sm text-[#8A93A6] print:text-gray-600">{col.code}</td>
                          <td className="p-6 font-bold text-[#F4F6FA] print:text-black">{col.name}</td>
                          <td className="p-6 text-[#8A93A6] font-medium print:text-gray-800">{DATA.branches[branchIdx]}</td>
                          <td className="p-6 font-mono font-bold text-right text-[#F4F6FA] text-lg tabular-nums print:text-black">{meritVal.toFixed(2)}%</td>
                          <td className="p-6 text-center print:hidden"><button onClick={() => toggleShortlist(key)} className="text-[#8A93A6] hover:text-[#FF5D5D] p-3 bg-[#0B0E14] border border-[#2A3441] rounded-xl transition-colors"><X size={16} /></button></td>
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

      {/* FOOTER */}
      <footer className="bg-[#141922] border-t border-[#2A3441] py-6 px-6 mt-auto print:hidden">
        <div className="max-w-[1600px] mx-auto flex flex-col md:flex-row items-center gap-4 text-center md:text-left">
          <ShieldCheck className="text-[#5B6CFF] shrink-0" />
          <p className="text-xs text-[#8A93A6] max-w-4xl leading-relaxed">
            <strong className="text-[#F4F6FA]">Decision-Support Tool:</strong> This engine aggregates historical CAP data. Cutoffs fluctuate annually. Always verify final matrices with the official <span className="text-[#5B6CFF] font-bold">Maharashtra CET Cell portal</span> before submitting options.
          </p>
        </div>
      </footer>
    </div>
  );
}