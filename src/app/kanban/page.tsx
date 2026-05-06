"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { promiseService } from "@/lib/db";
import { PromiseItem, PromiseStatus } from "@/types";
import PriorityBadge from "@/components/PriorityBadge";
import { useLanguage } from "@/lib/i18n";
import { 
  Kanban, 
  ChevronLeft, 
  ChevronRight, 
  ShieldAlert, 
  Coins, 
  MapPin, 
  PlusCircle, 
  Info,
  Calendar
} from "lucide-react";

const COLUMNS: PromiseStatus[] = [
  "Announced",
  "Planned",
  "Budget Allocated",
  "In Progress",
  "Delayed",
  "Blocked",
  "Completed",
];

const COLUMN_COLORS: Record<PromiseStatus, string> = {
  "Announced": "border-t-blue-500 bg-blue-950/5",
  "Planned": "border-t-purple-500 bg-purple-950/5",
  "Budget Allocated": "border-t-amber-500 bg-amber-950/5",
  "In Progress": "border-t-emerald-500 bg-emerald-950/5",
  "Delayed": "border-t-orange-500 bg-orange-950/5",
  "Blocked": "border-t-red-500 bg-red-950/5",
  "Completed": "border-t-teal-500 bg-teal-950/5",
};

export default function KanbanBoard() {
  const { lang, t } = useLanguage();
  const [promises, setPromises] = useState<PromiseItem[]>([]);
  const [role, setRole] = useState<"Citizen" | "Admin">("Citizen");
  const [loading, setLoading] = useState<boolean>(true);
  
  // Transition prompt modal state
  const [activeTransition, setActiveTransition] = useState<{
    id: string;
    nextStatus: PromiseStatus;
  } | null>(null);
  const [transitionDesc, setTransitionDesc] = useState<string>("");
  const [transitionProgress, setTransitionProgress] = useState<number>(0);

  // Verified transition states
  const [transitionSourceUrl, setTransitionSourceUrl] = useState<string>("");
  const [transitionBudgetAmount, setTransitionBudgetAmount] = useState<string>("");
  const [transitionBottleneck, setTransitionBottleneck] = useState<string>("funding");

  const loadData = async () => {
    setLoading(true);
    const data = await promiseService.getPromises();
    setPromises(data);
    
    if (typeof window !== "undefined") {
      const savedRole = localStorage.getItem("namma_arasu_role") as "Citizen" | "Admin";
      setRole(savedRole || "Citizen");
    }
    setLoading(false);
  };

  useEffect(() => {
    loadData();

    // Listen to header role toggling
    const handleRoleChange = () => {
      const savedRole = localStorage.getItem("namma_arasu_role") as "Citizen" | "Admin";
      setRole(savedRole || "Citizen");
    };
    
    window.addEventListener("namma_arasu_role_change", handleRoleChange);
    return () => window.removeEventListener("namma_arasu_role_change", handleRoleChange);
  }, []);

  const handleMoveCard = (id: string, currentStatus: PromiseStatus, direction: "prev" | "next") => {
    const currentIndex = COLUMNS.indexOf(currentStatus);
    const nextIndex = direction === "next" ? currentIndex + 1 : currentIndex - 1;
    
    if (nextIndex >= 0 && nextIndex < COLUMNS.length) {
      const nextStatus = COLUMNS[nextIndex];
      
      const progressMap: Record<PromiseStatus, number> = {
        "Announced": 10,
        "Planned": 30,
        "Budget Allocated": 50,
        "In Progress": 75,
        "Delayed": 40,
        "Blocked": 20,
        "Completed": 100
      };

      setActiveTransition({ id, nextStatus });
      setTransitionProgress(progressMap[nextStatus]);
      setTransitionDesc("");
      setTransitionSourceUrl("");
      setTransitionBudgetAmount("");
      setTransitionBottleneck("funding");
    }
  };

  const submitTransition = async () => {
    if (!activeTransition) return;

    // Validate general required fields
    if (!transitionSourceUrl.trim() || !transitionDesc.trim()) {
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

    const targetStatus = activeTransition.nextStatus;
    const updateFields: Partial<PromiseItem> = {
      status: targetStatus,
      progress_percentage: progressMap[targetStatus]
    };

    let budgetText = "";
    if (targetStatus === "Budget Allocated") {
      const budgetNum = Number(transitionBudgetAmount);
      if (isNaN(budgetNum) || budgetNum <= 0) {
        alert("Please enter a valid, positive budget amount in Rupees.");
        return;
      }
      updateFields.budget_amount = budgetNum;
      budgetText = `Allocated Budget: ₹${(budgetNum / 10000000).toFixed(1)} Crores. `;
    }

    const updated = await promiseService.updatePromise(activeTransition.id, updateFields);

    if (updated) {
      let bottleneckText = "";
      if (targetStatus === "Delayed" || targetStatus === "Blocked") {
        const bottleneckLabels: Record<string, string> = {
          funding: "Funding Constraints",
          legal: "Legal Dispute",
          administrative: "Administrative Approvals",
          other: "Other Bottlenecks"
        };
        bottleneckText = `[Identified Bottleneck: ${bottleneckLabels[transitionBottleneck] || "General"}] `;
      }

      await promiseService.addUpdate({
        promise_id: activeTransition.id,
        title: `Status Updated to ${targetStatus}`,
        description: `${transitionDesc}. ${budgetText}${bottleneckText}Verified Source: ${transitionSourceUrl}`,
        created_by: "Official Administrator",
      });

      // Clear states
      setActiveTransition(null);
      setTransitionDesc("");
      setTransitionSourceUrl("");
      setTransitionBudgetAmount("");
      setTransitionBottleneck("funding");
      loadData();
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] gap-4">
        <div className="h-10 w-10 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
        <p className="text-xs text-muted-foreground font-medium animate-pulse">{lang === "en" ? "Loading work boards..." : "அமலாக்கப் பலகைகளை ஏற்றுகிறது..."}</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in relative min-h-[75vh]">
      {/* Header section */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-4 border-b border-border">
        <div>
          <h2 className="text-xl font-bold text-foreground flex items-center gap-2">
            <Kanban className="w-5 h-5 text-blue-500" />
            {lang === "en" ? "JIRA-Style Workflow Board" : "ஆளுமைப் பணிப்பாய்வு கான்பான் பலகை"}
          </h2>
          <p className="text-xs text-muted-foreground font-medium mt-1">
            {lang === "en" 
              ? "Track implementation cycles chronologically across 7 development lanes." 
              : "7 வளர்ச்சிப் பிரிவுகளின் கீழ் ஆளுமையின் அமலாக்க காலச்சுழற்சிகளை வரிசைக்கிரமமாகக் கண்காணிக்கவும்."}
            {role === "Admin" && (lang === "en" ? " Click arrows to change stages & log progress updates." : " நிலைகளை மாற்றவும் புதிய முன்னேற்றங்களைப் பதிவு செய்யவும் அம்புக்குறிகளைக் கிளிக் செய்யவும்.")}
          </p>
        </div>

        {role !== "Admin" && (
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-muted/40 border border-border text-[10px] text-muted-foreground font-semibold uppercase tracking-wider">
            <Info className="w-3.5 h-3.5 text-blue-500" />
            <span>{lang === "en" ? "Viewer Only • Enable Admin in Header to Edit" : "பார்வையாளர் பயன்முறை • திருத்தத் தலைப்பில் நிர்வாகியை இயக்கவும்"}</span>
          </div>
        )}
      </div>

      {/* Transition Modal */}
      {activeTransition && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 p-4 backdrop-blur-sm animate-fade-in">
          <div className="w-full max-w-md rounded-2xl border border-border bg-card p-6 space-y-4 shadow-2xl">
            <div className="flex items-center gap-2 text-amber-500 pb-2 border-b border-border">
              <ShieldAlert className="w-5 h-5" />
              <h3 className="text-sm font-bold uppercase tracking-wider">{lang === "en" ? "Verify Status Transition" : "ஆளுமை நிலை மாற்றத்தை சரிபார்க்கவும்"}</h3>
            </div>
            
            <p className="text-xs text-muted-foreground">
              {lang === "en" ? (
                <>
                  You are updating status to <span className="text-foreground font-black">{activeTransition.nextStatus}</span> (Auto-assigned Progress: <span className="font-mono text-foreground font-bold">{transitionProgress}%</span>).
                </>
              ) : (
                <>
                  ஆளுமை நிலையை <span className="text-foreground font-black">{
                    activeTransition.nextStatus === "Announced" ? "அறிவிக்கப்பட்டது" :
                    activeTransition.nextStatus === "Planned" ? "திட்டமிடப்பட்டது" :
                    activeTransition.nextStatus === "Budget Allocated" ? "பட்ஜெட் ஒதுக்கப்பட்டது" :
                    activeTransition.nextStatus === "In Progress" ? "செயல்பாட்டில்" :
                    activeTransition.nextStatus === "Delayed" ? "தாமதமானது" :
                    activeTransition.nextStatus === "Blocked" ? "முடக்கப்பட்டது" : "முடிந்தது"
                  }</span> ஆக மாற்றுகிறீர்கள் (தானியங்கி முன்னேற்றம்: <span className="font-mono text-foreground font-bold">{transitionProgress}%</span>).
                </>
              )}
            </p>

            <div className="space-y-4">
              {/* Credible Source Field */}
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wide">
                  {lang === "en" ? "Credible Verification Source URL *" : "நம்பகமான சரிபார்ப்பு மூல URL *"}
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
              {activeTransition.nextStatus === "Budget Allocated" && (
                <div className="space-y-1.5 animate-fade-in">
                  <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wide">
                    {lang === "en" ? "Allocated Budget Amount in Rupees *" : "ஒதுக்கப்பட்ட பட்ஜெட் தொகை (ரூபாயில்) *"}
                  </label>
                  <input
                    type="number"
                    required
                    min="1"
                    value={transitionBudgetAmount}
                    onChange={(e) => setTransitionBudgetAmount(e.target.value)}
                    placeholder={lang === "en" ? "Enter amount in Rupees (e.g. 150000000)..." : "தொகையை ரூபாயில் உள்ளிடவும் (எ.கா. 150000000)..."}
                    className="w-full bg-background border border-border focus:border-amber-500 text-xs px-3 py-2 rounded-lg text-foreground outline-none transition-colors"
                  />
                </div>
              )}

              {/* Status-specific Fields: Delayed or Blocked */}
              {(activeTransition.nextStatus === "Delayed" || activeTransition.nextStatus === "Blocked") && (
                <div className="space-y-1.5 animate-fade-in">
                  <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wide">
                    {lang === "en" ? "Primary Bottleneck Category *" : "முக்கிய முடக்கக் காரணம் *"}
                  </label>
                  <select
                    value={transitionBottleneck}
                    onChange={(e) => setTransitionBottleneck(e.target.value)}
                    className="w-full bg-background border border-border text-xs p-2 rounded-lg text-foreground cursor-pointer outline-none focus:border-amber-500"
                  >
                    <option value="funding">{lang === "en" ? "Funding Constraints & Treasury Clearance" : "நிதிப் பற்றாக்குறை மற்றும் கருவூல அனுமதி"}</option>
                    <option value="legal">{lang === "en" ? "Legal Dispute or Court Stay Orders" : "சட்டச் சிக்கல்கள் அல்லது நீதிமன்றத் தடை"}</option>
                    <option value="administrative">{lang === "en" ? "Pending Inter-departmental approvals" : "துறைகளுக்கு இடையேயான ஒப்புதல் தாமதம்"}</option>
                    <option value="other">{lang === "en" ? "Other Socio-economic Bottlenecks" : "இதர சமூக-பொருளாதாரத் தடைகள்"}</option>
                  </select>
                </div>
              )}

              {/* Log Entry Description */}
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wide">
                  {lang === "en" ? "Official Progress Justification & Audited Notes *" : "அதிகாரப்பூர்வ முன்னேற்றக் குறிப்பு மற்றும் தணிக்கைக் குறிப்புகள் *"}
                </label>
                <textarea
                  rows={3}
                  required
                  value={transitionDesc}
                  onChange={(e) => setTransitionDesc(e.target.value)}
                  placeholder={lang === "en" ? "Record what was achieved to warrant this status transition..." : "இந்த நிலையை மாற்றுவதற்கான காரணங்களைப் பதிவுசெய்க..."}
                  className="w-full bg-background border border-border focus:border-amber-500 text-xs p-3 rounded-lg text-foreground outline-none resize-none transition-colors"
                />
              </div>
            </div>

            {/* Buttons */}
            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                onClick={() => {
                  setActiveTransition(null);
                  setTransitionDesc("");
                  setTransitionSourceUrl("");
                  setTransitionBudgetAmount("");
                  setTransitionBottleneck("funding");
                }}
                className="px-3.5 py-1.5 text-xs font-semibold text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
              >
                {lang === "en" ? "Cancel" : "ரத்துசெய்"}
              </button>
              <button
                disabled={!transitionDesc.trim() || !transitionSourceUrl.trim()}
                onClick={submitTransition}
                className="px-4 py-2 text-xs font-bold text-white bg-blue-600 hover:bg-blue-500 disabled:opacity-40 disabled:cursor-not-allowed rounded-xl transition-all cursor-pointer"
              >
                {lang === "en" ? "Confirm Transition" : "மாற்றத்தை உறுதிசெய்"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Board Scroll Wrapper */}
      <div className="flex gap-4 overflow-x-auto pb-6 h-[calc(100vh-230px)] select-none">
        {COLUMNS.map((colName) => {
          const colPromises = promises.filter((p) => p.status === colName);
          const colorStyles = COLUMN_COLORS[colName];

          // Localize Column Name
          const localizedColName = 
            colName === "Announced" ? (lang === "en" ? "Announced" : "அறிவிக்கப்பட்டது") :
            colName === "Planned" ? (lang === "en" ? "Planned" : "திட்டமிடப்பட்டது") :
            colName === "Budget Allocated" ? (lang === "en" ? "Budget Allocated" : "பட்ஜெட் ஒதுக்கப்பட்டது") :
            colName === "In Progress" ? (lang === "en" ? "In Progress" : "செயல்பாட்டில்") :
            colName === "Delayed" ? (lang === "en" ? "Delayed" : "தாமதமானது") :
            colName === "Blocked" ? (lang === "en" ? "Blocked" : "முடக்கப்பட்டது") :
            (lang === "en" ? "Completed" : "நிறைவடைந்தது");

          return (
            <div
              key={colName}
              className={`flex flex-col w-72 h-full rounded-2xl border border-border p-4 shrink-0 border-t-2 bg-muted/10 ${colorStyles}`}
            >
              {/* Column Header */}
              <div className="flex items-center justify-between pb-3.5 border-b border-border mb-4">
                <div className="flex items-center gap-2">
                  <p className="text-xs font-bold text-foreground tracking-wide">{localizedColName}</p>
                  <span className="text-[10px] font-bold px-1.5 py-0.5 bg-muted text-muted-foreground rounded-md">
                    {colPromises.length}
                  </span>
                </div>
              </div>

              {/* Column Cards List */}
              <div className="flex flex-col gap-3 overflow-y-auto pr-2 flex-1">
                {colPromises.length > 0 ? (
                  colPromises.map((p) => {
                    const budgetAmt = p.budget_amount 
                      ? `₹${(p.budget_amount / 10000000).toFixed(1)} Cr`
                      : (lang === "en" ? "No Budget" : "பட்ஜெட் இல்லை");

                    return (
                      <div
                        key={p.id}
                        className="group p-4 rounded-xl bg-card border border-border hover:border-muted-foreground/30 transition-all duration-150 flex flex-col justify-between min-h-36 shadow-sm shrink-0"
                      >
                        <div className="space-y-3">
                          {/* Top tags row */}
                          <div className="flex items-center justify-between gap-2">
                            <div className="flex items-center gap-1.5 flex-wrap">
                              <span className="text-[9px] font-bold text-blue-500 bg-blue-500/10 px-1.5 py-0.5 rounded border border-blue-500/20">
                                {lang === "en" ? p.framework : p.framework === "Aram" ? "அறம்" : p.framework === "Porul" ? "பொருள்" : "இன்பம்"}
                              </span>
                              {p.id === "p0-tvk-journey" && (
                                <span className="text-[9px] font-bold px-1.5 py-0.5 bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20 rounded uppercase tracking-wider animate-pulse">
                                  ⚠️ {lang === "en" ? "Example" : "உதாரணம்"}
                                </span>
                              )}
                            </div>
                            <PriorityBadge priority={p.priority} />
                          </div>

                          {/* Link to detail page */}
                          <Link href={`/promises/${p.id}`}>
                            <h4 className="text-xs font-bold text-foreground leading-relaxed line-clamp-2 group-hover:text-primary transition-colors cursor-pointer mt-1">
                              {p.title}
                            </h4>
                          </Link>
                        </div>

                        {/* Progress slider and action buttons */}
                        <div className="mt-4 pt-3 border-t border-border space-y-2.5">
                          {/* Mini Progress */}
                          <div className="space-y-1">
                            <div className="flex items-center justify-between text-[9px] font-bold text-muted-foreground uppercase">
                              <span>{t.progress}</span>
                              <span className="font-mono">{p.progress_percentage}%</span>
                            </div>
                            <div className="w-full bg-muted rounded-full h-1 overflow-hidden">
                              <div className="bg-blue-600 h-1 rounded-full" style={{ width: `${p.progress_percentage}%` }}></div>
                            </div>
                          </div>

                          {/* Action row */}
                          <div className="flex items-center justify-between pt-0.5 gap-2">
                            <span className="flex items-center gap-1 text-[9px] font-semibold text-muted-foreground shrink-0">
                              <Coins className="w-3 h-3 text-amber-500/80" />
                              <span>{budgetAmt}</span>
                            </span>

                            {/* Transition arrows (Admin only) */}
                            {role === "Admin" ? (
                              <div className="flex items-center gap-1 shrink-0">
                                <button
                                  disabled={COLUMNS.indexOf(colName) === 0}
                                  onClick={() => handleMoveCard(p.id, colName, "prev")}
                                  className="p-1 rounded bg-background border border-border text-muted-foreground hover:text-foreground hover:border-muted-foreground disabled:opacity-20 disabled:pointer-events-none transition-colors"
                                >
                                  <ChevronLeft className="w-3.5 h-3.5" />
                                </button>
                                <button
                                  disabled={COLUMNS.indexOf(colName) === COLUMNS.length - 1}
                                  onClick={() => handleMoveCard(p.id, colName, "next")}
                                  className="p-1 rounded bg-background border border-border text-muted-foreground hover:text-foreground hover:border-muted-foreground disabled:opacity-20 disabled:pointer-events-none transition-colors"
                                >
                                  <ChevronRight className="w-3.5 h-3.5" />
                                </button>
                              </div>
                            ) : (
                              <span className="flex items-center gap-1 text-[9px] font-semibold text-muted-foreground">
                                <MapPin className="w-3 h-3 text-muted-foreground" />
                                <span>{p.districts?.includes("All Districts") ? (lang === "en" ? "State" : "மாநிலம்") : `${p.districts?.length} ${lang === "en" ? "districts" : "மாவட்டங்கள்"}`}</span>
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })
                ) : (
                  <div className="flex flex-col items-center justify-center py-10 rounded-xl border border-dashed border-border text-muted-foreground/60 text-[10px] font-semibold uppercase">
                    <span>{lang === "en" ? "Empty Stage" : "காலியாக உள்ளது"}</span>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
