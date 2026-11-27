import React, { useState } from "react";
import { Search, X, Menu, ShieldCheck } from "lucide-react";
import { SiteSettings } from "../types";

interface HeaderProps {
  currentPath: string;
  onNavigate: (path: string) => void;
  siteSettings: SiteSettings;
}

const NAV_ITEMS = [
  { label: "Home", path: "/" },
  { label: "Trending", path: "/category/trending-news" },
  { label: "Technology", path: "/category/technology" },
  { label: "Entertainment", path: "/category/entertainment" },
  { label: "AI & Technology", path: "/category/artificial-intelligence" },
  { label: "Gaming", path: "/category/gaming" },
  { label: "Social Media", path: "/category/social-media" },
  { label: "How To", path: "/category/how-to-guides" }
];

export const Header: React.FC<HeaderProps> = ({
  currentPath,
  onNavigate,
  siteSettings
}) => {
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const q = searchQuery.trim();
    if (!q) return;
    setSearchOpen(false);
    setMobileMenuOpen(false);
    onNavigate(`/search?q=${encodeURIComponent(q)}`);
  };

  const handleLinkClick = (e: React.MouseEvent, path: string) => {
    e.preventDefault();
    setMobileMenuOpen(false);
    onNavigate(path);
  };

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-sm border-b border-neutral-200">
      <div className="max-w-[1320px] mx-auto px-4 sm:px-6 lg:px-8">
        <div className="h-16 flex items-center justify-between gap-4">
          {/* Left: MOVLO Brand Wordmark */}
          <div className="flex items-center gap-3 shrink-0">
            <button
              type="button"
              onClick={() => setMobileMenuOpen((v) => !v)}
              aria-label="Toggle menu"
              className="lg:hidden p-1.5 -ml-1.5 text-neutral-800 hover:text-black cursor-pointer"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>

            <a
              href="/"
              onClick={(e) => handleLinkClick(e, "/")}
              className="flex items-center gap-2.5 group"
            >
              <span className="inline-flex items-center justify-center w-7 h-7 bg-[#0A0A0A] text-white font-editorial font-bold text-base tracking-tight">
                M
              </span>
              <span className="font-editorial text-xl font-extrabold tracking-tight text-[#0A0A0A]">
                {siteSettings.logoText || "MOVLO"}
              </span>
            </a>
          </div>

          {/* Center: Single-line Editorial Navigation */}
          <nav
            aria-label="Primary Navigation"
            className="hidden lg:flex items-center gap-6 overflow-x-auto"
          >
            {NAV_ITEMS.map((item) => {
              const active =
                item.path === "/"
                  ? currentPath === "/"
                  : currentPath.startsWith(item.path);
              return (
                <a
                  key={item.path}
                  href={item.path}
                  onClick={(e) => handleLinkClick(e, item.path)}
                  className={`text-[13px] whitespace-nowrap transition-colors py-1 border-b-2 ${
                    active
                      ? "border-[#0A0A0A] font-semibold text-[#0A0A0A]"
                      : "border-transparent font-medium text-neutral-600 hover:text-[#0A0A0A]"
                  }`}
                >
                  {item.label}
                </a>
              );
            })}
          </nav>

          {/* Right: Search Icon & Studio */}
          <div className="flex items-center gap-2 shrink-0">
            <button
              type="button"
              onClick={() => setSearchOpen((v) => !v)}
              aria-label="Search articles"
              className="p-2 text-neutral-700 hover:text-[#0A0A0A] hover:bg-neutral-100 transition-colors cursor-pointer"
            >
              {searchOpen ? <X className="w-4 h-4" /> : <Search className="w-4 h-4" />}
            </button>

            <a
              href="/admin"
              onClick={(e) => handleLinkClick(e, "/admin")}
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 border text-xs font-semibold tracking-wide transition-colors ${
                currentPath.startsWith("/admin")
                  ? "bg-[#0A0A0A] text-white border-[#0A0A0A]"
                  : "bg-white text-neutral-800 border-neutral-300 hover:border-[#0A0A0A]"
              }`}
            >
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>Studio</span>
            </a>
          </div>
        </div>

        {/* Expandable Search Bar */}
        {searchOpen && (
          <form
            onSubmit={handleSearchSubmit}
            className="py-3 border-t border-neutral-200 flex items-center gap-3"
          >
            <Search className="w-4 h-4 text-neutral-400 shrink-0" />
            <input
              type="search"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search trending topics, guides, AI, tech, gaming..."
              autoFocus
              className="w-full bg-transparent text-sm text-[#0A0A0A] placeholder:text-neutral-400 focus:outline-none"
            />
            <button
              type="submit"
              className="px-4 py-1.5 bg-[#0A0A0A] text-white text-xs font-semibold uppercase tracking-wider hover:bg-neutral-800 transition-colors cursor-pointer shrink-0"
            >
              Search
            </button>
          </form>
        )}

        {/* Mobile Drawer */}
        {mobileMenuOpen && (
          <div className="lg:hidden py-4 border-t border-neutral-200 space-y-1">
            {NAV_ITEMS.map((item) => {
              const active =
                item.path === "/"
                  ? currentPath === "/"
                  : currentPath.startsWith(item.path);
              return (
                <a
                  key={item.path}
                  href={item.path}
                  onClick={(e) => handleLinkClick(e, item.path)}
                  className={`block px-2 py-2 text-sm ${
                    active
                      ? "font-semibold text-[#0A0A0A] bg-neutral-100"
                      : "font-medium text-neutral-700 hover:bg-neutral-50"
                  }`}
                >
                  {item.label}
                </a>
              );
            })}
          </div>
        )}
      </div>
    </header>
  );
};
