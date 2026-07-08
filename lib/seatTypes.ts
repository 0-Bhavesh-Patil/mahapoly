// Decodes Maharashtra DTE CAP seat-type codes.
// Legend sourced from official DTE cutoff PDFs:
// T-Technical, N-Non-Technical, G-General, L-Ladies,
// H-Home District, O-Other than Home District, S-State Level,
// PWD-Persons with Disability, DEF-Defence, EWS, TFWS-Tuition Fee Waiver Scheme,
// ORPHAN. Category block: OPEN, SC, ST, OBC, SEBC, NTA/NTB/NTC/NTD (Nomadic Tribes A-D).

export type Candidature = "N" | "T";
export type Gender = "G" | "L";
export type Level = "H" | "O" | "S";

export interface DecodedSeat {
  code: string;
  special: boolean;
  candidature?: Candidature;
  gender?: Gender;
  category: string;
  level?: Level;
  label: string; // short human label, e.g. "Open · General · Home District"
}

const CATEGORY_LABELS: Record<string, string> = {
  OPEN: "Open",
  SC: "SC",
  ST: "ST",
  OBC: "OBC",
  SEBC: "SEBC",
  NTA: "NT-A",
  NTB: "NT-B",
  NTC: "NT-C",
  NTD: "NT-D",
};

const LEVEL_LABELS: Record<Level, string> = {
  H: "Home District",
  O: "Other than Home District",
  S: "State Level",
};

const GENDER_LABELS: Record<Gender, string> = {
  G: "General",
  L: "Ladies",
};

const CANDIDATURE_LABELS: Record<Candidature, string> = {
  N: "Non-Technical",
  T: "Technical",
};

const SPECIAL_LABELS: Record<string, string> = {
  EWS: "EWS",
  TFWS: "Tuition Fee Waiver",
  ORPHAN: "Orphan",
  DEFOPENS: "Defence (State Level)",
  PWDOPENH: "PWD (Home District)",
};

const PATTERN = /^(N|T)(G|L)(OPEN|SC|ST|OBC|SEBC|NTA|NTB|NTC|NTD)(H|O|S)$/;

const cache = new Map<string, DecodedSeat>();

export function decodeSeat(code: string): DecodedSeat {
  const hit = cache.get(code);
  if (hit) return hit;

  let result: DecodedSeat;
  if (code in SPECIAL_LABELS) {
    result = {
      code,
      special: true,
      category: code,
      label: SPECIAL_LABELS[code],
    };
  } else {
    const m = PATTERN.exec(code);
    if (!m) {
      result = { code, special: true, category: code, label: code };
    } else {
      const [, cand, gen, cat, lvl] = m as unknown as [string, Candidature, Gender, string, Level];
      result = {
        code,
        special: false,
        candidature: cand,
        gender: gen,
        category: cat,
        level: lvl,
        label: `${CATEGORY_LABELS[cat]} · ${GENDER_LABELS[gen]} · ${LEVEL_LABELS[lvl]}`,
      };
    }
  }
  cache.set(code, result);
  return result;
}

// Options for the "Match" finder UI — grouped the way a student actually thinks about it.
export const CATEGORY_OPTIONS = [
  { value: "OPEN", label: "Open" },
  { value: "SC", label: "SC" },
  { value: "ST", label: "ST" },
  { value: "OBC", label: "OBC" },
  { value: "SEBC", label: "SEBC" },
  { value: "NTA", label: "NT-A" },
  { value: "NTB", label: "NT-B" },
  { value: "NTC", label: "NT-C" },
  { value: "NTD", label: "NT-D" },
  { value: "EWS", label: "EWS" },
  { value: "TFWS", label: "Tuition Fee Waiver (TFWS)" },
  { value: "DEFOPENS", label: "Defence" },
  { value: "ORPHAN", label: "Orphan" },
  { value: "PWDOPENH", label: "PWD" },
];

export const LEVEL_OPTIONS: { value: Level; label: string }[] = [
  { value: "H", label: "Home District" },
  { value: "O", label: "Other than Home District" },
  { value: "S", label: "State Level" },
];

export const CANDIDATURE_OPTIONS: { value: Candidature; label: string }[] = [
  { value: "N", label: "Non-Technical" },
  { value: "T", label: "Technical" },
];

export const GENDER_OPTIONS: { value: Gender; label: string }[] = [
  { value: "G", label: "General" },
  { value: "L", label: "Ladies" },
];

const SPECIAL_CODES = new Set(Object.keys(SPECIAL_LABELS));

// Given the filter selections, resolve the exact seat-type code string(s) to match against.
// `levels` accepts multiple seat levels at once (Home/Other/State), since DTE assigns the
// level per-college-per-application — a general tool can't know a student's actual level for
// every college, so callers should default to checking all three rather than guessing one.
export function resolveSeatCodes(params: {
  category: string;
  candidature: Candidature;
  gender: Gender;
  levels: Level[];
}): string[] {
  const { category, candidature, gender, levels } = params;
  if (SPECIAL_CODES.has(category)) return [category];
  return levels.map((level) => `${candidature}${gender}${category}${level}`);
}
