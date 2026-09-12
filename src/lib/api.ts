import { Movie, StreamingSource, Genre, SearchResultItem, ApiResponse, MovieClip, RelatedClipsResponse, UnifiedSearchResponse, AdBanner, UpcomingMovie } from "../types";
import { INDIAN_MOVIES_RECENT_ITEMS, INDIAN_MOVIES_CLIPS } from "../data/indianMovies";

export const FALLBACK_POSTER = "/movie-placeholder.svg";

export const CINEMA_FALLBACK_POSTERS = [
  "https://images.unsplash.com/photo-1534447677768-be436bb09401?w=800&auto=format&fit=crop&q=80",
  "https://images.unsplash.com/photo-1440404653325-ab127d49abc1?w=800&auto=format&fit=crop&q=80",
  "https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=800&auto=format&fit=crop&q=80",
  "https://images.unsplash.com/photo-1578632767115-351597cf2477?w=800&auto=format&fit=crop&q=80",
  "https://images.unsplash.com/photo-1509281373149-e957c6296406?w=800&auto=format&fit=crop&q=80",
  "https://images.unsplash.com/photo-1635805737707-575885ab0820?w=800&auto=format&fit=crop&q=80",
  "https://images.unsplash.com/photo-1536440136628-849c177e76a1?w=800&auto=format&fit=crop&q=80",
  "https://images.unsplash.com/photo-1513151233558-d860c5398176?w=800&auto=format&fit=crop&q=80",
  "https://images.unsplash.com/photo-1579783902614-a3fb3927b675?w=800&auto=format&fit=crop&q=80",
  "https://images.unsplash.com/photo-1514565131-fce0801e5785?w=800&auto=format&fit=crop&q=80"
];

export function getCinemaPosterFallback(id: number | string): string {
  let num = 0;
  if (typeof id === "number") {
    num = Math.abs(id);
  } else if (typeof id === "string") {
    for (let i = 0; i < id.length; i++) {
      num += id.charCodeAt(i);
    }
  }
  const index = num % CINEMA_FALLBACK_POSTERS.length;
  return CINEMA_FALLBACK_POSTERS[index];
}

export async function fetchServerStatus(): Promise<{ hasApiKey: boolean; defaultRegion: string }> {
  try {
    const res = await fetch("/api/status");
    if (!res.ok) throw new Error("Status check failed");
    const json = await res.json();
    return {
      hasApiKey: Boolean(json.hasApiKey),
      defaultRegion: json.defaultRegion || "US"
    };
  } catch {
    return { hasApiKey: false, defaultRegion: "US" };
  }
}

