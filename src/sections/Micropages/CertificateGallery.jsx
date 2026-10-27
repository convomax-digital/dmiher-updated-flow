import React, { useMemo, useState } from "react";
import { createPortal } from "react-dom";
import { Link, useParams, useLocation } from "react-router-dom";
import { FaEye, FaTimes } from "react-icons/fa";
import SafeImage from "../../components/SafeImage";

/* ================= CERTIFICATE GALLERY (section_id: certificate_gallery) =====
   Backend-driven port of the live-site "Accreditations & Recognitions" page
   (/iqac/accreditations-recognitions). The CMS emits:

     data.tabs[] = { title: "International (4)", key, certificates: [ … ] }

   and each certificate:
     { badge, badge_color, year, title, description, link_type,
       thumbnail?, certificate_images?, certificate_pdf?, cta? }

   The live page also exposed an "All" filter (frontend-computed) alongside the
   International / National tabs, so we prepend it here. Each card links via
   link_type:
     - "page" → internal micro-page route  /{college}/{cta.cta_key}
     - "pdf"  → certificate_pdf   (new tab)
     - "img"  → certificate_images (new tab)                                    */

/* Card thumbnail: an explicit `thumbnail` when the CMS provides one (page
   links), otherwise the certificate image itself (image links). Falsy → the
   SafeImage placeholder. */
const displayImage = (cert) => {
  if (cert?._disabled?.thumbnail) return "";
  return cert?.thumbnail || cert?.image || cert?.certificate_images || "";
};

/* Resolve the "View Certificate" target + whether it opens in a new tab.
   `basePath` is the current pathname (e.g. /iqac/accreditations-recognitions)
   so nested page links resolve to the full depth. */
const resolveLink = (cert, basePath) => {
  if (cert?.link_type === "page") {
    const ctaKey = cert?.cta?.cta_key;
    if (!ctaKey) return null;
    const cleanBase = basePath.replace(/\/+$/, "");
    return { href: `${cleanBase}/${ctaKey}`, external: false };
  }
  const pdfUrl = cert?.pdf || cert?.certificate_pdf;
  if (cert?.link_type === "pdf" || (!cert?.link_type && pdfUrl)) {
    if (pdfUrl) return { href: pdfUrl, external: true };
  }
  const img = cert?.image || cert?.certificate_images || cert?.thumbnail;
  if (img) return { href: img, external: true };
  if (pdfUrl) return { href: pdfUrl, external: true };
  return null;
};

/* Shared "View Certificate" button — an <a> for external assets, a <Link> for
   internal micro-pages. `variant` swaps the card vs. modal colour treatment. */
const ViewCertificateButton = ({ cert, base, variant = "card" }) => {
  const link = resolveLink(cert, base);
  if (!link) return null;

  const cls =
    variant === "modal"
      ? "w-full hover:bg-gray-100 bg-[#91288D] hover:text-gray-700 text-white py-2 px-4 rounded-lg transition-all duration-300 font-medium block text-center"
      : "w-full bg-gray-100 hover:bg-[#91288D] text-gray-700 hover:text-white py-2 px-4 rounded-lg transition-all duration-300 font-medium block text-center";

  return link.external ? (
    <a href={link.href} target="_blank" rel="noopener noreferrer" className={cls}>
      <FaEye className="inline-block mr-2 mb-0.5" />View Certificate
    </a>
  ) : (
    <Link to={link.href} className={cls}>
      <FaEye className="inline-block mr-2 mb-0.5" />View Certificate
    </Link>
  );
};

const CertCard = ({ cert, base, onPreview }) => {
  const hasImage = !!displayImage(cert);
  return (
    <div className="bg-white rounded-xl shadow-md hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 overflow-hidden group flex flex-col">
      {hasImage && (
        <div className="relative overflow-hidden">
          <SafeImage
            src={displayImage(cert)}
            alt={cert?.title || ""}
            className="w-full h-48 object-contain transition-transform duration-300 group-hover:scale-110"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300">
            <div className="absolute bottom-4 right-4">
              <button
                onClick={() => onPreview(cert)}
                className="bg-[#91288D] hover:bg-[#132F5C] text-white p-2 rounded-full transition-colors duration-300"
                aria-label="Preview certificate"
              >
                <FaEye className="w-5 h-5" />
              </button>
            </div>
          </div>
          {cert?.badge && (
            <div className="absolute top-4 left-4">
              <span
                className="px-3 py-1 rounded-full text-xs font-semibold text-white"
                style={{ backgroundColor: cert.badge_color || "#132F5C" }}
              >
                {cert.badge}
              </span>
            </div>
          )}
        </div>
      )}
      <div className="p-6 flex flex-col flex-1">
        <div className="flex justify-between items-start mb-2">
          <h3 className="font-bold text-lg text-gray-900 leading-tight">
            {cert?.title}
          </h3>
          {cert?.year && (
            <span className="text-[#91288D] font-bold text-sm bg-[#91288D]/10 px-2 py-1 rounded whitespace-nowrap ml-2">
              {cert.year}
            </span>
          )}
        </div>
        {cert?.description && (
          <p className="text-gray-600 text-sm mb-3 line-clamp-2">
            {cert.description}
          </p>
        )}
        <div className="mt-auto">
          <ViewCertificateButton cert={cert} base={base} variant="card" />
        </div>
      </div>
    </div>
  );
};

