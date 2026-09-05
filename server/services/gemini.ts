import { GoogleGenAI, Type } from "@google/genai";
import { MovieClip } from "./clips.js";

let aiInstance: GoogleGenAI | null = null;

function getAiClient(): GoogleGenAI | null {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey || apiKey === "your_gemini_api_key_here") {
    return null;
  }
  if (!aiInstance) {
    aiInstance = new GoogleGenAI({
      apiKey,
      httpOptions: {
        headers: {
          "User-Agent": "aistudio-build"
        }
      }
    });
  }
  return aiInstance;
}

// Extract YouTube ID if present
export function extractYouTubeId(url: string): string | null {
  if (!url) return null;
  const regExp = /(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?v=|watch\?.+&v=))([\w-]{11})/;
  const match = url.match(regExp);
  return match ? match[1] : null;
}

// Convert video URL to embeddable player link
export function normalizeVideoUrl(rawUrl: string): { embedUrl: string; youtubeId: string | null } {
  const ytId = extractYouTubeId(rawUrl);
  if (ytId) {
    return {
      embedUrl: `https://www.youtube.com/embed/${ytId}`,
      youtubeId: ytId
    };
  }
  return {
    embedUrl: rawUrl.trim(),
    youtubeId: null
  };
}

// High quality curated posters by genre
const CURATED_POSTERS: Record<string, { poster: string; backdrop: string }> = {
  "sci-fi": {
    poster: "https://images.unsplash.com/photo-1534447677768-be436bb09401?w=800&auto=format&fit=crop&q=80",
    backdrop: "https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=1920&auto=format&fit=crop&q=80"
  },
  action: {
    poster: "https://images.unsplash.com/photo-1509281373149-e957c6296406?w=800&auto=format&fit=crop&q=80",
    backdrop: "https://images.unsplash.com/photo-1514565131-fce0801e5785?w=1920&auto=format&fit=crop&q=80"
  },
  drama: {
    poster: "https://images.unsplash.com/photo-1440404653325-ab127d49abc1?w=800&auto=format&fit=crop&q=80",
    backdrop: "https://images.unsplash.com/photo-1536440136628-849c177e76a1?w=1920&auto=format&fit=crop&q=80"
  },
  crime: {
    poster: "https://images.unsplash.com/photo-1579783902614-a3fb3927b675?w=800&auto=format&fit=crop&q=80",
    backdrop: "https://images.unsplash.com/photo-1513151233558-d860c5398176?w=1920&auto=format&fit=crop&q=80"
  },
  default: {
    poster: "https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=800&auto=format&fit=crop&q=80",
    backdrop: "https://images.unsplash.com/photo-1506703719100-a0f3a48c0f86?w=1920&auto=format&fit=crop&q=80"
  }
};

export interface AiParsedClipResult {
  movieTitle: string;
  clipTitle: string;
  year: number;
  genre: string;
  genres: string[];
  director: string;
  actors: string[];
  description: string;
  duration: string;
  quality: "4K UHD" | "1080p HD" | "720p HD";
  tags: string[];
  seoTitle: string;
  seoDescription: string;
  seoKeywords: string[];
}

/**
 * Intelligent AI Processor that parses any video link or movie query,
 * deducing full movie metadata, poster artwork, and search-engine optimized SEO.
 */
