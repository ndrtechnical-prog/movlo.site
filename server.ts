import express, { Request, Response, NextFunction } from "express";
import path from "path";
import fs from "fs";
import dotenv from "dotenv";
import { createServer as createViteServer, ViteDevServer } from "vite";
import { verifyFirebaseAdminBearer, VerifiedFirebaseUser } from "./server/services/firebaseAuthVerify.js";
import {
  fetchPublishedArticlesPublic,
  fetchPublishedArticleBySlugPublic
} from "./server/services/firestorePublic.js";
import { discoverTrendingTopics } from "./server/services/trendsDiscovery.js";
import {
  generateGroundedArticle,
  regenerateArticleTitle,
  generateMetaDescription,
  suggestFaqs,
  improveArticleDraft
} from "./server/services/aiEditorial.js";
import {
  buildSitemapXml,
  buildSitemapIndexXml,
  injectMetaIntoHtml,
  renderArticleMetaHtml
} from "./server/services/seoRenderer.js";

dotenv.config();

const app = express();
const PORT = 3000;
const SITE_ORIGIN = "https://movlo.site";

app.use(express.json({ limit: "2mb" }));
app.use(express.urlencoded({ extended: true, limit: "2mb" }));

interface AdminRequest extends Request {
  adminUser?: VerifiedFirebaseUser;
}

async function requireAdmin(req: AdminRequest, res: Response, next: NextFunction) {
  try {
    const user = await verifyFirebaseAdminBearer(req.headers.authorization);
    req.adminUser = user;
    next();
  } catch (err: any) {
    res.status(401).json({
      success: false,
      message: err?.message || "Unauthorized admin request."
    });
  }
}

// Health Check
app.get("/api/health", (_req: Request, res: Response) => {
  const hasGemini = Boolean(
    process.env.GEMINI_API_KEY && process.env.GEMINI_API_KEY !== "MY_GEMINI_API_KEY"
  );
  const hasYouTube = Boolean(process.env.YOUTUBE_API_KEY?.trim());
  res.json({
    ok: true,
    platform: "MOVLO.site",
    geminiConfigured: hasGemini,
    youtubeConfigured: hasYouTube,
    timestamp: new Date().toISOString()
  });
});

// Clean Service Worker unregistration for returning legacy visitors
app.get(["/sw.js", "/service-worker.js"], (_req: Request, res: Response) => {
  res.setHeader("Content-Type", "application/javascript; charset=UTF-8");
  res.setHeader("Service-Worker-Allowed", "/");
  res.setHeader("Cache-Control", "no-cache, no-store, must-revalidate");
  res.send(
    `self.addEventListener('install',()=>self.skipWaiting());self.addEventListener('activate',e=>e.waitUntil(caches.keys().then(ks=>Promise.all(ks.map(k=>caches.delete(k)))).then(()=>self.registration.unregister())));`
  );
});

// Technical SEO: robots.txt & dynamic sitemaps
app.get("/robots.txt", (_req: Request, res: Response) => {
  res.type("text/plain").send(
    `User-agent: *\nAllow: /\nAllow: /article/\nAllow: /category/\nDisallow: /admin\nDisallow: /api/\n\nSitemap: ${SITE_ORIGIN}/sitemap-index.xml\nSitemap: ${SITE_ORIGIN}/sitemap.xml\n`
  );
});

app.get("/sitemap-index.xml", (_req: Request, res: Response) => {
  res.type("application/xml").send(buildSitemapIndexXml());
});

app.get("/sitemap.xml", async (_req: Request, res: Response) => {
  try {
    const articles = await fetchPublishedArticlesPublic();
    res.type("application/xml").send(buildSitemapXml(articles));
  } catch {
    res.type("application/xml").send(buildSitemapXml([]));
  }
});

// Admin-protected Trending Keyword Discovery
app.get("/api/trends/discover", requireAdmin, async (req: AdminRequest, res: Response) => {
  try {
    const country = typeof req.query.country === "string" ? req.query.country : "GLOBAL";
    const timeWindow = typeof req.query.timeWindow === "string" ? req.query.timeWindow : "24h";
    const category = typeof req.query.category === "string" ? req.query.category : "all";

    const result = await discoverTrendingTopics({ country, timeWindow, category });
    res.json({
      success: true,
      ...result
    });
  } catch (err: any) {
    console.error("Route /api/trends/discover error:", err?.message);
    res.status(500).json({
      success: false,
      message: "Unable to query trending feeds right now."
    });
  }
});

