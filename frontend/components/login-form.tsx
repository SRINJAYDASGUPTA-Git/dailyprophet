"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Eye, EyeOff, Loader2 } from "lucide-react";

import { cn } from "@/lib/utils";
import axios from "@/utils/axiosInstance";
import { useUser } from "@/providers/UserContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Field, FieldGroup, FieldLabel } from "@/components/ui/field";

type LoginFormProps = {
    className?: string;
} & React.HTMLAttributes<HTMLFormElement>;

export function LoginForm({ className, ...props }: LoginFormProps) {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [showPassword, setShowPassword] = useState(false);

    const { user, loading: userLoading, refreshUser } = useUser();
    const router = useRouter();

    useEffect(() => {
        if (user && !userLoading) {
            router.replace("/dashboard");
        }
    }, [user, userLoading, router]);

    async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault();

        setLoading(true);
        setError("");

        try {
            const result = await axios.post("/auth/login", {
                email,
                password,
            });

            if (result.status !== 200) {
                setError(result.data.message || "Something went wrong.");
                return;
            }

            const data = result.data;
            localStorage.setItem("access_token", data.data.access_token);
            localStorage.setItem("refresh_token", data.data.refresh_token);

            await refreshUser();
            router.push("/dashboard");
        } catch (err: any) {
            setError(
                err.response?.data?.message || "Invalid email or password."
            );
        } finally {
            setLoading(false);
        }
    }

    return (
        <form
            data-testid="login-form"
            onSubmit={handleSubmit}
            className={cn("flex flex-col gap-6", className)}
            {...props}
        >
            <FieldGroup>
                <div className="space-y-1.5 text-center">
                    <p className="font-mono text-[10px] tracking-[0.22em] text-gold uppercase">
                        Correspondent Sign In
                    </p>
                    <h2 className="font-display text-2xl font-semibold tracking-wide text-card-foreground">
                        Welcome Back
                    </h2>
                    <p className="font-serif text-sm text-muted-foreground">
                        Present your credentials to access today&apos;s edition.
                    </p>
                </div>

                <Field>
                    <FieldLabel
                        htmlFor="email"
                        className="font-mono text-[11px] tracking-wider text-muted-foreground uppercase"
                    >
                        Owl Post / Email
                    </FieldLabel>

                    <Input
                        id="email"
                        data-testid="login-email"
                        type="email"
                        placeholder="correspondent@dailyprophet.co"
                        autoComplete="email"
                        required
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="rounded-sm bg-background/60 focus-visible:border-gold focus-visible:ring-gold/30"
                    />
                </Field>

                <Field>
                    <FieldLabel
                        htmlFor="password"
                        className="font-mono text-[11px] tracking-wider text-muted-foreground uppercase"
                    >
                        Passphrase
                    </FieldLabel>

                    <div className="relative">
                        <Input
                            id="password"
                            data-testid="login-password"
                            type={showPassword ? "text" : "password"}
                            placeholder="••••••••"
                            autoComplete="current-password"
                            required
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="rounded-sm bg-background/60 pr-10 focus-visible:border-gold focus-visible:ring-gold/30"
                        />

                        <button
                            type="button"
                            onClick={() => setShowPassword((prev) => !prev)}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground transition-colors hover:text-foreground"
                            aria-label={showPassword ? "Hide password" : "Show password"}
                        >
                            {showPassword ? (
                                <EyeOff className="size-4" />
                            ) : (
                                <Eye className="size-4" />
                            )}
                        </button>
                    </div>
                </Field>

                {error && (
                    <div
                        data-testid="login-error"
                        role="alert"
                        className="rounded-sm border border-destructive/40 bg-destructive/10 px-3 py-2 text-xs text-destructive"
                    >
                        {error}
                    </div>
                )}

                <Button
                    data-testid="login-submit"
                    type="submit"
                    disabled={loading}
                    className="mt-1 h-10 w-full rounded-sm font-mono text-xs font-semibold tracking-[0.16em] uppercase"
                >
                    {loading ? (
                        <>
                            <Loader2 className="mr-2 size-3.5 animate-spin" />
                            Verifying...
                        </>
                    ) : (
                        "Enter the Press"
                    )}
                </Button>

                <div className="relative my-1">
                    <div className="absolute inset-0 flex items-center">
                        <span className="w-full border-t border-border" />
                    </div>
                    <div className="relative flex justify-center">
            <span className="bg-card px-2 font-mono text-[10px] tracking-widest text-muted-foreground uppercase">
              New Reader
            </span>
                    </div>
                </div>

                <p className="text-center text-sm text-muted-foreground">
                    Don&apos;t have a subscription yet?{" "}
                    <Link
                        href="/register"
                        className="font-medium text-gold underline-offset-4 hover:underline"
                    >
                        Register
                    </Link>
                </p>
            </FieldGroup>
        </form>
    );
}