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
  ArrowRight,
  Info
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

// ---------- CORE DATA LAYER (UNTOUCHED) ----------
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

// ---------- PREMIUM UI ATOMS ----------

function Pill({ active, onClick, children }: { active: boolean; onClick: () => void; children: React.ReactNode; }) {
  return (
    <button
      onClick={onClick}
      className={`px-4 py-2.5 rounded-lg text-xs font-semibold tracking-wide transition-all duration-300 border flex-1 text-center ${
        active
          ? "bg-white text-black border-white shadow-[0_4px_14px_rgba(255,255,255,0.15)]"
          : "bg-transparent border-zinc-800 text-zinc-400 hover:border-zinc-600 hover:text-zinc-200"
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
      className={`px-2.5 py-1 text-[10px] font-bold tracking-widest rounded uppercase border ${
        isGovt 
          ? "bg-blue-500/10 border-blue-500/30 text-blue-400" 
          : "bg-zinc-900 border-zinc-800 text-zinc-400"
      }`}
    >
      {status}
    </span>
  );
}

function MarginBar({ merit, cutoff }: { merit: number; cutoff: number }) {
  const margin = merit - cutoff;
  const color = margin >= 5 ? "#10B981" : margin >= 0 ? "#3B82F6" : "#52525B"; 
  const pct = Math.max(4, Math.min(100, (cutoff / 100) * 100));
  
  return (
    <div className="flex flex-col gap-1.5 w-full max-w-[160px]">
      <div className="flex items-center justify-between">
         <span className="text-[10px] text-zinc-500 font-medium uppercase tracking-wider">Delta Margin</span>
         <span className="text-xs font-bold tabular-nums" style={{ color: margin >= 0 ? color : '#71717A' }}>
          {margin >= 0 ? '+' : ''}{margin.toFixed(2)}%
        </span>
      </div>
      <div className="relative w-full h-1 rounded-full bg-zinc-900 overflow-hidden">
        <div className="absolute inset-y-0 left-0 rounded-full transition-all duration-1000 ease-out" style={{ width: `${pct}%`, backgroundColor: color }} />
      </div>
    </div>
  );
}

// MATURE LOADING STATE: Elegant gradient sweep skeleton
function EnterpriseLoader() {
  return (
    <div className="w-full space-y-4 animate-in fade-in duration-500">
      {[1, 2, 3].map((i) => (
        <div key={i} className="w-full bg-zinc-950 border border-zinc-800/50 rounded-2xl p-6 relative overflow-hidden">
          <div className="absolute inset-0 -translate-x-full animate-[shimmer_2s_infinite] bg-gradient-to-r from-transparent via-white/5 to-transparent" />
          <div className="flex justify-between items-start">
            <div className="space-y-4 w-2/3">
              <div className="h-4 w-24 bg-zinc-900 rounded" />
              <div className="h-6 w-full max-w-md bg-zinc-800/50 rounded" />
              <div className="h-4 w-48 bg-zinc-900 rounded" />
            </div>
            <div className="space-y-3 items-end flex flex-col">
              <div className="h-4 w-16 bg-zinc-900 rounded" />
              <div className="h-8 w-24 bg-zinc-800/50 rounded" />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

// ---------- INLINE ONBOARDING (MATURE TUTORIAL) ----------

function QuickStartModule({ onDismiss }: { onDismiss: () => void }) {
  return (
    <div className="bg-zinc-900/50 border border-zinc-800/50 rounded-2xl p-6 mb-8 flex flex-col md:flex-row gap-6 items-start md:items-center justify-between animate-in fade-in duration-500">
      <div className="flex gap-4 items-start">
        <div className="p-3 bg-zinc-950 border border-zinc-800 rounded-xl mt-1">
          <Info className="text-zinc-400" size={20} />
        </div>
        <div>
          <h3 className="text-lg font-serif font-medium text-zinc-100">System Calibration Required</h3>
          <p className="text-sm text-zinc-400 mt-1 max-w-2xl leading-relaxed">
            Configure your aggregate merit percentage and categorical parameters in the control panel below. The engine will automatically filter and rank the historical database to identify your most probable admission vectors.
          </p>
        </div>
      </div>
      <button onClick={onDismiss} className="shrink-0 px-6 py-2.5 bg-white text-black text-sm font-semibold rounded-lg hover:bg-zinc-200 transition-colors">
        Acknowledge
      </button>
    </div>
  );
}

// ---------- MATCH ENGINE (ENTERPRISE DASHBOARD) ----------

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
      const timer = setTimeout(() => setIsCalculating(false), 600);
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
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 relative z-10 animate-in fade-in duration-700">
      
      {/* LEFT COLUMN: CONTROL MATRIX */}
      <div className="lg:col-span-4 space-y-6">
        <div className="bg-zinc-950 border border-zinc-800/60 rounded-3xl p-6 lg:p-8 lg:sticky lg:top-8">
          <div className="mb-8">
            <h2 className="font-serif text-xl font-medium text-white mb-2">Parameters</h2>
            <p className="text-xs text-zinc-500">Define your structural variables.</p>
          </div>

          <div className="space-y-8">
            <div>
              <label className="block text-xs font-medium text-zinc-400 mb-2">Target Merit Percentage</label>
              <input
                type="number" step="0.01" placeholder="e.g. 82.40"
                value={merit} onChange={(e) => setMerit(e.target.value)}
                className="w-full bg-transparent border-b-2 border-zinc-800 px-0 py-3 text-4xl font-light tabular-nums text-white placeholder:text-zinc-700 focus:border-white focus:outline-none transition-colors"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-zinc-400 mb-2">Classification</label>
              <select
                value={category} onChange={(e) => setCategory(e.target.value)}
                className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-4 py-3.5 text-sm font-medium text-zinc-200 focus:border-zinc-600 focus:outline-none transition-all appearance-none"
              >
                {CATEGORY_OPTIONS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
              </select>
            </div>

            {!isSpecialCategory && (
              <div className="space-y-6 pt-6 border-t border-zinc-800/50">
                <div className="flex gap-3 w-full">{CANDIDATURE_OPTIONS.map((o) => <Pill key={o.value} active={candidature === o.value} onClick={() => setCandidature(o.value)}>{o.label}</Pill>)}</div>
                <div className="flex gap-3 w-full">{GENDER_OPTIONS.map((o) => <Pill key={o.value} active={gender === o.value} onClick={() => setGender(o.value)}>{o.label}</Pill>)}</div>
                <div className="flex gap-3 w-full">{LEVEL_OPTIONS.map((o) => <Pill key={o.value} active={level === o.value} onClick={() => setLevel(o.value)}>{o.label}</Pill>)}</div>
              </div>
            )}

            <div className="pt-6 border-t border-zinc-800/50">
              <label className="block text-xs font-medium text-zinc-400 mb-3">CAP Round Sequence</label>
              <div className="flex gap-2">
                {[1, 2, 3, 4].map((r) => (
                  <button key={r} onClick={() => setRound(r)} className={`flex-1 py-2.5 rounded-lg text-sm font-semibold transition-all border ${round === r ? "bg-white text-black border-white" : "bg-transparent border-zinc-800 text-zinc-500 hover:text-zinc-300 hover:border-zinc-600"}`}>R{r}</button>
                ))}
              </div>
            </div>

            <details className="group pt-6 border-t border-zinc-800/50">
              <summary className="flex items-center justify-between text-xs font-medium text-zinc-400 cursor-pointer hover:text-white list-none transition-colors">
                <span className="flex items-center gap-2"><SlidersHorizontal size={14} /> Refine by Branch {branchFilter.size > 0 && <span className="text-white ml-1 font-bold">({branchFilter.size})</span>}</span>
                <ChevronDown className="h-4 w-4 group-open:rotate-180 transition-transform" />
              </summary>
              <div className="mt-4 p-4 bg-zinc-900/50 border border-zinc-800 rounded-xl space-y-4">
                <input type="text" placeholder="Search branches..." value={branchQuery} onChange={(e) => setBranchQuery(e.target.value)} className="w-full px-3 py-2.5 bg-zinc-950 border border-zinc-800 rounded-lg text-sm outline-none text-white focus:border-zinc-600 transition-colors" />
                <div className="flex flex-col gap-1 max-h-48 overflow-y-auto custom-scrollbar pr-2">
                  {filteredBranchList.map((b) => (
                    <button key={b.idx} onClick={() => { const next = new Set(branchFilter); branchFilter.has(b.idx) ? next.delete(b.idx) : next.add(b.idx); setBranchFilter(next); }} className={`px-3 py-2 rounded-lg text-xs font-medium text-left transition-colors ${branchFilter.has(b.idx) ? "bg-white text-black" : "text-zinc-400 hover:bg-zinc-800 hover:text-white"}`}>
                      {b.name}
                    </button>
                  ))}
                </div>
              </div>
            </details>
          </div>
        </div>
      </div>

      {/* RIGHT COLUMN: DATA MATRIX */}
      <div className="lg:col-span-8">
        {!hasValidMerit ? (
          <div className="flex flex-col items-center justify-center h-full min-h-[500px] border border-dashed border-zinc-800 rounded-3xl bg-zinc-950/50">
            <Search className="h-8 w-8 text-zinc-700 mb-4" />
            <p className="font-serif text-xl font-medium text-zinc-500">Awaiting Parameters</p>
          </div>
        ) : isCalculating ? (
          <EnterpriseLoader />
        ) : results.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full min-h-[500px] border border-dashed border-zinc-800 rounded-3xl bg-zinc-950/50">
            <p className="font-serif text-2xl font-medium text-zinc-200">No Eligible Results</p>
            <p className="text-sm text-zinc-500 mt-2">Adjust your parameters to broaden the search criteria.</p>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="flex items-center justify-between px-2 mb-6">
              <div className="text-xs font-medium text-zinc-500">
                Found <span className="text-white font-bold">{results.length}</span> matching branches
              </div>
            </div>
            
            <div className="grid grid-cols-1 gap-4">
              {results.slice(0, visibleCount).map((r) => {
                const college = DATA.colleges[r.ci];
                const key = `${r.ci}-${r.branch}-${r.round}-${r.seat}`;
                const starred = shortlist.has(key);
                
                return (
                  <div key={key} className="group bg-zinc-950 border border-zinc-800/60 hover:border-zinc-700 rounded-2xl p-6 transition-all duration-300">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                      
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-3">
                          <StatusBadge status={college.status} />
                          <span className="text-[10px] text-zinc-500 font-mono">ID: {college.code}</span>
                        </div>
                        <h3 className="text-lg font-serif font-medium text-zinc-100 group-hover:text-white transition-colors mb-2 leading-snug pr-4">{college.name}</h3>
                        <div className="text-sm text-zinc-400 flex items-center gap-2">
                          <GraduationCap size={14} className="text-zinc-600" /> {DATA.branches[r.branch]}
                        </div>
                      </div>
                      
                      <div className="flex items-center md:items-end justify-between md:flex-col gap-6 md:gap-3 w-full md:w-auto border-t md:border-none border-zinc-800 pt-4 md:pt-0">
                        <div className="text-left md:text-right">
                          <p className="text-[10px] text-zinc-500 uppercase tracking-wider mb-1">Historical Cutoff</p>
                          <p className="text-xl font-light text-white tabular-nums">{r.merit.toFixed(2)}%</p>
                        </div>
                        <div className="flex items-center gap-6">
                          <MarginBar merit={meritNum} cutoff={r.merit} />
                          <button
                            onClick={() => toggleShortlist(key)}
                            className={`p-2.5 rounded-lg border transition-all duration-300 ${
                              starred 
                                ? "bg-white border-white text-black" 
                                : "bg-transparent border-zinc-800 text-zinc-500 hover:border-zinc-600 hover:text-white"
                            }`}
                          >
                            <Star size={16} className={starred ? "fill-current" : ""} />
                          </button>
                        </div>
                      </div>

                    </div>
                  </div>
                );
              })}
            </div>

            {visibleCount < results.length && (
              <button
                onClick={() => setVisibleCount(v => v + 20)}
                className="w-full py-4 rounded-xl bg-transparent border border-zinc-800 text-zinc-400 hover:text-white hover:border-zinc-700 transition-all text-sm font-medium mt-6 flex items-center justify-center gap-2"
              >
                Load More Results <ArrowRight size={16} />
              </button>
            )}
          </div>
        )}
      </div>
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
    <div className="space-y-8 animate-in fade-in duration-500 max-w-4xl mx-auto">
      <div className="bg-zinc-950 border border-zinc-800/60 rounded-2xl p-2 relative">
        <Search className="absolute left-6 top-5 h-5 w-5 text-zinc-500" />
        <input
          type="text" placeholder="Search institution by name or code..." value={query} onChange={(e) => setQuery(e.target.value)}
          className="w-full pl-14 pr-4 py-3 bg-transparent outline-none text-white text-sm transition-colors"
        />
      </div>

      {!query.trim() && (
        <div className="text-xs text-zinc-500 font-medium px-2">Displaying partial index (30 of {DATA.colleges.length})</div>
      )}

      <div className="space-y-4">
        {filtered.length === 0 ? (
          <div className="text-center text-zinc-500 py-20 font-serif text-lg bg-zinc-950 border border-dashed border-zinc-800 rounded-3xl">No institutions match your search.</div>
        ) : (
          filtered.map((college) => (
            <div key={college.code} className="bg-zinc-950 rounded-2xl border border-zinc-800/60 overflow-hidden hover:border-zinc-700 transition-colors">
              <div className="p-6 md:p-8 flex flex-col gap-4 border-b border-zinc-800/50">
                <div className="flex items-center justify-between mb-2">
                  <StatusBadge status={college.status} />
                  <span className="text-[10px] font-mono text-zinc-500">ID: {college.code}</span>
                </div>
                <h2 className="text-xl font-serif font-medium text-white">{college.name}</h2>
              </div>

              <div className="p-4 bg-zinc-900/20 space-y-2">
                {college.courses.map(([branchIdx, cutoffs], idx) => {
                  const courseId = `${college.code}-${idx}`;
                  const branchName = DATA.branches[branchIdx];
                  const isOpen = expandedCourse === courseId;
                  
                  return (
                    <div key={courseId} className="bg-zinc-950 border border-zinc-800/50 rounded-xl overflow-hidden transition-all">
                      <button onClick={() => setExpandedCourse(isOpen ? null : courseId)} className="w-full flex items-center justify-between p-4 hover:bg-zinc-900 transition-colors">
                        <span className="font-medium text-sm text-left text-zinc-300 pr-4">{branchName}</span>
                        {isOpen ? <ChevronUp size={16} className="text-white shrink-0" /> : <ChevronDown size={16} className="text-zinc-600 shrink-0" />}
                      </button>
                      {isOpen && (
                        <div className="border-t border-zinc-800/50 overflow-x-auto bg-black">
                          <table className="w-full text-xs text-left">
                            <thead className="text-[10px] uppercase tracking-wider text-zinc-500 border-b border-zinc-800/50">
                              <tr><th className="px-5 py-3 font-medium">Round</th><th className="px-5 py-3 font-medium">Seat Type</th><th className="px-5 py-3 font-medium text-right">Cutoff</th></tr>
                            </thead>
                            <tbody className="divide-y divide-zinc-900">
                              {cutoffs.slice().sort((a, b) => a[0] - b[0] || b[3] - a[3]).map(([round, seatIdx, stageIdx, merit], cIdx) => (
                                <tr key={cIdx} className="hover:bg-zinc-900/50">
                                  <td className="px-5 py-4 font-bold text-zinc-300">R{round}</td>
                                  <td className="px-5 py-4"><span title={decodeSeat(DATA.seatTypes[seatIdx]).code} className="text-zinc-400 cursor-help">{decodeSeat(DATA.seatTypes[seatIdx]).label}</span></td>
                                  <td className="px-5 py-4 font-light text-right text-white tabular-nums">{merit.toFixed(2)}%</td>
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
          ))
        )}
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
      <div className="hidden print:block mb-10 border-b border-black pb-6"><h1 className="text-3xl font-serif text-black">DTE Option Form</h1><p className="text-xs text-gray-500 mt-2 uppercase tracking-widest">MahaPoly Document</p></div>
      
      <div className="bg-zinc-950 border border-zinc-800/60 rounded-3xl p-6 md:p-10 print:bg-transparent print:border-none print:p-0">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6 mb-10 print:hidden">
          <div><h2 className="text-2xl font-serif font-medium text-white">Staged Options</h2><p className="text-sm text-zinc-500 mt-2">Review sequence prior to official portal submission.</p></div>
          <div className="flex gap-3 w-full sm:w-auto">
            <button onClick={handleShare} disabled={shortlist.size === 0} className="flex-1 sm:flex-none px-6 py-2.5 bg-zinc-900 border border-zinc-800 hover:bg-zinc-800 text-white text-sm font-medium rounded-xl flex items-center justify-center gap-2 transition-all disabled:opacity-50">
              {copied ? <Check size={16} className="text-emerald-500" /> : <Share2 size={16} />} Share
            </button>
            <button onClick={() => window.print()} disabled={shortlist.size === 0} className="flex-1 sm:flex-none px-6 py-2.5 bg-white text-black hover:bg-zinc-200 text-sm font-semibold rounded-xl flex items-center justify-center gap-2 transition-all disabled:opacity-50">
              <Printer size={16} /> Print Document
            </button>
          </div>
        </div>

        {shortlist.size === 0 ? (
          <div className="py-24 text-center border border-dashed border-zinc-800 rounded-2xl bg-zinc-900/20">
            <Star className="h-8 w-8 text-zinc-700 mx-auto mb-4" />
            <p className="text-lg font-serif text-zinc-400">No choices staged.</p>
          </div>
        ) : (
          <div className="overflow-x-auto rounded-2xl border border-zinc-800/60 print:border-gray-300">
            <table className="w-full text-left print:text-black">
              <thead className="bg-zinc-900/50 border-b border-zinc-800/60 text-[10px] uppercase tracking-wider font-medium text-zinc-500 print:bg-gray-100 print:text-black">
                <tr><th className="px-6 py-4 text-center">Pref</th><th className="px-6 py-4">Code</th><th className="px-6 py-4">Institution</th><th className="px-6 py-4">Branch</th><th className="px-6 py-4 text-right">Cutoff</th><th className="px-6 py-4 print:hidden"></th></tr>
              </thead>
              <tbody className="divide-y divide-zinc-800/60 print:divide-gray-300">
                {rows.map((item, index) => (
                  <tr key={item.key} className="hover:bg-zinc-900/30 transition-colors print:bg-transparent">
                    <td className="px-6 py-5 font-bold text-lg text-center text-zinc-300 print:text-black">{index + 1}</td>
                    <td className="px-6 py-5 font-mono text-sm text-zinc-500 print:text-gray-600">{item.code}</td>
                    <td className="px-6 py-5 font-medium text-white print:text-black">{item.name}</td>
                    <td className="px-6 py-5 text-sm text-zinc-400 print:text-gray-800">{item.branch}</td>
                    <td className="px-6 py-5 font-light text-right text-white text-lg tabular-nums print:text-black">{item.merit.toFixed(2)}%</td>
                    <td className="px-6 py-5 text-center print:hidden"><button onClick={() => toggleShortlist(item.key)} className="text-zinc-600 hover:text-red-400 p-2 rounded-lg hover:bg-zinc-900 transition-colors"><X size={18} /></button></td>
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

// ---------- ROOT LAYOUT (ENTERPRISE APP SHELL) ----------

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
    <div className="min-h-screen bg-[#0A0A0A] text-zinc-100 selection:bg-white selection:text-black overflow-x-hidden">
      
      {/* GLOBAL FONT STACK IMPORTS & ANIMATIONS */}
      <style dangerouslySetInnerHTML={{__html: `
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&family=Playfair+Display:wght@400;500;600&display=swap');
        body { font-family: 'Inter', sans-serif; }
        .font-serif { font-family: 'Playfair Display', serif; }
        @keyframes shimmer { 100% { transform: translateX(100%); } }
      `}} />

      <div className="w-full max-w-7xl mx-auto px-4 md:px-8 py-10 print:p-0">
        
        {/* INLINE TUTORIAL MODULE */}
        {showTutorial && (
          <QuickStartModule onDismiss={() => { setShowTutorial(false); sessionStorage.setItem("mahapoly-tutorial-seen", "true"); }} />
        )}

        <header className="flex flex-col md:flex-row md:items-end justify-between gap-8 mb-12 pb-8 border-b border-zinc-800/50 print:hidden">
          <div className="space-y-3">
            <h1 className="text-4xl md:text-5xl font-serif font-medium text-white tracking-tight">
              MahaPoly
            </h1>
            <p className="text-zinc-500 text-sm">
              State Polytechnic Admissions Database &middot; {DATA.colleges.length} Institutions
            </p>
          </div>

          <div className="flex bg-zinc-950 p-1.5 rounded-xl border border-zinc-800 w-full md:w-auto overflow-x-auto custom-scrollbar">
            <button onClick={() => setMode("match")} className={`px-6 py-2.5 rounded-lg text-sm font-medium transition-all whitespace-nowrap ${mode === "match" ? "bg-zinc-800 text-white" : "text-zinc-500 hover:text-zinc-300"}`}>Engine</button>
            <button onClick={() => setMode("browse")} className={`px-6 py-2.5 rounded-lg text-sm font-medium transition-all whitespace-nowrap ${mode === "browse" ? "bg-zinc-800 text-white" : "text-zinc-500 hover:text-zinc-300"}`}>Directory</button>
            <button onClick={() => setMode("option-form")} className={`px-6 py-2.5 rounded-lg text-sm font-medium transition-all flex items-center justify-center gap-2 whitespace-nowrap ${mode === "option-form" ? "bg-zinc-800 text-white" : "text-zinc-500 hover:text-zinc-300"}`}>
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