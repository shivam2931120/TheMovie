"use client";
import {getTVRecommendations,getDiscoverTV,getTVDetails} from '@/api/tmdb';
import {rankRecommendations,type RecommendationProfile} from './recommendationRanker';
import learned from '@/data/feedback-recommendations.json';
import {blendGraphs,neighborValues,type NeighborGraph} from './recommendationGraph';
import {catalogEntry} from './recommendationCatalog';
const GENRES:Record<number,string>={10759:'Action',16:'Animation',35:'Comedy',80:'Crime',99:'Documentary',18:'Drama',10751:'Family',10762:'Kids',9648:'Mystery',10763:'News',10764:'Reality',10765:'Sci-Fi',10766:'Soap',10767:'Talk',10768:'War'};
const IDS=Object.fromEntries(Object.entries(GENRES).map(([id,name])=>[name,Number(id)]));
/** Candidate retrieval from TMDB, then weighted taste/negative/MMR ranking. No MovieLens movie IDs. */
export async function personalizedTV(profile:RecommendationProfile,signal?:AbortSignal,currentId?:number) {
    const seeds=[...(profile.seeds||[])];
    if(currentId){
        const index=seeds.findIndex(seed=>seed.id===currentId);
        const existing=index>=0?seeds.splice(index,1)[0]:undefined;
        seeds.unshift({...existing,id:currentId,weight:Math.max(1.5,existing?.weight||0),source:existing?.source||'viewed'});
    }
    const genres=(profile.favoriteGenres||[]).map(name=>IDS[name]).filter(Boolean);
    const catalog=new Map<number,any>();
    const liveGraph:NeighborGraph={};
    const jobs=[...seeds.slice(0,5),...(profile.negatives||[]).slice(0,2)].map(async seed=>{
        const [details,recs]=await Promise.all([getTVDetails(seed.id),getTVRecommendations(seed.id)]);
        if(signal?.aborted)return;
        if(details?.id)catalog.set(details.id,{...details,type:'tv',genre_ids:(details.genres||[]).map((g:any)=>g.id)});
        for(const item of recs?.results||[])catalog.set(item.id,{...item,type:'tv'});
        liveGraph[String(seed.id)]=(recs?.results||[]).map((item:any)=>item.id);
    });
    jobs.push((async()=>{const data=await getDiscoverTV({sort_by:'popularity.desc',...(genres.length?{with_genres:genres.join('|')}:{})});if(!signal?.aborted)for(const item of data?.results||[])catalog.set(item.id,{...item,type:'tv'});})());
    await Promise.allSettled(jobs);
    if(signal?.aborted)return [];
    const graph=blendGraphs({graph:learned.tv as NeighborGraph,weight:1},{graph:liveGraph,weight:0.65});
    // Enrich a bounded set of model candidates absent from TMDB's similar-title lists.
    const missing=[...new Set(seeds.slice(0,5).flatMap(seed=>neighborValues(graph[String(seed.id)]).slice(0,8).map(edge=>edge.id)))].filter(id=>!catalog.has(id)).slice(0,12);
    for(let offset=0;offset<missing.length&&!signal?.aborted;offset+=3)await Promise.allSettled(missing.slice(offset,offset+3).map(async id=>{const item=await getTVDetails(id);if(item?.id&&!signal?.aborted)catalog.set(id,{...item,type:'tv',genre_ids:(item.genres||[]).map((g:any)=>g.id)});}));
    const entries=[...catalog.values()].map(item=>catalogEntry(item,GENRES));
    // Do not spend result slots on model IDs outside the bounded hydrated catalog.
    const eligibleGraph=Object.fromEntries(Object.entries(graph).map(([id,edges])=>[id,neighborValues(edges).filter(edge=>catalog.has(edge.id))]));
    const ranked=rankRecommendations({...profile,seeds,exclude:[...(profile.exclude||[]),...(currentId?[currentId]:[])]},eligibleGraph,entries,20);
    const requestId=crypto.randomUUID();
    return ranked.map(result=>({...catalog.get(result.id),recommendationReason:result.reason,recommendationModel:"tv-profile-v2",recommendationRequestId:requestId})).filter(item=>item?.id&&item.poster_path);
}