export const CURATED_FALLBACK_MOVIES: Movie[] = [
  {
    id: 101,
    title: "Dune: Part Two",
    year: 2024,
    userRating: 8.8,
    criticScore: 92,
    description: "Paul Atreides unites with Chani and the Fremen while seeking revenge against the conspirators who destroyed his family.",
    poster: "https://images.unsplash.com/photo-1534447677768-be436bb09401?w=800&auto=format&fit=crop&q=80",
    backdrop: "https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=1200&auto=format&fit=crop&q=80",
    genres: ["Sci-Fi", "Adventure"],
    runtime: 166,
    usRating: "PG-13",
    trailer: "https://www.youtube.com/watch?v=Way9Dexny3w",
    type: "movie"
  },
  {
    id: 102,
    title: "Oppenheimer",
    year: 2023,
    userRating: 8.9,
    criticScore: 93,
    description: "The story of American scientist J. Robert Oppenheimer and his role in the development of the atomic bomb.",
    poster: "https://images.unsplash.com/photo-1440404653325-ab127d49abc1?w=800&auto=format&fit=crop&q=80",
    backdrop: "https://images.unsplash.com/photo-1579783902614-a3fb3927b675?w=1200&auto=format&fit=crop&q=80",
    genres: ["Biography", "Drama", "History"],
    runtime: 180,
    usRating: "R",
    trailer: "https://www.youtube.com/watch?v=uYPbbksJxIg",
    type: "movie"
  },
  {
    id: 103,
    title: "Interstellar",
    year: 2014,
    userRating: 8.7,
    criticScore: 86,
    description: "When Earth becomes uninhabitable in the future, a farmer and ex-NASA pilot is tasked to pilot a spacecraft along with a team of researchers.",
    poster: "https://images.unsplash.com/photo-1509281373149-e957c6296406?w=800&auto=format&fit=crop&q=80",
    backdrop: "https://images.unsplash.com/photo-1536440136628-849c177e76a1?w=1200&auto=format&fit=crop&q=80",
    genres: ["Sci-Fi", "Drama"],
    runtime: 169,
    usRating: "PG-13",
    trailer: "https://www.youtube.com/watch?v=zSWdZVtXT7E",
    type: "movie"
  },
  {
    id: 104,
    title: "The Batman",
    year: 2022,
    userRating: 8.3,
    criticScore: 85,
    description: "When a sadistic serial killer begins murdering key political figures in Gotham, Batman is forced to investigate the city's hidden corruption.",
    poster: "https://images.unsplash.com/photo-1635805737707-575885ab0820?w=800&auto=format&fit=crop&q=80",
    backdrop: "https://images.unsplash.com/photo-1509281373149-e957c6296406?w=1200&auto=format&fit=crop&q=80",
    genres: ["Action", "Crime", "Drama"],
    runtime: 176,
    usRating: "PG-13",
    trailer: "https://www.youtube.com/watch?v=mqqft2x_Aa4",
    type: "movie"
  },
  {
    id: 105,
    title: "Blade Runner 2049",
    year: 2017,
    userRating: 8.6,
    criticScore: 89,
    description: "Young Blade Runner K's discovery of a long-buried secret leads him to track down former Blade Runner Rick Deckard.",
    poster: "https://images.unsplash.com/photo-1514565131-fce0801e5785?w=800&auto=format&fit=crop&q=80",
    backdrop: "https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=1200&auto=format&fit=crop&q=80",
    genres: ["Sci-Fi", "Mystery"],
    runtime: 164,
    usRating: "R",
    trailer: "https://www.youtube.com/watch?v=gCcx85zbxz4",
    type: "movie"
  },
  {
    id: 106,
    title: "Spider-Man: Across the Spider-Verse",
    year: 2023,
    userRating: 8.7,
    criticScore: 95,
    description: "Miles Morales catapults across the Multiverse, where he encounters a team of Spider-People charged with protecting its very existence.",
    poster: "https://images.unsplash.com/photo-1578632767115-351597cf2477?w=800&auto=format&fit=crop&q=80",
    backdrop: "https://images.unsplash.com/photo-1513151233558-d860c5398176?w=1200&auto=format&fit=crop&q=80",
    genres: ["Animation", "Action", "Adventure"],
    runtime: 140,
    usRating: "PG",
    trailer: "https://www.youtube.com/watch?v=cqGjhVJWtEg",
    type: "movie"
  }
];

export async function fetchTrendingMovies(page = 1, limit = 16, genreId?: number): Promise<{ movies: Movie[]; source?: string; total?: number }> {
  try {
    const params = new URLSearchParams({
      page: String(page),
      limit: String(limit)
    });
    if (genreId) {
      params.set("genre", String(genreId));
    }

    const res = await fetch(`/api/movies/trending?${params.toString()}`);
    if (res.ok) {
      const json: ApiResponse<Movie[]> = await res.json();
      if (json.data && json.data.length > 0) {
        return {
          movies: json.data,
          source: json.source,
          total: json.total
        };
      }
    }
  } catch {
    // Graceful fallback
  }

  return {
    movies: CURATED_FALLBACK_MOVIES,
    source: "Static Netlify Fallback",
    total: CURATED_FALLBACK_MOVIES.length
  };
}

export async function fetchMostWatchedMovies(page = 2, limit = 16): Promise<{ movies: Movie[]; source?: string }> {
  try {
    const params = new URLSearchParams({
      page: String(page),
      limit: String(limit)
    });

    const res = await fetch(`/api/movies/most-watched?${params.toString()}`);
    if (res.ok) {
      const json: ApiResponse<Movie[]> = await res.json();
      if (json.data && json.data.length > 0) {
        return {
          movies: json.data,
          source: json.source
        };
      }
    }
  } catch {
    // Graceful fallback
  }

  return {
    movies: CURATED_FALLBACK_MOVIES,
    source: "Static Netlify Fallback"
  };
}

