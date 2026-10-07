import { getTVSeasonDetails } from '@/api/tmdb';
import { localToday } from './diary';
/** Earliest aired, unwatched regular episode. A failed season never means caught up. */
export async function nextUnwatchedEpisode(show:any,progress:Record<string,Record<string,boolean>>,today=localToday()) {
    const seasons=(show.seasons||[]).filter((season:any)=>season.season_number>0&&season.episode_count>0).sort((a:any,b:any)=>a.season_number-b.season_number);
    for(const season of seasons) {
        const data=await getTVSeasonDetails(show.id,season.season_number);
        if(!Array.isArray(data?.episodes))throw new Error('Episode data unavailable');
        const episode=[...data.episodes].sort((a:any,b:any)=>a.episode_number-b.episode_number).find((episode:any)=>episode.air_date&&episode.air_date<=today&&!progress?.[season.season_number]?.[episode.episode_number]);
        if(episode)return episode;
    }
    return null;
}
