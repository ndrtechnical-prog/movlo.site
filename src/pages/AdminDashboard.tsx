import React, { useCallback, useEffect, useMemo, useState } from "react";
import { User } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import {
  LayoutDashboard,
  FileText,
  TrendingUp,
  Search,
  Bot,
  Megaphone,
  Settings,
  LogOut,
  Plus,
  Trash2,
  Eye,
  Upload,
  Sparkles,
  CheckCircle2,
  Database
} from "lucide-react";
import {
  AdSettings,
  Article,
  ArticleStatus,
  AutomationReport,
  Category,
  ContactMessage,
  SiteSettings,
  TrendingTopic
} from "../types";
import {
  auth,
  db,
  isBootstrappedAdmin,
  signInWithGoogle,
  signOutUser
} from "../lib/firebase";
import {
  computeReadingTime,
  deleteArticleById,
  fetchAllArticlesAdmin,
  fetchAutomationReportsAdmin,
  fetchContactMessagesAdmin,
  fetchTrendingTopicsAdmin,
  markContactMessageReviewed,
  sanitizeSlug,
  saveArticle,
  saveAutomationReport,
  saveTrendingTopic,
  seedInitialEditorialData
} from "../lib/firestoreRepo";
import { uploadEditorialImage } from "../lib/imageUpload";
import { AdminTrendsAndAi } from "../components/admin/AdminTrendsAndAi";
import { AdminSettingsAndAds } from "../components/admin/AdminSettingsAndAds";
import { MarkdownRenderer } from "../components/MarkdownRenderer";
import { formatEditorialDate } from "../components/ArticleCard";

type AdminTab =
  | "overview"
  | "articles"
  | "trends"
  | "seo"
  | "automation"
  | "ads"
  | "settings";

interface AdminDashboardProps {
  user: User | null;
  authReady: boolean;
  categories: Category[];
  metricsMap: Record<string, number>;
  siteSettings: SiteSettings;
  adSettings: AdSettings;
  onRefreshPublicData: () => Promise<void>;
  onNavigate: (path: string) => void;
}

const LOCAL_IMAGE_PRESETS = [
  { label: "AI & Computing", url: "/assets/editorial/ai-computing.jpg" },
  { label: "Technology & Devices", url: "/assets/editorial/tech-devices.jpg" },
  { label: "Entertainment & Cinema", url: "/assets/editorial/cinema-culture.jpg" },
  { label: "Gaming Studio", url: "/assets/editorial/gaming-studio.jpg" },
  { label: "Social Media Desk", url: "/assets/editorial/social-media.jpg" }
];

