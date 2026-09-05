import { serverCache } from "./cache.js";

const WATCHMODE_BASE_URL = "https://api.watchmode.com/v1";
export const DEFAULT_REGION = "US";

export interface WatchmodeRawTitle {
  id: number;
  title: string;
  year?: number;
  imdb_id?: string;
  tmdb_id?: number;
  tmdb_type?: string;
  type: string;
  user_rating?: number;
  critic_score?: number;
  poster?: string;
  backdrop?: string;
}

export interface WatchmodeRawDetails {
  id: number;
  title: string;
  original_title?: string;
  plot_overview?: string;
  type: string;
  runtime_minutes?: number;
  year?: number;
  release_date?: string;
  genre_names?: string[];
  genres?: number[];
  user_rating?: number;
  critic_score?: number;
  us_rating?: string;
  poster?: string;
  backdrop?: string;
  original_language?: string;
  similar_titles?: number[];
  trailer?: string;
  trailer_thumbnail?: string;
  imdb_id?: string;
  tmdb_id?: number;
}

export interface WatchmodeRawSource {
  source_id: number;
  name: string;
  type: string;
  region: string;
  web_url?: string;
  format?: string;
  price?: number | string | null;
  seasons?: number;
  episodes?: number;
}

export interface WatchmodeRawSearchResult {
  id: number;
  name: string;
  type: string;
  year?: number;
  result_type?: string;
  imdb_id?: string;
  tmdb_id?: number;
  image_url?: string;
}

export interface WatchmodeRawGenre {
  id: number;
  name: string;
  tmdb_id?: number;
}

// Normalized MOVLO interfaces
export interface Movie {
  id: number;
  title: string;
  year?: number;
  poster?: string;
  backdrop?: string;
  description?: string;
  rating?: number;
  criticScore?: number;
  userRating?: number;
  runtime?: number;
  genres?: string[];
  genreIds?: number[];
  imdbId?: string;
  tmdbId?: number;
  type?: string;
  releaseDate?: string;
  usRating?: string;
  trailer?: string;
  trailerThumbnail?: string;
  similarTitles?: number[];
}

export interface StreamingSource {
  sourceId: number;
  name: string;
  type: 'sub' | 'rent' | 'buy' | 'free' | 'tve' | string;
  region: string;
  webUrl: string;
  format?: string;
  price?: number | null;
  displayPrice?: string;
}

export interface Genre {
  id: number;
  name: string;
}

export interface SearchResultItem {
  id: number;
  title: string;
  year?: number;
  type: string;
  poster?: string;
  imdbId?: string;
  tmdbId?: number;
}

