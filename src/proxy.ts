import { clerkMiddleware } from "@clerk/nextjs/server";
import { NextResponse, type NextFetchEvent, type NextRequest } from "next/server";

// Clerk reads the publishable and secret keys from the environment. Passing
// them as middleware options opts into dynamic-key propagation, which also
// requires CLERK_ENCRYPTION_KEY.
const clerkProxy = clerkMiddleware();

function hasClerkServerConfig() {
    return Boolean(
        (process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY || process.env.VITE_CLERK_PUBLISHABLE_KEY) &&
        process.env.CLERK_SECRET_KEY
    );
}

export default function proxy(request: NextRequest, event: NextFetchEvent) {
    if (!hasClerkServerConfig()) {
        return NextResponse.next();
    }

    return clerkProxy(request, event);
}

export const config = {
    matcher: [
        "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
        "/(api|trpc)(.*)",
    ],
};
