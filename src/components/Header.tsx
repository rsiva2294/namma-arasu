"use client";

import React, { useState, useEffect } from "react";
import { User, ShieldAlert, Calendar, Sun, Moon, Menu } from "lucide-react";
import { useLanguage } from "@/lib/i18n";

export const Header: React.FC = () => {
  const [role, setRole] = useState<"Citizen" | "Admin">("Citizen");
  const [theme, setTheme] = useState<"light" | "dark">("dark");
  const [currentDate, setCurrentDate] = useState<string>("");
  const { lang, setLanguage, t } = useLanguage();

  useEffect(() => {
    // Set formatted date
    const options: Intl.DateTimeFormatOptions = {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    };
    setCurrentDate(new Date().toLocaleDateString(lang === "en" ? "en-US" : "ta-IN", options));

    // Get active role from local storage
    const savedRole = localStorage.getItem("namma_arasu_role");
    if (savedRole === "Admin") {
      setRole("Admin");
    } else {
      localStorage.setItem("namma_arasu_role", "Citizen");
    }

    // Get active theme from local storage
    const savedTheme = localStorage.getItem("namma_arasu_theme") as "light" | "dark";
    if (savedTheme === "light") {
      setTheme("light");
      document.documentElement.classList.add("light");
    } else {
      setTheme("dark");
      document.documentElement.classList.remove("light");
    }
  }, [lang]);

  const handleRoleToggle = () => {
    const nextRole = role === "Citizen" ? "Admin" : "Citizen";
    setRole(nextRole);
    localStorage.setItem("namma_arasu_role", nextRole);
    // Dispatch custom event to notify other components of the role change
    window.dispatchEvent(new Event("namma_arasu_role_change"));
  };

  const handleThemeToggle = () => {
    const nextTheme = theme === "dark" ? "light" : "dark";
    setTheme(nextTheme);
    localStorage.setItem("namma_arasu_theme", nextTheme);
    
    if (nextTheme === "light") {
      document.documentElement.classList.add("light");
    } else {
      document.documentElement.classList.remove("light");
    }
  };

  return (
    <header className="sticky top-0 z-40 w-full border-b border-border bg-background/85 backdrop-blur-md px-6 py-4 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
      {/* Brand Logo & Name */}
      <div className="flex items-center gap-3">
        {/* Mobile Hamburger Toggle */}
        <button
          onClick={() => window.dispatchEvent(new Event("namma_arasu_toggle_sidebar"))}
          className="md:hidden p-2 -ml-2 rounded-xl border border-border bg-muted/30 hover:bg-muted/50 text-muted-foreground hover:text-foreground transition-all shrink-0 cursor-pointer"
          title="Toggle Navigation Menu"
        >
          <Menu className="w-5 h-5" />
        </button>

        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-700 font-extrabold text-white text-lg tracking-wider active-glow">
          NA
        </div>
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold tracking-tight text-foreground">NammaArasu</h1>
            <span className="text-[10px] font-bold px-1.5 py-0.5 bg-blue-500/10 text-blue-600 dark:bg-blue-950/80 dark:text-blue-400 rounded-md border border-blue-500/20 dark:border-blue-900/40 uppercase">MVP</span>
          </div>
          <p className="text-xs text-muted-foreground font-medium flex items-center gap-1">
            <span className="text-amber-600 dark:text-amber-500/90 font-semibold tracking-wide font-sans text-[11px]">நம்ம அரசு</span>
            <span className="text-slate-400 font-bold">•</span>
            <span>{lang === "en" ? "Civic Governance Transparency Platform" : "மக்களுக்கான ஆளுமைத் தளம்"}</span>
          </p>
        </div>
      </div>

      {/* Date & Role Toggle Section */}
      <div className="flex items-center justify-between md:justify-end gap-6">
        {/* Date Display */}
        <div className="hidden sm:flex items-center gap-2 text-xs text-muted-foreground font-medium bg-muted/30 px-3 py-1.5 rounded-lg border border-border">
          <Calendar className="w-3.5 h-3.5 text-blue-500" />
          <span>{currentDate}</span>
        </div>

        {/* Language Toggler */}
        <button
          onClick={() => setLanguage(lang === "en" ? "ta" : "en")}
          className="px-2.5 py-1.5 rounded-xl border border-border bg-muted/30 hover:bg-muted/50 text-xs font-extrabold text-foreground transition-all duration-200 shrink-0 cursor-pointer flex items-center gap-1.5"
          title={lang === "en" ? "Switch to Tamil" : "Switch to English"}
        >
          <span>🌐</span>
          <span className="font-mono tracking-wider">{lang === "en" ? "தமிழ்" : "EN"}</span>
        </button>

        {/* Theme Toggle Button */}
        <button
          onClick={handleThemeToggle}
          className="p-2 rounded-xl border border-border bg-muted/30 hover:bg-muted/50 text-muted-foreground hover:text-foreground transition-all duration-200 flex items-center justify-center shrink-0 cursor-pointer"
          title={theme === "dark" ? "Switch to Light Mode" : "Switch to Dark Mode"}
        >
          {theme === "dark" ? (
            <Sun className="w-4 h-4 text-amber-400" />
          ) : (
            <Moon className="w-4 h-4 text-indigo-500" />
          )}
        </button>

        {/* Dynamic Role Toggle Card */}
        <button
          onClick={handleRoleToggle}
          style={role === "Admin" ? {
            backgroundColor: "var(--admin-bg)",
            color: "var(--admin-text)",
            borderColor: "var(--admin-border)"
          } : undefined}
          className={`group flex items-center gap-2 px-3.5 py-1.5 rounded-xl border text-xs font-semibold tracking-wide transition-all duration-300 ${
            role === "Admin"
              ? "hover:opacity-90 active-glow cursor-pointer"
              : "bg-muted/30 text-muted-foreground border-border hover:text-foreground hover:bg-muted/50 cursor-pointer"
          }`}
        >
          {role === "Admin" ? (
            <>
              <ShieldAlert className="w-4 h-4 animate-pulse" style={{ color: "var(--admin-text)" }} />
              <span>{t.adminMode}</span>
            </>
          ) : (
            <>
              <User className="w-4 h-4 text-slate-500 group-hover:text-blue-400 transition-colors" />
              <span>{t.citizenMode}</span>
            </>
          )}
        </button>
      </div>
    </header>
  );
};
export default Header;
