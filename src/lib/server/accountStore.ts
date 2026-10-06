import 'server-only';
import { clerkClient } from '@clerk/nextjs/server';
import { database } from './db';
import type { AccountFeature } from '../accountFeatures';
export async function readFeature(userId: string, feature: AccountFeature) {
    const db=database();
    const existing=await db.query(`SELECT data,revision FROM account_features WHERE user_id=$1 AND feature=$2 AND NOT EXISTS(SELECT 1 FROM account_deletions WHERE user_id=$1)`,[userId,feature]);
    if(existing.rows.length)return {data:existing.rows[0].data,revision:Number(existing.rows[0].revision)};
    // Legacy import comes only from the same Clerk owner. Fetch outside the transaction.
    const user=await (await clerkClient()).users.getUser(userId);
    let data:any=user.unsafeMetadata[feature];
    if(feature==='ratings'&&!data)data=user.unsafeMetadata.reviews;
    if(data?.version===1&&data.data!==undefined)data=data.data;
    if(feature==='feedbackConsent')data={enabled:false};
    data??=['watchlist','watched','ratings','customLists','recentlyViewed','watchDiary'].includes(feature)?[]:{};
    const client=await db.connect();
    try{
        await client.query('BEGIN');
        await client.query('SELECT pg_advisory_xact_lock(hashtext($1))',[userId]);
        const deleted=await client.query('SELECT 1 FROM account_deletions WHERE user_id=$1',[userId]);
        if(deleted.rows.length)throw new Error('Account deleted');
        await client.query(`INSERT INTO account_features(user_id,feature,data) VALUES($1,$2,$3::jsonb) ON CONFLICT(user_id,feature) DO NOTHING`,[userId,feature,JSON.stringify(data)]);
        const result=await client.query('SELECT data,revision FROM account_features WHERE user_id=$1 AND feature=$2',[userId,feature]);
        await client.query('COMMIT');return {data:result.rows[0].data,revision:Number(result.rows[0].revision)};
    }catch(error){await client.query('ROLLBACK');throw error;}finally{client.release();}
}
