import React, { useState, useEffect, useRef } from "react";
import { Play, Star, ChevronLeft, ChevronRight, Sparkles, Film } from "lucide-react";
import { JsonMovie } from "../lib/jsonMovies";

interface HeroicPosterSwipeProps {
  movies: JsonMovie[];
  onPlayMovie: (movie: JsonMovie) => void;
}

// Curated high-impact cinema and drama posters matching the screenshot aesthetic
const DEFAULT_HEROIC_POSTERS: Array<{
  id: string;
  title: string;
  urduTitle?: string;
  genre: string;
  rating: number;
  year: number;
  poster: string;
  backdrop: string;
  videoUrl: string;
  category: "dramas" | "indian" | "english" | "chinese" | "others";
}> = [
  {
    id: "hero-bol",
    title: "Bol (Cinema Classic)",
    urduTitle: "بول",
    genre: "Drama / Social",
    rating: 8.9,
    year: 2024,
    poster: "https://images.unsplash.com/photo-1534447677768-be436bb09401?w=800&auto=format&fit=crop&q=80",
    backdrop: "https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=1200&auto=format&fit=crop&q=80",
    videoUrl: "https://www.youtube.com/watch?v=Way9Dexny3w",
    category: "dramas"
  },
  {
    id: "hero-waqt",
    title: "Waqt (The Test of Time)",
    urduTitle: "وقت",
    genre: "Romantic Drama",
    rating: 8.7,
    year: 2025,
    poster: "https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=800&auto=format&fit=crop&q=80",
    backdrop: "https://images.unsplash.com/photo-1536440136628-849c177e76a1?w=1200&auto=format&fit=crop&q=80",
    videoUrl: "https://www.youtube.com/watch?v=xTTr5zzyvW4",
    category: "dramas"
  },
  {
    id: "hero-mohabbat",
    title: "Mohabbat (Eternal Love)",
    urduTitle: "محبت",
    genre: "Romantic Cinema",
    rating: 8.8,
    year: 2025,
    poster: "https://images.unsplash.com/photo-1440404653325-ab127d49abc1?w=800&auto=format&fit=crop&q=80",
    backdrop: "https://images.unsplash.com/photo-1509281373149-e957c6296406?w=1200&auto=format&fit=crop&q=80",
    videoUrl: "https://www.youtube.com/watch?v=L6-1EFaLPCM",
    category: "dramas"
  },
  {
    id: "hero-manto",
    title: "Manto (The Untold Story)",
    urduTitle: "منٹو",
    genre: "Biographical Drama",
    rating: 9.1,
    year: 2024,
    poster: "https://images.unsplash.com/photo-1509281373149-e957c6296406?w=800&auto=format&fit=crop&q=80",
    backdrop: "https://images.unsplash.com/photo-1440404653325-ab127d49abc1?w=1200&auto=format&fit=crop&q=80",
    videoUrl: "https://www.youtube.com/watch?v=1OU5OECupR8",
    category: "dramas"
  },
  {
    id: "hero-action",
    title: "Action Blitz 4K",
    urduTitle: "ایکشن",
    genre: "Action Thriller",
    rating: 8.6,
    year: 2025,
    poster: "https://images.unsplash.com/photo-1578632767115-351597cf2477?w=800&auto=format&fit=crop&q=80",
    backdrop: "https://images.unsplash.com/photo-1578632767115-351597cf2477?w=1200&auto=format&fit=crop&q=80",
    videoUrl: "https://www.youtube.com/watch?v=Way9Dexny3w",
    category: "indian"
  },
  {
    id: "hero-comedy",
    title: "Comedy Express",
    urduTitle: "کامیڈی",
    genre: "Family Comedy",
    rating: 8.5,
    year: 2024,
    poster: "https://images.unsplash.com/photo-1635805737707-575885ab0820?w=800&auto=format&fit=crop&q=80",
    backdrop: "https://images.unsplash.com/photo-1635805737707-575885ab0820?w=1200&auto=format&fit=crop&q=80",
    videoUrl: "https://www.youtube.com/watch?v=YssithSDYWA",
    category: "indian"
  },
  {
    id: "hero-drama-ceo",
    title: "Disabled CEO & Rural Girl",
    urduTitle: "چاہت",
    genre: "Romantic Drama",
    rating: 8.8,
    year: 2025,
    poster: "https://i.ytimg.com/vi/xTTr5zzyvW4/hqdefault.jpg",
    backdrop: "https://i.ytimg.com/vi/xTTr5zzyvW4/maxresdefault.jpg",
    videoUrl: "https://www.youtube.com/watch?v=xTTr5zzyvW4",
    category: "dramas"
  },
  {
    id: "hero-drama-cheat",
    title: "Mob Boss True Beloved",
    urduTitle: "محبت اور بدلہ",
    genre: "Suspense Drama",
    rating: 8.9,
    year: 2025,
    poster: "https://i.ytimg.com/vi/r6uDPpBU0s8/hqdefault.jpg",
    backdrop: "https://i.ytimg.com/vi/r6uDPpBU0s8/maxresdefault.jpg",
    videoUrl: "https://www.youtube.com/watch?v=r6uDPpBU0s8",
    category: "dramas"
  },
  {
    id: "hero-khiladi",
    title: "Khiladi 786",
    urduTitle: "کھلاڑی 786",
    genre: "Action Comedy",
    rating: 8.8,
    year: 2024,
    poster: "https://i.ytimg.com/vi/1OU5OECupR8/hqdefault.jpg",
    backdrop: "https://i.ytimg.com/vi/1OU5OECupR8/maxresdefault.jpg",
    videoUrl: "https://www.youtube.com/watch?v=1OU5OECupR8",
    category: "indian"
  }
];

