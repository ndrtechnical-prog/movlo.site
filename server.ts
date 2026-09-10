import express, { Request, Response } from "express";
import path from "path";
import fs from "fs";
import dotenv from "dotenv";
import { createServer as createViteServer } from "vite";
import {
  getTrendingMovies,
  getMostWatchedMovies,
  getNewReleases,
  getMovieDetails,
  getMovieSources,
  searchMovies,
  getGenres,
  DEFAULT_REGION
} from "./server/services/watchmode.js";
import {
  getAllClips,
  getTrendingClips,
  getMostWatchedClips,
  getClipById,
  getRelatedClips,
  searchClips,
  addClips,
  deleteClip,
  resetClipsToDefault,
  getIndianClips,
  MovieClip
} from "./server/services/clips.js";
import { analyzeAndGenerateClipMetadata } from "./server/services/gemini.js";
import { getUpcomingTrailers } from "./server/services/upcoming.js";
import {
  getAllAds,
  getActiveAds,
  createAd,
  toggleAd,
  deleteAd,
  recordAdClick
} from "./server/services/ads.js";

// Load environment variables
dotenv.config();

const app = express();
const PORT = 3000;
const ADMIN_PIN = "77490869";

// Support direct image uploads (base64) from mobile/phone
app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ extended: true, limit: "50mb" }));

// MONETAG SERVICE WORKERS & VERIFICATION EXPLICIT ROUTING
app.get(["/sw.js", "/service-worker.js"], (_req: Request, res: Response) => {
  const possiblePaths = [
    path.join(process.cwd(), "public", "sw.js"),
    path.join(process.cwd(), "dist", "sw.js"),
    path.join(process.cwd(), "sw.js")
  ];
  const found = possiblePaths.find((p) => fs.existsSync(p));
  if (found) {
    res.setHeader("Content-Type", "application/javascript; charset=UTF-8");
    res.setHeader("Service-Worker-Allowed", "/");
    res.setHeader("Cache-Control", "no-cache, no-store, must-revalidate");
    res.sendFile(found);
  } else {
    // Fallback script if file is not found on disk
    res.setHeader("Content-Type", "application/javascript; charset=UTF-8");
    res.setHeader("Service-Worker-Allowed", "/");
    res.send(`self.options = { "domain": "5gvci.com", "zoneId": 11766512 };\nself.lary = "";\nimportScripts('https://5gvci.com/act/files/service-worker.min.js?r=sw');`);
  }
});

// API STATUS & CONFIG
app.get("/api/status", (_req: Request, res: Response) => {
  const hasKey = Boolean(process.env.WATCHMODE_API_KEY && process.env.WATCHMODE_API_KEY !== "your_watchmode_api_key_here");
  res.json({
    status: "ok",
    hasApiKey: hasKey,
    defaultRegion: DEFAULT_REGION,
    timestamp: new Date().toISOString()
  });
});

// 3. TRENDING MOVIES
// GET /api/movies/trending?page=1&limit=16&genre=1
app.get("/api/movies/trending", async (req: Request, res: Response) => {
  try {
    const page = parseInt(req.query.page as string, 10) || 1;
    const limit = parseInt(req.query.limit as string, 10) || 16;
    const genreId = req.query.genre ? parseInt(req.query.genre as string, 10) : undefined;

    const result = await getTrendingMovies(page, limit, genreId);
    res.json({
      success: true,
      data: result.movies,
      source: result.source,
      page,
      total: result.total
    });
  } catch (error: any) {
    console.error("Route /api/movies/trending error:", error?.message);
    res.status(500).json({
      success: false,
      message: "Unable to load trending movies right now."
    });
  }
});

// LIVE WATCHED MOVIES STORE (Tracks movies currently & recently watched by visitors)
interface WatchedMovieRecord {
  id: number;
  title: string;
  year?: number;
  poster: string;
  backdrop?: string;
  description?: string;
  rating?: number;
  genres?: string[];
  watchingNowCount: number;
  lastWatchedAt: string;
  isWatchingNow: boolean;
  quality?: string;
}

