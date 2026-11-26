"use client"

import * as React from "react"
import {Check, CheckCircle2, Copy, ExternalLink, Loader2, RefreshCw, AlertCircle} from "lucide-react"

import {Button} from "@/components/ui/button"
import {Card, CardContent, CardHeader, CardTitle, CardDescription} from "@/components/ui/card"
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
} from "@/components/ui/questionnaire"
import {WizardingWorldProfile} from "@/types";
import axiosInstance from "@/utils/axiosInstance";
type StepName = "profile-link" | "verify-symbol"

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
] as const

/**
 * Converts a "U+XXXX" string into the actual rendered Unicode character.
 */
function unicodeToChar(codePoint: string): string {
    const hex = codePoint.replace(/^U\+/i, "")
    return String.fromCodePoint(parseInt(hex, 16))
}

/**
 * Picks a random rendered character from UNICODE_LIST.
 * Optionally excludes the previous symbol so retries always issue a fresh one.
 */
function getRandomRenderedSymbol(previousSymbol?: string) {
    const candidates = UNICODE_LIST
        .map((unicode) => ({
            unicode,
            rendered: unicodeToChar(unicode),
        }))
        .filter(({ rendered }) => rendered !== previousSymbol);

    const randomIndex = Math.floor(Math.random() * candidates.length);

    return candidates[randomIndex];
}
const PROFILE_URL_REGEX = /^https?:\/\/(www\.)?harrypotter\.com\/profile\/.+/i

const QUESTIONNAIRE_ITEMS = [
    {
        name: "profile-link",
        required: true,
    },
    {
        name: "verify-symbol",
        required: true,
    },
] as const

const INSTRUCTION_PATH = [
    "PROFILE",
    "ACTIONS",
    "ACCOUNT SETTINGS",
    "EDIT NAME",
] as const

// --- Blank API Functions (Implement these) ---

/**
 * Step 2: GET profile data from the harrypotter.com/profile link.
 * Return the profile object (or truthy value) on success, or null/throw on failure.
 */
async function fetchProfileData(
    profileUrl: string
): Promise<WizardingWorldProfile | null | undefined> {
    // TODO: Implement GET profile API call
    try{
        const uid = profileUrl.substring(36);
        const backendResponse = await axiosInstance.get("/users/wizarding-world-profile?uid="+uid);

        if(backendResponse.status === 200) {
            return backendResponse.data;
        }
    }
    catch (error) {
        return null;
    }

    return null;
}

/**
 * Step 6: Verify that the user added `symbol` to the front of their profile name.
 * Return `true` if verified and linked, or `false` to repeat the algorithm.
 */
async function verifyProfileSymbol(
    profileUrl: string,
    symbol: string,
    oldName?: string,
): Promise<boolean | undefined> {
    // TODO: Implement verification API call
    try{
        const uid = new URL(profileUrl).pathname
            .split("/")
            .filter(Boolean)
            .at(-1);

        if (!uid) return false;
        const backendResponse = await axiosInstance.post("/users/verify-ww-access", {
            oldName: oldName,
            specialCharUnicode: symbol,
            uid: uid
        });
        return backendResponse.status === 202;
    } catch(error) {
        console.error("WW verification failed:", error);
        return false;
    }
}

// --- Page Component ---

