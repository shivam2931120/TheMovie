"use client";

import { createContext, useContext, useState, useEffect } from "react";
import { useUser } from "@clerk/nextjs";
import { useAccountFeature } from "@/lib/useAccountFeature";

const GoalsContext = createContext();

const INITIAL={monthly:10,yearly:100};
const normalize=value=>({monthly:Math.max(1,Math.min(10000,Number(value?.monthly)||10)),yearly:Math.max(1,Math.min(10000,Number(value?.yearly)||100))});
const merge=(a,b)=>({...b,...a});
export function GoalsProvider({children}) {
    const {data:goals,update,loading}=useAccountFeature('watchGoals',INITIAL,merge,normalize);
    return <GoalsContext.Provider value={{goals,loading,updateGoals:patch=>update(current=>({...current,...patch}))}}>{children}</GoalsContext.Provider>;
}

export function useGoals() {
    const context = useContext(GoalsContext);
    if (!context) {
        throw new Error("useGoals must be used within GoalsProvider");
    }
    return context;
}
