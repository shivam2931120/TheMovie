"use client";
import { createContext,useContext } from 'react';
import { useAccountFeature } from '@/lib/useAccountFeature';
type Preferences = { bio:string;favoriteGenres:string[] };
const INITIAL:Preferences={bio:'',favoriteGenres:[]};
const normalize=(value:any):Preferences=>({bio:typeof value?.bio==='string'?value.bio.slice(0,2000):'',favoriteGenres:Array.isArray(value?.favoriteGenres)?value.favoriteGenres.filter((g:unknown)=>typeof g==='string').slice(0,5):[]});
const merge=(a:Preferences,b:Preferences):Preferences=>({bio:a.bio||b.bio,favoriteGenres:[...new Set([...a.favoriteGenres,...b.favoriteGenres])].slice(0,5)});
const Context=createContext<{preferences:Preferences;setPreferences:(value:Preferences)=>void;loading:boolean;status:string}|null>(null);
export function ProfilePreferencesProvider({children}:{children:React.ReactNode}) {
    const {data,update,loading,status}=useAccountFeature('profilePreferences',INITIAL,merge,normalize);
    return <Context.Provider value={{preferences:data,setPreferences:value=>update(()=>value),loading,status}}>{children}</Context.Provider>;
}
export function useProfilePreferences(){ const value=useContext(Context);if(!value)throw new Error('Profile provider missing');return value; }
