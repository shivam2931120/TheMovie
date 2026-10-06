import { verifyWebhook } from '@clerk/nextjs/webhooks';
import { NextRequest, NextResponse } from 'next/server';
import { database } from '@/lib/server/db';
import { PRIVATE_HEADERS } from '@/lib/server/http';
export const runtime='nodejs';
export async function POST(request:NextRequest) {
    if(!process.env.CLERK_WEBHOOK_SIGNING_SECRET)return NextResponse.json({error:'Webhook not configured'},{status:503,headers:PRIVATE_HEADERS});
    let event;
    try{event=await verifyWebhook(request);}catch{return NextResponse.json({error:'Invalid signature'},{status:400,headers:PRIVATE_HEADERS});}
    if(event.type!=='user.deleted'||!event.data.id)return NextResponse.json({received:true},{headers:PRIVATE_HEADERS});
    let client;
    try{
        const userId=event.data.id;
        client=await database().connect();await client.query('BEGIN');
        await client.query('SELECT pg_advisory_xact_lock(hashtext($1))',[userId]);
        await client.query('INSERT INTO account_deletions(user_id) VALUES($1) ON CONFLICT DO NOTHING',[userId]);
        await client.query('DELETE FROM recommendation_events WHERE user_id=$1',[userId]);
        await client.query('DELETE FROM recommendation_rate_limits WHERE user_id=$1',[userId]);
        await client.query('DELETE FROM account_features WHERE user_id=$1',[userId]);
        await client.query('COMMIT');return NextResponse.json({received:true},{headers:PRIVATE_HEADERS});
    }catch{if(client)await client.query('ROLLBACK').catch(()=>{});return NextResponse.json({error:'Deletion unavailable'},{status:503,headers:PRIVATE_HEADERS});}finally{client?.release();}
}
