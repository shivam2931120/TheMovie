import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import Container from "../components/Container";
import MovieCard from "../components/MovieCard";
import CollectionCard from "../components/CollectionCard";
import { getPopularCollections, getCollection } from "../api/enhanced";
import { useLists } from "../context/ListsContext";

export default function Collections() {
    const { id } = useParams();
    const [collection, setCollection] = useState(null);
    const [loading, setLoading] = useState(false);
    const { lists, createList, deleteList, isInList, addToList, removeFromList } = useLists();
    const [newListName, setNewListName] = useState("");
    const [showCreateForm, setShowCreateForm] = useState(false);

    const popularCollections = getPopularCollections().map(c => ({
        ...c,
        poster: c.poster,
    }));

    // Fetch specific collection
    useEffect(() => {
        if (id) {
            const fetchCollection = async () => {
                setLoading(true);
                try {
                    const data = await getCollection(id);
                    setCollection(data);
                } catch (error) {
                    console.error("Failed to fetch collection:", error);
                } finally {
                    setLoading(false);
                }
            };
            fetchCollection();
        }
    }, [id]);

    // Create new list
    const handleCreateList = async () => {
        if (!newListName.trim()) return;
        await createList(newListName.trim());
        setNewListName("");
        setShowCreateForm(false);
    };

    // If viewing a specific collection
    if (id) {
        if (loading) {
            return (
                <Container className="py-8">
                    <div className="text-center text-neutral-400">Loading collection...</div>
                </Container>
            );
        }

        if (!collection) {
            return (
                <Container className="py-8">
                    <div className="text-center text-neutral-400">Collection not found</div>
                    <Link to="/collections" className="block text-center mt-4 text-purple-400 hover:text-purple-300">
                        ← Back to Collections
                    </Link>
                </Container>
            );
        }

        return (
            <Container className="py-8">
                {/* Collection Header */}
                <div className="mb-8">
                    <Link to="/collections" className="text-sm text-neutral-400 hover:text-white mb-4 inline-block">
                        ← All Collections
                    </Link>
                    <div className="flex gap-6 flex-col md:flex-row">
                        {collection.poster_path && (
                            <img
                                src={`https://image.tmdb.org/t/p/w300${collection.poster_path}`}
                                alt={collection.name}
                                className="w-48 rounded-lg shadow-lg"
                            />
                        )}
                        <div>
                            <h1 className="text-3xl font-bold text-white mb-2">{collection.name}</h1>
                            <p className="text-neutral-400 mb-4">{collection.parts?.length || 0} movies</p>
                            {collection.overview && (
                                <p className="text-neutral-300 max-w-2xl">{collection.overview}</p>
                            )}
                        </div>
                    </div>
                </div>

                {/* Collection Movies */}
                <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
                    {collection.parts?.sort((a, b) => new Date(a.release_date) - new Date(b.release_date)).map(movie => (
                        <MovieCard key={movie.id} movie={movie} />
                    ))}
                </div>
            </Container>
        );
    }

    // Collections index page
    return (
        <Container className="py-8">
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-white">Collections</h1>
                <p className="mt-2 text-neutral-400">Popular franchises and your custom lists</p>
            </div>

            {/* Popular Collections */}
            <section className="mb-12">
                <h2 className="text-xl font-semibold text-white mb-6">🎬 Popular Franchises</h2>
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                    {popularCollections.map(collection => (
                        <CollectionCard key={collection.id} collection={collection} />
                    ))}
                </div>
            </section>

            {/* User Lists */}
            <section>
                <div className="flex items-center justify-between mb-6">
                    <h2 className="text-xl font-semibold text-white">📋 Your Lists</h2>
                    <button
                        onClick={() => setShowCreateForm(!showCreateForm)}
                        className="rounded-lg bg-purple-600 px-4 py-2 text-sm font-medium text-white hover:bg-purple-700"
                    >
                        + Create List
                    </button>
                </div>

                {/* Create List Form */}
                {showCreateForm && (
                    <div className="mb-6 rounded-xl border border-neutral-800 bg-neutral-900 p-4">
                        <div className="flex gap-3">
                            <input
                                type="text"
                                value={newListName}
                                onChange={(e) => setNewListName(e.target.value)}
                                placeholder="Enter list name..."
                                className="flex-1 rounded-lg border border-neutral-700 bg-neutral-800 px-4 py-2 text-white placeholder-neutral-500"
                                onKeyDown={(e) => e.key === "Enter" && handleCreateList()}
                            />
                            <button
                                onClick={handleCreateList}
                                className="rounded-lg bg-purple-600 px-6 py-2 text-white hover:bg-purple-700"
                            >
                                Create
                            </button>
                            <button
                                onClick={() => setShowCreateForm(false)}
                                className="rounded-lg border border-neutral-700 px-4 py-2 text-neutral-400 hover:bg-neutral-800"
                            >
                                Cancel
                            </button>
                        </div>
                    </div>
                )}

                {/* User Lists Grid */}
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                    {lists.map(list => (
                        <div
                            key={list.id}
                            className="rounded-xl border border-neutral-800 bg-neutral-900 p-5 transition hover:border-neutral-700"
                        >
                            <div className="flex items-start justify-between mb-3">
                                <div>
                                    <span className="mr-2 text-xl">{list.icon}</span>
                                    <span className="text-lg font-semibold text-white">{list.name}</span>
                                </div>
                                {!list.isDefault && (
                                    <button
                                        onClick={() => deleteList(list.id)}
                                        className="text-neutral-500 hover:text-red-400 text-sm"
                                    >
                                        Delete
                                    </button>
                                )}
                            </div>
                            <p className="text-sm text-neutral-400 mb-4">
                                {list.movies.length} movie{list.movies.length !== 1 ? "s" : ""}
                            </p>

                            {/* Movie Thumbnails */}
                            {list.movies.length > 0 ? (
                                <div className="flex -space-x-4">
                                    {list.movies.slice(0, 5).map((movie) => (
                                        <img
                                            key={movie.id}
                                            src={movie.poster_path ? `https://image.tmdb.org/t/p/w92${movie.poster_path}` : "/placeholder.png"}
                                            alt={movie.title}
                                            className="h-16 w-11 rounded border-2 border-neutral-800 object-cover"
                                        />
                                    ))}
                                    {list.movies.length > 5 && (
                                        <div className="flex h-16 w-11 items-center justify-center rounded border-2 border-neutral-800 bg-neutral-800 text-sm text-neutral-400">
                                            +{list.movies.length - 5}
                                        </div>
                                    )}
                                </div>
                            ) : (
                                <p className="text-sm text-neutral-500 italic">No movies yet</p>
                            )}
                        </div>
                    ))}
                </div>
            </section>
        </Container>
    );
}
