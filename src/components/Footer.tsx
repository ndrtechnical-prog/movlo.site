import React, { useState, useRef, useEffect } from "react";
import { Film, Shield, Info, Heart, Lock } from "lucide-react";

interface FooterProps {
  onNavigateSection: (sectionId: string) => void;
  onOpenAdmin?: () => void;
  onTriggerAdminKey?: () => void;
}

export const Footer: React.FC<FooterProps> = ({ onNavigateSection, onOpenAdmin, onTriggerAdminKey }) => {
  const [isPressing, setIsPressing] = useState(false);
  const [pressProgress, setPressProgress] = useState(0);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const startTimeRef = useRef<number>(0);

  const startPress = () => {
    setIsPressing(true);
    setPressProgress(0);
    startTimeRef.current = Date.now();

    intervalRef.current = setInterval(() => {
      const elapsed = Date.now() - startTimeRef.current;
      setPressProgress(Math.min(100, (elapsed / 5000) * 100));
    }, 40);

    timerRef.current = setTimeout(() => {
      if (intervalRef.current) clearInterval(intervalRef.current);
      setIsPressing(false);
      setPressProgress(0);
      if (typeof navigator !== "undefined" && navigator.vibrate) {
        navigator.vibrate(100);
      }
      if (onTriggerAdminKey) onTriggerAdminKey();
      else if (onOpenAdmin) onOpenAdmin();
    }, 5000);
  };

  const cancelPress = () => {
    if (timerRef.current) clearTimeout(timerRef.current);
    if (intervalRef.current) clearInterval(intervalRef.current);
    setIsPressing(false);
    setPressProgress(0);
  };

  useEffect(() => {
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, []);

  return (
    <footer className="w-full bg-[#050505]/90 backdrop-blur-md border-t border-white/5 pt-12 pb-8 mt-12 text-gray-400 text-xs relative z-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-8 pb-8 border-b border-white/5">
          {/* Brand */}
          <div className="flex flex-col gap-2 max-w-sm">
            <div
              id="footer-movlo-heading"
              onMouseDown={startPress}
              onMouseUp={cancelPress}
              onMouseLeave={cancelPress}
              onTouchStart={startPress}
              onTouchEnd={cancelPress}
              onTouchCancel={cancelPress}
              onContextMenu={(e) => e.preventDefault()}
              className="relative inline-flex items-center gap-2 cursor-pointer select-none group w-fit"
              title="Hold for 5 seconds to unlock Admin"
            >
              <div className="w-7 h-7 rounded-lg bg-gradient-to-tr from-orange-500 to-red-500 p-0.5 flex items-center justify-center border border-white/20">
                <div className="w-full h-full bg-[#08080c] rounded-[6px] flex items-center justify-center">
                  <Film className="w-3.5 h-3.5 text-orange-500" />
                </div>
              </div>
              <span className={`font-['Syne',sans-serif] text-xl font-black tracking-tighter transition-all duration-300 ${
                isPressing ? "text-amber-300 drop-shadow-[0_0_15px_rgba(245,158,11,0.8)] scale-95" : "text-orange-500"
              }`}>
                MOVLO
              </span>

              {isPressing && (
                <div className="absolute left-0 -top-8 flex items-center gap-2 px-2.5 py-1 rounded-full bg-black/95 border border-amber-500/80 backdrop-blur-md text-[10px] text-amber-300 font-mono z-20 whitespace-nowrap shadow-xl">
                  <span>Hold: {Math.max(0, (5 - (pressProgress * 5) / 100)).toFixed(1)}s</span>
                  <div className="w-10 h-1 bg-neutral-800 rounded-full overflow-hidden">
                    <div className="h-full bg-amber-400" style={{ width: `${pressProgress}%` }} />
                  </div>
                </div>
              )}
            </div>
            <p className="text-gray-400 text-xs leading-relaxed">
              Your premier cinematic discovery & clips streaming platform. Find what to watch, iconic 4K video clips, and streaming availability dynamically.
            </p>
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

        {/* Attribution & Legal Disclaimers */}
        <div className="pt-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-center sm:text-left text-[11px] text-gray-500">
          <div className="flex items-center gap-2">
            <Shield className="w-3.5 h-3.5 text-gray-400 shrink-0" />
            <span>
              Cinema metadata and streaming sources powered dynamically.
            </span>
          </div>

          <div className="flex items-center gap-3">
            <span>© {new Date().getFullYear()} movlo.site. All rights reserved.</span>
          </div>
        </div>
      </div>
    </footer>
  );
};
