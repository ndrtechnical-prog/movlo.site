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
  category: "english" | "indian" | "chinese" | "dramas" | "others";
}

export type MovieCategory = "english" | "indian" | "chinese" | "dramas" | "others";

export const CATEGORY_LABELS: Record<MovieCategory, string> = {
  english: "English Movies",
  indian: "Indian Movies",
  chinese: "Chinese Movies",
  dramas: "Dramas",
  others: "Others"
};

const CACHED_DATA: Partial<Record<MovieCategory, JsonMovie[]>> = {};
let ALL_MOVIES_CACHE: JsonMovie[] | null = null;

const CATEGORY_FILE_MAP: Record<MovieCategory, string> = {
  english: "/data/english-movies.json",
  indian: "/data/indian-movies.json",
  chinese: "/data/chinese-movies.json",
  dramas: "/data/dramas.json",
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

export async function loadAllJsonMovies(): Promise<JsonMovie[]> {
  if (ALL_MOVIES_CACHE) {
    return ALL_MOVIES_CACHE;
  }

  const categories: MovieCategory[] = ["english", "indian", "chinese", "dramas", "others"];
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
    badge: movie.quality || "4K VIDEO",
    addedAt: new Date(Date.now() - (index + 1) * 3600000).toISOString(),
    addedAgo: index === 0 ? "Just now" : `${Math.min(24, index + 1)}h ago`,
    views: movie.views || 45000 + index * 1200,
    isAd: false
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

