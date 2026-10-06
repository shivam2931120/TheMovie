import { NextResponse } from 'next/server';
import recommendationsData from '@/data/recommendations.json';
import feedbackModel from '@/data/feedback-recommendations.json';
import searchIndexData from '@/data/recommendation-search-index.json';
import { rankRecommendations, type RecommendationProfile } from '@/lib/recommendationRanker';
import { blendGraphs,neighborValues,type NeighborGraph } from '@/lib/recommendationGraph';
import { sanitizeCatalog } from '@/lib/recommendationCatalog';

const recommendations = blendGraphs({graph:recommendationsData,weight:0.8},{graph:feedbackModel.movie as NeighborGraph,weight:1});
const MAX_SEED_IDS = 20;
const MAX_RESULTS = 20;
const MAX_SEARCH_SEEDS = 8;
const MAX_SEARCH_CANDIDATES = 16;
const CACHE_HEADERS = {
    'Cache-Control': 'private, no-store',
};

type SearchEntry = {
    id: number;
    title: string;
    year?: number | null;
    genres?: string[];
    terms?: Array<[string, number]>;
    quality?: number;
    votes?: number;
};

const STOP_WORDS = new Set([
    "a", "an", "and", "are", "as", "at", "by", "for", "from", "in", "into", "is", "movie",
    "movies", "of", "on", "or", "show", "shows", "the", "to", "tv", "with",
]);

const searchEntries = ((searchIndexData as { entries?: SearchEntry[] }).entries || [])
    .map((entry) => ({
        ...entry,
        normalizedTitle: normalizeSearchText(entry.title),
    }));

function normalizeSearchText(value: string) {
    return value
        .toLowerCase()
        .normalize('NFKD')
        .replace(/[\u0300-\u036f]/g, '')
        .replace(/&/g, ' and ')
        .replace(/[^a-z0-9]+/g, ' ')
        .trim();
}

function getSearchTerms(query: string) {
    const normalized = normalizeSearchText(query);
    if (!normalized) return { normalized, terms: new Set<string>() };

    const tokens = normalized
        .split(/\s+/)
        .filter((token) => token.length > 1 && !STOP_WORDS.has(token));
    const terms = new Set(tokens);

    for (let index = 0; index < tokens.length - 1; index += 1) {
        terms.add(`${tokens[index]} ${tokens[index + 1]}`);
    }

    for (const token of tokens) {
        if (token.endsWith('s') && token.length > 3) {
            terms.add(token.slice(0, -1));
        }
    }

    return { normalized, terms };
}

function scoreSearchEntry(
    entry: SearchEntry & { normalizedTitle: string },
    normalizedQuery: string,
    queryTerms: Set<string>
) {
    if (!normalizedQuery || queryTerms.size === 0) return 0;

    let score = 0;
    for (const [term, weight] of entry.terms || []) {
        if (queryTerms.has(term)) score += weight;
    }

    if (entry.normalizedTitle === normalizedQuery) score += 12;
    else if (entry.normalizedTitle.startsWith(normalizedQuery)) score += 7;
    else if (entry.normalizedTitle.includes(normalizedQuery)) score += 4;

    for (const titleToken of entry.normalizedTitle.split(/\s+/)) {
        if (queryTerms.has(titleToken)) score += 1.75;
    }

    for (const genre of entry.genres || []) {
        const normalizedGenre = normalizeSearchText(genre);
        if (queryTerms.has(normalizedGenre)) score += 2.5;
    }

    const yearMatch = normalizedQuery.match(/\b(19\d{2}|20\d{2})\b/);
    if (yearMatch && Number(yearMatch[1]) === entry.year) score += 2;

    if (score <= 0) return 0;

    const qualityBoost = 1 + (entry.quality || 0) * 0.25 + Math.min(entry.votes || 0, 500) / 5000;
    return score * qualityBoost;
}

function getSearchCandidates(query: string, limit = MAX_SEARCH_CANDIDATES) {
    const { normalized, terms } = getSearchTerms(query);
    if (!normalized || terms.size === 0) return [];

    return searchEntries
        .map((entry) => ({
            id: entry.id,
            score: scoreSearchEntry(entry, normalized, terms),
        }))
        .filter((entry) => entry.score > 0)
        .sort((a, b) => b.score - a.score || a.id - b.id)
        .slice(0, limit);
}