// Curated fallback movie database in case WATCHMODE_API_KEY is not set or quota exceeded
const FALLBACK_MOVIES: Movie[] = [
  {
    id: 3173903,
    title: "Dune: Part Two",
    year: 2024,
    poster: "https://images.unsplash.com/photo-1534447677768-be436bb09401?w=800&auto=format&fit=crop&q=80",
    backdrop: "https://images.unsplash.com/photo-1509198397868-475647b2a1e5?w=1600&auto=format&fit=crop&q=80",
    description: "Paul Atreides unites with Chani and the Fremen while seeking revenge against the conspirators who destroyed his family. Facing a choice between the love of his life and the fate of the universe.",
    rating: 8.6,
    criticScore: 92,
    userRating: 8.8,
    runtime: 166,
    genres: ["Sci-Fi", "Adventure", "Drama"],
    genreIds: [15, 1, 6],
    usRating: "PG-13",
    releaseDate: "2024-03-01",
    trailer: "https://www.youtube.com/watch?v=Way9Dexny3w",
    similarTitles: [3158912, 3169821, 3144501]
  },
  {
    id: 3158912,
    title: "Oppenheimer",
    year: 2023,
    poster: "https://images.unsplash.com/photo-1440404653325-ab127d49abc1?w=800&auto=format&fit=crop&q=80",
    backdrop: "https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=1600&auto=format&fit=crop&q=80",
    description: "The story of American scientist J. Robert Oppenheimer and his role in the development of the atomic bomb during the Manhattan Project.",
    rating: 8.9,
    criticScore: 93,
    userRating: 8.9,
    runtime: 180,
    genres: ["Biography", "Drama", "History"],
    genreIds: [6, 10],
    usRating: "R",
    releaseDate: "2023-07-21",
    trailer: "https://www.youtube.com/watch?v=uYPbbksJxIg",
    similarTitles: [3173903, 3144501]
  },
  {
    id: 3169821,
    title: "Interstellar",
    year: 2014,
    poster: "https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=800&auto=format&fit=crop&q=80",
    backdrop: "https://images.unsplash.com/photo-1446776811953-b23d57bd21aa?w=1600&auto=format&fit=crop&q=80",
    description: "When Earth becomes uninhabitable in the future, a farmer and ex-NASA pilot, Joseph Cooper, is tasked to pilot a spacecraft along with a team of researchers to find a new planet for humans.",
    rating: 8.7,
    criticScore: 74,
    userRating: 8.7,
    runtime: 169,
    genres: ["Adventure", "Drama", "Sci-Fi"],
    genreIds: [1, 6, 15],
    usRating: "PG-13",
    releaseDate: "2014-11-07",
    trailer: "https://www.youtube.com/watch?v=zSWdZVtXT7E",
    similarTitles: [3173903, 3158912]
  },
  {
    id: 3144501,
    title: "Blade Runner 2049",
    year: 2017,
    poster: "https://images.unsplash.com/photo-1578632767115-351597cf2477?w=800&auto=format&fit=crop&q=80",
    backdrop: "https://images.unsplash.com/photo-1508739773434-c26b3d09e071?w=1600&auto=format&fit=crop&q=80",
    description: "Young Blade Runner K's discovery of a long-buried secret leads him to track down former Blade Runner Rick Deckard, who's been missing for thirty years.",
    rating: 8.0,
    criticScore: 88,
    userRating: 8.1,
    runtime: 164,
    genres: ["Action", "Drama", "Mystery", "Sci-Fi"],
    genreIds: [1, 6, 13, 15],
    usRating: "R",
    releaseDate: "2017-10-06",
    trailer: "https://www.youtube.com/watch?v=gCcx85zbxz4",
    similarTitles: [3173903, 3169821]
  },
  {
    id: 3180420,
    title: "The Batman",
    year: 2022,
    poster: "https://images.unsplash.com/photo-1509281373149-e957c6296406?w=800&auto=format&fit=crop&q=80",
    backdrop: "https://images.unsplash.com/photo-1514565131-fce0801e5785?w=1600&auto=format&fit=crop&q=80",
    description: "When a sadistic serial killer begins murdering key political figures in Gotham, Batman is forced to investigate the city's hidden corruption and question his family's involvement.",
    rating: 7.9,
    criticScore: 85,
    userRating: 8.0,
    runtime: 176,
    genres: ["Action", "Crime", "Drama"],
    genreIds: [1, 5, 6],
    usRating: "PG-13",
    releaseDate: "2022-03-04",
    trailer: "https://www.youtube.com/watch?v=mqqft2x_Aa4",
    similarTitles: [3144501, 3188901]
  },
  {
    id: 3188901,
    title: "Spider-Man: Across the Spider-Verse",
    year: 2023,
    poster: "https://images.unsplash.com/photo-1635805737707-575885ab0820?w=800&auto=format&fit=crop&q=80",
    backdrop: "https://images.unsplash.com/photo-1607604276583-eef5d076aa5f?w=1600&auto=format&fit=crop&q=80",
    description: "Miles Morales catapults across the Multiverse, where he encounters a team of Spider-People charged with protecting its very existence. When heroes clash on handling a new threat, Miles must redefine heroism.",
    rating: 8.7,
    criticScore: 95,
    userRating: 8.7,
    runtime: 140,
    genres: ["Animation", "Action", "Adventure", "Sci-Fi"],
    genreIds: [2, 1, 15],
    usRating: "PG",
    releaseDate: "2023-06-02",
    trailer: "https://www.youtube.com/watch?v=cqGjhVJWtEg",
    similarTitles: [3173903, 3180420]
  },
  {
    id: 3192304,
    title: "Gladiator II",
    year: 2024,
    poster: "https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=800&auto=format&fit=crop&q=80",
    backdrop: "https://images.unsplash.com/photo-1509198397868-475647b2a1e5?w=1600&auto=format&fit=crop&q=80",
    description: "Years after witnessing the death of Maximus at the hands of his uncle, Lucius must enter the Colosseum after the powerful emperors of Rome conquer his home.",
    rating: 7.4,
    criticScore: 78,
    userRating: 7.5,
    runtime: 148,
    genres: ["Action", "Adventure", "Drama"],
    genreIds: [1, 6],
    usRating: "R",
    releaseDate: "2024-11-22",
    trailer: "https://www.youtube.com/watch?v=4rgYUipGJNo",
    similarTitles: [3158912, 3173903]
  },
  {
    id: 3195610,
    title: "Everything Everywhere All at Once",
    year: 2022,
    poster: "https://images.unsplash.com/photo-1536440136628-849c177e76a1?w=800&auto=format&fit=crop&q=80",
    backdrop: "https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=1600&auto=format&fit=crop&q=80",
    description: "A middle-aged Chinese immigrant is swept up into an insane adventure in which she alone can save existence by exploring other universes and connecting with the lives she could have led.",
    rating: 8.8,
    criticScore: 94,
    userRating: 8.9,
    runtime: 139,
    genres: ["Action", "Adventure", "Comedy", "Sci-Fi"],
    genreIds: [1, 4, 15],
    usRating: "R",
    releaseDate: "2022-04-08",
    trailer: "https://www.youtube.com/watch?v=wxN1T1uxQ2g",
    similarTitles: [3188901, 3169821]
  },
  {
    id: 3201122,
    title: "Avatar: The Way of Water",
    year: 2022,
    poster: "https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=800&auto=format&fit=crop&q=80",
    backdrop: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=1600&auto=format&fit=crop&q=80",
    description: "Jake Sully lives with his newfound family formed on the extrasolar moon Pandora. Once a familiar threat returns to finish what was previously started, Jake must work with Neytiri and the army of the Na'vi race.",
    rating: 7.6,
    criticScore: 76,
    userRating: 7.8,
    runtime: 192,
    genres: ["Action", "Adventure", "Fantasy", "Sci-Fi"],
    genreIds: [1, 8, 15],
    usRating: "PG-13",
    releaseDate: "2022-12-16",
    trailer: "https://www.youtube.com/watch?v=d9MyW72ELq0",
    similarTitles: [3173903, 3169821]
  },
  {
    id: 3204551,
    title: "Top Gun: Maverick",
    year: 2022,
    poster: "https://images.unsplash.com/photo-1513151233558-d860c5398176?w=800&auto=format&fit=crop&q=80",
    backdrop: "https://images.unsplash.com/photo-1508739773434-c26b3d09e071?w=1600&auto=format&fit=crop&q=80",
    description: "After thirty years, Maverick is still pushing the envelope as a top naval aviator, but must confront ghosts of his past when he leads TOP GUN's elite graduates on an impossible mission.",
    rating: 8.3,
    criticScore: 96,
    userRating: 8.4,
    runtime: 130,
    genres: ["Action", "Drama"],
    genreIds: [1, 6],
    usRating: "PG-13",
    releaseDate: "2022-05-27",
    trailer: "https://www.youtube.com/watch?v=giXco2jaZ_4",
    similarTitles: [3158912, 3180420]
  },
  {
    id: 3208910,
    title: "Inception",
    year: 2010,
    poster: "https://images.unsplash.com/photo-1579783902614-a3fb3927b675?w=800&auto=format&fit=crop&q=80",
    backdrop: "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=1600&auto=format&fit=crop&q=80",
    description: "A thief who steals corporate secrets through the use of dream-sharing technology is given the inverse task of planting an idea into the mind of a C.E.O.",
    rating: 8.8,
    criticScore: 87,
    userRating: 8.8,
    runtime: 148,
    genres: ["Action", "Adventure", "Sci-Fi", "Thriller"],
    genreIds: [1, 15, 17],
    usRating: "PG-13",
    releaseDate: "2010-07-16",
    trailer: "https://www.youtube.com/watch?v=YoHD9XEInc0",
    similarTitles: [3169821, 3144501]
  },
  {
    id: 3211420,
    title: "Parasite",
    year: 2019,
    poster: "https://images.unsplash.com/photo-1536440136628-849c177e76a1?w=800&auto=format&fit=crop&q=80",
    backdrop: "https://images.unsplash.com/photo-1513694203232-719a280e022f?w=1600&auto=format&fit=crop&q=80",
    description: "Greed and class discrimination threaten the newly formed symbiotic relationship between the wealthy Park family and the destitute Kim clan.",
    rating: 8.5,
    criticScore: 96,
    userRating: 8.6,
    runtime: 132,
    genres: ["Drama", "Thriller", "Comedy"],
    genreIds: [6, 17, 4],
    usRating: "R",
    releaseDate: "2019-11-08",
    trailer: "https://www.youtube.com/watch?v=5xH0RZE357M",
    similarTitles: [3158912, 3195610]
  },
  {
    id: 3214777,
    title: "Poor Things",
    year: 2023,
    poster: "https://images.unsplash.com/photo-1534447677768-be436bb09401?w=800&auto=format&fit=crop&q=80",
    backdrop: "https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=1600&auto=format&fit=crop&q=80",
    description: "The incredible tale about the fantastical evolution of Bella Baxter, a young woman brought back to life by the brilliant and unorthodox scientist Dr. Godwin Baxter.",
    rating: 7.9,
    criticScore: 92,
    userRating: 8.0,
    runtime: 141,
    genres: ["Comedy", "Drama", "Romance", "Sci-Fi"],
    genreIds: [4, 6, 15],
    usRating: "R",
    releaseDate: "2023-12-08",
    trailer: "https://www.youtube.com/watch?v=RlbR5N6veqw",
    similarTitles: [3195610, 3158912]
  },
  {
    id: 3218990,
    title: "Mission: Impossible – Dead Reckoning",
    year: 2023,
    poster: "https://images.unsplash.com/photo-1509281373149-e957c6296406?w=800&auto=format&fit=crop&q=80",
    backdrop: "https://images.unsplash.com/photo-1508739773434-c26b3d09e071?w=1600&auto=format&fit=crop&q=80",
    description: "Ethan Hunt and his IMF team must track down a dangerous weapon before it falls into the wrong hands.",
    rating: 7.7,
    criticScore: 96,
    userRating: 7.8,
    runtime: 163,
    genres: ["Action", "Adventure", "Thriller"],
    genreIds: [1, 17],
    usRating: "PG-13",
    releaseDate: "2023-07-12",
    trailer: "https://www.youtube.com/watch?v=avz05PDqDbM",
    similarTitles: [3204551, 3180420]
  },
  {
    id: 3221004,
    title: "The Holdovers",
    year: 2023,
    poster: "https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=800&auto=format&fit=crop&q=80",
    backdrop: "https://images.unsplash.com/photo-1440404653325-ab127d49abc1?w=1600&auto=format&fit=crop&q=80",
    description: "A cranky history teacher at a remote prep school is forced to remain on campus during the holiday break to chaperone a handful of students with nowhere to go.",
    rating: 8.0,
    criticScore: 97,
    userRating: 8.1,
    runtime: 133,
    genres: ["Comedy", "Drama"],
    genreIds: [4, 6],
    usRating: "R",
    releaseDate: "2023-10-27",
    trailer: "https://www.youtube.com/watch?v=AhKLpJmHhIg",
    similarTitles: [3211420, 3158912]
  },
  {
    id: 3224500,
    title: "Furiosa: A Mad Max Saga",
    year: 2024,
    poster: "https://images.unsplash.com/photo-1578632767115-351597cf2477?w=800&auto=format&fit=crop&q=80",
    backdrop: "https://images.unsplash.com/photo-1509198397868-475647b2a1e5?w=1600&auto=format&fit=crop&q=80",
    description: "The origin story of renegade warrior Furiosa before her encounter and teamup with Mad Max.",
    rating: 7.6,
    criticScore: 90,
    userRating: 7.7,
    runtime: 148,
    genres: ["Action", "Adventure", "Sci-Fi"],
    genreIds: [1, 15],
    usRating: "R",
    releaseDate: "2024-05-24",
    trailer: "https://www.youtube.com/watch?v=XJMuhwVlca4",
    similarTitles: [3173903, 3144501]
  }
];

