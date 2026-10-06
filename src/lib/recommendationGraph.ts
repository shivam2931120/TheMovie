/** Legacy ordered IDs and learned, support-adjusted cosine similarities. */
export type Neighbor = number | { id: number; score: number; support?: number };
export type NeighborGraph = Record<string, Neighbor[]>;

export function neighborValues(edges: Neighbor[] = []) {
    const unique = new Map<number, number>();
    for (const [rank, edge] of edges.slice(0, 60).entries()) {
        const id = Number(typeof edge === 'number' ? edge : edge?.id);
        const score = typeof edge === 'number' ? 1 / Math.sqrt(rank + 1) : Number(edge?.score);
        if (!Number.isSafeInteger(id) || id <= 0 || !Number.isFinite(score) || score <= 0) continue;
        unique.set(id, Math.max(unique.get(id) || 0, Math.min(1, score)));
    }
    return [...unique].map(([id, score]) => ({ id, score }));
}

/** Combine independent retrieval sources; one model cannot erase another's candidates. */
export function blendGraphs(...sources: Array<{ graph: NeighborGraph; weight: number }>): NeighborGraph {
    const seeds = new Set(sources.flatMap(source => Object.keys(source.graph)));
    const result: NeighborGraph = {};
    for (const seed of seeds) {
        const scores = new Map<number, number>();
        let totalWeight = 0;
        for (const source of sources) {
            const edges = neighborValues(source.graph[seed]);
            if (!edges.length || source.weight <= 0) continue;
            totalWeight += source.weight;
            for (const edge of edges) scores.set(edge.id, (scores.get(edge.id) || 0) + edge.score * source.weight);
        }
        result[seed] = [...scores].sort((a,b) => b[1]-a[1] || a[0]-b[0]).slice(0,60)
            .map(([id, score]) => ({ id, score: score / totalWeight }));
    }
    return result;
}
