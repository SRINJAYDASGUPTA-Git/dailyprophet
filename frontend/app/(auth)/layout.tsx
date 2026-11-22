export default function AuthLayout({children}: LayoutProps<"/">) {
    return (
        <div className="w-full h-screen flex items-center justify-center ">
            {children}
        </div>
    );
}