// Admin-protected AI Editorial Generator
app.post("/api/ai/generate-article", requireAdmin, async (req: AdminRequest, res: Response) => {
  try {
    const { topic, categoryName, categorySlug, relatedQueries, existingArticles, targetTone } =
      req.body || {};

    if (!topic || typeof topic !== "string" || topic.trim().length < 2 || topic.trim().length > 200) {
      res.status(400).json({ success: false, message: "Provide a topic between 2 and 200 characters." });
      return;
    }

    const draft = await generateGroundedArticle({
      topic: topic.trim(),
      categoryName: typeof categoryName === "string" && categoryName.trim() ? categoryName.trim() : "Trending News",
      categorySlug: typeof categorySlug === "string" && categorySlug.trim() ? categorySlug.trim() : "trending-news",
      relatedQueries: Array.isArray(relatedQueries) ? relatedQueries.map(String).slice(0, 8) : [],
      existingArticles: Array.isArray(existingArticles) ? existingArticles.slice(0, 12) : [],
      targetTone: typeof targetTone === "string" ? targetTone.slice(0, 120) : undefined
    });

    res.json({ success: true, draft });
  } catch (err: any) {
    console.error("Route /api/ai/generate-article error:", err?.message);
    res.status(500).json({
      success: false,
      message: err?.message || "Failed to generate grounded article draft."
    });
  }
});

app.post("/api/ai/regenerate-title", requireAdmin, async (req: AdminRequest, res: Response) => {
  try {
    const { currentTitle, summary, primaryKeyword } = req.body || {};
    if (!currentTitle || typeof currentTitle !== "string") {
      res.status(400).json({ success: false, message: "Current title is required." });
      return;
    }
    const result = await regenerateArticleTitle({
      currentTitle: currentTitle.slice(0, 200),
      summary: typeof summary === "string" ? summary.slice(0, 600) : "",
      primaryKeyword: typeof primaryKeyword === "string" ? primaryKeyword.slice(0, 120) : undefined
    });
    res.json({ success: true, ...result });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err?.message || "Failed to regenerate headlines." });
  }
});

app.post("/api/ai/meta-description", requireAdmin, async (req: AdminRequest, res: Response) => {
  try {
    const { title, contentMarkdown, primaryKeyword } = req.body || {};
    if (!title || !contentMarkdown) {
      res.status(400).json({ success: false, message: "Title and article content are required." });
      return;
    }
    const result = await generateMetaDescription({
      title: String(title).slice(0, 200),
      contentMarkdown: String(contentMarkdown).slice(0, 6000),
      primaryKeyword: typeof primaryKeyword === "string" ? primaryKeyword.slice(0, 120) : undefined
    });
    res.json({ success: true, ...result });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err?.message || "Failed to generate meta description." });
  }
});

app.post("/api/ai/suggest-faqs", requireAdmin, async (req: AdminRequest, res: Response) => {
  try {
    const { title, contentMarkdown } = req.body || {};
    if (!title || !contentMarkdown) {
      res.status(400).json({ success: false, message: "Title and article content are required." });
      return;
    }
    const result = await suggestFaqs({
      title: String(title).slice(0, 200),
      contentMarkdown: String(contentMarkdown).slice(0, 8000)
    });
    res.json({ success: true, ...result });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err?.message || "Failed to suggest FAQs." });
  }
});

app.post("/api/ai/improve-article", requireAdmin, async (req: AdminRequest, res: Response) => {
  try {
    const { title, contentMarkdown, instruction } = req.body || {};
    if (!title || !contentMarkdown) {
      res.status(400).json({ success: false, message: "Title and article content are required." });
      return;
    }
    const result = await improveArticleDraft({
      title: String(title).slice(0, 200),
      contentMarkdown: String(contentMarkdown).slice(0, 20000),
      instruction: typeof instruction === "string" ? instruction.slice(0, 300) : undefined
    });
    res.json({ success: true, ...result });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err?.message || "Failed to improve article draft." });
  }
});