const FALLBACK_GENRES: Genre[] = [
  { id: 1, name: "Action" },
  { id: 2, name: "Animation" },
  { id: 4, name: "Comedy" },
  { id: 5, name: "Crime" },
  { id: 6, name: "Drama" },
  { id: 7, name: "Family" },
  { id: 8, name: "Fantasy" },
  { id: 10, name: "History" },
  { id: 11, name: "Horror" },
  { id: 13, name: "Mystery" },
  { id: 14, name: "Romance" },
  { id: 15, name: "Sci-Fi" },
  { id: 17, name: "Thriller" }
];

const FALLBACK_SOURCES: Record<number, StreamingSource[]> = {
  3173903: [
    { sourceId: 203, name: "Max", type: "sub", region: "US", webUrl: "https://www.max.com", format: "4K UHD" },
    { sourceId: 24, name: "Amazon Prime Video", type: "rent", region: "US", webUrl: "https://www.amazon.com/v", price: 3.99, displayPrice: "$3.99" },
    { sourceId: 371, name: "Apple TV", type: "buy", region: "US", webUrl: "https://tv.apple.com", price: 14.99, displayPrice: "$14.99" }
  ],
  3158912: [
    { sourceId: 387, name: "Peacock Premium", type: "sub", region: "US", webUrl: "https://www.peacocktv.com", format: "4K UHD" },
    { sourceId: 24, name: "Amazon Prime Video", type: "rent", region: "US", webUrl: "https://www.amazon.com/v", price: 3.99, displayPrice: "$3.99" },
    { sourceId: 371, name: "Apple TV", type: "buy", region: "US", webUrl: "https://tv.apple.com", price: 14.99, displayPrice: "$14.99" }
  ],
  3169821: [
    { sourceId: 384, name: "Paramount+", type: "sub", region: "US", webUrl: "https://www.paramountplus.com", format: "HD" },
    { sourceId: 203, name: "Max", type: "sub", region: "US", webUrl: "https://www.max.com", format: "4K UHD" },
    { sourceId: 24, name: "Amazon Prime Video", type: "rent", region: "US", webUrl: "https://www.amazon.com/v", price: 3.99, displayPrice: "$3.99" }
  ]
};

