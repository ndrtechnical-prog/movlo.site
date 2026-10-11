import React, { useState } from "react";
import {
  Calendar,
  Film,
  Sparkles,
  Play,
  Share2,
  Clock,
  CheckCircle2,
  Bookmark,
  ChevronDown,
  ChevronUp,
  Search,
  ArrowRight,
  TrendingUp,
  Flame,
  Award
} from "lucide-react";

export interface UpcomingMovieArticleEntry {
  title: string;
  hindiTitle?: string;
  expectedRelease: string;
  genre: string;
  director: string;
  starring: string;
  industry: "Bollywood & Pan-India" | "Turkish Historical" | "Hollywood" | "Chinese Xianxia";
  hypeScore: string;
  summary: string;
  whyPeopleSearch: string;
  primaryKeywords: string[];
  bannerUrl: string;
}

export const UPCOMING_MOVIES_EDITORIAL: UpcomingMovieArticleEntry[] = [
  {
    title: "Pushpa 2: The Rule",
    hindiTitle: "पुष्पा 2: द रूल",
    expectedRelease: "Dec 2024 – Global 2026 Extended Cuts",
    genre: "Action / Crime / Mass Drama",
    director: "Sukumar",
    starring: "Allu Arjun, Rashmika Mandanna, Fahadh Faasil",
    industry: "Bollywood & Pan-India",
    hypeScore: "9.9/10 (Highest Anticipation)",
    summary:
      "The cinematic rivalry between Pushpa Raj and SP Bhanwar Singh Shekhawat escalates into international syndicate territories. Expect record-shattering action set pieces, signature dance anthems, and unparalleled intensity.",
    whyPeopleSearch:
      "Millions query Google for 'Pushpa 2 full movie Hindi dubbed', 'where to watch Pushpa 2', and 'Pushpa 2 trailer release date' following the massive pan-India cult appeal of part one.",
    primaryKeywords: ["Pushpa 2 Hindi", "Pushpa The Rule", "Allu Arjun upcoming movie", "Pushpa 2 trailer"],
    bannerUrl: "https://images.unsplash.com/photo-1536440136628-849c177e76a1?w=800&auto=format&fit=crop&q=80"
  },
  {
    title: "Kalki 2898 AD: Part 2",
    hindiTitle: "कल्कि 2898 एडी पार्ट 2",
    expectedRelease: "Mid 2026",
    genre: "Mythological Sci-Fi / Epic Fantasy",
    director: "Nag Ashwin",
    starring: "Prabhas, Amitabh Bachchan, Kamal Haasan, Deepika Padukone",
    industry: "Bollywood & Pan-India",
    hypeScore: "9.8/10 (Global Phenomenon)",
    summary:
      "Connecting the final days of the Mahabharata with the dystopian year 2898 AD. Ashwatthama and Bhairava enter the final showdown against Supreme Yaskin as the arrival of Kalki approaches.",
    whyPeopleSearch:
      "People search on Gemini and Google for 'Kalki 2 release date', 'Kamal Haasan Yaskin form', and 'Mahabharata connections in Kalki 2898 AD'.",
    primaryKeywords: ["Kalki 2898 AD sequel", "Kalki part 2 release date", "Prabhas upcoming movies 2026", "Yaskin trailer"],
    bannerUrl: "https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=800&auto=format&fit=crop&q=80"
  },
  {
    title: "Kurulus Osman: New Seasons & Sagas (Urdu/Hindi Dubbed)",
    hindiTitle: "कुरुलुश उस्मान नया सीज़न",
    expectedRelease: "Ongoing Weekly Seasons (2026–2027)",
    genre: "Historical Warfare / Ottoman Empire Saga",
    director: "Metin Günay / Bozdağ Film",
    starring: "Burak Özçivit, Yıldız Çağrı Atiksoy, Özge Törer",
    industry: "Turkish Historical",
    hypeScore: "9.7/10 (#1 Dubbed Series in South Asia)",
    summary:
      "Osman Bey marches closer toward the foundation of the sovereign Ottoman state, repelling Byzantine alliances and internal conspiracies. Every battlefield encounter is packed with tactical strategy and profound valor.",
    whyPeopleSearch:
      "Google and YouTube record record-breaking searches for 'Kurulus Osman Urdu dubbed all episodes', 'Osman season 6 episode 1 Urdu', and 'Hazrat Yousuf drama Urdu hd'.",
    primaryKeywords: ["Kurulus Osman Urdu", "Turkish dramas Urdu dubbed", "Ertugrul Ghazi series", "Hazrat Yousuf episode"],
    bannerUrl: "https://images.unsplash.com/photo-1518676590629-3dcbd9c5a5c9?w=800&auto=format&fit=crop&q=80"
  },
  {
    title: "Salaar: Part 2 – Shouryaanga Parvam",
    hindiTitle: "सलार 2: शौर्यांग पर्वम",
    expectedRelease: "Late 2026",
    genre: "High-Octane Action / Dark Mafia Thriller",
    director: "Prashanth Neel",
    starring: "Prabhas, Prithviraj Sukumaran, Shruti Haasan",
    industry: "Bollywood & Pan-India",
    hypeScore: "9.6/10 (Blockbuster Sequel)",
    summary:
      "The blood feud inside the walled republic of Khansaar turns into an all-out civil war between Deva and Varadha. Directed by Prashanth Neel with jaw-dropping scale and gritty industrial cinematography.",
    whyPeopleSearch:
      "Popular on Google and ChatGPT queries for 'Salaar 2 Shouryaanga Parvam trailer' and 'KGF and Salaar cinematic universe connection'.",
    primaryKeywords: ["Salaar 2 release date", "Prabhas Salaar 2", "Prashanth Neel universe", "Salaar Part 2 Hindi"],
    bannerUrl: "https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?w=800&auto=format&fit=crop&q=80"
  },
  {
    title: "Avatar: Fire and Ash (Avatar 3)",
    hindiTitle: "अवतार 3: फायर एंड ऐश",
    expectedRelease: "December 2025 – 2026 IMAX Run",
    genre: "Sci-Fi / Adventure / Visual Epic",
    director: "James Cameron",
    starring: "Sam Worthington, Zoe Saldaña, Sigourney Weaver",
    industry: "Hollywood",
    hypeScore: "9.8/10 (Global Box Office Giant)",
    summary:
      "James Cameron introduces the 'Ash People', an aggressive fire-based Na'vi tribe exploring darker moral dimensions of Pandora with revolutionary underwater and volcanic CGI visuals.",
    whyPeopleSearch:
      "Trending globally on Google, MovieBox, and Netflix blogs under 'Avatar 3 trailer', 'Avatar Fire and Ash release date', and 'James Cameron next film'.",
    primaryKeywords: ["Avatar 3 trailer", "Avatar Fire and Ash", "James Cameron 2026", "Avatar 3 release date"],
    bannerUrl: "https://images.unsplash.com/photo-1517604931442-7e0c8ed2963c?w=800&auto=format&fit=crop&q=80"
  },
  {
    title: "War 2 (YRF Spy Universe)",
    hindiTitle: "वॉर 2 (वाईआरएफ स्पाई यूनिवर्स)",
    expectedRelease: "August 2025 – 2026 Stream",
    genre: "Action Thriller / Espionage",
    director: "Ayan Mukerji",
    starring: "Hrithik Roshan, Jr. NTR, Kiara Advani",
    industry: "Bollywood & Pan-India",
    hypeScore: "9.5/10 (Pan-India Spy War)",
    summary:
      "Major Kabir Dhaliwal confronts a ferocious global mercenary played by Jr. NTR in the highest-budgeted chapter of the Aditya Chopra Spy Universe yet.",
    whyPeopleSearch:
      "Massive searches on Google and Gemini for 'War 2 Hrithik vs Jr NTR', 'War 2 trailer release', and 'Spy Universe movies list'.",
    primaryKeywords: ["War 2 Hindi movie", "Hrithik Roshan Jr NTR", "Spy universe upcoming", "War 2 release date"],
    bannerUrl: "https://images.unsplash.com/photo-1534447677768-be436bb09401?w=800&auto=format&fit=crop&q=80"
  }
];

