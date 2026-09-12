import React, { useState, useEffect, useRef } from "react";
import { Search, Sparkles, TrendingUp, Film, X, Loader2, BookmarkCheck, Play, ArrowRight, ChevronDown } from "lucide-react";
import { MovieClip } from "../types";
import { JsonMovie, MovieCategory, CATEGORY_LABELS, searchJsonMovies, loadAllJsonMovies } from "../lib/jsonMovies";
import { HeroicPosterSwipe } from "./HeroicPosterSwipe";

interface HeroSectionProps {
  onSelectMovie: (id: number) => void;
  onPlayClip?: (clip: Partial<MovieClip>) => void;
  onPlayJsonMovie?: (movie: JsonMovie) => void;
  onExploreSeries?: (seriesId: string) => void;
  selectedCategory: MovieCategory;
  onSelectCategory: (category: MovieCategory) => void;
  watchlistCount?: number;
}

const HEROIC_DISPLAY_VIDEO =
  "https://pub-71159ab780504d0d9a5d3e5b1180c623.r2.dev/others/Movie_site_heroic_poster_design_202609041454.mp4";

const HEROIC_BACKDROP_FALLBACK =
  "https://images.unsplash.com/photo-1536440136628-849c177e76a1?w=1920&auto=format&fit=crop&q=85";

const CATEGORIES: MovieCategory[] = ["english", "indian", "chinese", "dramas", "historical", "others"];

