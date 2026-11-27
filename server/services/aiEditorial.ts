import { GoogleGenAI, Type, ThinkingLevel } from "@google/genai";

function createAiClient(): GoogleGenAI {
  const apiKey = process.env.GEMINI_API_KEY?.trim();
  if (!apiKey || apiKey === "MY_GEMINI_API_KEY") {
    throw new Error("GEMINI_API_KEY is not configured on the server.");
  }
  return new GoogleGenAI({
    apiKey,
    httpOptions: {
      headers: {
        "User-Agent": "aistudio-build"
      }
    }
  });
}

const EDITORIAL_MODEL = "gemini-4-hydrogen";

export interface GeneratedArticleDraft {
  title: string;
  slug: string;
  summary: string;
  contentMarkdown: string;
  primaryKeyword: string;
  secondaryKeywords: string[];
  searchIntent: string;
  seoTitle: string;
  seoDescription: string;
  schemaType: "Article" | "NewsArticle";
  readingTimeMinutes: number;
  featuredImagePrompt: string;
  featuredImageAlt: string;
  recommendedStockImage: string;
  faqs: Array<{ question: string; answer: string }>;
  externalSources: Array<{ title: string; url: string }>;
}

const CATEGORY_DEFAULT_IMAGES: Record<string, string> = {
  "artificial-intelligence": "/assets/editorial/ai-computing.jpg",
  technology: "/assets/editorial/tech-devices.jpg",
  "movies-tv": "/assets/editorial/cinema-culture.jpg",
  entertainment: "/assets/editorial/cinema-culture.jpg",
  gaming: "/assets/editorial/gaming-studio.jpg",
  "mobile-apps": "/assets/editorial/tech-devices.jpg",
  "social-media": "/assets/editorial/social-media.jpg",
  "internet-websites": "/assets/editorial/ai-computing.jpg",
  "how-to-guides": "/assets/editorial/tech-devices.jpg",
  "digital-lifestyle": "/assets/editorial/social-media.jpg",
  "trending-news": "/assets/editorial/ai-computing.jpg"
};

function sanitizeSlug(raw: string): string {
  return raw
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 140) || `article-${Date.now()}`;
}

