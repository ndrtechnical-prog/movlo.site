export interface UpcomingMovie {
  id: number;
  title: string;
  year: number;
  releaseDate: string;
  rating: number; // user rating out of 10
  criticScore?: number;
  userRating?: number;
  genres: string[];
  poster: string;
  backdrop: string;
  description: string;
  trailerUrl: string; // YouTube embed or MP4 trailer
  cast?: string[];
  director?: string;
  status: "In Production" | "Post-Production" | "Upcoming Premiere";
}

export const UPCOMING_MOVIES_LIST: UpcomingMovie[] = [
  {
    id: 5001,
    title: "Avatar: Fire and Ash",
    year: 2025,
    releaseDate: "December 19, 2025",
    rating: 8.9,
    criticScore: 91,
    userRating: 8.9,
    genres: ["Sci-Fi", "Adventure", "Action", "Fantasy"],
    poster: "https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=800&auto=format&fit=crop&q=80",
    backdrop: "https://images.unsplash.com/photo-1509198397868-475647b2a1e5?w=1920&auto=format&fit=crop&q=85",
    description: "The Sully family faces a fierce volcanic clan of Na'vi known as the Ash People on Pandora, testing loyalty and planetary survival in James Cameron's visionary saga.",
    trailerUrl: "https://www.youtube.com/embed/d9MyW72ELq0",
    director: "James Cameron",
    cast: ["Sam Worthington", "Zoe Saldaña", "Sigourney Weaver"],
    status: "Upcoming Premiere"
  },
  {
    id: 5002,
    title: "The Batman: Part II",
    year: 2026,
    releaseDate: "October 2, 2026",
    rating: 8.8,
    criticScore: 92,
    userRating: 8.8,
    genres: ["Action", "Crime", "Mystery", "Drama"],
    poster: "https://images.unsplash.com/photo-1509281373149-e957c6296406?w=800&auto=format&fit=crop&q=80",
    backdrop: "https://images.unsplash.com/photo-1514565131-fce0801e5785?w=1920&auto=format&fit=crop&q=85",
    description: "Robert Pattinson returns as the Dark Knight navigating a flooded, politically shattered Gotham City as unseen underworld forces emerge from the shadows.",
    trailerUrl: "https://www.youtube.com/embed/mqqft2x_Aa4",
    director: "Matt Reeves",
    cast: ["Robert Pattinson", "Andy Serkis", "Colin Farrell"],
    status: "In Production"
  },
  {
    id: 5003,
    title: "Avengers: Doomsday",
    year: 2026,
    releaseDate: "May 1, 2026",
    rating: 9.1,
    criticScore: 94,
    userRating: 9.1,
    genres: ["Action", "Sci-Fi", "Adventure", "Fantasy"],
    poster: "https://images.unsplash.com/photo-1635805737707-575885ab0820?w=800&auto=format&fit=crop&q=80",
    backdrop: "https://images.unsplash.com/photo-1578632767115-351597cf2477?w=1920&auto=format&fit=crop&q=85",
    description: "Robert Downey Jr. makes his seismic return to the Marvel Cinematic Universe as Victor Von Doom, threatening the collapse of all reality across the Multiverse.",
    trailerUrl: "https://www.youtube.com/embed/6ZfuNTqbHE8",
    director: "Anthony & Joe Russo",
    cast: ["Robert Downey Jr.", "Pedro Pascal", "Florence Pugh"],
    status: "In Production"
  },
  {
    id: 5004,
    title: "Spider-Man: Beyond the Spider-Verse",
    year: 2026,
    releaseDate: "June 2026",
    rating: 9.0,
    criticScore: 96,
    userRating: 9.0,
    genres: ["Animation", "Action", "Adventure", "Sci-Fi"],
    poster: "https://images.unsplash.com/photo-1607604276583-eef5d076aa5f?w=800&auto=format&fit=crop&q=80",
    backdrop: "https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=1920&auto=format&fit=crop&q=85",
    description: "Miles Morales must navigate Earth-42 while his multiversal allies race across dimensions to rescue him from the menacing Spot and impending multiversal collapse.",
    trailerUrl: "https://www.youtube.com/embed/cqGjhVJWtEg",
    director: "Joaquim Dos Santos, Kemp Powers",
    cast: ["Shameik Moore", "Hailee Steinfeld", "Daniel Kaluuya"],
    status: "Post-Production"
  },
  {
    id: 5005,
    title: "Dune: Messiah",
    year: 2026,
    releaseDate: "December 2026",
    rating: 8.9,
    criticScore: 93,
    userRating: 8.9,
    genres: ["Sci-Fi", "Adventure", "Drama"],
    poster: "https://images.unsplash.com/photo-1534447677768-be436bb09401?w=800&auto=format&fit=crop&q=80",
    backdrop: "https://images.unsplash.com/photo-1506703719100-a0f3a48c0f86?w=1920&auto=format&fit=crop&q=85",
    description: "Denis Villeneuve concludes the epic Arrakis saga as Emperor Paul Atreides grapples with the catastrophic holy war carried out in his name across a trillion worlds.",
    trailerUrl: "https://www.youtube.com/embed/Way9Dexny3w",
    director: "Denis Villeneuve",
    cast: ["Timothée Chalamet", "Zendaya", "Florence Pugh", "Anya Taylor-Joy"],
    status: "In Production"
  }
];

export async function getUpcomingTrailers(): Promise<UpcomingMovie[]> {
  // Returns exactly 5 upcoming movies with ratings
  return UPCOMING_MOVIES_LIST.slice(0, 5);
}
