import React from "react";
import { Link } from "react-router-dom";
import SafeImage from "../../../components/SafeImage";

export default function ClinicalResearch({ data, pageSlug, instituteSlug }) {
  const slug = pageSlug || instituteSlug;
  if (!data) return null;

  const basic = data.basic || {};
  const { title, subtitle, image, image_alt, cta } = basic;

  return (
    <div className="infograph-section">
      <div className="infograph-container">

        {/* Image */}
        <div className="infograph-image">
          <SafeImage src={image} alt={image_alt || title || "Clinical Research"} />
        </div>

        {/* Content */}
        <div className="infograph-content">

          {title && (
            <h2 className="heading">
              <hr className="heading-line" />
              {title}
            </h2>
          )}

          {subtitle && (
            <h3 className="infograph-subtitle">{subtitle}</h3>
          )}

          {cta?.label && (cta.cta_key || cta.key) && slug && (
            <Link
              to={`/${slug}/${cta.cta_key || cta.key}`}
              className="mt-2 mb-4 px-6 py-2 inline-block bg-[#91288D] hover:bg-[#132F5C] hover:scale-105 transition-transform duration-200 text-white rounded font-semibold"
            >
              {cta.label}
            </Link>
          )}

        </div>
      </div>
    </div>
  );
}
