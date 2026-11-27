import { PublicArticleDoc } from "./firestorePublic.js";

const SITE_ORIGIN = "https://movlo.site";

export function escapeHtml(str: string): string {
  return String(str)
    .replace(/&/g, "&amp;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

function escapeXml(str: string): string {
  return String(str)
    .replace(/&/g, "&amp;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

function absoluteAssetUrl(url?: string): string {
  if (!url) return `${SITE_ORIGIN}/assets/editorial/ai-computing.jpg`;
  if (url.startsWith("http://") || url.startsWith("https://")) return url;
  return `${SITE_ORIGIN}${url.startsWith("/") ? url : `/${url}`}`;
}

export function buildSitemapXml(articles: PublicArticleDoc[]): string {
  const staticPaths = [
    { loc: "/", changefreq: "hourly", priority: "1.0" },
    { loc: "/category/trending-news", changefreq: "hourly", priority: "0.9" },
    { loc: "/category/technology", changefreq: "daily", priority: "0.9" },
    { loc: "/category/artificial-intelligence", changefreq: "daily", priority: "0.9" },
    { loc: "/category/entertainment", changefreq: "daily", priority: "0.8" },
    { loc: "/category/movies-tv", changefreq: "daily", priority: "0.8" },
    { loc: "/category/gaming", changefreq: "daily", priority: "0.8" },
    { loc: "/category/mobile-apps", changefreq: "daily", priority: "0.8" },
    { loc: "/category/social-media", changefreq: "daily", priority: "0.8" },
    { loc: "/category/internet-websites", changefreq: "weekly", priority: "0.7" },
    { loc: "/category/how-to-guides", changefreq: "weekly", priority: "0.8" },
    { loc: "/category/digital-lifestyle", changefreq: "weekly", priority: "0.7" },
    { loc: "/about", changefreq: "monthly", priority: "0.5" },
    { loc: "/contact", changefreq: "monthly", priority: "0.5" },
    { loc: "/editorial-policy", changefreq: "monthly", priority: "0.5" },
    { loc: "/privacy-policy", changefreq: "monthly", priority: "0.4" },
    { loc: "/terms", changefreq: "monthly", priority: "0.4" },
    { loc: "/disclaimer", changefreq: "monthly", priority: "0.4" },
    { loc: "/cookie-policy", changefreq: "monthly", priority: "0.4" }
  ];

  const staticEntries = staticPaths
    .map(
      (p) => `  <url>
    <loc>${escapeXml(`${SITE_ORIGIN}${p.loc}`)}</loc>
    <changefreq>${p.changefreq}</changefreq>
    <priority>${p.priority}</priority>
  </url>`
    )
    .join("\n");

  const articleEntries = articles
    .map((a) => {
      const lastmod = a.updatedAt || a.publishedAt || new Date().toISOString();
      return `  <url>
    <loc>${escapeXml(`${SITE_ORIGIN}/article/${a.slug}`)}</loc>
    <lastmod>${escapeXml(new Date(lastmod).toISOString())}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.85</priority>
  </url>`;
    })
    .join("\n");

  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${staticEntries}
${articleEntries}
</urlset>`;
}

export function buildSitemapIndexXml(): string {
  const now = new Date().toISOString();
  return `<?xml version="1.0" encoding="UTF-8"?>
<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <sitemap>
    <loc>${SITE_ORIGIN}/sitemap.xml</loc>
    <lastmod>${escapeXml(now)}</lastmod>
  </sitemap>
</sitemapindex>`;
}

export function injectMetaIntoHtml(
  baseHtml: string,
  meta: {
    title: string;
    description: string;
    canonical: string;
    robots?: string;
    ogType?: string;
    imageUrl?: string;
    jsonLdGraph?: object[];
  }
): string {
  const safeTitle = escapeHtml(meta.title);
  const safeDesc = escapeHtml(meta.description);
  const safeCanonical = escapeHtml(meta.canonical);
  const safeRobots = escapeHtml(meta.robots || "index, follow, max-image-preview:large");
  const safeImage = escapeHtml(absoluteAssetUrl(meta.imageUrl));
  const safeOgType = escapeHtml(meta.ogType || "website");

  let html = baseHtml
    .replace(/<title>[\s\S]*?<\/title>/i, `<title>${safeTitle}</title>`)
    .replace(
      /<meta name="description" content="[^"]*"\s*\/?>/i,
      `<meta name="description" content="${safeDesc}" />`
    )
    .replace(
      /<meta name="robots" content="[^"]*"\s*\/?>/i,
      `<meta name="robots" content="${safeRobots}" />`
    )
    .replace(
      /<meta property="og:title" content="[^"]*"\s*\/?>/i,
      `<meta property="og:title" content="${safeTitle}" />`
    )
    .replace(
      /<meta property="og:description" content="[^"]*"\s*\/?>/i,
      `<meta property="og:description" content="${safeDesc}" />`
    )
    .replace(
      /<meta property="og:type" content="[^"]*"\s*\/?>/i,
      `<meta property="og:type" content="${safeOgType}" />`
    )
    .replace(
      /<meta property="og:url" content="[^"]*"\s*\/?>/i,
      `<meta property="og:url" content="${safeCanonical}" />`
    )
    .replace(
      /<meta property="og:image" content="[^"]*"\s*\/?>/i,
      `<meta property="og:image" content="${safeImage}" />`
    )
    .replace(
      /<meta name="twitter:title" content="[^"]*"\s*\/?>/i,
      `<meta name="twitter:title" content="${safeTitle}" />`
    )
    .replace(
      /<meta name="twitter:description" content="[^"]*"\s*\/?>/i,
      `<meta name="twitter:description" content="${safeDesc}" />`
    )
    .replace(
      /<meta name="twitter:image" content="[^"]*"\s*\/?>/i,
      `<meta name="twitter:image" content="${safeImage}" />`
    )
    .replace(
      /<link rel="canonical" href="[^"]*"\s*\/?>/i,
      `<link rel="canonical" href="${safeCanonical}" />`
    );

  if (meta.jsonLdGraph && meta.jsonLdGraph.length > 0) {
    const ldJson = JSON.stringify({
      "@context": "https://schema.org",
      "@graph": meta.jsonLdGraph
    });
    html = html.replace(
      /<script type="application\/ld\+json" id="movlo-jsonld">[\s\S]*?<\/script>/i,
      `<script type="application/ld+json" id="movlo-jsonld">${ldJson}</script>`
    );
  }

  return html;
}

export function renderArticleMetaHtml(baseHtml: string, article: PublicArticleDoc): string {
  const canonical = article.canonicalUrl || `${SITE_ORIGIN}/article/${article.slug}`;
  const title = `${article.seoTitle || article.title} | MOVLO`;
  const description = article.seoDescription || article.summary;
  const imageUrl = absoluteAssetUrl(article.featuredImageUrl);

  const graph: object[] = [
    {
      "@type": article.schemaType === "NewsArticle" ? "NewsArticle" : "Article",
      "@id": `${canonical}#article`,
      headline: article.title,
      description,
      image: [imageUrl],
      datePublished: article.publishedAt || article.updatedAt,
      dateModified: article.updatedAt || article.publishedAt,
      author: {
        "@type": "Person",
        name: article.authorName || "MOVLO Editorial Desk"
      },
      publisher: {
        "@type": "Organization",
        name: "MOVLO",
        url: SITE_ORIGIN
      },
      mainEntityOfPage: canonical
    },
    {
      "@type": "BreadcrumbList",
      itemListElement: [
        { "@type": "ListItem", position: 1, name: "Home", item: `${SITE_ORIGIN}/` },
        {
          "@type": "ListItem",
          position: 2,
          name: article.categoryName,
          item: `${SITE_ORIGIN}/category/${article.categorySlug}`
        },
        { "@type": "ListItem", position: 3, name: article.title, item: canonical }
      ]
    }
  ];

  if (Array.isArray(article.faqs) && article.faqs.length > 0) {
    graph.push({
      "@type": "FAQPage",
      mainEntity: article.faqs.map((f) => ({
        "@type": "Question",
        name: f.question,
        acceptedAnswer: {
          "@type": "Answer",
          text: f.answer
        }
      }))
    });
  }

  return injectMetaIntoHtml(baseHtml, {
    title,
    description,
    canonical,
    ogType: "article",
    imageUrl,
    jsonLdGraph: graph
  });
}
