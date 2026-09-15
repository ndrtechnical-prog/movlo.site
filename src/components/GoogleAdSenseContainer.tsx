import React, { useEffect, useRef } from "react";

declare global {
  interface Window {
    adsbygoogle?: any[];
  }
}

interface GoogleAdSenseContainerProps {
  slot?: string;
  format?: string;
  responsive?: boolean;
  className?: string;
  style?: React.CSSProperties;
}

/**
 * Clean, Production-Ready Google AdSense Responsive Unit
 * 
 * - Relies strictly on Google AdSense for rendering; no fake ads or placeholders.
 * - Does not cover or overlap buttons, video players, navigation, or interactive controls.
 * - Fully responsive across mobile, tablet, and desktop devices.
 */
export const GoogleAdSenseContainer: React.FC<GoogleAdSenseContainerProps> = ({
  slot,
  format = "auto",
  responsive = true,
  className = "",
  style = { display: "block" }
}) => {
  const adRef = useRef<HTMLModElement>(null);
  const isPushedRef = useRef(false);

  useEffect(() => {
    // Only push once per mounted unit
    if (isPushedRef.current) return;

    try {
      if (typeof window !== "undefined") {
        (window.adsbygoogle = window.adsbygoogle || []).push({});
        isPushedRef.current = true;
      }
    } catch (err) {
      // AdSense handles already initialized or blocked requests gracefully
      console.debug("AdSense unit initialization note:", err);
    }
  }, []);

  return (
    <div
      className={`w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 my-4 sm:my-6 overflow-hidden flex items-center justify-center ${className}`}
      aria-label="Advertisement"
    >
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
  );
};
