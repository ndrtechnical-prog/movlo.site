import {
  collection,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  orderBy,
  query,
  serverTimestamp,
  setDoc,
  updateDoc,
  where
} from "firebase/firestore";
import {
  AdSettings,
  Article,
  ArticleMetric,
  AutomationReport,
  Category,
  ContactMessage,
  SiteSettings,
  TrendingTopic,
  VALIDATION_BOUNDS
} from "../types";
import { db, handleFirestoreError, OperationType } from "./firebase";
import {
  DEFAULT_AD_SETTINGS,
  DEFAULT_CATEGORIES,
  DEFAULT_SITE_SETTINGS,
  STARTER_ARTICLES
} from "./defaultCatalog";

function stripEmpty<T extends Record<string, any>>(obj: T): Record<string, any> {
  const out: Record<string, any> = {};
  for (const [k, v] of Object.entries(obj)) {
    if (v === undefined || v === null) continue;
    out[k] = v;
  }
  return out;
}

export function sanitizeSlug(raw: string): string {
  return (
    raw
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "")
      .slice(0, VALIDATION_BOUNDS.slugMax) || `post-${Date.now()}`
  );
}

export function sanitizeId(raw: string): string {
  const cleaned = raw.replace(/[^a-zA-Z0-9_-]+/g, "-").replace(/^-+|-+$/g, "").slice(0, 120);
  return cleaned || `id-${Date.now()}`;
}

export function computeReadingTime(markdown: string): number {
  const words = markdown.trim().split(/\s+/).filter(Boolean).length;
  return Math.max(1, Math.min(120, Math.round(words / 220)));
}

// ---------- PUBLIC READS ----------

export async function fetchPublishedArticles(): Promise<Article[]> {
  try {
    const q = query(collection(db, "articles"), where("status", "==", "published"));
    const snap = await getDocs(q);
    const items = snap.docs.map((d) => ({ ...(d.data() as Article), id: d.id }));
    items.sort((a, b) => {
      const ta = new Date(a.publishedAt || 0).getTime();
      const tb = new Date(b.publishedAt || 0).getTime();
      return tb - ta;
    });
    return items;
  } catch (err) {
    handleFirestoreError(err, OperationType.LIST, "articles");
  }
}

export async function fetchAllArticlesAdmin(): Promise<Article[]> {
  try {
    const snap = await getDocs(collection(db, "articles"));
    const items = snap.docs.map((d) => ({ ...(d.data() as Article), id: d.id }));
    items.sort((a, b) => {
      const ta = new Date(a.publishedAt || 0).getTime();
      const tb = new Date(b.publishedAt || 0).getTime();
      return tb - ta;
    });
    return items;
  } catch (err) {
    handleFirestoreError(err, OperationType.LIST, "articles");
  }
}

export async function fetchCategories(): Promise<Category[]> {
  try {
    const q = query(collection(db, "categories"), orderBy("order", "asc"));
    const snap = await getDocs(q);
    return snap.docs.map((d) => ({ ...(d.data() as Category), id: d.id }));
  } catch (err) {
    handleFirestoreError(err, OperationType.LIST, "categories");
  }
}

export async function fetchSiteSettings(): Promise<SiteSettings> {
  try {
    const snap = await getDoc(doc(db, "settings", "site"));
    if (snap.exists()) {
      return { ...DEFAULT_SITE_SETTINGS, ...(snap.data() as Partial<SiteSettings>) };
    }
    return DEFAULT_SITE_SETTINGS;
  } catch {
    return DEFAULT_SITE_SETTINGS;
  }
}

export async function fetchAdSettings(): Promise<AdSettings> {
  try {
    const snap = await getDoc(doc(db, "settings", "ads"));
    if (snap.exists()) {
      const raw = snap.data() as Partial<AdSettings>;
      return {
        publisherId: raw.publisherId || DEFAULT_AD_SETTINGS.publisherId,
        slots: { ...DEFAULT_AD_SETTINGS.slots, ...(raw.slots || {}) }
      };
    }
    return DEFAULT_AD_SETTINGS;
  } catch {
    return DEFAULT_AD_SETTINGS;
  }
}

export async function fetchArticleMetricsMap(): Promise<Record<string, number>> {
  try {
    const snap = await getDocs(collection(db, "articleMetrics"));
    const map: Record<string, number> = {};
    snap.docs.forEach((d) => {
      const data = d.data() as ArticleMetric;
      map[d.id] = typeof data.views === "number" ? data.views : 0;
    });
    return map;
  } catch {
    return {};
  }
}

