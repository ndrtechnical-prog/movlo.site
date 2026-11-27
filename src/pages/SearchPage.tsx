import React, { useMemo, useState } from "react";
import { Search } from "lucide-react";
import { Article } from "../types";
import { ArticleCard } from "../components/ArticleCard";

interface SearchPageProps {
  initialQuery: string;
  articles: Article[];
  onNavigate: (path: string) => void;
}

export const SearchPage: React.FC<SearchPageProps> = ({
  initialQuery,
  articles,
  onNavigate
}) => {
  const [query, setQuery] = useState(initialQuery);

  const results = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return articles;
    return articles.filter((a) => {
      const hay = [
        a.title,
        a.summary,
        a.categoryName,
        a.primaryKeyword || "",
        ...(a.secondaryKeywords || []),
        a.contentMarkdown
      ]
        .join(" ")
        .toLowerCase();
      return hay.includes(q);
    });
  }, [articles, query]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onNavigate(`/search?q=${encodeURIComponent(query.trim())}`);
  };

  return (
    <main className="max-w-[1320px] mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <header className="border-b border-[#0A0A0A] pb-6 mb-8">
        <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-neutral-500 mb-2">
          Editorial Search
        </p>
        <h1 className="font-editorial text-3xl sm:text-4xl font-bold text-[#0A0A0A] mb-5">
          Search MOVLO
        </h1>

        <form onSubmit={handleSubmit} className="flex items-center gap-3 max-w-2xl">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-neutral-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search headlines, topics, guides, keywords..."
              className="w-full pl-10 pr-4 py-2.5 border border-neutral-300 text-sm text-[#0A0A0A] focus:outline-none focus:border-[#0A0A0A]"
            />
          </div>
          <button
            type="submit"
            className="px-5 py-2.5 bg-[#0A0A0A] text-white text-xs font-semibold uppercase tracking-wider hover:bg-neutral-800 transition-colors cursor-pointer"
          >
            Search
          </button>
        </form>
      </header>

      <p className="text-xs text-neutral-500 mb-6 font-mono-tabular">
        {results.length} {results.length === 1 ? "article" : "articles"} found
        {query.trim() ? ` for "${query.trim()}"` : ""}
      </p>

      {results.length === 0 ? (
        <div className="border border-neutral-200 p-10 text-center">
          <p className="font-editorial text-xl font-bold text-[#0A0A0A] mb-2">
            No matching articles
          </p>
          <p className="text-sm text-neutral-600">
            Try searching a broader topic such as AI, laptops, gaming, or streaming.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {results.map((art) => (
            <ArticleCard key={art.id} article={art} onNavigate={onNavigate} />
          ))}
        </div>
      )}
    </main>
  );
};
