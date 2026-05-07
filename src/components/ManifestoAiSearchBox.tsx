"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import { Search, Sparkles, BookOpen, X, AlertCircle, Loader2 } from "lucide-react";
import { getUserFingerprint, quotaService } from "@/lib/services/quotaService";
import { useLanguage } from "@/lib/i18n";
import { isFirebaseConfigured } from "@/lib/db";
import Link from "next/link";
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

const searchTranslations = {
  en: {
    searchPlaceholder: "Ask anything about the TVK manifesto (e.g., NEET exam, sports, free electricity)...",
    searchButton: "Search",
    deepSearchButton: "Deep Search",
    askAiButton: "Ask AI",
    aiQuotaPrefix: "AI Search Assistant",
    aiQuotaSuffix: "searches remaining today",
    searchingTitle: "Searching frameworks and generating answer...",
    retrievalNoticeTitle: "Retrieval Notice:",
    aiSynthesisTitle: "AI Response & Summary",
    verifiableSourcesTitle: "OFFICIAL SOURCES & REFERENCES",
    localSearchNotice: "Running in Static Hosting: Deep Search & AI Assistant have defaulted to high-precision local search.",
    matchesTitle: "Deep Search Results",
    instantSuggestionsTitle: "Instant Suggestions",
    noMatchesFound: "We couldn't find any direct matches. Try searching with different terms.",
    matchRate: "Match Rate"
  },
  ta: {
    searchPlaceholder: "தேர்தல் அறிக்கை பற்றி ஏதேனும் கேளுங்கள் (எ.கா. நீட் தேர்வு, விளையாட்டு, இலவச மின்சாரம்)...",
    searchButton: "தேடு",
    deepSearchButton: "விரிவான தேடல்",
    askAiButton: "AI கேளுங்கள்",
    aiQuotaPrefix: "AI தேடல் உதவியாளர்",
    aiQuotaSuffix: "தேடல்கள் இன்று மீதமுள்ளன",
    searchingTitle: "தேர்தல் அறிக்கையைத் தேடி பதிலைத் தயாரிக்கிறது...",
    retrievalNoticeTitle: "தேடல் அறிவிப்பு:",
    aiSynthesisTitle: "AI பதில் & சுருக்கம்",
    verifiableSourcesTitle: "அதிகாரப்பூர்வ ஆதாரங்கள் & குறிப்புகள்",
    localSearchNotice: "உள்ளூர் தேடல் முறையில் இயங்குகிறது: விரிவான தேடல் & AI உதவியாளர் உள்ளூர் துல்லியத் தேடலுக்கு மாற்றப்பட்டுள்ளது.",
    matchesTitle: "பொருந்தும் வாக்குறுதிகள்",
    instantSuggestionsTitle: "உடனடிப் பரிந்துரைகள்",
    noMatchesFound: "பொருந்தும் திட்டங்கள் எதுவும் இல்லை. வேறு வார்த்தைகளில் தேட முயலவும்.",
    matchRate: "பொருந்தும் விகிதம்"
  }
};

const getLivePromiseId = (searchId: string): string => {
  if (!searchId) return "";
  if (!searchId.startsWith("p-")) return searchId;

  // Format: p-{framework}-p{P}-s{S}-i{I}
  // Target: {framework}-p{P}-s{S+1}-pr{I+1}
  const parts = searchId.split("-");
  if (parts.length < 5) return searchId;

  const framework = parts[1]; // e.g. "aram"
  const pillarPart = parts[2]; // e.g. "p1" or "p9" or "p12"

  const pillarMatch = pillarPart.match(/p(\d+)/);
  const pillarIdx = pillarMatch ? parseInt(pillarMatch[1], 10) : 1;

  let livePillarPart = pillarPart;
  if (framework === "inbam") {
    // Inbam pillars are p8 to p10 in vector JSON, but map to p1 to p3 in live routing
    livePillarPart = `p${pillarIdx - 7}`;
  } else if (framework === "porul") {
    // Porul pillars are p11 to p15 in vector JSON, but map to p1 to p5 in live routing
    livePillarPart = `p${pillarIdx - 10}`;
  }

  // Parse section index
  const sectionMatch = parts[3].match(/s(\d+)/);
  const sectionIdx = sectionMatch ? parseInt(sectionMatch[1], 10) : 0;

  // Parse promise index
  const promiseMatch = parts[4].match(/i(\d+)/);
  const promiseIdx = promiseMatch ? parseInt(promiseMatch[1], 10) : 0;

  return `${framework}-${livePillarPart}-s${sectionIdx + 1}-pr${promiseIdx + 1}`;
};

