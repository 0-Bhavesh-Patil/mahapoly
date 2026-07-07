"use client";

import { useMemo, useState, useEffect } from "react";
import {
  Search,
  Building2,
  ChevronDown,
  ChevronUp,
  GraduationCap,
  SlidersHorizontal,
  Star,
  X,
  Share2,
  Printer,
  Check,
  Layers,
  Box,
  Cpu
} from "lucide-react";
import raw from "../data.json";
import {
  decodeSeat,
  resolveSeatCodes,
  CATEGORY_OPTIONS,
  LEVEL_OPTIONS,
  CANDIDATURE_OPTIONS,
  GENDER_OPTIONS,
  type Candidature,
  type Gender,
  type Level,
} from "../lib/seatTypes";

// ---------- CORE DATA LAYER (PRESERVED) ----------
type RawCutoff = [number, number, number, number];
type RawCourse = [number, RawCutoff[]];
type RawCollege = { code: string; name: string; status: string; courses: RawCourse[] };
type RawData = { branches: string[]; seatTypes: string[]; stages: string[]; colleges: RawCollege[] };

const DATA = raw as unknown as RawData;

type FlatRow = { ci: number; branch: number; round: number; seat: number; stage: number; merit: number };

const FLAT: FlatRow[] = (() => {
  const rows: FlatRow[] = [];
  DATA.colleges.forEach((college, ci) => {
    college.courses.forEach(([branch, cutoffs]) => {
      cutoffs.forEach(([round, seat, stage, merit]) => {
        rows.push({ ci, branch, round, seat, stage, merit });
      });
    });
  });
  return rows;
})();

const BRANCH_LIST = DATA.branches.map((name, idx) => ({ idx, name })).sort((a, b) => a.name.localeCompare(b.name));
const SEAT_INDEX = new Map<string, number>(DATA.seatTypes.map((s, i) => [s, i]));

// ---------- 3D & UI ATOMS ----------

function Pill({ active, onClick, children }: { active: boolean; onClick: () => void; children: React.ReactNode; }) {
  return (
    <button
      onClick={onClick}
      className={`px-3 py-2 rounded-lg text-xs font-bold uppercase tracking-wider transition-all duration-300 border flex-1 text-center ${
        active
          ? "bg-gradient-to-br from-cyan-400 to-blue-600 text-white border-transparent shadow-[0_0_15px_rgba(6,182,212,0.4)]"
          : "bg-[#111] border-[#222] text-[#888] hover:border-[#444] hover:text-white"
      }`}
    >
      {children}
    </button>
  );
}

function StatusBadge({ status }: { status: string }) {
  const isGovt = status.startsWith("Government") && !status.includes("Aided");
  return (
    <span
      className={`px-2 py-1 text-[9px] font-black tracking-widest rounded uppercase border ${
        isGovt 
          ? "bg-cyan-500/10 border-cyan-500/40 text-cyan-400 shadow-[0_0_10px_rgba(6,182,212,0.2)]" 
          : "bg-[#1A1A1A] border-[#333] text-[#888]"
      }`}
    >
      {status}
    </span>
  );
}

function MarginBar({ merit, cutoff }: { merit: number; cutoff: number }) {
  const margin = merit - cutoff;
  const color = margin >= 5 ? "#00F0FF" : margin >= 0 ? "#7C3AED" : "#444"; 
  const pct = Math.max(4, Math.min(100, (cutoff / 100) * 100));
  
  return (
    <div className="flex flex-col gap-1 w-full max-w-[140px]">
      <div className="flex items-center justify-between">
         <span className="text-[10px] font-mono text-[#666] uppercase">Delta</span>
         <span className="text-xs font-black tabular-nums" style={{ color: margin >= 0 ? color : '#666' }}>
          {margin >= 0 ? '+' : ''}{margin.toFixed(2)}%
        </span>
      </div>
      <div className="relative w-full h-1.5 rounded-full bg-[#111] border border-[#222] overflow-hidden">
        <div className="absolute inset-y-0 left-0 rounded-full transition-all duration-700 shadow-[0_0_10px_currentColor]" style={{ width: `${pct}%`, backgroundColor: color, color: color }} />
      </div>
    </div>
  );
}

