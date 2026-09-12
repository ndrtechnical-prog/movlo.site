import React, { useState, useEffect } from "react";
import { X, Star, Clock, Calendar, Film, ExternalLink, Play, Sparkles, AlertCircle, Loader2, Tv, ShieldCheck, Share2, Globe, Check, Code, Bookmark, BookmarkCheck, Zap, Download } from "lucide-react";
import { Movie, StreamingSource } from "../types";
import { fetchMovieDetails, fetchMovieSources, FALLBACK_POSTER, getCinemaPosterFallback } from "../lib/api";
import { setMovieMetadata, resetDefaultMetadata, generateMovieJsonLd } from "../lib/metaManager";
import { useWatchlist } from "../lib/watchlist";
import { triggerMonetagLink, FEATURED_DIRECT_AD_LINK } from "../lib/monetag";

interface MovieDetailsModalProps {
  movieId: number | null;
  onClose: () => void;
  onSelectMovie: (id: number) => void;
  region: string;
}

export const MovieDetailsModal: React.FC<MovieDetailsModalProps> = ({
  movieId,
  onClose,
  onSelectMovie,
  region
}) => {
  const [movie, setMovie] = useState<Movie | null>(null);
  const [sources, setSources] = useState<StreamingSource[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSourcesLoading, setIsSourcesLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showTrailer, setShowTrailer] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);
  const [showJsonLdModal, setShowJsonLdModal] = useState(false);
  const [copiedJsonLd, setCopiedJsonLd] = useState(false);
  const [savedToast, setSavedToast] = useState<string | null>(null);

  // Browser state Watchlist hook
  const { isInWatchlist, toggleWatchlist } = useWatchlist();
  const isSaved = movie ? isInWatchlist(movie.id) : false;

  const handleToggleWatchlist = () => {
    if (!movie) return;
    const nowInList = toggleWatchlist(movie);
    setSavedToast(nowInList ? "Added to My Watchlist!" : "Removed from Watchlist");
    setTimeout(() => setSavedToast(null), 2500);
  };

  // Fetch full details and sources whenever movieId changes
  useEffect(() => {
    if (!movieId) return;

    let isMounted = true;
    setIsLoading(true);
    setIsSourcesLoading(true);
    setError(null);
    setShowTrailer(false);

    // 9. Fetch movie details
    fetchMovieDetails(movieId)
      .then((data) => {
        if (isMounted) {
          setMovie(data);
          setIsLoading(false);
          // Apply dynamic title, meta description, and structured data
          setMovieMetadata(data, sources);
        }
      })
      .catch((err) => {
        if (isMounted) {
          console.error("Movie details error:", err);
          setError("Unable to load movie details right now.");
          setIsLoading(false);
        }
      });

    // 10. Fetch streaming sources
    fetchMovieSources(movieId, region)
      .then((res) => {
        if (isMounted) {
          const loadedSources = res.sources || [];
          setSources(loadedSources);
          setIsSourcesLoading(false);
          if (movie) {
            setMovieMetadata(movie, loadedSources);
          }
        }
      })
      .catch((err) => {
        if (isMounted) {
          console.error("Movie sources error:", err);
          setSources([]);
          setIsSourcesLoading(false);
        }
      });

    return () => {
      isMounted = false;
      resetDefaultMetadata();
    };
  }, [movieId, region]);

  // Keep metadata and JSON-LD in sync as movie and streaming sources arrive
  useEffect(() => {
    if (movie) {
      setMovieMetadata(movie, sources);
    }
  }, [movie, sources]);

  // Keyboard Escape listener
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [onClose]);

  if (!movieId) return null;

  // Group sources into Subscription, Rent, and Buy
  const subscriptionSources = sources.filter((s) => s.type === "sub" || s.type === "free");
  const rentSources = sources.filter((s) => s.type === "rent");
  const buySources = sources.filter((s) => s.type === "buy");

  // YouTube trailer parser
  const getYouTubeEmbedUrl = (url?: string) => {
    if (!url) return null;
    try {
      if (url.includes("youtube.com/watch")) {
        const videoId = new URL(url).searchParams.get("v");
        return videoId ? `https://www.youtube-nocookie.com/embed/${videoId}?autoplay=1` : null;
      }
      if (url.includes("youtu.be/")) {
        const videoId = url.split("youtu.be/")[1]?.split("?")[0];
        return videoId ? `https://www.youtube-nocookie.com/embed/${videoId}?autoplay=1` : null;
      }
      return null;
    } catch {
      return null;
    }
  };

  const trailerEmbed = getYouTubeEmbedUrl(movie?.trailer);

  const handleShare = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 md:p-6 overflow-y-auto bg-black/80 backdrop-blur-xl">
      {/* Modal Container */}
      <div className="relative w-full max-w-4xl bg-[#0a0a0e]/95 backdrop-blur-2xl border border-white/10 rounded-2xl sm:rounded-3xl shadow-2xl overflow-hidden my-auto max-h-[92vh] flex flex-col">
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-3 right-3 sm:top-4 sm:right-4 z-30 w-9 h-9 rounded-full bg-black/60 hover:bg-black/80 backdrop-blur-md text-neutral-300 hover:text-white border border-white/10 flex items-center justify-center transition-all cursor-pointer shadow-lg"
          aria-label="Close details"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Loading State */}
        {isLoading && (
          <div className="py-24 flex flex-col items-center justify-center gap-3 text-neutral-400">
            <Loader2 className="w-8 h-8 animate-spin text-orange-400" />
            <span className="text-xs sm:text-sm font-medium">Loading movie details from Watchmode...</span>
          </div>
        )}

        {/* Error State */}
        {error && !isLoading && (
          <div className="p-8 sm:p-12 text-center flex flex-col items-center justify-center gap-4">
            <AlertCircle className="w-10 h-10 text-red-400" />
            <h3 className="text-lg font-bold text-white">Movie Information Unavailable</h3>
            <p className="text-xs sm:text-sm text-neutral-400 max-w-md">{error}</p>
            <button
              onClick={onClose}
              className="px-5 py-2 rounded-lg bg-white/10 hover:bg-white/20 border border-white/10 text-xs font-semibold text-white transition-colors cursor-pointer"
            >
              Close
            </button>
          </div>
        )}

        {/* Loaded Content */}
        {!isLoading && !error && movie && (
          <div className="overflow-y-auto scrollbar-thin">
            {/* Backdrop Banner */}
            <div className="relative w-full h-48 sm:h-72 md:h-80 bg-neutral-900 overflow-hidden">
              <img
                src={movie.backdrop || movie.poster || getCinemaPosterFallback(movie.id)}
                alt={movie.title}
                referrerPolicy="no-referrer"
                onError={(e) => {
                  const target = e.target as HTMLImageElement;
                  if (target.src !== getCinemaPosterFallback(movie.id)) {
                    target.src = getCinemaPosterFallback(movie.id);
                  } else {
                    target.src = FALLBACK_POSTER;
                  }
                }}
                className="w-full h-full object-cover object-top opacity-40"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#0a0a0e] via-[#0a0a0e]/60 to-transparent" />
              <div className="absolute inset-0 bg-gradient-to-r from-[#0a0a0e] via-transparent to-transparent" />

              {/* Watchlist feedback toast */}
              {savedToast && (
                <div className="absolute top-4 left-1/2 -translate-x-1/2 z-50 px-4 py-2 rounded-full bg-black/90 border border-amber-500/40 text-amber-300 text-xs font-semibold shadow-2xl backdrop-blur-md flex items-center gap-2">
                  <BookmarkCheck className="w-4 h-4 text-amber-400" />
                  <span>{savedToast}</span>
                </div>
              )}

              {/* Action buttons on backdrop */}
              <div className="absolute bottom-4 left-4 sm:left-6 flex items-center gap-2 sm:gap-3 flex-wrap">
                {movie.trailer && (
                  <button
                    onClick={() => setShowTrailer(true)}
                    className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-amber-500 hover:bg-amber-400 text-black font-bold text-xs sm:text-sm shadow-lg shadow-amber-500/20 transition-all hover:scale-105 cursor-pointer"
                  >
                    <Play className="w-3.5 h-3.5 fill-current" />
                    <span>Watch Trailer</span>
                  </button>
                )}

                {/* 4K Mirror Stream Button */}
                <button
                  onClick={() => triggerMonetagLink(FEATURED_DIRECT_AD_LINK)}
                  className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-amber-500/20 hover:bg-amber-500/30 border border-amber-500/40 text-amber-300 hover:text-amber-200 text-xs sm:text-sm font-bold transition-all hover:scale-105 cursor-pointer shadow-sm backdrop-blur-md"
                  title="Stream Full Movie on 4K Mirror Server"
                >
                  <Zap className="w-3.5 h-3.5 text-amber-400 fill-current" />
                  <span>Stream 4K Mirror</span>
                  <ExternalLink className="w-3 h-3 opacity-70" />
                </button>

                {/* My Watchlist Save Button */}
                <button
                  onClick={handleToggleWatchlist}
                  className={`inline-flex items-center gap-2 px-3.5 py-2 rounded-lg backdrop-blur-md border text-xs sm:text-sm font-semibold transition-all hover:scale-105 cursor-pointer ${
                    isSaved
                      ? "bg-amber-500/20 border-amber-500/40 text-amber-300 shadow-md shadow-amber-500/10"
                      : "bg-black/60 hover:bg-black/80 border-white/15 text-white"
                  }`}
                  title={isSaved ? "Remove from Watchlist" : "Save to My Watchlist"}
                >
                  {isSaved ? (
                    <BookmarkCheck className="w-4 h-4 text-amber-400" />
                  ) : (
                    <Bookmark className="w-4 h-4 text-neutral-300" />
                  )}
                  <span>{isSaved ? "In Watchlist" : "Add to Watchlist"}</span>
                </button>

                <button
                  onClick={handleShare}
                  className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg bg-black/60 hover:bg-black/80 backdrop-blur-md border border-white/10 text-white text-xs font-semibold transition-all cursor-pointer"
                >
                  <Share2 className="w-3.5 h-3.5" />
                  <span>{copiedLink ? "Link Copied!" : "Share"}</span>
                </button>
              </div>
            </div>

            {/* Main Content Area */}
            <div className="p-4 sm:p-6 md:p-8 space-y-6">
              {/* Header Details */}
              <div className="flex flex-col sm:flex-row gap-4 sm:gap-6 items-start">
                {/* Poster Thumbnail */}
                <div className="w-24 sm:w-36 md:w-44 aspect-[2/3] shrink-0 rounded-xl overflow-hidden border border-white/10 shadow-2xl bg-neutral-900 hidden sm:block">
                  <img
                    src={movie.poster || getCinemaPosterFallback(movie.id)}
                    alt={movie.title}
                    referrerPolicy="no-referrer"
                    onError={(e) => {
                      const target = e.target as HTMLImageElement;
                      if (target.src !== getCinemaPosterFallback(movie.id)) {
                        target.src = getCinemaPosterFallback(movie.id);
                      } else {
                        target.src = FALLBACK_POSTER;
                      }
                    }}
                    className="w-full h-full object-cover"
                  />
                </div>

                {/* Meta details */}
                <div className="flex-1 space-y-3">
                  <div className="flex flex-wrap items-center gap-2">
                    {movie.usRating && (
                      <span className="px-2 py-0.5 rounded border border-orange-500/40 text-orange-400 text-xs font-bold uppercase">
                        {movie.usRating}
                      </span>
                    )}
                    <span className="capitalize px-2 py-0.5 rounded bg-white/10 text-neutral-300 text-xs font-medium border border-white/10 backdrop-blur-sm">
                      {movie.type || "Movie"}
                    </span>
                    <span className="text-neutral-500 text-xs">• Watchmode ID: {movie.id}</span>
                  </div>

                  <h2 className="font-['Syne',sans-serif] text-2xl sm:text-3xl md:text-4xl font-extrabold text-white tracking-tight">
                    {movie.title}
                  </h2>

                  {/* Rating / Year / Duration Badges */}
                  <div className="flex flex-wrap items-center gap-3 sm:gap-4 text-xs sm:text-sm text-neutral-300">
                    {movie.rating && (
                      <div className="flex items-center gap-1 text-orange-400 font-bold bg-orange-500/10 px-2.5 py-1 rounded-lg border border-orange-500/20 backdrop-blur-md">
                        <Star className="w-4 h-4 fill-current" />
                        <span>{movie.rating.toFixed(1)}</span>
                        <span className="text-neutral-500 font-normal">/ 10</span>
                      </div>
                    )}

                    {movie.year && (
                      <div className="flex items-center gap-1.5">
                        <Calendar className="w-4 h-4 text-neutral-400" />
                        <span>{movie.year}</span>
                      </div>
                    )}

                    {movie.runtime && (
                      <div className="flex items-center gap-1.5">
                        <Clock className="w-4 h-4 text-neutral-400" />
                        <span>{movie.runtime} min</span>
                      </div>
                    )}
                  </div>

                  {/* Genres */}
                  {movie.genres && movie.genres.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 pt-1">
                      {movie.genres.map((genre) => (
                        <span
                          key={genre}
                          className="px-2.5 py-1 rounded-md bg-white/5 border border-white/10 text-xs text-neutral-300 font-medium backdrop-blur-sm"
                        >
                          {genre}
                        </span>
                      ))}
                    </div>
                  )}

                  {/* Plot overview */}
                  <div className="pt-2">
                    <h4 className="text-xs uppercase font-bold tracking-wider text-neutral-400 mb-1.5">
                      Overview
                    </h4>
                    <p className="text-xs sm:text-sm text-neutral-300 leading-relaxed">
                      {movie.description || "No plot description available for this title."}
                    </p>
                  </div>
                </div>
              </div>

              {/* 10. Streaming Sources ("Where to Watch") */}
              <div className="pt-4 border-t border-white/10 space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Tv className="w-5 h-5 text-orange-400" />
                    <h3 className="text-base sm:text-lg font-bold text-white">
                      Where to Watch ({region})
                    </h3>
                  </div>
                  <div className="flex items-center gap-1.5 text-[11px] text-neutral-400">
                    <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Verified Legal Services</span>
                  </div>
                </div>

                {isSourcesLoading ? (
                  <div className="p-6 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center gap-2 text-xs text-neutral-400 backdrop-blur-md">
                    <Loader2 className="w-4 h-4 animate-spin text-orange-400" />
                    <span>Loading streaming options for {region}...</span>
                  </div>
                ) : sources.length === 0 ? (
                  <div className="p-6 rounded-xl bg-white/5 border border-white/10 text-center text-xs text-neutral-400 backdrop-blur-md">
                    No verified streaming services currently reported for this title in {region}. Check other regions or digital storefronts.
                  </div>
                ) : (
                  <div className="space-y-4">
                    {/* Subscription */}
                    {subscriptionSources.length > 0 && (
                      <div>
                        <h4 className="text-xs font-semibold text-neutral-400 uppercase tracking-wider mb-2">
                          Stream (Subscription & Free)
                        </h4>
                        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2 sm:gap-3">
                          {subscriptionSources.map((source, idx) => (
                            <a
                              key={`${source.sourceId}-${idx}`}
                              href={source.webUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="p-3 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 hover:border-orange-500/40 backdrop-blur-md flex items-center justify-between transition-all group cursor-pointer shadow-sm"
                            >
                              <div className="flex flex-col">
                                <span className="text-xs sm:text-sm font-bold text-white group-hover:text-orange-400 transition-colors">
                                  {source.name}
                                </span>
                                <span className="text-[10px] text-emerald-400 font-semibold uppercase">
                                  {source.type === "free" ? "Free" : "Included in Plan"}
                                </span>
                              </div>
                              <ExternalLink className="w-4 h-4 text-neutral-400 group-hover:text-orange-400 group-hover:translate-x-0.5 transition-all" />
                            </a>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Rent / Buy */}
                    {(rentSources.length > 0 || buySources.length > 0) && (
                      <div>
                        <h4 className="text-xs font-semibold text-neutral-400 uppercase tracking-wider mb-2">
                          Rent / Buy
                        </h4>
                        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2 sm:gap-3">
                          {[...rentSources, ...buySources].map((source, idx) => (
                            <a
                              key={`${source.sourceId}-${source.type}-${idx}`}
                              href={source.webUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="p-3 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 hover:border-orange-500/40 backdrop-blur-md flex items-center justify-between transition-all group cursor-pointer shadow-sm"
                            >
                              <div className="flex flex-col">
                                <span className="text-xs sm:text-sm font-bold text-white group-hover:text-orange-400 transition-colors">
                                  {source.name}
                                </span>
                                <span className="text-[10px] text-neutral-400">
                                  <span className="capitalize font-semibold text-neutral-300">{source.type}</span>
                                  {source.displayPrice && ` • ${source.displayPrice}`}
                                  {source.format && ` (${source.format})`}
                                </span>
                              </div>
                              <ExternalLink className="w-4 h-4 text-neutral-400 group-hover:text-orange-400 group-hover:translate-x-0.5 transition-all" />
                            </a>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* Sponsored High-Speed Mirror Option */}
                <div className="p-3 sm:p-4 rounded-xl bg-gradient-to-r from-amber-500/10 via-orange-500/5 to-transparent border border-amber-500/30 flex items-center justify-between gap-4">
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div className="w-8 h-8 rounded-lg bg-amber-500/20 text-amber-400 flex items-center justify-center flex-shrink-0">
                      <Zap className="w-4 h-4 fill-current" />
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <span className="text-xs sm:text-sm font-bold text-white">Ultra 4K Fast Mirror Server</span>
                        <span className="px-1.5 py-0.2 rounded text-[9px] font-black uppercase bg-amber-500 text-black">SPONSORED</span>
                      </div>
                      <p className="text-[11px] text-neutral-400 truncate">High speed cloud stream & direct download link</p>
                    </div>
                  </div>
                  <button
                    onClick={() => triggerMonetagLink(FEATURED_DIRECT_AD_LINK)}
                    className="px-3.5 py-1.5 rounded-lg bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-black font-extrabold text-xs flex items-center gap-1 transition-all hover:scale-105 cursor-pointer flex-shrink-0 shadow-md shadow-amber-500/20"
                  >
                    <span>Stream 4K</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </button>
                </div>

                {/* Dynamic SEO & JSON-LD Structured Data Indicator */}
                <div className="flex flex-wrap items-center justify-between gap-3 p-3 rounded-xl bg-orange-950/20 border border-orange-500/20 backdrop-blur-sm text-xs">
                  <div className="flex items-center gap-2">
                    <Globe className="w-4 h-4 text-orange-400 shrink-0" />
                    <div>
                      <span className="font-semibold text-white">Search Engine Dynamic Meta & JSON-LD Active</span>
                      <p className="text-[11px] text-neutral-400">Document title, plot meta description, and Schema.org Movie structured data are live in &lt;head&gt;.</p>
                    </div>
                  </div>
                  <button
                    onClick={() => setShowJsonLdModal(true)}
                    className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-orange-500/20 hover:bg-orange-500/30 text-orange-300 border border-orange-500/30 font-medium text-[11px] transition-colors cursor-pointer"
                  >
                    <Code className="w-3.5 h-3.5" />
                    <span>View JSON-LD Schema</span>
                  </button>
                </div>

                {/* 33. Watchmode limitation note */}
                <p className="text-[11px] text-neutral-500 italic pt-1">
                  Availability data provided by Watchmode API. Links redirect to official provider websites. MOVLO does not host or scrape unlicensed video streams.
                </p>
              </div>

              {/* Similar Titles (if available) */}
              {movie.similarTitles && movie.similarTitles.length > 0 && (
                <div className="pt-4 border-t border-white/10">
                  <h3 className="text-sm font-bold text-white mb-3 flex items-center gap-1.5">
                    <Sparkles className="w-4 h-4 text-orange-400" />
                    <span>Similar Titles</span>
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {movie.similarTitles.map((simId) => (
                      <button
                        key={simId}
                        onClick={() => onSelectMovie(simId)}
                        className="px-3 py-1.5 rounded-lg bg-white/5 hover:bg-white/15 border border-white/10 text-xs font-semibold text-neutral-300 hover:text-white transition-colors cursor-pointer backdrop-blur-md"
                      >
                        Watchmode #{simId}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Trailer Modal Overlay - Premium Top-Aligned Cinema Player */}
        {showTrailer && trailerEmbed && (
          <div className="fixed inset-0 z-60 bg-black/95 backdrop-blur-2xl flex flex-col items-center justify-start pt-3 sm:pt-6 md:pt-8 pb-12 px-3 sm:px-6 overflow-y-auto transform-gpu animate-in fade-in duration-200">
            <div className="fixed inset-0 bg-gradient-to-b from-amber-950/20 via-black/80 to-black/95 pointer-events-auto" onClick={() => setShowTrailer(false)} />
            <div className="relative z-10 w-full max-w-5xl flex flex-col items-center animate-in fade-in slide-in-from-top-3 duration-300">
              {/* Clean Title Header: VIP Cinema */}
              <div className="w-full flex items-center justify-between pb-2 sm:pb-3 px-1">
                <div className="flex items-center gap-2 sm:gap-3 min-w-0 pr-2">
                  <span className="hidden sm:inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-amber-500/20 border border-amber-500/40 text-amber-300 text-[11px] font-extrabold uppercase shrink-0">
                    <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-ping" />
                    TRAILER 4K
                  </span>
                  <h3 className="font-lumos text-base sm:text-xl md:text-2xl font-black text-transparent bg-clip-text bg-gradient-to-r from-white via-amber-100 to-amber-300 tracking-tight truncate">
                    {movie?.title}
                  </h3>
                </div>
                <button
                  onClick={() => setShowTrailer(false)}
                  className="p-2 sm:p-2.5 rounded-xl bg-neutral-900/90 hover:bg-neutral-800 text-neutral-300 hover:text-white border border-white/15 hover:border-amber-500/50 transition-all cursor-pointer shadow-lg hover:rotate-90 duration-200"
                  title="Close (Esc)"
                >
                  <X className="w-4 h-4 sm:w-5 sm:h-5 text-amber-400" />
                </button>
              </div>

              {/* 16:9 Video Box with Cinema Ambient Glow */}
              <div className="relative w-full group">
                <div className="absolute -inset-1 rounded-3xl bg-gradient-to-r from-amber-500/20 via-orange-500/10 to-amber-600/20 blur-xl opacity-75 group-hover:opacity-100 transition-opacity pointer-events-none" />
                <div className="relative w-full aspect-video bg-black rounded-2xl sm:rounded-3xl overflow-hidden shadow-2xl border border-amber-500/30 flex items-center justify-center transform-gpu">
                  <iframe
                    src={trailerEmbed}
                    title={`${movie?.title || "Movie"}`}
                    className="w-full h-full border-0 transform-gpu"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                    loading="eager"
                  />
                </div>
              </div>

              {/* Monetag Action Buttons under trailer */}
              <div className="w-full pt-3 flex flex-wrap items-center justify-center gap-2">
                <button
                  onClick={() => triggerMonetagLink(FEATURED_DIRECT_AD_LINK)}
                  className="px-3.5 py-1.5 rounded-xl bg-amber-500/20 hover:bg-amber-500/30 border border-amber-500/40 text-amber-300 hover:text-amber-200 text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer shadow-sm hover:scale-105 active:scale-95"
                >
                  <Zap className="w-3.5 h-3.5 text-amber-400 fill-current" />
                  <span>Stream 4K Full Movie</span>
                  <ExternalLink className="w-3 h-3 opacity-75" />
                </button>
                <button
                  onClick={() => triggerMonetagLink(FEATURED_DIRECT_AD_LINK)}
                  className="px-3.5 py-1.5 rounded-xl bg-white/10 hover:bg-white/15 border border-white/15 text-neutral-200 hover:text-white text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer shadow-sm hover:scale-105 active:scale-95"
                >
                  <Download className="w-3.5 h-3.5 text-amber-400" />
                  <span>Download 1080p</span>
                  <ExternalLink className="w-3 h-3 opacity-75" />
                </button>
              </div>

              {/* Close Button */}
              <div className="pt-4 sm:pt-6 flex items-center justify-center">
                <button
                  onClick={() => setShowTrailer(false)}
                  className="px-8 py-3 rounded-full bg-gradient-to-r from-neutral-900 to-black hover:from-neutral-800 hover:to-neutral-900 text-white font-bold text-xs sm:text-sm flex items-center gap-2 border border-amber-500/30 hover:border-amber-500 transition-all cursor-pointer shadow-xl hover:scale-105 active:scale-95 group tracking-wider"
                >
                  <X className="w-4 h-4 text-amber-400 group-hover:rotate-90 transition-transform duration-200" />
                  <span>Close Trailer</span>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* JSON-LD Structured Data Viewer Modal */}
        {showJsonLdModal && movie && (
          <div className="fixed inset-0 z-60 bg-black/90 backdrop-blur-xl flex flex-col items-center justify-center p-4">
            <div className="w-full max-w-2xl bg-[#0e0f15] border border-white/15 rounded-2xl shadow-2xl p-5 sm:p-6 flex flex-col max-h-[85vh]">
              <div className="flex items-center justify-between pb-4 border-b border-white/10">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-lg bg-orange-500/20 text-orange-400 flex items-center justify-center">
                    <Code className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="text-sm sm:text-base font-bold text-white">Schema.org Movie JSON-LD</h3>
                    <p className="text-[11px] text-neutral-400">Structured data currently active in &lt;head&gt; for Google Indexing</p>
                  </div>
                </div>
                <button
                  onClick={() => setShowJsonLdModal(false)}
                  className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-neutral-400 hover:text-white transition-colors cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Dynamic Metadata Summary */}
              <div className="py-3 space-y-2 text-xs border-b border-white/10 text-neutral-300">
                <div>
                  <span className="text-neutral-500 font-semibold">Active Document Title: </span>
                  <span className="text-orange-400 font-mono font-medium">{document.title}</span>
                </div>
                <div>
                  <span className="text-neutral-500 font-semibold">Active Meta Description: </span>
                  <span className="text-neutral-300 italic">
                    {document.querySelector('meta[name="description"]')?.getAttribute("content") || movie.description}
                  </span>
                </div>
              </div>

              {/* JSON-LD Code Block */}
              <div className="flex-1 overflow-y-auto my-3 p-3 bg-black/60 rounded-xl border border-white/10 font-mono text-[11px] text-green-400 leading-relaxed scrollbar-thin">
                <pre>{JSON.stringify(generateMovieJsonLd(movie, sources), null, 2)}</pre>
              </div>

              <div className="flex items-center justify-between pt-2">
                <span className="text-[11px] text-neutral-500">Target Type: https://schema.org/Movie</span>
                <button
                  onClick={() => {
                    navigator.clipboard.writeText(JSON.stringify(generateMovieJsonLd(movie, sources), null, 2));
                    setCopiedJsonLd(true);
                    setTimeout(() => setCopiedJsonLd(false), 2000);
                  }}
                  className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-orange-500 hover:bg-orange-600 text-black font-bold text-xs transition-colors cursor-pointer"
                >
                  {copiedJsonLd ? (
                    <>
                      <Check className="w-3.5 h-3.5" />
                      <span>Copied to Clipboard!</span>
                    </>
                  ) : (
                    <>
                      <Share2 className="w-3.5 h-3.5" />
                      <span>Copy JSON-LD</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
