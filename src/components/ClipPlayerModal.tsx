import React, { useEffect, useMemo, useState, useRef } from "react";
import { X, ChevronLeft, ChevronRight, Maximize2, Minimize2, Zap, Download, Sparkles, ExternalLink } from "lucide-react";
import { MovieClip } from "../types";
import { getCinemaPosterFallback } from "../lib/api";
import { triggerMonetagLink, FEATURED_DIRECT_AD_LINK } from "../lib/monetag";

interface ClipPlayerModalProps {
  clip: MovieClip | null;
  onClose: () => void;
  onSelectClip: (clip: MovieClip) => void;
  onOpenMovieDetails?: (movieId: number) => void;
  relatedClips?: MovieClip[];
}

// Convert any YouTube/Vimeo/Direct video URL to normalized 16:9 embed or raw source
function normalizeVideoUrl(rawUrl: string): { isIframe: boolean; url: string } {
  if (!rawUrl) return { isIframe: false, url: "" };

  // YouTube URLs
  if (rawUrl.includes("youtube.com") || rawUrl.includes("youtu.be")) {
    let videoId = "";
    if (rawUrl.includes("embed/")) {
      const parts = rawUrl.split("embed/");
      videoId = parts[1]?.split("?")[0]?.split("/")[0] || "";
    } else if (rawUrl.includes("watch")) {
      try {
        const urlObj = new URL(rawUrl);
        videoId = urlObj.searchParams.get("v") || "";
      } catch {
        const match = rawUrl.match(/[?&]v=([^&#]*)/);
        videoId = match ? match[1] : "";
      }
    } else if (rawUrl.includes("youtu.be/")) {
      const parts = rawUrl.split("youtu.be/");
      videoId = parts[1]?.split("?")[0]?.split("/")[0] || "";
    }

    if (videoId) {
      return {
        isIframe: true,
        url: `https://www.youtube-nocookie.com/embed/${videoId}?autoplay=1&rel=0&modestbranding=1&playsinline=1`
      };
    }
  }

  // Vimeo URLs
  if (rawUrl.includes("vimeo.com")) {
    const match = rawUrl.match(/vimeo\.com\/(?:channels\/(?:\w+\/)?|groups\/([^/]*)\/videos\/|album\/(\d+)\/video\/|)(\d+)(?:$|\/|\?)/);
    const videoId = match ? match[3] : "";
    if (videoId) {
      return {
        isIframe: true,
        url: `https://player.vimeo.com/video/${videoId}?autoplay=1`
      };
    }
  }

  // Direct MP4 / WebM video stream
  return {
    isIframe: false,
    url: rawUrl
  };
}

export const ClipPlayerModal: React.FC<ClipPlayerModalProps> = ({
  clip,
  onClose,
  onSelectClip,
  relatedClips = []
}) => {
  const [isLandscape, setIsLandscape] = useState(false);
  const playerBoxRef = useRef<HTMLDivElement>(null);

  // Normalize current video source
  const videoSource = useMemo(() => {
    return clip ? normalizeVideoUrl(clip.videoUrl) : { isIframe: false, url: "" };
  }, [clip?.videoUrl]);

  // Current clip index within the clips collection
  const currentIndex = useMemo(() => {
    if (!clip || !relatedClips.length) return -1;
    return relatedClips.findIndex((c) => c.id === clip.id);
  }, [clip, relatedClips]);

  // Previous & Next navigation handlers
  const handlePrev = React.useCallback(() => {
    if (!relatedClips.length || currentIndex === -1) return;
    const prevIndex = (currentIndex - 1 + relatedClips.length) % relatedClips.length;
    onSelectClip(relatedClips[prevIndex]);
  }, [currentIndex, onSelectClip, relatedClips]);

  const handleNext = React.useCallback(() => {
    if (!relatedClips.length || currentIndex === -1) return;
    const nextIndex = (currentIndex + 1) % relatedClips.length;
    onSelectClip(relatedClips[nextIndex]);
  }, [currentIndex, onSelectClip, relatedClips]);

  // Toggle Landscape / Fullscreen mode
  const toggleLandscape = async () => {
    try {
      if (!document.fullscreenElement) {
        if (playerBoxRef.current?.requestFullscreen) {
          await playerBoxRef.current.requestFullscreen();
        } else if ((playerBoxRef.current as unknown as { webkitRequestFullscreen?: () => Promise<void> })?.webkitRequestFullscreen) {
          await (playerBoxRef.current as unknown as { webkitRequestFullscreen: () => Promise<void> }).webkitRequestFullscreen();
        }
        // Attempt orientation lock to landscape if supported on device
        try {
          const screenOrientation = window.screen.orientation as unknown as { lock?: (o: string) => Promise<void> };
          if (screenOrientation && screenOrientation.lock) {
            await screenOrientation.lock("landscape");
          }
        } catch {
          // Ignored if device doesn't support orientation lock
        }
        setIsLandscape(true);
      } else {
        if (document.exitFullscreen) {
          await document.exitFullscreen();
        } else if ((document as unknown as { webkitExitFullscreen?: () => Promise<void> })?.webkitExitFullscreen) {
          await (document as unknown as { webkitExitFullscreen: () => Promise<void> }).webkitExitFullscreen();
        }
        try {
          const screenOrientation = window.screen.orientation as unknown as { unlock?: () => void };
          if (screenOrientation && screenOrientation.unlock) {
            screenOrientation.unlock();
          }
        } catch {
          // Ignored
        }
        setIsLandscape(false);
      }
    } catch {
      // Fallback: toggle internal landscape state
      setIsLandscape((prev) => !prev);
    }
  };

  // Sync fullscreen change event
  useEffect(() => {
    const onFullscreenChange = () => {
      setIsLandscape(!!document.fullscreenElement);
    };
    document.addEventListener("fullscreenchange", onFullscreenChange);
    document.addEventListener("webkitfullscreenchange", onFullscreenChange);
    return () => {
      document.removeEventListener("fullscreenchange", onFullscreenChange);
      document.removeEventListener("webkitfullscreenchange", onFullscreenChange);
    };
  }, []);

  // Keyboard navigation: Escape to close, ArrowLeft for Prev, ArrowRight for Next
  useEffect(() => {
    if (!clip) return;
    const originalTitle = document.title;
    document.title = `${clip.movieTitle} | MOVLO`;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose();
      } else if (e.key === "ArrowLeft") {
        handlePrev();
      } else if (e.key === "ArrowRight") {
        handleNext();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => {
      document.title = originalTitle;
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [clip, onClose, handlePrev, handleNext]);

  if (!clip) return null;

  return (
    <div
      id="video-player-modal"
      className={`fixed inset-0 z-50 flex flex-col items-center justify-start bg-black/95 backdrop-blur-2xl overflow-y-auto transform-gpu transition-all duration-300 ${
        isLandscape ? "p-0" : "pt-1 sm:pt-2 pb-8 px-2 sm:px-4"
      }`}
    >
      {/* Click outside backdrop to close (when not in full landscape mode) */}
      {!isLandscape && (
        <div
          className="fixed inset-0 bg-gradient-to-b from-amber-950/25 via-black/85 to-black/98 pointer-events-auto"
          onClick={onClose}
          aria-hidden="true"
        />
      )}

      {/* Main Top-Aligned Player Container */}
      <div
        className={`relative z-10 flex flex-col items-center w-full transition-all duration-300 ${
          isLandscape
            ? "w-screen h-screen max-w-none justify-center bg-black p-0"
            : "max-w-6xl xl:max-w-7xl"
        }`}
      >
        {/* Top Header Bar: VIP Cinema Look */}
        {!isLandscape && (
          <div className="w-full flex items-center justify-between pb-1.5 sm:pb-2.5 px-1 text-left">
            <div className="flex items-center gap-2 sm:gap-3 min-w-0 pr-2">
              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-amber-500/20 border border-amber-500/40 text-amber-300 text-[10px] sm:text-[11px] font-extrabold tracking-wider uppercase shrink-0 shadow-sm shadow-amber-500/20">
                <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-ping" />
                MOVLO 4K
              </span>
              <div className="min-w-0 truncate">
                <h1 className="font-lumos text-sm sm:text-lg md:text-xl font-black text-transparent bg-clip-text bg-gradient-to-r from-white via-amber-100 to-amber-300 tracking-wider truncate drop-shadow-sm">
                  {clip.movieTitle}
                </h1>
                {clip.clipTitle && clip.clipTitle !== clip.movieTitle && (
                  <p className="text-[11px] sm:text-xs text-neutral-400 truncate">{clip.clipTitle}</p>
                )}
              </div>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              <span className="hidden md:inline-flex items-center gap-1 text-[11px] text-amber-400/80 font-mono bg-neutral-900/90 px-2.5 py-1 rounded-lg border border-white/10">
                <Sparkles className="w-3 h-3 text-amber-400" />
                ULTRA HD 60FPS
              </span>
              <button
                onClick={onClose}
                className="p-1.5 sm:p-2 rounded-xl bg-neutral-900/90 hover:bg-neutral-800 text-neutral-300 hover:text-white border border-white/15 hover:border-amber-500/50 transition-all cursor-pointer shadow-lg hover:rotate-90 duration-200"
                title="Close (Esc)"
                aria-label="Close Player"
              >
                <X className="w-4 h-4 sm:w-5 sm:h-5 text-amber-400" />
              </button>
            </div>
          </div>
        )}

        {/* 16:9 Full Size Video Player Box with Ambient Glow */}
        <div className="relative w-full group">
          {/* Ambient Cinema Glow behind the player */}
          {!isLandscape && (
            <div className="absolute -inset-1 rounded-3xl bg-gradient-to-r from-amber-500/20 via-orange-500/10 to-amber-600/20 blur-xl opacity-75 group-hover:opacity-100 transition-opacity pointer-events-none" />
          )}

          <div
            ref={playerBoxRef}
            className={`relative w-full aspect-video bg-black overflow-hidden shadow-2xl flex items-center justify-center transform-gpu ${
              isLandscape
                ? "h-full max-h-screen rounded-none border-0"
                : "rounded-2xl sm:rounded-3xl border border-amber-500/30 shadow-[0_10px_50px_rgba(0,0,0,0.9)]"
            }`}
          >
            {videoSource.isIframe ? (
              <iframe
                src={videoSource.url}
                title={clip.movieTitle}
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                allowFullScreen
                loading="eager"
                className="w-full h-full border-0 transform-gpu"
              />
            ) : (
              <video
                src={videoSource.url}
                poster={clip.backdrop || clip.thumbnail || getCinemaPosterFallback(clip.id)}
                controls
                autoPlay
                playsInline
                preload="metadata"
                className="w-full h-full object-contain transform-gpu"
              />
            )}

            {/* Corner Option: Landscape / Full Size Toggle */}
            <button
              id="landscape-corner-btn"
              onClick={toggleLandscape}
              className="absolute bottom-3 right-3 z-30 p-2 sm:p-2.5 rounded-xl bg-black/85 hover:bg-black text-white hover:text-amber-300 border border-white/20 hover:border-amber-500/60 backdrop-blur-md transition-all cursor-pointer shadow-2xl flex items-center gap-1.5 text-xs font-semibold group"
              title={isLandscape ? "Standard Screen" : "Landscape / Fullscreen"}
              aria-label="Toggle Landscape Mode"
            >
              {isLandscape ? (
                <>
                  <Minimize2 className="w-3.5 h-3.5 text-amber-400" />
                  <span className="hidden sm:inline text-[11px]">Exit Landscape</span>
                </>
              ) : (
                <>
                  <Maximize2 className="w-3.5 h-3.5 text-amber-400 group-hover:scale-110 transition-transform" />
                  <span className="hidden sm:inline text-[11px]">Landscape</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Monetag High-Yield Revenue Actions (Fast 4K Server, Download, VIP Pass) */}
        <div className="w-full pt-3.5 flex flex-wrap items-center justify-center gap-2 max-w-xl mx-auto px-2">
          <button
            onClick={() => triggerMonetagLink(FEATURED_DIRECT_AD_LINK)}
            className="px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-amber-500/20 to-amber-600/10 hover:from-amber-500/30 hover:to-amber-600/20 border border-amber-500/50 text-amber-300 hover:text-amber-200 text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer shadow-md hover:scale-105 active:scale-95"
            title="Fast 4K Server 2"
          >
            <Zap className="w-3.5 h-3.5 text-amber-400 fill-current" />
            <span>Fast Server 2 (4K)</span>
            <ExternalLink className="w-3 h-3 opacity-75" />
          </button>

          <button
            onClick={() => triggerMonetagLink(FEATURED_DIRECT_AD_LINK)}
            className="px-3.5 py-1.5 rounded-xl bg-white/10 hover:bg-white/15 border border-white/15 text-neutral-200 hover:text-white text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer shadow-sm hover:scale-105 active:scale-95"
            title="Download Full HD"
          >
            <Download className="w-3.5 h-3.5 text-amber-400" />
            <span>Download 1080p</span>
            <ExternalLink className="w-3 h-3 opacity-75" />
          </button>

          <button
            onClick={() => triggerMonetagLink(FEATURED_DIRECT_AD_LINK)}
            className="px-3.5 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-neutral-300 hover:text-white text-xs font-medium flex items-center gap-1.5 transition-all cursor-pointer shadow-sm hover:scale-105 active:scale-95"
            title="Watch in VIP Cinema"
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            <span>VIP Cinema Pass</span>
          </button>
        </div>

        {/* Related Clips / Episodes Quick Carousel */}
        {relatedClips.length > 1 && !isLandscape && (
          <div className="w-full mt-4 pt-3 border-t border-white/10">
            <div className="flex items-center justify-between px-1 mb-2">
              <span className="text-xs font-bold text-neutral-300 flex items-center gap-1.5 uppercase tracking-wider">
                <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
                Episodes / More Videos ({relatedClips.length})
              </span>
              <span className="text-[11px] text-amber-400 font-semibold">
                Playing: {currentIndex + 1} of {relatedClips.length}
              </span>
            </div>
            <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-thin scrollbar-thumb-amber-500/30">
              {relatedClips.map((item, idx) => {
                const isActive = item.id === clip.id;
                return (
                  <button
                    key={`${item.id}-${idx}`}
                    onClick={() => onSelectClip(item)}
                    className={`shrink-0 flex items-center gap-2 p-1.5 pr-3 rounded-lg border transition-all cursor-pointer text-left ${
                      isActive
                        ? "bg-amber-500/20 border-amber-400 text-amber-300 ring-1 ring-amber-400/50"
                        : "bg-neutral-900/80 hover:bg-neutral-800 border-white/10 text-neutral-300"
                    }`}
                  >
                    <div className="relative w-14 aspect-video rounded overflow-hidden bg-black shrink-0">
                      <img
                        src={item.thumbnail || item.poster}
                        alt={item.clipTitle || item.movieTitle}
                        referrerPolicy="no-referrer"
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="min-w-0 max-w-[150px]">
                      <p className="text-xs font-bold truncate">{item.clipTitle || `Episode ${idx + 1}`}</p>
                      <p className="text-[10px] text-neutral-400 truncate">{item.duration || "Full HD"}</p>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* Controls: Previous | Close Center Me | Next */}
        <div className="w-full pt-3 sm:pt-4 flex items-center justify-between max-w-lg mx-auto px-4">
          {/* Previous Button */}
          <button
            id="player-prev-button"
            onClick={handlePrev}
            className="font-lumos px-4 sm:px-5 py-2.5 sm:py-3 rounded-full bg-neutral-900/90 hover:bg-neutral-800 text-neutral-200 hover:text-white font-bold text-xs sm:text-sm flex items-center gap-1.5 border border-white/15 hover:border-amber-500/50 transition-all cursor-pointer shadow-lg active:scale-95 tracking-wider"
            title="Previous Movie (Left Arrow)"
          >
            <ChevronLeft className="w-4 h-4 text-amber-400" />
            <span>Previous</span>
          </button>

          {/* Close Center Me */}
          <button
            id="player-close-button"
            onClick={onClose}
            className="font-lumos px-7 sm:px-9 py-2.5 sm:py-3 rounded-full bg-gradient-to-r from-neutral-900 to-black hover:from-neutral-800 hover:to-neutral-900 text-white font-black text-xs sm:text-sm flex items-center gap-2 border border-amber-500/30 hover:border-amber-500 transition-all cursor-pointer shadow-2xl hover:scale-105 active:scale-95 group tracking-widest"
            title="Close Player (Esc)"
          >
            <X className="w-4 h-4 text-amber-400 group-hover:rotate-90 transition-transform duration-200" />
            <span>Close</span>
          </button>

          {/* Next Button */}
          <button
            id="player-next-button"
            onClick={handleNext}
            className="font-lumos px-4 sm:px-5 py-2.5 sm:py-3 rounded-full bg-neutral-900/90 hover:bg-neutral-800 text-neutral-200 hover:text-white font-bold text-xs sm:text-sm flex items-center gap-1.5 border border-white/15 hover:border-amber-500/50 transition-all cursor-pointer shadow-lg active:scale-95 tracking-wider"
            title="Next Movie (Right Arrow)"
          >
            <span>Next</span>
            <ChevronRight className="w-4 h-4 text-amber-400" />
          </button>
        </div>
      </div>
    </div>
  );
};
