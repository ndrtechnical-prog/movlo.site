import React, { useEffect, useRef } from "react";
import { AdPlacementKey, AdSettings } from "../types";

interface AdSlotProps {
  placement: AdPlacementKey;
  adSettings: AdSettings;
  className?: string;
}

declare global {
  interface Window {
    adsbygoogle?: unknown[];
  }
}

export const AdSlot: React.FC<AdSlotProps> = ({
  placement,
  adSettings,
  className = ""
}) => {
  const pushedRef = useRef(false);
  const slotConfig = adSettings.slots?.[placement];
  const publisherId = adSettings.publisherId?.trim();

  const isEnabled = Boolean(slotConfig?.enabled && publisherId);
  const hasExplicitSlotId = Boolean(slotConfig?.slotId?.trim());

  useEffect(() => {
    if (!isEnabled || !hasExplicitSlotId || pushedRef.current) return;
    try {
      (window.adsbygoogle = window.adsbygoogle || []).push({});
      pushedRef.current = true;
    } catch {
      // AdSense script blocked or not yet loaded
    }
  }, [isEnabled, hasExplicitSlotId, slotConfig?.slotId]);

  if (!isEnabled) {
    return null;
  }

  // If no explicit ad slot ID is configured yet for this placement, leave space clean
  // so Google AdSense Auto Ads handles placement without rendering fake ad boxes.
  if (!hasExplicitSlotId) {
    return null;
  }

  const isSidebar = placement === "sidebar";

  return (
    <aside
      aria-label="Advertisement"
      className={`my-6 py-3 px-2 border-y border-neutral-200 bg-neutral-50/50 text-center ${className}`}
    >
      <p className="text-[10px] font-medium uppercase tracking-[0.2em] text-neutral-400 mb-2">
        Advertisement
      </p>
      <div className="overflow-hidden flex justify-center">
        <ins
          className="adsbygoogle"
          style={{
            display: "block",
            width: "100%",
            minHeight: isSidebar ? "250px" : "90px"
          }}
          data-ad-client={publisherId}
          data-ad-slot={slotConfig.slotId.trim()}
          data-ad-format={isSidebar ? "rectangle" : "auto"}
          data-full-width-responsive="true"
        />
      </div>
    </aside>
  );
};