export async function recordArticleView(articleId: string): Promise<void> {
  if (!VALIDATION_BOUNDS.idPattern.test(articleId)) return;
  try {
    const ref = doc(db, "articleMetrics", articleId);
    const snap = await getDoc(ref);
    if (!snap.exists()) {
      await setDoc(ref, {
        articleId,
        views: 1,
        updatedAt: serverTimestamp()
      });
    } else {
      const currentViews = Number((snap.data() as ArticleMetric).views || 0);
      await updateDoc(ref, {
        views: currentViews + 1,
        updatedAt: serverTimestamp()
      });
    }
  } catch {
    // View counter failures should never break reading experience
  }
}

export async function submitContactMessage(input: {
  name: string;
  email: string;
  subject: string;
  message: string;
}): Promise<void> {
  const id = `msg-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
  try {
    await setDoc(doc(db, "contactMessages", id), {
      name: input.name.trim().slice(0, 120),
      email: input.email.trim().slice(0, 160),
      subject: input.subject.trim().slice(0, 200),
      message: input.message.trim().slice(0, 4000),
      status: "unread",
      createdAt: serverTimestamp()
    });
  } catch (err) {
    handleFirestoreError(err, OperationType.CREATE, `contactMessages/${id}`);
  }
}

// ---------- ADMIN WRITES ----------

export async function saveArticle(
  article: Omit<Article, "createdAt" | "updatedAt">,
  isNew: boolean
): Promise<string> {
  const cleanId = sanitizeId(article.id || article.slug || `art-${Date.now()}`);
  const cleanSlug = sanitizeSlug(article.slug || article.title);
  const readingTimeMinutes =
    article.readingTimeMinutes && article.readingTimeMinutes >= 1
      ? Math.min(120, Math.round(article.readingTimeMinutes))
      : computeReadingTime(article.contentMarkdown);

  const payload = stripEmpty({
    id: cleanId,
    title: article.title.trim().slice(0, VALIDATION_BOUNDS.titleMax),
    slug: cleanSlug,
    summary: article.summary.trim().slice(0, VALIDATION_BOUNDS.summaryMax),
    contentMarkdown: article.contentMarkdown.trim().slice(0, VALIDATION_BOUNDS.contentMax),
    categorySlug: sanitizeSlug(article.categorySlug || "trending-news").slice(0, 80),
    categoryName: (article.categoryName || "Trending News").trim().slice(0, 80),
    primaryKeyword: article.primaryKeyword?.trim().slice(0, VALIDATION_BOUNDS.keywordMax),
    secondaryKeywords: Array.isArray(article.secondaryKeywords)
      ? article.secondaryKeywords.map((s) => String(s).trim()).filter(Boolean).slice(0, 20)
      : undefined,
    faqs: Array.isArray(article.faqs) ? article.faqs.slice(0, 15) : undefined,
    internalLinks: Array.isArray(article.internalLinks)
      ? article.internalLinks.slice(0, 15)
      : undefined,
    externalSources: Array.isArray(article.externalSources)
      ? article.externalSources.slice(0, 15)
      : undefined,
    featuredImageUrl: article.featuredImageUrl?.trim().slice(0, VALIDATION_BOUNDS.urlMax),
    featuredImageAlt: article.featuredImageAlt?.trim().slice(0, VALIDATION_BOUNDS.imageAltMax),
    authorName: (article.authorName || "MOVLO Editorial Desk").trim().slice(0, 100),
    authorUid: article.authorUid,
    seoTitle: article.seoTitle?.trim().slice(0, VALIDATION_BOUNDS.seoTitleMax),
    seoDescription: article.seoDescription?.trim().slice(0, VALIDATION_BOUNDS.seoDescMax),
    canonicalUrl: article.canonicalUrl?.trim().slice(0, 500),
    schemaType: article.schemaType === "NewsArticle" ? "NewsArticle" : "Article",
    status: article.status,
    readingTimeMinutes,
    isBreaking: Boolean(article.isBreaking),
    isFeatured: Boolean(article.isFeatured),
    isPopular: Boolean(article.isPopular),
    publishedAt:
      article.status === "published"
        ? article.publishedAt || new Date().toISOString()
        : article.publishedAt,
    scheduledFor: article.scheduledFor?.trim().slice(0, 64),
    sourceTopicId: article.sourceTopicId?.trim().slice(0, 128)
  });

  try {
    const ref = doc(db, "articles", cleanId);
    if (isNew) {
      await setDoc(ref, {
        ...payload,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      });
    } else {
      // Remove immutable keys on update
      const { id: _id, authorUid: _uid, ...updatable } = payload;
      await updateDoc(ref, {
        ...updatable,
        updatedAt: serverTimestamp()
      });
    }
    return cleanId;
  } catch (err) {
    handleFirestoreError(
      err,
      isNew ? OperationType.CREATE : OperationType.UPDATE,
      `articles/${cleanId}`
    );
  }
}

export async function deleteArticleById(articleId: string): Promise<void> {
  try {
    await deleteDoc(doc(db, "articles", articleId));
  } catch (err) {
    handleFirestoreError(err, OperationType.DELETE, `articles/${articleId}`);
  }
}

export async function saveCategory(cat: Omit<Category, "createdAt" | "updatedAt">, isNew: boolean): Promise<void> {
  const cleanSlug = sanitizeSlug(cat.slug || cat.name).slice(0, 80);
  const payload = {
    slug: cleanSlug,
    name: cat.name.trim().slice(0, 80),
    description: cat.description.trim().slice(0, 400),
    order: Math.max(0, Math.min(1000, Number(cat.order) || 0)),
    showInNav: Boolean(cat.showInNav)
  };
  try {
    const ref = doc(db, "categories", cleanSlug);
    if (isNew) {
      await setDoc(ref, {
        ...payload,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      });
    } else {
      await updateDoc(ref, {
        ...payload,
        updatedAt: serverTimestamp()
      });
    }
  } catch (err) {
    handleFirestoreError(err, isNew ? OperationType.CREATE : OperationType.UPDATE, `categories/${cleanSlug}`);
  }
}

export async function deleteCategoryById(slug: string): Promise<void> {
  try {
    await deleteDoc(doc(db, "categories", slug));
  } catch (err) {
    handleFirestoreError(err, OperationType.DELETE, `categories/${slug}`);
  }
}

export async function fetchTrendingTopicsAdmin(): Promise<TrendingTopic[]> {
  try {
    const snap = await getDocs(collection(db, "trendingTopics"));
    const items = snap.docs.map((d) => ({ ...(d.data() as TrendingTopic), id: d.id }));
    items.sort((a, b) => (b.opportunityScore || 0) - (a.opportunityScore || 0));
    return items;
  } catch (err) {
    handleFirestoreError(err, OperationType.LIST, "trendingTopics");
  }
}

export async function saveTrendingTopic(
  topic: Omit<TrendingTopic, "createdAt" | "updatedAt">,
  isNew = true
): Promise<string> {
  const cleanId = sanitizeId(topic.id || `topic-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`);
  const payload = stripEmpty({
    keyword: topic.keyword.trim().slice(0, 180),
    relatedQueries: Array.isArray(topic.relatedQueries)
      ? topic.relatedQueries.map(String).slice(0, 15)
      : undefined,
    country: topic.country.trim().slice(0, 40),
    categorySlug: sanitizeSlug(topic.categorySlug || "trending-news").slice(0, 80),
    source: topic.source.trim().slice(0, 120),
    sourceUrl: topic.sourceUrl?.trim().slice(0, 1000),
    trendDirection: topic.trendDirection,
    searchInterest: topic.searchInterest?.trim().slice(0, 120),
    discoveredAt: topic.discoveredAt || new Date().toISOString(),
    timeWindow: topic.timeWindow || "24h",
    opportunityScore: Math.max(0, Math.min(100, Number(topic.opportunityScore) || 50)),
    opportunityBasis: topic.opportunityBasis?.trim().slice(0, 240),
    status: topic.status,
    ownerUid: topic.ownerUid
  });

  try {
    const ref = doc(db, "trendingTopics", cleanId);
    if (isNew) {
      await setDoc(ref, {
        ...payload,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      });
    } else {
      const { ownerUid: _owner, ...updatable } = payload;
      await updateDoc(ref, {
        ...updatable,
        updatedAt: serverTimestamp()
      });
    }
    return cleanId;
  } catch (err) {
    handleFirestoreError(err, isNew ? OperationType.CREATE : OperationType.UPDATE, `trendingTopics/${cleanId}`);
  }
}

export async function deleteTrendingTopicById(topicId: string): Promise<void> {
  try {
    await deleteDoc(doc(db, "trendingTopics", topicId));
  } catch (err) {
    handleFirestoreError(err, OperationType.DELETE, `trendingTopics/${topicId}`);
  }
}

export async function saveSiteSettings(settings: Omit<SiteSettings, "updatedAt">): Promise<void> {
  try {
    await setDoc(doc(db, "settings", "site"), {
      siteName: settings.siteName.trim().slice(0, 100),
      tagline: settings.tagline.trim().slice(0, 200),
      domain: settings.domain.trim().slice(0, 200),
      logoText: settings.logoText.trim().slice(0, 60),
      defaultLanguage: settings.defaultLanguage.trim().slice(0, 20),
      defaultSeoTitle: settings.defaultSeoTitle.trim().slice(0, 160),
      defaultSeoDescription: settings.defaultSeoDescription.trim().slice(0, 320),
      footerInfo: settings.footerInfo.trim().slice(0, 500),
      socialLinks: settings.socialLinks || {},
      updatedAt: serverTimestamp()
    });
  } catch (err) {
    handleFirestoreError(err, OperationType.WRITE, "settings/site");
  }
}

export async function saveAdSettings(ads: Omit<AdSettings, "updatedAt">): Promise<void> {
  try {
    await setDoc(doc(db, "settings", "ads"), {
      publisherId: ads.publisherId.trim().slice(0, 64),
      slots: ads.slots,
      updatedAt: serverTimestamp()
    });
  } catch (err) {
    handleFirestoreError(err, OperationType.WRITE, "settings/ads");
  }
}

export async function fetchAutomationReportsAdmin(): Promise<AutomationReport[]> {
  try {
    const snap = await getDocs(collection(db, "automationReports"));
    return snap.docs.map((d) => ({ ...(d.data() as AutomationReport), id: d.id }));
  } catch (err) {
    handleFirestoreError(err, OperationType.LIST, "automationReports");
  }
}

export async function saveAutomationReport(
  report: Omit<AutomationReport, "id" | "createdAt">
): Promise<string> {
  const id = `rep-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
  try {
    await setDoc(
      doc(db, "automationReports", id),
      stripEmpty({
        workflowType: report.workflowType,
        summary: report.summary.slice(0, 2000),
        discoveredCount: Number(report.discoveredCount) || 0,
        duplicatesRemoved: report.duplicatesRemoved,
        draftsCreated: report.draftsCreated,
        outdatedArticleIds: report.outdatedArticleIds?.slice(0, 30),
        evergreenKeywords: report.evergreenKeywords?.slice(0, 30),
        createdByUid: report.createdByUid,
        createdAt: serverTimestamp()
      })
    );
    return id;
  } catch (err) {
    handleFirestoreError(err, OperationType.CREATE, `automationReports/${id}`);
  }
}

