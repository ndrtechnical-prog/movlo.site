import fs from "fs/promises";
import path from "path";

export interface ClipSEO {
  title: string;
  description: string;
  keywords: string[];
  canonicalUrl?: string;
}

export interface MovieClip {
  id: string;
  movieId?: number;
  movieTitle: string;
  clipTitle: string;
  videoUrl: string; // YouTube embed / MP4 / WebM
  thumbnail: string;
  poster: string;
  backdrop: string;
  duration: string; // e.g. "3:48"
  year: number;
  genre: string;
  genres: string[];
  director?: string;
  actors?: string[];
  description: string;
  views: number;
  likes: number;
  rating: number; // 0 - 10
  quality: "4K UHD" | "1080p HD" | "720p HD";
  isTrending: boolean;
  isMostWatched: boolean;
  publishedAt: string;
  tags: string[];
  seo: ClipSEO;
}

const DATA_DIR = path.join(process.cwd(), "server", "data");
const CLIPS_FILE = path.join(DATA_DIR, "clips.json");

// Default initial high-definition curated cinema clips
export const INITIAL_CLIPS: MovieClip[] = [
  {
    id: "clip-interstellar-docking",
    movieId: 157336,
    movieTitle: "Interstellar",
    clipTitle: "Docking Scene - 'No Time For Caution'",
    videoUrl: "https://www.youtube.com/embed/a3lcGnMhvsA",
    thumbnail: "https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=1280&auto=format&fit=crop&q=80",
    poster: "https://images.unsplash.com/photo-1534447677768-be436bb09401?w=800&auto=format&fit=crop&q=80",
    backdrop: "https://images.unsplash.com/photo-1506703719100-a0f3a48c0f86?w=1920&auto=format&fit=crop&q=80",
    duration: "4:18",
    year: 2014,
    genre: "Sci-Fi",
    genres: ["Sci-Fi", "Adventure", "Drama"],
    director: "Christopher Nolan",
    actors: ["Matthew McConaughey", "Anne Hathaway", "Matt Damon"],
    description: "Cooper attempts the impossible: matching the rotation of the damaged Endurance spaceship spinning at 68 RPM to save humanity's last hope.",
    views: 8940000,
    likes: 342000,
    rating: 9.8,
    quality: "4K UHD",
    isTrending: true,
    isMostWatched: true,
    publishedAt: "2024-01-15T00:00:00.000Z",
    tags: ["nolan", "space", "docking", "zimmer", "endurance", "hans zimmer", "epic"],
    seo: {
      title: "Interstellar Docking Scene 4K HDR - Christopher Nolan",
      description: "Watch the legendary docking scene from Christopher Nolan's Interstellar in 4K UHD. Cooper matches 68 RPM rotation with Endurance.",
      keywords: ["Interstellar docking scene", "No time for caution", "Christopher Nolan clips", "Matthew McConaughey", "Hans Zimmer score"]
    }
  },
  {
    id: "clip-interstellar-millers-planet",
    movieId: 157336,
    movieTitle: "Interstellar",
    clipTitle: "Miller's Planet Mountain Wave Scene",
    videoUrl: "https://www.youtube.com/embed/v7OVqXm7_Pk",
    thumbnail: "https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=1280&auto=format&fit=crop&q=80",
    poster: "https://images.unsplash.com/photo-1534447677768-be436bb09401?w=800&auto=format&fit=crop&q=80",
    backdrop: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=1920&auto=format&fit=crop&q=80",
    duration: "3:42",
    year: 2014,
    genre: "Sci-Fi",
    genres: ["Sci-Fi", "Adventure", "Thriller"],
    director: "Christopher Nolan",
    actors: ["Matthew McConaughey", "Anne Hathaway"],
    description: "Those aren't mountains... they're waves! The crew discovers the terrifying time-dilation effects of Gargantua's gravitational pull on Miller's water planet.",
    views: 6420000,
    likes: 245000,
    rating: 9.7,
    quality: "4K UHD",
    isTrending: true,
    isMostWatched: false,
    publishedAt: "2024-02-10T00:00:00.000Z",
    tags: ["interstellar", "millers planet", "wave scene", "nolan", "time dilation"],
    seo: {
      title: "Interstellar - Those Aren't Mountains Miller's Planet Wave Scene",
      description: "Watch the Miller's Planet giant tidal wave sequence from Interstellar with Hans Zimmer ticking time dilation theme.",
      keywords: ["Interstellar tidal wave", "Miller's planet scene", "Those aren't mountains", "Hans Zimmer", "Sci-Fi movie clip"]
    }
  },
  {
    id: "clip-dark-knight-bank-heist",
    movieId: 155,
    movieTitle: "The Dark Knight",
    clipTitle: "Joker's Bank Heist Opening Scene",
    videoUrl: "https://www.youtube.com/embed/0OYBEquZ_P0",
    thumbnail: "https://images.unsplash.com/photo-1509281373149-e957c6296406?w=1280&auto=format&fit=crop&q=80",
    poster: "https://images.unsplash.com/photo-1440404653325-ab127d49abc1?w=800&auto=format&fit=crop&q=80",
    backdrop: "https://images.unsplash.com/photo-1514565131-fce0801e5785?w=1920&auto=format&fit=crop&q=80",
    duration: "5:20",
    year: 2008,
    genre: "Action",
    genres: ["Action", "Crime", "Thriller"],
    director: "Christopher Nolan",
    actors: ["Heath Ledger", "William Fichtner"],
    description: "The iconic opening sequence of The Dark Knight introducing Heath Ledger's Joker orchestrating a brilliant bank robbery in Gotham City.",
    views: 14800000,
    likes: 680000,
    rating: 9.9,
    quality: "4K UHD",
    isTrending: true,
    isMostWatched: true,
    publishedAt: "2024-01-05T00:00:00.000Z",
    tags: ["joker", "batman", "dark knight", "bank heist", "heath ledger", "gotham"],
    seo: {
      title: "The Dark Knight - Joker Bank Heist Scene 4K",
      description: "Heath Ledger's legendary opening heist in The Dark Knight. 'Whatever doesn't kill you simply makes you stranger.'",
      keywords: ["Dark knight bank heist", "Heath Ledger Joker", "Christopher Nolan", "Batman movie clips"]
    }
  },
  {
    id: "clip-dark-knight-interrogation",
    movieId: 155,
    movieTitle: "The Dark Knight",
    clipTitle: "Batman & Joker Interrogation Room Scene",
    videoUrl: "https://www.youtube.com/embed/peTzD_Fp5lQ",
    thumbnail: "https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=1280&auto=format&fit=crop&q=80",
    poster: "https://images.unsplash.com/photo-1440404653325-ab127d49abc1?w=800&auto=format&fit=crop&q=80",
    backdrop: "https://images.unsplash.com/photo-1536440136628-849c177e76a1?w=1920&auto=format&fit=crop&q=80",
    duration: "4:35",
    year: 2008,
    genre: "Crime",
    genres: ["Crime", "Drama", "Thriller"],
    director: "Christopher Nolan",
    actors: ["Christian Bale", "Heath Ledger", "Gary Oldman"],
    description: "Batman confronts the Joker inside Gotham PD interrogation room, revealing the moral clash between order and chaotic nihilism.",
    views: 11200000,
    likes: 540000,
    rating: 9.9,
    quality: "4K UHD",
    isTrending: false,
    isMostWatched: true,
    publishedAt: "2024-02-14T00:00:00.000Z",
    tags: ["batman", "joker", "interrogation", "christian bale", "heath ledger"],
    seo: {
      title: "Batman and Joker Interrogation Room Scene - The Dark Knight",
      description: "The climactic interrogation between Batman and Joker. 'You complete me!' - Heath Ledger masterclass.",
      keywords: ["Batman interrogation Joker", "The Dark Knight scene", "Christian Bale", "Heath Ledger"]
    }
  },
  {
    id: "clip-oppenheimer-trinity",
    movieId: 872585,
    movieTitle: "Oppenheimer",
    clipTitle: "Trinity Test Atomic Explosion (Sound Delay)",
    videoUrl: "https://www.youtube.com/embed/uYPbbksJxIg",
    thumbnail: "https://images.unsplash.com/photo-1509281373149-e957c6296406?w=1280&auto=format&fit=crop&q=80",
    poster: "https://images.unsplash.com/photo-1579783902614-a3fb3927b675?w=800&auto=format&fit=crop&q=80",
    backdrop: "https://images.unsplash.com/photo-1506703719100-a0f3a48c0f86?w=1920&auto=format&fit=crop&q=80",
    duration: "5:10",
    year: 2023,
    genre: "Drama",
    genres: ["Biography", "Drama", "History"],
    director: "Christopher Nolan",
    actors: ["Cillian Murphy", "Robert Downey Jr.", "Emily Blunt"],
    description: "The breathless silence and harrowing shockwave delay of the world's first nuclear detonation in Los Alamos, New Mexico.",
    views: 9400000,
    likes: 410000,
    rating: 9.8,
    quality: "4K UHD",
    isTrending: true,
    isMostWatched: true,
    publishedAt: "2024-01-20T00:00:00.000Z",
    tags: ["oppenheimer", "trinity test", "nolan", "atomic bomb", "cillian murphy", "cinematic"],
    seo: {
      title: "Oppenheimer Trinity Test Explosion Scene 4K IMAX",
      description: "Christopher Nolan's breathtaking depiction of the Trinity nuclear test with authentic acoustic sound shockwave delay.",
      keywords: ["Oppenheimer Trinity test", "Cillian Murphy", "Christopher Nolan movie clip", "Atomic bomb scene"]
    }
  },
  {
    id: "clip-inception-hallway",
    movieId: 27205,
    movieTitle: "Inception",
    clipTitle: "Zero Gravity Rotating Hallway Fight Scene",
    videoUrl: "https://www.youtube.com/embed/7fZk_sC_aCQ",
    thumbnail: "https://images.unsplash.com/photo-1578632767115-351597cf2477?w=1280&auto=format&fit=crop&q=80",
    poster: "https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=800&auto=format&fit=crop&q=80",
    backdrop: "https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=1920&auto=format&fit=crop&q=80",
    duration: "4:05",
    year: 2010,
    genre: "Sci-Fi",
    genres: ["Sci-Fi", "Action", "Adventure"],
    director: "Christopher Nolan",
    actors: ["Joseph Gordon-Levitt", "Leonardo DiCaprio"],
    description: "Arthur battles subconscious projections in a 360-degree rotating hotel hallway as the van rolls off the bridge in the dream level above.",
    views: 8200000,
    likes: 380000,
    rating: 9.7,
    quality: "4K UHD",
    isTrending: true,
    isMostWatched: false,
    publishedAt: "2024-02-01T00:00:00.000Z",
    tags: ["inception", "rotating hallway", "zero gravity", "joseph gordon-levitt", "nolan"],
    seo: {
      title: "Inception Zero Gravity Rotating Hallway Fight 4K",
      description: "The groundbreaking practical zero-gravity rotating hallway stunt sequence from Inception starring Joseph Gordon-Levitt.",
      keywords: ["Inception hallway fight", "Zero gravity scene", "Joseph Gordon-Levitt", "Christopher Nolan"]
    }
  },
  {
    id: "clip-dune-2-worm-ride",
    movieId: 693134,
    movieTitle: "Dune: Part Two",
    clipTitle: "Paul Atreides Rides the Grandfather Sandworm",
    videoUrl: "https://www.youtube.com/embed/Way9Dexny3w",
    thumbnail: "https://images.unsplash.com/photo-1509281373149-e957c6296406?w=1280&auto=format&fit=crop&q=80",
    poster: "https://images.unsplash.com/photo-1635805737707-575885ab0820?w=800&auto=format&fit=crop&q=80",
    backdrop: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=1920&auto=format&fit=crop&q=80",
    duration: "4:45",
    year: 2024,
    genre: "Sci-Fi",
    genres: ["Sci-Fi", "Adventure", "Action"],
    director: "Denis Villeneuve",
    actors: ["Timothée Chalamet", "Zendaya", "Javier Bardem"],
    description: "Paul summons and successfully mounts the largest Shai-Hulud sandworm on Arrakis, earning the reverence of the Fremen Fedaykin.",
    views: 7300000,
    likes: 395000,
    rating: 9.8,
    quality: "4K UHD",
    isTrending: true,
    isMostWatched: true,
    publishedAt: "2024-03-05T00:00:00.000Z",
    tags: ["dune", "dune 2", "shai hulud", "sandworm", "timothee chalamet", "villeneuve"],
    seo: {
      title: "Dune Part Two - Paul Atreides Rides Sandworm Scene 4K",
      description: "Witness Paul Atreides conquering the colossal Grandfather Sandworm in Denis Villeneuve's sci-fi masterpiece Dune: Part Two.",
      keywords: ["Dune 2 sandworm ride", "Paul Atreides", "Shai-Hulud", "Timothee Chalamet", "Denis Villeneuve"]
    }
  },
  {
    id: "clip-dune-2-feyd-duel",
    movieId: 693134,
    movieTitle: "Dune: Part Two",
    clipTitle: "Paul Atreides vs. Feyd-Rautha Knife Duel",
    videoUrl: "https://www.youtube.com/embed/n9xhJrPXop4",
    thumbnail: "https://images.unsplash.com/photo-1579783902614-a3fb3927b675?w=1280&auto=format&fit=crop&q=80",
    poster: "https://images.unsplash.com/photo-1635805737707-575885ab0820?w=800&auto=format&fit=crop&q=80",
    backdrop: "https://images.unsplash.com/photo-1513151233558-d860c5398176?w=1920&auto=format&fit=crop&q=80",
    duration: "5:30",
    year: 2024,
    genre: "Action",
    genres: ["Sci-Fi", "Action", "Drama"],
    director: "Denis Villeneuve",
    actors: ["Timothée Chalamet", "Austin Butler"],
    description: "The fatal blade duel between Paul Muad'Dib Atreides and the psychotic Feyd-Rautha Harkonnen for the throne of the Imperium.",
    views: 6100000,
    likes: 310000,
    rating: 9.7,
    quality: "4K UHD",
    isTrending: false,
    isMostWatched: true,
    publishedAt: "2024-03-12T00:00:00.000Z",
    tags: ["dune 2", "feyd rautha", "knife fight", "paul atreides", "austin butler"],
    seo: {
      title: "Paul Atreides vs Feyd-Rautha Final Fight Scene - Dune 2",
      description: "The intense knife duel between Timothée Chalamet and Austin Butler in the climax of Dune: Part Two.",
      keywords: ["Dune 2 final duel", "Paul vs Feyd", "Austin Butler", "Timothee Chalamet"]
    }
  },
  {
    id: "clip-avengers-endgame-portals",
    movieId: 299534,
    movieTitle: "Avengers: Endgame",
    clipTitle: "'On Your Left' Portals Assemble Scene",
    videoUrl: "https://www.youtube.com/embed/VUTUaJz7x94",
    thumbnail: "https://images.unsplash.com/photo-1536440136628-849c177e76a1?w=1280&auto=format&fit=crop&q=80",
    poster: "https://images.unsplash.com/photo-1578632767115-351597cf2477?w=800&auto=format&fit=crop&q=80",
    backdrop: "https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=1920&auto=format&fit=crop&q=80",
    duration: "4:50",
    year: 2019,
    genre: "Action",
    genres: ["Action", "Adventure", "Fantasy"],
    director: "Anthony & Joe Russo",
    actors: ["Chris Evans", "Robert Downey Jr.", "Chadwick Boseman"],
    description: "Captain America stands alone against Thanos' army until Sam Wilson crackles on the radio: 'On your left'. Portals open across the cosmos.",
    views: 18500000,
    likes: 1200000,
    rating: 9.9,
    quality: "4K UHD",
    isTrending: true,
    isMostWatched: true,
    publishedAt: "2024-01-01T00:00:00.000Z",
    tags: ["avengers", "endgame", "portals", "captain america", "assemble", "marvel"],
    seo: {
      title: "Avengers Endgame Portals Scene 4K HDR - Avengers Assemble",
      description: "The most electrifying theater moment in cinema history: Avengers Assemble portals scene in 4K UHD.",
      keywords: ["Avengers Endgame portals", "Avengers assemble", "Captain America", "Marvel movie clips"]
    }
  },
  {
    id: "clip-spider-man-leap-of-faith",
    movieId: 324857,
    movieTitle: "Spider-Man: Into the Spider-Verse",
    clipTitle: "'What's Up Danger' - Miles Morales Leap of Faith",
    videoUrl: "https://www.youtube.com/embed/g4hGRvs6HHU",
    thumbnail: "https://images.unsplash.com/photo-1635805737707-575885ab0820?w=1280&auto=format&fit=crop&q=80",
    poster: "https://images.unsplash.com/photo-1534447677768-be436bb09401?w=800&auto=format&fit=crop&q=80",
    backdrop: "https://images.unsplash.com/photo-1514565131-fce0801e5785?w=1920&auto=format&fit=crop&q=80",
    duration: "3:30",
    year: 2018,
    genre: "Animation",
    genres: ["Animation", "Action", "Adventure"],
    director: "Bob Persichetti, Peter Ramsey, Rodney Rothman",
    actors: ["Shameik Moore", "Jake Johnson", "Hailee Steinfeld"],
    description: "Miles Morales takes his leap of faith off the skyscraper, synchronizing with the iconic Blackway & Black Caviar track 'What's Up Danger'.",
    views: 12400000,
    likes: 890000,
    rating: 9.9,
    quality: "4K UHD",
    isTrending: true,
    isMostWatched: false,
    publishedAt: "2024-02-20T00:00:00.000Z",
    tags: ["spider-man", "spider-verse", "leap of faith", "whats up danger", "miles morales"],
    seo: {
      title: "Spider-Man Into The Spider-Verse Leap of Faith Scene 4K",
      description: "Miles Morales becomes Spider-Man in the unforgettable upside-down Leap of Faith sequence.",
      keywords: ["Spider-Man leap of faith", "Miles Morales", "What's up danger", "Spider-verse clip"]
    }
  },
  {
    id: "clip-gladiator-maximus-reveal",
    movieId: 98,
    movieTitle: "Gladiator",
    clipTitle: "'My Name is Maximus Decimus Meridius' Colosseum Speech",
    videoUrl: "https://www.youtube.com/embed/X1UmHfWCw-4",
    thumbnail: "https://images.unsplash.com/photo-1513151233558-d860c5398176?w=1280&auto=format&fit=crop&q=80",
    poster: "https://images.unsplash.com/photo-1509281373149-e957c6296406?w=800&auto=format&fit=crop&q=80",
    backdrop: "https://images.unsplash.com/photo-1579783902614-a3fb3927b675?w=1920&auto=format&fit=crop&q=80",
    duration: "3:55",
    year: 2000,
    genre: "Action",
    genres: ["Action", "Adventure", "Drama"],
    director: "Ridley Scott",
    actors: ["Russell Crowe", "Joaquin Phoenix"],
    description: "In the center of the Colosseum before Emperor Commodus, Maximus removes his helmet and delivers cinema's greatest revenge monologue.",
    views: 15300000,
    likes: 720000,
    rating: 9.8,
    quality: "1080p HD",
    isTrending: false,
    isMostWatched: true,
    publishedAt: "2024-01-10T00:00:00.000Z",
    tags: ["gladiator", "maximus", "russell crowe", "colosseum", "ridley scott"],
    seo: {
      title: "Gladiator - My Name is Maximus Colosseum Scene 4K",
      description: "Russell Crowe's legendary Colosseum speech: 'Father to a murdered son, husband to a murdered wife. And I will have my vengeance.'",
      keywords: ["Gladiator Maximus scene", "Russell Crowe speech", "My name is Maximus", "Movie monologue"]
    }
  },
  {
    id: "clip-john-wick-4-arc-de-triomphe",
    movieId: 603692,
    movieTitle: "John Wick: Chapter 4",
    clipTitle: "Arc de Triomphe Traffic Shootout & Car Chaos",
    videoUrl: "https://www.youtube.com/embed/qEVUtrk8_B4",
    thumbnail: "https://images.unsplash.com/photo-1514565131-fce0801e5785?w=1280&auto=format&fit=crop&q=80",
    poster: "https://images.unsplash.com/photo-1534447677768-be436bb09401?w=800&auto=format&fit=crop&q=80",
    backdrop: "https://images.unsplash.com/photo-1509281373149-e957c6296406?w=1920&auto=format&fit=crop&q=80",
    duration: "5:15",
    year: 2023,
    genre: "Action",
    genres: ["Action", "Crime", "Thriller"],
    director: "Chad Stahelski",
    actors: ["Keanu Reeves", "Donnie Yen", "Bill Skarsgård"],
    description: "John Wick fights waves of assassins while dodging high-speed Paris roundabout traffic around the Arc de Triomphe.",
    views: 8900000,
    likes: 460000,
    rating: 9.8,
    quality: "4K UHD",
    isTrending: true,
    isMostWatched: false,
    publishedAt: "2024-02-28T00:00:00.000Z",
    tags: ["john wick", "john wick 4", "keanu reeves", "arc de triomphe", "paris", "gun fu"],
    seo: {
      title: "John Wick 4 - Arc de Triomphe Roundabout Fight Scene 4K",
      description: "Keanu Reeves battles waves of High Table assassins amidst roaring Parisian traffic around the Arc de Triomphe in 4K UHD.",
      keywords: ["John Wick 4 Arc de Triomphe", "Keanu Reeves fight scene", "Chad Stahelski", "Gun fu action"]
    }
  }
];