function getApiKey(): string | undefined {
  return process.env.WATCHMODE_API_KEY;
}

// Request Queue to prevent "Too many concurrent requests" (429) on Watchmode API
type QueueTask<T> = () => Promise<T>;

class RequestQueue {
  private queue: Array<() => Promise<void>> = [];
  private isProcessing = false;
  private minIntervalMs = 300; // minimum ms between API calls to avoid concurrency spikes
  private lastRequestTime = 0;

  async enqueue<T>(task: QueueTask<T>): Promise<T> {
    return new Promise<T>((resolve, reject) => {
      this.queue.push(async () => {
        try {
          const now = Date.now();
          const timeSinceLast = now - this.lastRequestTime;
          if (timeSinceLast < this.minIntervalMs) {
            await new Promise((r) => setTimeout(r, this.minIntervalMs - timeSinceLast));
          }
          this.lastRequestTime = Date.now();
          const result = await task();
          resolve(result);
        } catch (err) {
          reject(err);
        }
      });

      this.processQueue();
    });
  }

  private async processQueue() {
    if (this.isProcessing) return;
    this.isProcessing = true;

    while (this.queue.length > 0) {
      const current = this.queue.shift();
      if (current) {
        try {
          await current();
        } catch {
          // Errors handled per task promise
        }
      }
    }

    this.isProcessing = false;
  }
}

