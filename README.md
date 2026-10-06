# TheMovie - Movie Catalogue App

A modern Next.js movie catalogue application powered by **TMDB**, with Clerk authentication, custom lists, ratings, and watch progress features.

## Features

### Tracking and discovery

- **Episode tracking:** season and episode checkboxes, aired-season actions, progress, and the next unwatched aired episode. Specials are tracked separately.
- **Better search:** shareable query/filter/page URLs, keyboard autocomplete, pagination, and account-scoped recent searches.
- **Recommendation refresh:** fresh TMDB movie/TV candidates, weighted model blending,
  smoothed rating quality, compact taste controls, and deduplicated personal rows.
- **Measured learning:** `npm run ml:status` reports feedback readiness. Training
  compares SVD and item cosine on chronological windows and blocks unsupported
  promotions. See [ML documentation](ml/README.md).
- **Watch diary:** dated movie/TV viewings, rewatches, ratings, private notes, editing, monthly filters, and viewing statistics at `/diary`.
- **List management:** descriptions, filtering/sorting, manual ordering, bulk removal, and copying or moving selected titles between lists.
- **Recommendation controls:** hide watched titles, dismiss/restore suggestions, adjust variety, and view recommendation reasons.

The recommendation endpoint reranks the existing movie model using weighted ratings,
diary entries, saved titles, browsing, favorite genres, and negative feedback.
TV suggestions use personal taste and TMDB candidates rather than MovieLens movie IDs. The corrected
offline experiment did not improve on the existing baseline; the deployed model
artifacts remain unchanged. See [ML evaluation and results](ml/README.md).

Account features now persist in PostgreSQL with account-scoped local recovery,
legacy Clerk migration, revision conflict detection, and revocable shared lists.
Opt-in feedback supports movie/TV model training; TV suggestions also rank TMDB
candidates using personal taste and episode progress. See
[database and feedback setup](docs/DATABASE_AND_FEEDBACK.md) for migration,
consent controls, private exports, and measured-model promotion.

✨ **Movie Discovery**
- Search movies by title
- Browse with genre, year, and rating filters
- Detailed movie pages with cast, plot, and ratings

🎬 **Movie Management**
- Add movies to your watchlist
- Mark movies as watched
- PostgreSQL account storage with device recovery and legacy Clerk migration

🔐 **Authentication**
- Secure sign-in/sign-up with Clerk
- Per-user watchlists and watched lists
- Guest mode with localStorage fallback

📊 **Rich Metadata**
- IMDb, Rotten Tomatoes, Metacritic ratings
- Awards, box office, director, cast info
- High-quality movie posters

## Tech Stack

- **Next.js 16** + **React 19** - App Router and production-ready rendering
- **Tailwind CSS v4** - Styling with PostCSS
- **Clerk** - User authentication
- **TMDB API** - Movie, TV, trailer, cast, provider, and collection data
- **OMDB API** - Optional enrichment and fallback metadata
- **FM-DB API** - Optional IMDb poster and trailer fallback
- **Axios** - HTTP client

## Getting Started

### 1. Clone and Install

```bash
git clone https://github.com/shivam2931120/TheMovie.git
cd TheMovie
npm ci
```

### 2. Get API Keys

**TMDB API** (Required for movie and TV data)
1. Visit https://www.themoviedb.org/settings/api
2. Create or sign in to a TMDB account
3. Copy your API key

**Clerk** (Required for auth)
1. Visit https://dashboard.clerk.com
2. Create a new application
3. Copy your Publishable Key

**OMDB API** (Optional enrichment/fallback)
1. Visit https://www.omdbapi.com/apikey.aspx
2. Select FREE tier (1,000 requests/day)
3. Verify your email and copy the key

### 3. Environment Setup

Create `.env.local`:

```bash
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=your_clerk_key_here
NEXT_PUBLIC_TMDB_API_KEY=your_tmdb_key_here
NEXT_PUBLIC_OMDB_API_KEY=your_omdb_key_here
# Required for revocable shared-list links and Clerk server-side features
CLERK_SECRET_KEY=your_clerk_secret_key_here
```

### 4. Run Development Server

```bash
npm run dev
```

Visit http://localhost:3000

## Project Structure

```
src/
├── api/
│   ├── tmdb.js              # TMDB API integration
│   ├── omdb.js              # Optional OMDB helper
│   └── tastedive.js         # Optional TV recommendation helper
├── app/
│   ├── page.tsx             # Home
│   ├── movies/page.tsx      # Movie discovery
│   ├── tv/page.tsx          # TV discovery
│   ├── movie/[id]/page.tsx  # Movie details
│   ├── tv/[id]/page.tsx     # TV details
│   ├── search/page.tsx      # Advanced search
│   └── api/ai-recommend/    # Local recommendation endpoint
├── components/
│   ├── MovieCard.tsx        # Movie/TV tile component
│   ├── Hero.tsx             # Home hero carousel
│   ├── MovieRow.tsx         # Horizontal media row
│   ├── AdvancedFilters.tsx  # Discover filters and saved searches
│   └── Providers.tsx        # Client providers
├── context/
│   ├── WatchlistContext.jsx
│   ├── WatchedContext.jsx
│   ├── ListsContext.jsx
│   ├── ReviewContext.jsx
│   └── TVWatchProgressContext.tsx
└── proxy.ts                 # Optional Clerk server-side proxy
```

## API Integration

See [API_GUIDE.md](./API_GUIDE.md) for detailed OMDB API usage.

## Deployment

### Vercel (Recommended)

```bash
npm install -g vercel
vercel --prod
```

Add environment variables in Vercel dashboard:
- `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY`
- `NEXT_PUBLIC_TMDB_API_KEY`
- `NEXT_PUBLIC_OMDB_API_KEY` (optional)
- FM-DB does not require an API key; it is used automatically as an optional fallback
- `CLERK_SECRET_KEY` (required for account sync and revocable shared lists; must match the publishable key's Clerk instance)
- `DATABASE_URL` (server-only PostgreSQL connection; apply `npm run db:migrate`)
- `CLERK_WEBHOOK_SIGNING_SECRET` (required for verified account deletion cleanup)
- `ML_EXPORT_SECRET` (private stable key for offline feedback exports)

### Build for Production

```bash
npm run build
npm start
```

### Validation

```bash
npm test
npm run lint
npx tsc --noEmit
npm run build
```

The unit tests cover search state, list transfers/order, diary dates/statistics,
snapshot revisions, and recommendation ranking. Real TMDB responses and Clerk
account synchronization require configured credentials and separate runtime checks.

## Clerk Configuration

For custom auth pages to work:
1. Go to Clerk Dashboard → Paths
2. Select **"development host"** (not "Account Portal")
3. Set paths:
   - Sign-in: `/sign-in`
   - Sign-up: `/sign-up`
   - After sign-out: `/`

## License

MIT

## Credits

- Movie and TV data powered by [TMDB](https://www.themoviedb.org)
- Optional enrichment powered by [OMDb API](https://www.omdbapi.com)
- Authentication by [Clerk](https://clerk.com)
