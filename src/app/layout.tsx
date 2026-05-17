import type { Metadata, Viewport } from "next";
import { ClerkProvider } from "@clerk/nextjs";
import { dmSans, outfit } from "./fonts";
import "./globals.css";
import clsx from "clsx";

export const metadata: Metadata = {
    title: "TheMovie",
    description: "Cinematic Movie Discovery",
    icons: {
        icon: "/movie.png",
    },
};

export const viewport: Viewport = {
    width: "device-width",
    initialScale: 1,
    maximumScale: 5,
    userScalable: true,
};

import { Navbar } from "@/components/Navbar";
import { Providers } from "@/components/Providers";
import { EasterEgg } from "@/components/EasterEgg";
import { ScrollToTop } from "@/components/ScrollToTop";
import { ServiceWorkerRegistration } from "@/components/ServiceWorkerRegistration";

const clerkPublishableKey = process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY;

function MissingEnvironment() {
    return (
        <main className="min-h-screen bg-black text-white flex items-center justify-center px-6">
            <div className="max-w-lg rounded-xl border border-white/10 bg-white/5 p-6">
                <h1 className="text-2xl font-display font-bold mb-3">Configuration required</h1>
                <p className="text-white/70 leading-relaxed">
                    Set NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY in the deployment environment to enable
                    authentication and render TheMovie.
                </p>
            </div>
        </main>
    );
}

export default function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    if (!clerkPublishableKey) {
        return (
            <html lang="en" className={clsx(dmSans.variable, outfit.variable, "bg-black text-white antialiased")} suppressHydrationWarning>
                <body className="min-h-screen bg-black text-white selection:bg-white selection:text-black">
                    <MissingEnvironment />
                </body>
            </html>
        );
    }

    return (
        <html lang="en" className={clsx(dmSans.variable, outfit.variable, "bg-black text-white antialiased")} suppressHydrationWarning>
            <body className="min-h-screen bg-black text-white selection:bg-white selection:text-black">
                <ClerkProvider
                    publishableKey={clerkPublishableKey}
                    appearance={{
                        baseTheme: undefined,
                        variables: { colorBackground: "#0D0D0D", colorText: "#FFFFFF" }
                    }}
                >
                    <Providers>
                        <EasterEgg />
                        <Navbar />
                        {children}
                        <ScrollToTop />
                        <ServiceWorkerRegistration />
                    </Providers>
                </ClerkProvider>
            </body>
        </html>
    );
}
