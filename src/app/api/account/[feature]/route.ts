import { NextResponse } from 'next/server';
import { isAccountFeature } from '@/lib/accountFeatures';
import { database } from '@/lib/server/db';
import { readFeature } from '@/lib/server/accountStore';
import { authenticatedUser, PRIVATE_HEADERS, readJson, sameOrigin } from '@/lib/server/http';
import { feedbackChanges } from '@/lib/feedbackChanges';
export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
type Context = { params: Promise<{ feature: string }> };
const json = (data: unknown, status=200) => NextResponse.json(data,{status, headers: PRIVATE_HEADERS});
export async function GET(request: Request, context: Context) {
    try {
        const userId = await authenticatedUser(request);
        if (!userId) return json({error:'Sign in required'},401);
        const { feature } = await context.params;
        if (!isAccountFeature(feature)) return json({error:'Unknown feature'},404);
        return json(await readFeature(userId,feature));
    } catch { return json({error:'Account storage unavailable'},503); }
}
export async function PUT(request: Request, context: Context) {
    if (!sameOrigin(request)) return json({error:'Invalid origin'},403);
    let client;
    try {
        const userId = await authenticatedUser(request);
        if (!userId) return json({error:'Sign in required'},401);
        const { feature } = await context.params;
        if (!isAccountFeature(feature)) return json({error:'Unknown feature'},404);
        let body;
        try { body = await readJson(request); } catch { return json({error:'Invalid or oversized data'},400); }
        if (!body || !Number.isSafeInteger(body.revision) || body.revision<1 || body.data === undefined || typeof body.mutationId !== 'string' || !/^[\da-f-]{36}$/i.test(body.mutationId)) return json({error:'Invalid revision or data'},400);
        if (feature === 'feedbackConsent' && typeof body.data?.enabled !== 'boolean') return json({error:'Invalid consent'},400);
        client = await database().connect();
        await client.query('BEGIN');
        await client.query('SELECT pg_advisory_xact_lock(hashtext($1))',[userId]);
        const { rows } = await client.query('SELECT data, revision, mutation_id FROM account_features WHERE user_id=$1 AND feature=$2 FOR UPDATE',[userId,feature]);
        const row = rows[0];
        if (row?.mutation_id === body.mutationId) { await client.query('COMMIT'); return json({revision:Number(row.revision)}); }
        if (!row || Number(row.revision) !== body.revision) { await client.query('ROLLBACK'); return json({error:'Changes were saved on another device', current:row ? {data:row.data,revision:Number(row.revision)} : null},409); }
        const result = await client.query(`UPDATE account_features SET data=$3::jsonb,revision=revision+1,mutation_id=$4,updated_at=now() WHERE user_id=$1 AND feature=$2 RETURNING revision`,[userId,feature,JSON.stringify(body.data),body.mutationId]);
        // Consent changes and events share the account transaction lock.
        if (feature === 'feedbackConsent' && !body.data.enabled) await client.query('DELETE FROM recommendation_events WHERE user_id=$1',[userId]);
        const consent = await client.query("SELECT data FROM account_features WHERE user_id=$1 AND feature='feedbackConsent'",[userId]);
        if (consent.rows[0]?.data?.enabled === true && feature !== 'feedbackConsent') {
            for (const event of feedbackChanges(feature,row.data,body.data).slice(0,100)) {
                await client.query(`INSERT INTO recommendation_events(user_id,event_id,item_id,media_type,kind,value,source) VALUES($1,gen_random_uuid(),$2,$3,$4,$5,'account')`,[userId,event.id,event.type,event.kind,event.value ?? null]);
            }
        }
        await client.query('COMMIT');
        return json({revision:Number(result.rows[0].revision)});
    } catch { if(client) await client.query('ROLLBACK').catch(()=>{}); return json({error:'Account storage unavailable'},503); }
    finally { client?.release(); }
}
