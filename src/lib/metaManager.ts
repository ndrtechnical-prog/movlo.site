import { Movie, StreamingSource } from "../types";

const DEFAULT_TITLE = "MOVLO — Stream Movies & Iconic 4K Cinema Clips";
const DEFAULT_DESCRIPTION =
  "Cinematic movie discovery and 4K clips streaming platform powered dynamically by Watchmode and Gemini AI with trending clips, related scene recommendations, and AI link publishing.";
const DEFAULT_KEYWORDS =
  "movies, cinema clips, movie scenes, watchmode, streaming, movie trailers, 4k clips, movie recommendations, where to watch, streaming guide";
const DEFAULT_IMAGE =
  "https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?w=1200&auto=format&fit=crop&q=80";

/**
 * Helper to update or create a meta tag by selector
 */
function setMetaTag(attributeName: "name" | "property", attributeValue: string, content: string): void {
  if (typeof document === "undefined") return;

  let el = document.querySelector(`meta[${attributeName}="${attributeValue}"]`);
  if (!el) {
    el = document.createElement("meta");
    el.setAttribute(attributeName, attributeValue);
    document.head.appendChild(el);
  }
  el.setAttribute("content", content);
}

/**
 * Helper to update or create a link tag by rel
 */
function setLinkTag(rel: string, href: string): void {
  if (typeof document === "undefined") return;

  let el = document.querySelector(`link[rel="${rel}"]`);
  if (!el) {
    el = document.createElement("link");
    el.setAttribute("rel", rel);
    document.head.appendChild(el);
  }
  el.setAttribute("href", href);
}

/**
 * Helper to inject or update JSON-LD structured data script
 */
export function setStructuredData(id: string, data: object): void {
  if (typeof document === "undefined") return;

  let script = document.getElementById(id) as HTMLScriptElement | null;
  if (!script) {
    script = document.createElement("script");
    script.id = id;
    script.type = "application/ld+json";
    document.head.appendChild(script);
  }
  script.text = JSON.stringify(data, null, 2);
}

/**
 * Helper to remove structured data script by id
 */
export function removeStructuredData(id: string): void {
  if (typeof document === "undefined") return;
  const script = document.getElementById(id);
  if (script && script.parentNode) {
    script.parentNode.removeChild(script);
  }
}

/**
 * Generate Schema.org Movie JSON-LD object
 */
export function generateMovieJsonLd(movie: Movie, sources: StreamingSource[] = [], currentUrl?: string): object {
  const pageUrl = currentUrl || (typeof window !== "undefined" ? window.location.href : `https://movlo.app/movie/${movie.id}`);
  
  const movieImages = [
    movie.backdrop,
    movie.poster,
    movie.trailerThumbnail
  ].filter(Boolean) as string[];

  const jsonLd: Record<string, any> = {
    "@context": "https://schema.org",
    "@type": "Movie",
    "@id": `${pageUrl}#movie`,
    "url": pageUrl,
    "name": movie.title,
    "headline": `${movie.title} (${movie.year || "Movie"})`,
    "description": movie.description || `Discover streaming options, plot summary, trailers, and ratings for ${movie.title} on MOVLO.`,
    "image": movieImages.length > 0 ? movieImages : [DEFAULT_IMAGE]
  };

  if (movie.releaseDate) {
    jsonLd.datePublished = movie.releaseDate;
  } else if (movie.year) {
    jsonLd.datePublished = `${movie.year}-01-01`;
  }

  if (movie.genres && movie.genres.length > 0) {
    jsonLd.genre = movie.genres;
  }

  if (movie.runtime) {
    jsonLd.duration = `PT${movie.runtime}M`;
  }

  if (movie.usRating) {
    jsonLd.contentRating = movie.usRating;
  }

  // Aggregate user rating
  const ratingValue = movie.userRating || movie.rating;
  if (ratingValue && ratingValue > 0) {
    jsonLd.aggregateRating = {
      "@type": "AggregateRating",
      "ratingValue": ratingValue,
      "bestRating": "10",
      "worstRating": "1",
      "ratingCount": movie.criticScore ? Math.round(movie.criticScore * 18) : 150
    };
  }

  // Trailer VideoObject
  if (movie.trailer) {
    jsonLd.trailer = {
      "@type": "VideoObject",
      "name": `${movie.title} Official Trailer`,
      "description": `Official trailer preview for ${movie.title} (${movie.year || ""})`,
      "thumbnailUrl": movie.trailerThumbnail || movie.poster || movie.backdrop || DEFAULT_IMAGE,
      "embedUrl": movie.trailer,
      "uploadDate": movie.releaseDate || "2024-01-01"
    };
  }

  // Streaming Availability Offers
  if (sources && sources.length > 0) {
    jsonLd.offers = sources.map((source) => {
      let category = "Subscription";
      if (source.type === "rent") category = "Rent";
      else if (source.type === "buy") category = "Buy";
      else if (source.type === "free") category = "Free";

      return {
        "@type": "Offer",
        "category": category,
        "price": source.price ? source.price.toString() : "0",
        "priceCurrency": "USD",
        "availability": "https://schema.org/InStock",
        "seller": {
          "@type": "Organization",
          "name": source.name
        },
        "url": source.webUrl || pageUrl
      };
    });
  }

  return jsonLd;
}

