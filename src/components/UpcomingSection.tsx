import React, { useEffect, useState, useRef } from "react";
import { Film, Calendar, Star, Play, Sparkles, AlertCircle, ChevronLeft, ChevronRight } from "lucide-react";
import { UpcomingMovie, MovieClip } from "../types";
import { fetchUpcomingTrailers } from "../lib/api";

interface UpcomingSectionProps {
  onPlayTrailer: (clip: Partial<MovieClip>) => void;
  onSelectMovie?: (movieId: number) => void;
}

export const UpcomingSection: React.FC<UpcomingSectionProps> = ({
  onPlayTrailer,
  onSelectMovie
}) => {
  const [movies, setMovies] = useState<UpcomingMovie[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let isMounted = true;
    async function loadTrailers() {
      try {
        setIsLoading(true);
        const data = await fetchUpcomingTrailers();
        if (isMounted) {
          setMovies(data);
          setError(null);
        }
      } catch (err: any) {
        if (isMounted) {
          setError("Unable to load new release movies at this time.");
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    }

    loadTrailers();
    return () => {
      isMounted = false;
    };
  }, []);

  const handleTrailerClick = (movie: UpcomingMovie) => {
    onPlayTrailer({
      id: `upcoming-${movie.id}`,
      movieId: movie.id,
      movieTitle: movie.title,
      clipTitle: `${movie.title} — Official Trailer`,
      videoUrl: movie.trailerUrl,
      thumbnail: movie.backdrop || movie.poster,
      duration: "2:45",
      quality: "4K UHD",
      genre: movie.genres?.[0] || "Cinema",
      year: movie.year,
      rating: movie.rating
    });
  };

  const scroll = (direction: "left" | "right") => {
    if (scrollRef.current) {
      const offset = direction === "left" ? -340 : 340;
      scrollRef.current.scrollBy({ left: offset, behavior: "smooth" });
    }
  };

  return (
    <section id="new-release-movies" className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 border-t border-white/5">
      {/* Section Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-6 pb-3 border-b border-white/10 gap-3">
        <div>
          <div className="flex items-center gap-2 text-amber-400 text-xs sm:text-sm font-semibold tracking-wider uppercase mb-1">
            <Sparkles className="w-4 h-4" />
            <span>Official Cinema API System</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight flex items-center gap-2.5">
            <Film className="w-5 h-5 text-amber-400" />
            New Release Movies
          </h2>
          <p className="text-xs text-neutral-400 mt-1">
            Official theatrical movie trailers from the API release system
          </p>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto">
          <div className="text-xs font-mono text-neutral-400 bg-white/5 border border-white/10 px-3 py-1.5 rounded-full">
            {movies.length} Releases
          </div>
          {movies.length > 0 && (
            <div className="flex items-center gap-1">
              <button
                onClick={() => scroll("left")}
                className="p-1.5 rounded-lg bg-white/5 hover:bg-white/15 text-white transition-colors cursor-pointer border border-white/10"
                aria-label="Scroll left"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button
                onClick={() => scroll("right")}
                className="p-1.5 rounded-lg bg-white/5 hover:bg-white/15 text-white transition-colors cursor-pointer border border-white/10"
                aria-label="Scroll right"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Loading Skeleton Strip */}
      {isLoading && (
        <div className="flex gap-4 overflow-hidden py-2">
          {[1, 2, 3, 4].map((i) => (
            <div
              key={i}
              className="w-72 sm:w-80 shrink-0 animate-pulse bg-neutral-900/60 rounded-2xl p-3 border border-white/5 flex flex-col gap-3"
            >
              <div className="w-full h-40 bg-neutral-800 rounded-xl" />
              <div className="h-4 bg-neutral-800 rounded w-3/4" />
              <div className="h-3 bg-neutral-800 rounded w-1/2" />
            </div>
          ))}
        </div>
      )}

      {/* Error state */}
      {error && !isLoading && (
        <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-6 text-center text-neutral-300 flex flex-col items-center gap-2">
          <AlertCircle className="w-6 h-6 text-red-400" />
          <p>{error}</p>
        </div>
      )}

      {/* Single Horizontal Strip / Row */}
      {!isLoading && !error && movies.length > 0 && (
        <div
          ref={scrollRef}
          className="flex items-stretch gap-4 sm:gap-5 overflow-x-auto no-scrollbar pb-3 pt-1 snap-x snap-mandatory"
        >
          {movies.map((movie) => (
            <div
              key={movie.id}
              id={`new-release-${movie.id}`}
              className="group relative w-72 sm:w-80 shrink-0 flex flex-col bg-[#0b0c10] border border-white/10 hover:border-amber-500/50 rounded-2xl overflow-hidden shadow-lg hover:shadow-amber-500/10 transition-all duration-300 snap-start"
            >
              {/* Poster Backdrop with Play Overlay */}
              <div className="relative w-full h-44 overflow-hidden bg-neutral-900">
                <img
                  src={movie.backdrop || movie.poster}
                  alt={movie.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src =
                      "https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?w=800&auto=format&fit=crop&q=80";
                  }}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#0b0c10] via-black/40 to-transparent" />

                {/* Rating Badge */}
                <div className="absolute top-2.5 left-2.5 flex items-center gap-1.5 bg-black/80 backdrop-blur-md text-amber-400 border border-amber-500/30 text-[11px] font-bold px-2 py-0.5 rounded-md shadow">
                  <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                  <span>{movie.rating.toFixed(1)}</span>
                </div>

                {/* Release Date Badge */}
                <div className="absolute top-2.5 right-2.5 flex items-center gap-1 bg-black/80 backdrop-blur-md text-neutral-200 border border-white/10 text-[10px] px-2 py-0.5 rounded-md">
                  <Calendar className="w-3 h-3 text-amber-400" />
                  <span>{movie.releaseDate}</span>
                </div>

                {/* Center Hover Play Icon */}
                <button
                  onClick={() => handleTrailerClick(movie)}
                  className="absolute inset-0 m-auto w-11 h-11 rounded-full bg-amber-500 text-black flex items-center justify-center shadow-xl opacity-90 group-hover:opacity-100 group-hover:scale-110 transition-all duration-300 cursor-pointer"
                  title="Play Official Trailer"
                >
                  <Play className="w-4 h-4 fill-current ml-0.5" />
                </button>
              </div>

              {/* Movie Info */}
              <div className="p-4 flex-1 flex flex-col justify-between gap-3">
                <div>
                  <div className="flex flex-wrap items-center gap-1 mb-1.5">
                    {movie.genres?.slice(0, 2).map((g) => (
                      <span
                        key={g}
                        className="text-[9px] uppercase font-bold tracking-wider px-1.5 py-0.5 rounded bg-white/5 border border-white/10 text-neutral-300"
                      >
                        {g}
                      </span>
                    ))}
                  </div>

                  <h3 className="text-sm sm:text-base font-bold text-white group-hover:text-amber-300 transition-colors line-clamp-1">
                    {movie.title}
                  </h3>

                  <p className="text-[11px] text-neutral-400 mt-1 line-clamp-2 leading-relaxed">
                    {movie.description}
                  </p>
                </div>

                {/* Footer Action */}
                <div className="pt-2.5 border-t border-white/5 flex items-center justify-between gap-2">
                  <button
                    onClick={() => handleTrailerClick(movie)}
                    className="flex-1 inline-flex items-center justify-center gap-1.5 bg-amber-500 hover:bg-amber-400 text-black font-bold text-xs py-2 px-3 rounded-lg transition-colors shadow-md cursor-pointer"
                  >
                    <Play className="w-3 h-3 fill-current" />
                    <span>Watch Trailer</span>
                  </button>

                  {onSelectMovie && (
                    <button
                      onClick={() => onSelectMovie(movie.id)}
                      className="inline-flex items-center justify-center bg-white/10 hover:bg-white/20 text-neutral-200 text-xs py-2 px-2.5 rounded-lg transition-colors cursor-pointer"
                      title="More Movie Details"
                    >
                      Details
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </section>
  );
};