const apiQueue = new RequestQueue();

// Reusable server-side Watchmode fetch function with retry & backoff
export async function watchmodeFetch<T>(
  endpoint: string,
  queryParams: Record<string, string | number | boolean | undefined> = {},
  maxRetries = 3
): Promise<T> {
  const apiKey = getApiKey();
  if (!apiKey) {
    throw new Error("WATCHMODE_API_KEY is not configured on server.");
  }

  const url = new URL(`${WATCHMODE_BASE_URL}${endpoint}`);
  for (const [key, val] of Object.entries(queryParams)) {
    if (val !== undefined && val !== null && val !== "") {
      url.searchParams.set(key, String(val));
    }
  }

  const headers: Record<string, string> = {
    "X-API-Key": apiKey,
    "Accept": "application/json"
  };

  return apiQueue.enqueue(async () => {
    let attempts = 0;
    while (attempts < maxRetries) {
      attempts++;
      try {
        const response = await fetch(url.toString(), {
          method: "GET",
          headers
        });

        if (response.status === 429) {
          const errorText = await response.text().catch(() => "");
          console.warn(`[Watchmode 429 Rate Limit] Attempt ${attempts}/${maxRetries} for ${endpoint}. Backing off... ${errorText}`);
          if (attempts < maxRetries) {
            const backoffMs = attempts * 750 + Math.floor(Math.random() * 250);
            await new Promise((r) => setTimeout(r, backoffMs));
            continue;
          }
          throw new Error(`Watchmode API 429 Rate Limit reached after ${maxRetries} attempts`);
        }

        if (!response.ok) {
          const errorText = await response.text().catch(() => "");
          throw new Error(`Watchmode API error: ${response.status} ${response.statusText} ${errorText}`.trim());
        }

        return (await response.json()) as T;
      } catch (err: any) {
        if (attempts >= maxRetries || !err?.message?.includes("429")) {
          throw err;
        }
        const backoffMs = attempts * 750;
        await new Promise((r) => setTimeout(r, backoffMs));
      }
    }
    throw new Error(`Watchmode fetch failed after ${maxRetries} attempts`);
  });
}

// High quality curated fallback posters for movies missing artwork from API
const CURATED_CINEMA_POSTERS = [
  "https://images.unsplash.com/photo-1534447677768-be436bb09401?w=800&auto=format&fit=crop&q=80",
  "https://images.unsplash.com/photo-1440404653325-ab127d49abc1?w=800&auto=format&fit=crop&q=80",
  "https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=800&auto=format&fit=crop&q=80",
  "https://images.unsplash.com/photo-1578632767115-351597cf2477?w=800&auto=format&fit=crop&q=80",
  "https://images.unsplash.com/photo-1509281373149-e957c6296406?w=800&auto=format&fit=crop&q=80",
  "https://images.unsplash.com/photo-1635805737707-575885ab0820?w=800&auto=format&fit=crop&q=80",
  "https://images.unsplash.com/photo-1536440136628-849c177e76a1?w=800&auto=format&fit=crop&q=80",
  "https://images.unsplash.com/photo-1513151233558-d860c5398176?w=800&auto=format&fit=crop&q=80",
  "https://images.unsplash.com/photo-1579783902614-a3fb3927b675?w=800&auto=format&fit=crop&q=80",
  "https://images.unsplash.com/photo-1514565131-fce0801e5785?w=800&auto=format&fit=crop&q=80"
];

function getDeterministicPoster(id: number): string {
  const index = Math.abs(id) % CURATED_CINEMA_POSTERS.length;
  return CURATED_CINEMA_POSTERS[index];
}

