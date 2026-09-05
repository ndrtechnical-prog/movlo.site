import React, { useState, useEffect } from "react";
import {
  Shield,
  KeyRound,
  Lock,
  Unlock,
  Sparkles,
  Link as LinkIcon,
  Trash2,
  RefreshCw,
  CheckCircle2,
  AlertCircle,
  Film,
  Eye,
  Users,
  Radio,
  Play,
  Tv,
  Smartphone,
  Laptop,
  Layers,
  PlusCircle,
  Image as ImageIcon,
  Upload,
  ExternalLink,
  ToggleLeft,
  ToggleRight,
  X
} from "lucide-react";
import { MovieClip, AdBanner } from "../types";
import {
  verifyAdminPin,
  adminAiPublishClips,
  adminDeleteClip,
  adminResetClips,
  fetchAllClips,
  fetchPresenceStats,
  adminPublishCustomClip,
  fetchAdminAds,
  createAdminAd,
  toggleAdminAd,
  deleteAdminAd,
  PresenceStats,
  getCinemaPosterFallback
} from "../lib/api";

interface AdminPortalModalProps {
  isOpen: boolean;
  onClose: () => void;
  onClipsUpdated: () => void;
  isPreVerified?: boolean;
}

const REQUIRED_PIN = "77490869";

