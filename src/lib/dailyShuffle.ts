/**
 * 24-Hour Deterministic & Automatic Movie Shuffle Engine
 * 
 * Automatically shuffles movies every 24 hours using a seeded PRNG.
 * Movies rotate every 24-hour cycle automatically, keeping the catalog
 * fresh, dynamic, and engaging for returning movie enthusiasts.
 */

const DAY_MS = 24 * 60 * 60 * 1000;
const STORAGE_CYCLE_KEY = "movlo_shuffle_cycle";
const STORAGE_SALT_KEY = "movlo_shuffle_salt";
const SHUFFLE_EVENT_NAME = "movlo_movies_shuffled";

/**
 * Returns the current 24-hour epoch cycle number
 */
export function getCurrent24HourCycle(): number {
  return Math.floor(Date.now() / DAY_MS);
}

/**
 * Returns the milliseconds remaining until the next 24-hour shuffle
 */
export function getMsUntilNextShuffle(): number {
  const now = Date.now();
  const nextShuffleTime = (Math.floor(now / DAY_MS) + 1) * DAY_MS;
  return Math.max(0, nextShuffleTime - now);
}

/**
 * Returns a human-friendly countdown string (e.g. "14h 23m")
 */
export function getFormattedTimeUntilNextShuffle(): string {
  const ms = getMsUntilNextShuffle();
  const totalSeconds = Math.floor(ms / 1000);
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  return `${hours}h ${minutes}m`;
}

/**
 * Mulberry32 seeded pseudo-random number generator
 */
function createSeededRng(seed: number): () => number {
  let s = seed | 0;
  return function () {
    s = (s + 0x6d2b79f5) | 0;
    let t = Math.imul(s ^ (s >>> 15), 1 | s);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/**
 * Hash a string seed into a 32-bit integer
 */
function hashStringToSeed(str: string): number {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = (hash << 5) - hash + str.charCodeAt(i);
    hash |= 0;
  }
  return Math.abs(hash);
}

/**
 * Retrieves the current user salt (or initializes to 0)
 */
function getUserShuffleSalt(): number {
  if (typeof window === "undefined") return 0;
  try {
    const salt = localStorage.getItem(STORAGE_SALT_KEY);
    return salt ? parseInt(salt, 10) || 0 : 0;
  } catch {
    return 0;
  }
}

/**
 * Shuffles an array deterministically for the current 24-hour window
 * @param array The array to shuffle
 * @param categoryKey Unique context key (e.g., 'indian', 'english')
 */
export function shuffleArrayFor24Hours<T>(array: T[], categoryKey: string = "default"): T[] {
  if (!array || array.length <= 1) return [...(array || [])];

  const currentCycle = getCurrent24HourCycle();
  const salt = getUserShuffleSalt();
  const seedString = `movlo-24h-${currentCycle}-${categoryKey}-${salt}`;
  const seed = hashStringToSeed(seedString);
  const rng = createSeededRng(seed);

  const copy = [...array];
  // Fisher-Yates shuffle with seeded RNG
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    const temp = copy[i];
    copy[i] = copy[j];
    copy[j] = temp;
  }

  return copy;
}

/**
 * Check if the 24-hour cycle has changed since last check.
 * If changed, automatically updates stored cycle.
 */
export function checkAndTriggerDailyShuffle(): boolean {
  if (typeof window === "undefined") return false;
  try {
    const currentCycle = getCurrent24HourCycle();
    const storedCycle = localStorage.getItem(STORAGE_CYCLE_KEY);
    const storedNum = storedCycle ? parseInt(storedCycle, 10) : null;

    if (storedNum === null || storedNum !== currentCycle) {
      localStorage.setItem(STORAGE_CYCLE_KEY, String(currentCycle));
      // Dispatch event to re-render all subscribers
      window.dispatchEvent(new CustomEvent(SHUFFLE_EVENT_NAME, { detail: { cycle: currentCycle, automatic: true } }));
      return true;
    }
  } catch (e) {
    console.warn("Daily shuffle storage check:", e);
  }
  return false;
}

/**
 * Triggers an immediate fresh shuffle (manual or forced)
 */
export function forceInstantShuffle(): void {
  if (typeof window === "undefined") return;
  try {
    const nextSalt = Date.now();
    localStorage.setItem(STORAGE_SALT_KEY, String(nextSalt));
    const currentCycle = getCurrent24HourCycle();
    localStorage.setItem(STORAGE_CYCLE_KEY, String(currentCycle));
    window.dispatchEvent(new CustomEvent(SHUFFLE_EVENT_NAME, { detail: { cycle: currentCycle, automatic: false, salt: nextSalt } }));
  } catch (e) {
    console.warn("Manual shuffle error:", e);
  }
}

export { SHUFFLE_EVENT_NAME };
