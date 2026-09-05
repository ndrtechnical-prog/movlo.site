import React, { useState, useMemo } from "react";
import { Flame, TrendingUp, Sparkles, Film, Filter, Play } from "lucide-react";
import { MovieClip } from "../types";
import { ClipCard } from "./ClipCard";

interface TrendingClipsSectionProps {
  trendingClips: MovieClip[];
  mostWatchedClips: MovieClip[];
  allClips: MovieClip[];
  isLoading: boolean;
  onPlayClip: (clip: MovieClip) => void;
  onSelectMovie?: (movieId: number) => void;
}

export const TrendingClipsSection: React.FC<TrendingClipsSectionProps> = ({
  trendingClips,
  mostWatchedClips,
  allClips,
  isLoading,
  onPlayClip,
  onSelectMovie
}) => {
  const [activeTab, setActiveTab] = useState<"trending" | "most-watched" | "all">("trending");
  const [selectedGenre, setSelectedGenre] = useState<string>("All");

  // Filter genres available in clips
  const genres = useMemo(() => {
    const set = new Set<string>();
    set.add("All");
    allClips.forEach((c) => {
      if (c.genre) set.add(c.genre);
      c.genres?.forEach((g) => set.add(g));
    });
    return Array.from(set).slice(0, 8);
  }, [allClips]);

  // Determine current active list
  const displayClips = useMemo(() => {
    let list: MovieClip[] = [];
    if (activeTab === "trending") {
      list = trendingClips.length > 0 ? trendingClips : allClips.slice(0, 8);
    } else if (activeTab === "most-watched") {
      list = mostWatchedClips.length > 0 ? mostWatchedClips : allClips.slice(0, 8);
    } else {
      list = allClips;
    }

    if (selectedGenre !== "All") {
      const gLower = selectedGenre.toLowerCase();
      list = list.filter(
        (c) =>
          c.genre.toLowerCase() === gLower ||
          c.genres?.some((g) => g.toLowerCase() === gLower)
      );
    }
    return list;
  }, [activeTab, selectedGenre, trendingClips, mostWatchedClips, allClips]);

  return (
    <section id="cinema-clips" className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 space-y-6">
      {/* Section Header with Tabs */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-white/10 pb-5">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="p-1.5 rounded-lg bg-orange-500/20 text-orange-400 border border-orange-500/30">
              {activeTab === "trending" ? (
                <Flame className="w-5 h-5" />
              ) : activeTab === "most-watched" ? (
                <TrendingUp className="w-5 h-5" />
              ) : (
                <Film className="w-5 h-5" />
              )}
            </span>
            <h2 className="text-xl sm:text-2xl md:text-3xl font-black tracking-tight text-neutral-100">
              {activeTab === "trending"
                ? "Trending Cinema Clips"
                : activeTab === "most-watched"
                ? "Most Watched Iconic Scenes"
                : "Master Cinema Clips Vault"}
            </h2>
          </div>
          <p className="text-xs sm:text-sm text-neutral-400">
            Instant 4K streamable highlight clips & legendary movie sequences
          </p>
        </div>

        {/* View Switcher Tabs */}
        <div className="flex items-center bg-neutral-900/90 p-1 rounded-xl border border-white/10 self-start md:self-auto shrink-0">
          <button
            onClick={() => setActiveTab("trending")}
            className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all ${
              activeTab === "trending"
                ? "bg-orange-500 text-black shadow-md shadow-orange-500/20"
                : "text-neutral-400 hover:text-white"
            }`}
          >
            <Flame className="w-3.5 h-3.5" />
            <span>Trending Clips</span>
          </button>

          <button
            onClick={() => setActiveTab("most-watched")}
            className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all ${
              activeTab === "most-watched"
                ? "bg-orange-500 text-black shadow-md shadow-orange-500/20"
                : "text-neutral-400 hover:text-white"
            }`}
          >
            <TrendingUp className="w-3.5 h-3.5" />
            <span>Most Watched</span>
          </button>

          <button
            onClick={() => setActiveTab("all")}
            className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all ${
              activeTab === "all"
                ? "bg-orange-500 text-black shadow-md shadow-orange-500/20"
                : "text-neutral-400 hover:text-white"
            }`}
          >
            <Film className="w-3.5 h-3.5" />
            <span>All Clips ({allClips.length})</span>
          </button>
        </div>
      </div>

      {/* Genre Filter Pills */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
        <Filter className="w-3.5 h-3.5 text-neutral-500 shrink-0 mr-1" />
        {genres.map((g) => (
          <button
            key={g}
            onClick={() => setSelectedGenre(g)}
            className={`px-3 py-1 rounded-full text-xs font-semibold whitespace-nowrap transition-all ${
              selectedGenre === g
                ? "bg-neutral-100 text-black shadow-sm"
                : "bg-neutral-900/80 text-neutral-400 hover:text-neutral-200 border border-white/5 hover:border-white/10"
            }`}
          >
            {g}
          </button>
        ))}
      </div>

      {/* Grid of Clips */}
      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
          {Array.from({ length: 8 }).map((_, i) => (
            <div
              key={i}
              className="bg-neutral-900/40 border border-white/5 rounded-2xl aspect-[16/10] animate-pulse"
            />
          ))}
        </div>
      ) : displayClips.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
          {displayClips.map((clip) => (
            <ClipCard
              key={clip.id}
              clip={clip}
              onPlayClip={onPlayClip}
              onSelectMovie={onSelectMovie}
            />
          ))}
        </div>
      ) : (
        <div className="p-12 text-center border border-white/5 rounded-2xl bg-neutral-900/30">
          <Film className="w-10 h-10 text-neutral-600 mx-auto mb-2" />
          <p className="text-sm text-neutral-400">No clips found for this filter.</p>
        </div>
      )}
    </section>
  );
};
