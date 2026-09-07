import React from "react";
import { Sparkles, ExternalLink, Zap, Download } from "lucide-react";
import { getNextMonetagLink, triggerMonetagLink } from "../lib/monetag";

export const MonetagPromoBanner: React.FC = () => {
  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault();
    triggerMonetagLink(getNextMonetagLink());
  };

  return (
    <div className="w-full max-w-7xl mx-auto px-2.5 sm:px-6 lg:px-8 my-6">
      <div
        onClick={handleClick}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            triggerMonetagLink(getNextMonetagLink());
          }
        }}
        className="group relative block w-full rounded-2xl overflow-hidden border border-amber-500/40 bg-gradient-to-r from-neutral-950 via-neutral-900 to-amber-950/40 p-0.5 shadow-2xl hover:border-amber-400 transition-all duration-300 hover:shadow-amber-500/20 cursor-pointer"
      >
        <div className="flex flex-col md:flex-row items-center justify-between gap-4 sm:gap-6 p-4 sm:p-5 bg-black/60 rounded-[14px] backdrop-blur-xl">
          {/* Left: Highlight Pill & Text */}
          <div className="flex items-center gap-3 sm:gap-4 w-full md:w-auto">
            <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-gradient-to-tr from-amber-500 to-orange-500 flex items-center justify-center text-black flex-shrink-0 shadow-lg shadow-amber-500/30 group-hover:scale-105 transition-transform">
              <Zap className="w-5 h-5 sm:w-6 sm:h-6 fill-current" />
            </div>

            <div className="flex-1">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="px-2 py-0.5 rounded text-[9px] sm:text-[10px] font-black uppercase tracking-wider bg-amber-500 text-black shadow">
                  SPONSORED
                </span>
                <span className="text-[11px] sm:text-xs text-amber-400 font-semibold flex items-center gap-1">
                  <Sparkles className="w-3 h-3" />
                  <span>Ultra 4K Streaming Partner</span>
                </span>
              </div>
              <h4 className="text-sm sm:text-base md:text-lg font-bold text-white group-hover:text-amber-300 transition-colors mt-0.5">
                Stream Unlimited Movies & Dramas in High-Speed 4K UHD
              </h4>
              <p className="text-[11px] sm:text-xs text-neutral-400 mt-0.5 hidden sm:block">
                Zero buffering, full uncensored cuts, and instant offline download links available.
              </p>
            </div>
          </div>

          {/* Right: Conversion Buttons */}
          <div className="flex items-center gap-2 sm:gap-3 w-full md:w-auto justify-end flex-shrink-0">
            <div className="inline-flex items-center gap-1.5 px-3.5 sm:px-4 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-white font-bold text-xs border border-white/15 transition-all">
              <Download className="w-3.5 h-3.5 text-amber-400" />
              <span>Download 1080p</span>
            </div>

            <div className="inline-flex items-center gap-1.5 px-4 sm:px-5 py-2 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 group-hover:from-amber-400 group-hover:to-orange-400 text-black font-extrabold text-xs sm:text-sm shadow-lg shadow-amber-500/25 transition-all group-hover:scale-105">
              <span>Access 4K Server</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