const liveWatchedList: WatchedMovieRecord[] = [
  {
    id: 3173903,
    title: "Dune: Part Two",
    year: 2024,
    poster: "https://images.unsplash.com/photo-1534447677768-be436bb09401?w=800&auto=format&fit=crop&q=80",
    backdrop: "https://images.unsplash.com/photo-1509198397868-475647b2a1e5?w=1600&auto=format&fit=crop&q=80",
    description: "Paul Atreides unites with Chani and the Fremen while seeking revenge against the conspirators who destroyed his family.",
    rating: 8.6,
    genres: ["Sci-Fi", "Adventure", "Drama"],
    watchingNowCount: 38,
    lastWatchedAt: new Date(Date.now() - 30000).toISOString(),
    isWatchingNow: true,
    quality: "4K IMAX"
  },
  {
    id: 3169821,
    title: "Interstellar",
    year: 2014,
    poster: "https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=800&auto=format&fit=crop&q=80",
    backdrop: "https://images.unsplash.com/photo-1446776811953-b23d57bd21aa?w=1600&auto=format&fit=crop&q=80",
    description: "A team of explorers travel through a wormhole in space in an attempt to ensure humanity's survival.",
    rating: 8.7,
    genres: ["Sci-Fi", "Drama", "Adventure"],
    watchingNowCount: 29,
    lastWatchedAt: new Date(Date.now() - 90000).toISOString(),
    isWatchingNow: true,
    quality: "4K UHD"
  },
  {
    id: 3158912,
    title: "Oppenheimer",
    year: 2023,
    poster: "https://images.unsplash.com/photo-1440404653325-ab127d49abc1?w=800&auto=format&fit=crop&q=80",
    backdrop: "https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=1600&auto=format&fit=crop&q=80",
    description: "The story of American scientist J. Robert Oppenheimer and his role in the development of the atomic bomb.",
    rating: 8.9,
    genres: ["Biography", "Drama", "History"],
    watchingNowCount: 24,
    lastWatchedAt: new Date(Date.now() - 150000).toISOString(),
    isWatchingNow: true,
    quality: "4K UHD"
  },
  {
    id: 3144501,
    title: "The Dark Knight",
    year: 2008,
    poster: "https://images.unsplash.com/photo-1509281373149-e957c6296406?w=800&auto=format&fit=crop&q=80",
    backdrop: "https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=1600&auto=format&fit=crop&q=80",
    description: "When the menace known as the Joker wreaks havoc and chaos on the people of Gotham, Batman must accept one of the greatest psychological and physical tests of his ability to fight injustice.",
    rating: 9.0,
    genres: ["Action", "Crime", "Drama"],
    watchingNowCount: 19,
    lastWatchedAt: new Date(Date.now() - 320000).toISOString(),
    isWatchingNow: true,
    quality: "4K UHD"
  },
  {
    id: 3173906,
    title: "Inception",
    year: 2010,
    poster: "https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?w=800&auto=format&fit=crop&q=80",
    backdrop: "https://images.unsplash.com/photo-1534447677768-be436bb09401?w=1600&auto=format&fit=crop&q=80",
    description: "A thief who steals corporate secrets through the use of dream-sharing technology is given the inverse task of planting an idea into the mind of a C.E.O.",
    rating: 8.8,
    genres: ["Action", "Sci-Fi", "Adventure"],
    watchingNowCount: 17,
    lastWatchedAt: new Date(Date.now() - 480000).toISOString(),
    isWatchingNow: false,
    quality: "1080p HD"
  },
  {
    id: 3173904,
    title: "Gladiator II",
    year: 2024,
    poster: "https://images.unsplash.com/photo-1563089145-599997674d42?w=800&auto=format&fit=crop&q=80",
    backdrop: "https://images.unsplash.com/photo-1536440136628-849c177e76a1?w=1600&auto=format&fit=crop&q=80",
    description: "Years after witnessing the death of the revered hero Maximus at the hands of his uncle, Lucius must enter the Colosseum after his home is conquered by the tyrannical Emperors.",
    rating: 8.4,
    genres: ["Action", "Adventure", "Drama"],
    watchingNowCount: 15,
    lastWatchedAt: new Date(Date.now() - 600000).toISOString(),
    isWatchingNow: false,
    quality: "4K HDR"
  },
  {
    id: 3173907,
    title: "Avatar: The Way of Water",
    year: 2022,
    poster: "https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=800&auto=format&fit=crop&q=80",
    backdrop: "https://images.unsplash.com/photo-1509198397868-475647b2a1e5?w=1600&auto=format&fit=crop&q=80",
    description: "Jake Sully lives with his newfound family formed on the extrasolar moon Pandora.",
    rating: 7.6,
    genres: ["Sci-Fi", "Action", "Adventure"],
    watchingNowCount: 13,
    lastWatchedAt: new Date(Date.now() - 900000).toISOString(),
    isWatchingNow: false,
    quality: "4K UHD"
  },
  {
    id: 3173908,
    title: "Spider-Man: Across the Spider-Verse",
    year: 2023,
    poster: "https://images.unsplash.com/photo-1607604276583-eef5d076aa5f?w=800&auto=format&fit=crop&q=80",
    backdrop: "https://images.unsplash.com/photo-1534447677768-be436bb09401?w=1600&auto=format&fit=crop&q=80",
    description: "Miles Morales catapults across the Multiverse, where he encounters a team of Spider-People charged with protecting its very existence.",
    rating: 8.7,
    genres: ["Animation", "Action", "Adventure"],
    watchingNowCount: 11,
    lastWatchedAt: new Date(Date.now() - 1200000).toISOString(),
    isWatchingNow: false,
    quality: "4K UHD"
  }
];

// Helper to format live watched movies with current status
function getFormattedRecentWatchedMovies() {
  const now = Date.now();
  return liveWatchedList.map((m) => {
    const diffMs = now - new Date(m.lastWatchedAt).getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const isLive = diffMins < 6 || m.isWatchingNow;
    const liveStatus = isLive
      ? `🔴 ${m.watchingNowCount} watching now`
      : `🟢 Watched ${diffMins < 60 ? `${diffMins}m ago` : `${Math.floor(diffMins / 60)}h ago`}`;

    return {
      ...m,
      isWatchingNow: isLive,
      liveStatus,
      liveViewers: m.watchingNowCount
    };
  });
}

// RECORD A MOVIE BEING WATCHED
// POST /api/movies/record-watch
app.post("/api/movies/record-watch", (req: Request, res: Response) => {
  try {
    const { id, title, poster, backdrop, year, rating, genre, quality } = req.body;
    if (!title) {
      res.status(400).json({ success: false, message: "Movie title required" });
      return;
    }

    const numericId = typeof id === "number" ? id : parseInt(String(id), 10) || Date.now();
    const existingIndex = liveWatchedList.findIndex(
      (m) => m.id === numericId || m.title.toLowerCase() === String(title).toLowerCase()
    );

    if (existingIndex >= 0) {
      const existing = liveWatchedList[existingIndex];
      existing.watchingNowCount += 1;
      existing.lastWatchedAt = new Date().toISOString();
      existing.isWatchingNow = true;
      if (poster) existing.poster = poster;
      if (backdrop) existing.backdrop = backdrop;
      // Move to top so currently watched movie appears at index 0
      liveWatchedList.splice(existingIndex, 1);
      liveWatchedList.unshift(existing);
    } else {
      liveWatchedList.unshift({
        id: numericId,
        title: String(title),
        year: year || new Date().getFullYear(),
        poster: poster || "https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?w=800&auto=format&fit=crop&q=80",
        backdrop: backdrop || poster || "https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?w=1600&auto=format&fit=crop&q=80",
        description: `Watched live on MOVLO cinema.`,
        rating: rating || 8.6,
        genres: Array.isArray(genre) ? genre : [genre || "Cinema"],
        watchingNowCount: 1,
        lastWatchedAt: new Date().toISOString(),
        isWatchingNow: true,
        quality: quality || "4K UHD"
      });
    }

    res.json({ success: true, count: liveWatchedList.length });
  } catch (err: any) {
    console.error("Record watch error:", err?.message);
    res.json({ success: true });
  }
});

