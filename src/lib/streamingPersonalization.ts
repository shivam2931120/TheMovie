import { getWatchProviders } from '@/api/tmdb';
import type { StreamingPreferences } from './recommendationPreferences';
export function streamingDiscoverParams(preferences?:StreamingPreferences) {
    return preferences?.providers.length && preferences.mode!=='any' ? {watch_region:preferences.country,with_watch_providers:preferences.providers.join('|'),with_watch_monetization_types:'flatrate'} : {};
}
/** Availability is a separate serving preference, not evidence of liking a title. */
export async function applyStreamingPreferences(items:any[],type:'movie'|'tv',preferences?:StreamingPreferences,signal?:AbortSignal) {
    if(!preferences?.providers.length||preferences.mode==='any')return items;
    const checked=new Array<any>(items.length);
    let cursor=0;
    async function worker() {
        while(cursor<items.length&&!signal?.aborted) {
            const index=cursor++,item=items[index];
            let providers:any[]=[];
            try {const result=await getWatchProviders(item.id,type);providers=result?.results?.[preferences!.country]?.flatrate||[];}catch{/* Unknown availability is never presented as a match. */}
            const matches=providers.filter(provider=>preferences!.providers.includes(provider.provider_id));
            checked[index]={...item,streamingMatched:matches.length>0,streamingLabel:matches.length?`${matches.map(provider=>provider.provider_name).join(', ')} · ${preferences!.country}`:undefined};
        }
    }
    await Promise.all(Array.from({length:Math.min(4,items.length)},worker));
    if(signal?.aborted)return [];
    const available=checked.filter(item=>item?.streamingMatched);
    return preferences.mode==='only'?available:[...available,...checked.filter(item=>item&&!item.streamingMatched)];
}