export async function analyzeAndGenerateClipMetadata(
  linkOrQuery: string
): Promise<MovieClip> {
  const { embedUrl, youtubeId } = normalizeVideoUrl(linkOrQuery);
  const ai = getAiClient();

  let parsed: AiParsedClipResult | null = null;

  if (ai) {
    const candidateModels = ["gemini-3.1-flash-lite", "gemini-3.8-flash", "gemini-flash-latest"];
    const prompt = `Analyze this movie clip or video link: "${linkOrQuery}".
Extract or deduce the exact movie name, specific scene title/clip description, release year, director, actors, genre, detailed 2-sentence scene summary, duration, search tags, and Google SEO metadata.
If the link contains a specific movie (e.g. Interstellar, The Dark Knight, Titanic, Pulp Fiction, Avatar, Dune, Gladiator, Fight Club, etc.), accurately identify the film. If vague, pick a plausible iconic cinematic movie title that fits best.`;

    const schemaConfig = {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          movieTitle: { type: Type.STRING, description: "Official movie title" },
          clipTitle: { type: Type.STRING, description: "Iconic scene or clip title" },
          year: { type: Type.INTEGER, description: "Release year" },
          genre: { type: Type.STRING, description: "Primary genre (e.g. Action, Sci-Fi)" },
          genres: {
            type: Type.ARRAY,
            items: { type: Type.STRING },
            description: "List of 3 relevant genres"
          },
          director: { type: Type.STRING, description: "Movie Director name" },
          actors: {
            type: Type.ARRAY,
            items: { type: Type.STRING },
            description: "Main actors in this scene"
          },
          description: { type: Type.STRING, description: "Compelling 2-sentence scene summary" },
          duration: { type: Type.STRING, description: "Duration format like 3:45" },
          quality: { type: Type.STRING, description: "4K UHD or 1080p HD" },
          tags: {
            type: Type.ARRAY,
            items: { type: Type.STRING },
            description: "Relevant search keywords"
          },
          seoTitle: { type: Type.STRING, description: "Google SEO Title under 60 chars" },
          seoDescription: { type: Type.STRING, description: "Meta description under 160 chars" },
          seoKeywords: {
            type: Type.ARRAY,
            items: { type: Type.STRING },
            description: "Top 5 search ranking keywords"
          }
        },
        required: [
          "movieTitle",
          "clipTitle",
          "year",
          "genre",
          "genres",
          "description",
          "duration",
          "tags",
          "seoTitle",
          "seoDescription",
          "seoKeywords"
        ]
      }
    };

    for (const model of candidateModels) {
      try {
        const response = await ai.models.generateContent({
          model,
          contents: prompt,
          config: schemaConfig
        });

        const text = response.text;
        if (text) {
          parsed = JSON.parse(text) as AiParsedClipResult;
          if (parsed && parsed.movieTitle) {
            break;
          }
        }
      } catch (err: any) {
        // Graceful model failover without logging loud raw error objects
        continue;
      }
    }
  }

  // Smart heuristic fallback if AI is unavailable or offline
  if (!parsed) {
    parsed = generateHeuristicClipMetadata(linkOrQuery, youtubeId);
  }

  // Artwork generation
  const genreKey = (parsed.genre || "action").toLowerCase();
  const artwork = CURATED_POSTERS[genreKey] || CURATED_POSTERS.default;

  // If YouTube, prioritize maximum resolution YouTube thumbnail
  const ytThumb = youtubeId ? `https://img.youtube.com/vi/${youtubeId}/hqdefault.jpg` : null;
  const thumbnail = ytThumb || artwork.backdrop;

  const clipId = `clip-${Date.now()}-${Math.floor(Math.random() * 10000)}`;

  const movieClip: MovieClip = {
    id: clipId,
    movieTitle: parsed.movieTitle || "Cinematic Masterpiece",
    clipTitle: parsed.clipTitle || "Iconic Film Scene",
    videoUrl: embedUrl,
    thumbnail,
    poster: artwork.poster,
    backdrop: artwork.backdrop,
    duration: parsed.duration || "4:15",
    year: parsed.year || new Date().getFullYear(),
    genre: parsed.genre || "Action",
    genres: parsed.genres && parsed.genres.length > 0 ? parsed.genres : [parsed.genre || "Action", "Drama"],
    director: parsed.director || "Cinema Master",
    actors: parsed.actors && parsed.actors.length > 0 ? parsed.actors : ["Lead Actor"],
    description: parsed.description || "An iconic, masterfully directed cinema sequence featuring unforgettable performances and stunning visuals.",
    views: Math.floor(Math.random() * 3000000) + 500000,
    likes: Math.floor(Math.random() * 200000) + 15000,
    rating: Number((Math.random() * 1.5 + 8.4).toFixed(1)),
    quality: (parsed.quality as any) || "4K UHD",
    isTrending: true,
    isMostWatched: Math.random() > 0.4,
    publishedAt: new Date().toISOString(),
    tags: parsed.tags || ["movie", "cinema", "clip", "hd", "scene"],
    seo: {
      title: parsed.seoTitle || `${parsed.movieTitle} - ${parsed.clipTitle} (4K Clip)`,
      description: parsed.seoDescription || `Watch ${parsed.clipTitle} from ${parsed.movieTitle} in HD.`,
      keywords: parsed.seoKeywords || [parsed.movieTitle, parsed.clipTitle, "movie clip", "stream online"]
    }
  };

  return movieClip;
}

// Fallback rule engine when offline
function generateHeuristicClipMetadata(input: string, ytId: string | null): AiParsedClipResult {
  const clean = decodeURIComponent(input).replace(/[_-]+/g, " ");
  let guessedTitle = "Iconic Cinema Scene";
  let guessedMovie = "Featured Motion Picture";
  let genre = "Action";

  // Common titles detection
  if (/interstellar/i.test(clean)) {
    guessedMovie = "Interstellar";
    guessedTitle = "Endurance Space Odyssey Sequence";
    genre = "Sci-Fi";
  } else if (/batman|dark knight|joker/i.test(clean)) {
    guessedMovie = "The Dark Knight";
    guessedTitle = "Gotham City Confrontation Scene";
    genre = "Action";
  } else if (/inception/i.test(clean)) {
    guessedMovie = "Inception";
    guessedTitle = "Subconscious Mind Dream Heist Scene";
    genre = "Sci-Fi";
  } else if (/dune/i.test(clean)) {
    guessedMovie = "Dune";
    guessedTitle = "Arrakis Desert Prophecy Sequence";
    genre = "Sci-Fi";
  } else if (/oppenheimer/i.test(clean)) {
    guessedMovie = "Oppenheimer";
    guessedTitle = "Los Alamos Secret Laboratory Scene";
    genre = "Drama";
  } else if (/matrix/i.test(clean)) {
    guessedMovie = "The Matrix";
    guessedTitle = "Bullet Time Reality Simulation Scene";
    genre = "Sci-Fi";
  } else if (/gladiator/i.test(clean)) {
    guessedMovie = "Gladiator";
    guessedTitle = "Roman Colosseum Battle Scene";
    genre = "Action";
  } else if (ytId) {
    guessedMovie = "Hollywood Masterpiece";
    guessedTitle = `Iconic Movie Scene #${ytId.slice(0, 4).toUpperCase()}`;
  }

  return {
    movieTitle: guessedMovie,
    clipTitle: guessedTitle,
    year: 2023,
    genre,
    genres: [genre, "Drama", "Thriller"],
    director: "Visionary Director",
    actors: ["Celebrated Cast"],
    description: `Experience the breathtaking ${guessedTitle} from ${guessedMovie}, celebrated for its stunning cinematography and gripping tension.`,
    duration: "3:50",
    quality: "4K UHD",
    tags: [guessedMovie.toLowerCase(), "cinema clip", "4k", "scene highlight", genre.toLowerCase()],
    seoTitle: `${guessedMovie} - ${guessedTitle} 4K UHD Clip`,
    seoDescription: `Watch the full scene ${guessedTitle} from ${guessedMovie}. High-definition cinema streaming.`,
    seoKeywords: [guessedMovie, guessedTitle, "movie clip", "watch online", "cinema"]
  };
}
