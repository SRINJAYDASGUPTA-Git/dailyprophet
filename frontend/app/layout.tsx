import type { Metadata } from "next";
import { Cinzel, Newsreader, Inter, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import { UserProvider } from "@/providers/UserContext";
import { Toaster } from "@/components/ui/toast";

const cinzel = Cinzel({
    variable: "--font-cinzel",
    subsets: ["latin"],
    display: "swap",
});

const newsreader = Newsreader({
    variable: "--font-newsreader",
    subsets: ["latin"],
    style: ["normal", "italic"],
    display: "swap",
});

const inter = Inter({
    variable: "--font-inter",
    subsets: ["latin"],
    display: "swap",
});

const jetbrainsMono = JetBrains_Mono({
    variable: "--font-jetbrains-mono",
    subsets: ["latin"],
    display: "swap",
});

export const metadata: Metadata = {
    title: {
        default: "The Daily Prophet",
        template: "%s | The Daily Prophet",
    },
    description: "The Wizarding World's beguiling broadsheet and social dispatch.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
    return (
        <html
            lang="en"
            suppressHydrationWarning
            className={`${cinzel.variable} ${newsreader.variable} ${inter.variable} ${jetbrainsMono.variable} h-full antialiased`}
        >
        <head>
            <script
                dangerouslySetInnerHTML={{
                    __html: `
          (function () {
            try {
              var t = localStorage.getItem('theme') === 'light' ? 'light' : 'dark';
              document.documentElement.classList.add(t);
            } catch (e) {}
          })();
        `,
                }}
            />
            <title>The Dailyprophet</title>
        </head>
        <body className="min-h-full flex flex-col font-sans">
        <UserProvider>
            {children}
            <Toaster />
        </UserProvider>
        </body>
        </html>
    );
}