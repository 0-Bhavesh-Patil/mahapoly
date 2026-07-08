"use client";

import { useMemo, useState, useEffect } from "react";
import {
  ArrowRight,
  ArrowLeft,
  GraduationCap,
  Building2,
  MapPin,
  CheckCircle2,
  Lock,
  Star
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

// ---------- Data Layer ----------
type RawCutoff = [number, number, number, number];
type RawCourse = [number, RawCutoff[]];
type RawCollege = { code: string; name: string; status: string; district?: string; courses: RawCourse[] };
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

// Dynamic Extraction for new filters
const STATUS_OPTIONS = Array.from(new Set(DATA.colleges.map(c => c.status))).sort();

// Helper to extract district if it's not explicitly in the JSON yet
const getDistrict = (college: RawCollege) => {
  if (college.district) return college.district;
  const parts = college.name.split(",");
  return parts[parts.length - 1].trim();
};
const DISTRICT_OPTIONS = Array.from(new Set(DATA.colleges.map(getDistrict))).sort();

// ---------- UI Components ----------
function MarginBar({ merit, cutoff }: { merit: number; cutoff: number }) {
  const margin = merit - cutoff;
  const safe = margin >= 5;
  const tight = margin >= 0 && margin < 5;
  const color = safe ? "#10B981" : tight ? "#F59E0B" : "#62626A";
  const pct = Math.max(4, Math.min(100, (cutoff / 100) * 100));
  
  return (
    <div className="flex items-center gap-2 min-w-[140px]">
      <div className="relative flex-1 h-2 rounded-full bg-[#1C1C24] overflow-hidden">
        <div className="absolute inset-y-0 left-0 rounded-full" style={{ width: `${pct}%`, backgroundColor: color }} />
      </div>
      <span className="text-xs font-bold tabular-nums" style={{ color }}>
        {margin > 0 ? "+" : ""}{margin.toFixed(2)}%
      </span>
    </div>
  );
}

// ---------- Main Application ----------
export default function PolytechnicWizard() {
  const [step, setStep] = useState(1);
  const [isUnlocked, setIsUnlocked] = useState(false);
  const [leadContact, setLeadContact] = useState("");

  // Core Filters
  const [merit, setMerit] = useState<string>("");
  const [category, setCategory] = useState("OPEN");
  
  // Advanced Filters
  const [candidature, setCandidature] = useState<Candidature>("N");
  const [gender, setGender] = useState<Gender>("G");
  const [level, setLevel] = useState<Level>("H");
  const [round, setRound] = useState(1);
  
  // Target Filters (New)
  const [branchFilter, setBranchFilter] = useState<number | null>(null);
  const [districtFilter, setDistrictFilter] = useState<string>("");
  const [statusFilter, setStatusFilter] = useState<string>("");

  const meritNum = parseFloat(merit);
  const hasValidMerit = merit.trim() !== "" && !isNaN(meritNum) && meritNum >= 0 && meritNum <= 100;

  // Heavy Filtering Engine
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
      if (branchFilter !== null && row.branch !== branchFilter) continue;
      
      const college = DATA.colleges[row.ci];
      if (statusFilter && college.status !== statusFilter) continue;
      if (districtFilter && getDistrict(college) !== districtFilter) continue;

      const key = `${row.ci}-${row.branch}`;
      const existing = best.get(key);
      if (!existing || row.merit > existing.merit) best.set(key, row);
    }
    return Array.from(best.values()).sort((a, b) => b.merit - a.merit);
  }, [hasValidMerit, meritNum, category, candidature, gender, level, round, branchFilter, statusFilter, districtFilter]);

  const handleUnlock = () => {
    // In a real app, send `leadContact` and `results` to your CRM/Database here
    console.log("Lead Captured:", leadContact);
    setIsUnlocked(true);
  };

  return (
    <div className="min-h-screen bg-[#060608] text-[#F3F3F5] font-sans flex flex-col justify-center items-center p-4">
      
      {/* Progress Indicator */}
      {step < 4 && (
        <div className="w-full max-w-xl h-1.5 bg-[#1C1C24] mb-8 rounded-full overflow-hidden">
          <div 
            className="h-full bg-[#00D9FF] transition-all duration-500 ease-out" 
            style={{ width: `${(step / 3) * 100}%` }}
          />
        </div>
      )}

      <div className="w-full max-w-xl bg-[#0D0D12] border border-[#1C1C24] p-6 md:p-8 rounded-3xl shadow-2xl">
        
        {/* STEP 1: The Basics */}
        {step === 1 && (
          <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div>
              <span className="text-xs font-bold text-[#00D9FF] tracking-widest uppercase">Step 1 of 3</span>
              <h2 className="text-2xl font-bold mt-2">Let's find your colleges</h2>
              <p className="text-sm text-[#9A9AA2] mt-1">Enter your exact SSC percentage to begin.</p>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-[#62626A] uppercase mb-2">Merit Percentage</label>
                <input
                  type="number"
                  placeholder="e.g. 84.60"
                  value={merit}
                  onChange={(e) => setMerit(e.target.value)}
                  className="w-full bg-[#16161F] border border-[#1C1C24] p-4 rounded-xl text-3xl font-bold text-center outline-none focus:border-[#00D9FF] text-[#00D9FF] placeholder:text-[#62626A] transition-all"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#62626A] uppercase mb-2">Caste Category</label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full p-4 bg-[#16161F] border border-[#1C1C24] rounded-xl text-[#F3F3F5] outline-none focus:border-[#00D9FF] appearance-none"
                >
                  {CATEGORY_OPTIONS.map((o) => (
                    <option key={o.value} value={o.value}>{o.label}</option>
                  ))}
                </select>
              </div>
            </div>

            <button
              disabled={!hasValidMerit}
              onClick={() => setStep(2)}
              className="w-full bg-[#00D9FF] hover:bg-[#00D9FF]/90 disabled:opacity-50 text-[#060608] font-bold py-4 rounded-xl transition-all flex items-center justify-center gap-2 mt-4"
            >
              Continue <ArrowRight className="h-5 w-5" />
            </button>
          </div>
        )}

        {/* STEP 2: The Preferences (Including New Filters) */}
        {step === 2 && (
          <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div>
              <span className="text-xs font-bold text-[#00D9FF] tracking-widest uppercase">Step 2 of 3</span>
              <h2 className="text-2xl font-bold mt-2">Set your preferences</h2>
              <p className="text-sm text-[#9A9AA2] mt-1">Narrow down your results by location and branch.</p>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-[#62626A] uppercase mb-2 flex items-center gap-1.5"><MapPin className="h-4 w-4"/> District</label>
                <select
                  value={districtFilter}
                  onChange={(e) => setDistrictFilter(e.target.value)}
                  className="w-full p-3.5 bg-[#16161F] border border-[#1C1C24] rounded-xl text-[#F3F3F5] outline-none focus:border-[#00D9FF]"
                >
                  <option value="">Any District</option>
                  {DISTRICT_OPTIONS.map(d => <option key={d} value={d}>{d}</option>)}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#62626A] uppercase mb-2 flex items-center gap-1.5"><Building2 className="h-4 w-4"/> College Status</label>
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="w-full p-3.5 bg-[#16161F] border border-[#1C1C24] rounded-xl text-[#F3F3F5] outline-none focus:border-[#00D9FF]"
                >
                  <option value="">Any Status (Govt & Private)</option>
                  {STATUS_OPTIONS.map(s => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#62626A] uppercase mb-2 flex items-center gap-1.5"><GraduationCap className="h-4 w-4"/> Branch</label>
                <select
                  value={branchFilter === null ? "" : branchFilter}
                  onChange={(e) => setBranchFilter(e.target.value ? Number(e.target.value) : null)}
                  className="w-full p-3.5 bg-[#16161F] border border-[#1C1C24] rounded-xl text-[#F3F3F5] outline-none focus:border-[#00D9FF]"
                >
                  <option value="">Any Branch</option>
                  {BRANCH_LIST.map(b => <option key={b.idx} value={b.idx}>{b.name}</option>)}
                </select>
              </div>
            </div>

            <div className="flex gap-3 pt-4">
              <button onClick={() => setStep(1)} className="p-4 rounded-xl border border-[#1C1C24] text-[#9A9AA2] hover:bg-[#16161F] transition-colors"><ArrowLeft className="h-5 w-5" /></button>
              <button
                onClick={() => setStep(3)}
                className="flex-1 bg-[#00D9FF] hover:bg-[#00D9FF]/90 text-[#060608] font-bold py-4 rounded-xl transition-all flex items-center justify-center gap-2"
              >
                Find Matches <ArrowRight className="h-5 w-5" />
              </button>
            </div>
          </div>
        )}

        {/* STEP 3: Results & Lead Generation Gate */}
        {step === 3 && (
          <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="flex justify-between items-end">
              <div>
                <h2 className="text-2xl font-bold">Your Matches</h2>
                <p className="text-sm text-[#9A9AA2] mt-1">Found <strong className="text-[#F3F3F5]">{results.length}</strong> possibilities for {merit}%.</p>
              </div>
              <button onClick={() => setStep(2)} className="text-sm text-[#00D9FF] hover:underline">Edit Filters</button>
            </div>

            {results.length === 0 ? (
              <div className="bg-[#16161F] border border-[#1C1C24] p-8 rounded-2xl text-center">
                <p className="text-[#9A9AA2]">No colleges found matching these exact criteria.</p>
                <button onClick={() => setStep(2)} className="mt-4 text-[#00D9FF] font-medium text-sm">Try broadening your search</button>
              </div>
            ) : (
              <div className="space-y-3 max-h-[500px] overflow-y-auto pr-2 custom-scrollbar">
                {/* Top 3 "Free" Results */}
                {results.slice(0, 3).map((r, index) => {
                  const college = DATA.colleges[r.ci];
                  return (
                    <div key={index} className="bg-[#16161F] border border-[#1C1C24] p-4 rounded-xl relative overflow-hidden">
                      <div className="flex justify-between gap-4 mb-2">
                        <h3 className="font-bold text-sm leading-tight pr-4">{college.name}</h3>
                        <span className="shrink-0 text-xs font-mono text-[#62626A]">#{college.code}</span>
                      </div>
                      <div className="flex items-center gap-2 text-xs text-[#9A9AA2] mb-3">
                        <span className="bg-[#1C1C24] px-2 py-1 rounded text-[#00D9FF]">{DATA.branches[r.branch]}</span>
                        <span>{getDistrict(college)}</span>
                      </div>
                      <MarginBar merit={meritNum} cutoff={r.merit} />
                    </div>
                  );
                })}

                {/* The Lead Capture Gate */}
                {!isUnlocked && results.length > 3 && (
                  <div className="relative mt-4 pt-4">
                    <div className="absolute inset-0 bg-gradient-to-b from-transparent to-[#0D0D12] z-10" />
                    <div className="bg-[#16161F]/40 border border-[#1C1C24]/50 p-4 rounded-xl opacity-50 blur-sm h-24" />
                    
                    <div className="absolute bottom-0 left-0 right-0 z-20 bg-[#16161F] border border-[#00D9FF]/30 p-6 rounded-2xl text-center shadow-2xl">
                      <Lock className="h-6 w-6 text-[#00D9FF] mx-auto mb-3" />
                      <h3 className="font-bold text-lg mb-1">Unlock {results.length - 3} more matches</h3>
                      <p className="text-xs text-[#9A9AA2] mb-4">Get the full probability report and tight-match predictions sent to you.</p>
                      
                      <div className="flex flex-col gap-3">
                        <input 
                          type="tel" 
                          placeholder="Enter WhatsApp Number" 
                          value={leadContact}
                          onChange={(e) => setLeadContact(e.target.value)}
                          className="w-full bg-[#0D0D12] border border-[#1C1C24] p-3 rounded-lg text-sm text-center outline-none focus:border-[#00D9FF]"
                        />
                        <button 
                          onClick={handleUnlock}
                          disabled={leadContact.length < 10}
                          className="w-full bg-[#00D9FF] disabled:opacity-50 text-[#060608] font-bold py-3 rounded-lg text-sm transition-all"
                        >
                          Unlock Full Report
                        </button>
                      </div>
                    </div>
                  </div>
                )}

                {/* Revealed Premium Results */}
                {isUnlocked && results.slice(3).map((r, index) => {
                  const college = DATA.colleges[r.ci];
                  return (
                    <div key={index + 3} className="bg-[#16161F] border border-[#1C1C24] p-4 rounded-xl">
                      <div className="flex justify-between gap-4 mb-2">
                        <h3 className="font-bold text-sm leading-tight">{college.name}</h3>
                        <span className="shrink-0 text-xs font-mono text-[#62626A]">#{college.code}</span>
                      </div>
                      <div className="flex items-center gap-2 text-xs text-[#9A9AA2] mb-3">
                        <span className="bg-[#1C1C24] px-2 py-1 rounded">{DATA.branches[r.branch]}</span>
                        <span>{getDistrict(college)}</span>
                      </div>
                      <MarginBar merit={meritNum} cutoff={r.merit} />
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

      </div>
    </div>
  );
}