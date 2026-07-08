"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, ArrowRight, Info, GraduationCap, BookOpen } from "lucide-react";
import { TopNav } from "../../components/ui";
import { DEFAULT_PROFILE, saveProfile, type Profile, type CollegeType } from "../../lib/data";
import { CATEGORY_OPTIONS, LEVEL_OPTIONS, type Candidature, type Gender, type Level } from "../../lib/seatTypes";

const GENDER_OPTIONS: { value: Gender; label: string }[] = [
  { value: "G", label: "Male" },
  { value: "L", label: "Female" },
];

export default function OnboardingPage() {
  const router = useRouter();
  const [merit, setMerit] = useState("");
  const [category, setCategory] = useState("OPEN");
  const [gender, setGender] = useState<Gender>("G");
  const [transgender, setTransgender] = useState(false);
  const [candidature, setCandidature] = useState<Candidature>("N");
  const [levels, setLevels] = useState<Set<Level>>(new Set(["H", "O", "S"]));
  const [instituteTypes, setInstituteTypes] = useState<Set<CollegeType>>(
    new Set(["government", "aided", "unaided"])
  );
  const [region, setRegion] = useState("");

  const meritNum = parseFloat(merit);
  const isValidMerit = merit.trim() !== "" && !isNaN(meritNum) && meritNum >= 0 && meritNum <= 100;
  const isSpecialCategory = ["EWS", "TFWS", "DEFOPENS", "ORPHAN", "PWDOPENH"].includes(category);

  const toggleLevel = (lv: Level) => {
    setLevels((prev) => {
      const next = new Set(prev);
      if (next.has(lv)) {
        if (next.size > 1) next.delete(lv);
      } else next.add(lv);
      return next;
    });
  };

  const toggleType = (t: CollegeType) => {
    setInstituteTypes((prev) => {
      const next = new Set(prev);
      if (next.has(t)) {
        if (next.size > 1) next.delete(t);
      } else next.add(t);
      return next;
    });
  };

  const handleSubmit = () => {
    if (!isValidMerit) return;
    const profile: Profile = {
      ...DEFAULT_PROFILE,
      merit: meritNum,
      category,
      candidature,
      gender: transgender ? "G" : gender,
      levels: Array.from(levels),
      instituteTypes: Array.from(instituteTypes),
      regionQuery: region.trim(),
    };
    saveProfile(profile);
    router.push("/results");
  };

  return (
    <div className="min-h-screen bg-[#f9f9ff]">
      <TopNav />
      <div className="max-w-[1232px] mx-auto px-4 md:px-6 py-10 md:py-16">
        <div className="bg-white border border-[#e1e2ec] rounded-xl shadow-[0_4px_6px_-1px_rgba(15,23,42,0.05),0_2px_4px_-2px_rgba(15,23,42,0.05)] overflow-hidden">
          {/* Header */}
          <div className="border-b border-[#e1e2ec] px-6 md:px-10 pt-8 md:pt-10 pb-5">
            <div className="text-xs font-semibold tracking-widest text-[#0058be] uppercase mb-1">
              Admission Profile
            </div>
            <h1 className="text-2xl font-semibold text-[#191b23]">Tell us about your application</h1>
            <p className="mt-1 text-[#424754]">
              We'll use this to tailor college recommendations from real DTE CAP cutoff records.
            </p>
          </div>

          {/* Form */}
          <div className="px-6 md:px-10 py-8 space-y-10">
            {/* Merit */}
            <section>
              <label className="flex items-center gap-1.5 text-sm font-medium text-[#191b23] mb-2">
                10th / Qualifying Exam Merit Percentage
              </label>
              <div className="relative max-w-md">
                <input
                  type="number"
                  inputMode="decimal"
                  min={0}
                  max={100}
                  step={0.01}
                  placeholder="e.g. 85.50"
                  value={merit}
                  onChange={(e) => setMerit(e.target.value)}
                  className="w-full pl-4 pr-10 py-2.5 bg-white border border-[#c2c6d6] rounded-lg text-[#191b23] outline-none focus:border-[#0058be] focus:ring-2 focus:ring-[#0058be]/15 transition-all"
                />
                <span className="absolute right-4 top-1/2 -translate-y-1/2 text-[#727785]">%</span>
              </div>
            </section>

            {/* Category */}
            <section>
              <label className="flex items-center gap-1.5 text-sm font-medium text-[#191b23] mb-3">
                Reservation Category / Seat Type
              </label>
              <div className="flex flex-wrap gap-3">
                {CATEGORY_OPTIONS.map((o) => (
                  <button
                    key={o.value}
                    type="button"
                    onClick={() => setCategory(o.value)}
                    className={`px-5 py-2 rounded-full text-sm font-medium border transition-colors ${
                      category === o.value
                        ? "bg-[#0058be] border-[#0058be] text-white"
                        : "border-[#e5e7eb] text-[#191b23] hover:border-[#c2c6d6]"
                    }`}
                  >
                    {o.label}
                  </button>
                ))}
              </div>
            </section>

            {!isSpecialCategory && (
              <>
                {/* Gender */}
                <section>
                  <label className="block text-sm font-medium text-[#191b23] mb-3">Gender</label>
                  <div className="flex flex-wrap gap-3">
                    {GENDER_OPTIONS.map((o) => (
                      <button
                        key={o.value}
                        type="button"
                        onClick={() => {
                          setGender(o.value);
                          setTransgender(false);
                        }}
                        className={`px-5 py-2 rounded-full text-sm font-medium border transition-colors ${
                          !transgender && gender === o.value
                            ? "bg-[#0058be] border-[#0058be] text-white"
                            : "border-[#e5e7eb] text-[#191b23] hover:border-[#c2c6d6]"
                        }`}
                      >
                        {o.label}
                      </button>
                    ))}
                    <button
                      type="button"
                      onClick={() => setTransgender(true)}
                      className={`px-5 py-2 rounded-full text-sm font-medium border transition-colors ${
                        transgender
                          ? "bg-[#0058be] border-[#0058be] text-white"
                          : "border-[#e5e7eb] text-[#191b23] hover:border-[#c2c6d6]"
                      }`}
                    >
                      Transgender
                    </button>
                  </div>
                  {transgender && (
                    <p className="mt-2 text-xs text-[#727785] flex items-start gap-1.5 max-w-md">
                      <Info className="h-3.5 w-3.5 shrink-0 mt-0.5" />
                      DTE's published cutoff data doesn't list a separate seat-type code for transgender
                      candidates — we'll show General-quota figures as the closest reference. Confirm your exact
                      category placement on your CAP login.
                    </p>
                  )}
                </section>

                {/* Candidature */}
                <section>
                  <label className="block text-sm font-medium text-[#191b23] mb-3">Candidature Type</label>
                  <div className="grid sm:grid-cols-2 gap-4 max-w-2xl">
                    <button
                      type="button"
                      onClick={() => setCandidature("T")}
                      className={`text-left rounded-xl border p-5 transition-colors ${
                        candidature === "T" ? "border-[#0058be] ring-2 ring-[#0058be]/15" : "border-[#e5e7eb] hover:border-[#c2c6d6]"
                      }`}
                    >
                      <div className="w-10 h-10 rounded-full bg-[#2170e4] text-white flex items-center justify-center mb-4">
                        <BookOpen className="h-4.5 w-4.5" />
                      </div>
                      <div className="font-semibold text-[#191b23] mb-1">Technical</div>
                      <div className="text-sm text-[#424754]">Engineering, Pharmacy, Architecture, etc.</div>
                    </button>
                    <button
                      type="button"
                      onClick={() => setCandidature("N")}
                      className={`text-left rounded-xl border p-5 transition-colors ${
                        candidature === "N" ? "border-[#0058be] ring-2 ring-[#0058be]/15" : "border-[#e5e7eb] hover:border-[#c2c6d6]"
                      }`}
                    >
                      <div className="w-10 h-10 rounded-full bg-[#e6e7f2] text-[#424754] flex items-center justify-center mb-4">
                        <GraduationCap className="h-4.5 w-4.5" />
                      </div>
                      <div className="font-semibold text-[#191b23] mb-1">Non-Technical</div>
                      <div className="text-sm text-[#424754]">Arts, Commerce, Science, Humanities.</div>
                    </button>
                  </div>
                </section>

                {/* Seat level */}
                <section>
                  <label className="flex items-center gap-1.5 text-sm font-medium text-[#191b23] mb-3">
                    Seat Level
                    <span className="group relative">
                      <Info className="h-3.5 w-3.5 text-[#9aa0ae]" />
                      <span className="pointer-events-none absolute left-1/2 -translate-x-1/2 bottom-full mb-2 w-64 text-xs bg-[#191b23] text-white rounded-lg p-2.5 opacity-0 group-hover:opacity-100 transition-opacity z-10">
                        DTE assigns Home/Other/State per college based on your registered address — this tool can't
                        determine that for you. We check all three by default.
                      </span>
                    </span>
                  </label>
                  <div className="flex flex-wrap gap-3">
                    {LEVEL_OPTIONS.map((o) => (
                      <button
                        key={o.value}
                        type="button"
                        onClick={() => toggleLevel(o.value)}
                        className={`px-5 py-2 rounded-full text-sm font-medium border transition-colors ${
                          levels.has(o.value)
                            ? "bg-[#0058be] border-[#0058be] text-white"
                            : "border-[#e5e7eb] text-[#191b23] hover:border-[#c2c6d6]"
                        }`}
                      >
                        {o.label}
                      </button>
                    ))}
                  </div>
                </section>
              </>
            )}

            {/* Institute type */}
            <section>
              <label className="block text-sm font-medium text-[#191b23] mb-3">Institute Type Preference</label>
              <div className="flex flex-wrap gap-3">
                {([
                  ["government", "Government"],
                  ["aided", "Government Aided"],
                  ["unaided", "Private / Un-Aided"],
                ] as [CollegeType, string][]).map(([val, label]) => (
                  <button
                    key={val}
                    type="button"
                    onClick={() => toggleType(val)}
                    className={`px-5 py-2 rounded-full text-sm font-medium border transition-colors ${
                      instituteTypes.has(val)
                        ? "bg-[#0058be] border-[#0058be] text-white"
                        : "border-[#e5e7eb] text-[#191b23] hover:border-[#c2c6d6]"
                    }`}
                  >
                    {label}
                  </button>
                ))}
              </div>
            </section>

            {/* Region */}
            <section>
              <label className="flex items-center gap-1.5 text-sm font-medium text-[#191b23] mb-2">
                Region / City (optional)
              </label>
              <input
                type="text"
                placeholder="e.g. Pune, Mumbai, Nagpur..."
                value={region}
                onChange={(e) => setRegion(e.target.value)}
                className="w-full max-w-md px-4 py-2.5 bg-white border border-[#c2c6d6] rounded-lg text-[#191b23] outline-none focus:border-[#0058be] focus:ring-2 focus:ring-[#0058be]/15 transition-all"
              />
              <p className="mt-2 text-xs text-[#727785] flex items-start gap-1.5 max-w-md">
                <Info className="h-3.5 w-3.5 shrink-0 mt-0.5" />
                We don't have a verified district field for every college — this matches against the city named in
                the college's own listing, so it's a best-effort filter, not confirmed data.
              </p>
            </section>
          </div>

          {/* Footer */}
          <div className="bg-[#f9f9ff] border-t border-[#e1e2ec] px-6 md:px-10 py-5 flex items-center justify-between">
            <button
              onClick={() => router.push("/")}
              className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium text-[#424754] hover:bg-black/[0.03] transition-colors"
            >
              <ArrowLeft className="h-3.5 w-3.5" /> Back
            </button>
            <button
              onClick={handleSubmit}
              disabled={!isValidMerit}
              className="flex items-center gap-2 px-5 py-2 rounded-lg text-sm font-medium text-white bg-[#0058be] shadow-sm hover:brightness-110 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
            >
              See My Matches <ArrowRight className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
