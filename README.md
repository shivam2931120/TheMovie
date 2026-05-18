# TheMovie - Movie Catalogue App

A modern Next.js movie catalogue application powered by **TMDB**, with Clerk authentication, custom lists, ratings, and watch progress features.

## Features

✨ **Movie Discovery**
- Search movies by title
- Browse with genre, year, and rating filters
- Detailed movie pages with cast, plot, and ratings

🎬 **Movie Management**
- Add movies to your watchlist
- Mark movies as watched
- Persistent storage with Clerk user metadata

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
- **Axios** - HTTP client

## Getting Started

### 1. Clone and Install

```bash
git clone <your-repo>
cd movie-catalogue
npm install
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
# Optional, only for Clerk server-side auth/proxy features
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
- `CLERK_SECRET_KEY` (optional, only for Clerk server-side auth/proxy features)

### Build for Production

```bash
npm run build
npm start
```

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
