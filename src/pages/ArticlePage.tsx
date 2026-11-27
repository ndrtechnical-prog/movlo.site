import React, { useEffect, useMemo, useState } from "react";
import { ChevronDown, ChevronUp, Share2, Check, ExternalLink } from "lucide-react";
import { AdSettings, Article } from "../types";
import { ArticleCard, formatEditorialDate } from "../components/ArticleCard";
import { AdSlot } from "../components/AdSlot";
import { MarkdownRenderer } from "../components/MarkdownRenderer";
import { recordArticleView } from "../lib/firestoreRepo";

interface ArticlePageProps {
  article: Article | null;
  allArticles: Article[];
  adSettings: AdSettings;
  onNavigate: (path: string) => void;
}

export const ArticlePage: React.FC<ArticlePageProps> = ({
  article,
  allArticles,
  adSettings,
  onNavigate
}) => {
  const [openFaq, setOpenFaq] = useState<number | null>(0);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (article && article.status === "published") {
      recordArticleView(article.id);
    }
  }, [article?.id, article?.status]);

  const relatedArticles = useMemo(() => {
    if (!article) return [];
    const sameCat = allArticles.filter(
      (a) => a.id !== article.id && a.categorySlug === article.categorySlug
    );
    const others = allArticles.filter(
      (a) => a.id !== article.id && a.categorySlug !== article.categorySlug
    );
    return [...sameCat, ...others].slice(0, 3);
  }, [article, allArticles]);

  const sidebarPopular = useMemo(() => {
    if (!article) return [];
    return allArticles.filter((a) => a.id !== article.id).slice(0, 5);
  }, [article, allArticles]);

  if (!article) {
    return (
      <main className="max-w-3xl mx-auto px-4 sm:px-6 py-20 text-center">
        <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-neutral-500 mb-2">
          404 · Not Found
        </p>
        <h1 className="font-editorial text-3xl font-bold text-[#0A0A0A] mb-3">
          Article not found
        </h1>
        <p className="text-sm text-neutral-600 mb-6">
          This story may have been moved or is not currently published.
        </p>
        <button
          type="button"
          onClick={() => onNavigate("/")}
          className="px-5 py-2.5 bg-[#0A0A0A] text-white text-xs font-semibold uppercase tracking-wider cursor-pointer"
        >
          Return to MOVLO Home
        </button>
      </main>
    );
  }

  const shareUrl = `https://movlo.site/article/${article.slug}`;
  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Clipboard blocked
    }
  };

  return (
    <main className="max-w-[1320px] mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
      {/* Breadcrumbs */}
      <nav
        aria-label="Breadcrumb"
        className="flex flex-wrap items-center gap-2 text-xs text-neutral-500 mb-6"
      >
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
        <a
          href={`/category/${article.categorySlug}`}
          onClick={(e) => {
            e.preventDefault();
            onNavigate(`/category/${article.categorySlug}`);
          }}
          className="hover:text-[#0A0A0A]"
        >
          {article.categoryName}
        </a>
        <span>/</span>
        <span className="text-[#0A0A0A] truncate max-w-[260px] sm:max-w-md">
          {article.title}
        </span>
      </nav>

      {/* Main Article + Sticky Sidebar Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
        <article className="lg:col-span-8">
          {/* Category Label */}
          <a
            href={`/category/${article.categorySlug}`}
            onClick={(e) => {
              e.preventDefault();
              onNavigate(`/category/${article.categorySlug}`);
            }}
            className="inline-block text-[11px] font-bold uppercase tracking-[0.18em] text-[#0A0A0A] border-b border-[#0A0A0A] pb-0.5 mb-4"
          >
            {article.categoryName}
          </a>

          {/* Single H1 */}
          <h1 className="font-editorial text-3xl sm:text-4xl lg:text-[42px] font-bold text-[#0A0A0A] leading-[1.14] mb-5">
            {article.title}
          </h1>

          {/* Short Summary */}
          <p className="text-lg text-neutral-600 leading-relaxed mb-6">
            {article.summary}
          </p>

          {/* Byline & Dates */}
          <div className="flex flex-wrap items-center justify-between gap-4 py-4 border-y border-neutral-200 mb-7 text-xs text-neutral-600">
            <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
              <span className="font-semibold text-[#0A0A0A]">
                By {article.authorName}
              </span>
              <span>·</span>
              <span>Published {formatEditorialDate(article.publishedAt)}</span>
              <span>·</span>
              <span className="font-mono-tabular">
                {article.readingTimeMinutes} min read
              </span>
            </div>

            {/* Social Sharing Links */}
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={handleCopyLink}
                className="inline-flex items-center gap-1.5 text-neutral-700 hover:text-[#0A0A0A] cursor-pointer"
              >
                {copied ? <Check className="w-3.5 h-3.5" /> : <Share2 className="w-3.5 h-3.5" />}
                <span>{copied ? "Copied" : "Copy Link"}</span>
              </button>
              <a
                href={`https://twitter.com/intent/tweet?url=${encodeURIComponent(shareUrl)}&text=${encodeURIComponent(article.title)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-[#0A0A0A]"
              >
                X
              </a>
              <a
                href={`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(shareUrl)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-[#0A0A0A]"
              >
                LinkedIn
              </a>
            </div>
          </div>

          {/* Featured Image */}
          {article.featuredImageUrl && (
            <figure className="mb-8">
              <div className="overflow-hidden border border-neutral-200 bg-neutral-100 aspect-[16/9]">
                <img
                  src={article.featuredImageUrl}
                  alt={article.featuredImageAlt || article.title}
                  className="w-full h-full object-cover"
                />
              </div>
              {article.featuredImageAlt && (
                <figcaption className="mt-2 text-xs text-neutral-500">
                  {article.featuredImageAlt}
                </figcaption>
              )}
            </figure>
          )}

          {/* Below Introduction Ad Slot */}
          <AdSlot placement="below_intro" adSettings={adSettings} />

          {/* Article Body + Mid-Article Ad Slot */}
          <MarkdownRenderer
            markdown={article.contentMarkdown}
            adSettings={adSettings}
            onNavigate={onNavigate}
          />

          {/* External Sources */}
          {article.externalSources && article.externalSources.length > 0 && (
            <section className="mt-10 pt-6 border-t border-neutral-200">
              <h2 className="font-editorial text-lg font-bold text-[#0A0A0A] mb-3">
                Sources &amp; References
              </h2>
              <ul className="space-y-2 text-sm">
                {article.externalSources.map((src, i) => (
                  <li key={i}>
                    <a
                      href={src.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 text-neutral-700 hover:text-[#0A0A0A] underline underline-offset-4 decoration-neutral-300"
                    >
                      <span>{src.title}</span>
                      <ExternalLink className="w-3.5 h-3.5 shrink-0" />
                    </a>
                  </li>
                ))}
              </ul>
            </section>
          )}

          {/* Frequently Asked Questions */}
          {article.faqs && article.faqs.length > 0 && (
            <section aria-label="Frequently Asked Questions" className="mt-12 pt-8 border-t border-[#0A0A0A]">
              <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-neutral-500 mb-1">
                Quick Answers
              </p>
              <h2 className="font-editorial text-2xl font-bold text-[#0A0A0A] mb-5">
                Frequently Asked Questions
              </h2>
              <div className="divide-y divide-neutral-200 border-y border-neutral-200">
                {article.faqs.map((faq, idx) => {
                  const isOpen = openFaq === idx;
                  return (
                    <div key={idx} className="py-4">
                      <button
                        type="button"
                        onClick={() => setOpenFaq(isOpen ? null : idx)}
                        className="w-full flex items-center justify-between gap-4 text-left cursor-pointer"
                      >
                        <h3 className="font-sans text-base font-semibold text-[#0A0A0A]">
                          {faq.question}
                        </h3>
                        {isOpen ? (
                          <ChevronUp className="w-4 h-4 text-neutral-500 shrink-0" />
                        ) : (
                          <ChevronDown className="w-4 h-4 text-neutral-500 shrink-0" />
                        )}
                      </button>
                      {isOpen && (
                        <p className="mt-2.5 text-sm text-neutral-600 leading-relaxed pr-6">
                          {faq.answer}
                        </p>
                      )}
                    </div>
                  );
                })}
              </div>
            </section>
          )}

          {/* After Article Ad Slot */}
          <AdSlot placement="after_article" adSettings={adSettings} className="mt-10" />
        </article>

        {/* Sticky 30% Right Sidebar */}
        <aside className="lg:col-span-4 lg:sticky lg:top-24 space-y-8 border-t lg:border-t-0 lg:border-l border-neutral-200 pt-8 lg:pt-0 lg:pl-8">
          <AdSlot placement="sidebar" adSettings={adSettings} className="mt-0" />

          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-neutral-500 mb-1">
              More From MOVLO
            </p>
            <h2 className="font-editorial text-xl font-bold text-[#0A0A0A] pb-3 border-b border-[#0A0A0A] mb-2">
              Trending Now
            </h2>
            <div>
              {sidebarPopular.map((item) => (
                <ArticleCard
                  key={item.id}
                  article={item}
                  onNavigate={onNavigate}
                  variant="compact"
                />
              ))}
            </div>
          </div>
        </aside>
      </div>

      {/* Related Articles */}
      {relatedArticles.length > 0 && (
        <section aria-label="Related Articles" className="mt-16 pt-10 border-t border-[#0A0A0A]">
          <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-neutral-500 mb-1">
            Continue Reading
          </p>
          <h2 className="font-editorial text-2xl font-bold text-[#0A0A0A] mb-6">
            Related Articles
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {relatedArticles.map((art) => (
              <ArticleCard key={art.id} article={art} onNavigate={onNavigate} />
            ))}
          </div>
        </section>
      )}
    </main>
  );
};
