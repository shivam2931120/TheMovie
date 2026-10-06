import { neighborValues, type NeighborGraph } from './recommendationGraph';

export type RecommendationSeed = { id: number; weight?: number; source?: string; label?: string };
export type CatalogEntry = { id: number; title: string; genres?: string[]; quality?: number; votes?: number };
export type RecommendationProfile = { seeds?: RecommendationSeed[]; negatives?: RecommendationSeed[]; exclude?: number[]; favoriteGenres?: string[]; exploration?: number; searchCandidates?: { id: number; score: number }[] };
export type RankedRecommendation = { id: number; score: number; reason: string };

const positiveId = (value: unknown) => Number.isSafeInteger(Number(value)) && Number(value) > 0;
const clamp = (value: number, min: number, max: number) => Math.min(max, Math.max(min, value));
const genreName = (genre: string) => {
    const name = genre.toLowerCase().replace("sci-fi", "science fiction");
    return name === "family" || name === "children" ? "family" : name;
};

function normalizeSeeds(input: RecommendationSeed[] = []) {
    const unique = new Map<number, RecommendationSeed>();
    for (const seed of input.slice(0, 200)) {
        if (!seed || !positiveId(seed.id)) continue;
        const weight = Number.isFinite(Number(seed.weight)) ? clamp(Number(seed.weight), 0, 4) : 1;
        if (!weight) continue;
        const id = Number(seed.id);
        if ((unique.get(id)?.weight || 0) < weight) unique.set(id, { id, weight,
            source: typeof seed.source === "string" ? seed.source.slice(0, 30) : undefined,
            label: typeof seed.label === "string" ? seed.label.slice(0, 200) : undefined });
    }
    return [...unique.values()].sort((a, b) => b.weight! - a.weight!).slice(0, 40);
}

function cosineGenres(entry: CatalogEntry | undefined, profile: Map<string, number>) {
    const genres = [...new Set((entry?.genres || []).map(genreName))];
    if (!genres.length || !profile.size) return 0;
    const norm = Math.sqrt([...profile.values()].reduce((sum, weight) => sum + weight ** 2, 0));
    return genres.reduce((sum, genre) => sum + (profile.get(genre) || 0), 0) / (Math.sqrt(genres.length) * norm || 1);
}

function genreOverlap(a: CatalogEntry | undefined, b: CatalogEntry | undefined) {
    const left = new Set((a?.genres || []).map(genreName));
    const right = new Set((b?.genres || []).map(genreName));
    const union = new Set([...left, ...right]);
    return union.size ? [...left].filter((genre) => right.has(genre)).length / union.size : 0;
}