export const HeroicPosterSwipe: React.FC<HeroicPosterSwipeProps> = ({
  movies,
  onPlayMovie
}) => {
  // Combine loaded Indian movies with curated items
  const allPosters = React.useMemo(() => {
    const list: Array<any> = [];
    if (movies && movies.length > 0) {
      movies.forEach((m) => {
        list.push({
          id: m.id,
          title: m.title,
          urduTitle: m.title.length > 25 ? m.title.slice(0, 22) + "..." : m.title,
          genre: m.genre || "Indian Cinema",
          rating: m.rating || 8.6,
          year: m.year || 2024,
          poster: m.poster || m.thumbnail,
          backdrop: m.backdrop || m.thumbnail || m.poster,
          videoUrl: m.videoUrl,
          category: m.category || "indian"
        });
      });
    }
    DEFAULT_HEROIC_POSTERS.forEach((d) => {
      if (!list.some((item) => item.id === d.id)) {
        list.push(d);
      }
    });
    return list;
  }, [movies]);

  // Swiper page state: each page displays 3 items on mobile (exactly like the screenshot), 4 on tablet, 6 on desktop
  const [currentPage, setCurrentPage] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const touchStartXRef = useRef<number>(0);
  const touchEndXRef = useRef<number>(0);

  // Group into pages of 3 (mobile screenshot matches 3 columns)
  const itemsPerPage = 3;
  const totalPages = Math.ceil(allPosters.length / itemsPerPage);

  // Auto-swipe effect every 4 seconds
  useEffect(() => {
    if (isPaused) return;
    const interval = setInterval(() => {
      setCurrentPage((prev) => (prev + 1) % totalPages);
    }, 4200);
    return () => clearInterval(interval);
  }, [isPaused, totalPages]);

  const handlePrev = () => {
    setCurrentPage((prev) => (prev - 1 + totalPages) % totalPages);
  };

  const handleNext = () => {
    setCurrentPage((prev) => (prev + 1) % totalPages);
  };

  // Touch swipe handlers
  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartXRef.current = e.targetTouches[0].clientX;
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    touchEndXRef.current = e.targetTouches[0].clientX;
  };

  const handleTouchEnd = () => {
    if (!touchStartXRef.current || !touchEndXRef.current) return;
    const diff = touchStartXRef.current - touchEndXRef.current;
    if (diff > 45) {
      handleNext();
    } else if (diff < -45) {
      handlePrev();
    }
    touchStartXRef.current = 0;
    touchEndXRef.current = 0;
  };

  // Get current active 3 items for mobile and extended for desktop
  const startIndex = currentPage * itemsPerPage;
  const currentBatch = allPosters.slice(startIndex, startIndex + itemsPerPage);
  if (currentBatch.length < itemsPerPage) {
    currentBatch.push(...allPosters.slice(0, itemsPerPage - currentBatch.length));
  }

  // Active movie for background ambiance
  const activePoster = currentBatch[0] || DEFAULT_HEROIC_POSTERS[0];

  return (
    <div
      className="relative w-full max-w-4xl mx-auto px-3 sm:px-6 my-2 sm:my-4 select-none"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
      {/* Subtle background glow from active poster */}
      <div
        className="absolute inset-0 -top-10 -bottom-10 opacity-25 blur-3xl pointer-events-none transition-all duration-1000 -z-10 rounded-full"
        style={{
          background: `radial-gradient(circle at center, #f59e0b 0%, transparent 70%)`
        }}
      />

      {/* Swipe Controls Bar */}
      <div className="flex items-center justify-between px-2 mb-2">
        <div className="flex items-center gap-1.5 text-xs text-amber-400 font-semibold uppercase tracking-wider">
          <Sparkles className="w-3.5 h-3.5" />
          <span className="text-[11px] sm:text-xs">Featured Heroic Posters</span>
        </div>

        {/* Carousel indicators & navigation arrows */}
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1">
            {Array.from({ length: Math.min(6, totalPages) }).map((_, idx) => (
              <button
                key={idx}
                onClick={() => setCurrentPage(idx)}
                className={`h-1.5 rounded-full transition-all duration-300 ${
                  currentPage % Math.min(6, totalPages) === idx
                    ? "w-5 bg-amber-400"
                    : "w-1.5 bg-white/20 hover:bg-white/40"
                }`}
                aria-label={`Slide ${idx + 1}`}
              />
            ))}
          </div>
          <div className="flex items-center gap-1 ml-2">
            <button
              onClick={handlePrev}
              className="p-1 rounded-full bg-white/5 hover:bg-white/15 border border-white/10 text-neutral-300 hover:text-white transition-all active:scale-95"
              aria-label="Previous posters"
            >
              <ChevronLeft className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={handleNext}
              className="p-1 rounded-full bg-white/5 hover:bg-white/15 border border-white/10 text-neutral-300 hover:text-white transition-all active:scale-95"
              aria-label="Next posters"
            >
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* 3-Column Poster Showcase (Exact layout as shown in user screenshot) */}
      <div className="grid grid-cols-3 gap-2 sm:gap-3.5">
        {currentBatch.map((item, index) => {
          return (
            <div
              key={`${item.id}-${index}`}
              onClick={() => {
                onPlayMovie({
                  id: item.id,
                  title: item.title,
                  videoUrl: item.videoUrl,
                  thumbnail: item.poster,
                  poster: item.poster,
                  duration: "Full Movie",
                  rating: item.rating,
                  category: item.category
                });
              }}
              className="group relative flex flex-col rounded-xl sm:rounded-2xl overflow-hidden bg-[#0d0e14]/90 border border-white/15 hover:border-amber-400/80 shadow-xl hover:shadow-2xl hover:shadow-amber-500/20 transition-all duration-300 cursor-pointer transform hover:-translate-y-1 active:scale-98"
            >
              {/* Poster 2:3 aspect ratio */}
              <div className="relative w-full aspect-[2/3] overflow-hidden bg-neutral-900">
                <img
                  src={item.poster}
                  alt={item.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  loading="lazy"
                />

                {/* Ambient vignette gradient */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/25 to-transparent" />

                {/* Rating badge */}
                <div className="absolute top-1.5 right-1.5 flex items-center gap-0.5 px-1.5 py-0.5 rounded-md bg-black/75 backdrop-blur-md border border-amber-400/30 text-amber-300 text-[10px] font-bold">
                  <Star className="w-2.5 h-2.5 fill-amber-400 text-amber-400" />
                  <span>{item.rating}</span>
                </div>

                {/* Urdu/Bold Title Overlay like in screenshot */}
                <div className="absolute bottom-2 inset-x-2 text-center">
                  {item.urduTitle && (
                    <span className="block text-base sm:text-xl font-bold text-amber-200 drop-shadow-[0_2px_4px_rgba(0,0,0,0.9)] tracking-wide">
                      {item.urduTitle}
                    </span>
                  )}
                  <span className="block text-[10px] sm:text-xs text-neutral-300 truncate font-medium mt-0.5">
                    {item.title}
                  </span>
                </div>

                {/* Hover Play Button Overlay */}
                <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                  <div className="w-9 h-9 sm:w-11 sm:h-11 rounded-full bg-amber-500 text-black flex items-center justify-center shadow-lg shadow-amber-500/50 transform group-hover:scale-110 transition-transform">
                    <Play className="w-4 h-4 sm:w-5 sm:h-5 fill-black ml-0.5" />
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Touch swipe notice for mobile users */}
      <div className="flex items-center justify-center gap-1 mt-2 text-[10px] text-neutral-400 sm:hidden">
        <span>Swipe left/right to view more posters</span>
      </div>
    </div>
  );
};
