export interface WatchmodeListTitle {
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
}

export interface WatchmodeTitleDetails {
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
  tmdb_type?: string;
}

export interface WatchmodeRawSource {
  source_id: number;
  name: string;
  type: string; // 'sub', 'rent', 'buy', 'free', 'tve'
  region: string;
  ios_url?: string;
  android_url?: string;
  web_url?: string;
  format?: string;
  price?: number | string | null;
  seasons?: number;
  episodes?: number;
}

export interface WatchmodeRawGenre {
  id: number;
  name: string;
  tmdb_id?: number;
}

export interface WatchmodeRawSearchResult {
  id: number;
  name: string;
  type: string;
  year?: number;
  result_type?: string;
  imdb_id?: string;
  tmdb_id?: number;
  tmdb_type?: string;
  image_url?: string;
}

// Normalized MOVLO App Models
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
  liveViewers?: number;
  liveStatus?: string;
  isWatchingNow?: boolean;
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
  videoUrl: string;
  thumbnail: string;
  poster: string;
  backdrop: string;
  duration: string;
  year: number;
  genre: string;
  genres: string[];
  director?: string;
  actors?: string[];
  description: string;
  views: number;
  likes: number;
  rating: number;
  quality: "4K UHD" | "1080p HD" | "720p HD";
  isTrending: boolean;
  isMostWatched: boolean;
  publishedAt: string;
  tags: string[];
  seo: ClipSEO;
}

export interface RelatedClipsResponse {
  sameMovieClips: MovieClip[];
  recommendedClips: MovieClip[];
}

export interface UnifiedSearchResponse {
  success: boolean;
  movies: SearchResultItem[];
  clips: MovieClip[];
}

export interface ApiResponse<T> {
  success: boolean;
  data: T;
  source?: 'live' | 'cache' | 'fallback';
  message?: string;
  total?: number;
  page?: number;
}

export interface AdBanner {
  id: string;
  title: string;
  posterUrl: string;
  targetUrl: string;
  tag?: string;
  active: boolean;
  clicks: number;
  createdAt: string;
}

export interface UpcomingMovie {
  id: number;
  title: string;
  year: number;
  releaseDate: string;
  rating: number;
  userRating?: number;
  genres: string[];
  poster: string;
  backdrop: string;
  description: string;
  trailerUrl: string;
}
