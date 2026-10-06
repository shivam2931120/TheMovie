import { getCalendarMovie, getCalendarMovies, getCalendarSeason, getCalendarShow } from '@/api/tmdb';

export type Release = { key: string; id: number; type: 'movie' | 'tv'; title: string; date: string; label: string };
export const releaseTypes: Record<string, string> = { '2': 'Limited theatrical', '3': 'Theatrical', '4': 'Digital', '5': 'Physical', '6': 'TV' };
export function monthBounds(month: string) {
    const [year, number] = month.split('-').map(Number);
    return { start: `${month}-01`, end: `${month}-${new Date(year, number, 0).getDate()}` };
}
export function shiftMonth(month: string, delta: number) {
    const [year, number] = month.split('-').map(Number);
    const date = new Date(year, number - 1 + delta, 1);
    return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
}
function validDate(date: unknown): date is string {
    if (typeof date !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(date)) return false;
    const parsed = new Date(`${date}T00:00:00Z`);
    return Number.isFinite(parsed.getTime()) && parsed.toISOString().slice(0, 10) === date;
}
function movieReleases(movie: any, region: string, kind: string, start: string, end: string): Release[] {
    const dates = movie.release_dates?.results?.find((entry: any) => entry.iso_3166_1 === region)?.release_dates || [];
    return dates.flatMap((release: any) => {
        const date = String(release.release_date || '').slice(0, 10);
        return validDate(date) && date >= start && date <= end && (kind === 'all' || String(release.type) === kind) && releaseTypes[String(release.type)]
            ? [{ key: `movie-${movie.id}-${release.type}-${date}`, id: movie.id, type: 'movie' as const, title: movie.title || 'Untitled', date, label: `${releaseTypes[String(release.type)]} · ${region}` }] : [];
    });
}
async function pooled<T, R>(items: T[], task: (item: T) => Promise<R>, signal: AbortSignal) {
    let cursor = 0;
    const results: PromiseSettledResult<R>[] = new Array(items.length);
    await Promise.all(Array.from({ length: Math.min(4, items.length) }, async () => {
        while (cursor < items.length && !signal.aborted) {
            const index = cursor++;
            try { results[index] = { status: 'fulfilled', value: await task(items[index]) }; }
            catch (reason) { results[index] = { status: 'rejected', reason }; }
        }
    }));
    if (signal.aborted) throw new DOMException('Cancelled', 'AbortError');
    return results;
}
export async function loadReleases({ month, region, kind, page, personal, items, showIds, signal }: {
    month: string; region: string; kind: string; page: number; personal: boolean; items: any[]; showIds: number[]; signal: AbortSignal;
}) {
    const { start, end } = monthBounds(month);
    let pages = 1;
    let candidates = items.filter(item => item.type !== 'tv');
    if (!personal) {
        const data = await getCalendarMovies({ region, 'release_date.gte': start, 'release_date.lte': end, with_release_type: kind === 'all' ? '2|3|4|5|6' : kind, sort_by: 'popularity.desc', page }, { signal });
        if (!Array.isArray(data.results)) throw new Error('Invalid release response');
        candidates = data.results;
        pages = Math.min(Number(data.total_pages) || 1, 500);
    }
    const movies = await pooled(candidates, async item => {
        const movie = await getCalendarMovie(item.id, { signal });
        if (!movie.id) throw new Error('Missing movie details');
        return movieReleases(movie, region, kind, start, end);
    }, signal);
    const shows = await pooled(personal ? [...new Set(showIds)] : [], async id => {
        const show = await getCalendarShow(id, { signal });
        if (!show.id || !Array.isArray(show.seasons)) throw new Error('Missing show details');
        // Include undated seasons: their episodes may already have announced dates.
        const seasons = show.seasons.filter((season: any) => season.season_number >= 0 && (!season.air_date || season.air_date <= end));
        const results = await pooled(seasons, async (season: any) => {
            const details = await getCalendarSeason(id, season.season_number, { signal });
            if (!Array.isArray(details.episodes)) throw new Error('Missing episode details');
            return details.episodes.flatMap((episode: any) => validDate(episode.air_date) && episode.air_date >= start && episode.air_date <= end
                ? [{ key: `tv-${id}-${season.season_number}-${episode.episode_number}`, id, type: 'tv' as const, title: show.name || 'Untitled', date: episode.air_date, label: `S${season.season_number} E${episode.episode_number} · Original air date` }] : []);
        }, signal);
        return { releases: results.flatMap(result => result.status === 'fulfilled' ? result.value : []), failed: results.filter(result => result.status === 'rejected').length };
    }, signal);
    const releases = [...movies.flatMap(result => result.status === 'fulfilled' ? result.value : []), ...shows.flatMap(result => result.status === 'fulfilled' ? result.value.releases : [])];
    return { releases: [...new Map(releases.map(release => [release.key, release])).values()].sort((a,b) => a.date.localeCompare(b.date) || a.title.localeCompare(b.title)), pages,
        failed: movies.filter(result => result.status === 'rejected').length + shows.reduce((sum, result) => sum + (result.status === 'rejected' ? 1 : result.value.failed), 0) };
}
const escapeICS = (value: string) => value.replace(/\\/g, '\\\\').replace(/\r\n|\r|\n/g, '\\n').replace(/;/g, '\\;').replace(/,/g, '\\,');
export function calendarExport(releases: Release[]) {
    const stamp = new Date().toISOString().replace(/[-:]/g, '').replace(/\.\d{3}/, '');
    const lines = ['BEGIN:VCALENDAR', 'VERSION:2.0', 'PRODID:-//TheMovie//Release Calendar//EN', 'CALSCALE:GREGORIAN'];
    for (const release of releases) {
        const next = new Date(`${release.date}T00:00:00Z`); next.setUTCDate(next.getUTCDate() + 1);
        lines.push('BEGIN:VEVENT', `UID:${release.key}@themovie`, `DTSTAMP:${stamp}`, `DTSTART;VALUE=DATE:${release.date.replace(/-/g,'')}`, `DTEND;VALUE=DATE:${next.toISOString().slice(0,10).replace(/-/g,'')}`, `SUMMARY:${escapeICS(release.title + ' · ' + release.label)}`, 'DESCRIPTION:Dates from TMDB may change. This export is a snapshot.', `URL:https://themovie.justshivamm.in/${release.type}/${release.id}`, 'END:VEVENT');
    }
    lines.push('END:VCALENDAR');
    // Fold UTF-8 lines at 75 octets, as required by iCalendar.
    return lines.map(line => {
        let output = '', bytes = 0;
        for (const char of line) { const size = new TextEncoder().encode(char).length; if (bytes + size > 75) { output += '\r\n '; bytes = 1; } output += char; bytes += size; }
        return output;
    }).join('\r\n') + '\r\n';
}
export function downloadFile(content: string, filename: string, type: string) {
    const url = URL.createObjectURL(new Blob([content], { type }));
    const link = document.createElement('a'); link.href = url; link.download = filename; document.body.appendChild(link); link.click(); link.remove();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
}
