"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { promiseService } from "@/lib/db";
import { PromiseItem, FrameworkType, PromiseStatus, PromisePriority } from "@/types";
import StatusBadge from "@/components/StatusBadge";
import PriorityBadge from "@/components/PriorityBadge";
import { 
  Search, 
  Filter, 
  Layers, 
  CheckSquare, 
  Activity, 
  AlertTriangle, 
  TrendingUp, 
  Coins, 
  MapPin, 
  ChevronRight,
  Sparkles,
  Clock,
  Award,
  ArrowRight
} from "lucide-react";
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  Tooltip, 
  ResponsiveContainer,
  AreaChart,
  Area,
  CartesianGrid
} from "recharts";

export default function Dashboard() {
  const [promises, setPromises] = useState<PromiseItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  
  // Filters state
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [selectedFramework, setSelectedFramework] = useState<FrameworkType | "All">("All");
  const [selectedStatus, setSelectedStatus] = useState<PromiseStatus | "All">("All");
  const [selectedPriority, setSelectedPriority] = useState<PromisePriority | "All">("All");

  useEffect(() => {
    async function loadData() {
      setLoading(true);
      const data = await promiseService.getPromises();
      setPromises(data);
      setLoading(false);
    }
    loadData();

    // Listen to role changes to refresh data if status transitions happened
    window.addEventListener("namma_arasu_role_change", loadData);
    return () => window.removeEventListener("namma_arasu_role_change", loadData);
  }, []);

  // Compute stats
  const totalCount = promises.length;
  const completedCount = promises.filter((p) => p.status === "Completed").length;
  const inProgressCount = promises.filter((p) => ["In Progress", "Budget Allocated"].includes(p.status)).length;
  const delayedCount = promises.filter((p) => ["Delayed", "Blocked"].includes(p.status)).length;
  const completionRate = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;
  
  const totalBudget = promises.reduce((sum, p) => sum + (p.budget_amount || 0), 0);
  const budgetInCrores = (totalBudget / 10000000).toFixed(1);

  // Filtered data
  const filteredPromises = promises.filter((p) => {
    const matchesSearch = 
      p.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.tags.some(t => t.toLowerCase().includes(searchQuery.toLowerCase()));
    
    const matchesFramework = selectedFramework === "All" || p.framework === selectedFramework;
    const matchesStatus = selectedStatus === "All" || p.status === selectedStatus;
    const matchesPriority = selectedPriority === "All" || p.priority === selectedPriority;

    return matchesSearch && matchesFramework && matchesStatus && matchesPriority;
  });

  // Chart 1: Framework analysis (Total vs Completed)
  const getFrameworkChartData = () => {
    const frameworks: FrameworkType[] = ["Aram", "Porul", "Inbam"];
    return frameworks.map((fw) => {
      const fwPromises = promises.filter((p) => p.framework === fw);
      const completed = fwPromises.filter((p) => p.status === "Completed").length;
      return {
        name: fw === "Aram" ? "Aram (Ethics)" : fw === "Porul" ? "Porul (Wealth)" : "Inbam (Joy)",
        Total: fwPromises.length,
        Completed: completed,
      };
    });
  };

  // Chart 2: Status pipeline distribution
  const getStatusChartData = () => {
    const statuses: PromiseStatus[] = [
      "Announced", "Planned", "Budget Allocated", "In Progress", "Delayed", "Blocked", "Completed"
    ];
    return statuses.map((status) => {
      const count = promises.filter((p) => p.status === status).length;
      return {
        name: status.split(" ").slice(0, 2).join(" "), // Shorter names
        Promises: count,
      };
    });
  };

  const clearFilters = () => {
    setSearchQuery("");
    setSelectedFramework("All");
    setSelectedStatus("All");
    setSelectedPriority("All");
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] gap-4">
        <div className="h-10 w-10 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
        <p className="text-xs text-muted-foreground font-medium animate-pulse">Retrieving civic metadata...</p>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Welcome Panel */}
      <div className="p-6 rounded-2xl border border-border bg-gradient-to-r from-card to-muted/20 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div className="space-y-1">
          <h2 className="text-xl font-bold text-foreground flex items-center gap-2">
            Governance Command Center <Sparkles className="w-4 h-4 text-amber-500" />
          </h2>
          <p className="text-xs text-muted-foreground font-medium leading-relaxed">
            Transparently auditing the TVK Manifesto commitments. Review live progress trackers, regional implementations, and citizen evidence logs.
          </p>
        </div>
        <Link 
          href="/kanban" 
          className="shrink-0 inline-flex items-center gap-1.5 px-4 py-2 text-xs font-bold text-white bg-blue-600 hover:bg-blue-500 rounded-xl transition-all shadow-[0_0_15px_rgba(37,99,235,0.2)] active-glow self-start md:self-auto"
        >
          <span>Open Kanban Board</span>
          <ChevronRight className="w-3.5 h-3.5" />
        </Link>
      </div>

      {/* Featured Showcase Hero Card — Always visible at the top */}
      <Link
        href="/promises/p0-tvk-journey"
        className="group block p-6 rounded-2xl border border-blue-500/20 bg-gradient-to-br from-blue-500/5 via-card to-purple-500/5 shadow-sm hover:shadow-md hover:border-blue-500/30 transition-all duration-300"
      >
        <div className="flex flex-col lg:flex-row lg:items-center gap-5">
          {/* Left: Icon + Text */}
          <div className="flex-1 space-y-3">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="inline-flex items-center gap-1 text-[9px] font-bold px-2 py-0.5 rounded-md border bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20 uppercase tracking-wider">
                <Award className="w-3 h-3" /> Showcase Example
              </span>
              <span className="inline-flex items-center gap-1 text-[9px] font-bold px-2 py-0.5 rounded-md border bg-teal-500/10 text-teal-600 dark:text-teal-400 border-teal-500/20 uppercase tracking-wider">
                Completed · 100%
              </span>
            </div>
            <h3 className="text-lg font-black text-foreground tracking-tight leading-snug group-hover:text-blue-500 transition-colors">
              TVK&apos;s Journey: A Commitment to Lead the Nation
            </h3>
            <p className="text-xs text-muted-foreground leading-relaxed max-w-2xl">
              A verified timeline tracing TVK&apos;s historic rise — from party launch in Feb 2024, the 15M-member grassroots drive, the Aram-Porul-Inbam manifesto unveiling in April 2026, through to winning 108 seats with 85.1% voter turnout.
            </p>
          </div>

          {/* Right: Mini timeline */}
          <div className="shrink-0 flex flex-col gap-2.5 lg:min-w-[280px]">
            {[
              { date: "Feb 2, 2024", label: "TVK officially launched" },
              { date: "Jul 2025", label: "15M membership milestone" },
              { date: "Apr 16, 2026", label: "Aram-Porul-Inbam manifesto unveiled" },
              { date: "Apr 23, 2026", label: "Single-phase polling · 85.1% turnout" },
              { date: "May 5, 2026", label: "108 seats won · CM-designate" }
            ].map((item, i) => (
              <div key={i} className="flex items-start gap-2.5">
                <div className="mt-0.5 h-2 w-2 rounded-full bg-blue-500 shrink-0" />
                <div className="flex items-baseline gap-2">
                  <span className="text-[9px] font-bold text-muted-foreground whitespace-nowrap uppercase tracking-wide">{item.date}</span>
                  <span className="text-[10px] text-foreground font-medium">{item.label}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Bottom CTA */}
        <div className="mt-5 pt-4 border-t border-border flex items-center justify-between">
          <div className="flex items-center gap-1.5 text-[10px] font-semibold text-amber-600 dark:text-amber-400">
            <AlertTriangle className="w-3.5 h-3.5" />
            <span className="uppercase tracking-wider">This is a pre-seeded example demonstrating NammaArasu&apos;s interactive features</span>
          </div>
          <span className="inline-flex items-center gap-1 text-xs font-bold text-blue-500 group-hover:gap-2 transition-all">
            View Full Timeline <ArrowRight className="w-3.5 h-3.5" />
          </span>
        </div>
      </Link>

      {/* Metrics Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
        {/* Metric 1 */}
        <div className="p-4 rounded-2xl bg-card border border-border flex flex-col justify-between h-28 shadow-sm">
          <div className="flex items-center justify-between text-muted-foreground">
            <span className="text-[10px] font-bold uppercase tracking-wider">Total Promises</span>
            <Layers className="w-4 h-4 text-blue-500" />
          </div>
          <div>
            <p className="text-2xl font-black text-foreground">{totalCount}</p>
            <p className="text-[9px] text-muted-foreground font-medium">Manifesto Commitments</p>
          </div>
        </div>

        {/* Metric 2 */}
        <div className="p-4 rounded-2xl bg-card border border-border flex flex-col justify-between h-28 shadow-sm">
          <div className="flex items-center justify-between text-muted-foreground">
            <span className="text-[10px] font-bold uppercase tracking-wider">Completion Rate</span>
            <CheckSquare className="w-4 h-4 text-teal-500" />
          </div>
          <div>
            <p className="text-2xl font-black text-teal-500">{completionRate}%</p>
            <div className="w-full bg-muted rounded-full h-1 mt-1.5 overflow-hidden">
              <div className="bg-teal-500 h-1 rounded-full" style={{ width: `${completionRate}%` }}></div>
            </div>
          </div>
        </div>

        {/* Metric 3 */}
        <div className="p-4 rounded-2xl bg-card border border-border flex flex-col justify-between h-28 shadow-sm">
          <div className="flex items-center justify-between text-muted-foreground">
            <span className="text-[10px] font-bold uppercase tracking-wider">Active Projects</span>
            <Activity className="w-4 h-4 text-emerald-500" />
          </div>
          <div>
            <p className="text-2xl font-black text-emerald-500">{inProgressCount}</p>
            <p className="text-[9px] text-muted-foreground font-medium">In Implementation Loop</p>
          </div>
        </div>

        {/* Metric 4 */}
        <div className="p-4 rounded-2xl bg-card border border-border flex flex-col justify-between h-28 shadow-sm">
          <div className="flex items-center justify-between text-muted-foreground">
            <span className="text-[10px] font-bold uppercase tracking-wider">Bottlenecks</span>
            <AlertTriangle className="w-4 h-4 text-rose-500" />
          </div>
          <div>
            <p className="text-2xl font-black text-rose-500">{delayedCount}</p>
            <p className="text-[9px] text-muted-foreground font-medium">Delayed or Blocked</p>
          </div>
        </div>

        {/* Metric 5 */}
        <div className="p-4 rounded-2xl bg-card border border-border flex flex-col justify-between h-28 col-span-2 lg:col-span-1 shadow-sm">
          <div className="flex items-center justify-between text-muted-foreground">
            <span className="text-[10px] font-bold uppercase tracking-wider">State Budget Allocated</span>
            <Coins className="w-4 h-4 text-amber-500" />
          </div>
          <div>
            <p className="text-2xl font-black text-amber-500">₹{budgetInCrores} Cr</p>
            <p className="text-[9px] text-muted-foreground font-medium">Awaiting Government Formation</p>
          </div>
        </div>
      </div>

      {/* Visualizations Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Chart 1: Frameworks bar */}
        <div className="p-5 rounded-2xl border border-border bg-card lg:col-span-7 flex flex-col gap-4 shadow-sm">
          <div className="flex items-center gap-2 pb-2 border-b border-border">
            <TrendingUp className="w-4 h-4 text-blue-500" />
            <h3 className="text-xs font-bold text-foreground uppercase tracking-wider">Framework Target Progress</h3>
          </div>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={getFrameworkChartData()} margin={{ top: 10, right: 10, left: -20, bottom: 5 }}>
                <CartesianGrid stroke="rgba(148, 163, 184, 0.1)" strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="name" stroke="var(--muted-foreground)" fontSize={10} tickLine={false} />
                <YAxis stroke="var(--muted-foreground)" fontSize={10} tickLine={false} />
                <Tooltip
                  contentStyle={{ backgroundColor: "var(--card)", borderColor: "var(--border)", borderRadius: "12px" }}
                  itemStyle={{ fontSize: "11px", color: "var(--foreground)" }}
                  labelStyle={{ fontSize: "11px", fontWeight: "bold", color: "var(--muted-foreground)", marginBottom: "4px" }}
                />
                <Bar dataKey="Total" fill="var(--muted)" radius={[4, 4, 0, 0]} barSize={35} />
                <Bar dataKey="Completed" fill="#3b82f6" radius={[4, 4, 0, 0]} barSize={35} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Chart 2: Pipeline area */}
        <div className="p-5 rounded-2xl border border-border bg-card lg:col-span-5 flex flex-col gap-4 shadow-sm">
          <div className="flex items-center gap-2 pb-2 border-b border-border">
            <Activity className="w-4 h-4 text-purple-500" />
            <h3 className="text-xs font-bold text-foreground uppercase tracking-wider">Status Pipeline distribution</h3>
          </div>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={getStatusChartData()} margin={{ top: 10, right: 10, left: -20, bottom: 5 }}>
                <CartesianGrid stroke="rgba(148, 163, 184, 0.1)" strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="name" stroke="var(--muted-foreground)" fontSize={9} tickLine={false} />
                <YAxis stroke="var(--muted-foreground)" fontSize={10} tickLine={false} />
                <Tooltip
                  contentStyle={{ backgroundColor: "var(--card)", borderColor: "var(--border)", borderRadius: "12px" }}
                  itemStyle={{ fontSize: "11px", color: "var(--foreground)" }}
                  labelStyle={{ fontSize: "11px", fontWeight: "bold", color: "var(--muted-foreground)", marginBottom: "4px" }}
                />
                <Area type="monotone" dataKey="Promises" stroke="#a855f7" fillOpacity={0.15} fill="url(#colorPromises)" strokeWidth={2} />
                <defs>
                  <linearGradient id="colorPromises" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#a855f7" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#a855f7" stopOpacity={0}/>
                  </linearGradient>
                </defs>
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Advanced Filters section */}
      <div className="p-5 rounded-2xl border border-border bg-card space-y-4 shadow-sm">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-3 border-b border-border">
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-blue-500" />
            <h3 className="text-sm font-bold text-foreground uppercase tracking-wide">Faceted Manifesto Filters</h3>
          </div>
          {(searchQuery || selectedFramework !== "All" || selectedStatus !== "All" || selectedPriority !== "All") && (
            <button
              onClick={clearFilters}
              className="text-xs font-semibold text-blue-500 hover:text-blue-400 transition-colors self-start md:self-auto cursor-pointer"
            >
              Reset All Filters
            </button>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {/* Search Box */}
          <div className="relative">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by title, keyword, tags..."
              className="w-full bg-background border border-border focus:border-primary text-xs px-10 py-2.5 rounded-xl text-foreground outline-none focus:ring-1 focus:ring-blue-500/50 transition-all"
            />
          </div>

          {/* Framework Selector */}
          <select
            value={selectedFramework}
            onChange={(e) => setSelectedFramework(e.target.value as FrameworkType | "All")}
            className="w-full bg-background border border-border focus:border-primary text-xs px-3.5 py-2.5 rounded-xl text-foreground outline-none focus:ring-1 focus:ring-blue-500/50 transition-all cursor-pointer"
          >
            <option value="All">All Frameworks</option>
            <option value="Aram">Aram (Ethics)</option>
            <option value="Porul">Porul (Wealth)</option>
            <option value="Inbam">Inbam (Happiness)</option>
          </select>

          {/* Status Selector */}
          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value as PromiseStatus | "All")}
            className="w-full bg-background border border-border focus:border-primary text-xs px-3.5 py-2.5 rounded-xl text-foreground outline-none focus:ring-1 focus:ring-blue-500/50 transition-all cursor-pointer"
          >
            <option value="All">All Statuses</option>
            <option value="Announced">Announced</option>
            <option value="Planned">Planned</option>
            <option value="Budget Allocated">Budget Allocated</option>
            <option value="In Progress">In Progress</option>
            <option value="Delayed">Delayed</option>
            <option value="Blocked">Blocked</option>
            <option value="Completed">Completed</option>
          </select>

          {/* Priority Selector */}
          <select
            value={selectedPriority}
            onChange={(e) => setSelectedPriority(e.target.value as PromisePriority | "All")}
            className="w-full bg-background border border-border focus:border-primary text-xs px-3.5 py-2.5 rounded-xl text-foreground outline-none focus:ring-1 focus:ring-blue-500/50 transition-all cursor-pointer"
          >
            <option value="All">All Priorities</option>
            <option value="Low">Low</option>
            <option value="Medium">Medium</option>
            <option value="High">High</option>
            <option value="Critical">Critical</option>
          </select>
        </div>
      </div>

      {/* Promises List Grid */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <p className="text-xs font-bold text-muted-foreground uppercase tracking-wide">
            Manifesto Commitments ({filteredPromises.length})
          </p>
        </div>

        {filteredPromises.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredPromises.map((promise) => {
              const budgetAmt = promise.budget_amount 
                ? `₹${(promise.budget_amount / 10000000).toFixed(1)} Cr`
                : "Awaiting Budget Allocation";

              const affectedDistricts = promise.districts?.includes("All Districts")
                ? "State-wide (All Districts)"
                : `${promise.districts?.length || 0} districts affected`;

              return (
                <Link
                  key={promise.id}
                  href={`/promises/${promise.id}`}
                  className="group flex flex-col justify-between p-5 rounded-2xl border border-border bg-card hover:bg-muted/10 shadow-sm transition-all duration-200 text-left"
                >
                  <div className="space-y-3.5">
                    {/* Badges row */}
                    <div className="flex items-center justify-between gap-2 flex-wrap">
                      <span className={`text-[9px] font-bold px-2 py-0.5 rounded-md border uppercase tracking-wider ${
                        promise.framework === "Aram" 
                          ? "bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20"
                          : promise.framework === "Porul"
                          ? "bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 border-cyan-500/20"
                          : "bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-500/20"
                      }`}>
                        {promise.framework} Framework
                      </span>

                      {promise.id === "p0-tvk-journey" && (
                        <span className="text-[9px] font-bold px-2 py-0.5 bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20 rounded-md uppercase tracking-wider animate-pulse">
                          ⚠️ Example Card
                        </span>
                      )}

                      <div className="flex items-center gap-2">
                        <PriorityBadge priority={promise.priority} />
                        <StatusBadge status={promise.status} />
                      </div>
                    </div>

                    {/* Title & Desc */}
                    <div className="space-y-1.5">
                      <h4 className="text-sm font-bold text-foreground group-hover:text-primary transition-colors line-clamp-1">
                        {promise.title}
                      </h4>
                      <p className="text-xs text-muted-foreground line-clamp-2 leading-relaxed">
                        {promise.description}
                      </p>
                    </div>
                  </div>

                  {/* Progress & Bottom Metadata */}
                  <div className="mt-5 pt-4 border-t border-border space-y-3">
                    <div className="space-y-1">
                      <div className="flex items-center justify-between text-[10px] font-bold text-muted-foreground uppercase tracking-wide">
                        <span>Implementation Progress</span>
                        <span className="text-foreground font-mono">{promise.progress_percentage}%</span>
                      </div>
                      <div className="w-full bg-muted rounded-full h-1.5 overflow-hidden">
                        <div 
                          className={`h-1.5 rounded-full transition-all duration-300 ${
                            promise.status === "Completed" ? "bg-teal-500" : "bg-blue-600"
                          }`}
                          style={{ width: `${promise.progress_percentage}%` }}
                        ></div>
                      </div>
                    </div>

                    <div className="flex items-center justify-between text-[10px] font-semibold text-muted-foreground pt-0.5">
                      <span className="flex flex-col gap-0.5">
                        <span className="flex items-center gap-1">
                          <Coins className="w-3.5 h-3.5 text-amber-500/80" />
                          <span className="text-muted-foreground">
                            {promise.manifesto_quoted_figure
                              ? `Promised: ${promise.manifesto_quoted_figure}`
                              : "No figure quoted"}
                          </span>
                        </span>
                        {promise.budget_amount ? (
                          <span className="text-[9px] text-teal-600 dark:text-teal-400 pl-5">
                            Allocated: ₹{(promise.budget_amount / 10000000).toFixed(1)} Cr
                          </span>
                        ) : null}
                      </span>

                      <span className="flex items-center gap-1">
                        <MapPin className="w-3.5 h-3.5 text-muted-foreground" />
                        <span className="text-muted-foreground truncate max-w-[120px]">{affectedDistricts}</span>
                      </span>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        ) : (
          <div className="p-12 text-center rounded-2xl border border-border bg-card space-y-2">
            <Layers className="w-8 h-8 text-muted-foreground/60 mx-auto" />
            <p className="text-xs font-bold text-foreground">No manifesto promises found matching your filters</p>
            <p className="text-[10px] text-muted-foreground">Try adjusting your keywords, selecting different frameworks, or clearing active selectors.</p>
          </div>
        )}
      </div>
    </div>
  );
}
