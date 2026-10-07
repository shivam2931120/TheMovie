"use client";

import { useEffect, useMemo, useState } from "react";
import { Check, ChevronRight, Loader2 } from "lucide-react";
import { getTVSeasonDetails } from "@/api/tmdb";
import { useTVWatchProgress } from "@/context/TVWatchProgressContext";
import { useRecommendationPreferences } from '@/context/RecommendationPreferencesContext';
import { useActionNotice } from './ActionNotice';

type Episode = { id: number; episode_number: number; season_number: number; name: string; air_date: string | null; overview?: string; runtime?: number };
type Season = { season_number: number; name: string; episode_count: number };
type Show = { id: number; name: string; number_of_episodes?: number; seasons?: Season[] };
const hasAired = (episode: Episode, today: string) => Boolean(episode.air_date && episode.air_date <= today);

export function EpisodeTracker({ show }: { show: Show }) {
    const { progress, status,isLoaded, isEpisodeWatched, markEpisodeWatched, unmarkEpisodeWatched, markSeasonWatched, clearSeason } = useTVWatchProgress();
    const {preferences,setPreferences,loading:preferencesLoading}=useRecommendationPreferences();
    const notify=useActionNotice();
    const [revealed,setRevealed]=useState<Record<string,boolean>>({});
    const seasonKey = (show.seasons || []).map(s => `${s.season_number}:${s.episode_count}`).join(",");
    const seasons = useMemo(() => (show.seasons || []).filter(s => s.episode_count > 0).sort((a, b) => a.season_number - b.season_number), [show.seasons]);
    const [selected, setSelected] = useState(seasons.find(s => s.season_number > 0)?.season_number ?? seasons[0]?.season_number ?? 1);
    const [episodesBySeason, setEpisodesBySeason] = useState<Record<number, Episode[]>>({});
    const [errors, setErrors] = useState<Record<number, boolean>>({});
    const [loading, setLoading] = useState(true);
    const [retry, setRetry] = useState(0);
    const [confirmClear, setConfirmClear] = useState(false);
    // Date-only TMDB air dates are compared in the user's local calendar.
    const now = new Date();
    const today = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")}`;

    useEffect(() => {
        let cancelled = false;
        setEpisodesBySeason({});
        setErrors({});
        setLoading(true);
        setSelected(seasons.find(s => s.season_number > 0)?.season_number ?? seasons[0]?.season_number ?? 1);
        setConfirmClear(false);
        setRevealed({});
        let cursor = 0;
        // Limit simultaneous requests even for shows with many seasons.
        async function worker() {
            while (cursor < seasons.length && !cancelled) {
                const season = seasons[cursor++];
                try {
                    const result = await getTVSeasonDetails(show.id, season.season_number);
                    if (!Array.isArray(result?.episodes)) throw new Error("Season unavailable");
                    if (!cancelled) setEpisodesBySeason(prev => ({ ...prev, [season.season_number]: result.episodes }));
                } catch {
                    if (!cancelled) setErrors(prev => ({ ...prev, [season.season_number]: true }));
                }
            }
        }
        Promise.all(Array.from({ length: Math.min(3, seasons.length) }, worker)).finally(() => { if (!cancelled) setLoading(false); });
        return () => { cancelled = true; };
        // Stable numeric season signature prevents refetching when unrelated show state changes.
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [show.id, seasonKey, retry]);

    const episodes = episodesBySeason[selected];
    const aired = episodes?.filter(e => hasAired(e, today)) || [];
    const watched = episodes?.filter(e => isEpisodeWatched(show.id, selected, e.episode_number)).length || 0;
    const regularSeasons = seasons.filter(s => s.season_number > 0);
    const total = regularSeasons.reduce((count, s) => count + s.episode_count, 0);
    const showWatched = regularSeasons.reduce((count, s) => count + (episodesBySeason[s.season_number]?episodesBySeason[s.season_number].filter(e=>isEpisodeWatched(show.id,s.season_number,e.episode_number)).length:Object.values(progress[show.id]?.[s.season_number] || {}).filter(Boolean).length), 0);
    const nextEpisode = !loading && regularSeasons.every(s => episodesBySeason[s.season_number])
        ? regularSeasons.flatMap(s => episodesBySeason[s.season_number]).find(e => hasAired(e, today) && !isEpisodeWatched(show.id, e.season_number, e.episode_number)) : undefined;
    const percent = total ? Math.min(100, Math.round(showWatched / total * 100)) : 0;
    const complete=!loading&&regularSeasons.every(season=>episodesBySeason[season.season_number]);
    const allEpisodes=regularSeasons.flatMap(season=>episodesBySeason[season.season_number]||[]);
    const upcoming=allEpisodes.find(episode=>episode.air_date&&episode.air_date>today);
    const unknownDates=allEpisodes.some(episode=>!episode.air_date);

    if (!seasons.length) return null;
    return (
        <section aria-labelledby="episode-tracker-heading" className="rounded-3xl border border-white/10 bg-bg-surface/50 p-5 sm:p-6 space-y-5">
            <div className="flex flex-wrap items-center justify-between gap-3">
                <div><h2 id="episode-tracker-heading" className="text-2xl font-display font-bold text-white">Episode tracking</h2><p className="text-sm text-text-secondary mt-1">{Math.min(showWatched, total)} of {total} episodes watched · {percent}% complete</p></div>
                <label className="text-sm text-text-secondary">Season <select aria-label="Choose season" value={selected} onChange={e => { setSelected(Number(e.target.value)); setConfirmClear(false); }} className="ml-2 rounded-lg border border-white/10 bg-bg-surface text-white p-2">{seasons.map(s => <option key={s.season_number} value={s.season_number}>{s.name || `Season ${s.season_number}`}</option>)}</select></label>
            </div>
            <div role="progressbar" aria-label="Show completion" aria-valuenow={percent} aria-valuemin={0} aria-valuemax={100} className="h-2 bg-white/10 rounded-full overflow-hidden"><div className="h-full bg-accent-surface transition-all" style={{ width: `${percent}%` }} /></div>
            <label className="flex min-h-11 items-center gap-3 text-sm text-white"><input type="checkbox" disabled={preferencesLoading} checked={preferences.hideSpoilers} onChange={event=>setPreferences({hideSpoilers:event.target.checked})}/>Hide titles and summaries for unwatched episodes</label>
            {nextEpisode && <div className="flex flex-wrap items-center gap-3"><button onClick={() => { setSelected(nextEpisode.season_number); setConfirmClear(false); }} className="flex min-h-11 items-center gap-2 text-sm text-accent-primary text-left">Next unwatched: S{nextEpisode.season_number} E{nextEpisode.episode_number}{!preferences.hideSpoilers&&` · ${nextEpisode.name}`}<ChevronRight size={16} /></button><button disabled={!isLoaded} className="min-h-11 rounded-lg bg-white/10 px-3 text-sm text-white disabled:opacity-40" onClick={()=>{markEpisodeWatched(show.id,nextEpisode.season_number,nextEpisode.episode_number);notify(`S${nextEpisode.season_number} E${nextEpisode.episode_number} marked watched`,()=>unmarkEpisodeWatched(show.id,nextEpisode.season_number,nextEpisode.episode_number));}}>Mark next episode watched</button></div>}
            {complete && !nextEpisode && !Object.keys(errors).length && <p className="text-sm text-text-secondary">You’re caught up with all known aired episodes.{upcoming?` Next scheduled: S${upcoming.season_number} E${upcoming.episode_number} on ${upcoming.air_date}.`:unknownDates?' Some episode dates are unavailable.':' No further air date is listed.'}</p>}
            {Object.keys(errors).length > 0 && <div role="alert" className="text-sm text-amber-300">Some seasons could not be loaded. <button onClick={() => setRetry(n => n + 1)} className="underline">Retry loading seasons</button></div>}
            {!episodes && !errors[selected] && <p role="status" className="flex items-center gap-2 text-text-secondary"><Loader2 size={18} className="animate-spin" /> Loading episodes…</p>}
            {episodes && <>
                <div className="flex flex-wrap gap-3 items-center text-sm">
                    <span className="text-text-secondary">{watched} / {episodes.length} watched this season</span>
                    <button disabled={!isLoaded || !aired.length || aired.every(e => isEpisodeWatched(show.id, selected, e.episode_number))} onClick={() => markSeasonWatched(show.id, selected, aired.map(e => e.episode_number))} className="rounded-lg border border-white/15 px-3 py-2 text-white disabled:opacity-40">Mark aired episodes watched</button>
                    <button disabled={!isLoaded || !watched} onClick={() => setConfirmClear(true)} className="rounded-lg border border-white/15 px-3 py-2 text-white disabled:opacity-40">Clear season</button>
                </div>
                {confirmClear && <div className="flex flex-wrap items-center gap-3 text-sm text-text-secondary" role="alert">Clear this season’s watch progress?<button onClick={() => { clearSeason(show.id, selected); setConfirmClear(false); }} className="text-red-300 underline">Clear progress</button><button onClick={() => setConfirmClear(false)} className="text-white underline">Cancel</button></div>}
                <ul className="max-h-[520px] overflow-y-auto divide-y divide-white/5">{episodes.map(e => {
                    const seen = isEpisodeWatched(show.id, selected, e.episode_number);
                    const airedEpisode = hasAired(e, today);
                    const revealKey=`${selected}:${e.episode_number}`;
                    const spoilerHidden=preferences.hideSpoilers&&!seen&&!revealed[revealKey];
                    return <li key={e.id || e.episode_number} className="flex gap-3 py-4">
                        <button aria-label={`${seen ? "Mark unwatched" : "Mark watched"}: episode ${e.episode_number}${!spoilerHidden?`, ${e.name}`:''}`} aria-pressed={seen} disabled={!isLoaded || (!seen && !airedEpisode)} onClick={() => seen ? unmarkEpisodeWatched(show.id, selected, e.episode_number) : markEpisodeWatched(show.id, selected, e.episode_number)} className={`shrink-0 w-11 h-11 rounded-full border flex items-center justify-center disabled:opacity-35 ${seen ? "bg-accent-surface text-black border-accent-primary" : "border-white/20 text-text-muted"}`}>{seen ? <Check size={18} /> : e.episode_number}</button>
                        <div><p className="text-white font-medium">{e.episode_number}. {spoilerHidden?'Episode title hidden':e.name}</p><p className="text-xs text-text-muted mt-1">{e.air_date || "Air date unavailable"}{e.runtime ? ` · ${e.runtime} min` : ""}{e.air_date&&!airedEpisode ? " · Not aired" : ""}</p>{spoilerHidden?<button className="min-h-11 text-xs text-accent-primary" onClick={()=>setRevealed(current=>({...current,[revealKey]:true}))}>Reveal episode details</button>:e.overview&&<p className="text-sm text-text-secondary mt-2 line-clamp-2">{e.overview}</p>}</div>
                    </li>;
                })}</ul>
            </>}
            <p className="text-xs text-text-muted">Progress is saved automatically. Specials are tracked separately from overall completion.</p>
            <p role="status" className="text-xs text-text-muted">{status}</p>
        </section>
    );
}
