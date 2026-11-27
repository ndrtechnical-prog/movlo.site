export type TrendCountry = "GLOBAL" | "US" | "GB" | "CA" | "AU" | "IN" | "PK";
export type TrendTimeWindow = "24h" | "7d" | "30d";

export interface DiscoveredTrend {
  keyword: string;
  relatedQueries: string[];
  country: string;
  categorySlug: string;
  source: string;
  sourceUrl?: string;
  trendDirection: "Rising" | "Breakout" | "Steady" | "Manual";
  searchInterest?: string;
  discoveredAt: string;
  timeWindow: TrendTimeWindow;
  opportunityScore: number;
  opportunityBasis: string;
}

export interface TrendProviderStatus {
  provider: string;
  status: "connected" | "empty" | "unavailable" | "unconfigured";
  itemCount: number;
  note: string;
}

const COUNTRY_NAMES: Record<TrendCountry, string> = {
  GLOBAL: "Worldwide",
  US: "United States",
  GB: "United Kingdom",
  CA: "Canada",
  AU: "Australia",
  IN: "India",
  PK: "Pakistan"
};

function decodeXmlEntities(text: string): string {
  return text
    .replace(/<!\[CDATA\[([\s\S]*?)\]\]>/g, "$1")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&#x27;/g, "'")
    .replace(/<[^>]+>/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function extractTag(block: string, tag: string): string {
  const escaped = tag.replace(":", "\\:");
  const match = block.match(new RegExp(`<${escaped}[^>]*>([\\s\\S]*?)<\\/${escaped}>`, "i"));
  return match ? decodeXmlEntities(match[1]) : "";
}

function extractAllTags(block: string, tag: string): string[] {
  const escaped = tag.replace(":", "\\:");
  const regex = new RegExp(`<${escaped}[^>]*>([\\s\\S]*?)<\\/${escaped}>`, "gi");
  const results: string[] = [];
  let m: RegExpExecArray | null;
  while ((m = regex.exec(block)) !== null) {
    const val = decodeXmlEntities(m[1]);
    if (val) results.push(val);
  }
  return results;
}

export function classifyTopicCategory(keyword: string, hintCategory?: string): string {
  const lower = `${keyword} ${hintCategory || ""}`.toLowerCase();
  if (/(ai|openai|claude|gemini|llm|chatgpt|neural|copilot|machine learning|anthropic|perplexity|deepseek)/i.test(lower)) {
    return "artificial-intelligence";
  }
  if (/(iphone|android|pixel|samsung|windows|macbook|chip|nvidia|semiconductor|apple|microsoft|google|hardware|cybersecurity)/i.test(lower)) {
    return "technology";
  }
  if (/(game|gaming|playstation|xbox|nintendo|steam|gta|fortnite|valorant|esports|ps5|switch)/i.test(lower)) {
    return "gaming";
  }
  if (/(app|ios app|play store|whatsapp|telegram|apk|mobile app)/i.test(lower)) {
    return "mobile-apps";
  }
  if (/(tiktok|instagram|youtube|x\.com|twitter|snapchat|influencer|viral|creator|reel|shorts)/i.test(lower)) {
    return "social-media";
  }
  if (/(movie|film|netflix|trailer|box office|series|season|episode|oscar|cinema|hollywood|bollywood|actor|actress)/i.test(lower)) {
    return "movies-tv";
  }
  if (/(music|album|concert|celebrity|grammy|festival|award|entertainment)/i.test(lower)) {
    return "entertainment";
  }
  if (/(how to|guide|tutorial|fix|install|setup|enable|steps)/i.test(lower)) {
    return "how-to-guides";
  }
  if (/(website|browser|chrome|domain|search engine|cloudflare|web)/i.test(lower)) {
    return "internet-websites";
  }
  if (/(remote work|productivity|wellness|digital|minimalism|subscription)/i.test(lower)) {
    return "digital-lifestyle";
  }
  return "trending-news";
}

function withinTimeWindow(dateStr: string | undefined, window: TrendTimeWindow): boolean {
  if (!dateStr) return true;
  const parsed = Date.parse(dateStr);
  if (Number.isNaN(parsed)) return true;
  const maxAgeMs =
    window === "24h"
      ? 36 * 3600 * 1000 // slight margin for RSS timezone offsets
      : window === "7d"
        ? 7 * 24 * 3600 * 1000
        : 30 * 24 * 3600 * 1000;
  return Date.now() - parsed <= maxAgeMs;
}

async function fetchWithTimeout(url: string, timeoutMs = 6500): Promise<Response> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  try {
    return await fetch(url, {
      signal: controller.signal,
      headers: {
        "User-Agent": "MOVLO-Editorial-Platform/1.0 (https://movlo.site)"
      }
    });
  } finally {
    clearTimeout(timer);
  }
}

async function fetchGoogleTrendsRss(
  country: TrendCountry,
  window: TrendTimeWindow
): Promise<{ items: DiscoveredTrend[]; status: TrendProviderStatus }> {
  const geos = country === "GLOBAL" ? ["US", "GB", "IN"] : [country];
  const collected: DiscoveredTrend[] = [];
  let succeededGeos = 0;

  for (const geo of geos) {
    try {
      const url = `https://trends.google.com/trending/rss?geo=${encodeURIComponent(geo)}`;
      const resp = await fetchWithTimeout(url, 6000);
      if (!resp.ok) continue;
      const xml = await resp.text();
      const itemMatches = xml.match(/<item>[\s\S]*?<\/item>/gi) || [];
      succeededGeos++;

      for (const block of itemMatches.slice(0, 15)) {
        const keyword = extractTag(block, "title");
        if (!keyword || keyword.length < 2) continue;

        const approxTraffic = extractTag(block, "ht:approx_traffic");
        const pubDate = extractTag(block, "pubDate") || new Date().toISOString();
        if (!withinTimeWindow(pubDate, window)) continue;

        const newsTitles = extractAllTags(block, "ht:news_item_title").slice(0, 4);
        const newsUrls = extractAllTags(block, "ht:news_item_url");
        const link = newsUrls[0] || extractTag(block, "link");

        const signalScore = Math.min(95, 55 + newsTitles.length * 8 + (approxTraffic ? 12 : 0));
        collected.push({
          keyword: keyword.slice(0, 160),
          relatedQueries: newsTitles.map((t) => t.slice(0, 100)),
          country: country === "GLOBAL" ? `Worldwide (${geo})` : COUNTRY_NAMES[country],
          categorySlug: classifyTopicCategory(keyword, newsTitles.join(" ")),
          source: `Google Trends RSS (${geo})`,
          sourceUrl: link || undefined,
          trendDirection: approxTraffic && parseInt(approxTraffic.replace(/\D/g, ""), 10) >= 100000 ? "Breakout" : "Rising",
          searchInterest: approxTraffic ? `${approxTraffic} (Google Trends feed)` : undefined,
          discoveredAt: new Date(Date.parse(pubDate) || Date.now()).toISOString(),
          timeWindow: window,
          opportunityScore: signalScore,
          opportunityBasis: `Google Trends RSS (${geo}) · ${newsTitles.length} related headline signal(s)`
        });
      }
    } catch {
      // continue to next geo
    }
  }

  return {
    items: collected,
    status: {
      provider: "Google Trends RSS",
      status: succeededGeos === 0 ? "unavailable" : collected.length > 0 ? "connected" : "empty",
      itemCount: collected.length,
      note:
        succeededGeos === 0
          ? "Feed temporarily unreachable from runtime network."
          : `Parsed ${collected.length} trending entries from ${geos.join(", ")}.`
    }
  };
}

async function fetchOfficialNewsRss(
  country: TrendCountry,
  window: TrendTimeWindow
): Promise<{ items: DiscoveredTrend[]; status: TrendProviderStatus }> {
  const feeds = [
    { name: "BBC Technology RSS", url: "https://feeds.bbci.co.uk/news/technology/rss.xml", hint: "technology" },
    { name: "BBC Entertainment RSS", url: "https://feeds.bbci.co.uk/news/entertainment_and_arts/rss.xml", hint: "entertainment" },
    { name: "TechCrunch RSS", url: "https://techcrunch.com/feed/", hint: "technology artificial intelligence" },
    { name: "Hacker News Frontpage RSS", url: "https://hnrss.org/frontpage", hint: "technology programming" }
  ];

  const items: DiscoveredTrend[] = [];
  let connectedFeeds = 0;

  await Promise.all(
    feeds.map(async (feed) => {
      try {
        const resp = await fetchWithTimeout(feed.url, 6000);
        if (!resp.ok) return;
        const xml = await resp.text();
        const blocks = xml.match(/<item>[\s\S]*?<\/item>/gi) || [];
        connectedFeeds++;

        for (const block of blocks.slice(0, 6)) {
          const title = extractTag(block, "title");
          if (!title || title.length < 6) continue;
          const pubDate = extractTag(block, "pubDate") || new Date().toISOString();
          if (!withinTimeWindow(pubDate, window)) continue;
          const link = extractTag(block, "link");
          const categories = extractAllTags(block, "category").slice(0, 3);

          items.push({
            keyword: title.slice(0, 160),
            relatedQueries: categories,
            country: COUNTRY_NAMES[country],
            categorySlug: classifyTopicCategory(title, `${feed.hint} ${categories.join(" ")}`),
            source: feed.name,
            sourceUrl: link || undefined,
            trendDirection: "Rising",
            discoveredAt: new Date(Date.parse(pubDate) || Date.now()).toISOString(),
            timeWindow: window,
            opportunityScore: 68,
            opportunityBasis: `Official editorial feed (${feed.name}) · Recent headline`
          });
        }
      } catch {
        // continue
      }
    })
  );

  return {
    items,
    status: {
      provider: "Official News & Tech RSS",
      status: connectedFeeds === 0 ? "unavailable" : items.length > 0 ? "connected" : "empty",
      itemCount: items.length,
      note: `${connectedFeeds}/${feeds.length} official RSS feeds responded.`
    }
  };
}

async function fetchWikimediaTopTopics(
  country: TrendCountry,
  window: TrendTimeWindow
): Promise<{ items: DiscoveredTrend[]; status: TrendProviderStatus }> {
  try {
    // Wikimedia top pageviews is updated daily for yesterday (UTC)
    const d = new Date(Date.now() - 24 * 3600 * 1000);
    const yyyy = d.getUTCFullYear();
    const mm = String(d.getUTCMonth() + 1).padStart(2, "0");
    const dd = String(d.getUTCDate()).padStart(2, "0");
    const url = `https://wikimedia.org/api/rest_v1/metrics/pageviews/top/en.wikipedia/all-access/${yyyy}/${mm}/${dd}`;

    const resp = await fetchWithTimeout(url, 6000);
    if (!resp.ok) {
      return {
        items: [],
        status: {
          provider: "Wikimedia Pageviews API",
          status: "unavailable",
          itemCount: 0,
          note: `Wikimedia API returned HTTP ${resp.status}.`
        }
      };
    }

    const json = (await resp.json()) as {
      items?: Array<{ articles?: Array<{ article: string; views: number; rank: number }> }>;
    };
    const articles = json.items?.[0]?.articles || [];
    const filtered = articles
      .filter(
        (a) =>
          !a.article.startsWith("Special:") &&
          !a.article.startsWith("Wikipedia:") &&
          a.article !== "Main_Page" &&
          a.article !== "-"
      )
      .slice(0, 12);

    const items: DiscoveredTrend[] = filtered.map((a) => {
      const cleanTitle = decodeURIComponent(a.article).replace(/_/g, " ");
      return {
        keyword: cleanTitle.slice(0, 160),
        relatedQueries: [`${cleanTitle} explained`, `${cleanTitle} overview`],
        country: COUNTRY_NAMES[country],
        categorySlug: classifyTopicCategory(cleanTitle),
        source: "Wikimedia Top Pageviews",
        sourceUrl: `https://en.wikipedia.org/wiki/${encodeURIComponent(a.article)}`,
        trendDirection: a.rank <= 15 ? "Breakout" : "Steady",
        searchInterest: `${a.views.toLocaleString()} Wikipedia views (${yyyy}-${mm}-${dd})`,
        discoveredAt: new Date().toISOString(),
        timeWindow: window,
        opportunityScore: Math.max(55, 88 - a.rank),
        opportunityBasis: `Verified Wikipedia daily rank #${a.rank} (${a.views.toLocaleString()} views)`
      };
    });

    return {
      items,
      status: {
        provider: "Wikimedia Pageviews API",
        status: items.length > 0 ? "connected" : "empty",
        itemCount: items.length,
        note: `Fetched verified Wikipedia top articles for ${yyyy}-${mm}-${dd}.`
      }
    };
  } catch {
    return {
      items: [],
      status: {
        provider: "Wikimedia Pageviews API",
        status: "unavailable",
        itemCount: 0,
        note: "Network error reaching Wikimedia REST API."
      }
    };
  }
}

async function fetchYouTubeTrending(
  country: TrendCountry,
  window: TrendTimeWindow
): Promise<{ items: DiscoveredTrend[]; status: TrendProviderStatus }> {
  const apiKey = process.env.YOUTUBE_API_KEY?.trim();
  if (!apiKey) {
    return {
      items: [],
      status: {
        provider: "YouTube Data API v3",
        status: "unconfigured",
        itemCount: 0,
        note: "Optional YOUTUBE_API_KEY not set in environment."
      }
    };
  }

  const regionCode = country === "GLOBAL" ? "US" : country;
  try {
    const url = `https://www.googleapis.com/youtube/v3/videos?part=snippet,statistics&chart=mostPopular&regionCode=${encodeURIComponent(
      regionCode
    )}&maxResults=10&key=${encodeURIComponent(apiKey)}`;
    const resp = await fetchWithTimeout(url, 6000);
    if (!resp.ok) {
      return {
        items: [],
        status: {
          provider: "YouTube Data API v3",
          status: "unavailable",
          itemCount: 0,
          note: `YouTube API returned HTTP ${resp.status}.`
        }
      };
    }

    const json = (await resp.json()) as {
      items?: Array<{
        id: string;
        snippet?: { title?: string; channelTitle?: string; publishedAt?: string; tags?: string[] };
        statistics?: { viewCount?: string };
      }>;
    };

    const items: DiscoveredTrend[] = (json.items || [])
      .filter((v) => v.snippet?.title)
      .map((v) => {
        const title = String(v.snippet!.title).slice(0, 160);
        const viewCount = v.statistics?.viewCount ? Number(v.statistics.viewCount) : undefined;
        return {
          keyword: title,
          relatedQueries: (v.snippet?.tags || []).slice(0, 4),
          country: COUNTRY_NAMES[country],
          categorySlug: classifyTopicCategory(title, (v.snippet?.tags || []).join(" ")),
          source: `YouTube Trending (${regionCode})`,
          sourceUrl: `https://www.youtube.com/watch?v=${v.id}`,
          trendDirection: "Rising",
          searchInterest: viewCount ? `${viewCount.toLocaleString()} YouTube views` : undefined,
          discoveredAt: v.snippet?.publishedAt || new Date().toISOString(),
          timeWindow: window,
          opportunityScore: 76,
          opportunityBasis: `Authorized YouTube Data API (${regionCode})`
        };
      });

    return {
      items,
      status: {
        provider: "YouTube Data API v3",
        status: items.length > 0 ? "connected" : "empty",
        itemCount: items.length,
        note: `Fetched ${items.length} trending videos for region ${regionCode}.`
      }
    };
  } catch {
    return {
      items: [],
      status: {
        provider: "YouTube Data API v3",
        status: "unavailable",
        itemCount: 0,
        note: "Network error reaching YouTube Data API."
      }
    };
  }
}

export async function discoverTrendingTopics(options: {
  country?: string;
  timeWindow?: string;
  category?: string;
}): Promise<{
  topics: DiscoveredTrend[];
  providers: TrendProviderStatus[];
  duplicatesRemoved: number;
}> {
  const validCountries: TrendCountry[] = ["GLOBAL", "US", "GB", "CA", "AU", "IN", "PK"];
  const country: TrendCountry = validCountries.includes(options.country as TrendCountry)
    ? (options.country as TrendCountry)
    : "GLOBAL";

  const validWindows: TrendTimeWindow[] = ["24h", "7d", "30d"];
  const timeWindow: TrendTimeWindow = validWindows.includes(options.timeWindow as TrendTimeWindow)
    ? (options.timeWindow as TrendTimeWindow)
    : "24h";

  const [gtrends, news, wiki, yt] = await Promise.all([
    fetchGoogleTrendsRss(country, timeWindow),
    fetchOfficialNewsRss(country, timeWindow),
    fetchWikimediaTopTopics(country, timeWindow),
    fetchYouTubeTrending(country, timeWindow)
  ]);

  const providers = [gtrends.status, news.status, wiki.status, yt.status];
  const combined = [...gtrends.items, ...news.items, ...yt.items, ...wiki.items];

  // Deduplicate case-insensitively by normalized keyword
  const seen = new Map<string, DiscoveredTrend>();
  let duplicatesRemoved = 0;

  for (const item of combined) {
    const norm = item.keyword.toLowerCase().replace(/[^a-z0-9]+/g, " ").trim();
    if (!norm) continue;
    if (seen.has(norm)) {
      duplicatesRemoved++;
      const existing = seen.get(norm)!;
      existing.opportunityScore = Math.min(99, existing.opportunityScore + 6);
      existing.relatedQueries = Array.from(
        new Set([...existing.relatedQueries, ...item.relatedQueries])
      ).slice(0, 6);
    } else {
      seen.set(norm, item);
    }
  }

  let topics = Array.from(seen.values());
  if (options.category && options.category !== "all") {
    topics = topics.filter((t) => t.categorySlug === options.category);
  }

  topics.sort((a, b) => b.opportunityScore - a.opportunityScore);

  return {
    topics: topics.slice(0, 45),
    providers,
    duplicatesRemoved
  };
}
