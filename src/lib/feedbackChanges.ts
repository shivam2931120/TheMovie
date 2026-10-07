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
    if(feature==='recommendationPreferences') {
        // Only genuine dislikes train negative preferences. Legacy hides were dislikes.
        const disliked=(data:any)=>new Map((Array.isArray(data?.dismissed)?data.dismissed:[]).filter((item:any)=>item&&valid(item.id)&&(!item.reason||item.reason==='dislike')).map((item:any)=>[`${typeOf(item)}:${item.id}`,item]));
        const previous=disliked(before),current=disliked(after);
        for(const [key,item] of current) if(!previous.has(key)) events.push({id:Number((item as any).id),type:typeOf(item),kind:'dismiss',value:1});
        for(const [key,item] of previous) if(!current.has(key)) events.push({id:Number((item as any).id),type:typeOf(item),kind:'dismiss',value:0});
        return events;
    }
    const current = after;
    const previous = before;
    if (!Array.isArray(current)) return events;
    const old = new Map((Array.isArray(previous)?previous:[]).map((item:any)=>[feature==='watchDiary'?item.id:`${typeOf(item)}:${item.itemId||item.id}`,item]));
    if(feature==='ratings') {
        const rated=new Set(current.filter(Boolean).map((item:any)=>`${typeOf(item)}:${item.itemId||item.id}`));
        for(const item of Array.isArray(previous)?previous:[]) {
            const id=Number(item?.itemId||item?.id);
            if(item&&valid(id)&&!rated.has(`${typeOf(item)}:${id}`))events.push({id,type:typeOf(item),kind:'rating',value:0});
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
        else if(feature==='watchDiary' && !prior) events.push({id,type,kind:(item.rewatch??(Array.isArray(before)&&before.some((entry:any)=>entry?.item?.id===id&&typeOf(entry.item)===type)))?'rewatch':'watch'});
        else if(!prior && ['watched','watchlist'].includes(feature)) events.push({id,type,kind:feature==='watched'?'watch':'watchlist'});
        if(feature==='watchDiary' && Number(item.rating)>0 && item.rating!==prior?.rating) events.push({id,type,kind:'rating',value:Number(item.rating)});
    }
    return events;
}
