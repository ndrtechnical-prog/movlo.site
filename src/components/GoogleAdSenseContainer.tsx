import React, { useEffect, useRef } from "react";

declare global {
  interface Window {
    adsbygoogle?: any[];
  }
}

export type AdSenseVariant = "leaderboard" | "in-feed" | "modal" | "sidebar" | "compact";

interface GoogleAdSenseContainerProps {
  slot?: string;
  format?: "auto" | "rectangle" | "horizontal" | "vertical" | "fluid";
  responsive?: boolean;
  variant?: AdSenseVariant;
  className?: string;
  style?: React.CSSProperties;
  showLabel?: boolean;
}

/**
 * Clean, Production-Ready Google AdSense Responsive Unit
 * 
 * - Relies strictly on Google AdSense for rendering; no fake ads or hardcoded placeholders.
 * - Does not cover or overlap buttons, video players, navigation, or interactive controls.
 * - Fully responsive across mobile, tablet, and desktop devices.
 * - Publisher ID: ca-pub-6696395667318454
 */
export const GoogleAdSenseContainer: React.FC<GoogleAdSenseContainerProps> = ({
  slot,
  format = "auto",
  responsive = true,
  variant = "in-feed",
  className = "",
  style = { display: "block" },
  showLabel = false
}) => {
  const adRef = useRef<HTMLModElement>(null);
  const isPushedRef = useRef(false);

  useEffect(() => {
    if (isPushedRef.current) return;

    try {
      if (typeof window !== "undefined") {
        (window.adsbygoogle = window.adsbygoogle || []).push({});
        isPushedRef.current = true;
      }
    } catch (err) {
      console.debug("AdSense unit initialization note:", err);
    }
  }, []);

  // Determine container styling based on layout variant
  const variantClasses = {
    leaderboard: "max-w-6xl mx-auto px-3 sm:px-6 my-4 sm:my-6 min-h-[90px] sm:min-h-[100px]",
    "in-feed": "max-w-7xl mx-auto px-3 sm:px-6 my-6 sm:my-8 min-h-[100px] sm:min-h-[120px]",
    modal: "w-full my-4 px-2 min-h-[90px]",
    sidebar: "w-full my-3 min-h-[250px]",
    compact: "w-full max-w-4xl mx-auto px-2 my-3 min-h-[60px]"
  }[variant];

  return (
    <div
      className={`w-full overflow-hidden flex flex-col items-center justify-center transition-opacity duration-300 ${variantClasses} ${className}`}
      aria-label="Advertisement"
    >
      {showLabel && (
        <span className="text-[10px] uppercase font-bold tracking-widest text-neutral-500 mb-1.5 self-center">
          Advertisement
        </span>
      )}
      <div className="w-full flex items-center justify-center overflow-hidden rounded-xl">
        <ins
          ref={adRef}
          className="adsbygoogle"
          style={style}
          data-ad-client="ca-pub-6696395667318454"
          data-ad-slot={slot || undefined}
          data-ad-format={format}
          data-full-width-responsive={responsive ? "true" : "false"}
        />
      </div>
    </div>
  );
};