/**
 * Generate BreadcrumbList JSON-LD
 */
export function generateBreadcrumbsJsonLd(movieTitle: string, movieId: number, originUrl?: string): object {
  const origin = originUrl || (typeof window !== "undefined" ? window.location.origin : "https://movlo.app");
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "itemListElement": [
      {
        "@type": "ListItem",
        "position": 1,
        "name": "Home",
        "item": origin
      },
      {
        "@type": "ListItem",
        "position": 2,
        "name": "Movies",
        "item": `${origin}/#trending`
      },
      {
        "@type": "ListItem",
        "position": 3,
        "name": movieTitle,
        "item": `${origin}/movie/${movieId}`
      }
    ]
  };
}

/**
 * Generate Default WebSite structured data
 */
export function generateWebSiteJsonLd(originUrl?: string): object {
  const origin = originUrl || (typeof window !== "undefined" ? window.location.origin : "https://movlo.app");
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "name": "MOVLO",
    "alternateName": "MOVLO Cinema Streaming",
    "url": origin,
    "description": DEFAULT_DESCRIPTION,
    "potentialAction": {
      "@type": "SearchAction",
      "target": {
        "@type": "EntryPoint",
        "urlTemplate": `${origin}/?q={search_term_string}`
      },
      "query-input": "required name=search_term_string"
    }
  };
}

/**
 * Trims text to specified max length on word boundaries
 */
function cleanAndTrimText(text: string, maxLength: number): string {
  if (!text) return "";
  const cleaned = text.replace(/\s+/g, " ").trim();
  if (cleaned.length <= maxLength) return cleaned;
  return cleaned.substring(0, maxLength).replace(/\s+\S*$/, "") + "...";
}

/**
 * Dynamic Meta Tag Manager: Set metadata for a Movie page
 */
