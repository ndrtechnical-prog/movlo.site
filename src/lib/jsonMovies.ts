import { DramaSeries, SeriesEpisode, MovieClip } from "../types";

export interface JsonMovie {
  id: string;
  title: string;
  fullTitle?: string;
  videoUrl: string;
  youtubeId?: string;
  thumbnail: string;
  poster: string;
  backdrop?: string;
  duration?: string;
  year?: number;
  genre?: string;
  genres?: string[];
  rating?: number;
  views?: number;
  quality?: string;
  channel?: string;
  description?: string;
  category: "english" | "indian" | "chinese" | "dramas" | "historical" | "others";
  isSeries?: boolean;
  seriesId?: string;
  totalEpisodes?: number;
  episodeNumber?: number;
}

export type MovieCategory = "english" | "indian" | "chinese" | "dramas" | "historical" | "others";

export const CATEGORY_LABELS: Record<MovieCategory, string> = {
  english: "English Movies",
  indian: "Indian Movies",
  chinese: "Chinese Movies",
  dramas: "Turkish & Dramas",
  historical: "Historical Story",
  others: "Others"
};

const CACHED_DATA: Partial<Record<MovieCategory, JsonMovie[]>> = {};
let ALL_MOVIES_CACHE: JsonMovie[] | null = null;
let ALL_SERIES_CACHE: DramaSeries[] | null = null;

const CATEGORY_FILE_MAP: Record<MovieCategory, string> = {
  english: "/data/english-movies.json",
  indian: "/data/indian-movies.json",
  chinese: "/data/chinese-movies.json",
  dramas: "/data/dramas.json",
  historical: "/data/historical.json",
  others: "/data/others.json"
};

export async function loadMoviesByCategory(category: MovieCategory): Promise<JsonMovie[]> {
  if (CACHED_DATA[category]) {
    return CACHED_DATA[category]!;
  }

  const filePath = CATEGORY_FILE_MAP[category];
  try {
    const res = await fetch(filePath);
    if (!res.ok) {
      throw new Error(`Failed to load ${filePath}: ${res.status}`);
    }
    const data: JsonMovie[] = await res.json();
    CACHED_DATA[category] = data;
    return data;
  } catch (err) {
    console.error(`Error loading category ${category}:`, err);
    return [];
  }
}

export async function loadAllSeries(): Promise<DramaSeries[]> {
  if (ALL_SERIES_CACHE) return ALL_SERIES_CACHE;
  try {
    const res = await fetch("/data/series.json");
    if (!res.ok) throw new Error("Failed to load series.json");
    const data: DramaSeries[] = await res.json();
    ALL_SERIES_CACHE = data;
    return data;
  } catch (err) {
    console.error("Error loading series.json:", err);
    return [];
  }
}

export async function getSeriesById(id: string): Promise<DramaSeries | null> {
  const all = await loadAllSeries();
  return all.find((s) => s.id === id) || null;
}

export async function loadAllJsonMovies(): Promise<JsonMovie[]> {
  if (ALL_MOVIES_CACHE) {
    return ALL_MOVIES_CACHE;
  }

  const categories: MovieCategory[] = ["indian", "dramas", "historical", "english", "chinese", "others"];
  const lists = await Promise.all(categories.map((cat) => loadMoviesByCategory(cat)));
  const combined = lists.flat();
  ALL_MOVIES_CACHE = combined;
  return combined;
}

export async function searchJsonMovies(query: string): Promise<JsonMovie[]> {
  const clean = query.trim().toLowerCase();
  if (!clean) return [];

  const allMovies = await loadAllJsonMovies();
  return allMovies.filter((movie) => {
    const titleMatch = movie.title.toLowerCase().includes(clean);
    const fullTitleMatch = movie.fullTitle?.toLowerCase().includes(clean);
    const genreMatch = movie.genre?.toLowerCase().includes(clean) || movie.genres?.some(g => g.toLowerCase().includes(clean));
    const channelMatch = movie.channel?.toLowerCase().includes(clean);
    const descMatch = movie.description?.toLowerCase().includes(clean);
    return titleMatch || fullTitleMatch || genreMatch || channelMatch || descMatch;
  });
}

