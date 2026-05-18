import { NextResponse } from 'next/server';
import recommendationsData from '@/data/recommendations.json';
import searchIndexData from '@/data/recommendation-search-index.json';

const recommendations = recommendationsData as Record<string, number[]>;
const MAX_SEED_IDS = 20;
const MAX_RESULTS = 20;
const MAX_SEARCH_SEEDS = 8;
const MAX_SEARCH_CANDIDATES = 16;
const CACHE_HEADERS = {
    'Cache-Control': 'public, max-age=300, stale-while-revalidate=3600',
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

function recommendationResponse(ids: number[]) {
    return NextResponse.json(
        { recommendations: ids },
        { headers: CACHE_HEADERS }
    );
}

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url);

    const movieIdParam = searchParams.get('movieId');
    const movieIdsParam = searchParams.get('movieIds');
    const resultIdsParam = searchParams.get('resultIds');
    const queryParam = searchParams.get('query') || '';

    const explicitMovieIds = parseMovieIds(movieIdsParam, movieIdParam);
    const resultIds = parseMovieIds(resultIdsParam).slice(0, MAX_SEARCH_SEEDS);
    const searchCandidates = getSearchCandidates(queryParam);

    const seedWeights = new Map<string, number>();
    const addSeed = (id: string, weight: number) => {
        seedWeights.set(id, Math.max(seedWeights.get(id) || 0, weight));
    };

    explicitMovieIds.forEach((id, index) => addSeed(id, 1.25 - Math.min(index, 10) * 0.02));
    resultIds.forEach((id, index) => addSeed(id, 1.1 - Math.min(index, 8) * 0.04));
    searchCandidates.slice(0, MAX_SEARCH_SEEDS).forEach((candidate, index) => {
        addSeed(String(candidate.id), 0.95 - Math.min(index, 8) * 0.03);
    });

    const movieIds = Array.from(seedWeights.keys()).slice(0, MAX_SEED_IDS);

    if (movieIds.length === 0) {
        return recommendationResponse([]);
    }

    try {
        const scores = new Map<number, number>();
        const seedSet = new Set(movieIds);

        for (const id of movieIds) {
            const recs = recommendations[id];
            if (!Array.isArray(recs)) continue;
            const seedWeight = seedWeights.get(id) || 1;

            recs.forEach((recId, index) => {
                if (!Number.isInteger(recId) || recId <= 0 || seedSet.has(String(recId))) return;

                const score = seedWeight * (1 + (1 / (index + 1)));
                scores.set(recId, (scores.get(recId) || 0) + score);
            });
        }

        searchCandidates.forEach((candidate, index) => {
            if (seedSet.has(String(candidate.id))) return;
            const directSearchScore = Math.max(candidate.score * 0.25, 0.01) - index * 0.005;
            scores.set(candidate.id, (scores.get(candidate.id) || 0) + directSearchScore);
        });

        const sortedRecs = Array.from(scores.entries())
            .sort(([idA, scoreA], [idB, scoreB]) => scoreB - scoreA || idA - idB)
            .slice(0, MAX_RESULTS)
            .map(([id]) => id);

        if (sortedRecs.length === 0) {
            return recommendationResponse([]);
        }

        return recommendationResponse(sortedRecs);

    } catch (error) {
        console.error('AI Recommendation Error:', error);
        return recommendationResponse([]);
    }
}
