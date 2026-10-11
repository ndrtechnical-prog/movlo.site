import React, { useState } from "react";
import {
  TrendingUp,
  Search,
  Sparkles,
  Flame,
  Tv,
  Bot,
  ExternalLink,
  Compass,
  ArrowRight
} from "lucide-react";

export interface KeywordItem {
  id: string;
  query: string;
  source: "google" | "gemini" | "netflix" | "moviebox" | "ai" | "turkish";
  category: "all" | "trending" | "netflix" | "ai" | "turkish" | "bollywood";
  volume: string;
  tag: string;
  description: string;
}

export const TRENDING_KEYWORDS_DATA: KeywordItem[] = [
  // Trending on Google & Gemini
  {
    id: "kw-1",
    query: "Pushpa 2 The Rule Full Movie Hindi",
    source: "google",
    category: "bollywood",
    volume: "2.4M Searches",
    tag: "Pan-India Blockbuster",
    description: "High search volume on Google Search & Gemini for Allu Arjun's mass action spectacle."
  },
  {
    id: "kw-2",
    query: "Kurulus Osman Season 6 Urdu Dubbed",
    source: "turkish",
    category: "turkish",
    volume: "1.8M Searches",
    tag: "Turkish Historical",
    description: "Most searched Turkish drama query across Pakistan, India, Bangladesh and GCC."
  },
  {
    id: "kw-3",
    query: "Kalki 2898 AD Part 2 Release Date & Trailer",
    source: "gemini",
    category: "bollywood",
    volume: "1.1M Searches",
    tag: "Sci-Fi Mythological",
    description: "Top queried futuristic Indian sci-fi movie sequel on Google & Gemini."
  },
  {
    id: "kw-4",
    query: "Hazrat Yousuf Drama All Episodes HD Urdu",
    source: "google",
    category: "turkish",
    volume: "950K Searches",
    tag: "Historical Islamic",
    description: "Evergreen top searched historical series with full Urdu dubbed episodes."
  },
  {
    id: "kw-5",
    query: "Salaar 2 Shouryaanga Parvam",
    source: "google",
    category: "bollywood",
    volume: "820K Searches",
    tag: "Action Thriller",
    description: "Prashanth Neel & Prabhas's anticipated gangster saga trending on Google."
  },

  // Trending on Netflix & MovieBox
  {
    id: "kw-6",
    query: "Top 10 Action Movies on Netflix Today",
    source: "netflix",
    category: "netflix",
    volume: "760K Searches",
    tag: "OTT Top 10",
    description: "Frequent search on MovieBox Pro and Netflix for high-octane Hollywood thrillers."
  },
  {
    id: "kw-7",
    query: "Best Turkish Dramas Dubbed in Hindi",
    source: "netflix",
    category: "turkish",
    volume: "690K Searches",
    tag: "Binge Watch",
    description: "Searched on Netflix, Loklok, and Google for emotional Turkish romantic dramas."
  },
  {
    id: "kw-8",
    query: "MovieBox Pro Alternative Free Streaming 2026",
    source: "moviebox",
    category: "trending",
    volume: "580K Searches",
    tag: "Free Stream",
    description: "Users looking for fast 1080p web alternatives with zero registration fees."
  },
  {
    id: "kw-9",
    query: "KGF Chapter 3 Official Update",
    source: "moviebox",
    category: "bollywood",
    volume: "890K Searches",
    tag: "Cult Hit",
    description: "Rocky Bhai fans querying release schedule and teaser drops."
  },
  {
    id: "kw-10",
    query: "South Indian Hindi Dubbed Mass Action Movies",
    source: "google",
    category: "bollywood",
    volume: "1.5M Searches",
    tag: "1080p Cinema",
    description: "Consistent #1 entertainment query on YouTube and Google India."
  },

  // AI Prompts (ChatGPT & Gemini Picks)
  {
    id: "kw-11",
    query: "Suggest Movies Like KGF and Salaar with High Action",
    source: "ai",
    category: "ai",
    volume: "430K AI Queries",
    tag: "AI Curated",
    description: "Frequently asked movie recommendation prompt on ChatGPT and Gemini."
  },
  {
    id: "kw-12",
    query: "Best Historical Action Series Like Ertugrul Ghazi",
    source: "ai",
    category: "ai",
    volume: "390K AI Queries",
    tag: "Historical Saga",
    description: "Top AI prompt for fans of Ottoman and medieval sword warfare."
  },
  {
    id: "kw-13",
    query: "Chinese Fantasy Xianxia Dramas with English Subtitles",
    source: "ai",
    category: "ai",
    volume: "310K AI Queries",
    tag: "Martial Arts",
    description: "Global query trend for breathtaking Chinese Wuxia sword epics."
  },
  {
    id: "kw-14",
    query: "Watch Movies Online Free No Sign Up 1080p",
    source: "google",
    category: "trending",
    volume: "2.8M Searches",
    tag: "Instant Stream",
    description: "Core intent query of users searching for smooth, ad-light cinema hubs."
  },
  {
    id: "kw-15",
    query: "Ramo & Kuzgun Urdu Dubbed Full Series",
    source: "turkish",
    category: "turkish",
    volume: "480K Searches",
    tag: "Crime Drama",
    description: "Beloved Turkish mafia-romance drama series streaming on Movlo."
  }
];

