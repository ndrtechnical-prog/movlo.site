import React from "react";
import { Genre } from "../types";
import { Layers } from "lucide-react";

interface GenreBarProps {
  genres: Genre[];
  selectedGenreId: number | null;
  onSelectGenre: (genreId: number | null) => void;
  isLoading?: boolean;
}

export const GenreBar: React.FC<GenreBarProps> = ({
  genres,
  selectedGenreId,
  onSelectGenre,
  isLoading = false
}) => {
  return (
    <div className="w-full max-w-7xl mx-auto px-2.5 sm:px-6 lg:px-8 py-3 sm:py-4">
      <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none scroll-smooth">
        {/* 'All' button */}
        <button
          onClick={() => onSelectGenre(null)}
          className={`shrink-0 px-3.5 py-1.5 rounded-full text-xs font-semibold transition-all cursor-pointer backdrop-blur-md ${
            selectedGenreId === null
              ? "bg-orange-500 text-black shadow-md shadow-orange-500/20 font-bold"
              : "bg-white/5 hover:bg-white/10 text-gray-300 border border-white/10"
          }`}
        >
          All Genres
        </button>

        {/* Dynamic Genre Pills */}
        {genres.map((g) => {
          const isActive = selectedGenreId === g.id;
          return (
            <button
              key={g.id}
              onClick={() => onSelectGenre(g.id)}
              className={`shrink-0 px-3.5 py-1.5 rounded-full text-xs font-semibold transition-all cursor-pointer backdrop-blur-md ${
                isActive
                  ? "bg-orange-500 text-black shadow-md shadow-orange-500/20 font-bold"
                  : "bg-white/5 hover:bg-white/10 text-gray-300 border border-white/10"
              }`}
            >
              {g.name}
            </button>
          );
        })}
      </div>
    </div>
  );
};