export async function fetchRecentWatchedMovies(): Promise<{ movies: Movie[] }> {
  try {
    const res = await fetch("/api/movies/recent-watched");
    if (res.ok) {
      const json: ApiResponse<Movie[]> = await res.json();
      if (json.data && json.data.length > 0) {
        return { movies: json.data };
      }
    }
  } catch {
    // Silent
  }

  return { movies: CURATED_FALLBACK_MOVIES };
}

export async function recordMovieWatch(movie: {
  id: number | string;
  title: string;
  poster?: string;
  backdrop?: string;
  year?: number;
  rating?: number;
  genre?: string;
  quality?: string;
}): Promise<void> {
  try {
    await fetch("/api/movies/record-watch", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(movie)
    });
  } catch (err) {
    console.warn("recordMovieWatch warning:", err);
  }
}

export async function fetchNewReleases(page = 1, limit = 16): Promise<{ movies: Movie[]; source?: string }> {
  const params = new URLSearchParams({
    page: String(page),
    limit: String(limit)
  });

  const res = await fetch(`/api/movies/new?${params.toString()}`);
  if (!res.ok) {
    throw new Error(`Failed to load new releases: ${res.status}`);
  }
  const json: ApiResponse<Movie[]> = await res.json();
  return {
    movies: json.data || [],
    source: json.source
  };
}

export interface RecentAddedItem {
  id: string;
  itemType: "video_link" | "ad_link";
  title: string;
  subtitle: string;
  poster: string;
  backdrop?: string;
  videoUrl?: string;
  targetUrl?: string;
  duration?: string;
  year: number;
  rating: number;
  quality: string;
  genre: string;
  genres: string[];
  description?: string;
  badge: string;
  addedAt: string;
  addedAgo: string;
  views?: number;
  isAd: boolean;
  isSeries?: boolean;
  seriesId?: string;
  totalEpisodes?: number;
  episodeNumber?: number;
}

