"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { 
  LayoutDashboard, 
  Kanban, 
  Map, 
  Database,
  BookOpen,
  X
} from "lucide-react";
import { isSupabaseConfigured } from "@/lib/db";

export const Sidebar: React.FC = () => {
  const pathname = usePathname();
  const dbStatus = isSupabaseConfigured ? "Cloud" : "Local";
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    const handleToggle = () => setIsOpen((prev) => !prev);
    const handleClose = () => setIsOpen(false);

    window.addEventListener("namma_arasu_toggle_sidebar", handleToggle);
    window.addEventListener("namma_arasu_close_sidebar", handleClose);
    return () => {
      window.removeEventListener("namma_arasu_toggle_sidebar", handleToggle);
      window.removeEventListener("namma_arasu_close_sidebar", handleClose);
    };
  }, []);

  useEffect(() => {
    setIsOpen(false);
  }, [pathname]);

  const navItems = [
    {
      name: "Dashboard",
      path: "/",
      icon: LayoutDashboard,
      desc: "Overview & Analytics"
    },
    {
      name: "Kanban Board",
      path: "/kanban",
      icon: Kanban,
      desc: "Workflow Timeline"
    },
    {
      name: "District View",
      path: "/districts",
      icon: Map,
      desc: "Regional Mapping"
    },
    {
      name: "Manifesto",
      path: "/manifesto",
      icon: BookOpen,
      desc: "Original Source Documents"
    }
  ];

  return (
    <>
      {/* Mobile Backdrop Overlay */}
      {isOpen && (
        <div 
          onClick={() => setIsOpen(false)}
          className="fixed inset-0 z-45 bg-black/60 backdrop-blur-sm md:hidden transition-all duration-300 animate-fade-in"
        />
      )}

      <aside className={`
        fixed inset-y-0 left-0 z-50 w-72 h-full bg-background border-r border-border p-6 flex flex-col justify-between shrink-0 transition-transform duration-300 ease-out shadow-2xl
        md:shadow-none md:translate-x-0 md:relative md:inset-auto md:z-auto md:w-64 md:h-[calc(100vh-73px)] md:p-6
        ${isOpen ? "translate-x-0" : "-translate-x-full md:flex"}
      `}>
        {/* Navigation Links */}
        <div className="flex flex-col gap-1.5">
          <div className="flex items-center justify-between mb-4 px-3 md:mb-2.5">
            <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">
              Governance Views
            </p>
            {/* Mobile Drawer Close Button */}
            <button 
              onClick={() => setIsOpen(false)}
              className="md:hidden p-1.5 rounded-lg border border-border bg-muted/40 text-muted-foreground hover:text-foreground cursor-pointer"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
          
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.path;
            
            return (
              <Link
                key={item.path}
                href={item.path}
                className={`group flex items-center gap-3.5 px-3 py-3 rounded-xl transition-all duration-200 ${
                  isActive
                    ? "bg-muted text-foreground border border-border shadow-inner"
                    : "text-muted-foreground hover:bg-muted/40 hover:text-foreground border border-transparent"
                }`}
              >
                <div className={`p-1.5 rounded-lg transition-colors ${
                  isActive ? "bg-primary/10 text-primary" : "bg-transparent text-muted-foreground group-hover:text-foreground"
                }`}>
                  <Icon className="w-4 h-4" />
                </div>
                <div>
                  <p className="text-xs font-semibold tracking-wide">{item.name}</p>
                  <p className="text-[10px] text-muted-foreground font-medium">{item.desc}</p>
                </div>
              </Link>
            );
          })}
        </div>

        {/* System Status Indicator Card */}
        <div className="p-4 rounded-xl bg-muted/30 border border-border flex flex-col gap-3">
          <div className="flex items-center gap-2">
            <Database className={`w-3.5 h-3.5 ${dbStatus === "Cloud" ? "text-emerald-500 animate-pulse" : "text-amber-500"}`} />
            <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Database Engine</span>
          </div>
          
          <div>
            <div className="flex items-center justify-between text-xs font-semibold text-foreground">
              <span>{dbStatus === "Cloud" ? "Firebase Cloud" : "Local Storage"}</span>
              <span className={`h-2 w-2 rounded-full ${dbStatus === "Cloud" ? "bg-emerald-500" : "bg-amber-500"}`}></span>
            </div>
            <p className="text-[10px] text-muted-foreground mt-1 leading-relaxed">
              {dbStatus === "Cloud" 
                ? "Connected to production Cloud Firestore database." 
                : "Running in Zero-Config Fallback mode. Persisting to browser storage."}
            </p>
          </div>
        </div>
      </aside>
    </>
  );
};
export default Sidebar;
