"use client";

import { useEffect } from "react";
import { useClerk } from "@clerk/nextjs";
import { Loader2 } from "lucide-react";

export default function SSOCallback() {
    const { handleRedirectCallback } = useClerk();

    useEffect(() => {
        handleRedirectCallback({
            signInUrl: '/sign-in',
            signUpUrl: '/sign-up',
        });
    }, [handleRedirectCallback]);

    return (
        <div className="min-h-screen flex items-center justify-center bg-bg-main">
            <div className="text-center">
                <Loader2 className="w-12 h-12 text-accent-primary animate-spin mx-auto mb-4" />
                <p className="text-white text-lg">Completing sign in...</p>
            </div>
        </div>
    );
}
