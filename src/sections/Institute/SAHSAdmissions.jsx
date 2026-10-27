import React from "react";
import { Link } from "react-router-dom";
import RichTextRenderer from "../../components/RichTextRenderer";

/**
 * SAHS International Admissions
 * ----------------------------------------------------------------------
 * Dedicated section for SAHS Wardha & Nagpur. Mirrors the live-site
 * `sections/SAHS/AdmissionsSAHS.jsx`:
 *   - red double-rule heading "International Admissions"
 *   - sub-heading "Your Gateway to a Global Healthcare Career"
 *   - overview + pipe-bullet paragraph (rich text)
 *   - "PROGRAMS OFFERED" + UG/PG pill buttons
 *   - blue CTA → external admissions URL
 *   - Email: international@dmiher.edu.in
 *
 * Data shape:
 * {
 *   heading, sub_heading, description,
 *   programs: [{ name, link }],
 *   cta_label, cta_link, email,
 * }
 */
export default function SAHSAdmissions({ data }) {
  if (!data) return null;

  // Header + CTA fields are nested (data.header.*, data.cta.*); keep flat fallbacks.
  const header = data.header || {};
  const cta = data.cta || {};

  const heading = header.heading || data.heading || "International Admissions";
  const subHeading =
    header.sub_heading ||
    data.sub_heading ||
    "Your Gateway to a Global Healthcare Career";
  const description = header.description || data.description || "";
  const programs = Array.isArray(data.programs) ? data.programs : [];
  const ctaLabel =
    cta.cta_label ||
    data.cta_label ||
    "Admission Process for International Students (Click here)";
  const ctaLink =
    cta.cta_link ||
    data.cta_link ||
    "https://www.dmiher.edu.in/international-admissions";
  const email = cta.email || data.email || "international@dmiher.edu.in";

  return (
    <section className="sahs-adm-section py-10 px-4 md:px-0 bg-white">
      <div className="mx-auto">
        {/* Heading w/ red lines */}
        <h2 className="sahs-adm-heading flex flex-wrap items-center justify-center sm:justify-between text-[#91288D] font-oswald-medium text-3xl tracking-wider uppercase mb-6 text-center">
          <hr className="hidden sm:block flex-grow border-t border-[#91288D]" />
          <span className="px-4 whitespace-normal text-3xl md:text-4xl">
            {heading}
          </span>
          <hr className="hidden sm:block flex-grow border-t border-[#91288D]" />
        </h2>

        {/* Sub-heading */}
        <h1 className="sahs-adm-subheading text-2xl sm:text-3xl md:text-4xl font-[500] font-oswald-medium text-[#555555] uppercase leading-snug mb-6 text-center">
          {subHeading}
        </h1>

        {/* Overview */}
        {description && (
          <div className="sahs-adm-description text-[#555555] font-[Arial] tracking-wide max-w-3xl mx-auto text-center">
            <RichTextRenderer html={description} />
          </div>
        )}

        {/* Programs Offered */}
        <div className="sahs-adm-programs mt-10 flex flex-col items-center">
          {programs.length > 0 && (
            <>
              <h3 className="text-xl font-bold text-[#91288D] mb-2 uppercase">
                Programs Offered
              </h3>
              <ul className="flex flex-wrap justify-center gap-8 mb-6">
                {programs.map((p, idx) => {
                  const isExternal = p.link?.startsWith("http");
                  const pill = (
                    <li className="sahs-adm-pill bg-[#F5F5F5] rounded-lg px-8 py-4 text-xl font-oswald-medium shadow hover:bg-[#F25022] hover:text-white cursor-pointer transition">
                      {p.name}
                    </li>
                  );
                  return isExternal ? (
                    <a
                      key={idx}
                      href={p.link}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      {pill}
                    </a>
                  ) : (
                    <Link key={idx} to={p.link || "#"}>
                      {pill}
                    </Link>
                  );
                })}
              </ul>
            </>
          )}

          <a
            href={ctaLink}
            target="_blank"
            rel="noopener noreferrer"
            className="sahs-adm-cta inline-block bg-[#269BFF] text-white px-8 py-2 rounded font-semibold text-base hover:bg-[#0055FF] transition mb-4"
          >
            {ctaLabel}
          </a>
          {email && (
            <div className="sahs-adm-email mt-2 text-[#555555] text-base">
              <span className="font-bold">Email:</span>{" "}
              <a
                href={`mailto:${email}`}
                className="underline text-[#269BFF] hover:text-[#91288D]"
              >
                {email}
              </a>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
