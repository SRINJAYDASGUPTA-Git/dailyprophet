export default function AuthLayout({children}: LayoutProps<"/">) {
    return (
        <div className="w-full flex items-center justify-center">
            {children}
        </div>
    );
}