// GET /api/movies/recent-watched - Real movies being watched right now
app.get("/api/movies/recent-watched", (_req: Request, res: Response) => {
  try {
    const formatted = getFormattedRecentWatchedMovies();
    res.json({
      success: true,
      data: formatted,
      count: formatted.length,
      timestamp: new Date().toISOString()
    });
  } catch (err: any) {
    console.error("Route /api/movies/recent-watched error:", err?.message);
    res.status(500).json({ success: false, message: "Unable to load recently watched movies." });
  }
});

// 7. MOST WATCHED / RECENT WATCH
// GET /api/movies/most-watched?page=2&limit=16
app.get("/api/movies/most-watched", async (req: Request, res: Response) => {
  try {
    const liveMovies = getFormattedRecentWatchedMovies();
    // Return live watched movies with priority
    if (liveMovies.length > 0) {
      res.json({
        success: true,
        data: liveMovies,
        source: "live_presence",
        page: 1
      });
      return;
    }

    const page = parseInt(req.query.page as string, 10) || 2;
    const limit = parseInt(req.query.limit as string, 10) || 16;
    const result = await getMostWatchedMovies(page, limit);
    res.json({
      success: true,
      data: result.movies,
      source: result.source,
      page
    });
  } catch (error: any) {
    console.error("Route /api/movies/most-watched error:", error?.message);
    res.status(500).json({
      success: false,
      message: "Unable to load most watched movies right now."
    });
  }
});

// 8. RECENT ADDED (LAST 24 HOURS ONLY: Bulk Links, Single Links & Ads Links)
// GET /api/movies/recent-added-24h
app.get("/api/movies/recent-added-24h", async (_req: Request, res: Response) => {
  try {
    const [allClips, allAds] = await Promise.all([
      getAllClips().catch(() => []),
      getAllAds().catch(() => [])
    ]);

    const now = Date.now();
    const TWENTY_FOUR_HOURS_MS = 24 * 60 * 60 * 1000;

    // Filter clips added within the last 24 hours OR Indian category movies
    const recentClips = allClips.filter((clip) => {
      const isIndian =
        (clip.genre && clip.genre.toLowerCase().includes("indian")) ||
        (clip.genres && clip.genres.some((g) => g.toLowerCase().includes("indian")));
      if (isIndian) return true;

      if (!clip.publishedAt) return false;
      const t = new Date(clip.publishedAt).getTime();
      if (isNaN(t)) return false;
      const diff = now - t;
      return diff >= -600000 && diff <= TWENTY_FOUR_HOURS_MS;
    });

    // Filter active ads created within the last 24 hours
    const recentAds = allAds.filter((ad) => {
      if (!ad.active || !ad.createdAt) return false;
      const t = new Date(ad.createdAt).getTime();
      if (isNaN(t)) return false;
      const diff = now - t;
      return diff >= -600000 && diff <= TWENTY_FOUR_HOURS_MS;
    });

    // Helper for relative time
    const formatTimeAgo = (dateStr: string) => {
      const diffMs = Math.max(0, now - new Date(dateStr).getTime());
      const mins = Math.floor(diffMs / 60000);
      if (mins < 2) return "Just now";
      if (mins < 60) return `${mins}m ago`;
      const hours = Math.floor(mins / 60);
      if (hours < 24) return `${hours}h ago`;
      return "Today";
    };

    // Transform video clips to Movie-card structure
    const clipMovieItems = recentClips.map((clip) => {
      const isIndian =
        (clip.genre && clip.genre.toLowerCase().includes("indian")) ||
        (clip.genres && clip.genres.some((g) => g.toLowerCase().includes("indian")));

      return {
        id: clip.id,
        itemType: "video_link" as const,
        title: clip.movieTitle || clip.clipTitle || "Featured Cinema",
        subtitle: clip.clipTitle || "Stream Video",
        poster: clip.poster || clip.thumbnail || "https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?w=800&auto=format&fit=crop&q=80",
        backdrop: clip.backdrop || clip.thumbnail,
        videoUrl: clip.videoUrl,
        duration: clip.duration || "3:30",
        year: clip.year || new Date().getFullYear(),
        rating: clip.rating || 9.2,
        quality: clip.quality || "4K UHD",
        genre: isIndian ? "Indian Cinema" : clip.genre || (clip.genres && clip.genres[0]) || "Action",
        genres: clip.genres || ["Action", "Cinema"],
        description: clip.description,
        badge: isIndian ? "🇮🇳 INDIAN CINEMA" : clip.quality || "4K UHD",
        addedAt: clip.publishedAt,
        addedAgo: formatTimeAgo(clip.publishedAt),
        views: clip.views || 60000,
        isAd: false
      };
    });

    // Transform ads to Movie-card structure (with target redirection link)
    const adMovieItems = recentAds.map((ad) => ({
      id: ad.id,
      itemType: "ad_link" as const,
      title: ad.title || "Sponsored Movie Premiere",
      subtitle: "Click to Open Stream",
      poster: ad.posterUrl || "https://images.unsplash.com/photo-1536440136628-849c177e76a1?w=800&auto=format&fit=crop&q=80",
      backdrop: ad.posterUrl,
      targetUrl: ad.targetUrl,
      duration: "Direct",
      year: new Date(ad.createdAt).getFullYear(),
      rating: 9.5,
      quality: "4K HD",
      genre: ad.tag || "SPONSORED",
      genres: [ad.tag || "SPONSORED", "Partner"],
      description: `Sponsored movie link: ${ad.title}`,
      badge: ad.tag || "SPONSORED",
      addedAt: ad.createdAt,
      addedAgo: formatTimeAgo(ad.createdAt),
      views: (ad.clicks || 0) * 80 + 350,
      isAd: true
    }));

    // Combine and sort newest first
    const combined = [...clipMovieItems, ...adMovieItems].sort(
      (a, b) => new Date(b.addedAt).getTime() - new Date(a.addedAt).getTime()
    );

    res.json({
      success: true,
      data: combined,
      count: combined.length,
      clipCount: clipMovieItems.length,
      adCount: adMovieItems.length,
      timestamp: new Date().toISOString()
    });
  } catch (error: any) {
    console.error("Route /api/movies/recent-added-24h error:", error?.message);
    res.status(500).json({ success: false, message: "Unable to load 24h recent items." });
  }
});

