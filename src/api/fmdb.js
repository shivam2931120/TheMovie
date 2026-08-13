const FMDB_BASE_URL = "https://imdb.iamidiotareyoutoo.com";
const REQUEST_TIMEOUT_MS = 8000;

const getJsonOrText = async (response) => {
    const contentType = response.headers.get("content-type") || "";
    if (contentType.includes("application/json")) return response.json();
    return response.text();
};

const request = async (path) => {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);

    try {
        const response = await fetch(`${FMDB_BASE_URL}${path}`, {
            signal: controller.signal,
            cache: "no-store",
        });

        if (!response.ok) return null;

        const data = await getJsonOrText(response);
        if (typeof data === "string" && /^(error|server_failure)/i.test(data.trim())) return null;
        if (data && typeof data === "object" && data.ok === false) return null;
        return data;
    } catch (error) {
        if (error?.name !== "AbortError") {
            console.warn("[FM-DB] Optional request failed:", error?.message || error);
        }
        return null;
    } finally {
        clearTimeout(timeout);
    }
};

const getMediaUrl = (data) => {
    if (typeof data === "string") return data.trim();
    if (!data || typeof data !== "object") return null;

    const candidates = [data.url, data.video, data.trailer, data.link, data.media_url];
    return candidates.find((value) => typeof value === "string" && value.trim())?.trim() || null;
};

const getYouTubeId = (url) => {
    if (!url) return null;

    try {
        const parsedUrl = new URL(url);
        if (parsedUrl.hostname.includes("youtu.be")) return parsedUrl.pathname.slice(1) || null;
        if (parsedUrl.hostname.includes("youtube.com")) {
            return parsedUrl.searchParams.get("v") || parsedUrl.pathname.split("/").pop() || null;
        }
    } catch {
        return null;
    }

    return null;
};

export const getFmdbPoster = (imdbId) => (
    imdbId ? `${FMDB_BASE_URL}/photo/${encodeURIComponent(imdbId)}` : null
);

export const getFmdbMedia = async (imdbId) => {
    if (!imdbId) return null;

    const data = await request(`/media/${encodeURIComponent(imdbId)}`);
    const url = getMediaUrl(data);
    if (!url) return null;

    return { url, youtubeId: getYouTubeId(url) };
};

export const searchFmdbStreaming = async (query) => {
    if (!query?.trim()) return null;
    return request(`/justwatch?q=${encodeURIComponent(query.trim())}`);
};
