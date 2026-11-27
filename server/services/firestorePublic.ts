import fs from "fs";
import path from "path";

export interface PublicArticleDoc {
  id: string;
  title: string;
  slug: string;
  summary: string;
  contentMarkdown: string;
  categorySlug: string;
  categoryName: string;
  primaryKeyword?: string;
  secondaryKeywords?: string[];
  faqs?: Array<{ question: string; answer: string }>;
  internalLinks?: Array<{ title: string; slug: string }>;
  externalSources?: Array<{ title: string; url: string }>;
  featuredImageUrl?: string;
  featuredImageAlt?: string;
  authorName: string;
  seoTitle?: string;
  seoDescription?: string;
  canonicalUrl?: string;
  schemaType: "Article" | "NewsArticle";
  status: string;
  readingTimeMinutes: number;
  publishedAt?: string;
  updatedAt?: string;
}

export interface PublicSiteSettingsDoc {
  siteName?: string;
  tagline?: string;
  domain?: string;
  defaultSeoTitle?: string;
  defaultSeoDescription?: string;
}

function getFirebaseConfig(): { projectId: string; firestoreDatabaseId: string } {
  const cfgPath = path.join(process.cwd(), "firebase-applet-config.json");
  const raw = JSON.parse(fs.readFileSync(cfgPath, "utf-8"));
  return {
    projectId: String(raw.projectId || ""),
    firestoreDatabaseId: String(raw.firestoreDatabaseId || "(default)")
  };
}

function parseFirestoreValue(val: any): any {
  if (!val || typeof val !== "object") return undefined;
  if ("stringValue" in val) return val.stringValue;
  if ("integerValue" in val) return Number(val.integerValue);
  if ("doubleValue" in val) return Number(val.doubleValue);
  if ("booleanValue" in val) return Boolean(val.booleanValue);
  if ("timestampValue" in val) return val.timestampValue;
  if ("nullValue" in val) return null;
  if ("arrayValue" in val) {
    const values = val.arrayValue?.values || [];
    return values.map(parseFirestoreValue);
  }
  if ("mapValue" in val) {
    const fields = val.mapValue?.fields || {};
    const out: Record<string, any> = {};
    for (const [k, v] of Object.entries(fields)) {
      out[k] = parseFirestoreValue(v);
    }
    return out;
  }
  return undefined;
}

function parseDocumentFields(doc: any): Record<string, any> {
  const fields = doc?.fields || {};
  const out: Record<string, any> = {};
  for (const [k, v] of Object.entries(fields)) {
    out[k] = parseFirestoreValue(v);
  }
  const nameParts = String(doc?.name || "").split("/");
  out.id = out.id || nameParts[nameParts.length - 1] || "";
  return out;
}

let cachedArticles: { data: PublicArticleDoc[]; expiresAt: number } | null = null;
let cachedSettings: { data: PublicSiteSettingsDoc; expiresAt: number } | null = null;

export async function fetchPublishedArticlesPublic(): Promise<PublicArticleDoc[]> {
  const now = Date.now();
  if (cachedArticles && now < cachedArticles.expiresAt) {
    return cachedArticles.data;
  }

  try {
    const cfg = getFirebaseConfig();
    const url = `https://firestore.googleapis.com/v1/projects/${encodeURIComponent(
      cfg.projectId
    )}/databases/${encodeURIComponent(cfg.firestoreDatabaseId)}/documents:runQuery`;

    const resp = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        structuredQuery: {
          from: [{ collectionId: "articles" }],
          where: {
            fieldFilter: {
              field: { fieldPath: "status" },
              op: "EQUAL",
              value: { stringValue: "published" }
            }
          },
          limit: 200
        }
      })
    });

    if (!resp.ok) {
      return [];
    }

    const rows = (await resp.json()) as Array<{ document?: any }>;
    const articles = rows
      .filter((r) => Boolean(r.document))
      .map((r) => parseDocumentFields(r.document) as PublicArticleDoc)
      .filter((a) => a.slug && a.title && a.status === "published")
      .sort((a, b) => {
        const ta = new Date(a.publishedAt || a.updatedAt || 0).getTime();
        const tb = new Date(b.publishedAt || b.updatedAt || 0).getTime();
        return tb - ta;
      });

    cachedArticles = { data: articles, expiresAt: now + 30_000 };
    return articles;
  } catch {
    return cachedArticles?.data || [];
  }
}

export async function fetchPublishedArticleBySlugPublic(
  slug: string
): Promise<PublicArticleDoc | null> {
  const all = await fetchPublishedArticlesPublic();
  return all.find((a) => a.slug === slug) || null;
}

export async function fetchSiteSettingsPublic(): Promise<PublicSiteSettingsDoc> {
  const now = Date.now();
  if (cachedSettings && now < cachedSettings.expiresAt) {
    return cachedSettings.data;
  }

  try {
    const cfg = getFirebaseConfig();
    const url = `https://firestore.googleapis.com/v1/projects/${encodeURIComponent(
      cfg.projectId
    )}/databases/${encodeURIComponent(cfg.firestoreDatabaseId)}/documents/settings/site`;
    const resp = await fetch(url);
    if (!resp.ok) {
      return {
        siteName: "MOVLO",
        tagline: "What's Trending. What's Worth Knowing.",
        domain: "https://movlo.site"
      };
    }
    const doc = await resp.json();
    const parsed = parseDocumentFields(doc) as PublicSiteSettingsDoc;
    cachedSettings = { data: parsed, expiresAt: now + 60_000 };
    return parsed;
  } catch {
    return {
      siteName: "MOVLO",
      tagline: "What's Trending. What's Worth Knowing.",
      domain: "https://movlo.site"
    };
  }
}
