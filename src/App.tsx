import React, { useCallback, useEffect, useMemo, useState } from "react";
import { onAuthStateChanged, User } from "firebase/auth";
import {
  AdSettings,
  Article,
  Category,
  SiteSettings
} from "./types";
import { auth, testConnection } from "./lib/firebase";
import {
  fetchAdSettings,
  fetchArticleMetricsMap,
  fetchCategories,
  fetchPublishedArticles,
  fetchSiteSettings
} from "./lib/firestoreRepo";
import {
  DEFAULT_AD_SETTINGS,
  DEFAULT_CATEGORIES,
  DEFAULT_SITE_SETTINGS,
  STARTER_ARTICLES
} from "./lib/defaultCatalog";
import { applySeoHead } from "./lib/seoHead";
import { ErrorBoundary } from "./components/ErrorBoundary";
import { Header } from "./components/Header";
import { Footer } from "./components/Footer";
import { HomePage } from "./pages/HomePage";
import { CategoryPage } from "./pages/CategoryPage";
import { SearchPage } from "./pages/SearchPage";
import { ArticlePage } from "./pages/ArticlePage";
import { TrustPages, TrustRoute } from "./pages/TrustPages";
import { AdminDashboard } from "./pages/AdminDashboard";

const TRUST_ROUTES: TrustRoute[] = [
  "/about",
  "/contact",
  "/privacy-policy",
  "/terms",
  "/disclaimer",
  "/editorial-policy",
  "/cookie-policy"
];

