import React from "react";
import { PromisePriority } from "@/types";
import { Shield, ShieldAlert, ShieldCheck } from "lucide-react";

type PriorityBadgeProps = {
  priority: PromisePriority;
  className?: string;
};

export const PriorityBadge: React.FC<PriorityBadgeProps> = ({ priority, className = "" }) => {
  const getStyles = () => {
    switch (priority) {
      case "Low":
        return {
          bg: "bg-slate-500/15 text-slate-800 dark:text-slate-400 border-slate-500/30",
          icon: ShieldCheck,
        };
      case "Medium":
        return {
          bg: "bg-blue-500/15 text-blue-800 dark:text-blue-400 border-blue-500/30",
          icon: Shield,
        };
      case "High":
        return {
          bg: "bg-orange-500/15 text-orange-800 dark:text-orange-400 border-orange-500/30",
          icon: ShieldAlert,
        };
      case "Critical":
        return {
          bg: "bg-red-500/15 text-red-800 dark:text-red-400 border-red-500/30 animate-pulse",
          icon: ShieldAlert,
        };
    }
  };

  const { bg, icon: Icon } = getStyles();

  return (
    <span
      className={`inline-flex items-center gap-1 px-2 py-0.5 text-[10px] font-semibold tracking-wider uppercase rounded border ${bg} ${className}`}
    >
      <Icon className="w-3 h-3" />
      {priority}
    </span>
  );
};
export default PriorityBadge;
