import type { Metadata } from "next";
import { ClerkProvider } from "@clerk/nextjs";
import { inter } from "./fonts";
import "./globals.css";
import clsx from "clsx";

export const metadata: Metadata = {
    title: "TheMovie",
    description: "Cinematic Movie Discovery",
};

import { Navbar } from "@/components/Navbar";
import { Providers } from "@/components/Providers";
import { WatchedProvider } from "@/context/WatchedContext";
import { TVWatchProgressProvider } from "@/context/TVWatchProgressContext";
import { EasterEgg } from "@/components/EasterEgg";
import { ScrollToTop } from "@/components/ScrollToTop";

export default function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <ClerkProvider
            publishableKey={process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY}
            appearance={{
                baseTheme: undefined,
                variables: { colorBackground: "#0D0D0D", colorText: "#FFFFFF" }
            }}
        >
            <html lang="en" className={clsx(inter.variable, "bg-black text-white antialiased")}>
                <head>
                    <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=5.0, user-scalable=yes" />
                    <link href="https://api.fontshare.com/v2/css?f[]=clash-display@200,300,400,500,600,700&display=swap" rel="stylesheet" />
                    <link rel="icon" href="/movie.png" />
                </head>
                <body className="min-h-screen bg-black text-white selection:bg-white selection:text-black">
                    <Providers>
                        <WatchedProvider>
                            <TVWatchProgressProvider>
                                <EasterEgg />
                                <Navbar />
                                {children}
                                <ScrollToTop />
                            </TVWatchProgressProvider>
                        </WatchedProvider>
                    </Providers>
                </body>
            </html>
        </ClerkProvider>
    );
}
