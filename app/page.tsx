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
  ArrowRight,
  Share2,
  Printer,
  Check,
  MapPin
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
      className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all duration-200 border ${
        active
          ? "bg-white text-black border-white shadow-[0_0_15px_rgba(255,255,255,0.15)]"
          : "bg-[#0A0A0A] border-[#222] text-[#888] hover:border-[#444] hover:text-white"
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
      className={`px-2.5 py-1 text-[10px] font-bold tracking-widest rounded-md uppercase border ${
        isGovt 
          ? "bg-cyan-500/10 border-cyan-500/20 text-cyan-400" 
          : "bg-[#111] border-[#222] text-[#888]"
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
  const color = safe ? "#10b981" : tight ? "#f59e0b" : "#64748b"; // Tailwind Emerald, Amber, Slate
  const pct = Math.max(4, Math.min(100, (cutoff / 100) * 100));
  
  return (
    <div className="flex flex-col gap-1.5 min-w-[120px] text-right">
      <div className="flex items-center justify-end gap-2">
         <span className="text-xs font-bold tabular-nums" style={{ color: margin >= 0 ? color : '#64748b' }}>
          {margin >= 0 ? '+' : ''}{margin.toFixed(2)}% margin
        </span>
      </div>
      <div className="relative w-full h-1.5 rounded-full bg-[#1A1A1A] overflow-hidden">
        <div className="absolute inset-y-0 left-0 rounded-full transition-all duration-700 ease-out" style={{ width: `${pct}%`, backgroundColor: color }} />
      </div>
    </div>
  );
}

// THE NEW LOADING ANIMATION: Industry-Standard Skeleton Shimmer
function SkeletonCard() {
  return (
    <div className="flex flex-col md:flex-row md:items-center gap-4 bg-[#0A0A0A] border border-[#1A1A1A] rounded-2xl p-5 relative overflow-hidden">
      {/* Shimmer effect overlay */}
      <div className="absolute inset-0 -translate-x-full animate-[shimmer_1.5s_infinite] bg-gradient-to-r from-transparent via-white/5 to-transparent" />
      
      <div className="flex-1 space-y-3 relative z-10">
        <div className="flex gap-2">
          <div className="h-5 w-24 bg-[#1A1A1A] rounded-md animate-pulse" />
          <div className="h-5 w-16 bg-[#1A1A1A] rounded-md animate-pulse" />
        </div>
        <div className="h-6 w-3/4 bg-[#222] rounded-lg animate-pulse" />
        <div className="h-4 w-1/2 bg-[#1A1A1A] rounded-md animate-pulse" />
      </div>
      <div className="flex items-center gap-6 mt-4 md:mt-0 relative z-10">
        <div className="space-y-2 text-right">
          <div className="h-3 w-16 bg-[#1A1A1A] rounded-md ml-auto animate-pulse" />
          <div className="h-6 w-24 bg-[#222] rounded-md animate-pulse" />
        </div>
        <div className="h-10 w-10 bg-[#1A1A1A] rounded-xl animate-pulse" />
      </div>
    </div>
  );
}


// ---------- MATCH MODE ----------

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
  
  // Clean Loading State
  const [isCalculating, setIsCalculating] = useState(false);

  const isSpecialCategory = ["EWS", "TFWS", "DEFOPENS", "ORPHAN", "PWDOPENH"].includes(category);
  const meritNum = parseFloat(merit);
  const hasValidMerit = merit.trim() !== "" && !isNaN(meritNum) && meritNum >= 0 && meritNum <= 100;

  // Trigger loading animation on parameter change
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

  useEffect(() => setVisibleCount(50), [results]);

  const filteredBranchList = branchQuery
    ? BRANCH_LIST.filter((b) => b.name.toLowerCase().includes(branchQuery.toLowerCase()))
    : BRANCH_LIST;

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      
      {/* PARAMETER PANEL */}
      <div className="bg-[#050505] border border-[#1A1A1A] rounded-3xl p-6 md:p-8 space-y-8">
        
        <div className="flex flex-col md:flex-row gap-6">
          <div className="flex-1">
            <label className="block text-xs font-bold tracking-widest text-[#888] mb-3 uppercase">Merit Percentage</label>
            <input
              type="number"
              inputMode="decimal"
              min={0} max={100} step={0.01}
              placeholder="e.g. 82.40"
              value={merit}
              onChange={(e) => setMerit(e.target.value)}
              className="w-full md:w-72 bg-[#0A0A0A] border border-[#222] rounded-2xl px-5 py-4 text-2xl font-bold tabular-nums text-white placeholder:text-[#444] focus:border-white focus:ring-1 focus:ring-white outline-none transition-all"
            />
          </div>

          <div className="flex-1 md:max-w-xs">
            <label className="block text-xs font-bold tracking-widest text-[#888] mb-3 uppercase">Category</label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full px-5 py-4 bg-[#0A0A0A] border border-[#222] rounded-2xl text-base font-semibold text-white focus:border-white focus:ring-1 focus:ring-white outline-none transition-all appearance-none"
            >
              {CATEGORY_OPTIONS.map((o) => (
                <option key={o.value} value={o.value}>{o.label}</option>
              ))}
            </select>
          </div>
        </div>

        {!isSpecialCategory && (
          <div className="flex flex-wrap gap-8 pt-6 border-t border-[#111]">
            <div>
              <div className="text-[10px] font-bold tracking-widest text-[#666] mb-3 uppercase">Candidature</div>
              <div className="flex flex-wrap gap-2">
                {CANDIDATURE_OPTIONS.map((o) => (
                  <Pill key={o.value} active={candidature === o.value} onClick={() => setCandidature(o.value)}>{o.label}</Pill>
                ))}
              </div>
            </div>
            <div>
              <div className="text-[10px] font-bold tracking-widest text-[#666] mb-3 uppercase">Gender</div>
              <div className="flex gap-2">
                {GENDER_OPTIONS.map((o) => (
                  <Pill key={o.value} active={gender === o.value} onClick={() => setGender(o.value)}>{o.label}</Pill>
                ))}
              </div>
            </div>
          </div>
        )}

        <div className="flex flex-wrap gap-8 pt-6 border-t border-[#111]">
          {!isSpecialCategory && (
            <div>
              <div className="text-[10px] font-bold tracking-widest text-[#666] mb-3 uppercase">Seat Level</div>
              <div className="flex gap-2">
                {LEVEL_OPTIONS.map((o) => (
                  <Pill key={o.value} active={level === o.value} onClick={() => setLevel(o.value)}>{o.label}</Pill>
                ))}
              </div>
            </div>
          )}
          
          <div>
            <div className="text-[10px] font-bold tracking-widest text-[#666] mb-3 uppercase">CAP Round Filter</div>
            <div className="flex gap-2">
              {[1, 2, 3, 4].map((r) => (
                <button
                  key={r}
                  onClick={() => setRound(r)}
                  className={`w-12 h-12 rounded-xl text-sm font-bold transition-all border ${
                    round === r
                      ? "bg-white text-black border-white shadow-[0_0_15px_rgba(255,255,255,0.2)]"
                      : "bg-[#0A0A0A] border-[#222] text-[#888] hover:border-[#444] hover:text-white"
                  }`}
                >
                  R{r}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* EXACT ORIGINAL BRANCH FILTER LOGIC (RESTORED & STYLED) */}
        <details className="group pt-6 border-t border-[#111]">
          <summary className="flex items-center gap-2 text-sm font-bold text-[#888] cursor-pointer hover:text-white list-none transition-colors">
            <SlidersHorizontal className="h-4 w-4" />
            Filter by specific branch
            {branchFilter.size > 0 && (
              <span className="px-2.5 py-0.5 rounded-md bg-white text-black text-xs font-bold ml-2">
                {branchFilter.size} Selected
              </span>
            )}
            <ChevronDown className="h-4 w-4 ml-auto group-open:hidden" />
            <ChevronUp className="h-4 w-4 ml-auto hidden group-open:block" />
          </summary>
          <div className="mt-4 p-5 bg-[#0A0A0A] border border-[#1A1A1A] rounded-2xl space-y-4">
            <input
              type="text"
              placeholder="Search branches..."
              value={branchQuery}
              onChange={(e) => setBranchQuery(e.target.value)}
              className="w-full px-4 py-3 bg-[#050505] border border-[#222] rounded-xl text-sm outline-none focus:border-white text-white placeholder:text-[#555] transition-colors"
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
                    className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors ${
                      active
                        ? "bg-white border-white text-black shadow-sm"
                        : "bg-[#050505] border-[#222] text-[#888] hover:border-[#444] hover:text-white"
                    }`}
                  >
                    {b.name}
                  </button>
                );
              })}
            </div>
            {branchFilter.size > 0 && (
              <button onClick={() => setBranchFilter(new Set())} className="text-xs font-semibold text-[#666] hover:text-white flex items-center gap-1 pt-2">
                <X className="h-3 w-3" /> Clear selections
              </button>
            )}
          </div>
        </details>
      </div>

      {/* ENGINE RESULTS */}
      {!hasValidMerit ? (
        <div className="text-center py-24 px-4 bg-[#050505] border border-[#1A1A1A] rounded-3xl">
          <div className="w-16 h-16 bg-[#0A0A0A] border border-[#222] rounded-full flex items-center justify-center mx-auto mb-4">
             <Search className="h-6 w-6 text-[#666]" />
          </div>
          <h3 className="text-xl font-bold text-white mb-2">Awaiting Parameters</h3>
          <p className="text-sm text-[#888] max-w-sm mx-auto">Enter your precise merit percentage to unlock matching polytechnic institutions.</p>
        </div>
      ) : isCalculating ? (
        <div className="space-y-4">
          <SkeletonCard />
          <SkeletonCard />
          <SkeletonCard />
        </div>
      ) : results.length === 0 ? (
        <div className="text-center py-24 px-4 bg-[#050505] border border-dashed border-[#222] rounded-3xl">
          <h3 className="text-xl font-bold text-white mb-2">Zero Matches Identified</h3>
          <p className="text-sm text-[#888]">Adjust your category, seat level, or CAP round to expand the search radius.</p>
        </div>
      ) : (
        <div className="space-y-4">
          <div className="flex items-center justify-between text-sm font-semibold text-[#666] px-2">
            <span><span className="text-white font-bold">{results.length}</span> eligible branches found</span>
            <span className="bg-[#111] border border-[#222] px-3 py-1 rounded-full text-[10px] tracking-widest uppercase text-[#888]">Ranked by Match Fit</span>
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
                  className="group flex flex-col md:flex-row md:items-center gap-4 bg-[#0A0A0A] border border-[#1A1A1A] hover:border-[#333] rounded-2xl p-5 transition-all duration-200"
                >
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-2.5">
                      <StatusBadge status={college.status} />
                      <span className="text-[10px] font-bold text-[#666] uppercase tracking-widest bg-[#111] px-2 py-0.5 rounded border border-[#222]">Code: {college.code}</span>
                    </div>
                    <h3 className="text-lg font-bold text-white leading-tight group-hover:text-cyan-400 transition-colors">{college.name}</h3>
                    <div className="text-sm font-medium text-[#888] flex items-center gap-2 mt-2">
                      <GraduationCap className="h-4 w-4 text-[#555]" /> {branchName}
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between md:justify-end gap-6 pt-4 md:pt-0 border-t border-[#111] md:border-none mt-2 md:mt-0">
                    <div className="text-right flex flex-col items-end">
                      <span className="text-[10px] font-bold text-[#666] uppercase tracking-widest mb-1">Historical Cutoff</span>
                      <span className="text-lg font-black text-white tabular-nums leading-none mb-2">{r.merit.toFixed(2)}%</span>
                      <MarginBar merit={meritNum} cutoff={r.merit} />
                    </div>

                    <button
                      onClick={() => toggleShortlist(key)}
                      className={`shrink-0 p-3.5 rounded-xl border transition-all duration-200 ${
                        starred 
                          ? "bg-white border-white text-black shadow-[0_0_15px_rgba(255,255,255,0.2)]" 
                          : "bg-[#111] border-[#222] text-[#666] hover:border-[#444] hover:text-white"
                      }`}
                      aria-label="Add to Option Form"
                    >
                      <Star className={`h-5 w-5 ${starred ? "fill-current" : ""}`} />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
          
          {visibleCount < results.length && (
            <button
              onClick={() => setVisibleCount((v) => v + 50)}
              className="w-full py-4 rounded-2xl bg-[#050505] border border-[#1A1A1A] text-[#888] hover:bg-[#0A0A0A] hover:text-white transition-colors text-sm font-bold flex items-center justify-center gap-2 mt-6"
            >
              Load Additional Options <ArrowRight className="h-4 w-4" />
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
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="bg-[#050505] border border-[#1A1A1A] rounded-3xl p-4">
        <div className="relative">
          <Search className="absolute left-4 top-3.5 h-5 w-5 text-[#666]" />
          <input
            type="text"
            placeholder="Search institute by name or code..."
            className="w-full pl-12 pr-4 py-3 bg-[#0A0A0A] border border-[#222] rounded-2xl focus:border-white outline-none transition-all text-white placeholder:text-[#555] text-sm"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
        </div>
      </div>

      {!query.trim() && (
        <div className="text-[10px] font-bold text-[#666] px-2 uppercase tracking-widest">Showing first 30 of {DATA.colleges.length} institutes</div>
      )}

      <div className="space-y-4">
        {filtered.length === 0 ? (
          <div className="text-center text-[#666] py-16 text-sm bg-[#050505] border border-dashed border-[#222] rounded-3xl">No institutes found matching your query.</div>
        ) : (
          filtered.map((college) => (
            <div key={college.code} className="bg-[#050505] rounded-3xl border border-[#1A1A1A] overflow-hidden hover:border-[#333] transition-colors">
              
              <div className="p-6 md:p-8 flex flex-col gap-3 border-b border-[#111]">
                <div className="flex items-center gap-3">
                  <span className="px-2 py-1 text-[10px] font-bold tracking-widest uppercase bg-[#111] border border-[#222] text-[#888] rounded-md">
                    CODE: {college.code}
                  </span>
                  <StatusBadge status={college.status} />
                </div>
                <h2 className="text-xl font-bold flex items-center gap-3 text-white">
                  <Building2 className="h-5 w-5 text-cyan-400" /> {college.name}
                </h2>
              </div>

              {/* EXACT ORIGINAL ACCORDION LOGIC RESTORED & STYLED */}
              <div className="p-4 space-y-2 bg-[#0A0A0A]">
                {college.courses.map(([branchIdx, cutoffs], idx) => {
                  const courseId = `${college.code}-${idx}`;
                  const branchName = DATA.branches[branchIdx];
                  const isOpen = expandedCourse === courseId;
                  
                  return (
                    <div key={courseId} className="bg-[#050505] border border-[#1A1A1A] rounded-2xl overflow-hidden transition-all">
                      <button
                        onClick={() => setExpandedCourse(isOpen ? null : courseId)}
                        className="w-full flex items-center justify-between p-5 hover:bg-[#111] transition-colors"
                      >
                        <div className="flex items-center gap-3">
                          <GraduationCap className="h-5 w-5 text-[#666]" />
                          <span className="font-bold text-left text-white">{branchName}</span>
                        </div>
                        {isOpen ? <ChevronUp className="h-5 w-5 text-[#666]" /> : <ChevronDown className="h-5 w-5 text-[#666]" />}
                      </button>

                      {isOpen && (
                        <div className="border-t border-[#1A1A1A] overflow-x-auto">
                          <table className="w-full text-sm text-left">
                            <thead className="text-[10px] uppercase tracking-widest text-[#666] bg-[#0A0A0A]">
                              <tr>
                                <th className="px-5 py-4 font-bold">Round</th>
                                <th className="px-5 py-4 font-bold">Seat Type</th>
                                <th className="px-5 py-4 font-bold text-right">Cutoff</th>
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-[#1A1A1A]">
                              {cutoffs.slice().sort((a, b) => a[0] - b[0] || b[3] - a[3]).map(([round, seatIdx, stageIdx, merit], cIdx) => {
                                const decoded = decodeSeat(DATA.seatTypes[seatIdx]);
                                return (
                                  <tr key={cIdx} className="hover:bg-[#111] transition-colors">
                                    <td className="px-5 py-4 font-bold text-white">R{round}</td>
                                    <td className="px-5 py-4">
                                      <span title={decoded.code} className="text-[#CCC] font-semibold cursor-help">{decoded.label}</span>
                                      <span className="block text-[10px] text-[#666] mt-1">{DATA.stages[stageIdx]}</span>
                                    </td>
                                    <td className="px-5 py-4 font-black text-right text-cyan-400 tabular-nums">{merit.toFixed(2)}%</td>
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
    <div className="animate-in fade-in duration-500">
      
      <div className="hidden print:block mb-8 border-b-2 border-black pb-4">
        <h1 className="text-3xl font-bold text-black">DTE Option Form Choices</h1>
        <p className="text-sm font-medium text-slate-500 mt-1">Generated via MahaPoly</p>
      </div>

      <div className="bg-[#050505] border border-[#1A1A1A] rounded-3xl p-6 md:p-8 print:bg-transparent print:border-none print:p-0">
        
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6 mb-8 print:hidden">
          <div>
            <h2 className="text-2xl font-bold text-white">Staged Option Form</h2>
            <p className="text-sm text-[#888] mt-1">Review and order your selected branches before official submission.</p>
          </div>

          <div className="flex gap-3 w-full sm:w-auto">
            <button
              onClick={handleShare}
              disabled={shortlist.size === 0}
              className="flex-1 sm:flex-none px-5 py-2.5 bg-[#111] border border-[#222] hover:bg-[#1A1A1A] text-white font-bold text-sm rounded-xl flex items-center justify-center gap-2 transition-all disabled:opacity-50"
            >
              {copied ? <Check size={18} className="text-emerald-500" /> : <Share2 size={18} />} Share List
            </button>
            <button
              onClick={() => window.print()}
              disabled={shortlist.size === 0}
              className="flex-1 sm:flex-none px-5 py-2.5 bg-white text-black hover:bg-gray-200 font-bold text-sm rounded-xl flex items-center justify-center gap-2 transition-all disabled:opacity-50 shadow-[0_0_15px_rgba(255,255,255,0.2)]"
            >
              <Printer size={18} /> Print Form
            </button>
          </div>
        </div>

        {shortlist.size === 0 ? (
          <div className="py-20 text-center border border-dashed border-[#222] rounded-2xl bg-[#0A0A0A]">
            <Star className="h-8 w-8 text-[#444] mx-auto mb-3" />
            <p className="text-lg font-bold text-[#888] mb-1">Your list is empty</p>
            <p className="text-sm text-[#666]">Return to the engine and click the star icon to stage your choices here.</p>
          </div>
        ) : (
          <div className="overflow-x-auto rounded-2xl border border-[#1A1A1A] print:border-slate-400">
            <table className="w-full text-left print:text-black">
              <thead>
                <tr className="bg-[#0A0A0A] border-b border-[#1A1A1A] text-[10px] tracking-widest uppercase font-bold text-[#666] print:bg-slate-100 print:border-slate-400 print:text-slate-800">
                  <th className="px-5 py-4 text-center w-16">Pref</th>
                  <th className="px-5 py-4 w-28">Code</th>
                  <th className="px-5 py-4">Institution Name</th>
                  <th className="px-5 py-4">Branch</th>
                  <th className="px-5 py-4 text-right w-24">Cutoff</th>
                  <th className="px-5 py-4 text-center w-16 print:hidden"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#1A1A1A] print:divide-slate-300">
                {rows.map((item, index) => (
                  <tr key={item.key} className="hover:bg-[#111] transition-colors print:bg-transparent">
                    <td className="px-5 py-4 font-black text-white text-center print:text-slate-900">{index + 1}</td>
                    <td className="px-5 py-4 font-mono font-medium text-[#888] print:text-slate-700">{item.code}</td>
                    <td className="px-5 py-4 font-bold text-[#CCC] print:text-slate-900">{item.name}</td>
                    <td className="px-5 py-4 font-medium text-[#888] print:text-slate-800">{item.branch}</td>
                    <td className="px-5 py-4 font-bold text-right text-cyan-400 tabular-nums print:text-slate-900">{item.merit.toFixed(2)}%</td>
                    <td className="px-5 py-4 text-center print:hidden">
                      <button onClick={() => toggleShortlist(item.key)} className="text-[#666] hover:text-red-500 p-2 rounded-lg hover:bg-[#1A1A1A] transition-colors">
                        <X size={18} />
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

  useEffect(() => {
    try {
      const savedList = localStorage.getItem("mahapoly-shortlist");
      if (savedList) setShortlist(new Set(JSON.parse(savedList)));
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
    <div className="min-h-screen bg-[#000000] text-white font-sans selection:bg-white selection:text-black">
      
      {/* ADDING ANIMATION KEYFRAMES GLOBALLY VIA TAILWIND ARBITRARY VALUES */}
      <style dangerouslySetInnerHTML={{__html: `
        @keyframes shimmer {
          100% { transform: translateX(100%); }
        }
      `}} />

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10 md:py-16 space-y-10 print:p-0">
        
        <header className="flex flex-col md:flex-row md:items-end justify-between gap-6 print:hidden">
          <div className="space-y-3">
            <div className="inline-flex items-center gap-2 text-[10px] font-bold tracking-widest text-[#888] uppercase">
              <MapPin size={14} className="text-cyan-400" /> Maharashtra DTE Portal
            </div>
            <h1 className="text-4xl md:text-5xl font-black tracking-tight text-white">
              MahaPoly
            </h1>
            <p className="text-[#888] text-sm font-medium max-w-md">
              Intelligent cutoff aggregation across {DATA.colleges.length} state institutions.
            </p>
          </div>

          <div className="flex bg-[#0A0A0A] p-1.5 rounded-2xl w-fit border border-[#1A1A1A]">
            <button
              onClick={() => setMode("match")}
              className={`px-6 py-2.5 rounded-xl text-sm font-bold transition-all duration-200 ${
                mode === "match" ? "bg-[#1A1A1A] text-white shadow-sm" : "text-[#666] hover:text-white"
              }`}
            >
              Engine
            </button>
            <button
              onClick={() => setMode("browse")}
              className={`px-6 py-2.5 rounded-xl text-sm font-bold transition-all duration-200 ${
                mode === "browse" ? "bg-[#1A1A1A] text-white shadow-sm" : "text-[#666] hover:text-white"
              }`}
            >
              Directory
            </button>
            <button
              onClick={() => setMode("option-form")}
              className={`px-6 py-2.5 rounded-xl text-sm font-bold transition-all duration-200 flex items-center gap-2 ${
                mode === "option-form" ? "bg-[#1A1A1A] text-white shadow-sm" : "text-[#666] hover:text-white"
              }`}
            >
              <Star size={16} className={shortlist.size > 0 ? "fill-current text-white" : ""} />
              Staged {shortlist.size > 0 && <span className="bg-[#222] text-white px-1.5 py-0.5 rounded-md text-[10px] leading-none ml-1">{shortlist.size}</span>}
            </button>
          </div>
        </header>

        {mode === "match" && <MatchMode shortlist={shortlist} toggleShortlist={toggleShortlist} />}
        {mode === "browse" && <BrowseMode expandedCourse={expandedCourse} setExpandedCourse={setExpandedCourse} />}
        {mode === "option-form" && <OptionFormMode shortlist={shortlist} toggleShortlist={toggleShortlist} />}
        
      </div>
    </div>
  );
}