"use client";

import React, { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { AlertCircle, Feather, Loader2, RefreshCw } from "lucide-react";

import axiosInstance from "@/utils/axiosInstance";
import { useUser } from "@/providers/UserContext";
import { DispatchPost } from "@/components/dispatch-post";
import { Button } from "@/components/ui/button";
import type {PageResponse, PostResponse, UserLeanResponse} from "@/types";

const PAGE_SIZE = 10;

function DispatchSkeleton() {
    return (
        <div className="mx-auto w-full max-w-xl animate-pulse overflow-hidden rounded-sm border border-border bg-card">
            <div className="border-t-[3px] border-border pt-0.5">
                <div className="border-t border-gold/25" />
            </div>
            <div className="flex items-center gap-3 px-5 pt-4 pb-3">
                <div className="size-10 rounded-full bg-muted" />
                <div className="space-y-2">
                    <div className="h-3.5 w-36 rounded-xs bg-muted" />
                    <div className="h-2.5 w-24 rounded-xs bg-muted" />
                </div>
            </div>
            <div className="space-y-2.5 px-5 py-4">
                <div className="h-3.5 w-full rounded-xs bg-muted" />
                <div className="h-3.5 w-5/6 rounded-xs bg-muted" />
                <div className="h-3.5 w-2/3 rounded-xs bg-muted" />
            </div>
            <div className="flex items-center justify-between border-t border-border bg-background/40 px-4 py-3">
                <div className="flex gap-3">
                    <div className="h-6 w-12 rounded-sm bg-muted" />
                    <div className="h-6 w-12 rounded-sm bg-muted" />
                    <div className="h-6 w-12 rounded-sm bg-muted" />
                </div>
                <div className="h-6 w-12 rounded-sm bg-muted" />
            </div>
        </div>
    );
}

export default function DashboardPage() {
    const { user: currentUser } = useUser();

    const [posts, setPosts] = useState<PostResponse[]>([]);
    const [authorsById, setAuthorsById] = useState<
        Record<string, UserLeanResponse>
    >({});
    const fetchedAuthorIdsRef = useRef<Set<string>>(new Set());

    const [page, setPage] = useState(0);
    const [hasMore, setHasMore] = useState(false);
    const [initialLoading, setInitialLoading] = useState(true);
    const [loadingMore, setLoadingMore] = useState(false);
    const [refreshing, setRefreshing] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [openCommentsPostId, setOpenCommentsPostId] = useState<string | null>(
        null
    );

    // Seed cache with logged-in user so we skip redundant fetches for own posts
    useEffect(() => {
        if (currentUser?.id) {
            fetchedAuthorIdsRef.current.add(currentUser.id);
            setAuthorsById((prev) => ({
                ...prev,
                [currentUser.id!]: {
                    id: currentUser.id,
                    name: currentUser.name,
                    username: currentUser.username,
                    imageUrl: currentUser.imageUrl,
                },
            }));
        }
    }, [currentUser]);

    const hydrateAuthors = useCallback(async (incomingPosts: PostResponse[]) => {
        const missingIds = Array.from(
            new Set(
                incomingPosts
                    .map((p) => p.ownerId)
                    .filter(
                        (id): id is string =>
                            Boolean(id) && !fetchedAuthorIdsRef.current.has(id)
                    )
            )
        );

        if (missingIds.length === 0) return;

        missingIds.forEach((id) => fetchedAuthorIdsRef.current.add(id));

        const results = await Promise.allSettled(
            missingIds.map(async (ownerId) => {
                const res = await axiosInstance.get(`/users/${ownerId}`);
                // Supports both raw UserLeanResponse and { data: UserLeanResponse } wrappers
                const author: UserLeanResponse = res.data?.data ?? res.data;
                return [ownerId, author] as const;
            })
        );

        const resolved: Record<string, UserLeanResponse> = {};
        results.forEach((result, idx) => {
            if (result.status === "fulfilled" && result.value[1]) {
                const [ownerId, author] = result.value;
                resolved[ownerId] = author;
            } else {
                // Allow retry on future loads if this lookup failed
                fetchedAuthorIdsRef.current.delete(missingIds[idx]);
            }
        });

        if (Object.keys(resolved).length > 0) {
            setAuthorsById((prev) => ({ ...prev, ...resolved }));
        }
    }, []);

    const fetchPosts = useCallback(
        async (targetPage: number, mode: "initial" | "more" | "refresh") => {
            setError(null);
            if (mode === "initial") setInitialLoading(true);
            if (mode === "more") setLoadingMore(true);
            if (mode === "refresh") setRefreshing(true);

            try {
                const res = await axiosInstance.get("/posts", {
                    params: { page: targetPage, size: PAGE_SIZE },
                });

                // Supports both direct PageResponse<PostResponse> and { data: PageResponse }
                const payload: PageResponse<PostResponse> = res.data?.data ?? res.data;
                const incoming = Array.isArray(payload?.content) ? payload.content : [];

                setPosts((prev) => {
                    if (targetPage === 0) return incoming;
                    const existingIds = new Set(prev.map((p) => p.id));
                    const uniqueNext = incoming.filter((p) => !existingIds.has(p.id));
                    return [...prev, ...uniqueNext];
                });

                setPage(targetPage);

                if (typeof payload?.last === "boolean") {
                    setHasMore(!payload.last);
                } else if (typeof payload?.totalPages === "number") {
                    setHasMore(targetPage + 1 < payload.totalPages);
                } else {
                    setHasMore(incoming.length === PAGE_SIZE);
                }

                // Fetch correspondent details in parallel without blocking post render
                void hydrateAuthors(incoming);
            } catch (err: any) {
                setError(
                    err?.response?.data?.message ||
                    "Could not load today's dispatches. Please try again."
                );
            } finally {
                setInitialLoading(false);
                setLoadingMore(false);
                setRefreshing(false);
            }
        },
        [hydrateAuthors]
    );

    useEffect(() => {
        void fetchPosts(0, "initial");
    }, [fetchPosts]);

    return (
        <div className="mx-auto w-full max-w-xl space-y-6">
            {/* Broadsheet Feed Masthead */}
            <header className="flex flex-wrap items-end justify-between gap-4 border-b border-border pb-4">
                <div>
                    <p className="font-mono text-[10px] tracking-[0.22em] text-gold uppercase">
                        Latest Wire
                    </p>
                    <h1 className="mt-0.5 font-display text-2xl font-semibold tracking-wide text-foreground">
                        Front Page
                    </h1>
                </div>

                <div className="flex items-center gap-2">
                    <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => void fetchPosts(0, "refresh")}
                        disabled={refreshing || initialLoading}
                        className="gap-1.5 rounded-sm font-mono text-[11px] tracking-wider text-muted-foreground uppercase hover:text-foreground"
                    >
                        <RefreshCw
                            className={`size-3.5 ${refreshing ? "animate-spin text-gold" : ""}`}
                        />
                        Refresh
                    </Button>

                    <Link
                        href="/create"
                        className="inline-flex h-8 items-center gap-1.5 rounded-sm bg-primary px-3 font-mono text-[11px] font-semibold tracking-wider text-primary-foreground uppercase transition-opacity hover:opacity-90"
                    >
                        <Feather className="size-3.5" />
                        New Dispatch
                    </Link>
                </div>
            </header>

            {/* Error State */}
            {error && (
                <div
                    role="alert"
                    className="flex items-center justify-between gap-3 rounded-sm border border-destructive/40 bg-destructive/10 px-4 py-3 text-xs text-destructive"
                >
                    <div className="flex items-center gap-2">
                        <AlertCircle className="size-4 shrink-0" />
                        <span>{error}</span>
                    </div>
                    <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => void fetchPosts(0, "initial")}
                        className="h-7 rounded-sm font-mono text-[10px] uppercase"
                    >
                        Retry
                    </Button>
                </div>
            )}

            {/* Initial Loading Skeletons */}
            {initialLoading ? (
                <div className="space-y-6">
                    <DispatchSkeleton />
                    <DispatchSkeleton />
                    <DispatchSkeleton />
                </div>
            ) : posts.length === 0 && !error ? (
                /* Empty State */
                <div className="overflow-hidden rounded-sm border border-border bg-card text-center">
                    <div className="border-t-[3px] border-foreground/80 pt-0.5">
                        <div className="border-t border-gold/60" />
                    </div>
                    <div className="px-6 py-12">
                        <p className="font-mono text-[10px] tracking-[0.22em] text-gold uppercase">
                            Press Quiet
                        </p>
                        <h2 className="mt-1 font-display text-xl font-semibold text-card-foreground">
                            No Dispatches Yet
                        </h2>
                        <p className="mx-auto mt-2 max-w-sm font-serif text-sm text-muted-foreground">
                            The front page is blank. Publish the first column to get today&apos;s
                            edition moving.
                        </p>
                        <Link
                            href="/create"
                            className="mt-5 inline-flex h-9 items-center gap-2 rounded-sm bg-primary px-4 font-mono text-xs font-semibold tracking-wider text-primary-foreground uppercase transition-opacity hover:opacity-90"
                        >
                            <Feather className="size-3.5" />
                            Write First Dispatch
                        </Link>
                    </div>
                </div>
            ) : (
                /* Feed Stream */
                <div className="space-y-6">
                    {posts.map((post) => (
                        <DispatchPost
                            key={post.id}
                            post={post}
                            author={post.ownerId ? authorsById[post.ownerId] : undefined}
                            commentsOpen={openCommentsPostId === post.id}
                            onCommentClick={(id) =>
                                setOpenCommentsPostId((prev) => (prev === id ? null : id))
                            }
                        />
                    ))}

                    {/* Pagination */}
                    {hasMore ? (
                        <div className="flex justify-center pt-2">
                            <Button
                                type="button"
                                variant="outline"
                                onClick={() => void fetchPosts(page + 1, "more")}
                                disabled={loadingMore}
                                className="rounded-sm border-border font-mono text-xs tracking-widest uppercase hover:border-gold/60 hover:text-gold"
                            >
                                {loadingMore ? (
                                    <>
                                        <Loader2 className="mr-2 size-3.5 animate-spin" />
                                        Loading Edition...
                                    </>
                                ) : (
                                    "Load Earlier Dispatches"
                                )}
                            </Button>
                        </div>
                    ) : (
                        <p className="py-4 text-center font-mono text-[10px] tracking-[0.22em] text-muted-foreground uppercase">
                            — End of Today&apos;s Edition —
                        </p>
                    )}
                </div>
            )}
        </div>
    );
}