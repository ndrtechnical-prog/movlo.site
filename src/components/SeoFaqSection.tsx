import React, { useState } from "react";
import {
  HelpCircle,
  ChevronDown,
  ChevronUp,
  Search,
  Sparkles,
  Film,
  Compass,
  Shuffle,
  Smartphone,
  Check,
  ArrowRight,
  ExternalLink
} from "lucide-react";

export interface FaqItem {
  id: string;
  category: "streaming" | "turkish" | "shuffle" | "devices";
  question: string;
  answer: string;
  keywords: string[];
}

export const FAQ_DATA: FaqItem[] = [
  {
    id: "faq-1",
    category: "streaming",
    question: "How can I stream free movies and Turkish dramas on Movlo.site?",
    answer:
      "Streaming on Movlo.site is 100% free with no registration, subscription fee, or credit card required. Simply explore the movie catalog or use the top search bar to select any Indian cinema title, Urdu dubbed Turkish drama episode, English movie, or Chinese drama. Clicking the poster opens an instant 1080p full HD media player with seamless controls.",
    keywords: ["free movies online", "watch movies without sign up", "Movlo streaming free", "stream HD movies 2026"]
  },
  {
    id: "faq-2",
    category: "turkish",
    question: "Are Turkish dramas available with Urdu and Hindi dubbed audio on Movlo?",
    answer:
      "Yes! Movlo features an extensive catalog of top-rated Turkish dramas dubbed in clear Urdu and Hindi. Popular series include Kurulus Osman (all seasons), Ertugrul Ghazi, Hazrat Yousuf (A.S), Kuzgun, Ramo, Marasli, and Soz. Each drama series includes complete episode navigation so you can binge-watch sequentially.",
    keywords: ["Kurulus Osman Urdu dubbed", "Turkish dramas Hindi dubbed", "Hazrat Yousuf drama full episode", "Ertugrul Urdu episodes"]
  },
  {
    id: "faq-3",
    category: "shuffle",
    question: "How does Movlo's 24-hour automatic movie shuffle feature work?",
    answer:
      "Movlo is equipped with a smart 24-hour deterministic shuffle engine. Every 24 hours, the order of movies across the homepage, 3D Hero Deck, and category tabs automatically randomizes. This ensures you discover fresh, trending movies and hidden gems every single day. You can also press the 'Shuffle' button to re-randomize immediately at any moment.",
    keywords: ["24 hour movie shuffle", "random movie generator", "fresh movies daily", "Movlo shuffle feature"]
  },
  {
    id: "faq-4",
    category: "streaming",
    question: "Can I search for trending movies queried on Google, ChatGPT, Gemini, and Netflix?",
    answer:
      "Yes. Movlo integrates a real-time global search bar and a dedicated Trending Queries Hub indexing viral titles searched on Google Search, Gemini, ChatGPT, MovieBox, and Netflix (such as Pushpa 2, Kalki 2898 AD, Salaar 2, Animal, and KGF 3). Typing in any query brings up matching full movies and official 4K cinema trailers instantly.",
    keywords: ["Netflix trending movies free", "MovieBox alternative", "search movies Google Gemini", "Pushpa 2 stream online"]
  },
  {
    id: "faq-5",
    category: "devices",
    question: "How do I install Movlo as a Progressive Web App (PWA) on mobile or PC?",
    answer:
      "You can install Movlo directly without app store downloads. On Chrome, Edge, or Android browsers, click the glowing 'Install App' button located on the top navigation bar or footer. On Safari (iOS), tap the Share icon and select 'Add to Home Screen'. The app will launch in full screen with zero browser bars and high-speed offline caching.",
    keywords: ["install Movlo app", "Movlo PWA download", "free movie app Android iOS", "watch movies offline"]
  },
  {
    id: "faq-6",
    category: "turkish",
    question: "Where can I watch Hazrat Yousuf (A.S) full episodes in HD Urdu?",
    answer:
      "All full episodes of the legendary historical drama series 'Hazrat Yousuf (A.S)' are organized in high definition on Movlo. Navigate to the 'Historical Story' or 'Turkish Dramas' tab, or click the Episode Explorer to select and stream any episode with original Urdu narration.",
    keywords: ["Hazrat Yousuf all episodes", "Hazrat Yousuf Urdu drama HD", "Hazrat Yousuf series watch online"]
  },
  {
    id: "faq-7",
    category: "devices",
    question: "Is Movlo.site safe, secure, and compatible with mobile phones and smart TVs?",
    answer:
      "Movlo.site is fully responsive and built with modern web technologies that adapt dynamically to smartphones, tablets, laptops, and smart TVs. We do not require downloads of suspicious executables, and all video embeds are delivered through secure HTTPS protocols.",
    keywords: ["is Movlo safe", "stream movies on smart TV", "mobile friendly movie streaming", "free online cinema site"]
  },
  {
    id: "faq-8",
    category: "streaming",
    question: "How often is the Movlo movie catalog and upcoming trailer list updated?",
    answer:
      "Our editorial cinema desk updates the movie library weekly with newly released Indian cinema titles, freshly dubbed Turkish drama episodes, upcoming theatrical trailers, and verified high-bitrate streaming sources.",
    keywords: ["latest movies 2026", "new releases Bollywood", "upcoming movie trailers HD", "free cinema updates"]
  }
];

