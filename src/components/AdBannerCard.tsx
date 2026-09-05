import React from "react";
import { ExternalLink, Sparkles } from "lucide-react";
import { AdBanner } from "../types";
import { recordAdClick } from "../lib/api";

interface AdBannerCardProps {
  ad: AdBanner;
}

export const AdBannerCard: React.FC<AdBannerCardProps> = ({ ad }) => {
  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault();
    recordAdClick(ad.id);
    if (ad.targetUrl) {
      window.open(ad.targetUrl, "_blank", "noopener,noreferrer");
    }
  };

  return (
    <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 my-6">
      <a
        id={`ad-card-${ad.id}`}
        href={ad.targetUrl}
        onClick={handleClick}
        target="_blank"
        rel="noopener noreferrer"
        className="group relative block w-full rounded-2xl overflow-hidden border border-amber-500/30 bg-gradient-to-r from-neutral-900/90 via-amber-950/20 to-neutral-900/90 p-1 shadow-2xl hover:border-amber-400 transition-all duration-300 hover:shadow-amber-500/10 cursor-pointer"
      >
        <div className="flex flex-col md:flex-row items-center justify-between gap-6 p-4 sm:p-6 bg-[#0a0a0c]/80 rounded-xl backdrop-blur-md">
          {/* Poster / Thumbnail from Phone or Link */}
          <div className="relative w-full md:w-56 h-36 md:h-32 rounded-lg overflow-hidden flex-shrink-0 bg-neutral-950 border border-white/10 group-hover:border-amber-500/50 transition-all">
            <img
              src={ad.posterUrl}
              alt={ad.title}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
              onError={(e) => {
                (e.target as HTMLImageElement).src =
                  "https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?w=800&auto=format&fit=crop&q=80";
              }}
            />
            <div className="absolute top-2 left-2 bg-amber-500 text-black text-[10px] font-black tracking-wider uppercase px-2 py-0.5 rounded shadow">
              {ad.tag || "SPONSORED"}
            </div>
          </div>

          {/* Ad Info */}
          <div className="flex-1 text-center md:text-left">
            <div className="inline-flex items-center gap-1.5 text-xs text-amber-400 font-semibold mb-1">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Partner Showcase</span>
            </div>
            <h4 className="text-lg sm:text-xl font-bold text-white group-hover:text-amber-300 transition-colors">
              {ad.title}
            </h4>
            <p className="text-xs text-neutral-400 mt-1 line-clamp-1">
              Direct access: {ad.targetUrl}
            </p>
          </div>

          {/* Action Button */}
          <div className="flex-shrink-0">
            <div className="inline-flex items-center gap-2 bg-amber-500 group-hover:bg-amber-400 text-black font-bold text-xs sm:text-sm px-5 py-2.5 rounded-xl shadow-lg transition-transform group-hover:scale-105">
              <span>Visit Link</span>
              <ExternalLink className="w-4 h-4" />
            </div>
          </div>
        </div>
      </a>
    </div>
  );
};