export const FALLBACK_RECENT_ADDED: RecentAddedItem[] = [
  ...INDIAN_MOVIES_RECENT_ITEMS,
  {
    id: "rec-1",
    itemType: "video_link",
    title: "Dune: Prophecy — Sisterhood Genesis",
    subtitle: "Bene Gesserit Ascendance (4K Ultra Definition)",
    poster: "https://images.unsplash.com/photo-1534447677768-be436bb09401?w=800&auto=format&fit=crop&q=80",
    backdrop: "https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=1200&auto=format&fit=crop&q=80",
    videoUrl: "https://www.youtube.com/watch?v=Way9Dexny3w",
    quality: "4K UHD",
    duration: "3:45",
    genre: "Sci-Fi",
    genres: ["Sci-Fi", "Drama"],
    year: 2026,
    rating: 9.3,
    views: 84200,
    description: "Witness the origin of the sisterhood ten thousand years before the birth of Paul Atreides.",
    badge: "Official Cinema Clip",
    addedAt: new Date(Date.now() - 3600000).toISOString(),
    addedAgo: "1h ago",
    isAd: false
  },
  {
    id: "rec-2",
    itemType: "video_link",
    title: "Cyberpunk: Phantom Protocol",
    subtitle: "Night City Pursuit & Aerial Breach",
    poster: "https://images.unsplash.com/photo-1514565131-fce0801e5785?w=800&auto=format&fit=crop&q=80",
    backdrop: "https://images.unsplash.com/photo-1509281373149-e957c6296406?w=1200&auto=format&fit=crop&q=80",
    videoUrl: "https://www.youtube.com/watch?v=gCcx85zbxz4",
    quality: "4K UHD",
    duration: "4:12",
    genre: "Cyberpunk",
    genres: ["Action", "Sci-Fi"],
    year: 2026,
    rating: 9.1,
    views: 65100,
    description: "High-octane neon speed chases across the combat zone under heavy cybernetic suppression.",
    badge: "Cinema Scene",
    addedAt: new Date(Date.now() - 7200000).toISOString(),
    addedAgo: "2h ago",
    isAd: false
  },
  {
    id: "rec-3",
    itemType: "video_link",
    title: "Gladiator II: Coliseum Triumph",
    subtitle: "Lucius Arena Clashing Sword Scene",
    poster: "https://images.unsplash.com/photo-1440404653325-ab127d49abc1?w=800&auto=format&fit=crop&q=80",
    backdrop: "https://images.unsplash.com/photo-1579783902614-a3fb3927b675?w=1200&auto=format&fit=crop&q=80",
    videoUrl: "https://www.youtube.com/watch?v=4rgYUipGJNo",
    quality: "4K UHD",
    duration: "5:20",
    genre: "Action",
    genres: ["Action", "Drama", "History"],
    year: 2024,
    rating: 8.7,
    views: 128400,
    description: "The arena roars as general Marcus Acacius faces the unforgiving beasts of Rome.",
    badge: "Official Clip",
    addedAt: new Date(Date.now() - 14400000).toISOString(),
    addedAgo: "4h ago",
    isAd: false
  },
  {
    id: "rec-4",
    itemType: "video_link",
    title: "Interstellar: Gargantua Singularity",
    subtitle: "Miller's Tidal Waves & Black Hole Slingshot",
    poster: "https://images.unsplash.com/photo-1509281373149-e957c6296406?w=800&auto=format&fit=crop&q=80",
    backdrop: "https://images.unsplash.com/photo-1536440136628-849c177e76a1?w=1200&auto=format&fit=crop&q=80",
    videoUrl: "https://www.youtube.com/watch?v=zSWdZVtXT7E",
    quality: "4K UHD",
    duration: "4:50",
    genre: "Sci-Fi",
    genres: ["Sci-Fi", "Adventure"],
    year: 2026,
    rating: 9.5,
    views: 310500,
    description: "Every hour on this planet costs seven years back on Earth. The countdown begins.",
    badge: "Classic 4K Remaster",
    addedAt: new Date(Date.now() - 28800000).toISOString(),
    addedAgo: "8h ago",
    isAd: false
  }
];

export async function fetchRecentAdded24h(): Promise<{
  items: RecentAddedItem[];
  count: number;
  clipCount: number;
  adCount: number;
}> {
  try {
    const res = await fetch("/api/movies/recent-added-24h");
    if (res.ok) {
      const json = await res.json();
      if (json.data && json.data.length > 0) {
        // Guarantee all 11 Indian movies are always present
        const existingIds = new Set(json.data.map((i: RecentAddedItem) => i.id));
        const missingIndian = INDIAN_MOVIES_RECENT_ITEMS.filter((im) => !existingIds.has(im.id));
        const combined = [...missingIndian, ...json.data];

        return {
          items: combined,
          count: combined.length,
          clipCount: json.clipCount || combined.length,
          adCount: json.adCount || 0
        };
      }
    }
  } catch {
    // Graceful Netlify fallback
  }

  return {
    items: FALLBACK_RECENT_ADDED,
    count: FALLBACK_RECENT_ADDED.length,
    clipCount: FALLBACK_RECENT_ADDED.length,
    adCount: 0
  };
}

export async function fetchIndianMovies(): Promise<MovieClip[]> {
  try {
    const res = await fetch("/api/movies/indian");
    if (res.ok) {
      const json = await res.json();
      if (json.data && Array.isArray(json.data) && json.data.length > 0) {
        return json.data;
      }
    }
  } catch {
    // fallback
  }
  return INDIAN_MOVIES_CLIPS;
}

