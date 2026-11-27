"use client";

import React, { useEffect, useRef, useState } from "react";
import Link from "next/link";
import {
    Archive,
    Bookmark,
    Check,
    ChevronLeft,
    ChevronRight,
    MessageSquare,
    MoreHorizontal,
    Pencil,
    Send,
    Sparkles,
    Trash2,
} from "lucide-react";

import axiosInstance from "@/utils/axiosInstance";
import { toast } from "@/components/ui/toast";
import { useUser } from "@/providers/UserContext";
import type { PostResponse, UserLeanResponse } from "@/types";

interface DispatchPostProps {
    post: PostResponse;
    author?: UserLeanResponse;
    initialLiked?: boolean;
    initialSaved?: boolean;
    /** Optional expandable comments section rendered directly inside the card */
    commentsOpen?: boolean;
    commentsSlot?: React.ReactNode;
    /** Override built-in API calls if you manage state at the feed level */
    onLike?: (postId: string, nextLiked: boolean) => Promise<void> | void;
    onSave?: (postId: string, nextSaved: boolean) => Promise<void> | void;
    onDelete?: (postId: string) => Promise<void> | void;
    onEditClick?: (post: PostResponse) => void;
    onCommentClick?: (postId: string) => void;
    onShare?: (postId: string) => Promise<void> | void;
}

function formatStaticDate(timestamp?: string): string {
    if (!timestamp) return "RECENT EDITION";
    const date = new Date(timestamp);
    if (Number.isNaN(date.getTime())) return timestamp;

    return date
        .toLocaleDateString("en-IN", {
            day: "2-digit",
            month: "short",
            year: "numeric",
        })
        .toUpperCase();
}

function formatRelativeDate(timestamp?: string): string {
    if (!timestamp) return "RECENT EDITION";
    const date = new Date(timestamp);
    if (Number.isNaN(date.getTime())) return timestamp;

    const diffSec = Math.floor((Date.now() - date.getTime()) / 1000);
    if (diffSec < 60) return "JUST NOW";
    if (diffSec < 3600) return `${Math.floor(diffSec / 60)}M AGO`;
    if (diffSec < 86400) return `${Math.floor(diffSec / 3600)}H AGO`;
    if (diffSec < 604800) return `${Math.floor(diffSec / 86400)}D AGO`;

    return formatStaticDate(timestamp);
}

function getInitials(name?: string): string {
    if (!name) return "DP";
    return name
        .trim()
        .split(/\s+/)
        .slice(0, 2)
        .map((part) => part[0]?.toUpperCase())
        .join("");
}

