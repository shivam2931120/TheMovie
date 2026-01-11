import { useRef, useCallback, memo } from "react";
import { FixedSizeGrid } from "react-window";
import MovieCard from "./MovieCard";

const CARD_WIDTH = 200;
const CARD_HEIGHT = 340;
const GAP = 16;

function VirtualMovieGrid({ movies, containerWidth, containerHeight = 800 }) {
    const gridRef = useRef(null);

    // Calculate columns based on container width
    const columnCount = Math.max(1, Math.floor((containerWidth + GAP) / (CARD_WIDTH + GAP)));
    const rowCount = Math.ceil(movies.length / columnCount);

    const Cell = memo(({ columnIndex, rowIndex, style }) => {
        const index = rowIndex * columnCount + columnIndex;
        if (index >= movies.length) return null;

        const movie = movies[index];

        return (
            <div
                style={{
                    ...style,
                    left: style.left + GAP / 2,
                    top: style.top + GAP / 2,
                    width: style.width - GAP,
                    height: style.height - GAP,
                }}
            >
                <MovieCard movie={movie} />
            </div>
        );
    });

    Cell.displayName = "VirtualCell";

    if (movies.length === 0) {
        return (
            <div className="py-16 text-center text-neutral-400">
                No movies found.
            </div>
        );
    }

    return (
        <FixedSizeGrid
            ref={gridRef}
            className="scrollbar-thin scrollbar-thumb-neutral-700 scrollbar-track-neutral-900"
            columnCount={columnCount}
            columnWidth={CARD_WIDTH + GAP}
            height={containerHeight}
            rowCount={rowCount}
            rowHeight={CARD_HEIGHT + GAP}
            width={containerWidth}
            overscanRowCount={2}
        >
            {Cell}
        </FixedSizeGrid>
    );
}

export default memo(VirtualMovieGrid);

// Hook to measure container width
export function useContainerWidth() {
    const containerRef = useRef(null);
    const [width, setWidth] = useState(1200);

    useEffect(() => {
        const updateWidth = () => {
            if (containerRef.current) {
                setWidth(containerRef.current.offsetWidth);
            }
        };

        updateWidth();
        window.addEventListener("resize", updateWidth);
        return () => window.removeEventListener("resize", updateWidth);
    }, []);

    return [containerRef, width];
}

import { useState, useEffect } from "react";
