import raw from "../data.json";
import { decodeSeat, resolveSeatCodes, type Candidature, type Gender, type Level } from "./seatTypes";

// ---------------------------------------------------------------------------
// Raw data shape (dictionary-encoded to keep the bundle small)
// ---------------------------------------------------------------------------

type RawCutoff = [number, number, number, number]; // [capRound, seatTypeIdx, stageIdx, meritPercentage]
type RawCourse = [number, RawCutoff[]]; // [branchIdx, cutoffs]
type RawCollege = { code: string; name: string; status: string; courses: RawCourse[] };
type RawData = { branches: string[]; seatTypes: string[]; stages: string[]; colleges: RawCollege[] };

export const DATA = raw as unknown as RawData;

export type FlatRow = { ci: number; branch: number; round: number; seat: number; stage: number; merit: number };

export const FLAT: FlatRow[] = (() => {
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

export const BRANCH_LIST = DATA.branches
  .map((name, idx) => ({ idx, name }))
  .sort((a, b) => a.name.localeCompare(b.name));

export const SEAT_INDEX = new Map<string, number>(DATA.seatTypes.map((s, i) => [s, i]));
export const STAGE_I_IDX = DATA.stages.indexOf("Stage-I");

// ---------------------------------------------------------------------------
// Heuristics for fields the source data doesn't actually have.
//
// The dataset has no verified district/region field and no official DTE
// "choice code" per college-branch. Rather than fabricate that data (which
// would be actively misleading for a real admission decision), we derive a
// best-effort location string from the college name and are explicit in the
// UI that it's a text guess, not a verified field.
// ---------------------------------------------------------------------------

export type CollegeType = "government" | "aided" | "unaided";

export function classifyCollegeType(status: string): CollegeType {
  const s = status.toLowerCase();
  if (s.includes("government") && !s.includes("aided")) return "government";
  if (s.includes("government") && s.includes("aided")) return "aided";
  return "unaided";
}

export function guessLocation(name: string): string | null {
  const parts = name.split(",");
  if (parts.length < 2) return null;
  return parts[parts.length - 1].trim();
}

export const COLLEGE_TYPE_LABEL: Record<CollegeType, string> = {
  government: "Government",
  aided: "Government Aided",
  unaided: "Un-Aided / Private",
};

// ---------------------------------------------------------------------------
// Profile — what the onboarding wizard collects
// ---------------------------------------------------------------------------

export interface Profile {
  merit: number;
  category: string;
  candidature: Candidature;
  gender: Gender;
  levels: Level[]; // kept plural — DTE assigns Home/Other/State per college per application, so we check all by default
  instituteTypes: CollegeType[];
  branches: number[]; // branch indices, empty = all
  regionQuery: string; // best-effort text match against guessed location
}

export const DEFAULT_PROFILE: Profile = {
  merit: 0,
  category: "OPEN",
  candidature: "N",
  gender: "G",
  levels: ["H", "O", "S"],
  instituteTypes: ["government", "aided", "unaided"],
  branches: [],
  regionQuery: "",
};

const PROFILE_KEY = "mahapoly-profile-v1";

export function saveProfile(p: Profile) {
  try {
    localStorage.setItem(PROFILE_KEY, JSON.stringify(p));
  } catch {}
}

export function loadProfile(): Profile | null {
  try {
    const saved = localStorage.getItem(PROFILE_KEY);
    if (saved) return JSON.parse(saved);
  } catch {}
  return null;
}

// ---------------------------------------------------------------------------
// Match classification — Safe / Competitive / Aspirational
//
// Unlike a strict "eligible only" filter, this intentionally also surfaces
// branches whose cutoff sits just above the student's merit: cutoffs often
// drop in later CAP rounds and spot admission, so a near-miss is still
// useful information. Classification is fixed to CAP Round 1 cutoffs, since
// that's what the onboarding flow collects (no round selector).
// ---------------------------------------------------------------------------

export type MatchBucket = "safe" | "competitive" | "aspirational";

export interface MatchResult {
  ci: number;
  branch: number;
  cutoff: number;
  margin: number; // merit - cutoff
  bucket: MatchBucket;
  supplementary: boolean;
  level?: Level;
  seatCode: string;
  round: number;
}

const ASPIRATIONAL_CEILING = 15; // don't surface branches more than this far out of reach

export function classifyMargin(margin: number): MatchBucket {
  if (margin > 2) return "safe";
  if (margin >= -2) return "competitive";
  return "aspirational";
}

export function computeMatches(profile: Profile): MatchResult[] {
  const isSpecial = ["EWS", "TFWS", "DEFOPENS", "ORPHAN", "PWDOPENH"].includes(profile.category);
  const levels = isSpecial ? (["H"] as Level[]) : profile.levels;
  const codes = resolveSeatCodes({
    category: profile.category,
    candidature: profile.candidature,
    gender: profile.gender,
    levels,
  });
  const seatMeta = new Map<number, string>();
  codes.forEach((c) => {
    const idx = SEAT_INDEX.get(c);
    if (idx !== undefined) seatMeta.set(idx, c);
  });
  if (seatMeta.size === 0) return [];

  const branchFilterSet = profile.branches.length > 0 ? new Set(profile.branches) : null;
  const typeFilterSet = new Set(profile.instituteTypes);
  const regionQ = profile.regionQuery.trim().toLowerCase();

  // Best row per (college, branch): the cutoff closest to the student's
  // merit, preferring the primary Stage-I record over a supplementary
  // vacant-seat stage when both are within range.
  const best = new Map<string, { row: FlatRow; supplementary: boolean }>();

  for (const row of FLAT) {
    if (row.round !== 1) continue;
    if (!seatMeta.has(row.seat)) continue;
    if (branchFilterSet && !branchFilterSet.has(row.branch)) continue;

    const college = DATA.colleges[row.ci];
    if (!typeFilterSet.has(classifyCollegeType(college.status))) continue;
    if (regionQ) {
      const loc = guessLocation(college.name);
      const haystack = `${college.name} ${loc ?? ""}`.toLowerCase();
      if (!haystack.includes(regionQ)) continue;
    }

    const margin = profile.merit - row.merit;
    if (margin < -ASPIRATIONAL_CEILING) continue; // too far out of reach to be useful

    const key = `${row.ci}-${row.branch}`;
    const supplementary = row.stage !== STAGE_I_IDX;
    const existing = best.get(key);
    if (!existing) {
      best.set(key, { row, supplementary });
      continue;
    }
    // Prefer Stage-I; among equal-priority candidates, prefer the one whose
    // cutoff is closer to the student's merit (most representative match).
    const existingPriority = existing.supplementary ? 0 : 1;
    const candidatePriority = supplementary ? 0 : 1;
    if (candidatePriority > existingPriority) {
      best.set(key, { row, supplementary });
    } else if (candidatePriority === existingPriority) {
      const existingDist = Math.abs(profile.merit - existing.row.merit);
      const candidateDist = Math.abs(profile.merit - row.merit);
      if (candidateDist < existingDist) best.set(key, { row, supplementary });
    }
  }

  const results: MatchResult[] = [];
  for (const { row, supplementary } of best.values()) {
    const decoded = decodeSeat(seatMeta.get(row.seat) ?? DATA.seatTypes[row.seat]);
    const margin = profile.merit - row.merit;
    results.push({
      ci: row.ci,
      branch: row.branch,
      cutoff: row.merit,
      margin,
      bucket: classifyMargin(margin),
      supplementary,
      level: decoded.level,
      seatCode: decoded.code,
      round: row.round,
    });
  }

  // Best matches first: safe/competitive sorted by tightest margin (most
  // selective still-comfortable option first), aspirational by closest reach.
  results.sort((a, b) => {
    const order: Record<MatchBucket, number> = { safe: 0, competitive: 0, aspirational: 1 };
    if (order[a.bucket] !== order[b.bucket]) return order[a.bucket] - order[b.bucket];
    return b.cutoff - a.cutoff;
  });

  return results;
}
