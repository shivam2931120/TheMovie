/** Keep revisions increasing even when multiple edits happen in one millisecond. */
export function nextFeatureTimestamp(previous: string, now: number) {
    const prior = Date.parse(previous);
    return new Date(Math.max(now, Number.isFinite(prior) ? prior + 1 : now)).toISOString();
}
