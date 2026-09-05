import React, { useState, useEffect } from "react";
import { Star, Play, Film } from "lucide-react";
import { Movie } from "../types";
import { FALLBACK_POSTER, getCinemaPosterFallback } from "../lib/api";

interface MovieCardProps {
  movie: Movie;
  onSelect: (id: number) => void;
  priority?: boolean;
}

export const MovieCard: React.FC<MovieCardProps> = ({ movie, onSelect, priority = false }) => {
  const [imgLoaded, setImgLoaded] = useState(false);
  const [fallbackLevel, setFallbackLevel] = useState<0 | 1 | 2>(0);

  // Reset image state when movie changes
  useEffect(() => {
    setImgLoaded(false);
    setFallbackLevel(0);
  }, [movie.id, movie.poster]);

  // Determine current image source based on fallback level
  const initialPoster = movie.poster && movie.poster.trim() !== "" ? movie.poster : getCinemaPosterFallback(movie.id);
  const currentPosterSrc = fallbackLevel === 0 ? initialPoster : fallbackLevel === 1 ? getCinemaPosterFallback(movie.id) : FALLBACK_POSTER;

  const handleImageError = () => {
    if (fallbackLevel === 0) {
      setFallbackLevel(1);
    } else if (fallbackLevel === 1) {
      setFallbackLevel(2);
    } else {
      setImgLoaded(true);
    }
  };

  return (
    <div
      onClick={() => onSelect(movie.id)}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          onSelect(movie.id);
        }
      }}
      className="group relative flex flex-col w-full text-left cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-orange-400 bg-white/5 border border-white/10 rounded-xl overflow-hidden hover:border-orange-500/50 backdrop-blur-md transition-all duration-300 hover:-translate-y-1 shadow-lg hover:shadow-orange-500/10"
    >
      {/* Poster Aspect Ratio Container (2:3) */}
      <div className="relative w-full aspect-[2/3] bg-neutral-900/90 overflow-hidden">
        {/* Placeholder skeleton behind image until loaded */}
        {!imgLoaded && (
          <div className="absolute inset-0 bg-neutral-800/80 animate-pulse flex flex-col items-center justify-center gap-2 p-3">
            <Film className="w-6 h-6 text-neutral-600 animate-pulse" />
          </div>
        )}

        <img
          key={`${movie.id}-${fallbackLevel}`}
          src={currentPosterSrc}
          alt={movie.title}
          loading={priority ? "eager" : "lazy"}
          referrerPolicy="no-referrer"
          onLoad={() => setImgLoaded(true)}
          onError={handleImageError}
          className={`w-full h-full object-cover object-center transition-all duration-500 group-hover:scale-105 ${
            imgLoaded ? "opacity-100" : "opacity-0"
          }`}
        />

        {/* Top Left Live Status Badge */}
        {(movie.liveStatus || movie.isWatchingNow) && (
          <div className="absolute top-2 left-2 z-10 flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-black/85 backdrop-blur-md border border-white/15 text-[10px] font-semibold text-white shadow-md">
            <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${movie.isWatchingNow ? "bg-red-500 animate-pulse ring-2 ring-red-500/30" : "bg-emerald-400"}`} />
            <span className="truncate max-w-[110px] text-neutral-200 text-[9px] sm:text-[10px]">
              {movie.liveStatus ? movie.liveStatus.replace(/^[🔴🟢]\s*/, "") : `${movie.liveViewers || 1} watching`}
            </span>
          </div>
        )}

        {/* Hover / Active Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-between p-2.5">
          {/* Top badge */}
          <div className="flex justify-end">
            {movie.rating ? (
              <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded bg-orange-500 text-black text-[10px] font-bold shadow">
                <Star className="w-2.5 h-2.5 fill-current" />
                {movie.rating.toFixed(1)}
              </span>
            ) : null}
          </div>

          {/* Center Play Icon on hover */}
          <div className="self-center w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-orange-500 text-neutral-950 flex items-center justify-center shadow-xl group-hover:scale-110 transition-transform">
            <Play className="w-3.5 h-3.5 sm:w-4 sm:h-4 fill-current ml-0.5" />
          </div>

          {/* Bottom quick meta */}
          <div className="text-[10px] sm:text-xs text-neutral-300 truncate font-medium">
            {movie.genres && movie.genres.length > 0 ? movie.genres[0] : (movie.year || "Movie")}
          </div>
        </div>

        {/* Static Rating Badge (always visible in corner on mobile & desktop) */}
        {movie.rating && (
          <div className="absolute top-2 right-2 flex items-center gap-1 bg-black/60 backdrop-blur-md px-1.5 py-0.5 rounded text-[10px] font-bold border border-white/10 text-white shadow-sm group-hover:opacity-0 transition-opacity">
            <Star className="w-2.5 h-2.5 text-orange-400 fill-current" />
            <span>{movie.rating.toFixed(1)}</span>
          </div>
        )}
      </div>

      {/* Movie Info Section with Frosted Backdrop */}
      <div className="p-2.5 sm:p-3 bg-black/20 backdrop-blur-sm border-t border-white/5 flex flex-col">
        <h4 className="text-xs sm:text-sm font-bold text-white group-hover:text-orange-400 transition-colors truncate mb-0.5">
          {movie.title}
        </h4>
        <p className="text-[10px] sm:text-[11px] text-gray-400 truncate">
          {movie.genres && movie.genres.length > 0 ? movie.genres[0] : "Movie"}
          {movie.year ? ` • ${movie.year}` : ""}
        </p>
      </div>
    </div>
  );
};
