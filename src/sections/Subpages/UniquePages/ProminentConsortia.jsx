import React from "react";

/**
 * ProminentConsortia — section_id: "prominent_consortia"
 *
 * Backend-driven version of the live-site "Global Research Programs"
 * subpage (live: pages/MicroPages/Global-Subpages/GlobalResearch.jsx).
 *
 * Reached from the Global Connect card grid →
 *   /global-connect/research-programs
 *   → /api/micropage/global-connect/research-programs
 *
 * Data shape (only the fields the CMS currently seeds):
 *   {
 *     header:    { heading, bg_color, text_color },
 *     consortia: [ { title, description } ]
 *   }
 */

const arr = (v) => (Array.isArray(v) ? v : []);

// The live layout shows a small logo placeholder beside each consortium.
// The CMS doesn't carry a logo for these records, so derive a short label
// from the title (acronym in parentheses if present, else word initials)
// to keep the placeholder meaningful without inventing data.
const placeholderLabel = (title = "") => {
  const paren = title.match(/\(([^)]+)\)/);
  if (paren && paren[1].length <= 12) return paren[1].trim();

  const initials = title
    .replace(/\([^)]*\)/g, "")
    .split(/\s+/)
    .filter((w) => /^[A-Za-z]/.test(w) && w.length > 2)
    .map((w) => w[0].toUpperCase())
    .join("");

  return initials.slice(0, 6) || (title.trim()[0] || "•").toUpperCase();
};

export default function ProminentConsortia({ data = {} }) {
  const header = data.header || {};
  const consortia = arr(data.consortia);

  const bgColor = header.bg_color || "#132F5C";
  const textColor = header.text_color || "#E8C539";
  const heading = header.heading || "Prominent Consortia";

  if (!consortia.length) return null;

  return (
    <div className="bg-white py-10 px-4">
      <div className="max-w-7xl mx-auto">
        <div
          className="max-w-7xl mx-auto border-[15px] rounded-2xl"
          style={{ borderColor: bgColor }}
        >
          {/* Heading strip */}
          <div
            className="h-[100px] flex flex-col lg:flex-row justify-center items-center pt-10 px-6 z-10 relative"
            style={{ backgroundColor: bgColor }}
          >
            <h2
              className="text-3xl sm:text-4xl lg:text-7xl mt-5 lg:mt-0 font-bold tracking-wide font-oswald-medium md:mr-5 text-center"
              style={{ color: textColor }}
            >
              {heading}
            </h2>
          </div>

          {/* Curved divider just below the strip */}
          <div className="w-full overflow-hidden leading-[0]">
            <svg
              className="block w-full h-[85px]"
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 100 50"
              preserveAspectRatio="none"
            >
              <path d="M0,50 Q50,0 100,50 L100,0 L0,0 Z" fill={bgColor} />
            </svg>
          </div>

          {/* Consortia card grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 p-6">
            {consortia.map((partner, idx) => (
              <div
                key={idx}
                className="border border-gray-300 rounded-lg bg-white p-4 hover:shadow-md transition duration-200"
              >
                <div className="flex items-start gap-3">
                  <div className="w-32 h-20 shrink-0 border border-gray-200 bg-gray-100 rounded-md flex items-center justify-center text-center p-2 text-[10px] text-gray-600 font-semibold">
                    {placeholderLabel(partner.title)}
                  </div>
                  <div>
                    <h3 className="text-sm font-semibold text-gray-800 mb-1 leading-snug">
                      {partner.title}
                    </h3>
                    {partner.description && (
                      <p className="text-xs text-gray-600 leading-snug">
                        {partner.description}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
