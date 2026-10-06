"use client";
import { useState } from 'react';
import { useFeedback } from '@/context/FeedbackContext';
export function FeedbackSettings(){
    const {owner}=useFeedback();
    return <FeedbackSettingsForAccount key={owner}/>;
}
function FeedbackSettingsForAccount(){
    const {enabled,setEnabled,loading,status,owner}=useFeedback();
    const [confirm,setConfirm]=useState(false);const [message,setMessage]=useState('');const [busy,setBusy]=useState(false);
    async function erase(){setBusy(true);try{const response=await fetch('/api/feedback',{method:'DELETE',headers:{'X-TheMovie-Account':owner}});if(!response.ok)throw new Error();setConfirm(false);setMessage('Learning history deleted.');}catch{setMessage('Could not delete learning history. Please retry.');}finally{setBusy(false);}}
    return <div className="mt-5 border-t border-white/10 pt-4 text-sm text-text-secondary">
        <label className="flex items-start gap-3"><input className="mt-1" type="checkbox" checked={enabled} disabled={loading||owner==='guest'} onChange={e=>setEnabled(e.target.checked)}/><span>Help improve movie and TV recommendations<p className="mt-1 text-xs">Opt in to store recommendation impressions, clicks, ratings, watches, dismissals, and episode activity for shared-model training. Diary notes and profile text are excluded. Turning this off deletes your collected learning history. Personal taste settings work without this consent.</p></span></label>
        <p role="status" className="mt-2 text-xs">{owner==='guest'?'Sign in to manage learning consent.':status} {message}</p>
        {owner!=='guest'&&owner!=='loading'&&<button disabled={loading||busy} className="mt-2 min-h-11 text-accent-primary" onClick={()=>setConfirm(true)}>Delete learning history</button>}
        {confirm&&<div role="alert" className="flex flex-wrap gap-4 items-center"><span>Delete your collected learning events?</span><button disabled={busy} className="min-h-11 text-red-300" onClick={()=>void erase()}>Delete events</button><button className="min-h-11" onClick={()=>setConfirm(false)}>Cancel</button></div>}
    </div>;
}