export async function fetchMovieDetails(id: number): Promise<Movie> {
  try {
    const res = await fetch(`/api/movie/${id}`);
    if (res.ok) {
      const json: ApiResponse<Movie> = await res.json();
      if (json.data) return json.data;
    }
  } catch {
    // Graceful Netlify fallback
  }

  const found = CURATED_FALLBACK_MOVIES.find((m) => m.id === Number(id));
  if (found) return found;

  return {
    id: Number(id),
    title: "Cinematic Showcase Feature",
    year: 2026,
    userRating: 8.9,
    criticScore: 92,
    description: "An electrifying high-stakes cinematic thrill ride following groundbreaking discoveries across the neon skyline.",
    poster: getCinemaPosterFallback(id),
    backdrop: getCinemaPosterFallback(id),
    genres: ["Sci-Fi", "Action", "Drama"],
    runtime: 142,
    usRating: "PG-13",
    trailer: "https://www.youtube.com/watch?v=Way9Dexny3w",
    type: "movie"
  };
}

export async function fetchMovieSources(id: number, region = "US"): Promise<{ sources: StreamingSource[]; region: string; source?: string }> {
  try {
    const params = new URLSearchParams({ region });
    const res = await fetch(`/api/movie/${id}/sources?${params.toString()}`);
    if (res.ok) {
      const json = await res.json();
      if (json.data && json.data.length > 0) {
        return {
          sources: json.data,
          region: json.region || region,
          source: json.source
        };
      }
    }
  } catch {
    // Graceful Netlify fallback
  }

  return {
    sources: [
      {
        sourceId: 203,
        name: "Netflix",
        type: "sub",
        region: region,
        webUrl: "https://www.netflix.com",
        format: "4K UHD",
        price: null,
        displayPrice: "Subscription"
      },
      {
        sourceId: 26,
        name: "Amazon Prime Video",
        type: "rent",
        region: region,
        webUrl: "https://www.amazon.com",
        format: "HD",
        price: 3.99,
        displayPrice: "$3.99"
      },
      {
        sourceId: 372,
        name: "Disney+",
        type: "sub",
        region: region,
        webUrl: "https://www.disneyplus.com",
        format: "4K UHD",
        price: null,
        displayPrice: "Subscription"
      }
    ],
    region: region,
    source: "Static Netlify Fallback"
  };
}

export async function searchMoviesApi(query: string): Promise<SearchResultItem[]> {
  if (!query.trim()) return [];
  try {
    const params = new URLSearchParams({ q: query.trim() });
    const res = await fetch(`/api/search?${params.toString()}`);
    if (res.ok) {
      const json: ApiResponse<SearchResultItem[]> = await res.json();
      return json.data || [];
    }
  } catch {
    // Fallback search
  }

  const q = query.toLowerCase();
  return CURATED_FALLBACK_MOVIES.filter(
    (m) => m.title.toLowerCase().includes(q) || m.genres?.some((g) => g.toLowerCase().includes(q))
  ).map((m) => ({
    id: m.id,
    title: m.title,
    year: m.year,
    type: m.type || "movie",
    poster: m.poster
  }));
}

// Unified Search across local JSON movie files
export async function searchUnifiedApi(query: string): Promise<UnifiedSearchResponse> {
  if (!query.trim()) return { success: true, movies: [], clips: [] };
  
  try {
    const { searchJsonMovies } = await import("./jsonMovies");
    const matched = await searchJsonMovies(query.trim());
    
    const clips: MovieClip[] = matched.map((m, idx) => ({
      id: m.id,
      movieId: idx + 1,
      movieTitle: m.title,
      clipTitle: m.fullTitle || m.title,
      videoUrl: m.videoUrl,
      thumbnail: m.thumbnail || m.poster,
      poster: m.poster || m.thumbnail,
      backdrop: m.backdrop || m.thumbnail || m.poster,
      duration: m.duration || "Full Movie",
      quality: (m.quality === "720p HD" || m.quality === "4K UHD" ? m.quality : "1080p HD"),
      genre: m.genre || "Cinema",
      genres: m.genres || [m.genre || "Cinema"],
      year: m.year || 2026,
      rating: m.rating || 9.2,
      description: m.description || `Stream ${m.title} in high definition.`,
      views: m.views || 45000 + idx * 500,
      likes: 2100 + idx * 30,
      isTrending: true,
      isMostWatched: idx < 3,
      publishedAt: "2026-01-01",
      tags: ["movie", "cinema", "stream"],
      seo: {
        title: `${m.title} — Movlo.site`,
        description: m.description || m.title,
        keywords: ["movie", "stream", m.title]
      }
    }));

    const movies: SearchResultItem[] = matched.map((m, idx) => ({
      id: idx + 1,
      title: m.title,
      year: m.year || 2026,
      type: "movie",
      poster: m.thumbnail || m.poster
    }));

    return {
      success: true,
      movies,
      clips
    };
  } catch (err) {
    console.error("Local JSON search error:", err);
    return {
      success: true,
      movies: [],
      clips: []
    };
  }
}

