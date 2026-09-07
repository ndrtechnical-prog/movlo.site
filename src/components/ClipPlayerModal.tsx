import React, { useEffect, useMemo, useState, useRef } from "react";
import { X, ChevronLeft, ChevronRight, Maximize2, Minimize2, Zap, Download, Sparkles, ExternalLink } from "lucide-react";
import { MovieClip } from "../types";
import { getCinemaPosterFallback } from "../lib/api";
import { triggerMonetagLink } from "../lib/monetag";

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
      className={`fixed inset-0 z-50 flex items-center justify-center bg-black/95 backdrop-blur-2xl overflow-y-auto animate-in fade-in duration-200 ${
        isLandscape ? "p-0" : "p-2 sm:p-4 md:p-6"
      }`}
    >
      {/* Click outside backdrop to close (when not in full landscape mode) */}
      {!isLandscape && <div className="fixed inset-0" onClick={onClose} aria-hidden="true" />}

      {/* Main Full-Size Player Container */}
      <div
        className={`relative z-10 my-auto flex flex-col items-center transition-all duration-200 ${
          isLandscape
            ? "w-screen h-screen max-w-none justify-center bg-black p-0"
            : "w-full max-w-6xl xl:max-w-7xl"
        }`}
      >
        {/* Top Header Bar: Clean — ONLY Movie Title */}
        {!isLandscape && (
          <div className="w-full flex items-center justify-between pb-2 sm:pb-3 px-2 text-left">
            <h1 className="font-lumos text-base sm:text-xl md:text-2xl font-black text-white tracking-wider truncate">
              {clip.movieTitle}
            </h1>

            <button
              onClick={onClose}
              className="p-2 rounded-xl bg-neutral-900/90 hover:bg-neutral-800 text-neutral-300 hover:text-white border border-white/10 transition-colors cursor-pointer"
              title="Close (Esc)"
              aria-label="Close"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* 16:9 Full Size Video Player Box with Landscape Button in the Corner */}
        <div
          ref={playerBoxRef}
          className={`relative w-full aspect-video bg-black overflow-hidden shadow-2xl flex items-center justify-center ${
            isLandscape
              ? "h-full max-h-screen rounded-none border-0"
              : "rounded-2xl border border-white/15"
          }`}
        >
          {videoSource.isIframe ? (
            <iframe
              src={videoSource.url}
              title={clip.movieTitle}
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
              allowFullScreen
              className="w-full h-full border-0"
            />
          ) : (
            <video
              src={videoSource.url}
              poster={clip.backdrop || clip.thumbnail || getCinemaPosterFallback(clip.id)}
              controls
              autoPlay
              playsInline
              className="w-full h-full object-contain"
            />
          )}

          {/* Chota sa Corner Option: Landscape / Full Size Toggle */}
          <button
            id="landscape-corner-btn"
            onClick={toggleLandscape}
            className="absolute bottom-3 right-3 z-30 p-2 sm:p-2.5 rounded-xl bg-black/80 hover:bg-black text-white hover:text-orange-400 border border-white/20 hover:border-orange-500/60 backdrop-blur-md transition-all cursor-pointer shadow-xl flex items-center gap-1.5 text-xs font-semibold group"
            title={isLandscape ? "Standard Screen" : "Landscape / Fullscreen"}
            aria-label="Toggle Landscape Mode"
          >
            {isLandscape ? (
              <>
                <Minimize2 className="w-3.5 h-3.5 text-orange-400" />
                <span className="hidden sm:inline text-[11px]">Exit Landscape</span>
              </>
            ) : (
              <>
                <Maximize2 className="w-3.5 h-3.5 text-orange-400 group-hover:scale-110 transition-transform" />
                <span className="hidden sm:inline text-[11px]">Landscape</span>
              </>
            )}
          </button>
        </div>

        {/* Monetag High-Yield Revenue Actions (4K Server 2, Download, VIP Pass) */}
        <div className="w-full pt-3 flex flex-wrap items-center justify-center gap-2 max-w-lg mx-auto px-2">
          <button
            onClick={() => triggerMonetagLink()}
            className="px-3 py-1.5 rounded-xl bg-amber-500/15 hover:bg-amber-500/25 border border-amber-500/40 text-amber-300 hover:text-amber-200 text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer shadow-sm hover:scale-105 active:scale-95"
            title="Fast 4K Server 2"
          >
            <Zap className="w-3.5 h-3.5 text-amber-400 fill-current" />
            <span>Fast Server 2 (4K)</span>
            <ExternalLink className="w-3 h-3 opacity-70" />
          </button>

          <button
            onClick={() => triggerMonetagLink()}
            className="px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/15 border border-white/15 text-neutral-200 hover:text-white text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer shadow-sm hover:scale-105 active:scale-95"
            title="Download Full HD"
          >
            <Download className="w-3.5 h-3.5 text-amber-400" />
            <span>Download 1080p</span>
            <ExternalLink className="w-3 h-3 opacity-70" />
          </button>

          <button
            onClick={() => triggerMonetagLink()}
            className="px-3 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-neutral-300 hover:text-white text-xs font-medium flex items-center gap-1.5 transition-all cursor-pointer shadow-sm hover:scale-105 active:scale-95"
            title="Watch in VIP Cinema"
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            <span>VIP Cinema Pass</span>
          </button>
        </div>

        {/* Neche Controls: Previous | Close Center Me | Next */}
        <div className="w-full pt-3 sm:pt-5 flex items-center justify-between max-w-lg mx-auto px-4">
          {/* Previous Button */}
          <button
            id="player-prev-button"
            onClick={handlePrev}
            className="font-lumos px-4 sm:px-5 py-2.5 sm:py-3 rounded-full bg-neutral-900/90 hover:bg-neutral-800 text-neutral-200 hover:text-white font-bold text-xs sm:text-sm flex items-center gap-1.5 border border-white/15 hover:border-orange-500/50 transition-all cursor-pointer shadow-lg active:scale-95 tracking-wider"
            title="Previous Movie (Left Arrow)"
          >
            <ChevronLeft className="w-4 h-4 text-orange-400" />
            <span>Previous</span>
          </button>

          {/* Close Center Me */}
          <button
            id="player-close-button"
            onClick={onClose}
            className="font-lumos px-7 sm:px-9 py-2.5 sm:py-3 rounded-full bg-neutral-900 hover:bg-neutral-800 text-white font-black text-xs sm:text-sm flex items-center gap-2 border border-white/25 hover:border-orange-500 transition-all cursor-pointer shadow-2xl hover:scale-105 active:scale-95 group tracking-widest"
            title="Close Player (Esc)"
          >
            <X className="w-4 h-4 text-orange-400 group-hover:rotate-90 transition-transform duration-200" />
            <span>Close</span>
          </button>

          {/* Next Button */}
          <button
            id="player-next-button"
            onClick={handleNext}
            className="font-lumos px-4 sm:px-5 py-2.5 sm:py-3 rounded-full bg-neutral-900/90 hover:bg-neutral-800 text-neutral-200 hover:text-white font-bold text-xs sm:text-sm flex items-center gap-1.5 border border-white/15 hover:border-orange-500/50 transition-all cursor-pointer shadow-lg active:scale-95 tracking-wider"
            title="Next Movie (Right Arrow)"
          >
            <span>Next</span>
            <ChevronRight className="w-4 h-4 text-orange-400" />
          </button>
        </div>
      </div>
    </div>
  );
};
