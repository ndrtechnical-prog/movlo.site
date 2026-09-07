import React, { useState, useEffect, useRef } from "react";
import { Search, Film, Globe, X, Loader2, Play, Sparkles, ChevronDown, Clock, Shield } from "lucide-react";
import { searchUnifiedApi, FALLBACK_POSTER, getCinemaPosterFallback } from "../lib/api";
import { SearchResultItem, MovieClip } from "../types";

interface NavbarProps {
  onSelectMovie: (id: number) => void;
  onPlayClip: (clip: MovieClip) => void;
  currentRegion: string;
  onRegionChange: (region: string) => void;
  hasApiKey: boolean;
  onNavigateSection: (sectionId: string) => void;
  onOpenAdmin: () => void;
}

const REGIONS = [
  { code: "US", name: "United States", flag: "🇺🇸" },
  { code: "GB", name: "United Kingdom", flag: "🇬🇧" },
  { code: "CA", name: "Canada", flag: "🇨🇦" },
  { code: "AU", name: "Australia", flag: "🇦🇺" },
  { code: "DE", name: "Germany", flag: "🇩🇪" },
  { code: "FR", name: "France", flag: "🇫🇷" }
];

export const Navbar: React.FC<NavbarProps> = ({
  onSelectMovie,
  onPlayClip,
  currentRegion,
  onRegionChange,
  hasApiKey,
  onNavigateSection,
  onOpenAdmin
}) => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [movieResults, setMovieResults] = useState<SearchResultItem[]>([]);
  const [clipResults, setClipResults] = useState<MovieClip[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isRegionMenuOpen, setIsRegionMenuOpen] = useState(false);
  const [logoClickCount, setLogoClickCount] = useState(0);
  const searchContainerRef = useRef<HTMLDivElement>(null);

  // Handle navbar background opacity on scroll
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 40);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Keyboard shortcut for Admin: Ctrl+Shift+A or Cmd+Shift+A
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.shiftKey && (e.key === "A" || e.key === "a")) {
        e.preventDefault();
        onOpenAdmin();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [onOpenAdmin]);

  // Unified Search API with debouncing (~250ms for ultra-fast response)
  useEffect(() => {
    if (!searchQuery.trim()) {
      setMovieResults([]);
      setClipResults([]);
      setIsSearching(false);
      return;
    }

    setIsSearching(true);
    const timer = setTimeout(async () => {
      try {
        const results = await searchUnifiedApi(searchQuery);
        setMovieResults(results.movies || []);
        setClipResults(results.clips || []);
      } catch (err) {
        console.error("Search error:", err);
        setMovieResults([]);
        setClipResults([]);
      } finally {
        setIsSearching(false);
      }
    }, 250);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  // Click outside to close search dropdown
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (searchContainerRef.current && !searchContainerRef.current.contains(e.target as Node)) {
        setIsSearchOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSelectMovie = (id: number) => {
    onSelectMovie(id);
    setIsSearchOpen(false);
    setSearchQuery("");
  };

  const handleSelectClip = (clip: MovieClip) => {
    onPlayClip(clip);
    setIsSearchOpen(false);
    setSearchQuery("");
  };

  // Secret admin opener: 3 clicks on the logo
  const handleLogoClick = () => {
    const next = logoClickCount + 1;
    if (next >= 3) {
      setLogoClickCount(0);
      onOpenAdmin();
    } else {
      setLogoClickCount(next);
      setTimeout(() => setLogoClickCount(0), 2000);
      onNavigateSection("hero");
    }
  };

  const activeRegionObj = REGIONS.find((r) => r.code === currentRegion) || REGIONS[0];

  const totalResults = movieResults.length + clipResults.length;

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isScrolled
          ? "bg-black/80 backdrop-blur-xl border-b border-white/10 shadow-2xl py-3"
          : "bg-black/30 backdrop-blur-md border-b border-white/5 py-3.5 sm:py-4"
      }`}
    >
      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 flex items-center justify-between gap-2 sm:gap-4">
        {/* Brand / Logo */}
        <div className="flex items-center gap-4 sm:gap-8">
          <button
            onClick={handleLogoClick}
            className="flex items-center gap-2 group text-left cursor-pointer focus:outline-none"
            aria-label="MOVLO Home"
            title="MOVLO Cinema (Triple-click for Admin Vault)"
          >
            <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-gradient-to-tr from-orange-500 to-red-500 p-0.5 flex items-center justify-center shadow-lg shadow-orange-500/20 group-hover:shadow-orange-500/40 transition-all border border-white/20">
              <div className="w-full h-full bg-[#08080c] rounded-[10px] flex items-center justify-center">
                <Film className="w-4 h-4 text-orange-500 group-hover:scale-110 transition-transform" />
              </div>
            </div>
            <div className="flex flex-col">
              <span className="font-lumos text-xl sm:text-2xl font-black tracking-wider text-transparent bg-clip-text bg-gradient-to-r from-white via-amber-200 to-amber-400 flex items-center">
                Movlo.site
              </span>
              <span className="font-lumos text-[8px] uppercase tracking-widest text-neutral-400 font-semibold hidden sm:inline-block">
                Cinema Master Feeds
              </span>
            </div>
          </button>

          {/* Nav links matching the 3 requested sections */}
          <nav className="hidden md:flex items-center gap-6 text-sm font-medium text-gray-400">
            <button
              onClick={() => onNavigateSection("recent-added")}
              className="hover:text-white transition-colors cursor-pointer"
            >
              Recent Added
            </button>
            <button
              onClick={() => onNavigateSection("most-watched")}
              className="hover:text-white transition-colors cursor-pointer"
            >
              Most Watched
            </button>
            <button
              onClick={() => onNavigateSection("upcoming-trailers")}
              className="hover:text-amber-300 transition-colors cursor-pointer flex items-center gap-1.5 text-amber-400 font-bold"
            >
              <span className="font-lumos">Upcoming Trailers</span>
              <span className="text-[9px] px-1.5 py-0.2 rounded bg-amber-500/20 text-amber-300 border border-amber-500/30">
                5 FILMS
              </span>
            </button>
          </nav>
        </div>

        {/* Right side: Search bar + Region Selector */}
        <div className="flex items-center gap-3 sm:gap-4 flex-1 justify-end max-w-md">
          {/* Search container */}
          <div ref={searchContainerRef} className="relative flex-1 max-w-xs sm:max-w-sm">
            <div className="relative flex items-center">
              <Search className="w-3.5 h-3.5 text-neutral-400 absolute left-3.5 pointer-events-none" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setIsSearchOpen(true);
                }}
                onFocus={() => setIsSearchOpen(true)}
                placeholder="Search movies & clips..."
                className="w-full bg-white/5 hover:bg-white/10 focus:bg-black/80 border border-white/10 focus:border-orange-500/50 rounded-full pl-9 pr-8 py-1.5 text-xs text-white placeholder-neutral-400 transition-all outline-none backdrop-blur-md shadow-inner"
              />
              {searchQuery && (
                <button
                  onClick={() => {
                    setSearchQuery("");
                    setMovieResults([]);
                    setClipResults([]);
                  }}
                  className="absolute right-2.5 text-neutral-400 hover:text-white p-0.5"
                  aria-label="Clear search"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            {/* Live Search Autocomplete Dropdown: Movies + Clips */}
            {isSearchOpen && searchQuery.trim().length > 0 && (
              <div className="absolute top-full mt-2 left-0 right-0 bg-[#0a0a0e]/95 backdrop-blur-2xl border border-white/10 rounded-2xl shadow-2xl overflow-hidden z-50 max-h-[80vh] flex flex-col">
                <div className="p-2.5 border-b border-white/5 flex items-center justify-between text-xs text-neutral-400 px-3 bg-white/[0.02]">
                  <span>Found {totalResults} matches</span>
                  {isSearching && (
                    <span className="flex items-center gap-1 text-orange-400 text-[11px]">
                      <Loader2 className="w-3 h-3 animate-spin" /> Searching...
                    </span>
                  )}
                </div>

                <div className="overflow-y-auto divide-y divide-white/5">
                  {/* SECTION 1: MATCHING CLIPS (High visual priority) */}
                  {clipResults.length > 0 && (
                    <div className="p-2 bg-orange-500/[0.03]">
                      <div className="px-2 py-1 text-[10px] font-bold uppercase tracking-wider text-orange-400 flex items-center gap-1.5">
                        <Play className="w-3 h-3 fill-orange-400" />
                        <span>Related Video Clips ({clipResults.length})</span>
                      </div>
                      <div className="space-y-1 mt-1">
                        {clipResults.map((clip) => (
                          <button
                            key={clip.id}
                            onClick={() => handleSelectClip(clip)}
                            className="w-full text-left p-2 rounded-xl hover:bg-orange-500/10 transition-colors flex items-center gap-2.5 group cursor-pointer"
                          >
                            <div className="relative w-14 aspect-video rounded-md overflow-hidden bg-neutral-800 shrink-0 border border-white/10">
                              <img
                                src={clip.thumbnail || clip.backdrop || getCinemaPosterFallback(clip.id)}
                                alt={clip.clipTitle}
                                className="w-full h-full object-cover"
                              />
                              <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                                <Play className="w-3.5 h-3.5 fill-white text-white" />
                              </div>
                              <span className="absolute bottom-0.5 right-0.5 text-[8px] bg-black/80 px-1 rounded text-white">
                                {clip.duration}
                              </span>
                            </div>

                            <div className="flex-1 min-w-0">
                              <span className="text-[10px] font-bold uppercase text-orange-400 tracking-wider block truncate">
                                {clip.movieTitle}
                              </span>
                              <h4 className="text-xs font-semibold text-white group-hover:text-orange-300 transition-colors truncate">
                                {clip.clipTitle}
                              </h4>
                              <div className="flex items-center gap-2 text-[10px] text-neutral-400 mt-0.5">
                                <span>{clip.genre}</span>
                                <span>•</span>
                                <span>{clip.views.toLocaleString()} views</span>
                              </div>
                            </div>
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* SECTION 2: MATCHING MOVIES */}
                  {movieResults.length > 0 && (
                    <div className="p-2">
                      <div className="px-2 py-1 text-[10px] font-bold uppercase tracking-wider text-neutral-400 flex items-center gap-1.5">
                        <Film className="w-3 h-3 text-neutral-500" />
                        <span>Movies & Shows ({movieResults.length})</span>
                      </div>
                      <div className="space-y-1 mt-1">
                        {movieResults.map((item) => (
                          <button
                            key={item.id}
                            onClick={() => handleSelectMovie(item.id)}
                            className="w-full text-left p-2 rounded-xl hover:bg-white/10 transition-colors flex items-center gap-2.5 group cursor-pointer"
                          >
                            <div className="w-9 h-12 bg-neutral-800 rounded-md overflow-hidden shrink-0 relative border border-white/10">
                              <img
                                src={item.poster || getCinemaPosterFallback(item.id)}
                                alt={item.title}
                                referrerPolicy="no-referrer"
                                onError={(e) => {
                                  const target = e.target as HTMLImageElement;
                                  if (target.src !== getCinemaPosterFallback(item.id)) {
                                    target.src = getCinemaPosterFallback(item.id);
                                  } else {
                                    target.src = FALLBACK_POSTER;
                                  }
                                }}
                                className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                              />
                            </div>
                            <div className="flex-1 min-w-0">
                              <h4 className="text-xs font-semibold text-white group-hover:text-orange-400 transition-colors truncate">
                                {item.title}
                              </h4>
                              <div className="flex items-center gap-2 mt-0.5 text-[10px] text-neutral-400">
                                {item.year && <span>{item.year}</span>}
                                <span className="capitalize px-1.5 py-0.2 rounded bg-white/10 text-[9px] text-neutral-300">
                                  {item.type || "Movie"}
                                </span>
                              </div>
                            </div>
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Empty state */}
                  {!isSearching && totalResults === 0 && (
                    <div className="p-6 text-center text-xs text-neutral-400">
                      No movies or clips found for "{searchQuery}".
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Region selector dropdown */}
          <div className="relative">
            <button
              onClick={() => setIsRegionMenuOpen(!isRegionMenuOpen)}
              className="flex items-center gap-1 sm:gap-1.5 px-3 py-1.5 rounded-full bg-white/5 hover:bg-white/10 border border-white/10 text-xs text-white transition-all cursor-pointer backdrop-blur-md"
              title={`Streaming Region: ${activeRegionObj.name}`}
            >
              <span>{activeRegionObj.flag}</span>
              <span className="hidden sm:inline font-semibold">{activeRegionObj.code}</span>
              <ChevronDown className="w-3 h-3 text-neutral-400" />
            </button>

            {isRegionMenuOpen && (
              <div className="absolute right-0 top-full mt-2 w-48 bg-[#0a0a0e]/95 backdrop-blur-xl border border-white/10 rounded-xl shadow-2xl p-1.5 z-50">
                <div className="px-2 py-1 text-[10px] font-bold uppercase tracking-wider text-neutral-400">
                  Select Streaming Region
                </div>
                {REGIONS.map((r) => (
                  <button
                    key={r.code}
                    onClick={() => {
                      onRegionChange(r.code);
                      setIsRegionMenuOpen(false);
                    }}
                    className={`w-full text-left px-2.5 py-1.5 rounded-lg text-xs flex items-center justify-between cursor-pointer transition-colors ${
                      r.code === currentRegion
                        ? "bg-orange-500/20 text-orange-400 font-semibold"
                        : "text-neutral-300 hover:bg-white/10"
                    }`}
                  >
                    <span className="flex items-center gap-2">
                      <span>{r.flag}</span>
                      <span>{r.name}</span>
                    </span>
                    <span className="text-[10px] opacity-60">{r.code}</span>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Secret Admin Vault Button */}
          <button
            onClick={onOpenAdmin}
            className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-neutral-900 hover:bg-orange-500/20 border border-white/10 hover:border-orange-500/50 flex items-center justify-center text-neutral-400 hover:text-orange-400 transition-all shrink-0 cursor-pointer"
            title="MOVLO Studio Admin Vault (PIN: 77490869)"
          >
            <Shield className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </header>
  );
};
