"use client";

import React, { useState } from "react";
import { DistrictStats } from "@/types";
import { MapPin, CheckCircle2, AlertCircle, Sparkles } from "lucide-react";

type InteractiveMapProps = {
  stats: DistrictStats[];
  selectedDistrict: string | null;
  onSelectDistrict: (district: string | null) => void;
};

// District grouping by administrative zones for a modern dashboard layout
const DISTRICT_ZONES = [
  {
    name: "Northern Zone",
    color: "from-blue-600/20 to-indigo-600/10 border-blue-900/40",
    text: "text-blue-400",
    districts: ["Chennai", "Chengalpattu", "Kanchipuram", "Tiruvallur", "Ranipet", "Vellore", "Tirupathur", "Tiruvannamalai", "Kallakurichi", "Viluppuram"]
  },
  {
    name: "Western Zone",
    color: "from-cyan-600/20 to-teal-600/10 border-cyan-900/40",
    text: "text-cyan-400",
    districts: ["Coimbatore", "Erode", "Nilgiris", "Tiruppur", "Salem", "Namakkal", "Dharmapuri", "Krishnagiri"]
  },
  {
    name: "Central Zone",
    color: "from-purple-600/20 to-pink-600/10 border-purple-900/40",
    text: "text-purple-400",
    districts: ["Tiruchirappalli", "Karur", "Perambalur", "Ariyalur", "Pudukkottai"]
  },
  {
    name: "Southern Zone",
    color: "from-emerald-600/20 to-teal-600/10 border-emerald-900/40",
    text: "text-emerald-400",
    districts: ["Madurai", "Dindigul", "Theni", "Virudhunagar", "Sivaganga", "Ramanathapuram", "Tirunelveli", "Tenkasi", "Kanyakumari", "Thoothukudi"]
  },
  {
    name: "Eastern Coastal Zone",
    color: "from-amber-600/20 to-orange-600/10 border-amber-900/40",
    text: "text-amber-400",
    districts: ["Cuddalore", "Thanjavur", "Tiruvarur", "Nagapattinam", "Mayiladuthurai"]
  }
];

export const InteractiveMap: React.FC<InteractiveMapProps> = ({
  stats,
  selectedDistrict,
  onSelectDistrict,
}) => {
  const [hoveredDistrict, setHoveredDistrict] = useState<DistrictStats | null>(null);

  const getDistrictStats = (name: string): DistrictStats => {
    return stats.find((s) => s.name === name) || {
      name,
      totalPromises: 0,
      completedPromises: 0,
      activePromises: 0,
      delayedPromises: 0,
      evidenceCount: 0,
      completionRate: 0,
    };
  };

  return (
    <div className="relative flex flex-col gap-6 w-full">
      {/* Map Header */}
      <div className="flex items-center justify-between border-b border-border pb-3">
        <div className="flex items-center gap-2">
          <MapPin className="w-4 h-4 text-blue-500" />
          <h3 className="text-sm font-bold text-foreground tracking-wide uppercase">Tamil Nadu Administrative Regions</h3>
        </div>
        {selectedDistrict && (
          <button
            onClick={() => onSelectDistrict(null)}
            className="text-[10px] font-bold text-blue-500 hover:text-blue-600 transition-colors bg-blue-500/10 border border-blue-500/20 px-2 py-0.5 rounded cursor-pointer"
          >
            Clear Filter
          </button>
        )}
      </div>

      {/* Floating Info Overlay */}
      <div className="h-16 flex items-center justify-between p-3.5 rounded-xl bg-muted/30 border border-border">
        {hoveredDistrict ? (
          <div className="flex items-center justify-between w-full animate-fade-in">
            <div className="flex items-center gap-2.5">
              <div className="h-8 w-8 rounded-lg bg-blue-500/10 border border-blue-500/20 flex items-center justify-center">
                <MapPin className="w-4 h-4 text-blue-500" />
              </div>
              <div>
                <p className="text-xs font-bold text-foreground">{hoveredDistrict.name} District</p>
                <p className="text-[10px] text-muted-foreground font-medium">
                  {hoveredDistrict.totalPromises} Promises affecting this region
                </p>
              </div>
            </div>

            <div className="flex items-center gap-6">
              <div className="text-right">
                <p className="text-xs font-extrabold text-teal-500">{hoveredDistrict.completionRate}%</p>
                <p className="text-[9px] text-muted-foreground uppercase tracking-wider font-bold">Completion</p>
              </div>
              <div className="text-right">
                <p className="text-xs font-extrabold text-blue-500">{hoveredDistrict.evidenceCount}</p>
                <p className="text-[9px] text-muted-foreground uppercase tracking-wider font-bold">Evidence</p>
              </div>
            </div>
          </div>
        ) : (
          <div className="flex items-center gap-2 text-muted-foreground text-xs font-medium">
            <Sparkles className="w-4 h-4 text-amber-500/80 animate-pulse" />
            <span>Hover over a district to audit real-time implementation parameters. Click to filter.</span>
          </div>
        )}
      </div>

      {/* Stylized Zone Map */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        {DISTRICT_ZONES.map((zone) => (
          <div
            key={zone.name}
            className={`flex flex-col p-4 rounded-2xl border bg-gradient-to-b ${zone.color}`}
          >
            <p className={`text-xs font-extrabold tracking-wider uppercase mb-3 ${zone.text}`}>
              {zone.name}
            </p>
            
            <div className="flex flex-col gap-1.5">
              {zone.districts.map((dName) => {
                const dStats = getDistrictStats(dName);
                const isSelected = selectedDistrict === dName;
                
                // Color code district based on completion percentage
                const getCompletionColor = () => {
                  if (dStats.totalPromises === 0) return "border-border text-muted-foreground/60 hover:bg-muted/40";
                  if (dStats.completionRate >= 75) return "border-emerald-500/20 text-emerald-600 dark:text-emerald-400 bg-emerald-500/5 dark:bg-emerald-500/10 hover:bg-emerald-500/10";
                  if (dStats.completionRate >= 40) return "border-blue-500/20 text-blue-600 dark:text-blue-400 bg-blue-500/5 dark:bg-blue-500/10 hover:bg-blue-500/10";
                  return "border-border text-foreground bg-background hover:bg-muted";
                };

                return (
                  <button
                    key={dName}
                    onClick={() => onSelectDistrict(isSelected ? null : dName)}
                    onMouseEnter={() => setHoveredDistrict(dStats)}
                    onMouseLeave={() => setHoveredDistrict(null)}
                    className={`group w-full flex items-center justify-between text-left px-2.5 py-1.5 rounded-lg border text-[11px] font-semibold transition-all duration-150 ${getCompletionColor()} ${
                      isSelected ? "ring-2 ring-blue-500/80 border-transparent bg-blue-500/10 shadow-lg scale-[1.02]" : ""
                    }`}
                  >
                    <span className="truncate">{dName}</span>
                    <div className="flex items-center gap-1.5 shrink-0 opacity-80 group-hover:opacity-100">
                      {dStats.completionRate === 100 && (
                        <CheckCircle2 className="w-3.5 h-3.5 text-teal-500" />
                      )}
                      <span className="text-[10px] text-muted-foreground group-hover:text-foreground transition-colors">
                        ({dStats.totalPromises})
                      </span>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
export default InteractiveMap;