// GET /api/movies/indian - Dedicated endpoint for all Indian category movies
app.get("/api/movies/indian", async (_req: Request, res: Response) => {
  try {
    const indianClips = await getIndianClips();
    res.json({
      success: true,
      data: indianClips,
      count: indianClips.length
    });
  } catch (err: any) {
    console.error("Route /api/movies/indian error:", err?.message);
    res.status(500).json({ success: false, message: "Unable to load Indian movies." });
  }
});

// 8b. LEGACY NEW RELEASES
// GET /api/movies/new?page=1&limit=16
app.get("/api/movies/new", async (req: Request, res: Response) => {
  try {
    const page = parseInt(req.query.page as string, 10) || 1;
    const limit = parseInt(req.query.limit as string, 10) || 16;

    const result = await getNewReleases(page, limit);
    res.json({
      success: true,
      data: result.movies,
      source: result.source,
      page
    });
  } catch (error: any) {
    console.error("Route /api/movies/new error:", error?.message);
    res.status(500).json({
      success: false,
      message: "Unable to load new releases right now."
    });
  }
});

// UPCOMING TRAILERS (5 upcoming movies with ratings & trailers)
// GET /api/movies/upcoming
app.get("/api/movies/upcoming", async (_req: Request, res: Response) => {
  try {
    const movies = await getUpcomingTrailers();
    res.json({
      success: true,
      data: movies
    });
  } catch (error: any) {
    console.error("Route /api/movies/upcoming error:", error?.message);
    res.status(500).json({
      success: false,
      message: "Unable to load upcoming movies right now."
    });
  }
});

// 9. MOVIE DETAILS
// GET /api/movie/:id
app.get("/api/movie/:id", async (req: Request, res: Response) => {
  try {
    const id = parseInt(req.params.id, 10);
    if (isNaN(id)) {
      res.status(400).json({ success: false, message: "Invalid movie ID format." });
      return;
    }

    const result = await getMovieDetails(id);
    res.json({
      success: true,
      data: result.movie,
      source: result.source
    });
  } catch (error: any) {
    console.error(`Route /api/movie/${req.params.id} error:`, error?.message);
    res.status(500).json({
      success: false,
      message: "Unable to load movie details right now."
    });
  }
});

// 10. STREAMING SOURCES (Where to Watch)
// GET /api/movie/:id/sources?region=US
app.get("/api/movie/:id/sources", async (req: Request, res: Response) => {
  try {
    const id = parseInt(req.params.id, 10);
    if (isNaN(id)) {
      res.status(400).json({ success: false, message: "Invalid movie ID format." });
      return;
    }

    const region = (req.query.region as string) || DEFAULT_REGION;
    const result = await getMovieSources(id, region);
    res.json({
      success: true,
      data: result.sources,
      region: result.region,
      source: result.source
    });
  } catch (error: any) {
    console.error(`Route /api/movie/${req.params.id}/sources error:`, error?.message);
    res.status(500).json({
      success: false,
      message: "Unable to load streaming sources."
    });
  }
});

// 12. UNIFIED SEARCH (Movies + Related Clips)
// GET /api/search?q=batman
app.get("/api/search", async (req: Request, res: Response) => {
  try {
    const query = (req.query.q as string) || "";
    if (!query.trim()) {
      res.json({ success: true, data: [], movies: [], clips: [] });
      return;
    }

    // Simultaneously search movies and clips
    const [movieResult, matchingClips] = await Promise.all([
      searchMovies(query).catch(() => ({ results: [], source: "fallback" as const })),
      searchClips(query).catch(() => [])
    ]);

    res.json({
      success: true,
      data: movieResult.results, // backwards compatibility
      movies: movieResult.results,
      clips: matchingClips,
      source: movieResult.source
    });
  } catch (error: any) {
    console.error("Route /api/search error:", error?.message);
    res.status(500).json({
      success: false,
      message: "Unable to search right now."
    });
  }
});

// CLIPS ENDPOINTS
// GET /api/clips/trending?genre=Sci-Fi
app.get("/api/clips/trending", async (req: Request, res: Response) => {
  try {
    const genre = req.query.genre as string | undefined;
    const clips = await getTrendingClips(genre);
    res.json({ success: true, data: clips });
  } catch (error: any) {
    console.error("Route /api/clips/trending error:", error?.message);
    res.status(500).json({ success: false, message: "Unable to load trending clips." });
  }
});

// GET /api/clips/most-watched
app.get("/api/clips/most-watched", async (_req: Request, res: Response) => {
  try {
    const clips = await getMostWatchedClips();
    res.json({ success: true, data: clips });
  } catch (error: any) {
    console.error("Route /api/clips/most-watched error:", error?.message);
    res.status(500).json({ success: false, message: "Unable to load most watched clips." });
  }
});

// GET /api/clips/all
app.get("/api/clips/all", async (_req: Request, res: Response) => {
  try {
    const clips = await getAllClips();
    res.json({ success: true, data: clips });
  } catch (error: any) {
    console.error("Route /api/clips/all error:", error?.message);
    res.status(500).json({ success: false, message: "Unable to load clips." });
  }
});

// GET /api/clips/search?q=query
app.get("/api/clips/search", async (req: Request, res: Response) => {
  try {
    const query = (req.query.q as string) || "";
    const clips = await searchClips(query);
    res.json({ success: true, data: clips });
  } catch (error: any) {
    console.error("Route /api/clips/search error:", error?.message);
    res.status(500).json({ success: false, message: "Unable to search clips." });
  }
});

// GET /api/clips/:id
app.get("/api/clips/:id", async (req: Request, res: Response) => {
  try {
    const clip = await getClipById(req.params.id);
    if (!clip) {
      res.status(404).json({ success: false, message: "Clip not found" });
      return;
    }
    res.json({ success: true, data: clip });
  } catch (error: any) {
    console.error("Route /api/clips/:id error:", error?.message);
    res.status(500).json({ success: false, message: "Unable to load clip details." });
  }
});

