"use client";
import {useEffect,useState} from 'react';
import {useUser} from '@clerk/nextjs';
type Problem={feature:string;owner:string;status:string};
export function AccountStorageNotice(){
    const {user,isLoaded}=useUser();const [problems,setProblems]=useState<Record<string,Problem>>({});
    useEffect(()=>{
        const handle=(event:Event)=>{const value=(event as CustomEvent).detail as Problem;if(!value?.feature)return;setProblems(current=>({...current,[`${value.owner}:${value.feature}`]:value}));};
        window.addEventListener('themovie-sync-status',handle);return ()=>window.removeEventListener('themovie-sync-status',handle);
    },[]);
    const active=Object.values(problems).filter(p=>isLoaded && p.owner===(user?.id||'guest') && /unavailable|Conflict/.test(p.status));
    if(!active.length)return null;
    const unavailable=active.filter(p=>!p.status.startsWith('Conflict'));
    const conflicts=active.filter(p=>p.status.startsWith('Conflict'));
    const featureName=(feature:string)=>feature.replace(/([a-z])([A-Z])/g,'$1 $2').replace(/^./,letter=>letter.toUpperCase());
    return <aside role="status" aria-label="Account synchronization" className="fixed bottom-20 left-3 right-3 z-[70] mx-auto max-h-[40vh] max-w-xl overflow-y-auto rounded-xl border border-amber-400/30 bg-[#211b10] p-4 text-sm text-amber-100 shadow-2xl sm:bottom-6">
        {unavailable.length>0&&<div className="mb-2"><p>{unavailable.some(p=>p.status==='Device storage unavailable')?'Some changes could not be saved on this device.':'Account sync is unavailable. Retry when your connection is available.'}</p><p className="mt-1 text-xs">{unavailable.map(p=>featureName(p.feature)).join(', ')}</p>{user&&<button className="min-h-11 underline" onClick={()=>window.dispatchEvent(new Event('themovie-retry-sync'))}>Retry sync</button>}</div>}
        {conflicts.map(p=><div key={p.feature} className="mb-2"><p>{featureName(p.feature)}: {p.status}</p><div className="flex flex-wrap gap-3">{[['Use account copy',false],['Replace with this device',true]].map(([label,keepDevice])=><button key={String(label)} className="min-h-11 underline" onClick={()=>window.dispatchEvent(new CustomEvent('themovie-resolve-conflict',{detail:{feature:p.feature,owner:p.owner,keepDevice}}))}>{label}</button>)}</div></div>)}
    </aside>;
}
