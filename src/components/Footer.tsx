import React from "react";
import { Category, SiteSettings } from "../types";

interface FooterProps {
  categories: Category[];
  siteSettings: SiteSettings;
  onNavigate: (path: string) => void;
}

export const Footer: React.FC<FooterProps> = ({
  categories,
  siteSettings,
  onNavigate
}) => {
  const handleLink = (e: React.MouseEvent, path: string) => {
    e.preventDefault();
    onNavigate(path);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <footer className="border-t border-neutral-200 bg-white mt-20">
      <div className="max-w-[1320px] mx-auto px-4 sm:px-6 lg:px-8 py-14">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-10 pb-12 border-b border-neutral-200">
          {/* Brand Column */}
          <div className="md:col-span-5">
            <a
              href="/"
              onClick={(e) => handleLink(e, "/")}
              className="inline-flex items-center gap-2.5 mb-3"
            >
              <span className="inline-flex items-center justify-center w-7 h-7 bg-[#0A0A0A] text-white font-editorial font-bold text-base">
                M
              </span>
              <span className="font-editorial text-xl font-extrabold tracking-tight text-[#0A0A0A]">
                {siteSettings.siteName || "MOVLO"}
              </span>
            </a>
            <p className="text-xs font-semibold uppercase tracking-[0.14em] text-neutral-500 mb-3">
              {siteSettings.tagline}
            </p>
            <p className="text-sm text-neutral-600 leading-relaxed max-w-md">
              {siteSettings.footerInfo}
            </p>
          </div>

          {/* Sections Column */}
          <div className="md:col-span-4">
            <h3 className="text-[11px] font-semibold uppercase tracking-[0.16em] text-neutral-500 mb-4 font-sans">
              Sections
            </h3>
            <div className="grid grid-cols-2 gap-x-4 gap-y-2">
              {categories.slice(0, 10).map((cat) => (
                <a
                  key={cat.slug}
                  href={`/category/${cat.slug}`}
                  onClick={(e) => handleLink(e, `/category/${cat.slug}`)}
                  className="text-sm text-neutral-700 hover:text-[#0A0A0A] hover:underline underline-offset-4"
                >
                  {cat.name}
                </a>
              ))}
            </div>
          </div>

          {/* Publication & Legal Column */}
          <div className="md:col-span-3">
            <h3 className="text-[11px] font-semibold uppercase tracking-[0.16em] text-neutral-500 mb-4 font-sans">
              Publication
            </h3>
            <ul className="space-y-2 text-sm text-neutral-700">
              <li>
                <a href="/about" onClick={(e) => handleLink(e, "/about")} className="hover:text-[#0A0A0A] hover:underline underline-offset-4">
                  About Us
                </a>
              </li>
              <li>
                <a href="/editorial-policy" onClick={(e) => handleLink(e, "/editorial-policy")} className="hover:text-[#0A0A0A] hover:underline underline-offset-4">
                  Editorial Policy
                </a>
              </li>
              <li>
                <a href="/contact" onClick={(e) => handleLink(e, "/contact")} className="hover:text-[#0A0A0A] hover:underline underline-offset-4">
                  Contact Us
                </a>
              </li>
              <li>
                <a href="/privacy-policy" onClick={(e) => handleLink(e, "/privacy-policy")} className="hover:text-[#0A0A0A] hover:underline underline-offset-4">
                  Privacy Policy
                </a>
              </li>
              <li>
                <a href="/terms" onClick={(e) => handleLink(e, "/terms")} className="hover:text-[#0A0A0A] hover:underline underline-offset-4">
                  Terms &amp; Conditions
                </a>
              </li>
              <li>
                <a href="/disclaimer" onClick={(e) => handleLink(e, "/disclaimer")} className="hover:text-[#0A0A0A] hover:underline underline-offset-4">
                  Disclaimer
                </a>
              </li>
              <li>
                <a href="/cookie-policy" onClick={(e) => handleLink(e, "/cookie-policy")} className="hover:text-[#0A0A0A] hover:underline underline-offset-4">
                  Cookie Policy
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className="pt-8 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 text-xs text-neutral-500">
          <p>
            © {new Date().getFullYear()} {siteSettings.siteName || "MOVLO"} ({siteSettings.domain || "https://movlo.site"}). All rights reserved.
          </p>
          <div className="flex items-center gap-5">
            {siteSettings.socialLinks?.x && (
              <a href={siteSettings.socialLinks.x} target="_blank" rel="noopener noreferrer" className="hover:text-[#0A0A0A]">
                X
              </a>
            )}
            {siteSettings.socialLinks?.youtube && (
              <a href={siteSettings.socialLinks.youtube} target="_blank" rel="noopener noreferrer" className="hover:text-[#0A0A0A]">
                YouTube
              </a>
            )}
            {siteSettings.socialLinks?.linkedin && (
              <a href={siteSettings.socialLinks.linkedin} target="_blank" rel="noopener noreferrer" className="hover:text-[#0A0A0A]">
                LinkedIn
              </a>
            )}
            <a href="/sitemap.xml" className="hover:text-[#0A0A0A]">
              Sitemap
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
};
