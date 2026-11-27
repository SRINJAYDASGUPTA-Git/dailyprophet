import { AuthSplitShell } from "@/components/auth-split-shell";
import { RegisterForm } from "@/components/register-form";

export default function RegisterPage() {
    return (
        <AuthSplitShell
            eyebrow="New Subscription"
            headlineTop="Claim your byline"
            headlineAccent="in today's edition."
            description="Register your correspondent credentials, verify via Owl Post, and link your Wizarding World profile to join the press."
            cardMaxWidth="max-w-md"
        >
            <RegisterForm />
        </AuthSplitShell>
    );
}