import axios from "axios";

const BASE_URL = "https://api.tvmaze.com";

export const searchTvShows = async (query) => {
  const { data } = await axios.get(`${BASE_URL}/search/shows`, { params: { q: query } });
  return data.map(item => item.show);
};

export const getTvShowDetails = async (id) => {
  const { data } = await axios.get(`${BASE_URL}/shows/${id}`);
  return data;
};

export const getTvGenres = async () => {
  // TVmaze doesn't have a genre endpoint, so we aggregate from popular shows
  const { data } = await axios.get(`${BASE_URL}/shows`);
  const genres = new Set();
  data.forEach(show => show.genres.forEach(g => genres.add(g)));
  return Array.from(genres);
};
