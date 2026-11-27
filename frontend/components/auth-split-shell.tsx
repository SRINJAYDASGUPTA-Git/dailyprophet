"use client";

import * as React from "react";
import Image from "next/image";
import { Feather, MessageSquareText, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";

const pillars = [
    {
        icon: Feather,
        title: "Publish Dispatches",
        description:
            "Share thoughts, chronicles, and photo plates in a clutter-free broadsheet feed.",
    },
    {
        icon: MessageSquareText,
        title: "Direct Owl Post",
        description:
            "Real-time private correspondence with friends across every house.",
    },
    {
        icon: Sparkles,
        title: "Wizarding Identity",
        description:
            "Link your house, wand, and Patronus directly to your correspondent profile.",
    },
];

interface AuthSplitShellProps {
    children: React.ReactNode;
    eyebrow?: string;
    headlineTop?: string;
    headlineAccent?: string;
    description?: string;
    cardMaxWidth?: string;
}

export function AuthSplitShell({
                                   children,
                                   eyebrow = "Correspondent Desk",
                                   headlineTop = "Stories that move",
                                   headlineAccent = "across the realm.",
                                   description = "The Wizarding World's beguiling broadsheet—reimagined as a quiet, editorial social press for dispatches, clippings, and correspondence.",
                                   cardMaxWidth = "max-w-sm",
                               }: AuthSplitShellProps) {
    const [year, setYear] = React.useState(2026);

    React.useEffect(() => {
        setYear(new Date().getFullYear());
    }, []);

    return (
        <div className="grid min-h-svh w-full lg:grid-cols-2">
            {/* Left: Editorial Masthead Panel (Desktop) */}
            <aside className="relative hidden flex-col justify-between border-r border-border bg-sidebar p-10 lg:flex xl:p-14">
                <div className="flex items-center gap-3.5">
                    <div className="flex size-11 shrink-0 items-center justify-center rounded-sm border border-gold/60 bg-background/60 p-1.5">
                        <Image
                            src="/logo.svg"
                            alt="The Daily Prophet"
                            width={32}
                            height={32}
                            className="size-full object-contain"
                            priority
                        />
                    </div>
                    <div className="leading-tight">
                        <p className="font-display text-base font-bold tracking-[0.16em] text-sidebar-foreground uppercase">
                            The Daily Prophet
                        </p>
                        <p className="font-mono text-[10px] tracking-[0.22em] text-muted-foreground uppercase">
                            Wizarding Network · Est. 1743
                        </p>
                    </div>
                </div>

                <div className="mx-auto my-12 w-full max-w-md space-y-8">
                    <div className="space-y-4">
                        <div className="flex items-center gap-2 font-mono text-[11px] tracking-[0.2em] text-gold uppercase">
                            <span className="h-px w-6 bg-gold/70" />
                            <span>{eyebrow}</span>
                        </div>

                        <h1 className="font-display text-4xl leading-[1.15] font-semibold tracking-wide text-sidebar-foreground xl:text-[42px]">
                            {headlineTop}
                            <br />
                            <span className="font-serif font-normal text-gold italic">
                {headlineAccent}
              </span>
                        </h1>

                        <p className="font-serif text-base leading-relaxed text-muted-foreground">
                            {description}
                        </p>
                    </div>

                    <div className="border-t-2 border-border pt-0.75">
                        <div className="border-t border-gold/40" />
                    </div>

                    <div className="space-y-3">
                        {pillars.map(({ icon: Icon, title, description: itemDesc }) => (
                            <div
                                key={title}
                                className="flex items-start gap-3.5 rounded-sm border border-border bg-background/40 p-4 transition-colors hover:border-gold/40"
                            >
                                <div className="mt-0.5 flex size-8 shrink-0 items-center justify-center rounded-sm border border-gold/30 bg-sidebar-accent text-gold">
                                    <Icon className="size-4" />
                                </div>
                                <div className="space-y-0.5">
                                    <p className="font-serif text-[15px] font-semibold text-sidebar-foreground">
                                        {title}
                                    </p>
                                    <p className="text-xs leading-relaxed text-muted-foreground">
                                        {itemDesc}
                                    </p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="flex items-center justify-between border-t border-border pt-5 font-mono text-[11px] tracking-wider text-muted-foreground">
                    <span>© {year} THE DAILY PROPHET</span>
                    <span className="uppercase">Edition No. 01</span>
                </div>
            </aside>

            {/* Right: Form Desk */}
            <main className="flex flex-col items-center justify-center bg-background px-6 py-16 lg:px-12">
                <div className={cn("w-full", cardMaxWidth)}>
                    {/* Compact Mobile Masthead */}
                    <div className="mb-8 flex flex-col items-center gap-3 text-center lg:hidden">
                        <div className="flex size-12 items-center justify-center rounded-sm border border-gold/60 bg-card p-2">
                            <Image
                                src="/logo.svg"
                                alt="The Daily Prophet"
                                width={36}
                                height={36}
                                className="size-full object-contain"
                                priority
                            />
                        </div>
                        <div>
                            <p className="font-display text-lg font-bold tracking-[0.16em] text-foreground uppercase">
                                The Daily Prophet
                            </p>
                            <p className="font-mono text-[10px] tracking-[0.2em] text-muted-foreground uppercase">
                                Wizarding Dispatch
                            </p>
                        </div>
                    </div>

                    {/* Framed Broadsheet Card */}
                    <div className="overflow-hidden rounded-sm border border-border bg-card shadow-sm">
                        <div className="border-t-[3px] border-foreground/80 pt-0.5">
                            <div className="border-t border-gold/60" />
                        </div>
                        <div className="p-6 sm:p-8">{children}</div>
                    </div>
                </div>
            </main>
        </div>
    );
}