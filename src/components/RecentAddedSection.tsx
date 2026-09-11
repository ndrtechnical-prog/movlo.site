import React, { useState, useEffect, useRef, useCallback } from "react";
import { Sparkles, Star, Play, ExternalLink, Film, Clock, AlertCircle, RefreshCw, ChevronLeft, ChevronRight, ArrowDown } from "lucide-react";
import { RecentAddedItem, FALLBACK_POSTER, getCinemaPosterFallback } from "../lib/api";
import {
  JsonMovie,
  MovieCategory,
  CATEGORY_LABELS,
  loadMoviesByCategory,
  jsonMovieToRecentItem
} from "../lib/jsonMovies";

interface RecentAddedSectionProps {
  selectedCategory: MovieCategory;
  onSelectCategory: (category: MovieCategory) => void;
  onSelectItem: (item: RecentAddedItem) => void;
}

interface RecentItemCardProps {
  item: RecentAddedItem;
  onSelect: (item: RecentAddedItem) => void;
  priority?: boolean;
}

const RecentItemCard: React.FC<RecentItemCardProps> = ({ item, onSelect, priority = false }) => {
  const [imgLoaded, setImgLoaded] = useState(false);
  const [fallbackLevel, setFallbackLevel] = useState<0 | 1 | 2>(0);

  // In 16:9 widescreen, prioritize backdrop/high-res video thumbnail if available
  const initialImage =
    (item.backdrop && item.backdrop.trim() !== "" ? item.backdrop : null) ||
    (item.poster && item.poster.trim() !== "" ? item.poster : null) ||
    getCinemaPosterFallback(1);

  const currentPosterSrc =
    fallbackLevel === 0
      ? initialImage
      : fallbackLevel === 1
      ? item.poster || getCinemaPosterFallback(1)
      : FALLBACK_POSTER;

  const handleImageError = () => {
    if (fallbackLevel === 0) setFallbackLevel(1);
    else if (fallbackLevel === 1) setFallbackLevel(2);
    else setImgLoaded(true);
  };

  const isAd = item.itemType === "ad_link" || item.isAd;

  return (
    <div
      onClick={() => onSelect(item)}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          onSelect(item);
        }
      }}
      className="group relative flex flex-col w-full text-left cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-400 bg-white/5 border border-white/10 rounded-xl overflow-hidden hover:border-amber-500/50 backdrop-blur-md transition-all duration-300 hover:-translate-y-1 shadow-lg hover:shadow-amber-500/10"
    >
      {/* 16:9 Widescreen Video Aspect Ratio */}
      <div className="relative w-full aspect-[16/9] bg-neutral-900/90 overflow-hidden">
        {/* Placeholder skeleton behind image until loaded */}
        {!imgLoaded && (
          <div className="absolute inset-0 bg-neutral-800/80 animate-pulse flex flex-col items-center justify-center gap-2 p-3">
            <Film className="w-6 h-6 text-neutral-600 animate-pulse" />
          </div>
        )}

        <img
          key={`${item.id}-${fallbackLevel}`}
          src={currentPosterSrc}
          alt={item.title}
          loading={priority ? "eager" : "lazy"}
          referrerPolicy="no-referrer"
          onLoad={() => setImgLoaded(true)}
          onError={handleImageError}
          className={`w-full h-full object-cover object-center transition-all duration-500 group-hover:scale-105 ${
            imgLoaded ? "opacity-100" : "opacity-0"
          }`}
        />

        {/* Top Badges */}
        <div className="absolute top-2 left-2 right-2 flex items-center justify-between pointer-events-none z-10">
          {/* Top Left: Type/Tag Badge */}
          <span
            className={`px-1.5 py-0.5 rounded text-[9px] sm:text-[10px] font-black uppercase tracking-wider shadow-md ${
              isAd
                ? "bg-amber-500 text-black border border-amber-400/50"
                : "bg-orange-500 text-black border border-orange-400/50"
            }`}
          >
            {item.badge || (isAd ? "SPONSORED" : "4K VIDEO")}
          </span>

          {/* Top Right: Rating Badge */}
          <div className="flex items-center gap-1 bg-black/75 backdrop-blur-md px-1.5 py-0.5 rounded text-[10px] font-bold border border-white/10 text-white shadow-sm">
            <Star className="w-2.5 h-2.5 text-amber-400 fill-current" />
            <span>{item.rating ? item.rating.toFixed(1) : "9.2"}</span>
          </div>
        </div>

        {/* Hover / Active Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-between p-2.5">
          <div />

          {/* Center Play / Link Icon on hover */}
          <div className="self-center w-9 h-9 sm:w-11 sm:h-11 rounded-full bg-amber-500 text-neutral-950 flex items-center justify-center shadow-xl group-hover:scale-110 transition-transform">
            {isAd ? (
              <ExternalLink className="w-4 h-4 text-neutral-950" />
            ) : (
              <Play className="w-4 h-4 fill-current ml-0.5 text-neutral-950" />
            )}
          </div>

          {/* Bottom quick meta hover */}
          <div className="text-[10px] sm:text-xs text-neutral-200 truncate font-medium flex items-center justify-between">
            <span className="truncate">{item.subtitle || item.genre}</span>
            <span className="shrink-0 text-amber-400 font-semibold text-[10px] flex items-center gap-0.5">
              <Clock className="w-2.5 h-2.5" />
              {item.addedAgo}
            </span>
          </div>
        </div>
      </div>

      {/* Movie Info Section with Frosted Glass */}
      <div className="p-2 sm:p-2.5 bg-black/30 backdrop-blur-sm border-t border-white/5 flex flex-col">
        <h4 className="text-xs sm:text-sm font-bold text-white group-hover:text-amber-400 transition-colors truncate mb-0.5">
          {item.title}
        </h4>
        <div className="flex items-center justify-between text-[10px] sm:text-[11px] text-gray-400 truncate">
          <span className="truncate">
            {item.genre || (isAd ? "Sponsored" : "Cinema")}
            {item.duration ? ` • ${item.duration}` : item.year ? ` • ${item.year}` : ""}
          </span>
          <span className="shrink-0 text-amber-400/90 font-medium text-[9px] sm:text-[10px] flex items-center gap-0.5 ml-1">
            <Clock className="w-2.5 h-2.5" />
            {item.addedAgo}
          </span>
        </div>
      </div>
    </div>
  );
};

