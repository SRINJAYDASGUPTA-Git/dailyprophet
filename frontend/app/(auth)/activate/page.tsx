"use client";

import React, { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { REGEXP_ONLY_DIGITS } from "input-otp";
import { ArrowLeft, Loader2, MailCheck } from "lucide-react";

import {
    InputOTP,
    InputOTPGroup,
    InputOTPSeparator,
    InputOTPSlot,
} from "@/components/ui/input-otp";
import { Button } from "@/components/ui/button";
import { toast } from "@/components/ui/toast";
import axiosInstance from "@/utils/axiosInstance";
import { useUser } from "@/providers/UserContext";

export default function ActivateAccountPage() {
    const [email, setEmail] = useState("your email address");
    const [otp, setOtp] = useState("");
    const [isVerifying, setIsVerifying] = useState(false);
    const [hasError, setHasError] = useState(false);
    const [cooldown, setCooldown] = useState(30);

    const router = useRouter();
    const { refreshUser } = useUser();

    // Read optional ?token= (from activation email CTA) and ?email= on mount
    useEffect(() => {
        const params = new URLSearchParams(window.location.search);
        const tokenParam = params.get("token")?.replace(/\D/g, "").slice(0, 6);
        const emailParam = params.get("email");
        if (tokenParam) setOtp(tokenParam);
        if (emailParam) setEmail(emailParam);
    }, []);

    useEffect(() => {
        if (cooldown <= 0) return;
        const timer = setInterval(() => {
            setCooldown((prev) => prev - 1);
        }, 1000);
        return () => clearInterval(timer);
    }, [cooldown]);

    const handleOtpChange = (value: string) => {
        setOtp(value);
        if (hasError) setHasError(false);
    };

    const handleVerify = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();

        if (otp.length < 6) {
            setHasError(true);
            toast.add({
                title: "Incomplete cipher",
                description: "Please enter all 6 digits from your Owl Post email.",
                type: "warning",
            });
            return;
        }

        setIsVerifying(true);
        try {
            const response = await axiosInstance.post(`/auth/activate?token=${otp}`);

            if (response.status === 200) {
                const data = response.data;
                localStorage.setItem("access_token", data.data.access_token);
                localStorage.setItem("refresh_token", data.data.refresh_token);

                await refreshUser();

                toast.add({
                    title: "Subscription activated",
                    description: "Your Owl Post address has been verified.",
                    type: "success",
                });

                // Change to "/link-ww-account" if you aren't using an /onboarding route
                router.push("/onboarding");
            }
        } catch {
            setHasError(true);
            toast.add({
                title: "Invalid or expired cipher",
                description:
                    "Double-check the 6-digit code from your email or request a new one.",
                type: "error",
            });
        } finally {
            setIsVerifying(false);
        }
    };

    const handleResend = async () => {
        try {
            // Replace with your resend endpoint when ready
            // await axiosInstance.post("/auth/resend-otp", { email });
            await new Promise((resolve) => setTimeout(resolve, 600));

            setCooldown(30);
            setOtp("");
            setHasError(false);

            toast.add({
                title: "New cipher dispatched",
                description: `A fresh 6-digit code has been sent to ${email}.`,
                type: "info",
            });
        } catch {
            toast.add({
                title: "Could not resend cipher",
                description: "Please wait a moment and try again.",
                type: "error",
            });
        }
    };

    return (
        <div className="w-full max-w-md px-4 py-12">
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

                <div className="p-6 sm:p-8">
                    <div className="space-y-2 text-center">
                        <div className="mx-auto mb-3 flex size-10 items-center justify-center rounded-sm border border-gold/40 bg-background/60 text-gold">
                            <MailCheck className="size-5" />
                        </div>
                        <p className="font-mono text-[10px] tracking-[0.22em] text-gold uppercase">
                            Owl Post Verification
                        </p>
                        <h1 className="font-display text-2xl font-semibold tracking-wide">
                            Activate Subscription
                        </h1>
                        <p className="font-serif text-sm leading-relaxed text-muted-foreground">
                            We&apos;ve dispatched a 6-digit cipher to{" "}
                            <span className="font-medium text-foreground">{email}</span>.
                            Enter it below to seal your credentials.
                        </p>
                    </div>

                    <form
                        onSubmit={handleVerify}
                        className="mt-7 flex flex-col items-center gap-6"
                    >
                        <InputOTP
                            maxLength={6}
                            pattern={REGEXP_ONLY_DIGITS}
                            value={otp}
                            onChange={handleOtpChange}
                            disabled={isVerifying}
                            autoComplete="one-time-code"
                        >
                            <InputOTPGroup>
                                {[0, 1, 2].map((idx) => (
                                    <InputOTPSlot
                                        key={idx}
                                        index={idx}
                                        aria-invalid={hasError}
                                        className="h-12 w-11 rounded-sm bg-background/60 font-mono text-lg font-semibold sm:w-12"
                                    />
                                ))}
                            </InputOTPGroup>
                            <InputOTPSeparator className="text-gold/70" />
                            <InputOTPGroup>
                                {[3, 4, 5].map((idx) => (
                                    <InputOTPSlot
                                        key={idx}
                                        index={idx}
                                        aria-invalid={hasError}
                                        className="h-12 w-11 rounded-sm bg-background/60 font-mono text-lg font-semibold sm:w-12"
                                    />
                                ))}
                            </InputOTPGroup>
                        </InputOTP>

                        <Button
                            type="submit"
                            disabled={isVerifying || otp.length < 6}
                            className="h-10 w-full rounded-sm font-mono text-xs font-semibold tracking-[0.16em] uppercase"
                        >
                            {isVerifying ? (
                                <>
                                    <Loader2 className="mr-2 size-3.5 animate-spin" />
                                    Verifying Cipher...
                                </>
                            ) : (
                                "Verify & Activate"
                            )}
                        </Button>
                    </form>

                    {/* Resend Rail */}
                    <div className="mt-6 border-t border-border pt-5 text-center text-xs text-muted-foreground">
                        <p>
                            No owl yet? Check your spam folder or{" "}
                            <button
                                type="button"
                                onClick={handleResend}
                                disabled={cooldown > 0}
                                className="font-mono font-medium text-gold underline-offset-4 hover:underline disabled:cursor-not-allowed disabled:opacity-50"
                            >
                                {cooldown > 0 ? `resend in ${cooldown}s` : "dispatch a new code"}
                            </button>
                        </p>

                        <Link
                            href="/login"
                            className="mt-4 inline-flex items-center gap-1.5 font-mono text-[11px] tracking-wider text-muted-foreground uppercase transition-colors hover:text-foreground"
                        >
                            <ArrowLeft className="size-3" />
                            Back to Sign In
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
}