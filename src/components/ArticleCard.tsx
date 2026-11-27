import React, { useState } from "react";
import { Article } from "../types";

interface ArticleCardProps {
  article: Article;
  onNavigate: (path: string) => void;
  variant?: "default" | "featured" | "compact";
}

export function formatEditorialDate(dateStr?: string): string {
  if (!dateStr) return "Recent";
  const d = new Date(dateStr);
  if (Number.isNaN(d.getTime())) return "Recent";
  return d.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric"
  });
}

export const ArticleCard: React.FC<ArticleCardProps> = ({
  article,
  onNavigate,
  variant = "default"
}) => {
  const [imgError, setImgError] = useState(false);

  const handleOpen = (e: React.MouseEvent) => {
    e.preventDefault();
    onNavigate(`/article/${article.slug}`);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  if (variant === "compact") {
    return (
      <article className="group py-4 border-b border-neutral-200 last:border-b-0">
        <a href={`/article/${article.slug}`} onClick={handleOpen} className="block">
          <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-neutral-500 mb-1.5">
            {article.categoryName} · {formatEditorialDate(article.publishedAt)} · {article.readingTimeMinutes} min read
          </p>
          <h3 className="font-editorial text-lg font-bold leading-snug text-[#0A0A0A] group-hover:underline underline-offset-4 decoration-neutral-400">
            {article.title}
          </h3>
        </a>
      </article>
    );
  }

  return (
    <article
      className={`group flex flex-col ${
        variant === "featured" ? "md:grid md:grid-cols-12 md:gap-8 items-start" : ""
      }`}
    >
      <a
        href={`/article/${article.slug}`}
        onClick={handleOpen}
        className={`block overflow-hidden bg-neutral-100 border border-neutral-200 ${
          variant === "featured" ? "md:col-span-7 w-full aspect-[16/10]" : "w-full aspect-[16/10] mb-4"
        }`}
      >
        {!imgError && article.featuredImageUrl ? (
          <img
            src={article.featuredImageUrl}
            alt={article.featuredImageAlt || article.title}
            loading="lazy"
            onError={() => setImgError(true)}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-[1.02]"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-neutral-100 text-neutral-400 text-xs uppercase tracking-[0.18em]">
            MOVLO Editorial
          </div>
        )}
      </a>

      <div className={variant === "featured" ? "md:col-span-5 pt-4 md:pt-1" : "flex-1 flex flex-col"}>
        <div className="flex flex-wrap items-center gap-x-2 text-[11px] font-semibold uppercase tracking-[0.14em] text-neutral-500 mb-2">
          <span className="text-[#0A0A0A]">{article.categoryName}</span>
          <span>·</span>
          <span>{formatEditorialDate(article.publishedAt)}</span>
          <span>·</span>
          <span className="font-mono-tabular">{article.readingTimeMinutes} min read</span>
        </div>

        <a href={`/article/${article.slug}`} onClick={handleOpen} className="block">
          <h3
            className={`font-editorial font-bold text-[#0A0A0A] group-hover:underline underline-offset-4 decoration-neutral-400 ${
              variant === "featured"
                ? "text-2xl sm:text-3xl leading-[1.18] mb-3"
                : "text-xl leading-[1.25] mb-2.5"
            }`}
          >
            {article.title}
          </h3>
        </a>

        <p className="text-sm text-neutral-600 leading-relaxed line-clamp-3">
          {article.summary}
        </p>
      </div>
    </article>
  );
};