export function setMovieMetadata(movie: Movie, sources: StreamingSource[] = []): void {
  if (typeof document === "undefined" || typeof window === "undefined") return;

  const yearSuffix = movie.year ? ` (${movie.year})` : "";
  const ratingSuffix = movie.rating ? ` ★ ${movie.rating}` : "";
  
  // 1. Dynamic Document Title
  // Optimized for Google SERP display (under 60 chars where possible)
  const title = `${movie.title}${yearSuffix}${ratingSuffix} — Stream & Plot | MOVLO`;
  document.title = title;

  // 2. Dynamic Meta Description using Movie Title and Plot Overview
  let plotText = movie.description || "";
  let metaDesc: string;

  if (plotText) {
    const trimmedPlot = cleanAndTrimText(plotText, 120);
    metaDesc = `Watch ${movie.title}${yearSuffix}: ${trimmedPlot} Find where to stream, rent, or buy online on MOVLO.`;
  } else {
    metaDesc = `Discover ${movie.title}${yearSuffix} on MOVLO. Explore full movie plot, release information, user reviews, official trailer, and streaming options.`;
  }
  metaDesc = cleanAndTrimText(metaDesc, 160);

  setMetaTag("name", "description", metaDesc);

  // 3. Dynamic Keywords
  const genreList = movie.genres && movie.genres.length > 0 ? movie.genres.join(", ") : "Cinema";
  const dynamicKeywords = `${movie.title}, ${movie.title} stream, ${movie.title} plot, ${movie.title} cast, watch ${movie.title} online, ${genreList}, streaming sources, where to watch, MOVLO`;
  setMetaTag("name", "keywords", dynamicKeywords);

  // 4. OpenGraph & Social Cards
  const currentUrl = window.location.href;
  const image = movie.backdrop || movie.poster || DEFAULT_IMAGE;

  setMetaTag("property", "og:title", `${movie.title}${yearSuffix} — Stream & Where to Watch`);
  setMetaTag("property", "og:description", metaDesc);
  setMetaTag("property", "og:type", "video.movie");
  setMetaTag("property", "og:url", currentUrl);
  setMetaTag("property", "og:image", image);
  setMetaTag("property", "og:site_name", "MOVLO");

  // 5. Twitter Card
  setMetaTag("name", "twitter:card", "summary_large_image");
  setMetaTag("name", "twitter:title", `${movie.title}${yearSuffix} | MOVLO`);
  setMetaTag("name", "twitter:description", metaDesc);
  setMetaTag("name", "twitter:image", image);

  // 6. Canonical Link
  setLinkTag("canonical", `${window.location.origin}/movie/${movie.id}`);

  // 7. Structured JSON-LD Data for Movie and Breadcrumbs
  const movieJsonLd = generateMovieJsonLd(movie, sources, currentUrl);
  setStructuredData("movie-jsonld", movieJsonLd);

  const breadcrumbsJsonLd = generateBreadcrumbsJsonLd(movie.title, movie.id);
  setStructuredData("breadcrumbs-jsonld", breadcrumbsJsonLd);
}

/**
 * Dynamic Meta Tag Manager: Reset to Default Application Metadata
 */
export function resetDefaultMetadata(): void {
  if (typeof document === "undefined" || typeof window === "undefined") return;

  document.title = DEFAULT_TITLE;
  setMetaTag("name", "description", DEFAULT_DESCRIPTION);
  setMetaTag("name", "keywords", DEFAULT_KEYWORDS);

  const currentUrl = window.location.origin;
  setMetaTag("property", "og:title", DEFAULT_TITLE);
  setMetaTag("property", "og:description", DEFAULT_DESCRIPTION);
  setMetaTag("property", "og:type", "website");
  setMetaTag("property", "og:url", currentUrl);
  setMetaTag("property", "og:image", DEFAULT_IMAGE);
  setMetaTag("property", "og:site_name", "MOVLO");

  setMetaTag("name", "twitter:card", "summary_large_image");
  setMetaTag("name", "twitter:title", DEFAULT_TITLE);
  setMetaTag("name", "twitter:description", DEFAULT_DESCRIPTION);
  setMetaTag("name", "twitter:image", DEFAULT_IMAGE);

  setLinkTag("canonical", currentUrl);

  // Remove Movie-specific JSON-LD scripts
  removeStructuredData("movie-jsonld");
  removeStructuredData("breadcrumbs-jsonld");

  // Ensure default WebSite structured data is present
  setStructuredData("website-jsonld", generateWebSiteJsonLd());
}
