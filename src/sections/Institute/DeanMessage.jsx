import React, { useState } from "react";
import RichTextRenderer from "../../components/RichTextRenderer";
import ViewMoreButton from "../../components/UI/Buttons";
import SafeImage from "../../components/SafeImage";

const DeansMessage = ({ data, pageSlug, college }) => {
  const [expanded, setExpanded] = useState(false);

  if (!data) return null;

  const main = data.main || {};
  const paragraphs = data.paragraphs || [];
  const moreParagraphs = data.view_more_paragraphs || [];
  const contentItems = Array.isArray(data.content) ? data.content : [];

  // Extract button and view items from new content array
  const buttonContent = contentItems.find((c) => c.tab_type === "button");
  const viewContent = contentItems.find((c) => c.tab_type === "view");

  // Old format fallback
  const cta = data.cta || {};

  // Resolve the college slug for building the CTA link
  const resolvedSlug = college || pageSlug;

  // CTA LINK: /{college}/{cta_key}  e.g. /jnmc/deanKnowMore
  const ctaLink =
    cta?.has_micro_page && cta?.cta_key && resolvedSlug
      ? `/${resolvedSlug}/${cta.cta_key}`
      : null;

  return (
    <div className="deans-section">
      <div className="container">

        {/* ================= HEADING ================= */}
        {main.heading && (
          <h2 className="deans-heading">
            <div className="deans-heading-line"></div>
            {main.heading}
          </h2>
        )}

        <div className="deans-layout">

          {/* ================= IMAGE ================= */}
          <div className="deans-image-wrapper">
            <SafeImage
              src={main.img}
              alt={main.dean_name || "Dean"}
              className="deans-image"
            />

            {main.desc && (
              <div className="deans-info text-white">
                <RichTextRenderer html={main.desc} />
              </div>
            )}

            
            {buttonContent?.cta?.length > 0 && (
              <div className="mt-4 flex flex-col items-center lg:items-start gap-3 text-white">
                {buttonContent.cta
                  .map((btn, i) => {
                    const btnLink =
                      btn.cta_key && resolvedSlug
                        ? `/${resolvedSlug}/${btn.cta_key}`
                        : null;
                    if (!btnLink || !btn.label) return null;
                    return (
                      <ViewMoreButton
                        key={i}
                        href={btnLink}
                        label={btn.label}
                        className="!my-0 inline-block w-fit"
                      />
                    );
                  })
                  .filter(Boolean)}
              </div>
            )}
          </div>

          {/* ================= MESSAGE ================= */}
          <div className="deans-message">

            {/* DEFAULT PARAGRAPHS */}
            {paragraphs.map((item, i) => (
              <div key={i} className="deans-paragraph">
                <RichTextRenderer html={item.desc} />
              </div>
            ))}

            {/* EXPAND CONTENT */}
            {expanded &&
              moreParagraphs.map((item, i) => (
                <div key={i} className="deans-paragraph">
                  <RichTextRenderer html={item.desc} />
                </div>
              ))}

            {/* ================= VIEW MORE (new content format) ================= */}
            {viewContent?.description && (
              <>
                {expanded && (
                  <div className="deans-paragraph">
                    <RichTextRenderer html={viewContent.description} />
                  </div>
                )}
                <ViewMoreButton
                  onClick={() => setExpanded(!expanded)}
                  label={expanded ? "Read Less" : "Read More"}
                />
              </>
            )}

            {/* ================= OLD FORMAT VIEW MORE ================= */}
            {!viewContent && !buttonContent && (
              <>
                {ctaLink ? (
                  <ViewMoreButton
                    href={ctaLink}
                    label={cta.cta_label || "View More"}
                  />
                ) : (
                  moreParagraphs.length > 0 && (
                    <ViewMoreButton
                      onClick={() => setExpanded(!expanded)}
                      label={expanded ? "Read Less" : "Read More"}
                    />
                  )
                )}
              </>
            )}

          </div>
        </div>
      </div>
    </div>
  );
};

export default DeansMessage;
