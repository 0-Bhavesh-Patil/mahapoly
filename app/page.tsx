"use client";

import React, { useState, useMemo, useEffect } from 'react';
import { Star, Printer, Share2, Sparkles, Search, SlidersHorizontal, ArrowUpRight, GraduationCap, Copy, Check } from 'lucide-react';

// --- DATA TYPE INTERFACES ---
interface CutoffRecord {
  seatType: string;    // e.g., "NGOPENH", "TGSEBCO"
  cutoff: number;      // Parsed numeric cutoff
  stage: number;       // 1 for Primary, 2+ for Supplementary/Vacant
  branchName: string;
}

interface CollegeGroup {
  code: string;
  name: string;
  region: string;
  district: string;
  branches: {
    [branchName: string]: CutoffRecord[];
  };
}

export default function MahaPolySearch() {
  // --- CORE SYSTEM STATES ---
  const [merit, setMerit] = useState<string>('');
  const [category, setCategory] = useState<string>('Open');
  const [gender, setGender] = useState<string>('General');
  const [candidature, setCandidature] = useState<string>('Non-Technical');
  const [seatLevel, setSeatLevel] = useState<string>('State Level');
  const [capRound, setCapRound] = useState<number>(1);
  const [searchQuery, setSearchQuery] = useState<string>('');
  
  const [activeTab, setActiveTab] = useState<'search' | 'option-form'>('search');
  const [shortlist, setShortlist] = useState<any[]>([]);
  const [copied, setCopied] = useState<boolean>(false);

  // --- LOCALSTORAGE PERSISTENCE HYDRATION ---
  useEffect(() => {
    const saved = localStorage.getItem('mahapoly_shortlist');
    if (saved) {
      try { setShortlist(JSON.parse(saved)); } catch (e) { console.error(e); }
    }
  }, []);

  const saveToLocalStorage = (updatedList: any[]) => {
    setShortlist(updatedList);
    localStorage.setItem('mahapoly_shortlist', JSON.stringify(updatedList));
  };

  // --- SHORTLIST LOGIC ---
  const toggleSelectCollege = (collegeCode: string, branchName: string, cutoff: number) => {
    const itemKey = `${collegeCode}-${branchName}`;
    const exists = shortlist.some(item => item.key === itemKey);

    if (exists) {
      const filtered = shortlist.filter(item => item.key !== itemKey);
      saveToLocalStorage(filtered);
    } else {
      const newItem = { key: itemKey, code: collegeCode, branch: branchName, cutoff };
      saveToLocalStorage([...shortlist, newItem]);
    }
  };

  // --- EXTENDED DATABASE MOCK (Matches Dictionary-Encoded Structure) ---
  const database: CollegeGroup[] = useMemo(() => [
    {
      code: "3012",
      name: "Government Polytechnic, Mumbai",
      region: "Mumbai",
      district: "Mumbai City",
      branches: {
        "Computer Engineering": [
          { seatType: "GOPENH", cutoff: 86.40, stage: 1, branchName: "Computer Engineering" },
          { seatType: "LOPENH", cutoff: 88.10, stage: 1, branchName: "Computer Engineering" },
          { seatType: "GOPENS", cutoff: 91.20, stage: 2, branchName: "Computer Engineering" } 
        ],
        "Information Technology": [
          { seatType: "GOPENH", cutoff: 81.20, stage: 1, branchName: "Information Technology" }
        ]
      }
    },
    {
      code: "6015",
      name: "Government Polytechnic, Pune",
      region: "Pune",
      district: "Pune",
      branches: {
        "Computer Engineering": [
          { seatType: "GOPENH", cutoff: 89.50, stage: 1, branchName: "Computer Engineering" },
          { seatType: "GOPENS", cutoff: 84.00, stage: 1, branchName: "Computer Engineering" }
        ]
      }
    }
  ], []);

  // --- OPTIMIZED MATHEMATICAL SEARCH FILTER PIPELINE ---
  const processedResults = useMemo(() => {
    const userScore = parseFloat(merit);
    if (isNaN(userScore) && !searchQuery) return [];

    const matches: any[] = [];

    database.forEach(college => {
      const matchedBranches: any[] = [];

      Object.entries(college.branches).forEach(([branchName, cutoffs]) => {
        // Strict mapping validation layer to resolve incorrect answers
        const validCutoffs = cutoffs.filter(rec => {
          // 1. Parse Round State Filter
          if (rec.stage !== capRound) return false;

          // 2. Perform Strict Score Assessment
          if (!isNaN(userScore) && userScore < rec.cutoff) return false;

          return true;
        });

        if (validCutoffs.length > 0) {
          // Sort to display tightest competitive margin priority
          const bestMatchingCutoff = Math.max(...validCutoffs.map(r => r.cutoff));
          matchedBranches.push({
            branchName,
            cutoff: bestMatchingCutoff,
            margin: !isNaN(userScore) ? parseFloat((userScore - bestMatchingCutoff).toFixed(2)) : null
          });
        }
      });

      // Filter based on query string against unified entities
      const query = searchQuery.toLowerCase().trim();
      const textMatches = !query || 
        college.name.toLowerCase().includes(query) || 
        college.code.includes(query) ||
        matchedBranches.some(b => b.branchName.toLowerCase().includes(query));

      if (textMatches && (matchedBranches.length > 0 || !isNaN(userScore))) {
        matches.push({
          ...college,
          matchedBranches
        });
      }
    });

    return matches;
  }, [merit, capRound, searchQuery, database]);

  // --- SHARE & DISTRIBUTION UTILITIES ---
  const handleShareOptionForm = () => {
    if (shortlist.length === 0) return;
    const serializedKeys = shortlist.map(item => `${item.code}_${encodeURIComponent(item.branch)}`).join(',');
    const sharedUrl = `${window.location.origin}${window.location.pathname}?choices=${serializedKeys}`;
    
    navigator.clipboard.writeText(sharedUrl).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  const executePrint = () => {
    window.print();
  };

  return (
    <div className="min-h-screen bg-[#060609] text-slate-100 antialiased selection:bg-cyan-500/30 relative">
      
      {/* BACKGROUND GRAPHIC INTERIOR LAYERS */}
      <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-gradient-to-tr from-cyan-500/10 to-purple-500/0 rounded-full blur-[140px] pointer-events-none print:hidden" />
      <div className="absolute bottom-10 right-10 w-[400px] h-[400px] bg-purple-600/5 rounded-full blur-[120px] pointer-events-none print:hidden" />

      {/* VIEW LAYER WRAPPER */}
      <div className="max-w-6xl mx-auto px-4 py-8 relative z-10 print:p-0">
        
        {/* HEADER BRANDING CONTROL BLOCK */}
        <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-12 border-b border-white/5 pb-8 print:hidden">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-white/5 border border-white/10 rounded-full text-xs font-semibold text-cyan-400 mb-3 backdrop-blur-md">
              <Sparkles size={12} className="animate-pulse" /> Unified CAP Cutoff Processing Engine
            </div>
            <h1 className="text-4xl font-black tracking-tight bg-gradient-to-r from-white via-slate-200 to-slate-500 bg-clip-text text-transparent">
              MahaPoly Search
            </h1>
            <p className="text-sm text-slate-400 mt-2">
              Cross-verify real-time historical trends across 418 technical polytechnic options[cite: 2].
            </p>
          </div>

          {/* APPLICATION TAB INTERCHANGES */}
          <div className="flex bg-slate-950/60 p-1 rounded-xl border border-white/5 backdrop-blur-xl">
            <button
              onClick={() => setActiveTab('search')}
              className={`px-5 py-2 rounded-lg text-xs font-bold uppercase tracking-wider transition-all duration-200 ${activeTab === 'search' ? 'bg-gradient-to-r from-cyan-500/20 to-cyan-500/10 border border-cyan-500/30 text-cyan-400 shadow-lg' : 'text-slate-400 hover:text-slate-200'}`}
            >
              Search Analytics
            </button>
            <button
              onClick={() => setActiveTab('option-form')}
              className={`px-5 py-2 rounded-lg text-xs font-bold uppercase tracking-wider transition-all duration-200 flex items-center gap-2 ${activeTab === 'option-form' ? 'bg-gradient-to-r from-purple-500/20 to-purple-500/10 border border-purple-500/30 text-purple-400 shadow-lg' : 'text-slate-400 hover:text-slate-200'}`}
            >
              <Star size={14} className={shortlist.length > 0 ? "fill-purple-400" : ""} />
              Option Form Choice List ({shortlist.length})
            </button>
          </div>
        </header>

        {/* PRINT CAPTION HEADER LAYER (HIDDEN FOR SCREEN REALM) */}
        <div className="hidden print:block mb-8 border-b-2 border-slate-900 pb-4">
          <h1 className="text-2xl font-bold text-slate-900">DTE Maharashtra Cutoff Mapping Form</h1>
          <p className="text-xs text-slate-600 mt-1">Generated Choice Alignment Sheet — MahaPoly Search Engine Automation Asset</p>
        </div>

        {activeTab === 'search' ? (
          <div className="grid lg:grid-cols-3 gap-8 print:hidden">
            
            {/* PARAMETRIC GLASSMORPHIC ENGINE PANEL */}
            <div className="space-y-6">
              <div className="bg-slate-900/40 backdrop-blur-xl border border-white/10 rounded-2xl p-6 shadow-2xl relative overflow-hidden">
                <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-cyan-500/40 to-transparent" />
                
                <h2 className="text-sm font-bold uppercase tracking-widest text-slate-400 mb-6 flex items-center gap-2">
                  <SlidersHorizontal size={14} className="text-cyan-400" /> Filter Control Center
                </h2>

                <div className="space-y-5">
                  <div>
                    <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2">Merit Aggregation Percentage</label>
                    <input 
                      type="number" 
                      step="0.01"
                      value={merit}
                      onChange={(e) => setMerit(e.target.value)}
                      placeholder="e.g. 82.40"
                      className="w-full bg-slate-950/80 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-cyan-500/50 focus:ring-1 focus:ring-cyan-500/50 transition-all font-mono placeholder:text-slate-700"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2">CAP Round Tier</label>
                      <select 
                        value={capRound}
                        onChange={(e) => setCapRound(parseInt(e.target.value))}
                        className="w-full bg-slate-950/80 border border-white/10 rounded-xl px-3 py-3 text-white text-sm focus:outline-none focus:border-cyan-500/50 transition-all"
                      >
                        <option value={1}>Round 1</option>
                        <option value={2}>Round 2</option>
                        <option value={3}>Round 3</option>
                        <option value={4}>Round 4</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2">Seat Category</label>
                      <select 
                        value={category} 
                        onChange={(e) => setCategory(e.target.value)}
                        className="w-full bg-slate-950/80 border border-white/10 rounded-xl px-3 py-3 text-white text-sm focus:outline-none focus:border-cyan-500/50 transition-all"
                      >
                        <option value="Open">Open</option>
                        <option value="OBC">OBC</option>
                        <option value="SC">SC</option>
                        <option value="ST">ST</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2">Unified Text Fuzzy Matching</label>
                    <div className="relative">
                      <Search size={14} className="absolute left-3 top-4 text-slate-500" />
                      <input 
                        type="text"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        placeholder="Search Institute Name, Code, Branch..."
                        className="w-full bg-slate-950/80 border border-white/10 rounded-xl pl-9 pr-4 py-3 text-sm text-white focus:outline-none focus:border-cyan-500/50 transition-all placeholder:text-slate-600"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* LIVE QUERY METRIC ENGINE DISPLAYS */}
            <div className="lg:col-span-2 space-y-4">
              {processedResults.length === 0 ? (
                <div className="bg-slate-900/10 backdrop-blur-md border border-white/5 border-dashed rounded-2xl p-12 text-center flex flex-col items-center justify-center">
                  <div className="p-4 bg-slate-950 rounded-full border border-white/10 text-slate-600 mb-4">
                    <GraduationCap size={28} />
                  </div>
                  <p className="text-slate-400 font-medium">No strict matching parameters identified.</p>
                  <p className="text-xs text-slate-600 max-w-sm mt-1">
                    Input a target merit percentage value or clear parameters to isolate matches within valid structural bounds.
                  </p>
                </div>
              ) : (
                processedResults.map((college) => (
                  <div 
                    key={college.code} 
                    className="bg-slate-900/20 backdrop-blur-xl border border-white/5 hover:border-white/10 rounded-2xl p-6 transition-all duration-300 relative group overflow-hidden"
                  >
                    <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-white/5 pb-4 mb-4">
                      <div>
                        <span className="text-[10px] font-mono tracking-widest text-cyan-400 font-bold bg-cyan-950/50 px-2 py-0.5 rounded border border-cyan-800/30">
                          CODE: {college.code}
                        </span>
                        <h3 className="text-lg font-bold text-white mt-1.5 group-hover:text-cyan-300 transition-colors">
                          {college.name}
                        </h3>
                        <p className="text-xs text-slate-400 mt-0.5">{college.district}, {college.region} District</p>
                      </div>
                    </div>

                    {/* BRANCH MAPPING ACCORDIONS */}
                    <div className="space-y-3">
                      {college.matchedBranches.map((branch: any) => {
                        const isStarred = shortlist.some(item => item.key === `${college.code}-${branch.branchName}`);
                        return (
                          <div 
                            key={branch.branchName} 
                            className="flex flex-col sm:flex-row justify-between items-start sm:items-center p-3 bg-slate-950/40 rounded-xl border border-white/5 group/row hover:bg-slate-950/80 transition-all"
                          >
                            <div className="flex-1">
                              <p className="text-sm font-semibold text-slate-200">{branch.branchName}</p>
                              <div className="flex gap-4 mt-1.5 text-xs font-mono">
                                <span className="text-slate-500">Cutoff: <strong className="text-slate-300">{branch.cutoff}%</strong></span>
                                {branch.margin !== null && (
                                  <span className={branch.margin >= 0 ? "text-emerald-400" : "text-rose-400"}>
                                    {branch.margin >= 0 ? `+${branch.margin}% Margin` : `${branch.margin}% Deficit`}
                                  </span>
                                )}
                              </div>
                            </div>

                            <button
                              onClick={() => toggleSelectCollege(college.code, branch.branchName, branch.cutoff)}
                              className={`mt-3 sm:mt-0 px-3 py-1.5 rounded-lg border text-xs font-medium flex items-center gap-1.5 transition-all w-full sm:w-auto justify-center ${isStarred ? 'bg-purple-500/20 text-purple-400 border-purple-500/40' : 'bg-slate-900 border-white/10 text-slate-400 hover:text-slate-200 hover:border-white/20'}`}
                            >
                              <Star size={12} className={isStarred ? "fill-purple-400" : ""} />
                              {isStarred ? 'Choice Staged' : 'Stage Option'}
                            </button>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        ) : (
          
          /* OPTION FORM SHORTLIST & PACKAGING BUILD VIEW */
          <div className="bg-slate-900/20 backdrop-blur-xl border border-white/10 rounded-2xl p-6 shadow-2xl relative overflow-hidden print:bg-transparent print:border-none print:shadow-none print:p-0">
            <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-purple-500/40 to-transparent print:hidden" />
            
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-white/10 pb-6 mb-6 print:hidden">
              <div>
                <h2 className="text-xl font-bold text-white">Staged Selection Preferences</h2>
                <p className="text-xs text-slate-400 mt-1">Order sequences prioritize execution logic for processing submissions.</p>
              </div>

              <div className="flex gap-3 w-full sm:w-auto">
                <button
                  onClick={handleShareOptionForm}
                  disabled={shortlist.length === 0}
                  className="flex-1 sm:flex-none px-4 py-2 bg-slate-950 hover:bg-slate-900 border border-white/10 text-slate-300 font-bold text-xs rounded-xl flex items-center justify-center gap-2 transition-all disabled:opacity-40"
                >
                  {copied ? <Check size={14} className="text-emerald-400" /> : <Share2 size={14} />}
                  {copied ? 'Link Copied' : 'Share Configuration'}
                </button>
                <button
                  onClick={executePrint}
                  disabled={shortlist.length === 0}
                  className="flex-1 sm:flex-none px-4 py-2 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-bold text-xs rounded-xl flex items-center justify-center gap-2 transition-all shadow-md shadow-purple-900/30 disabled:opacity-40"
                >
                  <Printer size={14} /> Print Option Form
                </button>
              </div>
            </div>

            {shortlist.length === 0 ? (
              <div className="p-12 text-center text-slate-500 border border-white/5 border-dashed rounded-xl">
                No indexed branch allocations saved. Return to Analytics maps to select tracking metrics.
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse rounded-xl overflow-hidden print:text-slate-900">
                  <thead>
                    <tr className="bg-slate-950/80 border-b border-white/10 text-[11px] tracking-wider uppercase font-bold text-slate-400 print:bg-slate-100 print:border-slate-400 print:text-slate-800">
                      <th className="px-4 py-3 font-mono w-16">Preference</th>
                      <th className="px-4 py-3 w-28">Institute Code</th>
                      <th className="px-4 py-3">Technical Institution Name</th>
                      <th className="px-4 py-3">Selected Specialization Branch</th>
                      <th className="px-4 py-3 font-mono text-right w-24">Last Cutoff</th>
                      <th className="px-4 py-3 text-center w-16 print:hidden">Drop</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5 font-medium print:divide-slate-200">
                    {shortlist.map((item, index) => (
                      <tr key={item.key} className="text-xs hover:bg-white/[0.02] transition-colors print:hover:bg-transparent">
                        <td className="px-4 py-4 font-mono font-bold text-cyan-400 print:text-slate-900">{index + 1}</td>
                        <td className="px-4 py-4 font-mono text-slate-400 print:text-slate-700">{item.code}</td>
                        <td className="px-4 py-4 text-slate-200 font-semibold print:text-slate-900">
                          {database.find(c => c.code === item.code)?.name || "Parsing Institution Profile..."}
                        </td>
                        <td className="px-4 py-4 text-slate-300 print:text-slate-800">{item.branch}</td>
                        <td className="px-4 py-4 font-mono text-right text-slate-400 font-bold print:text-slate-900">{item.cutoff}%</td>
                        <td className="px-4 py-4 text-center print:hidden">
                          <button 
                            onClick={() => toggleSelectCollege(item.code, item.branch, item.cutoff)}
                            className="text-slate-500 hover:text-rose-400 transition-colors"
                          >
                            Remove
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}