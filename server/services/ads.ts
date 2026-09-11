import fs from "fs/promises";
import path from "path";

export interface AdBanner {
  id: string;
  title: string;
  posterUrl: string; // Base64 data URL or external image URL
  targetUrl: string; // Destination URL where the user is redirected
  tag: string; // e.g. "SPONSORED", "EXCLUSIVE", "PARTNER"
  active: boolean;
  clicks: number;
  createdAt: string;
}

const DATA_DIR = path.join(process.cwd(), "server", "data");
const ADS_FILE = path.join(DATA_DIR, "ads.json");

const DEFAULT_ADS: AdBanner[] = [];

async function ensureDataDir(): Promise<void> {
  try {
    await fs.mkdir(DATA_DIR, { recursive: true });
  } catch {
    // Already exists
  }
}

export async function getAllAds(): Promise<AdBanner[]> {
  try {
    await ensureDataDir();
    const data = await fs.readFile(ADS_FILE, "utf-8");
    return JSON.parse(data);
  } catch {
    // If file doesn't exist, create it with default
    await saveAds(DEFAULT_ADS);
    return DEFAULT_ADS;
  }
}

export async function getActiveAds(): Promise<AdBanner[]> {
  const all = await getAllAds();
  return all.filter((ad) => ad.active);
}

export async function saveAds(ads: AdBanner[]): Promise<void> {
  await ensureDataDir();
  await fs.writeFile(ADS_FILE, JSON.stringify(ads, null, 2), "utf-8");
}

export async function createAd(params: {
  title: string;
  posterUrl: string;
  targetUrl: string;
  tag?: string;
}): Promise<AdBanner> {
  const ads = await getAllAds();
  const newAd: AdBanner = {
    id: `ad-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
    title: params.title.trim() || "Featured Movie Sponsor",
    posterUrl: params.posterUrl.trim(),
    targetUrl: params.targetUrl.trim(),
    tag: params.tag?.trim().toUpperCase() || "SPONSORED",
    active: true,
    clicks: 0,
    createdAt: new Date().toISOString()
  };

  ads.unshift(newAd);
  await saveAds(ads);
  return newAd;
}

export async function toggleAd(id: string): Promise<AdBanner | null> {
  const ads = await getAllAds();
  const index = ads.findIndex((a) => a.id === id);
  if (index === -1) return null;

  ads[index].active = !ads[index].active;
  await saveAds(ads);
  return ads[index];
}

export async function deleteAd(id: string): Promise<boolean> {
  const ads = await getAllAds();
  const filtered = ads.filter((a) => a.id !== id);
  if (filtered.length === ads.length) return false;

  await saveAds(filtered);
  return true;
}

export async function recordAdClick(id: string): Promise<number | null> {
  const ads = await getAllAds();
  const index = ads.findIndex((a) => a.id === id);
  if (index === -1) return null;

  ads[index].clicks = (ads[index].clicks || 0) + 1;
  await saveAds(ads);
  return ads[index].clicks;
}
