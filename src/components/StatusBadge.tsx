import React from "react";
import { PromiseStatus } from "@/types";
import { 
  Megaphone, 
  Calendar, 
  Coins, 
  Play, 
  AlertTriangle, 
  Octagon, 
  CheckCircle2 
} from "lucide-react";

type StatusBadgeProps = {
  status: PromiseStatus;
  className?: string;
};

export const StatusBadge: React.FC<StatusBadgeProps> = ({ status, className = "" }) => {
  const getStyles = () => {
    switch (status) {
      case "Announced":
        return {
          bg: "bg-blue-500/15 text-blue-700 dark:text-blue-400 border-blue-500/30",
          icon: Megaphone,
        };
      case "Planned":
        return {
          bg: "bg-purple-500/15 text-purple-700 dark:text-purple-400 border-purple-500/30",
          icon: Calendar,
        };
      case "Budget Allocated":
        return {
          bg: "bg-amber-500/15 text-amber-700 dark:text-amber-400 border-amber-500/30",
          icon: Coins,
        };
      case "In Progress":
        return {
          bg: "bg-emerald-500/15 text-emerald-700 dark:text-emerald-400 border-emerald-500/30",
          icon: Play,
          pulse: true,
        };
      case "Delayed":
        return {
          bg: "bg-orange-500/15 text-orange-700 dark:text-orange-400 border-orange-500/30",
          icon: AlertTriangle,
        };
      case "Blocked":
        return {
          bg: "bg-red-500/15 text-red-700 dark:text-red-400 border-red-500/30",
          icon: Octagon,
        };
      case "Completed":
        return {
          bg: "bg-teal-500/15 text-teal-700 dark:text-teal-400 border-teal-500/30 shadow-sm",
          icon: CheckCircle2,
        };
    }
  };

  const { bg, icon: Icon, pulse } = getStyles();

  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium rounded-full border ${bg} ${className}`}
    >
      {pulse && (
        <span className="relative flex h-2 w-2 mr-0.5">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
          <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
        </span>
      )}
      {!pulse && <Icon className="w-3.5 h-3.5" />}
      {status}
    </span>
  );
};
export default StatusBadge;
