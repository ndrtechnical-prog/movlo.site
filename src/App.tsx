import React, { useState, useEffect, useCallback } from "react";
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
import { Movie, MovieClip, AdBanner } from "./types";
import {
  fetchRecentWatchedMovies,
  recordMovieWatch,
  fetchRecentAdded24h,
  RecentAddedItem,
  recordAdClick,
  fetchActiveAds,
  pingPresence
} from "./lib/api";
import { resetDefaultMetadata } from "./lib/metaManager";
import { useWatchlist } from "./lib/watchlist";

export default function App() {
  // 3 Primary Homepage Sections Data:
  // 1. Recent Added (Last 24 Hours Only: Bulk Links, Single Links & Ads Links)
  const [recentAddedItems, setRecentAddedItems] = useState<RecentAddedItem[]>([]);
  const [isRecentLoading, setIsRecentLoading] = useState(true);
  const [recentError, setRecentError] = useState<string | null>(null);

  // 2. Recent Watch (Movies currently / recently being watched)
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
  const [currentRegion] = useState("US");

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
        movieTitle: activeClip?.movieTitle || recentAddedItems[0]?.title || undefined,
        clipTitle: activeClip?.clipTitle || undefined,
        isPlaying: Boolean(activeClip),
        device: window.innerWidth < 768 ? "Mobile" : "Desktop",
        quality: activeClip?.quality || "4K UHD"
      });
    };

    reportPresence();
    const timer = setInterval(reportPresence, 12000);
    return () => clearInterval(timer);
  }, [sessionId, activeClip, recentAddedItems]);

  // Load Homepage Data (Recent Added in 24h, Recent Watched, Active Ads)
  const loadData = useCallback(async () => {
    setIsRecentLoading(true);
    setIsRecentWatchedLoading(true);

    try {
      // Load active ads
      fetchActiveAds()
        .then((data) => setAds(data))
        .catch(() => setAds([]));

      // Section 1: Recent Added (Last 24 Hours Only: Bulk Links, Single Links & Ads)
      try {
        const recentRes = await fetchRecentAdded24h();
        setRecentAddedItems(recentRes.items);
        setRecentError(null);
      } catch (err) {
        console.warn("Recent added fetch error:", err);
        setRecentError("Unable to load recently added links.");
      } finally {
        setIsRecentLoading(false);
      }

      // Section 2: Recent Watch (Movies currently / recently watched)
      try {
        const watchedRes = await fetchRecentWatchedMovies();
        setRecentWatchedMovies(watchedRes.movies);
        setRecentWatchedError(null);
      } catch (err) {
        console.warn("Recent watched fetch error:", err);
        setRecentWatchedError("Unable to load recently watched movies.");
      } finally {
        setIsRecentWatchedLoading(false);
      }
    } catch (err) {
      console.error("Home loader error:", err);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

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
    setActiveMovieId(id);
    window.history.pushState({ movieId: id }, "", `/movie/${id}`);

    // Track real movie watch event
    const matched = recentWatchedMovies.find((m) => m.id === id);
    recordMovieWatch({
      id,
      title: matched?.title || `Movie ${id}`,
      poster: matched?.poster,
      backdrop: matched?.backdrop,
      rating: matched?.rating,
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
      duration: clip.duration || "3:30",
      quality: qualityVal,
      genre: clip.genre || "Action",
      genres: clip.genres || [clip.genre || "Action", "Cinema"],
      year: clip.year || 2026,
      views: clip.views || 60000,
      likes: clip.likes || 3200,
      rating: clip.rating || 9.2,
      description: clip.description || `High definition ${qualityVal} video.`,
      isTrending: clip.isTrending ?? true,
      isMostWatched: clip.isMostWatched ?? false,
      publishedAt: clip.publishedAt || new Date().toISOString(),
      tags: clip.tags || ["movie", "cinema", "stream"],
      seo: clip.seo || {
        title: `${clip.movieTitle || "Movie"} - 4K Video`,
        description: `Watch ${clip.clipTitle || "Video"} in high definition.`,
        keywords: ["movie", "4k", "scene"]
      }
    });
  };

  const closeClip = () => {
    setActiveClip(null);
  };

  // Handle click on 24h Recent Added Card (Movie Card Style)
  const handleSelectRecentItem = (item: RecentAddedItem) => {
    if (item.itemType === "ad_link" || item.isAd) {
      if (item.targetUrl) {
        recordAdClick(item.id).catch(() => {});
        window.open(item.targetUrl, "_blank", "noopener,noreferrer");
      }
    } else {
      // It's a single or bulk video link: play in high quality cinema player
      openClip({
        id: item.id,
        movieId: 0,
        movieTitle: item.title,
        clipTitle: item.subtitle,
        videoUrl: item.videoUrl || "",
        thumbnail: item.poster,
        poster: item.poster,
        backdrop: item.backdrop || item.poster,
        duration: item.duration || "3:30",
        quality: (item.quality === "1080p HD" || item.quality === "720p HD" ? item.quality : "4K UHD"),
        genre: item.genre || "Action",
        genres: item.genres || ["Action", "Cinema"],
        year: item.year || 2026,
        views: item.views || 60000,
        rating: item.rating || 9.2,
        description: item.description || "Added via MOVLO Admin"
      });
    }
  };

  return (
    <div className="min-h-screen bg-[#07080c] text-neutral-100 flex flex-col font-['Plus_Jakarta_Sans',sans-serif] selection:bg-amber-400 selection:text-black">
      {/* 
        HEADER & HEROIC DISPLAY:
        - Clean branding with only movlo.site
        - Heroic display video loop (https://pub-71159ab780504d0d9a5d3e5b1180c623.r2.dev/others/Movie_site_heroic_poster_design_202609041454.mp4)
        - Top corner API search bar that live queries movies
      */}
      <HeroSection
        onSelectMovie={openMovie}
        onPlayClip={openClip}
        watchlistCount={watchlist.length}
        onTriggerAdminKey={() => setIsKeyPromptOpen(true)}
      />

      {/* Active Ads (If published by Admin with uploaded poster & redirection link) */}
      {ads.length > 0 && (
        <div className="w-full">
          {ads.map((ad) => (
            <AdBannerCard key={ad.id} ad={ad} />
          ))}
        </div>
      )}

      {/* PRIMARY APPLICATION SECTIONS */}
      <main className="flex-1 w-full flex flex-col">
        {/* 
          SECTION 1: Recent Added (Only links added in the last 24 hours: Bulk, Single, Ads)
        */}
        <div id="recent-added" className="pt-4">
          <RecentAddedSection
            items={recentAddedItems}
            isLoading={isRecentLoading}
            error={recentError}
            onSelectItem={handleSelectRecentItem}
            onRetry={loadData}
          />
        </div>

        {/* 
          SECTION 2: Recent Watch (Movies currently / recently watched)
        */}
        <div id="recent-watch" className="pt-4">
          <div id="most-watched" />
          <RecentWatchSection
            movies={recentWatchedMovies}
            isLoading={isRecentWatchedLoading}
            error={recentWatchedError}
            onSelectMovie={openMovie}
            onRetry={loadData}
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
          SECTION 3: UpComing Trailers (API-Called 5 Upcoming Movies with Ratings)
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
          relatedClips={[]}
        />
      )}

      {/* Movie Details Modal (/movie/:id) */}
      {activeMovieId && (
        <MovieDetailsModal
          movieId={activeMovieId}
          region={currentRegion}
          onClose={closeMovie}
          onSelectMovie={openMovie}
        />
      )}

      {/* Admin Key Prompt Modal (Triggered by 5-second press on MOVLO heading or Ctrl+Shift+A) */}
      <AdminKeyPromptModal
        isOpen={isKeyPromptOpen}
        onClose={() => setIsKeyPromptOpen(false)}
        onSuccess={handleAdminKeySuccess}
      />

      {/* Admin Portal Modal (PIN / Key: 77490869) */}
      <AdminPortalModal
        isOpen={isAdminOpen}
        onClose={() => {
          setIsAdminOpen(false);
          setIsAdminPreVerified(false);
        }}
        onClipsUpdated={loadData}
        isPreVerified={isAdminPreVerified}
      />

      {/* Footer */}
      <Footer
        onNavigateSection={(id) => {
          const el = document.getElementById(id);
          if (el) el.scrollIntoView({ behavior: "smooth" });
        }}
        onTriggerAdminKey={() => setIsKeyPromptOpen(true)}
      />
    </div>
  );
}
