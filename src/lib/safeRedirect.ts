/** Return only a same-origin absolute path suitable for post-auth navigation. */
export function getSafeRedirectUrl(search: string) {
    const params = new URLSearchParams(search);
    const target = params.get("redirect_url")
        || params.get("redirect_url_complete")
        || params.get("returnUrl");

    if (!target || !target.startsWith("/") || target.startsWith("//") || target.includes("\\")) {
        return "/";
    }

    try {
        const parsed = new URL(target, "https://themovie.invalid");
        return parsed.origin === "https://themovie.invalid"
            ? `${parsed.pathname}${parsed.search}${parsed.hash}`
            : "/";
    } catch {
        return "/";
    }
}
