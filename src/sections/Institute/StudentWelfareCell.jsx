import React from "react";
import { Link, useParams } from "react-router-dom";
import SafeImage from "../../components/SafeImage";
import RichTextRenderer from "../../components/RichTextRenderer";

/**
 * StudentWelfareCell — section_key: student_welfare_and_8objectives
 *
 * Data shape:
 *   header: {
 *     heading, description (HTML), src (image),
 *     label, cta_key, has_micro_page
 *   }
 *
 * Layout: heading, then description + image side-by-side, then a CTA button
 * (e.g. "8 Objectives") that opens the linked micro page.
 */
export default function StudentWelfareCell({
  data,
  college,
  pageSlug,
  instituteSlug,
  institute,
}) {
  const params = useParams();
  const header = data?.header || {};

  const { heading, description, src, label, cta_key, objectives } = header;

  // Background — dynamic (section_style.bg_color / header.bg_color) with a
  // warm cream default to match the design.
  const bgColor =
    data?.section_style?.bg_color || header.bg_color || "#fdf3e7";

  // Base slug for the micro-page link.
  const base =
    college ||
    pageSlug ||
    instituteSlug ||
    institute?.slug ||
    params.college ||
    params.slug ||
    "";

  return (
    <section
      className="py-12"
      style={bgColor ? { backgroundColor: bgColor } : undefined}
    >
      <div className="max-w-7xl mx-auto px-4">
      {heading && (
        <h2 className="heading">
          <hr className="heading-line" />
          {heading}
        </h2>
      )}

      <div className="flex flex-col md:flex-row items-center gap-10 mt-6">
        {/* Description */}
        {description && (
          <div className="w-full md:w-1/3 text-[#555555]">
            <RichTextRenderer html={description} />
          </div>
        )}

        {/* Image */}
        {src && (
          <div className="w-full md:w-1/2">
            <SafeImage
              src={src}
              alt={heading || "Student Welfare Cell"}
              className="w-full h-auto rounded-lg shadow-md object-cover"
            />
          </div>
        )}
      </div>

      {/* Objectives — centered block below the intro + image */}
      {objectives && (
        <div className="mt-12 max-w-4xl mx-auto text-center">
          <RichTextRenderer html={objectives} />
        </div>
      )}

      {/* CTA button → micro page */}
      {label && cta_key && (
        <div className="flex justify-center mt-6">
          <Link
            to={`/${base}/${cta_key}`}
            className="inline-block bg-[#91288D] hover:bg-[#132F5C] text-white font-semibold px-8 py-3 rounded-md transition-colors"
          >
            {label}
          </Link>
        </div>
      )}
      </div>
    </section>
  );
}
