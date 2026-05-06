"use client";

import React, { useState, useEffect, use } from "react";
import Link from "next/link";
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

type PageProps = {
  params: Promise<{ id: string }>;
};

export default function PromiseDetailPageClient({ params }: PageProps) {
  const { id } = use(params);
  
  const [promise, setPromise] = useState<PromiseItem | null>(null);
  const [updates, setUpdates] = useState<UpdateItem[]>([]);
  const [evidenceList, setEvidenceList] = useState<EvidenceItem[]>([]);
  const [comments, setComments] = useState<CommentItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [role, setRole] = useState<"Citizen" | "Admin">("Citizen");

  // Input states
  const [newUpdateTitle, setNewUpdateTitle] = useState<string>("");
  const [newUpdateDesc, setNewUpdateDesc] = useState<string>("");
  
  const [evidenceType, setEvidenceType] = useState<"image" | "video" | "document">("image");
  const [evidenceUrl, setEvidenceUrl] = useState<string>("");
  const [evidenceDistrict, setEvidenceDistrict] = useState<string>("");
  const [evidenceDesc, setEvidenceDesc] = useState<string>("");

  const [commentAuthor, setCommentAuthor] = useState<string>("");
  const [commentContent, setCommentContent] = useState<string>("");

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

    // Listen to role toggling from header
    const handleRoleChange = () => {
      const savedRole = localStorage.getItem("namma_arasu_role") as "Citizen" | "Admin";
      setRole(savedRole || "Citizen");
    };
    window.addEventListener("namma_arasu_role_change", handleRoleChange);
    return () => window.removeEventListener("namma_arasu_role_change", handleRoleChange);
  }, [id]);

  // Handle Admin updating progress directly
  const handleProgressChange = async (val: number) => {
    if (!promise) return;
    const isCompleted = val === 100;
    const nextStatus: PromiseStatus = isCompleted ? "Completed" : "In Progress";

    const updated = await promiseService.updatePromise(promise.id, {
      progress_percentage: val,
      status: nextStatus
    });

    if (updated) {
      setPromise(updated);
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
        <h3 className="text-sm font-bold text-white uppercase tracking-wider">Promise Not Found</h3>
        <p className="text-xs text-slate-500">The requested manifesto ID does not match any pre-seeded record.</p>
        <Link href="/" className="inline-block text-xs font-bold text-blue-400 hover:underline">
          Return to Dashboard
        </Link>
      </div>
    );
  }

  const budgetCrores = promise.budget_amount 
    ? `₹${(promise.budget_amount / 10000000).toFixed(1)} Crores` 
    : "Awaiting Budget Allocation";

  return (
    <div className="space-y-8 animate-fade-in pb-12">
      {/* Back button */}
      <div>
        <Link href="/" className="inline-flex items-center gap-1 text-xs font-semibold text-muted-foreground hover:text-foreground transition-colors">
          <ChevronLeft className="w-4 h-4" />
          <span>Back to Governance Dashboard</span>
        </Link>
      </div>

      {/* Example Showcase Warning Banner */}
      {promise.id === "p0-tvk-journey" && (
        <div className="p-4 rounded-2xl border border-amber-500/20 bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-start gap-3 shadow-[0_0_15px_rgba(245,158,11,0.05)]">
          <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
          <div className="space-y-1">
            <p className="text-xs font-bold uppercase tracking-wider">Example Showcase Card</p>
            <p className="text-[11px] leading-relaxed text-amber-700/80 dark:text-amber-400/80 font-medium">
              This card is a pre-seeded demonstration example showing NammaArasu's interactive progress timeline, official gazette log entries, citizen-uploaded proof verification, and public discussion feeds.
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
                ? "bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20"
                : promise.framework === "Porul"
                ? "bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 border-cyan-500/20"
                : "bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-500/20"
            }`}>
              {promise.framework} Framework • {promise.pillar}
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
              {promise.description}
            </p>
          </div>

          {/* Progress Section */}
          <div className="pt-4 border-t border-border space-y-2.5">
            <div className="flex items-center justify-between text-[10px] font-bold text-muted-foreground uppercase tracking-wide">
              <span>Audited Completion Progress</span>
              <span className="text-foreground font-mono">{promise.progress_percentage}%</span>
            </div>
            
            {role === "Admin" ? (
              <div className="space-y-2">
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={promise.progress_percentage}
                  onChange={(e) => handleProgressChange(Number(e.target.value))}
                  className="w-full h-1.5 bg-muted rounded-lg appearance-none cursor-pointer accent-blue-500"
                />
                <p className="text-[10px] text-amber-500 font-semibold flex items-center gap-1 uppercase">
                  <Activity className="w-3.5 h-3.5 animate-pulse" />
                  <span>Admin Mode Active: Drag slider to dynamically update progress.</span>
                </p>
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
              <h3 className="text-xs font-bold text-foreground uppercase tracking-wider">Implementation Timeline</h3>
            </div>

            {/* Admin Add Timeline Log */}
            {role === "Admin" && (
              <form onSubmit={handleAddUpdate} className="p-4 rounded-xl border border-border bg-muted/20 space-y-3.5">
                <p className="text-[10px] font-bold text-amber-500 uppercase flex items-center gap-1">
                  <Activity className="w-3.5 h-3.5" />
                  <span>Post Official Progress Entry</span>
                </p>
                
                <div className="space-y-3">
                  <input
                    type="text"
                    required
                    value={newUpdateTitle}
                    onChange={(e) => setNewUpdateTitle(e.target.value)}
                    placeholder="Log title (e.g. 'Site Inspection Completed')"
                    className="w-full bg-background border border-border focus:border-primary text-xs px-3.5 py-2 rounded-lg text-foreground outline-none"
                  />
                  <textarea
                    required
                    rows={2}
                    value={newUpdateDesc}
                    onChange={(e) => setNewUpdateDesc(e.target.value)}
                    placeholder="Provide full official details or outcomes achieved..."
                    className="w-full bg-background border border-border focus:border-primary text-xs p-3 rounded-lg text-foreground outline-none resize-none"
                  />
                  <button type="submit" className="px-4 py-2 text-xs font-bold text-white bg-blue-600 hover:bg-blue-500 rounded-lg transition-colors cursor-pointer">
                    Post Log Entry
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
                          {new Date(up.created_at).toLocaleDateString()}
                        </span>
                      </div>
                      <p className="text-xs text-muted-foreground leading-relaxed">
                        {up.description}
                      </p>
                      <p className="text-[9px] text-muted-foreground font-semibold uppercase flex items-center gap-1 pt-0.5">
                        <ShieldCheck className="w-3 h-3 text-emerald-500" />
                        <span>Source: {up.created_by}</span>
                      </p>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-muted-foreground text-xs py-4 pl-2 font-medium">
                  No implementation timeline recorded yet.
                </div>
              )}
            </div>
          </div>

          {/* Citizen Evidence Upload Gallery */}
          <div className="p-5 rounded-2xl border border-border bg-card space-y-6 shadow-sm">
            <div className="flex items-center gap-2 pb-3.5 border-b border-border">
              <Upload className="w-4 h-4 text-emerald-500" />
              <h3 className="text-xs font-bold text-foreground uppercase tracking-wider">Citizen Evidence Hub</h3>
            </div>

            {/* Evidence form */}
            <form onSubmit={handleAddEvidence} className="p-4 rounded-xl border border-border bg-muted/20 space-y-3.5">
              <p className="text-[10px] font-bold text-muted-foreground uppercase">
                Submit Implementation Proof or Report Bottlenecks
              </p>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <select
                  value={evidenceType}
                  onChange={(e) => setEvidenceType(e.target.value as any)}
                  className="bg-background border border-border text-xs p-2 rounded-lg text-foreground cursor-pointer outline-none"
                >
                  <option value="image">Image (Photo)</option>
                  <option value="document">Document (PDF/Report)</option>
                  <option value="video">Video</option>
                </select>

                <input
                  type="text"
                  required
                  value={evidenceUrl}
                  onChange={(e) => setEvidenceUrl(e.target.value)}
                  placeholder="Paste direct file URL (image path)..."
                  className="md:col-span-2 bg-background border border-border text-xs px-3.5 py-2 rounded-lg text-foreground outline-none"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
                <input
                  type="text"
                  value={evidenceDistrict}
                  onChange={(e) => setEvidenceDistrict(e.target.value)}
                  placeholder="Affected District (e.g. Madurai)..."
                  className="bg-background border border-border text-xs px-3.5 py-2 rounded-lg text-foreground outline-none"
                />

                <input
                  type="text"
                  required
                  value={evidenceDesc}
                  onChange={(e) => setEvidenceDesc(e.target.value)}
                  placeholder="Evidence Description / Observations..."
                  className="md:col-span-3 bg-background border border-border text-xs px-3.5 py-2 rounded-lg text-foreground outline-none"
                />
              </div>

              <button type="submit" className="px-4 py-2 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-500 rounded-lg transition-colors flex items-center gap-1.5 shadow-[0_0_15px_rgba(16,185,129,0.1)] cursor-pointer">
                <Upload className="w-3.5 h-3.5" />
                <span>Submit Proof</span>
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
                        <img 
                          src={ev.file_url} 
                          alt="Citizen Proof" 
                          className="object-cover h-full w-full opacity-80" 
                          onError={(e) => {
                            (e.target as HTMLElement).style.display = "none";
                          }}
                        />
                        <div className="absolute inset-0 flex items-center justify-center bg-slate-900/40">
                          <CheckCircle2 className="w-6 h-6 text-emerald-400" />
                        </div>
                      </div>
                    )}

                    <div>
                      <div className="flex items-center justify-between gap-2 pb-1.5 border-b border-border mb-2">
                        <span className="text-[9px] font-bold text-muted-foreground uppercase">
                          {ev.type} • {ev.district || "Statewide"}
                        </span>
                        <span className="text-[9px] font-bold text-teal-600 dark:text-teal-400 uppercase bg-teal-500/10 px-1.5 py-0.5 rounded border border-teal-500/20">
                          {ev.verification_status}
                        </span>
                      </div>
                      <p className="text-xs text-muted-foreground italic">
                        &ldquo;{ev.description}&rdquo;
                      </p>
                      <span className="text-[9px] text-muted-foreground font-medium block mt-2">
                        Submitted on {new Date(ev.created_at).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                ))
              ) : (
                <div className="col-span-2 text-center text-muted-foreground text-xs py-4 font-medium">
                  No citizen-uploaded evidence available yet. Be the first to upload.
                </div>
              )}
            </div>
          </div>

          {/* Comments Discussion Thread */}
          <div className="p-5 rounded-2xl border border-border bg-card space-y-6 shadow-sm">
            <div className="flex items-center gap-2 pb-3.5 border-b border-border">
              <MessageSquare className="w-4 h-4 text-blue-500" />
              <h3 className="text-xs font-bold text-foreground uppercase tracking-wider">Public Accountability Discussion</h3>
            </div>

            {/* Comment Form */}
            <form onSubmit={handleAddComment} className="p-4 rounded-xl border border-border bg-muted/20 space-y-3">
              <p className="text-[10px] font-bold text-muted-foreground uppercase">
                Join the conversation
              </p>
              
              <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
                <input
                  type="text"
                  value={commentAuthor}
                  onChange={(e) => setCommentAuthor(e.target.value)}
                  placeholder="Your Name (or Anonymous)..."
                  className="bg-background border border-border text-xs px-3.5 py-2.5 rounded-xl text-foreground outline-none"
                />
                
                <input
                  type="text"
                  required
                  value={commentContent}
                  onChange={(e) => setCommentContent(e.target.value)}
                  placeholder="Post citizen feedback, inquiries, or complaints..."
                  className="md:col-span-3 bg-background border border-border text-xs px-3.5 py-2.5 rounded-xl text-foreground outline-none"
                />
              </div>

              <button type="submit" className="px-4 py-2 text-xs font-bold text-white bg-blue-600 hover:bg-blue-500 rounded-lg transition-colors cursor-pointer">
                Post Comment
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
                          {new Date(comm.created_at).toLocaleDateString()}
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
                  No public comments posted yet.
                </div>
              )}
            </div>
          </div>

        </div>

        {/* Right Column (Sticky Metadata Pane) */}
        <div className="lg:col-span-4 lg:sticky lg:top-[90px] space-y-6">
          <div className="p-5 rounded-2xl border border-border bg-card space-y-5 shadow-sm">
            <h3 className="text-xs font-bold text-foreground uppercase tracking-wider pb-3 border-b border-border">
              Governance parameters
            </h3>

            {/* Budget */}
            <div className="flex gap-3">
              <div className="p-2 h-9 w-9 rounded-lg bg-amber-500/10 border border-amber-500/20 flex items-center justify-center shrink-0 text-amber-500">
                <Coins className="w-4 h-4" />
              </div>
              <div className="space-y-1">
                {promise.manifesto_quoted_figure && (
                  <div>
                    <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wide">Manifesto Quoted Figure</p>
                    <p className="text-xs font-bold text-amber-600 dark:text-amber-400">{promise.manifesto_quoted_figure}</p>
                  </div>
                )}
                <div>
                  <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wide">Approved Budget</p>
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
                <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wide">Target Deadline</p>
                <p className="text-xs font-bold text-foreground">
                  {promise.target_date ? new Date(promise.target_date).toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" }) : "Unspecified"}
                </p>
              </div>
            </div>

            {/* Departments */}
            <div className="flex gap-3">
              <div className="p-2 h-9 w-9 rounded-lg bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center shrink-0 text-cyan-500">
                <Building className="w-4 h-4" />
              </div>
              <div className="flex-1">
                <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wide">Responsible Departments</p>
                <div className="flex flex-wrap gap-1 mt-1">
                  {promise.departments && promise.departments.length > 0 ? (
                    promise.departments.map((dept) => (
                      <span key={dept} className="text-[9px] font-bold bg-muted border border-border px-2 py-0.5 rounded text-foreground">
                        {dept}
                      </span>
                    ))
                  ) : (
                    <span className="text-[10px] text-muted-foreground">Unassigned</span>
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
                <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wide">Affected Regions</p>
                <div className="flex flex-wrap gap-1 mt-1 max-h-36 overflow-y-auto">
                  {promise.districts && promise.districts.length > 0 ? (
                    promise.districts.map((dist) => (
                      <span key={dist} className="text-[9px] font-bold bg-muted border border-border px-2 py-0.5 rounded text-foreground">
                        {dist}
                      </span>
                    ))
                  ) : (
                    <span className="text-[10px] text-muted-foreground">Statewide</span>
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
                <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wide">Manifesto Mapping</p>
                <p className="text-xs font-bold text-foreground leading-relaxed">
                  Section: {promise.section}
                </p>
                {promise.id !== "p0-tvk-journey" && promise.framework && (
                  <a
                    href={`/manifesto/tvk_${promise.framework.toLowerCase()}.pdf`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 text-[10px] font-bold text-blue-500 hover:text-blue-400 transition-colors mt-1"
                  >
                    <ExternalLink className="w-3 h-3" />
                    <span>View Original Manifesto PDF</span>
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
