import React, { useEffect, useRef } from "react";
import { getNonce } from "../context/NonceContext";

/**
 * Inline NoPaperForms card — a colored title strip + the form widget mounted
 * directly underneath, sized to a fixed card frame. Used for the "ENQUIRE NOW"
 * overlay on admission heroes; matches the live-site layout pixel-for-pixel.
 *
 * Why this re-injects the script on every mount (instead of using the shared
 * useScript hook): the NPF widget script (`emwgts.js`) scans for `.npf_wgts`
 * elements when it executes and converts each into an embedded form iframe.
 * It does NOT keep watching the DOM after first run. With a deduped loader
 * (script tag already present from a previous mount), a freshly mounted card
 * gets the placeholder div but no iframe. Re-appending the tag forces the
 * browser to re-execute it and the new placeholder is picked up.
 *
 * Props (all optional except widgetId):
 *   widgetId    — data-w from the NPF embed code (required)
 *   title       — header strip text (default "ENQUIRE NOW")
 *   titleBg     — header background colour (default #91288D)
 *   titleColor  — header text colour (default #FFFFFF)
 *   width       — card width in px (default 400)
 *   height     — card height in px (default 440); the form body fills this
 *                after the title strip and scrolls internally if needed.
 *   className   — extra classes for the outer wrapper (positioning)
 *   style       — extra inline styles for the outer wrapper
 */
const NPF_SCRIPT = "https://widgets.in6.nopaperforms.com/emwgts.js";

export default function NpfInlineCard({
  widgetId,
  title = "ENQUIRE NOW",
  titleBg = "#91288D",
  titleColor = "#FFFFFF",
  width = 400,
  height = 440,
  className = "",
  style,
}) {
  const containerRef = useRef(null);

  useEffect(() => {
    if (!widgetId) return;
    // Brief tick so React has committed the .npf_wgts placeholder to the DOM
    // before the script runs its scan.
    const timer = setTimeout(() => {
      const script = document.createElement("script");
      script.type = "text/javascript";
      script.async = true;
      script.src = NPF_SCRIPT;
      const nonce = getNonce?.();
      if (nonce) script.setAttribute("nonce", nonce);
      document.body.appendChild(script);
      // Remember the tag we appended so cleanup removes it on unmount —
      // letting the next mount append a fresh one and re-trigger the scan.
      containerRef.current = script;
    }, 0);

    return () => {
      clearTimeout(timer);
      const s = containerRef.current;
      if (s && s.parentNode) s.parentNode.removeChild(s);
      containerRef.current = null;
    };
  }, [widgetId]);

  if (!widgetId) return null;

  const w = typeof width === "number" ? `${width}px` : String(width);
  const h = typeof height === "number" ? `${height}px` : String(height);

  return (
    <div
      className={`bg-white rounded-t-[20px] shadow-sm overflow-hidden ${className}`}
      // Width is fixed; height auto-fits the NPF iframe's intrinsic size so
      // we don't render a tall empty pad below the submit button when the
      // form is shorter than the card's nominal height.
      style={{ width: w, ...style }}
    >
      <div
        className="text-center py-3 text-lg sm:text-xl font-bold rounded-t-lg"
        style={{ backgroundColor: titleBg, color: titleColor }}
      >
        {title}
      </div>
      <div
        key={widgetId}
        className="npf_wgts"
        // data-height tells the NPF script what iframe height to mount; the
        // wrapper grows to match. data-width="full" pins it to our width.
        data-height={h}
        data-width="full"
        data-w={widgetId}
        style={{ width: "100%" }}
      />
    </div>
  );
}
