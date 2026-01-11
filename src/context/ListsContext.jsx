import { createContext, useContext, useState, useEffect } from "react";
import { useUser } from "@clerk/clerk-react";

const ListsContext = createContext();

// Default pre-made lists
const DEFAULT_LISTS = [
    { id: "favorites", name: "My Favorites", icon: "❤️", isDefault: true, movies: [] },
    { id: "to-rewatch", name: "Want to Rewatch", icon: "🔄", isDefault: true, movies: [] },
];

export function ListsProvider({ children }) {
    const { user, isSignedIn } = useUser();
    const [lists, setLists] = useState(DEFAULT_LISTS);
    const [loading, setLoading] = useState(true);

    // Load lists from user metadata or localStorage
    useEffect(() => {
        const loadLists = async () => {
            try {
                if (isSignedIn && user) {
                    const savedLists = user.unsafeMetadata?.customLists;
                    if (savedLists && savedLists.length > 0) {
                        setLists(savedLists);
                    }
                } else {
                    const localLists = localStorage.getItem("customLists");
                    if (localLists) {
                        setLists(JSON.parse(localLists));
                    }
                }
            } catch (error) {
                console.error("Failed to load lists:", error);
            } finally {
                setLoading(false);
            }
        };
        loadLists();
    }, [user, isSignedIn]);

    // Save lists
    const saveLists = async (newLists) => {
        try {
            if (isSignedIn && user) {
                await user.update({
                    unsafeMetadata: {
                        ...user.unsafeMetadata,
                        customLists: newLists,
                    },
                });
            } else {
                localStorage.setItem("customLists", JSON.stringify(newLists));
            }
        } catch (error) {
            console.error("Failed to save lists:", error);
        }
    };

    // Create a new list
    const createList = async (name, icon = "📋") => {
        const newList = {
            id: `list-${Date.now()}`,
            name,
            icon,
            isDefault: false,
            movies: [],
            createdAt: new Date().toISOString(),
            isPublic: false,
        };

        const updatedLists = [...lists, newList];
        setLists(updatedLists);
        await saveLists(updatedLists);
        return newList;
    };

    // Delete a list
    const deleteList = async (listId) => {
        const list = lists.find((l) => l.id === listId);
        if (list?.isDefault) return; // Can't delete default lists

        const updatedLists = lists.filter((l) => l.id !== listId);
        setLists(updatedLists);
        await saveLists(updatedLists);
    };

    // Rename a list
    const renameList = async (listId, newName) => {
        const updatedLists = lists.map((l) =>
            l.id === listId ? { ...l, name: newName } : l
        );
        setLists(updatedLists);
        await saveLists(updatedLists);
    };

    // Toggle list public/private
    const toggleListPublic = async (listId) => {
        const updatedLists = lists.map((l) =>
            l.id === listId ? { ...l, isPublic: !l.isPublic } : l
        );
        setLists(updatedLists);
        await saveLists(updatedLists);
    };

    // Add movie to list
    const addToList = async (listId, movie) => {
        const updatedLists = lists.map((l) => {
            if (l.id !== listId) return l;
            if (l.movies.some((m) => m.id === movie.id)) return l;
            return { ...l, movies: [...l.movies, movie] };
        });
        setLists(updatedLists);
        await saveLists(updatedLists);
    };

    // Remove movie from list
    const removeFromList = async (listId, movieId) => {
        const updatedLists = lists.map((l) => {
            if (l.id !== listId) return l;
            return { ...l, movies: l.movies.filter((m) => m.id !== movieId) };
        });
        setLists(updatedLists);
        await saveLists(updatedLists);
    };

    // Check if movie is in list
    const isInList = (listId, movieId) => {
        const list = lists.find((l) => l.id === listId);
        return list?.movies.some((m) => m.id === movieId) || false;
    };

    // Get share link for public list
    const getShareLink = (listId) => {
        const list = lists.find((l) => l.id === listId);
        if (!list?.isPublic) return null;
        // This would need backend support for real sharing
        // For now, create a shareable data URL
        const data = btoa(JSON.stringify({ name: list.name, movies: list.movies.map(m => m.id) }));
        return `${window.location.origin}/shared-list/${data}`;
    };

    return (
        <ListsContext.Provider
            value={{
                lists,
                loading,
                createList,
                deleteList,
                renameList,
                toggleListPublic,
                addToList,
                removeFromList,
                isInList,
                getShareLink,
            }}
        >
            {children}
        </ListsContext.Provider>
    );
}

export function useLists() {
    const context = useContext(ListsContext);
    if (!context) {
        throw new Error("useLists must be used within ListsProvider");
    }
    return context;
}