export default function ManifestoAiSearchBox() {
  const { lang } = useLanguage();
  const st = searchTranslations[lang];

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
  const [isStaticHostingFallback, setIsStaticHostingFallback] = useState(false);

  const localDocs = docs as ClientDoc[];
  const dictionary = dict as Record<string, string[]>;

  const containerRef = useRef<HTMLDivElement>(null);
  const resultsRef = useRef<HTMLDivElement>(null);

  // Pre-authenticate user and load quota on mount
  useEffect(() => {
    if (typeof window !== "undefined") {
      async function initAuthAndQuota() {
        try {
          const uid = await quotaService.ensureAnonymousUser();
          if (uid) {
            setRemainingQuota(quotaService.getRemainingQuota(uid));
          }
        } catch (err) {
          console.warn("Auth pre-initialization failed:", err);
          const fingerprint = getUserFingerprint();
          setRemainingQuota(quotaService.getRemainingQuota(fingerprint));
        }
      }
      initAuthAndQuota();
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
    setIsStaticHostingFallback(false);

    try {
      const response = await fetch("/api/manifesto-search/semantic-match", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query }),
      });

      if (response.status === 404) {
        setIsStaticHostingFallback(true);
        const normalizedQuery = query.toLowerCase().trim();
        const t1Matches = localDocs
          .filter((doc) => {
            return (
              doc.promise.toLowerCase().includes(normalizedQuery) ||
              doc.section_name.toLowerCase().includes(normalizedQuery) ||
              doc.keywords.some((k) => k.toLowerCase() === normalizedQuery)
            );
          })
          .slice(0, 5);
        setSemanticResults(t1Matches);
        if (t1Matches.length === 0) {
          setError("No highly matching promises found. Try different keywords.");
        }
        return;
      }

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

    let contextDocs = semanticResults.length > 0 ? semanticResults : tier1Results;

    // AUTOMATIC BACKGROUND RETRIEVAL PIPELINE
    // If no context documents are populated yet, silently execute a high-precision semantic search first!
    if (contextDocs.length === 0) {
      try {
        const response = await fetch("/api/manifesto-search/semantic-match", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ query }),
        });

        if (response.status === 404) {
          setIsStaticHostingFallback(true);
          const normalizedQuery = query.toLowerCase().trim();
          const t1Matches = localDocs
            .filter((doc) => {
              return (
                doc.promise.toLowerCase().includes(normalizedQuery) ||
                doc.section_name.toLowerCase().includes(normalizedQuery) ||
                doc.keywords.some((k) => k.toLowerCase() === normalizedQuery)
              );
            })
            .slice(0, 5);
          setSemanticResults(t1Matches);
          contextDocs = t1Matches;
        } else if (response.ok) {
          const data = await response.json();
          const matches = data.matches || [];
          setSemanticResults(matches);
          contextDocs = matches;
        } else {
          contextDocs = tier1Results;
        }
      } catch (e) {
        console.warn("Background semantic matching failed, falling back to local tokens:", e);
        contextDocs = tier1Results;
      }
    }

    if (contextDocs.length === 0) {
      setLoading(false);
      setError("We couldn't find any direct or semantic matches in the manifesto for this query. Try different keywords.");
      return;
    }

    try {
      const uid = await quotaService.ensureAnonymousUser();

      // If Firebase is not configured, check and increment quota locally on the client first
      if (!isFirebaseConfigured) {
        const localCheck = await quotaService.checkAndIncrementQuota(uid);
        if (!localCheck.allowed) {
          setRemainingQuota(0);
          setError("You have exceeded your limit of 10 AI synthesis requests today. Try again tomorrow or use Tier 1/2 searches.");
          setLoading(false);
          return;
        }
        setRemainingQuota(localCheck.remaining);
      }

      const response = await fetch("/api/manifesto-search/synthesize", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          query,
          contextDocuments: contextDocs,
          fingerprint: uid,
        }),
      });

      if (response.status === 404) {
        setIsStaticHostingFallback(true);
        setError("AI Synthesis is unavailable in the fully static build. Showing local matched results below.");
        setAiAnswer(null);
        return;
      }

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
      
      if (isFirebaseConfigured) {
        setRemainingQuota(data.remainingQuota);
      }

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
      <div className="relative flex items-center bg-card border border-border rounded-2xl shadow-lg focus-within:ring-2 focus-within:ring-blue-500/20 focus-within:border-blue-500/50 hover:border-border/80 transition-all duration-300">
        <div className="pl-4 text-muted-foreground">
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
          placeholder={st.searchPlaceholder}
          className="w-full py-4.5 px-3 bg-transparent text-foreground placeholder-muted-foreground focus:outline-none text-sm md:text-base font-semibold"
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
            className="p-1.5 mr-2 text-muted-foreground hover:text-foreground transition-colors"
          >
            <X size={18} />
          </button>
        )}
        <div className="flex items-center gap-2 pr-3.5 shrink-0">
          <button
            onClick={executeSemanticSearch}
            disabled={!query}
            className="flex items-center gap-1.5 px-3.5 py-2 bg-muted hover:bg-muted/80 text-foreground rounded-xl text-xs font-bold border border-border disabled:opacity-50 transition-all active:scale-98 cursor-pointer shrink-0"
          >
            {st.deepSearchButton}
          </button>
          <button
            onClick={executeAiSynthesis}
            disabled={!query}
            className="flex items-center gap-1.5 px-4 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white rounded-xl text-xs font-extrabold shadow-sm active:scale-98 transition-all disabled:opacity-50 cursor-pointer shrink-0"
          >
            <Sparkles size={13} className="text-white/90" />
            {st.askAiButton}
          </button>
        </div>
      </div>

      {/* Local Storage Quota Info Indicator */}
      <div className="mt-2 px-3 flex justify-between items-center text-xs text-muted-foreground font-semibold tracking-wide">
        <div className="flex items-center gap-1.5">
          <div className="h-2 w-2 rounded-full bg-blue-500 animate-pulse" />
          <span>{st.aiQuotaPrefix}</span>
        </div>
        <span className="font-mono text-foreground bg-muted px-2 py-0.5 rounded-lg border border-border text-[11px] font-black">
          {remainingQuota} / 10 {lang === "en" ? "searches remaining today" : "தேடல்கள் இன்று மீதமுள்ளன"}
        </span>
      </div>

      {/* Results Overlay Dropdown */}
      {isFocused && (query || loading || error || aiAnswer || semanticResults.length > 0) && (
        <div
          ref={resultsRef}
          className="absolute left-0 right-0 mt-3 p-5 bg-card border border-border rounded-2xl shadow-2xl z-50 max-h-[75vh] overflow-y-auto scrollbar-thin"
        >
          {loading && (
            <div className="flex flex-col items-center justify-center py-12 text-muted-foreground gap-3">
              <Loader2 className="animate-spin text-blue-600" size={32} />
              <span className="text-xs font-black tracking-wide animate-pulse">{st.searchingTitle}</span>
            </div>
          )}

          {error && (
            <div className="flex items-start gap-2.5 p-4 bg-red-500/10 border border-red-500/20 text-red-600 dark:text-red-400 rounded-xl mb-4 text-xs font-bold leading-relaxed">
              <AlertCircle size={18} className="shrink-0 mt-0.5" />
              <div>
                <span className="font-extrabold">{st.retrievalNoticeTitle}</span> {error}
              </div>
            </div>
          )}

          {/* AI ANSWER LAYER (TIER 3) */}
          {aiAnswer && activeTab === "ai" && !loading && (
            <div className="p-5 bg-blue-500/5 dark:bg-blue-500/5 border border-blue-500/15 rounded-2xl mb-6 space-y-4 animate-fade-in">
              <div className="flex items-center gap-2 text-blue-600 dark:text-blue-400 font-extrabold text-sm uppercase tracking-wider">
                <Sparkles size={16} className="text-indigo-500 animate-pulse" />
                <span>{st.aiSynthesisTitle}</span>
              </div>
              <p className="text-foreground text-sm font-medium leading-relaxed whitespace-pre-wrap">
                {aiAnswer}
              </p>

              {/* Citations badges */}
              {citations.length > 0 && (
                <div className="mt-4 pt-4 border-t border-border">
                  <span className="text-[10px] font-black text-muted-foreground uppercase tracking-widest block mb-2.5">
                    {st.verifiableSourcesTitle}
                  </span>
                  <div className="flex flex-wrap gap-2">
                    {citations.map((cite, index) => (
                      <button
                        key={index}
                        onClick={() => handleCitationClick(cite)}
                        className={`flex items-center gap-1.5 px-3 py-1.5 border rounded-xl transition-all duration-150 text-xs font-bold cursor-pointer ${
                          selectedCitationId === cite.promiseId
                            ? "bg-blue-600 text-white border-blue-600 shadow-md scale-[1.02]"
                            : "bg-muted hover:bg-muted/80 text-muted-foreground border-border"
                        }`}
                      >
                        <BookOpen size={12} />
                        <span>[{index + 1}] {cite.framework} • {cite.section.substring(0, 15)}...</span>
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* DETERMINISTIC RETRIEVAL RESULTS (TIER 1 / TIER 2) */}
          {isStaticHostingFallback && !loading && (
            <div className="flex items-center gap-2.5 p-4 bg-amber-500/10 border border-amber-500/20 text-amber-700 dark:text-amber-400 rounded-xl mb-4 text-xs font-semibold leading-relaxed">
              <AlertCircle size={15} className="shrink-0 text-amber-500" />
              <span>{st.localSearchNotice}</span>
            </div>
          )}
          {!loading && (
            <div>
              <div className="flex items-center justify-between mb-4 pb-3 border-b border-border">
                <span className="text-[10px] font-black text-muted-foreground tracking-widest uppercase">
                  {semanticResults.length > 0 ? st.matchesTitle : st.instantSuggestionsTitle}
                </span>
                <span className="text-[10px] font-black text-muted-foreground uppercase tracking-wider">
                  {lang === "en" ? "Matches found" : "பொருந்தும் முடிவுகள்"}: {semanticResults.length > 0 ? semanticResults.length : tier1Results.length}
                </span>
              </div>

              {semanticResults.length === 0 && tier1Results.length === 0 && !error && (
                <div className="text-center py-10 text-muted-foreground text-sm font-semibold">
                  {st.noMatchesFound}
                </div>
              )}

              <div className="flex flex-col gap-3">
                {(semanticResults.length > 0 ? semanticResults : tier1Results).map((doc) => (
                  <Link
                    href={`/promises/${getLivePromiseId(doc.id)}`}
                    key={doc.id}
                    id={doc.id}
                    className={`block p-4 border rounded-2xl transition-all duration-200 cursor-pointer hover:border-blue-500/30 hover:shadow-sm ${
                      highlightedPromiseId === doc.id
                        ? "bg-blue-500/5 border-blue-500 shadow-md scale-[1.01]"
                        : "bg-card hover:bg-muted/10 border-border"
                    }`}
                  >
                    <div className="flex items-start justify-between gap-4 mb-3">
                      <div className="flex flex-wrap gap-2">
                        <span className={`px-2 py-0.5 rounded text-[9px] font-black uppercase tracking-wider border ${
                          doc.framework === "Aram" 
                            ? "bg-blue-500/10 text-blue-700 dark:text-blue-400 border-blue-500/20"
                            : doc.framework === "Porul"
                            ? "bg-cyan-500/10 text-cyan-700 dark:text-cyan-400 border-cyan-500/20"
                            : "bg-purple-500/10 text-purple-700 dark:text-purple-400 border-purple-500/20"
                        }`}>
                          {doc.framework}
                        </span>
                        <span className="px-2 py-0.5 bg-muted text-muted-foreground rounded text-[9px] font-black border border-border uppercase tracking-wider">
                          {doc.pillar_title}
                        </span>
                      </div>
                      {doc.hybridScore && (
                        <span className="text-[10px] font-black text-muted-foreground">
                          {st.matchRate}: {Math.round(doc.hybridScore * 100)}%
                        </span>
                      )}
                    </div>

                    <h4 className="text-muted-foreground text-[10px] font-black mb-2 uppercase tracking-widest">
                      {doc.section_name}
                    </h4>
                    <p className="text-foreground text-sm font-semibold leading-relaxed">
                      {doc.promise}
                    </p>
                  </Link>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