let clipsCache: MovieClip[] | null = null;

// Initialize file storage
async function ensureClipsFile(): Promise<MovieClip[]> {
  try {
    await fs.mkdir(DATA_DIR, { recursive: true });
    try {
      const content = await fs.readFile(CLIPS_FILE, "utf-8");
      const parsed = JSON.parse(content);
      if (Array.isArray(parsed) && parsed.length > 0) {
        clipsCache = parsed;
        return parsed;
      }
    } catch {
      // File doesn't exist or is empty, write initial
    }
    await fs.writeFile(CLIPS_FILE, JSON.stringify(INITIAL_CLIPS, null, 2), "utf-8");
    clipsCache = [...INITIAL_CLIPS];
    return clipsCache;
  } catch (err) {
    console.error("[Clips Service] Error initializing storage:", err);
    clipsCache = [...INITIAL_CLIPS];
    return clipsCache;
  }
}

export async function getAllClips(): Promise<MovieClip[]> {
  if (clipsCache && clipsCache.length > 0) {
    return clipsCache;
  }
  return await ensureClipsFile();
}

export async function getTrendingClips(genre?: string): Promise<MovieClip[]> {
  const all = await getAllClips();
  let trending = all.filter((c) => c.isTrending);
  if (trending.length === 0) trending = all.slice(0, 8);
  if (genre && genre.toLowerCase() !== "all") {
    const gLower = genre.toLowerCase();
    trending = trending.filter(
      (c) => c.genre.toLowerCase() === gLower || c.genres.some((g) => g.toLowerCase() === gLower)
    );
  }
  return trending;
}