interface TrendingKeywordsHubProps {
  onSelectQuery?: (query: string) => void;
}

export const TrendingKeywordsHub: React.FC<TrendingKeywordsHubProps> = ({ onSelectQuery }) => {
  const [activeTab, setActiveTab] = useState<"all" | "trending" | "netflix" | "ai" | "turkish" | "bollywood">("all");
  const [filterSearch, setFilterSearch] = useState("");
  const [copiedQuery, setCopiedQuery] = useState<string | null>(null);

  const filteredList = TRENDING_KEYWORDS_DATA.filter((item) => {
    const matchesTab = activeTab === "all" || item.category === activeTab;
    const matchesSearch =
      filterSearch === "" ||
      item.query.toLowerCase().includes(filterSearch.toLowerCase()) ||
      item.description.toLowerCase().includes(filterSearch.toLowerCase()) ||
      item.tag.toLowerCase().includes(filterSearch.toLowerCase());
    return matchesTab && matchesSearch;
  });

  const handleQueryClick = (query: string) => {
    // Notify or trigger onSelectQuery if provided
    if (onSelectQuery) {
      onSelectQuery(query);
    } else {
      // Dispatch global search event
      if (typeof window !== "undefined") {
        window.dispatchEvent(new CustomEvent("movlo_search_keyword", { detail: query }));
        const searchInput = document.getElementById("hero-global-search") as HTMLInputElement;
        if (searchInput) {
          searchInput.value = query;
          searchInput.focus();
        }
        const heroEl = document.getElementById("hero-section") || document.getElementById("recent-added");
        if (heroEl) {
          heroEl.scrollIntoView({ behavior: "smooth" });
        }
      }
    }

    setCopiedQuery(query);
    setTimeout(() => setCopiedQuery(null), 2500);
  };

  return (
    <section
      id="trending-keywords"
      className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 relative"
      aria-labelledby="trending-keywords-title"
    >
      {/* Background glow styling */}
      <div className="absolute top-1/2 left-1/4 -translate-y-1/2 w-96 h-96 bg-amber-500/5 rounded-full blur-3xl pointer-events-none -z-10" />
      <div className="absolute bottom-0 right-1/4 w-80 h-80 bg-orange-500/5 rounded-full blur-3xl pointer-events-none -z-10" />

      {/* Header Container */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 pb-6 border-b border-white/10">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/25 text-amber-300 text-xs font-semibold mb-2 shadow-sm">
            <Flame className="w-3.5 h-3.5 text-amber-400 animate-pulse" />
            <span>High Search Volume Index (2026–2027)</span>
          </div>
          <h2
            id="trending-keywords-title"
            className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight font-['Syne',sans-serif]"
          >
            Trending Queries Searched on <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-400 via-orange-400 to-amber-200">Google, ChatGPT, Gemini & Netflix</span>
          </h2>
          <p className="text-xs sm:text-sm text-gray-400 mt-1 max-w-3xl">
            Real-time movie and drama titles people query across search engines, AI assistants, MovieBox, and streaming platforms. Click any query to instantly search and stream on Movlo.
          </p>
        </div>

        {/* Quick filter search */}
        <div className="relative w-full md:w-72 shrink-0">
          <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Filter trending topics..."
            value={filterSearch}
            onChange={(e) => setFilterSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-2 rounded-xl bg-white/5 border border-white/10 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-amber-400/50 transition-all"
          />
        </div>
      </div>

      {/* Source Category Pills */}
      <div className="flex items-center gap-2 overflow-x-auto no-scrollbar py-4">
        {[
          { key: "all", label: "All Top Queries", icon: Sparkles },
          { key: "trending", label: "Google & Gemini Hits", icon: TrendingUp },
          { key: "bollywood", label: "Bollywood & South Cinema", icon: Flame },
          { key: "turkish", label: "Turkish & Historical Urdu", icon: Compass },
          { key: "netflix", label: "Netflix & MovieBox Favorites", icon: Tv },
          { key: "ai", label: "ChatGPT & AI Recommendations", icon: Bot }
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.key;
          return (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key as any)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
                isActive
                  ? "bg-gradient-to-r from-amber-500 to-orange-500 text-black shadow-md shadow-amber-500/20 font-bold"
                  : "bg-white/5 hover:bg-white/10 text-gray-300 border border-white/10"
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* Feedback Toast */}
      {copiedQuery && (
        <div className="mb-4 p-2.5 rounded-xl bg-amber-500/20 border border-amber-500/40 text-amber-300 text-xs font-medium flex items-center justify-between animate-in fade-in slide-in-from-top-1 duration-200">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-amber-400" />
            <span>Searching <strong>"{copiedQuery}"</strong> in Movlo library...</span>
          </div>
          <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded bg-amber-400/20 text-amber-200">
            Selected
          </span>
        </div>
      )}

      {/* Grid of Keywords */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 pt-2">
        {filteredList.map((item) => (
          <div
            key={item.id}
            onClick={() => handleQueryClick(item.query)}
            className="group relative p-3.5 sm:p-4 rounded-xl bg-white/[0.03] hover:bg-white/[0.07] border border-white/10 hover:border-amber-400/40 transition-all cursor-pointer flex flex-col justify-between gap-2.5 shadow-sm hover:shadow-lg hover:shadow-amber-500/5 backdrop-blur-sm"
          >
            <div>
              <div className="flex items-center justify-between gap-2 mb-1.5">
                <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded bg-amber-400/10 text-amber-300 border border-amber-400/20">
                  {item.tag}
                </span>
                <span className="text-[10px] font-semibold text-gray-400 flex items-center gap-1">
                  <TrendingUp className="w-3 h-3 text-emerald-400" />
                  {item.volume}
                </span>
              </div>
              <h3 className="text-sm font-bold text-white group-hover:text-amber-300 transition-colors line-clamp-2">
                "{item.query}"
              </h3>
              <p className="text-[11px] text-gray-400 mt-1 leading-relaxed">
                {item.description}
              </p>
            </div>

            <div className="flex items-center justify-between pt-2 border-t border-white/5 text-[11px] text-amber-400/90 font-medium group-hover:text-amber-300">
              <span className="flex items-center gap-1 text-[10px] text-gray-500">
                Source: <span className="capitalize text-gray-300">{item.source}</span>
              </span>
              <span className="flex items-center gap-1 font-semibold">
                <span>Search Title</span>
                <ArrowRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
              </span>
            </div>
          </div>
        ))}
      </div>

      {filteredList.length === 0 && (
        <div className="text-center py-12 text-gray-400 text-xs">
          No keywords match your search. Try different terms like "Pushpa", "Osman", "Netflix", or "KGF".
        </div>
      )}
    </section>
  );
};
