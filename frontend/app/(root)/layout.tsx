"use client";

import React, {useEffect} from "react";
import {
    SidebarInset,
    SidebarProvider,
    SidebarTrigger,
} from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/app-sidebar";
import { ThemeToggle } from "@/components/theme-toggle";
import { useUser } from "@/providers/UserContext";
import {useRouter} from "next/navigation";

export default function RootAppLayout({
                                          children,
                                      }: {
    children: React.ReactNode;
}) {
    const router = useRouter();
    const { user, loading } = useUser();

    useEffect(() => {
        if (!loading && !user) {
            router.replace("/login");
        }
    }, [loading, user, router]);

    if (loading || !user) return null;

    return (
        <SidebarProvider
            style={
                {
                    "--sidebar-width": "15.5rem",
                } as React.CSSProperties
            }
        >
            <AppSidebar user={user} />

            <SidebarInset className="min-h-svh bg-background text-foreground">
                <header className="sticky top-0 z-20 flex h-12 items-center justify-between border-b border-border bg-background/85 px-4 backdrop-blur">
                    <div className="flex items-center gap-3">
                        <SidebarTrigger className="hidden text-foreground hover:bg-accent md:inline-flex" />
                        <div className="hidden h-4 w-px bg-border md:block" />
                        <span className="font-mono text-[11px] tracking-widest text-muted-foreground uppercase">
              Daily Prophet · Edition
            </span>
                    </div>

                    <ThemeToggle />
                </header>

                <main className="flex-1 px-4 pt-4 pb-24 md:px-6 md:py-6">
                    {children}
                </main>
            </SidebarInset>
        </SidebarProvider>
    );
}