export async function getMostWatchedClips(): Promise<MovieClip[]> {
  const all = await getAllClips();
  let watched = all.filter((c) => c.isMostWatched);
  if (watched.length === 0) {
    watched = [...all].sort((a, b) => b.views - a.views).slice(0, 8);
  }
  return watched;
}

export async function getClipById(id: string): Promise<MovieClip | null> {
  const all = await getAllClips();
  return all.find((c) => c.id === id) || null;
}

export async function searchClips(query: string): Promise<MovieClip[]> {
  const all = await getAllClips();
  if (!query || !query.trim()) return [];
  const q = query.trim().toLowerCase();

  return all.filter((c) => {
    return (
      c.movieTitle.toLowerCase().includes(q) ||
      c.clipTitle.toLowerCase().includes(q) ||
      c.description.toLowerCase().includes(q) ||
      c.genre.toLowerCase().includes(q) ||
      c.tags.some((t) => t.toLowerCase().includes(q)) ||
      (c.director && c.director.toLowerCase().includes(q)) ||
      (c.actors && c.actors.some((a) => a.toLowerCase().includes(q)))
    );
  });
}

/**
 * AI-powered recommendation logic:
 * First returns other clips from the EXACT SAME movie (Priority 1)
 * Followed by related clips from the same genre/director/themes (Priority 2)
 */
