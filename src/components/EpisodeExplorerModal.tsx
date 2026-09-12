import React, { useState, useMemo } from "react";
import { X, Play, Search, Star, Film, Sparkles, Tv, Layers, ArrowRight, Share2, Check } from "lucide-react";
import { DramaSeries, SeriesEpisode } from "../types";

interface EpisodeExplorerModalProps {
  series: DramaSeries | null;
  onClose: () => void;
  onPlayEpisode: (episode: SeriesEpisode, allEpisodes: SeriesEpisode[]) => void;
}

export const EpisodeExplorerModal: React.FC<EpisodeExplorerModalProps> = ({
  series,
  onClose,
  onPlayEpisode
}) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedRange, setSelectedRange] = useState<string>("all");
  const [copied, setCopied] = useState(false);

  if (!series) return null;

  // Generate batch ranges if episodes > 25
  const rangeTabs = useMemo(() => {
    const total = series.episodes.length;
    if (total <= 25) return [];

    const tabs: { label: string; start: number; end: number }[] = [];
    const step = 25;
    for (let i = 0; i < total; i += step) {
      const start = i + 1;
      const end = Math.min(i + step, total);
      tabs.push({
        label: `Ep ${start}-${end}`,
        start,
        end
      });
    }
    return tabs;
  }, [series.episodes.length]);

  // Filter episodes based on search query and range tab
  const filteredEpisodes = useMemo(() => {
    let list = series.episodes;

    // Range tab filter
    if (selectedRange !== "all") {
      const match = selectedRange.match(/(\d+)-(\d+)/);
      if (match) {
        const start = parseInt(match[1], 10);
        const end = parseInt(match[2], 10);
        list = list.filter((ep) => ep.episodeNumber >= start && ep.episodeNumber <= end);
      }
    }

    // Text search filter
    const q = searchQuery.trim().toLowerCase();
    if (q) {
      const numMatch = q.match(/\d+/);
      const targetNum = numMatch ? parseInt(numMatch[0], 10) : null;

      list = list.filter((ep) => {
        if (targetNum !== null && ep.episodeNumber === targetNum) return true;
        return (
          ep.title.toLowerCase().includes(q) ||
          ep.fullTitle?.toLowerCase().includes(q) ||
          String(ep.episodeNumber).includes(q)
        );
      });
    }

    return list;
  }, [series.episodes, selectedRange, searchQuery]);

  const handleShare = () => {
    const url = window.location.href;
    if (navigator.clipboard) {
      navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 md:p-6 bg-black/90 backdrop-blur-xl animate-in fade-in duration-200"
    >
      <div className="relative w-full max-w-5xl max-h-[92vh] flex flex-col bg-[#0b0c12] border border-white/15 rounded-2xl shadow-2xl overflow-hidden">
        {/* HERO BANNER SECTION */}
        <div className="relative w-full h-44 sm:h-60 md:h-72 shrink-0 overflow-hidden bg-neutral-900">
          <img
            src={series.backdrop || series.poster}
            alt={series.title}
            className="w-full h-full object-cover object-center filter brightness-[0.65] contrast-[1.05]"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#0b0c12] via-[#0b0c12]/60 to-transparent" />
          <div className="absolute inset-0 bg-gradient-to-r from-[#0b0c12] via-transparent to-[#0b0c12]/80" />

          {/* Close button top right */}
          <button
            onClick={onClose}
            className="absolute top-3 right-3 sm:top-4 sm:right-4 z-20 p-2 rounded-full bg-black/70 hover:bg-white/20 text-white transition-colors cursor-pointer border border-white/20 backdrop-blur-md shadow-lg"
            title="Close episode explorer"
          >
            <X className="w-5 h-5" />
          </button>

          {/* Drama Title & Badges in Hero */}
          <div className="absolute bottom-3 left-3 right-3 sm:bottom-5 sm:left-6 sm:right-6 z-10 flex flex-col sm:flex-row sm:items-end justify-between gap-3">
            <div className="max-w-2xl">
              <div className="flex items-center gap-2 flex-wrap mb-1.5">
                <span className="px-2 py-0.5 rounded text-[10px] sm:text-xs font-black uppercase tracking-wider bg-amber-500 text-black border border-amber-400">
                  {series.category === "historical" ? "HISTORICAL STORY" : "TURKISH DRAMA"}
                </span>
                <span className="px-2 py-0.5 rounded text-[10px] sm:text-xs font-bold uppercase tracking-wider bg-orange-500/20 text-orange-300 border border-orange-500/30">
                  URDU DUBBED
                </span>
                <span className="px-2 py-0.5 rounded text-[10px] sm:text-xs font-bold bg-white/10 text-neutral-300 border border-white/15">
                  {series.totalEpisodes} EPISODES
                </span>
                <div className="flex items-center gap-1 bg-black/60 px-2 py-0.5 rounded text-[11px] font-bold text-amber-300 border border-amber-500/20">
                  <Star className="w-3 h-3 text-amber-400 fill-current" />
                  <span>{series.rating.toFixed(1)}</span>
                </div>
              </div>

              <h2 className="text-xl sm:text-2xl md:text-3xl font-black text-white tracking-tight leading-snug drop-shadow-md">
                {series.title}
              </h2>
              {series.subtitle && (
                <p className="text-xs sm:text-sm text-neutral-300 line-clamp-1 mt-0.5">
                  {series.subtitle}
                </p>
              )}
            </div>

            {/* Quick Actions */}
            <div className="flex items-center gap-2 shrink-0">
              <button
                onClick={() => onPlayEpisode(series.episodes[0], series.episodes)}
                className="px-4 py-2 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-black font-extrabold text-xs sm:text-sm flex items-center gap-2 shadow-lg shadow-amber-500/30 hover:scale-105 active:scale-95 transition-all cursor-pointer"
              >
                <Play className="w-4 h-4 fill-current" />
                <span>Play Episode 1</span>
              </button>

              <button
                onClick={handleShare}
                className="p-2 rounded-xl bg-white/10 hover:bg-white/20 text-white border border-white/15 transition-colors cursor-pointer"
                title="Share link"
              >
                {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Share2 className="w-4 h-4" />}
              </button>
            </div>
          </div>
        </div>

        {/* EPISODE CONTROLS & FILTER BAR */}
        <div className="p-3 sm:p-4 border-b border-white/10 bg-[#0e1017] flex flex-col md:flex-row items-center justify-between gap-3">
          {/* Episode Search Bar */}
          <div className="relative w-full md:w-72 shrink-0">
            <Search className="w-4 h-4 text-neutral-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search episode (e.g. 5 or Finale)..."
              className="w-full pl-9 pr-8 py-1.5 rounded-xl bg-white/5 border border-white/15 text-xs text-white placeholder-neutral-400 focus:outline-none focus:border-amber-400 transition-colors"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery("")}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-white"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Episode Batch Range Tabs */}
          <div className="w-full md:w-auto flex items-center gap-1.5 overflow-x-auto no-scrollbar py-0.5">
            <button
              onClick={() => setSelectedRange("all")}
              className={`px-3 py-1 rounded-lg text-xs font-bold transition-all shrink-0 cursor-pointer ${
                selectedRange === "all"
                  ? "bg-amber-500 text-black shadow-sm"
                  : "bg-white/5 hover:bg-white/10 text-neutral-300 border border-white/10"
              }`}
            >
              All ({series.episodes.length})
            </button>
            {rangeTabs.map((tab) => {
              const active = selectedRange === `${tab.start}-${tab.end}`;
              return (
                <button
                  key={tab.label}
                  onClick={() => setSelectedRange(`${tab.start}-${tab.end}`)}
                  className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all shrink-0 cursor-pointer ${
                    active
                      ? "bg-amber-500 text-black shadow-sm"
                      : "bg-white/5 hover:bg-white/10 text-neutral-300 border border-white/10"
                  }`}
                >
                  {tab.label}
                </button>
              );
            })}
          </div>

          <div className="text-[11px] text-neutral-400 font-mono hidden lg:block shrink-0">
            Showing <span className="text-amber-400 font-bold">{filteredEpisodes.length}</span> of {series.episodes.length}
          </div>
        </div>

        {/* EPISODES GRID SCROLL AREA */}
        <div className="flex-1 overflow-y-auto p-3 sm:p-5">
          {filteredEpisodes.length === 0 ? (
            <div className="py-16 text-center text-neutral-400 text-xs flex flex-col items-center gap-2">
              <Film className="w-8 h-8 text-neutral-600 animate-pulse" />
              <p>No episodes found matching "{searchQuery}"</p>
              <button
                onClick={() => {
                  setSearchQuery("");
                  setSelectedRange("all");
                }}
                className="mt-2 text-amber-400 hover:underline font-bold"
              >
                Reset filter
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4">
              {filteredEpisodes.map((ep) => (
                <div
                  key={ep.id}
                  onClick={() => onPlayEpisode(ep, series.episodes)}
                  role="button"
                  tabIndex={0}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " ") {
                      e.preventDefault();
                      onPlayEpisode(ep, series.episodes);
                    }
                  }}
                  className="group relative flex flex-col bg-white/5 border border-white/10 rounded-xl overflow-hidden hover:border-amber-400/60 transition-all duration-300 hover:-translate-y-1 cursor-pointer shadow-md hover:shadow-amber-500/10"
                >
                  {/* Thumbnail 16:9 */}
                  <div className="relative w-full aspect-[16/9] bg-neutral-900 overflow-hidden">
                    <img
                      src={ep.thumbnail}
                      alt={ep.title}
                      loading="lazy"
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />

                    {/* Top Left: Episode Number Badge */}
                    <div className="absolute top-1.5 left-1.5 z-10 px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-wider bg-black/80 backdrop-blur-md text-amber-300 border border-amber-400/30">
                      EPISODE {ep.episodeNumber}
                    </div>

                    {/* Bottom Right: Duration Badge */}
                    <div className="absolute bottom-1.5 right-1.5 z-10 px-1.5 py-0.5 rounded text-[9px] font-bold bg-black/80 text-white/90">
                      {ep.duration || "Full Episode"}
                    </div>

                    {/* Hover Play Button Overlay */}
                    <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity duration-200">
                      <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-amber-500 to-amber-400 text-black flex items-center justify-center shadow-lg shadow-amber-500/40 transform group-hover:scale-110 transition-transform">
                        <Play className="w-4 h-4 fill-current ml-0.5" />
                      </div>
                    </div>
                  </div>

                  {/* Title and metadata */}
                  <div className="p-2 sm:p-2.5 bg-black/40 flex flex-col justify-between flex-1">
                    <h4 className="text-xs font-bold text-neutral-100 group-hover:text-amber-300 transition-colors line-clamp-1">
                      {ep.title}
                    </h4>
                    <div className="flex items-center justify-between mt-1 text-[10px] text-neutral-400 font-mono">
                      <span>Urdu Dubbed</span>
                      <span className="text-amber-400/80 font-semibold group-hover:underline flex items-center gap-0.5">
                        Watch <ArrowRight className="w-2.5 h-2.5" />
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