// 3D CSS LOADER
function Loader3D() {
  return (
    <div className="flex flex-col items-center justify-center py-32 space-y-8 animate-in fade-in">
      <div className="perspective-[1000px] w-24 h-24">
        <div className="w-full h-full relative preserve-3d animate-[spin3D_3s_linear_infinite]">
          {/* 3D Cube Faces */}
          <div className="absolute inset-0 border-2 border-cyan-400 bg-cyan-500/10 shadow-[0_0_30px_rgba(6,182,212,0.3)] translate-z-12 flex items-center justify-center"><Cpu size={32} className="text-cyan-400 opacity-50"/></div>
          <div className="absolute inset-0 border-2 border-purple-500 bg-purple-500/10 -translate-z-12"></div>
          <div className="absolute inset-0 border-2 border-blue-500 bg-blue-500/10 rotate-y-90 translate-x-12"></div>
          <div className="absolute inset-0 border-2 border-blue-500 bg-blue-500/10 rotate-y-90 -translate-x-12"></div>
          <div className="absolute inset-0 border-2 border-cyan-500 bg-cyan-500/10 rotate-x-90 -translate-y-12"></div>
          <div className="absolute inset-0 border-2 border-cyan-500 bg-cyan-500/10 rotate-x-90 translate-y-12"></div>
        </div>
      </div>
      <p className="text-cyan-400 font-mono text-sm tracking-[0.3em] uppercase animate-pulse">Computing Spatial Matrices</p>
    </div>
  );
}

