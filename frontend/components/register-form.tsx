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

type RegisterFormProps = {
    className?: string;
} & React.HTMLAttributes<HTMLFormElement>;

export function RegisterForm({ className, ...props }: RegisterFormProps) {
    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);

    const {user, loading: userLoading} = useUser();
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

        if (password !== confirmPassword) {
            setError("Passphrases do not match.");
            setLoading(false);
            return;
        }

        try {
            const trimmedName = name.trim();
            const result = await axios.post("/auth/register", {
                name: trimmedName,
                email: email.trim(),
                username: username.trim(),
                password,
                imageUrl: `https://avatar.vercel.sh/${encodeURIComponent(trimmedName)}`,
            });

            if (result.status !== 200 && result.status !== 201) {
                setError(result.data?.message || "Something went wrong.");
                setLoading(false);
                return;
            }

            router.push("/activate");
        } catch (err: any) {
            setError(
                err.response?.data?.message || "Unable to create your account."
            );
            setLoading(false);
        }
    }

    return (
        <form
            data-testid="register-form"
            onSubmit={handleSubmit}
            className={cn("flex flex-col gap-5", className)}
            {...props}
        >
            <FieldGroup className="gap-4">
                <div className="space-y-1.5 text-center">
                    <p className="font-mono text-[10px] tracking-[0.22em] text-gold uppercase">
                        Press Registry
                    </p>
                    <h2 className="font-display text-2xl font-semibold tracking-wide text-card-foreground">
                        Begin Subscription
                    </h2>
                    <p className="font-serif text-sm text-muted-foreground">
                        Open your correspondent account to publish and follow dispatches.
                    </p>
                </div>

                {/* Name & Username side-by-side on sm+ */}
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <Field>
                        <FieldLabel
                            htmlFor="name"
                            className="font-mono text-[11px] tracking-wider text-muted-foreground uppercase"
                        >
                            Full Name
                        </FieldLabel>
                        <Input
                            data-testid="register-name"
                            id="name"
                            type="text"
                            placeholder="Srinjay Dasgupta"
                            autoComplete="name"
                            required
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            className="rounded-sm bg-background/60 focus-visible:border-gold focus-visible:ring-gold/30"
                        />
                    </Field>

                    <Field>
                        <FieldLabel
                            htmlFor="username"
                            className="font-mono text-[11px] tracking-wider text-muted-foreground uppercase"
                        >
                            Byline / Handle
                        </FieldLabel>
                        <Input
                            data-testid="register-username"
                            id="username"
                            type="text"
                            placeholder="harry_potter"
                            autoComplete="username"
                            required
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            className="rounded-sm bg-background/60 font-mono text-sm focus-visible:border-gold focus-visible:ring-gold/30"
                        />
                    </Field>
                </div>

                <Field>
                    <FieldLabel
                        htmlFor="email"
                        className="font-mono text-[11px] tracking-wider text-muted-foreground uppercase"
                    >
                        Owl Post / Email
                    </FieldLabel>
                    <Input
                        data-testid="register-email"
                        id="email"
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
                            data-testid="register-password"
                            id="password"
                            type={showPassword ? "text" : "password"}
                            placeholder="••••••••"
                            autoComplete="new-password"
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
                                <EyeOff className="size-4"/>
                            ) : (
                                <Eye className="size-4"/>
                            )}
                        </button>
                    </div>
                </Field>

                <Field>
                    <FieldLabel
                        htmlFor="confirm-password"
                        className="font-mono text-[11px] tracking-wider text-muted-foreground uppercase"
                    >
                        Confirm Passphrase
                    </FieldLabel>
                    <div className="relative">
                        <Input
                            data-testid="register-confirm-password"
                            id="confirm-password"
                            type={showConfirmPassword ? "text" : "password"}
                            placeholder="••••••••"
                            autoComplete="new-password"
                            required
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            className="rounded-sm bg-background/60 pr-10 focus-visible:border-gold focus-visible:ring-gold/30"
                        />
                        <button
                            type="button"
                            onClick={() => setShowConfirmPassword((prev) => !prev)}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground transition-colors hover:text-foreground"
                            aria-label={
                                showConfirmPassword ? "Hide password" : "Show password"
                            }
                        >
                            {showConfirmPassword ? (
                                <EyeOff className="size-4"/>
                            ) : (
                                <Eye className="size-4"/>
                            )}
                        </button>
                    </div>
                </Field>

                {error && (
                    <div
                        data-testid="register-error"
                        role="alert"
                        className="rounded-sm border border-destructive/40 bg-destructive/10 px-3 py-2 text-xs text-destructive"
                    >
                        {error}
                    </div>
                )}

                <Button
                    data-testid="register-submit"
                    type="submit"
                    disabled={loading}
                    className="mt-1 h-10 w-full rounded-sm font-mono text-xs font-semibold tracking-[0.16em] uppercase"
                >
                    {loading ? (
                        <>
                            <Loader2 className="mr-2 size-3.5 animate-spin"/>
                            Issuing Credentials...
                        </>
                    ) : (
                        "Create Account"
                    )}
                </Button>

                <p className="text-center font-serif text-xs text-muted-foreground italic">
                    An activation cipher will be dispatched to your inbox upon signing up.
                </p>

                <div className="relative my-0.5">
                    <div className="absolute inset-0 flex items-center">
                        <span className="w-full border-t border-border"/>
                    </div>
                    <div className="relative flex justify-center">
            <span className="bg-card px-2 font-mono text-[10px] tracking-widest text-muted-foreground uppercase">
              Existing Reader
            </span>
                    </div>
                </div>

                <p className="text-center text-sm text-muted-foreground">
                    Already have a subscription?{" "}
                    <Link
                        href="/login"
                        className="font-medium text-gold underline-offset-4 hover:underline"
                    >
                        Sign in
                    </Link>
                </p>
            </FieldGroup>
        </form>
    );
}