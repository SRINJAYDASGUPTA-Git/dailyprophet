"use client";

import * as React from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import {
    AlertCircle,
    Check,
    CheckCircle2,
    ChevronRight,
    Copy,
    ExternalLink,
    Loader2,
    RefreshCw,
    Sparkles,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import {
    Questionnaire,
    QuestionnaireActions,
    QuestionnaireChoice,
    QuestionnaireChoices,
    QuestionnaireDescription,
    QuestionnaireError,
    QuestionnaireInput,
    QuestionnaireItem,
    QuestionnaireNext,
    QuestionnairePrevious,
    QuestionnaireProgress,
    QuestionnaireSubmit,
    QuestionnaireTitle,
} from "@/components/ui/questionnaire";
import { WizardingWorldProfile } from "@/types";
import axiosInstance from "@/utils/axiosInstance";
import { useUser } from "@/providers/UserContext";

type StepName = "profile-link" | "verify-symbol";

// --- Constants & Helpers ---

const UNICODE_LIST = [
    "U+09BE",
    "U+09BF",
    "U+09C0",
    "U+09C1",
    "U+09C2",
    "U+09C3",
    "U+09C4",
    "U+09C7",
    "U+09C8",
    "U+09CB",
    "U+09CC",
    "U+09CD",
    "U+0981",
    "U+0982",
    "U+0983",
    "U+09BC",
    "U+09D7",
] as const;

function unicodeToChar(codePoint: string): string {
    const hex = codePoint.replace(/^U\+/i, "");
    return String.fromCodePoint(parseInt(hex, 16));
}

function getRandomRenderedSymbol(previousSymbol?: string) {
    const candidates = UNICODE_LIST.map((unicode) => ({
        unicode,
        rendered: unicodeToChar(unicode),
    })).filter(({ rendered }) => rendered !== previousSymbol);

    const randomIndex = Math.floor(Math.random() * candidates.length);
    return candidates[randomIndex];
}

function extractProfileUid(profileUrl: string): string | null {
    try {
        return (
            new URL(profileUrl.trim()).pathname
                .split("/")
                .filter(Boolean)
                .at(-1) ?? null
        );
    } catch {
        return null;
    }
}

const PROFILE_URL_REGEX = /^https?:\/\/(www\.)?harrypotter\.com\/profile\/.+/i;

const QUESTIONNAIRE_ITEMS = [
    { name: "profile-link", required: true },
    { name: "verify-symbol", required: true },
] as const;

const INSTRUCTION_PATH = [
    "PROFILE",
    "ACTIONS",
    "ACCOUNT SETTINGS",
    "EDIT NAME",
] as const;

const SYMBOL_FONT_STYLE: React.CSSProperties = {
    fontFamily:
        '"Noto Sans Bengali", "Lohit Bengali", "Kohinoor Bangla", "Nirmala UI", sans-serif',
};

// --- API Helpers ---

async function fetchProfileData(
    profileUrl: string
): Promise<WizardingWorldProfile | null> {
    try {
        const uid = extractProfileUid(profileUrl);
        if (!uid) return null;

        const backendResponse = await axiosInstance.get(
            `/users/wizarding-world-profile?uid=${encodeURIComponent(uid)}`
        );

        if (backendResponse.status === 200) {
            return backendResponse.data;
        }
    } catch {
        return null;
    }
    return null;
}

async function verifyProfileSymbol(
    profileUrl: string,
    symbol: string,
    oldName?: string
): Promise<boolean> {
    try {
        const uid = extractProfileUid(profileUrl);
        if (!uid) return false;

        const backendResponse = await axiosInstance.post(
            "/users/verify-ww-access",
            {
                oldName,
                specialCharUnicode: symbol,
                uid,
            }
        );
        return backendResponse.status === 202;
    } catch (error) {
        console.error("WW verification failed:", error);
        return false;
    }
}

// --- Page Component ---

export default function LinkHarryPotterProfilePage() {
    const router = useRouter();
    const { refreshUser } = useUser();

    const [activeStep, setActiveStep] = React.useState<StepName>("profile-link");
    const [profileUrl, setProfileUrl] = React.useState("");
    const [profileData, setProfileData] =
        React.useState<WizardingWorldProfile | null>(null);
    const [verificationSymbol, setVerificationSymbol] = React.useState("");
    const [verificationSymbolUnicode, setVerificationSymbolUnicode] =
        React.useState("");

    const [isLoadingProfile, setIsLoadingProfile] = React.useState(false);
    const [isVerifying, setIsVerifying] = React.useState(false);
    const [isVerified, setIsVerified] = React.useState(false);

    const [copied, setCopied] = React.useState(false);
    const [attemptCount, setAttemptCount] = React.useState(1);
    const [errorMessage, setErrorMessage] = React.useState<string | null>(null);

    async function handleStepChange(nextStep: string) {
        setErrorMessage(null);

        if (nextStep === "profile-link") {
            setActiveStep("profile-link");
            return;
        }

        if (nextStep === "verify-symbol") {
            const trimmedUrl = profileUrl.trim();

            if (!PROFILE_URL_REGEX.test(trimmedUrl)) {
                setErrorMessage(
                    "Please enter a valid harrypotter.com/profile link (e.g. https://www.harrypotter.com/profile/...)."
                );
                return;
            }

            setIsLoadingProfile(true);
            try {
                const data = await fetchProfileData(trimmedUrl);
                if (!data) {
                    setErrorMessage(
                        "Could not load your Harry Potter profile. Check that the link is public and try again."
                    );
                    return;
                }

                setProfileData(data);

                const { rendered, unicode } = getRandomRenderedSymbol();
                setVerificationSymbol(rendered);
                setVerificationSymbolUnicode(unicode);
                setAttemptCount(1);
                setCopied(false);
                setActiveStep("verify-symbol");
            } catch {
                setErrorMessage(
                    "Could not load your Harry Potter profile. Check the link and try again."
                );
            } finally {
                setIsLoadingProfile(false);
            }
        }
    }

    async function handleCopySymbol() {
        if (!verificationSymbol) return;
        await navigator.clipboard.writeText(verificationSymbol);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    }

    async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
        event.preventDefault();
        setErrorMessage(null);
        setIsVerifying(true);

        try {
            const uid = extractProfileUid(profileUrl);
            if (!uid) {
                throw new Error("Invalid Wizarding World profile URL");
            }

            const verified = await verifyProfileSymbol(
                profileUrl.trim(),
                verificationSymbolUnicode,
                profileData?.name
            );

            if (!verified) {
                const { rendered, unicode } =
                    getRandomRenderedSymbol(verificationSymbol);

                setVerificationSymbol(rendered);
                setVerificationSymbolUnicode(unicode);
                setAttemptCount((prev) => prev + 1);
                setCopied(false);

                setErrorMessage(
                    "Verification failed. A fresh symbol has been issued—update your display name and try again."
                );
                return;
            }

            const linkResponse = await axiosInstance.get("/users/link-ww-profile", {
                params: { uid },
            });

            if (linkResponse.status === 200) {
                await refreshUser();
                setIsVerified(true);
            } else {
                setErrorMessage(
                    "Your profile was verified, but we couldn't link it to your Daily Prophet account. Please try again."
                );
            }
        } catch (error) {
            console.error("Wizarding World profile linking failed:", error);
            setErrorMessage(
                "Something went wrong while linking your profile. Please try again."
            );
        } finally {
            setIsVerifying(false);
        }
    }

    const previewName = profileData?.name || "YourName";

    return (
        <div className="w-full max-w-xl px-4 py-12">
            {/* Compact Masthead */}
            <div className="mb-7 flex flex-col items-center gap-2.5 text-center">
                <div className="flex size-11 items-center justify-center rounded-sm border border-gold/60 bg-card p-1.5">
                    <Image
                        src="/logo.svg"
                        alt="The Daily Prophet"
                        width={30}
                        height={30}
                        className="size-full object-contain"
                        priority
                    />
                </div>
                <p className="font-display text-sm font-bold tracking-[0.2em] text-foreground uppercase">
                    The Daily Prophet
                </p>
            </div>

            {/* Framed Broadsheet Card */}
            <div className="overflow-hidden rounded-sm border border-border bg-card text-card-foreground shadow-sm">
                <div className="border-t-[3px] border-foreground/80 pt-0.5">
                    <div className="border-t border-gold/60" />
                </div>

                {isVerified ? (
                    /* Verified Dossier View */
                    <div className="p-6 text-center sm:p-8">
                        <div className="mx-auto mb-3 flex size-12 items-center justify-center rounded-sm border border-gold/50 bg-background/60 text-gold">
                            <CheckCircle2 className="size-6" />
                        </div>
                        <p className="font-mono text-[10px] tracking-[0.22em] text-gold uppercase">
                            Credentials Sealed
                        </p>
                        <h1 className="mt-1 font-display text-2xl font-semibold tracking-wide">
                            Profile Verified &amp; Linked
                        </h1>
                        <p className="mt-2 font-serif text-sm text-muted-foreground">
                            Your Wizarding World identity is now bound to your Daily Prophet
                            byline.
                        </p>

                        {profileData?.name && (
                            <div className="my-6 rounded-sm border border-gold/35 bg-background/60 p-4 text-left">
                                <div className="flex items-center justify-between gap-3">
                                    <div>
                                        <p className="font-mono text-[10px] tracking-widest text-muted-foreground uppercase">
                                            Linked Correspondent
                                        </p>
                                        <p className="mt-0.5 font-serif text-lg font-semibold text-foreground">
                                            {profileData.name}
                                        </p>
                                    </div>
                                    {profileData.house && (
                                        <span className="inline-flex items-center gap-1.5 rounded-sm border border-gold/40 bg-card px-2.5 py-1 font-mono text-[11px] font-medium tracking-wider text-gold uppercase">
                      <Sparkles className="size-3" />
                                            {profileData.house}
                    </span>
                                    )}
                                </div>
                            </div>
                        )}

                        <p className="mb-6 font-serif text-xs text-muted-foreground italic">
                            You may now safely remove the verification symbol from your
                            harrypotter.com display name.
                        </p>

                        <Button
                            type="button"
                            onClick={() => router.push("/dashboard")}
                            className="h-10 w-full rounded-sm font-mono text-xs font-semibold tracking-[0.16em] uppercase"
                        >
                            Continue to Front Page
                        </Button>
                    </div>
                ) : (
                    /* Two-Step Verification Questionnaire */
                    <div className="p-6 sm:p-8">
                        <header className="mb-6 border-b border-border pb-5">
                            <div className="flex items-center justify-between gap-2">
                                <p className="font-mono text-[10px] tracking-[0.22em] text-gold uppercase">
                                    Registry Verification
                                </p>
                                <span className="font-mono text-[10px] tracking-widest text-muted-foreground uppercase">
                  Step {activeStep === "profile-link" ? "01" : "02"} / 02
                </span>
                            </div>
                            <h1 className="mt-1.5 font-display text-2xl font-semibold tracking-wide">
                                Link Wizarding Profile
                            </h1>
                            <p className="mt-1 font-serif text-sm text-muted-foreground">
                                Verify ownership of your harrypotter.com profile to display your
                                house, wand, and Patronus.
                            </p>
                        </header>

                        <Questionnaire
                            items={QUESTIONNAIRE_ITEMS}
                            item={activeStep}
                            onItemChange={handleStepChange}
                            onSubmit={handleSubmit}
                        >
                            <QuestionnaireProgress />

                            {errorMessage && (
                                <div
                                    role="alert"
                                    className="my-4 flex items-start gap-2.5 rounded-sm border border-destructive/40 bg-destructive/10 p-3 text-xs leading-relaxed text-destructive"
                                >
                                    <AlertCircle className="mt-0.5 size-4 shrink-0" />
                                    <span>{errorMessage}</span>
                                </div>
                            )}

                            {/* STEP 1: Profile Link */}
                            <QuestionnaireItem name="profile-link" required>
                                <QuestionnaireTitle className="font-serif text-lg font-semibold">
                                    Paste your Harry Potter profile link
                                </QuestionnaireTitle>
                                <QuestionnaireDescription className="text-sm text-muted-foreground">
                                    Enter your full public profile URL from harrypotter.com so we
                                    can retrieve your Wizarding World details.
                                </QuestionnaireDescription>

                                <QuestionnaireChoices>
                                    <QuestionnaireInput
                                        aria-label="Harry Potter profile link"
                                        type="url"
                                        value={profileUrl}
                                        onChange={(e) => {
                                            setProfileUrl(e.target.value);
                                            if (errorMessage) setErrorMessage(null);
                                        }}
                                        placeholder="https://www.harrypotter.com/profile/your-id"
                                        disabled={isLoadingProfile}
                                        className="rounded-sm bg-background/60 font-mono text-sm focus-visible:border-gold focus-visible:ring-gold/30"
                                    />
                                </QuestionnaireChoices>

                                <QuestionnaireError />
                            </QuestionnaireItem>

                            {/* STEP 2: Symbol Ownership Challenge */}
                            <QuestionnaireItem name="verify-symbol" required>
                                <QuestionnaireTitle className="font-serif text-lg font-semibold">
                                    Add this seal to the front of your name
                                </QuestionnaireTitle>
                                <QuestionnaireDescription className="text-sm text-muted-foreground">
                                    Copy the symbol below and paste it right before your display
                                    name on harrypotter.com.
                                    {attemptCount > 1 ? ` (Attempt #${attemptCount})` : ""}
                                </QuestionnaireDescription>

                                <div className="my-5 space-y-4">
                                    {/* Typographic Specimen Plate */}
                                    <div className="flex flex-wrap items-center justify-between gap-4 rounded-sm border border-gold/40 bg-background/70 p-4">
                                        <div className="flex items-center gap-4">
                                            <div
                                                aria-label="Verification symbol"
                                                lang="bn"
                                                style={SYMBOL_FONT_STYLE}
                                                className="flex size-14 shrink-0 items-center justify-center rounded-sm border border-gold/60 bg-card text-3xl font-semibold text-gold select-all"
                                            >
                                                {verificationSymbol}
                                            </div>
                                            <div className="space-y-1 text-sm">
                                                <p className="font-mono text-[10px] tracking-widest text-muted-foreground uppercase">
                                                    Issued Verification Mark
                                                </p>
                                                <div className="text-xs text-muted-foreground">
                                                    Expected preview:
                                                    <p className="mt-0.5 font-serif text-base font-semibold text-foreground">
                            <span
                                lang="bn"
                                style={SYMBOL_FONT_STYLE}
                                className="text-gold"
                            >
                              {verificationSymbol}
                            </span>
                                                        {previewName}
                                                    </p>
                                                </div>
                                            </div>
                                        </div>

                                        <Button
                                            type="button"
                                            variant="outline"
                                            size="sm"
                                            onClick={handleCopySymbol}
                                            className="rounded-sm border-gold/40 font-mono text-[11px] tracking-wider uppercase hover:border-gold hover:text-gold"
                                        >
                                            {copied ? (
                                                <>
                                                    <Check className="mr-1.5 size-3.5 text-gold" />
                                                    Copied
                                                </>
                                            ) : (
                                                <>
                                                    <Copy className="mr-1.5 size-3.5" />
                                                    Copy Mark
                                                </>
                                            )}
                                        </Button>
                                    </div>

                                    {/* Step-by-step Path */}
                                    <div className="rounded-sm border border-border bg-background/40 p-4 text-sm">
                                        <div className="mb-3 flex items-center justify-between gap-2">
                      <span className="font-mono text-[10px] tracking-widest text-muted-foreground uppercase">
                        Where to edit your name
                      </span>
                                            {profileUrl && (
                                                <a
                                                    href={profileUrl}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="inline-flex items-center gap-1 font-mono text-[11px] font-medium text-gold underline-offset-4 hover:underline"
                                                >
                                                    Open profile
                                                    <ExternalLink className="size-3" />
                                                </a>
                                            )}
                                        </div>

                                        <ol className="flex flex-wrap items-center gap-1.5 font-mono text-[11px]">
                                            {INSTRUCTION_PATH.map((step) => (
                                                <React.Fragment key={step}>
                                                    <li className="rounded-sm border border-border bg-card px-2 py-1 text-foreground">
                                                        {step}
                                                    </li>
                                                    <li
                                                        aria-hidden="true"
                                                        className="text-muted-foreground"
                                                    >
                                                        <ChevronRight className="size-3.5" />
                                                    </li>
                                                </React.Fragment>
                                            ))}
                                            <li className="rounded-sm border border-gold/40 bg-gold/10 px-2 py-1 text-gold">
                                                PREPEND SYMBOL
                                            </li>
                                        </ol>
                                    </div>
                                </div>

                                <QuestionnaireChoices>
                                    <QuestionnaireChoice
                                        value="symbol-added"
                                        className="rounded-sm border-border bg-background/40"
                                    >
                    <span className="font-serif text-sm font-semibold text-foreground">
                      I&apos;ve added the symbol to the front of my name
                    </span>
                                        <span className="text-xs text-muted-foreground">
                      We&apos;ll inspect your public profile immediately to
                      confirm ownership.
                    </span>
                                    </QuestionnaireChoice>
                                </QuestionnaireChoices>

                                <QuestionnaireError />
                            </QuestionnaireItem>

                            <QuestionnaireActions className="mt-6 border-t border-border pt-5">
                                <QuestionnairePrevious
                                    disabled={isLoadingProfile || isVerifying}
                                    className="rounded-sm font-mono text-xs tracking-wider uppercase"
                                />

                                <QuestionnaireNext
                                    disabled={isLoadingProfile}
                                    className="rounded-sm font-mono text-xs font-semibold tracking-wider uppercase"
                                >
                                    {isLoadingProfile ? (
                                        <>
                                            <Loader2 className="mr-2 size-3.5 animate-spin" />
                                            Fetching Profile...
                                        </>
                                    ) : (
                                        "Continue"
                                    )}
                                </QuestionnaireNext>

                                <QuestionnaireSubmit
                                    disabled={isVerifying}
                                    className="rounded-sm font-mono text-xs font-semibold tracking-wider uppercase"
                                >
                                    {isVerifying ? (
                                        <>
                                            <Loader2 className="mr-2 size-3.5 animate-spin" />
                                            Verifying...
                                        </>
                                    ) : attemptCount > 1 ? (
                                        <>
                                            <RefreshCw className="mr-2 size-3.5" />
                                            Retry Verification
                                        </>
                                    ) : (
                                        "Verify & Link Profile"
                                    )}
                                </QuestionnaireSubmit>
                            </QuestionnaireActions>
                        </Questionnaire>
                    </div>
                )}
            </div>
        </div>
    );
}