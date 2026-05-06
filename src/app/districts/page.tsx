"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { promiseService } from "@/lib/db";
import { PromiseItem, DistrictStats } from "@/types";
import InteractiveMap from "@/components/InteractiveMap";
import StatusBadge from "@/components/StatusBadge";
import PriorityBadge from "@/components/PriorityBadge";
import { 
  Map, 
  Layers, 
  CheckCircle2, 
  Activity, 
  AlertTriangle, 
  Upload, 
  ChevronRight,
  TrendingUp,
  Coins
} from "lucide-react";

export default function DistrictView() {
  const [districtStats, setDistrictStats] = useState<DistrictStats[]>([]);
  const [promises, setPromises] = useState<PromiseItem[]>([]);
  const [selectedDistrict, setSelectedDistrict] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  const loadData = async () => {
    setLoading(true);
    const [stats, allPromises] = await Promise.all([
      promiseService.getDistrictStats(),
      promiseService.getPromises()
    ]);
    setDistrictStats(stats);
    setPromises(allPromises);
    setLoading(false);
  };

  useEffect(() => {
    loadData();

    // Reload if status transitioned elsewhere
    window.addEventListener("namma_arasu_role_change", loadData);
    return () => window.removeEventListener("namma_arasu_role_change", loadData);
  }, []);

  const getFilteredPromises = () => {
    if (!selectedDistrict) return [];
    return promises.filter(
      (p) => p.districts?.includes(selectedDistrict) || p.districts?.includes("All Districts")
    );
  };

  const selectedStats = selectedDistrict 
    ? districtStats.find((s) => s.name === selectedDistrict) 
    : null;

  const districtPromises = getFilteredPromises();

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] gap-4">
        <div className="h-10 w-10 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
        <p className="text-xs text-muted-foreground font-medium animate-pulse">Assembling regional mapping lattices...</p>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Page Header */}
      <div>
        <h2 className="text-xl font-bold text-foreground flex items-center gap-2">
          <Map className="w-5 h-5 text-blue-500" />
          District-Wise Governance Audit
        </h2>
        <p className="text-xs text-muted-foreground font-medium mt-1">
          Monitor regional implementations, local MSME clusters, and rural development schemes across all 38 districts.
        </p>
      </div>

      {/* Main Map Integration */}
      <div className="p-6 rounded-2xl border border-border bg-card shadow-sm">
        <InteractiveMap 
          stats={districtStats} 
          selectedDistrict={selectedDistrict} 
          onSelectDistrict={setSelectedDistrict} 
        />
      </div>

      {/* Selected District Metrics & Promises */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {selectedDistrict && selectedStats ? (
          <>
            {/* District Analytics Metrics */}
            <div className="lg:col-span-4 p-5 rounded-2xl border border-border bg-card space-y-5 animate-fade-in shadow-sm">
              <div className="border-b border-border pb-3">
                <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Active Regional Audit</p>
                <h3 className="text-lg font-extrabold text-foreground">{selectedDistrict} District</h3>
              </div>

              {/* Stats sub-grid */}
              <div className="grid grid-cols-2 gap-3">
                {/* Stat 1 */}
                <div className="p-3.5 rounded-xl bg-muted/40 border border-border">
                  <p className="text-[9px] font-bold text-muted-foreground uppercase">Promises</p>
                  <p className="text-lg font-black text-foreground">{selectedStats.totalPromises}</p>
                </div>
                {/* Stat 2 */}
                <div className="p-3.5 rounded-xl bg-muted/40 border border-border">
                  <p className="text-[9px] font-bold text-muted-foreground uppercase">Completion Rate</p>
                  <p className="text-lg font-black text-teal-500">{selectedStats.completionRate}%</p>
                </div>
                {/* Stat 3 */}
                <div className="p-3.5 rounded-xl bg-muted/40 border border-border">
                  <p className="text-[9px] font-bold text-muted-foreground uppercase">Active</p>
                  <p className="text-lg font-black text-emerald-500">{selectedStats.activePromises}</p>
                </div>
                {/* Stat 4 */}
                <div className="p-3.5 rounded-xl bg-muted/40 border border-border">
                  <p className="text-[9px] font-bold text-muted-foreground uppercase">Evidence</p>
                  <p className="text-lg font-black text-blue-500">{selectedStats.evidenceCount}</p>
                </div>
              </div>

              {/* Progress bar */}
              <div className="space-y-1 pt-1">
                <div className="flex items-center justify-between text-[10px] font-bold text-muted-foreground uppercase">
                  <span>Regional Completion</span>
                  <span className="text-foreground font-mono">{selectedStats.completionRate}%</span>
                </div>
                <div className="w-full bg-muted rounded-full h-1.5 overflow-hidden">
                  <div className="bg-teal-500 h-1.5 rounded-full" style={{ width: `${selectedStats.completionRate}%` }}></div>
                </div>
              </div>
            </div>

            {/* Selected District Promises List */}
            <div className="lg:col-span-8 space-y-4 animate-fade-in">
              <p className="text-xs font-bold text-muted-foreground uppercase tracking-wide">
                Manifesto Promises Affecting {selectedDistrict} ({districtPromises.length})
              </p>

              <div className="flex flex-col gap-3">
                {districtPromises.map((p) => {
                  const budgetAmt = p.budget_amount 
                    ? `₹${(p.budget_amount / 10000000).toFixed(1)} Cr`
                    : "No Direct Budget";

                  return (
                    <Link
                      key={p.id}
                      href={`/promises/${p.id}`}
                      className="group p-4 rounded-xl border border-border bg-card hover:border-muted-foreground/30 transition-all duration-150 flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-sm"
                    >
                      <div className="space-y-1.5 flex-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="text-[9px] font-bold text-blue-500 bg-blue-500/10 px-1.5 py-0.5 rounded border border-blue-500/20">
                            {p.framework}
                          </span>
                          <PriorityBadge priority={p.priority} />
                          <StatusBadge status={p.status} />
                        </div>
                        <h4 className="text-xs font-bold text-foreground group-hover:text-primary transition-colors leading-relaxed">
                          {p.title}
                        </h4>
                      </div>

                      <div className="flex items-center gap-6 shrink-0 justify-between md:justify-end">
                        <span className="flex items-center gap-1 text-[10px] font-semibold text-muted-foreground">
                          <Coins className="w-3.5 h-3.5 text-amber-500/80" />
                          <span className="text-muted-foreground">{budgetAmt}</span>
                        </span>
                        
                        <div className="flex items-center gap-1.5">
                          <span className="text-[10px] font-bold text-muted-foreground font-mono">{p.progress_percentage}%</span>
                          <ChevronRight className="w-4 h-4 text-muted-foreground/60 group-hover:text-primary transition-colors" />
                        </div>
                      </div>
                    </Link>
                  );
                })}
              </div>
            </div>
          </>
        ) : (
          <div className="col-span-12 p-10 text-center rounded-2xl border border-border bg-card shadow-sm space-y-2">
            <Layers className="w-8 h-8 text-muted-foreground/60 mx-auto animate-pulse" />
            <p className="text-xs font-bold text-foreground">Select a District to view localized promises</p>
            <p className="text-[10px] text-muted-foreground">
              Click on any district button in the grid mapping above to see regional statistics, specific updates, and localized citizen evidence.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
