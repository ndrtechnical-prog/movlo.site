import React, { useMemo, useState } from "react";
import { Article, Category, AdSettings } from "../types";
import { ArticleCard } from "../components/ArticleCard";
import { AdSlot } from "../components/AdSlot";

interface CategoryPageProps {
  slug: string;
  articles: Article[];
  categories: Category[];
  adSettings: AdSettings;
  onNavigate: (path: string) => void;
}

export const CategoryPage: React.FC<CategoryPageProps> = ({
  slug,
  articles,
  categories,
  adSettings,
  onNavigate
}) => {
  const [limit, setLimit] = useState(9);

  const category = useMemo(
    () => categories.find((c) => c.slug === slug),
    [categories, slug]
  );

  const filtered = useMemo(() => {
    if (slug === "trending-news") {
      return articles.filter((a) => a.categorySlug === slug || a.isBreaking);
    }
    return articles.filter((a) => a.categorySlug === slug);
  }, [articles, slug]);

  const title =
    category?.name ||
    slug
      .split("-")
      .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
      .join(" ");

  return (
    <main className="max-w-[1320px] mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <nav aria-label="Breadcrumb" className="text-xs text-neutral-500 mb-6 flex items-center gap-2">
        <a
          href="/"
          onClick={(e) => {
            e.preventDefault();
            onNavigate("/");
          }}
          className="hover:text-[#0A0A0A]"
        >
          Home
        </a>
        <span>/</span>
        <span className="text-[#0A0A0A] font-medium">{title}</span>
      </nav>

      <header className="border-b border-[#0A0A0A] pb-6 mb-8">
        <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-neutral-500 mb-2">
          Section Archive
        </p>
        <h1 className="font-editorial text-3xl sm:text-4xl font-bold text-[#0A0A0A] mb-2">
          {title}
        </h1>
        {category?.description && (
          <p className="text-sm sm:text-base text-neutral-600 max-w-2xl">
            {category.description}
          </p>
        )}
      </header>

      <AdSlot placement="header_banner" adSettings={adSettings} className="mb-8" />

      {filtered.length === 0 ? (
        <div className="border border-neutral-200 p-12 text-center">
          <p className="font-editorial text-xl font-semibold text-[#0A0A0A] mb-2">
            No published stories in {title} yet
          </p>
          <p className="text-sm text-neutral-600 mb-6">
            Explore other sections or check back soon as new trending articles are published.
          </p>
          <button
            type="button"
            onClick={() => onNavigate("/")}
            className="px-5 py-2 bg-[#0A0A0A] text-white text-xs font-semibold uppercase tracking-wider cursor-pointer"
          >
            Back to Home
          </button>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {filtered.slice(0, limit).map((art) => (
              <ArticleCard key={art.id} article={art} onNavigate={onNavigate} />
            ))}
          </div>

          {filtered.length > limit && (
            <div className="mt-10 text-center">
              <button
                type="button"
                onClick={() => setLimit((v) => v + 9)}
                className="px-6 py-2.5 border border-[#0A0A0A] text-xs font-semibold uppercase tracking-wider hover:bg-[#0A0A0A] hover:text-white transition-colors cursor-pointer"
              >
                Load More
              </button>
            </div>
          )}
        </>
      )}
    </main>
  );
};