/** Personalized reranking over the trained item model, with feedback and MMR diversity. */
export function rankRecommendations(profile: RecommendationProfile, neighbors: NeighborGraph, catalog: CatalogEntry[], limit = 20): RankedRecommendation[] {
    const byId = new Map(catalog.map((entry) => [entry.id, entry]));
    const negativeSeeds = normalizeSeeds(Array.isArray(profile.negatives) ? profile.negatives : []);
    const negativeIds = new Set(negativeSeeds.map((seed) => seed.id));
    const seeds = normalizeSeeds(Array.isArray(profile.seeds) ? profile.seeds : []).filter((seed) => !negativeIds.has(seed.id));
    const excluded = new Set((Array.isArray(profile.exclude) ? profile.exclude : []).filter(positiveId).map(Number));
    negativeIds.forEach((id) => excluded.add(id));
    seeds.forEach((seed) => excluded.add(seed.id));
    const positiveGenres = new Map<string, number>();
    const negativeGenres = new Map<string, number>();
    const addGenres = (target: Map<string, number>, id: number, weight: number) => {
        const genres=[...new Set((byId.get(id)?.genres || []).map(genreName))];
        for (const genre of genres) {
            const key = genreName(genre);
            target.set(key, (target.get(key) || 0) + weight / Math.sqrt(genres.length));
        }
    };
    for (const genre of (Array.isArray(profile.favoriteGenres) ? profile.favoriteGenres : []).slice(0, 10)) {
        if (typeof genre === "string") positiveGenres.set(genreName(genre), 2);
    }
    seeds.forEach((seed) => addGenres(positiveGenres, seed.id, seed.weight!));
    negativeSeeds.forEach((seed) => addGenres(negativeGenres, seed.id, seed.weight!));

    const graphScores = new Map<number, number>();
    const negativeScores = new Map<number, number>();
    const strongest = new Map<number, { seed: RecommendationSeed; contribution: number }>();
    for (const seed of seeds) {
        const votes = byId.get(seed.id)?.votes || 0;
        const confidence = 0.5 + 0.5 * Math.sqrt(votes / (votes + 25));
        neighborValues(neighbors[String(seed.id)]).forEach(({id,score}) => {
            if (!positiveId(id) || excluded.has(id)) return;
            const contribution = seed.weight! * confidence * score;
            graphScores.set(id, (graphScores.get(id) || 0) + contribution);
            if (contribution > (strongest.get(id)?.contribution || 0)) strongest.set(id, { seed, contribution });
        });
    }
    for (const seed of negativeSeeds) {
        neighborValues(neighbors[String(seed.id)]).forEach(({id,score}) => negativeScores.set(id, (negativeScores.get(id) || 0) + seed.weight! * score));
    }
    const graphMax = Math.max(1, ...graphScores.values());
    const negativeMax = Math.max(1, ...negativeScores.values());
    const candidateIds = new Set(graphScores.keys());
    // Content retrieval also handles taste profiles whose titles lack model neighbors.
    const contentCandidates = catalog.filter((entry) => !excluded.has(entry.id))
        .map((entry) => ({ id: entry.id, score: cosineGenres(entry, positiveGenres) + (entry.quality || 0) * 0.1 + Math.min(entry.votes || 0, 1000) / 10000 }))
        .sort((a, b) => b.score - a.score || a.id - b.id).slice(0, 120);
    const cold = !graphScores.size && !positiveGenres.size;
    if (positiveGenres.size || cold) contentCandidates.forEach((entry) => candidateIds.add(entry.id));
    const searchScores = new Map<number, number>();
    for (const entry of (profile.searchCandidates || []).slice(0, 30)) {
        if (positiveId(entry.id) && !excluded.has(entry.id) && Number.isFinite(entry.score)) { candidateIds.add(entry.id); searchScores.set(entry.id, Math.max(0, entry.score)); }
    }
    const searchMax = Math.max(1, ...searchScores.values());
    const scores = [...candidateIds].filter((id) => !excluded.has(id)).map((id) => {
        const entry = byId.get(id);
        const content = cosineGenres(entry, positiveGenres);
        const score = (graphScores.get(id) || 0) / graphMax * 0.7
            + content * 0.25 + (entry?.quality || 0) * (cold ? 0.7 : 0.05)
            + Math.min(entry?.votes || 0, 1000) / 1000 * (cold ? 0.3 : 0.02)
            + (searchScores.get(id) || 0) / searchMax * 0.3
            - (negativeScores.get(id) || 0) / negativeMax * 0.35
            - cosineGenres(entry, negativeGenres) * 0.12;
        const support = strongest.get(id)?.seed;
        const label = support?.label || (support ? byId.get(support.id)?.title : "");
        const genre = entry?.genres?.find((value) => positiveGenres.has(genreName(value)));
        let reason = cold ? "Popular picks to get you started" : genre ? `Matches your interest in ${genre}` : "Similar to titles you enjoy";
        if (support && label) {
            reason = support.source === "rated" ? `Because you rated ${label} highly`
                : support.source === "diary" ? `Inspired by your diary entry for ${label}`
                : support.source === "watched" ? `Because you watched ${label}`
                : support.source === "watchlist" || support.source === "saved" ? `Related to ${label} in your saved titles`
                : `Related to ${label}`;
        } else if (searchScores.has(id)) reason = "Related to your search";
        return { id, score, reason };
    }).filter((entry) => entry.score > 0);

    const selected: RankedRecommendation[] = [];
    const variety = Number.isFinite(Number(profile.exploration)) ? clamp(Number(profile.exploration), 0, 0.5) : 0.2;
    while (scores.length && selected.length < clamp(limit, 1, 50)) {
        let bestIndex = 0;
        let bestScore = -Infinity;
        scores.forEach((entry, index) => {
            const similarity = selected.reduce((max, chosen) => Math.max(max, genreOverlap(byId.get(entry.id), byId.get(chosen.id))), 0);
            const adjusted = entry.score - variety * similarity * 0.35;
            if (adjusted > bestScore || (adjusted === bestScore && entry.id < scores[bestIndex].id)) { bestIndex = index; bestScore = adjusted; }
        });
        selected.push(scores.splice(bestIndex, 1)[0]);
    }
    return selected;
}
