// Monetag Ad Network Configuration & High-Revenue Placement Engine
// Uses the official Monetag Direct Links / SmartLinks provided by the user

// Primary featured ad link requested by user (Zone 11782278)
export const FEATURED_DIRECT_AD_LINK = "https://omg10.com/4/11782278";

export const MONETAG_LINKS: string[] = [
  "https://omg10.com/4/11782278", // User requested primary high-conversion link
  "https://omg10.com/4/9831191",
  "https://omg10.com/4/9831203",
  "https://omg10.com/4/9831194",
  "https://omg10.com/4/9800019",
  "https://omg10.com/4/9800010",
  "https://omg10.com/4/9800008",
  "https://omg10.com/4/6491984",
  "https://omg10.com/4/9831196",
  "https://omg10.com/4/9831190",
  "https://omg10.com/4/6491128"
];

// Circular rotator index for even distribution
let currentLinkIndex = 0;

export function getNextMonetagLink(): string {
  const link = MONETAG_LINKS[currentLinkIndex % MONETAG_LINKS.length];
  currentLinkIndex = (currentLinkIndex + 1) % MONETAG_LINKS.length;
  return link;
}

export function getRandomMonetagLink(): string {
  const idx = Math.floor(Math.random() * MONETAG_LINKS.length);
  return MONETAG_LINKS[idx];
}

// Open a Monetag link in a new tab safely
export function triggerMonetagLink(customUrl?: string): void {
  try {
    const url = customUrl || getRandomMonetagLink();
    const newWindow = window.open(url, "_blank", "noopener,noreferrer");
    if (newWindow) {
      newWindow.opener = null;
    }
  } catch (err) {
    console.warn("Monetag link open warning:", err);
  }
}

// Frequency-capped smart click for maximizing revenue on movie play interactions
// Only triggers once every 2 minutes or after 3 clicks so it feels natural and doesn't annoy the user
const LAST_TRIGGER_KEY = "movlo_monetag_last_pop";
const CLICK_COUNT_KEY = "movlo_monetag_click_count";

export function maybeTriggerMonetagOnAction(): void {
  try {
    if (typeof window === "undefined") return;

    const now = Date.now();
    const lastTimeStr = sessionStorage.getItem(LAST_TRIGGER_KEY);
    const lastTime = lastTimeStr ? parseInt(lastTimeStr, 10) : 0;
    
    let clickCount = parseInt(sessionStorage.getItem(CLICK_COUNT_KEY) || "0", 10);
    clickCount += 1;
    sessionStorage.setItem(CLICK_COUNT_KEY, String(clickCount));

    // Fire on the 1st action or every 4th action, with minimum 60 seconds interval
    if ((clickCount === 1 || clickCount % 4 === 0) && now - lastTime > 60000) {
      sessionStorage.setItem(LAST_TRIGGER_KEY, String(now));
      triggerMonetagLink();
    }
  } catch {
    // Silent fail
  }
}

// High CTR Native Ad Cards to intersperse in the movie catalog grid
export interface MonetagNativeAd {
  id: string;
  title: string;
  subtitle: string;
  poster: string;
  backdrop: string;
  rating: number;
  badge: string;
  genre: string;
  targetUrl: string;
  isAd: boolean;
  itemType: "ad_link";
  addedAgo: string;
  duration?: string;
  year?: number;
}

export const MONETAG_NATIVE_ADS: MonetagNativeAd[] = [
  {
    id: "monetag-ad-1",
    title: "Ultra 4K Cinema Pass",
    subtitle: "Stream All Movies with Zero Buffering & High Speed",
    poster: "https://images.unsplash.com/photo-1536440136628-849c177e76a1?w=800&auto=format&fit=crop&q=80",
    backdrop: "https://images.unsplash.com/photo-1536440136628-849c177e76a1?w=1200&auto=format&fit=crop&q=80",
    rating: 9.9,
    badge: "SPONSORED",
    genre: "VIP Stream",
    targetUrl: MONETAG_LINKS[0],
    isAd: true,
    itemType: "ad_link",
    addedAgo: "Special Offer"
  },
  {
    id: "monetag-ad-2",
    title: "High-Speed Movie Downloads",
    subtitle: "Get Full 1080p / 4K Motion Pictures at 10x Speed",
    poster: "https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?w=800&auto=format&fit=crop&q=80",
    backdrop: "https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?w=1200&auto=format&fit=crop&q=80",
    rating: 9.8,
    badge: "SPONSORED",
    genre: "Fast Server",
    targetUrl: MONETAG_LINKS[1],
    isAd: true,
    itemType: "ad_link",
    addedAgo: "Featured"
  },
  {
    id: "monetag-ad-3",
    title: "Premium Drama Club",
    subtitle: "Watch Exclusive Drama Episodes & Uncensored Cuts",
    poster: "https://images.unsplash.com/photo-1518676590629-3dcbd9c5a5c9?w=800&auto=format&fit=crop&q=80",
    backdrop: "https://images.unsplash.com/photo-1518676590629-3dcbd9c5a5c9?w=1200&auto=format&fit=crop&q=80",
    rating: 9.7,
    badge: "SPONSORED",
    genre: "Drama Vault",
    targetUrl: MONETAG_LINKS[2],
    isAd: true,
    itemType: "ad_link",
    addedAgo: "Exclusive"
  },
  {
    id: "monetag-ad-4",
    title: "Unlimited Cloud Theater",
    subtitle: "Access 10,000+ Full Length Feature Films Free",
    poster: "https://images.unsplash.com/photo-1517604931442-7e0c8ed2963c?w=800&auto=format&fit=crop&q=80",
    backdrop: "https://images.unsplash.com/photo-1517604931442-7e0c8ed2963c?w=1200&auto=format&fit=crop&q=80",
    rating: 9.9,
    badge: "SPONSORED",
    genre: "Cloud Cinema",
    targetUrl: MONETAG_LINKS[3],
    isAd: true,
    itemType: "ad_link",
    addedAgo: "Popular"
  }
];
