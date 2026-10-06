const keyOf = (item) => `${item.type || (item.name && !item.title ? "tv" : "movie")}:${item.id}`;

export function reorderListEntry(lists, listId, key, direction) {
    return lists.map((list) => {
        if (list.id !== listId) return list;
        const index = list.movies.findIndex((movie) => keyOf(movie) === key);
        const target = index + direction;
        if (index < 0 || target < 0 || target >= list.movies.length || ![-1, 1].includes(direction)) return list;
        const movies = [...list.movies];
        [movies[index], movies[target]] = [movies[target], movies[index]];
        return { ...list, movies };
    });
}

export function transferListEntries(lists, sourceId, targetId, keys, move = false) {
    if (sourceId === targetId) return lists;
    const source = lists.find((list) => list.id === sourceId);
    const target = lists.find((list) => list.id === targetId);
    if (!source || !target) return lists;
    const selected = new Set(keys);
    const transferred = source.movies.filter((movie) => selected.has(keyOf(movie)));
    const existing = new Set(target.movies.map(keyOf));
    const additions = transferred.filter((movie) => {
        const key = keyOf(movie);
        if (existing.has(key)) return false;
        existing.add(key);
        return true;
    });
    return lists.map((list) => {
        if (list.id === targetId) return { ...list, movies: [...list.movies, ...additions] };
        if (move && list.id === sourceId) return { ...list, movies: list.movies.filter((movie) => !selected.has(keyOf(movie))) };
        return list;
    });
}
