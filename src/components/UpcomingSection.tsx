import React, { useEffect, useState } from "react";
import { Film, Calendar, Star, Play, Sparkles, AlertCircle } from "lucide-react";
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
          setError("Unable to load upcoming trailers at this time.");
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

  return (
    <section id="upcoming" className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      {/* Section Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-8 pb-4 border-b border-white/10 gap-4">
        <div>
          <div className="flex items-center gap-2 text-amber-400 text-xs sm:text-sm font-semibold tracking-wider uppercase mb-1">
            <Sparkles className="w-4 h-4" />
            <span>API Powered Anticipated Titles</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight flex items-center gap-2.5">
            <Film className="w-6 h-6 text-amber-400" />
            UpComing Trailers
          </h2>
          <p className="text-sm text-neutral-400 mt-1">
            The next 5 major upcoming cinematic blockbusters with official ratings & trailers
          </p>
        </div>
        <div className="text-xs font-mono text-neutral-400 bg-white/5 border border-white/10 px-3 py-1.5 rounded-full w-fit">
          5 Titles Scheduled
        </div>
      </div>

      {/* Loading Skeleton */}
      {isLoading && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3, 4, 5].map((i) => (
            <div
              key={i}
              className="animate-pulse bg-neutral-900/60 rounded-2xl p-4 border border-white/5 flex flex-col gap-3"
            >
              <div className="w-full h-48 bg-neutral-800 rounded-xl" />
              <div className="h-5 bg-neutral-800 rounded w-3/4 mt-2" />
              <div className="h-4 bg-neutral-800 rounded w-1/2" />
              <div className="h-10 bg-neutral-800 rounded-lg mt-auto" />
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

      {/* 5 Upcoming Movies Showcase */}
      {!isLoading && !error && movies.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {movies.map((movie, idx) => (
            <div
              key={movie.id}
              id={`upcoming-card-${movie.id}`}
              className="group relative flex flex-col bg-[#0b0c10] border border-white/10 hover:border-amber-500/50 rounded-2xl overflow-hidden shadow-lg hover:shadow-amber-500/10 transition-all duration-300"
            >
              {/* Poster Backdrop with Play Overlay */}
              <div className="relative w-full h-52 overflow-hidden bg-neutral-900">
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
                <div className="absolute top-3 left-3 flex items-center gap-1.5 bg-black/80 backdrop-blur-md text-amber-400 border border-amber-500/30 text-xs font-bold px-2.5 py-1 rounded-lg shadow">
                  <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                  <span>{movie.rating.toFixed(1)}</span>
                  <span className="text-[10px] text-neutral-400 font-normal">/ 10</span>
                </div>

                {/* Release Date Badge */}
                <div className="absolute top-3 right-3 flex items-center gap-1.5 bg-black/80 backdrop-blur-md text-neutral-200 border border-white/10 text-xs px-2.5 py-1 rounded-lg">
                  <Calendar className="w-3.5 h-3.5 text-amber-400" />
                  <span>{movie.releaseDate}</span>
                </div>

                {/* Center Hover Play Icon */}
                <button
                  onClick={() => handleTrailerClick(movie)}
                  className="absolute inset-0 m-auto w-12 h-12 rounded-full bg-amber-500 text-black flex items-center justify-center shadow-2xl opacity-90 group-hover:opacity-100 group-hover:scale-110 transition-all duration-300"
                  title="Play Official Trailer"
                >
                  <Play className="w-5 h-5 fill-current ml-0.5" />
                </button>
              </div>

              {/* Movie Info */}
              <div className="p-5 flex-1 flex flex-col justify-between gap-4">
                <div>
                  <div className="flex flex-wrap items-center gap-1.5 mb-2">
                    {movie.genres.slice(0, 3).map((g) => (
                      <span
                        key={g}
                        className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded bg-white/5 border border-white/10 text-neutral-300"
                      >
                        {g}
                      </span>
                    ))}
                  </div>

                  <h3 className="text-lg font-bold text-white group-hover:text-amber-300 transition-colors line-clamp-1">
                    {movie.title}
                  </h3>

                  <p className="text-xs text-neutral-400 mt-2 line-clamp-3 leading-relaxed">
                    {movie.description}
                  </p>
                </div>

                {/* Footer Action */}
                <div className="pt-3 border-t border-white/5 flex items-center justify-between gap-2">
                  <button
                    onClick={() => handleTrailerClick(movie)}
                    className="flex-1 inline-flex items-center justify-center gap-2 bg-amber-500 hover:bg-amber-400 text-black font-bold text-xs py-2.5 px-4 rounded-xl transition-colors shadow-md"
                  >
                    <Play className="w-3.5 h-3.5 fill-current" />
                    <span>Watch Trailer</span>
                  </button>

                  {onSelectMovie && (
                    <button
                      onClick={() => onSelectMovie(movie.id)}
                      className="inline-flex items-center justify-center bg-white/10 hover:bg-white/20 text-neutral-200 text-xs py-2.5 px-3 rounded-xl transition-colors"
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
