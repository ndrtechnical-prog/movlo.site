import React from "react";
import { Film, Shield } from "lucide-react";

interface FooterProps {
  onNavigateSection: (sectionId: string) => void;
}

export const Footer: React.FC<FooterProps> = ({ onNavigateSection }) => {
  return (
    <footer className="w-full bg-[#050505]/95 backdrop-blur-md border-t border-white/5 pt-12 pb-8 mt-12 text-gray-400 text-xs relative z-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-8 pb-8 border-b border-white/5">
          {/* Brand & SEO description */}
          <div className="flex flex-col gap-2.5 max-w-md">
            <div
              id="footer-movlo-heading"
              className="inline-flex items-center gap-2 select-none group w-fit cursor-pointer"
              onClick={() => onNavigateSection("hero")}
              title="Movlo.site — Stream Free Movies & 4K Trailers"
            >
              <div className="w-7 h-7 rounded-lg bg-gradient-to-tr from-amber-400 via-orange-500 to-red-500 p-0.5 flex items-center justify-center border border-white/20 shadow-md shadow-amber-500/20">
                <div className="w-full h-full bg-[#08080c] rounded-[6px] flex items-center justify-center">
                  <Film className="w-3.5 h-3.5 text-amber-400" />
                </div>
              </div>
              <span className="font-lumos text-xl font-black tracking-wider text-transparent bg-clip-text bg-gradient-to-r from-white via-amber-200 to-amber-400">
                Movlo.site
              </span>
            </div>
            <p className="text-gray-400 text-xs leading-relaxed">
              Watch movies online free on Movlo Movies. Stream trending Indian cinema, Bollywood, Hollywood, Chinese action, latest 4K cinema trailers, and top box-office hits.
            </p>
            {/* SEO Hashtags for Search Crawlers */}
            <div className="flex flex-wrap gap-1.5 pt-1 text-[10px] text-amber-400/80 font-medium">
              <span>#Movlo</span>
              <span>#MovloMovies</span>
              <span>#WatchMoviesOnline</span>
              <span>#FreeMovies</span>
              <span>#IndianMovies</span>
              <span>#Bollywood</span>
              <span>#Hollywood</span>
              <span>#4KStreaming</span>
              <span>#LatestTrailers</span>
            </div>
          </div>

          {/* Quick links */}
          <div className="flex flex-wrap gap-6 text-xs font-semibold text-gray-300">
            <button
              onClick={() => onNavigateSection("recent-added")}
              className="hover:text-amber-400 transition-colors cursor-pointer"
            >
              Recent Added
            </button>
            <button
              onClick={() => onNavigateSection("recent-watch")}
              className="hover:text-amber-400 transition-colors cursor-pointer"
            >
              Recent Watch
            </button>
            <button
              onClick={() => onNavigateSection("my-watchlist")}
              className="hover:text-amber-400 transition-colors cursor-pointer text-amber-400"
            >
              My Watchlist
            </button>
            <button
              onClick={() => onNavigateSection("upcoming-trailers")}
              className="hover:text-amber-400 transition-colors cursor-pointer"
            >
              Upcoming Trailers
            </button>
          </div>
        </div>

        {/* Attribution, SEO Keywords & Legal Disclaimers */}
        <div className="pt-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-center sm:text-left text-[11px] text-gray-500">
          <div className="flex items-center gap-2">
            <Shield className="w-3.5 h-3.5 text-amber-400/70 shrink-0" />
            <span>
              Movlo.site Cinema Network. Fast 4K video playback & streaming guides.
            </span>
          </div>

          <div className="flex items-center gap-3">
            <span>© {new Date().getFullYear()} Movlo.site — All rights reserved.</span>
          </div>
        </div>
      </div>
    </footer>
  );
};