// Convert SeriesEpisode to MovieClip for playing in 4K player
export function seriesEpisodeToClip(ep: SeriesEpisode, series?: DramaSeries | null): MovieClip {
  return {
    id: ep.id,
    movieId: 0,
    movieTitle: series?.title || ep.seriesTitle || "Drama Series",
    clipTitle: ep.title,
    videoUrl: ep.videoUrl,
    thumbnail: ep.thumbnail,
    poster: ep.thumbnail,
    backdrop: ep.backdrop || series?.backdrop || ep.thumbnail,
    duration: ep.duration || "Full Episode",
    year: series?.year || 2024,
    genre: series?.genre || "Drama",
    genres: series?.genres || ["Turkish Drama", "Urdu Dubbed"],
    rating: series?.rating || 9.2,
    quality: "1080p HD",
    description: ep.fullTitle || series?.description || `Watch ${ep.title} in HD with Urdu Dubbed.`,
    views: ep.views || 350000,
    likes: 12000,
    isTrending: true,
    isMostWatched: true,
    publishedAt: new Date().toISOString(),
    tags: ["Turkish Drama", "Urdu Dubbed", series?.title || "Drama"],
    seo: {
      title: `${ep.title} Urdu Dubbed | Movlo Movies`,
      description: ep.fullTitle || `Watch ${ep.title} online free in HD on Movlo Movies`,
      keywords: ["Turkish drama", "Urdu dubbed", ep.title, series?.title || "Drama"]
    }
  };
}

// Helper to map JsonMovie to RecentAddedItem for existing movie card UI
export function jsonMovieToRecentItem(movie: JsonMovie, index: number = 0): any {
  return {
    id: movie.id,
    itemType: "video_link",
    title: movie.title,
    subtitle: movie.channel || movie.fullTitle || `${CATEGORY_LABELS[movie.category]} Feature`,
    poster: movie.thumbnail || movie.poster,
    backdrop: movie.backdrop || movie.thumbnail || movie.poster,
    videoUrl: movie.videoUrl,
    duration: movie.duration || "Full Movie",
    year: movie.year || 2026,
    rating: movie.rating || 9.2,
    quality: movie.quality || "1080p HD",
    genre: movie.genre || CATEGORY_LABELS[movie.category],
    genres: movie.genres || [movie.genre || CATEGORY_LABELS[movie.category], "Cinema"],
    description: movie.description || `Watch ${movie.title} in high definition.`,
    badge: movie.isSeries ? `${movie.totalEpisodes || ""} EPISODES` : (movie.quality || "4K VIDEO"),
    addedAt: new Date(Date.now() - (index + 1) * 3600000).toISOString(),
    addedAgo: index === 0 ? "Just now" : `${Math.min(24, index + 1)}h ago`,
    views: movie.views || 45000 + index * 1200,
    isAd: false,
    isSeries: movie.isSeries,
    seriesId: movie.seriesId,
    totalEpisodes: movie.totalEpisodes,
    episodeNumber: movie.episodeNumber
  };
}

// Helper to map JsonMovie to Movie interface for RecentWatchSection & details
export function jsonMovieToMovie(movie: JsonMovie, index: number = 0): any {
  // Generate a stable positive integer ID from the string ID
  let hash = 0;
  for (let i = 0; i < movie.id.length; i++) {
    hash = (hash << 5) - hash + movie.id.charCodeAt(i);
    hash |= 0;
  }
  const numericId = Math.abs(hash) + 10000;

  return {
    id: numericId,
    title: movie.title,
    year: movie.year || 2026,
    userRating: movie.rating || 9.2,
    criticScore: 90,
    description: movie.description || movie.fullTitle || `Stream ${movie.title} in high definition.`,
    poster: movie.thumbnail || movie.poster,
    backdrop: movie.backdrop || movie.thumbnail || movie.poster,
    genres: movie.genres || [movie.genre || CATEGORY_LABELS[movie.category]],
    runtime: 120,
    usRating: "PG-13",
    trailer: movie.videoUrl,
    type: "movie",
    liveViewers: 12 + (index % 10) * 3
  };
}

