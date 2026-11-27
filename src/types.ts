export type ArticleStatus = "draft" | "scheduled" | "published" | "archived";
export type ArticleSchemaType = "Article" | "NewsArticle";
export type TrendDirection = "Rising" | "Breakout" | "Steady" | "Manual";
export type TrendTimeWindow = "24h" | "7d" | "30d";
export type TopicStatus = "new" | "saved" | "drafted" | "rejected";

export type AdPlacementKey =
  | "header_banner"
  | "below_intro"
  | "mid_article"
  | "sidebar"
  | "after_article"
  | "homepage_banner";

export interface FaqItem {
  question: string;
  answer: string;
}

export interface InternalLinkItem {
  title: string;
  slug: string;
}

export interface ExternalSourceItem {
  title: string;
  url: string;
}

export interface Article {
  id: string;
  title: string;
  slug: string;
  summary: string;
  contentMarkdown: string;
  categorySlug: string;
  categoryName: string;
  primaryKeyword?: string;
  secondaryKeywords?: string[];
  faqs?: FaqItem[];
  internalLinks?: InternalLinkItem[];
  externalSources?: ExternalSourceItem[];
  featuredImageUrl?: string;
  featuredImageAlt?: string;
  authorName: string;
  authorUid: string;
  seoTitle?: string;
  seoDescription?: string;
  canonicalUrl?: string;
  schemaType: ArticleSchemaType;
  status: ArticleStatus;
  readingTimeMinutes: number;
  isBreaking?: boolean;
  isFeatured?: boolean;
  isPopular?: boolean;
  publishedAt?: string;
  scheduledFor?: string;
  sourceTopicId?: string;
  createdAt?: unknown;
  updatedAt?: unknown;
}

export interface Category {
  id: string;
  slug: string;
  name: string;
  description: string;
  order: number;
  showInNav: boolean;
  createdAt?: unknown;
  updatedAt?: unknown;
}

export interface TrendingTopic {
  id: string;
  keyword: string;
  relatedQueries?: string[];
  country: string;
  categorySlug: string;
  source: string;
  sourceUrl?: string;
  trendDirection: TrendDirection;
  searchInterest?: string;
  discoveredAt: string;
  timeWindow?: TrendTimeWindow;
  opportunityScore: number;
  opportunityBasis?: string;
  status: TopicStatus;
  ownerUid: string;
  createdAt?: unknown;
  updatedAt?: unknown;
}

export interface AdSlotConfig {
  enabled: boolean;
  slotId: string;
  label: string;
}

export interface AdSettings {
  publisherId: string;
  slots: Record<AdPlacementKey, AdSlotConfig>;
  updatedAt?: unknown;
}

export interface SiteSettings {
  siteName: string;
  tagline: string;
  domain: string;
  logoText: string;
  defaultLanguage: string;
  defaultSeoTitle: string;
  defaultSeoDescription: string;
  footerInfo: string;
  socialLinks: {
    x?: string;
    youtube?: string;
    linkedin?: string;
    instagram?: string;
  };
  updatedAt?: unknown;
}

export interface ArticleMetric {
  articleId: string;
  views: number;
  updatedAt?: unknown;
}

export interface AutomationReport {
  id: string;
  workflowType: "daily" | "weekly";
  summary: string;
  discoveredCount: number;
  duplicatesRemoved?: number;
  draftsCreated?: number;
  outdatedArticleIds?: string[];
  evergreenKeywords?: string[];
  createdByUid: string;
  createdAt?: unknown;
}

export interface ContactMessage {
  id: string;
  name: string;
  email: string;
  subject: string;
  message: string;
  status: "unread" | "reviewed";
  createdAt?: unknown;
}

export const VALIDATION_BOUNDS = {
  idPattern: /^[a-zA-Z0-9_-]{1,128}$/,
  slugPattern: /^[a-z0-9]+(?:-[a-z0-9]+)*$/,
  categorySlugPattern: /^[a-z0-9-]+$/,
  titleMax: 200,
  slugMax: 160,
  summaryMax: 600,
  contentMax: 60000,
  keywordMax: 120,
  seoTitleMax: 160,
  seoDescMax: 320,
  imageAltMax: 250,
  urlMax: 1000
} as const;
