import { useEffect, useState, useCallback } from "react";
import { useLocation } from "react-router-dom";
import useSiteSettings from "../hooks/useSiteSettings";

/**
 * Dashboard-managed homepage popup (Widget Settings → Home Page Popup).
 *
 * Shows the configured image/GIF/video centered over the homepage with a
 * close button, on EVERY page load. Closing hides it for the rest of that
 * page view only — reloading the homepage, or returning to it later, shows
 * it again.
 *
 * It deliberately keeps no "already seen" flag. An earlier version stored one
 * in sessionStorage so the popup appeared once per browser session; that was
 * removed on request, so nothing here reads or writes storage.
 *
 * Renders nothing when disabled, when no media is set, or on any route other
 * than the homepage — existing widgets are untouched.
 */

export default function HomePopup() {
  const location = useLocation();
  const settings = useSiteSettings();
  const popup = settings?.home_popup;

  const enabled = Boolean(popup?.enabled && popup?.media);
  const isHome = location.pathname === "/";
  const isVideo = popup?.type === "video";

  // Dismissal lives in component state only, so it lasts exactly as long as
  // this page view. A reload mounts a fresh component with dismissed=false
  // and the popup is back.
  const [dismissed, setDismissed] = useState(false);

  // The close × darkens on hover. Tracked in state because the styles here
  // are inline, which cannot express :hover.
  const [hoverClose, setHoverClose] = useState(false);

  const open = enabled && isHome && !dismissed;

  const close = useCallback(() => setDismissed(true), []);

  // Close on Escape while open.
  useEffect(() => {
    if (!open) return;
    const onKey = (e) => {
      if (e.key === "Escape") close();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, close]);

  if (!open || !enabled || !isHome) return null;

  return (
    <div
      onClick={close}
      role="dialog"
      aria-modal="true"
      aria-label="Announcement"
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 9999,
        // Blurred backdrop rather than a dark scrim, matching the live site:
        // the page stays recognisable behind the card while the blur gives
        // the popup enough separation to read as a modal.
        backdropFilter: "blur(8px)",
        WebkitBackdropFilter: "blur(8px)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "16px",
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          position: "relative",
          background: "#fff",
          borderRadius: "8px",
          boxShadow: "0 10px 15px -3px rgba(0,0,0,0.1), 0 4px 6px -4px rgba(0,0,0,0.1)",
          // A thin 8px frame, not a wide one: the artwork is the popup, and
          // the old 40px top inset left a band of empty white above it.
          padding: "8px",
          maxWidth: "560px",
          width: "100%",
          maxHeight: "90vh",
          overflow: "hidden",
        }}
      >
        <button
          type="button"
          onClick={close}
          aria-label="Close popup"
          style={{
            position: "absolute",
            top: "8px",
            right: "8px",
            zIndex: 10,
            border: "none",
            background: "transparent",
            fontSize: "30px",
            lineHeight: 1,
            cursor: "pointer",
            color: hoverClose ? "#000" : "#6a7282",
            padding: 0,
          }}
          onMouseEnter={() => setHoverClose(true)}
          onMouseLeave={() => setHoverClose(false)}
        >
          ×
        </button>
        {/* The media fills the card and sets its height (height:auto), so the
            card wraps the artwork instead of the artwork floating inside a
            fixed-size white panel. */}
        {isVideo ? (
          <video
            src={popup.media}
            // No `controls`: this is an announcement, not a player. The
            // scrubber, timer, mute and fullscreen buttons were the chrome
            // that made the popup look unfinished — the live site has none.
            // It is muted so autoplay is allowed, and loops because an
            // announcement clip is short.
            autoPlay
            muted
            loop
            playsInline
            // Media missing/unloadable (e.g. deleted on the server):
            // close silently instead of showing an empty white card.
            onError={close}
            style={{
              width: "100%",
              height: "auto",
              display: "block",
              borderRadius: "6px",
            }}
          />
        ) : (
          <img
            src={popup.media}
            alt="Announcement"
            onError={close}
            style={{
              width: "100%",
              height: "auto",
              display: "block",
              borderRadius: "6px",
            }}
          />
        )}
      </div>
    </div>
  );
}
