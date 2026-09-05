import React from "react";
import { MovieCard } from "./MovieCard";
import { Movie } from "../types";
import { Eye, Radio, RefreshCw, AlertCircle, Users } from "lucide-react";

interface RecentWatchSectionProps {
  movies: Movie[];
  isLoading: boolean;
  error?: string | null;
  onSelectMovie: (id: number) => void;
  onRetry?: () => void;
}

export const RecentWatchSection: React.FC<RecentWatchSectionProps> = ({
  movies,
  isLoading,
  error,
  onSelectMovie,
  onRetry
}) => {
  // Calculate total viewers streaming
  const totalStreaming = movies.reduce((acc, m) => acc + (m.liveViewers || 1), 0);

  return (
    <section id="recent-watch" className="w-full py-6 sm:py-10 max-w-7xl mx-auto px-2.5 sm:px-6 lg:px-8">
      {/* Section Header */}
      <div className="flex items-center justify-between gap-3 mb-3 sm:mb-6 border-b border-white/5 pb-2.5 sm:pb-4">
        <div className="flex items-center gap-2 sm:gap-3">
          <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg bg-red-500/10 border border-red-500/20 flex items-center justify-center text-red-400 relative shadow-sm shadow-red-500/10">
            <Eye className="w-4 h-4" />
            <span className="absolute -top-0.5 -right-0.5 w-2 h-2 bg-red-500 rounded-full animate-ping" />
            <span className="absolute -top-0.5 -right-0.5 w-2 h-2 bg-red-500 rounded-full" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-base sm:text-2xl font-bold font-['Syne',sans-serif] text-white tracking-tight">
                Recent Watch
              </h2>
              <span className="inline-flex items-center gap-1 text-[10px] sm:text-xs font-bold px-2 py-0.5 rounded-full bg-red-500/15 text-red-400 border border-red-500/30">
                <Radio className="w-2.5 h-2.5 animate-pulse text-red-400" />
                <span>LIVE NOW</span>
              </span>
            </div>
            <p className="text-[10px] sm:text-xs text-gray-400 font-medium">
              Movies currently and recently watched by audience
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {movies.length > 0 && (
            <div className="hidden sm:flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/5 border border-white/10 text-xs text-neutral-300 backdrop-blur-sm">
              <Users className="w-3.5 h-3.5 text-amber-400" />
              <span className="font-semibold text-white">{totalStreaming}</span>
              <span className="text-neutral-400">watching now</span>
            </div>
          )}
          <span className="text-[10px] sm:text-xs text-amber-400 font-semibold px-2.5 py-1 rounded-full bg-amber-500/10 border border-amber-500/20 backdrop-blur-sm">
            {movies.length} Movies
          </span>
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

      {/* Loading Skeleton */}
      {isLoading && (
        <div className="grid grid-cols-4 gap-1.5 sm:gap-4 md:gap-6 w-full">
          {Array.from({ length: 8 }).map((_, i) => (
            <div
              key={i}
              className="flex flex-col w-full animate-pulse bg-white/5 border border-white/10 rounded-xl overflow-hidden backdrop-blur-md"
            >
              <div className="w-full aspect-[2/3] bg-neutral-800/40" />
              <div className="p-2 sm:p-2.5 bg-black/20 space-y-1.5">
                <div className="h-3 bg-neutral-800/80 rounded w-3/4" />
                <div className="h-2 bg-neutral-800/50 rounded w-1/2" />
              </div>
            </div>
          ))}
        </div>
      )}

      {/* 4 Cards per Row Grid: Movies Being Watched */}
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

      {/* Empty State */}
      {!isLoading && !error && movies.length === 0 && (
        <div className="w-full py-10 px-4 rounded-2xl bg-white/[0.02] border border-white/5 backdrop-blur-md text-center flex flex-col items-center justify-center gap-2 text-neutral-400">
          <Eye className="w-8 h-8 text-neutral-600" />
          <p className="text-sm font-medium text-white">No active streams right now</p>
          <p className="text-xs text-neutral-500">Watched movies will appear here in real-time as users stream.</p>
        </div>
      )}
    </section>
  );
};
