import { AdSettings, Article, Category, SiteSettings } from "../types";

export const DEFAULT_CATEGORIES: Omit<Category, "createdAt" | "updatedAt">[] = [
  {
    id: "trending-news",
    slug: "trending-news",
    name: "Trending News",
    description: "Fast-moving stories, verified updates, and topics gaining immediate attention.",
    order: 1,
    showInNav: true
  },
  {
    id: "technology",
    slug: "technology",
    name: "Technology",
    description: "Consumer hardware, cloud infrastructure, silicon, and software shifts.",
    order: 2,
    showInNav: true
  },
  {
    id: "artificial-intelligence",
    slug: "artificial-intelligence",
    name: "Artificial Intelligence",
    description: "AI models, developer tools, research milestones, and practical workflows.",
    order: 3,
    showInNav: true
  },
  {
    id: "entertainment",
    slug: "entertainment",
    name: "Entertainment",
    description: "Streaming releases, cultural moments, music, and creator economies.",
    order: 4,
    showInNav: true
  },
  {
    id: "movies-tv",
    slug: "movies-tv",
    name: "Movies & TV",
    description: "Film schedules, series renewals, box office shifts, and critical context.",
    order: 5,
    showInNav: false
  },
  {
    id: "gaming",
    slug: "gaming",
    name: "Gaming",
    description: "PC and console releases, studio updates, hardware benchmarks, and esports.",
    order: 6,
    showInNav: true
  },
  {
    id: "mobile-apps",
    slug: "mobile-apps",
    name: "Mobile Apps",
    description: "iOS and Android updates, productivity tools, and messaging features.",
    order: 7,
    showInNav: false
  },
  {
    id: "social-media",
    slug: "social-media",
    name: "Social Media",
    description: "Platform policy shifts, algorithm changes, and creator trends.",
    order: 8,
    showInNav: true
  },
  {
    id: "internet-websites",
    slug: "internet-websites",
    name: "Internet & Websites",
    description: "Search engines, browsers, web standards, and online privacy.",
    order: 9,
    showInNav: false
  },
  {
    id: "how-to-guides",
    slug: "how-to-guides",
    name: "How-To Guides",
    description: "Clear, step-by-step technical guides and practical troubleshooting.",
    order: 10,
    showInNav: true
  },
  {
    id: "digital-lifestyle",
    slug: "digital-lifestyle",
    name: "Digital Lifestyle",
    description: "Remote work setups, digital habits, and modern tools for focus.",
    order: 11,
    showInNav: false
  }
];

export const DEFAULT_SITE_SETTINGS: Omit<SiteSettings, "updatedAt"> = {
  siteName: "MOVLO",
  tagline: "What's Trending. What's Worth Knowing.",
  domain: "https://movlo.site",
  logoText: "MOVLO",
  defaultLanguage: "en",
  defaultSeoTitle: "MOVLO — What's Trending. What's Worth Knowing.",
  defaultSeoDescription:
    "Original editorial coverage, explainers, and analysis across trending technology, artificial intelligence, entertainment, gaming, and digital culture.",
  footerInfo:
    "MOVLO is an independent digital editorial publication focused on clear, accurate coverage of fast-moving technology, culture, and search trends.",
  socialLinks: {
    x: "https://x.com",
    youtube: "https://youtube.com",
    linkedin: "https://linkedin.com",
    instagram: "https://instagram.com"
  }
};

export const DEFAULT_AD_SETTINGS: Omit<AdSettings, "updatedAt"> = {
  publisherId: "ca-pub-6696395667318454",
  slots: {
    header_banner: {
      enabled: true,
      slotId: "",
      label: "Header Leaderboard Banner"
    },
    homepage_banner: {
      enabled: true,
      slotId: "",
      label: "Homepage Editorial Strip"
    },
    below_intro: {
      enabled: true,
      slotId: "",
      label: "Below Article Introduction"
    },
    mid_article: {
      enabled: true,
      slotId: "",
      label: "Mid-Article In-Content Slot"
    },
    sidebar: {
      enabled: true,
      slotId: "",
      label: "Article Sticky Sidebar Slot"
    },
    after_article: {
      enabled: true,
      slotId: "",
      label: "After Article Content Slot"
    }
  }
};

