"use client";
import { createContext,useCallback,useContext,useEffect,useMemo,useRef } from 'react';
import { useAccountFeature } from '@/lib/useAccountFeature';
const INITIAL={enabled:false};
const normalize=(value:any)=>({enabled:value?.enabled===true});
const merge=(a:typeof INITIAL)=>a; // Guest browsing never grants account consent.
type Event={id:number;type:'movie'|'tv';kind:'impression'|'click';source?:string;model?:string;requestId?:string};
type QueuedEvent=Event&{eventId:string};
const Context=createContext<{enabled:boolean;loading:boolean;status:string;owner:string;setEnabled:(enabled:boolean)=>void;record:(event:Event)=>void}|null>(null);
export function FeedbackProvider({children}:{children:React.ReactNode}) {
    const {data,update,loading,status,owner}=useAccountFeature('feedbackConsent',INITIAL,merge,normalize);
    const queue=useRef<QueuedEvent[]>([]);
    const seen=useRef(new Set<string>());
    const timer=useRef<ReturnType<typeof setTimeout>|undefined>(undefined);
    const ready=data.enabled&&!loading&&status==='Synced to your account'&&owner!=='guest'&&owner!=='loading';
    const flush=useCallback(()=>{
        clearTimeout(timer.current);
        const events=queue.current.splice(0,50);
        if(!ready||!events.length)return;
        // No durable telemetry queue: consent revocation must not replay old events.
        void fetch('/api/feedback',{method:'POST',headers:{'Content-Type':'application/json','X-TheMovie-Account':owner},body:JSON.stringify({events}),keepalive:true}).catch(()=>{});
    },[ready,owner]);
    useEffect(()=>{
        const tracked=seen.current;
        queue.current=[];tracked.clear();
        const hide=()=>flush();
        window.addEventListener('pagehide',hide);
        return ()=>{clearTimeout(timer.current);queue.current=[];tracked.clear();window.removeEventListener('pagehide',hide);};
    },[owner,ready,flush]);
    const record=useCallback((event:Event)=>{
        if(!ready)return;
        const key=[event.requestId||event.model||'session',event.source,event.type,event.id,event.kind].join(':');
        if(seen.current.has(key))return;
        seen.current.add(key);
        if(seen.current.size>2000)seen.current.delete(seen.current.values().next().value!);
        queue.current.push({...event,eventId:crypto.randomUUID()});
        if(queue.current.length>=50)flush();
        else {clearTimeout(timer.current);timer.current=setTimeout(flush,250);}
    },[ready,flush]);
    const setEnabled=useCallback((enabled:boolean)=>update(()=>({enabled})),[update]);
    const value=useMemo(()=>({enabled:data.enabled,loading,status,owner,setEnabled,record}),[data.enabled,loading,status,owner,setEnabled,record]);
    return <Context.Provider value={value}>{children}</Context.Provider>;
}
export function useFeedback(){const value=useContext(Context);if(!value)throw new Error('Feedback provider missing');return value;}
