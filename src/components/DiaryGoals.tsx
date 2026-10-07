"use client";
import { useState } from 'react';
import { useGoals } from '@/context/GoalsContext';
import { useDiary } from '@/context/DiaryContext';
import { localToday } from '@/lib/diary';
export function DiaryGoals(){const {owner}=useDiary();return <Goals key={owner}/>;}
function Goals(){
    const {goals,loading,updateGoals,status}=useGoals() as any;
    const {entries,loading:diaryLoading}=useDiary();
    const [editing,setEditing]=useState(false),[monthly,setMonthly]=useState(''),[yearly,setYearly]=useState(''),[error,setError]=useState('');
    const today=localToday(),month=today.slice(0,7),year=today.slice(0,4);
    const counts=[entries.filter(entry=>entry.watchedOn.startsWith(month)).length,entries.filter(entry=>entry.watchedOn.startsWith(year)).length];
    return <section className="rounded-xl border border-white/10 bg-bg-card p-5"><div className="flex flex-wrap items-center justify-between gap-3"><h2 className="font-bold text-white">Viewing goals</h2><button className="min-h-11 text-sm text-accent-primary" disabled={loading} onClick={()=>{setMonthly(String(goals.monthly));setYearly(String(goals.yearly));setEditing(!editing);setError('');}}>{editing?'Cancel':'Edit goals'}</button></div><p className="text-xs text-text-muted">Counts diary viewings, including rewatches and show-level TV logs.</p>
        {diaryLoading?<p role="status" className="text-sm text-text-muted">Loading goal progress…</p>:<div className="mt-4 grid gap-4 sm:grid-cols-2">{[['This month',goals.monthly,counts[0]],['This year',goals.yearly,counts[1]]].map(([label,target,count])=><div key={String(label)}><div className="flex justify-between text-sm text-white"><span>{label}</span><span>{count}/{target} viewings</span></div><progress className="mt-2 w-full accent-accent-primary" aria-label={`${label} viewing goal`} value={Math.min(Number(count),Number(target))} max={Number(target)}/>{Number(count)>=Number(target)&&<p className="text-xs text-green-300">Goal reached!</p>}</div>)}</div>}
        {editing&&<form className="mt-4 space-y-3" onSubmit={event=>{event.preventDefault();const values=[Number(monthly),Number(yearly)];if(values.some(value=>!Number.isInteger(value)||value<1||value>10000)){setError('Enter whole numbers from 1 to 10,000.');return;}updateGoals({monthly:values[0],yearly:values[1]});setEditing(false);}}><div className="grid gap-3 sm:grid-cols-2">{[['Monthly target',monthly,setMonthly],['Yearly target',yearly,setYearly]].map(([label,value,setValue])=><label key={String(label)} className="text-sm text-text-secondary">{String(label)}<input className="mt-1 min-h-11 w-full rounded-lg border border-white/15 bg-bg-card px-3 text-white" type="number" min={1} max={10000} step={1} required value={String(value)} onChange={event=>(setValue as (value:string)=>void)(event.target.value)}/></label>)}</div>{error&&<p role="alert" className="text-sm text-amber-300">{error}</p>}<button className="min-h-11 rounded-lg bg-accent-surface px-4 text-white" disabled={loading}>Save goals</button></form>}
        <p role="status" className="mt-3 text-xs text-text-muted">{status}</p>
    </section>;
}
