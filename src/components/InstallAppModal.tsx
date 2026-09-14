import React, { useState, useEffect } from "react";
import { X, Download, Smartphone, CheckCircle, Sparkles, Share2, PlusSquare } from "lucide-react";

interface InstallAppModalProps {
  isOpen: boolean;
  onClose: () => void;
  deferredPrompt: any;
  onInstalled?: () => void;
}

export const InstallAppModal: React.FC<InstallAppModalProps> = ({
  isOpen,
  onClose,
  deferredPrompt,
  onInstalled
}) => {
  const [isIOS, setIsIOS] = useState(false);
  const [isInstalled, setIsInstalled] = useState(false);
  const [isInstalling, setIsInstalling] = useState(false);

  useEffect(() => {
    // Detect iOS devices
    const userAgent = window.navigator.userAgent.toLowerCase();
    const isIosDevice = /iphone|ipad|ipod/.test(userAgent);
    setIsIOS(isIosDevice);

    // Detect if already running in standalone mode (installed PWA)
    const isStandalone =
      window.matchMedia("(display-mode: standalone)").matches ||
      (window.navigator as any).standalone === true;
    setIsInstalled(isStandalone);
  }, []);

  if (!isOpen) return null;

  const handleInstallClick = async () => {
    if (deferredPrompt) {
      setIsInstalling(true);
      try {
        await deferredPrompt.prompt();
        const choice = await deferredPrompt.userChoice;
        if (choice.outcome === "accepted") {
          setIsInstalled(true);
          if (onInstalled) onInstalled();
          setTimeout(() => {
            onClose();
          }, 1500);
        }
      } catch (err) {
        console.error("Install prompt error:", err);
      } finally {
        setIsInstalling(false);
      }
    }
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/85 backdrop-blur-xl animate-in fade-in duration-200">
      <div
        className="fixed inset-0"
        onClick={onClose}
        aria-hidden="true"
      />

      <div className="relative z-10 w-full max-w-md rounded-3xl bg-gradient-to-b from-neutral-900 via-[#0a0c14] to-black border border-amber-500/30 shadow-[0_15px_60px_rgba(0,0,0,0.9)] overflow-hidden p-6 sm:p-7 text-center">
        {/* Glow backlight */}
        <div className="absolute -top-24 left-1/2 -translate-x-1/2 w-48 h-48 rounded-full bg-amber-500/20 blur-3xl pointer-events-none" />

        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-full bg-white/5 hover:bg-white/10 text-neutral-400 hover:text-white border border-white/10 transition-colors cursor-pointer"
          title="Close"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Falcon Icon with luxury ring */}
        <div className="relative mx-auto mb-4 w-20 h-20 rounded-2xl p-1 bg-gradient-to-tr from-amber-400 via-orange-500 to-amber-600 shadow-xl shadow-amber-500/25">
          <img
            src="/falcon-icon.jpg"
            alt="Falcon Movlo Logo"
            className="w-full h-full object-cover rounded-[14px]"
          />
          <div className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full bg-amber-400 text-black flex items-center justify-center shadow-md">
            <Sparkles className="w-3.5 h-3.5 fill-current" />
          </div>
        </div>

        {/* Title */}
        <h2 className="font-lumos text-xl sm:text-2xl font-black text-white tracking-wider mb-1">
          Install Movlo Movies
        </h2>
        <p className="text-xs sm:text-sm text-neutral-400 mb-6">
          Stream movies, Turkish dramas & 4K trailers directly from your home screen with zero lag.
        </p>

        {/* App Highlights */}
        <div className="space-y-2.5 text-left mb-6 bg-white/[0.03] border border-white/10 rounded-2xl p-3.5 text-xs text-neutral-300">
          <div className="flex items-center gap-2.5">
            <CheckCircle className="w-4 h-4 text-amber-400 shrink-0" />
            <span>Instant launch from mobile / desktop home screen</span>
          </div>
          <div className="flex items-center gap-2.5">
            <CheckCircle className="w-4 h-4 text-amber-400 shrink-0" />
            <span>Full-screen cinematic 4K video playback</span>
          </div>
          <div className="flex items-center gap-2.5">
            <CheckCircle className="w-4 h-4 text-amber-400 shrink-0" />
            <span>Faster loading & offline caching with Falcon Engine</span>
          </div>
        </div>

        {isInstalled ? (
          <div className="py-3 px-4 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-sm font-bold flex items-center justify-center gap-2">
            <CheckCircle className="w-4 h-4" />
            <span>Movlo is already installed on this device!</span>
          </div>
        ) : deferredPrompt ? (
          <button
            onClick={handleInstallClick}
            disabled={isInstalling}
            className="w-full py-3.5 px-6 rounded-2xl bg-gradient-to-r from-amber-400 via-amber-500 to-orange-500 hover:from-amber-300 hover:to-orange-400 text-black font-black text-sm uppercase tracking-wider flex items-center justify-center gap-2 shadow-lg shadow-amber-500/30 hover:scale-[1.02] active:scale-[0.98] transition-all cursor-pointer disabled:opacity-50"
          >
            <Download className="w-4 h-4 text-black stroke-[3]" />
            <span>{isInstalling ? "Installing..." : "Install Movlo App"}</span>
          </button>
        ) : isIOS ? (
          <div className="text-left bg-neutral-900/90 border border-amber-500/30 rounded-2xl p-4 text-xs space-y-2 text-neutral-300">
            <div className="font-bold text-amber-300 flex items-center gap-1.5 mb-2">
              <Smartphone className="w-4 h-4" />
              <span>How to Install on iPhone / iPad:</span>
            </div>
            <p className="flex items-center gap-2">
              1. Tap the <Share2 className="w-3.5 h-3.5 text-amber-400 inline" /> <strong>Share</strong> button in Safari.
            </p>
            <p className="flex items-center gap-2">
              2. Scroll down and tap <PlusSquare className="w-3.5 h-3.5 text-amber-400 inline" /> <strong>Add to Home Screen</strong>.
            </p>
            <p className="text-[11px] text-neutral-400 pt-1">
              The Falcon Movlo icon will appear on your home screen like a native app.
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            <div className="text-xs text-neutral-400 bg-neutral-900/60 rounded-xl p-3 border border-white/5">
              Click the install icon in your browser address bar (top right in Chrome/Edge) or tap menu &rarr; <strong>Install app</strong>.
            </div>
            <button
              onClick={onClose}
              className="w-full py-3 px-6 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-white font-bold text-xs transition-colors cursor-pointer"
            >
              Got it, continue browsing
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
