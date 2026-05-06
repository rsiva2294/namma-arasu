"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { promiseService } from "@/lib/db";
import { PromiseItem } from "@/types";
import StatusBadge from "@/components/StatusBadge";
import PriorityBadge from "@/components/PriorityBadge";
import { 
  Map, 
  MapPin, 
  Layers, 
  CheckSquare, 
  Activity, 
  AlertTriangle, 
  ChevronRight,
  TrendingUp,
  Coins,
  Search,
  Filter,
  Sparkles
} from "lucide-react";
import { TAMIL_NADU_DISTRICTS } from "@/lib/mockData";

export default function DistrictView() {
  const [promises, setPromises] = useState<PromiseItem[]>([]);
  const [selectedDistrict, setSelectedDistrict] = useState<string>("Statewide");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    async function loadData() {
      setLoading(true);
      const data = await promiseService.getPromises();
      setPromises(data);
      setLoading(false);
    }
    loadData();
  }, []);

  // Calculate stats dynamically based on actual seeded promises
  const statewideCount = promises.filter(p => p.districts?.includes("All Districts") || p.districts?.length === 0).length;
  const regionalCount = promises.filter(p => p.districts && p.districts.length > 0 && !p.districts.includes("All Districts")).length;

  // Get only districts that actually have localized promises assigned to them
  const localizedDistricts = TAMIL_NADU_DISTRICTS.map(dist => {
    const localizedPromises = promises.filter(p => p.districts?.includes(dist) && !p.districts.includes("All Districts"));
    return {
      name: dist,
      count: localizedPromises.length,
      promisesList: localizedPromises
    };
  }).filter(d => d.count > 0);

  // Filter promises based on selection and search query
  const getFilteredPromises = () => {
    let list = promises;

    if (selectedDistrict === "Statewide") {
      list = promises.filter(p => p.districts?.includes("All Districts") || p.districts?.length === 0);
    } else {
      list = promises.filter(p => p.districts?.includes(selectedDistrict) && !p.districts.includes("All Districts"));
    }

    if (searchQuery.trim() !== "") {
      const q = searchQuery.toLowerCase();
      list = list.filter(
        p => p.title.toLowerCase().includes(q) || p.pillar.toLowerCase().includes(q) || p.section.toLowerCase().includes(q)
      );
    }

    return list;
  };

  const filteredPromises = getFilteredPromises();

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] gap-4">
        <div className="h-10 w-10 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
        <p className="text-xs text-muted-foreground font-medium animate-pulse">Aggregating regional development metrics...</p>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Page Header */}
      <div>
        <h2 className="text-xl font-bold text-foreground flex items-center gap-2">
          <Map className="w-5 h-5 text-blue-500" />
          Regional Development & Manifesto Atlas
        </h2>
        <p className="text-xs text-muted-foreground font-medium mt-1">
          Monitor targeted localized investments, district-specific MSME clusters, and statewide programs across Tamil Nadu's administrative landscape.
        </p>
      </div>

      {/* Metrics Banner */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="p-4 rounded-2xl bg-card border border-border flex flex-col justify-between h-24 shadow-sm">
          <div className="flex items-center justify-between text-muted-foreground">
            <span className="text-[10px] font-bold uppercase tracking-wider">Statewide Programs</span>
            <Layers className="w-4 h-4 text-blue-500" />
          </div>
          <div>
            <p className="text-lg font-black text-foreground">{statewideCount} Commitments</p>
            <p className="text-[9px] text-muted-foreground font-medium">Applicable to all 38 districts</p>
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-card border border-border flex flex-col justify-between h-24 shadow-sm">
          <div className="flex items-center justify-between text-muted-foreground">
            <span className="text-[10px] font-bold uppercase tracking-wider">Targeted Regional Schemes</span>
            <MapPin className="w-4 h-4 text-emerald-500" />
          </div>
          <div>
            <p className="text-lg font-black text-emerald-500">{regionalCount} Commitments</p>
            <p className="text-[9px] text-muted-foreground font-medium">Mapped to localized districts</p>
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-card border border-border flex flex-col justify-between h-24 shadow-sm">
          <div className="flex items-center justify-between text-muted-foreground">
            <span className="text-[10px] font-bold uppercase tracking-wider">Impacted Districts</span>
            <Sparkles className="w-4 h-4 text-amber-500" />
          </div>
          <div>
            <p className="text-lg font-black text-amber-500">{localizedDistricts.length} Districts</p>
            <p className="text-[9px] text-muted-foreground font-medium">With direct targeted policies</p>
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-card border border-border flex flex-col justify-between h-24 shadow-sm">
          <div className="flex items-center justify-between text-muted-foreground">
            <span className="text-[10px] font-bold uppercase tracking-wider">Active Audit Loop</span>
            <Activity className="w-4 h-4 text-purple-500" />
          </div>
          <div>
            <p className="text-lg font-black text-purple-500">100% Verifiable</p>
            <p className="text-[9px] text-muted-foreground font-medium">Linked to public evidence logs</p>
          </div>
        </div>
      </div>

      {/* Main Interactive Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Side: District & Region Selectors */}
        <div className="lg:col-span-4 space-y-4">
          <p className="text-xs font-bold text-muted-foreground uppercase tracking-wide">
            Select Administrative Scope
          </p>

          <div className="flex flex-col gap-2">
            {/* Statewide Selector Button */}
            <button
              onClick={() => {
                setSelectedDistrict("Statewide");
                setSearchQuery("");
              }}
              className={`group w-full flex items-center justify-between p-4 rounded-xl border text-left transition-all duration-200 cursor-pointer ${
                selectedDistrict === "Statewide"
                  ? "bg-blue-500/10 border-blue-500 text-foreground ring-1 ring-blue-500/30 shadow-md scale-[1.01]"
                  : "bg-card border-border hover:border-blue-500/30 hover:bg-muted/10 text-muted-foreground hover:text-foreground"
              }`}
            >
              <div className="flex items-center gap-3">
                <div className={`p-2 rounded-lg ${selectedDistrict === "Statewide" ? "bg-blue-500/20 text-blue-500" : "bg-muted text-muted-foreground"}`}>
                  <Layers className="w-4 h-4" />
                </div>
                <div>
                  <p className="text-xs font-bold uppercase tracking-wide text-foreground">Statewide Focus</p>
                  <p className="text-[9px] text-muted-foreground mt-0.5">Tamil Nadu Core Manifesto</p>
                </div>
              </div>
              <span className="text-xs font-bold bg-muted px-2.5 py-0.5 border border-border rounded text-foreground">
                {statewideCount}
              </span>
            </button>

            {/* Targeted Districts Sub-Header */}
            <div className="pt-2 pb-1">
              <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider px-1">
                Targeted Local Districts
              </p>
            </div>

            {/* Localized Districts List */}
            {localizedDistricts.length > 0 ? (
              <div className="flex flex-col gap-2 max-h-[350px] overflow-y-auto pr-1">
                {localizedDistricts.map((dist) => {
                  const isSelected = selectedDistrict === dist.name;
                  return (
                    <button
                      key={dist.name}
                      onClick={() => {
                        setSelectedDistrict(dist.name);
                        setSearchQuery("");
                      }}
                      className={`group w-full flex items-center justify-between p-3.5 rounded-xl border text-left transition-all duration-200 cursor-pointer ${
                        isSelected
                          ? "bg-emerald-500/10 border-emerald-500 text-foreground ring-1 ring-emerald-500/30 shadow-md scale-[1.01]"
                          : "bg-card border-border hover:border-emerald-500/30 hover:bg-muted/10 text-muted-foreground hover:text-foreground"
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div className={`p-1.5 rounded-lg ${isSelected ? "bg-emerald-500/20 text-emerald-500" : "bg-muted text-muted-foreground"}`}>
                          <MapPin className="w-3.5 h-3.5" />
                        </div>
                        <div>
                          <p className="text-xs font-bold text-foreground">{dist.name} District</p>
                          <p className="text-[9px] text-muted-foreground mt-0.5">Localized commitments</p>
                        </div>
                      </div>
                      <span className="text-xs font-bold bg-muted px-2.5 py-0.5 border border-border rounded text-foreground">
                        {dist.count}
                      </span>
                    </button>
                  );
                })}
              </div>
            ) : (
              <div className="p-4 text-center rounded-xl border border-border bg-card">
                <p className="text-[10px] text-muted-foreground">No active localized district commitments found.</p>
              </div>
            )}
          </div>
        </div>

        {/* Right Side: Dynamic Localized Promises List */}
        <div className="lg:col-span-8 space-y-4">
          {/* List Header & Search Bar */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <p className="text-xs font-bold text-muted-foreground uppercase tracking-wide">
              {selectedDistrict === "Statewide" ? "Statewide Programs" : `${selectedDistrict} District`} ({filteredPromises.length})
            </p>

            <div className="relative w-full sm:w-64 shrink-0">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search targeted policies..."
                className="w-full bg-card border border-border focus:border-primary text-xs pl-9 pr-4 py-2 rounded-xl text-foreground outline-none focus:ring-1 focus:ring-blue-500/50 transition-all"
              />
            </div>
          </div>

          {/* Commitments List */}
          {filteredPromises.length > 0 ? (
            <div className="flex flex-col gap-3">
              {filteredPromises.map((p) => {
                const idMatch = p.id.match(/^([a-z]+)-p(\d+)-s(\d+)-pr(\d+)$/);
                const promiseNum = idMatch ? idMatch[4] : "";

                return (
                  <Link
                    key={p.id}
                    href={`/promises/${p.id}`}
                    className="group p-5 rounded-2xl border border-border bg-card hover:bg-muted/10 transition-all duration-200 flex flex-col justify-between gap-4 shadow-sm"
                  >
                    <div className="space-y-3">
                      {/* Badges row */}
                      <div className="flex items-center justify-between gap-2 flex-wrap">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className={`text-[9px] font-bold px-2 py-0.5 rounded-md border uppercase tracking-wider ${
                            p.framework === "Aram" 
                              ? "bg-blue-500/10 text-blue-800 dark:text-blue-400 border-blue-500/20"
                              : p.framework === "Porul"
                              ? "bg-cyan-500/10 text-cyan-800 dark:text-cyan-400 border-cyan-500/20"
                              : "bg-purple-500/10 text-purple-800 dark:text-purple-400 border-purple-500/20"
                          }`}>
                            {p.framework} Framework
                          </span>

                          {promiseNum && (
                            <span className="text-[9px] font-bold px-2 py-0.5 bg-muted text-muted-foreground border border-border rounded-md uppercase tracking-wider">
                              Commitment #{promiseNum} • {p.pillar}
                            </span>
                          )}
                        </div>

                        <div className="flex items-center gap-2">
                          <PriorityBadge priority={p.priority} />
                          <StatusBadge status={p.status} />
                        </div>
                      </div>

                      {/* Title */}
                      <h4 className="text-sm font-bold text-foreground group-hover:text-primary transition-colors leading-relaxed">
                        {p.title}
                      </h4>
                    </div>

                    {/* Progress Bar & Access Button */}
                    <div className="pt-3 border-t border-border flex items-center justify-between gap-4 flex-wrap">
                      <div className="flex items-center gap-4">
                        <div className="flex items-center gap-1.5 text-[10px] font-bold text-muted-foreground uppercase">
                          <span>Progress</span>
                          <span className="text-foreground font-mono">{p.progress_percentage}%</span>
                        </div>
                        <div className="w-24 bg-muted rounded-full h-1.5 overflow-hidden">
                          <div className={`h-1.5 rounded-full ${p.framework === "Aram" ? "bg-blue-500" : p.framework === "Porul" ? "bg-cyan-500" : "bg-purple-500"}`} style={{ width: `${p.progress_percentage}%` }}></div>
                        </div>
                      </div>

                      <div className="flex items-center gap-1 text-[10px] font-bold text-blue-500 group-hover:text-blue-400 transition-colors uppercase tracking-wider">
                        <span>View Audit Details</span>
                        <ChevronRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-0.5" />
                      </div>
                    </div>
                  </Link>
                );
              })}
            </div>
          ) : (
            <div className="p-10 text-center rounded-2xl border border-border bg-card shadow-sm space-y-2">
              <Layers className="w-8 h-8 text-muted-foreground/60 mx-auto animate-pulse" />
              <p className="text-xs font-bold text-foreground">No matching commitments found</p>
              <p className="text-[10px] text-muted-foreground">
                Try adjusting your search query to locate targeted regional policy programs.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
