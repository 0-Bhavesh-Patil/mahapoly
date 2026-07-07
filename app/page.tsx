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
  Check
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

// ---------- Data layer (PRESERVED EXACTLY) ----------
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

// ---------- Small UI atoms (POP FINTECH AESTHETIC) ----------

function Pill({ active, onClick, children }: { active: boolean; onClick: () => void; children: React.ReactNode; }) {
  return (
    <button
      onClick={onClick}
      className={`px-5 py-2.5 rounded-full text-sm font-semibold transition-all duration-200 ${
        active
          ? "bg-white text-black shadow-sm"
          : "bg-[#141414] text-[#888] hover:bg-[#1A1A1A] hover:text-white"
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
      className={`px-2.5 py-1 text-[10px] font-bold uppercase tracking-widest rounded-md ${
        isGovt 
          ? "bg-[#CCFF00]/10 text-[#CCFF00]" 
          : "bg-[#1A1A1A] text-[#888]"
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
  const color = safe ? "#CCFF00" : tight ? "#FFD600" : "#444"; 
  const pct = Math.max(4, Math.min(100, (cutoff / 100) * 100));
  
  return (
    <div className="flex items-center gap-3 min-w-[120px]">
      <div className="relative flex-1 h-1.5 rounded-full bg-[#1A1A1A] overflow-hidden">
        <div className="absolute inset-y-0 left-0 rounded-full" style={{ width: `${pct}%`, backgroundColor: color }} />
      </div>
      <span className="text-xs font-bold tabular-nums" style={{ color: margin >= 0 ? color : '#888' }}>
        +{margin.toFixed(1)}%
      </span>
    </div>
  );
}

// ---------- Match Mode ----------

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
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Sleek Fintech Control Panel */}
      <div className="bg-[#0A0A0A] border border-[#1A1A1A] rounded-[32px] p-6 md:p-8 space-y-8">
        
        <div className="flex flex-col md:flex-row gap-6">
          <div className="flex-1">
            <label className="block text-[11px] font-bold tracking-widest text-[#666] mb-3 uppercase">Your Merit %</label>
            <input
              type="number"
              inputMode="decimal"
              min={0} max={100} step={0.01}
              placeholder="0.00"
              value={merit}
              onChange={(e) => setMerit(e.target.value)}
              className="w-full bg-[#141414] rounded-2xl px-6 py-5 text-4xl font-bold tabular-nums text-white placeholder:text-[#333] focus:ring-2 focus:ring-[#CCFF00] outline-none transition-all"
            />
          </div>

          <div className="flex-1 md:max-w-xs">
            <label className="block text-[11px] font-bold tracking-widest text-[#666] mb-3 uppercase">Category</label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full px-5 py-5 bg-[#141414] rounded-2xl text-lg font-semibold text-white outline-none focus:ring-2 focus:ring-[#CCFF00] appearance-none"
            >
              {CATEGORY_OPTIONS.map((o) => (
                <option key={o.value} value={o.value}>{o.label}</option>
              ))}
            </select>
          </div>
        </div>

        {!isSpecialCategory && (
          <div className="flex flex-wrap gap-8 pt-4">
            <div>
              <div className="text-[11px] font-bold tracking-widest text-[#666] mb-3 uppercase">Candidature</div>
              <div className="flex gap-2 bg-[#141414] p-1.5 rounded-full w-fit">
                {CANDIDATURE_OPTIONS.map((o) => (
                  <button
                    key={o.value}
                    onClick={() => setCandidature(o.value)}
                    className={`px-5 py-2 rounded-full text-sm font-semibold transition-all ${candidature === o.value ? 'bg-[#222] text-white shadow-sm' : 'text-[#888] hover:text-white'}`}
                  >
                    {o.label}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <div className="text-[11px] font-bold tracking-widest text-[#666] mb-3 uppercase">Gender</div>
              <div className="flex gap-2 bg-[#141414] p-1.5 rounded-full w-fit">
                {GENDER_OPTIONS.map((o) => (
                  <button
                    key={o.value}
                    onClick={() => setGender(o.value)}
                    className={`px-5 py-2 rounded-full text-sm font-semibold transition-all ${gender === o.value ? 'bg-[#222] text-white shadow-sm' : 'text-[#888] hover:text-white'}`}
                  >
                    {o.label}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        <div className="flex flex-wrap gap-8 pt-4">
          {!isSpecialCategory && (
            <div>
              <div className="text-[11px] font-bold tracking-widest text-[#666] mb-3 uppercase">Seat Level</div>
              <div className="flex gap-2 bg-[#141414] p-1.5 rounded-full w-fit">
                {LEVEL_OPTIONS.map((o) => (
                  <button
                    key={o.value}
                    onClick={() => setLevel(o.value)}
                    className={`px-5 py-2 rounded-full text-sm font-semibold transition-all ${level === o.value ? 'bg-[#222] text-white shadow-sm' : 'text-[#888] hover:text-white'}`}
                  >
                    {o.label}
                  </button>
                ))}
              </div>
            </div>
          )}
          
          <div>
            <div className="text-[11px] font-bold tracking-widest text-[#666] mb-3 uppercase">CAP Round</div>
            <div className="flex gap-2">
              {[1, 2, 3, 4].map((r) => (
                <button
                  key={r}
                  onClick={() => setRound(r)}
                  className={`w-12 h-12 rounded-full text-sm font-bold transition-all ${
                    round === r
                      ? "bg-[#CCFF00] text-black"
                      : "bg-[#141414] text-[#888] hover:bg-[#222] hover:text-white"
                  }`}
                >
                  {r}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Branch Filter Accordion */}
        <details className="group pt-4">
          <summary className="flex items-center gap-2 text-sm font-semibold text-[#888] cursor-pointer hover:text-white list-none">
            <SlidersHorizontal className="h-4 w-4" />
            Branch Filter
            {branchFilter.size > 0 && (
              <span className="px-2 py-0.5 rounded bg-[#CCFF00] text-black text-xs font-bold ml-2">
                {branchFilter.size} selected
              </span>
            )}
            <ChevronDown className="h-4 w-4 ml-auto group-open:hidden" />
            <ChevronUp className="h-4 w-4 ml-auto hidden group-open:block" />
          </summary>
          <div className="mt-4 p-5 bg-[#141414] rounded-2xl space-y-4">
            <input
              type="text"
              placeholder="Search branches..."
              value={branchQuery}
              onChange={(e) => setBranchQuery(e.target.value)}
              className="w-full px-4 py-3 bg-[#0A0A0A] rounded-xl text-sm outline-none focus:ring-1 focus:ring-[#CCFF00] text-white placeholder:text-[#555]"
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
                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                      active
                        ? "bg-white text-black"
                        : "bg-[#0A0A0A] text-[#888] hover:text-white"
                    }`}
                  >
                    {b.name}
                  </button>
                );
              })}
            </div>
            {branchFilter.size > 0 && (
              <button onClick={() => setBranchFilter(new Set())} className="text-xs font-semibold text-[#666] hover:text-white flex items-center gap-1 mt-2">
                <X className="h-3 w-3" /> Clear filters
              </button>
            )}
          </div>
        </details>
      </div>

      {/* Results */}
      {!hasValidMerit ? (
        <div className="text-center py-20 text-[#666]">
          <p className="text-2xl font-bold text-[#444] mb-2">Awaiting Input</p>
          <p className="text-sm">Enter your merit percentage to unlock matching institutes.</p>
        </div>
      ) : results.length === 0 ? (
        <div className="text-center py-20 text-[#666]">
          <p className="text-2xl font-bold text-white mb-2">No Matches Found</p>
          <p className="text-sm">Try tweaking parameters like "Other than Home District" or CAP Round.</p>
        </div>
      ) : (
        <div className="space-y-4">
          <div className="flex items-center justify-between text-sm font-semibold text-[#888] px-2">
            <span><span className="text-white text-base">{results.length}</span> eligible branches</span>
            <span>Sorted by highest fit</span>
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
                  className="flex flex-col md:flex-row md:items-center gap-4 bg-[#0A0A0A] border border-[#1A1A1A] hover:border-[#333] rounded-[24px] p-5 transition-colors"
                >
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-2">
                      <StatusBadge status={college.status} />
                      <span className="text-[10px] font-bold text-[#666]">#{college.code}</span>
                    </div>
                    <div className="text-lg font-bold text-white truncate">{college.name}</div>
                    <div className="text-sm font-semibold text-[#888] flex items-center gap-2 mt-1">
                      <GraduationCap className="h-4 w-4" /> {branchName}
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-6">
                    <div className="text-right">
                      <MarginBar merit={meritNum} cutoff={r.merit} />
                      <div className="text-[11px] font-bold tracking-widest text-[#666] uppercase mt-1">Cutoff: {r.merit.toFixed(2)}%</div>
                    </div>

                    <button
                      onClick={() => toggleShortlist(key)}
                      className={`shrink-0 p-4 rounded-full transition-all ${
                        starred 
                          ? "bg-[#CCFF00] text-black" 
                          : "bg-[#141414] text-[#888] hover:bg-[#222] hover:text-white"
                      }`}
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
              className="w-full py-4 rounded-[24px] bg-[#0A0A0A] border border-[#1A1A1A] text-white hover:bg-[#141414] transition-colors text-sm font-bold flex items-center justify-center gap-2"
            >
              Load More <ArrowRight className="h-4 w-4" />
            </button>
          )}
        </div>
      )}
    </div>
  );
}

// ---------- Browse Mode ----------

function BrowseMode({ expandedCourse, setExpandedCourse }: { expandedCourse: string | null; setExpandedCourse: (val: string | null) => void; }) {
  const [query, setQuery] = useState("");

  const filtered = useMemo(() => {
    if (!query.trim()) return DATA.colleges.slice(0, 30);
    const q = query.toLowerCase();
    return DATA.colleges.filter((c) => c.name.toLowerCase().includes(q) || c.code.includes(q));
  }, [query]);

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      <div className="relative">
        <Search className="absolute left-6 top-5 h-6 w-6 text-[#666]" />
        <input
          type="text"
          placeholder="Search polytechnic by name or code..."
          className="w-full pl-16 pr-6 py-5 bg-[#0A0A0A] border border-[#1A1A1A] rounded-[24px] focus:ring-2 focus:ring-[#CCFF00] outline-none transition-all text-lg font-semibold text-white placeholder:text-[#555]"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
      </div>

      <div className="space-y-3">
        {filtered.length === 0 ? (
          <div className="text-center text-[#666] py-16 font-semibold">No institutes found.</div>
        ) : (
          filtered.map((college) => (
            <div key={college.code} className="bg-[#0A0A0A] rounded-[24px] border border-[#1A1A1A] overflow-hidden">
              <div className="p-6 md:p-8 flex flex-col gap-3">
                <div className="flex items-center gap-3">
                  <span className="px-2.5 py-1 text-[10px] font-bold tracking-widest bg-[#141414] text-[#888] rounded-md">#{college.code}</span>
                  <StatusBadge status={college.status} />
                </div>
                <h2 className="text-xl md:text-2xl font-bold flex items-center gap-3 text-white">
                  <Building2 className="h-6 w-6 text-[#CCFF00]" /> {college.name}
                </h2>
              </div>

              <div className="px-4 pb-4 space-y-2">
                {college.courses.map(([branchIdx, cutoffs], idx) => {
                  const courseId = `${college.code}-${idx}`;
                  const branchName = DATA.branches[branchIdx];
                  const isOpen = expandedCourse === courseId;
                  
                  return (
                    <div key={courseId} className="bg-[#141414] rounded-[20px] overflow-hidden">
                      <button
                        onClick={() => setExpandedCourse(isOpen ? null : courseId)}
                        className="w-full flex items-center justify-between p-5 hover:bg-[#1A1A1A] transition-colors"
                      >
                        <div className="flex items-center gap-3">
                          <GraduationCap className="h-5 w-5 text-[#888]" />
                          <span className="font-bold text-left text-white">{branchName}</span>
                        </div>
                        {isOpen ? <ChevronUp className="h-5 w-5 text-[#666]" /> : <ChevronDown className="h-5 w-5 text-[#666]" />}
                      </button>

                      {isOpen && (
                        <div className="border-t border-[#222]">
                          <table className="w-full text-sm text-left">
                            <thead className="text-[10px] uppercase tracking-widest text-[#666] bg-[#0A0A0A]">
                              <tr>
                                <th className="px-5 py-4 font-bold">Round</th>
                                <th className="px-5 py-4 font-bold">Seat Type</th>
                                <th className="px-5 py-4 font-bold text-right">Cutoff</th>
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-[#222]">
                              {cutoffs.slice().sort((a, b) => a[0] - b[0] || b[3] - a[3]).map(([round, seatIdx, stageIdx, merit], cIdx) => {
                                const decoded = decodeSeat(DATA.seatTypes[seatIdx]);
                                return (
                                  <tr key={cIdx}>
                                    <td className="px-5 py-4 font-bold text-white">R{round}</td>
                                    <td className="px-5 py-4">
                                      <span title={decoded.code} className="text-white font-semibold cursor-help">{decoded.label}</span>
                                      <span className="block text-[10px] text-[#666] font-bold mt-1 uppercase tracking-wider">{DATA.stages[stageIdx]}</span>
                                    </td>
                                    <td className="px-5 py-4 font-black text-right text-[#CCFF00] text-lg tabular-nums">{merit.toFixed(2)}%</td>
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

// ---------- Option Form Mode ----------

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
    <div className="animate-in fade-in duration-300">
      
      <div className="hidden print:block mb-8 border-b-4 border-black pb-4">
        <h1 className="text-4xl font-black text-black tracking-tighter">DTE Option Form</h1>
        <p className="text-sm font-bold text-gray-500 mt-1 uppercase tracking-widest">Generated List</p>
      </div>

      <div className="bg-[#0A0A0A] rounded-[32px] p-6 md:p-10 print:bg-transparent print:p-0">
        
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6 mb-8 print:hidden">
          <div>
            <h2 className="text-2xl font-bold text-white tracking-tight">Staged Choices</h2>
            <p className="text-sm font-medium text-[#666] mt-1">Ready for official portal submission.</p>
          </div>

          <div className="flex gap-3 w-full sm:w-auto">
            <button
              onClick={handleShare}
              disabled={shortlist.size === 0}
              className="flex-1 sm:flex-none px-6 py-3 bg-[#141414] hover:bg-[#222] text-white font-bold text-sm rounded-full flex items-center justify-center gap-2 transition-all disabled:opacity-50"
            >
              {copied ? <Check size={18} className="text-[#CCFF00]" /> : <Share2 size={18} />} Share
            </button>
            <button
              onClick={() => window.print()}
              disabled={shortlist.size === 0}
              className="flex-1 sm:flex-none px-6 py-3 bg-[#CCFF00] text-black hover:bg-white font-bold text-sm rounded-full flex items-center justify-center gap-2 transition-all disabled:opacity-50"
            >
              <Printer size={18} /> Print Form
            </button>
          </div>
        </div>

        {shortlist.size === 0 ? (
          <div className="py-20 text-center text-[#666] bg-[#141414] rounded-[24px]">
            <p className="text-xl font-bold text-white mb-2">List Empty</p>
            <p className="text-sm">Head back to search and click the star icon to stage choices.</p>
          </div>
        ) : (
          <div className="overflow-x-auto border border-[#1A1A1A] rounded-[24px] print:border-gray-300">
            <table className="w-full text-left print:text-black">
              <thead>
                <tr className="bg-[#141414] text-[11px] tracking-widest uppercase font-bold text-[#666] print:bg-gray-100 print:text-black">
                  <th className="px-6 py-5 text-center">Pref</th>
                  <th className="px-6 py-5">Code</th>
                  <th className="px-6 py-5">Institute</th>
                  <th className="px-6 py-5">Branch</th>
                  <th className="px-6 py-5 text-right">Cutoff</th>
                  <th className="px-6 py-5 text-center print:hidden"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#1A1A1A] print:divide-gray-300">
                {rows.map((item, index) => (
                  <tr key={item.key} className="hover:bg-[#111] transition-colors print:bg-transparent">
                    <td className="px-6 py-5 font-black text-xl text-center text-[#CCFF00] print:text-black">{index + 1}</td>
                    <td className="px-6 py-5 font-bold text-[#888] print:text-gray-600">{item.code}</td>
                    <td className="px-6 py-5 font-bold text-white print:text-black">{item.name}</td>
                    <td className="px-6 py-5 font-semibold text-[#888] print:text-gray-800">{item.branch}</td>
                    <td className="px-6 py-5 font-black text-right text-white text-lg tabular-nums print:text-black">{item.merit.toFixed(2)}%</td>
                    <td className="px-6 py-5 text-center print:hidden">
                      <button onClick={() => toggleShortlist(item.key)} className="text-[#444] hover:text-red-500 bg-[#1A1A1A] p-3 rounded-full transition-colors">
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
    <div className="min-h-screen bg-black text-white font-sans selection:bg-[#CCFF00]/30">
      <div className="max-w-5xl mx-auto px-5 md:px-8 py-10 md:py-16 space-y-10 print:p-0">
        
        {/* Minimal Hero */}
        <div className="space-y-2 print:hidden">
          <div className="text-[11px] font-black tracking-widest text-[#CCFF00] uppercase mb-4">
            Maha DTE // CAP Cutoffs
          </div>
          <h1 className="text-5xl md:text-6xl font-black tracking-tighter">MahaPoly</h1>
          <p className="text-[#888] text-base font-semibold max-w-xl pt-2">
            Instant cutoff predictions across {DATA.colleges.length} institutes.
          </p>
        </div>

        {/* High-Contrast Segmented Toggle */}
        <div className="flex bg-[#141414] p-1.5 rounded-full w-fit print:hidden">
          <button
            onClick={() => setMode("match")}
            className={`px-6 py-3 rounded-full text-sm font-bold tracking-wide transition-all ${
              mode === "match" ? "bg-white text-black" : "text-[#888] hover:text-white"
            }`}
          >
            Find Matches
          </button>
          <button
            onClick={() => setMode("browse")}
            className={`px-6 py-3 rounded-full text-sm font-bold tracking-wide transition-all ${
              mode === "browse" ? "bg-white text-black" : "text-[#888] hover:text-white"
            }`}
          >
            Directory
          </button>
          <button
            onClick={() => setMode("option-form")}
            className={`px-6 py-3 rounded-full text-sm font-bold tracking-wide transition-all flex items-center gap-2 ${
              mode === "option-form" ? "bg-white text-black" : "text-[#888] hover:text-white"
            }`}
          >
            <Star size={16} className={shortlist.size > 0 ? "fill-current" : ""} />
            Shortlist {shortlist.size > 0 && `(${shortlist.size})`}
          </button>
        </div>

        {/* Render Active View */}
        {mode === "match" && <MatchMode shortlist={shortlist} toggleShortlist={toggleShortlist} />}
        {mode === "browse" && <BrowseMode expandedCourse={expandedCourse} setExpandedCourse={setExpandedCourse} />}
        {mode === "option-form" && <OptionFormMode shortlist={shortlist} toggleShortlist={toggleShortlist} />}
        
      </div>
    </div>
  );
}