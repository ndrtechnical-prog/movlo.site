import React, { useState } from "react";
import { Zap, ExternalLink, X } from "lucide-react";
import { getNextMonetagLink, triggerMonetagLink } from "../lib/monetag";

export const MonetagStickyBar: React.FC = () => {
  const [isVisible, setIsVisible] = useState(true);

  if (!isVisible) return null;

  const handleOpenAd = (e: React.MouseEvent) => {
    e.preventDefault();
    triggerMonetagLink(getNextMonetagLink());
  };

  return (
    <div className="fixed bottom-3 left-3 right-3 sm:left-auto sm:right-6 sm:bottom-6 z-40 max-w-md animate-in fade-in slide-in-from-bottom-3 duration-300">
      <div className="relative flex items-center justify-between gap-3 p-2.5 sm:p-3 bg-[#0a0a0f]/95 border border-amber-500/40 rounded-2xl shadow-2xl backdrop-blur-xl group hover:border-amber-400 transition-all">
        {/* Ad Trigger Body */}
        <div
          onClick={handleOpenAd}
          className="flex items-center gap-2.5 cursor-pointer flex-1 min-w-0"
          role="button"
          tabIndex={0}
        >
          <div className="w-8 h-8 rounded-xl bg-amber-500 text-black flex items-center justify-center flex-shrink-0 shadow-md shadow-amber-500/30">
            <Zap className="w-4 h-4 fill-current" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-1.5">
              <span className="text-[9px] px-1.5 py-0.2 rounded bg-amber-500/20 text-amber-300 font-bold uppercase tracking-wider border border-amber-500/30">
                PROMO
              </span>
              <span className="text-[11px] font-bold text-white group-hover:text-amber-300 transition-colors truncate">
                Fast 4K Cinema Mirror
              </span>
            </div>
            <p className="text-[10px] text-neutral-400 truncate">
              Watch full movies with zero buffering & instant downloads
            </p>
          </div>
        </div>

        {/* Action Button */}
        <button
          onClick={handleOpenAd}
          className="px-3 py-1.5 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 text-black font-extrabold text-[11px] flex items-center gap-1 flex-shrink-0 shadow-md shadow-amber-500/20 hover:scale-105 transition-transform cursor-pointer"
        >
          <span>Stream</span>
          <ExternalLink className="w-3 h-3" />
        </button>

        {/* Dismiss Button */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            setIsVisible(false);
          }}
          className="p-1 text-neutral-400 hover:text-white rounded-lg hover:bg-white/10 transition-colors flex-shrink-0 cursor-pointer"
          title="Dismiss offer"
          aria-label="Dismiss offer"
        >
          <X className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
};
