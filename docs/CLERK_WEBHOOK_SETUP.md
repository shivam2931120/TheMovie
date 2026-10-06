# Clerk deletion webhook setup

The Clerk publishable and server keys have been configured locally and verified
as belonging to the same instance. Keep them in ignored `.env.local`.

TheMovie writes account data directly through authenticated API routes. A webhook
is needed for automatic cleanup when an account is deleted in Clerk. The handler
already exists at `POST /api/webhooks/clerk`. It verifies the signature and deletes
the owner's stored account features, recommendation events and rate counters.
It keeps a minimal deletion marker to prevent stale imports recreating that data.

## Current development setup

Configured on 2026-10-06:

- ngrok agent authenticated using its private configuration outside the repository.
- Tunnel forwards `https://stole-contented-dean.ngrok-free.dev` to port 3000.
- Clerk development endpoint:
  `https://stole-contented-dean.ngrok-free.dev/api/webhooks/clerk`.
- Subscription: `user.deleted` only; the endpoint is enabled.
- The endpoint signing secret is stored in ignored `.env.local`.

The endpoint has already been created. Continue with the **Testing** tab in step 6
below to check delivery. Keep the app and ngrok running. If the tunnel URL changes,
update this existing endpoint in Clerk. Sample delivery and actual account cleanup
have not yet been verified. This configuration does not deploy the app to Vercel.

## Local development

1. Start the database, apply the schema and run the app:

   ```sh
   cd /home/shivam/TheMovie
   docker compose up -d db
   npm run db:migrate
   npm run dev -- --port 3000
   ```

2. Set up an [ngrok account and agent](https://ngrok.com/docs/getting-started/).
   Authenticate the agent using the instructions in your ngrok dashboard. In a
   second terminal, expose the app:

   ```sh
   ngrok http 3000
   ```

   Keep both processes running. Copy the HTTPS forwarding URL.

3. In the [Clerk Dashboard](https://dashboard.clerk.com/), select the application
   whose development Frontend API is `romantic-dogfish-8.clerk.accounts.dev`.
   Select its Development environment, then **Webhooks → Add Endpoint**.

4. Set the endpoint URL to your forwarding URL plus `/api/webhooks/clerk`, for
   example `https://YOUR-TUNNEL.ngrok-free.app/api/webhooks/clerk`. Subscribe to
   **`user.deleted`** and create the endpoint. The current handler only processes
   deletions; `user.created` and `user.updated` are unnecessary for this design.

5. Reveal and copy this endpoint's **Signing Secret**, beginning with `whsec_`.
   Add it to `/home/shivam/TheMovie/.env.local`:

   ```dotenv
   CLERK_WEBHOOK_SIGNING_SECRET=whsec_YOUR_ENDPOINT_SECRET
   ```

   This is different from `CLERK_SECRET_KEY`. Restart the Next.js dev server after
   saving it. Keep the secret out of commits and public environment variables.

6. Open the endpoint's **Testing** tab, select `user.deleted`, and use **Send
   Example**. Confirm the delivery is **Succeeded**, with HTTP 200. A sample event
   checks delivery and signature handling, but does not prove cleanup of a real
   account's data. To verify actual cleanup later, use a disposable account with
   saved app data, delete that account, and check the delivery and database rows.

If delivery fails: 404 means the URL/route or deployed version is wrong; a 400
response from this handler means signature verification failed; 503 means the
signing secret is missing or the deletion transaction/database is unavailable.
Inspect the attempt's response body to distinguish these cases. Replay failed
deliveries after fixing configuration.

## Deployment

Use a public HTTPS deployment that includes this updated route and a migrated
hosted PostgreSQL database. A localhost database cannot serve a remote deployment.
Configure matching Clerk keys, `DATABASE_URL`, and the endpoint's signing secret
on the hosting platform, then rebuild/redeploy. A tunnel endpoint's secret and a
separate production endpoint's secret are not interchangeable.

For a production Clerk instance, configure its own endpoint and production keys;
the currently supplied keys are development keys. Local configuration does not
update Vercel automatically.

Reference: [Clerk's webhook setup guide](https://clerk.com/docs/guides/development/webhooks/syncing).