export default function LinkHarryPotterProfilePage() {
    const [activeStep, setActiveStep] = React.useState<StepName>("profile-link")
    const [profileUrl, setProfileUrl] = React.useState("")
    const [profileData, setProfileData] = React.useState<WizardingWorldProfile | null>(null)
    const [verificationSymbol, setVerificationSymbol] = React.useState<string>("")
    const [verificationSymbolUnicode, setVerificationSymbolUnicode] = React.useState<string>("");


    const [isLoadingProfile, setIsLoadingProfile] = React.useState(false)
    const [isVerifying, setIsVerifying] = React.useState(false)
    const [isVerified, setIsVerified] = React.useState(false)

    const [copied, setCopied] = React.useState(false)
    const [attemptCount, setAttemptCount] = React.useState(1)
    const [errorMessage, setErrorMessage] = React.useState<string | null>(null)

    // TODO: move them to layout
    const SYMBOL_FONT_STYLE: React.CSSProperties = {
        fontFamily:
            '"Noto Sans Bengali", "Lohit Bengali", "Kohinoor Bangla", "Nirmala UI", sans-serif',
    }

    async function handleStepChange(nextStep: string) {
        setErrorMessage(null)

        if (nextStep === "profile-link") {
            setActiveStep("profile-link")
            return
        }

        if (nextStep === "verify-symbol") {
            const trimmedUrl = profileUrl.trim()

            if (!PROFILE_URL_REGEX.test(trimmedUrl)) {
                setErrorMessage(
                    "Please enter a valid harrypotter.com/profile link (e.g. https://www.harrypotter.com/profile/...)."
                )
                return
            }

            setIsLoadingProfile(true)
            try {
                const data = await fetchProfileData(trimmedUrl)
                console.log(data);
                setProfileData(data ?? null)

                // Step 4: Pick a random rendered Unicode symbol
                const {rendered, unicode} = getRandomRenderedSymbol()
                setVerificationSymbol(rendered)
                setVerificationSymbolUnicode(unicode)
                setAttemptCount(1)
                setActiveStep("verify-symbol")
            } catch {
                setErrorMessage(
                    "Could not load your Harry Potter profile. Check the link and try again."
                )
            } finally {
                setIsLoadingProfile(false)
            }
        }
    }

    async function handleCopySymbol() {
        if (!verificationSymbol) return
        await navigator.clipboard.writeText(verificationSymbol)
        setCopied(true)
        setTimeout(() => setCopied(false), 2000)
    }

    async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
        event.preventDefault();
        setErrorMessage(null);
        setIsVerifying(true);

        try {
            const uid = new URL(profileUrl.trim()).pathname
                .split("/")
                .filter(Boolean)
                .at(-1);

            if (!uid) {
                throw new Error("Invalid Wizarding World profile URL");
            }

            // Step 1: Verify profile ownership
            const verified = await verifyProfileSymbol(
                profileUrl.trim(),
                verificationSymbolUnicode,
                profileData?.name
            );

            if (!verified) {
                // Generate a fresh symbol only when verification fails
                const { rendered, unicode } =
                    getRandomRenderedSymbol(verificationSymbol);

                setVerificationSymbol(rendered);
                setVerificationSymbolUnicode(unicode);
                setAttemptCount((prev) => prev + 1);
                setCopied(false);

                setErrorMessage(
                    "Verification failed. A new symbol has been generated. Please update your profile and try again."
                );

                return;
            }

            // Step 2: Link the verified profile to Daily Prophet
            const linkResponse = await axiosInstance.get(
                "/users/link-ww-profile",
                {
                    params: { uid },
                }
            );

            if (linkResponse.status === 200) {
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

    if (isVerified) {
        return (
            <div className="mx-auto flex min-h-[80vh] max-w-xl items-center justify-center p-4 sm:p-8">
                <Card className="w-full">
                    <CardHeader className="items-center text-center">
                        <div
                            className="mb-2 flex size-12 items-center justify-center rounded-full bg-emerald-500/10 text-emerald-600">
                            <CheckCircle2 className="size-6"/>
                        </div>
                        <CardTitle className="text-2xl">Profile Verified &amp; Linked</CardTitle>
                        <CardDescription>
                            Your Harry Potter profile is now connected to your Daily Prophet account.
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4 text-center">
                        {profileData?.name ? (
                            <div className="rounded-lg border bg-muted/40 p-4 text-sm">
                                <p className="font-medium text-foreground">{profileData.name}</p>
                                {profileData.house ? (
                                    <p className="text-muted-foreground">{profileData.house}</p>
                                ) : null}
                            </div>
                        ) : null}
                        <p className="text-xs text-muted-foreground">
                            You can now safely remove the verification symbol from your Harry Potter display name.
                        </p>
                        <Button className="w-full" asChild>
                            <a href="/dashboard">Continue to Daily Prophet</a>
                        </Button>
                    </CardContent>
                </Card>
            </div>
        )
    }

    const previewName = profileData?.name || "YourName"

    return (
        <div className="mx-auto flex min-h-[80vh] max-w-xl items-center justify-center p-4 sm:p-8">
            <Card className="w-full">
                <CardHeader>
                    <CardTitle>Link Harry Potter Profile</CardTitle>
                    <CardDescription>
                        Verify ownership of your harrypotter.com profile to display it on Daily Prophet.
                    </CardDescription>
                </CardHeader>

                <CardContent>
                    <Questionnaire
                        items={QUESTIONNAIRE_ITEMS}
                        item={activeStep}
                        onItemChange={handleStepChange}
                        onSubmit={handleSubmit}
                    >
                        <QuestionnaireProgress/>

                        {errorMessage ? (
                            <div
                                role="alert"
                                className="my-4 flex items-start gap-2.5 rounded-lg border border-destructive/40 bg-destructive/10 p-3 text-sm text-destructive"
                            >
                                <AlertCircle className="mt-0.5 size-4 shrink-0"/>
                                <span>{errorMessage}</span>
                            </div>
                        ) : null}

                        {/* STEP 1: Profile Link */}
                        <QuestionnaireItem name="profile-link" required>
                            <QuestionnaireTitle>
                                Paste your Harry Potter profile link
                            </QuestionnaireTitle>
                            <QuestionnaireDescription>
                                Enter your full profile URL from harrypotter.com so we can fetch your public details.
                            </QuestionnaireDescription>

                            <QuestionnaireChoices>
                                <QuestionnaireInput
                                    aria-label="Harry Potter profile link"
                                    type="url"
                                    value={profileUrl}
                                    onChange={(e) => {
                                        setProfileUrl(e.target.value)
                                        if (errorMessage) setErrorMessage(null)
                                    }}
                                    placeholder="https://www.harrypotter.com/profile/your-id"
                                    disabled={isLoadingProfile}
                                />
                            </QuestionnaireChoices>

                            <QuestionnaireError/>
                        </QuestionnaireItem>

                        {/* STEP 2: Add Rendered Symbol & Verify */}
                        <QuestionnaireItem name="verify-symbol" required>
                            <QuestionnaireTitle>
                                Add this symbol to the front of your name
                            </QuestionnaireTitle>
                            <QuestionnaireDescription>
                                Copy the symbol below and paste it right at the start of your display name on Harry
                                Potter.
                                {attemptCount > 1 ? ` (Attempt #${attemptCount})` : ""}
                            </QuestionnaireDescription>

                            {/* Rendered Symbol Display (never shows raw U+XXXX code) */}
                            <div className="my-4 space-y-4">
                                <div className="flex items-center justify-between rounded-lg border bg-muted/40 p-4">
                                    <div className="flex items-center gap-4">
                                        <div
                                            aria-label="Verification symbol"
                                            className="flex size-14 items-center justify-center rounded-md border bg-background text-3xl font-semibold select-all"
                                        >
                                            {verificationSymbol}
                                        </div>
                                        <div className="text-sm">
                                            <p className="font-medium">Your verification symbol</p>
                                            <div className="text-muted-foreground">
                                                Preview:{" "}
                                                <p className="font-medium text-foreground">
                                                    <span lang="bn" style={SYMBOL_FONT_STYLE}>
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
                                    >
                                        {copied ? (
                                            <>
                                                <Check className="mr-1.5 size-4"/>
                                                Copied
                                            </>
                                        ) : (
                                            <>
                                                <Copy className="mr-1.5 size-4"/>
                                                Copy
                                            </>
                                        )}
                                    </Button>
                                </div>

                                {/* Step-by-step Navigation Path */}
                                <div className="rounded-lg border p-4 text-sm">
                                    <div className="mb-2 flex items-center justify-between">
                                        <span className="font-medium">Where to update your name:</span>
                                        {profileUrl ? (
                                            <a
                                                href={profileUrl}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="inline-flex items-center gap-1 text-xs font-medium underline underline-offset-4"
                                            >
                                                Open profile
                                                <ExternalLink className="size-3"/>
                                            </a>
                                        ) : null}
                                    </div>
                                    <ol className="flex flex-wrap items-center gap-1.5 text-xs font-medium text-muted-foreground">
                                        {INSTRUCTION_PATH.map((step, index) => (
                                            <React.Fragment key={step}>
                                                <li className="rounded bg-muted px-2 py-1 text-foreground">
                                                    {step}
                                                </li>
                                                {index < INSTRUCTION_PATH.length - 1 ? (
                                                    <li aria-hidden="true">&gt;</li>
                                                ) : null}
                                            </React.Fragment>
                                        ))}
                                        <li aria-hidden="true">&gt;</li>
                                        <li className="rounded bg-primary/10 px-2 py-1 text-primary">
                                            Add the symbol to the front of your name
                                        </li>
                                    </ol>
                                </div>
                            </div>

                            <QuestionnaireChoices>
                                <QuestionnaireChoice value="symbol-added">
                  <span className="font-medium">
                    I&apos;ve added the symbol to the front of my name
                  </span>
                                    <span className="text-muted-foreground">
                    We&apos;ll check your profile right now to confirm ownership.
                  </span>
                                </QuestionnaireChoice>
                            </QuestionnaireChoices>

                            <QuestionnaireError/>
                        </QuestionnaireItem>

                        <QuestionnaireActions>
                            <QuestionnairePrevious
                                disabled={isLoadingProfile || isVerifying}
                            />

                            <QuestionnaireNext disabled={isLoadingProfile}>
                                {isLoadingProfile ? (
                                    <>
                                        <Loader2 className="mr-2 size-4 animate-spin"/>
                                        Fetching profile...
                                    </>
                                ) : (
                                    "Continue"
                                )}
                            </QuestionnaireNext>

                            <QuestionnaireSubmit disabled={isVerifying}>
                                {isVerifying ? (
                                    <>
                                        <Loader2 className="mr-2 size-4 animate-spin"/>
                                        Verifying...
                                    </>
                                ) : attemptCount > 1 ? (
                                    <>
                                        <RefreshCw className="mr-2 size-4"/>
                                        Retry Verification
                                    </>
                                ) : (
                                    "Verify & Link Profile"
                                )}
                            </QuestionnaireSubmit>
                        </QuestionnaireActions>
                    </Questionnaire>
                </CardContent>
            </Card>
        </div>
    )
}