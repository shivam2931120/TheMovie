import { NextResponse } from 'next/server';
import { database } from '@/lib/server/db';
import { authenticatedUser, PRIVATE_HEADERS, readJson, sameOrigin } from '@/lib/server/http';
export const runtime='nodejs';
const json=(data:unknown,status=200)=>NextResponse.json(data,{status,headers:PRIVATE_HEADERS});
const uuid=(value:unknown)=>typeof value==='string'&&/^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(value);
export async function POST(request:Request) {
    if(!sameOrigin(request))return json({error:'Invalid origin'},403);
    let client;
    try {
        const userId=await authenticatedUser(request);if(!userId)return json({error:'Sign in required'},401);
        let body;try{body=await readJson(request,16384);}catch{return json({error:'Invalid events'},400);}
        if(!Array.isArray(body?.events)||body.events.length>50)return json({error:'Invalid events'},400);
        const events=body.events.filter((e:any)=>uuid(e.eventId)&&Number.isSafeInteger(e.id)&&e.id>0&&['movie','tv'].includes(e.type)&&['impression','click'].includes(e.kind));
        if(events.length!==body.events.length)return json({error:'Invalid events'},400);
        client=await database().connect();await client.query('BEGIN');
        await client.query('SELECT pg_advisory_xact_lock(hashtext($1))',[userId]);
        const deleted=await client.query('SELECT 1 FROM account_deletions WHERE user_id=$1',[userId]);
        if(deleted.rows.length){await client.query('ROLLBACK');return json({error:'Account deleted'},403);}
        const consent=await client.query("SELECT data FROM account_features WHERE user_id=$1 AND feature='feedbackConsent'",[userId]);
        if(consent.rows[0]?.data?.enabled!==true){await client.query('ROLLBACK');return json({error:'Learning consent required'},403);}
        const count=await client.query(`INSERT INTO recommendation_rate_limits(user_id,window_start,count) VALUES($1,date_trunc('minute',now()),$2)
            ON CONFLICT(user_id,window_start) DO UPDATE SET count=recommendation_rate_limits.count+EXCLUDED.count RETURNING count`,[userId,events.length]);
        if(count.rows[0].count>300){await client.query('ROLLBACK');return json({error:'Too many events'},429);}
        for(const event of events) await client.query(`INSERT INTO recommendation_events(user_id,event_id,item_id,media_type,kind,source,model,request_id) VALUES($1,$2,$3,$4,$5,$6,$7,$8) ON CONFLICT DO NOTHING`,[userId,event.eventId,event.id,event.type,event.kind,['home','search','details'].includes(event.source)?event.source:'app',typeof event.model==='string'?event.model.slice(0,80):null,uuid(event.requestId)?event.requestId:null]);
        await client.query("DELETE FROM recommendation_rate_limits WHERE user_id=$1 AND window_start < now()-interval '1 hour'",[userId]);
        await client.query('COMMIT');return json({accepted:events.length});
    }catch{if(client)await client.query('ROLLBACK').catch(()=>{});return json({error:'Feedback unavailable'},503);}finally{client?.release();}
}
export async function DELETE(request:Request) {
    if(!sameOrigin(request))return json({error:'Invalid origin'},403);
    let client;
    try{
        const userId=await authenticatedUser(request);if(!userId)return json({error:'Sign in required'},401);
        client=await database().connect();await client.query('BEGIN');await client.query('SELECT pg_advisory_xact_lock(hashtext($1))',[userId]);
        await client.query('DELETE FROM recommendation_events WHERE user_id=$1',[userId]);await client.query('COMMIT');return json({deleted:true});
    }catch{if(client)await client.query('ROLLBACK').catch(()=>{});return json({error:'Feedback unavailable'},503);}finally{client?.release();}
}
