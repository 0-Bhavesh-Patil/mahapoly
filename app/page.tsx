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

// ---------- Data layer ----------
// `raw` is dictionary-encoded to keep the client bundle small:
// raw.branches[i], raw.seatTypes[i], raw.stages[i] are lookup tables.
// Each college's courses are [branchIdx, cutoffs[]] where cutoffs are
// [capRound, seatTypeIdx, stageIdx, meritPercentage] tuples.

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

// ---------- Small UI atoms ----------

function Pill({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      onClick={onClick}
      className={`px-3 py-1.5 rounded-lg text-sm font-medium border transition-colors ${
        active
          ? "bg-[#7C3AED] border-[#7C3AED] text-white"
          : "bg-transparent border-[#232329] text-[#8B8B94] hover:border-[#3a3a42] hover:text-[#F2F2F4]"
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
      className={`px-2 py-0.5 text-[11px] font-semibold rounded-md tracking-wide ${
        isGovt ? "bg-[#00D9FF]/10 text-[#00D9FF]" : "bg-[#232329] text-[#8B8B94]"
      }`}
    >
      {status}
    </span>
  );
}

// Visualizes how much buffer the student has above the cutoff.
function MarginBar({ merit, cutoff }: { merit: number; cutoff: number }) {
  const margin = merit - cutoff;
  const safe = margin >= 5;
  const tight = margin >= 0 && margin < 5;
  const color = safe ? "#34D399" : tight ? "#FBBF24" : "#8B8B94";
  const pct = Math.max(4, Math.min(100, (cutoff / 100) * 100));
  return (
    <div className="flex items-center gap-2 min-w-[140px]">
      <div className="relative flex-1 h-1.5 rounded-full bg-[#232329] overflow-hidden">
        <div className="absolute inset-y-0 left-0 rounded-full" style={{ width: `${pct}%`, backgroundColor: color }} />
      </div>
      <span className="text-xs font-medium tabular-nums" style={{ color }}>
        +{margin.toFixed(1)}%
      </span>
    </div>
  );
}

// ---------- Match (finder) mode ----------

function MatchMode({
  shortlist,
  toggleShortlist,
}: {
  shortlist: Set<string>;
  toggleShortlist: (key: string) => void;
}) {
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
      if (row.merit > meritNum) continue; // not eligible
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
    <div className="space-y-6">
      {/* Filter panel */}
      <div className="bg-[#121216] border border-[#232329] rounded-2xl p-5 md:p-6 space-y-5">
        <div className="flex flex-col md:flex-row md:items-end gap-4">
          <div className="flex-1">
            <label className="block text-xs font-semibold tracking-wide text-[#8B8B94] mb-1.5 uppercase">
              Your merit percentage
            </label>
            <input
              type="number"
              inputMode="decimal"
              min={0}
              max={100}
              step={0.01}
              placeholder="e.g. 82.40"
              value={merit}
              onChange={(e) => setMerit(e.target.value)}
              className="w-full md:w-56 px-4 py-3 bg-[#08080B] border border-[#232329] rounded-xl text-2xl font-semibold tabular-nums text-[#F2F2F4] placeholder:text-[#4a4a52] focus:border-[#00D9FF] outline-none transition-colors"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold tracking-wide text-[#8B8B94] mb-1.5 uppercase">
              Category
            </label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="px-4 py-3 bg-[#08080B] border border-[#232329] rounded-xl text-[#F2F2F4] outline-none focus:border-[#00D9FF] min-w-[220px]"
            >
              {CATEGORY_OPTIONS.map((o) => (
                <option key={o.value} value={o.value}>
                  {o.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        {!isSpecialCategory && (
          <div className="flex flex-wrap gap-6">
            <div>
              <div className="text-xs font-semibold tracking-wide text-[#8B8B94] mb-1.5 uppercase">Candidature</div>
              <div className="flex gap-2">
                {CANDIDATURE_OPTIONS.map((o) => (
                  <Pill key={o.value} active={candidature === o.value} onClick={() => setCandidature(o.value)}>
                    {o.label}
                  </Pill>
                ))}
              </div>
            </div>
            <div>
              <div className="text-xs font-semibold tracking-wide text-[#8B8B94] mb-1.5 uppercase">Gender</div>
              <div className="flex gap-2">
                {GENDER_OPTIONS.map((o) => (
                  <Pill key={o.value} active={gender === o.value} onClick={() => setGender(o.value)}>
                    {o.label}
                  </Pill>
                ))}
              </div>
            </div>
            <div>
              <div className="text-xs font-semibold tracking-wide text-[#8B8B94] mb-1.5 uppercase">Seat level</div>
              <div className="flex gap-2">
                {LEVEL_OPTIONS.map((o) => (
                  <Pill key={o.value} active={level === o.value} onClick={() => setLevel(o.value)}>
                    {o.label}
                  </Pill>
                ))}
              </div>
            </div>
          </div>
        )}

        <div>
          <div className="text-xs font-semibold tracking-wide text-[#8B8B94] mb-1.5 uppercase">CAP round</div>
          <div className="flex gap-2">
            {[1, 2, 3, 4].map((r) => (
              <button
                key={r}
                onClick={() => setRound(r)}
                className={`w-10 h-10 rounded-lg text-sm font-bold border transition-colors ${
                  round === r
                    ? "bg-[#00D9FF] border-[#00D9FF] text-[#08080B]"
                    : "border-[#232329] text-[#8B8B94] hover:border-[#3a3a42]"
                }`}
              >
                {r}
              </button>
            ))}
          </div>
        </div>

        <details className="group">
          <summary className="flex items-center gap-2 text-sm text-[#8B8B94] cursor-pointer hover:text-[#F2F2F4] list-none">
            <SlidersHorizontal className="h-4 w-4" />
            Filter by branch
            {branchFilter.size > 0 && (
              <span className="px-1.5 py-0.5 rounded bg-[#7C3AED]/20 text-[#7C3AED] text-xs font-semibold">
                {branchFilter.size} selected
              </span>
            )}
            <ChevronDown className="h-4 w-4 ml-auto group-open:hidden" />
            <ChevronUp className="h-4 w-4 ml-auto hidden group-open:block" />
          </summary>
          <div className="mt-3 space-y-2">
            <input
              type="text"
              placeholder="Search branches..."
              value={branchQuery}
              onChange={(e) => setBranchQuery(e.target.value)}
              className="w-full px-3 py-2 bg-[#08080B] border border-[#232329] rounded-lg text-sm outline-none focus:border-[#00D9FF]"
            />
            <div className="flex flex-wrap gap-2 max-h-40 overflow-y-auto pr-1">
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
                    className={`px-2.5 py-1 rounded-md text-xs border transition-colors ${
                      active
                        ? "bg-[#7C3AED]/20 border-[#7C3AED] text-[#7C3AED]"
                        : "border-[#232329] text-[#8B8B94] hover:border-[#3a3a42]"
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
                className="text-xs text-[#8B8B94] hover:text-[#F2F2F4] flex items-center gap-1"
              >
                <X className="h-3 w-3" /> Clear branch filter
              </button>
            )}
          </div>
        </details>
      </div>

      {/* Results */}
      {!hasValidMerit ? (
        <div className="text-center py-16 text-[#8B8B94]">
          <Info className="h-6 w-6 mx-auto mb-3 opacity-50" />
          Enter your merit percentage to see what you qualify for.
        </div>
      ) : results.length === 0 ? (
        <div className="text-center py-16 text-[#8B8B94] space-y-2">
          <div>No matches at this merit, category, and round.</div>
          <div className="text-sm">Try "Other than Home District" or a later CAP round — cutoffs usually drop.</div>
        </div>
      ) : (
        <>
          <div className="flex items-center justify-between text-sm text-[#8B8B94] px-1">
            <span>
              <span className="text-[#F2F2F4] font-semibold tabular-nums">{results.length}</span> eligible branch
              {results.length === 1 ? "" : "es"} across colleges
            </span>
            <span>Sorted by best fit</span>
          </div>
          <div className="space-y-2">
            {results.slice(0, visibleCount).map((r) => {
              const college = DATA.colleges[r.ci];
              const branchName = DATA.branches[r.branch];
              const key = `${r.ci}-${r.branch}-${r.round}-${r.seat}`;
              const starred = shortlist.has(key);
              return (
                <div
                  key={key}
                  className="flex flex-col md:flex-row md:items-center gap-3 md:gap-6 bg-[#121216] border border-[#232329] rounded-xl p-4 hover:border-[#3a3a42] transition-colors"
                >
                  <button
                    onClick={() => toggleShortlist(key)}
                    className="shrink-0 self-start md:self-center"
                    aria-label="Shortlist"
                  >
                    <Star
                      className={`h-5 w-5 ${starred ? "fill-[#FBBF24] text-[#FBBF24]" : "text-[#3a3a42]"}`}
                    />
                  </button>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <StatusBadge status={college.status} />
                      <span className="text-[11px] font-mono text-[#5a5a62]">#{college.code}</span>
                    </div>
                    <div className="font-semibold text-[#F2F2F4] mt-1 truncate">{college.name}</div>
                    <div className="text-sm text-[#8B8B94] flex items-center gap-1.5 mt-0.5">
                      <GraduationCap className="h-3.5 w-3.5" />
                      {branchName}
                    </div>
                  </div>
                  <div className="shrink-0">
                    <MarginBar merit={meritNum} cutoff={r.merit} />
                    <div className="text-[11px] text-[#5a5a62] mt-1">cutoff {r.merit.toFixed(2)}%</div>
                  </div>
                </div>
              );
            })}
          </div>
          {visibleCount < results.length && (
            <button
              onClick={() => setVisibleCount((v) => v + 50)}
              className="w-full py-3 rounded-xl border border-[#232329] text-[#8B8B94] hover:text-[#F2F2F4] hover:border-[#3a3a42] transition-colors text-sm font-medium flex items-center justify-center gap-1.5"
            >
              Show more <ArrowRight className="h-4 w-4" />
            </button>
          )}
        </>
      )}
    </div>
  );
}