export async function getRelatedClips(
  currentClipId: string,
  movieTitle: string,
  limit: number = 8
): Promise<{ sameMovieClips: MovieClip[]; recommendedClips: MovieClip[] }> {
  const all = await getAllClips();
  const current = all.find((c) => c.id === currentClipId);
  const targetTitle = (movieTitle || current?.movieTitle || "").toLowerCase().trim();

  // Priority 1: Exact same movie clips
  const sameMovieClips = all.filter(
    (c) => c.id !== currentClipId && c.movieTitle.toLowerCase().trim() === targetTitle
  );

  // Priority 2: Same genre, director or shared tags
  const currentGenres = current ? current.genres.map((g) => g.toLowerCase()) : [];
  const currentDirector = current?.director?.toLowerCase();

  const recommendedClips = all
    .filter(
      (c) =>
        c.id !== currentClipId &&
        c.movieTitle.toLowerCase().trim() !== targetTitle
    )
    .map((c) => {
      let score = 0;
      // Genre match
      c.genres.forEach((g) => {
        if (currentGenres.includes(g.toLowerCase())) score += 3;
      });
      // Director match
      if (currentDirector && c.director?.toLowerCase() === currentDirector) {
        score += 5;
      }
      // Views weight
      score += Math.min(2, c.views / 5000000);
      return { clip: c, score };
    })
    .sort((a, b) => b.score - a.score)
    .map((item) => item.clip)
    .slice(0, limit);

  return {
    sameMovieClips,
    recommendedClips
  };
}

export async function saveClipsToFile(clips: MovieClip[]): Promise<void> {
  clipsCache = clips;
  await fs.mkdir(DATA_DIR, { recursive: true });
  await fs.writeFile(CLIPS_FILE, JSON.stringify(clips, null, 2), "utf-8");
}

export async function addClips(newClips: MovieClip[]): Promise<MovieClip[]> {
  const current = await getAllClips();
  // Avoid duplicates by videoUrl or id
  const existingUrls = new Set(current.map((c) => c.videoUrl));
  const toAdd: MovieClip[] = [];

  for (const nc of newClips) {
    if (!existingUrls.has(nc.videoUrl)) {
      toAdd.push(nc);
      existingUrls.add(nc.videoUrl);
    }
  }

  const updated = [...toAdd, ...current];
  await saveClipsToFile(updated);
  return updated;
}

export async function deleteClip(clipId: string): Promise<MovieClip[]> {
  const current = await getAllClips();
  const updated = current.filter((c) => c.id !== clipId);
  await saveClipsToFile(updated);
  return updated;
}

export async function resetClipsToDefault(): Promise<MovieClip[]> {
  await saveClipsToFile(INITIAL_CLIPS);
  return INITIAL_CLIPS;
}
