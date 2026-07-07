"use client";

import { useMemo, useState, useEffect } from "react";
import {
  Search,
  Building2,
  GraduationCap,
  Star,
  X,
  Share2,
  Printer,
  Terminal,
  Activity,
  ChevronRight,
  ChevronDown,
  ChevronUp,
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

// ---------- CORE DATA LAYER ----------
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

// ---------- BOOT SEQUENCE ----------

function BootSequence({ onComplete }: { onComplete: () => void }) {
  const [step, setStep] = useState(0);
  
  useEffect(() => {
    const sequence = [
      setTimeout(() => setStep(1), 500),
      setTimeout(() => setStep(2), 1200),
      setTimeout(() => setStep(3), 1800),
      setTimeout(() => onComplete(), 2500)
    ];
    return () => sequence.forEach(clearTimeout);
  }, [onComplete]);

  return (
    <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-[#030303] text-[#00FF66] font-mono p-6">
      <div className="w-full max-w-2xl space-y-4">
        <div className="flex items-center gap-3 text-sm opacity-50 mb-8 animate-pulse">
          <Terminal size={16} /> SYSTEM BOOT
        </div>
        <div className="text-2xl md:text-4xl font-black tracking-tighter">
          {step >= 0 && <p className="animate-in fade-in slide-in-from-bottom-4 duration-300">&gt; INITIALIZING MAHA_POLY ENGINE...</p>}
          {step >= 1 && <p className="animate-in fade-in slide-in-from-bottom-4 duration-300 text-white mt-2">&gt; PARSING {DATA.colleges.length} INSTITUTES...</p>}
          {step >= 2 && <p className="animate-in fade-in slide-in-from-bottom-4 duration-300 text-[#00FF66] mt-2">&gt; SYNCING REAL-TIME CUTOFFS... [OK]</p>}
        </div>
        {step >= 2 && (
          <div className="w-full h-1 bg-[#111] mt-8 overflow-hidden rounded-full">
            <div className="h-full bg-[#00FF66] w-full animate-[progress_0.7s_ease-in-out]" style={{ animationFillMode: 'forwards' }} />
          </div>
        )}
      </div>
    </div>
  );
}

function ScanningLoader() {
  return (
    <div className="relative w-full h-32 bg-[#0A0A0A] border border-[#222] rounded-2xl overflow-hidden flex items-center justify-center">
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-[#00FF66]/10 to-transparent h-[200%] animate-pulse" />
      <div className="flex items-center gap-3 text-[#00FF66] font-mono text-sm uppercase tracking-widest z-10">
        <Activity size={16} className="animate-spin" /> Processing Matrices
      </div>
    </div>
  );
}

// ---------- MATCH ENGINE ----------

function MatchMode({ shortlist, toggleShortlist }: { shortlist: Set<string>; toggleShortlist: (key: string) => void; }) {
  const [merit, setMerit] = useState<string>("");
  const [category, setCategory] = useState("OPEN");
  const [candidature, setCandidature] = useState<Candidature>("N");
  const [gender, setGender] = useState<Gender>("G");
  const [level, setLevel] = useState<Level>("H");
  const [round, setRound] = useState(1);
  const [branchQuery, setBranchQuery] = useState("");
  const [branchFilter, setBranchFilter] = useState<Set<number>>(new Set());
  const [isCalculating, setIsCalculating] = useState(false);
  const [visibleCount, setVisibleCount] = useState(20);

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
    <div className="space-y-8 relative z-10 animate-in fade-in duration-700">
      
      {/* BENTO BOX CONTROLS */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        
        <div className="md:col-span-2 bg-[#080808] border border-[#1F1F1F] rounded-3xl p-6 relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full blur-[80px] -translate-y-1/2 translate-x-1/2 group-hover:bg-[#00FF66]/10 transition-colors duration-700" />
          <label className="block text-[10px] font-mono text-[#888] mb-4 uppercase tracking-[0.2em]">01 // Target Merit</label>
          <div className="flex items-end gap-4 relative z-10">
            <input
              type="number" step="0.01" placeholder="00.00"
              value={merit} onChange={(e) => setMerit(e.target.value)}
              className="bg-transparent text-6xl md:text-8xl font-black tabular-nums text-white placeholder:text-[#222] focus:outline-none w-full tracking-tighter"
            />
            <span className="text-2xl text-[#444] mb-4 md:mb-6 font-black">%</span>
          </div>
        </div>

        <div className="bg-[#080808] border border-[#1F1F1F] rounded-3xl p-6 flex flex-col gap-6">
          <div>
            <label className="block text-[10px] font-mono text-[#888] mb-3 uppercase tracking-[0.2em]">02 // Class</label>
            <select
              value={category} onChange={(e) => setCategory(e.target.value)}
              className="w-full bg-[#111] border border-[#222] rounded-xl px-4 py-3 text-white focus:outline-none focus:border-[#00FF66] transition-colors appearance-none font-medium"
            >
              {CATEGORY_OPTIONS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-[10px] font-mono text-[#888] mb-3 uppercase tracking-[0.2em]">03 // CAP Stage</label>
            <div className="grid grid-cols-4 gap-2">
              {[1, 2, 3, 4].map((r) => (
                <button
                  key={r} onClick={() => setRound(r)}
                  className={`py-3 rounded-xl font-bold transition-all ${round === r ? "bg-white text-black shadow-[0_0_20px_rgba(255,255,255,0.3)]" : "bg-[#111] text-[#666] hover:bg-[#222]"}`}
                >
                  {r}
                </button>
              ))}
            </div>
          </div>
        </div>

        {!isSpecialCategory && (
          <div className="md:col-span-3 bg-[#080808] border border-[#1F1F1F] rounded-3xl p-6 flex flex-wrap gap-x-12 gap-y-6">
            {( [
              { label: "Candidature", val: candidature, set: setCandidature, opts: CANDIDATURE_OPTIONS },
              { label: "Gender", val: gender, set: setGender, opts: GENDER_OPTIONS },
              { label: "Seat Level", val: level, set: setLevel, opts: LEVEL_OPTIONS }
            ] as const ).map((group) => (
              <div key={group.label}>
                <label className="block text-[10px] font-mono text-[#888] mb-3 uppercase tracking-[0.2em]">{group.label}</label>
                <div className="flex flex-wrap bg-[#111] rounded-xl p-1 w-fit border border-[#222]">
                  {group.opts.map((o) => (
                    <button
                      key={o.value} onClick={() => group.set(o.value as any)}
                      className={`px-4 py-2 rounded-lg text-xs font-bold transition-all ${group.val === o.value ? 'bg-white text-black' : 'text-[#666] hover:text-white'}`}
                    >
                      {o.label}
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* RESULTS */}
      {!hasValidMerit ? (
        <div className="py-24 text-center">
          <Cpu className="mx-auto h-12 w-12 text-[#222] mb-6" />
          <h2 className="text-2xl font-black text-[#666] tracking-tight">ENGINE STANDBY</h2>
          <p className="text-sm font-mono text-[#444] mt-2">AWAITING MERIT PARAMETERS...</p>
        </div>
      ) : isCalculating ? (
        <ScanningLoader />
      ) : results.length === 0 ? (
        <div className="py-24 text-center border border-dashed border-[#333] rounded-3xl bg-[#050505]">
          <h2 className="text-2xl font-black text-white tracking-tight mb-2">ZERO MATCHES</h2>
          <p className="text-sm text-[#888]">Adjust structural parameters to expand search radius.</p>
        </div>
      ) : (
        <div className="space-y-4">
          <div className="flex items-center gap-3 px-2">
            <div className="h-px bg-[#333] flex-1" />
            <span className="text-xs font-mono text-[#00FF66] tracking-widest">{results.length} VECTORS IDENTIFIED</span>
            <div className="h-px bg-[#333] flex-1" />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {results.slice(0, visibleCount).map((r) => {
              const college = DATA.colleges[r.ci];
              const key = `${r.ci}-${r.branch}-${r.round}-${r.seat}`;
              const starred = shortlist.has(key);
              
              return (
                <div
                  key={key}
                  className="group relative bg-[#080808] border border-[#1F1F1F] hover:border-[#444] rounded-2xl p-5 transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_10px_40px_-10px_rgba(255,255,255,0.05)] overflow-hidden"
                >
                  <div className="absolute top-0 left-0 w-1 h-full bg-[#222] group-hover:bg-[#00FF66] transition-colors" />
                  
                  <div className="flex justify-between items-start mb-4">
                    <span className="text-[10px] font-mono text-[#888] bg-[#111] px-2 py-1 rounded">SYS_CODE: {college.code}</span>
                    <button
                      onClick={() => toggleShortlist(key)}
                      className={`p-2 rounded-lg transition-all ${starred ? "bg-white text-black" : "bg-[#111] text-[#666] hover:text-white"}`}
                    >
                      <Star size={16} className={starred ? "fill-current" : ""} />
                    </button>
                  </div>
                  
                  <h3 className="text-lg font-bold text-white leading-tight mb-2 pr-4">{college.name}</h3>
                  <div className="flex items-center gap-2 text-sm text-[#888] mb-6">
                    <GraduationCap size={14} /> {DATA.branches[r.branch]}
                  </div>
                  
                  <div className="flex items-end justify-between border-t border-[#111] pt-4">
                    <div>
                      <p className="text-[10px] font-mono text-[#666] uppercase mb-1">Threshold</p>
                      <p className="text-xl font-black text-white tabular-nums">{r.merit.toFixed(2)}%</p>
                    </div>
                    <div className="text-right">
                      <p className="text-[10px] font-mono text-[#666] uppercase mb-1">Delta</p>
                      <p className={`text-lg font-black tabular-nums ${(meritNum - r.merit) >= 5 ? 'text-[#00FF66]' : 'text-[#FFCC00]'}`}>
                        +{(meritNum - r.merit).toFixed(2)}%
                      </p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
          
          {visibleCount < results.length && (
            <button
              onClick={() => setVisibleCount(v => v + 20)}
              className="w-full py-5 rounded-2xl bg-[#080808] border border-[#1F1F1F] text-[#888] hover:text-white hover:border-[#444] transition-all text-xs font-mono tracking-widest uppercase mt-4 flex items-center justify-center gap-2"
            >
              Fetch Next Sequence <ChevronRight size={14} />
            </button>
          )}
        </div>
      )}
    </div>
  );
}

// ---------- DIRECTORY MODE ----------

function BrowseMode({ expandedCourse, setExpandedCourse }: { expandedCourse: string | null; setExpandedCourse: (val: string | null) => void; }) {
  const [query, setQuery] = useState("");

  const filtered = useMemo(() => {
    if (!query.trim()) return DATA.colleges.slice(0, 30);
    const q = query.toLowerCase();
    return DATA.colleges.filter((c) => c.name.toLowerCase().includes(q) || c.code.includes(q));
  }, [query]);

  return (
    <div className="space-y-6 relative z-10 animate-in fade-in duration-700">
      <div className="bg-[#080808] border border-[#1F1F1F] rounded-3xl p-4">
        <div className="relative">
          <Search className="absolute left-4 top-4 h-5 w-5 text-[#666]" />
          <input
            type="text"
            placeholder="Query database by institute name or code..."
            className="w-full pl-12 pr-4 py-3 bg-[#111] border border-[#222] rounded-2xl focus:border-[#00FF66] outline-none transition-all text-white placeholder:text-[#555] font-mono text-sm"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
        </div>
      </div>

      {!query.trim() && (
        <div className="text-[10px] font-mono text-[#666] px-2 uppercase tracking-[0.2em]">Displaying partial index (30 of {DATA.colleges.length})</div>
      )}

      <div className="space-y-4">
        {filtered.length === 0 ? (
          <div className="text-center text-[#666] py-16 font-mono text-sm uppercase bg-[#080808] border border-[#1F1F1F] rounded-3xl">Zero matching records.</div>
        ) : (
          filtered.map((college) => (
            <div key={college.code} className="bg-[#080808] rounded-3xl border border-[#1F1F1F] overflow-hidden hover:border-[#333] transition-colors">
              <div className="p-6 md:p-8 flex flex-col gap-4 border-b border-[#111]">
                <div className="flex items-center gap-3">
                  <span className="px-2 py-1 text-[10px] font-mono font-bold tracking-widest uppercase bg-[#111] text-[#888] rounded">
                    SYS_CODE: {college.code}
                  </span>
                  <span className="px-2 py-1 text-[10px] font-mono font-bold tracking-widest uppercase bg-[#111] text-[#888] rounded">
                    {college.status}
                  </span>
                </div>
                <h2 className="text-xl md:text-2xl font-bold flex items-center gap-3 text-white">
                  <Building2 className="h-5 w-5 text-[#00FF66]" /> {college.name}
                </h2>
              </div>

              <div className="p-4 space-y-2 bg-[#050505]">
                {college.courses.map(([branchIdx, cutoffs], idx) => {
                  const courseId = `${college.code}-${idx}`;
                  const branchName = DATA.branches[branchIdx];
                  const isOpen = expandedCourse === courseId;
                  
                  return (
                    <div key={courseId} className="bg-[#0A0A0A] border border-[#111] rounded-2xl overflow-hidden transition-all">
                      <button
                        onClick={() => setExpandedCourse(isOpen ? null : courseId)}
                        className="w-full flex items-center justify-between p-5 hover:bg-[#111] transition-colors"
                      >
                        <div className="flex items-center gap-3">
                          <GraduationCap className="h-5 w-5 text-[#666]" />
                          <span className="font-bold text-left text-slate-300">{branchName}</span>
                        </div>
                        {isOpen ? <ChevronUp className="h-5 w-5 text-[#666]" /> : <ChevronDown className="h-5 w-5 text-[#666]" />}
                      </button>

                      {isOpen && (
                        <div className="border-t border-[#111] overflow-x-auto">
                          <table className="w-full text-sm text-left">
                            <thead className="text-[10px] font-mono uppercase tracking-widest text-[#666] bg-[#050505]">
                              <tr>
                                <th className="px-5 py-4 font-bold">Round</th>
                                <th className="px-5 py-4 font-bold">Seat Type</th>
                                <th className="px-5 py-4 font-bold text-right">Cutoff</th>
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-[#111]">
                              {cutoffs.slice().sort((a, b) => a[0] - b[0] || b[3] - a[3]).map(([round, seatIdx, stageIdx, merit], cIdx) => {
                                const decoded = decodeSeat(DATA.seatTypes[seatIdx]);
                                return (
                                  <tr key={cIdx} className="hover:bg-[#111] transition-colors">
                                    <td className="px-5 py-4 font-mono font-bold text-white">R{round}</td>
                                    <td className="px-5 py-4">
                                      <span title={decoded.code} className="text-slate-300 font-semibold cursor-help">{decoded.label}</span>
                                      <span className="block text-[10px] font-mono text-[#666] mt-1">{DATA.stages[stageIdx]}</span>
                                    </td>
                                    <td className="px-5 py-4 font-black text-right text-[#00FF66] tabular-nums">{merit.toFixed(2)}%</td>
                                  </tr>
                                );
                              })}
                            </tbody>
                          </table>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

// ---------- OPTION FORM MODE ----------

function OptionFormMode({ shortlist, toggleShortlist }: { shortlist: Set<string>; toggleShortlist: (key: string) => void; }) {
  const [copied, setCopied] = useState(false);

  const handleShare = () => {
    if (shortlist.size === 0) return;
    const url = `${window.location.origin}${window.location.pathname}?list=${Array.from(shortlist).join(',')}`;
    navigator.clipboard.writeText(url).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  const rows = Array.from(shortlist).map(key => {
    const [ci, branchIdx, round, seatIdx] = key.split('-').map(Number);
    const college = DATA.colleges[ci];
    return { key, code: college.code, name: college.name, branch: DATA.branches[branchIdx], merit: FLAT.find(f => f.ci === ci && f.branch === branchIdx && f.round === round && f.seat === seatIdx)?.merit || 0 };
  });

  return (
    <div className="animate-in fade-in duration-700 relative z-10">
      
      <div className="hidden print:block mb-8 border-b-4 border-black pb-4">
        <h1 className="text-4xl font-black text-black tracking-tighter">DTE Option Form</h1>
        <p className="text-sm font-bold text-gray-500 mt-1 uppercase tracking-widest">MAHA_POLY GENERATED SEQUENCE</p>
      </div>

      <div className="bg-[#080808] border border-[#1F1F1F] rounded-3xl p-6 md:p-10 print:bg-transparent print:border-none print:p-0">
        
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6 mb-8 print:hidden">
          <div>
            <h2 className="text-2xl font-black text-white tracking-tight">STAGED VECTORS</h2>
            <p className="text-[10px] font-mono text-[#666] mt-1 uppercase tracking-widest">Ready for portal execution.</p>
          </div>

          <div className="flex gap-3 w-full sm:w-auto">
            <button
              onClick={handleShare}
              disabled={shortlist.size === 0}
              className="flex-1 sm:flex-none px-6 py-3 bg-[#111] hover:bg-[#222] border border-[#333] text-white font-mono text-xs font-bold uppercase tracking-widest rounded-xl flex items-center justify-center gap-2 transition-all disabled:opacity-50"
            >
              <Share2 size={16} /> {copied ? 'COPIED' : 'SHARE'}
            </button>
            <button
              onClick={() => window.print()}
              disabled={shortlist.size === 0}
              className="flex-1 sm:flex-none px-6 py-3 bg-white text-black hover:bg-gray-200 font-mono text-xs font-bold uppercase tracking-widest rounded-xl flex items-center justify-center gap-2 transition-all disabled:opacity-50 shadow-[0_0_20px_rgba(255,255,255,0.2)]"
            >
              <Printer size={16} /> PRINT
            </button>
          </div>
        </div>

        {shortlist.size === 0 ? (
          <div className="py-20 text-center text-[#666] bg-[#050505] border border-dashed border-[#222] rounded-2xl">
            <p className="text-xl font-black text-[#888] mb-2 tracking-tight">ZERO STAGED VECTORS</p>
            <p className="text-xs font-mono uppercase tracking-widest">Return to engine and engage star protocols.</p>
          </div>
        ) : (
          <div className="overflow-x-auto border border-[#1F1F1F] rounded-2xl print:border-gray-300">
            <table className="w-full text-left print:text-black">
              <thead>
                <tr className="bg-[#111] text-[10px] font-mono tracking-widest uppercase font-bold text-[#666] print:bg-gray-100 print:text-black">
                  <th className="px-6 py-5 text-center">ID</th>
                  <th className="px-6 py-5">SYS_CODE</th>
                  <th className="px-6 py-5">INSTITUTION</th>
                  <th className="px-6 py-5">BRANCH</th>
                  <th className="px-6 py-5 text-right">THRESHOLD</th>
                  <th className="px-6 py-5 text-center print:hidden"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#1F1F1F] print:divide-gray-300">
                {rows.map((item, index) => (
                  <tr key={item.key} className="hover:bg-[#111] transition-colors print:bg-transparent">
                    <td className="px-6 py-5 font-black text-xl text-center text-white print:text-black">{index + 1}</td>
                    <td className="px-6 py-5 font-mono text-sm text-[#888] print:text-gray-600">{item.code}</td>
                    <td className="px-6 py-5 font-bold text-white print:text-black">{item.name}</td>
                    <td className="px-6 py-5 font-medium text-[#888] print:text-gray-800">{item.branch}</td>
                    <td className="px-6 py-5 font-black text-right text-[#00FF66] text-lg tabular-nums print:text-black">{item.merit.toFixed(2)}%</td>
                    <td className="px-6 py-5 text-center print:hidden">
                      <button onClick={() => toggleShortlist(item.key)} className="text-[#444] hover:text-red-500 bg-[#111] p-3 rounded-lg transition-colors">
                        <X size={16} />
                      </button>
                    </td>
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

// ---------- ROOT SHELL ----------

export default function PolytechnicDashboard() {
  const [mode, setMode] = useState<"match" | "browse" | "option-form">("match");
  const [shortlist, setShortlist] = useState<Set<string>>(new Set());
  const [expandedCourse, setExpandedCourse] = useState<string | null>(null);
  const [booting, setBooting] = useState(true);

  useEffect(() => {
    const savedList = localStorage.getItem("mahapoly-shortlist");
    if (savedList) setShortlist(new Set(JSON.parse(savedList)));
    
    const hasBooted = sessionStorage.getItem("mahapoly-booted");
    if (hasBooted) {
      setBooting(false);
    }
  }, []);

  const finishBoot = () => {
    setBooting(false);
    sessionStorage.setItem("mahapoly-booted", "true");
  };

  if (booting) return <BootSequence onComplete={finishBoot} />;

  return (
    <div className="min-h-screen bg-[#030303] text-white font-sans selection:bg-white selection:text-black relative overflow-hidden">
      
      {/* SPATIAL GRID BACKGROUND */}
      <div className="fixed inset-0 z-0 pointer-events-none print:hidden opacity-10"
           style={{ backgroundImage: 'linear-gradient(#222 1px, transparent 1px), linear-gradient(90deg, #222 1px, transparent 1px)', backgroundSize: '40px 40px' }} />
      
      {/* CINEMATIC GLOWS */}
      <div className="fixed top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-white/5 blur-[120px] rounded-full pointer-events-none print:hidden" />

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-20 relative z-10 print:p-0">
        
        <header className="flex flex-col md:flex-row md:items-end justify-between gap-8 mb-12 print:hidden">
          <div className="space-y-4">
            <div className="inline-flex items-center gap-2 text-[10px] font-mono font-bold tracking-widest text-[#888] uppercase border border-[#222] bg-[#0A0A0A] px-3 py-1 rounded-full">
              <div className="w-1.5 h-1.5 rounded-full bg-[#00FF66] animate-pulse" /> Live DTE Database
            </div>
            <h1 className="text-5xl md:text-7xl font-black tracking-tighter text-white drop-shadow-2xl">
              MAHA<span className="text-[#444]">POLY</span>
            </h1>
          </div>

          <div className="flex bg-[#0A0A0A] p-1.5 rounded-2xl w-fit border border-[#1F1F1F] backdrop-blur-xl shadow-2xl">
            <button
              onClick={() => setMode("match")}
              className={`px-6 py-3 rounded-xl text-xs font-mono font-bold tracking-widest uppercase transition-all duration-300 ${
                mode === "match" ? "bg-white text-black shadow-lg" : "text-[#666] hover:text-white"
              }`}
            >
              Engine
            </button>
            <button
              onClick={() => setMode("browse")}
              className={`px-6 py-3 rounded-xl text-xs font-mono font-bold tracking-widest uppercase transition-all duration-300 ${
                mode === "browse" ? "bg-white text-black shadow-lg" : "text-[#666] hover:text-white"
              }`}
            >
              Directory
            </button>
            <button
              onClick={() => setMode("option-form")}
              className={`px-6 py-3 rounded-xl text-xs font-mono font-bold tracking-widest uppercase transition-all duration-300 flex items-center gap-2 ${
                mode === "option-form" ? "bg-white text-black shadow-lg" : "text-[#666] hover:text-white"
              }`}
            >
              <Star size={14} className={shortlist.size > 0 ? "fill-current" : ""} />
              Staged ({shortlist.size})
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