// CLIPS API FUNCTIONS
export async function fetchTrendingClips(genre?: string): Promise<MovieClip[]> {
  const params = new URLSearchParams();
  if (genre && genre.toLowerCase() !== "all") {
    params.set("genre", genre);
  }
  const res = await fetch(`/api/clips/trending?${params.toString()}`);
  if (!res.ok) throw new Error("Failed to load trending clips");
  const json = await res.json();
  return json.data || [];
}

export async function fetchMostWatchedClips(): Promise<MovieClip[]> {
  const res = await fetch("/api/clips/most-watched");
  if (!res.ok) throw new Error("Failed to load most watched clips");
  const json = await res.json();
  return json.data || [];
}

export async function fetchAllClips(): Promise<MovieClip[]> {
  const res = await fetch("/api/clips/all");
  if (!res.ok) throw new Error("Failed to load all clips");
  const json = await res.json();
  return json.data || [];
}

export async function fetchClipById(id: string): Promise<MovieClip> {
  const res = await fetch(`/api/clips/${id}`);
  if (!res.ok) throw new Error("Clip not found");
  const json = await res.json();
  return json.data;
}

export async function fetchRelatedClips(clipId: string, movieTitle: string): Promise<RelatedClipsResponse> {
  const params = new URLSearchParams({ movie: movieTitle });
  const res = await fetch(`/api/clips/${clipId}/related?${params.toString()}`);
  if (!res.ok) throw new Error("Failed to load related clips");
  const json = await res.json();
  return json.data || { sameMovieClips: [], recommendedClips: [] };
}

// ADMIN API FUNCTIONS (PIN: 77490869)
export async function verifyAdminPin(pin: string): Promise<boolean> {
  try {
    const res = await fetch("/api/admin/verify-pin", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ pin })
    });
    return res.ok;
  } catch {
    return false;
  }
}

export async function adminAiPublishClips(pin: string, links: string | string[]): Promise<{
  success: boolean;
  publishedCount: number;
  newClips: MovieClip[];
  totalClips: number;
  message?: string;
}> {
  const res = await fetch("/api/admin/ai-publish-clips", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ pin, links })
  });
  if (!res.ok) {
    const errorJson = await res.json().catch(() => ({}));
    throw new Error(errorJson.message || "Failed to process links with AI");
  }
  return await res.json();
}

export async function adminDeleteClip(pin: string, clipId: string): Promise<boolean> {
  const res = await fetch(`/api/admin/clips/${clipId}`, {
    method: "DELETE",
    headers: {
      "Content-Type": "application/json",
      "x-admin-pin": pin
    },
    body: JSON.stringify({ pin })
  });
  return res.ok;
}

export async function adminResetClips(pin: string): Promise<boolean> {
  const res = await fetch("/api/admin/clips/reset", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ pin })
  });
  return res.ok;
}

export async function fetchGenres(): Promise<Genre[]> {
  const res = await fetch("/api/genres");
  if (!res.ok) {
    throw new Error(`Failed to load genres: ${res.status}`);
  }
  const json: ApiResponse<Genre[]> = await res.json();
  return json.data || [];
}

// Presence & Analytics Plugin Types & APIs
export interface PresenceActivity {
  id: string;
  user: string;
  action: string;
  movie: string;
  quality: string;
  device: string;
  time: string;
}

export interface MovieViewersCount {
  movieTitle: string;
  clipTitle?: string;
  count: number;
  quality: string;
}

export interface PresenceStats {
  onlineCount: number;
  watchingCount: number;
  viewersByMovie: MovieViewersCount[];
  recentActivities: PresenceActivity[];
  timestamp: string;
}

