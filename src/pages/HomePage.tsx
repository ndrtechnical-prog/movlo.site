import React, { useMemo, useState } from "react";
import { ArrowRight } from "lucide-react";
import { AdSettings, Article, Category, SiteSettings } from "../types";
import { ArticleCard, formatEditorialDate } from "../components/ArticleCard";
import { AdSlot } from "../components/AdSlot";

interface HomePageProps {
  articles: Article[];
  categories: Category[];
  metricsMap: Record<string, number>;
  siteSettings: SiteSettings;
  adSettings: AdSettings;
  onNavigate: (path: string) => void;
}

const SectionHeader: React.FC<{
  kicker?: string;
  title: string;
  actionLabel?: string;
  actionPath?: string;
  onNavigate: (path: string) => void;
}> = ({ kicker, title, actionLabel, actionPath, onNavigate }) => (
  <div className="flex items-end justify-between border-b border-[#0A0A0A] pb-3 mb-6">
    <div>
      {kicker && (
        <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-neutral-500 mb-1">
          {kicker}
        </p>
      )}
      <h2 className="font-editorial text-2xl sm:text-[26px] font-bold text-[#0A0A0A]">
        {title}
      </h2>
    </div>
    {actionLabel && actionPath && (
      <a
        href={actionPath}
        onClick={(e) => {
          e.preventDefault();
          onNavigate(actionPath);
          window.scrollTo({ top: 0, behavior: "smooth" });
        }}
        className="inline-flex items-center gap-1 text-xs font-semibold uppercase tracking-[0.12em] text-[#0A0A0A] hover:underline underline-offset-4 shrink-0"
      >
        <span>{actionLabel}</span>
        <ArrowRight className="w-3.5 h-3.5" />
      </a>
    )}
  </div>
);