// ---------- Browse mode (original search, reskinned + decoded) ----------

function BrowseMode() {
  const [query, setQuery] = useState("");
  const [expandedCourse, setExpandedCourse] = useState<string | null>(null);

  const filtered = useMemo(() => {
    if (!query.trim()) return DATA.colleges.slice(0, 30);
    const q = query.toLowerCase();
    return DATA.colleges.filter((c) => c.name.toLowerCase().includes(q) || c.code.includes(q));
  }, [query]);

  return (
    <div className="space-y-6">
      <div className="flex gap-4 bg-[#121216] p-4 rounded-2xl border border-[#232329]">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-3.5 h-5 w-5 text-[#5a5a62]" />
          <input
            type="text"
            placeholder="Search by college name or code..."
            className="w-full pl-10 pr-4 py-2.5 bg-[#08080B] border border-[#232329] rounded-xl focus:border-[#00D9FF] outline-none transition-colors text-[#F2F2F4] placeholder:text-[#5a5a62]"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
        </div>
      </div>

      {!query.trim() && (
        <div className="text-xs text-[#5a5a62] px-1">Showing first 30 of {DATA.colleges.length} colleges — search to narrow down.</div>
      )}

      <div className="space-y-4">
        {filtered.length === 0 ? (
          <div className="text-center text-[#8B8B94] py-12">No colleges found.</div>
        ) : (
          filtered.map((college) => (
            <div key={college.code} className="bg-[#121216] rounded-2xl border border-[#232329] overflow-hidden">
              <div className="p-5 border-b border-[#232329] flex flex-col gap-2">
                <div className="flex items-center gap-2">
                  <span className="px-2 py-0.5 text-[11px] font-mono bg-[#232329] text-[#8B8B94] rounded-md">
                    #{college.code}
                  </span>
                  <StatusBadge status={college.status} />
                </div>
                <h2 className="text-lg font-bold flex items-center gap-2 text-[#F2F2F4]">
                  <Building2 className="h-5 w-5 text-[#00D9FF]" />
                  {college.name}
                </h2>
              </div>

              <div className="p-4 space-y-2">
                {college.courses.map(([branchIdx, cutoffs], idx) => {
                  const courseId = `${college.code}-${idx}`;
                  const branchName = DATA.branches[branchIdx];
                  const isOpen = expandedCourse === courseId;
                  return (
                    <div key={courseId} className="bg-[#08080B] rounded-xl border border-[#232329] overflow-hidden">
                      <button
                        onClick={() => setExpandedCourse(isOpen ? null : courseId)}
                        className="w-full flex items-center justify-between p-4 hover:bg-[#121216] transition-colors"
                      >
                        <div className="flex items-center gap-3">
                          <GraduationCap className="h-5 w-5 text-[#7C3AED]" />
                          <span className="font-semibold text-left text-[#F2F2F4]">{branchName}</span>
                        </div>
                        {isOpen ? (
                          <ChevronUp className="h-5 w-5 text-[#5a5a62]" />
                        ) : (
                          <ChevronDown className="h-5 w-5 text-[#5a5a62]" />
                        )}
                      </button>

                      {isOpen && (
                        <div className="border-t border-[#232329] overflow-x-auto">
                          <table className="w-full text-sm text-left">
                            <thead className="bg-[#121216] text-[#8B8B94] border-b border-[#232329]">
                              <tr>
                                <th className="px-4 py-2.5 font-semibold">Round</th>
                                <th className="px-4 py-2.5 font-semibold">Seat type</th>
                                <th className="px-4 py-2.5 font-semibold">Stage</th>
                                <th className="px-4 py-2.5 font-semibold text-right">Merit %</th>
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-[#1a1a1f]">
                              {cutoffs
                                .slice()
                                .sort((a, b) => a[0] - b[0] || b[3] - a[3])
                                .map(([round, seatIdx, stageIdx, merit], cIdx) => {
                                  const decoded = decodeSeat(DATA.seatTypes[seatIdx]);
                                  return (
                                    <tr key={cIdx} className="hover:bg-[#121216]/60">
                                      <td className="px-4 py-2.5 font-medium text-[#F2F2F4]">R{round}</td>
                                      <td className="px-4 py-2.5">
                                        <span title={decoded.code} className="cursor-help">
                                          {decoded.label}
                                        </span>
                                      </td>
                                      <td className="px-4 py-2.5 text-[#8B8B94]">{DATA.stages[stageIdx]}</td>
                                      <td className="px-4 py-2.5 font-bold text-right text-[#00D9FF] tabular-nums">
                                        {merit.toFixed(2)}%
                                      </td>
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

// ---------- Root ----------

export default function PolytechnicDashboard() {
  const [mode, setMode] = useState<"match" | "browse">("match");
  const [shortlist, setShortlist] = useState<Set<string>>(new Set());

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
      try {
        localStorage.setItem("mahapoly-shortlist", JSON.stringify(Array.from(next)));
      } catch {}
      return next;
    });
  };

  return (
    <div className="min-h-screen bg-[#08080B] text-[#F2F2F4] font-sans">
      <div className="max-w-4xl mx-auto px-5 md:px-8 py-10 md:py-14 space-y-8">
        {/* Hero */}
        <div className="space-y-3">
          <div className="text-xs font-semibold tracking-widest text-[#00D9FF] uppercase">
            Maharashtra DTE · CAP Cutoffs
          </div>
          <h1 className="text-3xl md:text-4xl font-bold tracking-tight">MahaPoly Search</h1>
          <p className="text-[#8B8B94] max-w-xl">
            Find which polytechnics and branches you qualify for, based on real CAP round cutoffs across{" "}
            {DATA.colleges.length} institutes.
          </p>
        </div>

        {/* Mode toggle */}
        <div className="flex gap-1 bg-[#121216] border border-[#232329] rounded-xl p-1 w-fit">
          <button
            onClick={() => setMode("match")}
            className={`px-4 py-2 rounded-lg text-sm font-semibold transition-colors ${
              mode === "match" ? "bg-[#00D9FF] text-[#08080B]" : "text-[#8B8B94] hover:text-[#F2F2F4]"
            }`}
          >
            Find my colleges
          </button>
          <button
            onClick={() => setMode("browse")}
            className={`px-4 py-2 rounded-lg text-sm font-semibold transition-colors ${
              mode === "browse" ? "bg-[#00D9FF] text-[#08080B]" : "text-[#8B8B94] hover:text-[#F2F2F4]"
            }`}
          >
            Browse all
          </button>
        </div>

        {mode === "match" ? (
          <MatchMode shortlist={shortlist} toggleShortlist={toggleShortlist} />
        ) : (
          <BrowseMode />
        )}
      </div>
    </div>
  );
}
