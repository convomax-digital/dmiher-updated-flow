import React from "react";
import { Link } from "react-router-dom";
import icon from "../../../public/programicon.png";
import SafeImage from "../../components/SafeImage";

function Programs({ data }) {

  if (!data) return null;

  const heading = data?.header?.heading;
  const bgColor = data?.header?.color || "#122E5E";
  const heading_color = data?.header?.heading_color || "#122E5E";


  // function to generate slug if API missing it
  const createSlug = (text) =>
    text?.toLowerCase().replace(/\s+/g, "-");

  return (
    <div className="py-15" style={{ backgroundColor: bgColor }}>
      <div className="container">

        {/* Heading */}
        <div className="text-white mb-8">
          <h2 className="heading" style={{ color: heading_color }}> <hr className="heading-line" />
            {heading}
          </h2>
        </div>

        {/* Grid */}
        <div className="programs-section-grid">

          {data?.programs?.map((program, index) => {

            // Resolve where the card points:
            //  • tab_type "url"  → use the custom `link` as-is (e.g. "/sel-sc"
            //    or a full external URL like "https://...").
            //  • tab_type "link" (default) → internal /programs/{page_slug}.
            const isCustomUrl = program.tab_type === "url" && program.link;
            const destination = isCustomUrl
              ? program.link
              : `/programs/${program.page_slug || createSlug(program.title)}`;
            const isExternal = /^https?:\/\//i.test(destination);

            const cardInner = (
              <>
                <SafeImage
                  src={program.image}
                  alt={program.title}
                  className="program-image"
                />

                <div className="program-content">
                  <h6 className="program-title">
                    {program.title}
                  </h6>

                  <div className="program-icon-wrapper">
                    <img
                      src={icon}
                      alt="icon"
                      className="program-icon"
                    />
                  </div>
                </div>
              </>
            );

            const commonProps = {
              className: "program-card",
              style: { background: program.color },
            };

            // External links open in a new tab; everything else routes
            // client-side through React Router.
            return isExternal ? (
              <a
                key={index}
                href={destination}
                target="_blank"
                rel="noopener noreferrer"
                {...commonProps}
              >
                {cardInner}
              </a>
            ) : (
              <Link key={index} to={destination} {...commonProps}>
                {cardInner}
              </Link>
            );
          })}

        </div>
      </div>
    </div>
  );
}

export default Programs;