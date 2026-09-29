import { useEffect, useState, useCallback } from "react";
import { useLocation } from "react-router-dom";
import useSiteSettings from "../hooks/useSiteSettings";

/**
 * Dashboard-managed homepage popup (Widget Settings → Home Page Popup).
 *
 * Shows the configured image/GIF centered over the homepage with a close
 * button, once per browser session. Uploading a NEW image resets the
 * "seen" flag (the flag is keyed by the image URL), so a fresh campaign
 * shows again even to visitors who closed the previous one.
 *
 * Renders nothing when disabled, when no image is set, or on any route
 * other than the homepage — existing widgets are untouched.
 */

const SEEN_KEY = "dm_home_popup_seen";

/** URL of the image dismissed earlier this session, or null. */
const seenImage = () => {
  try {
    return sessionStorage.getItem(SEEN_KEY);
  } catch {
    return null; // storage blocked → just show it
  }
};

const wasSeen = () => seenImage() !== null;

const markSeen = (image) => {
  try {
    sessionStorage.setItem(SEEN_KEY, image);
  } catch {
    /* best effort */
  }
};

export default function HomePopup() {
  const location = useLocation();
  const settings = useSiteSettings();
  const popup = settings?.home_popup;

  const enabled = Boolean(popup?.enabled && popup?.media);
  const isHome = location.pathname === "/";
  const isVideo = popup?.type === "video";

  // Visibility is fully DERIVED (no setState-in-effect): the popup shows
  // while enabled, on the homepage, and its media hasn't been dismissed
  // this session. Closing records the dismissed media URL.
  const [dismissedMedia, setDismissedMedia] = useState(() =>
    wasSeen() ? seenImage() : null
  );

  const open = enabled && isHome && popup.media !== dismissedMedia;

  const close = useCallback(() => {
    if (popup?.media) {
      markSeen(popup.media);
      setDismissedMedia(popup.media);
    }
  }, [popup]);

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
        background: "rgba(0,0,0,0.55)",
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
          borderRadius: "10px",
          boxShadow: "0 20px 60px rgba(0,0,0,0.35)",
          padding: "40px 24px 24px",
          maxWidth: "560px",
          width: "100%",
          maxHeight: "85vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <button
          type="button"
          onClick={close}
          aria-label="Close popup"
          style={{
            position: "absolute",
            top: "10px",
            right: "12px",
            border: "none",
            background: "transparent",
            fontSize: "26px",
            lineHeight: 1,
            cursor: "pointer",
            color: "#444",
            padding: "4px",
          }}
        >
          ×
        </button>
        {isVideo ? (
          <video
            src={popup.media}
            controls
            autoPlay
            muted
            loop
            playsInline
            style={{
              maxWidth: "100%",
              maxHeight: "calc(85vh - 64px)",
              display: "block",
            }}
          />
        ) : (
          <img
            src={popup.media}
            alt="Announcement"
            style={{
              maxWidth: "100%",
              maxHeight: "calc(85vh - 64px)",
              objectFit: "contain",
              display: "block",
            }}
          />
        )}
      </div>
    </div>
  );
}
