"use client";

import { useEffect, useState } from "react";
import { Moon, Sun } from "lucide-react";
import { Button } from "@/components/ui/button";

type Theme = "dark" | "light";

function applyTheme(theme: Theme) {
    const root = document.documentElement;
    root.classList.toggle("light", theme === "light");
    root.classList.toggle("dark", theme === "dark");
    localStorage.setItem("theme", theme);
}

export function ThemeToggle() {
    const [theme, setTheme] = useState<Theme>("dark");
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        const stored = localStorage.getItem("theme");
        const initial: Theme = stored === "light" ? "light" : "dark";
        setTheme(initial);
        applyTheme(initial);
        setMounted(true);
    }, []);

    const toggleTheme = () => {
        const next: Theme = theme === "dark" ? "light" : "dark";
        setTheme(next);
        applyTheme(next);
    };

    return (
        <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={toggleTheme}
            aria-label={
                theme === "dark"
                    ? "Switch to parchment light theme"
                    : "Switch to dark theme"
            }
            className="gap-2 font-mono text-[11px] tracking-wider text-muted-foreground uppercase hover:bg-accent hover:text-gold"
        >
            {!mounted ? (
                <span className="size-4" />
            ) : theme === "dark" ? (
                <>
                    <Sun className="size-4" />
                    <span className="hidden sm:inline">Parchment</span>
                </>
            ) : (
                <>
                    <Moon className="size-4" />
                    <span className="hidden sm:inline">Midnight</span>
                </>
            )}
        </Button>
    );
}