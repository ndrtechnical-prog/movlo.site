import React, { useState } from "react";
import { Crown, Sparkles, Play, Shield, Volume2, Film, CheckCircle } from "lucide-react";
import { MovieClip } from "../types";

interface PremiumSectionProps {
  clips: MovieClip[];
  onPlayClip: (clip: MovieClip) => void;
  onOpenMovieDetails?: (movieId: number) => void;
}

const VIP_FILTERS = [
  { id: "all", label: "All VIP 4K" },
  { id: "imax", label: "IMAX Enhanced" },
  { id: "dolby", label: "Dolby Atmos" },
  { id: "directors", label: "Director's Cut" }
];

export const PremiumSection: React.FC<PremiumSectionProps> = ({
  clips,
  onPlayClip,
  onOpenMovieDetails
}) => {
  const [activeFilter, setActiveFilter] = useState("all");

  // Select high-quality 4K UHD clips for the VIP section
  const vipClips = clips.filter((c) => {
    if (activeFilter === "imax") return c.quality === "4K UHD" || c.clipTitle.toLowerCase().includes("docking") || c.clipTitle.toLowerCase().includes("worm");
    if (activeFilter === "dolby") return c.rating >= 9.0;
    if (activeFilter === "directors") return c.year >= 2023 || c.director;
    return true;
  }).slice(0, 6);

  return (
    <section id="premium-vip" className="relative py-14 sm:py-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto overflow-hidden">
      {/* Ambient background glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-5xl h-96 bg-gradient-to-r from-amber-500/10 via-orange-500/5 to-transparent blur-3xl pointer-events-none -z-10" />

      {/* Header Container */}
      <div className="relative rounded-3xl p-6 sm:p-10 border border-amber-500/30 bg-gradient-to-b from-[#131008] via-[#090a0f] to-[#090a0f] shadow-2xl shadow-amber-950/20">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-8 border-b border-white/10">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <span className="font-lumos bg-gradient-to-r from-amber-400 to-orange-500 text-black font-extrabold text-[11px] px-3 py-1 rounded-full uppercase tracking-widest flex items-center gap-1.5 shadow-md shadow-amber-500/20">
                <Crown className="w-3.5 h-3.5 fill-black" />
                <span>MOVLO VIP CINEMA</span>
              </span>
              <span className="text-[11px] font-semibold text-amber-300/80 px-2.5 py-0.5 rounded-full bg-amber-500/10 border border-amber-500/20 flex items-center gap-1">
                <Sparkles className="w-3 h-3 text-amber-400" />
                <span>4K IMAX & Master Edition</span>
              </span>
            </div>

            <h2 className="font-lumos text-2xl sm:text-4xl font-black text-neutral-100 tracking-wide">
              Ultra 4K VIP Premiere Collection
            </h2>

            <p className="text-xs sm:text-sm text-neutral-400 max-w-xl leading-relaxed">
              Experience the highest fidelity cinema cuts with uncompressed 4K master visual rendering, IMAX aspect ratio framing, and Dolby TrueHD Atmos surround audio.
            </p>
          </div>

          {/* Filter Pills */}
          <div className="flex flex-wrap items-center gap-2">
            {VIP_FILTERS.map((f) => (
              <button
                key={f.id}
                onClick={() => setActiveFilter(f.id)}
                className={`font-lumos text-xs px-4 py-2 rounded-xl transition-all cursor-pointer font-bold ${
                  activeFilter === f.id
                    ? "bg-amber-500 text-black shadow-lg shadow-amber-500/20"
                    : "bg-white/5 hover:bg-white/10 text-neutral-300 border border-white/10"
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>
        </div>

        {/* VIP Clips Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 sm:gap-6 pt-8">
          {vipClips.map((clip) => (
            <div
              key={clip.id}
              onClick={() => onPlayClip(clip)}
              className="group relative rounded-2xl overflow-hidden bg-black/60 border border-amber-500/20 hover:border-amber-400/60 transition-all duration-300 hover:shadow-2xl hover:shadow-amber-500/15 flex flex-col cursor-pointer"
            >
              {/* Thumbnail Container (16:9) */}
              <div className="relative aspect-video w-full overflow-hidden bg-neutral-900">
                <img
                  src={clip.thumbnail || clip.backdrop}
                  alt={clip.movieTitle}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />

                {/* Dark Vignette Overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-black via-black/30 to-transparent" />

                {/* Top Badges */}
                <div className="absolute top-3 left-3 right-3 flex items-center justify-between">
                  <span className="font-lumos bg-black/80 backdrop-blur-md text-amber-400 border border-amber-500/40 text-[10px] font-black px-2.5 py-0.5 rounded-md uppercase tracking-wider">
                    {clip.quality}
                  </span>

                  <span className="bg-amber-500/90 text-black font-extrabold text-[10px] px-2 py-0.5 rounded-md uppercase tracking-wider flex items-center gap-1 shadow">
                    <Volume2 className="w-3 h-3" />
                    <span>Dolby 7.1</span>
                  </span>
                </div>

                {/* Center Hover Play Button */}
                <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-black/40">
                  <div className="w-13 h-13 rounded-full bg-amber-500 text-black flex items-center justify-center shadow-xl shadow-amber-500/30 group-hover:scale-110 transition-transform">
                    <Play className="w-6 h-6 fill-black ml-0.5" />
                  </div>
                </div>

                {/* Bottom Duration */}
                <span className="absolute bottom-3 right-3 text-[11px] bg-black/85 backdrop-blur-md text-neutral-200 px-2 py-0.5 rounded-md font-mono border border-white/10">
                  {clip.duration}
                </span>
              </div>

              {/* Card Body — Clean Title Only */}
              <div className="p-4 flex items-center justify-between gap-3 bg-[#0a0a0e]">
                <div className="min-w-0 flex-1">
                  <h3 className="font-lumos text-base sm:text-lg font-black text-white group-hover:text-amber-300 transition-colors truncate">
                    {clip.movieTitle}
                  </h3>
                  <div className="flex items-center gap-2 text-[11px] text-neutral-400 mt-0.5">
                    <span className="text-amber-400 font-semibold">{clip.genre}</span>
                    <span>•</span>
                    <span>★ {clip.rating ? clip.rating.toFixed(1) : "9.5"}</span>
                    <span>•</span>
                    <span>{clip.views ? clip.views.toLocaleString() : "2.4M"} views</span>
                  </div>
                </div>

                <div className="shrink-0">
                  <span className="font-lumos text-[10px] font-bold uppercase tracking-wider text-amber-400 px-2.5 py-1 rounded-lg bg-amber-500/10 border border-amber-500/30 group-hover:bg-amber-500 group-hover:text-black transition-colors">
                    Play 4K
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Bottom VIP Perks Bar */}
        <div className="mt-8 pt-6 border-t border-white/10 grid grid-cols-1 sm:grid-cols-3 gap-4 text-center sm:text-left">
          <div className="flex items-center gap-3 justify-center sm:justify-start">
            <div className="w-8 h-8 rounded-full bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400 shrink-0">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <h4 className="font-lumos text-xs font-bold text-neutral-200">Native 4K Master Feeds</h4>
              <p className="text-[11px] text-neutral-400">Pristine color grading with zero compression artifacts</p>
            </div>
          </div>

          <div className="flex items-center gap-3 justify-center sm:justify-start">
            <div className="w-8 h-8 rounded-full bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400 shrink-0">
              <Volume2 className="w-4 h-4" />
            </div>
            <div>
              <h4 className="font-lumos text-xs font-bold text-neutral-200">Dolby Atmos Surround</h4>
              <p className="text-[11px] text-neutral-400">Dynamic spatial acoustics optimized for headphones & TV</p>
            </div>
          </div>

          <div className="flex items-center gap-3 justify-center sm:justify-start">
            <div className="w-8 h-8 rounded-full bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400 shrink-0">
              <Shield className="w-4 h-4" />
            </div>
            <div>
              <h4 className="font-lumos text-xs font-bold text-neutral-200">Official Studio Licenses</h4>
              <p className="text-[11px] text-neutral-400">Full compliance with global streaming distribution</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