export async function generateGroundedArticle(params: {
  topic: string;
  categoryName: string;
  categorySlug: string;
  relatedQueries?: string[];
  existingArticles?: Array<{ title: string; slug: string }>;
  targetTone?: string;
}): Promise<GeneratedArticleDraft> {
  const ai = createAiClient();
  const relatedHint = (params.relatedQueries || []).slice(0, 6).join(", ");
  const internalLinksHint = (params.existingArticles || [])
    .slice(0, 8)
    .map((a) => `- "${a.title}" -> /article/${a.slug}`)
    .join("\n");

  // Step 1: Research with Google Search grounding (cannot combine googleSearch with responseSchema cleanly in all cases, so research first then structure)
  const researchPrompt = `Research the trending topic "${params.topic}" in the category "${params.categoryName}".
${relatedHint ? `Related search queries: ${relatedHint}` : ""}
Identify verified facts, timeline, context, key entities, why people are searching for this right now, and main search intent (informational, news, or how-to).
Do NOT fabricate statistics, dates, or quotes. Only report verifiable details found via search.`;

  const researchResp = await ai.models.generateContent({
    model: EDITORIAL_MODEL,
    contents: researchPrompt,
    config: {
      tools: [{ googleSearch: {} }],
      thinkingConfig: { thinkingLevel: ThinkingLevel.LOW }
    }
  });

  const researchNotes = researchResp.text || "";
  const groundingChunks =
    researchResp.candidates?.[0]?.groundingMetadata?.groundingChunks || [];
  const groundedSources: Array<{ title: string; url: string }> = [];
  for (const chunk of groundingChunks) {
    if (chunk?.web?.uri && chunk?.web?.title) {
      if (!groundedSources.some((s) => s.url === chunk.web!.uri)) {
        groundedSources.push({
          title: String(chunk.web.title).slice(0, 140),
          url: String(chunk.web.uri).slice(0, 500)
        });
      }
    }
  }

  // Step 2: Generate clean structured editorial article based strictly on research
  const draftPrompt = `You are a senior editor at MOVLO (https://movlo.site), a modern editorial publication ("What's Trending. What's Worth Knowing.").

Write an original, genuinely helpful, reader-first article about: "${params.topic}"
Category: ${params.categoryName} (${params.categorySlug})
${params.targetTone ? `Editorial angle: ${params.targetTone}` : ""}

Verified research context from Google Search:
${researchNotes.slice(0, 6000)}

${internalLinksHint ? `Available internal MOVLO articles you may naturally link to using markdown links [Title](/article/slug) ONLY where relevant:\n${internalLinksHint}` : ""}

Strict editorial rules:
1. Natural, clear, authoritative English. No fluff, no robotic transitions, no keyword stuffing.
2. Variable length appropriate to the topic complexity (typically 750-1,300 words). Never pad words artificially.
3. Markdown structure inside contentMarkdown: start directly with a compelling introduction paragraph (do NOT repeat the H1 inside contentMarkdown), then use ## (H2) and ### (H3) subheadings, concise paragraphs, bullet points or practical examples where helpful, and end with a clear ## Key Takeaways or Conclusion section.
4. NEVER fabricate statistics, fake quotes, author credentials, or unverified claims.
5. Generate 3 to 5 genuinely useful FAQs answering real follow-up questions readers ask.
6. Set schemaType to "NewsArticle" ONLY if this is genuinely breaking/current news; otherwise use "Article".`;

  const structuredResp = await ai.models.generateContent({
    model: EDITORIAL_MODEL,
    contents: draftPrompt,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          title: { type: Type.STRING },
          slug: { type: Type.STRING },
          summary: { type: Type.STRING },
          contentMarkdown: { type: Type.STRING },
          primaryKeyword: { type: Type.STRING },
          secondaryKeywords: { type: Type.ARRAY, items: { type: Type.STRING } },
          searchIntent: { type: Type.STRING },
          seoTitle: { type: Type.STRING },
          seoDescription: { type: Type.STRING },
          schemaType: { type: Type.STRING },
          featuredImagePrompt: { type: Type.STRING },
          featuredImageAlt: { type: Type.STRING },
          faqs: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                question: { type: Type.STRING },
                answer: { type: Type.STRING }
              },
              required: ["question", "answer"]
            }
          }
        },
        required: [
          "title",
          "slug",
          "summary",
          "contentMarkdown",
          "primaryKeyword",
          "secondaryKeywords",
          "searchIntent",
          "seoTitle",
          "seoDescription",
          "schemaType",
          "featuredImagePrompt",
          "featuredImageAlt",
          "faqs"
        ]
      }
    }
  });

  const rawJson = JSON.parse(structuredResp.text || "{}") as Partial<GeneratedArticleDraft>;
  const content = String(rawJson.contentMarkdown || "").trim();
  const wordCount = content.split(/\s+/).filter(Boolean).length;
  const readingTimeMinutes = Math.max(2, Math.min(30, Math.round(wordCount / 220)));

  return {
    title: String(rawJson.title || params.topic).slice(0, 190),
    slug: sanitizeSlug(rawJson.slug || rawJson.title || params.topic),
    summary: String(rawJson.summary || "").slice(0, 580),
    contentMarkdown: content.slice(0, 58000),
    primaryKeyword: String(rawJson.primaryKeyword || params.topic).slice(0, 110),
    secondaryKeywords: Array.isArray(rawJson.secondaryKeywords)
      ? rawJson.secondaryKeywords.map(String).slice(0, 12)
      : [],
    searchIntent: String(rawJson.searchIntent || "Informational").slice(0, 120),
    seoTitle: String(rawJson.seoTitle || rawJson.title || params.topic).slice(0, 155),
    seoDescription: String(rawJson.seoDescription || rawJson.summary || "").slice(0, 310),
    schemaType: rawJson.schemaType === "NewsArticle" ? "NewsArticle" : "Article",
    readingTimeMinutes,
    featuredImagePrompt: String(rawJson.featuredImagePrompt || params.topic).slice(0, 240),
    featuredImageAlt: String(rawJson.featuredImageAlt || rawJson.title || params.topic).slice(0, 240),
    recommendedStockImage:
      CATEGORY_DEFAULT_IMAGES[params.categorySlug] || "/assets/editorial/ai-computing.jpg",
    faqs: Array.isArray(rawJson.faqs)
      ? rawJson.faqs
          .filter((f) => f && f.question && f.answer)
          .slice(0, 8)
          .map((f) => ({
            question: String(f.question).slice(0, 240),
            answer: String(f.answer).slice(0, 1000)
          }))
      : [],
    externalSources: groundedSources.slice(0, 10)
  };
}