export function App() {
  const [currentUrl, setCurrentUrl] = useState(
    () => `${window.location.pathname}${window.location.search}`
  );
  const [user, setUser] = useState<User | null>(null);
  const [authReady, setAuthReady] = useState(false);

  const [articles, setArticles] = useState<Article[]>(STARTER_ARTICLES);
  const [categories, setCategories] = useState<Category[]>(DEFAULT_CATEGORIES);
  const [siteSettings, setSiteSettings] = useState<SiteSettings>(DEFAULT_SITE_SETTINGS);
  const [adSettings, setAdSettings] = useState<AdSettings>(DEFAULT_AD_SETTINGS);
  const [metricsMap, setMetricsMap] = useState<Record<string, number>>({});

  const refreshPublicData = useCallback(async () => {
    const [dbArticles, dbCats, dbSite, dbAds, dbMetrics] = await Promise.all([
      fetchPublishedArticles().catch(() => []),
      fetchCategories().catch(() => []),
      fetchSiteSettings().catch(() => DEFAULT_SITE_SETTINGS),
      fetchAdSettings().catch(() => DEFAULT_AD_SETTINGS),
      fetchArticleMetricsMap().catch(() => ({}))
    ]);

    setArticles(dbArticles.length > 0 ? dbArticles : STARTER_ARTICLES);
    setCategories(dbCats.length > 0 ? dbCats : DEFAULT_CATEGORIES);
    setSiteSettings(dbSite);
    setAdSettings(dbAds);
    setMetricsMap(dbMetrics);
  }, []);

  useEffect(() => {
    testConnection().catch(() => false);
    const unsub = onAuthStateChanged(auth, (u) => {
      setUser(u);
      setAuthReady(true);
    });
    refreshPublicData();
    return () => unsub();
  }, [refreshPublicData]);

  useEffect(() => {
    const onPopState = () => {
      setCurrentUrl(`${window.location.pathname}${window.location.search}`);
    };
    window.addEventListener("popstate", onPopState);
    return () => window.removeEventListener("popstate", onPopState);
  }, []);

  const navigate = useCallback((path: string) => {
    const normalized = path.startsWith("/") ? path : `/${path}`;
    if (`${window.location.pathname}${window.location.search}` !== normalized) {
      window.history.pushState({}, "", normalized);
    }
    setCurrentUrl(normalized);
  }, []);

  const { pathname, searchParams } = useMemo(() => {
    const u = new URL(currentUrl, "https://movlo.site");
    return { pathname: u.pathname, searchParams: u.searchParams };
  }, [currentUrl]);

  const activeArticle = useMemo(() => {
    const match = pathname.match(/^\/article\/([a-z0-9-]+)$/i);
    if (!match) return null;
    const slug = match[1].toLowerCase();
    return articles.find((a) => a.slug === slug) || null;
  }, [pathname, articles]);

  const activeCategorySlug = useMemo(() => {
    const match = pathname.match(/^\/category\/([a-z0-9-]+)$/i);
    return match ? match[1].toLowerCase() : null;
  }, [pathname]);

  // Synchronize document title, meta tags, canonical link, and JSON-LD schema
  useEffect(() => {
    if (pathname.startsWith("/admin")) {
      applySeoHead({
        title: "Editorial Studio — MOVLO",
        description: "Private editorial workspace for MOVLO.site.",
        path: "/admin",
        noindex: true
      });
      return;
    }

    if (pathname.startsWith("/article/") && activeArticle) {
      const canonical = `https://movlo.site/article/${activeArticle.slug}`;
      const graph: object[] = [
        {
          "@type": activeArticle.schemaType === "NewsArticle" ? "NewsArticle" : "Article",
          "@id": `${canonical}#article`,
          headline: activeArticle.title,
          description: activeArticle.seoDescription || activeArticle.summary,
          datePublished: activeArticle.publishedAt,
          author: { "@type": "Person", name: activeArticle.authorName },
          publisher: { "@type": "Organization", name: siteSettings.siteName || "MOVLO" },
          mainEntityOfPage: canonical
        },
        {
          "@type": "BreadcrumbList",
          itemListElement: [
            { "@type": "ListItem", position: 1, name: "Home", item: "https://movlo.site/" },
            {
              "@type": "ListItem",
              position: 2,
              name: activeArticle.categoryName,
              item: `https://movlo.site/category/${activeArticle.categorySlug}`
            },
            { "@type": "ListItem", position: 3, name: activeArticle.title, item: canonical }
          ]
        }
      ];

      if (activeArticle.faqs && activeArticle.faqs.length > 0) {
        graph.push({
          "@type": "FAQPage",
          mainEntity: activeArticle.faqs.map((f) => ({
            "@type": "Question",
            name: f.question,
            acceptedAnswer: { "@type": "Answer", text: f.answer }
          }))
        });
      }

      applySeoHead({
        title: `${activeArticle.seoTitle || activeArticle.title} | MOVLO`,
        description: activeArticle.seoDescription || activeArticle.summary,
        path: `/article/${activeArticle.slug}`,
        ogType: "article",
        imageUrl: activeArticle.featuredImageUrl,
        jsonLdGraph: graph
      });
      return;
    }

    if (activeCategorySlug) {
      const cat = categories.find((c) => c.slug === activeCategorySlug);
      const label =
        cat?.name ||
        activeCategorySlug
          .split("-")
          .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
          .join(" ");
      applySeoHead({
        title: `${label} — Latest Coverage | MOVLO`,
        description:
          cat?.description ||
          `Read the latest ${label} news, analysis, and guides on MOVLO.`,
        path: `/category/${activeCategorySlug}`
      });
      return;
    }

    if (pathname === "/search") {
      applySeoHead({
        title: "Search MOVLO — What's Trending. What's Worth Knowing.",
        description: "Search trending articles, guides, and analysis across MOVLO.site.",
        path: "/search",
        noindex: true
      });
      return;
    }

    if (TRUST_ROUTES.includes(pathname as TrustRoute)) {
      const label = pathname.replace("/", "").replace(/-/g, " ");
      applySeoHead({
        title: `${label.replace(/\b\w/g, (c) => c.toUpperCase())} | MOVLO`,
        description: siteSettings.defaultSeoDescription,
        path: pathname
      });
      return;
    }

    applySeoHead({
      title: siteSettings.defaultSeoTitle || "MOVLO — What's Trending. What's Worth Knowing.",
      description: siteSettings.defaultSeoDescription,
      path: "/"
    });
  }, [pathname, activeArticle, activeCategorySlug, categories, siteSettings]);

  const renderRoute = () => {
    if (pathname.startsWith("/admin")) {
      return (
        <AdminDashboard
          user={user}
          authReady={authReady}
          categories={categories}
          metricsMap={metricsMap}
          siteSettings={siteSettings}
          adSettings={adSettings}
          onRefreshPublicData={refreshPublicData}
          onNavigate={navigate}
        />
      );
    }

    if (pathname.startsWith("/article/")) {
      return (
        <ArticlePage
          article={activeArticle}
          allArticles={articles}
          adSettings={adSettings}
          onNavigate={navigate}
        />
      );
    }

    if (activeCategorySlug) {
      return (
        <CategoryPage
          slug={activeCategorySlug}
          articles={articles}
          categories={categories}
          adSettings={adSettings}
          onNavigate={navigate}
        />
      );
    }

    if (pathname === "/search") {
      return (
        <SearchPage
          initialQuery={searchParams.get("q") || ""}
          articles={articles}
          onNavigate={navigate}
        />
      );
    }

    if (TRUST_ROUTES.includes(pathname as TrustRoute)) {
      return <TrustPages route={pathname as TrustRoute} onNavigate={navigate} />;
    }

    return (
      <HomePage
        articles={articles}
        categories={categories}
        metricsMap={metricsMap}
        siteSettings={siteSettings}
        adSettings={adSettings}
        onNavigate={navigate}
      />
    );
  };

  return (
    <ErrorBoundary>
      <div className="min-h-screen flex flex-col bg-white text-[#0A0A0A]">
        <Header
          currentPath={pathname}
          onNavigate={navigate}
          siteSettings={siteSettings}
        />
        <div className="flex-1">{renderRoute()}</div>
        <Footer
          categories={categories}
          siteSettings={siteSettings}
          onNavigate={navigate}
        />
      </div>
    </ErrorBoundary>
  );
}

export default App;
