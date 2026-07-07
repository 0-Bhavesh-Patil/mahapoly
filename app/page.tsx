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
  Info,
  ArrowRight,
  Printer,
  Share2,
  Check,
  Sparkles
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

// ---------- Data layer (RESTORED EXACTLY AS ORIGINAL) ----------
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

// ---------- Small UI atoms (UPDATED TO GLASSMORPHISM) ----------

function Pill({ active, onClick, children }: { active: boolean; onClick: () => void; children: React.ReactNode; }) {
  return (
    <button
      onClick={onClick}
      className={`px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wider transition-all duration-300 ${
        active
          ? "bg-purple-500/20 border border-purple-500/50 text-purple-300 shadow-[0_0_15px_rgba(168,85,247,0.15)]"
          : "bg-black/20 border border-white/5 text-slate-400 hover:border-white/20 hover:text-slate-200"
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
      className={`px-2.5 py-1 text-[10px] font-bold rounded-md tracking-widest uppercase border ${
        isGovt 
          ? "bg-cyan-500/10 border-cyan-500/30 text-cyan-400" 
          : "bg-white/5 border-white/10 text-slate-400"
      }`}
    >
      {status}
    </span>
  );
}

function MarginBar({ merit, cutoff }: { merit: number; cutoff: number }) {
  const margin = merit - cutoff;
  const safe = margin >= 5;
  const tight = margin >= 0 && margin < 5;
  const color = safe ? "#34d399" : tight ? "#fbbf24" : "#94a3b8"; // Tailwind Emerald, Amber, Slate
  const pct = Math.max(4, Math.min(100, (cutoff / 100) * 100));
  
  return (
    <div className="flex items-center gap-3 min-w-[140px]">
      <div className="relative flex-1 h-1.5 rounded-full bg-black/40 overflow-hidden border border-white/5">
        <div className="absolute inset-y-0 left-0 rounded-full transition-all duration-1000" style={{ width: `${pct}%`, backgroundColor: color, boxShadow: `0 0 10px ${color}40` }} />
      </div>
      <span className="text-xs font-bold tabular-nums" style={{ color }}>
        +{margin.toFixed(1)}%
      </span>
    </div>
  );
}

// ---------- Match (finder) mode ----------

function MatchMode({ shortlist, toggleShortlist }: { shortlist: Set<string>; toggleShortlist: (key: string) => void; }) {
  const [merit, setMerit] = useState<string>("");
  const [category, setCategory] = useState("OPEN");
  const [candidature, setCandidature] = useState<Candidature>("N");
  const [gender, setGender] = useState<Gender>("G");
  const [level, setLevel] = useState<Level>("H");
  const [round, setRound] = useState(1);
  const [branchFilter, setBranchFilter] = useState<Set<number>>(new Set());
  const [branchQuery, setBranchQuery] = useState("");
  const [visibleCount, setVisibleCount] = useState(50);

  const isSpecialCategory = ["EWS", "TFWS", "DEFOPENS", "ORPHAN", "PWDOPENH"].includes(category);
  const meritNum = parseFloat(merit);
  const hasValidMerit = merit.trim() !== "" && !isNaN(meritNum) && meritNum >= 0 && meritNum <= 100;

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

  useEffect(() => setVisibleCount(50), [results]);

  const filteredBranchList = branchQuery
    ? BRANCH_LIST.filter((b) => b.name.toLowerCase().includes(branchQuery.toLowerCase()))
    : BRANCH_LIST;

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      
      {/* FILTER PANEL - GLASSMORPHISM */}
      <div className="bg-slate-900/40 backdrop-blur-xl border border-white/10 rounded-3xl p-6 md:p-8 space-y-6 shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-cyan-500/30 to-transparent" />
        
        <div className="flex flex-col md:flex-row md:items-end gap-6">
          <div className="flex-1">
            <label className="block text-xs font-bold tracking-widest text-slate-400 mb-2 uppercase">Your merit percentage</label>
            <input
              type="number"
              inputMode="decimal"
              min={0} max={100} step={0.01}
              placeholder="e.g. 82.40"
              value={merit}
              onChange={(e) => setMerit(e.target.value)}
              className="w-full md:w-64 px-5 py-4 bg-black/40 border border-white/10 rounded-2xl text-2xl font-bold tabular-nums text-white placeholder:text-slate-600 focus:border-cyan-500/50 focus:ring-1 focus:ring-cyan-500/50 outline-none transition-all shadow-inner"
            />
          </div>

          <div>
            <label className="block text-xs font-bold tracking-widest text-slate-400 mb-2 uppercase">Category</label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="px-5 py-4 bg-black/40 border border-white/10 rounded-2xl text-white outline-none focus:border-cyan-500/50 focus:ring-1 focus:ring-cyan-500/50 min-w-[220px] transition-all appearance-none"
            >
              {CATEGORY_OPTIONS.map((o) => (
                <option key={o.value} value={o.value}>{o.label}</option>
              ))}
            </select>
          </div>
        </div>

        {!isSpecialCategory && (
          <div className="flex flex-wrap gap-8 pt-4 border-t border-white/5">
            <div>
              <div className="text-[10px] font-bold tracking-widest text-slate-500 mb-2.5 uppercase">Candidature</div>
              <div className="flex gap-2">
                {CANDIDATURE_OPTIONS.map((o) => (
                  <Pill key={o.value} active={candidature === o.value} onClick={() => setCandidature(o.value)}>{o.label}</Pill>
                ))}
              </div>
            </div>
            <div>
              <div className="text-[10px] font-bold tracking-widest text-slate-500 mb-2.5 uppercase">Gender</div>
              <div className="flex gap-2">
                {GENDER_OPTIONS.map((o) => (
                  <Pill key={o.value} active={gender === o.value} onClick={() => setGender(o.value)}>{o.label}</Pill>
                ))}
              </div>
            </div>
            <div>
              <div className="text-[10px] font-bold tracking-widest text-slate-500 mb-2.5 uppercase">Seat level</div>
              <div className="flex gap-2">
                {LEVEL_OPTIONS.map((o) => (
                  <Pill key={o.value} active={level === o.value} onClick={() => setLevel(o.value)}>{o.label}</Pill>
                ))}
              </div>
            </div>
          </div>
        )}

        <div className="pt-4 border-t border-white/5">
          <div className="text-[10px] font-bold tracking-widest text-slate-500 mb-2.5 uppercase">CAP round</div>
          <div className="flex gap-3">
            {[1, 2, 3, 4].map((r) => (
              <button
                key={r}
                onClick={() => setRound(r)}
                className={`w-12 h-12 rounded-2xl text-sm font-black transition-all duration-300 flex items-center justify-center ${
                  round === r
                    ? "bg-gradient-to-tr from-cyan-500 to-cyan-400 text-slate-950 shadow-[0_0_20px_rgba(6,182,212,0.3)]"
                    : "bg-black/20 border border-white/10 text-slate-400 hover:border-white/30"
                }`}
              >
                {r}
              </button>
            ))}
          </div>
        </div>

        <details className="group pt-4 border-t border-white/5">
          <summary className="flex items-center gap-2 text-sm font-medium text-slate-400 cursor-pointer hover:text-white list-none transition-colors">
            <SlidersHorizontal className="h-4 w-4 text-cyan-400" />
            Filter by specific branch
            {branchFilter.size > 0 && (
              <span className="px-2 py-0.5 rounded-full bg-purple-500/20 text-purple-300 text-xs font-bold border border-purple-500/30">
                {branchFilter.size} selected
              </span>
            )}
            <ChevronDown className="h-4 w-4 ml-auto group-open:hidden" />
            <ChevronUp className="h-4 w-4 ml-auto hidden group-open:block" />
          </summary>
          <div className="mt-4 space-y-3 bg-black/20 p-4 rounded-2xl border border-white/5">
            <input
              type="text"
              placeholder="Search branches..."
              value={branchQuery}
              onChange={(e) => setBranchQuery(e.target.value)}
              className="w-full px-4 py-3 bg-black/40 border border-white/10 rounded-xl text-sm outline-none focus:border-cyan-500/50 text-white placeholder:text-slate-600 transition-all"
            />
            <div className="flex flex-wrap gap-2 max-h-48 overflow-y-auto pr-2 custom-scrollbar">
              {filteredBranchList.map((b) => {
                const active = branchFilter.has(b.idx);
                return (
                  <button
                    key={b.idx}
                    onClick={() => {
                      const next = new Set(branchFilter);
                      active ? next.delete(b.idx) : next.add(b.idx);
                      setBranchFilter(next);
                    }}
                    className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-all ${
                      active
                        ? "bg-purple-500/20 border-purple-500/50 text-purple-300"
                        : "bg-white/5 border-white/5 text-slate-400 hover:border-white/20"
                    }`}
                  >
                    {b.name}
                  </button>
                );
              })}
            </div>
            {branchFilter.size > 0 && (
              <button
                onClick={() => setBranchFilter(new Set())}
                className="text-xs font-medium text-slate-500 hover:text-white flex items-center gap-1 mt-2 transition-colors"
              >
                <X className="h-3 w-3" /> Clear branch filter
              </button>
            )}
          </div>
        </details>
      </div>

      {/* RESULTS LISTING */}
      {!hasValidMerit ? (
        <div className="bg-white/5 backdrop-blur-md border border-white/5 border-dashed rounded-3xl p-16 text-center text-slate-400 flex flex-col items-center">
          <div className="w-16 h-16 rounded-full bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center mb-4">
            <Info className="h-6 w-6 text-cyan-400" />
          </div>
          <p className="font-medium text-lg text-white mb-1">Awaiting Parameters</p>
          <p className="text-sm">Enter your merit percentage above to unlock matching polytechnics.</p>
        </div>
      ) : results.length === 0 ? (
        <div className="bg-white/5 backdrop-blur-md border border-white/5 border-dashed rounded-3xl p-16 text-center text-slate-400 flex flex-col items-center">
          <p className="font-medium text-lg text-white mb-1">No exact matches found</p>
          <p className="text-sm">Try selecting "Other than Home District" or exploring later CAP rounds.</p>
        </div>
      ) : (
        <>
          <div className="flex items-center justify-between text-sm text-slate-400 px-2 font-medium">
            <span>
              <span className="text-cyan-400 font-bold tabular-nums text-base">{results.length}</span> eligible branch{results.length === 1 ? "" : "es"}
            </span>
            <span className="flex items-center gap-1"><Sparkles size={14}/> AI Ranked by fit</span>
          </div>
          
          <div className="space-y-3">
            {results.slice(0, visibleCount).map((r) => {
              const college = DATA.colleges[r.ci];
              const branchName = DATA.branches[r.branch];
              const key = `${r.ci}-${r.branch}-${r.round}-${r.seat}`;
              const starred = shortlist.has(key);
              
              return (
                <div
                  key={key}
                  className="group flex flex-col md:flex-row md:items-center gap-4 md:gap-6 bg-slate-900/40 backdrop-blur-md border border-white/5 hover:border-cyan-500/30 rounded-2xl p-5 transition-all duration-300 relative overflow-hidden"
                >
                  <div className="absolute left-0 top-0 bottom-0 w-1 bg-transparent group-hover:bg-cyan-500/50 transition-colors" />
                  
                  <div className="flex-1 min-w-0 pl-2">
                    <div className="flex items-center gap-3 flex-wrap mb-2">
                      <StatusBadge status={college.status} />
                      <span className="text-[10px] font-bold tracking-widest uppercase text-slate-500 bg-black/40 px-2 py-0.5 rounded border border-white/5">CODE: {college.code}</span>
                    </div>
                    <div className="text-lg font-bold text-white truncate group-hover:text-cyan-300 transition-colors">{college.name}</div>
                    <div className="text-sm font-medium text-slate-400 flex items-center gap-2 mt-1">
                      <GraduationCap className="h-4 w-4 text-purple-400" />
                      {branchName}
                    </div>
                  </div>
                  
                  <div className="shrink-0 bg-black/20 p-3 rounded-xl border border-white/5">
                    <MarginBar merit={meritNum} cutoff={r.merit} />
                    <div className="text-[10px] font-bold tracking-widest text-slate-500 uppercase mt-2 text-right">Cutoff: {r.merit.toFixed(2)}%</div>
                  </div>

                  <button
                    onClick={() => toggleShortlist(key)}
                    className={`shrink-0 self-start md:self-center p-3 rounded-xl border transition-all duration-300 ${
                      starred 
                        ? "bg-purple-500/20 border-purple-500/40 text-purple-400 shadow-[0_0_15px_rgba(168,85,247,0.2)]" 
                        : "bg-white/5 border-white/10 text-slate-400 hover:bg-white/10 hover:text-white"
                    }`}
                  >
                    <Star className={`h-5 w-5 ${starred ? "fill-current" : ""}`} />
                  </button>
                </div>
              );
            })}
          </div>
          
          {visibleCount < results.length && (
            <button
              onClick={() => setVisibleCount((v) => v + 50)}
              className="w-full py-4 rounded-2xl bg-white/5 border border-white/10 text-slate-300 hover:bg-white/10 transition-all text-sm font-bold flex items-center justify-center gap-2 backdrop-blur-md"
            >
              Load More Options <ArrowRight className="h-4 w-4" />
            </button>
          )}
        </>
      )}
    </div>
  );
}

