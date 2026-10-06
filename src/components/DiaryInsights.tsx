"use client";
import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { useDiary } from '@/context/DiaryContext';
import { localToday } from '@/lib/diary';
import { diaryInsights, diaryRecap } from '@/lib/diaryInsights';
import { downloadFile, monthBounds, shiftMonth } from '@/lib/releaseCalendar';

function Bars({ values }: { values: {label: string; count: number}[] }) {
    const max = Math.max(1,...values.map(value=>value.count));
    return <ul className="space-y-3">{values.map(value => <li key={value.label}><div className="mb-1 flex justify-between gap-3 text-sm text-text-secondary"><span>{value.label}</span><span>{value.count}</span></div><div aria-hidden="true" className="h-2 overflow-hidden rounded-full bg-white/10"><div className="h-full rounded-full bg-accent-primary" style={{width:`${value.count/max*100}%`}} /></div></li>)}</ul>;
}
export function DiaryInsights() {
    const [mounted, setMounted] = useState(false);
    useEffect(() => setMounted(true), []);
    const { entries, loading } = useDiary();
    const [scope, setScope] = useState('month');
    const [month, setMonth] = useState(() => localToday().slice(0,7));
    const [year, setYear] = useState(() => localToday().slice(0,4));
    const period = scope === 'month' ? month : scope === 'year' ? year : '';
    const data = useMemo(()=>diaryInsights(entries,period),[entries,period]);
    const previous = scope === 'month' ? shiftMonth(month,-1) : scope === 'year' ? String(Number(year)-1) : '';
    const priorCount = previous ? entries.filter(entry=>entry.watchedOn.startsWith(previous)).length : 0;
    const years = [...new Set([localToday().slice(0,4),...entries.map(entry=>entry.watchedOn.slice(0,4))])].sort().reverse();
    const chartYear = scope === 'year' ? year : scope === 'month' ? month.slice(0,4) : localToday().slice(0,4);
    const monthly = Array.from({length:12},(_,index) => { const key = `${chartYear}-${String(index+1).padStart(2,'0')}`; return {label:new Date(`${key}-01T12:00:00`).toLocaleDateString(undefined,{month:'short'}),count:entries.filter(entry=>entry.watchedOn.startsWith(key)).length}; });
    const field = 'min-h-11 rounded-lg border border-white/15 bg-bg-card px-3 py-2 text-white disabled:cursor-not-allowed disabled:opacity-50';
    if (!mounted) return <p role="status" className="text-text-secondary">Loading insights…</p>;
    return <section aria-labelledby="diary-insights" className="space-y-5 rounded-xl border border-white/10 bg-bg-card p-4 sm:p-6">
        <header className="flex flex-wrap items-center justify-between gap-3"><div><h2 id="diary-insights" className="text-2xl font-bold text-white">Your viewing summary</h2><p className="mt-1 text-sm text-text-muted">A picture of your viewing habits, based on your logs.</p></div><button className={field} disabled={loading || !data.selected.length} onClick={()=>downloadFile(diaryRecap(entries,period),`themovie-recap-${period || 'all-time'}.txt`,'text/plain;charset=utf-8')}>Download recap</button></header>
        <div className="flex flex-wrap items-center gap-3"><label className="text-sm text-text-secondary">Period <select value={scope} onChange={event=>setScope(event.target.value)} className={field}><option value="month">Monthly</option><option value="year">Yearly</option><option value="all">All time</option></select></label>{scope === 'month' && <input aria-label="Insights month" type="month" value={month} min="1900-01" max={localToday().slice(0,7)} onChange={event=>{if (/^\d{4}-\d{2}$/.test(event.target.value)) setMonth(event.target.value);}} className={field} />}{scope === 'year' && <select aria-label="Insights year" value={year} onChange={event=>setYear(event.target.value)} className={field}>{years.map(value=><option key={value}>{value}</option>)}</select>}</div>
        {loading ? <p role="status" className="text-text-secondary">Loading insights…</p> : <>
            <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">{[['Viewings',data.stats.entries],['First watches',data.stats.entries-data.stats.rewatches],['Rewatches',data.stats.rewatches],['Personal rating',data.average === null ? 'Unrated' : `${data.average.toFixed(1)}/10`]].map(([label,value])=><div key={String(label)} className="rounded-lg bg-white/5 p-4"><p className="text-xs text-text-muted">{label}</p><p className="mt-1 text-xl font-bold text-white">{value}</p></div>)}</div>
            <p className="text-sm text-text-secondary">{data.movieCount} movie viewings · {data.tvCount} TV show entries · {data.ratedCount} rated viewings{previous && ` · ${data.stats.entries-priorCount > 0 ? '+' : ''}${data.stats.entries-priorCount} viewings versus ${previous}`}</p>
            {!data.selected.length && <p className="rounded-lg bg-white/5 p-4 text-text-secondary">No diary entries for this period. Log a watch below or choose another period.</p>}
            <div className="grid gap-6 lg:grid-cols-2"><div><h3 className="mb-3 font-bold text-white">Viewing activity · {chartYear}</h3><Bars values={monthly} /><p className="mt-3 text-xs text-text-muted">Monthly activity always shows the full labelled year. Future months have no logged watches.</p></div><div className="space-y-5"><div><h3 className="mb-3 font-bold text-white">Genres</h3>{data.genres.length ? <Bars values={data.genres.slice(0,6).map(([label,count])=>({label,count}))} /> : <p className="text-sm text-text-muted">No genre metadata for this selection.</p>}<p className="mt-3 text-xs text-text-muted">Genre data available for {data.genreCoverage}/{data.stats.entries} viewings. A title can contribute to several genres.</p></div><div className="rounded-lg bg-white/5 p-4"><h3 className="font-bold text-white">Known movie watch time</h3><p className="mt-1 text-2xl text-white">{(data.minutes/60).toFixed(1)} hours</p><p className="mt-2 text-xs text-text-muted">Runtime available for {data.timedCount}/{data.movieCount} movie viewings. TV entries are show-level logs and are excluded from duration totals.</p></div></div></div>
            {scope === 'month' && <div><h3 className="mb-3 font-bold text-white">Daily activity · {month}</h3><div className="grid grid-cols-7 gap-1 sm:grid-cols-10 lg:grid-cols-16">{Array.from({length:Number(monthBounds(month).end.slice(-2))},(_,index)=>{const day=`${month}-${String(index+1).padStart(2,'0')}`; const count=data.days.get(day)||0;return <div key={day} title={`${day}: ${count} viewings`} className={`flex min-h-12 flex-col items-center justify-center rounded border border-white/10 text-xs ${count ? 'bg-accent-surface text-white' : 'bg-white/5 text-text-muted'}`}><span>{index+1}</span><span className="text-[10px]">{count}</span><span className="sr-only">viewings on {day}</span></div>;})}</div><p className="mt-2 text-xs text-text-muted">Day of month and logged viewing count.</p></div>}
            <div><h3 className="mb-3 font-bold text-white">Personal ratings</h3><div className="grid grid-cols-5 gap-2 sm:grid-cols-10">{data.ratings.map(bin=><div key={bin.label} className="rounded-lg bg-white/5 p-2 text-center"><p className="text-xs text-text-muted">{bin.label}/10</p><p className="mt-1 font-bold text-white">{bin.count}</p></div>)}</div><p className="mt-2 text-xs text-text-muted">Unrated entries are excluded. Fractional ratings are grouped into the next whole-number bin.</p></div>
            <div className="grid gap-6 sm:grid-cols-2">{[{label:'Highest personally rated',titles:data.topRated},{label:'Most revisited in this period',titles:data.mostWatched}].map(group=><div key={group.label}><h3 className="mb-3 font-bold text-white">{group.label}</h3>{!group.titles.length ? <p className="text-sm text-text-muted">{group.label.startsWith('Highest') ? 'Rate a watch to see your favourites.' : 'No repeated titles in this period.'}</p> : <ol className="space-y-2">{group.titles.map(title=><li key={`${title.type}:${title.id}`} className="flex items-start justify-between gap-3 text-sm"><Link className="text-white hover:text-accent-primary" href={`/${title.type}/${title.id}`}>{title.title} <span className="text-text-muted">({title.type === 'movie' ? 'Movie' : 'TV'})</span></Link><span className="shrink-0 text-text-secondary">{'average' in title ? `${Number(title.average).toFixed(1)}/10` : `${title.count} watches`}</span></li>)}</ol>}</div>)}</div>
            <p className="text-xs text-text-muted">Rewatches use your full diary history. Comparisons reflect logged entries, not activity you haven’t recorded. Recap downloads include titles and summary statistics; private notes are excluded.</p>
        </>}
    </section>;
}
