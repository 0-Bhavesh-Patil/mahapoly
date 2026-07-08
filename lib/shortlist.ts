export interface ShortlistEntry {
  key: string;
  ci: number;
  branch: number;
  round: number;
  seatCode: string;
  cutoff: number;
  supplementary: boolean;
}

const SHORTLIST_KEY = "mahapoly-shortlist-v3";

export function loadShortlist(): ShortlistEntry[] {
  try {
    const saved = localStorage.getItem(SHORTLIST_KEY);
    if (saved) return JSON.parse(saved);
  } catch {}
  return [];
}

export function saveShortlist(list: ShortlistEntry[]) {
  try {
    localStorage.setItem(SHORTLIST_KEY, JSON.stringify(list));
  } catch {}
}
