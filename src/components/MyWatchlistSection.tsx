import React, { useState, useMemo } from "react";
import { Movie } from "../types";
import {
  BookmarkCheck,
  BookmarkX,
  Trash2,
  Film,
  Star,
  Calendar,
  Play,
  Search,
  Sparkles,
  Info
} from "lucide-react";
import { FALLBACK_POSTER, getCinemaPosterFallback } from "../lib/api";

interface MyWatchlistSectionProps {
  watchlist: Movie[];
  onSelectMovie: (id: number) => void;
  onRemoveMovie: (id: number) => void;
  onClearWatchlist: () => void;
  onBrowseExplore?: () => void;
}

export const MyWatchlistSection: React.FC<MyWatchlistSectionProps> = ({
  watchlist,
  onSelectMovie,
  onRemoveMovie,
  onClearWatchlist,
  onBrowseExplore
}) => {
  const [filterQuery, setFilterQuery] = useState("");
  const [showClearConfirm, setShowClearConfirm] = useState(false);

  // Filter watchlist if user searches within their list
  const filteredMovies = useMemo(() => {
    if (!filterQuery.trim()) return watchlist;
    const q = filterQuery.toLowerCase();
    return watchlist.filter(
      (m) =>
        m.title.toLowerCase().includes(q) ||
        m.genres?.some((g) => g.toLowerCase().includes(q)) ||
        (m.year && String(m.year).includes(q))
    );
  }, [watchlist, filterQuery]);

  return (
    <section
      id="my-watchlist"
      className="w-full py-6 sm:py-10 max-w-7xl mx-auto px-2.5 sm:px-6 lg:px-8 scroll-mt-6"
    >
      {/* Section Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4 sm:mb-6 border-b border-white/5 pb-3 sm:pb-4">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-amber-500/10 border border-amber-500/25 flex items-center justify-center text-amber-400 shadow-sm shadow-amber-500/10">
            <BookmarkCheck className="w-4 h-4 sm:w-5 sm:h-5 text-amber-400" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-lg sm:text-2xl font-bold font-['Syne',sans-serif] text-white tracking-tight">
                My Watchlist
              </h2>
              <span className="inline-flex items-center gap-1 text-[10px] sm:text-xs font-bold px-2.5 py-0.5 rounded-full bg-amber-500/15 text-amber-400 border border-amber-500/30">
                {watchlist.length} {watchlist.length === 1 ? "Movie" : "Movies"}
              </span>
            </div>
            <p className="text-[11px] sm:text-xs text-neutral-400 font-medium">
              Saved from movie details & stored in your browser
            </p>
          </div>
        </div>

        {/* Action Controls */}
        {watchlist.length > 0 && (
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Search within watchlist */}
            {watchlist.length > 3 && (
              <div className="relative">
                <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-neutral-400 pointer-events-none" />
                <input
                  type="text"
                  value={filterQuery}
                  onChange={(e) => setFilterQuery(e.target.value)}
                  placeholder="Filter saved..."
                  className="bg-white/5 hover:bg-white/10 focus:bg-white/15 border border-white/10 text-white text-xs pl-8 pr-3 py-1.5 rounded-lg outline-none focus:border-amber-400/50 transition-all placeholder:text-neutral-500 w-32 sm:w-44"
                />
              </div>
            )}

            {/* Clear Watchlist Button */}
            {!showClearConfirm ? (
              <button
                onClick={() => setShowClearConfirm(true)}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/5 hover:bg-red-500/15 border border-white/10 hover:border-red-500/30 text-neutral-400 hover:text-red-400 text-xs font-medium transition-all cursor-pointer"
                title="Clear all saved movies"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Clear List</span>
              </button>
            ) : (
              <div className="flex items-center gap-1.5 bg-red-950/40 border border-red-500/30 px-2.5 py-1 rounded-lg">
                <span className="text-[11px] text-red-200">Remove all?</span>
                <button
                  onClick={() => {
                    onClearWatchlist();
                    setShowClearConfirm(false);
                    setFilterQuery("");
                  }}
                  className="px-2 py-0.5 rounded bg-red-600 hover:bg-red-500 text-white text-[10px] font-bold cursor-pointer"
                >
                  Yes
                </button>
                <button
                  onClick={() => setShowClearConfirm(false)}
                  className="px-1.5 py-0.5 text-neutral-400 hover:text-white text-[10px] cursor-pointer"
                >
                  No
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Watchlist Grid */}
      {filteredMovies.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2.5 sm:gap-4 md:gap-5 w-full">
          {filteredMovies.map((movie) => (
            <WatchlistCard
              key={movie.id}
              movie={movie}
              onSelect={() => onSelectMovie(movie.id)}
              onRemove={() => onRemoveMovie(movie.id)}
            />
          ))}
        </div>
      )}

      {/* Filter No Results */}
      {watchlist.length > 0 && filteredMovies.length === 0 && (
        <div className="w-full py-10 px-4 rounded-2xl bg-white/[0.02] border border-white/5 backdrop-blur-md text-center flex flex-col items-center justify-center gap-2 text-neutral-400">
          <Search className="w-8 h-8 text-neutral-600" />
          <p className="text-sm font-semibold text-white">No matches for "{filterQuery}"</p>
          <button
            onClick={() => setFilterQuery("")}
            className="text-xs text-amber-400 hover:underline mt-1"
          >
            Clear filter
          </button>
        </div>
      )}

      {/* Empty State */}
      {watchlist.length === 0 && (
        <div className="w-full py-12 sm:py-16 px-4 rounded-2xl bg-white/[0.02] border border-white/5 backdrop-blur-md text-center flex flex-col items-center justify-center gap-3">
          <div className="w-14 h-14 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400 mb-1">
            <BookmarkX className="w-7 h-7 text-amber-400/70" />
          </div>
          <h3 className="text-base sm:text-lg font-bold text-white tracking-tight">
            Your Watchlist is Empty
          </h3>
          <p className="text-xs sm:text-sm text-neutral-400 max-w-md leading-relaxed">
            Click on any movie to open its details, then select{" "}
            <span className="text-amber-400 font-semibold inline-flex items-center gap-1 mx-0.5">
              <BookmarkCheck className="w-3.5 h-3.5 inline" /> "Add to Watchlist"
            </span>{" "}
            to save it here in your browser.
          </p>

          <div className="flex items-center gap-2 mt-2">
            <button
              onClick={() => {
                if (onBrowseExplore) {
                  onBrowseExplore();
                } else {
                  const el = document.getElementById("recent-added");
                  if (el) el.scrollIntoView({ behavior: "smooth" });
                }
              }}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-amber-500 hover:bg-amber-400 text-black text-xs sm:text-sm font-bold shadow-lg shadow-amber-500/20 transition-all hover:scale-105 cursor-pointer"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>Explore Movies</span>
            </button>
          </div>
        </div>
      )}
    </section>
  );
};

interface WatchlistCardProps {
  movie: Movie;
  onSelect: () => void;
  onRemove: () => void;
}

const WatchlistCard: React.FC<WatchlistCardProps> = ({ movie, onSelect, onRemove }) => {
  const [imgError, setImgError] = useState(false);
  const [imgLoaded, setImgLoaded] = useState(false);

  const posterSrc = imgError
    ? getCinemaPosterFallback(movie.id)
    : movie.poster || movie.backdrop || getCinemaPosterFallback(movie.id);

  return (
    <div className="group relative flex flex-col w-full text-left bg-white/5 border border-white/10 rounded-xl overflow-hidden hover:border-amber-500/50 backdrop-blur-md transition-all duration-300 hover:-translate-y-1 shadow-lg hover:shadow-amber-500/10">
      {/* Poster Image Container */}
      <div
        onClick={onSelect}
        className="relative w-full aspect-[2/3] bg-neutral-900 overflow-hidden cursor-pointer"
      >
        {!imgLoaded && (
          <div className="absolute inset-0 bg-neutral-800/60 animate-pulse flex items-center justify-center">
            <Film className="w-6 h-6 text-neutral-600" />
          </div>
        )}

        <img
          src={posterSrc}
          alt={movie.title}
          referrerPolicy="no-referrer"
          onLoad={() => setImgLoaded(true)}
          onError={() => {
            if (!imgError) {
              setImgError(true);
            }
          }}
          className={`w-full h-full object-cover transition-transform duration-500 group-hover:scale-105 ${
            imgLoaded ? "opacity-100" : "opacity-0"
          }`}
        />

        {/* Top Badges */}
        <div className="absolute top-2 left-2 z-10 flex items-center gap-1.5">
          <span className="px-2 py-0.5 rounded-md bg-amber-500 text-neutral-950 text-[10px] font-bold shadow-md">
            Saved
          </span>
          {movie.rating && (
            <div className="flex items-center gap-1 px-1.5 py-0.5 rounded-md bg-black/80 backdrop-blur-md border border-white/15 text-[10px] font-semibold text-amber-400 shadow-md">
              <Star className="w-3 h-3 fill-current" />
              <span>{movie.rating.toFixed(1)}</span>
            </div>
          )}
        </div>

        {/* Top-Right Direct Remove Button */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            onRemove();
          }}
          className="absolute top-2 right-2 z-20 w-7 h-7 rounded-full bg-black/75 hover:bg-red-600 text-neutral-300 hover:text-white border border-white/20 flex items-center justify-center backdrop-blur-md transition-all duration-200 shadow-lg cursor-pointer"
          title="Remove from Watchlist"
          aria-label="Remove from Watchlist"
        >
          <Trash2 className="w-3.5 h-3.5" />
        </button>

        {/* Hover Gradient Overlay with Play / Info Icon */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-end p-3">
          <div className="self-center w-10 h-10 rounded-full bg-amber-500 text-neutral-950 flex items-center justify-center shadow-xl group-hover:scale-110 transition-transform mb-2">
            <Info className="w-5 h-5 fill-current" />
          </div>
          <span className="text-[11px] text-center font-bold text-amber-300">
            Click for details & streaming
          </span>
        </div>
      </div>

      {/* Card Body */}
      <div
        onClick={onSelect}
        className="p-2.5 sm:p-3 bg-black/40 flex-1 flex flex-col justify-between cursor-pointer"
      >
        <div>
          <h4 className="text-xs sm:text-sm font-bold text-white group-hover:text-amber-400 transition-colors line-clamp-1">
            {movie.title}
          </h4>

          <div className="flex items-center gap-2 mt-1 text-[11px] text-neutral-400">
            {movie.year && (
              <span className="flex items-center gap-1">
                <Calendar className="w-3 h-3 text-neutral-500" />
                <span>{movie.year}</span>
              </span>
            )}
            {movie.runtime && <span>• {movie.runtime}m</span>}
            {movie.genres && movie.genres.length > 0 && (
              <span className="truncate max-w-[100px] text-neutral-500">
                • {movie.genres[0]}
              </span>
            )}
          </div>
        </div>

        {/* Action bar below card */}
        <div className="mt-2.5 pt-2 border-t border-white/5 flex items-center justify-between text-[11px]">
          <span className="text-neutral-500 text-[10px]">In Watchlist</span>
          <button
            onClick={(e) => {
              e.stopPropagation();
              onRemove();
            }}
            className="text-[11px] text-neutral-400 hover:text-red-400 transition-colors flex items-center gap-1"
          >
            <BookmarkX className="w-3 h-3" />
            <span>Remove</span>
          </button>
        </div>
      </div>
    </div>
  );
};
