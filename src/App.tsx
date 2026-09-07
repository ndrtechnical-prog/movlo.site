import React, { useState, useEffect, useCallback } from "react";
import { Navbar } from "./components/Navbar";
import { HeroSection } from "./components/HeroSection";
import { UpcomingSection } from "./components/UpcomingSection";
import { AdBannerCard } from "./components/AdBannerCard";
import { RecentAddedSection } from "./components/RecentAddedSection";
import { RecentWatchSection } from "./components/RecentWatchSection";
import { MyWatchlistSection } from "./components/MyWatchlistSection";
import { ClipPlayerModal } from "./components/ClipPlayerModal";
import { MovieDetailsModal } from "./components/MovieDetailsModal";
import { AdminPortalModal } from "./components/AdminPortalModal";
import { AdminKeyPromptModal } from "./components/AdminKeyPromptModal";
import { Footer } from "./components/Footer";
import { MonetagPromoBanner } from "./components/MonetagPromoBanner";
import { MonetagStickyBar } from "./components/MonetagStickyBar";
import { Movie, MovieClip, AdBanner } from "./types";
import {
  fetchRecentWatchedMovies,
  recordMovieWatch,
  RecentAddedItem,
  recordAdClick,
  fetchActiveAds,
  pingPresence
} from "./lib/api";
import { resetDefaultMetadata } from "./lib/metaManager";
import { useWatchlist } from "./lib/watchlist";
import {
  MovieCategory,
  JsonMovie,
  jsonMovieToMovie
} from "./lib/jsonMovies";
import {
  getStoredRecentlyWatched,
  saveRecentlyWatched
} from "./lib/recentlyWatched";
import { maybeTriggerMonetagOnAction } from "./lib/monetag";

