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
  Info,
  MapPin,
  Award
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

// ---------- Data Layer (PRESERVED EXACTLY) ----------
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


// ---------- UI Atoms (Clean, Accessible, Native-App Feel) ----------

function Pill({ active, onClick, children }: { active: boolean; onClick: () => void; children: React.ReactNode; }) {
  return (
    <button
      onClick={onClick}
      className={`px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200 ${
        active
          ? "bg-indigo-600 text-white shadow-md shadow-indigo-600/20"
          : "bg-white border border-slate-200 text-slate-600 hover:border-indigo-300 hover:bg-indigo-50"
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
      className={`px-2.5 py-1 text-[11px] font-bold tracking-wide rounded-lg border ${
        isGovt 
          ? "bg-emerald-50 border-emerald-200 text-emerald-700" 
          : "bg-slate-50 border-slate-200 text-slate-600"
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
  const color = safe ? "#10b981" : tight ? "#f59e0b" : "#94a3b8"; 
  const pct = Math.max(4, Math.min(100, (cutoff / 100) * 100));
  
  return (
    <div className="flex flex-col gap-1.5 min-w-[120px] text-right">
      <div className="flex items-center justify-end gap-2">
         <span className="text-xs font-bold tabular-nums" style={{ color: margin >= 0 ? color : '#64748b' }}>
          {margin >= 0 ? '+' : ''}{margin.toFixed(2)}% margin
        </span>
      </div>
      <div className="relative w-full h-1.5 rounded-full bg-slate-100 overflow-hidden">
        <div className="absolute inset-y-0 right-0 rounded-full transition-all duration-700 ease-out" style={{ width: `${pct}%`, backgroundColor: color }} />
      </div>
    </div>
  );
}

function SkeletonCard() {
  return (
    <div className="flex flex-col md:flex-row md:items-center gap-4 bg-white border border-slate-100 rounded-2xl p-5 shadow-sm animate-pulse">
      <div className="flex-1 space-y-3">
        <div className="flex gap-2"><div className="h-5 w-24 bg-slate-100 rounded-md" /><div className="h-5 w-16 bg-slate-100 rounded-md" /></div>
        <div className="h-6 w-3/4 bg-slate-100 rounded-lg" />
        <div className="h-4 w-1/2 bg-slate-100 rounded-md" />
      </div>
      <div className="flex items-center gap-6 mt-4 md:mt-0">
        <div className="space-y-2 text-right"><div className="h-4 w-16 bg-slate-100 rounded-md ml-auto" /><div className="h-2 w-24 bg-slate-100 rounded-full" /></div>
        <div className="h-10 w-10 bg-slate-100 rounded-xl" />
      </div>
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
  
  // Loading State for smooth UX
  const [isCalculating, setIsCalculating] = useState(false);

  const isSpecialCategory = ["EWS", "TFWS", "DEFOPENS", "ORPHAN", "PWDOPENH"].includes(category);
  const meritNum = parseFloat(merit);
  const hasValidMerit = merit.trim() !== "" && !isNaN(meritNum) && meritNum >= 0 && meritNum <= 100;

  // Artificial debounce to show skeleton loaders (makes the tool feel like it's doing heavy lifting)
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
      
      {/* Parameter Form - Clean, card-based layout */}
      <div className="bg-white rounded-3xl p-6 md:p-8 shadow-sm border border-slate-100 space-y-8 relative overflow-hidden">
        
        <div className="flex flex-col md:flex-row gap-6">
          <div className="flex-1">
            <label className="block text-sm font-bold text-slate-700 mb-2">Merit Percentage</label>
            <div className="relative">
              <input
                type="number"
                inputMode="decimal"
                min={0} max={100} step={0.01}
                placeholder="e.g. 82.40"
                value={merit}
                onChange={(e) => setMerit(e.target.value)}
                className="w-full md:w-72 bg-slate-50 border border-slate-200 rounded-2xl px-5 py-4 text-2xl font-bold tabular-nums text-slate-900 placeholder:text-slate-400 focus:bg-white focus:ring-4 focus:ring-indigo-600/10 focus:border-indigo-600 outline-none transition-all"
              />
              <Award className="absolute right-5 top-5 text-slate-400 h-6 w-6" />
            </div>
          </div>

          <div className="flex-1 md:max-w-xs">
            <label className="block text-sm font-bold text-slate-700 mb-2">Category</label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full px-5 py-5 bg-slate-50 border border-slate-200 rounded-2xl text-base font-semibold text-slate-800 focus:bg-white focus:ring-4 focus:ring-indigo-600/10 focus:border-indigo-600 outline-none transition-all appearance-none cursor-pointer"
            >
              {CATEGORY_OPTIONS.map((o) => (
                <option key={o.value} value={o.value}>{o.label}</option>
              ))}
            </select>
          </div>
        </div>

        {!isSpecialCategory && (
          <div className="flex flex-wrap gap-8 pt-6 border-t border-slate-100">
            <div>
              <div className="text-xs font-bold text-slate-500 mb-3 uppercase tracking-wider">Candidature</div>
              <div className="flex flex-wrap gap-2">
                {CANDIDATURE_OPTIONS.map((o) => (
                  <Pill key={o.value} active={candidature === o.value} onClick={() => setCandidature(o.value)}>{o.label}</Pill>
                ))}
              </div>
            </div>
            <div>
              <div className="text-xs font-bold text-slate-500 mb-3 uppercase tracking-wider">Gender</div>
              <div className="flex gap-2">
                {GENDER_OPTIONS.map((o) => (
                  <Pill key={o.value} active={gender === o.value} onClick={() => setGender(o.value)}>{o.label}</Pill>
                ))}
              </div>
            </div>
          </div>
        )}

        <div className="flex flex-wrap gap-8 pt-6 border-t border-slate-100">
          {!isSpecialCategory && (
            <div>
              <div className="text-xs font-bold text-slate-500 mb-3 uppercase tracking-wider">Seat Level</div>
              <div className="flex gap-2">
                {LEVEL_OPTIONS.map((o) => (
                  <Pill key={o.value} active={level === o.value} onClick={() => setLevel(o.value)}>{o.label}</Pill>
                ))}
              </div>
            </div>
          )}
          
          <div>
            <div className="text-xs font-bold text-slate-500 mb-3 uppercase tracking-wider">CAP Round Filter</div>
            <div className="flex gap-2">
              {[1, 2, 3, 4].map((r) => (
                <button
                  key={r}
                  onClick={() => setRound(r)}
                  className={`w-12 h-12 rounded-xl text-sm font-bold transition-all ${
                    round === r
                      ? "bg-slate-900 text-white shadow-md"
                      : "bg-white border border-slate-200 text-slate-600 hover:border-slate-300 hover:bg-slate-50"
                  }`}
                >
                  R{r}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Branch Filter */}
        <details className="group pt-2">
          <summary className="flex items-center gap-2 text-sm font-bold text-slate-600 cursor-pointer hover:text-indigo-600 list-none transition-colors">
            <SlidersHorizontal className="h-4 w-4" />
            Specific Branch Filter
            {branchFilter.size > 0 && (
              <span className="px-2.5 py-0.5 rounded-md bg-indigo-100 text-indigo-700 text-xs font-bold ml-2">
                {branchFilter.size} Selected
              </span>
            )}
            <ChevronDown className="h-4 w-4 ml-auto group-open:hidden" />
            <ChevronUp className="h-4 w-4 ml-auto hidden group-open:block" />
          </summary>
          <div className="mt-4 p-5 bg-slate-50 border border-slate-100 rounded-2xl space-y-4">
            <input
              type="text"
              placeholder="Search specific branches (e.g. Computer Engineering)..."
              value={branchQuery}
              onChange={(e) => setBranchQuery(e.target.value)}
              className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-indigo-600 focus:border-indigo-600 text-slate-800 placeholder:text-slate-400"
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
                        ? "bg-indigo-600 border-indigo-600 text-white shadow-sm"
                        : "bg-white border-slate-200 text-slate-600 hover:border-indigo-300 hover:bg-indigo-50"
                    }`}
                  >
                    {b.name}
                  </button>
                );
              })}
            </div>
            {branchFilter.size > 0 && (
              <button onClick={() => setBranchFilter(new Set())} className="text-xs font-semibold text-slate-500 hover:text-slate-800 flex items-center gap-1 pt-2">
                <X className="h-3 w-3" /> Clear selections
              </button>
            )}
          </div>
        </details>
      </div>

      {/* Results Engine */}
      {!hasValidMerit ? (
        <div className="text-center py-20 px-4">
          <div className="w-16 h-16 bg-white border border-slate-200 rounded-full flex items-center justify-center mx-auto mb-4 shadow-sm">
             <Search className="h-6 w-6 text-slate-400" />
          </div>
          <h3 className="text-xl font-bold text-slate-800 mb-2">Ready to align options</h3>
          <p className="text-sm text-slate-500 max-w-sm mx-auto">Enter your precise merit percentage above to discover polytechnic institutions you qualify for.</p>
        </div>
      ) : isCalculating ? (
        <div className="space-y-4">
          <SkeletonCard />
          <SkeletonCard />
          <SkeletonCard />
        </div>
      ) : results.length === 0 ? (
        <div className="text-center py-20 px-4 bg-white rounded-3xl border border-slate-100 shadow-sm">
          <h3 className="text-xl font-bold text-slate-800 mb-2">No Matches Found</h3>
          <p className="text-sm text-slate-500">Try adjusting your parameters, selecting "Other than Home District", or exploring subsequent CAP rounds.</p>
        </div>
      ) : (
        <div className="space-y-4">
          <div className="flex items-center justify-between text-sm font-semibold text-slate-500 px-2">
            <span><span className="text-slate-900 font-bold text-base">{results.length}</span> eligible branches found</span>
            <span className="bg-white px-3 py-1 rounded-full border border-slate-200 shadow-sm text-xs">Best fit first</span>
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
                  className="group flex flex-col md:flex-row md:items-center gap-4 bg-white border border-slate-200 hover:border-indigo-300 rounded-2xl p-5 shadow-sm hover:shadow-md transition-all duration-200"
                >
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-2.5">
                      <StatusBadge status={college.status} />
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest bg-slate-50 px-2 py-0.5 rounded border border-slate-100">Code: {college.code}</span>
                    </div>
                    <h3 className="text-lg font-bold text-slate-900 leading-tight group-hover:text-indigo-700 transition-colors">{college.name}</h3>
                    <div className="text-sm font-medium text-slate-500 flex items-center gap-2 mt-2">
                      <GraduationCap className="h-4 w-4 text-slate-400" /> {branchName}
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between md:justify-end gap-6 pt-4 md:pt-0 border-t md:border-none border-slate-100 mt-2 md:mt-0">
                    <div className="text-right flex flex-col items-end">
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Historical Cutoff</span>
                      <span className="text-lg font-black text-slate-800 tabular-nums leading-none mb-2">{r.merit.toFixed(2)}%</span>
                      <MarginBar merit={meritNum} cutoff={r.merit} />
                    </div>

                    <button
                      onClick={() => toggleShortlist(key)}
                      className={`shrink-0 p-3.5 rounded-xl border transition-all duration-200 ${
                        starred 
                          ? "bg-indigo-50 border-indigo-200 text-indigo-600 shadow-sm" 
                          : "bg-white border-slate-200 text-slate-400 hover:border-indigo-300 hover:text-indigo-600 hover:bg-indigo-50"
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
              className="w-full py-4 rounded-2xl bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 hover:text-slate-900 transition-colors text-sm font-bold flex items-center justify-center gap-2 shadow-sm mt-6"
            >
              Load Additional Options <ArrowRight className="h-4 w-4" />
            </button>
          )}
        </div>
      )}
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
      
      <div className="hidden print:block mb-8 border-b-2 border-black pb-4">
        <h1 className="text-3xl font-bold text-black">DTE Option Form Choices</h1>
        <p className="text-sm font-medium text-slate-500 mt-1">Generated via MahaPoly System</p>
      </div>

      <div className="bg-white rounded-3xl p-6 md:p-8 shadow-sm border border-slate-100 print:bg-transparent print:border-none print:shadow-none print:p-0">
        
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6 mb-8 print:hidden">
          <div>
            <h2 className="text-2xl font-bold text-slate-900">Staged Option Form</h2>
            <p className="text-sm text-slate-500 mt-1">Review and order your selected branches before official submission.</p>
          </div>

          <div className="flex gap-3 w-full sm:w-auto">
            <button
              onClick={handleShare}
              disabled={shortlist.size === 0}
              className="flex-1 sm:flex-none px-5 py-2.5 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 font-bold text-sm rounded-xl flex items-center justify-center gap-2 transition-all disabled:opacity-50 shadow-sm"
            >
              {copied ? <Check size={18} className="text-emerald-500" /> : <Share2 size={18} />} Share List
            </button>
            <button
              onClick={() => window.print()}
              disabled={shortlist.size === 0}
              className="flex-1 sm:flex-none px-5 py-2.5 bg-indigo-600 text-white hover:bg-indigo-700 font-bold text-sm rounded-xl flex items-center justify-center gap-2 transition-all disabled:opacity-50 shadow-sm shadow-indigo-600/20"
            >
              <Printer size={18} /> Print Form
            </button>
          </div>
        </div>

        {shortlist.size === 0 ? (
          <div className="py-20 text-center border-2 border-dashed border-slate-200 rounded-2xl bg-slate-50">
            <Star className="h-8 w-8 text-slate-300 mx-auto mb-3" />
            <p className="text-lg font-bold text-slate-600 mb-1">Your list is empty</p>
            <p className="text-sm text-slate-500">Return to the search tab and click the star icon to stage your choices here.</p>
          </div>
        ) : (
          <div className="overflow-x-auto rounded-2xl border border-slate-200 print:border-slate-400">
            <table className="w-full text-left print:text-black">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-xs tracking-wider uppercase font-bold text-slate-500 print:bg-slate-100 print:border-slate-400 print:text-slate-800">
                  <th className="px-5 py-4 text-center w-16">Pref</th>
                  <th className="px-5 py-4 w-28">Inst. Code</th>
                  <th className="px-5 py-4">Institution Name</th>
                  <th className="px-5 py-4">Branch</th>
                  <th className="px-5 py-4 text-right w-24">Cutoff</th>
                  <th className="px-5 py-4 text-center w-16 print:hidden"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 print:divide-slate-300">
                {rows.map((item, index) => (
                  <tr key={item.key} className="hover:bg-slate-50 transition-colors print:bg-transparent">
                    <td className="px-5 py-4 font-black text-indigo-600 text-center print:text-slate-900">{index + 1}</td>
                    <td className="px-5 py-4 font-mono font-medium text-slate-500 print:text-slate-700">{item.code}</td>
                    <td className="px-5 py-4 font-bold text-slate-800 print:text-slate-900">{item.name}</td>
                    <td className="px-5 py-4 font-medium text-slate-600 print:text-slate-800">{item.branch}</td>
                    <td className="px-5 py-4 font-bold text-right text-slate-800 tabular-nums print:text-slate-900">{item.merit.toFixed(2)}%</td>
                    <td className="px-5 py-4 text-center print:hidden">
                      <button onClick={() => toggleShortlist(item.key)} className="text-slate-400 hover:text-red-500 p-2 rounded-lg hover:bg-red-50 transition-colors">
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

// ---------- Onboarding Tutorial Overlay ----------

function TutorialModal({ onClose }: { onClose: () => void }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-in fade-in duration-300">
      <div className="bg-white rounded-3xl p-8 max-w-md w-full shadow-2xl relative">
        <button onClick={onClose} className="absolute top-6 right-6 text-slate-400 hover:text-slate-600 bg-slate-100 rounded-full p-1.5 transition-colors">
          <X size={20} />
        </button>
        
        <div className="w-12 h-12 bg-indigo-100 rounded-2xl flex items-center justify-center mb-6">
          <Search className="h-6 w-6 text-indigo-600" />
        </div>
        
        <h2 className="text-2xl font-bold text-slate-900 mb-2">Welcome to MahaPoly</h2>
        <p className="text-slate-500 text-sm mb-8 leading-relaxed">Your data-driven portal for identifying polytechnic admissions based on real historical cutoffs.</p>
        
        <div className="space-y-6 mb-8">
          <div className="flex gap-4">
            <div className="flex-shrink-0 w-8 h-8 rounded-full bg-slate-100 text-slate-600 font-bold flex items-center justify-center text-sm">1</div>
            <div>
              <h4 className="font-bold text-slate-800 text-sm">Enter Parameters</h4>
              <p className="text-xs text-slate-500 mt-1">Input your expected merit percentage and category.</p>
            </div>
          </div>
          <div className="flex gap-4">
            <div className="flex-shrink-0 w-8 h-8 rounded-full bg-slate-100 text-slate-600 font-bold flex items-center justify-center text-sm">2</div>
            <div>
              <h4 className="font-bold text-slate-800 text-sm">Review Matches</h4>
              <p className="text-xs text-slate-500 mt-1">The system automatically ranks options by probability and margin.</p>
            </div>
          </div>
          <div className="flex gap-4">
            <div className="flex-shrink-0 w-8 h-8 rounded-full bg-indigo-50 text-indigo-600 font-bold flex items-center justify-center text-sm"><Star size={14} className="fill-current"/></div>
            <div>
              <h4 className="font-bold text-slate-800 text-sm">Stage the Form</h4>
              <p className="text-xs text-slate-500 mt-1">Star the branches you want. They sync directly to a printable DTE Option Form.</p>
            </div>
          </div>
        </div>
        
        <button onClick={onClose} className="w-full py-3.5 bg-slate-900 text-white rounded-xl font-bold text-sm hover:bg-slate-800 transition-colors shadow-md">
          Start Exploring
        </button>
      </div>
    </div>
  );
}

// ---------- Root Shell ----------

export default function PolytechnicDashboard() {
  const [mode, setMode] = useState<"match" | "option-form">("match");
  const [shortlist, setShortlist] = useState<Set<string>>(new Set());
  const [showTutorial, setShowTutorial] = useState(false);

  useEffect(() => {
    // Check local storage for shortlist and tutorial state
    try {
      const savedList = localStorage.getItem("mahapoly-shortlist");
      if (savedList) setShortlist(new Set(JSON.parse(savedList)));
      
      const hasSeenTutorial = localStorage.getItem("mahapoly-tutorial-seen");
      if (!hasSeenTutorial) {
        setShowTutorial(true);
      }
    } catch {}
  }, []);

  const dismissTutorial = () => {
    setShowTutorial(false);
    localStorage.setItem("mahapoly-tutorial-seen", "true");
  };

  const toggleShortlist = (key: string) => {
    setShortlist((prev) => {
      const next = new Set(prev);
      next.has(key) ? next.delete(key) : next.add(key);
      try { localStorage.setItem("mahapoly-shortlist", JSON.stringify(Array.from(next))); } catch {}
      return next;
    });
  };

  return (
    <div className="min-h-screen bg-[#f8fafc] text-slate-900 font-sans selection:bg-indigo-100">
      
      {showTutorial && <TutorialModal onClose={dismissTutorial} />}

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10 md:py-16 space-y-10 print:p-0">
        
        {/* Clean Header */}
        <header className="flex flex-col md:flex-row md:items-end justify-between gap-6 print:hidden">
          <div className="space-y-3">
            <div className="inline-flex items-center gap-2 text-xs font-bold tracking-widest text-indigo-600 uppercase">
              <MapPin size={14} /> Maharashtra DTE Portal
            </div>
            <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight text-slate-900">
              MahaPoly
            </h1>
            <p className="text-slate-500 text-sm font-medium max-w-md">
              Intelligent cutoff aggregation across {DATA.colleges.length} state institutions.
            </p>
          </div>

          {/* Segmented Control - Native App Style */}
          <div className="flex bg-slate-200/50 p-1.5 rounded-2xl w-fit border border-slate-200 shadow-inner">
            <button
              onClick={() => setMode("match")}
              className={`px-6 py-2.5 rounded-xl text-sm font-bold transition-all duration-200 ${
                mode === "match" ? "bg-white text-slate-900 shadow-sm" : "text-slate-500 hover:text-slate-700"
              }`}
            >
              Search Engine
            </button>
            <button
              onClick={() => setMode("option-form")}
              className={`px-6 py-2.5 rounded-xl text-sm font-bold transition-all duration-200 flex items-center gap-2 ${
                mode === "option-form" ? "bg-white text-slate-900 shadow-sm" : "text-slate-500 hover:text-slate-700"
              }`}
            >
              <Star size={16} className={shortlist.size > 0 ? "fill-indigo-500 text-indigo-500" : ""} />
              Staged Form {shortlist.size > 0 && <span className="bg-indigo-100 text-indigo-700 px-1.5 py-0.5 rounded-md text-[10px] leading-none">{shortlist.size}</span>}
            </button>
          </div>
        </header>

        {/* View Router */}
        {mode === "match" && <MatchMode shortlist={shortlist} toggleShortlist={toggleShortlist} />}
        {mode === "option-form" && <OptionFormMode shortlist={shortlist} toggleShortlist={toggleShortlist} />}
        
      </div>
    </div>
  );
}