import pg from 'pg';
import {createHmac} from 'node:crypto';
import {mkdir,open} from 'node:fs/promises';
import path from 'node:path';
if(!process.env.DATABASE_URL||!process.env.ML_EXPORT_SECRET)throw new Error('Set DATABASE_URL and a private stable ML_EXPORT_SECRET.');
const destination=process.argv[2]||'ml/private/events.jsonl';
await mkdir(path.dirname(destination),{recursive:true,mode:0o700});
const file=await open(destination,'wx',0o600); // Never overwrite an existing private export.
const client=new pg.Client({connectionString:process.env.DATABASE_URL});
try{
    await client.connect();await client.query('BEGIN ISOLATION LEVEL REPEATABLE READ READ ONLY');
    let cursor='';
    while(true){
        const result=await client.query(`SELECT e.* FROM recommendation_events e JOIN account_features a ON a.user_id=e.user_id AND a.feature='feedbackConsent'
            WHERE a.data->>'enabled'='true' AND (e.user_id || ':' || e.event_id::text)>$1 ORDER BY e.user_id || ':' || e.event_id::text LIMIT 1000`,[cursor]);
        if(!result.rows.length)break;
        for(const row of result.rows){
            const event={eventId:row.event_id,user:createHmac('sha256',process.env.ML_EXPORT_SECRET).update(row.user_id).digest('hex'),id:Number(row.item_id),type:row.media_type,kind:row.kind,value:row.value,at:row.created_at.toISOString(),model:row.model,source:row.source,requestId:row.request_id};
            await file.write(JSON.stringify(event)+'\n');
        }
        const last=result.rows.at(-1);cursor=`${last.user_id}:${last.event_id}`;
    }
    await client.query('COMMIT');console.log(`Private pseudonymous export written to ${destination}. Treat it as personal data; remove old exports when consent is revoked.`);
}finally{await file.close();await client.end();}
