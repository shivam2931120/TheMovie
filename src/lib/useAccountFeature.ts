"use client";
import { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react';
import { useUser } from '@clerk/nextjs';
import { LEGACY_KEYS } from './accountFeatures';
import { nextFeatureTimestamp } from './featureSnapshot';
type Snapshot<T> = { version: 2; updatedAt: string; data: T; revision: number; pending: boolean; mutationId: string; guestImport?: string };
const key = (feature:string,owner:string)=>`themovie:${feature}:${owner}`;
function read(key:string) { try { return JSON.parse(localStorage.getItem(key)||'null'); } catch { return null; } }
function readText(key:string) {try{return localStorage.getItem(key)||'';}catch{return '';}}
function persist(key:string,value:unknown) { try { localStorage.setItem(key,JSON.stringify(value)); return true; } catch { return false; } }
function guestFingerprint(feature:string) {
    // Compare raw sources: normalizers may fill missing legacy timestamps.
    const sources=[read(key(feature,'guest')), ...(LEGACY_KEYS[feature]||[]).map(read)];
    if(feature==='profilePreferences') sources.push(readText('user_bio'),read('user_favorite_genres'));
    return JSON.stringify(sources);
}
export function useAccountFeature<T>(feature:string,initial:T,mergeGuest:(account:T,guest:T)=>T,normalize:(value:unknown)=>T) {
    const { user,isLoaded,isSignedIn }=useUser();
    const owner=isLoaded?(isSignedIn&&user?user.id:'guest'):'loading';
    const [state,setState]=useState<{owner:string;snapshot:Snapshot<T>;ready:boolean}>({owner:'loading',snapshot:{version:2,updatedAt:'',data:initial,revision:0,pending:false,mutationId:''},ready:false});
    const [status,setStatus]=useState('Loading');
    const [retry,setRetry]=useState(0);
    const userRef=useRef(user);
    const saving=useRef(false);
    const queuedEdits=useRef(new Map<string,Array<(current:T)=>T>>());
    const latestState=useRef(state);
    useLayoutEffect(()=>{latestState.current=state;},[state]);
    useEffect(()=>{ userRef.current=user; },[user]);
    useEffect(()=>{
        if(owner==='loading') return;
        let active=true;
        const accountEdits=queuedEdits.current;
        async function load() {
            const stored=read(key(feature,owner));
            const metadata:any=userRef.current?.unsafeMetadata?.[feature];
            let data=normalize(stored?.data ?? (metadata?.version===1?metadata.data:metadata) ?? initial);
            const legacyDirty=stored?.version===1 && Boolean(stored.updatedAt)
                && (metadata?.version!==1 || stored.updatedAt>metadata.updatedAt);
            let pending=stored?.pending===true || legacyDirty;
            let revision=stored?.revision || 0;
            let guestImport=typeof stored?.guestImport==='string'?stored.guestImport:undefined;
            let importedGuest=false;
            const guest=read(key(feature,'guest'));
            // Unscoped legacy keys only contain guest data after the migration.
            let guestData=normalize(guest?.data ?? initial);
            for(const legacy of LEGACY_KEYS[feature]||[]) {
                const value=read(legacy);
                if(value!==null) guestData=mergeGuest(guestData,normalize(value));
            }
            if(feature==='profilePreferences') guestData=mergeGuest(guestData,normalize({bio:readText('user_bio'),favoriteGenres:read('user_favorite_genres')||[]}));
            const guestContent=guestFingerprint(feature);
            if(owner==='guest') data=mergeGuest(data,guestData);
            let loadStatus=owner==='guest'?'Saved on this device':'Saved on this device · account sync unavailable';
            if(owner!=='guest') {
                try {
                    const response=await fetch(`/api/account/${feature}`,{cache:'no-store',headers:{'X-TheMovie-Account':owner}});
                    if(!response.ok) throw new Error('Storage unavailable');
                    const remote=await response.json();
                    if(!pending) { data=normalize(remote.data); revision=remote.revision; }
                    else if(!revision && remote.revision===1) revision=remote.revision;
                    else if(revision!==remote.revision) loadStatus='Conflict: newer changes exist on another device';
                    if(guestImport!==guestContent && JSON.stringify(guestData)!==JSON.stringify(normalize(initial))) {
                        data=mergeGuest(data,guestData); pending=true; guestImport=guestContent; importedGuest=true;
                    }
                    if(!loadStatus.startsWith('Conflict')) loadStatus=pending?'Saved on this device · syncing':'Synced to your account';
                } catch { /* Keep the owner's recovery snapshot. Never fall back to writing Clerk. */ }
            }
            if(!active) return;
            const edits=accountEdits.get(owner)||[];
            accountEdits.delete(owner);
            for(const apply of edits) data=normalize(apply(data));
            if(edits.length) {
                pending=owner!=='guest';
                if(pending && !loadStatus.startsWith('Conflict')) loadStatus='Saved on this device · syncing';
            }
            const changed=edits.length>0 || importedGuest;
            const snapshot:Snapshot<T>={version:2,data,revision,pending,guestImport,updatedAt:changed?nextFeatureTimestamp(stored?.updatedAt||'',Date.now()):stored?.updatedAt||'',mutationId:changed?crypto.randomUUID():stored?.mutationId||crypto.randomUUID()};
            const deviceSaved=persist(key(feature,owner),snapshot);
            if(!deviceSaved && (owner==='guest'||pending)) loadStatus='Device storage unavailable';
            if(deviceSaved && owner==='guest') for(const legacy of LEGACY_KEYS[feature]||[]) { try{localStorage.removeItem(legacy);}catch{} }
            setState({owner,snapshot,ready:true}); setStatus(loadStatus);
        }
        void load().catch(()=>{ if(active) setStatus('Device storage unavailable'); });
        return ()=>{active=false;accountEdits.delete(owner);};
    },[owner,feature,initial,mergeGuest,normalize]);
    useEffect(()=>{
        if(owner==='guest'||owner==='loading'||state.owner!==owner||!state.ready||!state.snapshot.pending) return;
        const timer=setTimeout(async()=>{
            if(saving.current||userRef.current?.id!==owner) return;
            saving.current=true;
            const submitted=state.snapshot;
            try {
                if(!submitted.revision) {
                    const response=await fetch(`/api/account/${feature}`,{cache:'no-store',headers:{'X-TheMovie-Account':owner}});
                    if(!response.ok) throw new Error('Storage unavailable');
                    const remote=await response.json();
                    if(remote.revision!==1) { setStatus('Conflict: newer changes exist on another device'); return; }
                    setState(current=>current.owner===owner?{...current,snapshot:{...current.snapshot,revision:remote.revision}}:current);
                    return;
                }
                const response=await fetch(`/api/account/${feature}`,{method:'PUT',headers:{'Content-Type':'application/json','X-TheMovie-Account':owner},body:JSON.stringify({data:submitted.data,revision:submitted.revision,mutationId:submitted.mutationId})});
                if(response.status===409) { if(userRef.current?.id===owner) setStatus('Conflict: newer changes exist on another device'); return; }
                if(!response.ok) throw new Error('Storage unavailable');
                const result=await response.json();
                setState(current=>{
                    if(current.owner!==owner) return current;
                    const unchanged=current.snapshot.mutationId===submitted.mutationId;
                    const snapshot={...current.snapshot,revision:result.revision,pending:!unchanged};
                    persist(key(feature,owner),snapshot);
                    if(unchanged) {
                        if(snapshot.guestImport) {
                            // Another tab may have edited guest data while this save was in flight.
                            if(guestFingerprint(feature)===snapshot.guestImport) {
                                try{localStorage.removeItem(key(feature,'guest')); for(const legacy of LEGACY_KEYS[feature]||[]) localStorage.removeItem(legacy); if(feature==='profilePreferences'){localStorage.removeItem('user_bio');localStorage.removeItem('user_favorite_genres');}}catch{}
                            }
                            // A future guest session must be eligible for import, even with identical data.
                            snapshot.guestImport=undefined;
                            persist(key(feature,owner),snapshot);
                        }
                        setStatus('Synced to your account');
                    }
                    return {...current,snapshot};
                });
            } catch { if(userRef.current?.id===owner) setStatus('Saved on this device · account sync unavailable'); }
            finally { saving.current=false; if(latestState.current.owner!==owner || latestState.current.snapshot.mutationId!==submitted.mutationId) setRetry(value=>value+1); }
        },700);
        return ()=>clearTimeout(timer);
    },[feature,owner,state,retry,initial,mergeGuest,normalize]);
    const update=useCallback((apply:(current:T)=>T)=>{
        if(owner==='loading') return;
        if(latestState.current.owner!==owner || !latestState.current.ready) {
            const edits=queuedEdits.current.get(owner)||[];
            edits.push(apply);queuedEdits.current.set(owner,edits);
            const stored=read(key(feature,owner));
            const metadata:any=userRef.current?.unsafeMetadata?.[feature];
            const base=normalize(stored?.data ?? (metadata?.version===1?metadata.data:metadata) ?? initial);
            // Keep a recovery draft even if the first database read is still outstanding.
            persist(key(feature,owner),{...stored,version:2,data:normalize(apply(base)),revision:stored?.revision||0,pending:owner!=='guest',updatedAt:nextFeatureTimestamp(stored?.updatedAt||'',Date.now()),mutationId:crypto.randomUUID()});
            return;
        }
        setState(current=>{
            if(current.owner!==owner||!current.ready) return current;
            const snapshot:Snapshot<T>={...current.snapshot,data:normalize(apply(current.snapshot.data)),pending:owner!=='guest',updatedAt:nextFeatureTimestamp(current.snapshot.updatedAt,Date.now()),mutationId:crypto.randomUUID()};
            const local=persist(key(feature,owner),snapshot);
            setStatus(local?(owner==='guest'?'Saved on this device':'Saved on this device · syncing'):'Device storage unavailable');
            return {...current,snapshot};
        });
    },[feature,initial,normalize,owner]);
    const resolveConflict=useCallback(async(keepDevice:boolean)=>{
        const captured=latestState.current.snapshot.mutationId;
        const response=await fetch(`/api/account/${feature}`,{cache:'no-store',headers:{'X-TheMovie-Account':owner}});
        if(!response.ok) {setStatus('Account sync unavailable'); return;}
        const remote=await response.json();
        setState(current=>{
            if(current.owner!==owner || current.snapshot.mutationId!==captured) return current;
            const snapshot={...current.snapshot,data:keepDevice?current.snapshot.data:normalize(remote.data),revision:remote.revision,pending:keepDevice,mutationId:crypto.randomUUID()};
            persist(key(feature,owner),snapshot);
            setStatus(keepDevice?'Saved on this device · syncing':'Synced to your account');
            return {...current,snapshot};
        });
    },[feature,normalize,owner]);
    useEffect(()=>{
        if(state.owner!==owner) return;
        window.dispatchEvent(new CustomEvent('themovie-sync-status',{detail:{feature,owner,status}}));
        const resolve=(event:Event)=>{const detail=(event as CustomEvent).detail;if(detail?.feature===feature&&detail?.owner===owner) void resolveConflict(Boolean(detail.keepDevice)).catch(()=>setStatus('Account sync unavailable'));};
        const retrySync=()=>{if(owner==='guest'||owner==='loading')return;if(latestState.current.snapshot.pending)setRetry(value=>value+1);else void resolveConflict(false).catch(()=>setStatus('Account sync unavailable'));};
        window.addEventListener('themovie-resolve-conflict',resolve);window.addEventListener('themovie-retry-sync',retrySync);window.addEventListener('online',retrySync);
        return ()=>{window.removeEventListener('themovie-resolve-conflict',resolve);window.removeEventListener('themovie-retry-sync',retrySync);window.removeEventListener('online',retrySync);};
    },[feature,owner,state.owner,status,resolveConflict]);
    return {data:state.owner===owner?state.snapshot.data:initial,update,loading:owner==='loading'||state.owner!==owner||!state.ready,status,owner,resolveConflict};
}
