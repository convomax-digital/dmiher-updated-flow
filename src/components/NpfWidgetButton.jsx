import React, { useState } from "react";
import PopupModal from "./UI/PopupModal";
import useScript from "../hooks/useScript";

/**
 * Renders a click target whose `onClick` opens a modal containing a
 * NoPaperForms widget. The trigger markup is supplied by the caller so the
 * existing Hero pill, slide CTA, and grid-button styles are preserved.
 *
 * Caller responsibilities:
 *  - Pass `widgetId` (data-w from the NPF embed code). Without it the
 *    button still renders but the modal body stays empty.
 *  - Pass `renderTrigger({ onClick })` returning the actual button/link JSX
 *    using whatever class names the surrounding surface uses
 *    (.hero-apply-btn, .hero-mobile-apply, .inst-hero-btn-row child, etc.).
 *
 * The script is loaded once globally via useScript (it dedupes by URL).
 */
const NPF_SCRIPT = "https://widgets.in6.nopaperforms.com/emwgts.js";

export default function NpfWidgetButton({
  widgetId,
  modalTitle = "Admission Enquiry",
  width = 500,
  height = 600,
  renderTrigger,
}) {
  const [open, setOpen] = useState(false);

  // Only fetch the script after a user opens the modal at least once —
  // keeps the cold landing page free of a third-party blocking request.
  useScript(open ? NPF_SCRIPT : null, { cleanup: false });

  const w = typeof width === "number" ? `${width}px` : String(width);
  const h = typeof height === "number" ? `${height}px` : String(height);

  return (
    <>
      {renderTrigger({ onClick: () => setOpen(true) })}

      <PopupModal show={open} onClose={() => setOpen(false)} title={modalTitle}>
        <div style={{ width: w, maxWidth: "100%" }}>
          {widgetId ? (
            <div
              key={widgetId}
              className="npf_wgts"
              data-height={h}
              data-width="full"
              data-w={widgetId}
              style={{ width: "100%", minHeight: h }}
            />
          ) : (
            <p style={{ color: "#555555" }}>Form widget ID not configured.</p>
          )}
        </div>
      </PopupModal>
    </>
  );
}