const CertModal = ({ cert, base, onClose }) => {
  if (typeof document === "undefined") return null;
  return createPortal(
  <div
    className="fixed inset-0 mt-0 md:mt-25 bg-black/50 flex items-center justify-center p-4 z-50"
    onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
  >
    <div className="bg-white rounded-xl max-w-xl w-full max-h-[75vh] overflow-y-auto">
      <div className="relative">
        <SafeImage
          src={displayImage(cert)}
          alt={cert?.title || ""}
          className="w-full h-64 object-contain rounded-t-2xl"
        />
        <button
          onClick={onClose}
          className="absolute top-4 right-4 bg-white/90 hover:bg-white p-2 rounded-full transition-colors duration-200"
          aria-label="Close"
        >
          <FaTimes className="w-4 h-4" />
        </button>
      </div>
      <div className="p-4">
        <div className="flex items-center gap-2 mb-2">
          {cert?.badge && (
            <span
              className="px-3 py-1 rounded-full text-sm font-semibold text-white"
              style={{ backgroundColor: cert.badge_color || "#132F5C" }}
            >
              {cert.badge}
            </span>
          )}
          {cert?.year && (
            <span className="text-[#91288D] font-bold bg-[#91288D]/10 px-3 py-1 rounded-full">
              {cert.year}
            </span>
          )}
        </div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">{cert?.title}</h2>
        <p className="text-gray-600 mb-2">{cert?.description}</p>
        <div className="flex justify-end items-center border-t pt-2">
          <div className="mt-auto">
            <ViewCertificateButton cert={cert} base={base} variant="modal" />
          </div>
        </div>
      </div>
    </div>
  </div>,
  document.body
);
};

const CertificateGallery = ({ data, college }) => {
  const params = useParams();
  const { pathname } = useLocation();
  const base = pathname.replace(/\/+$/, "") || `/${college || params.college || params.slug || ""}`;

  const gallery = data?.certificate_gallery || data;
  const layoutType = gallery?.layout_type || "tab";
  const tabs = Array.isArray(gallery?.tabs) ? gallery.tabs : [];
  const years = Array.isArray(gallery?.years) ? gallery.years : [];

  const filters = useMemo(() => {
    const all = tabs.flatMap((t) => (Array.isArray(t?.certificates) ? t.certificates : []));
    return [
      { key: "__all__", label: "All", certificates: all },
      ...tabs.map((t, i) => ({
        key: t?.key || `tab-${i}`,
        label: t?.title || t?.key || `Tab ${i + 1}`,
        certificates: Array.isArray(t?.certificates) ? t.certificates : [],
      })),
    ];
  }, [tabs]);

  const [activeKey, setActiveKey] = useState("__all__");
  const [selected, setSelected] = useState(null);

  if (!tabs.length && !years.length) return null;

  if (layoutType === "year") {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          {years.map((yearGroup, yi) => {
            const yearCerts = Array.isArray(yearGroup?.year_certificates) ? yearGroup.year_certificates : [];
            const flatCerts = Array.isArray(yearGroup?.certificates) ? yearGroup.certificates : [];
            const hasContent = yearCerts.length > 0 || flatCerts.length > 0;
            if (!hasContent) return null;
            return (
              <div key={yi} className="mb-12">
                {yearGroup.title && (
                  <h1 className="text-3xl md:text-4xl font-bold text-[#132F5C] text-center mb-2">
                    {yearGroup.title}
                  </h1>
                )}
                {yearGroup.subtitle && (
                  <p className="text-gray-600 text-center max-w-3xl mx-auto mb-10">
                    {yearGroup.subtitle}
                  </p>
                )}

                {yearCerts.length > 0
                  ? yearCerts.map((yc, yci) => {
                      const certs = Array.isArray(yc?.certificates) ? yc.certificates : [];
                      if (!certs.length) return null;
                      return (
                        <div key={yci} className="mb-10">
                          <h2 className="text-xl font-bold text-[#132F5C] mb-8 border-b-4 border-[#91288D] pb-2 inline-block">
                            {yc.year}
                          </h2>
                          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
                            {certs.map((cert, ci) => (
                              <CertCard key={ci} cert={cert} base={base} onPreview={setSelected} />
                            ))}
                          </div>
                        </div>
                      );
                    })
                  : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
                      {flatCerts.map((cert, ci) => (
                        <CertCard key={ci} cert={cert} base={base} onPreview={setSelected} />
                      ))}
                    </div>
                  )
                }
              </div>
            );
          })}
        </div>
        {selected && <CertModal cert={selected} base={base} onClose={() => setSelected(null)} />}
      </div>
    );
  }

  const activeFilter = filters.find((f) => f.key === activeKey) || filters[0];
  const certificates = activeFilter?.certificates || [];

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="flex flex-wrap justify-center gap-4 mb-12">
          {filters.map((f) => (
            <button
              key={f.key}
              onClick={() => setActiveKey(f.key)}
              className={`px-6 py-3 rounded-full font-semibold transition-all duration-300 ${
                activeKey === f.key
                  ? "bg-[#91288D] text-white shadow-lg transform scale-105"
                  : "bg-white text-gray-700 hover:bg-[#132F5C] hover:text-white shadow-md"
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
          {certificates.map((cert, index) => (
            <CertCard
              key={`${activeFilter.key}-${index}`}
              cert={cert}
              base={base}
              onPreview={setSelected}
            />
          ))}
        </div>
      </div>
      {selected && <CertModal cert={selected} base={base} onClose={() => setSelected(null)} />}
    </div>
  );
};

export default CertificateGallery;
