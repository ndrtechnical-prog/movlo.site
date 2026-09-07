import React, { useState, useEffect, useRef } from "react";
import { Search, Sparkles, TrendingUp, Film, X, Loader2, BookmarkCheck, Play, Clapperboard } from "lucide-react";
import { MovieClip } from "../types";
import { JsonMovie, MovieCategory, CATEGORY_LABELS, searchJsonMovies } from "../lib/jsonMovies";

interface HeroSectionProps {
  onSelectMovie: (id: number) => void;
  onPlayClip?: (clip: Partial<MovieClip>) => void;
  onPlayJsonMovie?: (movie: JsonMovie) => void;
  selectedCategory: MovieCategory;
  onSelectCategory: (category: MovieCategory) => void;
  watchlistCount?: number;
  onTriggerAdminKey?: () => void;
}

const HEROIC_DISPLAY_VIDEO =
  "https://pub-71159ab780504d0d9a5d3e5b1180c623.r2.dev/others/Movie_site_heroic_poster_design_202609041454.mp4";

const HEROIC_BACKDROP_FALLBACK =
  "https://images.unsplash.com/photo-1536440136628-849c177e76a1?w=1920&auto=format&fit=crop&q=85";

const CATEGORIES: MovieCategory[] = ["english", "indian", "chinese", "dramas", "others"];