interface SeoFaqSectionProps {
  onSearchKeyword?: (keyword: string) => void;
}

export const SeoFaqSection: React.FC<SeoFaqSectionProps> = ({ onSearchKeyword }) => {
  const [activeFaqId, setActiveFaqId] = useState<string | null>("faq-1");
  const [filterQuery, setFilterQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<"all" | "streaming" | "turkish" | "shuffle" | "devices">("all");
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const filteredFaqs = FAQ_DATA.filter((faq) => {
    const matchesCategory = selectedCategory === "all" || faq.category === selectedCategory;
    const matchesSearch =
      filterQuery === "" ||
      faq.question.toLowerCase().includes(filterQuery.toLowerCase()) ||
      faq.answer.toLowerCase().includes(filterQuery.toLowerCase()) ||
      faq.keywords.some((k) => k.toLowerCase().includes(filterQuery.toLowerCase()));
    return matchesCategory && matchesSearch;
  });

  const toggleFaq = (id: string) => {
    setActiveFaqId(activeFaqId === id ? null : id);
  };

  const handleKeywordClick = (keyword: string) => {
    if (onSearchKeyword) {
      onSearchKeyword(keyword);
    } else {
      if (typeof window !== "undefined") {
        window.dispatchEvent(new CustomEvent("movlo_search_keyword", { detail: keyword }));
        const searchInput = document.getElementById("hero-global-search") as HTMLInputElement;
        if (searchInput) {
          searchInput.value = keyword;
          searchInput.focus();
        }
        const heroEl = document.getElementById("hero-section") || document.getElementById("recent-added");
        if (heroEl) {
          heroEl.scrollIntoView({ behavior: "smooth" });
        }
      }
    }
  };

  const copyFaqAnswer = (faq: FaqItem) => {
    if (typeof navigator !== "undefined" && navigator.clipboard) {
      navigator.clipboard.writeText(`${faq.question}\n\n${faq.answer}`);
      setCopiedId(faq.id);
      setTimeout(() => setCopiedId(null), 2000);
    }
  };

  return (
    <section
      id="seo-faq-section"
      className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-16 relative"
      aria-labelledby="faq-section-title"
    >
      {/* Header Container */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 pb-6 border-b border-white/10">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/25 text-amber-300 text-xs font-semibold mb-2 shadow-sm">
            <HelpCircle className="w-3.5 h-3.5 text-amber-400" />
            <span>Google Search Engine FAQ Optimization</span>
          </div>
          <h2
            id="faq-section-title"
            className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-white tracking-tight font-['Syne',sans-serif]"
          >
            Frequently Asked Questions & <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-400 via-orange-400 to-amber-200">Search Guide</span>
          </h2>
          <p className="text-xs sm:text-sm text-gray-400 mt-1 max-w-3xl">
            Optimized answers to the most common search queries about streaming free movies, Urdu dubbed Turkish dramas, 24-hour random shuffle, and installing the Movlo App.
          </p>
        </div>

        {/* Quick FAQ Search Bar */}
        <div className="relative w-full md:w-80 shrink-0">
          <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search FAQs & keywords..."
            value={filterQuery}
            onChange={(e) => setFilterQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-2 rounded-xl bg-white/5 border border-white/10 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-amber-400/50 transition-all"
          />
        </div>
      </div>

      {/* Category Pills */}
      <div className="flex items-center gap-2 overflow-x-auto no-scrollbar py-4">
        {[
          { key: "all", label: "All Questions", icon: Sparkles },
          { key: "streaming", label: "Free Movies & Playback", icon: Film },
          { key: "turkish", label: "Turkish Dramas in Urdu", icon: Compass },
          { key: "shuffle", label: "24h Auto Shuffle", icon: Shuffle },
          { key: "devices", label: "Install PWA & Devices", icon: Smartphone }
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = selectedCategory === tab.key;
          return (
            <button
              key={tab.key}
              onClick={() => setSelectedCategory(tab.key as any)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
                isActive
                  ? "bg-amber-500 text-black shadow-md shadow-amber-500/20 font-bold"
                  : "bg-white/5 hover:bg-white/10 text-gray-300 border border-white/10"
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* Accordion List */}
      <div className="space-y-3 pt-2">
        {filteredFaqs.map((faq) => {
          const isOpen = activeFaqId === faq.id;
          return (
            <div
              key={faq.id}
              className={`rounded-xl border transition-all overflow-hidden ${
                isOpen
                  ? "bg-white/[0.05] border-amber-500/40 shadow-lg shadow-amber-500/5"
                  : "bg-white/[0.02] hover:bg-white/[0.04] border-white/10"
              }`}
            >
              {/* Question Header */}
              <button
                onClick={() => toggleFaq(faq.id)}
                className="w-full text-left p-4 sm:p-5 flex items-center justify-between gap-4 cursor-pointer"
                aria-expanded={isOpen}
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div
                    className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 transition-colors ${
                      isOpen
                        ? "bg-amber-500 text-black font-bold"
                        : "bg-white/5 text-amber-400 border border-white/10"
                    }`}
                  >
                    <HelpCircle className="w-4 h-4" />
                  </div>
                  <h3 className="text-sm sm:text-base font-bold text-white tracking-tight">
                    {faq.question}
                  </h3>
                </div>

                <div className="shrink-0 text-gray-400">
                  {isOpen ? <ChevronUp className="w-5 h-5 text-amber-400" /> : <ChevronDown className="w-5 h-5" />}
                </div>
              </button>

              {/* Answer Content */}
              {isOpen && (
                <div className="px-4 sm:px-5 pb-5 pt-1 border-t border-white/5 text-xs sm:text-sm text-gray-300 space-y-4 animate-in fade-in duration-200">
                  <p className="leading-relaxed">
                    {faq.answer}
                  </p>

                  {/* Target Keywords Linking to Search */}
                  <div className="pt-2 border-t border-white/5 flex flex-wrap items-center justify-between gap-3">
                    <div className="flex flex-wrap items-center gap-1.5">
                      <span className="text-[11px] text-gray-400 font-semibold">Related Search Keywords:</span>
                      {faq.keywords.map((kw) => (
                        <button
                          key={kw}
                          onClick={() => handleKeywordClick(kw)}
                          className="text-[10px] font-semibold px-2 py-0.5 rounded-md bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 border border-amber-500/25 transition-colors cursor-pointer flex items-center gap-1"
                          title={`Search "${kw}" in Movlo`}
                        >
                          <span>{kw}</span>
                          <ArrowRight className="w-2.5 h-2.5" />
                        </button>
                      ))}
                    </div>

                    <button
                      onClick={() => copyFaqAnswer(faq)}
                      className="text-[11px] font-semibold text-gray-400 hover:text-white transition-colors cursor-pointer ml-auto flex items-center gap-1"
                    >
                      {copiedId === faq.id ? (
                        <>
                          <Check className="w-3 h-3 text-emerald-400" />
                          <span className="text-emerald-400">Copied</span>
                        </>
                      ) : (
                        <span>Copy Answer</span>
                      )}
                    </button>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {filteredFaqs.length === 0 && (
        <div className="text-center py-10 text-gray-400 text-xs">
          No FAQs match your search query. Try searching for "Turkish", "Shuffle", "Download", or "Free".
        </div>
      )}
    </section>
  );
};
