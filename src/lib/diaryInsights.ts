import { diaryStats, type DiaryEntry } from './diary';
import { MOVIE_GENRES } from './recommendationCatalog';

const TV_GENRES: Record<number,string> = {10759:'Action & Adventure',16:'Animation',35:'Comedy',80:'Crime',99:'Documentary',18:'Drama',10751:'Family',10762:'Kids',9648:'Mystery',10763:'News',10764:'Reality',10765:'Sci-Fi & Fantasy',10766:'Soap',10767:'Talk',10768:'War & Politics'};
export function diaryInsights(entries: DiaryEntry[], period: string) {
    const selected = entries.filter(entry => !period || entry.watchedOn.startsWith(period));
    const stats = diaryStats(selected, entries);
    const rated = selected.filter(entry => Number.isFinite(entry.rating) && entry.rating > 0);
    const ratings = Array.from({length:10},(_,index) => ({ label: String(index+1), count: rated.filter(entry => Math.ceil(entry.rating) === index+1).length }));
    const genres = new Map<string,number>();
    const titles = new Map<string,{ id: number; type: 'movie' | 'tv'; title: string; count: number; ratings: number[] }>();
    const days = new Map<string,number>();
    const months = new Map<string,number>();
    let genreCoverage = 0;
    for (const entry of selected) {
        days.set(entry.watchedOn, (days.get(entry.watchedOn)||0)+1);
        const month = entry.watchedOn.slice(0,7); months.set(month,(months.get(month)||0)+1);
        const key = `${entry.item.type}:${entry.item.id}`;
        const title = titles.get(key) || { id:entry.item.id, type:entry.item.type, title:entry.item.title, count:0, ratings:[] };
        title.count++; if (entry.rating > 0) title.ratings.push(entry.rating); titles.set(key,title);
        const catalogue = entry.item.type === 'movie' ? MOVIE_GENRES : TV_GENRES;
        const known = [...new Set((Array.isArray(entry.item.genre_ids) ? entry.item.genre_ids : []).map(id => catalogue[id]).filter(Boolean))];
        if (known.length) genreCoverage++;
        for (const name of known) genres.set(name,(genres.get(name)||0)+1);
    }
    const movies = selected.filter(entry => entry.item.type === 'movie');
    const timed = movies.filter(entry => Number.isFinite(entry.item.runtime) && Number(entry.item.runtime) > 0);
    return { selected, stats, ratings, days, months, genreCoverage,
        movieCount: movies.length, tvCount: selected.length-movies.length,
        timedCount: timed.length, minutes: timed.reduce((sum,entry) => sum + Number(entry.item.runtime),0),
        average: rated.length ? rated.reduce((sum,entry) => sum+entry.rating,0)/rated.length : null, ratedCount: rated.length,
        genres: [...genres].sort((a,b) => b[1]-a[1] || a[0].localeCompare(b[0])),
        mostWatched: [...titles.values()].filter(title => title.count > 1).sort((a,b) => b.count-a.count || a.title.localeCompare(b.title)).slice(0,5),
        topRated: [...titles.values()].filter(title => title.ratings.length).map(title => ({...title, average:title.ratings.reduce((a,b)=>a+b,0)/title.ratings.length})).sort((a,b) => b.average-a.average || b.ratings.length-a.ratings.length || a.title.localeCompare(b.title)).slice(0,5)
    };
}
export function diaryRecap(entries: DiaryEntry[], period: string) {
    const data = diaryInsights(entries,period);
    return [`TheMovie watch recap — ${period || 'All time'}`, '', `${data.stats.entries} viewings · ${data.stats.unique} different titles`, `${data.movieCount} movie viewings · ${data.tvCount} TV show entries`, `${data.stats.rewatches} rewatches`, `Average personal rating: ${data.average === null ? 'Unrated' : data.average.toFixed(1)+'/10'} (${data.ratedCount} rated viewings)`, `Known movie watch time: ${(data.minutes/60).toFixed(1)} hours (${data.timedCount}/${data.movieCount} movie viewings with runtime)`, '', 'Top genres (a viewing can count toward multiple genres):', ...data.genres.slice(0,5).map(([name,count])=>`${name}: ${count}`), '', 'Highest rated titles:', ...data.topRated.map(title => `${title.title} (${title.type}): ${title.average.toFixed(1)}/10`), '', 'TV entries represent shows, not individual episodes. Private diary notes are excluded.'].join('\n');
}