export const HeroSection: React.FC<HeroSectionProps> = ({
  onSelectMovie,
  onPlayClip,
  onPlayJsonMovie,
  selectedCategory,
  onSelectCategory,
  watchlistCount = 0,
  onTriggerAdminKey
}) => {
  const [videoLoaded, setVideoLoaded] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);

  // 5-second long press on movlo heading for Admin Access Key
  const [isPressing, setIsPressing] = useState(false);
  const [pressProgress, setPressProgress] = useState(0);
  const pressTimerRef = useRef<NodeJS.Timeout | null>(null);
  const pressIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const pressStartTimeRef = useRef<number>(0);

  const startPress = () => {
    setIsPressing(true);
    setPressProgress(0);
    pressStartTimeRef.current = Date.now();

    pressIntervalRef.current = setInterval(() => {
      const elapsed = Date.now() - pressStartTimeRef.current;
      const pct = Math.min(100, (elapsed / 5000) * 100);
      setPressProgress(pct);
    }, 40);

    pressTimerRef.current = setTimeout(() => {
      if (pressIntervalRef.current) clearInterval(pressIntervalRef.current);
      setIsPressing(false);
      setPressProgress(0);
      if (typeof navigator !== "undefined" && navigator.vibrate) {
        navigator.vibrate(100);
      }
      onTriggerAdminKey?.();
    }, 5000);
  };

  const cancelPress = () => {
    if (pressTimerRef.current) {
      clearTimeout(pressTimerRef.current);
      pressTimerRef.current = null;
    }
    if (pressIntervalRef.current) {
      clearInterval(pressIntervalRef.current);
      pressIntervalRef.current = null;
    }
    setIsPressing(false);
    setPressProgress(0);
  };

  useEffect(() => {
    return () => {
      if (pressTimerRef.current) clearTimeout(pressTimerRef.current);
      if (pressIntervalRef.current) clearInterval(pressIntervalRef.current);
    };
  }, []);

  // Premium Global Search state querying all local JSON files
  const [searchQuery, setSearchQuery] = useState("");
  const [isSearching, setIsSearching] = useState(false);
  const [jsonResults, setJsonResults] = useState<JsonMovie[]>([]);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const searchContainerRef = useRef<HTMLDivElement>(null);

  // Close search dropdown on click outside
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (
        searchContainerRef.current &&
        !searchContainerRef.current.contains(e.target as Node)
      ) {
        setIsSearchOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Fast debounced Global JSON search across all categories
  useEffect(() => {
    if (!searchQuery.trim()) {
      setJsonResults([]);
      setIsSearching(false);
      return;
    }

    setIsSearching(true);
    const handler = setTimeout(async () => {
      try {
        const res = await searchJsonMovies(searchQuery.trim());
        setJsonResults(res.slice(0, 10));
        setIsSearchOpen(true);
      } catch (err) {
        console.error("Global search error:", err);
      } finally {
        setIsSearching(false);
      }
    }, 180);

    return () => clearTimeout(handler);
  }, [searchQuery]);

  const scrollToSection = (sectionId: string) => {
    const el = document.getElementById(sectionId);
    if (el) {
      el.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <header className="relative w-full min-h-[75vh] sm:min-h-[82vh] lg:min-h-[88vh] flex flex-col justify-between overflow-hidden bg-[#07080c] border-b border-white/5">
      {/* Background Heroic Video / Animated Display Loop */}
      <div className="absolute inset-0 w-full h-full overflow-hidden pointer-events-none z-0">
        <video
          ref={videoRef}
          src={HEROIC_DISPLAY_VIDEO}
          autoPlay
          loop
          muted
          playsInline
          onLoadedData={() => setVideoLoaded(true)}
          poster={HEROIC_BACKDROP_FALLBACK}
          className="w-full h-full object-cover object-center transform scale-[1.02] filter brightness-[0.82] contrast-[1.08] transition-opacity duration-1000"
        />

        {/* Cinematic Vignette Overlays for Maximum Contrast & Readability */}
        <div className="absolute inset-0 bg-gradient-to-t from-[#07080c] via-[#07080c]/50 to-[#07080c]/80" />
        <div className="absolute inset-0 bg-gradient-to-r from-[#07080c]/90 via-transparent to-[#07080c]/80" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_35%,#07080c_95%)]" />
      </div>

      {/* TOP AREA: PREMIUM SEARCH BAR & CATEGORY NAVIGATION (Directly below Header) */}
      <div className="relative z-30 w-full max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 pt-18 sm:pt-20 flex flex-col items-center">
        {/* PREMIUM SEARCH BAR (Over Hero Video, positioned cleanly and prominently) */}
        <div ref={searchContainerRef} className="relative w-full max-w-2xl mx-auto">
          <div className="relative flex items-center bg-black/65 hover:bg-black/80 focus-within:bg-black/95 backdrop-blur-xl rounded-2xl sm:rounded-full border border-white/15 focus-within:border-amber-400/80 focus-within:ring-2 focus-within:ring-amber-400/30 transition-all duration-300 shadow-2xl">
            <Search className="absolute left-4 w-5 h-5 text-amber-400 pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setIsSearchOpen(true);
              }}
              onFocus={() => {
                if (jsonResults.length > 0) setIsSearchOpen(true);
              }}
              placeholder="Search across English, Indian, Chinese movies, Dramas, and more..."
              className="w-full text-white text-xs sm:text-sm pl-11 sm:pl-12 pr-10 py-3 sm:py-3.5 bg-transparent outline-none placeholder:text-neutral-400 font-medium"
            />
            {searchQuery && (
              <button
                onClick={() => {
                  setSearchQuery("");
                  setJsonResults([]);
                  setIsSearchOpen(false);
                }}
                className="absolute right-3.5 p-1 text-neutral-400 hover:text-white cursor-pointer transition-colors"
                aria-label="Clear search"
              >
                <X className="w-4 h-4" />
              </button>
            )}
            {isSearching && (
              <Loader2 className="absolute right-3.5 w-4 h-4 text-amber-400 animate-spin" />
            )}
          </div>

          {/* Global Search Results Dropdown from all local JSON files */}
          {isSearchOpen && (
            <div className="absolute top-full left-0 right-0 mt-2 bg-[#0c0d14]/95 backdrop-blur-2xl border border-white/20 rounded-2xl shadow-2xl overflow-hidden z-50 animate-in fade-in slide-in-from-top-2 duration-200">
              <div className="p-2.5 border-b border-white/10 flex items-center justify-between text-[11px] text-neutral-400 px-4 font-mono">
                <span className="flex items-center gap-1.5 text-amber-400">
                  <Film className="w-3.5 h-3.5" />
                  <span>GLOBAL MOVIE SEARCH</span>
                </span>
                <span>{jsonResults.length} FOUND</span>
              </div>

              {jsonResults.length === 0 && !isSearching && searchQuery.trim() && (
                <div className="p-6 text-center text-xs text-neutral-400">
                  No movies found matching "{searchQuery}"
                </div>
              )}

              <div className="max-h-80 overflow-y-auto divide-y divide-white/5">
                {jsonResults.map((movie) => (
                  <button
                    key={movie.id}
                    onClick={() => {
                      setIsSearchOpen(false);
                      setSearchQuery("");
                      if (onPlayJsonMovie) {
                        onPlayJsonMovie(movie);
                      } else {
                        onPlayClip?.({
                          id: movie.id,
                          movieTitle: movie.title,
                          clipTitle: movie.title,
                          videoUrl: movie.videoUrl,
                          thumbnail: movie.thumbnail,
                          poster: movie.poster,
                          duration: movie.duration,
                          year: movie.year,
                          rating: movie.rating,
                          genre: movie.genre
                        });
                      }
                    }}
                    className="w-full flex items-center gap-3.5 p-3 hover:bg-white/10 transition-colors text-left group cursor-pointer"
                  >
                    <div className="relative w-16 aspect-[16/9] sm:w-20 rounded-lg overflow-hidden bg-neutral-900 border border-white/10 shrink-0">
                      <img
                        src={movie.thumbnail || movie.poster}
                        alt={movie.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                      />
                      <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                        <Play className="w-3.5 h-3.5 text-amber-400 fill-current" />
                      </div>
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-0.5">
                        <span className="px-1.5 py-0.5 rounded text-[9px] font-bold uppercase tracking-wider bg-amber-500/20 text-amber-300 border border-amber-500/30">
                          {CATEGORY_LABELS[movie.category]}
                        </span>
                        {movie.year && (
                          <span className="text-[11px] text-neutral-400">{movie.year}</span>
                        )}
                        {movie.duration && (
                          <span className="text-[11px] text-neutral-500">• {movie.duration}</span>
                        )}
                      </div>
                      <h5 className="text-xs sm:text-sm font-semibold text-white group-hover:text-amber-300 truncate">
                        {movie.title}
                      </h5>
                      <p className="text-[11px] text-neutral-400 truncate mt-0.5">
                        {movie.channel || movie.genre || "Full Motion Picture"}
                      </p>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* CATEGORY / PAGE NAVIGATION BUTTONS (Directly under the premium search bar) */}
        <div className="w-full flex items-center justify-center gap-2 sm:gap-3 mt-4 flex-wrap">
          {CATEGORIES.map((cat) => {
            const isActive = selectedCategory === cat;
            return (
              <button
                key={cat}
                onClick={() => {
                  onSelectCategory(cat);
                  scrollToSection("movie-catalog-section");
                }}
                className={`px-3.5 sm:px-5 py-1.5 sm:py-2 rounded-full text-xs sm:text-sm font-bold transition-all duration-200 cursor-pointer flex items-center gap-1.5 ${
                  isActive
                    ? "bg-amber-500 text-black shadow-lg shadow-amber-500/25 scale-105 border border-amber-400"
                    : "bg-black/60 hover:bg-white/10 text-neutral-300 hover:text-white border border-white/15 backdrop-blur-md"
                }`}
              >
                <span>{CATEGORY_LABELS[cat]}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* CENTER HERO BRANDING: Clean movlo.site Title */}
      <div className="relative z-20 w-full max-w-4xl mx-auto px-4 text-center my-auto py-12 sm:py-16">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-400 text-xs font-semibold uppercase tracking-widest mb-4 backdrop-blur-sm">
          <Sparkles className="w-3.5 h-3.5" />
          <span>Cinematic Platform</span>
        </div>

        {/* Only movlo.site written cleanly and beautifully — 5-second press unlocks Admin Key */}
        <div className="relative inline-block select-none my-1">
          <h1
            id="hero-movlo-heading"
            onMouseDown={startPress}
            onMouseUp={cancelPress}
            onMouseLeave={cancelPress}
            onTouchStart={startPress}
            onTouchEnd={cancelPress}
            onTouchCancel={cancelPress}
            onContextMenu={(e) => {
              e.preventDefault();
            }}
            className={`text-5xl sm:text-7xl md:text-8xl font-black text-transparent bg-clip-text bg-gradient-to-b from-white via-neutral-100 to-neutral-400 tracking-tight select-none drop-shadow-2xl cursor-pointer transition-all duration-300 ${
              isPressing
                ? "scale-[0.98] drop-shadow-[0_0_40px_rgba(245,158,11,0.8)] brightness-110"
                : "hover:drop-shadow-[0_0_25px_rgba(255,255,255,0.25)]"
            }`}
            title="Press and hold for 5 seconds to unlock Admin"
          >
            Movlo<span className="text-amber-400 font-extrabold">.site</span>
          </h1>

          {/* 5-second press progress indicator */}
          {isPressing && (
            <div className="absolute left-1/2 -translate-x-1/2 -bottom-10 sm:-bottom-12 flex items-center gap-2.5 px-3.5 py-1.5 rounded-full bg-black/95 border border-amber-500/70 backdrop-blur-xl shadow-2xl shadow-amber-500/30 z-30 whitespace-nowrap animate-in fade-in zoom-in-95 duration-150">
              <span className="w-2 h-2 rounded-full bg-amber-400 animate-ping" />
              <span className="text-[11px] font-mono text-amber-300 font-semibold tracking-wide">
                Holding for Admin: {Math.max(0, (5 - (pressProgress * 5) / 100)).toFixed(1)}s
              </span>
              <div className="w-16 sm:w-20 h-1.5 bg-neutral-800 rounded-full overflow-hidden border border-white/10">
                <div
                  className="h-full bg-gradient-to-r from-amber-500 to-orange-400 transition-all duration-75 ease-linear"
                  style={{ width: `${pressProgress}%` }}
                />
              </div>
            </div>
          )}
        </div>

        <p className="max-w-xl mx-auto text-sm sm:text-base text-neutral-300 mt-3 sm:mt-4 font-normal tracking-wide">
          Stream official cinema trailers, explore recent additions, and discover what the world is watching.
        </p>

        {/* Quick Jump Shortcuts to Sections including My Watchlist */}
        <div className="flex flex-wrap items-center justify-center gap-2.5 sm:gap-3.5 mt-8">
          <button
            onClick={() => scrollToSection("recent-added")}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 hover:bg-white/20 border border-white/10 text-white text-xs sm:text-sm font-medium backdrop-blur-md transition-all hover:scale-105 cursor-pointer"
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            <span>Recent Added Movies</span>
          </button>

          <button
            onClick={() => scrollToSection("recent-watch")}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 hover:bg-white/20 border border-white/10 text-white text-xs sm:text-sm font-medium backdrop-blur-md transition-all hover:scale-105 cursor-pointer"
          >
            <TrendingUp className="w-3.5 h-3.5 text-amber-400" />
            <span>Recent Watch</span>
          </button>

          <button
            onClick={() => scrollToSection("my-watchlist")}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 hover:bg-amber-500/20 border border-white/10 hover:border-amber-500/30 text-white text-xs sm:text-sm font-medium backdrop-blur-md transition-all hover:scale-105 cursor-pointer"
          >
            <BookmarkCheck className="w-3.5 h-3.5 text-amber-400" />
            <span>My Watchlist</span>
            {watchlistCount > 0 && (
              <span className="ml-1 px-1.5 py-0.5 rounded-full bg-amber-500 text-black font-bold text-[10px] leading-none">
                {watchlistCount}
              </span>
            )}
          </button>

          <button
            onClick={() => scrollToSection("upcoming-trailers")}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-amber-500 hover:bg-amber-400 text-black text-xs sm:text-sm font-bold shadow-lg shadow-amber-500/20 transition-all hover:scale-105 cursor-pointer"
          >
            <Film className="w-3.5 h-3.5" />
            <span>UpComing Trailers</span>
          </button>
        </div>
      </div>

      {/* Bottom Subtle Indicator */}
      <div className="relative z-20 w-full pb-4 text-center">
        <span className="text-[10px] text-neutral-500 uppercase tracking-widest font-mono">
          4K Cinematic Stream • Ultra Definition
        </span>
      </div>
    </header>
  );
};