// GET /api/clips/:id/related?movie=Interstellar
// AI-Recommendation: Returns same-movie clips first, followed by genre/theme recommendations!
app.get("/api/clips/:id/related", async (req: Request, res: Response) => {
  try {
    const id = req.params.id;
    const movie = (req.query.movie as string) || "";
    const related = await getRelatedClips(id, movie);
    res.json({
      success: true,
      data: related
    });
  } catch (error: any) {
    console.error("Route /api/clips/:id/related error:", error?.message);
    res.status(500).json({ success: false, message: "Unable to load related clips." });
  }
});

// ADMIN ENDPOINTS (Protected by PIN: 77490869)
// POST /api/admin/verify-pin
app.post("/api/admin/verify-pin", (req: Request, res: Response) => {
  const { pin } = req.body;
  if (pin === ADMIN_PIN) {
    res.json({ success: true, verified: true });
  } else {
    res.status(401).json({ success: false, verified: false, message: "Invalid Admin PIN" });
  }
});

// POST /api/admin/ai-publish-clips
// Receives one or multiple links, uses Gemini AI to analyze, deduce artwork & SEO, and publish directly to feeds!
app.post("/api/admin/ai-publish-clips", async (req: Request, res: Response) => {
  const { pin, links } = req.body;
  if (pin !== ADMIN_PIN) {
    res.status(401).json({ success: false, message: "Unauthorized. Invalid Admin PIN." });
    return;
  }

  if (!links) {
    res.status(400).json({ success: false, message: "No links or movie references provided." });
    return;
  }

  // Parse links into individual strings
  let linkList: string[] = [];
  if (Array.isArray(links)) {
    linkList = links.map(String).map((l) => l.trim()).filter(Boolean);
  } else if (typeof links === "string") {
    linkList = links
      .split(/[\n,]+/)
      .map((l) => l.trim())
      .filter(Boolean);
  }

  if (linkList.length === 0) {
    res.status(400).json({ success: false, message: "Please provide at least one valid video link." });
    return;
  }

  try {
    const newlyCreatedClips: MovieClip[] = [];

    // Process each link with AI
    for (const item of linkList) {
      const clip = await analyzeAndGenerateClipMetadata(item);
      newlyCreatedClips.push(clip);
    }

    // Persist to database/file
    const allUpdatedClips = await addClips(newlyCreatedClips);

    res.json({
      success: true,
      publishedCount: newlyCreatedClips.length,
      newClips: newlyCreatedClips,
      totalClips: allUpdatedClips.length
    });
  } catch (error: any) {
    console.error("Route /api/admin/ai-publish-clips error:", error?.message);
    res.status(500).json({
      success: false,
      message: error?.message || "Failed to process links with AI."
    });
  }
});

// DELETE /api/admin/clips/:id
app.delete("/api/admin/clips/:id", async (req: Request, res: Response) => {
  const pin = req.headers["x-admin-pin"] || req.body?.pin || req.query?.pin;
  if (pin !== ADMIN_PIN) {
    res.status(401).json({ success: false, message: "Unauthorized. Invalid Admin PIN." });
    return;
  }

  try {
    const updated = await deleteClip(req.params.id);
    res.json({ success: true, remainingCount: updated.length });
  } catch (error: any) {
    res.status(500).json({ success: false, message: "Failed to delete clip." });
  }
});

// POST /api/admin/clips/reset
app.post("/api/admin/clips/reset", async (req: Request, res: Response) => {
  const { pin } = req.body;
  if (pin !== ADMIN_PIN) {
    res.status(401).json({ success: false, message: "Unauthorized. Invalid Admin PIN." });
    return;
  }

  try {
    const reset = await resetClipsToDefault();
    res.json({ success: true, count: reset.length });
  } catch (error: any) {
    res.status(500).json({ success: false, message: "Failed to reset clips." });
  }
});

// ==========================================
// ADS & SPONSORED POSTERS MANAGEMENT
// ==========================================
// GET /api/ads - Public active ads for homepage
app.get("/api/ads", async (_req: Request, res: Response) => {
  try {
    const ads = await getActiveAds();
    res.json({ success: true, data: ads });
  } catch (error: any) {
    console.error("Route /api/ads error:", error?.message);
    res.status(500).json({ success: false, message: "Unable to load ads" });
  }
});

// GET /api/admin/ads - Admin list of all ads
app.get("/api/admin/ads", async (req: Request, res: Response) => {
  const pin = req.headers["x-admin-pin"] || req.query.pin;
  if (pin !== ADMIN_PIN) {
    res.status(401).json({ success: false, message: "Unauthorized. Invalid Admin PIN." });
    return;
  }

  try {
    const ads = await getAllAds();
    res.json({ success: true, data: ads });
  } catch (error: any) {
    res.status(500).json({ success: false, message: "Unable to load ads" });
  }
});

// POST /api/admin/ads - Create new ad with uploaded poster & destination URL
app.post("/api/admin/ads", async (req: Request, res: Response) => {
  const { pin, title, posterUrl, targetUrl, tag } = req.body;
  if (pin !== ADMIN_PIN) {
    res.status(401).json({ success: false, message: "Unauthorized. Invalid Admin PIN." });
    return;
  }

  if (!posterUrl || !posterUrl.trim()) {
    res.status(400).json({ success: false, message: "Poster or thumbnail image is required." });
    return;
  }

  if (!targetUrl || !targetUrl.trim()) {
    res.status(400).json({ success: false, message: "Destination link is required." });
    return;
  }

  try {
    const newAd = await createAd({
      title: title || "Exclusive Movie Premiere",
      posterUrl,
      targetUrl,
      tag: tag || "SPONSORED"
    });
    res.json({ success: true, ad: newAd, message: "Ad banner published successfully!" });
  } catch (error: any) {
    console.error("Error creating ad:", error?.message);
    res.status(500).json({ success: false, message: "Failed to create ad." });
  }
});

// POST /api/admin/ads/:id/toggle - Toggle ad active state
app.post("/api/admin/ads/:id/toggle", async (req: Request, res: Response) => {
  const { pin } = req.body;
  if (pin !== ADMIN_PIN) {
    res.status(401).json({ success: false, message: "Unauthorized. Invalid Admin PIN." });
    return;
  }

  try {
    const updated = await toggleAd(req.params.id);
    if (!updated) {
      res.status(404).json({ success: false, message: "Ad not found" });
      return;
    }
    res.json({ success: true, ad: updated });
  } catch (error: any) {
    res.status(500).json({ success: false, message: "Failed to toggle ad" });
  }
});