export async function fetchContactMessagesAdmin(): Promise<ContactMessage[]> {
  try {
    const snap = await getDocs(collection(db, "contactMessages"));
    return snap.docs.map((d) => ({ ...(d.data() as ContactMessage), id: d.id }));
  } catch (err) {
    handleFirestoreError(err, OperationType.LIST, "contactMessages");
  }
}

export async function markContactMessageReviewed(id: string): Promise<void> {
  try {
    await updateDoc(doc(db, "contactMessages", id), { status: "reviewed" });
  } catch (err) {
    handleFirestoreError(err, OperationType.UPDATE, `contactMessages/${id}`);
  }
}

export async function seedInitialEditorialData(adminUid: string): Promise<{
  categoriesSeeded: number;
  articlesSeeded: number;
}> {
  let categoriesSeeded = 0;
  let articlesSeeded = 0;

  const existingCats = await getDocs(collection(db, "categories"));
  if (existingCats.empty) {
    for (const cat of DEFAULT_CATEGORIES) {
      await setDoc(doc(db, "categories", cat.slug), {
        slug: cat.slug,
        name: cat.name,
        description: cat.description,
        order: cat.order,
        showInNav: cat.showInNav,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      });
      categoriesSeeded++;
    }
  }

  const existingArts = await getDocs(collection(db, "articles"));
  if (existingArts.empty) {
    for (const art of STARTER_ARTICLES) {
      await saveArticle({ ...art, authorUid: adminUid }, true);
      articlesSeeded++;
    }
  }

  const siteSnap = await getDoc(doc(db, "settings", "site"));
  if (!siteSnap.exists()) {
    await saveSiteSettings(DEFAULT_SITE_SETTINGS);
  }

  const adsSnap = await getDoc(doc(db, "settings", "ads"));
  if (!adsSnap.exists()) {
    await saveAdSettings(DEFAULT_AD_SETTINGS);
  }

  return { categoriesSeeded, articlesSeeded };
}
