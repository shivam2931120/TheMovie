import type { CatalogEntry } from './recommendationRanker';

export const MOVIE_GENRES: Record<number,string> = {28:'Action',12:'Adventure',16:'Animation',35:'Comedy',80:'Crime',99:'Documentary',18:'Drama',10751:'Family',14:'Fantasy',36:'History',27:'Horror',10402:'Music',9648:'Mystery',10749:'Romance',878:'Sci-Fi',10770:'TV Movie',53:'Thriller',10752:'War',37:'Western'};

export function catalogEntry(item: any, genres: Record<number,string>): CatalogEntry {
    const votes=Number.isFinite(Number(item.vote_count))?Math.max(0,Number(item.vote_count)):0;
    const rating=Number.isFinite(Number(item.vote_average))?Math.max(0,Math.min(10,Number(item.vote_average))):6.5;
    return {id:Number(item.id),title:String(item.title||item.name||'Title').slice(0,120),
        genres:[...new Set<string>((item.genre_ids||item.genres?.map((genre:any)=>genre.id)||[]).map((id:number)=>genres[id]).filter(Boolean))],
        // Smooth scant ratings toward the same prior instead of trusting one perfect vote.
        quality:(votes*rating+50*6.5)/(votes+50)/10,votes};
}

export function sanitizeCatalog(value: unknown): CatalogEntry[] {
    if(!Array.isArray(value))return [];
    return value.slice(0,80).filter(entry=>entry&&Number.isSafeInteger(entry.id)&&entry.id>0&&typeof entry.title==='string')
        .map(entry=>({id:entry.id,title:entry.title.slice(0,120),genres:Array.isArray(entry.genres)?entry.genres.filter((genre:unknown)=>typeof genre==='string').slice(0,10).map((genre:string)=>genre.slice(0,40)):[],
            quality:Number.isFinite(entry.quality)?Math.max(0,Math.min(1,entry.quality)):0,
            votes:Number.isFinite(entry.votes)?Math.max(0,Math.min(10000000,entry.votes)):0}));
}
