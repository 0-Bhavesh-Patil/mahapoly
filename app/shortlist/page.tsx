"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { ArrowDown, ArrowUp, MapPin, Plus, Printer, Share2, Trash2, GraduationCap, Info } from "lucide-react";
import { TopNav, CollegeTypeTag } from "../../components/ui";
import { DATA, classifyCollegeType, guessLocation } from "../../lib/data";
import { decodeSeat } from "../../lib/seatTypes";
import { loadShortlist, saveShortlist, type ShortlistEntry } from "../../lib/shortlist";

export default function ShortlistPage() {
  const [entries, setEntries] = useState<ShortlistEntry[]>([]);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    setEntries(loadShortlist());
    setLoaded(true);
  }, []);

  const update = (next: ShortlistEntry[]) => {
    setEntries(next);
    saveShortlist(next);
  };

  const move = (idx: number, dir: -1 | 1) => {
    const next = entries.slice();
    const target = idx + dir;
    if (target < 0 || target >= next.length) return;
    [next[idx], next[target]] = [next[target], next[idx]];
    update(next);
  };

  const remove = (key: string) => update(entries.filter((e) => e.key !== key));

  const regionBreakdown = useMemo(() => {
    const counts = new Map<string, number>();
    entries.forEach((e) => {
      const loc = guessLocation(DATA.colleges[e.ci].name) ?? "Unknown";
      counts.set(loc, (counts.get(loc) ?? 0) + 1);
    });
    return Array.from(counts.entries()).sort((a, b) => b[1] - a[1]);
  }, [entries]);

  const shareText = useMemo(() => {
    const lines = entries.map((e, i) => {
      const college = DATA.colleges[e.ci];
      const branch = DATA.branches[e.branch];
      const decoded = decodeSeat(e.seatCode);
      return `${i + 1}. [#${college.code}] ${college.name} — ${branch} (${decoded.label}, cutoff ${e.cutoff.toFixed(1)}%)`;
    });
    return `My MahaPoly shortlist:\n\n${lines.join("\n")}\n\nVerify choice codes on your official CAP login before submitting.`;
  }, [entries]);

  const handleShare = async () => {
    if (typeof navigator !== "undefined" && (navigator as any).share) {
      try {
        await (navigator as any).share({ title: "My MahaPoly shortlist", text: shareText });
        return;
      } catch {}
    }
    try {
      await navigator.clipboard.writeText(shareText);
      alert("Copied to clipboard — paste it anywhere to share.");
    } catch {}
  };

  if (!loaded) return null;

  return (
    <div className="min-h-screen bg-[#fafafa]">
      <div className="no-print">
        <TopNav />
      </div>

      <main className="max-w-[1280px] mx-auto px-4 md:px-8 py-8 md:py-10">
        <div className="no-print flex items-end justify-between flex-wrap gap-4 mb-8">
          <div>
            <h1 className="text-2xl md:text-3xl font-semibold tracking-tight text-[#0f172a]">
              Shortlisted Colleges
            </h1>
            <p className="mt-1 text-[#64748b]">Review and reorder your selections for the CAP option form.</p>
          </div>
          {entries.length > 0 && (
            <div className="flex gap-3">
              <button
                onClick={handleShare}
                className="flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium bg-white border border-[#e2e8f0] shadow-sm hover:border-[#c2c6d6] transition-colors"
              >
                <Share2 className="h-3.5 w-3.5" /> Share
              </button>
              <button
                onClick={() => window.print()}
                className="flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium text-white bg-[#2563eb] shadow-sm hover:brightness-110 transition-all"
              >
                <Printer className="h-3.5 w-3.5" /> Print Option Form
              </button>
            </div>
          )}
        </div>

        {entries.length === 0 ? (
          <div className="no-print text-center py-24">
            <GraduationCap className="h-6 w-6 mx-auto mb-4 text-[#94a3b8]" />
            <p className="text-[#0f172a] font-medium mb-1">Your shortlist is empty.</p>
            <p className="text-[#64748b] mb-6">Star colleges from your results to build your preference list here.</p>
            <Link
              href="/results"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-medium text-white bg-[#0058be] hover:brightness-110 transition-all"
            >
              Go to my matches
            </Link>
          </div>
        ) : (
          <div className="print-area grid grid-cols-1 lg:grid-cols-12 gap-8">
            <div className="hidden print:block lg:col-span-12 mb-6">
              <h1 className="text-2xl font-bold">My MahaPoly CAP Preference List</h1>
              <p className="text-sm text-gray-600">
                Generated with MahaPoly — verify official choice codes and current cutoffs on your CAP login before
                submitting.
              </p>
            </div>

            {/* List */}
            <div className="lg:col-span-8 space-y-3">
              <div className="no-print hidden md:flex gap-4 px-6 pb-2 text-xs font-semibold text-[#64748b] tracking-wide uppercase">
                <span className="w-[60px] text-center">Pref</span>
                <span className="w-[110px]">College Ref.</span>
                <span className="flex-1">Institute & Branch</span>
                <span className="w-[110px] text-center">Type</span>
                <span className="w-[100px] text-right">Actions</span>
              </div>

              {entries.map((e, idx) => {
                const college = DATA.colleges[e.ci];
                const branch = DATA.branches[e.branch];
                const decoded = decodeSeat(e.seatCode);
                const type = classifyCollegeType(college.status);
                const location = guessLocation(college.name);
                return (
                  <div
                    key={e.key}
                    className="bg-white border border-[#e2e8f0] rounded-2xl p-4 md:p-6 flex flex-col md:flex-row md:items-center gap-4 print:border-gray-300 print:shadow-none print:rounded-lg"
                  >
                    <div className="flex items-center gap-4 md:w-[170px] shrink-0">
                      <div className="w-8 h-8 rounded bg-[#2563eb] text-white font-semibold flex items-center justify-center shrink-0 print:bg-gray-100 print:text-black">
                        {idx + 1}
                      </div>
                      <span className="font-mono text-sm bg-[#f1f5f9] px-2 py-0.5 rounded text-[#0f172a] print:bg-white">
                        #{college.code}
                      </span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-[#0f172a] print:text-black">{college.name}</h3>
                      <div className="flex items-center gap-2 flex-wrap mt-1 text-sm text-[#64748b] print:text-gray-700">
                        {location && (
                          <span className="flex items-center gap-1">
                            <MapPin className="h-3.5 w-3.5" /> {location}
                          </span>
                        )}
                        {location && <span className="w-1 h-1 rounded-full bg-[#cbd5e1]" />}
                        <span className="flex items-center gap-1">
                          <GraduationCap className="h-3.5 w-3.5" /> {branch}
                        </span>
                      </div>
                      <div className="text-xs text-[#94a3b8] mt-1">
                        {decoded.label} · cutoff {e.cutoff.toFixed(2)}%
                        {e.supplementary && <span className="text-[#b45309]"> · supplementary round</span>}
                      </div>
                    </div>
                    <div className="md:w-[110px] flex md:justify-center">
                      <CollegeTypeTag type={type} />
                    </div>
                    <div className="no-print flex items-center gap-1 md:w-[100px] md:justify-end">
                      <button
                        onClick={() => move(idx, -1)}
                        disabled={idx === 0}
                        className="p-1.5 rounded-lg border border-[#e2e8f0] text-[#64748b] hover:border-[#c2c6d6] disabled:opacity-25 transition-colors"
                      >
                        <ArrowUp className="h-3.5 w-3.5" />
                      </button>
                      <button
                        onClick={() => move(idx, 1)}
                        disabled={idx === entries.length - 1}
                        className="p-1.5 rounded-lg border border-[#e2e8f0] text-[#64748b] hover:border-[#c2c6d6] disabled:opacity-25 transition-colors"
                      >
                        <ArrowDown className="h-3.5 w-3.5" />
                      </button>
                      <button
                        onClick={() => remove(e.key)}
                        className="p-1.5 rounded-lg border border-[#e2e8f0] text-[#64748b] hover:text-[#dc2626] hover:border-[#fca5a5] transition-colors"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </div>
                );
              })}

              <div className="no-print flex justify-center pt-4">
                <Link
                  href="/results"
                  className="flex items-center gap-2 px-5 py-3 rounded-lg text-sm font-medium text-[#2563eb] bg-white border border-dashed border-[#2563eb] hover:bg-[#eff6ff] transition-colors"
                >
                  <Plus className="h-3.5 w-3.5" /> Add More Colleges
                </Link>
              </div>
            </div>

            {/* Summary */}
            <div className="no-print lg:col-span-4 space-y-6">
              <div className="bg-white border border-[#e2e8f0] rounded-2xl p-6 shadow-sm">
                <h2 className="text-lg font-semibold text-[#0f172a] pb-4 border-b border-[#e2e8f0] mb-4">
                  Shortlist Summary
                </h2>
                <div className="text-xs font-semibold tracking-wide text-[#64748b] uppercase mb-1">
                  Total Selected
                </div>
                <div className="flex items-baseline gap-2 mb-5">
                  <span className="text-5xl font-bold text-[#2563eb]">{entries.length}</span>
                </div>
                <div className="space-y-4">
                  {regionBreakdown.slice(0, 5).map(([region, count]) => (
                    <div key={region}>
                      <div className="flex items-center justify-between text-sm mb-1.5">
                        <span className="font-medium text-[#0f172a]">{region}</span>
                        <span className="text-[#64748b]">
                          {count} College{count === 1 ? "" : "s"}
                        </span>
                      </div>
                      <div className="h-2 rounded-full bg-[#f1f5f9]">
                        <div
                          className="h-2 rounded-full bg-[#2563eb]"
                          style={{ width: `${(count / entries.length) * 100}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="bg-[#eff6ff]/50 border border-[#dbeafe] rounded-2xl p-5 flex gap-3">
                <Info className="h-5 w-5 text-[#2563eb] shrink-0 mt-0.5" />
                <div>
                  <h3 className="text-sm font-semibold text-[#2563eb] mb-1">Important Instruction</h3>
                  <p className="text-sm text-[#64748b] leading-relaxed">
                    The order you arrange these in is crucial — CAP allocates the highest preference your merit
                    qualifies for. Always confirm official choice codes and this year's cutoffs on your CAP login
                    before submitting.
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>

      <style jsx global>{`
        @media print {
          body { background: white !important; }
          .no-print { display: none !important; }
        }
      `}</style>
    </div>
  );
}
