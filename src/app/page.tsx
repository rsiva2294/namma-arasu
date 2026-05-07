"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { promiseService } from "@/lib/db";
import { PromiseItem, FrameworkType, PromiseStatus, PromisePriority } from "@/types";
import StatusBadge from "@/components/StatusBadge";
import PriorityBadge from "@/components/PriorityBadge";
import { useLanguage } from "@/lib/i18n";
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
  ArrowRight,
  ChevronDown
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
  const { lang, t } = useLanguage();
  const [promises, setPromises] = useState<PromiseItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  
  // Filters state
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [selectedFramework, setSelectedFramework] = useState<FrameworkType | "All">("All");
  const [selectedStatus, setSelectedStatus] = useState<PromiseStatus | "All">("All");
  const [selectedPriority, setSelectedPriority] = useState<PromisePriority | "All">("All");
  const [selectedSection, setSelectedSection] = useState<string>("All");

  const [isSectionDropdownOpen, setIsSectionDropdownOpen] = useState<boolean>(false);
  const [sectionSearch, setSectionSearch] = useState<string>("");

  // Mobile drawer collapsing states
  const [showAnalytics, setShowAnalytics] = useState<boolean>(false);
  const [showFilters, setShowFilters] = useState<boolean>(false);

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

  useEffect(() => {
    const handleOutsideClick = (e: MouseEvent) => {
      const container = document.getElementById("section-select-container");
      if (container && !container.contains(e.target as Node)) {
        setIsSectionDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleOutsideClick);
    return () => document.removeEventListener("mousedown", handleOutsideClick);
  }, []);

  // Compute stats
  const totalCount = promises.length;
  const completedCount = promises.filter((p) => p.status === "Completed").length;
  const inProgressCount = promises.filter((p) => ["In Progress", "Budget Allocated"].includes(p.status)).length;
  const delayedCount = promises.filter((p) => ["Delayed", "Blocked"].includes(p.status)).length;
  const completionRate = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;
  
  const totalBudget = promises.reduce((sum, p) => sum + (p.budget_amount || 0), 0);
  const budgetInCrores = (totalBudget / 10000000).toFixed(1);

  // Dynamic unique sections list
  const uniqueSections = Array.from(
    new Set(
      promises
        .filter((p) => selectedFramework === "All" || p.framework === selectedFramework)
        .map((p) => p.section)
        .filter(Boolean)
    )
  ).sort() as string[];

  // Filtered data
  const filteredPromises = promises.filter((p) => {
    const matchesSearch = 
      p.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.tags.some(t => t.toLowerCase().includes(searchQuery.toLowerCase()));
    
    const matchesFramework = selectedFramework === "All" || p.framework === selectedFramework;
    const matchesStatus = selectedStatus === "All" || p.status === selectedStatus;
    const matchesPriority = selectedPriority === "All" || p.priority === selectedPriority;
    const matchesSection = selectedSection === "All" || p.section === selectedSection;

    return matchesSearch && matchesFramework && matchesStatus && matchesPriority && matchesSection;
  });

  // Always sort TVK's Journey card as the first card in the list
  const sortedPromises = [...filteredPromises].sort((a, b) => {
    if (a.id === "p0-tvk-journey") return -1;
    if (b.id === "p0-tvk-journey") return 1;
    return 0;
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

  const handleFrameworkChange = (fw: FrameworkType | "All") => {
    setSelectedFramework(fw);
    setSelectedSection("All");
  };

  const handleSectionChange = (section: string) => {
    setSelectedSection(section);
    if (section !== "All") {
      const match = promises.find((p) => p.section === section);
      if (match) {
        setSelectedFramework(match.framework);
      }
    }
  };

  const clearFilters = () => {
    setSearchQuery("");
    setSelectedFramework("All");
    setSelectedStatus("All");
    setSelectedPriority("All");
    setSelectedSection("All");
    setSectionSearch("");
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

      {/* Collapsible Analytics Toggle on Desktop & Mobile */}
      <button 
        onClick={() => setShowAnalytics(!showAnalytics)} 
        className="w-full flex items-center justify-between p-4 rounded-2xl border border-border bg-card hover:bg-muted/10 font-bold text-xs text-foreground uppercase tracking-wider transition-all cursor-pointer shadow-sm"
      >
        <span className="flex items-center gap-2">
          <TrendingUp className="w-4 h-4 text-blue-500" />
          {showAnalytics 
            ? (lang === "en" ? "Hide Visual Analytics & Charts" : "வரைபடங்கள் மற்றும் பகுப்பாய்வுகளை மறை") 
            : (lang === "en" ? "Show Visual Analytics & Charts" : "வரைபடங்கள் மற்றும் பகுப்பாய்வுகளைக் காட்டு")}
        </span>
        <span className="text-[9px] text-muted-foreground font-semibold px-2 py-0.5 bg-muted rounded">
          {showAnalytics 
            ? (lang === "en" ? "COLLAPSE" : "மறை") 
            : (lang === "en" ? "EXPAND" : "விரிவாக்கு")}
        </span>
      </button>

      {/* Visualizations Grid */}
      <div className={`${showAnalytics ? "grid" : "hidden"} grid-cols-1 lg:grid-cols-12 gap-6`}>
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
          <button
            onClick={() => {
              if (window.innerWidth < 768) {
                setShowFilters(!showFilters);
              }
            }}
            className="w-full md:w-auto text-left flex items-center justify-between md:justify-start gap-2 cursor-pointer outline-none select-none"
          >
            <div className="flex items-center gap-2">
              <Filter className="w-4 h-4 text-blue-500" />
              <h3 className="text-sm font-bold text-foreground uppercase tracking-wide">{lang === "en" ? "Faceted Manifesto Filters" : "அதிநவீன வடிகட்டிகள்"}</h3>
            </div>
            <span className="md:hidden text-[9px] text-muted-foreground font-bold px-2 py-0.5 bg-muted rounded">
              {showFilters ? (lang === "en" ? "COLLAPSE" : "மறை") : (lang === "en" ? "EXPAND" : "காட்டு")}
            </span>
          </button>
          {(searchQuery || selectedFramework !== "All" || selectedStatus !== "All" || selectedPriority !== "All" || selectedSection !== "All") && (
            <button
              onClick={clearFilters}
              className="text-xs font-semibold text-blue-500 hover:text-blue-400 transition-colors self-start md:self-auto cursor-pointer"
            >
              {t.clearFilters}
            </button>
          )}
        </div>

        <div className={`${showFilters ? "grid" : "hidden md:grid"} grid-cols-1 md:grid-cols-12 gap-4 items-end`}>
          {/* Search Box */}
          <div className="md:col-span-3 space-y-1.5">
            <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider block">
              {lang === "en" ? "Keyword Search" : "சொல் தேடல்"}
            </label>
            <div className="relative">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={t.searchPlaceholder}
                className="w-full bg-background border border-border focus:border-primary text-xs px-10 py-2.5 rounded-xl text-foreground outline-none focus:ring-1 focus:ring-blue-500/50 transition-all h-[38px]"
              />
            </div>
          </div>

          {/* Framework Selector */}
          <div className="md:col-span-2 space-y-1.5">
            <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider block">
              {lang === "en" ? "Framework" : "அமைப்பு"}
            </label>
            <div className="relative">
              <select
                value={selectedFramework}
                onChange={(e) => handleFrameworkChange(e.target.value as FrameworkType | "All")}
                className="w-full bg-background border border-border focus:border-primary text-xs pl-3.5 pr-10 py-2.5 rounded-xl text-foreground outline-none focus:ring-1 focus:ring-blue-500/50 transition-all cursor-pointer h-[38px] appearance-none"
              >
                <option value="All">{t.allFrameworks}</option>
                <option value="Aram">{lang === "en" ? "Aram" : "அறம்"}</option>
                <option value="Porul">{lang === "en" ? "Porul" : "பொருள்"}</option>
                <option value="Inbam">{lang === "en" ? "Inbam" : "இன்பம்"}</option>
              </select>
              <ChevronDown className="absolute right-3.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground pointer-events-none" />
            </div>
          </div>

          {/* Section Selector */}
          <div className="md:col-span-3 space-y-1.5">
            <div className="flex items-center justify-between">
              <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider block">
                {lang === "en" ? "Section" : "பிரிவு"}
              </label>
              <span className="text-[8px] bg-blue-500/10 text-blue-500 font-extrabold uppercase tracking-widest px-1.5 py-0.2 rounded scale-90 origin-right">
                {lang === "en" ? "Linked" : "இணைப்பு"}
              </span>
            </div>
            <div className="relative" id="section-select-container">
              <button
                type="button"
                onClick={() => setIsSectionDropdownOpen(!isSectionDropdownOpen)}
                className="w-full bg-background border border-border focus:border-primary text-xs pl-3.5 pr-10 py-2.5 rounded-xl text-foreground text-left flex items-center justify-between transition-all cursor-pointer select-none h-[38px]"
              >
                <span className="truncate pr-2">
                  {selectedSection === "All" ? t.allSections : selectedSection}
                </span>
                <ChevronDown className="w-3.5 h-3.5 text-muted-foreground shrink-0" />
              </button>

              {isSectionDropdownOpen && (
                <div className="absolute z-30 mt-1 w-full bg-card border border-border rounded-xl shadow-xl p-2 space-y-2 max-h-60 overflow-hidden flex flex-col">
                  <input
                    type="text"
                    value={sectionSearch}
                    onChange={(e) => setSectionSearch(e.target.value)}
                    placeholder={lang === "en" ? "Search section..." : "பிரிவைத் தேடுக..."}
                    className="w-full bg-background border border-border text-[11px] px-3 py-1.5 rounded-lg text-foreground outline-none focus:border-primary"
                    autoFocus
                  />
                  <div className="overflow-y-auto flex-1 space-y-0.5 max-h-40">
                    <button
                      type="button"
                      onClick={() => {
                        handleSectionChange("All");
                        setIsSectionDropdownOpen(false);
                        setSectionSearch("");
                      }}
                      className={`w-full text-left text-xs px-3 py-1.5 rounded-lg transition-colors hover:bg-muted/10 cursor-pointer ${
                        selectedSection === "All" ? "bg-blue-500/10 text-blue-500 font-bold" : "text-foreground"
                      }`}
                    >
                      {t.allSections}
                    </button>
                    {uniqueSections
                      .filter(sec => sec.toLowerCase().includes(sectionSearch.toLowerCase()))
                      .map((sec) => (
                        <button
                          key={sec}
                          type="button"
                          onClick={() => {
                            handleSectionChange(sec);
                            setIsSectionDropdownOpen(false);
                            setSectionSearch("");
                          }}
                          className={`w-full text-left text-xs px-3 py-1.5 rounded-lg transition-colors hover:bg-muted/10 cursor-pointer ${
                            selectedSection === sec ? "bg-blue-500/10 text-blue-500 font-bold" : "text-foreground"
                          }`}
                        >
                          {sec}
                        </button>
                      ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Status Selector */}
          <div className="md:col-span-2 space-y-1.5">
            <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider block">
              {lang === "en" ? "Implementation Status" : "அமலாக்க நிலை"}
            </label>
            <div className="relative">
              <select
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value as PromiseStatus | "All")}
                className="w-full bg-background border border-border focus:border-primary text-xs pl-3.5 pr-10 py-2.5 rounded-xl text-foreground outline-none focus:ring-1 focus:ring-blue-500/50 transition-all cursor-pointer h-[38px] appearance-none"
              >
                <option value="All">{t.allStatuses}</option>
                <option value="Announced">{lang === "en" ? "Announced" : "அறிவிக்கப்பட்டது"}</option>
                <option value="Planned">{lang === "en" ? "Planned" : "திட்டமிடப்பட்டது"}</option>
                <option value="Budget Allocated">{lang === "en" ? "Budget Allocated" : "பட்ஜெட் ஒதுக்கப்பட்டது"}</option>
                <option value="In Progress">{lang === "en" ? "In Progress" : "செயல்பாட்டில்"}</option>
                <option value="Delayed">{lang === "en" ? "Delayed" : "தாமதமானது"}</option>
                <option value="Blocked">{lang === "en" ? "Blocked" : "முடக்கப்பட்டது"}</option>
                <option value="Completed">{lang === "en" ? "Completed" : "முடிந்தது"}</option>
              </select>
              <ChevronDown className="absolute right-3.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground pointer-events-none" />
            </div>
          </div>

          {/* Priority Selector */}
          <div className="md:col-span-2 space-y-1.5">
            <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider block">
              {lang === "en" ? "Policy Priority" : "முன்னுரிமை"}
            </label>
            <div className="relative">
              <select
                value={selectedPriority}
                onChange={(e) => setSelectedPriority(e.target.value as PromisePriority | "All")}
                className="w-full bg-background border border-border focus:border-primary text-xs pl-3.5 pr-10 py-2.5 rounded-xl text-foreground outline-none focus:ring-1 focus:ring-blue-500/50 transition-all cursor-pointer h-[38px] appearance-none"
              >
                <option value="All">{t.allPriorities}</option>
                <option value="Low">{lang === "en" ? "Low" : "குறைந்த"}</option>
                <option value="Medium">{lang === "en" ? "Medium" : "நடுத்தர"}</option>
                <option value="High">{lang === "en" ? "High" : "அதிக"}</option>
                <option value="Critical">{lang === "en" ? "Critical" : "மிக முக்கியம்"}</option>
              </select>
              <ChevronDown className="absolute right-3.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground pointer-events-none" />
            </div>
          </div>
        </div>
      </div>

      {/* Promises List Grid */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <p className="text-xs font-bold text-muted-foreground uppercase tracking-wide">
            Manifesto Commitments ({sortedPromises.length})
          </p>
        </div>

        {sortedPromises.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {sortedPromises.map((promise) => {
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
                  className={`group flex flex-col justify-between p-5 rounded-2xl border transition-all duration-200 text-left ${
                    promise.id === "p0-tvk-journey"
                      ? "border-blue-500/20 bg-gradient-to-br from-blue-500/5 via-card to-purple-500/5 shadow hover:shadow-md hover:border-blue-500/30"
                      : "border-border bg-card hover:bg-muted/10 shadow-sm"
                  }`}
                >
                  <div className="space-y-3.5">
                    {/* Badges row */}
                    <div className="flex items-center justify-between gap-2 flex-wrap">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className={`text-[9px] font-bold px-2 py-0.5 rounded-md border uppercase tracking-wider ${
                          promise.framework === "Aram" 
                            ? "bg-blue-500/10 text-blue-800 dark:text-blue-400 border-blue-500/20"
                            : promise.framework === "Porul"
                            ? "bg-cyan-500/10 text-cyan-800 dark:text-cyan-400 border-cyan-500/20"
                            : "bg-purple-500/10 text-purple-800 dark:text-purple-400 border-purple-500/20"
                        }`}>
                          {promise.framework} Framework
                        </span>

                        {(() => {
                          const idMatch = promise.id.match(/^([a-z]+)-p(\d+)-s(\d+)-pr(\d+)$/);
                          if (idMatch) {
                            return (
                              <span className="text-[9px] font-bold px-2 py-0.5 bg-muted text-muted-foreground border border-border rounded-md uppercase tracking-wider">
                                Commitment #{idMatch[4]} • {promise.pillar}
                              </span>
                            );
                          }
                          return null;
                        })()}

                        {promise.id === "p0-tvk-journey" && (
                          <span className="text-[9px] font-bold px-2 py-0.5 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-md uppercase tracking-wider animate-pulse">
                            ⭐ SHOWCASE EXAMPLE
                          </span>
                        )}
                      </div>

                      <div className="flex items-center gap-2">
                        <PriorityBadge priority={promise.priority} />
                        <StatusBadge status={promise.status} />
                      </div>
                    </div>

                    {/* Title */}
                    <div className="space-y-1.5">
                      <h4 className="text-sm font-bold text-foreground group-hover:text-primary transition-colors line-clamp-3 leading-relaxed">
                        {promise.title}
                      </h4>
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
