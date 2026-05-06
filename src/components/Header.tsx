"use client";

import React, { useState, useEffect } from "react";
import { User, ShieldAlert, Calendar, Sun, Moon } from "lucide-react";
import { auth } from "@/lib/db";
import { signInWithEmailAndPassword, signOut, onAuthStateChanged } from "firebase/auth";

export const Header: React.FC = () => {
  const [role, setRole] = useState<"Citizen" | "Admin">("Citizen");
  const [theme, setTheme] = useState<"light" | "dark">("dark");
  const [currentDate, setCurrentDate] = useState<string>("");

  // Authentication states
  const [showLoginModal, setShowLoginModal] = useState<boolean>(false);
  const [loginEmail, setLoginEmail] = useState<string>("");
  const [loginPassword, setLoginPassword] = useState<string>("");
  const [loginError, setLoginError] = useState<string>("");
  const [authLoading, setAuthLoading] = useState<boolean>(false);

  useEffect(() => {
    // Set formatted date
    const options: Intl.DateTimeFormatOptions = {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    };
    setCurrentDate(new Date().toLocaleDateString("en-US", options));

    // Listen for Auth changes
    if (auth) {
      const unsubscribe = onAuthStateChanged(auth, (user) => {
        if (user) {
          setRole("Admin");
          localStorage.setItem("namma_arasu_role", "Admin");
          window.dispatchEvent(new Event("namma_arasu_role_change"));
        } else {
          setRole("Citizen");
          localStorage.setItem("namma_arasu_role", "Citizen");
          window.dispatchEvent(new Event("namma_arasu_role_change"));
        }
      });
      return () => unsubscribe();
    } else {
      // Fallback for isolated Local/Staging
      const savedRole = localStorage.getItem("namma_arasu_role") as "Citizen" | "Admin";
      setRole(savedRole === "Admin" ? "Admin" : "Citizen");
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
  }, []);

  const handleRoleToggle = async () => {
    if (role === "Admin") {
      try {
        if (auth) {
          await signOut(auth);
        } else {
          setRole("Citizen");
          localStorage.setItem("namma_arasu_role", "Citizen");
          window.dispatchEvent(new Event("namma_arasu_role_change"));
        }
      } catch (err: any) {
        console.error("Logout error:", err);
      }
    } else {
      setShowLoginModal(true);
    }
  };

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError("");
    setAuthLoading(true);

    try {
      if (auth) {
        await signInWithEmailAndPassword(auth, loginEmail, loginPassword);
        setShowLoginModal(false);
        setLoginEmail("");
        setLoginPassword("");
      } else {
        // Sandbox mock login fallback
        if (loginEmail === "admin@nammaarasu.gov" && loginPassword === "ArivanArasu2026!") {
          setRole("Admin");
          localStorage.setItem("namma_arasu_role", "Admin");
          window.dispatchEvent(new Event("namma_arasu_role_change"));
          setShowLoginModal(false);
          setLoginEmail("");
          setLoginPassword("");
        } else {
          setLoginError("Invalid administrator credentials. Please check your spelling and try again.");
        }
      }
    } catch (error: any) {
      console.error("Auth error:", error);
      setLoginError(error.message || "Authentication failed. Please check your credentials.");
    } finally {
      setAuthLoading(false);
    }
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
            <span>Civic Governance Transparency Platform</span>
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
              <span>Official Admin Mode</span>
            </>
          ) : (
            <>
              <User className="w-4 h-4 text-slate-500 group-hover:text-blue-400 transition-colors" />
              <span>Public Citizen Mode</span>
            </>
          )}
        </button>
      </div>

      {/* Admin Authentication Modal */}
      {showLoginModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 p-4 backdrop-blur-sm animate-fade-in animate-duration-150">
          <div className="w-full max-w-sm rounded-2xl border border-border bg-card p-6 space-y-4 shadow-2xl relative">
            <div className="flex items-center gap-2 text-blue-500 pb-2 border-b border-border">
              <ShieldAlert className="w-5 h-5 animate-pulse text-amber-500" />
              <h3 className="text-sm font-bold uppercase tracking-wider text-foreground">Admin Verification</h3>
            </div>

            <p className="text-xs text-muted-foreground leading-relaxed font-medium">
              Access to administrative controls is restricted to verified administrators. Please sign in to authenticate your session.
            </p>

            {loginError && (
              <div className="p-3 text-[11px] font-bold text-rose-500 bg-rose-500/10 border border-rose-500/20 rounded-xl leading-normal">
                {loginError}
              </div>
            )}

            <form onSubmit={handleLoginSubmit} className="space-y-3.5">
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wide">
                  Official Email Address
                </label>
                <input
                  type="email"
                  required
                  value={loginEmail}
                  onChange={(e) => setLoginEmail(e.target.value)}
                  placeholder="admin@nammaarasu.gov"
                  className="w-full bg-background border border-border focus:border-blue-500 text-xs px-3 py-2 rounded-lg text-foreground outline-none transition-colors"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wide">
                  Account Password
                </label>
                <input
                  type="password"
                  required
                  value={loginPassword}
                  onChange={(e) => setLoginPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full bg-background border border-border focus:border-blue-500 text-xs px-3 py-2 rounded-lg text-foreground outline-none transition-colors"
                />
              </div>

              {/* Sandbox Credentials Helper */}
              <div className="p-3 bg-blue-500/5 border border-blue-500/10 rounded-xl space-y-1">
                <p className="text-[9px] font-bold text-blue-500 uppercase tracking-wide">Sandbox Credentials Active</p>
                <p className="text-[9px] text-muted-foreground leading-relaxed">
                  Use sandbox credentials for verification: <br />
                  <span className="font-mono text-foreground font-semibold">admin@nammaarasu.gov</span> / <span className="font-mono text-foreground font-semibold">ArivanArasu2026!</span>
                </p>
              </div>

              <div className="flex items-center justify-end gap-3 pt-1">
                <button
                  type="button"
                  onClick={() => {
                    setShowLoginModal(false);
                    setLoginEmail("");
                    setLoginPassword("");
                    setLoginError("");
                  }}
                  className="px-3.5 py-1.5 text-xs font-semibold text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={authLoading}
                  className="px-4.5 py-2 text-xs font-bold text-white bg-blue-600 hover:bg-blue-500 disabled:opacity-50 disabled:cursor-not-allowed rounded-xl transition-all cursor-pointer"
                >
                  {authLoading ? "Verifying..." : "Sign In"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </header>
  );
};

export default Header;
