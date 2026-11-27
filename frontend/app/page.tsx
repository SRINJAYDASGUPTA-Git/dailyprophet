"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowRight,
  Bookmark,
  Feather,
  MessageSquare,
  MessageSquareText,
  Send,
  Sparkles,
} from "lucide-react";

import { ThemeToggle } from "@/components/theme-toggle";
import { useUser } from "@/providers/UserContext";

const highlights = [
  {
    icon: Feather,
    label: "01 · Dispatches",
    title: "Editorial Feed",
    copy: "Short notes, long-form columns, and matted photo spreads—built for reading, not doomscrolling.",
  },
  {
    icon: MessageSquareText,
    label: "02 · Owl Post",
    title: "Private Correspondence",
    copy: "Instant direct messages delivered directly to your circle across every house.",
  },
  {
    icon: Sparkles,
    label: "03 · Registry",
    title: "Verified Identity",
    copy: "Bind your official Wizarding World house, wand, and Patronus straight to your byline.",
  },
];

export default function LandingPage() {
  const router = useRouter();
  const { user, loading } = useUser();

  // Local micro-interaction for the specimen post preview
  const [previewLiked, setPreviewLiked] = useState(true);
  const [previewSaved, setPreviewSaved] = useState(false);
  const [editionDate, setEditionDate] = useState("DAILY EDITION");
  const [year, setYear] = useState(2026);

  useEffect(() => {
    const now = new Date();
    setYear(now.getFullYear());
    setEditionDate(
        new Intl.DateTimeFormat("en-IN", {
          weekday: "short",
          day: "2-digit",
          month: "short",
          year: "numeric",
        })
            .format(now)
            .toUpperCase()
    );
  }, []);

  useEffect(() => {
    if (!loading && user) {
      router.replace("/dashboard");
    }
  }, [user, loading, router]);

  if (!loading && user) {
    return null;
  }

  return (
      <div className="flex min-h-svh flex-col bg-background text-foreground">
        {/* Top Masthead Bar */}
        <header className="sticky top-0 z-20 border-b border-border bg-background/85 backdrop-blur">
          <div className="mx-auto flex h-14 max-w-6xl items-center justify-between px-4 sm:px-6">
            <Link href="/" className="flex items-center gap-3">
              <div className="flex size-8 shrink-0 items-center justify-center rounded-sm border border-gold/60 bg-card p-1">
                <Image
                    src="/logo.svg"
                    alt="The Daily Prophet"
                    width={22}
                    height={22}
                    className="size-full object-contain"
                    priority
                />
              </div>
              <div className="leading-tight">
              <span className="block font-display text-sm font-bold tracking-[0.16em] uppercase">
                The Daily Prophet
              </span>
                <span className="hidden font-mono text-[9px] tracking-[0.2em] text-muted-foreground uppercase sm:block">
                {editionDate}
              </span>
              </div>
            </Link>

            <div className="flex items-center gap-2 sm:gap-3">
              <ThemeToggle />
              <div className="h-4 w-px bg-border" />
              <Link
                  href="/login"
                  className="rounded-sm px-3 py-1.5 font-mono text-[11px] font-medium tracking-wider text-muted-foreground uppercase transition-colors hover:bg-accent hover:text-foreground"
              >
                Sign In
              </Link>
              <Link
                  href="/register"
                  className="hidden rounded-sm bg-primary px-3.5 py-1.5 font-mono text-[11px] font-semibold tracking-wider text-primary-foreground uppercase transition-opacity hover:opacity-90 sm:inline-flex"
              >
                Subscribe
              </Link>
            </div>
          </div>
        </header>

        {/* Main Broadsheet Front Page */}
        <main className="mx-auto flex w-full max-w-6xl flex-1 flex-col justify-center px-4 py-12 sm:px-6 lg:py-16">
          <div className="grid items-center gap-12 lg:grid-cols-12 lg:gap-10">
            {/* Left: Headline & CTAs */}
            <div className="space-y-7 lg:col-span-6">
              <div className="inline-flex items-center gap-2 rounded-sm border border-gold/40 bg-card px-3 py-1 font-mono text-[10px] tracking-[0.2em] text-gold uppercase">
                <span className="size-1.5 rounded-full bg-gold" />
                Subscribers-Only Edition
              </div>

              <div className="space-y-4">
                <h1 className="font-display text-4xl leading-[1.12] font-semibold tracking-wide sm:text-5xl">
                  A quieter press for the{" "}
                  <span className="font-serif font-normal text-gold italic">
                  Wizarding World.
                </span>
                </h1>
                <p className="max-w-lg font-serif text-lg leading-relaxed text-muted-foreground">
                  Publish dispatches, clip memorable columns, and exchange direct
                  Owl Post inside a private social broadsheet—complete with your
                  verified house, wand, and Patronus.
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-3 pt-1">
                <Link
                    href="/register"
                    className="inline-flex h-11 items-center justify-center gap-2 rounded-sm bg-primary px-6 font-mono text-xs font-semibold tracking-[0.16em] text-primary-foreground uppercase transition-opacity hover:opacity-90"
                >
                  Begin Subscription
                  <ArrowRight className="size-3.5" />
                </Link>
                <Link
                    href="/login"
                    className="inline-flex h-11 items-center justify-center rounded-sm border border-border bg-card px-6 font-mono text-xs font-medium tracking-[0.16em] text-foreground uppercase transition-colors hover:border-gold/60 hover:text-gold"
                >
                  Correspondent Sign In
                </Link>
              </div>

              <p className="font-mono text-[11px] tracking-wider text-muted-foreground">
                PRIVATE FEED · VERIFIED BYLINES · ZERO ALGORITHMIC CLUTTER
              </p>
            </div>

            {/* Right: Live Specimen Dispatch Card */}
            <div className="lg:col-span-6">
              <div className="relative mx-auto max-w-md lg:ml-auto lg:mr-0">
                <p className="mb-2.5 flex items-center justify-between font-mono text-[10px] tracking-[0.2em] text-muted-foreground uppercase">
                  <span>Specimen Dispatch</span>
                  <span className="text-gold">Edition Preview</span>
                </p>

                <article className="overflow-hidden rounded-sm border border-border bg-card text-card-foreground shadow-lg">
                  {/* Double Broadsheet Top Rule */}
                  <div className="border-t-[3px] border-foreground/85 pt-0.5">
                    <div className="border-t border-gold/65" />
                  </div>

                  {/* Byline */}
                  <header className="flex items-center justify-between px-5 pt-4 pb-3">
                    <div className="flex items-center gap-3">
                      <div className="flex size-10 items-center justify-center rounded-full border border-gold/70 bg-background font-serif text-xs font-semibold text-gold">
                        HG
                      </div>
                      <div>
                        <p className="font-serif text-[15px] font-semibold leading-tight">
                          Hermione Granger
                        </p>
                        <p className="font-mono text-[11px] text-muted-foreground">
                          @hgranger · 14M AGO
                        </p>
                      </div>
                    </div>
                    <span className="rounded-sm border border-gold/40 bg-background/60 px-2 py-0.5 font-mono text-[10px] tracking-widest text-gold uppercase">
                    Gryffindor
                  </span>
                  </header>

                  {/* Editorial Text-Only Bulletin Body */}
                  <div className="px-5 py-4">
                    <p className="border-l-2 border-gold pl-4 font-serif text-[17px] leading-relaxed text-card-foreground">
                      Late-evening notes from the Restricted Section: the archive
                      indices have finally been cross-referenced. Expect the full
                      chronicle in tomorrow morning&apos;s edition.
                    </p>
                  </div>

                  {/* Ledger Footer (Interactive Preview) */}
                  <footer className="flex items-center justify-between border-t border-border bg-background/40 px-3 py-2">
                    <div className="flex items-center gap-1">
                      <button
                          type="button"
                          onClick={() => setPreviewLiked((v) => !v)}
                          aria-pressed={previewLiked}
                          className={`inline-flex items-center gap-1.5 rounded-sm px-2.5 py-1.5 font-mono text-xs tabular-nums transition-colors ${
                              previewLiked
                                  ? "bg-primary text-primary-foreground"
                                  : "text-muted-foreground hover:bg-accent hover:text-foreground"
                          }`}
                      >
                        <Sparkles
                            className={`size-3.5 ${previewLiked ? "text-gold" : ""}`}
                        />
                        <span>{previewLiked ? 143 : 142}</span>
                      </button>

                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1.5 font-mono text-xs tabular-nums text-muted-foreground">
                      <MessageSquare className="size-3.5" />
                      <span>18</span>
                    </span>

                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1.5 font-mono text-xs tabular-nums text-muted-foreground">
                      <Send className="size-3.5" />
                      <span>9</span>
                    </span>
                    </div>

                    <button
                        type="button"
                        onClick={() => setPreviewSaved((v) => !v)}
                        aria-pressed={previewSaved}
                        className={`inline-flex items-center gap-1.5 rounded-sm px-2.5 py-1.5 font-mono text-xs tabular-nums transition-colors ${
                            previewSaved
                                ? "text-gold"
                                : "text-muted-foreground hover:bg-accent hover:text-foreground"
                        }`}
                    >
                      <Bookmark
                          className={`size-3.5 ${previewSaved ? "fill-current" : ""}`}
                      />
                      <span>{previewSaved ? 35 : 34}</span>
                    </button>
                  </footer>
                </article>
              </div>
            </div>
          </div>

          {/* Broadsheet 3-Column Feature Strip */}
          <section className="mt-16 border-t-2 border-border pt-0.75">
            <div className="border-t border-gold/40 pt-8">
              <div className="grid gap-8 sm:grid-cols-3 sm:divide-x sm:divide-border">
                {highlights.map(({ icon: Icon, label, title, copy }) => (
                    <div key={label} className="space-y-2 sm:px-6 sm:first:pl-0 sm:last:pr-0">
                      <div className="flex items-center gap-2 font-mono text-[10px] tracking-[0.2em] text-gold uppercase">
                        <Icon className="size-3.5" />
                        <span>{label}</span>
                      </div>
                      <h2 className="font-serif text-lg font-semibold text-foreground">
                        {title}
                      </h2>
                      <p className="text-sm leading-relaxed text-muted-foreground">
                        {copy}
                      </p>
                    </div>
                ))}
              </div>
            </div>
          </section>
        </main>

        {/* Colophon Footer */}
        <footer className="border-t border-border py-5">
          <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-2 px-4 font-mono text-[11px] tracking-wider text-muted-foreground sm:px-6">
            <span>© {year} THE DAILY PROPHET</span>
            <span className="uppercase">Private Wizarding Social Press</span>
          </div>
        </footer>
      </div>
  );
}