// 3D SPATIAL TUTORIAL
function SpatialTutorial({ onClose }: { onClose: () => void }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#050505]/80 backdrop-blur-xl animate-in fade-in duration-500">
      <div className="relative w-full max-w-5xl px-8 flex flex-col items-center">
        
        <h2 className="text-4xl md:text-5xl font-black text-white tracking-tighter mb-12 drop-shadow-[0_0_20px_rgba(255,255,255,0.3)] text-center">
          SYSTEM <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-purple-500">ONBOARDING</span>
        </h2>

        {/* 3D Floating Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 perspective-[2000px] w-full mb-16">
          
          <div className="bg-gradient-to-b from-[#111] to-[#0A0A0A] border border-[#222] p-8 rounded-3xl transform-gpu rotate-y-[15deg] rotate-x-[10deg] hover:rotate-y-0 hover:rotate-x-0 transition-all duration-500 shadow-[-20px_20px_30px_rgba(0,0,0,0.5)]">
            <div className="w-12 h-12 bg-cyan-500/20 rounded-2xl border border-cyan-500/40 flex items-center justify-center mb-6 shadow-[0_0_20px_rgba(6,182,212,0.2)]">
              <SlidersHorizontal className="text-cyan-400" />
            </div>
            <h3 className="text-xl font-bold text-white mb-2">Configure Parameters</h3>
            <p className="text-[#888] text-sm">Input your merit percentage into the high-density sidebar grid to calibrate the engine.</p>
          </div>

          <div className="bg-gradient-to-b from-[#111] to-[#0A0A0A] border border-[#222] p-8 rounded-3xl transform-gpu hover:-translate-y-4 transition-all duration-500 shadow-[0_20px_30px_rgba(0,0,0,0.5)] relative z-10">
            <div className="absolute inset-0 bg-gradient-to-b from-purple-500/5 to-transparent rounded-3xl pointer-events-none" />
            <div className="w-12 h-12 bg-purple-500/20 rounded-2xl border border-purple-500/40 flex items-center justify-center mb-6 shadow-[0_0_20px_rgba(168,85,247,0.2)]">
              <Layers className="text-purple-400" />
            </div>
            <h3 className="text-xl font-bold text-white mb-2">Analyze Spatial Data</h3>
            <p className="text-[#888] text-sm">Review the computed matrix. The system automatically calculates delta margins for every branch.</p>
          </div>

          <div className="bg-gradient-to-b from-[#111] to-[#0A0A0A] border border-[#222] p-8 rounded-3xl transform-gpu -rotate-y-[15deg] rotate-x-[10deg] hover:rotate-y-0 hover:rotate-x-0 transition-all duration-500 shadow-[20px_20px_30px_rgba(0,0,0,0.5)]">
            <div className="w-12 h-12 bg-blue-500/20 rounded-2xl border border-blue-500/40 flex items-center justify-center mb-6 shadow-[0_0_20px_rgba(59,130,246,0.2)]">
              <Star className="text-blue-400 fill-blue-400" />
            </div>
            <h3 className="text-xl font-bold text-white mb-2">Stage Option Form</h3>
            <p className="text-[#888] text-sm">Select branches to instantly generate a printable, shareable DTE Option Form sequence.</p>
          </div>

        </div>

        <button 
          onClick={onClose}
          className="px-12 py-4 bg-white text-black font-black text-sm uppercase tracking-[0.2em] rounded-full hover:scale-105 transition-transform shadow-[0_0_30px_rgba(255,255,255,0.3)]"
        >
          Initialize Workspace
        </button>
      </div>
    </div>
  );
}

// ---------- MATCH MODE (WIDE DASHBOARD GRID) ----------

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

    const best = new Map<string, FlatRow>();
    for (const row of FLAT) {
      if (row.round !== round) continue;
      if (!seatIdxs.has(row.seat)) continue;
      if (row.merit > meritNum) continue; 
      if (branchFilter.size > 0 && !branchFilter.has(row.branch)) continue;
      const key = `${row.ci}-${row.branch}`;
      const existing = best.get(key);
      if (!existing || row.merit > existing.merit) best.set(key, row);
    }
    return Array.from(best.values()).sort((a, b) => b.merit - a.merit);
  }, [hasValidMerit, meritNum, category, candidature, gender, level, round, branchFilter]);

  const filteredBranchList = branchQuery ? BRANCH_LIST.filter((b) => b.name.toLowerCase().includes(branchQuery.toLowerCase())) : BRANCH_LIST;

  return (
    <div className="grid grid-cols-1 xl:grid-cols-12 gap-8 animate-in fade-in duration-500">
      
      {/* LEFT SIDEBAR: STICKY PARAMETER DASHBOARD */}
      <div className="xl:col-span-4 space-y-6">
        <div className="sticky top-8 bg-[#050505] border border-[#1A1A1A] rounded-[32px] p-6 shadow-2xl relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-cyan-400 via-purple-500 to-transparent" />
          
          <h2 className="text-sm font-black uppercase tracking-[0.2em] text-white mb-6 flex items-center gap-2">
            <Box size={16} className="text-cyan-400" /> Control Matrix
          </h2>

          <div className="space-y-6">
            <div>
              <label className="block text-[10px] font-mono text-[#888] mb-2 uppercase tracking-widest">Merit Value</label>
              <input
                type="number" step="0.01" placeholder="82.40"
                value={merit} onChange={(e) => setMerit(e.target.value)}
                className="w-full bg-[#0A0A0A] border border-[#222] rounded-2xl px-5 py-4 text-3xl font-black tabular-nums text-white placeholder:text-[#333] focus:border-cyan-400 focus:shadow-[0_0_15px_rgba(6,182,212,0.2)] outline-none transition-all"
              />
            </div>

            <div>
              <label className="block text-[10px] font-mono text-[#888] mb-2 uppercase tracking-widest">Category</label>
              <select
                value={category} onChange={(e) => setCategory(e.target.value)}
                className="w-full px-5 py-4 bg-[#0A0A0A] border border-[#222] rounded-2xl text-sm font-bold text-white focus:border-cyan-400 outline-none transition-all appearance-none"
              >
                {CATEGORY_OPTIONS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
              </select>
            </div>

            {!isSpecialCategory && (
              <div className="space-y-4 pt-4 border-t border-[#111]">
                <div className="flex gap-2 w-full">{CANDIDATURE_OPTIONS.map((o) => <Pill key={o.value} active={candidature === o.value} onClick={() => setCandidature(o.value)}>{o.label}</Pill>)}</div>
                <div className="flex gap-2 w-full">{GENDER_OPTIONS.map((o) => <Pill key={o.value} active={gender === o.value} onClick={() => setGender(o.value)}>{o.label}</Pill>)}</div>
                <div className="flex gap-2 w-full">{LEVEL_OPTIONS.map((o) => <Pill key={o.value} active={level === o.value} onClick={() => setLevel(o.value)}>{o.label}</Pill>)}</div>
              </div>
            )}

            <div className="pt-4 border-t border-[#111]">
              <label className="block text-[10px] font-mono text-[#888] mb-2 uppercase tracking-widest">CAP Round Sequence</label>
              <div className="grid grid-cols-4 gap-2">
                {[1, 2, 3, 4].map((r) => (
                  <button key={r} onClick={() => setRound(r)} className={`py-3 rounded-xl text-sm font-black transition-all border ${round === r ? "bg-white text-black border-white shadow-[0_0_15px_rgba(255,255,255,0.3)]" : "bg-[#0A0A0A] border-[#222] text-[#666] hover:text-white hover:border-[#444]"}`}>R{r}</button>
                ))}
              </div>
            </div>

            <details className="group pt-4 border-t border-[#111]">
              <summary className="flex items-center justify-between text-[10px] font-mono font-bold text-[#888] uppercase tracking-widest cursor-pointer hover:text-white list-none transition-colors">
                <span>Branch Filter {branchFilter.size > 0 && <span className="text-cyan-400 ml-1">({branchFilter.size})</span>}</span>
                <ChevronDown className="h-4 w-4 group-open:rotate-180 transition-transform" />
              </summary>
              <div className="mt-4 p-4 bg-[#0A0A0A] border border-[#222] rounded-2xl space-y-3">
                <input type="text" placeholder="Search..." value={branchQuery} onChange={(e) => setBranchQuery(e.target.value)} className="w-full px-3 py-2 bg-[#050505] border border-[#222] rounded-lg text-xs outline-none text-white focus:border-cyan-400 transition-colors" />
                <div className="flex flex-col gap-1 max-h-40 overflow-y-auto custom-scrollbar pr-2">
                  {filteredBranchList.map((b) => (
                    <button key={b.idx} onClick={() => { const next = new Set(branchFilter); branchFilter.has(b.idx) ? next.delete(b.idx) : next.add(b.idx); setBranchFilter(next); }} className={`px-3 py-2 rounded-lg text-xs font-semibold text-left transition-colors ${branchFilter.has(b.idx) ? "bg-cyan-500/20 text-cyan-400 border border-cyan-500/30" : "text-[#888] hover:bg-[#111] hover:text-white"}`}>
                      {b.name}
                    </button>
                  ))}
                </div>
              </div>
            </details>
          </div>
        </div>
      </div>

      {/* RIGHT AREA: DATA MATRIX */}
      <div className="xl:col-span-8">
        {!hasValidMerit ? (
          <div className="flex flex-col items-center justify-center h-full min-h-[400px] border border-dashed border-[#222] rounded-[32px] bg-[#050505]/50">
            <Search className="h-10 w-10 text-[#333] mb-4" />
            <p className="text-xl font-bold text-[#666]">Engine Awaiting Input</p>
          </div>
        ) : isCalculating ? (
          <Loader3D />
        ) : results.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full min-h-[400px] border border-dashed border-[#222] rounded-[32px] bg-[#050505]/50">
            <p className="text-2xl font-black text-white">0 VECTORS MATCHED</p>
            <p className="text-sm text-[#888] mt-2">Expand parameters to increase search radius.</p>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="flex items-center justify-between px-2 mb-6">
              <div className="text-[10px] font-mono uppercase tracking-[0.2em] text-[#888]">
                Displaying <span className="text-white font-black text-xs">{results.length}</span> Results
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {results.map((r) => {
                const college = DATA.colleges[r.ci];
                const key = `${r.ci}-${r.branch}-${r.round}-${r.seat}`;
                const starred = shortlist.has(key);
                
                return (
                  <div key={key} className="group flex flex-col justify-between bg-[#080808] border border-[#1A1A1A] hover:border-[#333] rounded-2xl p-5 transition-all duration-300 hover:shadow-[0_10px_30px_rgba(0,0,0,0.5)]">
                    
                    <div className="mb-6">
                      <div className="flex items-center justify-between mb-3">
                        <StatusBadge status={college.status} />
                        <span className="text-[9px] font-mono text-[#666] uppercase bg-[#111] px-2 py-0.5 rounded">ID: {college.code}</span>
                      </div>
                      <h3 className="text-base font-bold text-white leading-tight group-hover:text-cyan-400 transition-colors mb-2 line-clamp-2">{college.name}</h3>
                      <div className="text-xs font-semibold text-[#888] flex items-center gap-2">
                        <GraduationCap size={14} className="text-purple-400" /> {DATA.branches[r.branch]}
                      </div>
                    </div>
                    
                    <div className="flex items-end justify-between pt-4 border-t border-[#111]">
                      <MarginBar merit={meritNum} cutoff={r.merit} />
                      
                      <button
                        onClick={() => toggleShortlist(key)}
                        className={`p-3 rounded-xl border transition-all duration-300 ${
                          starred 
                            ? "bg-white border-white text-black shadow-[0_0_15px_rgba(255,255,255,0.3)] scale-105" 
                            : "bg-[#0A0A0A] border-[#222] text-[#666] hover:border-[#444] hover:text-white"
                        }`}
                      >
                        <Star size={16} className={starred ? "fill-current" : ""} />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// ---------- DIRECTORY MODE (DENSE GRID) ----------

function BrowseMode({ expandedCourse, setExpandedCourse }: { expandedCourse: string | null; setExpandedCourse: (val: string | null) => void; }) {
  const [query, setQuery] = useState("");

  const filtered = useMemo(() => {
    if (!query.trim()) return DATA.colleges.slice(0, 30);
    const q = query.toLowerCase();
    return DATA.colleges.filter((c) => c.name.toLowerCase().includes(q) || c.code.includes(q));
  }, [query]);

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="w-full max-w-2xl bg-[#050505] border border-[#1A1A1A] rounded-[24px] p-3 shadow-2xl relative">
        <Search className="absolute left-6 top-6 h-5 w-5 text-[#666]" />
        <input
          type="text" placeholder="Query full database by institute or code..." value={query} onChange={(e) => setQuery(e.target.value)}
          className="w-full pl-12 pr-4 py-3 bg-[#0A0A0A] border border-[#222] rounded-xl outline-none text-white focus:border-cyan-400 text-sm font-mono transition-colors"
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {filtered.map((college) => (
          <div key={college.code} className="bg-[#050505] rounded-3xl border border-[#1A1A1A] overflow-hidden hover:border-[#333] transition-colors flex flex-col">
            <div className="p-6 border-b border-[#111] flex-1">
              <div className="flex items-center justify-between mb-4">
                <StatusBadge status={college.status} />
                <span className="text-[10px] font-mono font-bold text-[#666]">#{college.code}</span>
              </div>
              <h2 className="text-lg font-bold text-white line-clamp-2">{college.name}</h2>
            </div>

            <div className="p-3 bg-[#0A0A0A] space-y-2">
              {college.courses.map(([branchIdx, cutoffs], idx) => {
                const courseId = `${college.code}-${idx}`;
                const branchName = DATA.branches[branchIdx];
                const isOpen = expandedCourse === courseId;
                
                return (
                  <div key={courseId} className="bg-[#050505] border border-[#1A1A1A] rounded-2xl overflow-hidden transition-all">
                    <button onClick={() => setExpandedCourse(isOpen ? null : courseId)} className="w-full flex items-center justify-between p-4 hover:bg-[#111] transition-colors">
                      <span className="font-bold text-xs text-left text-slate-300 pr-4">{branchName}</span>
                      {isOpen ? <ChevronUp size={14} className="text-cyan-400 shrink-0" /> : <ChevronDown size={14} className="text-[#666] shrink-0" />}
                    </button>
                    {isOpen && (
                      <div className="border-t border-[#111] overflow-x-auto bg-[#030303]">
                        <table className="w-full text-xs text-left">
                          <thead className="text-[9px] uppercase tracking-widest text-[#666]">
                            <tr><th className="px-4 py-3">Rnd</th><th className="px-4 py-3">Type</th><th className="px-4 py-3 text-right">Cutoff</th></tr>
                          </thead>
                          <tbody className="divide-y divide-[#111]">
                            {cutoffs.slice().sort((a, b) => a[0] - b[0] || b[3] - a[3]).map(([round, seatIdx, stageIdx, merit], cIdx) => (
                              <tr key={cIdx} className="hover:bg-[#111]">
                                <td className="px-4 py-3 font-bold text-white">R{round}</td>
                                <td className="px-4 py-3"><span title={decodeSeat(DATA.seatTypes[seatIdx]).code} className="text-[#CCC] cursor-help">{decodeSeat(DATA.seatTypes[seatIdx]).label}</span></td>
                                <td className="px-4 py-3 font-black text-right text-cyan-400 tabular-nums">{merit.toFixed(2)}%</td>
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

// ---------- OPTION FORM ----------

function OptionFormMode({ shortlist, toggleShortlist }: { shortlist: Set<string>; toggleShortlist: (key: string) => void; }) {
  const [copied, setCopied] = useState(false);

  const handleShare = () => {
    if (shortlist.size === 0) return;
    const url = `${window.location.origin}${window.location.pathname}?list=${Array.from(shortlist).join(',')}`;
    navigator.clipboard.writeText(url).then(() => { setCopied(true); setTimeout(() => setCopied(false), 2000); });
  };

  const rows = Array.from(shortlist).map(key => {
    const [ci, branchIdx, round, seatIdx] = key.split('-').map(Number);
    const college = DATA.colleges[ci];
    return { key, code: college.code, name: college.name, branch: DATA.branches[branchIdx], merit: FLAT.find(f => f.ci === ci && f.branch === branchIdx && f.round === round && f.seat === seatIdx)?.merit || 0 };
  });

  return (
    <div className="animate-in fade-in duration-500 w-full max-w-5xl mx-auto">
      <div className="hidden print:block mb-8 border-b-4 border-black pb-4"><h1 className="text-4xl font-black text-black">DTE Option Form</h1><p className="text-sm font-bold text-gray-500">MahaPoly Generated</p></div>
      <div className="bg-[#050505] border border-[#1A1A1A] rounded-[32px] p-6 md:p-10 print:bg-transparent print:border-none print:p-0">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6 mb-8 print:hidden">
          <div><h2 className="text-3xl font-black text-white">Staged Options</h2><p className="text-sm text-[#888] mt-1">Review selection sequence prior to DTE portal execution.</p></div>
          <div className="flex gap-3 w-full sm:w-auto">
            <button onClick={handleShare} disabled={shortlist.size === 0} className="flex-1 sm:flex-none px-6 py-3 bg-[#111] hover:bg-[#222] border border-[#333] text-white text-xs font-bold uppercase tracking-widest rounded-xl flex items-center justify-center gap-2 transition-all disabled:opacity-50">
              {copied ? <Check size={16} className="text-cyan-400" /> : <Share2 size={16} />} Share
            </button>
            <button onClick={() => window.print()} disabled={shortlist.size === 0} className="flex-1 sm:flex-none px-6 py-3 bg-white text-black hover:bg-gray-200 text-xs font-bold uppercase tracking-widest rounded-xl flex items-center justify-center gap-2 transition-all disabled:opacity-50 shadow-[0_0_20px_rgba(255,255,255,0.2)]">
              <Printer size={16} /> Print
            </button>
          </div>
        </div>
        {shortlist.size === 0 ? (
          <div className="py-24 text-center border border-dashed border-[#222] rounded-2xl bg-[#0A0A0A]">
            <Star className="h-10 w-10 text-[#444] mx-auto mb-4" />
            <p className="text-xl font-bold text-[#888]">No choices staged.</p>
          </div>
        ) : (
          <div className="overflow-x-auto rounded-2xl border border-[#1A1A1A] print:border-gray-300">
            <table className="w-full text-left print:text-black">
              <thead className="bg-[#0A0A0A] border-b border-[#1A1A1A] text-[10px] uppercase tracking-widest font-bold text-[#666] print:bg-gray-100 print:text-black">
                <tr><th className="px-6 py-5 text-center">Pref</th><th className="px-6 py-5">Code</th><th className="px-6 py-5">Institution</th><th className="px-6 py-5">Branch</th><th className="px-6 py-5 text-right">Cutoff</th><th className="px-6 py-5 print:hidden"></th></tr>
              </thead>
              <tbody className="divide-y divide-[#1A1A1A] print:divide-gray-300">
                {rows.map((item, index) => (
                  <tr key={item.key} className="hover:bg-[#111] transition-colors print:bg-transparent">
                    <td className="px-6 py-5 font-black text-xl text-center text-cyan-400 print:text-black">{index + 1}</td>
                    <td className="px-6 py-5 font-mono text-sm text-[#888] print:text-gray-600">{item.code}</td>
                    <td className="px-6 py-5 font-bold text-[#CCC] print:text-black">{item.name}</td>
                    <td className="px-6 py-5 font-medium text-[#888] print:text-gray-800">{item.branch}</td>
                    <td className="px-6 py-5 font-black text-right text-white text-lg tabular-nums print:text-black">{item.merit.toFixed(2)}%</td>
                    <td className="px-6 py-5 text-center print:hidden"><button onClick={() => toggleShortlist(item.key)} className="text-[#666] hover:text-red-500 p-2 rounded-lg hover:bg-[#1A1A1A]"><X size={18} /></button></td>
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

// ---------- ROOT LAYOUT (FULL WIDE GRID) ----------

export default function PolytechnicDashboard() {
  const [mode, setMode] = useState<"match" | "browse" | "option-form">("match");
  const [shortlist, setShortlist] = useState<Set<string>>(new Set());
  const [expandedCourse, setExpandedCourse] = useState<string | null>(null);
  const [showTutorial, setShowTutorial] = useState(false);

  useEffect(() => {
    try {
      const savedList = localStorage.getItem("mahapoly-shortlist");
      if (savedList) setShortlist(new Set(JSON.parse(savedList)));
      
      const hasSeenTutorial = sessionStorage.getItem("mahapoly-tutorial-seen");
      if (!hasSeenTutorial) setShowTutorial(true);
    } catch {}
  }, []);

  return (
    <div className="min-h-screen bg-[#000000] text-white font-sans selection:bg-cyan-500/30 overflow-x-hidden">
      
      {/* 3D CSS GLOBALS */}
      <style dangerouslySetInnerHTML={{__html: `
        .preserve-3d { transform-style: preserve-3d; }
        .translate-z-12 { transform: translateZ(48px); }
        .-translate-z-12 { transform: translateZ(-48px); }
        .rotate-y-90 { transform: rotateY(90deg); }
        .rotate-x-90 { transform: rotateX(90deg); }
        .translate-x-12 { transform: rotateY(90deg) translateZ(48px); }
        .-translate-x-12 { transform: rotateY(90deg) translateZ(-48px); }
        .translate-y-12 { transform: rotateX(90deg) translateZ(48px); }
        .-translate-y-12 { transform: rotateX(90deg) translateZ(-48px); }
        @keyframes spin3D {
          0% { transform: rotateX(0deg) rotateY(0deg) rotateZ(0deg); }
          100% { transform: rotateX(360deg) rotateY(360deg) rotateZ(0deg); }
        }
      `}} />

      {showTutorial && <SpatialTutorial onClose={() => { setShowTutorial(false); sessionStorage.setItem("mahapoly-tutorial-seen", "true"); }} />}

      <div className="w-full max-w-[1600px] mx-auto px-4 md:px-8 xl:px-12 py-10 print:p-0">
        
        <header className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12 pb-8 border-b border-[#111] print:hidden">
          <div className="space-y-2">
            <h1 className="text-4xl md:text-5xl font-black tracking-tight text-white">
              MAHA<span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-500">POLY</span>
            </h1>
            <p className="text-[#666] text-sm font-medium">
              Spatial Cutoff Engine // {DATA.colleges.length} Institutions Indexed
            </p>
          </div>

          <div className="flex bg-[#050505] p-1.5 rounded-2xl border border-[#1A1A1A] w-full md:w-auto overflow-x-auto custom-scrollbar">
            <button onClick={() => setMode("match")} className={`px-8 py-3 rounded-xl text-xs font-bold uppercase tracking-widest transition-all whitespace-nowrap ${mode === "match" ? "bg-white text-black shadow-sm" : "text-[#666] hover:text-white"}`}>Engine</button>
            <button onClick={() => setMode("browse")} className={`px-8 py-3 rounded-xl text-xs font-bold uppercase tracking-widest transition-all whitespace-nowrap ${mode === "browse" ? "bg-white text-black shadow-sm" : "text-[#666] hover:text-white"}`}>Directory</button>
            <button onClick={() => setMode("option-form")} className={`px-8 py-3 rounded-xl text-xs font-bold uppercase tracking-widest transition-all flex items-center justify-center gap-2 whitespace-nowrap ${mode === "option-form" ? "bg-white text-black shadow-sm" : "text-[#666] hover:text-white"}`}>
              <Star size={14} className={shortlist.size > 0 ? "fill-current" : ""} /> Form {shortlist.size > 0 && `(${shortlist.size})`}
            </button>
          </div>
        </header>

        {mode === "match" && <MatchMode shortlist={shortlist} toggleShortlist={(k) => setShortlist(p => { const n = new Set(p); n.has(k) ? n.delete(k) : n.add(k); localStorage.setItem("mahapoly-shortlist", JSON.stringify(Array.from(n))); return n; })} />}
        {mode === "browse" && <BrowseMode expandedCourse={expandedCourse} setExpandedCourse={setExpandedCourse} />}
        {mode === "option-form" && <OptionFormMode shortlist={shortlist} toggleShortlist={(k) => setShortlist(p => { const n = new Set(p); n.has(k) ? n.delete(k) : n.add(k); localStorage.setItem("mahapoly-shortlist", JSON.stringify(Array.from(n))); return n; })} />}
        
      </div>
    </div>
  );
}