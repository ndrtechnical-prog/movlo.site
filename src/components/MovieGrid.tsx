import React from "react";
import { MovieCard } from "./MovieCard";
import { Movie } from "../types";
import { Sparkles, AlertCircle, RefreshCw } from "lucide-react";

interface MovieGridProps {
  id?: string;
  title: string;
  subtitle?: string;
  icon?: React.ReactNode;
  movies: Movie[];
  isLoading: boolean;
  error?: string | null;
  onSelectMovie: (id: number) => void;
  onRetry?: () => void;
  onLoadMore?: () => void;
  hasMore?: boolean;
  isLoadingMore?: boolean;
}

export const MovieGrid: React.FC<MovieGridProps> = ({
  id,
  title,
  subtitle,
  icon,
  movies,
  isLoading,
  error,
  onSelectMovie,
  onRetry,
  onLoadMore,
  hasMore = false,
  isLoadingMore = false
}) => {
  return (
    <section id={id} className="w-full py-6 sm:py-10 max-w-7xl mx-auto px-2.5 sm:px-6 lg:px-8">
      {/* Section Header */}
      <div className="flex items-center justify-between gap-3 mb-3 sm:mb-6 border-b border-white/5 pb-2.5 sm:pb-4">
        <div className="flex items-center gap-2 sm:gap-3">
          {icon ? (
            <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg bg-orange-500/10 border border-orange-500/20 flex items-center justify-center text-orange-400">
              {icon}
            </div>
          ) : (
            <div className="w-1.5 h-5 sm:h-6 bg-orange-500 rounded-full" />
          )}
          <div>
            <h2 className="text-base sm:text-2xl font-bold font-['Syne',sans-serif] text-white tracking-tight flex items-center gap-2">
              {title}
            </h2>
            {subtitle && (
              <p className="text-[10px] sm:text-xs text-gray-400 font-medium">
                {subtitle}
              </p>
            )}
          </div>
        </div>

        {movies.length > 0 && (
          <span className="text-[10px] sm:text-xs text-gray-400 font-medium px-2.5 py-0.5 rounded-full bg-white/5 border border-white/10 backdrop-blur-sm">
            {movies.length} {movies.length === 1 ? "title" : "titles"}
          </span>
        )}
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

      {/* 30. Loading Skeleton (16 cards with Frosted Glass styling) */}
      {isLoading && (
        <div className="grid grid-cols-4 gap-1.5 sm:gap-4 md:gap-6 w-full">
          {Array.from({ length: 16 }).map((_, i) => (
            <div key={i} className="flex flex-col w-full animate-pulse bg-white/5 border border-white/10 rounded-xl overflow-hidden backdrop-blur-md">
              <div className="w-full aspect-[2/3] bg-neutral-800/40" />
              <div className="p-2.5 sm:p-3 bg-black/20 space-y-1.5">
                <div className="h-3 bg-neutral-800/80 rounded w-3/4" />
                <div className="h-2 bg-neutral-800/50 rounded w-1/2" />
              </div>
            </div>
          ))}
        </div>
      )}

      {/* 6. & 29. Responsive 4-cards-per-row grid on both mobile and desktop */}
      {!isLoading && !error && movies.length > 0 && (
        <div className="grid grid-cols-4 gap-1.5 sm:gap-4 md:gap-6 w-full">
          {movies.map((movie, idx) => (
            <MovieCard
              key={`${movie.id}-${idx}`}
              movie={movie}
              onSelect={onSelectMovie}
              priority={idx < 4}
            />
          ))}
        </div>
      )}

      {/* Empty state */}
      {!isLoading && !error && movies.length === 0 && (
        <div className="w-full py-12 text-center text-xs sm:text-sm text-gray-400">
          No movie titles found for this category.
        </div>
      )}

      {/* Load More Button (if pagination supported) */}
      {hasMore && onLoadMore && !isLoading && (
        <div className="mt-6 sm:mt-10 flex justify-center">
          <button
            onClick={onLoadMore}
            disabled={isLoadingMore}
            className="inline-flex items-center gap-2 px-6 py-2.5 rounded-lg bg-white/10 hover:bg-white/20 backdrop-blur-md border border-white/10 text-white text-xs sm:text-sm font-bold transition-all hover:scale-105 active:scale-95 disabled:opacity-50 cursor-pointer shadow-lg"
          >
            {isLoadingMore ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin text-orange-400" />
                <span>Loading more titles...</span>
              </>
            ) : (
              <span>Load More Movies</span>
            )}
          </button>
        </div>
      )}
    </section>
  );
};
