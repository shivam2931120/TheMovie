module.exports = [
"[project]/src/app/api/ai-recommend/route.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "GET",
    ()=>GET
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/server.js [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$data$2f$recommendations$2e$json__$28$json$29$__ = __turbopack_context__.i("[project]/src/data/recommendations.json (json)");
;
;
// Type assertion for the JSON data
const recommendations = __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$data$2f$recommendations$2e$json__$28$json$29$__["default"];
async function GET(request) {
    const { searchParams } = new URL(request.url);
    // Support both single 'movieId' and batch 'movieIds'
    const movieIdParam = searchParams.get('movieId');
    const movieIdsParam = searchParams.get('movieIds');
    const movieIds = movieIdsParam ? movieIdsParam.split(',') : movieIdParam ? [
        movieIdParam
    ] : [];
    if (movieIds.length === 0) {
        return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
            error: 'Movie ID(s) required'
        }, {
            status: 400
        });
    }
    try {
        const scores = {};
        // Process all input movies
        for (const id of movieIds){
            const recs = recommendations[id];
            if (recs) {
                // Add scores: +1 for each time a movie is recommended
                // Earlier items in the list get slightly higher weight (optional optimization)
                recs.forEach((recId, index)=>{
                    if (!scores[recId]) scores[recId] = 0;
                    scores[recId] += 1 + 1 / (index + 1); // Simple weighting: 1 for existence + positional boost
                });
            }
        }
        // Convert to array and sort by score
        const sortedRecs = Object.entries(scores).sort(([, scoreA], [, scoreB])=>scoreB - scoreA) // Descending
        .map(([id])=>parseInt(id))// Filter out input movies (don't recommend what they just watched)
        .filter((id)=>!movieIds.includes(id.toString()));
        if (sortedRecs.length === 0) {
            return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
                recommendations: []
            });
        }
        // Return top 20
        return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
            recommendations: sortedRecs.slice(0, 20)
        });
    } catch (error) {
        console.error('AI Recommendation Error:', error);
        return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
            error: 'Internal Server Error'
        }, {
            status: 500
        });
    }
}
}),
];

//# sourceMappingURL=src_app_api_ai-recommend_route_ts_f6465488._.js.map