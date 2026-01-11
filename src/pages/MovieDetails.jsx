import { Link, useParams } from "react-router-dom";
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { enhancedMovieDetails, enhancedSimilarMovies, getTrailerKey } from "../api/enhanced";
import Container from "../components/Container";
import MovieCard from "../components/MovieCard";
import WatchlistButton from "../components/WatchlistButton";
import WatchedButton from "../components/WatchedButton";
import VideoPlayer from "../components/VideoPlayer";
import UserReviewForm from "../components/UserReviewForm";
import ReviewSection from "../components/ReviewSection";
import ShareButton from "../components/ShareButton";
import { queryKeys } from "../lib/queryClient";

export default function MovieDetails() {
  const { id } = useParams();
  const [showTrailer, setShowTrailer] = useState(false);
  const [activeTab, setActiveTab] = useState("overview");

  const { data: movie, isLoading: movieLoading, error: movieError } = useQuery({
    queryKey: queryKeys.movies.details(id),
    queryFn: () => enhancedMovieDetails(id),
    enabled: !!id,
  });

  const { data: similarData } = useQuery({
    queryKey: queryKeys.movies.similar(id, 1),
    queryFn: () => enhancedSimilarMovies(id, 1),
    enabled: !!id,
  });

  const { data: trailerKey } = useQuery({
    queryKey: queryKeys.movies.trailer(id),
    queryFn: () => getTrailerKey(id),
    enabled: !!id,
  });

  const similar = similarData?.results || movie?.similar?.results || movie?.recommendations?.results || [];

  if (movieLoading) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <div className="h-12 w-12 animate-spin rounded-full border-4 border-[#1A1A1A] border-t-[#E10600]" />
      </div>
    );
  }

  if (movieError || !movie) {
    return (
      <Container className="py-20 text-center">
        <p className="text-neutral-400">Failed to load movie details</p>
        <Link to="/" className="mt-4 inline-block text-[#E10600] hover:text-[#FF4444]">
          ← Back to Home
        </Link>
      </Container>
    );
  }

  const backdrop = movie.backdrop_path
    ? movie.backdrop_path.startsWith('http')
      ? movie.backdrop_path
      : `https://image.tmdb.org/t/p/original${movie.backdrop_path}`
    : null;

  const poster = movie.poster_path
    ? movie.poster_path.startsWith('http')
      ? movie.poster_path
      : `https://image.tmdb.org/t/p/w500${movie.poster_path}`
    : "/placeholder.png";

  const cast = movie.credits?.cast?.slice(0, 10) || [];

  return (
    <div>
      {/* Backdrop Hero */}
      <div className="relative">
        {backdrop && (
          <div className="absolute inset-0 -z-10">
            <img src={backdrop} alt="Backdrop" className="h-96 w-full object-cover opacity-30" />
            <div className="absolute inset-0 bg-gradient-to-b from-[#070707]/70 via-[#070707]/90 to-[#070707]" />
          </div>
        )}

        <Container className="pt-8">
          <div className="flex items-center justify-between mb-4">
            <Link to="/" className="text-sm text-neutral-300 hover:text-[#E10600] transition">← Back</Link>
            <ShareButton
              title={movie.title}
              text={`Check out "${movie.title}" on TheMovie!`}
            />
          </div>

          <div className="grid grid-cols-1 gap-8 md:grid-cols-[300px,1fr]">
            {/* Poster */}
            <div className="relative group">
              <img
                className="w-full max-w-[300px] rounded-xl shadow-2xl shadow-[#E10600]/10 mx-auto"
                src={poster}
                alt={movie.title}
              />
              {trailerKey && (
                <button
                  onClick={() => setShowTrailer(true)}
                  className="absolute inset-0 flex items-center justify-center bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity rounded-xl"
                >
                  <span className="flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-r from-[#E10600] to-[#B80500] text-2xl text-white shadow-xl shadow-[#E10600]/30">
                    ▶
                  </span>
                </button>
              )}
            </div>

            {/* Info */}
            <div>
              <div className="flex flex-wrap items-center gap-3 mb-4">
                <h1 className="text-3xl font-bold text-white md:text-4xl">{movie.title}</h1>
                <WatchlistButton movie={movie} size="md" />
                <WatchedButton movie={movie} size="md" />
              </div>

              {/* Meta info */}
              <div className="flex flex-wrap items-center gap-4 text-neutral-300 mb-4">
                {movie.vote_average && (
                  <span className="flex items-center gap-1 text-[#E10600] font-bold">
                    ⭐ {movie.vote_average.toFixed?.(1) || movie.vote_average}
                  </span>
                )}
                {movie.runtime && <span>{movie.runtime} min</span>}
                {movie.release_date && <span>{movie.release_date}</span>}
                {movie.boxOffice && <span className="text-[#22C55E]">{movie.boxOffice}</span>}
              </div>

              {/* Genres */}
              {movie.genres?.length > 0 && (
                <div className="flex flex-wrap gap-2 mb-4">
                  {movie.genres.map((g) => (
                    <span
                      key={g.id || g.name}
                      className="rounded-full border border-[#2A2A2A] px-3 py-1 text-sm text-neutral-300 hover:border-[#E10600] transition"
                    >
                      {g.name}
                    </span>
                  ))}
                </div>
              )}

              {/* Additional Ratings */}
              <div className="flex flex-wrap gap-4 mb-6">
                {movie.imdbRating && (
                  <div className="rounded-lg bg-[#F59E0B]/20 border border-[#F59E0B]/30 px-3 py-2 text-center">
                    <p className="text-xs text-neutral-400">IMDb</p>
                    <p className="font-bold text-[#F59E0B]">{movie.imdbRating}</p>
                  </div>
                )}
                {movie.rottenTomatoes && (
                  <div className="rounded-lg bg-[#E10600]/20 border border-[#E10600]/30 px-3 py-2 text-center">
                    <p className="text-xs text-neutral-400">Rotten Tomatoes</p>
                    <p className="font-bold text-[#FF4444]">{movie.rottenTomatoes}</p>
                  </div>
                )}
                {movie.metacritic && (
                  <div className="rounded-lg bg-[#22C55E]/20 border border-[#22C55E]/30 px-3 py-2 text-center">
                    <p className="text-xs text-neutral-400">Metacritic</p>
                    <p className="font-bold text-[#22C55E]">{movie.metacritic}</p>
                  </div>
                )}
              </div>

              {/* Play Trailer Button */}
              {trailerKey && (
                <button
                  onClick={() => setShowTrailer(true)}
                  className="mb-6 inline-flex items-center gap-2 rounded-lg bg-gradient-to-r from-[#E10600] to-[#B80500] px-6 py-3 font-semibold text-white shadow-lg shadow-[#E10600]/30 transition hover:shadow-[#E10600]/50 hover:scale-105"
                >
                  <span>▶</span> Watch Trailer
                </button>
              )}

              {/* Awards */}
              {movie.awards && movie.awards !== "N/A" && (
                <div className="mb-4 rounded-lg border border-[#F59E0B]/30 bg-[#F59E0B]/10 px-4 py-2">
                  <span className="mr-2">🏆</span>
                  <span className="text-[#F59E0B]">{movie.awards}</span>
                </div>
              )}
            </div>
          </div>
        </Container>
      </div>

      {/* Trailer Modal */}
      {showTrailer && trailerKey && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 p-4"
          onClick={() => setShowTrailer(false)}
        >
          <div
            className="relative w-full max-w-4xl"
            onClick={e => e.stopPropagation()}
          >
            <button
              onClick={() => setShowTrailer(false)}
              className="absolute -right-2 -top-12 text-3xl text-white hover:text-[#E10600] transition"
            >
              ×
            </button>
            <VideoPlayer videoKey={trailerKey} autoplay className="aspect-video w-full rounded-xl overflow-hidden" />
          </div>
        </div>
      )}

      {/* Tabs */}
      <Container className="py-8">
        <div className="flex gap-4 border-b border-[#1A1A1A] mb-6">
          {["overview", "cast", "reviews"].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`pb-3 text-sm font-medium capitalize transition ${activeTab === tab
                  ? "border-b-2 border-[#E10600] text-white"
                  : "text-neutral-400 hover:text-white"
                }`}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* Overview Tab */}
        {activeTab === "overview" && (
          <div>
            <p className="text-neutral-200 leading-relaxed max-w-4xl">{movie.overview}</p>

            <div className="mt-6 grid gap-4 sm:grid-cols-2">
              {movie.director && movie.director !== "N/A" && (
                <div>
                  <p className="text-sm text-neutral-500">Director</p>
                  <p className="text-white">{movie.director}</p>
                </div>
              )}
              {movie.actors && movie.actors !== "N/A" && (
                <div>
                  <p className="text-sm text-neutral-500">Starring</p>
                  <p className="text-white">{movie.actors}</p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Cast Tab */}
        {activeTab === "cast" && (
          <div>
            {cast.length > 0 ? (
              <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
                {cast.map((person) => (
                  <div key={person.id} className="rounded-xl bg-[#0D0D0D] border border-[#1A1A1A] p-3 text-center hover:border-[#E10600]/50 transition">
                    <img
                      src={person.profile_path
                        ? `https://image.tmdb.org/t/p/w185${person.profile_path}`
                        : "/placeholder.png"
                      }
                      alt={person.name}
                      className="mx-auto h-24 w-24 rounded-full object-cover mb-2"
                    />
                    <p className="font-medium text-white truncate">{person.name}</p>
                    <p className="text-sm text-neutral-400 truncate">{person.character}</p>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-neutral-500">No cast information available.</p>
            )}
          </div>
        )}

        {/* Reviews Tab */}
        {activeTab === "reviews" && (
          <div className="space-y-6">
            <UserReviewForm
              movieId={movie.id}
              movieTitle={movie.title}
              poster={movie.poster_path}
            />
            <ReviewSection
              movieId={movie.id}
              movieTitle={movie.title}
              poster={movie.poster_path}
            />
          </div>
        )}
      </Container>

      {/* Similar Movies */}
      {similar?.length > 0 && (
        <Container className="py-10">
          <h2 className="mb-6 text-xl font-semibold text-white">You Might Also Like</h2>
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
            {similar.slice(0, 12).map((m) => (
              <MovieCard key={m.id} movie={m} />
            ))}
          </div>
        </Container>
      )}
    </div>
  );
}