const CATEGORIES: MovieCategory[] = ["english", "indian", "chinese", "dramas", "others"];

export const RecentAddedSection: React.FC<RecentAddedSectionProps> = ({
  selectedCategory,
  onSelectCategory,
  onSelectItem
}) => {
  const [allCategoryMovies, setAllCategoryMovies] = useState<JsonMovie[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Pagination for English Movies (loads exactly 8 movies initially)
  const [englishPage, setEnglishPage] = useState(1);
  const ENGLISH_PAGE_SIZE = 8;

  // Infinite scrolling for Indian Movies & Dramas (continuous listing of large datasets)
  const isInfiniteCategory = selectedCategory === "indian" || selectedCategory === "dramas";
  const [infiniteVisibleCount, setInfiniteVisibleCount] = useState(16);
  const sentinelRef = useRef<HTMLDivElement>(null);

  // Reset pagination state when switching category
  useEffect(() => {
    if (selectedCategory === "english") {
      setEnglishPage(1);
    } else if (isInfiniteCategory) {
      setInfiniteVisibleCount(16);
    }
  }, [selectedCategory, isInfiniteCategory]);

  // Load JSON movies for the selected category
  const loadCategoryData = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await loadMoviesByCategory(selectedCategory);
      setAllCategoryMovies(data);
    } catch (err: any) {
      setError(`Failed to load ${CATEGORY_LABELS[selectedCategory]}. Please try again.`);
    } finally {
      setIsLoading(false);
    }
  }, [selectedCategory]);

  useEffect(() => {
    loadCategoryData();
  }, [loadCategoryData]);

  // Infinite Scroll Observer for Indian Movies & Dramas
  useEffect(() => {
    if (!isInfiniteCategory) return;
    if (infiniteVisibleCount >= allCategoryMovies.length) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          setInfiniteVisibleCount((prev) => Math.min(prev + 16, allCategoryMovies.length));
        }
      },
      { threshold: 0.1, rootMargin: "200px" }
    );

    const target = sentinelRef.current;
    if (target) observer.observe(target);

    return () => {
      if (target) observer.unobserve(target);
    };
  }, [isInfiniteCategory, infiniteVisibleCount, allCategoryMovies.length]);

  // Compute items to display based on category rules + Intersperse Monetag Native Ads
  const displayedItems: RecentAddedItem[] = React.useMemo(() => {
    let baseItems: RecentAddedItem[] = [];

    if (selectedCategory === "english") {
      // Show exactly 8 movies for the current page
      const startIdx = (englishPage - 1) * ENGLISH_PAGE_SIZE;
      const paged = allCategoryMovies.slice(startIdx, startIdx + ENGLISH_PAGE_SIZE);
      baseItems = paged.map((m, idx) => jsonMovieToRecentItem(m, startIdx + idx));
    } else if (isInfiniteCategory) {
      // Continuous / infinite movie listing
      const visible = allCategoryMovies.slice(0, infiniteVisibleCount);
      baseItems = visible.map((m, idx) => jsonMovieToRecentItem(m, idx));
    } else {
      // Display all movies in Chinese, Others
      baseItems = allCategoryMovies.map((m, idx) => jsonMovieToRecentItem(m, idx));
    }

    return baseItems;
  }, [selectedCategory, isInfiniteCategory, allCategoryMovies, englishPage, infiniteVisibleCount]);

  const totalEnglishPages = Math.ceil(allCategoryMovies.length / ENGLISH_PAGE_SIZE);

  return (
    <section id="movie-catalog-section" className="w-full py-6 sm:py-10 max-w-7xl mx-auto px-2.5 sm:px-6 lg:px-8">
      {/* Section Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4 sm:mb-6 border-b border-white/5 pb-3 sm:pb-4">
        <div className="flex items-center gap-2 sm:gap-3">
          <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-lg bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400 shadow-sm shadow-amber-500/10">
            <Sparkles className="w-4 h-4 sm:w-5 sm:h-5" />
          </div>
          <div>
            <h2 className="text-base sm:text-2xl font-bold font-['Syne',sans-serif] text-white tracking-tight flex items-center gap-2 flex-wrap">
              <span>Indian Movies & Cinema</span>
              <span className="text-[10px] sm:text-xs font-bold px-2.5 py-0.5 rounded-full bg-gradient-to-r from-amber-500/20 to-orange-500/20 text-amber-300 border border-amber-500/40">
                {allCategoryMovies.length} Titles
              </span>
            </h2>
            <p className="text-[10px] sm:text-xs text-gray-400 font-medium">
              Verified Embeddable Indian Movies • High-Speed 1080p Full Streams
            </p>
          </div>
        </div>
      </div>

      {/* Error state */}
      {error && !isLoading && (
        <div className="w-full p-4 sm:p-6 rounded-xl bg-red-950/20 backdrop-blur-md border border-red-500/20 text-center flex flex-col items-center justify-center gap-3 my-4">
          <AlertCircle className="w-6 h-6 text-red-400" />
          <p className="text-xs sm:text-sm text-neutral-300 max-w-md">{error}</p>
          <button
            onClick={loadCategoryData}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-xs font-semibold text-white transition-colors cursor-pointer border border-white/10"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Try Again</span>
          </button>
        </div>
      )}

      {/* Loading Skeleton */}
      {isLoading && (
        <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2.5 sm:gap-4 md:gap-5 w-full">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="flex flex-col w-full animate-pulse bg-white/5 border border-white/10 rounded-xl overflow-hidden backdrop-blur-md">
              <div className="w-full aspect-[16/9] bg-neutral-800/40" />
              <div className="p-2 sm:p-2.5 bg-black/20 space-y-1.5">
                <div className="h-3 bg-neutral-800/80 rounded w-3/4" />
                <div className="h-2 bg-neutral-800/50 rounded w-1/2" />
              </div>
            </div>
          ))}
        </div>
      )}

      {/* 16:9 Widescreen Cards Grid */}
      {!isLoading && !error && displayedItems.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2.5 sm:gap-4 md:gap-5 w-full">
          {displayedItems.map((item, idx) => (
            <RecentItemCard
              key={`${item.id}-${idx}`}
              item={item}
              onSelect={onSelectItem}
              priority={idx < 4}
            />
          ))}
        </div>
      )}

      {/* English Movies Pagination Controls (Initial 8 movies, next/prev without page reload) */}
      {!isLoading && selectedCategory === "english" && totalEnglishPages > 1 && (
        <div className="w-full flex flex-col sm:flex-row items-center justify-between gap-3 mt-6 sm:mt-8 pt-4 border-t border-white/10">
          <div className="text-xs text-neutral-400 font-medium">
            Showing <span className="text-white font-bold">{(englishPage - 1) * ENGLISH_PAGE_SIZE + 1}</span> -{" "}
            <span className="text-white font-bold">
              {Math.min(englishPage * ENGLISH_PAGE_SIZE, allCategoryMovies.length)}
            </span>{" "}
            of <span className="text-amber-400 font-bold">{allCategoryMovies.length}</span> English Movies
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                setEnglishPage((prev) => Math.max(1, prev - 1));
                const el = document.getElementById("movie-catalog-section");
                if (el) el.scrollIntoView({ behavior: "smooth" });
              }}
              disabled={englishPage === 1}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors border ${
                englishPage === 1
                  ? "bg-white/5 text-neutral-500 border-white/5 cursor-not-allowed"
                  : "bg-white/10 hover:bg-white/20 text-white border-white/15 cursor-pointer"
              }`}
            >
              <ChevronLeft className="w-4 h-4" />
              <span>Previous</span>
            </button>

            <span className="text-xs font-mono text-neutral-300 px-3 py-1.5 rounded-lg bg-black/40 border border-white/10">
              Page {englishPage} of {totalEnglishPages}
            </span>

            <button
              onClick={() => {
                setEnglishPage((prev) => Math.min(totalEnglishPages, prev + 1));
                const el = document.getElementById("movie-catalog-section");
                if (el) el.scrollIntoView({ behavior: "smooth" });
              }}
              disabled={englishPage >= totalEnglishPages}
              className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors border ${
                englishPage >= totalEnglishPages
                  ? "bg-white/5 text-neutral-500 border-white/5 cursor-not-allowed"
                  : "bg-amber-500 hover:bg-amber-400 text-black border-amber-400 cursor-pointer shadow-md shadow-amber-500/20"
              }`}
            >
              <span>Next</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* Continuous / Infinite Scroll Sentinel & Load More button for Indian Movies and Dramas */}
      {!isLoading && isInfiniteCategory && (
        <div className="w-full flex flex-col items-center justify-center gap-3 mt-6 sm:mt-8 pt-4 border-t border-white/10">
          <div ref={sentinelRef} className="h-2 w-full" />

          {infiniteVisibleCount < allCategoryMovies.length ? (
            <button
              onClick={() =>
                setInfiniteVisibleCount((prev) => Math.min(prev + 16, allCategoryMovies.length))
              }
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-black font-bold text-xs uppercase tracking-wider transition-all shadow-lg shadow-amber-500/20 cursor-pointer hover:scale-105"
            >
              <ArrowDown className="w-4 h-4" />
              <span>
                Load More {CATEGORY_LABELS[selectedCategory]} ({allCategoryMovies.length - infiniteVisibleCount} remaining)
              </span>
            </button>
          ) : (
            <div className="text-xs text-neutral-500 font-mono py-2">
              All {allCategoryMovies.length} {CATEGORY_LABELS[selectedCategory]} loaded
            </div>
          )}
        </div>
      )}
    </section>
  );
};
