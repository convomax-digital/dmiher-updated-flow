import React from "react";
import SafeImage from "../../components/SafeImage";
import resolveImage from "../../utils/resolveImage";
import RichTextRenderer from "../../components/RichTextRenderer";

/**
 * NursingCollegeBrief — unique per-college brief shown between the campus
 * tabs and the Dean's Message on every Nursing page.
 *
 * Section key: nursing_college_brief
 *
 * New data shape (fields nested under `content`):
 *   {
 *     content: {
 *       description: "<h3>...</h3><p>...</p>",  // rich text (title + paragraph)
 *       image:       "assets/.../1.png",
 *       reverse:     true   // optional — true reverses (image left, text right)
 *     }
 *   }
 *
 * Legacy shape (title_line1 / title_line2 / para at the root) is still
 * supported as a fallback.
 */
export default function NursingCollegeBrief({ data }) {
  if (!data) return null;

  // New shape nests everything under `content`; fall back to the root for legacy.
  const content = data.content || data;

  const description = content.description || "";
  const image = content.image || "";
  const reverse = content.reverse || false;

  return (
    <div
      className={
        "container px-4 py-10 flex flex-col md:flex-row items-center justify-center gap-8 transition " +
        (reverse ? "md:flex-row-reverse" : "")
      }
    >
      {/* Text */}
      <div className="w-full md:w-1/2">
        {description ? (
          <RichTextRenderer html={description} />
        ) : (
          // Legacy fallback: separate title lines + plain paragraph.
          <>
            <h3 className="text-[#132F5C] font-oswald-medium text-2xl font-bold mb-4">
              {content.title_line1}
              {content.title_line2 && (
                <>
                  <br />
                  {content.title_line2}
                </>
              )}
            </h3>
            <p className="text-[#555555] text-base mb-6">{content.para}</p>
          </>
        )}
      </div>

      {/* Image */}
      {image && (
        <div className="w-full md:w-1/2 rounded-md overflow-hidden shadow-lg">
          <SafeImage
            src={resolveImage(image)}
            alt="College"
            className="w-full h-auto object-cover"
          />
        </div>
      )}
    </div>
  );
}