// Normalizers
export function normalizeWatchmodeMovie(raw: WatchmodeRawTitle | WatchmodeRawDetails): Movie {
  const isDetails = "plot_overview" in raw || "genre_names" in raw;
  const details = raw as WatchmodeRawDetails;
  const anyRaw = raw as any;

  // Extract poster checking all Watchmode API field variants
  const rawPoster = anyRaw.poster_url || anyRaw.poster_large || anyRaw.poster || anyRaw.image_url || anyRaw.poster_medium || anyRaw.thumbnail;
  const rawBackdrop = anyRaw.backdrop_url || anyRaw.backdrop_large || anyRaw.backdrop || anyRaw.backdrop_medium;

  const poster = rawPoster || getDeterministicPoster(raw.id);
  const backdrop = rawBackdrop || poster;

  return {
    id: raw.id,
    title: raw.title || "Untitled Movie",
    year: raw.year,
    poster,
    backdrop,
    description: isDetails ? details.plot_overview : undefined,
    rating: isDetails ? (details.critic_score ? details.critic_score / 10 : details.user_rating) : (raw.critic_score ? raw.critic_score / 10 : raw.user_rating),
    criticScore: isDetails ? details.critic_score : raw.critic_score,
    userRating: isDetails ? details.user_rating : raw.user_rating,
    runtime: isDetails ? details.runtime_minutes : undefined,
    genres: isDetails && details.genre_names ? details.genre_names : undefined,
    genreIds: isDetails && details.genres ? details.genres : undefined,
    imdbId: raw.imdb_id,
    tmdbId: raw.tmdb_id,
    type: raw.type || "movie",
    releaseDate: isDetails ? details.release_date : undefined,
    usRating: isDetails ? details.us_rating : undefined,
    trailer: isDetails ? details.trailer : undefined,
    trailerThumbnail: isDetails ? details.trailer_thumbnail : undefined,
    similarTitles: isDetails ? details.similar_titles : undefined,
  };
}

export function normalizeWatchmodeSource(source: WatchmodeRawSource): StreamingSource {
  let displayPrice: string | undefined = undefined;
  if (source.price !== null && source.price !== undefined) {
    const numPrice = typeof source.price === "string" ? parseFloat(source.price) : source.price;
    if (!isNaN(numPrice) && numPrice > 0) {
      displayPrice = `$${numPrice.toFixed(2)}`;
    }
  }

  return {
    sourceId: source.source_id,
    name: source.name || "Provider",
    type: source.type || "sub",
    region: source.region || DEFAULT_REGION,
    webUrl: source.web_url || "#",
    format: source.format || "HD",
    price: typeof source.price === "number" ? source.price : (source.price ? parseFloat(String(source.price)) : null),
    displayPrice
  };
}

export function normalizeWatchmodeSearchResult(item: WatchmodeRawSearchResult): SearchResultItem {
  const anyItem = item as any;
  const poster = anyItem.image_url || anyItem.poster_url || anyItem.poster_large || anyItem.poster || anyItem.thumbnail || getDeterministicPoster(item.id);

  return {
    id: item.id,
    title: item.name,
    year: item.year,
    type: item.type || item.result_type || "movie",
    poster,
    imdbId: item.imdb_id,
    tmdbId: item.tmdb_id
  };
}

// Service Methods with Caching

/**
 * 3. GET /api/movies/trending
 * Watchmode: GET /v1/list-titles/?types=movie&sort_by=popularity_desc&page=...&limit=...
 */
export async function getTrendingMovies(page = 1, limit = 16, genreId?: number): Promise<{ movies: Movie[], source: 'live' | 'cache' | 'fallback', total?: number }> {
  const cacheKey = `trending_p${page}_l${limit}_g${genreId || 'all'}`;
  const cached = serverCache.get<Movie[]>(cacheKey);
  if (cached) {
    return { movies: cached, source: 'cache' };
  }

  const apiKey = getApiKey();
  if (!apiKey) {
    // Return curated fallback
    let list = [...FALLBACK_MOVIES];
    if (genreId) {
      list = list.filter(m => m.genreIds?.includes(genreId));
    }
    const startIndex = (page - 1) * limit;
    const paginated = list.slice(startIndex, startIndex + limit);
    return { movies: paginated.length > 0 ? paginated : FALLBACK_MOVIES.slice(0, limit), source: 'fallback', total: list.length };
  }

  try {
    const params: Record<string, string | number> = {
      types: "movie",
      sort_by: "popularity_desc",
      page,
      limit
    };
    if (genreId) {
      params.genres = genreId;
    }

    const response = await watchmodeFetch<{ titles: WatchmodeRawTitle[], total_results?: number }>("/list-titles/", params);
    const titles = response.titles || [];
    
    // Normalize basic titles
    const movies = titles.map(normalizeWatchmodeMovie);

    // Cache trending for 45 minutes (2700s)
    serverCache.set(cacheKey, movies, 2700);

    return { movies, source: 'live', total: response.total_results };
  } catch (error: any) {
    console.warn(`[Watchmode Service] Trending fallback invoked: ${error?.message || error}`);
    // Fallback on error
    const startIndex = (page - 1) * limit;
    const paginated = FALLBACK_MOVIES.slice(startIndex, startIndex + limit);
    return { movies: paginated.length > 0 ? paginated : FALLBACK_MOVIES.slice(0, limit), source: 'fallback' };
  }
}

/**
 * 7. GET /api/movies/most-watched
 * Watchmode: GET /v1/list-titles/?types=movie&sort_by=popularity_desc&page=2&limit=...
 */
