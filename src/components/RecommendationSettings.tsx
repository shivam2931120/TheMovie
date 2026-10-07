"use client";

import { useId } from 'react';
import { ChevronDown,SlidersHorizontal } from 'lucide-react';
import { FeedbackSettings } from './FeedbackSettings';
import { useRecommendationPreferences } from '@/context/RecommendationPreferencesContext';
import Link from 'next/link';
import { StreamingSettings } from './StreamingSettings';

export function RecommendationSettings() {
    const { preferences, setPreferences, restore, loading, status } = useRecommendationPreferences();
    const varietyId=useId();
    const variety=preferences.exploration<0.15?'Familiar':preferences.exploration<0.35?'Balanced':'Adventurous';
    return (
        <section aria-label="Recommendation preferences" className="rounded-xl border border-white/10 bg-bg-card">
            <details className="group/preferences">
                <summary className="flex cursor-pointer flex-wrap items-center justify-between gap-3 p-4 sm:p-5">
                    <span className="flex items-center gap-2 font-semibold text-white"><SlidersHorizontal size={18} aria-hidden="true"/>Shape your recommendations</span>
                    <span className="flex items-center gap-3 text-xs text-text-secondary">{variety} · {preferences.hideWatched?'Watched titles hidden':'Watched titles allowed'}<ChevronDown size={16} aria-hidden="true" className="transition-transform group-open/preferences:rotate-180"/></span>
                </summary>
                <div className="border-t border-white/10 p-4 sm:p-5">
                    <p className="text-sm text-text-secondary">Rate what you watch and keep a diary to refine your picks. Choose a familiar mix or explore more genres.</p>
                    <Link href="/taste" className="inline-flex min-h-11 items-center text-sm text-accent-primary">{preferences.onboardingCompleted?'Update your taste profile':'Set up your taste profile'} →</Link>
                    <div className="mt-4 grid gap-5 sm:grid-cols-2">
                        <label className="flex min-h-11 items-center gap-3 text-sm text-white"><input type="checkbox" checked={preferences.hideWatched} disabled={loading} onChange={event=>setPreferences({hideWatched:event.target.checked})}/>Hide watched titles</label>
                        <div>
                            <label htmlFor={varietyId} className="flex justify-between text-sm text-white"><span>Variety</span><span>{variety}</span></label>
                            <input id={varietyId} className="mt-2 min-h-11 w-full accent-accent-primary" type="range" min="0" max="100" step="10" value={Math.round(preferences.exploration*200)} disabled={loading} aria-valuetext={variety} onChange={event=>setPreferences({exploration:Number(event.target.value)/200})}/>
                            <div className="flex justify-between text-xs text-text-muted"><span>Familiar</span><span>Explore</span></div>
                        </div>
                    </div>
                    <p role="status" className="mt-2 text-xs text-text-muted">{status}</p>
                    {preferences.dismissed.length>0&&<details className="mt-4 text-sm text-text-secondary">
                        <summary className="min-h-11 cursor-pointer">Hidden titles ({preferences.dismissed.length})</summary>
                        <ul className="mt-2 max-h-64 space-y-2 overflow-y-auto">{preferences.dismissed.map(item=><li key={`${item.type}:${item.id}`} className="flex items-center justify-between gap-4"><span>{item.title} · {item.type==='tv'?'TV':'Movie'} · {item.reason==='seen'?'Already watched':item.reason==='later'?`Snoozed until ${item.until?.slice(0,10)||'restored'}`:'Not my taste'}</span><button type="button" disabled={loading} onClick={()=>restore(item.id,item.type)} className="min-h-11 shrink-0 text-accent-primary" aria-label={`Restore ${item.title}`}>Restore</button></li>)}</ul>
                        <button type="button" disabled={loading} onClick={()=>setPreferences({dismissed:[]})} className="mt-2 min-h-11 text-accent-primary">Restore all titles</button>
                    </details>}
                    <StreamingSettings/>
                    <FeedbackSettings/>
                </div>
            </details>
        </section>
    );
}