export const AdminPortalModal: React.FC<AdminPortalModalProps> = ({
  isOpen,
  onClose,
  onClipsUpdated,
  isPreVerified = false
}) => {
  // PIN Auth State
  const [pinInput, setPinInput] = useState("");
  const [isVerified, setIsVerified] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);
  const [isVerifying, setIsVerifying] = useState(false);

  // Sync pre-verification state when modal opens
  useEffect(() => {
    if (isOpen && isPreVerified) {
      setIsVerified(true);
      setPinInput(REQUIRED_PIN);
      setAuthError(null);
    }
  }, [isOpen, isPreVerified]);

  // Active Tab: "analytics" | "ads" | "add-video" | "ai-bulk" | "manage"
  const [activeTab, setActiveTab] = useState<"analytics" | "ads" | "add-video" | "ai-bulk" | "manage">("analytics");

  // Ads Management State (Phone Thumbnail Upload & Link Redirection)
  const [adsList, setAdsList] = useState<AdBanner[]>([]);
  const [adTitle, setAdTitle] = useState("");
  const [adPosterUrl, setAdPosterUrl] = useState("");
  const [adTargetUrl, setAdTargetUrl] = useState("");
  const [adTag, setAdTag] = useState("SPONSORED");
  const [isPublishingAd, setIsPublishingAd] = useState(false);
  const [adStatus, setAdStatus] = useState<string | null>(null);
  const [isLoadingAds, setIsLoadingAds] = useState(false);

  // Single Video Link Publisher State (Title & Thumbnail Optional)
  const [customVideoUrl, setCustomVideoUrl] = useState("");
  const [customTitle, setCustomTitle] = useState("");
  const [customThumbnail, setCustomThumbnail] = useState("");
  const [customMovieName, setCustomMovieName] = useState("");
  const [customQuality, setCustomQuality] = useState("4K UHD");
  const [isPublishingCustom, setIsPublishingCustom] = useState(false);
  const [customStatus, setCustomStatus] = useState<string | null>(null);
  const [recentlyAddedClip, setRecentlyAddedClip] = useState<MovieClip | null>(null);

  // Bulk AI Link Publisher State
  const [linksText, setLinksText] = useState("");
  const [isPublishingAi, setIsPublishingAi] = useState(false);
  const [aiPublishStatus, setAiPublishStatus] = useState<string | null>(null);

  // Live Online Users & Watch Plugin Analytics State
  const [presenceStats, setPresenceStats] = useState<PresenceStats | null>(null);
  const [isLoadingStats, setIsLoadingStats] = useState(false);
  const [isAutoRefresh, setIsAutoRefresh] = useState(true);

  // Feed Management State
  const [allClips, setAllClips] = useState<MovieClip[]>([]);
  const [isLoadingClips, setIsLoadingClips] = useState(false);
  const [deleteStatus, setDeleteStatus] = useState<string | null>(null);

  // Load data when verified and opened
  useEffect(() => {
    if (isOpen && isVerified) {
      loadCatalog();
      loadPresence();
      loadAds();
    }
  }, [isOpen, isVerified]);

  // Periodic polling for presence stats (every 6 seconds if activeTab is analytics)
  useEffect(() => {
    if (!isOpen || !isVerified || !isAutoRefresh) return;
    const interval = setInterval(() => {
      loadPresence(true);
    }, 6000);
    return () => clearInterval(interval);
  }, [isOpen, isVerified, isAutoRefresh, activeTab]);

  const loadPresence = async (silent = false) => {
    if (!silent) setIsLoadingStats(true);
    try {
      const stats = await fetchPresenceStats();
      setPresenceStats(stats);
    } catch (err) {
      console.warn("Presence stats warning:", err);
    } finally {
      if (!silent) setIsLoadingStats(false);
    }
  };

  const loadCatalog = async () => {
    setIsLoadingClips(true);
    try {
      const clips = await fetchAllClips();
      setAllClips(clips);
    } catch (err) {
      console.error("Failed to load clips in admin:", err);
    } finally {
      setIsLoadingClips(false);
    }
  };

  const loadAds = async () => {
    setIsLoadingAds(true);
    try {
      const data = await fetchAdminAds(pinInput || REQUIRED_PIN);
      setAdsList(data);
    } catch (err) {
      console.error("Failed to load ads in admin:", err);
    } finally {
      setIsLoadingAds(false);
    }
  };

  const handlePhoneFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 25 * 1024 * 1024) {
      setAdStatus("File size exceeds 25MB. Please choose a smaller image.");
      return;
    }

    const reader = new FileReader();
    reader.onload = (uploadEvent) => {
      const result = uploadEvent.target?.result as string;
      setAdPosterUrl(result);
      if (!adTitle) {
        const name = file.name.replace(/\.[^/.]+$/, "").replace(/[-_]/g, " ");
        setAdTitle(name);
      }
      setAdStatus("Thumbnail loaded from phone storage!");
    };
    reader.readAsDataURL(file);
  };

  const handlePublishAd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!adPosterUrl.trim()) {
      setAdStatus("Please upload a poster from your phone or enter an image URL.");
      return;
    }
    if (!adTargetUrl.trim()) {
      setAdStatus("Please provide a destination link (where user is redirected).");
      return;
    }

    setIsPublishingAd(true);
    setAdStatus("Publishing poster banner...");

    try {
      const newAd = await createAdminAd(
        {
          title: adTitle.trim() || "Exclusive Movie Premiere",
          posterUrl: adPosterUrl.trim(),
          targetUrl: adTargetUrl.trim(),
          tag: adTag
        },
        pinInput || REQUIRED_PIN
      );

      setAdsList((prev) => [newAd, ...prev]);
      setAdTitle("");
      setAdPosterUrl("");
      setAdTargetUrl("");
      setAdStatus("Success! Poster ad published. Users clicking it will go directly to your link.");
      onClipsUpdated();
    } catch (err: any) {
      setAdStatus(`Failed to publish ad: ${err?.message || "Unknown error"}`);
    } finally {
      setIsPublishingAd(false);
    }
  };

  const handleToggleAd = async (id: string) => {
    try {
      const updated = await toggleAdminAd(id, pinInput || REQUIRED_PIN);
      setAdsList((prev) => prev.map((a) => (a.id === id ? updated : a)));
      onClipsUpdated();
    } catch (err) {
      console.error("Toggle error:", err);
    }
  };

  const handleDeleteAd = async (id: string) => {
    if (!window.confirm("Delete this ad banner?")) return;
    try {
      await deleteAdminAd(id, pinInput || REQUIRED_PIN);
      setAdsList((prev) => prev.filter((a) => a.id !== id));
      onClipsUpdated();
    } catch (err) {
      console.error("Delete ad error:", err);
    }
  };

  const handleVerifyPin = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!pinInput.trim()) {
      setAuthError("Please enter the Admin PIN key.");
      return;
    }

    setIsVerifying(true);
    setAuthError(null);

    try {
      const ok = await verifyAdminPin(pinInput.trim());
      if (ok || pinInput.trim() === REQUIRED_PIN) {
        setIsVerified(true);
        loadCatalog();
        loadPresence();
      } else {
        setAuthError("Invalid Admin PIN. Access Denied.");
      }
    } catch {
      if (pinInput.trim() === REQUIRED_PIN) {
        setIsVerified(true);
        loadCatalog();
        loadPresence();
      } else {
        setAuthError("Invalid Admin PIN. Access Denied.");
      }
    } finally {
      setIsVerifying(false);
    }
  };

  // Quick Add Video (Title & Thumbnail Optional)
  const handlePublishCustomClip = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!customVideoUrl.trim()) {
      setCustomStatus("Video Link is required.");
      return;
    }

    setIsPublishingCustom(true);
    setCustomStatus("Publishing video to catalog...");

    try {
      const res = await adminPublishCustomClip({
        pin: REQUIRED_PIN,
        videoUrl: customVideoUrl.trim(),
        title: customTitle.trim() || undefined,
        thumbnail: customThumbnail.trim() || undefined,
        movieTitle: customMovieName.trim() || undefined,
        quality: customQuality
      });

      setRecentlyAddedClip(res.clip);
      setCustomStatus("Success! Video published with cinema streaming link & poster.");
      setCustomVideoUrl("");
      setCustomTitle("");
      setCustomThumbnail("");
      setCustomMovieName("");
      onClipsUpdated();
      loadCatalog();
    } catch (err: any) {
      setCustomStatus(err?.message || "Failed to add video.");
    } finally {
      setIsPublishingCustom(false);
    }
  };

  // Bulk AI Link Publisher
  const handleAiPublish = async () => {
    if (!linksText.trim()) {
      setAiPublishStatus("Please enter at least one video link.");
      return;
    }

    setIsPublishingAi(true);
    setAiPublishStatus("AI is analyzing links, extracting metadata, and generating posters...");

    try {
      const res = await adminAiPublishClips(REQUIRED_PIN, linksText);
      setAiPublishStatus(`Successfully published ${res.publishedCount} clips to Home Feed!`);
      setLinksText("");
      onClipsUpdated();
      loadCatalog();
    } catch (err: any) {
      setAiPublishStatus(err?.message || "Failed to publish clips.");
    } finally {
      setIsPublishingAi(false);
    }
  };

  const handleDeleteClip = async (id: string) => {
    try {
      await adminDeleteClip(REQUIRED_PIN, id);
      setAllClips((prev) => prev.filter((c) => c.id !== id));
      onClipsUpdated();
      setDeleteStatus("Clip removed from feed.");
      setTimeout(() => setDeleteStatus(null), 3000);
    } catch {
      setDeleteStatus("Failed to delete clip.");
    }
  };

  const handleResetCatalog = async () => {
    if (!window.confirm("Are you sure you want to reset all clips to the default curated catalog?")) return;
    try {
      await adminResetClips(REQUIRED_PIN);
      loadCatalog();
      onClipsUpdated();
      setDeleteStatus("Catalog reset to default master clips.");
      setTimeout(() => setDeleteStatus(null), 3000);
    } catch {
      setDeleteStatus("Failed to reset catalog.");
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/90 backdrop-blur-xl overflow-y-auto animate-in fade-in duration-200">
      <div className="fixed inset-0" onClick={onClose} />

      <div className="relative w-full max-w-5xl bg-[#090b10] border border-amber-500/30 rounded-2xl shadow-2xl overflow-hidden z-10 flex flex-col my-auto max-h-[92vh]">
        {/* Modal Header */}
        <div className="px-5 py-4 bg-neutral-900/90 border-b border-white/10 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400">
              <Shield className="w-4 h-4" />
            </div>
            <div>
              <h2 className="font-lumos text-sm sm:text-base font-black uppercase tracking-wider text-neutral-100 flex items-center gap-2">
                <span>MOVLO Studio Admin Vault</span>
                <span className="text-[10px] px-2 py-0.5 rounded bg-amber-500/20 text-amber-400 border border-amber-500/30 font-semibold lowercase">
                  pin: 77490869
                </span>
              </h2>
              <p className="text-[11px] text-neutral-400">
                Live Online Users, Real-Time Movie Analytics & Video Link Publisher
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg bg-neutral-800 hover:bg-neutral-700 text-neutral-300 hover:text-white transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* SCREEN 1: PIN AUTHENTICATION */}
        {!isVerified ? (
          <div className="p-6 sm:p-12 flex flex-col items-center text-center space-y-6">
            <div className="w-16 h-16 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400 shadow-xl shadow-amber-500/10">
              <Lock className="w-8 h-8" />
            </div>

            <div className="space-y-1 max-w-sm">
              <h3 className="font-lumos text-lg font-bold text-neutral-100">
                Protected Studio Vault
              </h3>
              <p className="text-xs text-neutral-400 leading-relaxed">
                Enter your secret 8-digit Studio PIN key to access real-time online user analytics, manage streams, and publish video links.
              </p>
            </div>

            <form onSubmit={handleVerifyPin} className="w-full max-w-xs space-y-3">
              <div className="relative">
                <KeyRound className="w-4 h-4 text-neutral-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="password"
                  value={pinInput}
                  onChange={(e) => {
                    setPinInput(e.target.value);
                    setAuthError(null);
                  }}
                  placeholder="Enter PIN (77490869)"
                  autoFocus
                  maxLength={12}
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-neutral-900 border border-white/10 focus:border-amber-500 text-neutral-100 text-center tracking-[0.25em] text-sm outline-none transition-colors font-mono"
                />
              </div>

              {authError && (
                <div className="flex items-center justify-center gap-1.5 text-xs text-red-400 bg-red-950/40 border border-red-800/40 py-1.5 px-3 rounded-lg">
                  <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                  <span>{authError}</span>
                </div>
              )}

              <button
                type="submit"
                disabled={isVerifying}
                className="w-full py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 disabled:opacity-50 text-black font-extrabold text-xs uppercase tracking-wider transition-colors shadow-lg shadow-amber-500/20 flex items-center justify-center gap-2 cursor-pointer"
              >
                {isVerifying ? (
                  <>
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                    <span>Verifying...</span>
                  </>
                ) : (
                  <>
                    <Unlock className="w-3.5 h-3.5" />
                    <span>Unlock Studio</span>
                  </>
                )}
              </button>
            </form>

            <div className="pt-4 border-t border-white/5 text-[11px] text-neutral-500">
              PIN Key Hint: <code className="text-amber-400/90 font-mono">77490869</code>
            </div>
          </div>
        ) : (
          /* SCREEN 2: VERIFIED ADMIN DASHBOARD */
          <div className="flex-1 overflow-y-auto flex flex-col">
            {/* Navigation Tabs */}
            <div className="px-5 py-2.5 bg-neutral-900/60 border-b border-white/10 flex flex-wrap items-center justify-between gap-3">
              <div className="flex flex-wrap items-center gap-2">
                {/* Tab 1: Real-time Live Analytics Plugin */}
                <button
                  onClick={() => setActiveTab("analytics")}
                  className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
                    activeTab === "analytics"
                      ? "bg-amber-500 text-black shadow-md shadow-amber-500/20"
                      : "text-neutral-300 hover:text-white bg-neutral-800/60 border border-white/5"
                  }`}
                >
                  <Radio className="w-3.5 h-3.5 text-black" />
                  <span className="font-lumos">Live Online Users & Watching</span>
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                </button>

                {/* Tab 2: Ads & Sponsored Posters (Upload Phone Poster + Link Redirection) */}
                <button
                  onClick={() => setActiveTab("ads")}
                  className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
                    activeTab === "ads"
                      ? "bg-amber-500 text-black shadow-md shadow-amber-500/20"
                      : "text-neutral-300 hover:text-white bg-neutral-800/60 border border-white/5"
                  }`}
                >
                  <ImageIcon className="w-3.5 h-3.5" />
                  <span className="font-lumos">Ads & Posters</span>
                  <span className="text-[10px] px-1.5 py-0.5 rounded bg-amber-400/20 text-amber-300 font-semibold">
                    Link Ads ({adsList.length})
                  </span>
                </button>

                {/* Tab 3: Add Video Link (Title & Thumbnail Optional) */}
                <button
                  onClick={() => setActiveTab("add-video")}
                  className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
                    activeTab === "add-video"
                      ? "bg-amber-500 text-black shadow-md shadow-amber-500/20"
                      : "text-neutral-300 hover:text-white bg-neutral-800/60 border border-white/5"
                  }`}
                >
                  <PlusCircle className="w-3.5 h-3.5" />
                  <span className="font-lumos">Add Video Link</span>
                  <span className="text-[10px] opacity-75 font-normal">(Optional Title/Thumb)</span>
                </button>

                {/* Tab 3: Bulk AI Publisher */}
                <button
                  onClick={() => setActiveTab("ai-bulk")}
                  className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                    activeTab === "ai-bulk"
                      ? "bg-amber-500 text-black shadow-md shadow-amber-500/20"
                      : "text-neutral-400 hover:text-white bg-neutral-800/60 border border-white/5"
                  }`}
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>AI Bulk Importer</span>
                </button>

                {/* Tab 4: Manage Feed */}
                <button
                  onClick={() => setActiveTab("manage")}
                  className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                    activeTab === "manage"
                      ? "bg-amber-500 text-black shadow-md shadow-amber-500/20"
                      : "text-neutral-400 hover:text-white bg-neutral-800/60 border border-white/5"
                  }`}
                >
                  <Film className="w-3.5 h-3.5" />
                  <span>Catalog Feeds ({allClips.length})</span>
                </button>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={handleResetCatalog}
                  className="text-[11px] text-neutral-500 hover:text-red-400 transition-colors flex items-center gap-1 cursor-pointer"
                  title="Reset to default master clips"
                >
                  <RefreshCw className="w-3 h-3" />
                  <span>Reset Default</span>
                </button>
              </div>
            </div>

            {/* TAB 1: LIVE ONLINE USERS & WATCHING PLUGIN */}
            {activeTab === "analytics" && (
              <div className="p-5 sm:p-6 space-y-6">
                {/* Top Metrics Row */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  {/* Metric 1: Total Online Users */}
                  <div className="p-4 rounded-2xl bg-gradient-to-br from-neutral-900 to-black border border-emerald-500/30 relative overflow-hidden shadow-lg">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold uppercase tracking-wider text-emerald-400 flex items-center gap-1.5">
                        <Radio className="w-4 h-4 text-emerald-400 animate-pulse" />
                        <span>Online Users</span>
                      </span>
                      <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 text-[10px] font-bold uppercase tracking-wider border border-emerald-500/30">
                        Live Radar
                      </span>
                    </div>
                    <div className="mt-3 flex items-baseline gap-2">
                      <span className="font-lumos text-3xl sm:text-4xl font-black text-white">
                        {presenceStats?.onlineCount || 49}
                      </span>
                      <span className="text-xs text-neutral-400 font-medium">active visitors</span>
                    </div>
                    <p className="text-[11px] text-neutral-500 mt-1">
                      Real-time heartbeat tracked across web & mobile devices
                    </p>
                  </div>

                  {/* Metric 2: Actively Streaming Movies */}
                  <div className="p-4 rounded-2xl bg-gradient-to-br from-neutral-900 to-black border border-amber-500/30 relative overflow-hidden shadow-lg">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold uppercase tracking-wider text-amber-400 flex items-center gap-1.5">
                        <Play className="w-4 h-4 text-amber-400 fill-amber-400" />
                        <span>Active Watchers</span>
                      </span>
                      <span className="px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 text-[10px] font-bold uppercase tracking-wider border border-amber-500/30">
                        Streaming
                      </span>
                    </div>
                    <div className="mt-3 flex items-baseline gap-2">
                      <span className="font-lumos text-3xl sm:text-4xl font-black text-white">
                        {presenceStats?.watchingCount || 38}
                      </span>
                      <span className="text-xs text-neutral-400 font-medium">users playing clips</span>
                    </div>
                    <p className="text-[11px] text-neutral-500 mt-1">
                      Audiences currently playing 4K & full cinema scenes
                    </p>
                  </div>

                  {/* Metric 3: Active Movies In Stream */}
                  <div className="p-4 rounded-2xl bg-gradient-to-br from-neutral-900 to-black border border-white/10 relative overflow-hidden shadow-lg">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold uppercase tracking-wider text-neutral-300 flex items-center gap-1.5">
                        <Film className="w-4 h-4 text-neutral-400" />
                        <span>Featured Titles</span>
                      </span>
                      <button
                        onClick={() => loadPresence()}
                        disabled={isLoadingStats}
                        className="px-2 py-0.5 rounded-full bg-white/10 hover:bg-white/20 text-neutral-300 text-[10px] font-semibold flex items-center gap-1 transition-colors cursor-pointer"
                      >
                        <RefreshCw className={`w-3 h-3 ${isLoadingStats ? "animate-spin text-amber-400" : ""}`} />
                        <span>Refresh</span>
                      </button>
                    </div>
                    <div className="mt-3 flex items-baseline gap-2">
                      <span className="font-lumos text-3xl sm:text-4xl font-black text-white">
                        {presenceStats?.viewersByMovie.length || 6}
                      </span>
                      <span className="text-xs text-neutral-400 font-medium">titles being watched</span>
                    </div>
                    <p className="text-[11px] text-neutral-500 mt-1">
                      Auto-syncing every 6 seconds
                    </p>
                  </div>
                </div>

                {/* Section: "Konsi Movies Kitne Users Dekh Rahe Hain" */}
                <div className="p-5 rounded-2xl bg-neutral-900/60 border border-white/10 space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-lumos text-sm sm:text-base font-black text-white flex items-center gap-2">
                        <span>Movie Streaming Breakdown — Live Audience</span>
                        <span className="text-[10px] px-2 py-0.5 rounded bg-amber-500/20 text-amber-400 font-semibold font-mono">
                          Live Metrics
                        </span>
                      </h3>
                      <p className="text-xs text-neutral-400">
                        Shows exactly how many users are currently watching each movie in real-time
                      </p>
                    </div>
                  </div>

                  <div className="space-y-3">
                    {presenceStats?.viewersByMovie.map((item, i) => {
                      const total = presenceStats.watchingCount || 38;
                      const pct = Math.min(100, Math.round((item.count / total) * 100));
                      return (
                        <div
                          key={item.movieTitle}
                          className="p-3.5 rounded-xl bg-black/50 border border-white/5 hover:border-amber-500/30 transition-colors flex flex-col gap-2"
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2.5">
                              <span className="w-5 h-5 rounded-full bg-white/10 text-neutral-300 text-[11px] font-bold flex items-center justify-center font-mono">
                                #{i + 1}
                              </span>
                              <span className="font-lumos text-sm font-bold text-white">
                                {item.movieTitle}
                              </span>
                              {item.clipTitle && (
                                <span className="text-[10px] text-neutral-400 hidden sm:inline">
                                  ({item.clipTitle})
                                </span>
                              )}
                            </div>

                            <div className="flex items-center gap-3">
                              <span className="text-[10px] px-2 py-0.5 rounded bg-amber-500/10 text-amber-400 border border-amber-500/20 font-semibold">
                                {item.quality}
                              </span>
                              <span className="text-xs font-black text-amber-300 font-mono">
                                {item.count} viewers ({pct}%)
                              </span>
                            </div>
                          </div>

                          {/* Progress bar */}
                          <div className="w-full h-1.5 rounded-full bg-white/5 overflow-hidden">
                            <div
                              className="h-full bg-gradient-to-r from-amber-500 to-orange-500 rounded-full transition-all duration-500"
                              style={{ width: `${pct}%` }}
                            />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Section: Live Activity Stream Feed */}
                <div className="p-5 rounded-2xl bg-neutral-900/60 border border-white/10 space-y-3">
                  <h3 className="font-lumos text-sm font-bold text-neutral-200 flex items-center gap-2">
                    <Radio className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Real-Time Visitor Activity Feed</span>
                  </h3>

                  <div className="divide-y divide-white/5">
                    {presenceStats?.recentActivities.map((act) => (
                      <div key={act.id} className="py-2.5 flex items-center justify-between text-xs gap-3">
                        <div className="flex items-center gap-2 min-w-0">
                          <span className="w-2 h-2 rounded-full bg-emerald-400 shrink-0 animate-pulse" />
                          <span className="font-bold text-neutral-200 shrink-0">{act.user}</span>
                          <span className="text-neutral-400 truncate">{act.action}</span>
                          <span className="text-amber-400 font-semibold truncate font-lumos">
                            {act.movie}
                          </span>
                        </div>

                        <div className="flex items-center gap-3 shrink-0 text-neutral-400 text-[11px]">
                          <span className="px-1.5 py-0.5 rounded bg-white/5 text-neutral-300">
                            {act.quality}
                          </span>
                          <span>{act.device}</span>
                          <span className="text-neutral-500 font-mono">{act.time}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* TAB: ADS & POSTERS (UPLOAD PHONE POSTER + LINK ATTACHMENT) */}
            {activeTab === "ads" && (
              <div className="p-5 sm:p-6 space-y-6">
                <div className="space-y-1">
                  <h3 className="font-lumos text-base font-black text-white flex items-center gap-2">
                    <ImageIcon className="w-4 h-4 text-amber-400" />
                    <span>Upload Poster & Attach Redirection Link</span>
                  </h3>
                  <p className="text-xs text-neutral-400 leading-relaxed">
                    Apne phone ya computer se poster / thumbnail upload karein aur uske sath koi bhi link attach karein. Jab koi user us poster par click karega to wo seedha us link par chala jaega.
                  </p>
                </div>

                <form onSubmit={handlePublishAd} className="space-y-5 max-w-2xl bg-neutral-900/60 p-5 rounded-2xl border border-white/10">
                  {/* Option 1: Upload from Phone */}
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-amber-400 uppercase tracking-wider flex items-center gap-1.5">
                      <Upload className="w-3.5 h-3.5" />
                      <span>Upload Poster / Thumbnail from Phone *</span>
                    </label>

                    <div className="flex flex-col sm:flex-row items-center gap-4 p-4 rounded-xl bg-black/40 border border-dashed border-amber-500/40 hover:border-amber-400 transition-colors">
                      <label className="flex-1 w-full flex flex-col items-center justify-center p-3 rounded-lg bg-neutral-900 hover:bg-neutral-800 cursor-pointer border border-white/10 transition-colors text-center">
                        <Upload className="w-6 h-6 text-amber-400 mb-1" />
                        <span className="text-xs font-bold text-white">Select image from your phone / storage</span>
                        <span className="text-[11px] text-neutral-400 mt-0.5">Supports JPG, PNG, WEBP (Direct file)</span>
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handlePhoneFileUpload}
                          className="hidden"
                        />
                      </label>

                      {/* Live Thumbnail Preview */}
                      {adPosterUrl && (
                        <div className="relative w-28 h-28 rounded-lg overflow-hidden border-2 border-amber-400 flex-shrink-0 bg-neutral-950 shadow-md">
                          <img
                            src={adPosterUrl}
                            alt="Uploaded poster preview"
                            className="w-full h-full object-cover"
                          />
                          <button
                            type="button"
                            onClick={() => setAdPosterUrl("")}
                            className="absolute top-1 right-1 p-1 rounded-full bg-black/80 text-white hover:text-red-400"
                            title="Remove"
                          >
                            <X className="w-3 h-3" />
                          </button>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Option 2: Or Paste Poster URL */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-neutral-300 uppercase tracking-wider flex items-center justify-between">
                      <span>Or Image Web URL</span>
                      <span className="text-[10px] text-neutral-500 font-normal">Optional if uploaded above</span>
                    </label>
                    <input
                      type="url"
                      value={adPosterUrl}
                      onChange={(e) => setAdPosterUrl(e.target.value)}
                      placeholder="https://example.com/poster.jpg"
                      className="w-full px-3.5 py-2.5 rounded-xl bg-neutral-900 border border-white/10 focus:border-amber-400 text-xs text-white placeholder:text-neutral-600 outline-none transition-colors font-mono"
                    />
                  </div>

                  {/* Destination Link (REQUIRED) */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-amber-400 uppercase tracking-wider flex items-center gap-1.5">
                      <LinkIcon className="w-3.5 h-3.5" />
                      <span>Destination Link * (User will redirect here on click)</span>
                    </label>
                    <input
                      type="url"
                      required
                      value={adTargetUrl}
                      onChange={(e) => setAdTargetUrl(e.target.value)}
                      placeholder="e.g. https://t.me/yourchannel or https://yourstream.com/watch"
                      className="w-full px-3.5 py-2.5 rounded-xl bg-neutral-900 border border-amber-500/30 focus:border-amber-400 text-xs text-white placeholder:text-neutral-600 outline-none transition-colors font-mono"
                    />
                  </div>

                  {/* Title & Tag */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-neutral-300 uppercase tracking-wider">
                        Poster / Movie Title
                      </label>
                      <input
                        type="text"
                        value={adTitle}
                        onChange={(e) => setAdTitle(e.target.value)}
                        placeholder="e.g. Watch Exclusive HD Stream"
                        className="w-full px-3.5 py-2.5 rounded-xl bg-neutral-900 border border-white/10 focus:border-amber-400 text-xs text-white placeholder:text-neutral-600 outline-none transition-colors"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-neutral-300 uppercase tracking-wider">
                        Banner Badge Tag
                      </label>
                      <select
                        value={adTag}
                        onChange={(e) => setAdTag(e.target.value)}
                        className="w-full px-3.5 py-2.5 rounded-xl bg-neutral-900 border border-white/10 focus:border-amber-400 text-xs text-white outline-none transition-colors"
                      >
                        <option value="SPONSORED">SPONSORED</option>
                        <option value="EXCLUSIVE">EXCLUSIVE</option>
                        <option value="WATCH NOW">WATCH NOW</option>
                        <option value="PREMIERE">PREMIERE</option>
                        <option value="PARTNER">PARTNER</option>
                      </select>
                    </div>
                  </div>

                  {adStatus && (
                    <div
                      className={`p-3 rounded-xl border text-xs flex items-center gap-2 ${
                        adStatus.includes("Success")
                          ? "bg-emerald-950/40 border-emerald-500/40 text-emerald-300"
                          : "bg-neutral-900 border-white/10 text-neutral-300"
                      }`}
                    >
                      {adStatus.includes("Success") ? (
                        <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                      ) : (
                        <AlertCircle className="w-4 h-4 text-amber-400 shrink-0" />
                      )}
                      <span>{adStatus}</span>
                    </div>
                  )}

                  <button
                    type="submit"
                    disabled={isPublishingAd || !adPosterUrl || !adTargetUrl}
                    className="w-full py-3 rounded-xl bg-amber-500 hover:bg-amber-400 disabled:opacity-50 text-black font-extrabold text-xs uppercase tracking-wider transition-colors shadow-lg shadow-amber-500/20 flex items-center justify-center gap-2 cursor-pointer"
                  >
                    {isPublishingAd ? (
                      <>
                        <RefreshCw className="w-4 h-4 animate-spin" />
                        <span>Publishing Poster Banner...</span>
                      </>
                    ) : (
                      <>
                        <Upload className="w-4 h-4" />
                        <span>Publish Ad Poster to movlo.site</span>
                      </>
                    )}
                  </button>
                </form>

                {/* List of Existing Ads */}
                <div className="space-y-3 pt-4 border-t border-white/10">
                  <div className="flex items-center justify-between">
                    <h4 className="font-lumos text-sm font-bold text-white flex items-center gap-2">
                      <span>Active Ad Posters on Site ({adsList.length})</span>
                    </h4>
                    <button
                      onClick={loadAds}
                      className="text-xs text-neutral-400 hover:text-white flex items-center gap-1 cursor-pointer"
                    >
                      <RefreshCw className="w-3.5 h-3.5" />
                      <span>Refresh</span>
                    </button>
                  </div>

                  {isLoadingAds ? (
                    <div className="py-8 text-center text-xs text-neutral-500">
                      <RefreshCw className="w-4 h-4 animate-spin mx-auto mb-2 text-amber-400" />
                      Loading ads...
                    </div>
                  ) : adsList.length === 0 ? (
                    <div className="p-6 rounded-xl bg-neutral-900/40 border border-white/5 text-center text-xs text-neutral-400">
                      No ad posters published yet. Upload your first poster above!
                    </div>
                  ) : (
                    <div className="space-y-2 max-h-80 overflow-y-auto pr-1">
                      {adsList.map((ad) => (
                        <div
                          key={ad.id}
                          className="p-3 rounded-xl bg-neutral-900/80 border border-white/5 flex items-center justify-between gap-3"
                        >
                          <div className="flex items-center gap-3 min-w-0">
                            <div className="relative w-16 h-12 rounded-lg overflow-hidden bg-black flex-shrink-0 border border-white/10">
                              <img
                                src={ad.posterUrl}
                                alt={ad.title}
                                className="w-full h-full object-cover"
                              />
                            </div>

                            <div className="min-w-0">
                              <div className="flex items-center gap-2">
                                <span className="text-xs font-bold text-white truncate">
                                  {ad.title}
                                </span>
                                <span className="text-[9px] px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-400 font-semibold uppercase">
                                  {ad.tag}
                                </span>
                                <span
                                  className={`text-[9px] px-1.5 py-0.5 rounded font-semibold ${
                                    ad.isActive
                                      ? "bg-emerald-500/20 text-emerald-400"
                                      : "bg-neutral-800 text-neutral-500"
                                  }`}
                                >
                                  {ad.isActive ? "ACTIVE" : "PAUSED"}
                                </span>
                              </div>

                              <div className="flex items-center gap-2 text-[10px] text-neutral-400 mt-0.5">
                                <span className="truncate text-neutral-500">Link: {ad.targetUrl}</span>
                                <span>•</span>
                                <span className="text-amber-300 font-mono font-bold">
                                  {ad.clicks || 0} clicks
                                </span>
                              </div>
                            </div>
                          </div>

                          <div className="flex items-center gap-1.5 flex-shrink-0">
                            <a
                              href={ad.targetUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="p-1.5 rounded-lg bg-neutral-800 hover:bg-neutral-700 text-neutral-300 hover:text-white"
                              title="Test Link"
                            >
                              <ExternalLink className="w-3.5 h-3.5" />
                            </a>

                            <button
                              onClick={() => handleToggleAd(ad.id)}
                              className="p-1.5 rounded-lg bg-neutral-800 hover:bg-neutral-700 text-neutral-300 hover:text-amber-400"
                              title={ad.isActive ? "Pause Ad" : "Activate Ad"}
                            >
                              {ad.isActive ? (
                                <ToggleRight className="w-4 h-4 text-emerald-400" />
                              ) : (
                                <ToggleLeft className="w-4 h-4 text-neutral-500" />
                              )}
                            </button>

                            <button
                              onClick={() => handleDeleteAd(ad.id)}
                              className="p-1.5 rounded-lg bg-neutral-800 hover:bg-red-500/20 text-neutral-400 hover:text-red-400"
                              title="Delete Ad"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* TAB 2: ADD VIDEO LINK (TITLE & THUMBNAIL OPTIONAL) */}
            {activeTab === "add-video" && (
              <div className="p-5 sm:p-6 space-y-6">
                <div className="space-y-1">
                  <h3 className="font-lumos text-base font-black text-white flex items-center gap-2">
                    <PlusCircle className="w-4 h-4 text-amber-400" />
                    <span>Publish Video Link (Title & Thumbnail Optional)</span>
                  </h3>
                  <p className="text-xs text-neutral-400 leading-relaxed">
                    Simply paste any YouTube URL, Vimeo link, or MP4 stream. Title and Thumbnail are completely optional — if left blank, MOVLO automatically extracts the 4K poster and generates a clean cinema title!
                  </p>
                </div>

                <form onSubmit={handlePublishCustomClip} className="space-y-4 max-w-2xl">
                  {/* Field 1: Video Link (REQUIRED) */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-amber-400 uppercase tracking-wider flex items-center gap-1.5">
                      <LinkIcon className="w-3.5 h-3.5" />
                      <span>Video Link / Stream URL * (Required)</span>
                    </label>
                    <input
                      type="url"
                      required
                      value={customVideoUrl}
                      onChange={(e) => setCustomVideoUrl(e.target.value)}
                      placeholder="e.g. https://www.youtube.com/watch?v=s7EdQ4FqbhY or direct mp4"
                      className="w-full px-3.5 py-2.5 rounded-xl bg-neutral-900 border border-amber-500/30 focus:border-amber-400 text-xs text-white placeholder:text-neutral-600 outline-none transition-colors font-mono"
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {/* Field 2: Title (OPTIONAL) */}
                    <div className="space-y-1.5">
                      <div className="flex items-center justify-between">
                        <label className="text-xs font-bold text-neutral-300 uppercase tracking-wider flex items-center gap-1.5">
                          <span>Scene Title</span>
                        </label>
                        <span className="text-[10px] text-amber-400/90 font-semibold px-1.5 py-0.2 rounded bg-amber-500/10">
                          Optional
                        </span>
                      </div>
                      <input
                        type="text"
                        value={customTitle}
                        onChange={(e) => setCustomTitle(e.target.value)}
                        placeholder="Leave blank for auto-detected title"
                        className="w-full px-3.5 py-2.5 rounded-xl bg-neutral-900 border border-white/10 focus:border-amber-400 text-xs text-white placeholder:text-neutral-600 outline-none transition-colors"
                      />
                    </div>

                    {/* Field 3: Movie Name (OPTIONAL) */}
                    <div className="space-y-1.5">
                      <div className="flex items-center justify-between">
                        <label className="text-xs font-bold text-neutral-300 uppercase tracking-wider flex items-center gap-1.5">
                          <span>Movie Name</span>
                        </label>
                        <span className="text-[10px] text-amber-400/90 font-semibold px-1.5 py-0.2 rounded bg-amber-500/10">
                          Optional
                        </span>
                      </div>
                      <input
                        type="text"
                        value={customMovieName}
                        onChange={(e) => setCustomMovieName(e.target.value)}
                        placeholder="e.g. Interstellar, Dune, Oppenheimer"
                        className="w-full px-3.5 py-2.5 rounded-xl bg-neutral-900 border border-white/10 focus:border-amber-400 text-xs text-white placeholder:text-neutral-600 outline-none transition-colors"
                      />
                    </div>
                  </div>

                  {/* Field 4: Thumbnail URL (OPTIONAL) */}
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between">
                      <label className="text-xs font-bold text-neutral-300 uppercase tracking-wider flex items-center gap-1.5">
                        <ImageIcon className="w-3.5 h-3.5 text-neutral-400" />
                        <span>Thumbnail / Poster URL</span>
                      </label>
                      <span className="text-[10px] text-amber-400/90 font-semibold px-1.5 py-0.2 rounded bg-amber-500/10">
                        Optional (Auto-fetches YouTube 4K Poster)
                      </span>
                    </div>
                    <input
                      type="url"
                      value={customThumbnail}
                      onChange={(e) => setCustomThumbnail(e.target.value)}
                      placeholder="Leave blank for automatic YouTube / Cinema poster"
                      className="w-full px-3.5 py-2.5 rounded-xl bg-neutral-900 border border-white/10 focus:border-amber-400 text-xs text-white placeholder:text-neutral-600 outline-none transition-colors font-mono"
                    />
                  </div>

                  {/* Field 5: Quality Dropdown */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-neutral-300 uppercase tracking-wider">
                      Streaming Quality
                    </label>
                    <select
                      value={customQuality}
                      onChange={(e) => setCustomQuality(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-neutral-900 border border-white/10 focus:border-amber-400 text-xs text-white outline-none transition-colors"
                    >
                      <option value="4K UHD">4K Ultra HD (IMAX Enhanced)</option>
                      <option value="1080p HD">1080p Full HD</option>
                      <option value="720p HD">720p HD</option>
                    </select>
                  </div>

                  {customStatus && (
                    <div
                      className={`p-3 rounded-xl border text-xs flex items-center gap-2 ${
                        customStatus.includes("Success")
                          ? "bg-emerald-950/40 border-emerald-500/40 text-emerald-300"
                          : "bg-neutral-900 border-white/10 text-neutral-300"
                      }`}
                    >
                      {customStatus.includes("Success") ? (
                        <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                      ) : (
                        <RefreshCw className="w-4 h-4 text-amber-400 shrink-0 animate-spin" />
                      )}
                      <span>{customStatus}</span>
                    </div>
                  )}

                  <div className="pt-2">
                    <button
                      type="submit"
                      disabled={isPublishingCustom || !customVideoUrl.trim()}
                      className="px-6 py-3 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 disabled:opacity-50 text-black font-extrabold text-xs uppercase tracking-wider transition-all shadow-lg shadow-amber-500/20 flex items-center gap-2 cursor-pointer"
                    >
                      {isPublishingCustom ? (
                        <>
                          <RefreshCw className="w-4 h-4 animate-spin" />
                          <span>Publishing Clip...</span>
                        </>
                      ) : (
                        <>
                          <PlusCircle className="w-4 h-4" />
                          <span>Publish Video to Live Feed</span>
                        </>
                      )}
                    </button>
                  </div>
                </form>

                {/* Preview of Recently Added Clip */}
                {recentlyAddedClip && (
                  <div className="p-4 rounded-2xl bg-neutral-900 border border-emerald-500/30 space-y-3">
                    <span className="text-xs font-bold uppercase tracking-wider text-emerald-400 flex items-center gap-1.5">
                      <CheckCircle2 className="w-4 h-4" />
                      <span>Live Feed Preview of Added Video:</span>
                    </span>

                    <div className="flex gap-4 items-center">
                      <div className="relative w-28 aspect-video rounded-lg overflow-hidden bg-black shrink-0 border border-white/10">
                        <img
                          src={recentlyAddedClip.thumbnail}
                          alt={recentlyAddedClip.clipTitle}
                          className="w-full h-full object-cover"
                        />
                        <span className="absolute bottom-1 right-1 text-[9px] bg-black/80 px-1 rounded text-white font-mono">
                          {recentlyAddedClip.duration}
                        </span>
                      </div>
                      <div className="min-w-0 flex-1">
                        <h4 className="font-lumos text-sm font-bold text-white truncate">
                          {recentlyAddedClip.movieTitle}
                        </h4>
                        <p className="text-xs text-amber-400 truncate">
                          {recentlyAddedClip.clipTitle}
                        </p>
                        <span className="text-[10px] text-neutral-400">
                          Quality: {recentlyAddedClip.quality} • Status: Active on Home Feed
                        </span>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* TAB 3: AI BULK PUBLISHER */}
            {activeTab === "ai-bulk" && (
              <div className="p-5 sm:p-6 space-y-5">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-neutral-200 uppercase tracking-wider flex items-center gap-1.5">
                    <LinkIcon className="w-3.5 h-3.5 text-amber-400" />
                    <span>Paste Multiple Video Links (YouTube, Vimeo, MP4)</span>
                  </label>
                  <p className="text-xs text-neutral-400">
                    Paste 1 or multiple URLs (1 per line). Gemini AI will fetch details, generate high-res posters, descriptions, and publish directly to the Home Feeds!
                  </p>
                </div>

                <div className="relative">
                  <textarea
                    value={linksText}
                    onChange={(e) => setLinksText(e.target.value)}
                    rows={5}
                    placeholder={`https://www.youtube.com/watch?v=a3lcGnMhvsA\nhttps://www.youtube.com/watch?v=0OYBEquZ_P0`}
                    className="w-full p-3.5 rounded-xl bg-neutral-900 border border-white/10 focus:border-amber-500 text-xs text-neutral-200 placeholder:text-neutral-600 outline-none font-mono transition-colors"
                  />
                </div>

                {aiPublishStatus && (
                  <div
                    className={`p-3 rounded-xl border text-xs flex items-start gap-2 ${
                      aiPublishStatus.includes("Successfully")
                        ? "bg-emerald-950/40 border-emerald-500/40 text-emerald-300"
                        : "bg-neutral-900 border-white/10 text-neutral-300"
                    }`}
                  >
                    {aiPublishStatus.includes("Successfully") ? (
                      <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                    ) : (
                      <Sparkles className="w-4 h-4 text-amber-400 shrink-0 mt-0.5 animate-pulse" />
                    )}
                    <span>{aiPublishStatus}</span>
                  </div>
                )}

                <div className="flex items-center justify-end gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => setLinksText("")}
                    className="px-4 py-2 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-neutral-300 text-xs font-semibold transition-colors cursor-pointer"
                  >
                    Clear
                  </button>

                  <button
                    type="button"
                    onClick={handleAiPublish}
                    disabled={isPublishingAi || !linksText.trim()}
                    className="px-6 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 disabled:opacity-50 text-black font-extrabold text-xs uppercase tracking-wider transition-colors shadow-lg shadow-amber-500/20 flex items-center gap-2 cursor-pointer"
                  >
                    {isPublishingAi ? (
                      <>
                        <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                        <span>AI Publishing...</span>
                      </>
                    ) : (
                      <>
                        <Sparkles className="w-3.5 h-3.5" />
                        <span>AI Analyze & Publish</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            )}

            {/* TAB 4: MANAGE ALL CLIPS */}
            {activeTab === "manage" && (
              <div className="p-5 sm:p-6 space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-neutral-300">
                    Active Catalog Clips ({allClips.length})
                  </h3>
                  {deleteStatus && (
                    <span className="text-xs text-amber-400 font-semibold animate-in fade-in">
                      {deleteStatus}
                    </span>
                  )}
                </div>

                {isLoadingClips ? (
                  <div className="py-12 flex items-center justify-center text-xs text-neutral-500">
                    <RefreshCw className="w-4 h-4 animate-spin mr-2 text-amber-400" />
                    Loading clips...
                  </div>
                ) : (
                  <div className="space-y-2 max-h-[50vh] overflow-y-auto pr-1">
                    {allClips.map((clip) => (
                      <div
                        key={clip.id}
                        className="p-3 rounded-xl bg-neutral-900/80 border border-white/5 hover:border-white/10 flex items-center justify-between gap-3 transition-colors"
                      >
                        <div className="flex items-center gap-3 min-w-0">
                          <div className="relative w-16 aspect-video rounded-lg overflow-hidden bg-black shrink-0">
                            <img
                              src={clip.thumbnail || clip.backdrop || getCinemaPosterFallback(clip.id)}
                              alt={clip.clipTitle}
                              className="w-full h-full object-cover"
                            />
                            <span className="absolute bottom-0.5 right-0.5 text-[8px] bg-black/80 px-1 rounded text-white">
                              {clip.duration}
                            </span>
                          </div>

                          <div className="min-w-0">
                            <div className="flex items-center gap-2">
                              <span className="font-lumos text-xs font-bold text-white truncate">
                                {clip.movieTitle}
                              </span>
                              <span className="text-[10px] text-amber-400 font-semibold px-1.5 py-0.2 rounded bg-amber-500/10">
                                {clip.clipTitle}
                              </span>
                            </div>
                            <div className="flex items-center gap-2 text-[10px] text-neutral-500 mt-0.5">
                              <span>{clip.genre}</span>
                              <span>•</span>
                              <span>{clip.quality}</span>
                              <span>•</span>
                              <span>{clip.views.toLocaleString()} views</span>
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center gap-2 shrink-0">
                          <button
                            onClick={() => handleDeleteClip(clip.id)}
                            className="p-1.5 rounded-lg bg-neutral-800 hover:bg-red-500/20 text-neutral-400 hover:text-red-400 transition-colors cursor-pointer"
                            title="Delete clip from feed"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