export async function getMostWatchedMovies(page = 2, limit = 16): Promise<{ movies: Movie[], source: 'live' | 'cache' | 'fallback' }> {
  const cacheKey = `most_watched_p${page}_l${limit}`;
  const cached = serverCache.get<Movie[]>(cacheKey);
  if (cached) {
    return { movies: cached, source: 'cache' };
  }

  const apiKey = getApiKey();
  if (!apiKey) {
    // Reverse/shift fallback array for distinct Most Watched
    const rotated = [...FALLBACK_MOVIES.slice(4), ...FALLBACK_MOVIES.slice(0, 4)];
    return { movies: rotated.slice(0, limit), source: 'fallback' };
  }

  try {
    const response = await watchmodeFetch<{ titles: WatchmodeRawTitle[] }>("/list-titles/", {
      types: "movie",
      sort_by: "popularity_desc",
      page,
      limit
    });
    const titles = response.titles || [];
    const movies = titles.map(normalizeWatchmodeMovie);

    // Cache for 45 minutes
    serverCache.set(cacheKey, movies, 2700);

    return { movies, source: 'live' };
  } catch (error: any) {
    console.warn(`[Watchmode Service] Most Watched fallback invoked: ${error?.message || error}`);
    const rotated = [...FALLBACK_MOVIES.slice(4), ...FALLBACK_MOVIES.slice(0, 4)];
    return { movies: rotated.slice(0, limit), source: 'fallback' };
  }
}

/**
 * 8. GET /api/movies/new
 * Watchmode: GET /v1/list-titles/?types=movie&sort_by=release_date_desc&page=1&limit=...
 */
export async function getNewReleases(page = 1, limit = 16): Promise<{ movies: Movie[], source: 'live' | 'cache' | 'fallback' }> {
  const cacheKey = `new_releases_p${page}_l${limit}`;
  const cached = serverCache.get<Movie[]>(cacheKey);
  if (cached) {
    return { movies: cached, source: 'cache' };
  }

  const apiKey = getApiKey();
  if (!apiKey) {
    const sorted = [...FALLBACK_MOVIES].sort((a, b) => (b.year || 0) - (a.year || 0));
    return { movies: sorted.slice(0, limit), source: 'fallback' };
  }

  try {
    const response = await watchmodeFetch<{ titles: WatchmodeRawTitle[] }>("/list-titles/", {
      types: "movie",
      sort_by: "release_date_desc",
      page,
      limit
    });
    const titles = response.titles || [];
    const movies = titles.map(normalizeWatchmodeMovie);

    // Cache for 45 minutes
    serverCache.set(cacheKey, movies, 2700);

    return { movies, source: 'live' };
  } catch (error: any) {
    console.warn(`[Watchmode Service] New Releases fallback invoked: ${error?.message || error}`);
    const sorted = [...FALLBACK_MOVIES].sort((a, b) => (b.year || 0) - (a.year || 0));
    return { movies: sorted.slice(0, limit), source: 'fallback' };
  }
}

/**
 * 9. GET /api/movie/:id
 * Watchmode: GET /v1/title/{id}/details/
 */
export async function getMovieDetails(id: number): Promise<{ movie: Movie, source: 'live' | 'cache' | 'fallback' }> {
  const cacheKey = `movie_details_${id}`;
  const cached = serverCache.get<Movie>(cacheKey);
  if (cached) {
    return { movie: cached, source: 'cache' };
  }

  const apiKey = getApiKey();
  if (!apiKey) {
    const found = FALLBACK_MOVIES.find(m => m.id === id) || FALLBACK_MOVIES[0];
    return { movie: found, source: 'fallback' };
  }

  try {
    const details = await watchmodeFetch<WatchmodeRawDetails>(`/title/${id}/details/`, {
      append_to_response: "sources"
    });
    const normalized = normalizeWatchmodeMovie(details);

    // Cache movie details for 4 hours (14400s)
    serverCache.set(cacheKey, normalized, 14400);

    return { movie: normalized, source: 'live' };
  } catch (error: any) {
    console.warn(`[Watchmode Service] Movie details fallback for id ${id}: ${error?.message || error}`);
    const found = FALLBACK_MOVIES.find(m => m.id === id) || FALLBACK_MOVIES[0];
    return { movie: found, source: 'fallback' };
  }
}

/**
 * 10. GET /api/movie/:id/sources
 * Watchmode: GET /v1/title/{id}/sources/?regions=US
 */
