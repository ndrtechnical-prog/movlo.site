import React, { useState } from "react";
import { Sparkles, Star, Play, ExternalLink, Film, Clock, AlertCircle, RefreshCw, PlusCircle, Shield } from "lucide-react";
import { RecentAddedItem, FALLBACK_POSTER, getCinemaPosterFallback } from "../lib/api";

interface RecentAddedSectionProps {
  items: RecentAddedItem[];
  isLoading: boolean;
  error?: string | null;
  onSelectItem: (item: RecentAddedItem) => void;
  onRetry?: () => void;
  onOpenAdmin?: () => void;
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

export const RecentAddedSection: React.FC<RecentAddedSectionProps> = ({
  items,
  isLoading,
  error,
  onSelectItem,
  onRetry,
  onOpenAdmin
}) => {
  const [selectedCategory, setSelectedCategory] = useState<"indian" | "all" | "action" | "ads">("indian");

  // Category classification helper
  const isIndianItem = (item: RecentAddedItem) => {
    const text = `${item.genre || ""} ${item.genres?.join(" ") || ""} ${item.badge || ""} ${item.title || ""}`.toLowerCase();
    return text.includes("indian") || text.includes("bollywood") || text.includes("south cinema");
  };

  const indianCount = items.filter(isIndianItem).length;
  const adsCount = items.filter((item) => item.isAd || item.itemType === "ad_link").length;
  const actionCount = items.filter((item) => !item.isAd && (item.genre?.toLowerCase().includes("action") || item.genres?.some(g => g.toLowerCase().includes("action")))).length;

  const filteredItems = items.filter((item) => {
    if (selectedCategory === "indian") return isIndianItem(item);
    if (selectedCategory === "ads") return item.isAd || item.itemType === "ad_link";
    if (selectedCategory === "action") return !item.isAd && (item.genre?.toLowerCase().includes("action") || item.genres?.some(g => g.toLowerCase().includes("action")));
    return true; // "all"
  });

  return (
    <section id="recent-added" className="w-full py-6 sm:py-10 max-w-7xl mx-auto px-2.5 sm:px-6 lg:px-8">
      {/* Section Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 mb-4 sm:mb-6 border-b border-white/5 pb-3 sm:pb-4">
        <div className="flex items-center gap-2 sm:gap-3">
          <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-lg bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400 shadow-sm shadow-amber-500/10">
            <Sparkles className="w-4 h-4 sm:w-5 sm:h-5" />
          </div>
          <div>
            <h2 className="text-base sm:text-2xl font-bold font-['Syne',sans-serif] text-white tracking-tight flex items-center gap-2 flex-wrap">
              <span>Recent Added Cinema</span>
              <span className="text-[10px] sm:text-xs font-bold px-2.5 py-0.5 rounded-full bg-gradient-to-r from-amber-500/20 to-orange-500/20 text-amber-300 border border-amber-500/40 flex items-center gap-1">
                <span>🇮🇳</span> Indian Category
              </span>
            </h2>
            <p className="text-[10px] sm:text-xs text-gray-400 font-medium">
              Auto-fetched YouTube links & cinema streams • High Definition 1080p / 4K
            </p>
          </div>
        </div>

        {/* Category Selection Filter Tabs */}
        <div className="flex items-center gap-1.5 sm:gap-2 overflow-x-auto no-scrollbar py-1">
          <button
            onClick={() => setSelectedCategory("indian")}
            className={`cursor-pointer px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 shrink-0 ${
              selectedCategory === "indian"
                ? "bg-gradient-to-r from-amber-500 to-orange-500 text-neutral-950 shadow-md shadow-amber-500/20 font-black"
                : "bg-white/5 hover:bg-white/10 text-neutral-300 border border-white/10"
            }`}
          >
            <span>🇮🇳 Indian Category</span>
            <span className={`px-1.5 py-0.2 rounded-full text-[10px] ${
              selectedCategory === "indian" ? "bg-neutral-950 text-amber-400" : "bg-white/10 text-neutral-300"
            }`}>
              {indianCount}
            </span>
          </button>

          <button
            onClick={() => setSelectedCategory("all")}
            className={`cursor-pointer px-3 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center gap-1.5 shrink-0 ${
              selectedCategory === "all"
                ? "bg-amber-500 text-neutral-950 font-bold shadow-md shadow-amber-500/20"
                : "bg-white/5 hover:bg-white/10 text-neutral-300 border border-white/10"
            }`}
          >
            <span>All Links</span>
            <span className={`px-1.5 py-0.2 rounded-full text-[10px] ${
              selectedCategory === "all" ? "bg-neutral-950 text-amber-400" : "bg-white/10 text-neutral-300"
            }`}>
              {items.length}
            </span>
          </button>

          {actionCount > 0 && (
            <button
              onClick={() => setSelectedCategory("action")}
              className={`cursor-pointer px-3 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center gap-1.5 shrink-0 ${
                selectedCategory === "action"
                  ? "bg-amber-500 text-neutral-950 font-bold shadow-md shadow-amber-500/20"
                  : "bg-white/5 hover:bg-white/10 text-neutral-300 border border-white/10"
              }`}
            >
              <span>Action & Thriller</span>
              <span className={`px-1.5 py-0.2 rounded-full text-[10px] ${
                selectedCategory === "action" ? "bg-neutral-950 text-amber-400" : "bg-white/10 text-neutral-300"
              }`}>
                {actionCount}
              </span>
            </button>
          )}

          {adsCount > 0 && (
            <button
              onClick={() => setSelectedCategory("ads")}
              className={`cursor-pointer px-3 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center gap-1.5 shrink-0 ${
                selectedCategory === "ads"
                  ? "bg-amber-500 text-neutral-950 font-bold shadow-md shadow-amber-500/20"
                  : "bg-white/5 hover:bg-white/10 text-neutral-300 border border-white/10"
              }`}
            >
              <span>Sponsored</span>
              <span className={`px-1.5 py-0.2 rounded-full text-[10px] ${
                selectedCategory === "ads" ? "bg-neutral-950 text-amber-400" : "bg-white/10 text-neutral-300"
              }`}>
                {adsCount}
              </span>
            </button>
          )}
        </div>
      </div>

      {/* Error state */}
      {error && !isLoading && (
        <div className="w-full p-4 sm:p-6 rounded-xl bg-red-950/20 backdrop-blur-md border border-red-500/20 text-center flex flex-col items-center justify-center gap-3 my-4">
          <AlertCircle className="w-6 h-6 text-red-400" />
          <p className="text-xs sm:text-sm text-neutral-300 max-w-md">{error}</p>
          {onRetry && (
            <button
              onClick={onRetry}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-xs font-semibold text-white transition-colors cursor-pointer border border-white/10"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Try Again</span>
            </button>
          )}
        </div>
      )}

      {/* Loading Skeleton in 16:9 widescreen ratio */}
      {isLoading && (
        <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2.5 sm:gap-4 md:gap-5 w-full">
          {Array.from({ length: 4 }).map((_, i) => (
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
      {!isLoading && !error && filteredItems.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2.5 sm:gap-4 md:gap-5 w-full">
          {filteredItems.map((item, idx) => (
            <RecentItemCard
              key={`${item.id}-${idx}`}
              item={item}
              onSelect={onSelectItem}
              priority={idx < 4}
            />
          ))}
        </div>
      )}

      {/* Empty State when no links match active filter */}
      {!isLoading && !error && filteredItems.length === 0 && (
        <div className="w-full py-10 px-4 sm:px-8 rounded-2xl bg-white/[0.02] border border-white/5 backdrop-blur-md text-center flex flex-col items-center justify-center gap-3.5">
          <div className="w-12 h-12 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400">
            <Clock className="w-6 h-6" />
          </div>
          <div className="max-w-md space-y-1">
            <h3 className="text-sm sm:text-base font-bold text-white">
              No Movies in {selectedCategory === "indian" ? "Indian Category" : "Selected Category"}
            </h3>
            <p className="text-xs text-gray-400 leading-relaxed">
              Show All Links par click karein ya Admin Portal se naye links add karein.
            </p>
          </div>
          <button
            onClick={() => setSelectedCategory("all")}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-black font-bold text-xs uppercase tracking-wider transition-colors shadow-lg shadow-amber-500/20 cursor-pointer"
          >
            <span>Show All Links ({items.length})</span>
          </button>
        </div>
      )}
    </section>
  );
};