// SSR HTML Transformation for SEO routes
async function applyRouteSeoHtml(
  req: Request,
  rawHtml: string,
  vite?: ViteDevServer
): Promise<string> {
  const urlPath = req.path;
  let html = vite ? await vite.transformIndexHtml(req.originalUrl, rawHtml) : rawHtml;

  if (urlPath.startsWith("/admin")) {
    return injectMetaIntoHtml(html, {
      title: "Editorial Studio — MOVLO",
      description: "Private editorial administration workspace for MOVLO.site.",
      canonical: `${SITE_ORIGIN}/admin`,
      robots: "noindex, nofollow"
    });
  }

  const articleMatch = urlPath.match(/^\/article\/([a-z0-9-]+)$/i);
  if (articleMatch) {
    const article = await fetchPublishedArticleBySlugPublic(articleMatch[1].toLowerCase());
    if (article) {
      return renderArticleMetaHtml(html, article);
    }
  }

  const categoryMatch = urlPath.match(/^\/category\/([a-z0-9-]+)$/i);
  if (categoryMatch) {
    const slug = categoryMatch[1].toLowerCase();
    const label = slug
      .split("-")
      .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
      .join(" ");
    return injectMetaIntoHtml(html, {
      title: `${label} — Trending Coverage & Explainers | MOVLO`,
      description: `Read the latest ${label} reporting, analysis, and guides on MOVLO.`,
      canonical: `${SITE_ORIGIN}/category/${slug}`
    });
  }

  const staticMeta: Record<string, { title: string; desc: string }> = {
    "/about": {
      title: "About Us — MOVLO",
      desc: "Learn about MOVLO, our editorial mission, and our commitment to clear, original reporting."
    },
    "/contact": {
      title: "Contact Us — MOVLO",
      desc: "Get in touch with the MOVLO editorial team for tips, corrections, or inquiries."
    },
    "/editorial-policy": {
      title: "Editorial Policy — MOVLO",
      desc: "How MOVLO researches, verifies, edits, and updates trending reporting and guides."
    },
    "/privacy-policy": {
      title: "Privacy Policy — MOVLO",
      desc: "MOVLO Privacy Policy covering analytics, cookies, and Google AdSense disclosures."
    },
    "/terms": {
      title: "Terms & Conditions — MOVLO",
      desc: "Terms and conditions governing use of MOVLO.site."
    },
    "/disclaimer": {
      title: "Disclaimer — MOVLO",
      desc: "Editorial and informational disclaimer for MOVLO.site."
    },
    "/cookie-policy": {
      title: "Cookie Policy — MOVLO",
      desc: "How MOVLO and third-party partners use cookies and local storage."
    }
  };

  if (staticMeta[urlPath]) {
    return injectMetaIntoHtml(html, {
      title: staticMeta[urlPath].title,
      description: staticMeta[urlPath].desc,
      canonical: `${SITE_ORIGIN}${urlPath}`
    });
  }

  return html;
}

async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa"
    });

    app.get(
      ["/article/:slug", "/category/:slug", "/admin", "/about", "/contact", "/editorial-policy", "/privacy-policy", "/terms", "/disclaimer", "/cookie-policy"],
      async (req: Request, res: Response, next: NextFunction) => {
        try {
          const indexPath = path.join(process.cwd(), "index.html");
          const rawHtml = await fs.promises.readFile(indexPath, "utf-8");
          const html = await applyRouteSeoHtml(req, rawHtml, vite);
          res.status(200).set({ "Content-Type": "text/html" }).send(html);
        } catch {
          next();
        }
      }
    );

    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");

    app.use(express.static(distPath, { index: false }));

    app.get("*", async (req: Request, res: Response) => {
      try {
        const indexPath = path.join(distPath, "index.html");
        const rawHtml = await fs.promises.readFile(indexPath, "utf-8");
        const html = await applyRouteSeoHtml(req, rawHtml);
        res.status(200).set({ "Content-Type": "text/html" }).send(html);
      } catch {
        res.status(404).send("Not Found");
      }
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`[MOVLO Server] Listening on http://localhost:${PORT}`);
  });
}

startServer();
