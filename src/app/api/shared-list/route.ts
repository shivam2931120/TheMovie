import { readFeature } from "@/lib/server/accountStore";
import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
    const userId = request.nextUrl.searchParams.get("userId");
    const listId = request.nextUrl.searchParams.get("listId");
    if (!userId || !listId || userId.length > 128 || listId.length > 128) {
        return NextResponse.json({ error: "not_found" }, { status: 404, headers: { "Cache-Control": "no-store" } });
    }

    try {
        const { data: lists } = await readFeature(userId, "customLists");
        const list = Array.isArray(lists) ? lists.find((item: any) => item?.id === listId) : null;
        if (!list || list.isPublic !== true) {
            return NextResponse.json({ error: "not_found" }, { status: 404, headers: { "Cache-Control": "no-store" } });
        }

        return NextResponse.json({
            list: {
                name: typeof list.name === "string" ? list.name : "Shared List",
                description: typeof list.description === "string" ? list.description : "",
                movies: Array.isArray(list.movies) ? list.movies : [],
            },
        }, { headers: { "Cache-Control": "private, no-store, max-age=0" } });
    } catch {
        return NextResponse.json({ error: "sharing_unavailable" }, { status: 503, headers: { "Cache-Control": "no-store" } });
    }
}
