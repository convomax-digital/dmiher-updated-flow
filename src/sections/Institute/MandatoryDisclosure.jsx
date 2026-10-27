import React, { useState } from "react";
import { Link, useParams } from "react-router-dom";
import * as LucideIcons from "lucide-react";
import { createPortal } from "react-dom";
import { mandatoryDisclosureConfig } from "../../instituteSections/mandatoryDisclosure";

function toPascalCase(str) {
  return str
    .split(/[-_\s]+/)
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase())
    .join("");
}

function BoxIcon({ name, size = 20 }) {
  const Icon = LucideIcons[toPascalCase(name)];
  if (!Icon) return null;
  return <Icon size={size} />;
}

function PdfPopup({ item, onClose }) {
  if (typeof document === "undefined") return null;
  return createPortal(
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-2xl shadow-xl p-6 max-w-lg w-full mx-4"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-5">
          <h3 className="text-lg font-bold text-[#91288D]">{item.label}</h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 text-2xl leading-none cursor-pointer"
          >
            &times;
          </button>
        </div>
        <div className="grid grid-cols-2 gap-3">
          {(item.popup_pdfs || []).map((pdf, i) => (
            <a
              key={i}
              href={pdf.file}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-2 bg-[#132F5C] text-white rounded-lg px-4 py-3 text-sm font-medium hover:bg-[#1a3f7a] transition-colors"
            >
              <LucideIcons.FileText size={16} />
              {pdf.label}
            </a>
          ))}
        </div>
      </div>
    </div>,
    document.body
  );
}

export default function MandatoryDisclosure({
  data,
  college,
  instituteSlug,
  pageSlug,
}) {
  const params = useParams();
  const [popupItem, setPopupItem] = useState(null);

  if (!data) return null;

  const header = data.header || {};
  const displayType = header.display_type || "text";
  const slug =
    college || instituteSlug || pageSlug || params.college || params.slug || "";

  if (displayType === "boxes") {
    const items = data.boxes?.items || [];

    return (
      <section className="py-10">
        <div className="container">
          <h2 className="heading">
            <hr className="heading-line" />
            {header.heading}
          </h2>

          <div className="flex flex-wrap justify-left gap-4 mt-6">
            {items.map((item, i) => {
              const inner = (
                <div className="font-oswald-medium flex items-center gap-2.5 px-6 py-3 bg-[#b8e6fe] text-[#91288D] rounded-lg font-normal text-sm sm:text-base hover:bg-[#91288D] hover:text-[#fff] transition-colors cursor-pointer">
                  <span className="text-[#132F5C]">{item.icon && <BoxIcon name={item.icon} size={18} />}</span>
                  
                  {item.label}
                </div>
              );

              if (item.link_type === "popup") {
                return (
                  <button
                    key={i}
                    onClick={() => setPopupItem(item)}
                    className="cursor-pointer"
                  >
                    {inner}
                  </button>
                );
              }

              if (item.link_type === "pdf" && item.pdf_file) {
                return (
                  <a
                    key={i}
                    href={item.pdf_file}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    {inner}
                  </a>
                );
              }

              const url = item.external_url || "";
              const isExternal = url.startsWith("http");
              if (isExternal) {
                return (
                  <a
                    key={i}
                    href={url}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    {inner}
                  </a>
                );
              }

              return (
                <Link key={i} to={`/${slug}/${url}`}>
                  {inner}
                </Link>
              );
            })}
          </div>
        </div>

        {popupItem && (
          <PdfPopup item={popupItem} onClose={() => setPopupItem(null)} />
        )}
      </section>
    );
  }

  const textCta = data.text_cta || data.content || {};
  const ctaKey = textCta.cta_key || header.cta_key || "mandatory-disclosure";
  const targetUrl =
    textCta.url || mandatoryDisclosureConfig.buildRoutePath(slug, ctaKey !== "mandatory-disclosure" ? ctaKey : undefined);
  const linkText =
    textCta.label || textCta.link_text || header.label || "View All Disclosures";
  const ctaText = textCta.cta_text || "";

  return (
    <section className="py-10">
      <div className="container">
        <h2 className="heading">
          <hr className="heading-line" />
          {header.heading}
        </h2>
        <div className="inst-md-row">
          <div className="inst-md-cell">
            <Link
              to={targetUrl}
              className="text-base md:text-xl tracking-wide font-oswald-medium text-gray-600 rounded-md font-[400] hover:bg-blue-100 transition text-center py-2"
            >
              {linkText}
              {ctaText && (
                <>
                  {" "}
                  <span className="font-[400] underline">{ctaText}</span>
                </>
              )}
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