export async function pingPresence(data: {
  sessionId: string;
  movieTitle?: string;
  clipTitle?: string;
  isPlaying?: boolean;
  device?: string;
  quality?: string;
}): Promise<void> {
  try {
    await fetch("/api/presence/ping", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data)
    });
  } catch {
    // Non-blocking ping
  }
}

export async function fetchPresenceStats(): Promise<PresenceStats> {
  try {
    const res = await fetch("/api/presence/stats");
    if (!res.ok) {
      throw new Error(`Presence stats returned status ${res.status}`);
    }
    const data = await res.json();
    return data;
  } catch (error) {
    // Return resilient baseline presence stats if server is starting or network blips
    return {
      onlineCount: 48,
      watchingCount: 53,
      viewersByMovie: [
        { movieTitle: "Dune: Part Two", clipTitle: "Worm Ride 4K IMAX", count: 16, quality: "4K IMAX" },
        { movieTitle: "Interstellar", clipTitle: "Docking Scene", count: 12, quality: "4K UHD" },
        { movieTitle: "Oppenheimer", clipTitle: "Trinity Test Scene", count: 9, quality: "4K UHD" },
        { movieTitle: "The Dark Knight", clipTitle: "Armored Car Chase", count: 7, quality: "1080p HD" },
        { movieTitle: "Avatar: The Way of Water", clipTitle: "Tulkun Battle 4K", count: 5, quality: "4K HDR" }
      ],
      recentActivities: [
        {
          id: "act-1",
          user: "User #9481",
          action: "Started streaming",
          movie: "Dune: Part Two",
          quality: "4K IMAX",
          device: "Apple TV 4K",
          time: "Just now"
        },
        {
          id: "act-2",
          user: "User #3204",
          action: "Watching scene",
          movie: "Interstellar",
          quality: "4K UHD",
          device: "Chrome / Windows",
          time: "12s ago"
        }
      ],
      timestamp: new Date().toISOString()
    };
  }
}

export async function adminPublishCustomClip(params: {
  pin: string;
  videoUrl: string;
  title?: string;
  thumbnail?: string;
  movieTitle?: string;
  genre?: string;
  quality?: string;
}): Promise<{ success: boolean; clip: MovieClip; totalClips: number; message: string }> {
  const res = await fetch("/api/admin/publish-clip-custom", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(params)
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.message || "Failed to publish clip");
  }

  return await res.json();
}

