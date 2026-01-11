import { createContext, useContext, useState, useEffect } from "react";
import { useUser } from "@clerk/clerk-react";

const GoalsContext = createContext();

export function GoalsProvider({ children }) {
    const { user, isSignedIn } = useUser();
    const [goals, setGoals] = useState({
        monthly: 10,
        yearly: 100,
    });
    const [loading, setLoading] = useState(true);

    // Load goals from user metadata or localStorage
    useEffect(() => {
        const loadGoals = async () => {
            try {
                if (isSignedIn && user) {
                    const savedGoals = user.unsafeMetadata?.watchGoals;
                    if (savedGoals) {
                        setGoals(savedGoals);
                    }
                } else {
                    const localGoals = localStorage.getItem("watchGoals");
                    if (localGoals) {
                        setGoals(JSON.parse(localGoals));
                    }
                }
            } catch (error) {
                console.error("Failed to load goals:", error);
            } finally {
                setLoading(false);
            }
        };
        loadGoals();
    }, [user, isSignedIn]);

    // Save goals
    const updateGoals = async (newGoals) => {
        const mergedGoals = { ...goals, ...newGoals };
        setGoals(mergedGoals);

        try {
            if (isSignedIn && user) {
                await user.update({
                    unsafeMetadata: {
                        ...user.unsafeMetadata,
                        watchGoals: mergedGoals,
                    },
                });
            } else {
                localStorage.setItem("watchGoals", JSON.stringify(mergedGoals));
            }
        } catch (error) {
            console.error("Failed to save goals:", error);
        }
    };

    return (
        <GoalsContext.Provider value={{ goals, updateGoals, loading }}>
            {children}
        </GoalsContext.Provider>
    );
}

export function useGoals() {
    const context = useContext(GoalsContext);
    if (!context) {
        throw new Error("useGoals must be used within GoalsProvider");
    }
    return context;
}
