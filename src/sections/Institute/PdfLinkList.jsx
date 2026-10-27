import React from "react";
import resolveImage from "../../utils/resolveImage";

/**
 * PDF link list — section_id `pf_blogd`.
 *
 * `data` is an object whose keys are CMS repeater names (e.g. "Ragging"),
 * each holding an array of { title, pdf }. Every entry renders as a
 * full-width bordered row that opens its PDF in a new tab; the repeater
 * key itself is never shown (matches the live anti-ragging design).
 */
export default function PdfLinkList({ data = {} }) {
  const items = Object.values(data || {})
    .filter(Array.isArray)
    .flat()
    .filter((item) => item && (item.title || item.pdf));

  if (!items.length) return null;

  return (
    <div className="py-6 px-4 sm:px-6">
      <div className="micropage-container space-y-3">
        {items.map((item, i) => {
          const href = item.pdf ? resolveImage(item.pdf) : null;
          const row = (
            <div className="w-full bg-white border border-gray-300 rounded-md px-5 py-3.5 text-[#1a4b7c] hover:bg-gray-50 hover:border-[#132F5C] transition-colors">
              {item.title}
            </div>
          );
          return href ? (
            <a
              key={i}
              href={href}
              target="_blank"
              rel="noopener noreferrer"
              className="block"
            >
              {row}
            </a>
          ) : (
            <div key={i}>{row}</div>
          );
        })}
      </div>
    </div>
  );
}
