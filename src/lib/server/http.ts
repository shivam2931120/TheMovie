import 'server-only';
import { auth } from '@clerk/nextjs/server';
export const PRIVATE_HEADERS = { 'Cache-Control': 'private, no-store' };
export async function authenticatedUser(request?: Request) {
    if (!process.env.CLERK_SECRET_KEY || !process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY) {
        throw new Error('Account authentication is not configured');
    }
    const session = await auth();
    // The client identity is only a consistency guard; ownership still comes from Clerk.
    const expectedOwner=request?.headers.get('x-themovie-account');
    if(expectedOwner && expectedOwner!==session.userId) throw new Error('Account changed during request');
    return session.userId;
}
export function sameOrigin(request: Request) {
    const origin = request.headers.get('origin');
    return (!origin || origin === new URL(request.url).origin) && request.headers.get('sec-fetch-site') !== 'cross-site';
}
export async function readJson(request: Request, limit = 2 * 1024 * 1024) {
    const reader = request.body?.getReader();
    if (!reader) throw new Error('Missing body');
    let size = 0;
    const chunks: Uint8Array[] = [];
    while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        size += value.length;
        if (size > limit) { await reader.cancel(); throw new Error('Body too large'); }
        chunks.push(value);
    }
    const bytes = new Uint8Array(size);
    let offset = 0;
    for (const chunk of chunks) { bytes.set(chunk, offset); offset += chunk.length; }
    return JSON.parse(new TextDecoder().decode(bytes));
}