export const HeroSection: React.FC<HeroSectionProps> = ({
  onSelectMovie,
  onPlayClip,
  onPlayJsonMovie,
  onExploreSeries,
  selectedCategory,
  onSelectCategory,
  watchlistCount = 0
}) => {
  const [videoLoaded, setVideoLoaded] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);

  // Premium Global Search state querying all local JSON files
  const [searchQuery, setSearchQuery] = useState("");
  const [isSearching, setIsSearching] = useState(false);
  const [jsonResults, setJsonResults] = useState<JsonMovie[]>([]);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const searchContainerRef = useRef<HTMLDivElement>(null);

  // Loaded movies for heroic poster swiper
  const [allLoadedMovies, setAllLoadedMovies] = useState<JsonMovie[]>([]);

  useEffect(() => {
    let isMounted = true;
    loadAllJsonMovies()
      .then((movies) => {
        if (isMounted && movies && movies.length > 0) {
          setAllLoadedMovies(movies);
        }
      })
      .catch((err) => console.error("Failed to load heroic posters:", err));
    return () => {
      isMounted = false;
    };
  }, []);

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

  const handleSearchSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!searchQuery.trim()) return;
    if (jsonResults.length > 0) {
      handleMovieClick(jsonResults[0]);
    } else {
      scrollToSection("recent-added");
    }
  };

  const handleMovieClick = (movie: JsonMovie) => {
    setIsSearchOpen(false);
    setSearchQuery("");
    if (movie.isSeries && movie.seriesId && onExploreSeries) {
      onExploreSeries(movie.seriesId);
      return;
    }
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
  };

  const scrollToSection = (sectionId: string) => {
    const el = document.getElementById(sectionId);
    if (el) {
      el.scrollIntoView({ behavior: "smooth" });
    }
  };

  const hasTyped = searchQuery.trim().length > 0;

  return (
    <header className="relative w-full min-h-[85vh] sm:min-h-[90vh] flex flex-col justify-between overflow-hidden bg-[#07080c] border-b border-white/5 pt-16 sm:pt-20">
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
          className="w-full h-full object-cover object-center transform scale-[1.02] filter brightness-[0.70] contrast-[1.08] transition-opacity duration-1000"
        />

        {/* Cinematic Vignette Overlays for Maximum Contrast & Readability */}
        <div className="absolute inset-0 bg-gradient-to-t from-[#07080c] via-[#07080c]/60 to-[#07080c]/85" />
        <div className="absolute inset-0 bg-gradient-to-r from-[#07080c]/90 via-transparent to-[#07080c]/90" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_30%,#07080c_92%)]" />
      </div>

      {/* CENTERPIECE: CLEAN HEADER WITH GLOWING NAME & SEARCH BAR (Exactly matching user screenshot) */}
      <div className="relative z-30 w-full max-w-4xl mx-auto px-4 flex flex-col items-center text-center">
        
        {/* 1. Header Glowing Title: Movlo.site */}
        <div className="relative inline-block select-none my-2">
          <h1
            id="hero-movlo-heading"
            className="text-4xl sm:text-6xl md:text-7xl font-extrabold tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-amber-300 via-amber-400 to-amber-500 drop-shadow-[0_0_35px_rgba(245,158,11,0.65)] select-none transition-all duration-300 hover:brightness-110"
            title="Movlo.site — Stream Free Movies & Trailers"
          >
            Movlo<span className="text-amber-300">.site</span>
          </h1>
        </div>

        {/* 2. Sleek Search Bar directly below the name with conditional button visibility */}
        <div ref={searchContainerRef} className="relative w-full max-w-lg sm:max-w-xl mx-auto mt-2 sm:mt-3">
          <form onSubmit={handleSearchSubmit} className="relative">
            <div className="relative flex items-center bg-black/60 hover:bg-black/75 focus-within:bg-black/90 backdrop-blur-2xl rounded-full border border-white/15 focus-within:border-amber-400/80 focus-within:ring-2 focus-within:ring-amber-400/30 transition-all duration-300 shadow-2xl pl-4 pr-2 py-2 sm:py-2.5">
              <Search className="w-4 h-4 text-amber-400/90 shrink-0 mr-2.5 pointer-events-none" />
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
                placeholder="Search for movies or trailers..."
                className="w-full text-white text-xs sm:text-sm bg-transparent outline-none placeholder:text-neutral-400 font-medium"
              />

              {/* ACTION BUTTON: ONLY VISIBLE WHEN USER STARTS TYPING ("buton tabh visible how jabh user likhna start kre") */}
              {hasTyped && (
                <div className="flex items-center gap-1.5 shrink-0 animate-in fade-in zoom-in-95 duration-200">
                  <button
                    type="button"
                    onClick={() => {
                      setSearchQuery("");
                      setJsonResults([]);
                      setIsSearchOpen(false);
                    }}
                    className="p-1 rounded-full text-neutral-400 hover:text-white transition-colors cursor-pointer"
                    title="Clear text"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>

                  <button
                    type="submit"
                    className="px-3.5 sm:px-4 py-1 sm:py-1.5 rounded-full bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-black font-bold text-xs sm:text-sm flex items-center gap-1 shadow-md shadow-amber-500/25 active:scale-95 transition-all cursor-pointer"
                  >
                    <span>Search</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              )}

              {isSearching && !hasTyped && (
                <Loader2 className="w-4 h-4 text-amber-400 animate-spin mr-2" />
              )}
            </div>
          </form>

          {/* Autocomplete Global Search Results Dropdown */}
          {isSearchOpen && (
            <div className="absolute top-full left-0 right-0 mt-2 bg-[#0c0d14]/98 backdrop-blur-2xl border border-white/20 rounded-2xl shadow-2xl overflow-hidden z-50 animate-in fade-in slide-in-from-top-2 duration-200 text-left">
              <div className="p-2.5 border-b border-white/10 flex items-center justify-between text-[11px] text-neutral-400 px-4 font-mono">
                <span className="flex items-center gap-1.5 text-amber-400 font-semibold">
                  <Film className="w-3.5 h-3.5" />
                  <span>SEARCH RESULTS</span>
                </span>
                <span>{jsonResults.length} FOUND</span>
              </div>

              {jsonResults.length === 0 && !isSearching && searchQuery.trim() && (
                <div className="p-6 text-center text-xs text-neutral-400">
                  No movies found matching "{searchQuery}"
                </div>
              )}

              <div className="max-h-72 overflow-y-auto divide-y divide-white/5">
                {jsonResults.map((movie) => (
                  <button
                    key={movie.id}
                    onClick={() => handleMovieClick(movie)}
                    className="w-full flex items-center gap-3 p-2.5 hover:bg-white/10 transition-colors text-left group cursor-pointer"
                  >
                    <div className="relative w-14 aspect-[16/9] sm:w-16 rounded-lg overflow-hidden bg-neutral-900 border border-white/10 shrink-0">
                      <img
                        src={movie.thumbnail || movie.poster}
                        alt={movie.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                      />
                      <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                        <Play className="w-3 h-3 text-amber-400 fill-current" />
                      </div>
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-1.5 mb-0.5">
                        <span className="px-1.5 py-0.2 rounded text-[9px] font-bold uppercase tracking-wider bg-amber-500/20 text-amber-300 border border-amber-500/30">
                          {CATEGORY_LABELS[movie.category]}
                        </span>
                        {movie.year && (
                          <span className="text-[10px] text-neutral-400">{movie.year}</span>
                        )}
                      </div>
                      <h5 className="text-xs font-semibold text-white group-hover:text-amber-300 truncate">
                        {movie.title}
                      </h5>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Category Filter Chips (Directly under search bar) */}
        <div className="w-full flex items-center justify-center gap-1.5 sm:gap-2.5 mt-3 flex-wrap">
          {CATEGORIES.map((cat) => {
            const isActive = selectedCategory === cat;
            return (
              <button
                key={cat}
                onClick={() => {
                  onSelectCategory(cat);
                  scrollToSection("movie-catalog-section");
                }}
                className={`px-3 sm:px-4 py-1 sm:py-1.5 rounded-full text-xs font-bold transition-all duration-200 cursor-pointer ${
                  isActive
                    ? "bg-amber-500 text-black shadow-lg shadow-amber-500/25 scale-105 border border-amber-400 font-black"
                    : "bg-black/50 hover:bg-white/10 text-neutral-300 hover:text-white border border-white/15 backdrop-blur-md"
                }`}
              >
                <span>{CATEGORY_LABELS[cat]}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* 4. HEROIC STYLE SWIPING POSTERS (Background / Foreground Showcase matching the user's phone screenshot) */}
      <div className="relative z-20 w-full my-auto py-2">
        <HeroicPosterSwipe
          movies={allLoadedMovies}
          onPlayMovie={handleMovieClick}
        />
      </div>

      {/* 5. Bottom Navigation & "More movies below" Prompt (Matching screenshot bottom indicator) */}
      <div className="relative z-20 w-full pb-3 sm:pb-5 text-center flex flex-col items-center">
        <button
          onClick={() => scrollToSection("recent-added")}
          className="group inline-flex flex-col items-center gap-1 text-neutral-400 hover:text-amber-300 transition-colors cursor-pointer"
        >
          <span className="text-[11px] sm:text-xs font-medium tracking-wide">
            More movies below
          </span>
          <ChevronDown className="w-4 h-4 text-amber-400 animate-bounce group-hover:translate-y-0.5 transition-transform" />
        </button>
      </div>
    </header>
  );
};
