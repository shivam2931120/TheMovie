"use client";
import { useEffect,useState } from 'react';
import { getMovieWatchProviderList,getTVWatchProviderList,getWatchProviderRegions } from '@/api/tmdb';
import { useRecommendationPreferences } from '@/context/RecommendationPreferencesContext';
export function StreamingSettings() {
    const {preferences,setPreferences,loading}=useRecommendationPreferences();
    const {streaming}=preferences;
    const [regions,setRegions]=useState<any[]>([]),[providers,setProviders]=useState<any[]>([]);
    const [busy,setBusy]=useState(true),[error,setError]=useState(false),[retry,setRetry]=useState(0),[query,setQuery]=useState('');
    useEffect(()=>{let active=true;setBusy(true);setError(false);setProviders([]);
        Promise.all([getWatchProviderRegions(),getMovieWatchProviderList(streaming.country),getTVWatchProviderList(streaming.country)]).then(([countries,movies,tv])=>{
            if(!active)return;
            if(!countries?.results?.length||(!movies?.results?.length&&!tv?.results?.length)){setError(true);return;}
            setRegions(countries.results);
            setProviders([...new Map([...(movies.results||[]),...(tv.results||[])].map(item=>[item.provider_id,item])).values()].sort((a:any,b:any)=>a.provider_name.localeCompare(b.provider_name)));
        }).catch(()=>{if(active)setError(true);}).finally(()=>{if(active)setBusy(false);});
        return()=>{active=false;};
    },[streaming.country,retry]);
    const field='min-h-11 w-full rounded-lg border border-white/15 bg-bg-card px-3 text-white';
    return <section aria-label="Streaming preferences" className="mt-5 space-y-3 border-t border-white/10 pt-5">
        <h3 className="font-semibold text-white">Your streaming services</h3><p className="text-sm text-text-secondary">Personalized movie and TV picks can prioritize your subscriptions. Availability is supplied by JustWatch through TMDB and may change.</p>
        <div className="grid gap-3 sm:grid-cols-2"><label className="text-sm text-text-secondary">Country<select className={field} value={streaming.country} disabled={loading} onChange={event=>{setQuery('');setPreferences({streaming:{...streaming,country:event.target.value,providers:[]}});}}>{!regions.some(region=>region.iso_3166_1===streaming.country)&&<option value={streaming.country}>{streaming.country}</option>}{regions.map(region=><option key={region.iso_3166_1} value={region.iso_3166_1}>{region.english_name}</option>)}</select></label><label className="text-sm text-text-secondary">Recommendation availability<select className={field} value={streaming.mode} disabled={loading} onChange={event=>setPreferences({streaming:{...streaming,mode:event.target.value as 'any'|'prefer'|'only'}})}><option value="prefer">Prefer my services</option><option value="only">Only my services</option><option value="any">All services</option></select></label></div>
        <input className={field} aria-label="Find a streaming service" placeholder="Find Netflix, Prime Video…" value={query} onChange={event=>setQuery(event.target.value)}/>
        {busy?<p role="status" className="text-sm text-text-muted">Loading services…</p>:error?<p role="alert" className="text-sm text-amber-300">Services could not be loaded. <button className="min-h-11 underline" onClick={()=>setRetry(value=>value+1)}>Retry</button></p>:<div className="grid max-h-64 gap-2 overflow-y-auto sm:grid-cols-2">{providers.filter(provider=>provider.provider_name.toLowerCase().includes(query.toLowerCase())).map(provider=><label key={provider.provider_id} className="flex min-h-11 items-center gap-3 rounded-lg bg-white/5 px-3 text-sm text-white"><input type="checkbox" disabled={loading||(!streaming.providers.includes(provider.provider_id)&&streaming.providers.length>=30)} checked={streaming.providers.includes(provider.provider_id)} onChange={event=>setPreferences({streaming:{...streaming,providers:event.target.checked?[...streaming.providers,provider.provider_id]:streaming.providers.filter(id=>id!==provider.provider_id)}})}/>{provider.provider_name}</label>)}</div>}
        <p className="text-xs text-text-muted">{streaming.providers.length} services selected. Choose at least one to apply availability preferences. Changing country clears the selection. Rentals and purchases are excluded from subscription matches.</p>
        {!!streaming.providers.length&&<button className="min-h-11 text-sm text-accent-primary" onClick={()=>setPreferences({streaming:{...streaming,providers:[]}})}>Clear selected services</button>}
    </section>;
}
