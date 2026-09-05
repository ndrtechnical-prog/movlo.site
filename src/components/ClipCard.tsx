import React, { useState } from "react";
import { Play, Eye, Star, Sparkles, Film, Clock } from "lucide-react";
import { MovieClip } from "../types";
import { FALLBACK_POSTER, getCinemaPosterFallback } from "../lib/api";

interface ClipCardProps {
  clip: MovieClip;
  onPlayClip: (clip: MovieClip) => void;
  onSelectMovie?: (movieId: number) => void;
  isCompact?: boolean;
}

export const ClipCard: React.FC<ClipCardProps> = ({
  clip,
  onPlayClip,
  onSelectMovie,
  isCompact = false
}) => {
  const [imgSrc, setImgSrc] = useState(clip.thumbnail || clip.backdrop || getCinemaPosterFallback(clip.id));
  const [hasError, setHasError] = useState(false);

  const formatViews = (views: number) => {
    if (views >= 1000000) return `${(views / 1000000).toFixed(1)}M`;
    if (views >= 1000) return `${(views / 1000).toFixed(0)}K`;
    return String(views);
  };

  return (
    <div
      id={`clip-card-${clip.id}`}
      onClick={() => onPlayClip(clip)}
      className="group relative bg-neutral-900/90 border border-white/10 hover:border-orange-500/60 rounded-2xl overflow-hidden cursor-pointer transition-all duration-300 hover:shadow-2xl hover:shadow-orange-950/40 hover:-translate-y-1 flex flex-col"
    >
      {/* Thumbnail Banner with strict 16:9 aspect ratio */}
      <div className="relative w-full aspect-[16/9] bg-neutral-950 overflow-hidden">
        <img
          src={imgSrc}
          alt={`${clip.movieTitle} - ${clip.clipTitle}`}
          referrerPolicy="no-referrer"
          onError={() => {
            if (!hasError) {
              setHasError(true);
              setImgSrc(getCinemaPosterFallback(clip.id));
            } else {
              setImgSrc(FALLBACK_POSTER);
            }
          }}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 ease-out brightness-90 group-hover:brightness-100"
        />

        {/* Subtle Gradient Shadow */}
        <div className="absolute inset-0 bg-gradient-to-t from-neutral-950 via-neutral-950/20 to-transparent" />

        {/* Duration badge */}
        <div className="absolute top-2.5 right-2.5 flex items-center pointer-events-none">
          <div className="flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-semibold bg-black/75 backdrop-blur-md text-neutral-200 border border-white/10">
            <Clock className="w-3 h-3 text-orange-400" />
            <span>{clip.duration}</span>
          </div>
        </div>

        {/* Center Play Button with hover glow */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div className="w-12 h-12 rounded-full bg-orange-500/95 text-black flex items-center justify-center shadow-xl shadow-orange-500/30 group-hover:scale-110 group-hover:bg-orange-400 transition-all duration-300">
            <Play className="w-5 h-5 fill-current translate-x-0.5" />
          </div>
        </div>
      </div>

      {/* Card Info Details - Clean Movie Title Only */}
      <div className="p-3 sm:p-3.5 flex-1 flex flex-col justify-between">
        <div>
          <h3 className="text-sm sm:text-base font-bold text-neutral-100 line-clamp-1 group-hover:text-orange-400 transition-colors">
            {clip.movieTitle}
          </h3>
        </div>

        <div className="pt-2 mt-2 border-t border-white/5 flex items-center justify-between text-xs text-neutral-400">
          <span className="text-[11px] text-neutral-500">{clip.year}</span>
          <span className="text-[11px] font-bold text-orange-400 group-hover:translate-x-0.5 transition-transform flex items-center gap-1">
            <span>Play</span>
            <span>→</span>
          </span>
        </div>
      </div>
    </div>
  );
};