// ---------- Browse mode (RESKINNED TO GLASSMORPHISM) ----------

function BrowseMode({ expandedCourse, setExpandedCourse }: { expandedCourse: string | null; setExpandedCourse: (val: string | null) => void; }) {
  const [query, setQuery] = useState("");

  const filtered = useMemo(() => {
    if (!query.trim()) return DATA.colleges.slice(0, 30);
    const q = query.toLowerCase();
    return DATA.colleges.filter((c) => c.name.toLowerCase().includes(q) || c.code.includes(q));
  }, [query]);

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="bg-slate-900/40 backdrop-blur-xl border border-white/10 rounded-2xl p-4 shadow-xl">
        <div className="relative">
          <Search className="absolute left-4 top-3.5 h-5 w-5 text-slate-500" />
          <input
            type="text"
            placeholder="Search polytechnic by name or code..."
            className="w-full pl-12 pr-4 py-3 bg-black/40 border border-white/10 rounded-xl focus:border-cyan-500/50 outline-none transition-all text-white placeholder:text-slate-500 font-medium"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
        </div>
      </div>

      {!query.trim() && (
        <div className="text-xs font-medium text-slate-500 px-2 uppercase tracking-wider">Showing first 30 of {DATA.colleges.length} institutes</div>
      )}

      <div className="space-y-4">
        {filtered.length === 0 ? (
          <div className="text-center text-slate-500 py-16 bg-white/5 border border-white/5 border-dashed rounded-3xl">No institutes match your search.</div>
        ) : (
          filtered.map((college) => (
            <div key={college.code} className="bg-slate-900/40 backdrop-blur-md rounded-2xl border border-white/10 overflow-hidden hover:border-white/20 transition-colors">
              <div className="p-6 border-b border-white/5 flex flex-col gap-3">
                <div className="flex items-center gap-3">
                  <span className="px-2.5 py-1 text-[10px] font-bold tracking-widest uppercase bg-black/50 border border-white/10 text-slate-400 rounded-md">
                    CODE: {college.code}
                  </span>
                  <StatusBadge status={college.status} />
                </div>
                <h2 className="text-xl font-bold flex items-center gap-2 text-white">
                  <Building2 className="h-5 w-5 text-cyan-400" />
                  {college.name}
                </h2>
              </div>

              <div className="p-4 space-y-2 bg-black/20">
                {college.courses.map(([branchIdx, cutoffs], idx) => {
                  const courseId = `${college.code}-${idx}`;
                  const branchName = DATA.branches[branchIdx];
                  const isOpen = expandedCourse === courseId;
                  
                  return (
                    <div key={courseId} className="bg-slate-900/50 rounded-xl border border-white/5 overflow-hidden transition-all">
                      <button
                        onClick={() => setExpandedCourse(isOpen ? null : courseId)}
                        className="w-full flex items-center justify-between p-4 hover:bg-white/5 transition-colors"
                      >
                        <div className="flex items-center gap-3">
                          <GraduationCap className="h-5 w-5 text-purple-400" />
                          <span className="font-bold text-left text-slate-200">{branchName}</span>
                        </div>
                        {isOpen ? <ChevronUp className="h-5 w-5 text-slate-500" /> : <ChevronDown className="h-5 w-5 text-slate-500" />}
                      </button>

                      {isOpen && (
                        <div className="border-t border-white/5 overflow-x-auto bg-black/40">
                          <table className="w-full text-sm text-left">
                            <thead className="text-xs uppercase tracking-wider text-slate-500 border-b border-white/5 bg-black/20">
                              <tr>
                                <th className="px-5 py-3 font-bold">Round</th>
                                <th className="px-5 py-3 font-bold">Seat Type</th>
                                <th className="px-5 py-3 font-bold text-right">Cutoff %</th>
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-white/5">
                              {cutoffs.slice().sort((a, b) => a[0] - b[0] || b[3] - a[3]).map(([round, seatIdx, stageIdx, merit], cIdx) => {
                                const decoded = decodeSeat(DATA.seatTypes[seatIdx]);
                                return (
                                  <tr key={cIdx} className="hover:bg-white/5 transition-colors">
                                    <td className="px-5 py-3 font-bold text-slate-300">R{round}</td>
                                    <td className="px-5 py-3">
                                      <span title={decoded.code} className="text-slate-400 font-medium cursor-help">{decoded.label}</span>
                                      <span className="block text-[10px] text-slate-600 mt-0.5">{DATA.stages[stageIdx]}</span>
                                    </td>
                                    <td className="px-5 py-3 font-black text-right text-cyan-400 tabular-nums">{merit.toFixed(2)}%</td>
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

// ---------- NEW: Option Form Mode ----------

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
    const branchName = DATA.branches[branchIdx];
    // Find the exact merit from the flat array to display
    const flatMatch = FLAT.find(f => f.ci === ci && f.branch === branchIdx && f.round === round && f.seat === seatIdx);
    
    return { key, code: college.code, name: college.name, branch: branchName, merit: flatMatch?.merit || 0 };
  });

  return (
    <div className="animate-in fade-in duration-500">
      
      {/* Print Header (Hidden on Screen) */}
      <div className="hidden print:block mb-8 border-b-2 border-slate-900 pb-4">
        <h1 className="text-2xl font-bold text-slate-900">DTE Option Form Choice List</h1>
        <p className="text-xs text-slate-600 mt-1">Generated via MahaPoly Search Engine</p>
      </div>

      <div className="bg-slate-900/40 backdrop-blur-xl border border-white/10 rounded-3xl p-6 md:p-8 shadow-2xl relative overflow-hidden print:bg-transparent print:border-none print:shadow-none print:p-0">
        <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-purple-500/40 to-transparent print:hidden" />
        
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6 border-b border-white/10 pb-6 mb-6 print:hidden">
          <div>
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
              <Star className="text-purple-400 fill-purple-400" size={20} /> Staged Selection List
            </h2>
            <p className="text-sm text-slate-400 mt-1">Ready for DTE Option Form Submission</p>
          </div>

          <div className="flex gap-3 w-full sm:w-auto">
            <button
              onClick={handleShare}
              disabled={shortlist.size === 0}
              className="flex-1 sm:flex-none px-4 py-2.5 bg-black/40 hover:bg-black/60 border border-white/10 text-slate-300 font-bold text-xs rounded-xl flex items-center justify-center gap-2 transition-all disabled:opacity-50"
            >
              {copied ? <Check size={16} className="text-emerald-400" /> : <Share2 size={16} />}
              {copied ? 'Copied' : 'Share'}
            </button>
            <button
              onClick={() => window.print()}
              disabled={shortlist.size === 0}
              className="flex-1 sm:flex-none px-5 py-2.5 bg-gradient-to-r from-purple-600 to-cyan-600 hover:from-purple-500 hover:to-cyan-500 text-white font-bold text-xs rounded-xl flex items-center justify-center gap-2 transition-all shadow-lg disabled:opacity-50"
            >
              <Printer size={16} /> Print List
            </button>
          </div>
        </div>

        {shortlist.size === 0 ? (
          <div className="py-16 text-center text-slate-500 border border-white/5 border-dashed rounded-2xl bg-black/20">
            No choices staged yet. Go back to Search to build your list.
          </div>
        ) : (
          <div className="overflow-x-auto rounded-xl border border-white/5 print:border-slate-300">
            <table className="w-full text-left border-collapse print:text-black">
              <thead>
                <tr className="bg-black/60 border-b border-white/10 text-[10px] tracking-widest uppercase font-bold text-slate-400 print:bg-slate-100 print:border-slate-400 print:text-slate-800">
                  <th className="px-5 py-4 w-16 text-center">Pref</th>
                  <th className="px-5 py-4 w-28">Inst Code</th>
                  <th className="px-5 py-4">Institute Name</th>
                  <th className="px-5 py-4">Branch</th>
                  <th className="px-5 py-4 text-right w-28">Cutoff</th>
                  <th className="px-5 py-4 text-center w-16 print:hidden">Drop</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5 text-sm print:divide-slate-200">
                {rows.map((item, index) => (
                  <tr key={item.key} className="hover:bg-white/5 transition-colors print:hover:bg-transparent bg-slate-900/20 print:bg-transparent">
                    <td className="px-5 py-4 font-bold text-cyan-400 text-center print:text-slate-900">{index + 1}</td>
                    <td className="px-5 py-4 font-mono text-slate-400 print:text-slate-700">{item.code}</td>
                    <td className="px-5 py-4 font-bold text-slate-200 print:text-slate-900">{item.name}</td>
                    <td className="px-5 py-4 font-medium text-slate-400 print:text-slate-800">{item.branch}</td>
                    <td className="px-5 py-4 font-mono font-bold text-right text-cyan-400 print:text-slate-900">{item.merit.toFixed(2)}%</td>
                    <td className="px-5 py-4 text-center print:hidden">
                      <button onClick={() => toggleShortlist(item.key)} className="text-slate-600 hover:text-rose-400 transition-colors p-2">
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

// ---------- Root ----------

export default function PolytechnicDashboard() {
  const [mode, setMode] = useState<"match" | "browse" | "option-form">("match");
  const [shortlist, setShortlist] = useState<Set<string>>(new Set());
  const [expandedCourse, setExpandedCourse] = useState<string | null>(null);

  useEffect(() => {
    try {
      const saved = localStorage.getItem("mahapoly-shortlist");
      if (saved) setShortlist(new Set(JSON.parse(saved)));
    } catch {}
  }, []);

  const toggleShortlist = (key: string) => {
    setShortlist((prev) => {
      const next = new Set(prev);
      next.has(key) ? next.delete(key) : next.add(key);
      try { localStorage.setItem("mahapoly-shortlist", JSON.stringify(Array.from(next))); } catch {}
      return next;
    });
  };

  return (
    <div className="min-h-screen bg-[#050508] text-slate-200 font-sans relative overflow-hidden selection:bg-cyan-500/30">
      
      {/* PREMIUM ATMOSPHERIC BACKGROUND EFFECTS */}
      <div className="fixed top-[-20%] left-[-10%] w-[50vw] h-[50vw] bg-cyan-600/10 rounded-full blur-[150px] pointer-events-none print:hidden" />
      <div className="fixed bottom-[-20%] right-[-10%] w-[40vw] h-[40vw] bg-purple-600/10 rounded-full blur-[150px] pointer-events-none print:hidden" />

      <div className="max-w-5xl mx-auto px-5 md:px-8 py-12 md:py-16 space-y-10 relative z-10 print:p-0">
        
        {/* Hero */}
        <div className="space-y-4 print:hidden">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-white/5 border border-white/10 rounded-full text-[10px] font-bold tracking-widest text-cyan-400 uppercase backdrop-blur-md">
            <Sparkles size={12} className="animate-pulse" /> Maharashtra DTE · CAP Engine
          </div>
          <h1 className="text-4xl md:text-5xl font-black tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-white via-slate-200 to-slate-500">
            MahaPoly Search
          </h1>
          <p className="text-slate-400 text-sm max-w-xl font-medium leading-relaxed">
            Find which polytechnics and branches you qualify for, based on real CAP round cutoffs across {DATA.colleges.length} institutes.
          </p>
        </div>

        {/* Mode toggle (Glassmorphism) */}
        <div className="flex flex-wrap gap-2 bg-slate-900/60 backdrop-blur-xl border border-white/10 rounded-2xl p-1.5 w-fit shadow-lg print:hidden">
          <button
            onClick={() => setMode("match")}
            className={`px-5 py-2.5 rounded-xl text-xs font-bold tracking-wider uppercase transition-all duration-300 ${
              mode === "match" ? "bg-gradient-to-r from-cyan-500/20 to-cyan-500/5 border border-cyan-500/30 text-cyan-300 shadow-[0_0_15px_rgba(6,182,212,0.15)]" : "text-slate-400 hover:text-white border border-transparent"
            }`}
          >
            Find Matches
          </button>
          <button
            onClick={() => setMode("browse")}
            className={`px-5 py-2.5 rounded-xl text-xs font-bold tracking-wider uppercase transition-all duration-300 ${
              mode === "browse" ? "bg-gradient-to-r from-cyan-500/20 to-cyan-500/5 border border-cyan-500/30 text-cyan-300 shadow-[0_0_15px_rgba(6,182,212,0.15)]" : "text-slate-400 hover:text-white border border-transparent"
            }`}
          >
            Directory
          </button>
          <button
            onClick={() => setMode("option-form")}
            className={`px-5 py-2.5 rounded-xl text-xs font-bold tracking-wider uppercase transition-all duration-300 flex items-center gap-2 ${
              mode === "option-form" ? "bg-gradient-to-r from-purple-500/20 to-purple-500/5 border border-purple-500/30 text-purple-300 shadow-[0_0_15px_rgba(168,85,247,0.15)]" : "text-slate-400 hover:text-white border border-transparent"
            }`}
          >
            <Star size={14} className={shortlist.size > 0 ? "fill-current text-purple-400" : ""} />
            Option Form ({shortlist.size})
          </button>
        </div>

        {/* Dynamic View Rendering */}
        {mode === "match" && <MatchMode shortlist={shortlist} toggleShortlist={toggleShortlist} />}
        {mode === "browse" && <BrowseMode expandedCourse={expandedCourse} setExpandedCourse={setExpandedCourse} />}
        {mode === "option-form" && <OptionFormMode shortlist={shortlist} toggleShortlist={toggleShortlist} />}
        
      </div>
    </div>
  );
}