interface UpcomingMoviesArticleProps {
  onSearchMovie?: (movieTitle: string) => void;
}

export const UpcomingMoviesArticle: React.FC<UpcomingMoviesArticleProps> = ({ onSearchMovie }) => {
  const [selectedIndustry, setSelectedIndustry] = useState<string>("All");
  const [expandedMovie, setExpandedMovie] = useState<string | null>("Pushpa 2: The Rule");
  const [copiedShare, setCopiedShare] = useState(false);

  const industries = ["All", "Bollywood & Pan-India", "Turkish Historical", "Hollywood"];

  const filteredMovies = selectedIndustry === "All"
    ? UPCOMING_MOVIES_EDITORIAL
    : UPCOMING_MOVIES_EDITORIAL.filter((m) => m.industry === selectedIndustry);

  const handleSearchClick = (title: string) => {
    if (onSearchMovie) {
      onSearchMovie(title);
    } else {
      if (typeof window !== "undefined") {
        window.dispatchEvent(new CustomEvent("movlo_search_keyword", { detail: title }));
        const searchInput = document.getElementById("hero-global-search") as HTMLInputElement;
        if (searchInput) {
          searchInput.value = title;
          searchInput.focus();
        }
        const heroEl = document.getElementById("hero-section") || document.getElementById("recent-added");
        if (heroEl) {
          heroEl.scrollIntoView({ behavior: "smooth" });
        }
      }
    }
  };

  const handleShare = () => {
    if (typeof navigator !== "undefined" && navigator.clipboard) {
      navigator.clipboard.writeText("https://movlo.site/#upcoming-movies");
      setCopiedShare(true);
      setTimeout(() => setCopiedShare(false), 2000);
    }
  };

  return (
    <article
      id="upcoming-movies-article"
      className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-16 relative"
      aria-labelledby="upcoming-article-heading"
    >
      {/* Editorial Header / SEO Article Container */}
      <header className="mb-8 sm:mb-12 border-b border-white/10 pb-8">
        <div className="flex flex-wrap items-center gap-2 mb-3">
          <span className="px-3 py-1 rounded-full bg-amber-500/15 border border-amber-500/30 text-amber-300 text-xs font-bold uppercase tracking-wider flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            <span>SEO Cinema Article & Release Calendar</span>
          </span>
          <span className="text-gray-400 text-xs flex items-center gap-1 font-medium">
            <Clock className="w-3 h-3" />
            <span>Updated for 2026–2027 • 8 Min Deep Read</span>
          </span>
          <span className="text-emerald-400 text-xs font-semibold flex items-center gap-1 ml-auto">
            <TrendingUp className="w-3.5 h-3.5" />
            <span>High Google Search Intent</span>
          </span>
        </div>

        <h1
          id="upcoming-article-heading"
          className="text-2xl sm:text-4xl lg:text-5xl font-black text-white tracking-tight font-['Syne',sans-serif] leading-tight"
        >
          Upcoming Movies & Blockbusters (2026–2027): Complete Streaming & Theatrical Guide
        </h1>

        <p className="text-sm sm:text-base text-gray-300 mt-4 leading-relaxed max-w-4xl">
          From colossal Pan-Indian mass spectacles like <strong>Pushpa 2: The Rule</strong> and <strong>Kalki 2898 AD Part 2</strong> to internationally acclaimed Turkish historical masterworks like <strong>Kurulus Osman (Urdu Dubbed)</strong> and Hollywood titans like <strong>Avatar: Fire and Ash</strong> — here is the authoritative release calendar, box office analysis, and where you can stream trailers and full movies on Movlo.site.
        </p>

        {/* Action bar */}
        <div className="flex flex-wrap items-center justify-between gap-4 mt-6 pt-4 border-t border-white/5">
          <div className="flex items-center gap-2 overflow-x-auto no-scrollbar">
            {industries.map((ind) => (
              <button
                key={ind}
                onClick={() => setSelectedIndustry(ind)}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
                  selectedIndustry === ind
                    ? "bg-amber-500 text-black shadow-md shadow-amber-500/20 font-black"
                    : "bg-white/5 hover:bg-white/10 text-gray-300 border border-white/10"
                }`}
              >
                {ind}
              </button>
            ))}
          </div>

          <button
            onClick={handleShare}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 text-xs text-neutral-300 hover:text-white transition-all cursor-pointer"
            title="Share this SEO article link"
          >
            <Share2 className="w-3.5 h-3.5" />
            <span>{copiedShare ? "Link Copied!" : "Share Article"}</span>
          </button>
        </div>
      </header>

      {/* Featured Article Grid */}
      <div className="space-y-6 sm:space-y-8">
        {filteredMovies.map((movie, idx) => {
          const isExpanded = expandedMovie === movie.title;
          return (
            <section
              key={movie.title}
              className="rounded-2xl bg-white/[0.02] hover:bg-white/[0.04] border border-white/10 transition-all p-5 sm:p-7 backdrop-blur-md relative overflow-hidden"
            >
              <div className="flex flex-col lg:flex-row gap-6 items-start justify-between">
                {/* Content Left */}
                <div className="flex-1 space-y-3">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-md bg-amber-400/15 text-amber-300 border border-amber-400/25">
                      #{idx + 1} {movie.industry}
                    </span>
                    <span className="text-xs text-gray-400 font-semibold flex items-center gap-1">
                      <Calendar className="w-3.5 h-3.5 text-amber-400" />
                      <span>{movie.expectedRelease}</span>
                    </span>
                    <span className="text-xs text-emerald-400 font-bold ml-auto flex items-center gap-1">
                      <Flame className="w-3.5 h-3.5" />
                      <span>{movie.hypeScore}</span>
                    </span>
                  </div>

                  <div>
                    <h2 className="text-xl sm:text-2xl font-bold text-white flex items-center gap-2 flex-wrap">
                      <span>{movie.title}</span>
                      {movie.hindiTitle && (
                        <span className="text-sm sm:text-base font-normal text-amber-300/80">
                          ({movie.hindiTitle})
                        </span>
                      )}
                    </h2>
                    <p className="text-xs text-gray-400 mt-0.5">
                      <strong>Genre:</strong> {movie.genre} • <strong>Director:</strong> {movie.director} • <strong>Starring:</strong> {movie.starring}
                    </p>
                  </div>

                  <p className="text-xs sm:text-sm text-gray-300 leading-relaxed">
                    {movie.summary}
                  </p>

                  {/* Why Google Search Engine Users Query This */}
                  <div className="p-3.5 rounded-xl bg-amber-500/[0.07] border border-amber-500/20 text-xs text-amber-200/90 leading-relaxed">
                    <strong className="text-amber-300 font-bold block mb-1">
                      Why Fans Search This on Google & Gemini:
                    </strong>
                    {movie.whyPeopleSearch}
                  </div>

                  {/* High Search Keywords Cloud */}
                  <div className="flex flex-wrap items-center gap-1.5 pt-1">
                    <span className="text-[11px] text-gray-400 font-semibold">Target SEO Keywords:</span>
                    {movie.primaryKeywords.map((kw) => (
                      <button
                        key={kw}
                        onClick={() => handleSearchClick(kw)}
                        className="text-[10px] font-medium px-2 py-0.5 rounded bg-white/5 hover:bg-amber-400/20 text-gray-300 hover:text-amber-300 border border-white/10 transition-colors cursor-pointer"
                      >
                        #{kw}
                      </button>
                    ))}
                  </div>

                  {/* Interactive Action Buttons */}
                  <div className="flex flex-wrap items-center gap-3 pt-2">
                    <button
                      onClick={() => handleSearchClick(movie.title)}
                      className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-black text-xs font-black shadow-md shadow-amber-500/20 transition-all cursor-pointer hover:scale-105 active:scale-95"
                    >
                      <Search className="w-3.5 h-3.5 stroke-[2.5]" />
                      <span>Search & Watch on Movlo</span>
                    </button>
                  </div>
                </div>
              </div>
            </section>
          );
        })}
      </div>

      {/* SEO Key Takeaways Box for Googlebot Crawling */}
      <footer className="mt-10 p-6 rounded-2xl bg-gradient-to-r from-neutral-900 to-[#0a0a0e] border border-white/10 space-y-3">
        <h3 className="text-base sm:text-lg font-bold text-white flex items-center gap-2">
          <Award className="w-4 h-4 text-amber-400" />
          <span>SEO Key Insights: Why Movlo.site Is The Ultimate Hub for Upcoming Cinema</span>
        </h3>
        <p className="text-xs text-gray-400 leading-relaxed">
          Google Search Console and entertainment trends indicate a massive surge in demand for free, instant-playback movie platforms with zero subscription walls. Movlo.site bridges this gap by indexing official high-definition cinema trailers, curated YouTube series playlists (including Turkish dramas in Urdu and Indian blockbusters), and providing daily 24-hour shuffling so cinema lovers never miss an upcoming theatrical or OTT premiere.
        </p>
      </footer>
    </article>
  );
};
