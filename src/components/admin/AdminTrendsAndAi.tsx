import React, { useState } from "react";
import { Sparkles, Globe, RefreshCw, Plus, Check, X, ArrowUpRight, Wand2 } from "lucide-react";
import { Article, Category, TrendingTopic } from "../../types";
import { auth } from "../../lib/firebase";
import {
  saveTrendingTopic,
  saveArticle,
  sanitizeSlug,
  computeReadingTime
} from "../../lib/firestoreRepo";

interface ProviderStatus {
  provider: string;
  status: "connected" | "empty" | "unavailable" | "unconfigured";
  itemCount: number;
  note: string;
}

interface DiscoveredItem {
  keyword: string;
  relatedQueries: string[];
  country: string;
  categorySlug: string;
  source: string;
  sourceUrl?: string;
  trendDirection: "Rising" | "Breakout" | "Steady" | "Manual";
  searchInterest?: string;
  discoveredAt: string;
  timeWindow: "24h" | "7d" | "30d";
  opportunityScore: number;
  opportunityBasis: string;
}

interface AdminTrendsProps {
  adminUid: string;
  categories: Category[];
  articles: Article[];
  savedTopics: TrendingTopic[];
  onTopicsUpdated: () => Promise<void>;
  onOpenArticleInEditor: (article: Article) => void;
}

