import { Link, useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import { getMovieDetails, getSimilarMovies } from "../api/omdb";
import Container from "../components/Container";
import MovieCard from "../components/MovieCard";
import WatchlistButton from "../components/WatchlistButton";
import WatchedButton from "../components/WatchedButton";

export default function MovieDetails() {
  const { id } = useParams();
  const [movie, setMovie] = useState(null);
  const [similar, setSimilar] = useState([]);
  const [loading, setLoading] = useState(true);
  const [tvLoading, setTvLoading] = useState(false);
  const [tvResults, setTvResults] = useState([]);
  const [tvError, setTvError] = useState("");

  useEffect(() => {
    const run = async () => {
      setLoading(true);
      try {
        const details = await getMovieDetails(id);
        setMovie(details);
        const sim = await getSimilarMovies(id);
        setSimilar(sim || []);
      } finally {
        setLoading(false);
      }
    };
    run();
  }, [id]);

  const handleTvRecommend = async () => {
    setTvLoading(true);
    setTvError("");
    setTvResults([]);
    try {
      const { getSimilarTvShows } = await import("../api/tastedive");
      const recs = await getSimilarTvShows(movie.title, 6);
      setTvResults(recs);
      if (recs.length === 0) setTvError("No TV recommendations found.");
    } catch {
      setTvError("Failed to fetch TV recommendations.");
    } finally {
      setTvLoading(false);
    }
  };

  if (!movie || loading) return <p className="mt-20 text-center text-neutral-400">Loading...</p>;

  const backdrop = movie.backdrop_path && movie.backdrop_path.startsWith('http')
    ? movie.backdrop_path
    : movie.backdrop_path
    ? `https://image.tmdb.org/t/p/original${movie.backdrop_path}`
    : null;
    
  const poster = movie.poster_path && movie.poster_path.startsWith('http')
    ? movie.poster_path
    : movie.poster_path
    ? `https://image.tmdb.org/t/p/w500${movie.poster_path}`
    : "/placeholder.png";
    
  return (
    <div>
      <div className="relative">
        {backdrop && (
          <div className="absolute inset-0 -z-10">
            <img src={backdrop} alt="Backdrop" className="h-64 w-full object-cover opacity-30" />
            <div className="absolute inset-0 bg-gradient-to-b from-neutral-950/70 to-neutral-950" />
          </div>
        )}
        <Container className="pt-8">
          <Link to="/" className="text-sm text-neutral-300 hover:text-white">← Back</Link>
          <div className="mt-4 grid grid-cols-1 gap-6 md:grid-cols-[180px,1fr]">
            <img
              className="h-auto w-44 rounded-lg shadow-lg md:w-48"
              src={poster}
              alt={movie.title}
            />
            <div>
              <div className="flex items-center gap-3">
                <h1 className="text-3xl font-bold text-white">{movie.title}</h1>
                <div className="ml-1 flex items-center gap-2">
                  <WatchlistButton movie={movie} size="md" />
                  <WatchedButton movie={movie} size="md" />
                </div>
              </div>
              <div className="mt-2 text-sm text-neutral-300">
                <span className="mr-2">⭐ {movie.vote_average?.toFixed?.(1)}</span>
                <span className="mr-2">{movie.runtime} min</span>
                <span>{movie.release_date}</span>
              </div>
              <p className="mt-4 max-w-3xl text-neutral-200">{movie.overview}</p>
              {movie.genres?.length ? (
                <div className="mt-4 flex flex-wrap gap-2">
                  {movie.genres.map((g) => (
                    <span key={g.id} className="rounded-full border border-neutral-700 px-2 py-1 text-xs text-neutral-300">{g.name}</span>
                  ))}
                </div>
              ) : null}
            </div>
          </div>
        </Container>
      </div>

      {similar?.length ? (
        <Container className="py-10">
          <h2 className="mb-4 text-lg font-semibold">Similar movies</h2>
          <div className="grid grid-cols-[repeat(auto-fill,_minmax(160px,_1fr))] gap-4 sm:gap-5 md:gap-6">
            {similar.slice(0, 10).map((m) => (
              <MovieCard key={m.id} movie={m} />
            ))}
          </div>
        </Container>
      ) : null}

      <Container className="py-10">
        <h2 className="mb-4 text-lg font-semibold">TV Recommendations</h2>
        <button
          onClick={handleTvRecommend}
          className="ml-2 rounded bg-purple-600 px-3 py-1.5 text-sm text-white font-semibold hover:bg-purple-700"
          disabled={tvLoading}
        >
          {tvLoading ? "Finding TV Shows..." : "Find Similar TV Shows"}
        </button>
        {tvError && <p className="mt-2 text-red-400 text-sm">{tvError}</p>}
        {tvResults.length > 0 && (
          <div className="mt-4">
            <h3 className="mb-2 text-base font-bold text-white">Recommended TV Shows</h3>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              {tvResults.map((show, idx) => (
                <div key={idx} className="rounded border border-neutral-700 bg-neutral-900 p-3">
                  <div className="font-semibold text-white">{show.name}</div>
                  <div className="text-xs text-neutral-300 mb-1">{show.wTeaser}</div>
                  <div className="flex gap-2">
                    {show.wUrl && <a href={show.wUrl} target="_blank" rel="noreferrer" className="text-xs text-blue-400 underline">Wikipedia</a>}
                    {show.yUrl && <a href={show.yUrl} target="_blank" rel="noreferrer" className="text-xs text-red-400 underline">YouTube</a>}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </Container>
    </div>
  );
}