export async function regenerateArticleTitle(params: {
  currentTitle: string;
  summary: string;
  primaryKeyword?: string;
}): Promise<{ titles: string[] }> {
  const ai = createAiClient();
  const resp = await ai.models.generateContent({
    model: EDITORIAL_MODEL,
    contents: `Suggest 4 sharp, natural editorial headlines (no clickbait, under 75 characters each) for an article currently titled "${params.currentTitle}".
Summary: ${params.summary}
${params.primaryKeyword ? `Primary keyword: ${params.primaryKeyword}` : ""}`,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          titles: { type: Type.ARRAY, items: { type: Type.STRING } }
        },
        required: ["titles"]
      }
    }
  });
  const parsed = JSON.parse(resp.text || "{}") as { titles?: string[] };
  return {
    titles: Array.isArray(parsed.titles) ? parsed.titles.map(String).slice(0, 5) : []
  };
}

export async function generateMetaDescription(params: {
  title: string;
  contentMarkdown: string;
  primaryKeyword?: string;
}): Promise<{ seoTitle: string; seoDescription: string }> {
  const ai = createAiClient();
  const resp = await ai.models.generateContent({
    model: EDITORIAL_MODEL,
    contents: `Write an SEO title (50-60 chars) and meta description (135-158 chars) for this MOVLO article. Natural, accurate, zero clickbait.
Title: ${params.title}
${params.primaryKeyword ? `Keyword: ${params.primaryKeyword}` : ""}
Excerpt: ${params.contentMarkdown.slice(0, 1800)}`,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          seoTitle: { type: Type.STRING },
          seoDescription: { type: Type.STRING }
        },
        required: ["seoTitle", "seoDescription"]
      }
    }
  });
  const parsed = JSON.parse(resp.text || "{}") as { seoTitle?: string; seoDescription?: string };
  return {
    seoTitle: String(parsed.seoTitle || params.title).slice(0, 155),
    seoDescription: String(parsed.seoDescription || "").slice(0, 310)
  };
}

export async function suggestFaqs(params: {
  title: string;
  contentMarkdown: string;
}): Promise<{ faqs: Array<{ question: string; answer: string }> }> {
  const ai = createAiClient();
  const resp = await ai.models.generateContent({
    model: EDITORIAL_MODEL,
    contents: `Based on this article, propose 4 concise, helpful FAQ items that readers commonly search for. Never invent facts beyond the article's scope.
Title: ${params.title}
Content: ${params.contentMarkdown.slice(0, 3500)}`,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          faqs: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                question: { type: Type.STRING },
                answer: { type: Type.STRING }
              },
              required: ["question", "answer"]
            }
          }
        },
        required: ["faqs"]
      }
    }
  });
  const parsed = JSON.parse(resp.text || "{}") as {
    faqs?: Array<{ question: string; answer: string }>;
  };
  return {
    faqs: Array.isArray(parsed.faqs)
      ? parsed.faqs.slice(0, 6).map((f) => ({
          question: String(f.question).slice(0, 240),
          answer: String(f.answer).slice(0, 1000)
        }))
      : []
  };
}

export async function improveArticleDraft(params: {
  title: string;
  contentMarkdown: string;
  instruction?: string;
}): Promise<{ contentMarkdown: string; summary: string }> {
  const ai = createAiClient();
  const resp = await ai.models.generateContent({
    model: EDITORIAL_MODEL,
    contents: `You are a copy editor at MOVLO. Improve the clarity, heading hierarchy (## / ###), readability, and conciseness of this draft without fabricating any facts or numbers.
${params.instruction ? `Editor note: ${params.instruction}` : ""}
Title: ${params.title}
Draft:
${params.contentMarkdown.slice(0, 12000)}`,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          summary: { type: Type.STRING },
          contentMarkdown: { type: Type.STRING }
        },
        required: ["summary", "contentMarkdown"]
      }
    }
  });
  const parsed = JSON.parse(resp.text || "{}") as {
    summary?: string;
    contentMarkdown?: string;
  };
  return {
    summary: String(parsed.summary || "").slice(0, 580),
    contentMarkdown: String(parsed.contentMarkdown || params.contentMarkdown).slice(0, 58000)
  };
}
