"use client";

import * as React from "react";
import { Moon, Sun } from "lucide-react";

export function ThemeToggle({ className = "" }: { className?: string }) {
  const [theme, setTheme] = React.useState<"dark" | "light">("dark");
  const [mounted, setMounted] = React.useState(false);

  React.useEffect(() => {
    setMounted(true);
    // Read stored theme or system preference
    const stored = localStorage.getItem("henu_theme") as "dark" | "light" | null;
    if (stored) {
      setTheme(stored);
      applyTheme(stored);
    } else {
      const isDark = document.documentElement.classList.contains("dark");
      setTheme(isDark ? "dark" : "light");
    }
  }, []);

  const applyTheme = (nextTheme: "dark" | "light") => {
    const root = document.documentElement;
    if (nextTheme === "dark") {
      root.classList.add("dark");
      root.classList.remove("light");
    } else {
      root.classList.add("light");
      root.classList.remove("dark");
    }
  };

  const toggleTheme = () => {
    const nextTheme = theme === "dark" ? "light" : "dark";
    setTheme(nextTheme);
    applyTheme(nextTheme);
    localStorage.setItem("henu_theme", nextTheme);
  };

  if (!mounted) {
    return (
      <div className={`w-8 h-8 rounded p-1.5 flex items-center justify-center text-slate-400 ${className}`}>
        <Moon className="w-4 h-4 opacity-50" />
      </div>
    );
  }

  return (
    <button
      onClick={toggleTheme}
      type="button"
      title={theme === "dark" ? "Switch to Light Mode" : "Switch to Dark Mode"}
      aria-label={theme === "dark" ? "Switch to Light Mode" : "Switch to Dark Mode"}
      className={`p-2 rounded text-slate-400 hover:text-foreground hover:bg-surface-100 border border-transparent hover:border-border-default transition-all flex items-center justify-center group ${className}`}
    >
      {theme === "dark" ? (
        <Sun className="w-4 h-4 text-amber-400 group-hover:rotate-45 transition-transform duration-200" />
      ) : (
        <Moon className="w-4 h-4 text-sky-400 group-hover:-rotate-12 transition-transform duration-200" />
      )}
    </button>
  );
}
