import { NextResponse } from 'next/server';
import recommendationsData from '@/data/recommendations.json';

// Type assertion for the JSON data
const recommendations = recommendationsData as Record<string, number[]>;

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url);

    // Support both single 'movieId' and batch 'movieIds'
    const movieIdParam = searchParams.get('movieId');
    const movieIdsParam = searchParams.get('movieIds');

    const movieIds = movieIdsParam ? movieIdsParam.split(',') : (movieIdParam ? [movieIdParam] : []);

    if (movieIds.length === 0) {
        return NextResponse.json({ error: 'Movie ID(s) required' }, { status: 400 });
    }

    try {
        const scores: Record<number, number> = {};

        // Process all input movies
        for (const id of movieIds) {
            const recs = recommendations[id];
            if (recs) {
                // Add scores: +1 for each time a movie is recommended
                // Earlier items in the list get slightly higher weight (optional optimization)
                recs.forEach((recId, index) => {
                    if (!scores[recId]) scores[recId] = 0;
                    scores[recId] += (1 + (1 / (index + 1))); // Simple weighting: 1 for existence + positional boost
                });
            }
        }

        // Convert to array and sort by score
        const sortedRecs = Object.entries(scores)
            .sort(([, scoreA], [, scoreB]) => scoreB - scoreA) // Descending
            .map(([id]) => parseInt(id))
            // Filter out input movies (don't recommend what they just watched)
            .filter(id => !movieIds.includes(id.toString()));

        if (sortedRecs.length === 0) {
            return NextResponse.json({ recommendations: [] });
        }

        // Return top 20
        return NextResponse.json({ recommendations: sortedRecs.slice(0, 20) });

    } catch (error) {
        console.error('AI Recommendation Error:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
