"use client";
import { getMovieDetails,getMovieRecommendations,getMovieSummaries,getDiscoverMovies } from '@/api/tmdb';
import { rankRecommendations,type RecommendationProfile } from './recommendationRanker';
import { catalogEntry,MOVIE_GENRES } from './recommendationCatalog';
import type { NeighborGraph } from './recommendationGraph';
import { applyStreamingPreferences,streamingDiscoverParams } from './streamingPersonalization';

/** Fresh TMDB candidates and seed metadata extend the offline movie catalog. */
export async function personalizedMovies(profile:RecommendationProfile,signal?:AbortSignal,currentId?:number,query='') {
    const seeds=[...(profile.seeds||[])];
    if(currentId){
        const index=seeds.findIndex(seed=>seed.id===currentId);
        const existing=index>=0?seeds.splice(index,1)[0]:undefined;
        seeds.unshift({...existing,id:currentId,weight:Math.max(1.5,existing?.weight||0),source:existing?.source||'viewed'});
    }
    const context={...profile,seeds,exclude:[...(profile.exclude||[]),...(currentId?[currentId]:[])]};
    const retrieve=[...seeds.slice(0,4),...(profile.negatives||[]).slice(0,2)];
    const genreIds=(profile.favoriteGenres||[]).flatMap(name=>Object.entries(MOVIE_GENRES).filter(([,genre])=>genre===name).map(([id])=>id));
    const catalog=new Map<number,any>();
    const graph:NeighborGraph={};
    await Promise.allSettled([
        ...retrieve.map(async seed=>{
            const [item,recs]=await Promise.all([getMovieDetails(seed.id),getMovieRecommendations(seed.id)]);
            if(signal?.aborted)return;
            if(item?.id)catalog.set(item.id,{...item,type:'movie'});
            const candidates=(recs?.results||[]).filter((item:any)=>item?.id&&item.poster_path);
            graph[String(seed.id)]=candidates.map((item:any)=>item.id);
            for(const candidate of candidates)catalog.set(candidate.id,{...candidate,type:'movie'});
        }),
        (async()=>{
            const data=await getDiscoverMovies({sort_by:'popularity.desc','vote_count.gte':50,...(genreIds.length?{with_genres:genreIds.join('|')}:{}),...streamingDiscoverParams(profile.streaming)});
            if(!signal?.aborted)for(const item of data?.results||[])if(item?.poster_path)catalog.set(item.id,{...item,type:'movie'});
        })(),
    ]);
    if(signal?.aborted)return [];
    const ordered=[...new Map([...retrieve.map(seed=>catalog.get(seed.id)).filter(Boolean),...catalog.values()].map(item=>[item.id,item])).values()];
    const entries=ordered.slice(0,80).map(item=>catalogEntry(item,MOVIE_GENRES));
    let ranked;
    let model='tmdb-profile-v2';
    let requestId=crypto.randomUUID();
    try{
        const response=await fetch('/api/ai-recommend',{method:'POST',headers:{'Content-Type':'application/json'},signal,
            body:JSON.stringify({...context,query,catalog:entries,neighbors:graph})});
        if(!response.ok)throw new Error('Recommendation service unavailable');
        const data=await response.json();
        ranked=data.details;model=data.model;requestId=data.requestId;
    }catch(error){
        if(signal?.aborted)throw error;
        ranked=rankRecommendations(context,graph,entries,20);
    }
    if(signal?.aborted)return [];
    const missing=ranked.filter((entry:any)=>!catalog.has(entry.id)).map((entry:any)=>entry.id);
    const hydrated=await getMovieSummaries(missing,20);
    if(signal?.aborted)return [];
    for(const item of hydrated)catalog.set(item.id,{...item,type:'movie'});
    const items=ranked.map((entry:any)=>({...catalog.get(entry.id),recommendationReason:entry.reason,recommendationModel:model,recommendationRequestId:requestId}))
        .filter((item:any)=>item?.id&&item.poster_path&&(item.title||item.name));
    return applyStreamingPreferences(items,'movie',profile.streaming,signal);
}
