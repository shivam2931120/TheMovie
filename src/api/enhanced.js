import { searchMovies as omdbSearch } from "./omdb";
import { getSimilarTvShows } from "./tastedive";

export const enhancedMovieSearch = async (query, page = 1) => {
  try {
    const omdbResults = await omdbSearch(query, page);
    
    if (omdbResults.results && omdbResults.results.length > 0) {
      return omdbResults;
    }
    
    try {
      const tasteDiveResults = await getSimilarTvShows(query, 10);
      
      const transformedResults = tasteDiveResults.map((item, idx) => ({
        id: `td-${idx}`,
        title: item.name,
        poster_path: null, 
        release_date: null,
        vote_average: null,
      }));
      
      return {
        results: transformedResults,
        page: 1,
        total_results: transformedResults.length,
        total_pages: 1,
      };
    } catch (tdError) {
      console.error("TasteDive fallback failed:", tdError);
    }
    
    return omdbResults; 
  } catch (error) {
    console.error("Enhanced search error:", error);
    return { results: [], page: 1, total_results: 0, total_pages: 0 };
  }
};
export const enhancedDiscover = async ({ page = 1, genreId } = {}) => {
  const genres = [
    { id: 1, name: "Action" },
    { id: 2, name: "Comedy" },
    { id: 3, name: "Drama" },
    { id: 4, name: "Horror" },
    { id: 5, name: "Sci-Fi" },
    { id: 6, name: "Thriller" },
    { id: 7, name: "Romance" },
    { id: 8, name: "Adventure" },
    { id: 9, name: "Animation" },
    { id: 10, name: "Crime" },
    { id: 11, name: "Fantasy" },
    { id: 12, name: "Mystery" },
  ];
  
  const genre = genres.find(g => g.id === parseInt(genreId));
  const searchTerm = genre ? genre.name : "2024"; 
  
  return enhancedMovieSearch(searchTerm, page);
};
export const enhancedPopular = async (page = 1) => {
  const popularSearches = [
    'avengers', 'batman', 'superman', 'inception', 'godfather',
    'dark knight', 'pulp fiction', 'matrix', 'interstellar', 'gladiator'
  ];
  
  const searchTerm = popularSearches[(page - 1) % popularSearches.length];
  return enhancedMovieSearch(searchTerm, page);
};