export default function App() {
  // Movie category navigation state (English Movies is the default first page)
  const [selectedCategory, setSelectedCategory] = useState<MovieCategory>("english");

  // Recently Watched state (Loaded from & synced to local persistence)
  const [recentWatchedMovies, setRecentWatchedMovies] = useState<Movie[]>([]);
  const [isRecentWatchedLoading, setIsRecentWatchedLoading] = useState(true);
  const [recentWatchedError, setRecentWatchedError] = useState<string | null>(null);

  // Active Ads (Created by Admin via Phone Upload + Link Attachment)
  const [ads, setAds] = useState<AdBanner[]>([]);

  // Browser State Watchlist Hook
  const { watchlist, removeFromWatchlist, clearWatchlist } = useWatchlist();

  // Active Trailer / Cinema Clip Player Modal
  const [activeClip, setActiveClip] = useState<MovieClip | null>(null);

  // Active Movie Details Modal
  const [activeMovieId, setActiveMovieId] = useState<number | null>(null);

  // Admin Vault Modal states
  const [isAdminOpen, setIsAdminOpen] = useState(false);
  const [isKeyPromptOpen, setIsKeyPromptOpen] = useState(false);
  const [isAdminPreVerified, setIsAdminPreVerified] = useState(false);

  // When key (77490869) is successfully verified
  const handleAdminKeySuccess = () => {
    setIsKeyPromptOpen(false);
    setIsAdminPreVerified(true);
    setIsAdminOpen(true);
  };

  // Secret keyboard combo listener for admin key prompt (Ctrl+Shift+A)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.ctrlKey && e.shiftKey && (e.key === "A" || e.key === "a")) {
        e.preventDefault();
        setIsKeyPromptOpen((prev) => !prev);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  // Region
  const [currentRegion, setCurrentRegion] = useState("US");

  // Client Session ID for presence tracking
  const [sessionId] = useState(() => {
    if (typeof window !== "undefined") {
      let sid = sessionStorage.getItem("movlo_sid");
      if (!sid) {
        sid = "user_" + Math.random().toString(36).slice(2, 9);
        sessionStorage.setItem("movlo_sid", sid);
      }
      return sid;
    }
    return "user_guest";
  });

  // Real-time Presence Heartbeat
  useEffect(() => {
    const reportPresence = () => {
      pingPresence({
        sessionId,
        movieTitle: activeClip?.movieTitle || undefined,
        clipTitle: activeClip?.clipTitle || undefined,
        isPlaying: Boolean(activeClip),
        device: window.innerWidth < 768 ? "Mobile" : "Desktop",
        quality: activeClip?.quality || "4K UHD"
      });
    };

    reportPresence();
    const timer = setInterval(reportPresence, 12000);
    return () => clearInterval(timer);
  }, [sessionId, activeClip]);

  // Load Initial Recently Watched from local storage (or fallback to API)
  const loadWatchedData = useCallback(async () => {
    setIsRecentWatchedLoading(true);
    try {
      const stored = getStoredRecentlyWatched();
      if (stored && stored.length > 0) {
        setRecentWatchedMovies(stored.map((m, idx) => jsonMovieToMovie(m, idx)));
        setRecentWatchedError(null);
      } else {
        // Fallback to initial sample movies
        const watchedRes = await fetchRecentWatchedMovies();
        setRecentWatchedMovies(watchedRes.movies);
        setRecentWatchedError(null);
      }
    } catch (err) {
      console.warn("Recent watched fetch error:", err);
      setRecentWatchedError("Unable to load recently watched movies.");
    } finally {
      setIsRecentWatchedLoading(false);
    }
  }, []);

  useEffect(() => {
    loadWatchedData();
    // Load active ads
    fetchActiveAds()
      .then((data) => setAds(data))
      .catch(() => setAds([]));
  }, [loadWatchedData]);

  // Check URL on load for direct /movie/:id route
  useEffect(() => {
    const handleUrlRoute = () => {
      const path = window.location.pathname;
      const movieMatch = path.match(/\/movie\/(\d+)/);
      if (movieMatch && movieMatch[1]) {
        setActiveMovieId(parseInt(movieMatch[1], 10));
      } else {
        const params = new URLSearchParams(window.location.search);
        const qMovieId = params.get("movie");
        if (qMovieId) {
          setActiveMovieId(parseInt(qMovieId, 10));
        } else {
          resetDefaultMetadata();
        }
      }
    };

    handleUrlRoute();
    window.addEventListener("popstate", handleUrlRoute);
    return () => window.removeEventListener("popstate", handleUrlRoute);
  }, []);

  // Movie details modal handlers
  const openMovie = (id: number) => {
    // If the movie in recently watched has a direct YouTube video link, play it!
    const matched = recentWatchedMovies.find((m) => m.id === id);
    if (matched && matched.trailer) {
      openClip({
        id: String(matched.id),
        movieId: matched.id,
        movieTitle: matched.title,
        clipTitle: matched.title,
        videoUrl: matched.trailer,
        thumbnail: matched.backdrop || matched.poster,
        poster: matched.poster,
        year: matched.year,
        rating: matched.userRating || 9.2,
        genre: matched.genres?.[0] || "Cinema"
      });
      return;
    }

    setActiveMovieId(id);
    window.history.pushState({ movieId: id }, "", `/movie/${id}`);

    // Track real movie watch event
    recordMovieWatch({
      id,
      title: matched?.title || `Movie ${id}`,
      poster: matched?.poster,
      backdrop: matched?.backdrop,
      rating: matched?.userRating,
      year: matched?.year,
      quality: "4K UHD"
    });
  };

  const closeMovie = () => {
    setActiveMovieId(null);
    window.history.pushState({}, "", "/");
    resetDefaultMetadata();
  };

  // Trailer / Clip handlers
  const openClip = (clip: Partial<MovieClip>) => {
    const qualityVal = (clip.quality === "1080p HD" || clip.quality === "720p HD" ? clip.quality : "4K UHD");
    const thumb = clip.thumbnail || clip.poster || "https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?w=800&auto=format&fit=crop&q=80";

    // Track real movie watch event
    if (clip.movieTitle || clip.clipTitle) {
      recordMovieWatch({
        id: clip.movieId || Date.now(),
        title: clip.movieTitle || clip.clipTitle || "Cinema",
        poster: clip.poster || thumb,
        backdrop: clip.backdrop || thumb,
        year: clip.year,
        rating: clip.rating,
        genre: clip.genre,
        quality: qualityVal
      });
    }

    setActiveClip({
      id: clip.id || String(Date.now()),
      movieId: clip.movieId || 0,
      movieTitle: clip.movieTitle || "Featured Cinema",
      clipTitle: clip.clipTitle || "Official Video",
      videoUrl: clip.videoUrl || "",
      thumbnail: thumb,
      poster: clip.poster || thumb,
      backdrop: clip.backdrop || thumb,
      duration: clip.duration || "Full Movie",
      quality: qualityVal,
      genre: clip.genre || "Cinema",
      genres: clip.genres || ["Cinema", "Feature"],
      year: clip.year || 2026,
      rating: clip.rating || 9.2,
      description: clip.description || "Movlo High Definition Stream"
    });
  };

  const closeClip = () => {
    setActiveClip(null);
  };

  // Handle Play directly from JSON Movie (Global Search or Hero)
  const handlePlayJsonMovie = (movie: JsonMovie) => {
    // Add to Recently Watched with local persistence
    const updated = saveRecentlyWatched(movie);
    setRecentWatchedMovies(updated.map((m, idx) => jsonMovieToMovie(m, idx)));

    // Smart Monetag monetization action
    maybeTriggerMonetagOnAction();

    openClip({
      id: movie.id,
      movieId: 0,
      movieTitle: movie.title,
      clipTitle: movie.fullTitle || movie.title,
      videoUrl: movie.videoUrl,
      thumbnail: movie.thumbnail || movie.poster,
      poster: movie.poster || movie.thumbnail,
      backdrop: movie.backdrop || movie.thumbnail || movie.poster,
      duration: movie.duration || "Full Movie",
      quality: (movie.quality === "720p HD" || movie.quality === "4K UHD" ? movie.quality : "1080p HD"),
      genre: movie.genre || "Cinema",
      genres: movie.genres || [movie.genre || "Cinema"],
      year: movie.year || 2026,
      rating: movie.rating || 9.2,
      description: movie.description
    });
  };

  // Handle click on Movie Card in the Catalog
  const handleSelectRecentItem = (item: RecentAddedItem) => {
    if (item.itemType === "ad_link" || item.isAd) {
      if (item.targetUrl) {
        recordAdClick(item.id).catch(() => {});
        window.open(item.targetUrl, "_blank", "noopener,noreferrer");
      }
    } else {
      const jsonMovie: JsonMovie = {
        id: item.id,
        title: item.title,
        fullTitle: item.subtitle,
        videoUrl: item.videoUrl || "",
        thumbnail: item.poster,
        poster: item.poster,
        backdrop: item.backdrop || item.poster,
        duration: item.duration || "Full Movie",
        quality: item.quality || "4K UHD",
        genre: item.genre || "Cinema",
        genres: item.genres || ["Cinema", "Feature"],
        year: item.year || 2026,
        views: item.views || 60000,
        rating: item.rating || 9.2,
        description: item.description,
        category: selectedCategory
      };

      // Add to Recently Watched with local persistence
      const updated = saveRecentlyWatched(jsonMovie);
      setRecentWatchedMovies(updated.map((m, idx) => jsonMovieToMovie(m, idx)));

      // Smart Monetag action trigger
      maybeTriggerMonetagOnAction();

      openClip({
        id: item.id,
        movieId: 0,
        movieTitle: item.title,
        clipTitle: item.subtitle,
        videoUrl: item.videoUrl || "",
        thumbnail: item.poster,
        poster: item.poster,
        backdrop: item.backdrop || item.poster,
        duration: item.duration || "Full Movie",
        quality: (item.quality === "1080p HD" || item.quality === "720p HD" ? item.quality : "4K UHD"),
        genre: item.genre || "Cinema",
        genres: item.genres || ["Cinema"],
        year: item.year || 2026,
        views: item.views || 60000,
        rating: item.rating || 9.2,
        description: item.description || "Movlo Cinema Stream"
      });
    }
  };

  return (
    <div className="min-h-screen bg-[#07080c] text-neutral-100 flex flex-col font-['Plus_Jakarta_Sans',sans-serif] selection:bg-amber-400 selection:text-black">
      {/* 
        HEADER:
        - Displays movie-site branding/title: Movlo.site
        - Preserves existing navigation and styling
      */}
      <Navbar
        onSelectMovie={openMovie}
        onPlayClip={openClip}
        currentRegion={currentRegion}
        onRegionChange={setCurrentRegion}
        hasApiKey={true}
        onNavigateSection={(sectionId) => {
          const el = document.getElementById(sectionId);
          if (el) el.scrollIntoView({ behavior: "smooth" });
        }}
        onOpenAdmin={() => setIsKeyPromptOpen(true)}
      />

      {/* 
        HERO SECTION:
        - Directly below the header: Premium-looking search bar querying all JSON datasets
        - Directly under the search bar: 5 category navigation buttons (English, Indian, Chinese, Dramas, Others)
        - Over the hero video loop without obstructing key visuals
        - Center Movlo.site branding
      */}
      <HeroSection
        selectedCategory={selectedCategory}
        onSelectCategory={setSelectedCategory}
        onPlayJsonMovie={handlePlayJsonMovie}
        onSelectMovie={openMovie}
        onPlayClip={openClip}
        watchlistCount={watchlist.length}
        onTriggerAdminKey={() => setIsKeyPromptOpen(true)}
      />

      {/* Active Ads or Monetag Revenue Banner */}
      {ads.length > 0 ? (
        <div className="w-full">
          {ads.map((ad) => (
            <AdBannerCard key={ad.id} ad={ad} />
          ))}
        </div>
      ) : (
        <MonetagPromoBanner />
      )}

      {/* PRIMARY APPLICATION SECTIONS */}
      <main className="flex-1 w-full flex flex-col">
        {/* 
          MOVIE CATEGORY CATALOG:
          - Automatically reads from the respective JSON file:
            • English Movies (initial 8 movies, paginated without full page reload)
            • Indian Movies (infinite / continuous scrolling of all ~100 movies)
            • Chinese Movies, Dramas, Others
          - Reuses existing 16:9 movie-card design
        */}
        <div id="recent-added" className="pt-2">
          <RecentAddedSection
            selectedCategory={selectedCategory}
            onSelectCategory={setSelectedCategory}
            onSelectItem={handleSelectRecentItem}
          />
        </div>

        {/* Monetag In-Feed Midpoint High-Yield Banner */}
        <MonetagPromoBanner />

        {/* 
          RECENTLY WATCHED SECTION:
          - Automatically populated when a user watches/opens any movie
          - Stored in localStorage so it remains after navigating between categories
          - Uses existing Recently Watched UI
        */}
        <div id="recent-watch" className="pt-4">
          <div id="most-watched" />
          <RecentWatchSection
            movies={recentWatchedMovies}
            isLoading={isRecentWatchedLoading}
            error={recentWatchedError}
            onSelectMovie={openMovie}
            onRetry={loadWatchedData}
          />
        </div>

        {/* 
          MY WATCHLIST SECTION:
          - Stored locally in browser state
          - Saved directly from Movie Details modal
        */}
        <div id="my-watchlist" className="pt-4">
          <MyWatchlistSection
            watchlist={watchlist}
            onSelectMovie={openMovie}
            onRemoveMovie={removeFromWatchlist}
            onClearWatchlist={clearWatchlist}
            onBrowseExplore={() => {
              const el = document.getElementById("recent-added");
              if (el) el.scrollIntoView({ behavior: "smooth" });
            }}
          />
        </div>

        {/* 
          NEW RELEASE MOVIES (API / TMDB MOVIES SECTION):
          - Only location where API/TMDB movies appear
          - Displayed as a single horizontal strip / row
          - Plays official movie trailers
        */}
        <div id="upcoming-trailers" className="pt-4">
          <UpcomingSection
            onPlayTrailer={openClip}
            onSelectMovie={openMovie}
          />
        </div>
      </main>

      {/* Trailer / Video Player Modal */}
      {activeClip && (
        <ClipPlayerModal
          clip={activeClip}
          onClose={closeClip}
          onSelectClip={(c) => openClip(c)}
          onOpenMovieDetails={(mId) => {
            closeClip();
            openMovie(mId);
          }}
        />
      )}

      {/* Full Movie Details Modal */}
      {activeMovieId && (
        <MovieDetailsModal
          movieId={activeMovieId}
          onClose={closeMovie}
          onPlayTrailer={(clip) => openClip(clip)}
          onSelectRelatedMovie={(rId) => openMovie(rId)}
        />
      )}

      {/* Secret Admin Key Prompt Modal (Password: 77490869) */}
      <AdminKeyPromptModal
        isOpen={isKeyPromptOpen}
        onClose={() => setIsKeyPromptOpen(false)}
        onSuccess={handleAdminKeySuccess}
      />

      {/* Secret Admin Portal Modal */}
      <AdminPortalModal
        isOpen={isAdminOpen}
        onClose={() => {
          setIsAdminOpen(false);
          setIsAdminPreVerified(false);
        }}
        onDataUpdated={loadWatchedData}
        isPreVerified={isAdminPreVerified}
      />

      {/* Monetag Floating Bottom Revenue Bar */}
      <MonetagStickyBar />

      {/* Footer */}
      <Footer />
    </div>
  );
}
