export type ContentType = "all" | "movie" | "tv";
export type PersonRole = "cast" | "director";

export const LANGUAGES = [
    { code: "", label: "Any language" },
    { code: "en", label: "English" },
    { code: "hi", label: "Hindi" },
    { code: "es", label: "Spanish" },
    { code: "fr", label: "French" },
    { code: "ja", label: "Japanese" },
    { code: "ko", label: "Korean" },
    { code: "ta", label: "Tamil" },
    { code: "te", label: "Telugu" },
];

export type SearchState = {
    q: string; type: ContentType; person: string; role: PersonRole; genre: string;
    year: string; language: string; rating: string; runtime: string; provider: string; region: string;
};

export function readSearchState(params: URLSearchParams): SearchState {
    const boundedNumber = (key: string, min: number, max: number, integer = false) => {
        const value = params.get(key);
        return value && Number.isFinite(Number(value)) && Number(value) >= min && Number(value) <= max && (!integer || Number.isInteger(Number(value))) ? value : "";
    };
    return {
        q: (params.get("q") || "").slice(0, 200),
        type: params.get("type") === "movie" || params.get("type") === "tv" ? params.get("type") as ContentType : "all",
        person: (params.get("person") || "").slice(0, 200), role: params.get("role") === "director" ? "director" : "cast",
        genre: boundedNumber("genre", 1, 100000, true), year: boundedNumber("year", 1800, 2200, true),
        language: LANGUAGES.some((item) => item.code === params.get("language")) ? params.get("language")! : "",
        rating: boundedNumber("rating", 0, 10), runtime: boundedNumber("runtime", 1, 10000, true),
        provider: boundedNumber("provider", 1, 100000, true),
        region: REGIONS.includes(params.get("region") || "") ? params.get("region")! : "IN",
    };
}

export function searchUrl(state: SearchState, page = 1) {
    const params = new URLSearchParams();
    Object.entries(state).forEach(([key, value]) => {
        if (value && !(key === "type" && value === "all") && !(key === "role" && value === "cast") && !(key === "region" && value === "IN")) params.set(key, value.trim());
    });
    const safePage = readSearchPage(new URLSearchParams({ page: String(page) }));
    if (safePage > 1) params.set("page", String(safePage));
    return `/search${params.size ? `?${params.toString()}` : ""}`;
}

export const REGIONS = ["IN", "US", "GB", "CA", "AU", "DE", "FR", "JP", "KR"];


/** TMDB exposes at most 500 result pages; links must use whole positive pages. */
export function readSearchPage(params: URLSearchParams) {
    const value = Number(params.get("page"));
    return Number.isFinite(value) ? Math.max(1, Math.min(500, Math.floor(value))) : 1;
}