function parseMovieIds(...params: Array<string | null>) {
    const ids: string[] = [];
    const seen = new Set<string>();

    for (const param of params) {
        if (!param) continue;

        for (const part of param.split(',')) {
            const trimmed = part.trim();
            if (!/^\d+$/.test(trimmed)) continue;

            const normalized = trimmed.replace(/^0+/, '') || '0';
            if (normalized === '0' || seen.has(normalized)) continue;

            seen.add(normalized);
            ids.push(normalized);
            if (ids.length >= MAX_SEED_IDS) return ids;
        }
    }

    return ids;
}

function recommendationResponse(profile: RecommendationProfile,liveCatalog:ReturnType<typeof sanitizeCatalog>=[],liveGraph:NeighborGraph={}) {
    const catalog=[...new Map([...searchEntries,...liveCatalog].map(entry=>[entry.id,entry])).values()];
    const seedIds=[...(profile.seeds||[]),...(profile.negatives||[])].filter(seed=>seed).map(seed=>String(seed.id));
    const relevantGraph=Object.fromEntries(seedIds.map(id=>[id,recommendations[id]||[]]));
    const graph=blendGraphs({graph:relevantGraph,weight:1},{graph:liveGraph,weight:0.65});
    const details = rankRecommendations(profile, graph, catalog, MAX_RESULTS);
    return NextResponse.json({ recommendations: details.map((entry) => entry.id), details, model: "hybrid-profile-v4", requestId: crypto.randomUUID() }, { headers: CACHE_HEADERS });
}

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url);
    const explicit = parseMovieIds(searchParams.get('movieIds'), searchParams.get('movieId'));
    const results = parseMovieIds(searchParams.get('resultIds')).slice(0, MAX_SEARCH_SEEDS);
    const query = (searchParams.get('query') || '').slice(0, 256);
    const candidates = getSearchCandidates(query);
    return recommendationResponse({
        seeds: [...explicit.map((id) => ({ id: Number(id), weight: 1.25, source: "viewed" })),
            ...results.map((id) => ({ id: Number(id), weight: 0.75, source: "search" }))],
        searchCandidates: candidates,
    });
}

export async function POST(request: Request) {
    // Read a bounded body: preference/history requests must never enter shared caches.
    const reader = request.body?.getReader();
    if (!reader) return NextResponse.json({ error: "Invalid profile" }, { status: 400, headers: CACHE_HEADERS });
    let bytes = 0;
    const chunks: Uint8Array[] = [];
    try {
        while (true) {
            const { value, done } = await reader.read();
            if (done) break;
            bytes += value.byteLength;
            if (bytes > 65536) {
                await reader.cancel();
                return NextResponse.json({ error: "Profile too large" }, { status: 413, headers: CACHE_HEADERS });
            }
            chunks.push(value);
        }
        const payload = new Uint8Array(bytes);
        let offset = 0;
        for (const chunk of chunks) { payload.set(chunk, offset); offset += chunk.length; }
        const data = JSON.parse(new TextDecoder().decode(payload));
        if (!data || typeof data !== "object" || Array.isArray(data)) throw new Error("Invalid profile");
        const profile: RecommendationProfile = {
            seeds: Array.isArray(data.seeds) ? data.seeds.slice(0, 200) : [],
            negatives: Array.isArray(data.negatives) ? data.negatives.slice(0, 200) : [],
            exclude: Array.isArray(data.exclude) ? data.exclude.slice(0, 2000) : [],
            favoriteGenres: Array.isArray(data.favoriteGenres) ? data.favoriteGenres.filter((genre: unknown) => typeof genre === "string").slice(0, 10) : [],
            exploration: Number(data.exploration),
            searchCandidates: getSearchCandidates(typeof data.query === "string" ? data.query.slice(0, 256) : ""),
        };
        const liveGraph:NeighborGraph={};
        const seedIds=new Set([...(profile.seeds||[]),...(profile.negatives||[])].filter(seed=>seed&&Number.isSafeInteger(seed.id)).map(seed=>String(seed.id)));
        if(data.neighbors && typeof data.neighbors==='object' && !Array.isArray(data.neighbors)) {
            for(const [id,edges] of Object.entries(data.neighbors).slice(0,8)) {
                if(seedIds.has(id) && Array.isArray(edges))liveGraph[id]=neighborValues(edges).slice(0,30);
            }
        }
        return recommendationResponse(profile,sanitizeCatalog(data.catalog),liveGraph);
    } catch {
        return NextResponse.json({ error: "Invalid profile" }, { status: 400, headers: CACHE_HEADERS });
    }
}
