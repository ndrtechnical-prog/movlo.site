import React from "react";
import { Shield, Download } from "lucide-react";

interface FooterProps {
  onNavigateSection: (sectionId: string) => void;
  onOpenInstallModal?: () => void;
}

export const Footer: React.FC<FooterProps> = ({ onNavigateSection, onOpenInstallModal }) => {
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
              <div className="w-8 h-8 rounded-xl p-0.5 bg-gradient-to-tr from-amber-400 via-orange-500 to-amber-600 shadow-md shadow-amber-500/20 border border-amber-400/30 overflow-hidden shrink-0">
                <img
                  src="/falcon-icon.jpg"
                  alt="Falcon Movlo Icon"
                  className="w-full h-full object-cover rounded-[10px]"
                  referrerPolicy="no-referrer"
                />
              </div>
              <span className="font-lumos text-xl font-black tracking-wider text-transparent bg-clip-text bg-gradient-to-r from-white via-amber-200 to-amber-400">
                Movlo.site
              </span>
            </div>
            <p className="text-gray-400 text-xs leading-relaxed">
              Watch movies online free on Movlo Movies. Stream trending Indian cinema, Bollywood, Turkish dramas in Urdu, Hazrat Yousuf (A.S), and latest 4K cinema trailers.
            </p>
            {/* SEO Hashtags for Search Crawlers */}
            <div className="flex flex-wrap gap-1.5 pt-1 text-[10px] text-amber-400/80 font-medium">
              <span>#Movlo</span>
              <span>#MovloMovies</span>
              <span>#TurkishDramasUrdu</span>
              <span>#HazratYousuf</span>
              <span>#IndianMovies</span>
              <span>#Bollywood</span>
              <span>#4KStreaming</span>
            </div>
          </div>

          {/* Quick links */}
          <div className="flex flex-wrap gap-4 sm:gap-5 text-xs font-semibold text-gray-300">
            <button
              onClick={() => onNavigateSection("recent-added")}
              className="hover:text-amber-400 transition-colors cursor-pointer"
            >
              Recent Added
            </button>
            <button
              onClick={() => onNavigateSection("trending-queries")}
              className="hover:text-amber-400 transition-colors cursor-pointer text-amber-300/90"
            >
              Trending Queries
            </button>
            <button
              onClick={() => onNavigateSection("upcoming-movies")}
              className="hover:text-amber-400 transition-colors cursor-pointer"
            >
              2026 Movies Guide
            </button>
            <button
              onClick={() => onNavigateSection("faq")}
              className="hover:text-amber-400 transition-colors cursor-pointer"
            >
              Search FAQ
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
              Trailers
            </button>
            {onOpenInstallModal && (
              <button
                onClick={onOpenInstallModal}
                className="text-amber-400 hover:text-amber-300 transition-colors cursor-pointer flex items-center gap-1 font-bold"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Install App</span>
              </button>
            )}
          </div>
        </div>

        {/* Attribution, Cache Performance & Legal Disclaimers */}
        <div className="pt-6 flex flex-col md:flex-row items-center justify-between gap-4 text-center md:text-left text-[11px] text-gray-500">
          <div className="flex items-center gap-2">
            <Shield className="w-3.5 h-3.5 text-amber-400/70 shrink-0" />
            <span>
              Movlo.site Cinema Network. Fast 4K video playback & streaming guides.
            </span>
          </div>

          {/* Service Worker Image Cache Indicator */}
          <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/10 text-neutral-400">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span>⚡ Service Worker Image Cache Active</span>
          </div>

          <div className="flex items-center gap-3">
            <span>© {new Date().getFullYear()} Movlo.site — All rights reserved.</span>
          </div>
        </div>
      </div>
    </footer>
  );
};
