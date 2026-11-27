import React, { useState } from "react";
import { Plus, Trash2, Save } from "lucide-react";
import {
  AdPlacementKey,
  AdSettings,
  Category,
  SiteSettings
} from "../../types";
import {
  saveAdSettings,
  saveSiteSettings,
  saveCategory,
  deleteCategoryById,
  sanitizeSlug
} from "../../lib/firestoreRepo";

interface AdminSettingsAndAdsProps {
  mode: "ads" | "settings";
  siteSettings: SiteSettings;
  adSettings: AdSettings;
  categories: Category[];
  onRefreshData: () => Promise<void>;
}

const AD_KEYS: AdPlacementKey[] = [
  "header_banner",
  "homepage_banner",
  "below_intro",
  "mid_article",
  "sidebar",
  "after_article"
];

export const AdminSettingsAndAds: React.FC<AdminSettingsAndAdsProps> = ({
  mode,
  siteSettings,
  adSettings,
  categories,
  onRefreshData
}) => {
  const [adsDraft, setAdsDraft] = useState<AdSettings>(adSettings);
  const [siteDraft, setSiteDraft] = useState<SiteSettings>(siteSettings);
  const [newCatName, setNewCatName] = useState("");
  const [newCatDesc, setNewCatDesc] = useState("");
  const [newCatNav, setNewCatNav] = useState(true);
  const [saving, setSaving] = useState(false);
  const [feedback, setFeedback] = useState("");

  const handleSaveAds = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setFeedback("");
    try {
      await saveAdSettings(adsDraft);
      await onRefreshData();
      setFeedback("AdSense configuration saved to Firestore.");
    } catch (err: any) {
      setFeedback(err?.message || "Failed to save AdSense settings.");
    } finally {
      setSaving(false);
    }
  };

  const handleSaveSite = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setFeedback("");
    try {
      await saveSiteSettings(siteDraft);
      await onRefreshData();
      setFeedback("Website settings saved.");
    } catch (err: any) {
      setFeedback(err?.message || "Failed to save website settings.");
    } finally {
      setSaving(false);
    }
  };

  const handleAddCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newCatName.trim().length < 2) return;
    setSaving(true);
    try {
      const slug = sanitizeSlug(newCatName);
      await saveCategory(
        {
          id: slug,
          slug,
          name: newCatName.trim(),
          description: newCatDesc.trim(),
          order: categories.length + 1,
          showInNav: newCatNav
        },
        true
      );
      setNewCatName("");
      setNewCatDesc("");
      await onRefreshData();
      setFeedback(`Category "${newCatName.trim()}" added.`);
    } catch (err: any) {
      setFeedback(err?.message || "Failed to add category.");
    } finally {
      setSaving(false);
    }
  };

  const handleRemoveCategory = async (slug: string) => {
    setSaving(true);
    try {
      await deleteCategoryById(slug);
      await onRefreshData();
      setFeedback(`Category "${slug}" removed.`);
    } catch (err: any) {
      setFeedback(err?.message || "Failed to remove category.");
    } finally {
      setSaving(false);
    }
  };

  if (mode === "ads") {
    return (
      <form onSubmit={handleSaveAds} className="space-y-6 border border-neutral-200 p-6 bg-white">
        <div>
          <h2 className="font-editorial text-xl font-bold text-[#0A0A0A] mb-1">
            Google AdSense Configuration
          </h2>
          <p className="text-xs text-neutral-500">
            Configure your AdSense Publisher ID and individual placement slot IDs. Slots without a slot ID remain cleanly hidden until configured, and disabled slots never render.
          </p>
        </div>

        {feedback && (
          <p className="border border-[#0A0A0A] bg-neutral-50 px-3 py-2 text-xs font-medium">
            {feedback}
          </p>
        )}

        <div className="max-w-md">
          <label className="block text-[11px] font-semibold uppercase tracking-wider text-neutral-600 mb-1">
            AdSense Publisher ID
          </label>
          <input
            type="text"
            value={adsDraft.publisherId}
            onChange={(e) => setAdsDraft({ ...adsDraft, publisherId: e.target.value })}
            placeholder="ca-pub-6696395667318454"
            className="w-full px-3 py-2 border border-neutral-300 text-sm font-mono-tabular"
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {AD_KEYS.map((key) => {
            const slot = adsDraft.slots[key];
            return (
              <div key={key} className="border border-neutral-200 p-4 space-y-3">
                <div className="flex items-center justify-between gap-2">
                  <div>
                    <p className="text-sm font-semibold text-[#0A0A0A]">{slot.label}</p>
                    <p className="text-[11px] font-mono-tabular text-neutral-400">{key}</p>
                  </div>
                  <label className="inline-flex items-center gap-2 text-xs font-semibold cursor-pointer">
                    <input
                      type="checkbox"
                      checked={slot.enabled}
                      onChange={(e) =>
                        setAdsDraft({
                          ...adsDraft,
                          slots: {
                            ...adsDraft.slots,
                            [key]: { ...slot, enabled: e.target.checked }
                          }
                        })
                      }
                      className="w-4 h-4 accent-[#0A0A0A]"
                    />
                    <span>{slot.enabled ? "Enabled" : "Disabled"}</span>
                  </label>
                </div>

                <div>
                  <label className="block text-[10px] font-semibold uppercase tracking-wider text-neutral-500 mb-1">
                    AdSense Slot ID (Optional for Auto Ads)
                  </label>
                  <input
                    type="text"
                    value={slot.slotId}
                    onChange={(e) =>
                      setAdsDraft({
                        ...adsDraft,
                        slots: {
                          ...adsDraft.slots,
                          [key]: { ...slot, slotId: e.target.value }
                        }
                      })
                    }
                    placeholder="e.g., 1234567890"
                    className="w-full px-3 py-1.5 border border-neutral-300 text-xs font-mono-tabular"
                  />
                </div>
              </div>
            );
          })}
        </div>

        <button
          type="submit"
          disabled={saving}
          className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#0A0A0A] text-white text-xs font-semibold uppercase tracking-wider hover:bg-neutral-800 disabled:opacity-50 cursor-pointer"
        >
          <Save className="w-3.5 h-3.5" />
          <span>{saving ? "Saving..." : "Save AdSense Settings"}</span>
        </button>
      </form>
    );
  }

  return (
    <div className="space-y-8">
      {feedback && (
        <p className="border border-[#0A0A0A] bg-neutral-50 px-4 py-3 text-xs font-medium">
          {feedback}
        </p>
      )}

      <form onSubmit={handleSaveSite} className="border border-neutral-200 p-6 bg-white space-y-5">
        <h2 className="font-editorial text-xl font-bold text-[#0A0A0A]">
          Website Settings
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-[11px] font-semibold uppercase tracking-wider text-neutral-600 mb-1">
              Website Name
            </label>
            <input
              type="text"
              value={siteDraft.siteName}
              onChange={(e) => setSiteDraft({ ...siteDraft, siteName: e.target.value })}
              className="w-full px-3 py-2 border border-neutral-300 text-sm"
            />
          </div>
          <div>
            <label className="block text-[11px] font-semibold uppercase tracking-wider text-neutral-600 mb-1">
              Logo Wordmark
            </label>
            <input
              type="text"
              value={siteDraft.logoText}
              onChange={(e) => setSiteDraft({ ...siteDraft, logoText: e.target.value })}
              className="w-full px-3 py-2 border border-neutral-300 text-sm"
            />
          </div>
          <div>
            <label className="block text-[11px] font-semibold uppercase tracking-wider text-neutral-600 mb-1">
              Tagline
            </label>
            <input
              type="text"
              value={siteDraft.tagline}
              onChange={(e) => setSiteDraft({ ...siteDraft, tagline: e.target.value })}
              className="w-full px-3 py-2 border border-neutral-300 text-sm"
            />
          </div>
          <div>
            <label className="block text-[11px] font-semibold uppercase tracking-wider text-neutral-600 mb-1">
              Default Language
            </label>
            <input
              type="text"
              value={siteDraft.defaultLanguage}
              onChange={(e) => setSiteDraft({ ...siteDraft, defaultLanguage: e.target.value })}
              className="w-full px-3 py-2 border border-neutral-300 text-sm"
            />
          </div>
          <div>
            <label className="block text-[11px] font-semibold uppercase tracking-wider text-neutral-600 mb-1">
              Default SEO Title
            </label>
            <input
              type="text"
              value={siteDraft.defaultSeoTitle}
              onChange={(e) => setSiteDraft({ ...siteDraft, defaultSeoTitle: e.target.value })}
              className="w-full px-3 py-2 border border-neutral-300 text-sm"
            />
          </div>
          <div>
            <label className="block text-[11px] font-semibold uppercase tracking-wider text-neutral-600 mb-1">
              Domain
            </label>
            <input
              type="text"
              value={siteDraft.domain}
              onChange={(e) => setSiteDraft({ ...siteDraft, domain: e.target.value })}
              className="w-full px-3 py-2 border border-neutral-300 text-sm"
            />
          </div>
        </div>

        <div>
          <label className="block text-[11px] font-semibold uppercase tracking-wider text-neutral-600 mb-1">
            Default SEO Description
          </label>
          <textarea
            rows={2}
            value={siteDraft.defaultSeoDescription}
            onChange={(e) =>
              setSiteDraft({ ...siteDraft, defaultSeoDescription: e.target.value })
            }
            className="w-full px-3 py-2 border border-neutral-300 text-sm"
          />
        </div>

        <div>
          <label className="block text-[11px] font-semibold uppercase tracking-wider text-neutral-600 mb-1">
            Footer Information
          </label>
          <textarea
            rows={2}
            value={siteDraft.footerInfo}
            onChange={(e) => setSiteDraft({ ...siteDraft, footerInfo: e.target.value })}
            className="w-full px-3 py-2 border border-neutral-300 text-sm"
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          <input
            type="url"
            value={siteDraft.socialLinks?.x || ""}
            onChange={(e) =>
              setSiteDraft({
                ...siteDraft,
                socialLinks: { ...siteDraft.socialLinks, x: e.target.value }
              })
            }
            placeholder="X / Twitter URL"
            className="px-3 py-2 border border-neutral-300 text-xs"
          />
          <input
            type="url"
            value={siteDraft.socialLinks?.youtube || ""}
            onChange={(e) =>
              setSiteDraft({
                ...siteDraft,
                socialLinks: { ...siteDraft.socialLinks, youtube: e.target.value }
              })
            }
            placeholder="YouTube URL"
            className="px-3 py-2 border border-neutral-300 text-xs"
          />
          <input
            type="url"
            value={siteDraft.socialLinks?.linkedin || ""}
            onChange={(e) =>
              setSiteDraft({
                ...siteDraft,
                socialLinks: { ...siteDraft.socialLinks, linkedin: e.target.value }
              })
            }
            placeholder="LinkedIn URL"
            className="px-3 py-2 border border-neutral-300 text-xs"
          />
          <input
            type="url"
            value={siteDraft.socialLinks?.instagram || ""}
            onChange={(e) =>
              setSiteDraft({
                ...siteDraft,
                socialLinks: { ...siteDraft.socialLinks, instagram: e.target.value }
              })
            }
            placeholder="Instagram URL"
            className="px-3 py-2 border border-neutral-300 text-xs"
          />
        </div>

        <button
          type="submit"
          disabled={saving}
          className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#0A0A0A] text-white text-xs font-semibold uppercase tracking-wider hover:bg-neutral-800 cursor-pointer"
        >
          <Save className="w-3.5 h-3.5" />
          <span>Save Website Settings</span>
        </button>
      </form>

      {/* Categories Manager */}
      <section className="border border-neutral-200 p-6 bg-white space-y-5">
        <h2 className="font-editorial text-xl font-bold text-[#0A0A0A]">
          Content Categories ({categories.length})
        </h2>

        <form onSubmit={handleAddCategory} className="grid grid-cols-1 md:grid-cols-12 gap-3 items-end">
          <div className="md:col-span-4">
            <label className="block text-[11px] font-semibold uppercase tracking-wider text-neutral-600 mb-1">
              Category Name
            </label>
            <input
              type="text"
              value={newCatName}
              onChange={(e) => setNewCatName(e.target.value)}
              placeholder="e.g., Cybersecurity"
              className="w-full px-3 py-2 border border-neutral-300 text-sm"
            />
          </div>
          <div className="md:col-span-5">
            <label className="block text-[11px] font-semibold uppercase tracking-wider text-neutral-600 mb-1">
              Description
            </label>
            <input
              type="text"
              value={newCatDesc}
              onChange={(e) => setNewCatDesc(e.target.value)}
              placeholder="Short category summary..."
              className="w-full px-3 py-2 border border-neutral-300 text-sm"
            />
          </div>
          <div className="md:col-span-3 flex items-center justify-between gap-2">
            <label className="inline-flex items-center gap-1.5 text-xs">
              <input
                type="checkbox"
                checked={newCatNav}
                onChange={(e) => setNewCatNav(e.target.checked)}
                className="accent-[#0A0A0A]"
              />
              <span>In Nav</span>
            </label>
            <button
              type="submit"
              disabled={saving}
              className="inline-flex items-center gap-1.5 px-4 py-2 bg-[#0A0A0A] text-white text-xs font-semibold uppercase tracking-wider cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add</span>
            </button>
          </div>
        </form>

        <div className="divide-y divide-neutral-200 border-t border-neutral-200">
          {categories.map((cat) => (
            <div key={cat.slug} className="py-3 flex items-center justify-between gap-4">
              <div>
                <p className="text-sm font-semibold text-[#0A0A0A]">
                  {cat.name}{" "}
                  <span className="font-mono-tabular text-[11px] text-neutral-400">
                    /{cat.slug}
                  </span>
                </p>
                <p className="text-xs text-neutral-500">{cat.description}</p>
              </div>
              <button
                type="button"
                onClick={() => handleRemoveCategory(cat.slug)}
                className="p-1.5 text-neutral-400 hover:text-red-600 cursor-pointer"
                title="Delete category"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
};
