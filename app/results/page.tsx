"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import {
  Building2,
  ChevronDown,
  Search,
  Sparkles,
  Star,
  MapPin,
  GraduationCap,
  ShieldCheck,
  Scale,
  TrendingUp,
} from "lucide-react";
import { TopNav, CheckPill, BucketBadge, MarginBadge, CollegeTypeTag, bucketMeta } from "../../components/ui";
import {
  DATA,
  BRANCH_LIST,
  computeMatches,
  loadProfile,
  classifyCollegeType,
  guessLocation,
  COLLEGE_TYPE_LABEL,
  type Profile,
  type MatchBucket,
  type MatchResult,
  type CollegeType,
} from "../../lib/data";
import { decodeSeat } from "../../lib/seatTypes";
import { loadShortlist, saveShortlist, type ShortlistEntry } from "../../lib/shortlist";

export default function ResultsPage() {
  const router = useRouter();
  const [profile, setProfile] = useState<Profile | null | undefined>(undefined);
  const [shortlist, setShortlist] = useState<ShortlistEntry[]>([]);
  const [districtQuery, setDistrictQuery] = useState("");
  const [typeFilter, setTypeFilter] = useState<Set<CollegeType>>(new Set());
  const [branchFilter, setBranchFilter] = useState<Set<number>>(new Set());
  const [branchSearch, setBranchSearch] = useState("");
  const [expanded, setExpanded] = useState<string | null>(null);
  const [visible, setVisible] = useState(20);

  useEffect(() => {
    const p = loadProfile();
    setProfile(p);
    if (p) {
      setTypeFilter(new Set(p.instituteTypes));
      setDistrictQuery(p.regionQuery);
    }
    setShortlist(loadShortlist());
  }, []);

  const shortlistKeys = useMemo(() => new Set(shortlist.map((e) => e.key)), [shortlist]);

  const toggleShortlist = (entry: ShortlistEntry) => {
    setShortlist((prev) => {
      const exists = prev.some((e) => e.key === entry.key);
      const next = exists ? prev.filter((e) => e.key !== entry.key) : [...prev, entry];
      saveShortlist(next);
      return next;
    });
  };

  const effectiveProfile: Profile | null = useMemo(() => {
    if (!profile) return null;
    return {
      ...profile,
      instituteTypes: typeFilter.size > 0 ? Array.from(typeFilter) : profile.instituteTypes,
      branches: branchFilter.size > 0 ? Array.from(branchFilter) : [],
      regionQuery: districtQuery,
    };
  }, [profile, typeFilter, branchFilter, districtQuery]);

  const allMatches = useMemo(() => (effectiveProfile ? computeMatches(effectiveProfile) : []), [effectiveProfile]);

  const counts = useMemo(() => {
    const c: Record<MatchBucket, number> = { safe: 0, competitive: 0, aspirational: 0 };
    allMatches.forEach((m) => c[m.bucket]++);
    return c;
  }, [allMatches]);

  const filteredBranchList = branchSearch
    ? BRANCH_LIST.filter((b) => b.name.toLowerCase().includes(branchSearch.toLowerCase()))
    : BRANCH_LIST;

  const resetFilters = () => {
    setDistrictQuery("");
    setTypeFilter(new Set());
    setBranchFilter(new Set());
  };

  if (profile === undefined) return null;

  if (profile === null) {
    return (
      <div className="min-h-screen bg-[#f8fafc]">
        <TopNav />
        <div className="max-w-xl mx-auto text-center py-24 px-6">
          <Sparkles className="h-6 w-6 mx-auto mb-4 text-[#0058be]" />
          <h1 className="text-2xl font-semibold text-[#191b23] mb-2">Let's build your profile first</h1>
          <p className="text-[#424754] mb-6">
            We need your merit percentage and category to show you real matches from CAP cutoff data.
          </p>
          <button
            onClick={() => router.push("/onboarding")}
            className="px-6 py-3 rounded-lg text-sm font-medium text-white bg-[#0058be] hover:brightness-110 transition-all"
          >
            Start my profile
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f8fafc]">
      <TopNav />
      <main className="max-w-[1280px] mx-auto px-4 md:px-6 py-8 md:py-10 space-y-8">
        {/* Summary header */}
        <div className="space-y-4">
          <div className="flex items-end justify-between flex-wrap gap-4">
            <div>
              <h1 className="text-2xl md:text-3xl font-semibold tracking-tight text-[#191b23]">
                Here are your best matches
              </h1>
              <p className="mt-1 text-[#424754]">
                Based on your profile and CAP Round 1 cutoff data.{" "}
                <button onClick={() => router.push("/onboarding")} className="text-[#0058be] font-medium hover:underline">
                  Edit profile
                </button>
              </p>
            </div>
            <div className="bg-white border border-[#e2e8f0] rounded-xl px-6 py-4 flex items-center gap-4 shadow-sm">
              <div className="w-11 h-11 rounded-full bg-[#8455ef] text-white flex items-center justify-center shrink-0">
                <TrendingUp className="h-4.5 w-4.5" />
              </div>
              <div>
                <div className="text-xs font-semibold tracking-wide text-[#424754] uppercase">Your Merit Score</div>
                <div className="text-2xl font-semibold text-[#6b38d4] tabular-nums">{profile.merit.toFixed(2)}%</div>
              </div>
            </div>
          </div>

          {/* Stat buckets */}
          <div className="grid sm:grid-cols-3 gap-4">
            {(
              [
                ["safe", ShieldCheck, `Matches > 2% below merit`],
                ["competitive", Scale, `Matches within ±2% margin`],
                ["aspirational", TrendingUp, `Matches > 2% above merit`],
              ] as [MatchBucket, typeof ShieldCheck, string][]
            ).map(([bucket, Icon, sub]) => {
              const m = bucketMeta(bucket);
              return (
                <div
                  key={bucket}
                  className="bg-white rounded-xl border-t border-r border-b flex items-center gap-4 pl-5 pr-4 py-4 shadow-sm"
                  style={{ borderLeftWidth: 4, borderLeftColor: m.border, borderColor: "#e2e8f0" }}
                >
                  <div
                    className="w-11 h-11 rounded-full flex items-center justify-center shrink-0"
                    style={{ backgroundColor: m.bg }}
                  >
                    <Icon className="h-5 w-5" style={{ color: m.text }} />
                  </div>
                  <div>
                    <div className="text-xl font-semibold text-[#191b23] tabular-nums">
                      {counts[bucket]} {bucket === "safe" ? "Safe" : bucket === "competitive" ? "Competitive" : "Aspirational"}
                    </div>
                    <div className="text-xs font-semibold text-[#424754]">{sub}</div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div className="flex flex-col lg:flex-row gap-10">
          {/* Sidebar filters */}
          <aside className="w-full lg:w-64 shrink-0">
            <div className="bg-white border border-[#e2e8f0] rounded-xl p-6 space-y-6 shadow-sm lg:sticky lg:top-24">
              <div className="flex items-center justify-between pb-4 border-b border-[#c2c6d6]/60">
                <h2 className="text-lg font-semibold text-[#191b23]">Filters</h2>
                <button onClick={resetFilters} className="text-xs font-semibold text-[#0058be] hover:underline">
                  Reset
                </button>
              </div>

              <div className="space-y-2">
                <h3 className="text-sm font-medium text-[#424754]">District / City</h3>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-[#727785]" />
                  <input
                    type="text"
                    placeholder="Search districts..."
                    value={districtQuery}
                    onChange={(e) => setDistrictQuery(e.target.value)}
                    className="w-full pl-9 pr-3 py-2.5 bg-white border border-[#c2c6d6] rounded-lg text-sm outline-none focus:border-[#0058be]"
                  />
                </div>
                <p className="text-[11px] text-[#9aa0ae]">Best-effort text match, not verified district data.</p>
              </div>

              <div className="space-y-2">
                <h3 className="text-sm font-medium text-[#424754]">College Type</h3>
                <div className="flex flex-wrap gap-2">
                  {(["government", "aided", "unaided"] as CollegeType[]).map((t) => (
                    <CheckPill
                      key={t}
                      active={typeFilter.size === 0 || typeFilter.has(t)}
                      onClick={() =>
                        setTypeFilter((prev) => {
                          const allOn = prev.size === 0;
                          const base = allOn ? new Set<CollegeType>(["government", "aided", "unaided"]) : new Set(prev);
                          base.has(t) ? base.delete(t) : base.add(t);
                          return base;
                        })
                      }
                    >
                      {COLLEGE_TYPE_LABEL[t]}
                    </CheckPill>
                  ))}
                </div>
              </div>

              <div className="space-y-2">
                <h3 className="text-sm font-medium text-[#424754]">Branch Preference</h3>
                <input
                  type="text"
                  placeholder="Search branches..."
                  value={branchSearch}
                  onChange={(e) => setBranchSearch(e.target.value)}
                  className="w-full px-3 py-2 bg-white border border-[#c2c6d6] rounded-lg text-sm outline-none focus:border-[#0058be]"
                />
                <div className="max-h-40 overflow-y-auto space-y-1.5 pt-1">
                  {filteredBranchList.slice(0, 40).map((b) => (
                    <label key={b.idx} className="flex items-center gap-2 text-sm text-[#191b23] cursor-pointer">
                      <input
                        type="checkbox"
                        checked={branchFilter.has(b.idx)}
                        onChange={() => {
                          const next = new Set(branchFilter);
                          next.has(b.idx) ? next.delete(b.idx) : next.add(b.idx);
                          setBranchFilter(next);
                        }}
                        className="rounded border-[#727785] text-[#0058be] focus:ring-[#0058be]/30"
                      />
                      {b.name}
                    </label>
                  ))}
                </div>
              </div>
            </div>
          </aside>

          {/* Results feed */}
          <div className="flex-1 min-w-0 space-y-4">
            <div className="flex items-center justify-between bg-[#f2f3fd] border border-[#c2c6d6]/30 rounded-lg px-3 py-2">
              <span className="text-xs font-semibold text-[#424754] pl-2">
                Showing {Math.min(visible, allMatches.length)} of {allMatches.length} matches
              </span>
            </div>

            {allMatches.length === 0 ? (
              <div className="text-center py-20 text-[#424754]">
                <p className="font-medium mb-1">No matches for these filters.</p>
                <p className="text-sm">Try widening your district, branch, or institute type filters.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {allMatches.slice(0, visible).map((m) => (
                  <ResultCard
                    key={`${m.ci}-${m.branch}`}
                    match={m}
                    merit={profile.merit}
                    expanded={expanded === `${m.ci}-${m.branch}`}
                    onToggleExpand={() =>
                      setExpanded(expanded === `${m.ci}-${m.branch}` ? null : `${m.ci}-${m.branch}`)
                    }
                    starred={shortlistKeys.has(`${m.ci}-${m.branch}-${m.round}-${m.seatCode}`)}
                    onStar={() =>
                      toggleShortlist({
                        key: `${m.ci}-${m.branch}-${m.round}-${m.seatCode}`,
                        ci: m.ci,
                        branch: m.branch,
                        round: m.round,
                        seatCode: m.seatCode,
                        cutoff: m.cutoff,
                        supplementary: m.supplementary,
                      })
                    }
                  />
                ))}
              </div>
            )}

            {visible < allMatches.length && (
              <button
                onClick={() => setVisible((v) => v + 20)}
                className="w-full py-3 rounded-xl border border-[#e2e8f0] bg-white text-[#424754] hover:border-[#c2c6d6] transition-colors text-sm font-medium"
              >
                Show more
              </button>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}

function ResultCard({
  match,
  merit,
  expanded,
  onToggleExpand,
  starred,
  onStar,
}: {
  match: MatchResult;
  merit: number;
  expanded: boolean;
  onToggleExpand: () => void;
  starred: boolean;
  onStar: () => void;
}) {
  const college = DATA.colleges[match.ci];
  const branch = DATA.branches[match.branch];
  const type = classifyCollegeType(college.status);
  const location = guessLocation(college.name);
  const decoded = decodeSeat(match.seatCode);

  return (
    <article className="bg-white border border-[#e2e8f0] rounded-xl shadow-sm overflow-hidden">
      <div className="p-6 space-y-4">
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-start gap-4 min-w-0">
            <div className="w-12 h-12 rounded-lg bg-[#ecedf7] border border-[#c2c6d6]/50 flex items-center justify-center shrink-0">
              <Building2 className="h-5 w-5 text-[#0058be]" />
            </div>
            <div className="min-w-0">
              <h3 className="text-[20px] font-semibold text-[#001a42] truncate">{college.name}</h3>
              {location && (
                <div className="flex items-center gap-1 text-[#424754] mt-0.5">
                  <MapPin className="h-3.5 w-3.5 shrink-0" />
                  <span className="text-sm">{location}</span>
                </div>
              )}
            </div>
          </div>
          <div className="flex flex-col items-end gap-2 shrink-0">
            <BucketBadge bucket={match.bucket} />
            <button onClick={onStar} aria-label="Shortlist">
              <Star className={`h-5 w-5 ${starred ? "fill-[#FBBF24] text-[#FBBF24]" : "text-[#c2c6d6] hover:text-[#9aa0ae]"}`} />
            </button>
          </div>
        </div>

        <div className="border-t border-[#c2c6d6]/50" />

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div>
            <div className="text-xs font-semibold tracking-wide text-[#424754] uppercase mb-1">Branch</div>
            <div className="text-[15px] font-medium text-[#191b23]">{branch}</div>
          </div>
          <div>
            <div className="text-xs font-semibold tracking-wide text-[#424754] uppercase mb-1">Type</div>
            <CollegeTypeTag type={type} />
          </div>
          <div>
            <div className="text-xs font-semibold tracking-wide text-[#424754] uppercase mb-1">Historical Cut-off</div>
            <div className="text-[15px] font-medium text-[#191b23] tabular-nums">{match.cutoff.toFixed(2)}%</div>
          </div>
          <div className="text-right md:text-left">
            <div className="text-xs font-semibold tracking-wide text-[#424754] uppercase mb-1">Merit Difference</div>
            <MarginBadge margin={match.margin} />
          </div>
        </div>

        <button
          onClick={onToggleExpand}
          className="flex items-center gap-1.5 text-sm font-medium text-[#0058be] hover:underline pt-1"
        >
          <ChevronDown className={`h-3.5 w-3.5 transition-transform ${expanded ? "rotate-180" : ""}`} />
          Why this matches
        </button>

        {expanded && (
          <div className="rounded-lg bg-[#f8fafc] border border-[#e2e8f0] p-4 text-sm text-[#424754] space-y-1.5">
            <p>
              Your merit ({merit.toFixed(2)}%) is{" "}
              <span className="font-semibold text-[#191b23]">
                {match.margin >= 0 ? `${match.margin.toFixed(2)}% above` : `${Math.abs(match.margin).toFixed(2)}% below`}
              </span>{" "}
              this branch's CAP Round 1 cutoff for <span className="font-medium">{decoded.label}</span>.
            </p>
            {match.supplementary && (
              <p className="text-[#b45309]">
                This cutoff came from a supplementary / vacant-seat stage, not the primary allotment list — treat it
                as less certain than a Stage-I figure.
              </p>
            )}
            <p className="text-[#9aa0ae]">
              Reference: College #{college.code}. Verify the official DTE choice code and current-year cutoffs on
              your CAP login before submitting your option form.
            </p>
          </div>
        )}
      </div>
    </article>
  );
}