function createBlankArticle(uid: string): Article {
  return {
    id: `art-${Date.now().toString(36)}`,
    title: "",
    slug: "",
    summary: "",
    contentMarkdown: "",
    categorySlug: "trending-news",
    categoryName: "Trending News",
    primaryKeyword: "",
    secondaryKeywords: [],
    faqs: [],
    externalSources: [],
    featuredImageUrl: "/assets/editorial/ai-computing.jpg",
    featuredImageAlt: "",
    authorName: "MOVLO Editorial Desk",
    authorUid: uid,
    seoTitle: "",
    seoDescription: "",
    canonicalUrl: "",
    schemaType: "Article",
    status: "draft",
    readingTimeMinutes: 3,
    isBreaking: false,
    isFeatured: false,
    isPopular: false
  };
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({
  user,
  authReady,
  categories,
  metricsMap,
  siteSettings,
  adSettings,
  onRefreshPublicData,
  onNavigate
}) => {
  const [isAuthorizedAdmin, setIsAuthorizedAdmin] = useState(false);
  const [checkingAdmin, setCheckingAdmin] = useState(true);
  const [activeTab, setActiveTab] = useState<AdminTab>("overview");

  const [adminArticles, setAdminArticles] = useState<Article[]>([]);
  const [savedTopics, setSavedTopics] = useState<TrendingTopic[]>([]);
  const [automationReports, setAutomationReports] = useState<AutomationReport[]>([]);
  const [contactMessages, setContactMessages] = useState<ContactMessage[]>([]);

  const [editingArticle, setEditingArticle] = useState<Article | null>(null);
  const [isNewArticle, setIsNewArticle] = useState(false);
  const [previewMode, setPreviewMode] = useState(false);
  const [headlineSuggestions, setHeadlineSuggestions] = useState<string[]>([]);

  const [seoTargetId, setSeoTargetId] = useState<string>("");
  const [busyMessage, setBusyMessage] = useState("");
  const [errorBanner, setErrorBanner] = useState("");
  const [runningAuto, setRunningAuto] = useState(false);

  const loadAdminWorkspace = useCallback(async () => {
    try {
      const [arts, topics, reports, msgs] = await Promise.all([
        fetchAllArticlesAdmin(),
        fetchTrendingTopicsAdmin(),
        fetchAutomationReportsAdmin(),
        fetchContactMessagesAdmin().catch(() => [])
      ]);
      setAdminArticles(arts);
      setSavedTopics(topics);
      setAutomationReports(reports);
      setContactMessages(msgs);
      if (arts.length > 0 && !seoTargetId) {
        setSeoTargetId(arts[0].id);
      }
    } catch (err: any) {
      setErrorBanner(err?.message || "Could not load editorial workspace data.");
    }
  }, [seoTargetId]);

  useEffect(() => {
    let active = true;
    async function verifyRole() {
      if (!authReady) return;
      if (!user) {
        if (active) {
          setIsAuthorizedAdmin(false);
          setCheckingAdmin(false);
        }
        return;
      }

      setCheckingAdmin(true);
      try {
        if (isBootstrappedAdmin(user)) {
          if (active) {
            setIsAuthorizedAdmin(true);
            setCheckingAdmin(false);
          }
          await loadAdminWorkspace();
          return;
        }
        const snap = await getDoc(doc(db, "admins", user.uid));
        const ok = snap.exists() && user.emailVerified;
        if (active) {
          setIsAuthorizedAdmin(ok);
          setCheckingAdmin(false);
        }
        if (ok) {
          await loadAdminWorkspace();
        }
      } catch {
        if (active) {
          setIsAuthorizedAdmin(false);
          setCheckingAdmin(false);
        }
      }
    }

    verifyRole();
    return () => {
      active = false;
    };
  }, [user, authReady, loadAdminWorkspace]);

  const totalViews = useMemo(
    () =>
      Object.values(metricsMap).reduce<number>(
        (sum, v) => sum + (typeof v === "number" ? v : 0),
        0
      ),
    [metricsMap]
  );

  const publishedCount = useMemo(
    () => adminArticles.filter((a) => a.status === "published").length,
    [adminArticles]
  );
  const draftCount = useMemo(
    () => adminArticles.filter((a) => a.status === "draft" || a.status === "scheduled").length,
    [adminArticles]
  );

  const handleSignIn = async () => {
    setErrorBanner("");
    try {
      await signInWithGoogle();
    } catch (err: any) {
      setErrorBanner(err?.message || "Google sign-in failed.");
    }
  };

  const handleSeedCatalog = async () => {
    if (!user) return;
    setBusyMessage("Seeding categories, settings, and starter articles into Firestore...");
    setErrorBanner("");
    try {
      const res = await seedInitialEditorialData(user.uid);
      await Promise.all([loadAdminWorkspace(), onRefreshPublicData()]);
      setBusyMessage(
        `Firestore synced (${res.categoriesSeeded} categories, ${res.articlesSeeded} starter articles added).`
      );
    } catch (err: any) {
      setErrorBanner(err?.message || "Failed to seed Firestore.");
      setBusyMessage("");
    }
  };

  const getBearerHeader = async () => {
    const token = await auth.currentUser?.getIdToken();
    if (!token) throw new Error("Sign in required.");
    return {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`
    };
  };

  const handleSaveEditorArticle = async (overrideStatus?: ArticleStatus) => {
    if (!editingArticle || !user) return;
    setErrorBanner("");
    if (editingArticle.title.trim().length < 5) {
      setErrorBanner("Headline must be at least 5 characters.");
      return;
    }
    if (editingArticle.summary.trim().length < 10) {
      setErrorBanner("Summary must be at least 10 characters.");
      return;
    }
    if (editingArticle.contentMarkdown.trim().length < 50) {
      setErrorBanner("Article body must be at least 50 characters.");
      return;
    }

    const cat = categories.find((c) => c.slug === editingArticle.categorySlug);
    const finalStatus = overrideStatus || editingArticle.status;
    const finalSlug = sanitizeSlug(editingArticle.slug || editingArticle.title);

    setBusyMessage("Saving article to Firestore...");
    try {
      await saveArticle(
        {
          ...editingArticle,
          slug: finalSlug,
          categoryName: cat?.name || editingArticle.categoryName || "Trending News",
          status: finalStatus,
          canonicalUrl:
            editingArticle.canonicalUrl?.trim() || `https://movlo.site/article/${finalSlug}`,
          readingTimeMinutes: computeReadingTime(editingArticle.contentMarkdown),
          publishedAt:
            finalStatus === "published"
              ? editingArticle.publishedAt || new Date().toISOString()
              : editingArticle.publishedAt
        },
        isNewArticle
      );

      setIsNewArticle(false);
      setEditingArticle((prev) => (prev ? { ...prev, slug: finalSlug, status: finalStatus } : null));
      await Promise.all([loadAdminWorkspace(), onRefreshPublicData()]);
      setBusyMessage(`Article saved (${finalStatus}).`);
    } catch (err: any) {
      setErrorBanner(err?.message || "Failed to save article.");
      setBusyMessage("");
    }
  };

  const handleImageFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !editingArticle) return;
    setBusyMessage("Compressing image to WebP and uploading to Firebase Storage...");
    setErrorBanner("");
    try {
      const url = await uploadEditorialImage(file, editingArticle.slug || editingArticle.title);
      setEditingArticle({ ...editingArticle, featuredImageUrl: url });
      setBusyMessage("Featured image uploaded to Firebase Storage.");
    } catch (err: any) {
      setErrorBanner(err?.message || "Image upload failed.");
      setBusyMessage("");
    }
  };

  const handleAiHelper = async (
    action: "titles" | "meta" | "faqs" | "improve"
  ) => {
    if (!editingArticle) return;
    setErrorBanner("");
    setBusyMessage("Running Gemini editorial assistant...");
    try {
      const headers = await getBearerHeader();
      if (action === "titles") {
        const resp = await fetch("/api/ai/regenerate-title", {
          method: "POST",
          headers,
          body: JSON.stringify({
            currentTitle: editingArticle.title,
            summary: editingArticle.summary,
            primaryKeyword: editingArticle.primaryKeyword
          })
        });
        const data = await resp.json();
        if (!resp.ok) throw new Error(data.message);
        setHeadlineSuggestions(data.titles || []);
      } else if (action === "meta") {
        const resp = await fetch("/api/ai/meta-description", {
          method: "POST",
          headers,
          body: JSON.stringify({
            title: editingArticle.title,
            contentMarkdown: editingArticle.contentMarkdown,
            primaryKeyword: editingArticle.primaryKeyword
          })
        });
        const data = await resp.json();
        if (!resp.ok) throw new Error(data.message);
        setEditingArticle({
          ...editingArticle,
          seoTitle: data.seoTitle,
          seoDescription: data.seoDescription
        });
      } else if (action === "faqs") {
        const resp = await fetch("/api/ai/suggest-faqs", {
          method: "POST",
          headers,
          body: JSON.stringify({
            title: editingArticle.title,
            contentMarkdown: editingArticle.contentMarkdown
          })
        });
        const data = await resp.json();
        if (!resp.ok) throw new Error(data.message);
        setEditingArticle({
          ...editingArticle,
          faqs: [...(editingArticle.faqs || []), ...(data.faqs || [])].slice(0, 10)
        });
      } else if (action === "improve") {
        const resp = await fetch("/api/ai/improve-article", {
          method: "POST",
          headers,
          body: JSON.stringify({
            title: editingArticle.title,
            contentMarkdown: editingArticle.contentMarkdown
          })
        });
        const data = await resp.json();
        if (!resp.ok) throw new Error(data.message);
        setEditingArticle({
          ...editingArticle,
          summary: data.summary || editingArticle.summary,
          contentMarkdown: data.contentMarkdown || editingArticle.contentMarkdown
        });
      }
      setBusyMessage("AI editorial suggestion applied.");
    } catch (err: any) {
      setErrorBanner(err?.message || "AI helper request failed.");
      setBusyMessage("");
    }
  };

  const handleRunDailyWorkflow = async () => {
    if (!user) return;
    setRunningAuto(true);
    setErrorBanner("");
    setBusyMessage("Running daily trend discovery & deduplication workflow...");
    try {
      const headers = await getBearerHeader();
      const resp = await fetch("/api/trends/discover?country=GLOBAL&timeWindow=24h", { headers });
      const data = await resp.json();
      if (!resp.ok || !data.success) throw new Error(data.message);

      const existingKeys = new Set(
        savedTopics.map((t) => t.keyword.toLowerCase().trim())
      );
      const uniqueNew = (data.topics || []).filter(
        (t: any) => !existingKeys.has(String(t.keyword).toLowerCase().trim())
      );

      let savedCount = 0;
      for (const item of uniqueNew.slice(0, 8)) {
        await saveTrendingTopic(
          {
            id: `daily-${sanitizeSlug(item.keyword).slice(0, 50)}-${Date.now().toString(36)}`,
            keyword: item.keyword,
            relatedQueries: item.relatedQueries,
            country: item.country,
            categorySlug: item.categorySlug,
            source: item.source,
            sourceUrl: item.sourceUrl,
            trendDirection: item.trendDirection,
            searchInterest: item.searchInterest,
            discoveredAt: item.discoveredAt,
            timeWindow: "24h",
            opportunityScore: item.opportunityScore,
            opportunityBasis: item.opportunityBasis,
            status: "new",
            ownerUid: user.uid
          },
          true
        );
        savedCount++;
      }

      // Draft 1 highest-opportunity topic strictly as a Draft for human review (never auto-publish)
      let draftsCreated = 0;
      const topPick = uniqueNew[0];
      if (topPick) {
        const aiResp = await fetch("/api/ai/generate-article", {
          method: "POST",
          headers,
          body: JSON.stringify({
            topic: topPick.keyword,
            categoryName:
              categories.find((c) => c.slug === topPick.categorySlug)?.name || "Trending News",
            categorySlug: topPick.categorySlug,
            relatedQueries: topPick.relatedQueries
          })
        });
        const aiData = await aiResp.json();
        if (aiResp.ok && aiData.draft) {
          const d = aiData.draft;
          await saveArticle(
            {
              id: `auto-${Date.now().toString(36)}`,
              title: d.title,
              slug: sanitizeSlug(d.slug || d.title),
              summary: d.summary,
              contentMarkdown: d.contentMarkdown,
              categorySlug: topPick.categorySlug,
              categoryName:
                categories.find((c) => c.slug === topPick.categorySlug)?.name || "Trending News",
              primaryKeyword: d.primaryKeyword,
              secondaryKeywords: d.secondaryKeywords,
              faqs: d.faqs,
              externalSources: d.externalSources,
              featuredImageUrl: d.recommendedStockImage,
              featuredImageAlt: d.featuredImageAlt,
              authorName: "MOVLO Editorial Desk",
              authorUid: user.uid,
              seoTitle: d.seoTitle,
              seoDescription: d.seoDescription,
              canonicalUrl: `https://movlo.site/article/${sanitizeSlug(d.slug || d.title)}`,
              schemaType: d.schemaType === "NewsArticle" ? "NewsArticle" : "Article",
              status: "draft",
              readingTimeMinutes: d.readingTimeMinutes || 4
            },
            true
          );
          draftsCreated = 1;
        }
      }

      await saveAutomationReport({
        workflowType: "daily",
        summary: `Discovered ${data.topics?.length || 0} live topics, saved ${savedCount} new opportunities, prepared ${draftsCreated} draft for human editorial review.`,
        discoveredCount: savedCount,
        duplicatesRemoved: data.duplicatesRemoved || 0,
        draftsCreated,
        createdByUid: user.uid
      });

      await Promise.all([loadAdminWorkspace(), onRefreshPublicData()]);
      setBusyMessage("Daily workflow finished. All new drafts await admin approval.");
    } catch (err: any) {
      setErrorBanner(err?.message || "Daily workflow failed.");
      setBusyMessage("");
    } finally {
      setRunningAuto(false);
    }
  };

  const handleRunWeeklyAudit = async () => {
    if (!user) return;
    setRunningAuto(true);
    setErrorBanner("");
    try {
      const thirtyDaysAgo = Date.now() - 30 * 24 * 3600 * 1000;
      const outdatedIds = adminArticles
        .filter((a) => {
          const t = new Date(a.publishedAt || 0).getTime();
          return a.status === "published" && t > 0 && t < thirtyDaysAgo;
        })
        .map((a) => a.id)
        .slice(0, 20);

      const evergreenKeywords = adminArticles
        .filter((a) => a.status === "published" && a.primaryKeyword)
        .sort((a, b) => (metricsMap[b.id] || 0) - (metricsMap[a.id] || 0))
        .map((a) => a.primaryKeyword!)
        .slice(0, 12);

      await saveAutomationReport({
        workflowType: "weekly",
        summary: `Audited ${adminArticles.length} articles. Flagged ${outdatedIds.length} articles older than 30 days for freshness review and extracted ${evergreenKeywords.length} evergreen keywords.`,
        discoveredCount: evergreenKeywords.length,
        outdatedArticleIds: outdatedIds,
        evergreenKeywords,
        createdByUid: user.uid
      });

      await loadAdminWorkspace();
      setBusyMessage("Weekly editorial audit report saved.");
    } catch (err: any) {
      setErrorBanner(err?.message || "Weekly audit failed.");
    } finally {
      setRunningAuto(false);
    }
  };

  if (!authReady || checkingAdmin) {
    return (
      <main className="max-w-3xl mx-auto px-6 py-20 text-center">
        <p className="text-xs font-mono-tabular uppercase tracking-widest text-neutral-500">
          Verifying editorial session...
        </p>
      </main>
    );
  }

  if (!user || !isAuthorizedAdmin) {
    return (
      <main className="max-w-lg mx-auto px-6 py-20">
        <div className="border border-[#0A0A0A] p-8 bg-white">
          <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-neutral-500 mb-2">
            MOVLO Editorial Studio
          </p>
          <h1 className="font-editorial text-3xl font-bold text-[#0A0A0A] mb-3">
            Administrator Sign-In
          </h1>
          <p className="text-sm text-neutral-600 leading-relaxed mb-6">
            Sign in with an authorized Google account to manage articles, discover trending keywords, run AI-grounded drafting, and configure AdSense placements.
          </p>

          {errorBanner && (
            <p className="mb-4 text-xs text-red-700 border border-red-300 bg-red-50 px-3 py-2">
              {errorBanner}
            </p>
          )}

          {user && !isAuthorizedAdmin ? (
            <div className="space-y-4">
              <p className="text-xs border border-amber-300 bg-amber-50 text-amber-900 px-3 py-2">
                Signed in as <strong>{user.email}</strong>, which is not listed as an authorized MOVLO administrator.
              </p>
              <button
                type="button"
                onClick={() => signOutUser()}
                className="px-4 py-2 border border-[#0A0A0A] text-xs font-semibold uppercase tracking-wider cursor-pointer"
              >
                Sign Out &amp; Switch Account
              </button>
            </div>
          ) : (
            <button
              type="button"
              onClick={handleSignIn}
              className="w-full py-3 bg-[#0A0A0A] text-white text-xs font-semibold uppercase tracking-wider hover:bg-neutral-800 transition-colors cursor-pointer"
            >
              Sign In with Google
            </button>
          )}
        </div>
      </main>
    );
  }

  const seoArticle = adminArticles.find((a) => a.id === seoTargetId) || adminArticles[0];

  const TABS: Array<{ id: AdminTab; label: string; icon: React.ReactNode }> = [
    { id: "overview", label: "Overview", icon: <LayoutDashboard className="w-3.5 h-3.5" /> },
    { id: "articles", label: "Articles", icon: <FileText className="w-3.5 h-3.5" /> },
    { id: "trends", label: "Trends & AI", icon: <TrendingUp className="w-3.5 h-3.5" /> },
    { id: "seo", label: "SEO Manager", icon: <Search className="w-3.5 h-3.5" /> },
    { id: "automation", label: "Automation", icon: <Bot className="w-3.5 h-3.5" /> },
    { id: "ads", label: "AdSense", icon: <Megaphone className="w-3.5 h-3.5" /> },
    { id: "settings", label: "Settings", icon: <Settings className="w-3.5 h-3.5" /> }
  ];

  return (
    <main className="max-w-[1320px] mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Studio Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-[#0A0A0A] mb-6">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-neutral-500">
            MOVLO Editorial Studio · {user.email}
          </p>
          <h1 className="font-editorial text-2xl sm:text-3xl font-bold text-[#0A0A0A]">
            Publishing &amp; Trend Operations
          </h1>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={handleSeedCatalog}
            className="inline-flex items-center gap-1.5 px-3 py-2 border border-neutral-300 text-xs font-semibold hover:border-[#0A0A0A] cursor-pointer"
          >
            <Database className="w-3.5 h-3.5" />
            <span>Sync Starter Catalog</span>
          </button>
          <button
            type="button"
            onClick={() => {
              setEditingArticle(createBlankArticle(user.uid));
              setIsNewArticle(true);
              setPreviewMode(false);
              setActiveTab("articles");
            }}
            className="inline-flex items-center gap-1.5 px-4 py-2 bg-[#0A0A0A] text-white text-xs font-semibold uppercase tracking-wider cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>New Article</span>
          </button>
          <button
            type="button"
            onClick={() => signOutUser()}
            className="inline-flex items-center gap-1.5 px-3 py-2 border border-neutral-300 text-xs text-neutral-700 hover:border-[#0A0A0A] cursor-pointer"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Sign Out</span>
          </button>
        </div>
      </div>

      {/* Tab Strip */}
      <div className="flex items-center gap-1 overflow-x-auto border-b border-neutral-200 mb-6">
        {TABS.map((t) => (
          <button
            key={t.id}
            type="button"
            onClick={() => setActiveTab(t.id)}
            className={`inline-flex items-center gap-2 px-4 py-2.5 text-xs font-semibold whitespace-nowrap border-b-2 transition-colors cursor-pointer ${
              activeTab === t.id
                ? "border-[#0A0A0A] text-[#0A0A0A]"
                : "border-transparent text-neutral-500 hover:text-[#0A0A0A]"
            }`}
          >
            {t.icon}
            <span>{t.label}</span>
          </button>
        ))}
      </div>

      {errorBanner && (
        <div className="mb-6 border border-red-300 bg-red-50 px-4 py-3 text-xs font-medium text-red-800">
          {errorBanner}
        </div>
      )}
      {busyMessage && (
        <div className="mb-6 border border-[#0A0A0A] bg-neutral-50 px-4 py-3 text-xs font-medium text-[#0A0A0A] flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 shrink-0" />
          <span>{busyMessage}</span>
        </div>
      )}

      {/* TAB 1: OVERVIEW */}
      {activeTab === "overview" && (
        <div className="space-y-8">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="border border-neutral-200 p-5 bg-white">
              <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-neutral-500 mb-2">
                Published Articles
              </p>
              <p className="font-mono-tabular text-3xl font-bold text-[#0A0A0A]">
                {publishedCount}
              </p>
            </div>
            <div className="border border-neutral-200 p-5 bg-white">
              <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-neutral-500 mb-2">
                Draft &amp; Scheduled
              </p>
              <p className="font-mono-tabular text-3xl font-bold text-[#0A0A0A]">
                {draftCount}
              </p>
            </div>
            <div className="border border-neutral-200 p-5 bg-white">
              <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-neutral-500 mb-2">
                Saved Trend Topics
              </p>
              <p className="font-mono-tabular text-3xl font-bold text-[#0A0A0A]">
                {savedTopics.length}
              </p>
            </div>
            <div className="border border-neutral-200 p-5 bg-white">
              <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-neutral-500 mb-2">
                Total Article Views
              </p>
              <p className="font-mono-tabular text-3xl font-bold text-[#0A0A0A]">
                {totalViews.toLocaleString()}
              </p>
            </div>
          </div>

          <section className="border border-neutral-200 p-6 bg-white">
            <h2 className="font-editorial text-xl font-bold text-[#0A0A0A] mb-4">
              Recent Content
            </h2>
            {adminArticles.length === 0 ? (
              <p className="text-xs text-neutral-500">
                No Firestore articles yet. Click &quot;Sync Starter Catalog&quot; above or create a new article.
              </p>
            ) : (
              <div className="divide-y divide-neutral-200">
                {adminArticles.slice(0, 8).map((art) => (
                  <div
                    key={art.id}
                    className="py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-2"
                  >
                    <div>
                      <p className="text-[11px] font-mono-tabular uppercase tracking-wider text-neutral-500">
                        {art.status} · {art.categoryName} · {metricsMap[art.id] || 0} views
                      </p>
                      <p className="text-sm font-semibold text-[#0A0A0A]">{art.title}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => {
                          setEditingArticle(art);
                          setIsNewArticle(false);
                          setActiveTab("articles");
                        }}
                        className="px-3 py-1 border border-neutral-300 text-xs font-semibold hover:border-[#0A0A0A] cursor-pointer"
                      >
                        Edit
                      </button>
                      {art.status === "published" && (
                        <button
                          type="button"
                          onClick={() => onNavigate(`/article/${art.slug}`)}
                          className="px-3 py-1 border border-neutral-300 text-xs hover:border-[#0A0A0A] cursor-pointer"
                        >
                          View
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>

          <section className="border border-neutral-200 p-6 bg-white">
            <h2 className="font-editorial text-xl font-bold text-[#0A0A0A] mb-4">
              Contact Messages ({contactMessages.filter((m) => m.status === "unread").length} unread)
            </h2>
            {contactMessages.length === 0 ? (
              <p className="text-xs text-neutral-500">No contact submissions received yet.</p>
            ) : (
              <div className="divide-y divide-neutral-200">
                {contactMessages.map((msg) => (
                  <div key={msg.id} className="py-3 flex items-start justify-between gap-4">
                    <div>
                      <p className="text-xs font-semibold text-[#0A0A0A]">
                        {msg.subject} — <span className="font-normal text-neutral-600">{msg.name} ({msg.email})</span>
                      </p>
                      <p className="text-xs text-neutral-600 mt-1">{msg.message}</p>
                    </div>
                    {msg.status === "unread" && (
                      <button
                        type="button"
                        onClick={async () => {
                          await markContactMessageReviewed(msg.id);
                          await loadAdminWorkspace();
                        }}
                        className="px-2.5 py-1 border border-neutral-300 text-[11px] font-semibold shrink-0 cursor-pointer"
                      >
                        Mark Reviewed
                      </button>
                    )}
                  </div>
                ))}
              </div>
            )}
          </section>
        </div>
      )}

      {/* TAB 2: MANAGE ARTICLES & EDITOR */}
      {activeTab === "articles" && (
        <div className="space-y-6">
          {editingArticle ? (
            <div className="border border-neutral-200 p-6 bg-white space-y-6">
              <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-neutral-200">
                <h2 className="font-editorial text-xl font-bold text-[#0A0A0A]">
                  {isNewArticle ? "Draft New Article" : "Edit Article"}
                </h2>
                <div className="flex flex-wrap items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setPreviewMode((v) => !v)}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 border border-neutral-300 text-xs font-semibold cursor-pointer"
                  >
                    <Eye className="w-3.5 h-3.5" />
                    <span>{previewMode ? "Back to Editor" : "Preview"}</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => handleSaveEditorArticle("draft")}
                    className="px-3.5 py-1.5 border border-[#0A0A0A] text-xs font-semibold uppercase tracking-wider cursor-pointer"
                  >
                    Save Draft
                  </button>
                  <button
                    type="button"
                    onClick={() => handleSaveEditorArticle("published")}
                    className="px-4 py-1.5 bg-[#0A0A0A] text-white text-xs font-semibold uppercase tracking-wider cursor-pointer"
                  >
                    Publish Live
                  </button>
                  <button
                    type="button"
                    onClick={() => setEditingArticle(null)}
                    className="px-3 py-1.5 text-xs text-neutral-500 hover:text-[#0A0A0A] cursor-pointer"
                  >
                    Close
                  </button>
                </div>
              </div>

              {previewMode ? (
                <div className="max-w-3xl mx-auto py-4">
                  <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-neutral-500 mb-2">
                    {editingArticle.categoryName} · {formatEditorialDate(editingArticle.publishedAt)}
                  </p>
                  <h1 className="font-editorial text-3xl font-bold text-[#0A0A0A] mb-3">
                    {editingArticle.title || "Untitled Article"}
                  </h1>
                  <p className="text-base text-neutral-600 mb-6">{editingArticle.summary}</p>
                  {editingArticle.featuredImageUrl && (
                    <img
                      src={editingArticle.featuredImageUrl}
                      alt={editingArticle.featuredImageAlt || editingArticle.title}
                      className="w-full aspect-[16/9] object-cover border border-neutral-200 mb-6"
                    />
                  )}
                  <MarkdownRenderer markdown={editingArticle.contentMarkdown} />
                </div>
              ) : (
                <div className="space-y-5">
                  {/* AI Assistant Bar */}
                  <div className="flex flex-wrap items-center gap-2 p-3 border border-neutral-200 bg-neutral-50">
                    <span className="inline-flex items-center gap-1 text-[11px] font-semibold uppercase tracking-wider text-neutral-600 mr-2">
                      <Sparkles className="w-3.5 h-3.5" /> AI Tools:
                    </span>
                    <button
                      type="button"
                      onClick={() => handleAiHelper("titles")}
                      className="px-2.5 py-1 bg-white border border-neutral-300 text-xs font-medium hover:border-[#0A0A0A] cursor-pointer"
                    >
                      Regenerate Title
                    </button>
                    <button
                      type="button"
                      onClick={() => handleAiHelper("meta")}
                      className="px-2.5 py-1 bg-white border border-neutral-300 text-xs font-medium hover:border-[#0A0A0A] cursor-pointer"
                    >
                      Generate Meta Description
                    </button>
                    <button
                      type="button"
                      onClick={() => handleAiHelper("faqs")}
                      className="px-2.5 py-1 bg-white border border-neutral-300 text-xs font-medium hover:border-[#0A0A0A] cursor-pointer"
                    >
                      Suggest FAQs
                    </button>
                    <button
                      type="button"
                      onClick={() => handleAiHelper("improve")}
                      className="px-2.5 py-1 bg-white border border-neutral-300 text-xs font-medium hover:border-[#0A0A0A] cursor-pointer"
                    >
                      Improve Article
                    </button>
                  </div>

                  {headlineSuggestions.length > 0 && (
                    <div className="border border-neutral-200 p-3 space-y-1.5">
                      <p className="text-[11px] font-semibold uppercase tracking-wider text-neutral-500">
                        Click a headline suggestion to apply:
                      </p>
                      {headlineSuggestions.map((t, i) => (
                        <button
                          key={i}
                          type="button"
                          onClick={() => {
                            setEditingArticle({
                              ...editingArticle,
                              title: t,
                              slug: editingArticle.slug || sanitizeSlug(t)
                            });
                            setHeadlineSuggestions([]);
                          }}
                          className="block w-full text-left text-xs py-1.5 px-2 hover:bg-neutral-100 cursor-pointer font-medium"
                        >
                          {t}
                        </button>
                      ))}
                    </div>
                  )}

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-[11px] font-semibold uppercase tracking-wider text-neutral-600 mb-1">
                        Headline (H1)
                      </label>
                      <input
                        type="text"
                        value={editingArticle.title}
                        onChange={(e) =>
                          setEditingArticle({
                            ...editingArticle,
                            title: e.target.value,
                            slug: isNewArticle
                              ? sanitizeSlug(e.target.value)
                              : editingArticle.slug
                          })
                        }
                        className="w-full px-3 py-2 border border-neutral-300 text-sm"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-semibold uppercase tracking-wider text-neutral-600 mb-1">
                        URL Slug
                      </label>
                      <input
                        type="text"
                        value={editingArticle.slug}
                        onChange={(e) =>
                          setEditingArticle({
                            ...editingArticle,
                            slug: sanitizeSlug(e.target.value)
                          })
                        }
                        className="w-full px-3 py-2 border border-neutral-300 text-sm font-mono-tabular"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
                    <div>
                      <label className="block text-[11px] font-semibold uppercase tracking-wider text-neutral-600 mb-1">
                        Category
                      </label>
                      <select
                        value={editingArticle.categorySlug}
                        onChange={(e) => {
                          const c = categories.find((x) => x.slug === e.target.value);
                          setEditingArticle({
                            ...editingArticle,
                            categorySlug: e.target.value,
                            categoryName: c?.name || e.target.value
                          });
                        }}
                        className="w-full px-3 py-2 border border-neutral-300 text-sm bg-white"
                      >
                        {categories.map((c) => (
                          <option key={c.slug} value={c.slug}>
                            {c.name}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-[11px] font-semibold uppercase tracking-wider text-neutral-600 mb-1">
                        Status
                      </label>
                      <select
                        value={editingArticle.status}
                        onChange={(e) =>
                          setEditingArticle({
                            ...editingArticle,
                            status: e.target.value as ArticleStatus
                          })
                        }
                        className="w-full px-3 py-2 border border-neutral-300 text-sm bg-white"
                      >
                        <option value="draft">Draft</option>
                        <option value="scheduled">Scheduled</option>
                        <option value="published">Published</option>
                        <option value="archived">Archived</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-[11px] font-semibold uppercase tracking-wider text-neutral-600 mb-1">
                        Schema Type
                      </label>
                      <select
                        value={editingArticle.schemaType}
                        onChange={(e) =>
                          setEditingArticle({
                            ...editingArticle,
                            schemaType: e.target.value as "Article" | "NewsArticle"
                          })
                        }
                        className="w-full px-3 py-2 border border-neutral-300 text-sm bg-white"
                      >
                        <option value="Article">Article</option>
                        <option value="NewsArticle">NewsArticle</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-[11px] font-semibold uppercase tracking-wider text-neutral-600 mb-1">
                        Schedule Date (Optional)
                      </label>
                      <input
                        type="datetime-local"
                        value={editingArticle.scheduledFor || ""}
                        onChange={(e) =>
                          setEditingArticle({
                            ...editingArticle,
                            scheduledFor: e.target.value
                          })
                        }
                        className="w-full px-3 py-2 border border-neutral-300 text-xs"
                      />
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center gap-6 text-xs">
                    <label className="inline-flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={Boolean(editingArticle.isBreaking)}
                        onChange={(e) =>
                          setEditingArticle({ ...editingArticle, isBreaking: e.target.checked })
                        }
                        className="accent-[#0A0A0A]"
                      />
                      <span>Breaking &amp; Trending</span>
                    </label>
                    <label className="inline-flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={Boolean(editingArticle.isFeatured)}
                        onChange={(e) =>
                          setEditingArticle({ ...editingArticle, isFeatured: e.target.checked })
                        }
                        className="accent-[#0A0A0A]"
                      />
                      <span>Today&apos;s Top Stories</span>
                    </label>
                    <label className="inline-flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={Boolean(editingArticle.isPopular)}
                        onChange={(e) =>
                          setEditingArticle({ ...editingArticle, isPopular: e.target.checked })
                        }
                        className="accent-[#0A0A0A]"
                      />
                      <span>Popular This Week</span>
                    </label>
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold uppercase tracking-wider text-neutral-600 mb-1">
                      Short Summary
                    </label>
                    <textarea
                      rows={2}
                      value={editingArticle.summary}
                      onChange={(e) =>
                        setEditingArticle({ ...editingArticle, summary: e.target.value })
                      }
                      className="w-full px-3 py-2 border border-neutral-300 text-sm"
                    />
                  </div>

                  {/* Featured Image Uploader & Presets */}
                  <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-end border border-neutral-200 p-4">
                    <div className="md:col-span-5">
                      <label className="block text-[11px] font-semibold uppercase tracking-wider text-neutral-600 mb-1">
                        Featured Image URL
                      </label>
                      <input
                        type="text"
                        value={editingArticle.featuredImageUrl || ""}
                        onChange={(e) =>
                          setEditingArticle({
                            ...editingArticle,
                            featuredImageUrl: e.target.value
                          })
                        }
                        className="w-full px-3 py-2 border border-neutral-300 text-xs"
                      />
                    </div>
                    <div className="md:col-span-4">
                      <label className="block text-[11px] font-semibold uppercase tracking-wider text-neutral-600 mb-1">
                        Image Alt Text
                      </label>
                      <input
                        type="text"
                        value={editingArticle.featuredImageAlt || ""}
                        onChange={(e) =>
                          setEditingArticle({
                            ...editingArticle,
                            featuredImageAlt: e.target.value
                          })
                        }
                        className="w-full px-3 py-2 border border-neutral-300 text-xs"
                      />
                    </div>
                    <div className="md:col-span-3 flex items-center gap-2">
                      <label className="inline-flex items-center gap-1.5 px-3 py-2 border border-[#0A0A0A] text-xs font-semibold cursor-pointer">
                        <Upload className="w-3.5 h-3.5" />
                        <span>Upload WebP</span>
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handleImageFileUpload}
                          className="hidden"
                        />
                      </label>
                    </div>
                    <div className="md:col-span-12 flex flex-wrap items-center gap-2 text-[11px] text-neutral-500">
                      <span>Editorial presets:</span>
                      {LOCAL_IMAGE_PRESETS.map((p) => (
                        <button
                          key={p.url}
                          type="button"
                          onClick={() =>
                            setEditingArticle({ ...editingArticle, featuredImageUrl: p.url })
                          }
                          className="px-2 py-0.5 border border-neutral-300 hover:border-[#0A0A0A] text-neutral-700 cursor-pointer"
                        >
                          {p.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold uppercase tracking-wider text-neutral-600 mb-1">
                      Article Content (Markdown — ## H2, ### H3, lists, links)
                    </label>
                    <textarea
                      rows={16}
                      value={editingArticle.contentMarkdown}
                      onChange={(e) =>
                        setEditingArticle({
                          ...editingArticle,
                          contentMarkdown: e.target.value
                        })
                      }
                      className="w-full px-3 py-2.5 border border-neutral-300 text-sm font-mono leading-relaxed"
                    />
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="border border-neutral-200 bg-white">
              <div className="p-4 border-b border-neutral-200 flex items-center justify-between">
                <h2 className="font-editorial text-lg font-bold text-[#0A0A0A]">
                  All Articles ({adminArticles.length})
                </h2>
                <button
                  type="button"
                  onClick={() => {
                    setEditingArticle(createBlankArticle(user.uid));
                    setIsNewArticle(true);
                  }}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-[#0A0A0A] text-white text-xs font-semibold uppercase tracking-wider cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Create Article</span>
                </button>
              </div>
              <div className="divide-y divide-neutral-200">
                {adminArticles.map((art) => (
                  <div
                    key={art.id}
                    className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                  >
                    <div>
                      <p className="text-[11px] font-mono-tabular uppercase tracking-wider text-neutral-500">
                        {art.status} · {art.categoryName} · {art.readingTimeMinutes} min
                      </p>
                      <p className="text-sm font-semibold text-[#0A0A0A]">{art.title}</p>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <button
                        type="button"
                        onClick={() => {
                          setEditingArticle(art);
                          setIsNewArticle(false);
                          setPreviewMode(false);
                        }}
                        className="px-3 py-1 border border-neutral-300 text-xs font-semibold hover:border-[#0A0A0A] cursor-pointer"
                      >
                        Edit
                      </button>
                      <button
                        type="button"
                        onClick={async () => {
                          await deleteArticleById(art.id);
                          await Promise.all([loadAdminWorkspace(), onRefreshPublicData()]);
                        }}
                        className="p-1.5 border border-neutral-300 text-neutral-500 hover:text-red-600 cursor-pointer"
                        title="Delete article"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* TAB 3: TRENDS & AI */}
      {activeTab === "trends" && (
        <AdminTrendsAndAi
          adminUid={user.uid}
          categories={categories}
          articles={adminArticles}
          savedTopics={savedTopics}
          onTopicsUpdated={loadAdminWorkspace}
          onOpenArticleInEditor={(art) => {
            setEditingArticle(art);
            setIsNewArticle(false);
            setActiveTab("articles");
          }}
        />
      )}

      {/* TAB 4: SEO MANAGER */}
      {activeTab === "seo" && (
        <div className="border border-neutral-200 p-6 bg-white space-y-6">
          <div>
            <h2 className="font-editorial text-xl font-bold text-[#0A0A0A] mb-1">
              SEO Manager &amp; Google SERP Preview
            </h2>
            <p className="text-xs text-neutral-500">
              Inspect and refine SEO titles, meta descriptions, slugs, and canonical URLs before publishing.
            </p>
          </div>

          {seoArticle ? (
            <>
              <div>
                <label className="block text-[11px] font-semibold uppercase tracking-wider text-neutral-600 mb-1">
                  Select Article
                </label>
                <select
                  value={seoArticle.id}
                  onChange={(e) => setSeoTargetId(e.target.value)}
                  className="w-full max-w-xl px-3 py-2 border border-neutral-300 text-sm bg-white"
                >
                  {adminArticles.map((a) => (
                    <option key={a.id} value={a.id}>
                      [{a.status.toUpperCase()}] {a.title}
                    </option>
                  ))}
                </select>
              </div>

              {/* SERP Snippet Preview */}
              <div className="border border-neutral-200 p-5 bg-neutral-50 max-w-2xl">
                <p className="text-[10px] font-semibold uppercase tracking-widest text-neutral-400 mb-2">
                  Google Search Appearance Preview
                </p>
                <p className="text-xs text-neutral-700 mb-0.5">
                  https://movlo.site › article › {seoArticle.slug}
                </p>
                <p className="text-lg font-medium text-[#1a0dab] leading-snug mb-1">
                  {seoArticle.seoTitle || seoArticle.title}
                </p>
                <p className="text-xs text-neutral-600 leading-relaxed">
                  {seoArticle.seoDescription || seoArticle.summary}
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-3xl">
                <div>
                  <label className="block text-[11px] font-semibold uppercase tracking-wider text-neutral-600 mb-1">
                    SEO Title ({(seoArticle.seoTitle || seoArticle.title).length}/65 recommended)
                  </label>
                  <input
                    type="text"
                    value={seoArticle.seoTitle || ""}
                    onChange={(e) =>
                      setAdminArticles((prev) =>
                        prev.map((a) =>
                          a.id === seoArticle.id ? { ...a, seoTitle: e.target.value } : a
                        )
                      )
                    }
                    className="w-full px-3 py-2 border border-neutral-300 text-sm"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-semibold uppercase tracking-wider text-neutral-600 mb-1">
                    Canonical URL
                  </label>
                  <input
                    type="text"
                    value={
                      seoArticle.canonicalUrl || `https://movlo.site/article/${seoArticle.slug}`
                    }
                    onChange={(e) =>
                      setAdminArticles((prev) =>
                        prev.map((a) =>
                          a.id === seoArticle.id ? { ...a, canonicalUrl: e.target.value } : a
                        )
                      )
                    }
                    className="w-full px-3 py-2 border border-neutral-300 text-sm font-mono-tabular"
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-[11px] font-semibold uppercase tracking-wider text-neutral-600 mb-1">
                    Meta Description ({(seoArticle.seoDescription || "").length}/160 recommended)
                  </label>
                  <textarea
                    rows={2}
                    value={seoArticle.seoDescription || ""}
                    onChange={(e) =>
                      setAdminArticles((prev) =>
                        prev.map((a) =>
                          a.id === seoArticle.id ? { ...a, seoDescription: e.target.value } : a
                        )
                      )
                    }
                    className="w-full px-3 py-2 border border-neutral-300 text-sm"
                  />
                </div>
              </div>

              <button
                type="button"
                onClick={async () => {
                  await saveArticle(seoArticle, false);
                  await Promise.all([loadAdminWorkspace(), onRefreshPublicData()]);
                  setBusyMessage("SEO metadata saved to Firestore.");
                }}
                className="px-5 py-2.5 bg-[#0A0A0A] text-white text-xs font-semibold uppercase tracking-wider cursor-pointer"
              >
                Save SEO Metadata
              </button>
            </>
          ) : (
            <p className="text-xs text-neutral-500">Sync or create an article first.</p>
          )}
        </div>
      )}

      {/* TAB 5: AUTOMATION WORKFLOWS */}
      {activeTab === "automation" && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="border border-neutral-200 p-6 bg-white">
              <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-neutral-500 mb-1">
                Daily Editorial Pipeline
              </p>
              <h3 className="font-editorial text-xl font-bold text-[#0A0A0A] mb-2">
                Trend Discovery &amp; Draft Prep
              </h3>
              <p className="text-xs text-neutral-600 leading-relaxed mb-5">
                Discovers new trending topics, removes duplicates, classifies categories, and generates an AI-grounded draft for human review (never auto-publishes).
              </p>
              <button
                type="button"
                disabled={runningAuto}
                onClick={handleRunDailyWorkflow}
                className="px-4 py-2 bg-[#0A0A0A] text-white text-xs font-semibold uppercase tracking-wider disabled:opacity-50 cursor-pointer"
              >
                {runningAuto ? "Running..." : "Run Daily Workflow Now"}
              </button>
            </div>

            <div className="border border-neutral-200 p-6 bg-white">
              <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-neutral-500 mb-1">
                Weekly Editorial Audit
              </p>
              <h3 className="font-editorial text-xl font-bold text-[#0A0A0A] mb-2">
                Evergreen &amp; Freshness Check
              </h3>
              <p className="text-xs text-neutral-600 leading-relaxed mb-5">
                Scans published articles for aging guides over 30 days old and surfaces top-performing evergreen keywords for follow-up coverage.
              </p>
              <button
                type="button"
                disabled={runningAuto}
                onClick={handleRunWeeklyAudit}
                className="px-4 py-2 border border-[#0A0A0A] text-xs font-semibold uppercase tracking-wider hover:bg-[#0A0A0A] hover:text-white transition-colors disabled:opacity-50 cursor-pointer"
              >
                {runningAuto ? "Running..." : "Run Weekly Audit"}
              </button>
            </div>
          </div>

          <section className="border border-neutral-200 p-6 bg-white">
            <h3 className="font-editorial text-lg font-bold text-[#0A0A0A] mb-4">
              Automation Run Logs ({automationReports.length})
            </h3>
            {automationReports.length === 0 ? (
              <p className="text-xs text-neutral-500">No automation runs logged yet.</p>
            ) : (
              <div className="divide-y divide-neutral-200">
                {automationReports.map((rep) => (
                  <div key={rep.id} className="py-3 text-xs">
                    <p className="font-mono-tabular uppercase tracking-wider text-neutral-500 mb-1">
                      {rep.workflowType} workflow · {rep.discoveredCount} items
                    </p>
                    <p className="text-sm text-[#0A0A0A]">{rep.summary}</p>
                  </div>
                ))}
              </div>
            )}
          </section>
        </div>
      )}

      {/* TAB 6: ADSENSE MANAGER */}
      {activeTab === "ads" && (
        <AdminSettingsAndAds
          mode="ads"
          siteSettings={siteSettings}
          adSettings={adSettings}
          categories={categories}
          onRefreshData={onRefreshPublicData}
        />
      )}

      {/* TAB 7: WEBSITE SETTINGS & CATEGORIES */}
      {activeTab === "settings" && (
        <AdminSettingsAndAds
          mode="settings"
          siteSettings={siteSettings}
          adSettings={adSettings}
          categories={categories}
          onRefreshData={onRefreshPublicData}
        />
      )}
    </main>
  );
};