export const STARTER_ARTICLES: Omit<Article, "createdAt" | "updatedAt">[] = [
  {
    id: "starter-on-device-ai-browsers-2026",
    title: "Why On-Device AI Is Reshaping Mobile Browsers and Search Habits",
    slug: "why-on-device-ai-is-reshaping-mobile-browsers-and-search-habits",
    summary:
      "As compact language models move directly onto smartphone NPUs, browser makers are rethinking page summaries, offline translation, and privacy-preserving search.",
    contentMarkdown: `For nearly two decades, mobile web browsers acted as thin windows onto remote cloud servers. Every query, translation request, or page summary required sending text across a network and waiting for a data center response. That architecture is shifting rapidly as modern smartphone chips dedicate larger silicon budgets to neural processing units.

## What On-Device Inference Changes for Everyday Readers

Running quantized language and vision models locally changes latency and privacy defaults at the same time. When a browser can summarize a long technical specification or translate a menu without transmitting page contents to an external inference cluster, users experience near-instant feedback even on congested cellular connections.

### Key advantages driving browser adoption

- **Lower response latency:** Token generation starts in milliseconds without a round-trip API call.
- **Reduced cloud operating costs:** Browser vendors avoid paying per-token inference bills for routine tasks like tab grouping or quick definitions.
- **Stronger local privacy:** Sensitive form fields, emails, and draft notes can remain strictly inside device memory.

## Where Cloud Models Still Lead

Local models running within 3 to 7 billion parameters excel at extraction, rewriting, and concise summarization, yet they still lag frontier cloud models on multi-step synthesis, live web verification, and deep coding workflows. In practice, leading browsers are adopting hybrid routing: lightweight tasks execute locally on the NPU, while complex research queries escalate to grounded cloud search.

## What Publishers Should Watch

For independent web publishers, the shift toward answer-first browser overlays underscores the value of clear structure, transparent sourcing, and genuine depth. Pages built around thin, repetitive rewrites lose visibility quickly, whereas original reporting, verified data, and practical explainers continue to earn direct click-throughs and reader trust.`,
    categorySlug: "artificial-intelligence",
    categoryName: "Artificial Intelligence",
    primaryKeyword: "on-device AI mobile browsers",
    secondaryKeywords: ["local LLM smartphone", "hybrid AI search", "browser AI privacy"],
    faqs: [
      {
        question: "Does on-device AI replace cloud AI assistants completely?",
        answer:
          "No. Compact local models handle fast summarization and offline tasks well, while complex reasoning and live web search still rely on larger cloud models."
      },
      {
        question: "Why do phone makers emphasize NPU performance?",
        answer:
          "Neural processing units accelerate matrix math efficiently while using far less battery than running AI workloads solely on a CPU or GPU."
      }
    ],
    internalLinks: [
      {
        title: "How to Audit App Permissions on Android and iOS in Under Five Minutes",
        slug: "how-to-audit-app-permissions-android-ios"
      }
    ],
    externalSources: [
      { title: "WebGPU and On-Device Machine Learning Standards (W3C)", url: "https://www.w3.org/groups/wg/gpu/" }
    ],
    featuredImageUrl: "/assets/editorial/ai-computing.jpg",
    featuredImageAlt: "Minimalist glass workstation representing modern AI computing hardware",
    authorName: "MOVLO Editorial Desk",
    authorUid: "movlo-editorial-seed",
    seoTitle: "Why On-Device AI Is Reshaping Mobile Browsers | MOVLO",
    seoDescription:
      "How smartphone NPUs and local AI models are transforming browser summaries, search privacy, and hybrid cloud workflows.",
    canonicalUrl: "https://movlo.site/article/why-on-device-ai-is-reshaping-mobile-browsers-and-search-habits",
    schemaType: "Article",
    status: "published",
    readingTimeMinutes: 4,
    isBreaking: true,
    isFeatured: true,
    isPopular: true,
    publishedAt: "2026-11-24T09:00:00.000Z"
  },
  {
    id: "starter-arm-laptops-battery-efficiency",
    title: "Inside the Laptop Efficiency Shift: What Buyers Should Check Before Upgrading",
    slug: "inside-the-laptop-efficiency-shift-what-buyers-should-check",
    summary:
      "Multi-day battery claims are now standard across thin-and-light laptops, but real-world compatibility, thermal headroom, and display efficiency still separate standout machines.",
    contentMarkdown: `Ultra-thin notebooks used to force an uncomfortable trade-off between silent portability and sustained performance. Over the past two hardware cycles, unified memory designs and high-efficiency CPU cores have narrowed that gap considerably across both macOS and Windows ecosystems.

## Looking Beyond Marketing Battery Numbers

Vendor battery tests typically measure local video playback at modest screen brightness. Real daily workloads—browser tabs, video calls, cloud sync, and background security tools—draw noticeably more power.

### Four specifications that matter most in daily use

- **Unified memory capacity:** 16 GB has become the practical baseline for smooth multitasking and local AI features; 24 GB or 32 GB gives multi-year headroom.
- **Sustained thermal design:** Fanless chassis stay silent during writing and research, while dual-fan systems hold higher clock speeds during exports.
- **Display panel type:** Adaptive refresh OLED and IPS panels balance crisp text legibility with lower idle power draw.
- **Port selection and USB4 support:** Native external display bandwidth and fast PD charging reduce dongle clutter on travel days.

## Software Compatibility Checkpoints

Before switching processor architectures, verify that specialized audio plugins, VPN clients, virtual machine images, or legacy enterprise utilities offer native builds rather than relying solely on translation layers.`,
    categorySlug: "technology",
    categoryName: "Technology",
    primaryKeyword: "laptop efficiency upgrade guide",
    secondaryKeywords: ["unified memory laptops", "battery life laptop specs", "ARM vs x86 notebooks"],
    faqs: [
      {
        question: "Is 16 GB of RAM enough for a new laptop?",
        answer:
          "For web browsing, office productivity, and light media work, 16 GB is comfortable. Creators running large editors or local models benefit from 24 GB or more."
      }
    ],
    featuredImageUrl: "/assets/editorial/tech-devices.jpg",
    featuredImageAlt: "Sleek anodized aluminum laptop and wireless peripherals on a clean white desk",
    authorName: "MOVLO Technology Desk",
    authorUid: "movlo-editorial-seed",
    seoTitle: "Laptop Efficiency Shift: Key Specs Before Upgrading | MOVLO",
    seoDescription:
      "A practical buyer checklist covering memory capacity, sustained thermals, display efficiency, and software compatibility.",
    canonicalUrl: "https://movlo.site/article/inside-the-laptop-efficiency-shift-what-buyers-should-check",
    schemaType: "Article",
    status: "published",
    readingTimeMinutes: 4,
    isBreaking: false,
    isFeatured: true,
    isPopular: true,
    publishedAt: "2026-11-23T14:30:00.000Z"
  },
  {
    id: "starter-streaming-bundling-era-2026",
    title: "The Return of Streaming Bundles: Why Platforms Are Pairing Up Again",
    slug: "return-of-streaming-bundles-why-platforms-are-pairing-up",
    summary:
      "Rising standalone subscription prices and subscriber churn have pushed major entertainment services back toward multi-service bundles and ad-supported tiers.",
    contentMarkdown: `When cord-cutting accelerated a decade ago, viewers welcomed the simplicity of paying for one or two affordable standalone streaming apps. As content libraries fragmented across a dozen competing platforms, monthly household bills crept back toward legacy cable totals—triggering rapid subscription cycling.

## Why Bundling Reduces Churn

Platforms discovered that retaining an existing subscriber costs far less than re-acquiring one who cancels after finishing a single flagship series. Cross-company bundles lock in lower combined pricing while sharing distribution across telecom carriers, retail memberships, and hardware ecosystems.

### What viewers should evaluate before locking into a bundle

1. **Ad-supported vs. ad-free tiers:** Many promotional bundles default to ad-supported plans that omit offline downloads or 4K HDR streams.
2. **Annual vs. monthly flexibility:** Pay-monthly bundles cost slightly more per month but preserve the freedom to pause when release calendars slow down.
3. **Included catalog overlap:** Check whether a bundled tier excludes live sports add-ons or newly released theatrical rentals.

## The Shift Toward Weekly Release Schedules

Alongside bundling, major studios have largely moved back to weekly episode drops for prestige series, keeping conversation alive across social feeds for two months instead of a single weekend.`,
    categorySlug: "entertainment",
    categoryName: "Entertainment",
    primaryKeyword: "streaming service bundles",
    secondaryKeywords: ["ad-supported streaming tiers", "subscriber churn entertainment", "weekly episode releases"],
    faqs: [
      {
        question: "Do streaming bundles save money compared to standalone plans?",
        answer:
          "Yes, if you actively watch at least two services inside the bundle. If you only watch one catalog occasionally, rotating monthly standalone plans is usually cheaper."
      }
    ],
    featuredImageUrl: "/assets/editorial/cinema-culture.jpg",
    featuredImageAlt: "Minimalist architectural screening room and cinema projector light",
    authorName: "MOVLO Culture Desk",
    authorUid: "movlo-editorial-seed",
    seoTitle: "The Return of Streaming Bundles Explained | MOVLO",
    seoDescription:
      "Why entertainment platforms are embracing cross-company bundles and weekly release calendars to curb subscriber churn.",
    canonicalUrl: "https://movlo.site/article/return-of-streaming-bundles-why-platforms-are-pairing-up",
    schemaType: "NewsArticle",
    status: "published",
    readingTimeMinutes: 3,
    isBreaking: true,
    isFeatured: false,
    isPopular: true,
    publishedAt: "2026-11-22T11:15:00.000Z"
  },
  {
    id: "starter-handheld-pc-gaming-evolution",
    title: "Handheld PC Gaming Maturation: Frame Pacing, Battery Tuning, and SteamOS",
    slug: "handheld-pc-gaming-maturation-frame-pacing-battery-tuning",
    summary:
      "Portable x86 gaming devices have moved beyond novelty status thanks to smarter TDP profiles, shader pre-caching, and tighter operating system optimization.",
    contentMarkdown: `Early handheld gaming PCs proved that desktop libraries could boot on the road, yet rough desktop-first interfaces and two-hour battery ceilings limited mainstream appeal. Recent software updates and revised silicon efficiency curves have transformed the category into a refined second screen for PC players.

## Frame Pacing Over Peak Frame Rates

Seasoned portable players quickly learn that locking a game to a steady 40 frames per second on a 120 Hz or 90 Hz screen often feels smoother—and preserves far more battery—than letting an unlocked frame rate fluctuate wildly between 35 and 60 fps.

### Essential tuning habits for portable sessions

- **Cap TDP per game profile:** Indie titles and 2D metroidvanias often run flawlessly at 7 to 10 watts, doubling travel playtime.
- **Enable shader pre-caching:** Eliminates mid-combat micro-stutters caused by real-time shader compilation.
- **Use FSR or XeSS balanced presets:** Rendering internally at 540p or 720p upscaled keeps sharp HUD elements without taxing the GPU.

## Operating System Streamlining

Controller-native boot environments with instant suspend-and-resume support remain the single biggest differentiator between frustrating mini-PCs and effortless portable consoles.`,
    categorySlug: "gaming",
    categoryName: "Gaming",
    primaryKeyword: "handheld PC gaming tuning",
    secondaryKeywords: ["portable gaming battery optimization", "40fps frame pacing", "handheld TDP guide"],
    faqs: [
      {
        question: "Why is a 40 fps cap popular on handheld gaming devices?",
        answer:
          "40 fps sits halfway in frame time between 30 fps and 60 fps, delivering noticeably smoother motion while keeping power draw low enough for longer battery life."
      }
    ],
    featuredImageUrl: "/assets/editorial/gaming-studio.jpg",
    featuredImageAlt: "Minimalist industrial game controller and studio workstation desk",
    authorName: "MOVLO Gaming Desk",
    authorUid: "movlo-editorial-seed",
    seoTitle: "Handheld PC Gaming: Frame Pacing & Battery Tuning | MOVLO",
    seoDescription:
      "How frame-rate caps, per-game TDP profiles, and shader caching turn portable PCs into dependable travel consoles.",
    canonicalUrl: "https://movlo.site/article/handheld-pc-gaming-maturation-frame-pacing-battery-tuning",
    schemaType: "Article",
    status: "published",
    readingTimeMinutes: 4,
    isBreaking: false,
    isFeatured: false,
    isPopular: true,
    publishedAt: "2026-11-21T16:00:00.000Z"
  },
  {
    id: "starter-short-form-search-social-discovery",
    title: "How Social Platforms Became Everyday Search Engines for Younger Audiences",
    slug: "how-social-platforms-became-everyday-search-engines",
    summary:
      "From local dining checks to visual product teardowns, short-form video feeds and community threads increasingly capture intent that once started on classic search bars.",
    contentMarkdown: `Search behavior is no longer concentrated inside a single blue-link results page. Across travel planning, software troubleshooting, and product research, millions of people open video feeds or community forums first when they want visual proof or candid peer experiences.

## Visual Verification vs. Long-Form Context

Short video clips excel at demonstrating physical scale, step-by-step UI menus, or real-world lighting conditions in twenty seconds. However, quick clips struggle with nuance, updated policy links, and verifiable citations—creating a complementary split between social discovery and dedicated editorial explainers.

### How creators and publications adapt

- **Clear spoken and on-screen structure:** Viewers searching inside social apps expect the core answer within the first five seconds.
- **Searchable captions and descriptive titles:** Natural phrasing outperforms vague hooks when feeds index content for topic search.
- **Canonical reference pages:** Linking short explainers back to maintained written guides gives readers up-to-date details after a video ages.`,
    categorySlug: "social-media",
    categoryName: "Social Media",
    primaryKeyword: "social media search behavior",
    secondaryKeywords: ["short-form video discovery", "social SEO trends", "creator search optimization"],
    faqs: [
      {
        question: "Are traditional web search engines losing all informational queries?",
        answer:
          "No. Traditional search remains dominant for deep research, official documentation, troubleshooting errors, and multi-source verification."
      }
    ],
    featuredImageUrl: "/assets/editorial/social-media.jpg",
    featuredImageAlt: "Editorial studio desk with smartphone and clean typography workspace",
    authorName: "MOVLO Digital Culture Desk",
    authorUid: "movlo-editorial-seed",
    seoTitle: "How Social Platforms Became Everyday Search Engines | MOVLO",
    seoDescription:
      "Understanding the shift toward visual search on social feeds and why structured editorial guides still anchor verification.",
    canonicalUrl: "https://movlo.site/article/how-social-platforms-became-everyday-search-engines",
    schemaType: "Article",
    status: "published",
    readingTimeMinutes: 3,
    isBreaking: false,
    isFeatured: false,
    isPopular: false,
    publishedAt: "2026-11-20T08:45:00.000Z"
  },
  {
    id: "starter-how-to-audit-app-permissions",
    title: "How to Audit App Permissions on Android and iOS in Under Five Minutes",
    slug: "how-to-audit-app-permissions-android-ios",
    summary:
      "A concise, repeatable checklist for reviewing location, microphone, photo library, and background tracking permissions across modern smartphones.",
    contentMarkdown: `Over months of installing utility apps, shopping tools, and event tickets, smartphones quietly accumulate broad permissions. Taking five minutes once a quarter to trim unused access protects battery life and reduces background data sharing without breaking daily apps.

## Step 1: Review Always-On Location Access

Open your device Privacy settings and filter apps permitted to read location **Always**. Unless an app provides live weather widgets, family safety sharing, or turn-by-turn background tracking, switch it to **While Using the App** or **Approximate Location**.

## Step 2: Check Limited Photo Library Permissions

Modern iOS and Android releases let you grant an app access only to specific selected photos rather than your entire camera roll. Whenever a messenger or document scanner asks for media access, pick selected items instead of full library permissions.

## Step 3: Trim Background Refresh and Unused Accounts

Disable background app refresh for shopping, travel, and seasonal apps you open rarely. At the same time, uninstall dormant apps—modern operating systems automatically revoke permissions for unused software, but removing stale apps keeps storage and notifications clean.`,
    categorySlug: "how-to-guides",
    categoryName: "How-To Guides",
    primaryKeyword: "audit smartphone app permissions",
    secondaryKeywords: ["Android privacy checklist", "iOS app permissions guide", "limit photo library access"],
    faqs: [
      {
        question: "Will switching location access to 'While Using' break navigation apps?",
        answer:
          "No. Navigation apps remain active while your route is running; switching off 'Always' simply prevents background location checks when you are not navigating."
      }
    ],
    featuredImageUrl: "/assets/editorial/tech-devices.jpg",
    featuredImageAlt: "Clean desk workspace illustrating mobile device security and configuration",
    authorName: "MOVLO Guides Desk",
    authorUid: "movlo-editorial-seed",
    seoTitle: "How to Audit App Permissions on Android and iOS | MOVLO",
    seoDescription:
      "A quick 5-minute privacy checklist to tighten location, photo library, and background permissions on Android and iOS.",
    canonicalUrl: "https://movlo.site/article/how-to-audit-app-permissions-android-ios",
    schemaType: "Article",
    status: "published",
    readingTimeMinutes: 3,
    isBreaking: false,
    isFeatured: false,
    isPopular: false,
    publishedAt: "2026-11-19T10:00:00.000Z"
  }
];