export const AdminTrendsAndAi: React.FC<AdminTrendsProps> = ({
  adminUid,
  categories,
  articles,
  savedTopics,
  onTopicsUpdated,
  onOpenArticleInEditor
}) => {
  const [country, setCountry] = useState("GLOBAL");
  const [timeWindow, setTimeWindow] = useState<"24h" | "7d" | "30d">("24h");
  const [categoryFilter, setCategoryFilter] = useState("all");

  const [discovering, setDiscovering] = useState(false);
  const [discovered, setDiscovered] = useState<DiscoveredItem[]>([]);
  const [providers, setProviders] = useState<ProviderStatus[]>([]);
  const [statusMessage, setStatusMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  // Manual keyword + AI generator state
  const [manualKeyword, setManualKeyword] = useState("");
  const [manualCategory, setManualCategory] = useState("trending-news");
  const [aiTopic, setAiTopic] = useState("");
  const [aiCategorySlug, setAiCategorySlug] = useState("artificial-intelligence");
  const [aiRelated, setAiRelated] = useState("");
  const [aiAngle, setAiAngle] = useState("");
  const [generating, setGenerating] = useState(false);

  const getBearerHeader = async (): Promise<Record<string, string>> => {
    const token = await auth.currentUser?.getIdToken();
    if (!token) throw new Error("Authentication session expired. Please sign in again.");
    return {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`
    };
  };

  const handleDiscoverTrends = async () => {
    setDiscovering(true);
    setErrorMessage("");
    setStatusMessage("");
    try {
      const headers = await getBearerHeader();
      const resp = await fetch(
        `/api/trends/discover?country=${encodeURIComponent(country)}&timeWindow=${encodeURIComponent(
          timeWindow
        )}&category=${encodeURIComponent(categoryFilter)}`,
        { headers }
      );
      const data = await resp.json();
      if (!resp.ok || !data.success) {
        throw new Error(data.message || "Failed to discover trending topics.");
      }
      setDiscovered(data.topics || []);
      setProviders(data.providers || []);
      setStatusMessage(
        `Discovered ${data.topics?.length || 0} topics (${data.duplicatesRemoved || 0} duplicates merged).`
      );
    } catch (err: any) {
      setErrorMessage(err?.message || "Unable to query trend discovery feeds.");
    } finally {
      setDiscovering(false);
    }
  };

  const handleSaveTopic = async (item: DiscoveredItem, status: "saved" | "rejected") => {
    try {
      await saveTrendingTopic(
        {
          id: `topic-${sanitizeSlug(item.keyword).slice(0, 60)}-${Date.now().toString(36)}`,
          keyword: item.keyword,
          relatedQueries: item.relatedQueries,
          country: item.country,
          categorySlug: item.categorySlug,
          source: item.source,
          sourceUrl: item.sourceUrl,
          trendDirection: item.trendDirection,
          searchInterest: item.searchInterest,
          discoveredAt: item.discoveredAt,
          timeWindow: item.timeWindow,
          opportunityScore: item.opportunityScore,
          opportunityBasis: item.opportunityBasis,
          status,
          ownerUid: adminUid
        },
        true
      );
      await onTopicsUpdated();
      setStatusMessage(`Topic "${item.keyword}" marked as ${status}.`);
    } catch (err: any) {
      setErrorMessage(err?.message || "Failed to save topic.");
    }
  };

  const handleAddManualTopic = async (e: React.FormEvent) => {
    e.preventDefault();
    if (manualKeyword.trim().length < 2) return;
    try {
      await saveTrendingTopic(
        {
          id: `manual-${sanitizeSlug(manualKeyword).slice(0, 60)}-${Date.now().toString(36)}`,
          keyword: manualKeyword.trim(),
          relatedQueries: [],
          country: "Manual Entry",
          categorySlug: manualCategory,
          source: "Editorial Desk",
          trendDirection: "Manual",
          discoveredAt: new Date().toISOString(),
          timeWindow: "24h",
          opportunityScore: 75,
          opportunityBasis: "Added manually by editor",
          status: "saved",
          ownerUid: adminUid
        },
        true
      );
      setManualKeyword("");
      await onTopicsUpdated();
      setStatusMessage("Manual keyword saved to Trending Manager.");
    } catch (err: any) {
      setErrorMessage(err?.message || "Failed to save manual topic.");
    }
  };

  const handleGenerateAiDraft = async (
    topicTitle: string,
    catSlug: string,
    relatedList: string[] = [],
    sourceTopicId?: string
  ) => {
    if (!topicTitle.trim()) {
      setErrorMessage("Enter or select a topic first.");
      return;
    }
    setGenerating(true);
    setErrorMessage("");
    setStatusMessage("Researching topic with Google Search grounding and drafting article...");

    try {
      const headers = await getBearerHeader();
      const cat = categories.find((c) => c.slug === catSlug);
      const existingArticles = articles
        .filter((a) => a.status === "published")
        .slice(0, 8)
        .map((a) => ({ title: a.title, slug: a.slug }));

      const resp = await fetch("/api/ai/generate-article", {
        method: "POST",
        headers,
        body: JSON.stringify({
          topic: topicTitle.trim(),
          categoryName: cat?.name || "Trending News",
          categorySlug: catSlug,
          relatedQueries: relatedList,
          existingArticles,
          targetTone: aiAngle.trim() || undefined
        })
      });

      const data = await resp.json();
      if (!resp.ok || !data.success || !data.draft) {
        throw new Error(data.message || "AI draft generation failed.");
      }

      const d = data.draft;
      const newId = `art-${Date.now().toString(36)}`;
      const draftArticle: Omit<Article, "createdAt" | "updatedAt"> = {
        id: newId,
        title: d.title,
        slug: sanitizeSlug(d.slug || d.title),
        summary: d.summary,
        contentMarkdown: d.contentMarkdown,
        categorySlug: catSlug,
        categoryName: cat?.name || "Trending News",
        primaryKeyword: d.primaryKeyword,
        secondaryKeywords: d.secondaryKeywords,
        faqs: d.faqs,
        externalSources: d.externalSources,
        featuredImageUrl: d.recommendedStockImage,
        featuredImageAlt: d.featuredImageAlt,
        authorName: "MOVLO Editorial Desk",
        authorUid: adminUid,
        seoTitle: d.seoTitle,
        seoDescription: d.seoDescription,
        canonicalUrl: `https://movlo.site/article/${sanitizeSlug(d.slug || d.title)}`,
        schemaType: d.schemaType === "NewsArticle" ? "NewsArticle" : "Article",
        status: "draft",
        readingTimeMinutes: d.readingTimeMinutes || computeReadingTime(d.contentMarkdown),
        isBreaking: false,
        isFeatured: false,
        isPopular: false,
        sourceTopicId
      };

      await saveArticle(draftArticle, true);
      if (sourceTopicId) {
        const existingTopic = savedTopics.find((t) => t.id === sourceTopicId);
        if (existingTopic) {
          await saveTrendingTopic({ ...existingTopic, status: "drafted" }, false);
        }
      }
      await onTopicsUpdated();
      setStatusMessage("Draft saved in Firestore! Opening editor for review...");
      onOpenArticleInEditor(draftArticle as Article);
    } catch (err: any) {
      setErrorMessage(err?.message || "Failed to generate AI article.");
    } finally {
      setGenerating(false);
    }
  };

  return (
    <div className="space-y-8">
      {errorMessage && (
        <div className="border border-red-300 bg-red-50 px-4 py-3 text-xs font-medium text-red-800">
          {errorMessage}
        </div>
      )}
      {statusMessage && (
        <div className="border border-[#0A0A0A] bg-neutral-50 px-4 py-3 text-xs font-medium text-[#0A0A0A]">
          {statusMessage}
        </div>
      )}

      {/* AI Content Generator Box */}
      <section className="border border-neutral-200 p-6 bg-white">
        <div className="flex items-center gap-2 mb-1">
          <Sparkles className="w-4 h-4 text-[#0A0A0A]" />
          <h2 className="font-editorial text-xl font-bold text-[#0A0A0A]">
            AI Article Generator (Grounded Drafts)
          </h2>
        </div>
        <p className="text-xs text-neutral-500 mb-5">
          Researches topics using Gemini with live Google Search grounding, creates structured H2/H3 copy, FAQs, and SEO metadata, and saves as a Draft for human review.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
          <div className="md:col-span-5">
            <label className="block text-[11px] font-semibold uppercase tracking-wider text-neutral-600 mb-1">
              Topic or Keyword
            </label>
            <input
              type="text"
              value={aiTopic}
              onChange={(e) => setAiTopic(e.target.value)}
              placeholder="e.g., Open-weight local AI models for laptops"
              className="w-full px-3 py-2 border border-neutral-300 text-sm focus:outline-none focus:border-[#0A0A0A]"
            />
          </div>

          <div className="md:col-span-3">
            <label className="block text-[11px] font-semibold uppercase tracking-wider text-neutral-600 mb-1">
              Category
            </label>
            <select
              value={aiCategorySlug}
              onChange={(e) => setAiCategorySlug(e.target.value)}
              className="w-full px-3 py-2 border border-neutral-300 text-sm bg-white focus:outline-none focus:border-[#0A0A0A]"
            >
              {categories.map((c) => (
                <option key={c.slug} value={c.slug}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>

          <div className="md:col-span-4">
            <label className="block text-[11px] font-semibold uppercase tracking-wider text-neutral-600 mb-1">
              Editorial Angle (Optional)
            </label>
            <input
              type="text"
              value={aiAngle}
              onChange={(e) => setAiAngle(e.target.value)}
              placeholder="Practical explainer, comparison, news brief..."
              className="w-full px-3 py-2 border border-neutral-300 text-sm focus:outline-none focus:border-[#0A0A0A]"
            />
          </div>
        </div>

        <div className="mt-4 flex flex-wrap items-center justify-between gap-4">
          <input
            type="text"
            value={aiRelated}
            onChange={(e) => setAiRelated(e.target.value)}
            placeholder="Optional related queries (comma-separated)"
            className="flex-1 min-w-[240px] px-3 py-2 border border-neutral-300 text-xs focus:outline-none focus:border-[#0A0A0A]"
          />
          <button
            type="button"
            disabled={generating}
            onClick={() =>
              handleGenerateAiDraft(
                aiTopic,
                aiCategorySlug,
                aiRelated.split(",").map((s) => s.trim()).filter(Boolean)
              )
            }
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#0A0A0A] text-white text-xs font-semibold uppercase tracking-wider hover:bg-neutral-800 disabled:opacity-50 cursor-pointer"
          >
            <Wand2 className="w-3.5 h-3.5" />
            <span>{generating ? "Researching & Drafting..." : "Generate AI Draft"}</span>
          </button>
        </div>
      </section>

      {/* Trending Discovery Controls */}
      <section className="border border-neutral-200 p-6 bg-white">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-5">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <Globe className="w-4 h-4 text-[#0A0A0A]" />
              <h2 className="font-editorial text-xl font-bold text-[#0A0A0A]">
                Trending Keyword Discovery
              </h2>
            </div>
            <p className="text-xs text-neutral-500">
              Aggregates Google Trends RSS, Official News RSS, Wikimedia Top Pageviews, and authorized YouTube Trending feeds without inventing search volumes.
            </p>
          </div>

          <button
            type="button"
            disabled={discovering}
            onClick={handleDiscoverTrends}
            className="inline-flex items-center gap-2 px-4 py-2 bg-[#0A0A0A] text-white text-xs font-semibold uppercase tracking-wider hover:bg-neutral-800 disabled:opacity-50 cursor-pointer shrink-0"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${discovering ? "animate-spin" : ""}`} />
            <span>{discovering ? "Scanning Feeds..." : "Discover Live Trends"}</span>
          </button>
        </div>

        {/* Filters */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pb-5 border-b border-neutral-200">
          <div>
            <label className="block text-[11px] font-semibold uppercase tracking-wider text-neutral-600 mb-1">
              Country / Region
            </label>
            <select
              value={country}
              onChange={(e) => setCountry(e.target.value)}
              className="w-full px-3 py-2 border border-neutral-300 text-sm bg-white"
            >
              <option value="GLOBAL">Worldwide</option>
              <option value="US">United States</option>
              <option value="GB">United Kingdom</option>
              <option value="CA">Canada</option>
              <option value="AU">Australia</option>
              <option value="IN">India</option>
              <option value="PK">Pakistan</option>
            </select>
          </div>

          <div>
            <label className="block text-[11px] font-semibold uppercase tracking-wider text-neutral-600 mb-1">
              Time Range
            </label>
            <select
              value={timeWindow}
              onChange={(e) => setTimeWindow(e.target.value as "24h" | "7d" | "30d")}
              className="w-full px-3 py-2 border border-neutral-300 text-sm bg-white"
            >
              <option value="24h">Last 24 Hours</option>
              <option value="7d">Last 7 Days</option>
              <option value="30d">Last 30 Days</option>
            </select>
          </div>

          <div>
            <label className="block text-[11px] font-semibold uppercase tracking-wider text-neutral-600 mb-1">
              Category Filter
            </label>
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="w-full px-3 py-2 border border-neutral-300 text-sm bg-white"
            >
              <option value="all">All Categories</option>
              {categories.map((c) => (
                <option key={c.slug} value={c.slug}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Honest Provider Connection Status */}
        {providers.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 py-4 border-b border-neutral-200">
            {providers.map((p) => (
              <div key={p.provider} className="border border-neutral-200 p-3 text-xs">
                <p className="font-semibold text-[#0A0A0A] mb-0.5">{p.provider}</p>
                <p className="text-[11px] font-mono-tabular uppercase tracking-wider text-neutral-500 mb-1">
                  {p.status} · {p.itemCount} items
                </p>
                <p className="text-[11px] text-neutral-500">{p.note}</p>
              </div>
            ))}
          </div>
        )}

        {/* Manual Keyword Form */}
        <form onSubmit={handleAddManualTopic} className="flex flex-wrap items-center gap-3 py-4 border-b border-neutral-200">
          <input
            type="text"
            value={manualKeyword}
            onChange={(e) => setManualKeyword(e.target.value)}
            placeholder="Add manual topic or keyword..."
            className="flex-1 min-w-[220px] px-3 py-2 border border-neutral-300 text-sm"
          />
          <select
            value={manualCategory}
            onChange={(e) => setManualCategory(e.target.value)}
            className="px-3 py-2 border border-neutral-300 text-sm bg-white"
          >
            {categories.map((c) => (
              <option key={c.slug} value={c.slug}>
                {c.name}
              </option>
            ))}
          </select>
          <button
            type="submit"
            className="inline-flex items-center gap-1.5 px-4 py-2 border border-[#0A0A0A] text-xs font-semibold uppercase tracking-wider hover:bg-[#0A0A0A] hover:text-white transition-colors cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Save Keyword</span>
          </button>
        </form>

        {/* Live Discovered Results Table */}
        {discovered.length > 0 && (
          <div className="overflow-x-auto mt-4">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-[#0A0A0A] text-[11px] uppercase tracking-wider text-neutral-500">
                  <th className="py-2.5 pr-4">Keyword &amp; Related</th>
                  <th className="py-2.5 pr-4">Category</th>
                  <th className="py-2.5 pr-4">Source / Region</th>
                  <th className="py-2.5 pr-4">Direction &amp; Interest</th>
                  <th className="py-2.5 pr-4">Score</th>
                  <th className="py-2.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-200">
                {discovered.map((item, idx) => (
                  <tr key={`${item.keyword}-${idx}`} className="hover:bg-neutral-50">
                    <td className="py-3 pr-4 max-w-xs">
                      <p className="font-semibold text-sm text-[#0A0A0A]">{item.keyword}</p>
                      {item.relatedQueries.length > 0 && (
                        <p className="text-[11px] text-neutral-500 mt-0.5 line-clamp-1">
                          Related: {item.relatedQueries.join(" · ")}
                        </p>
                      )}
                    </td>
                    <td className="py-3 pr-4 uppercase tracking-wider text-[11px] text-neutral-700">
                      {item.categorySlug}
                    </td>
                    <td className="py-3 pr-4">
                      <p className="text-neutral-800">{item.source}</p>
                      <p className="text-[11px] text-neutral-500">{item.country}</p>
                    </td>
                    <td className="py-3 pr-4">
                      <p className="font-semibold text-[#0A0A0A]">{item.trendDirection}</p>
                      <p className="text-[11px] text-neutral-500">
                        {item.searchInterest || "Feed signal only"}
                      </p>
                    </td>
                    <td className="py-3 pr-4 font-mono-tabular">
                      <span className="font-bold text-[#0A0A0A]">{item.opportunityScore}</span>/100
                    </td>
                    <td className="py-3 text-right whitespace-nowrap space-x-2">
                      <button
                        type="button"
                        disabled={generating}
                        onClick={() =>
                          handleGenerateAiDraft(item.keyword, item.categorySlug, item.relatedQueries)
                        }
                        className="px-2.5 py-1 bg-[#0A0A0A] text-white text-[11px] font-semibold uppercase tracking-wider cursor-pointer disabled:opacity-50"
                      >
                        Draft
                      </button>
                      <button
                        type="button"
                        onClick={() => handleSaveTopic(item, "saved")}
                        title="Save topic"
                        className="p-1 border border-neutral-300 hover:border-[#0A0A0A] cursor-pointer"
                      >
                        <Check className="w-3.5 h-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={() => handleSaveTopic(item, "rejected")}
                        title="Reject topic"
                        className="p-1 border border-neutral-300 hover:border-red-600 text-neutral-500 hover:text-red-600 cursor-pointer"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      {/* Saved & Rejected Topics in Firestore */}
      <section className="border border-neutral-200 p-6 bg-white">
        <h3 className="font-editorial text-lg font-bold text-[#0A0A0A] mb-4">
          Saved Editorial Topic Queue ({savedTopics.filter((t) => t.status !== "rejected").length})
        </h3>
        {savedTopics.length === 0 ? (
          <p className="text-xs text-neutral-500">
            No topics saved yet. Discover trends above or add a manual keyword.
          </p>
        ) : (
          <div className="divide-y divide-neutral-200">
            {savedTopics.slice(0, 25).map((topic) => (
              <div
                key={topic.id}
                className="py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
              >
                <div>
                  <div className="flex items-center gap-2 text-[11px] font-mono-tabular uppercase tracking-wider text-neutral-500">
                    <span>{topic.status}</span>
                    <span>·</span>
                    <span>{topic.categorySlug}</span>
                    <span>·</span>
                    <span>Score {topic.opportunityScore}</span>
                    <span>·</span>
                    <span>{topic.source}</span>
                  </div>
                  <p className="text-sm font-semibold text-[#0A0A0A] mt-0.5">
                    {topic.keyword}
                  </p>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  {topic.sourceUrl && (
                    <a
                      href={topic.sourceUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-1.5 border border-neutral-300 text-neutral-600 hover:text-[#0A0A0A]"
                      title="Open source"
                    >
                      <ArrowUpRight className="w-3.5 h-3.5" />
                    </a>
                  )}
                  <button
                    type="button"
                    disabled={generating}
                    onClick={() =>
                      handleGenerateAiDraft(
                        topic.keyword,
                        topic.categorySlug,
                        topic.relatedQueries || [],
                        topic.id
                      )
                    }
                    className="px-3 py-1.5 bg-[#0A0A0A] text-white text-[11px] font-semibold uppercase tracking-wider cursor-pointer disabled:opacity-50"
                  >
                    Generate Draft
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
};
