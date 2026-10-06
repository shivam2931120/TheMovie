export type FeedbackChange = { id: number; type: 'movie'|'tv'; kind: 'rating'|'watch'|'rewatch'|'watchlist'|'dismiss'|'episode'; value?: number };
const typeOf = (item: any): 'movie'|'tv' => item?.type === 'tv' || (!item?.type && item?.name && !item?.title) ? 'tv' : 'movie';
const valid = (id: unknown) => Number.isSafeInteger(Number(id)) && Number(id)>0;
/** No diary notes or profile text enter learning events. Removed items are not dislikes. */
export function feedbackChanges(feature: string, before: any, after: any): FeedbackChange[] {
    const events: FeedbackChange[] = [];
    if (feature === 'tvProgress') {
        for (const [id,seasons] of Object.entries(after || {})) {
            if (!valid(id)) continue;
            let added=0;
            for (const [season,episodes] of Object.entries(seasons as any || {})) for (const [episode,seen] of Object.entries(episodes as any || {})) if (seen && !before?.[id]?.[season]?.[episode]) added++;
            if(added) events.push({id:Number(id),type:'tv',kind:'episode',value:added});
        }
        return events;
    }
    const current = feature === 'recommendationPreferences' ? after?.dismissed : after;
    const previous = feature === 'recommendationPreferences' ? before?.dismissed : before;
    if (!Array.isArray(current)) return events;
    const old = new Map((Array.isArray(previous)?previous:[]).map((item:any)=>[feature==='watchDiary'?item.id:`${typeOf(item)}:${item.itemId||item.id}`,item]));
    if(feature==='ratings') {
        const rated=new Set(current.filter(Boolean).map((item:any)=>`${typeOf(item)}:${item.itemId||item.id}`));
        for(const item of Array.isArray(previous)?previous:[]) {
            const id=Number(item?.itemId||item?.id);
            if(item&&valid(id)&&!rated.has(`${typeOf(item)}:${id}`))events.push({id,type:typeOf(item),kind:'rating',value:0});
        }
    }
    if(feature==='recommendationPreferences') {
        const hidden=new Set(current.filter(Boolean).map((item:any)=>`${typeOf(item)}:${item.id}`));
        for(const item of Array.isArray(previous)?previous:[]) {
            if(item&&valid(item.id)&&!hidden.has(`${typeOf(item)}:${item.id}`))events.push({id:Number(item.id),type:typeOf(item),kind:'dismiss',value:0});
        }
    }
    for(const item of current) {
        if(!item) continue;
        const media = feature === 'watchDiary' ? item.item : item;
        const id=Number(item.itemId||media?.id);
        if(!valid(id)) continue;
        const type=typeOf(media);
        const prior:any=old.get(feature==='watchDiary'?item.id:`${type}:${id}`);
        if(feature==='ratings' && Number(item.rating)>0 && item.rating!==prior?.rating) events.push({id,type,kind:'rating',value:Math.max(0,Math.min(10,Number(item.rating)))});
        else if(feature==='watchDiary' && !prior) events.push({id,type,kind:(Array.isArray(before)&&before.some((entry:any)=>entry?.item?.id===id&&typeOf(entry.item)===type))?'rewatch':'watch'});
        else if(!prior && ['watched','watchlist','recommendationPreferences'].includes(feature)) events.push({id,type,kind:feature==='watched'?'watch':feature==='watchlist'?'watchlist':'dismiss'});
        if(feature==='watchDiary' && Number(item.rating)>0 && item.rating!==prior?.rating) events.push({id,type,kind:'rating',value:Number(item.rating)});
    }
    return events;
}
