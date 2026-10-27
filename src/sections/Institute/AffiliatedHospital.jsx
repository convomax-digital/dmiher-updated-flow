import React from "react";
import SafeImage from "../../components/SafeImage";
import resolveImage from "../../utils/resolveImage";
import RichTextRenderer from "../../components/RichTextRenderer";

/**
 * AffiliatedHospital — "AFFILIATED HOSPITALS" section.
 *
 * Section key: affiliated_hospital_section
 * Data shape:
 *   {
 *     header:  { heading: "AFFILIATED HOSPITALS" },
 *     content: {
 *       description: "<p>...</p>",   // rich text (title + paragraph)
 *       image:       "assets/.../1.jpg" | null,
 *       link:        "https://...",   // CTA target
 *       label:       "AVBRH Hospital",// CTA label
 *       bg_color:    "#FAF1F9"        // content-box background
 *     }
 *   }
 *
 * Layout: image on the left, a coloured content box (description + CTA) on the
 * right. Stacks vertically on mobile. When no image is set the content box
 * spans the full width.
 */
export default function AffiliatedHospital({ data }) {
  if (!data) return null;

  const heading = data?.header?.heading;
  const content = data?.content || {};

  const { description = "", image, link, label, bg_color } = content;
  const hasImage = !!image;

  return (
    <section className="container px-4 py-10 mx-auto">
      {heading && (
        <h2 className="heading">
          <hr className="heading-line" />
          {heading}
        </h2>
      )}

      <div className="flex flex-col md:flex-row rounded-md overflow-hidden shadow-sm mt-6 max-w-5xl mx-auto">
        {/* Image */}
        {hasImage && (
          <div className="w-full md:w-1/2">
            <SafeImage
              src={resolveImage(image)}
              alt={label || heading || "Hospital"}
              className="w-full h-full object-cover"
            />
          </div>
        )}

        {/* Content */}
        <div
          className={`w-full ${hasImage ? "md:w-1/2" : ""} p-8 flex flex-col justify-center`}
          style={{ background: bg_color || "#FAF1F9" }}
        >
          {description && <RichTextRenderer html={description} />}

          {link && label && (
            <a
              href={link}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-block self-start mt-4 bg-[#91288D] hover:bg-[#132F5C] text-white font-semibold px-6 py-3 rounded-md transition-colors"
            >
              {label}
            </a>
          )}
        </div>
      </div>
    </section>
  );
}