// DELETE /api/admin/ads/:id - Delete ad
app.delete("/api/admin/ads/:id", async (req: Request, res: Response) => {
  const pin = req.headers["x-admin-pin"] || req.query.pin || req.body?.pin;
  if (pin !== ADMIN_PIN) {
    res.status(401).json({ success: false, message: "Unauthorized. Invalid Admin PIN." });
    return;
  }

  try {
    const ok = await deleteAd(req.params.id);
    if (!ok) {
      res.status(404).json({ success: false, message: "Ad not found" });
      return;
    }
    res.json({ success: true, message: "Ad removed successfully" });
  } catch (error: any) {
    res.status(500).json({ success: false, message: "Failed to delete ad" });
  }
});

// POST /api/ads/:id/click - Track click
app.post("/api/ads/:id/click", async (req: Request, res: Response) => {
  try {
    const clicks = await recordAdClick(req.params.id);
    res.json({ success: true, clicks });
  } catch {
    res.json({ success: true });
  }
});

// ==========================================
// REAL-TIME PRESENCE & MOVIE WATCHING PLUGIN
// ==========================================
interface UserSession {
  sessionId: string;
  lastSeen: number;
  movieTitle?: string;
  clipTitle?: string;
  isPlaying?: boolean;
  device?: string;
  quality?: string;
}

const activeSessions = new Map<string, UserSession>();

// Seed baseline realistic active online audience
const SIMULATED_AUDIENCE = [
  { movieTitle: "Dune: Part Two", clipTitle: "Worm Ride 4K IMAX", count: 16, quality: "4K IMAX" },
  { movieTitle: "Interstellar", clipTitle: "Docking Scene", count: 12, quality: "4K UHD" },
  { movieTitle: "Oppenheimer", clipTitle: "Trinity Test Scene", count: 9, quality: "4K UHD" },
  { movieTitle: "The Dark Knight", clipTitle: "Armored Car Chase", count: 7, quality: "1080p HD" },
  { movieTitle: "Avatar: The Way of Water", clipTitle: "Tulkun Battle 4K", count: 5, quality: "4K HDR" },
  { movieTitle: "John Wick 4", clipTitle: "Arc de Triomphe 4K", count: 4, quality: "4K UHD" }
];

// POST /api/presence/ping - Heartbeat sent from viewer client
app.post("/api/presence/ping", (req: Request, res: Response) => {
  try {
    const { sessionId, movieTitle, clipTitle, isPlaying, device, quality } = req.body;
    if (!sessionId) {
      res.status(400).json({ success: false, message: "Session ID required" });
      return;
    }

    const safeSessionId = String(sessionId).slice(0, 50);

    activeSessions.set(safeSessionId, {
      sessionId: safeSessionId,
      lastSeen: Date.now(),
      movieTitle: movieTitle ? String(movieTitle).slice(0, 100) : undefined,
      clipTitle: clipTitle ? String(clipTitle).slice(0, 100) : undefined,
      isPlaying: Boolean(isPlaying),
      device: device ? String(device).slice(0, 50) : "Desktop",
      quality: quality ? String(quality).slice(0, 20) : "4K UHD"
    });

    res.json({ success: true });
  } catch (err: any) {
    console.error("Presence ping error:", err?.message);
    res.json({ success: true });
  }
});

// GET /api/presence/stats - Real-time statistics of online users & what movies they are watching
app.get("/api/presence/stats", (_req: Request, res: Response) => {
  try {
    const now = Date.now();
    // Cleanup stale sessions older than 45 seconds
    for (const [id, session] of activeSessions.entries()) {
      if (now - session.lastSeen > 45000) {
        activeSessions.delete(id);
      }
    }

    // Count active live browser sessions
    const realSessions = Array.from(activeSessions.values());
    const realOnlineCount = realSessions.length;

    // Group real sessions by movie
    const movieCountMap: { [movie: string]: { count: number; clipTitle?: string; quality: string } } = {};

    // Add simulated baseline counts
    for (const sim of SIMULATED_AUDIENCE) {
      movieCountMap[sim.movieTitle] = {
        count: sim.count,
        clipTitle: sim.clipTitle,
        quality: sim.quality
      };
    }

    // Merge real sessions
    for (const sess of realSessions) {
      if (sess.movieTitle) {
        if (!movieCountMap[sess.movieTitle]) {
          movieCountMap[sess.movieTitle] = {
            count: 1,
            clipTitle: sess.clipTitle,
            quality: sess.quality || "4K UHD"
          };
        } else {
          movieCountMap[sess.movieTitle].count += 1;
        }
      }
    }

    // Calculate totals
    let totalWatchingCount = 0;
    const viewersByMovie = Object.entries(movieCountMap)
      .map(([movieTitle, data]) => {
        totalWatchingCount += data.count;
        return {
          movieTitle,
          clipTitle: data.clipTitle,
          count: data.count,
          quality: data.quality
        };
      })
      .sort((a, b) => b.count - a.count);

    const baselineOnline = 48; // Active global viewers
    const totalOnlineCount = baselineOnline + realOnlineCount;

    // Recent Live Activity Stream
    const recentActivities = [
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
      },
      {
        id: "act-3",
        user: "User #7190",
        action: "Opened full player",
        movie: "Oppenheimer",
        quality: "4K HDR",
        device: "Safari / macOS",
        time: "28s ago"
      },
      {
        id: "act-4",
        user: "User #1085",
        action: "Streaming trailer",
        movie: "The Dark Knight",
        quality: "1080p HD",
        device: "Mobile / iOS",
        time: "45s ago"
      }
    ];

    // If real user is watching something, prepend to activity feed!
    for (const sess of realSessions.slice(0, 3)) {
      if (sess.movieTitle) {
        const sId = String(sess.sessionId || "guest");
        recentActivities.unshift({
          id: `act-real-${sId.slice(0, 6)}`,
          user: `Live Guest (${sId.slice(0, 4)})`,
          action: sess.isPlaying ? "Actively Streaming" : "Browsing Title",
          movie: sess.movieTitle,
          quality: sess.quality || "4K UHD",
          device: sess.device || "Web Browser",
          time: "Active now"
        });
      }
    }

    res.json({
      success: true,
      onlineCount: totalOnlineCount,
      watchingCount: totalWatchingCount,
      viewersByMovie,
      recentActivities: recentActivities.slice(0, 6),
      timestamp: new Date().toISOString()
    });
  } catch (error: any) {
    console.error("Presence stats route error:", error?.message);
    res.json({
      success: true,
      onlineCount: 48,
      watchingCount: 53,
      viewersByMovie: [
        { movieTitle: "Dune: Part Two", clipTitle: "Worm Ride 4K IMAX", count: 16, quality: "4K IMAX" },
        { movieTitle: "Interstellar", clipTitle: "Docking Scene", count: 12, quality: "4K UHD" },
        { movieTitle: "Oppenheimer", clipTitle: "Trinity Test Scene", count: 9, quality: "4K UHD" }
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
        }
      ],
      timestamp: new Date().toISOString()
    });
  }
});

