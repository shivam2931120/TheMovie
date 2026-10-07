export type FeedbackReason = 'dislike' | 'seen' | 'later';
export type HiddenTitle = { id: number; type: 'movie' | 'tv'; title: string; reason: FeedbackReason; until?: string };
export type StreamingPreferences = { country: string; providers: number[]; mode: 'any' | 'prefer' | 'only' };
export type Preferences = { hideWatched: boolean; exploration: number; dismissed: HiddenTitle[]; streaming: StreamingPreferences; onboardingCompleted: boolean; hideSpoilers: boolean };
export const INITIAL_PREFERENCES: Preferences = { hideWatched: true, exploration: .2, dismissed: [], streaming: { country: 'US', providers: [], mode: 'prefer' }, onboardingCompleted: false, hideSpoilers: true };
export function normalizePreferences(value: unknown): Preferences {
    const input = value && typeof value === 'object' ? value as Partial<Preferences> : {};
    const dismissed: HiddenTitle[] = (Array.isArray(input.dismissed) ? input.dismissed : []).filter(item => item && Number.isSafeInteger(Number(item.id)) && Number(item.id)>0 && ['movie','tv'].includes(item.type)).map(item => ({id:Number(item.id),type:item.type,title:String(item.title || 'Title').slice(0,120),reason:['seen','later'].includes(item.reason)?item.reason:'dislike',until:item.reason==='later'&&typeof item.until==='string'&&Number.isFinite(Date.parse(item.until))?item.until:undefined}));
    const streaming=input.streaming;
    return { hideWatched: typeof input.hideWatched==='boolean'?input.hideWatched:true, exploration:Number.isFinite(input.exploration)?Math.max(0,Math.min(.5,input.exploration!)):.2,
        dismissed:[...new Map(dismissed.map(item=>[`${item.type}:${item.id}`,item])).values()],
        onboardingCompleted:input.onboardingCompleted===true, hideSpoilers:input.hideSpoilers!==false,
        streaming:{country:typeof streaming?.country==='string'&&/^[A-Z]{2}$/.test(streaming.country)?streaming.country:'US',providers:[...new Set((Array.isArray(streaming?.providers)?streaming.providers:[]).map(Number).filter(id=>Number.isSafeInteger(id)&&id>0))].slice(0,30),mode:streaming?.mode==='only'||streaming?.mode==='any'?streaming.mode:'prefer'} };
}
export const isHidden = (item:HiddenTitle, now=Date.now()) => item.reason!=='later'||!item.until||Date.parse(item.until)>now;
