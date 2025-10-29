# 🔐 Authentication Setup Guide

## Quick Setup Steps

### 1. Create a Clerk Account

1. Go to https://clerk.com
2. Click "Get Started Free"
3. Sign up with email or GitHub
4. Create a new application:
   - Application name: "Movie Catalogue"
   - Choose your sign-in options (Email, Google, GitHub, etc.)

### 2. Get Your Publishable Key

1. In Clerk Dashboard, go to **API Keys**
2. Copy your **Publishable Key** (starts with `pk_test_...` or `pk_live_...`)
3. Add it to your `.env` file:

```env
VITE_CLERK_PUBLISHABLE_KEY=pk_test_your_key_here
```

### 3. Configure Clerk Paths

In Clerk Dashboard → **Paths**:

- **Sign-in URL**: `/sign-in`
- **Sign-up URL**: `/sign-up`
- **After sign-in URL**: `/`
- **After sign-up URL**: `/`

### 4. Enable Social Logins (Optional)

In Clerk Dashboard → **User & Authentication** → **Social Connections**:

- Enable Google
- Enable GitHub
- Enable any other providers you want

### 5. Test Your Setup

1. Start your dev server:
   ```bash
   npm run dev
   ```

2. Open http://localhost:5173

3. Click "Sign In" button

4. Create an account or sign in

5. Try adding movies to your watchlist

6. Sign out and sign back in - your watchlist should persist!

## Features You Get

✅ **Sign In / Sign Up**
- Email + Password
- Social logins (Google, GitHub, etc.)
- Email verification
- Password reset

✅ **User Profile**
- Profile photo
- User metadata
- Account settings
- Sign out

✅ **Protected Routes**
- Watchlist page requires authentication
- Automatic redirect to sign-in

✅ **Per-User Watchlist**
- Each user has their own watchlist
- Syncs across devices
- Persists in Clerk user metadata

✅ **Guest Mode Fallback**
- Not signed in? Watchlist uses localStorage
- Sign in to sync across devices

## Deployment to Vercel

### Option 1: Vercel Dashboard

1. Go to https://vercel.com
2. Import your GitHub repository
3. Add environment variables:
   - `VITE_TMDB_API_KEY` = your TMDB key
   - `VITE_CLERK_PUBLISHABLE_KEY` = your Clerk key
4. Deploy!

### Option 2: Vercel CLI

```bash
# Install Vercel CLI
npm i -g vercel

# Login
vercel login

# Deploy
vercel

# Add environment variables
vercel env add VITE_TMDB_API_KEY
vercel env add VITE_CLERK_PUBLISHABLE_KEY

# Deploy to production
vercel --prod
```

## Troubleshooting

### "Missing Clerk Configuration" Error

**Problem**: Yellow warning box saying Clerk key is missing

**Solution**: 
1. Check your `.env` file has `VITE_CLERK_PUBLISHABLE_KEY`
2. Restart your dev server: `npm run dev`
3. Make sure the key starts with `pk_test_` or `pk_live_`

### Sign-in redirects to wrong URL

**Problem**: After signing in, you're redirected to the wrong page

**Solution**:
1. Check Clerk Dashboard → Paths
2. Make sure "After sign-in URL" is set to `/`
3. Clear your browser cache

### Watchlist not persisting

**Problem**: Watchlist disappears after refresh

**Solution**:
1. Make sure you're signed in
2. Check browser console for errors
3. Verify Clerk is configured correctly
4. Try signing out and back in

### "Failed to load movies" error

**Problem**: Movies not loading

**Solution**:
1. Check `VITE_TMDB_API_KEY` is set in `.env`
2. Verify your TMDB API key is valid
3. Check browser console for API errors
4. Try clearing filters (Year: 2025 + Rating: 9+ might have no results)

## Advanced: Webhook Integration

For production apps, you can set up Clerk webhooks to:
- Store watchlist in your own database
- Send welcome emails
- Track user events
- Sync with other services

See: https://clerk.com/docs/integrations/webhooks

## Security Notes

- ✅ Never commit `.env` file (it's in `.gitignore`)
- ✅ Use `VITE_` prefix for client-side env vars
- ✅ Clerk keys starting with `pk_` are safe for client-side
- ⚠️ Never expose secret keys (starting with `sk_`) in client code

## Cost

- **Clerk Free Tier**: 
  - 10,000 monthly active users
  - Unlimited sign-ins
  - Social logins included
  - Perfect for personal projects!

- **TMDB API**: 
  - Completely free for non-commercial use
  - 40 requests per 10 seconds

## Next Steps

🎯 **Customize Sign-in UI**
- Clerk Dashboard → Customization
- Match your app's theme

🎯 **Add Email Templates**
- Customize welcome emails
- Verification emails

🎯 **Set up Production**
- Get production Clerk keys
- Deploy to Vercel
- Add custom domain

## Support

- Clerk Docs: https://clerk.com/docs
- Clerk Discord: https://clerk.com/discord
- TMDB Docs: https://developers.themoviedb.org/