export const STATIC_UPCOMING_MOVIES: UpcomingMovie[] = [
  {
    id: 991,
    title: "Dune: Part Three (Messiah)",
    year: 2026,
    releaseDate: "December 18, 2026",
    rating: 9.4,
    trailerUrl: "https://www.youtube.com/watch?v=Way9Dexny3w",
    poster: "https://images.unsplash.com/photo-1534447677768-be436bb09401?w=800&auto=format&fit=crop&q=80",
    backdrop: "https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=1200&auto=format&fit=crop&q=80",
    description: "Paul Atreides faces the devastating aftermath of his galactic holy war as ancient powers conspire against the golden throne.",
    genres: ["Sci-Fi", "Adventure", "Drama"]
  },
  {
    id: 992,
    title: "Avengers: Secret Wars",
    year: 2027,
    releaseDate: "May 7, 2027",
    rating: 9.1,
    trailerUrl: "https://www.youtube.com/watch?v=TcMBFSGVi1c",
    poster: "https://images.unsplash.com/photo-1635805737707-575885ab0820?w=800&auto=format&fit=crop&q=80",
    backdrop: "https://images.unsplash.com/photo-1578632767115-351597cf2477?w=1200&auto=format&fit=crop&q=80",
    description: "Multiversal collapse forces disparate heroes from across all reality to unite in an unprecedented cosmic battleground.",
    genres: ["Action", "Sci-Fi", "Fantasy"]
  },
  {
    id: 993,
    title: "Blade Runner: 2099",
    year: 2026,
    releaseDate: "November 6, 2026",
    rating: 8.8,
    trailerUrl: "https://www.youtube.com/watch?v=gCcx85zbxz4",
    poster: "https://images.unsplash.com/photo-1514565131-fce0801e5785?w=800&auto=format&fit=crop&q=80",
    backdrop: "https://images.unsplash.com/photo-1509281373149-e957c6296406?w=1200&auto=format&fit=crop&q=80",
    description: "In a rain-slicked Los Angeles 50 years after the blackout, an underground operative unravels a synthetic conspiracy.",
    genres: ["Cyberpunk", "Sci-Fi", "Thriller"]
  },
  {
    id: 994,
    title: "Interstellar: Beyond Event Horizon",
    year: 2026,
    releaseDate: "October 14, 2026",
    rating: 9.3,
    trailerUrl: "https://www.youtube.com/watch?v=zSWdZVtXT7E",
    poster: "https://images.unsplash.com/photo-1440404653325-ab127d49abc1?w=800&auto=format&fit=crop&q=80",
    backdrop: "https://images.unsplash.com/photo-1536440136628-849c177e76a1?w=1200&auto=format&fit=crop&q=80",
    description: "Humanity's frontier voyage reaches deep within higher dimensional anomalies searching for timeless echoes.",
    genres: ["Sci-Fi", "Adventure", "Mystery"]
  },
  {
    id: 995,
    title: "The Batman: Part II",
    year: 2026,
    releaseDate: "October 2, 2026",
    rating: 9.0,
    trailerUrl: "https://www.youtube.com/watch?v=mqqft2x_Aa4",
    poster: "https://images.unsplash.com/photo-1509281373149-e957c6296406?w=800&auto=format&fit=crop&q=80",
    backdrop: "https://images.unsplash.com/photo-1513151233558-d860c5398176?w=1200&auto=format&fit=crop&q=80",
    description: "The Dark Knight navigates deep Gotham corruption as a cold freeze descends over the flooded city streets.",
    genres: ["Crime", "Action", "Mystery"]
  }
];

// 18. UPCOMING TRAILERS (5 upcoming movies with ratings from API)
export async function fetchUpcomingTrailers(): Promise<UpcomingMovie[]> {
  try {
    const res = await fetch("/api/movies/upcoming");
    if (res.ok) {
      const data = await res.json();
      if (data.data && data.data.length > 0) {
        return data.data;
      }
    }
  } catch {
    // Graceful fallback for static Netlify hosting
  }

  return STATIC_UPCOMING_MOVIES;
}

// 19. ACTIVE ADS & SPONSORED POSTERS (HOMEPAGE)
export async function fetchActiveAds(): Promise<AdBanner[]> {
  const res = await fetch("/api/ads");
  if (!res.ok) return [];
  const data = await res.json();
  return data.data || [];
}

// 20. ADMIN ADS MANAGEMENT
export async function fetchAdminAds(pin: string): Promise<AdBanner[]> {
  const res = await fetch("/api/admin/ads", {
    headers: { "x-admin-pin": pin }
  });
  if (!res.ok) {
    throw new Error("Failed to fetch admin ads");
  }
  const data = await res.json();
  return data.data || [];
}

export async function createAdminAd(
  params: { title: string; posterUrl: string; targetUrl: string; tag?: string },
  pin: string
): Promise<AdBanner> {
  const res = await fetch("/api/admin/ads", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ ...params, pin })
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.message || "Failed to create ad");
  }
  const data = await res.json();
  return data.ad;
}

export async function toggleAdminAd(id: string, pin: string): Promise<AdBanner> {
  const res = await fetch(`/api/admin/ads/${id}/toggle`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ pin })
  });
  if (!res.ok) throw new Error("Failed to toggle ad status");
  const data = await res.json();
  return data.ad;
}

export async function deleteAdminAd(id: string, pin: string): Promise<void> {
  const res = await fetch(`/api/admin/ads/${id}`, {
    method: "DELETE",
    headers: { "x-admin-pin": pin }
  });
  if (!res.ok) throw new Error("Failed to delete ad");
}

export async function recordAdClick(id: string): Promise<void> {
  try {
    await fetch(`/api/ads/${id}/click`, { method: "POST" });
  } catch {
    // Silent
  }
}

