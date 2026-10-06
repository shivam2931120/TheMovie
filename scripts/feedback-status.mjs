import pg from 'pg';
import {readFile} from 'node:fs/promises';
if(!process.env.DATABASE_URL)throw new Error('Set DATABASE_URL to inspect learning readiness.');
const client=new pg.Client({connectionString:process.env.DATABASE_URL});
try {
    await client.connect();
    const consent=await client.query("SELECT count(*)::int AS accounts FROM account_features WHERE feature='feedbackConsent' AND data->>'enabled'='true'");
    const {rows}=await client.query(`WITH consented AS (
        SELECT e.* FROM recommendation_events e JOIN account_features a ON a.user_id=e.user_id AND a.feature='feedbackConsent' AND a.data->>'enabled'='true'
    ), histories AS (
        SELECT media_type,user_id,count(DISTINCT item_id) FILTER(WHERE kind IN ('watch','rewatch','watchlist','episode') OR (kind='rating' AND value>=7)) AS titles
        FROM consented GROUP BY media_type,user_id
    ) SELECT e.media_type,count(*)::int AS events,count(DISTINCT e.user_id)::int AS users,
        count(*) FILTER(WHERE e.kind='impression')::int AS impressions,
        count(*) FILTER(WHERE e.kind='click')::int AS clicks,
        count(DISTINCT e.user_id) FILTER(WHERE h.titles>=3)::int AS users_with_three_positive_titles,
        min(e.created_at) AS first_event,max(e.created_at) AS latest_event
        FROM consented e JOIN histories h USING(media_type,user_id) GROUP BY e.media_type`);
    const artifact=JSON.parse(await readFile('src/data/feedback-recommendations.json','utf8'));
    console.log(JSON.stringify({consentedAccounts:consent.rows[0].accounts,feedback:rows,
        deployedFeedbackModel:{version:artifact.version,trainedAt:artifact.trainedAt,movieSeeds:Object.keys(artifact.movie||{}).length,tvSeeds:Object.keys(artifact.tv||{}).length},
        promotionRequires:{events:200,eligibleUsersPerMediaPerWindow:50,priorPositiveTitlesPerMedia:3,chronologicalWindows:3,minimumNdcgGain:0.005,pairedBootstrapLower95MustBePositive:true,beats:['popularity','currently shipped graph']},
        note:'History counts are a readiness estimate, not the held-out evaluation cohort. Enable learning consent before collecting shared-model feedback.'},null,2));
} finally {await client.end();}
