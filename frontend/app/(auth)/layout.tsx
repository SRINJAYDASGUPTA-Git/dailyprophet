import { ThemeToggle } from "@/components/theme-toggle";

export default function AuthLayout({ children }: LayoutProps<"/">) {
    return (
        <div className="relative flex min-h-svh w-full items-center justify-center bg-background text-foreground">
            <div className="fixed right-4 top-4 z-30">
                <ThemeToggle />
            </div>
            {children}
        </div>
    );
}