export const HomePage: React.FC<HomePageProps> = ({
  articles,
  categories,
  metricsMap,
  siteSettings,
  adSettings,
  onNavigate
}) => {
  const [latestLimit, setLatestLimit] = useState(6);

  const breakingArticles = useMemo(() => {
    const flagged = articles.filter((a) => a.isBreaking);
    return flagged.length > 0 ? flagged : articles.slice(0, 4);
  }, [articles]);

  const leadHero = breakingArticles[0] || articles[0];
  const breakingSide = breakingArticles.slice(1, 4);

  const topStories = useMemo(() => {
    const featured = articles.filter((a) => a.isFeatured && a.id !== leadHero?.id);
    if (featured.length >= 3) return featured.slice(0, 3);
    const fallback = articles.filter((a) => a.id !== leadHero?.id);
    return [...featured, ...fallback.filter((f) => !featured.some((x) => x.id === f.id))].slice(0, 3);
  }, [articles, leadHero]);

  const mostSearchedTopics = useMemo(() => {
    const terms: Array<{ keyword: string; slug: string; category: string }> = [];
    const seen = new Set<string>();
    for (const a of articles) {
      if (a.primaryKeyword && !seen.has(a.primaryKeyword.toLowerCase())) {
        seen.add(a.primaryKeyword.toLowerCase());
        terms.push({
          keyword: a.primaryKeyword,
          slug: a.slug,
          category: a.categoryName
        });
      }
      for (const sec of a.secondaryKeywords || []) {
        if (terms.length >= 12) break;
        if (!seen.has(sec.toLowerCase())) {
          seen.add(sec.toLowerCase());
          terms.push({
            keyword: sec,
            slug: a.slug,
            category: a.categoryName
          });
        }
      }
    }
    return terms.slice(0, 10);
  }, [articles]);

  const techAndAi = useMemo(
    () =>
      articles
        .filter((a) =>
          ["technology", "artificial-intelligence", "internet-websites"].includes(a.categorySlug)
        )
        .slice(0, 3),
    [articles]
  );

  const entertainment = useMemo(
    () =>
      articles
        .filter((a) => ["entertainment", "movies-tv"].includes(a.categorySlug))
        .slice(0, 3),
    [articles]
  );

  const gamingAndApps = useMemo(
    () =>
      articles
        .filter((a) => ["gaming", "mobile-apps"].includes(a.categorySlug))
        .slice(0, 3),
    [articles]
  );

  const socialTrends = useMemo(
    () =>
      articles
        .filter((a) => ["social-media", "digital-lifestyle", "how-to-guides"].includes(a.categorySlug))
        .slice(0, 3),
    [articles]
  );

  const popularThisWeek = useMemo(() => {
    return [...articles]
      .sort((a, b) => {
        const va = metricsMap[a.id] || 0;
        const vb = metricsMap[b.id] || 0;
        if (vb !== va) return vb - va;
        if (a.isPopular !== b.isPopular) return a.isPopular ? -1 : 1;
        return 0;
      })
      .slice(0, 5);
  }, [articles, metricsMap]);

  if (articles.length === 0) {
    return (
      <main className="max-w-[1320px] mx-auto px-4 sm:px-6 lg:px-8 py-20 text-center">
        <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-neutral-500 mb-3">
          {siteSettings.tagline}
        </p>
        <h1 className="font-editorial text-3xl sm:text-4xl font-bold text-[#0A0A0A] mb-4">
          Editorial desk is preparing new coverage
        </h1>
        <p className="text-sm text-neutral-600 max-w-lg mx-auto mb-8">
          Visit the Editorial Studio to discover trending topics and publish your first article.
        </p>
        <button
          type="button"
          onClick={() => onNavigate("/admin")}
          className="px-5 py-2.5 bg-[#0A0A0A] text-white text-xs font-semibold uppercase tracking-wider hover:bg-neutral-800 transition-colors cursor-pointer"
        >
          Open Editorial Studio
        </button>
      </main>
    );
  }

  return (
    <main className="max-w-[1320px] mx-auto px-4 sm:px-6 lg:px-8 pt-6 pb-12">
      {/* Masthead Sub-bar */}
      <div className="flex flex-wrap items-center justify-between gap-2 pb-5 mb-6 border-b border-neutral-200 text-xs text-neutral-500">
        <span className="font-medium text-neutral-800">{siteSettings.tagline}</span>
        <div className="flex items-center gap-4 overflow-x-auto">
          {categories.slice(0, 6).map((c) => (
            <a
              key={c.slug}
              href={`/category/${c.slug}`}
              onClick={(e) => {
                e.preventDefault();
                onNavigate(`/category/${c.slug}`);
              }}
              className="whitespace-nowrap hover:text-[#0A0A0A] transition-colors"
            >
              {c.name}
            </a>
          ))}
        </div>
      </div>

      {/* Header Banner Ad Placement */}
      <AdSlot placement="header_banner" adSettings={adSettings} className="mt-0 mb-8" />

      {/* 1. BREAKING & TRENDING NOW */}
      <section aria-label="Breaking and Trending Now" className="mb-14">
        <SectionHeader
          kicker="Live Desk"
          title="Breaking & Trending Now"
          actionLabel="All Trending"
          actionPath="/category/trending-news"
          onNavigate={onNavigate}
        />

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {leadHero && (
            <div className="lg:col-span-8">
              <ArticleCard
                article={leadHero}
                onNavigate={onNavigate}
                variant="featured"
              />
            </div>
          )}

          <div className="lg:col-span-4 border-t lg:border-t-0 lg:border-l border-neutral-200 pt-6 lg:pt-0 lg:pl-7">
            <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-neutral-500 mb-2">
              Latest Dispatches
            </p>
            <div>
              {breakingSide.map((art) => (
                <ArticleCard
                  key={art.id}
                  article={art}
                  onNavigate={onNavigate}
                  variant="compact"
                />
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* 2. TODAY'S TOP STORIES */}
      {topStories.length > 0 && (
        <section aria-label="Today's Top Stories" className="mb-14">
          <SectionHeader
            kicker="Editors' Selection"
            title="Today's Top Stories"
            onNavigate={onNavigate}
          />
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {topStories.map((art) => (
              <ArticleCard key={art.id} article={art} onNavigate={onNavigate} />
            ))}
          </div>
        </section>
      )}

      {/* 3. MOST SEARCHED TOPICS */}
      {mostSearchedTopics.length > 0 && (
        <section
          aria-label="Most Searched Topics"
          className="mb-14 py-8 border-y border-neutral-200"
        >
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-5">
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-neutral-500 mb-1">
                Search Index
              </p>
              <h2 className="font-editorial text-2xl font-bold text-[#0A0A0A]">
                Most Searched Topics
              </h2>
            </div>
            <a
              href="/search"
              onClick={(e) => {
                e.preventDefault();
                onNavigate("/search");
              }}
              className="text-xs font-semibold uppercase tracking-[0.12em] text-[#0A0A0A] hover:underline underline-offset-4"
            >
              Explore Archive →
            </a>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
            {mostSearchedTopics.map((item, idx) => (
              <a
                key={`${item.keyword}-${idx}`}
                href={`/article/${item.slug}`}
                onClick={(e) => {
                  e.preventDefault();
                  onNavigate(`/article/${item.slug}`);
                  window.scrollTo({ top: 0, behavior: "smooth" });
                }}
                className="group border border-neutral-200 p-3.5 hover:border-[#0A0A0A] transition-colors bg-white"
              >
                <p className="text-[10px] font-mono-tabular uppercase tracking-widest text-neutral-400 mb-1">
                  0{idx + 1} · {item.category}
                </p>
                <p className="text-sm font-semibold text-[#0A0A0A] group-hover:underline underline-offset-4 line-clamp-1">
                  {item.keyword}
                </p>
              </a>
            ))}
          </div>
        </section>
      )}

      {/* Homepage Editorial Strip Ad */}
      <AdSlot placement="homepage_banner" adSettings={adSettings} className="mb-14" />

      {/* 4. TECHNOLOGY & AI */}
      {techAndAi.length > 0 && (
        <section aria-label="Technology and AI" className="mb-14">
          <SectionHeader
            kicker="Systems & Intelligence"
            title="Technology & AI"
            actionLabel="More Tech & AI"
            actionPath="/category/artificial-intelligence"
            onNavigate={onNavigate}
          />
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {techAndAi.map((art) => (
              <ArticleCard key={art.id} article={art} onNavigate={onNavigate} />
            ))}
          </div>
        </section>
      )}

      {/* 5. ENTERTAINMENT */}
      {entertainment.length > 0 && (
        <section aria-label="Entertainment" className="mb-14">
          <SectionHeader
            kicker="Screen & Culture"
            title="Entertainment"
            actionLabel="All Entertainment"
            actionPath="/category/entertainment"
            onNavigate={onNavigate}
          />
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {entertainment.map((art) => (
              <ArticleCard key={art.id} article={art} onNavigate={onNavigate} />
            ))}
          </div>
        </section>
      )}

      {/* 6. GAMING & APPS */}
      {gamingAndApps.length > 0 && (
        <section aria-label="Gaming and Apps" className="mb-14">
          <SectionHeader
            kicker="Interactive & Mobile"
            title="Gaming & Apps"
            actionLabel="All Gaming"
            actionPath="/category/gaming"
            onNavigate={onNavigate}
          />
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {gamingAndApps.map((art) => (
              <ArticleCard key={art.id} article={art} onNavigate={onNavigate} />
            ))}
          </div>
        </section>
      )}

      {/* 7. SOCIAL MEDIA TRENDS */}
      {socialTrends.length > 0 && (
        <section aria-label="Social Media Trends" className="mb-14">
          <SectionHeader
            kicker="Digital Behavior"
            title="Social Media Trends"
            actionLabel="Social & Guides"
            actionPath="/category/social-media"
            onNavigate={onNavigate}
          />
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {socialTrends.map((art) => (
              <ArticleCard key={art.id} article={art} onNavigate={onNavigate} />
            ))}
          </div>
        </section>
      )}

      {/* 8. LATEST ARTICLES + 9. POPULAR THIS WEEK */}
      <section className="grid grid-cols-1 lg:grid-cols-12 gap-10 pt-4">
        <div className="lg:col-span-8">
          <SectionHeader
            kicker="Chronological Feed"
            title="Latest Articles"
            onNavigate={onNavigate}
          />
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
            {articles.slice(0, latestLimit).map((art) => (
              <ArticleCard key={art.id} article={art} onNavigate={onNavigate} />
            ))}
          </div>

          {articles.length > latestLimit && (
            <div className="mt-10 text-center">
              <button
                type="button"
                onClick={() => setLatestLimit((prev) => prev + 6)}
                className="px-6 py-2.5 border border-[#0A0A0A] text-xs font-semibold uppercase tracking-[0.14em] text-[#0A0A0A] hover:bg-[#0A0A0A] hover:text-white transition-colors cursor-pointer"
              >
                Load More Articles
              </button>
            </div>
          )}
        </div>

        {/* 9. POPULAR THIS WEEK */}
        <aside className="lg:col-span-4 border-t lg:border-t-0 lg:border-l border-neutral-200 pt-8 lg:pt-0 lg:pl-8">
          <SectionHeader
            kicker="Most Read"
            title="Popular This Week"
            onNavigate={onNavigate}
          />
          <ol className="divide-y divide-neutral-200">
            {popularThisWeek.map((art, index) => (
              <li key={art.id} className="py-4 first:pt-0">
                <a
                  href={`/article/${art.slug}`}
                  onClick={(e) => {
                    e.preventDefault();
                    onNavigate(`/article/${art.slug}`);
                    window.scrollTo({ top: 0, behavior: "smooth" });
                  }}
                  className="group flex items-start gap-4"
                >
                  <span className="font-mono-tabular text-lg font-semibold text-neutral-300 group-hover:text-[#0A0A0A] transition-colors shrink-0">
                    {String(index + 1).padStart(2, "0")}
                  </span>
                  <div>
                    <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-neutral-500 mb-1">
                      {art.categoryName} · {formatEditorialDate(art.publishedAt)}
                    </p>
                    <h3 className="font-editorial text-base font-bold text-[#0A0A0A] leading-snug group-hover:underline underline-offset-4 decoration-neutral-400">
                      {art.title}
                    </h3>
                  </div>
                </a>
              </li>
            ))}
          </ol>
        </aside>
      </section>
    </main>
  );
};
