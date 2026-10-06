"use client";

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { getCalendarCountries } from '@/api/tmdb';
import { LibraryNav } from '@/components/LibraryNav';
import { useWatchlist } from '@/context/watchlist-context';
import { useTVWatchProgress } from '@/context/TVWatchProgressContext';
import { useDiary } from '@/context/DiaryContext';
import { localToday } from '@/lib/diary';
import { calendarExport, downloadFile, loadReleases, monthBounds, releaseTypes, shiftMonth, type Release } from '@/lib/releaseCalendar';

export default function CalendarPage() {
    const { owner } = useDiary();
    return <CalendarContent key={owner} />;
}
function CalendarContent() {
    const [mounted, setMounted] = useState(false);
    useEffect(() => setMounted(true), []);
    const { items, loading: watchlistLoading } = useWatchlist() as any;
    const { progress, isLoaded } = useTVWatchProgress();
    const [month, setMonth] = useState(() => localToday().slice(0,7));
    const [view, setView] = useState('browse');
    const [region, setRegion] = useState('IN');
    const [kind, setKind] = useState('3');
    const [countries, setCountries] = useState([['IN','India'],['US','United States'],['GB','United Kingdom'],['CA','Canada'],['AU','Australia'],['FR','France'],['DE','Germany'],['JP','Japan'],['KR','South Korea'],['BR','Brazil']]);
    const [countryError, setCountryError] = useState(false);
    const [page, setPage] = useState(1);
    const [selectedDay, setSelectedDay] = useState('');
    const [retry, setRetry] = useState(0);
    const [result, setResult] = useState<{ releases: Release[]; pages: number; failed: number } | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const itemKey = JSON.stringify((items || []).map((item: any) => ({ id: item.id, type: item.type })));
    const showKey = JSON.stringify(Object.keys(progress || {}));
    const personal = view === 'personal';
    useEffect(() => {
        const controller = new AbortController();
        getCalendarCountries({ signal: controller.signal }).then(data => {
            if (!Array.isArray(data)) throw new Error('Missing countries');
            const values: string[][] = data.filter(country => /^[A-Z]{2}$/.test(country.iso_3166_1) && country.english_name).map(country => [country.iso_3166_1, country.english_name]);
            if (!values.length) throw new Error('Missing countries');
            if (!controller.signal.aborted) { setCountries(values.sort((a,b)=>a[1].localeCompare(b[1]))); setCountryError(false); }
        }).catch(() => { if (!controller.signal.aborted) setCountryError(true); });
        return () => controller.abort();
    }, [retry]);
    useEffect(() => {
        const controller = new AbortController();
        setResult(null); setError(''); setLoading(true);
        if (personal && (watchlistLoading || !isLoaded)) return () => controller.abort();
        const saved = JSON.parse(itemKey);
        const showIds = [...saved.filter((item: any) => item.type === 'tv').map((item: any) => Number(item.id)), ...JSON.parse(showKey).map(Number)];
        loadReleases({ month, region, kind, page, personal, items: saved, showIds, signal: controller.signal })
            .then(data => { if (!controller.signal.aborted) setResult(data); })
            .catch(() => { if (!controller.signal.aborted) setError('Release dates could not be loaded. Please try again.'); })
            .finally(() => { if (!controller.signal.aborted) setLoading(false); });
        return () => controller.abort();
    }, [month, region, kind, page, personal, itemKey, showKey, retry, watchlistLoading, isLoaded]);
    const releases = useMemo(() => result?.releases || [], [result]);
    const grouped = useMemo(() => {
        const groups = new Map<string, Release[]>();
        for (const release of releases) groups.set(release.date, [...(groups.get(release.date) || []), release]);
        return groups;
    }, [releases]);
    const { end } = monthBounds(month);
    const offset = new Date(`${month}-01T12:00:00`).getDay();
    const days = Number(end.slice(-2));
    const field = 'min-h-11 rounded-lg border border-white/15 bg-bg-card px-3 py-2 text-white disabled:cursor-not-allowed disabled:opacity-50';
    function reset() { setPage(1); setSelectedDay(''); }
    if (!mounted) return <main className="min-h-screen bg-bg-main px-4 pb-28 pt-28"><p role="status" className="text-text-secondary">Loading calendar…</p></main>;
    return <main className="min-h-screen bg-bg-main pb-28 pt-28"><div className="container mx-auto space-y-6 px-4 sm:px-6 lg:px-20">
        <LibraryNav active="calendar" />
        <header><h1 className="font-display text-3xl font-bold text-white">Release calendar</h1><p className="mt-2 text-text-secondary">Plan your next watch with announced movie releases and episodes.</p></header>
        <div className="flex flex-wrap gap-2" aria-label="Calendar views">{[['browse','Browse releases'],['personal','My releases']].map(([value,label]) => <button key={value} aria-pressed={view === value} onClick={() => { setView(value); reset(); }} className={`min-h-11 rounded-full px-4 ${view === value ? 'bg-accent-surface text-white' : 'bg-white/5 text-text-secondary'}`}>{label}</button>)}</div>
        <div className="flex flex-wrap items-end gap-3">
            <label className="text-sm text-text-secondary">Month<input type="month" min="1900-01" max="2100-12" value={month} onChange={event => { if (/^\d{4}-\d{2}$/.test(event.target.value)) { setMonth(event.target.value); reset(); } }} className={`${field} mt-1 block`} /></label>
            <label className="text-sm text-text-secondary">Movie region<select value={region} onChange={event => { setRegion(event.target.value); reset(); }} className={`${field} mt-1 block`}>{countries.map(([code,label]) => <option key={code} value={code}>{label}</option>)}</select></label>
            <label className="text-sm text-text-secondary">Movie release type<select value={kind} onChange={event => { setKind(event.target.value); reset(); }} className={`${field} mt-1 block`}><option value="all">All types</option>{Object.entries(releaseTypes).map(([value,label]) => <option key={value} value={value}>{label}</option>)}</select></label>
            <button className={field} disabled={!releases.length || loading} onClick={() => downloadFile(calendarExport(releases), `themovie-${month}.ics`, 'text/calendar;charset=utf-8')}>Export loaded releases</button>
        </div>
        {countryError && <p role="status" className="text-sm text-text-muted">The full country list could not be loaded. Common regions are available. <button className="min-h-11 px-2 text-accent-primary" onClick={() => setRetry(value=>value+1)}>Retry</button></p>}
        <p className="rounded-xl border border-white/10 bg-white/5 p-4 text-sm text-text-muted">{personal ? 'Movies from your watchlist and announced episodes from saved or tracked shows. TV dates are original air dates, independent of your movie region. ' : 'Browse movies listed by TMDB, one page at a time. ' }Dates can change or be missing; this is not a complete worldwide or platform-specific streaming schedule. Digital releases may be rental or purchase. Exports contain loaded releases only and do not update automatically.</p>
        <div className="flex items-center justify-between gap-3"><button className={field} disabled={month === '1900-01'} onClick={() => { setMonth(shiftMonth(month,-1)); reset(); }} aria-label="Previous month">←</button><h2 className="text-lg font-bold text-white">{new Date(`${month}-01T12:00:00`).toLocaleDateString(undefined,{ month:'long', year:'numeric' })}</h2><button className={field} disabled={month === '2100-12'} onClick={() => { setMonth(shiftMonth(month,1)); reset(); }} aria-label="Next month">→</button></div>
        {loading ? <p role="status" className="text-text-secondary">Loading release dates…</p> : error ? <div role="alert" className="space-y-3 text-text-secondary"><p>{error}</p><button className={field} onClick={() => setRetry(value => value+1)}>Retry</button></div> : <>
            {!!result?.failed && <div role="status" className="flex flex-wrap items-center gap-3 text-sm text-text-secondary"><p>Some title dates could not be loaded. Results are incomplete.</p><button className={field} onClick={() => setRetry(value => value+1)}>Retry missing dates</button></div>}
            <div className="hidden md:block"><div className="grid grid-cols-7 text-center text-sm text-text-muted">{['Sun','Mon','Tue','Wed','Thu','Fri','Sat'].map(day => <span className="p-2" key={day}>{day}</span>)}</div><div className="grid grid-cols-7 gap-1">{Array.from({length:offset},(_,index) => <div key={`blank-${index}`} />)}{Array.from({length:days},(_,index) => {
                const date = `${month}-${String(index+1).padStart(2,'0')}`; const events = grouped.get(date) || [];
                return <button key={date} aria-label={`${date}, ${events.length} releases`} aria-pressed={selectedDay === date} onClick={() => setSelectedDay(selectedDay === date ? '' : date)} className={`min-h-24 rounded-lg border p-2 text-left ${selectedDay === date ? 'border-accent-primary bg-accent-primary/10' : 'border-white/10 bg-bg-card'} ${date === localToday() ? 'ring-1 ring-white/40' : ''}`}><span className="text-sm text-white">{index+1}</span>{events.length > 0 && <span className="mt-2 block text-xs text-accent-primary">{events.length} release{events.length === 1 ? '' : 's'}</span>}</button>;
            })}</div></div>
            <section aria-label="Release agenda" className="space-y-4">
                <div className="flex flex-wrap items-center gap-3"><h2 className="text-xl font-bold text-white">{selectedDay || 'This month'}</h2>{selectedDay && <button className={`${field} text-sm`} onClick={() => setSelectedDay('')}>Show whole month</button>}</div>
                {!(selectedDay ? grouped.get(selectedDay)?.length : releases.length) && <p className="rounded-xl bg-white/5 p-6 text-text-secondary">{personal ? 'No announced releases for this selection. Save movies or shows to your watchlist, or track a show’s episodes.' : 'No releases listed for this selection. Try another region, release type or month.'}</p>}
                {[...grouped].filter(([date]) => !selectedDay || selectedDay === date).map(([date, events]) => <div key={date}><h3 className="mb-2 text-sm font-bold text-text-secondary"><time dateTime={date}>{new Date(`${date}T12:00:00`).toLocaleDateString(undefined,{weekday:'short',month:'short',day:'numeric'})}</time></h3><ul className="space-y-2">{events.map(release => <li key={release.key} className="rounded-xl border border-white/10 bg-bg-card p-4"><Link href={`/${release.type}/${release.id}`} className="font-semibold text-white hover:text-accent-primary">{release.title}</Link><p className="mt-1 text-sm text-text-muted">{release.label}</p></li>)}</ul></div>)}
            </section>
            {!personal && (result?.pages || 1) > 1 && <div className="flex flex-wrap items-center justify-center gap-4"><button className={field} disabled={page <= 1} onClick={() => { setPage(value => value-1); setSelectedDay(''); }}>Previous page</button><p role="status" className="text-sm text-text-secondary">Page {page} of {result?.pages}</p><button className={field} disabled={page >= (result?.pages || 1)} onClick={() => { setPage(value => value+1); setSelectedDay(''); }}>Next page</button></div>}
        </>}
        <p className="text-xs text-text-muted">Release data supplied by TMDB. TheMovie is not endorsed or certified by TMDB.</p>
    </div></main>;
}