export function DispatchPost({
                                 post,
                                 author,
                                 initialLiked = false,
                                 initialSaved = false,
                                 commentsOpen = false,
                                 commentsSlot,
                                 onLike,
                                 onSave,
                                 onDelete,
                                 onEditClick,
                                 onCommentClick,
                                 onShare,
                             }: DispatchPostProps) {
    const { user: currentUser } = useUser();

    const [liked, setLiked] = useState(initialLiked);
    const [saved, setSaved] = useState(initialSaved);
    const [likesCount, setLikesCount] = useState(post.likesCount ?? 0);
    const [savesCount, setSavesCount] = useState(post.savesCount ?? 0);
    const [sharesCount, setSharesCount] = useState(post.sharesCount ?? 0);

    const [isLiking, setIsLiking] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);
    const [deletedLocally, setDeletedLocally] = useState(false);

    const [expandedCaption, setExpandedCaption] = useState(false);
    const [activeMediaIdx, setActiveMediaIdx] = useState<number | null>(null);
    const [justShared, setJustShared] = useState(false);
    const [menuOpen, setMenuOpen] = useState(false);

    // Compute relative time client-side to avoid Next.js 16 prerender/hydration warnings
    const [displayDate, setDisplayDate] = useState(() =>
        formatStaticDate(post.timestamp)
    );

    const menuRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        setDisplayDate(formatRelativeDate(post.timestamp));
    }, [post.timestamp]);

    useEffect(() => {
        setLiked(initialLiked);
    }, [initialLiked]);

    useEffect(() => {
        setSaved(initialSaved);
    }, [initialSaved]);

    useEffect(() => {
        setLikesCount(post.likesCount ?? 0);
        setSavesCount(post.savesCount ?? 0);
        setSharesCount(post.sharesCount ?? 0);
    }, [post.likesCount, post.savesCount, post.sharesCount]);

    // Close owner menu on outside click
    useEffect(() => {
        if (!menuOpen) return;
        const handleClickOutside = (e: MouseEvent) => {
            if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
                setMenuOpen(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, [menuOpen]);

    if (post.isDeleted || deletedLocally) {
        return (
            <article className="mx-auto w-full max-w-xl rounded-sm border border-border bg-card/60 px-5 py-4 font-mono text-[11px] tracking-widest text-muted-foreground uppercase">
                [ This dispatch has been redacted from the archives ]
            </article>
        );
    }

    const isOwner = Boolean(
        currentUser?.id && post.ownerId && currentUser.id === post.ownerId
    );
    const media = post.mediaUrls?.filter(Boolean) ?? [];
    const hasMedia = media.length > 0;
    const caption = post.caption?.trim() ?? "";
    const isLongCaption = caption.length > 260;
    const profileHref = author?.id
        ? `/profile/${author.id}`
        : post.ownerId
            ? `/profile/${post.ownerId}`
            : "#";

    const handleLike = async () => {
        if (!post.id || isLiking) return;

        const nextLiked = !liked;
        setIsLiking(true);
        setLiked(nextLiked);
        setLikesCount((c) => Math.max(0, c + (nextLiked ? 1 : -1)));

        try {
            if (onLike) {
                await onLike(post.id, nextLiked);
            } else if (nextLiked) {
                await axiosInstance.post(`/posts/${post.id}/like`);
            } else {
                await axiosInstance.delete(`/posts/${post.id}/unlike`);
            }
        } catch {
            setLiked(!nextLiked);
            setLikesCount((c) => Math.max(0, c + (nextLiked ? -1 : 1)));
            toast.add({
                title: "Could not update endorsement",
                description: "Please try again in a moment.",
                type: "error",
            });
        } finally {
            setIsLiking(false);
        }
    };

    const handleSave = async () => {
        if (!post.id || isSaving) return;

        const nextSaved = !saved;
        setIsSaving(true);
        setSaved(nextSaved);
        setSavesCount((c) => Math.max(0, c + (nextSaved ? 1 : -1)));

        try {
            if (onSave) {
                await onSave(post.id, nextSaved);
            } else if (nextSaved) {
                await axiosInstance.post(`/posts/${post.id}/save`);
            } else {
                await axiosInstance.delete(`/posts/${post.id}/unsave`);
            }
        } catch {
            setSaved(!nextSaved);
            setSavesCount((c) => Math.max(0, c + (nextSaved ? -1 : 1)));
            toast.add({
                title: "Could not update clippings",
                description: "Please try again in a moment.",
                type: "error",
            });
        } finally {
            setIsSaving(false);
        }
    };

    const handleShare = async () => {
        if (!post.id) return;
        const shareUrl = `${window.location.origin}/post/${post.id}`;

        try {
            if (navigator.share) {
                await navigator.share({
                    title: `${author?.name ?? "Correspondent"} on The Daily Prophet`,
                    text: caption.slice(0, 140),
                    url: shareUrl,
                });
            } else {
                await navigator.clipboard.writeText(shareUrl);
                toast.add({
                    title: "Dispatch link copied",
                    description: "Ready to paste into Owl Post.",
                    type: "info",
                });
            }

            setJustShared(true);
            setTimeout(() => setJustShared(false), 1800);

            if (onShare) {
                await onShare(post.id);
                setSharesCount((c) => c + 1);
            }
        } catch (err: any) {
            // Ignore user cancelling native share sheet
            if (err?.name !== "AbortError") {
                toast.add({
                    title: "Could not share link",
                    description: "Copy the URL manually from your browser.",
                    type: "error",
                });
            }
        }
    };

    const handleDelete = async () => {
        if (!post.id || isDeleting) return;
        setMenuOpen(false);
        setIsDeleting(true);

        try {
            if (onDelete) {
                await onDelete(post.id);
            } else {
                await axiosInstance.delete(`/posts/${post.id}`);
            }
            setDeletedLocally(true);
            toast.add({
                title: "Dispatch redacted",
                description: "Your post has been removed.",
                type: "success",
            });
        } catch {
            toast.add({
                title: "Could not delete dispatch",
                description: "Please try again.",
                type: "error",
            });
        } finally {
            setIsDeleting(false);
        }
    };

    const cycleMedia = (dir: -1 | 1) => {
        if (activeMediaIdx === null) return;
        setActiveMediaIdx((activeMediaIdx + dir + media.length) % media.length);
    };

    return (
        <article className="mx-auto w-full max-w-xl overflow-hidden rounded-sm border border-border bg-card text-card-foreground shadow-sm transition-colors hover:border-gold/30">
            {/* Double Broadsheet Top Rule */}
            <div className="border-t-[3px] border-foreground/80 pt-0.5">
                <div className="border-t border-gold/60" />
            </div>

            {/* Header / Byline */}
            <header className="flex items-center justify-between gap-3 px-5 pt-4 pb-3">
                <Link
                    href={profileHref}
                    className="group/author flex min-w-0 items-center gap-3 focus:outline-none"
                >
                    <div className="relative size-10 shrink-0 overflow-hidden rounded-full border border-gold/70 bg-background p-0.5">
                        {author?.imageUrl ? (
                            <img
                                src={author.imageUrl}
                                alt={author.name ?? "Correspondent"}
                                className="size-full rounded-full object-cover"
                            />
                        ) : (
                            <div className="flex size-full items-center justify-center rounded-full font-serif text-xs font-semibold text-gold">
                                {getInitials(author?.name)}
                            </div>
                        )}
                    </div>

                    <div className="min-w-0">
                        <p className="truncate font-serif text-[15px] font-semibold tracking-tight text-card-foreground decoration-gold underline-offset-4 group-hover/author:underline">
                            {author?.name ?? "Anonymous Correspondent"}
                        </p>
                        <div className="flex items-center gap-1.5 font-mono text-[11px] tracking-wide text-muted-foreground">
              <span className="truncate">
                @{author?.username ?? "correspondent"}
              </span>
                            <span aria-hidden="true">·</span>
                            <time dateTime={post.timestamp} className="shrink-0">
                                {displayDate}
                            </time>
                        </div>
                    </div>
                </Link>

                {/* Right Status & Owner Actions */}
                <div className="flex shrink-0 items-center gap-2">
                    {post.isArchived && (
                        <span className="inline-flex items-center gap-1 rounded-sm border border-gold/40 bg-background/60 px-2 py-0.5 font-mono text-[10px] font-medium tracking-widest text-gold uppercase">
              <Archive className="size-3" />
              Archived
            </span>
                    )}

                    {isOwner && (
                        <div ref={menuRef} className="relative">
                            <button
                                type="button"
                                onClick={() => setMenuOpen((prev) => !prev)}
                                aria-label="Dispatch actions"
                                aria-expanded={menuOpen}
                                className="inline-flex size-8 items-center justify-center rounded-sm text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
                            >
                                <MoreHorizontal className="size-4" />
                            </button>

                            {menuOpen && (
                                <div className="absolute right-0 top-9 z-20 w-40 overflow-hidden rounded-sm border border-border bg-popover p-1 text-popover-foreground shadow-md">
                                    {onEditClick && (
                                        <button
                                            type="button"
                                            onClick={() => {
                                                setMenuOpen(false);
                                                onEditClick(post);
                                            }}
                                            className="flex w-full items-center gap-2 rounded-xs px-2.5 py-1.5 text-left text-xs transition-colors hover:bg-accent"
                                        >
                                            <Pencil className="size-3.5 text-muted-foreground" />
                                            Edit dispatch
                                        </button>
                                    )}
                                    <button
                                        type="button"
                                        onClick={handleDelete}
                                        disabled={isDeleting}
                                        className="flex w-full items-center gap-2 rounded-xs px-2.5 py-1.5 text-left text-xs text-destructive transition-colors hover:bg-destructive/10 disabled:opacity-50"
                                    >
                                        <Trash2 className="size-3.5" />
                                        {isDeleting ? "Redacting..." : "Delete dispatch"}
                                    </button>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </header>

            {/* Editorial Body */}
            {caption && (
                <div className={`px-5 ${hasMedia ? "pb-3.5" : "py-4"}`}>
                    <p
                        className={
                            hasMedia
                                ? "whitespace-pre-line text-[15px] leading-relaxed text-card-foreground/90"
                                : "whitespace-pre-line border-l-2 border-gold pl-4 font-serif text-[18px] leading-relaxed text-card-foreground"
                        }
                    >
                        {isLongCaption && !expandedCaption
                            ? `${caption.slice(0, 260).trimEnd()}…`
                            : caption}
                    </p>

                    {isLongCaption && (
                        <button
                            type="button"
                            onClick={() => setExpandedCaption((prev) => !prev)}
                            className="mt-2 font-mono text-[11px] font-medium tracking-widest text-gold uppercase underline-offset-4 hover:underline"
                        >
                            {expandedCaption ? "Fold column" : "Continue reading"}
                        </button>
                    )}
                </div>
            )}

            {/* Matted Media Plates */}
            {hasMedia && (
                <div className="px-5 pb-4">
                    <div className="overflow-hidden rounded-xs border border-border bg-background/60 p-1.5">
                        {activeMediaIdx !== null ? (
                            /* Interactive Plate Viewer */
                            <div className="relative aspect-4/3 w-full overflow-hidden bg-background">
                                <img
                                    src={media[activeMediaIdx]}
                                    alt={`Plate ${activeMediaIdx + 1}`}
                                    className="size-full object-contain"
                                />
                                {media.length > 1 && (
                                    <>
                                        <button
                                            type="button"
                                            onClick={() => cycleMedia(-1)}
                                            aria-label="Previous plate"
                                            className="absolute left-2 top-1/2 -translate-y-1/2 rounded-full border border-border bg-card/85 p-1.5 text-foreground backdrop-blur transition-colors hover:border-gold hover:text-gold"
                                        >
                                            <ChevronLeft className="size-4" />
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => cycleMedia(1)}
                                            aria-label="Next plate"
                                            className="absolute right-2 top-1/2 -translate-y-1/2 rounded-full border border-border bg-card/85 p-1.5 text-foreground backdrop-blur transition-colors hover:border-gold hover:text-gold"
                                        >
                                            <ChevronRight className="size-4" />
                                        </button>
                                    </>
                                )}
                                <button
                                    type="button"
                                    onClick={() => setActiveMediaIdx(null)}
                                    className="absolute right-2 top-2 rounded-xs border border-gold/40 bg-card/90 px-2 py-0.5 font-mono text-[10px] tracking-widest text-gold uppercase backdrop-blur"
                                >
                                    {media.length > 1 ? "Grid" : "Close"} · {activeMediaIdx + 1}/
                                    {media.length}
                                </button>
                            </div>
                        ) : media.length === 1 ? (
                            /* Single Plate */
                            <button
                                type="button"
                                onClick={() => setActiveMediaIdx(0)}
                                className="block w-full overflow-hidden focus:outline-none"
                            >
                                <img
                                    src={media[0]}
                                    alt="Dispatch plate"
                                    className="max-h-110 w-full object-cover transition-transform duration-500 hover:scale-[1.015]"
                                />
                            </button>
                        ) : media.length === 2 ? (
                            /* Diptych */
                            <div className="grid grid-cols-2 gap-1.5">
                                {media.map((url, idx) => (
                                    <button
                                        key={url + idx}
                                        type="button"
                                        onClick={() => setActiveMediaIdx(idx)}
                                        className="aspect-4/5 overflow-hidden focus:outline-none"
                                    >
                                        <img
                                            src={url}
                                            alt={`Plate ${idx + 1}`}
                                            className="size-full object-cover transition-transform duration-500 hover:scale-[1.02]"
                                        />
                                    </button>
                                ))}
                            </div>
                        ) : (
                            /* Asymmetric Broadsheet Spread (3+ images) */
                            <div className="grid h-72 grid-cols-3 gap-1.5">
                                <button
                                    type="button"
                                    onClick={() => setActiveMediaIdx(0)}
                                    className="col-span-2 h-full overflow-hidden focus:outline-none"
                                >
                                    <img
                                        src={media[0]}
                                        alt="Primary plate"
                                        className="size-full object-cover transition-transform duration-500 hover:scale-[1.02]"
                                    />
                                </button>
                                <div className="grid grid-rows-2 gap-1.5">
                                    <button
                                        type="button"
                                        onClick={() => setActiveMediaIdx(1)}
                                        className="h-full overflow-hidden focus:outline-none"
                                    >
                                        <img
                                            src={media[1]}
                                            alt="Secondary plate"
                                            className="size-full object-cover transition-transform duration-500 hover:scale-[1.02]"
                                        />
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => setActiveMediaIdx(2)}
                                        className="relative h-full overflow-hidden focus:outline-none"
                                    >
                                        <img
                                            src={media[2]}
                                            alt="Third plate"
                                            className="size-full object-cover"
                                        />
                                        {media.length > 3 && (
                                            <div className="absolute inset-0 flex items-center justify-center bg-background/75 font-mono text-xs font-semibold tracking-widest text-gold backdrop-blur-[1px]">
                                                +{media.length - 3} PLATES
                                            </div>
                                        )}
                                    </button>
                                </div>
                            </div>
                        )}

                        <div className="mt-1.5 flex items-center justify-between px-1 font-mono text-[10px] tracking-widest text-muted-foreground uppercase">
              <span>
                Fig. {media.length === 1 ? "01" : `01–0${media.length}`}
              </span>
                            <span>The Daily Prophet</span>
                        </div>
                    </div>
                </div>
            )}

            {/* Ledger Action Footer */}
            <footer className="flex items-center justify-between border-t border-border bg-background/40 px-3 py-2">
                <div className="flex items-center gap-1">
                    {/* Like (Endorse) */}
                    <button
                        type="button"
                        onClick={handleLike}
                        disabled={isLiking}
                        aria-pressed={liked}
                        title={liked ? "Remove endorsement" : "Endorse"}
                        className={`inline-flex items-center gap-1.5 rounded-sm px-2.5 py-1.5 font-mono text-xs tabular-nums transition-colors ${
                            liked
                                ? "bg-primary text-primary-foreground"
                                : "text-muted-foreground hover:bg-accent hover:text-foreground"
                        }`}
                    >
                        <Sparkles className={`size-3.5 ${liked ? "text-gold" : ""}`} />
                        <span>{likesCount}</span>
                    </button>

                    {/* Comment */}
                    <button
                        type="button"
                        onClick={() => post.id && onCommentClick?.(post.id)}
                        aria-expanded={commentsOpen}
                        title="Correspondence"
                        className={`inline-flex items-center gap-1.5 rounded-sm px-2.5 py-1.5 font-mono text-xs tabular-nums transition-colors ${
                            commentsOpen
                                ? "bg-accent text-gold"
                                : "text-muted-foreground hover:bg-accent hover:text-foreground"
                        }`}
                    >
                        <MessageSquare className="size-3.5" />
                        <span>{post.commentsCount ?? 0}</span>
                    </button>

                    {/* Share */}
                    <button
                        type="button"
                        onClick={handleShare}
                        title="Dispatch link"
                        className="inline-flex items-center gap-1.5 rounded-sm px-2.5 py-1.5 font-mono text-xs tabular-nums text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
                    >
                        {justShared ? (
                            <>
                                <Check className="size-3.5 text-gold" />
                                <span className="text-[11px] text-gold">Dispatched</span>
                            </>
                        ) : (
                            <>
                                <Send className="size-3.5" />
                                <span>{sharesCount}</span>
                            </>
                        )}
                    </button>
                </div>

                {/* Save (Clip to Archive) */}
                <button
                    type="button"
                    onClick={handleSave}
                    disabled={isSaving}
                    aria-pressed={saved}
                    title={saved ? "Remove clipping" : "Save clipping"}
                    className={`inline-flex items-center gap-1.5 rounded-sm px-2.5 py-1.5 font-mono text-xs tabular-nums transition-colors ${
                        saved
                            ? "font-semibold text-gold"
                            : "text-muted-foreground hover:bg-accent hover:text-foreground"
                    }`}
                >
                    <Bookmark className={`size-3.5 ${saved ? "fill-current" : ""}`} />
                    <span>{savesCount}</span>
                </button>
            </footer>

            {/* Expandable Inline Comments Slot */}
            {commentsOpen && commentsSlot && (
                <div className="border-t border-border bg-background/50">
                    {commentsSlot}
                </div>
            )}
        </article>
    );
}