export async function getMovieSources(id: number, region = DEFAULT_REGION): Promise<{ sources: StreamingSource[], region: string, source: 'live' | 'cache' | 'fallback' }> {
  const cacheKey = `movie_sources_${id}_${region}`;
  const cached = serverCache.get<StreamingSource[]>(cacheKey);
  if (cached) {
    return { sources: cached, region, source: 'cache' };
  }

  const apiKey = getApiKey();
  if (!apiKey) {
    const defaultSources: StreamingSource[] = [
      { sourceId: 203, name: "Max (HBO)", type: "sub", region, webUrl: "https://www.max.com", format: "4K UHD" },
      { sourceId: 24, name: "Amazon Prime Video", type: "rent", region, webUrl: "https://www.amazon.com/v", price: 3.99, displayPrice: "$3.99" },
      { sourceId: 371, name: "Apple TV", type: "buy", region, webUrl: "https://tv.apple.com", price: 14.99, displayPrice: "$14.99" },
      { sourceId: 140, name: "Netflix", type: "sub", region, webUrl: "https://www.netflix.com", format: "HD" }
    ];
    const found = FALLBACK_SOURCES[id] || defaultSources;
    return { sources: found, region, source: 'fallback' };
  }

  try {
    const rawSources = await watchmodeFetch<WatchmodeRawSource[]>(`/title/${id}/sources/`, {
      regions: region
    });
    const normalized = (Array.isArray(rawSources) ? rawSources : []).map(normalizeWatchmodeSource);

    // Cache sources for 2 hours (7200s)
    serverCache.set(cacheKey, normalized, 7200);

    return { sources: normalized, region, source: 'live' };
  } catch (error: any) {
    console.warn(`[Watchmode Service] Movie sources fallback for id ${id}: ${error?.message || error}`);
    const defaultSources: StreamingSource[] = [
      { sourceId: 203, name: "Max (HBO)", type: "sub", region, webUrl: "https://www.max.com", format: "4K UHD" },
      { sourceId: 24, name: "Amazon Prime Video", type: "rent", region, webUrl: "https://www.amazon.com/v", price: 3.99, displayPrice: "$3.99" },
      { sourceId: 371, name: "Apple TV", type: "buy", region, webUrl: "https://tv.apple.com", price: 14.99, displayPrice: "$14.99" }
    ];
    const found = FALLBACK_SOURCES[id] || defaultSources;
    return { sources: found, region, source: 'fallback' };
  }
}

/**
 * 12. GET /api/search?q=query
 * Watchmode: GET /v1/autocomplete-search/?search_value={query}&search_type=3
 */
export async function searchMovies(query: string): Promise<{ results: SearchResultItem[], source: 'live' | 'cache' | 'fallback' }> {
  const cleanQuery = query.trim();
  if (!cleanQuery) {
    return { results: [], source: 'cache' };
  }

  const cacheKey = `search_${cleanQuery.toLowerCase()}`;
  const cached = serverCache.get<SearchResultItem[]>(cacheKey);
  if (cached) {
    return { results: cached, source: 'cache' };
  }

  const apiKey = getApiKey();
  if (!apiKey) {
    const qLower = cleanQuery.toLowerCase();
    const matched = FALLBACK_MOVIES
      .filter(m => m.title.toLowerCase().includes(qLower) || m.genres?.some(g => g.toLowerCase().includes(qLower)))
      .map(m => ({
        id: m.id,
        title: m.title,
        year: m.year,
        type: m.type || "movie",
        poster: m.poster
      }));
    return { results: matched, source: 'fallback' };
  }

  try {
    const response = await watchmodeFetch<{ results?: WatchmodeRawSearchResult[] }>("/autocomplete-search/", {
      search_value: cleanQuery,
      search_type: 3 // movie results
    });

    const rawResults = response.results || [];
    const results = rawResults.map(normalizeWatchmodeSearchResult);

    // Cache search results for 5 minutes (300s)
    serverCache.set(cacheKey, results, 300);

    return { results, source: 'live' };
  } catch (error: any) {
    console.warn(`[Watchmode Service] Search fallback for query "${query}": ${error?.message || error}`);
    const qLower = cleanQuery.toLowerCase();
    const matched = FALLBACK_MOVIES
      .filter(m => m.title.toLowerCase().includes(qLower))
      .map(m => ({
        id: m.id,
        title: m.title,
        year: m.year,
        type: m.type || "movie",
        poster: m.poster
      }));
    return { results: matched, source: 'fallback' };
  }
}

/**
 * 23. GET /api/genres
 * Watchmode: GET /v1/genres/
 */
export async function getGenres(): Promise<{ genres: Genre[], source: 'live' | 'cache' | 'fallback' }> {
  const cacheKey = "genres_list";
  const cached = serverCache.get<Genre[]>(cacheKey);
  if (cached) {
    return { genres: cached, source: 'cache' };
  }

  const apiKey = getApiKey();
  if (!apiKey) {
    return { genres: FALLBACK_GENRES, source: 'fallback' };
  }

  try {
    const rawGenres = await watchmodeFetch<WatchmodeRawGenre[]>("/genres/");
    const genres: Genre[] = (Array.isArray(rawGenres) ? rawGenres : []).map(g => ({
      id: g.id,
      name: g.name
    }));

    // Cache genres for 24 hours (86400s)
    serverCache.set(cacheKey, genres, 86400);

    return { genres, source: 'live' };
  } catch (error: any) {
    console.warn(`[Watchmode Service] Genres fallback invoked: ${error?.message || error}`);
    return { genres: FALLBACK_GENRES, source: 'fallback' };
  }
}
