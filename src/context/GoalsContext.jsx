"use client";

import { createContext, useContext } from "react";
import { useAccountFeature } from "@/lib/useAccountFeature";

const GoalsContext = createContext();

const INITIAL={monthly:10,yearly:100};
const count=(value,fallback)=>Number.isFinite(Number(value))&&Number(value)>0?Math.max(1,Math.min(10000,Math.round(Number(value)))):fallback;
const normalize=value=>({monthly:count(value?.monthly,10),yearly:count(value?.yearly,100)});
const merge=(a,b)=>({...b,...a});
export function GoalsProvider({children}) {
    const {data:goals,update,loading,status}=useAccountFeature('watchGoals',INITIAL,merge,normalize);
    return <GoalsContext.Provider value={{goals,loading,status,updateGoals:patch=>update(current=>({...current,...patch}))}}>{children}</GoalsContext.Provider>;
}

export function useGoals() {
    const context = useContext(GoalsContext);
    if (!context) {
        throw new Error("useGoals must be used within GoalsProvider");
    }
    return context;
}
