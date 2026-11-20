"use client"

import React, { useEffect, useState } from "react"
import { REGEXP_ONLY_DIGITS } from "input-otp"
import {
    InputOTP,
    InputOTPGroup,
    InputOTPSeparator,
    InputOTPSlot,
} from "@/components/ui/input-otp"
import { toast } from "@/components/ui/toast"
import axiosInstance from "@/utils/axiosInstance";

import {useRouter} from "next/navigation";

function ActivateAccount({ email = "your email address" }) {
    const [otp, setOtp] = useState("")
    const [isVerifying, setIsVerifying] = useState(false)
    const [hasError, setHasError] = useState(false)
    const [cooldown, setCooldown] = useState(30)

    const router = useRouter();

    useEffect(() => {
        if (cooldown <= 0) return
        const timer = setInterval(() => {
            setCooldown((prev) => prev - 1)
        }, 1000)
        return () => clearInterval(timer)
    }, [cooldown])

    const handleOtpChange = (value: React.SetStateAction<string>) => {
        setOtp(value)
        if (hasError) setHasError(false)
    }

    const handleVerify = async (e) => {
        e.preventDefault()

        if (otp.length < 6) {
            setHasError(true)
            toast.add({
                title: "Incomplete code",
                description: "Please enter all 6 digits from your email.",
                type: "warning",
            })
            return
        }

        setIsVerifying(true)
        try {
            const response = await axiosInstance.post(`/auth/activate?token=${otp}`)


            if(response.status === 200) {
                const data = response.data;
                console.log(data)
                await new Promise((resolve) => setTimeout(resolve, 1000))
                console.log(data)
                localStorage.setItem("access_token", data.data.access_token);
                localStorage.setItem("refresh_token", data.data.refresh_token);
                toast.add({
                    title: "Account activated",
                    description: "Your email has been verified. You can now sign in.",
                    type: "success",
                });

                router.push("/onboarding");
            }

        } catch (err) {
            setHasError(true)
            toast.add({
                title: "Invalid or expired code",
                description: "Double-check the token from your email or request a new one.",
                type: "error",
            })
        } finally {
            setIsVerifying(false)
        }
    }

    const handleResend = async () => {
        try {
            // Replace with your resend endpoint
            // await fetch("/api/auth/resend-otp", { method: "POST", body: JSON.stringify({ email }) })
            await new Promise((resolve) => setTimeout(resolve, 600))

            setCooldown(30)
            setOtp("")
            setHasError(false)

            toast.add({
                title: "Verification code resent",
                description: `A new 6-digit token has been sent to ${email}.`,
                type: "info",
            })
        } catch (err) {
            toast.add({
                title: "Could not resend code",
                description: "Please wait a moment and try again.",
                type: "error",
            })
        }
    }

    return (
        <div className="flex min-h-screen items-center justify-center bg-background px-4">
            <div className="w-full max-w-md rounded-xl border bg-card p-6 text-card-foreground shadow-sm">
                <div className="space-y-2 text-center">
                    <h1 className="text-2xl font-semibold tracking-tight">
                        Activate your account
                    </h1>
                    <p className="text-sm text-muted-foreground">
                        We&apos;ve sent a 6-digit verification token to{" "}
                        <span className="font-medium text-foreground">{email}</span>. Enter
                        it below to continue.
                    </p>
                </div>

                <form onSubmit={handleVerify} className="mt-6 flex flex-col items-center gap-6">
                    <InputOTP
                        maxLength={6}
                        pattern={REGEXP_ONLY_DIGITS}
                        value={otp}
                        onChange={handleOtpChange}
                        disabled={isVerifying}
                        autoComplete="one-time-code"
                    >
                        <InputOTPGroup>
                            <InputOTPSlot index={0} aria-invalid={hasError} />
                            <InputOTPSlot index={1} aria-invalid={hasError} />
                            <InputOTPSlot index={2} aria-invalid={hasError} />
                        </InputOTPGroup>
                        <InputOTPSeparator />
                        <InputOTPGroup>
                            <InputOTPSlot index={3} aria-invalid={hasError} />
                            <InputOTPSlot index={4} aria-invalid={hasError} />
                            <InputOTPSlot index={5} aria-invalid={hasError} />
                        </InputOTPGroup>
                    </InputOTP>

                    <button
                        type="submit"
                        disabled={isVerifying || otp.length < 6}
                        className="w-full rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                        {isVerifying ? "Verifying..." : "Verify & Activate"}
                    </button>
                </form>

                <div className="mt-5 text-center text-sm text-muted-foreground">
                    Didn&apos;t receive the email? Check your spam folder or{" "}
                    <button
                        type="button"
                        onClick={handleResend}
                        disabled={cooldown > 0}
                        className="font-medium text-primary underline-offset-4 hover:underline disabled:cursor-not-allowed disabled:opacity-50"
                    >
                        {cooldown > 0 ? `resend in ${cooldown}s` : "resend code"}
                    </button>
                </div>
            </div>
        </div>
    )
}

export default ActivateAccount