// ==========================================
// ADMIN: CUSTOM CLIP PUBLISHER
// (Title & Thumbnail Optional)
// ==========================================
// Helper to extract YouTube video ID
function extractYouTubeId(url: string): string | null {
  const regExp = /(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/;
  const match = url.match(regExp);
  return match ? match[1] : null;
}

// POST /api/admin/publish-clip-custom
app.post("/api/admin/publish-clip-custom", async (req: Request, res: Response) => {
  const { pin, videoUrl, title, thumbnail, movieTitle, genre, quality } = req.body;

  if (pin !== ADMIN_PIN) {
    res.status(401).json({ success: false, message: "Unauthorized. Invalid Admin PIN." });
    return;
  }

  if (!videoUrl || typeof videoUrl !== "string" || !videoUrl.trim()) {
    res.status(400).json({ success: false, message: "Video link is required." });
    return;
  }

  const rawUrl = videoUrl.trim();
  const ytId = extractYouTubeId(rawUrl);

  let finalEmbedUrl = rawUrl;
  let autoThumb = "https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?w=1280&auto=format&fit=crop&q=80";

  if (ytId) {
    finalEmbedUrl = `https://www.youtube.com/embed/${ytId}?autoplay=1&rel=0`;
    autoThumb = `https://img.youtube.com/vi/${ytId}/maxresdefault.jpg`;
  }

  // Title is OPTIONAL - if omitted, auto-generate clean title
  const finalMovieTitle = movieTitle && movieTitle.trim() ? movieTitle.trim() : (ytId ? "Cinema Premiere" : "Featured Movie");
  const finalClipTitle = title && title.trim() ? title.trim() : `${finalMovieTitle} — Iconic 4K Scene`;

  // Thumbnail is OPTIONAL - if omitted, use autoThumb
  const finalThumbnail = thumbnail && thumbnail.trim() ? thumbnail.trim() : autoThumb;

  const clipId = `clip-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
  const cleanQuality = quality === "1080p HD" || quality === "720p HD" ? quality : "4K UHD";

  const newClip: MovieClip = {
    id: clipId,
    movieTitle: finalMovieTitle,
    clipTitle: finalClipTitle,
    videoUrl: finalEmbedUrl,
    thumbnail: finalThumbnail,
    poster: finalThumbnail,
    backdrop: finalThumbnail,
    duration: "3:30",
    year: new Date().getFullYear(),
    genre: genre || "Action",
    genres: [genre || "Action", "Cinema"],
    description: `High-definition ${cleanQuality} scene from ${finalMovieTitle}. Added via MOVLO Studio Admin.`,
    views: Math.floor(Math.random() * 80000) + 12000,
    likes: Math.floor(Math.random() * 4000) + 800,
    rating: 9.2,
    quality: cleanQuality,
    isTrending: true,
    isMostWatched: false,
    publishedAt: new Date().toISOString(),
    tags: [finalMovieTitle.toLowerCase(), "4k", "scene", "cinema"],
    seo: {
      title: `${finalMovieTitle} - ${finalClipTitle} 4K`,
      description: `Watch ${finalClipTitle} from ${finalMovieTitle} in stunning ${cleanQuality}.`,
      keywords: [finalMovieTitle, "4k clip", "movie scene"]
    }
  };

  try {
    const allClips = await addClips([newClip]);
    res.json({
      success: true,
      clip: newClip,
      totalClips: allClips.length,
      message: "Clip published successfully to Home Feeds!"
    });
  } catch (err: any) {
    console.error("Error adding custom clip:", err);
    res.status(500).json({ success: false, message: "Failed to publish clip." });
  }
});

// 23. GENRES
// GET /api/genres
app.get("/api/genres", async (_req: Request, res: Response) => {
  try {
    const result = await getGenres();
    res.json({
      success: true,
      data: result.genres,
      source: result.source
    });
  } catch (error: any) {
    console.error("Route /api/genres error:", error?.message);
    res.status(500).json({
      success: false,
      message: "Unable to load movie genres."
    });
  }
});

// Dynamic Meta Tag and JSON-LD HTML Injector for individual movie pages (/movie/:id)
function escapeHtml(str: string): string {
  return str
    .replace(/&/g, "&amp;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

function renderMovieHtmlWithMeta(baseHtml: string, movie: any, sources: any[] = [], reqUrl: string): string {
  const yearSuffix = movie.year ? ` (${movie.year})` : "";
  const ratingSuffix = movie.rating ? ` ★ ${movie.rating}` : "";
  const title = `${movie.title}${yearSuffix}${ratingSuffix} — Stream & Plot | MOVLO`;
  
  const rawPlot = movie.description || "";
  let cleanPlot = rawPlot ? rawPlot.replace(/\s+/g, " ").trim() : "";
  if (cleanPlot.length > 120) {
    cleanPlot = cleanPlot.substring(0, 120).replace(/\s+\S*$/, "") + "...";
  }
  const metaDesc = cleanPlot 
    ? `Watch ${movie.title}${yearSuffix}: ${cleanPlot} Find where to stream, rent, or buy online on MOVLO.`
    : `Discover ${movie.title}${yearSuffix} on MOVLO. Explore full movie plot, release information, user reviews, official trailer, and streaming options.`;

  const genreList = movie.genres && movie.genres.length > 0 ? movie.genres.join(", ") : "Cinema";
  const dynamicKeywords = `${movie.title}, ${movie.title} stream, ${movie.title} plot, ${movie.title} cast, watch ${movie.title} online, ${genreList}, streaming sources, where to watch, MOVLO`;
  const image = movie.backdrop || movie.poster || "https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?w=1200&auto=format&fit=crop&q=80";

  const movieJsonLd = {
    "@context": "https://schema.org",
    "@type": "Movie",
    "@id": `${reqUrl}#movie`,
    "url": reqUrl,
    "name": movie.title,
    "headline": `${movie.title}${yearSuffix}`,
    "description": movie.description || metaDesc,
    "image": [image],
    "datePublished": movie.releaseDate || (movie.year ? `${movie.year}-01-01` : undefined),
    "genre": movie.genres || [],
    "duration": movie.runtime ? `PT${movie.runtime}M` : undefined,
    "contentRating": movie.usRating || undefined,
    "aggregateRating": (movie.userRating || movie.rating) ? {
      "@type": "AggregateRating",
      "ratingValue": movie.userRating || movie.rating,
      "bestRating": "10",
      "worstRating": "1",
      "ratingCount": movie.criticScore ? Math.round(movie.criticScore * 18) : 150
    } : undefined,
    "offers": (sources && sources.length > 0) ? sources.map(s => ({
      "@type": "Offer",
      "category": s.type === "rent" ? "Rent" : s.type === "buy" ? "Buy" : "Subscription",
      "price": s.price ? s.price.toString() : "0",
      "priceCurrency": "USD",
      "availability": "https://schema.org/InStock",
      "seller": {
        "@type": "Organization",
        "name": s.name
      },
      "url": s.webUrl || reqUrl
    })) : undefined
  };

  const jsonLdScript = `<script type="application/ld+json" id="movie-jsonld">\n${JSON.stringify(movieJsonLd, null, 2)}\n</script>`;

  // Replace default title and meta tags
  let html = baseHtml;
  html = html.replace(/<title>.*?<\/title>/i, `<title>${escapeHtml(title)}</title>`);
  html = html.replace(/<meta name="description" content=".*?" \/>/i, `<meta name="description" content="${escapeHtml(metaDesc)}" />`);
  html = html.replace(/<meta name="keywords" content=".*?" \/>/i, `<meta name="keywords" content="${escapeHtml(dynamicKeywords)}" />`);
  html = html.replace(/<meta property="og:title" content=".*?" \/>/i, `<meta property="og:title" content="${escapeHtml(title)}" />`);
  html = html.replace(/<meta property="og:description" content=".*?" \/>/i, `<meta property="og:description" content="${escapeHtml(metaDesc)}" />`);
  html = html.replace(/<meta property="og:type" content=".*?" \/>/i, `<meta property="og:type" content="video.movie" />`);
  html = html.replace(/<meta name="twitter:title" content=".*?" \/>/i, `<meta name="twitter:title" content="${escapeHtml(title)}" />`);
  html = html.replace(/<meta name="twitter:description" content=".*?" \/>/i, `<meta name="twitter:description" content="${escapeHtml(metaDesc)}" />`);
  html = html.replace(/<link rel="canonical" href=".*?" \/>/i, `<link rel="canonical" href="${escapeHtml(reqUrl)}" />`);

  // Insert image and JSON-LD right before </head>
  const tagsToInject = `
    <meta property="og:image" content="${escapeHtml(image)}" />
    <meta name="twitter:image" content="${escapeHtml(image)}" />
    ${jsonLdScript}
  </head>`;
  html = html.replace(/<\/head>/i, tagsToInject);

  return html;
}

// SPA & Vite Integration
async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });

    // Dynamic metadata route for /movie/:id in dev
    app.get("/movie/:id", async (req: Request, res: Response, next) => {
      const movieId = parseInt(req.params.id, 10);
      if (isNaN(movieId)) return next();

      try {
        const [movieRes, sourcesRes] = await Promise.all([
          getMovieDetails(movieId).catch(() => null),
          getMovieSources(movieId, DEFAULT_REGION).catch(() => ({ sources: [] }))
        ]);

        if (!movieRes || !movieRes.movie) {
          return next();
        }

        const indexPath = path.join(process.cwd(), "index.html");
        let rawHtml = await fs.promises.readFile(indexPath, "utf-8");
        rawHtml = await vite.transformIndexHtml(req.originalUrl, rawHtml);

        const fullUrl = `${req.protocol}://${req.get("host")}/movie/${movieId}`;
        const transformedHtml = renderMovieHtmlWithMeta(rawHtml, movieRes.movie, sourcesRes.sources || [], fullUrl);

        res.status(200).set({ "Content-Type": "text/html" }).send(transformedHtml);
      } catch (err) {
        console.error("Dev /movie/:id SSR meta injection error:", err);
        next();
      }
    });

    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");

    // Dynamic metadata route for /movie/:id in production
    app.get("/movie/:id", async (req: Request, res: Response, next) => {
      const movieId = parseInt(req.params.id, 10);
      if (isNaN(movieId)) return next();

      try {
        const [movieRes, sourcesRes] = await Promise.all([
          getMovieDetails(movieId).catch(() => null),
          getMovieSources(movieId, DEFAULT_REGION).catch(() => ({ sources: [] }))
        ]);

        if (!movieRes || !movieRes.movie) {
          return next();
        }

        const indexPath = path.join(distPath, "index.html");
        const rawHtml = await fs.promises.readFile(indexPath, "utf-8");

        const fullUrl = `${req.protocol}://${req.get("host")}/movie/${movieId}`;
        const transformedHtml = renderMovieHtmlWithMeta(rawHtml, movieRes.movie, sourcesRes.sources || [], fullUrl);

        res.status(200).set({ "Content-Type": "text/html" }).send(transformedHtml);
      } catch (err) {
        console.error("Prod /movie/:id SSR meta injection error:", err);
        next();
      }
    });

    app.use(express.static(distPath));
    app.get("*", (_req: Request, res: Response) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`[MOVLO Server] Running on http://localhost:${PORT}`);
  });
}

startServer();
