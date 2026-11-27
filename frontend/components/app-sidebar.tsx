"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import {
    Newspaper,
    Compass,
    Feather,
    MessageSquareText,
    Bookmark,
    User2,
    Settings,
    LogOut,
    Sparkles,
} from "lucide-react";

import {
    Sidebar,
    SidebarContent,
    SidebarFooter,
    SidebarGroup,
    SidebarGroupContent,
    SidebarGroupLabel,
    SidebarHeader,
    SidebarMenu,
    SidebarMenuBadge,
    SidebarMenuButton,
    SidebarMenuItem,
    SidebarRail,
    useSidebar,
} from "@/components/ui/sidebar";

const primaryNav = [
    { title: "Front Page", url: "/dashboard", icon: Newspaper },
    { title: "Explore", url: "/explore", icon: Compass },
    { title: "New Dispatch", url: "/create", icon: Feather },
    { title: "Owl Post", url: "/messages", icon: MessageSquareText, badge: "" },
    { title: "Clippings", url: "/saved", icon: Bookmark },
];

const accountNav = [
    { title: "Wizarding Profile", url: "/profile", icon: User2 },
    { title: "Settings", url: "/settings", icon: Settings },
];

interface AppSidebarProps {
    user?: {
        name?: string;
        username?: string;
        imageUrl?: string;
    } | null;
    onLogout?: () => void;
}

export function AppSidebar({ user, onLogout }: AppSidebarProps) {
    const pathname = usePathname();
    const { isMobile } = useSidebar();

    // Keep mobile completely free for the bottom dock
    if (isMobile) return null;

    return (
        <Sidebar
            collapsible="icon"
            variant="sidebar"
            className="hidden border-r border-sidebar-border md:flex"
        >
            {/* Brand Masthead */}
            <SidebarHeader className="border-b border-sidebar-border py-3">
                <SidebarMenu>
                    <SidebarMenuItem>
                        <SidebarMenuButton size="lg" render={<Link href="/dashboard" />}>
                            <div className="flex aspect-square size-8 shrink-0 items-center justify-center rounded-sm border border-[#d4af37]/60 bg-sidebar-accent p-1">
                                <Image
                                    src="/logo.svg"
                                    alt="The Daily Prophet"
                                    width={22}
                                    height={22}
                                    className="size-full object-contain"
                                />
                            </div>
                            <div className="grid flex-1 text-left leading-tight">
                <span className="truncate font-display text-sm font-bold tracking-wider text-sidebar-foreground uppercase">
                  Daily Prophet
                </span>
                                <span className="truncate font-mono text-[10px] tracking-widest text-muted-foreground uppercase">
                  Wizarding Dispatch
                </span>
                            </div>
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                </SidebarMenu>
            </SidebarHeader>

            {/* Scrollable Navigation */}
            <SidebarContent className="py-2">
                <SidebarGroup>
                    <SidebarGroupLabel className="font-mono text-[10px] tracking-widest text-muted-foreground uppercase">
                        Editions
                    </SidebarGroupLabel>
                    <SidebarGroupContent>
                        <SidebarMenu>
                            {primaryNav.map((item) => {
                                const isActive =
                                    pathname === item.url || pathname.startsWith(`${item.url}/`);
                                return (
                                    <SidebarMenuItem key={item.title}>
                                        <SidebarMenuButton
                                            render={<Link href={item.url} />}
                                            isActive={isActive}
                                            tooltip={item.title}
                                            className={
                                                isActive
                                                    ? "bg-sidebar-accent font-medium text-[#d4af37] hover:bg-sidebar-accent hover:text-[#d4af37]"
                                                    : "text-sidebar-foreground/80 hover:text-sidebar-foreground"
                                            }
                                        >
                                            <item.icon className="size-4" />
                                            <span>{item.title}</span>
                                        </SidebarMenuButton>
                                        {item.badge && (
                                            <SidebarMenuBadge className="font-mono text-[10px]">
                                                {item.badge}
                                            </SidebarMenuBadge>
                                        )}
                                    </SidebarMenuItem>
                                );
                            })}
                        </SidebarMenu>
                    </SidebarGroupContent>
                </SidebarGroup>

                <SidebarGroup className="mt-auto">
                    <SidebarGroupLabel className="font-mono text-[10px] tracking-widest text-muted-foreground uppercase">
                        Correspondent
                    </SidebarGroupLabel>
                    <SidebarGroupContent>
                        <SidebarMenu>
                            {accountNav.map((item) => {
                                const isActive =
                                    pathname === item.url || pathname.startsWith(`${item.url}/`);
                                return (
                                    <SidebarMenuItem key={item.title}>
                                        <SidebarMenuButton
                                            render={<Link href={item.url} />}
                                            isActive={isActive}
                                            tooltip={item.title}
                                            className={
                                                isActive
                                                    ? "bg-sidebar-accent font-medium text-[#d4af37] hover:bg-sidebar-accent hover:text-[#d4af37]"
                                                    : "text-sidebar-foreground/80 hover:text-sidebar-foreground"
                                            }
                                        >
                                            <item.icon className="size-4" />
                                            <span>{item.title}</span>
                                        </SidebarMenuButton>
                                    </SidebarMenuItem>
                                );
                            })}
                        </SidebarMenu>
                    </SidebarGroupContent>
                </SidebarGroup>
            </SidebarContent>

            {/* Sticky User Footer */}
            <SidebarFooter className="border-t border-sidebar-border py-2.5">
                <SidebarMenu>
                    <SidebarMenuItem>
                        <SidebarMenuButton
                            size="lg"
                            render={<Link href="/profile" />}
                            tooltip={user?.name ?? "Profile"}
                        >
                            <div className="flex size-8 shrink-0 items-center justify-center overflow-hidden rounded-full border border-[#d4af37]/70 bg-sidebar-accent font-serif text-xs font-semibold text-[#d4af37]">
                                {user?.imageUrl ? (
                                    <img
                                        src={user.imageUrl}
                                        alt={user.name ?? "Correspondent"}
                                        className="size-full object-cover"
                                    />
                                ) : (
                                    <Sparkles className="size-3.5" />
                                )}
                            </div>
                            <div className="grid flex-1 text-left leading-tight">
                <span className="truncate font-serif text-sm font-semibold text-sidebar-foreground">
                  {user?.name ?? "Correspondent"}
                </span>
                                <span className="truncate font-mono text-[11px] text-muted-foreground">
                  @{user?.username ?? "wizard"}
                </span>
                            </div>
                        </SidebarMenuButton>
                    </SidebarMenuItem>

                    {onLogout && (
                        <SidebarMenuItem>
                            <SidebarMenuButton
                                onClick={onLogout}
                                tooltip="Sign out"
                                className="text-muted-foreground hover:bg-destructive/10 hover:text-destructive"
                            >
                                <LogOut className="size-4" />
                                <span>Sign out</span>
                            </SidebarMenuButton>
                        </SidebarMenuItem>
                    )}
                </SidebarMenu>
            </SidebarFooter>

            <SidebarRail />
        </Sidebar>
    );
}