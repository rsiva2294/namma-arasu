"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import { Search, Sparkles, BookOpen, X, AlertCircle, Loader2 } from "lucide-react";
import { getUserFingerprint, quotaService } from "@/lib/services/quotaService";
import docs from "@/data/tvk_manifesto_documents.json";
import dict from "@/data/multilingual_dictionary.json";

interface ClientDoc {
  id: string;
  framework: string;
  pillar_title: string;
  section_name: string;
  promise: string;
  keywords: string[];
  hybridScore?: number;
  score?: number;
  diversifiedScore?: number;
}

interface Citation {
  promiseId: string;
  framework: string;
  pillar: string;
  section: string;
  excerpt: string;
}

const TIER1_CONFIDENCE_THRESHOLD = 0.72;

const TOKEN_WEIGHTS: Record<string, number> = {
  neet: 2.5,
  gst: 2.2,
  cauvery: 2.0,
  katchatheevu: 2.0,
  "two-language": 1.8,
  "caste survey": 1.8,
  "one nation": 1.8,
  delimit: 1.8,
  electricity: 1.4,
  water: 1.4,
  weaver: 1.3,
  farmer: 1.3,
  sports: 1.2,
  education: 1.0,
  government: 1.0,
  welfare: 1.0,
};

export default function ManifestoAiSearchBox() {
  const [query, setQuery] = useState("");
  const [isFocused, setIsFocused] = useState(false);
  const [tier1Results, setTier1Results] = useState<ClientDoc[]>([]);
  const [semanticResults, setSemanticResults] = useState<ClientDoc[]>([]);
  const [aiAnswer, setAiAnswer] = useState<string | null>(null);
  const [citations, setCitations] = useState<Citation[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [remainingQuota, setRemainingQuota] = useState(10);
  const [selectedCitationId, setSelectedCitationId] = useState<string | null>(null);
  const [highlightedPromiseId, setHighlightedPromiseId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<"instant" | "ai">("instant");

  const localDocs = docs as ClientDoc[];
  const dictionary = dict as Record<string, string[]>;

  const containerRef = useRef<HTMLDivElement>(null);
  const resultsRef = useRef<HTMLDivElement>(null);

  // Load quota on mount
  useEffect(() => {
    if (typeof window !== "undefined") {
      const fingerprint = getUserFingerprint();
      const timer = setTimeout(() => {
        setRemainingQuota(quotaService.getRemainingQuota(fingerprint));
      }, 0);
      return () => clearTimeout(timer);
    }
  }, []);

  // Handle outside click to close dropdown
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsFocused(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);



  // Weighted Token Overlap Score
  const computeTier1Score = (queryTokens: string[], docKeywords: string[]): number => {
    if (queryTokens.length === 0) return 0;
    const docSet = new Set(docKeywords.map((k) => k.toLowerCase()));
    let matchedWeight = 0;
    let totalWeight = 0;

    queryTokens.forEach((t) => {
      const weight = TOKEN_WEIGHTS[t] || 1.0;
      totalWeight += weight;
      if (docSet.has(t)) {
        matchedWeight += weight;
      }
    });

    return totalWeight === 0 ? 0 : matchedWeight / totalWeight;
  };

  // Perform Tier 1 instant search on text changes
  const handleSearch = useCallback((searchVal: string) => {
    // Query Normalization Pipeline for Tier 1
    const normalizeText = (text: string): string[] => {
      const lowercase = text.toLowerCase();
      const stripped = lowercase.replace(/[.,\/#!$%\^&\*;:{}=\-_`~()?\']/g, " ");
      const tokens = stripped
        .split(/\s+/)
        .map((t) => t.trim())
        .filter(Boolean);
      const stopwords = new Set(["the", "and", "is", "for", "of", "with", "on", "to", "a", "an"]);
      const filtered = tokens.filter((t) => !stopwords.has(t));

      // Basic suffix stemming
      const stemmed = filtered.map((t) => {
        if (t.endsWith("es")) return t.substring(0, t.length - 2);
        if (t.endsWith("s") && !t.endsWith("ss")) return t.substring(0, t.length - 1);
        return t;
      });

      // Symmetrical Expansion
      const expanded = new Set<string>();
      stemmed.forEach((t) => {
        expanded.add(t);
        if (dictionary[t]) {
          dictionary[t].forEach((syn) => expanded.add(syn));
        }
      });

      return Array.from(expanded);
    };

    if (searchVal.trim() === "" || localDocs.length === 0) {
      setTier1Results([]);
      return;
    }

    const queryTokens = normalizeText(searchVal);
    const scored = localDocs.map((doc) => {
      const score = computeTier1Score(queryTokens, doc.keywords);
      const isExact =
        doc.promise.toLowerCase().includes(searchVal.toLowerCase()) ||
        doc.section_name.toLowerCase().includes(searchVal.toLowerCase());
      const finalScore = score + (isExact ? 0.2 : 0.0); // Exact substring match boost

      return { ...doc, score: finalScore };
    });

    // Filter by threshold
    const filtered = scored.filter((doc) => doc.score >= TIER1_CONFIDENCE_THRESHOLD);

    // Apply ranking diversity protection (max 2 per section in top 5)
    const diversified: (ClientDoc & { score: number; diversifiedScore: number })[] = [];
    const sectionCounts: Record<string, number> = {};

    filtered.sort((a, b) => b.score - a.score);

    filtered.forEach((item) => {
      const section = item.section_name;
      const count = sectionCounts[section] || 0;
      let finalScore = item.score;
      if (count >= 2) {
        finalScore = item.score * 0.5; // Diversity penalty
      }
      diversified.push({ ...item, diversifiedScore: finalScore });
      sectionCounts[section] = count + 1;
    });

    diversified.sort((a, b) => b.diversifiedScore - a.diversifiedScore);
    setTier1Results(diversified.slice(0, 5));
  }, [localDocs, dictionary]);

  useEffect(() => {
    const timer = setTimeout(() => {
      handleSearch(query);
    }, 150);
    return () => clearTimeout(timer);
  }, [query, handleSearch]);

  // Execute Tier 2: Semantic Vector Search
  const executeSemanticSearch = async () => {
    if (query.trim() === "") return;
    setLoading(true);
    setError(null);
    setActiveTab("instant");

    try {
      const response = await fetch("/api/manifesto-search/semantic-match", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query }),
      });

      if (!response.ok) {
        throw new Error("Semantic vector search failed to connect.");
      }

      const data = await response.json();
      setSemanticResults(data.matches || []);
      if (data.matches.length === 0) {
        setError("No highly matching semantic promises found. Try different keywords.");
      }
    } catch (e) {
      setError((e as Error).message || "Vector search failed.");
    } finally {
      setLoading(false);
    }
  };

  // Execute Tier 3: AI Synthesis Layer
  const executeAiSynthesis = async () => {
    if (query.trim() === "") return;
    setLoading(true);
    setError(null);
    setAiAnswer(null);
    setCitations([]);
    setActiveTab("ai");

    // Retrieve context documents: prioritize Tier 2 results, fallback to Tier 1
    const contextDocs = semanticResults.length > 0 ? semanticResults : tier1Results;

    if (contextDocs.length === 0) {
      setLoading(false);
      setError("AI synthesis requires retrieved promise context. Perform a vector or local search first.");
      return;
    }

    try {
      const fingerprint = getUserFingerprint();
      const response = await fetch("/api/manifesto-search/synthesize", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          query,
          contextDocuments: contextDocs,
          fingerprint,
        }),
      });

      if (response.status === 429) {
        const quotaErr = await response.json();
        throw new Error(quotaErr.message);
      }

      if (!response.ok) {
        throw new Error("Failed to synthesize manifesto context.");
      }

      const data = await response.json();
      setAiAnswer(data.answer);
      setCitations(data.citations || []);
      setRemainingQuota(data.remainingQuota);

      if (data.tokenUsage) {
        console.log("=========================================");
        console.log("🚀 [AI SEARCH BOX]: Gemini API Token Usage");
        console.log(`📥 Input Prompt Tokens:  ${data.tokenUsage.promptTokenCount}`);
        console.log(`📤 Output Answer Tokens: ${data.tokenUsage.candidatesTokenCount}`);
        console.log(`🔄 Total Session Tokens:  ${data.tokenUsage.totalTokenCount}`);
        console.log("=========================================");
      }
    } catch (e) {
      setError((e as Error).message || "AI Synthesis failed.");
    } finally {
      setLoading(false);
    }
  };

  // Highlight corresponding promise when clicking citation
  const handleCitationClick = (citation: Citation) => {
    setSelectedCitationId(citation.promiseId);
    setHighlightedPromiseId(citation.promiseId);
    const element = document.getElementById(citation.promiseId);
    if (element) {
      element.scrollIntoView({ behavior: "smooth", block: "center" });
    }
  };

  return (
    <div ref={containerRef} className="relative w-full max-w-4xl mx-auto z-40 my-6">
      {/* Search Input Container */}
      <div className="relative flex items-center bg-white dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800 rounded-xl shadow-md focus-within:ring-2 focus-within:ring-emerald-500/20 transition-all duration-200">
        <div className="pl-4 text-slate-400 dark:text-zinc-500">
          <Search size={20} />
        </div>
        <input
          type="text"
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setIsFocused(true);
          }}
          onFocus={() => setIsFocused(true)}
          placeholder="Search manifesto promises in English, Tamil, or Tanglish (e.g. neet, free electricity, thanneer)..."
          className="w-full py-4 px-3 bg-transparent text-slate-800 dark:text-zinc-100 placeholder-slate-400 dark:placeholder-zinc-600 focus:outline-none text-base font-medium"
        />
        {query && (
          <button
            onClick={() => {
              setQuery("");
              setTier1Results([]);
              setSemanticResults([]);
              setAiAnswer(null);
              setError(null);
            }}
            className="p-1 mr-2 text-slate-400 hover:text-slate-600 dark:hover:text-zinc-300 transition-colors"
          >
            <X size={18} />
          </button>
        )}
        <div className="flex items-center gap-1.5 pr-3">
          <button
            onClick={executeSemanticSearch}
            disabled={!query}
            className="flex items-center gap-1 px-3 py-1.5 bg-slate-100 hover:bg-slate-200 dark:bg-zinc-900 dark:hover:bg-zinc-850 text-slate-700 dark:text-zinc-300 rounded-lg text-xs font-semibold border border-slate-200 dark:border-zinc-800 disabled:opacity-50 transition-colors cursor-pointer"
          >
            Vector Search
          </button>
          <button
            onClick={executeAiSynthesis}
            disabled={!query}
            className="flex items-center gap-1 px-3 py-1.5 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white rounded-lg text-xs font-semibold shadow-sm hover:shadow transition-all disabled:opacity-50 cursor-pointer"
          >
            <Sparkles size={13} />
            Ask AI
          </button>
        </div>
      </div>

      {/* Local Storage Quota Info Indicator */}
      <div className="mt-1.5 px-2 flex justify-between text-[11px] text-slate-400 dark:text-zinc-600 font-medium">
        <span>Daily AI Synthesis Limit: 10 requests</span>
        <span>Remaining AI Quota: {remainingQuota}/10</span>
      </div>

      {/* Results Overlay Dropdown */}
      {isFocused && (query || loading || error || aiAnswer || semanticResults.length > 0) && (
        <div
          ref={resultsRef}
          className="absolute left-0 right-0 mt-3 p-4 bg-white dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800 rounded-xl shadow-2xl z-50 max-h-[75vh] overflow-y-auto scrollbar-thin scrollbar-thumb-slate-200"
        >
          {loading && (
            <div className="flex flex-col items-center justify-center py-10 text-slate-500">
              <Loader2 className="animate-spin text-emerald-600 mb-2" size={28} />
              <span className="text-sm font-medium">Searching frameworks and generating answer...</span>
            </div>
          )}

          {error && (
            <div className="flex items-start gap-2.5 p-3.5 bg-rose-50 dark:bg-rose-950/20 border border-rose-150 dark:border-rose-900/30 text-rose-800 dark:text-rose-400 rounded-lg mb-4 text-sm">
              <AlertCircle size={18} className="shrink-0 mt-0.5" />
              <div>
                <span className="font-bold">Retrieval Notice:</span> {error}
              </div>
            </div>
          )}

          {/* AI ANSWER LAYER (TIER 3) */}
          {aiAnswer && activeTab === "ai" && !loading && (
            <div className="p-4 bg-emerald-50/50 dark:bg-emerald-950/10 border border-emerald-100 dark:border-emerald-900/20 rounded-xl mb-6">
              <div className="flex items-center gap-2 mb-2 text-emerald-800 dark:text-emerald-400 font-bold text-sm">
                <Sparkles size={16} />
                <span>AI Synthesis (Grounded Context)</span>
              </div>
              <p className="text-slate-800 dark:text-zinc-200 text-sm leading-relaxed whitespace-pre-wrap">
                {aiAnswer}
              </p>

              {/* Citations badges */}
              {citations.length > 0 && (
                <div className="mt-4 pt-3 border-t border-slate-200/50 dark:border-zinc-800/50">
                  <span className="text-xs font-bold text-slate-500 dark:text-zinc-500 block mb-2">
                    VERIFIABLE CITATION SOURCES:
                  </span>
                  <div className="flex flex-wrap gap-2">
                    {citations.map((cite, index) => (
                      <button
                        key={index}
                        onClick={() => handleCitationClick(cite)}
                        className={`flex items-center gap-1.5 px-2.5 py-1 text-xs border rounded-lg transition-all cursor-pointer font-medium ${
                          selectedCitationId === cite.promiseId
                            ? "bg-emerald-600 text-white border-emerald-600 shadow-sm font-semiboldScale"
                            : "bg-white hover:bg-slate-50 dark:bg-zinc-900 dark:hover:bg-zinc-850 text-slate-700 dark:text-zinc-300 border-slate-200 dark:border-zinc-800"
                        }`}
                      >
                        <BookOpen size={11} />
                        <span>[{index + 1}] {cite.framework} • Section {cite.section.substring(0, 15)}...</span>
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* DETERMINISTIC RETRIEVAL RESULTS (TIER 1 / TIER 2) */}
          {!loading && (
            <div>
              <div className="flex items-center justify-between mb-3.5 pb-2 border-b border-slate-100 dark:border-zinc-900">
                <span className="text-xs font-bold text-slate-400 dark:text-zinc-500 tracking-wider uppercase">
                  {semanticResults.length > 0 ? "Semantic Vector Matches (Tier 2)" : "Keyword Suggesions (Tier 1)"}
                </span>
                <span className="text-xs text-slate-400 dark:text-zinc-500">
                  Matches found: {semanticResults.length > 0 ? semanticResults.length : tier1Results.length}
                </span>
              </div>

              {semanticResults.length === 0 && tier1Results.length === 0 && !error && (
                <div className="text-center py-8 text-slate-400 dark:text-zinc-600 text-sm">
                  No instant matches found. Click <span className="font-semibold text-slate-600 dark:text-zinc-400">Vector Search</span> or <span className="font-semibold text-emerald-600">Ask AI</span> to perform deep retrieval.
                </div>
              )}

              <div className="flex flex-col gap-3">
                {(semanticResults.length > 0 ? semanticResults : tier1Results).map((doc) => (
                  <div
                    key={doc.id}
                    id={doc.id}
                    className={`p-3.5 border rounded-xl transition-all ${
                      highlightedPromiseId === doc.id
                        ? "bg-slate-50 dark:bg-zinc-900 border-emerald-500 shadow-md ring-1 ring-emerald-500/20"
                        : "bg-white hover:bg-slate-50 dark:bg-zinc-950 dark:hover:bg-zinc-900/40 border-slate-150 dark:border-zinc-850"
                    }`}
                  >
                    <div className="flex items-start justify-between gap-4 mb-2">
                      <div className="flex flex-wrap gap-1.5">
                        <span className="px-2 py-0.5 bg-slate-100 dark:bg-zinc-900 text-slate-600 dark:text-zinc-400 rounded text-[10px] font-bold uppercase border border-slate-200 dark:border-zinc-800">
                          {doc.framework}
                        </span>
                        <span className="px-2 py-0.5 bg-emerald-50 dark:bg-emerald-950/20 text-emerald-700 dark:text-emerald-400 rounded text-[10px] font-bold border border-emerald-100/30 dark:border-emerald-900/10">
                          {doc.pillar_title}
                        </span>
                      </div>
                      {doc.hybridScore && (
                        <span className="text-[10px] font-bold text-slate-400 dark:text-zinc-500">
                          Match: {Math.round(doc.hybridScore * 100)}%
                        </span>
                      )}
                    </div>

                    <h4 className="text-slate-500 dark:text-zinc-500 text-xs font-bold mb-1.5 uppercase tracking-wide">
                      {doc.section_name}
                    </h4>
                    <p className="text-slate-800 dark:text-zinc-200 text-sm font-medium leading-relaxed">
                      {doc.promise}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
