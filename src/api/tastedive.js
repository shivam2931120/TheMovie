import axios from "axios";

const BASE_URL = "https://tastedive.com/api/similar";

let cachedTasteDiveKey = null;

async function getTasteDiveApiKey() {
  if (cachedTasteDiveKey) return cachedTasteDiveKey;
  const envKey = import.meta.env.VITE_TASTEDIVE_API_KEY;
  if (envKey && typeof envKey === "string" && envKey.trim()) {
    cachedTasteDiveKey = envKey.trim();
    return cachedTasteDiveKey;
  }
  throw new Error(
    "TasteDive API key is missing. Set VITE_TASTEDIVE_API_KEY in .env. Get one free at: https://tastedive.com/read/api"
  );
}

export const getSimilarTvShows = async (showTitle, limit = 10) => {
  const apiKey = await getTasteDiveApiKey();
  const { data } = await axios.get(BASE_URL, {
    params: {
      k: apiKey,
      q: showTitle,
      type: "shows",
      limit,
      info: 1,
    },
  });
  if (!data || !data.Similar || !data.Similar.Results) return [];
  return data.Similar.Results.map((item) => ({
    name: item.Name,
    type: item.Type,
    wTeaser: item.wTeaser,
    wUrl: item.wUrl,
    yID: item.yID,
    yUrl: item.yUrl,
  }));
};
