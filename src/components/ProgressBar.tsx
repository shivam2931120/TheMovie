"use client";

import { useEffect } from "react";
import { usePathname, useSearchParams } from "next/navigation";
import NProgress from "nprogress";

NProgress.configure({ 
    showSpinner: false,
    speed: 400,
    minimum: 0.08,
    trickleSpeed: 200
});

export function ProgressBar() {
    const pathname = usePathname();
    const searchParams = useSearchParams();

    useEffect(() => {
        NProgress.done();
    }, [pathname, searchParams]);

    useEffect(() => {
        NProgress.start();
        return () => {
            NProgress.done();
        };
    }, [pathname, searchParams]);

    return null;
}
