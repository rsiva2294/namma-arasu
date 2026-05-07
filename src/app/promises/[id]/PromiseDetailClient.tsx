"use client";

import React, { useState, useEffect, use } from "react";
import Link from "next/link";
import Image from "next/image";
import { promiseService } from "@/lib/db";
import { PromiseItem, UpdateItem, EvidenceItem, CommentItem, PromiseStatus } from "@/types";
import StatusBadge from "@/components/StatusBadge";
import PriorityBadge from "@/components/PriorityBadge";
import { 
  ChevronLeft, 
  Coins, 
  Calendar, 
  Building, 
  MapPin, 
  MessageSquare, 
  Upload, 
  Clock, 
  CheckCircle2, 
  AlertCircle,
  ShieldCheck,
  User,
  Activity,
  Layers,
  ExternalLink
} from "lucide-react";

import { useLanguage } from "@/lib/i18n";

type PageProps = {
  params: Promise<{ id: string }>;
};

export default function PromiseDetailPageClient({ params }: PageProps) {
  const { id } = use(params);
  const { lang, t } = useLanguage();
  
  const [promise, setPromise] = useState<PromiseItem | null>(null);
  const [updates, setUpdates] = useState<UpdateItem[]>([]);
  const [evidenceList, setEvidenceList] = useState<EvidenceItem[]>([]);
  const [comments, setComments] = useState<CommentItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [role, setRole] = useState<"Citizen" | "Admin">("Citizen");
  const [backUrl, setBackUrl] = useState<string>("/");
  const [backLabel, setBackLabel] = useState<string>("");

  // Input states
  const [newUpdateTitle, setNewUpdateTitle] = useState<string>("");
  const [newUpdateDesc, setNewUpdateDesc] = useState<string>("");
  
  const [evidenceType, setEvidenceType] = useState<"image" | "video" | "document">("image");
  const [evidenceUrl, setEvidenceUrl] = useState<string>("");
  const [evidenceDistrict, setEvidenceDistrict] = useState<string>("");
  const [evidenceDesc, setEvidenceDesc] = useState<string>("");

  const [commentAuthor, setCommentAuthor] = useState<string>("");
  const [commentContent, setCommentContent] = useState<string>("");

  // Status transition states
  const [isDropdownOpen, setIsDropdownOpen] = useState<boolean>(false);
  const [selectedTransitionStatus, setSelectedTransitionStatus] = useState<PromiseStatus | null>(null);
  const [transitionSourceUrl, setTransitionSourceUrl] = useState<string>("");
  const [transitionJustification, setTransitionJustification] = useState<string>("");
  const [transitionBudgetAmount, setTransitionBudgetAmount] = useState<string>("");
  const [transitionBottleneck, setTransitionBottleneck] = useState<string>("funding");

  const loadAllData = async () => {
    setLoading(true);
    const p = await promiseService.getPromiseById(id);
    if (p) {
      setPromise(p);
      const [u, ev, c] = await Promise.all([
        promiseService.getUpdatesByPromiseId(id),
        promiseService.getEvidenceByPromiseId(id),
        promiseService.getCommentsByPromiseId(id)
      ]);
      setUpdates(u);
      setEvidenceList(ev);
      setComments(c);
    }
    
    if (typeof window !== "undefined") {
      const savedRole = localStorage.getItem("namma_arasu_role") as "Citizen" | "Admin";
      setRole(savedRole || "Citizen");
    }
    setLoading(false);
  };

  useEffect(() => {
    loadAllData();

    if (typeof window !== "undefined") {
      const storedPath = sessionStorage.getItem("last_civic_path");
      const path = storedPath || "/";
      setBackUrl(path);
      
      if (path === "/kanban") {
        setBackLabel(lang === "en" ? "Back to Kanban Board" : "கான்பான் போர்டிற்குத் திரும்பு");
      } else if (path === "/districts") {
        setBackLabel(lang === "en" ? "Back to District Analytics" : "மாவட்ட பகுப்பாய்விற்குத் திரும்பு");
      } else if (path === "/manifesto") {
        setBackLabel(lang === "en" ? "Back to Manifesto Library" : "தேர்தல் அறிக்கை நூலகத்திற்குத் திரும்பு");
      } else {
        setBackLabel(t.backToDashboard);
      }
    }

    // Listen to role toggling from header
    const handleRoleChange = () => {
      const savedRole = localStorage.getItem("namma_arasu_role") as "Citizen" | "Admin";
      setRole(savedRole || "Citizen");
    };
    window.addEventListener("namma_arasu_role_change", handleRoleChange);
    return () => window.removeEventListener("namma_arasu_role_change", handleRoleChange);
  }, [id, lang, t]);

  // Submit the verified status transition
  const handleTransitionSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!promise || !selectedTransitionStatus) return;

    // Validate general required fields
    if (!transitionSourceUrl.trim() || !transitionJustification.trim()) {
      alert("Please fill out all required fields: Credible Source URL and Justification.");
      return;
    }

    // Validate source URL format
    try {
      new URL(transitionSourceUrl);
    } catch (_) {
      alert("Please enter a valid, absolute URL for the credible source.");
      return;
    }

    const progressMap: Record<PromiseStatus, number> = {
      "Announced": 10,
      "Planned": 30,
      "Budget Allocated": 50,
      "In Progress": 75,
      "Delayed": 40,
      "Blocked": 20,
      "Completed": 100
    };

    const updateFields: Partial<PromiseItem> = {
      status: selectedTransitionStatus,
      progress_percentage: progressMap[selectedTransitionStatus]
    };

    // If "Budget Allocated" is selected, extract and validate the budget amount
    let budgetText = "";
    if (selectedTransitionStatus === "Budget Allocated") {
      const budgetNum = Number(transitionBudgetAmount);
      if (isNaN(budgetNum) || budgetNum <= 0) {
        alert("Please enter a valid, positive budget amount in Rupees.");
        return;
      }
      updateFields.budget_amount = budgetNum;
      budgetText = `Allocated Budget: ₹${(budgetNum / 10000000).toFixed(1)} Crores. `;
    }

    // Save state change in DB
    const updated = await promiseService.updatePromise(promise.id, updateFields);

    if (updated) {
      setPromise(updated);

      // Automatically post an official audited update log to the implementation timeline
      let bottleneckText = "";
      if (selectedTransitionStatus === "Delayed" || selectedTransitionStatus === "Blocked") {
        const bottleneckLabels: Record<string, string> = {
          funding: "Funding Constraints",
          legal: "Legal Dispute",
          administrative: "Administrative Approvals",
          other: "Other Bottlenecks"
        };
        bottleneckText = `[Identified Bottleneck: ${bottleneckLabels[transitionBottleneck] || "General"}] `;
      }

      await promiseService.addUpdate({
        promise_id: promise.id,
        title: `Status Updated to ${selectedTransitionStatus}`,
        description: `${transitionJustification}. ${budgetText}${bottleneckText}Verified Source: ${transitionSourceUrl}`,
        created_by: "Official Administrator",
      });

      // Reload official timeline updates
      const u = await promiseService.getUpdatesByPromiseId(promise.id);
      setUpdates(u);

      // Reset form states
      setSelectedTransitionStatus(null);
      setTransitionSourceUrl("");
      setTransitionJustification("");
      setTransitionBudgetAmount("");
      setTransitionBottleneck("funding");
      setIsDropdownOpen(false);
    }
  };

  // Submit official update log
  const handleAddUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newUpdateTitle.trim() || !newUpdateDesc.trim() || !promise) return;

    await promiseService.addUpdate({
      promise_id: promise.id,
      title: newUpdateTitle,
      description: newUpdateDesc,
      created_by: "Official Administrator",
    });

    setNewUpdateTitle("");
    setNewUpdateDesc("");
    
    // Reload lists
    const u = await promiseService.getUpdatesByPromiseId(promise.id);
    setUpdates(u);
  };

  // Submit citizen evidence
  const handleAddEvidence = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!evidenceUrl.trim() || !evidenceDesc.trim() || !promise) return;

    await promiseService.addEvidence({
      promise_id: promise.id,
      type: evidenceType,
      file_url: evidenceUrl,
      district: evidenceDistrict || "Statewide",
      description: evidenceDesc,
    });

    setEvidenceUrl("");
    setEvidenceDesc("");
    setEvidenceDistrict("");

    const ev = await promiseService.getEvidenceByPromiseId(promise.id);
    setEvidenceList(ev);
  };

  // Submit citizen comment
  const handleAddComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!commentContent.trim() || !promise) return;

    await promiseService.addComment({
      promise_id: promise.id,
      author: commentAuthor.trim() || "Anonymous Citizen",
      content: commentContent,
    });

    setCommentContent("");
    setCommentAuthor("");

    const c = await promiseService.getCommentsByPromiseId(promise.id);
    setComments(c);
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] gap-4">
        <div className="h-10 w-10 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
        <p className="text-xs text-muted-foreground font-medium animate-pulse">Decoding promise ledger...</p>
      </div>
    );
  }

  if (!promise) {
    return (
      <div className="p-12 text-center rounded-2xl border border-slate-900 bg-slate-950/20 max-w-lg mx-auto space-y-4">
        <AlertCircle className="w-10 h-10 text-rose-500 mx-auto" />
        <h3 className="text-sm font-bold text-white uppercase tracking-wider">{lang === "en" ? "Promise Not Found" : "திட்டம் கண்டறியப்படவில்லை"}</h3>
        <p className="text-xs text-slate-500">{lang === "en" ? "The requested manifesto ID does not match any pre-seeded record." : "கோரப்பட்ட திட்ட அடையாள எண் எந்தவொரு பதிவிற்கும் பொருந்தவில்லை."}</p>
        <Link href="/" className="inline-block text-xs font-bold text-blue-400 hover:underline">
          {lang === "en" ? "Return to Dashboard" : "முகப்பிற்குத் திரும்பு"}
        </Link>
      </div>
    );
  }

  const budgetCrores = promise.budget_amount 
    ? `₹${(promise.budget_amount / 10000000).toFixed(1)} Crores` 
    : t.awaitingBudget;

  return (
    <div className="space-y-8 animate-fade-in pb-12">
      {/* Back button */}
      <div>
        <Link href={backUrl} className="inline-flex items-center gap-1 text-xs font-semibold text-muted-foreground hover:text-foreground transition-colors">
          <ChevronLeft className="w-4 h-4" />
          <span>{backLabel || t.backToDashboard}</span>
        </Link>
      </div>

      {/* Example Showcase Warning Banner */}
      {promise.id === "p0-tvk-journey" && (
        <div className="p-4 rounded-2xl border border-amber-500/20 bg-amber-500/10 text-amber-800 dark:text-amber-400 flex items-start gap-3 shadow-[0_0_15px_rgba(245,158,11,0.05)]">
          <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
          <div className="space-y-1">
            <p className="text-xs font-bold uppercase tracking-wider">{t.exampleCard}</p>
            <p className="text-[11px] leading-relaxed text-amber-800/80 dark:text-amber-400/80 font-medium">
              {lang === "en" 
                ? "This card is a pre-seeded demonstration example showing NammaArasu's interactive progress timeline, official gazette log entries, citizen-uploaded proof verification, and public discussion feeds."
                : "இந்த அட்டை நம்ம அரசின் ஊடாடும் முன்னேற்ற காலவரிசை, பொதுமக்கள் சமர்ப்பித்த ஆதாரங்களின் சரிபார்ப்பு மற்றும் பொது விவாதங்களின் விளக்க உதாரணம் ஆகும்."}
            </p>
          </div>
        </div>
      )}

      {/* Main Header Card */}
      <div className="p-6 rounded-2xl border border-border bg-card shadow-sm">
        <div className="space-y-4">
          <div className="flex items-center justify-between gap-3 flex-wrap">
            <span className={`text-[9px] font-bold px-2 py-0.5 rounded-md border uppercase tracking-wider ${
              promise.framework === "Aram" 
                ? "bg-blue-500/10 text-blue-800 dark:text-blue-400 border-blue-500/20"
                : promise.framework === "Porul"
                ? "bg-cyan-500/10 text-cyan-800 dark:text-cyan-400 border-cyan-500/20"
                : "bg-purple-500/10 text-purple-800 dark:text-purple-400 border-purple-500/20"
            }`}>
              {lang === "en" 
                ? `${promise.framework} Framework` 
                : `${promise.framework === "Aram" ? "அறம்" : promise.framework === "Porul" ? "பொருள்" : "இன்பம்"} அமைப்பு`
              } • {promise.pillar}
            </span>

            <div className="flex items-center gap-2">
              <PriorityBadge priority={promise.priority} />
              <StatusBadge status={promise.status} />
            </div>
          </div>

          <div className="space-y-2">
            <h2 className="text-xl md:text-2xl font-black tracking-tight text-foreground leading-tight">
              {promise.title}
            </h2>
            <p className="text-xs text-muted-foreground leading-relaxed max-w-4xl">
              {(() => {
                const idMatch = promise.id.match(/^([a-z]+)-p(\d+)-s(\d+)-pr(\d+)$/);
                if (idMatch) {
                  const promiseNum = idMatch[4];
                  return (
                    <>
                      {lang === "en" ? `Commitment #${promiseNum}` : `வாக்குறுதி #${promiseNum}`} • {promise.pillar} • {lang === "en" ? `${promise.framework} Framework` : `${promise.framework === "Aram" ? "அறம்" : promise.framework === "Porul" ? "பொருள்" : "இன்பம்"} அமைப்பு`}
                    </>
                  );
                }
                return promise.description;
              })()}
            </p>
          </div>

          {/* Progress Section */}
          <div className="pt-4 border-t border-border space-y-2.5">
            <div className="flex items-center justify-between text-[10px] font-bold text-muted-foreground uppercase tracking-wide">
              <span>{t.auditedCompletionProgress}</span>
              <span className="text-foreground font-mono">{promise.progress_percentage}%</span>
            </div>
            
            {role === "Admin" ? (
              <div className="space-y-4">
                <div className="relative inline-block text-left">
                  <button
                    type="button"
                    onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                    className="inline-flex items-center gap-2 px-4 py-2 text-xs font-bold text-foreground bg-background hover:bg-muted border border-border rounded-xl transition-all shadow-sm cursor-pointer"
                  >
                    <span>{t.changeGovernanceStatus}</span>
                    <span className="text-[10px] bg-blue-500/10 text-blue-500 border border-blue-500/20 px-2 py-0.5 rounded-lg font-bold uppercase tracking-wider">
                      {promise.status}
                    </span>
                    <svg className={`w-4 h-4 text-muted-foreground transition-transform ${isDropdownOpen ? "rotate-180" : ""}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </button>

                  {isDropdownOpen && (
                    <div className="absolute left-0 mt-2 w-64 rounded-xl border border-border bg-card shadow-lg z-50 overflow-hidden divide-y divide-border">
                      <div className="p-1.5 space-y-0.5">
                        {(["Announced", "Planned", "Budget Allocated", "In Progress", "Delayed", "Blocked", "Completed"] as PromiseStatus[]).map((st) => {
                          const isCurrent = promise.status === st;
                          return (
                            <button
                              key={st}
                              type="button"
                              disabled={isCurrent}
                              onClick={() => {
                                setSelectedTransitionStatus(st);
                                setIsDropdownOpen(false);
                              }}
                              className={`w-full text-left px-3 py-2 text-xs font-semibold rounded-lg flex items-center justify-between ${
                                isCurrent
                                  ? "bg-muted text-muted-foreground cursor-not-allowed"
                                  : "text-foreground hover:bg-muted cursor-pointer transition-colors"
                              }`}
                            >
                              <span>{st}</span>
                              {isCurrent && (
                                <span className="text-[9px] font-bold text-blue-500 uppercase">Current</span>
                              )}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </div>

                {/* Transition Verification Form */}
                {selectedTransitionStatus && (
                  <form onSubmit={handleTransitionSubmit} className="p-4 rounded-xl border border-amber-500/20 bg-amber-500/5 dark:bg-amber-500/5 space-y-4 animate-fade-in">
                    <div className="flex items-center justify-between pb-2 border-b border-border">
                      <p className="text-[11px] font-black text-amber-600 dark:text-amber-400 uppercase tracking-wider flex items-center gap-1.5">
                        <Activity className="w-4 h-4 animate-pulse" />
                        <span>Verify Status Transition: {promise.status} → {selectedTransitionStatus}</span>
                      </p>
                      <button
                        type="button"
                        onClick={() => {
                          setSelectedTransitionStatus(null);
                          setTransitionSourceUrl("");
                          setTransitionJustification("");
                          setTransitionBudgetAmount("");
                          setTransitionBottleneck("funding");
                        }}
                        className="text-[10px] font-bold text-muted-foreground hover:text-foreground cursor-pointer"
                      >
                        Cancel
                      </button>
                    </div>

                    <div className="space-y-3.5">
                      {/* Credible Source Field */}
                      <div className="space-y-1.5">
                        <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wide">
                          Credible Verification Source URL * (e.g. Government Press Release or News Citation)
                        </label>
                        <input
                          type="url"
                          required
                          value={transitionSourceUrl}
                          onChange={(e) => setTransitionSourceUrl(e.target.value)}
                          placeholder="https://tn.gov.in/pressrelease/..."
                          className="w-full bg-background border border-border focus:border-amber-500 text-xs px-3 py-2 rounded-lg text-foreground outline-none transition-colors"
                        />
                      </div>

                      {/* Status-specific Fields: Budget Allocated */}
                      {selectedTransitionStatus === "Budget Allocated" && (
                        <div className="space-y-1.5 animate-fade-in">
                          <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wide">
                            Allocated Budget Amount in Rupees * (e.g., 450,000,000 for ₹45 Crores)
                          </label>
                          <input
                            type="number"
                            required
                            min="1"
                            value={transitionBudgetAmount}
                            onChange={(e) => setTransitionBudgetAmount(e.target.value)}
                            placeholder="Enter amount in Rupees..."
                            className="w-full bg-background border border-border focus:border-amber-500 text-xs px-3 py-2 rounded-lg text-foreground outline-none transition-colors"
                          />
                        </div>
                      )}

                      {/* Status-specific Fields: Delayed or Blocked */}
                      {(selectedTransitionStatus === "Delayed" || selectedTransitionStatus === "Blocked") && (
                        <div className="space-y-1.5 animate-fade-in">
                          <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wide">
                            Primary Bottleneck Category *
                          </label>
                          <select
                            value={transitionBottleneck}
                            onChange={(e) => setTransitionBottleneck(e.target.value)}
                            className="w-full bg-background border border-border text-xs p-2 rounded-lg text-foreground cursor-pointer outline-none focus:border-amber-500"
                          >
                            <option value="funding">Funding Constraints & Treasury Clearance</option>
                            <option value="legal">Legal Dispute or Court Stay Orders</option>
                            <option value="administrative">Pending Inter-departmental approvals</option>
                            <option value="other">Other Socio-economic Bottlenecks</option>
                          </select>
                        </div>
                      )}

                      {/* Transition Justification */}
                      <div className="space-y-1.5">
                        <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wide">
                          Official Progress Justification & Audited Notes *
                        </label>
                        <textarea
                          required
                          rows={3}
                          value={transitionJustification}
                          onChange={(e) => setTransitionJustification(e.target.value)}
                          placeholder="State exactly what official updates, clearances, or budgets triggered this transition..."
                          className="w-full bg-background border border-border focus:border-amber-500 text-xs p-3 rounded-lg text-foreground outline-none resize-none transition-colors"
                        />
                      </div>

                      <div className="flex gap-2.5 pt-1">
                        <button
                          type="submit"
                          className="px-4.5 py-2 text-xs font-bold text-white bg-amber-600 hover:bg-amber-500 rounded-lg transition-colors cursor-pointer"
                        >
                          Confirm & Post Verified Transition
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            setSelectedTransitionStatus(null);
                            setTransitionSourceUrl("");
                            setTransitionJustification("");
                            setTransitionBudgetAmount("");
                            setTransitionBottleneck("funding");
                          }}
                          className="px-4 py-2 text-xs font-bold text-muted-foreground hover:bg-muted border border-border rounded-lg transition-colors cursor-pointer"
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  </form>
                )}
              </div>
            ) : (
              <div className="w-full bg-muted rounded-full h-2.5 overflow-hidden">
                <div 
                  className={`h-2.5 rounded-full transition-all duration-500 ${
                    promise.status === "Completed" ? "bg-teal-500" : "bg-blue-600"
                  }`}
                  style={{ width: `${promise.progress_percentage}%` }}
                ></div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Two Column Content */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column (Timeline, Evidence, Discussion) */}
        <div className="lg:col-span-8 space-y-8">
          
          {/* GitHub Style Updates Timeline */}
          <div className="p-5 rounded-2xl border border-border bg-card space-y-6 shadow-sm">
            <div className="flex items-center gap-2 pb-3.5 border-b border-border">
              <Clock className="w-4 h-4 text-purple-500" />
              <h3 className="text-xs font-bold text-foreground uppercase tracking-wider">{t.implementationTimeline}</h3>
            </div>

            {/* Admin Add Timeline Log */}
            {role === "Admin" && (
              <form onSubmit={handleAddUpdate} className="p-4 rounded-xl border border-border bg-muted/20 space-y-3.5">
                <p className="text-[10px] font-bold text-amber-500 uppercase flex items-center gap-1">
                  <Activity className="w-3.5 h-3.5" />
                  <span>{t.postOfficialProgressEntry}</span>
                </p>
                
                <div className="space-y-3">
                  <input
                    type="text"
                    required
                    value={newUpdateTitle}
                    onChange={(e) => setNewUpdateTitle(e.target.value)}
                    placeholder={t.logTitlePlaceholder}
                    className="w-full bg-background border border-border focus:border-primary text-xs px-3.5 py-2 rounded-lg text-foreground outline-none"
                  />
                  <textarea
                    required
                    rows={2}
                    value={newUpdateDesc}
                    onChange={(e) => setNewUpdateDesc(e.target.value)}
                    placeholder={t.logDescriptionPlaceholder}
                    className="w-full bg-background border border-border focus:border-primary text-xs p-3 rounded-lg text-foreground outline-none resize-none"
                  />
                  <button type="submit" className="px-4 py-2 text-xs font-bold text-white bg-blue-600 hover:bg-blue-500 rounded-lg transition-colors cursor-pointer">
                    {t.postLogEntry}
                  </button>
                </div>
              </form>
            )}

            {/* Timeline Tree */}
            <div className="relative pl-6 border-l border-border space-y-6">
              {updates.length > 0 ? (
                updates.map((up) => (
                  <div key={up.id} className="relative animate-fade-in">
                    {/* Node Dot */}
                    <div className="absolute -left-[30px] top-1 h-3.5 w-3.5 rounded-full border border-border bg-background flex items-center justify-center">
                      <span className="h-1.5 w-1.5 rounded-full bg-blue-500"></span>
                    </div>

                    <div className="space-y-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <p className="text-xs font-bold text-foreground">{up.title}</p>
                        <span className="text-[9px] font-medium text-muted-foreground">
                          {new Date(up.created_at).toLocaleDateString(lang === "en" ? "en-US" : "ta-IN")}
                        </span>
                      </div>
                      <p className="text-xs text-muted-foreground leading-relaxed">
                        {up.description}
                      </p>
                      <p className="text-[9px] text-muted-foreground font-semibold uppercase flex items-center gap-1 pt-0.5">
                        <ShieldCheck className="w-3 h-3 text-emerald-500" />
                        <span>{lang === "en" ? "Source:" : "மூலம்:"} {up.created_by}</span>
                      </p>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-muted-foreground text-xs py-4 pl-2 font-medium">
                  {t.noTimelineRecorded}
                </div>
              )}
            </div>
          </div>

          {/* Citizen Evidence Upload Gallery */}
          <div className="p-5 rounded-2xl border border-border bg-card space-y-6 shadow-sm">
            <div className="flex items-center gap-2 pb-3.5 border-b border-border">
              <Upload className="w-4 h-4 text-emerald-500" />
              <h3 className="text-xs font-bold text-foreground uppercase tracking-wider">{lang === "en" ? "Citizen Evidence Hub" : "பொதுமக்கள் ஆதார மையம்"}</h3>
            </div>

            {/* Evidence form */}
            <form onSubmit={handleAddEvidence} className="p-4 rounded-xl border border-border bg-muted/20 space-y-3.5">
              <p className="text-[10px] font-bold text-muted-foreground uppercase">
                {lang === "en" ? "Submit Implementation Proof or Report Bottlenecks" : "அமலாக்க ஆதாரங்கள் அல்லது தடைகளைச் சமர்ப்பிக்கவும்"}
              </p>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <select
                  value={evidenceType}
                  onChange={(e) => setEvidenceType(e.target.value as any)}
                  className="bg-background border border-border text-xs p-2 rounded-lg text-foreground cursor-pointer outline-none"
                >
                  <option value="image">{lang === "en" ? "Image (Photo)" : "படம் (புகைப்படம்)"}</option>
                  <option value="document">{lang === "en" ? "Document (PDF/Report)" : "ஆவணம் (PDF/அறிக்கை)"}</option>
                  <option value="video">{lang === "en" ? "Video" : "காணொளி"}</option>
                </select>

                <input
                  type="text"
                  required
                  value={evidenceUrl}
                  onChange={(e) => setEvidenceUrl(e.target.value)}
                  placeholder={lang === "en" ? "Paste direct file URL (image path)..." : "நேரடி கோப்பு முகவரியை (URL) ஒட்டவும்..."}
                  className="md:col-span-2 bg-background border border-border text-xs px-3.5 py-2 rounded-lg text-foreground outline-none"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
                <input
                  type="text"
                  value={evidenceDistrict}
                  onChange={(e) => setEvidenceDistrict(e.target.value)}
                  placeholder={lang === "en" ? "Affected District (e.g. Madurai)..." : "பாதிக்கப்பட்ட மாவட்டம் (எ.கா. மதுரை)..."}
                  className="bg-background border border-border text-xs px-3.5 py-2 rounded-lg text-foreground outline-none"
                />

                <input
                  type="text"
                  required
                  value={evidenceDesc}
                  onChange={(e) => setEvidenceDesc(e.target.value)}
                  placeholder={lang === "en" ? "Evidence Description / Observations..." : "ஆதாரத்தின் விவரம் / அவதானிப்புகள்..."}
                  className="md:col-span-3 bg-background border border-border text-xs px-3.5 py-2 rounded-lg text-foreground outline-none"
                />
              </div>

              <button type="submit" className="px-4 py-2 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-500 rounded-lg transition-colors flex items-center gap-1.5 shadow-[0_0_15px_rgba(16,185,129,0.1)] cursor-pointer">
                <Upload className="w-3.5 h-3.5" />
                <span>{lang === "en" ? "Submit Proof" : "ஆதாரத்தைச் சமர்ப்பி"}</span>
              </button>
            </form>

            {/* Evidence List Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
              {evidenceList.length > 0 ? (
                evidenceList.map((ev) => (
                  <div key={ev.id} className="p-4 rounded-xl border border-border bg-muted/10 flex flex-col gap-3.5 hover:border-muted-foreground/30 transition-all">
                    {/* Media representation */}
                    {ev.type === "image" && (
                      <div className="h-32 w-full rounded-lg overflow-hidden bg-muted relative border border-border">
                        <Image 
                          src={ev.file_url} 
                          alt="Citizen Proof" 
                          fill
                          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                          className="object-cover opacity-80" 
                          loading="lazy"
                          unoptimized={true}
                        />
                        <div className="absolute inset-0 flex items-center justify-center bg-slate-900/40">
                          <CheckCircle2 className="w-6 h-6 text-emerald-400" />
                        </div>
                      </div>
                    )}

                    <div>
                      <div className="flex items-center justify-between gap-2 pb-1.5 border-b border-border mb-2">
                        <span className="text-[9px] font-bold text-muted-foreground uppercase">
                          {ev.type} • {ev.district || (lang === "en" ? "Statewide" : "மாநிலம் தழுவியது")}
                        </span>
                        <span className="text-[9px] font-bold text-teal-600 dark:text-teal-400 uppercase bg-teal-500/10 px-1.5 py-0.5 rounded border border-teal-500/20">
                          {ev.verification_status}
                        </span>
                      </div>
                      <p className="text-xs text-muted-foreground italic">
                        &ldquo;{ev.description}&rdquo;
                      </p>
                      <span className="text-[9px] text-muted-foreground font-medium block mt-2">
                        {lang === "en" ? "Submitted on" : "சமர்ப்பிக்கப்பட்ட நாள்"} {new Date(ev.created_at).toLocaleDateString(lang === "en" ? "en-US" : "ta-IN")}
                      </span>
                    </div>
                  </div>
                ))
              ) : (
                <div className="col-span-2 text-center text-muted-foreground text-xs py-4 font-medium">
                  {lang === "en" ? "No citizen-uploaded evidence available yet. Be the first to upload." : "இன்னும் பொதுமக்கள் ஆதாரங்கள் எதுவும் சமர்ப்பிக்கப்படவில்லை. முதன்முதலாகப் பகிருங்கள்."}
                </div>
              )}
            </div>
          </div>

          {/* Comments Discussion Thread */}
          <div className="p-5 rounded-2xl border border-border bg-card space-y-6 shadow-sm">
            <div className="flex items-center gap-2 pb-3.5 border-b border-border">
              <MessageSquare className="w-4 h-4 text-blue-500" />
              <h3 className="text-xs font-bold text-foreground uppercase tracking-wider">{lang === "en" ? "Public Accountability Discussion" : "பொதுமக்கள் விவாத அரங்கம்"}</h3>
            </div>

            {/* Comment Form */}
            <form onSubmit={handleAddComment} className="p-4 rounded-xl border border-border bg-muted/20 space-y-3">
              <p className="text-[10px] font-bold text-muted-foreground uppercase">
                {lang === "en" ? "Join the conversation" : "உரையாடலில் இணையுங்கள்"}
              </p>
              
              <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
                <input
                  type="text"
                  value={commentAuthor}
                  onChange={(e) => setCommentAuthor(e.target.value)}
                  placeholder={lang === "en" ? "Your Name (or Anonymous)..." : "உங்கள் பெயர் (அல்லது பெயர் குறிப்பிடாமல்)..."}
                  className="bg-background border border-border text-xs px-3.5 py-2.5 rounded-xl text-foreground outline-none"
                />
                
                <input
                  type="text"
                  required
                  value={commentContent}
                  onChange={(e) => setCommentContent(e.target.value)}
                  placeholder={lang === "en" ? "Post citizen feedback, inquiries, or complaints..." : "கருத்துக்கள், விசாரணைகள் அல்லது புகார்களைப் பதிவுசெய்யவும்..."}
                  className="md:col-span-3 bg-background border border-border text-xs px-3.5 py-2.5 rounded-xl text-foreground outline-none"
                />
              </div>

              <button type="submit" className="px-4 py-2 text-xs font-bold text-white bg-blue-600 hover:bg-blue-500 rounded-lg transition-colors cursor-pointer">
                {lang === "en" ? "Post Comment" : "கருத்தைப் பதிவுசெய்"}
              </button>
            </form>

            {/* Comment Thread */}
            <div className="space-y-4">
              {comments.length > 0 ? (
                comments.map((comm) => (
                  <div key={comm.id} className="p-4 rounded-xl border border-border bg-muted/10 flex items-start gap-3 animate-fade-in">
                    <div className="h-8 w-8 rounded-full bg-background border border-border flex items-center justify-center shrink-0">
                      <User className="w-4 h-4 text-muted-foreground" />
                    </div>
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <p className="text-xs font-bold text-foreground">{comm.author}</p>
                        <span className="text-[9px] text-muted-foreground font-medium">
                          {new Date(comm.created_at).toLocaleDateString(lang === "en" ? "en-US" : "ta-IN")}
                        </span>
                      </div>
                      <p className="text-xs text-muted-foreground leading-relaxed">
                        {comm.content}
                      </p>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-muted-foreground text-xs py-2 font-medium">
                  {lang === "en" ? "No public comments posted yet." : "இன்னும் கருத்துக்கள் எதுவும் பதிவு செய்யப்படவில்லை."}
                </div>
              )}
            </div>
          </div>

        </div>

        {/* Right Column (Sticky Metadata Pane) */}
        <div className="lg:col-span-4 lg:sticky lg:top-[90px] space-y-6">
          <div className="p-5 rounded-2xl border border-border bg-card space-y-5 shadow-sm">
            <h3 className="text-xs font-bold text-foreground uppercase tracking-wider pb-3 border-b border-border">
              {t.governanceParameters}
            </h3>

            {/* Budget */}
            <div className="flex gap-3">
              <div className="p-2 h-9 w-9 rounded-lg bg-amber-500/10 border border-amber-500/20 flex items-center justify-center shrink-0 text-amber-500">
                <Coins className="w-4 h-4" />
              </div>
              <div className="space-y-1">
                {promise.manifesto_quoted_figure && (
                  <div>
                    <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wide">{lang === "en" ? "Manifesto Quoted Figure" : "தேர்தல் அறிக்கையில் குறிப்பிட்ட தொகை"}</p>
                    <p className="text-xs font-bold text-amber-600 dark:text-amber-400">{promise.manifesto_quoted_figure}</p>
                  </div>
                )}
                <div>
                  <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wide">{t.approvedBudget}</p>
                  <p className="text-xs font-bold text-foreground">{budgetCrores}</p>
                </div>
              </div>
            </div>

            {/* Target Date */}
            <div className="flex gap-3">
              <div className="p-2 h-9 w-9 rounded-lg bg-blue-500/10 border border-blue-500/20 flex items-center justify-center shrink-0 text-blue-500">
                <Calendar className="w-4 h-4" />
              </div>
              <div>
                <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wide">{t.targetDeadline}</p>
                <p className="text-xs font-bold text-foreground">
                  {promise.target_date ? new Date(promise.target_date).toLocaleDateString(lang === "en" ? "en-US" : "ta-IN", { year: "numeric", month: "short", day: "numeric" }) : (lang === "en" ? "Unspecified" : "குறிப்பிடப்படவில்லை")}
                </p>
              </div>
            </div>

            {/* Departments */}
            <div className="flex gap-3">
              <div className="p-2 h-9 w-9 rounded-lg bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center shrink-0 text-cyan-500">
                <Building className="w-4 h-4" />
              </div>
              <div className="flex-1">
                <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wide">{t.responsibleDepartments}</p>
                <div className="flex flex-wrap gap-1 mt-1">
                  {promise.departments && promise.departments.length > 0 ? (
                    promise.departments.map((dept) => (
                      <span key={dept} className="text-[9px] font-bold bg-muted border border-border px-2 py-0.5 rounded text-foreground">
                        {dept}
                      </span>
                    ))
                  ) : (
                    <span className="text-[10px] text-muted-foreground">{t.unassigned}</span>
                  )}
                </div>
              </div>
            </div>

            {/* Districts Affected */}
            <div className="flex gap-3">
              <div className="p-2 h-9 w-9 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center shrink-0 text-emerald-500">
                <MapPin className="w-4 h-4" />
              </div>
              <div className="flex-1">
                <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wide">{t.affectedRegions}</p>
                <div className="flex flex-wrap gap-1 mt-1 max-h-36 overflow-y-auto">
                  {promise.districts && promise.districts.length > 0 ? (
                    promise.districts.map((dist) => (
                      <span key={dist} className="text-[9px] font-bold bg-muted border border-border px-2 py-0.5 rounded text-foreground">
                        {dist}
                      </span>
                    ))
                  ) : (
                    <span className="text-[10px] text-muted-foreground">{lang === "en" ? "Statewide" : "மாநிலம் தழுவியது"}</span>
                  )}
                </div>
              </div>
            </div>

            {/* Administrative Section */}
            <div className="flex gap-3 pt-3.5 border-t border-border">
              <div className="p-2 h-9 w-9 rounded-lg bg-purple-500/10 border border-purple-500/20 flex items-center justify-center shrink-0 text-purple-500">
                <Layers className="w-4 h-4" />
              </div>
              <div className="space-y-1.5">
                <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wide">{t.manifestoMapping}</p>
                <p className="text-xs font-bold text-foreground leading-relaxed">
                  {t.section}: {promise.section}
                </p>
                {promise.id !== "p0-tvk-journey" && promise.framework && (
                  <a
                    href={`/manifesto/tvk_${promise.framework.toLowerCase()}.pdf`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 text-[10px] font-bold text-blue-500 hover:text-blue-400 transition-colors mt-1"
                  >
                    <ExternalLink className="w-3 h-3" />
                    <span>{t.viewOriginalPdf}</span>
                  </a>
                )}
              </div>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
}
