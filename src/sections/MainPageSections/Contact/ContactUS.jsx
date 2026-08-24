import React, { useState } from "react";
// Curated FA icon maps (only the icons the contact page can render) — importing
// the full `react-icons/fa` + `fa6` namespaces shipped the entire ~1.3 MB icon
// set into this chunk. See utils/contactFaIcons.js.
import { fa6Map, faMap } from "../../../utils/contactFaIcons";

const toFaName = (name) => {
  if (!name || typeof name !== "string") return null;
  return (
    "Fa" +
    name
      .split(/[-_\s]+/)
      .filter(Boolean)
      .map((s) => s.charAt(0).toUpperCase() + s.slice(1).toLowerCase())
      .join("")
  );
};

const resolveFaIcon = (name) => {
  const key = toFaName(name);
  if (!key) return null;
  return fa6Map[key] || faMap[key] || null;
};

const DynamicIcon = ({ name, fallback: Fallback, className }) => {
  const IconCmp = resolveFaIcon(name);
  if (IconCmp) return <IconCmp className={className} />;
  if (Fallback) return <Fallback className={className} />;
  return null;
};

const ICON_FALLBACKS = [fa6Map.FaMapPin, fa6Map.FaEnvelope, fa6Map.FaPhone];

const renderHtml = (value) => ({ __html: value || "" });
const isHtml = (value) =>
  typeof value === "string" && /<\/?[a-z][\s\S]*>/i.test(value);

const extractMapUrl = (raw) => {
  if (!raw || typeof raw !== "string") return "";
  let value = raw
    .trim()
    .replace(/&amp;/g, "&")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .trim();

  if (value.toLowerCase().includes("<iframe")) {
    const quoted = value.match(/src\s*=\s*["']([^"']+)["']/i);
    if (quoted && quoted[1]) return quoted[1].trim();
    const urlMatch = value.match(
      /https?:\/\/[^\s"'<>]*google\.[^/\s]*\/maps[^\s"'<>]*/i,
    );
    if (urlMatch) return urlMatch[0];
  }

  if (value.startsWith("<")) return "";
  return value;
};

const toMapEmbedUrl = (raw) => {
  const value = extractMapUrl(raw);
  if (!value) return "";
  if (value.includes("google.") && value.includes("/maps/embed")) return value;
  return `https://maps.google.com/maps?q=${encodeURIComponent(value)}&output=embed`;
};

const SectionHeading = ({ children }) => (
  <h2 className="contact-section-heading">
    <hr className="contact-section-heading-line" />
    {children}
  </h2>
);

const ContactCard = ({ item, index, variant }) => {
  const iconClass =
    variant === "admission" ? "contact-admission-icon" : "contact-info-icon";
  const textClass =
    variant === "admission"
      ? "contact-admission-link-plain"
      : "contact-info-text";

  return (
    <div
      className={
        variant === "admission"
          ? index === 0
            ? "contact-admission-item-first"
            : index === 1
              ? "contact-admission-item-mid"
              : "contact-admission-item-last"
          : index === 1
            ? "contact-info-item-bordered"
            : "contact-info-item"
      }
    >
      <DynamicIcon
        name={item?.icon}
        fallback={ICON_FALLBACKS[index] || ICON_FALLBACKS[0]}
        className={iconClass}
      />
      {isHtml(item?.address) ? (
        <div
          className={textClass}
          dangerouslySetInnerHTML={renderHtml(item?.address)}
        />
      ) : (
        <p className={textClass}>{item?.address || ""}</p>
      )}
    </div>
  );
};

export default function CombinedSection({ data }) {
  const [activeTab, setActiveTab] = useState("main");

  const tabsArray = Array.isArray(data?.tabs) ? data.tabs : [];
  const mainTab =
    tabsArray.find((t) => t?.tab_type === "main") || tabsArray[0] || {};
  const offTab =
    tabsArray.find((t) => t?.tab_type === "off") || tabsArray[1] || {};

  const tabByKey = { main: mainTab, off: offTab };

  const hospitalsArray = Array.isArray(data?.hospitals) ? data.hospitals : [];
  const mainHospital =
    hospitalsArray.find((h) => h?.tab_type === "main") ||
    hospitalsArray[0] ||
    {};
  const offHospital =
    hospitalsArray.find((h) => h?.tab_type === "off") ||
    hospitalsArray[1] ||
    {};
  const hospitalByKey = { main: mainHospital, off: offHospital };

  const importantContactsHtml =
    (data?.important_contacts && typeof data.important_contacts === "object"
      ? data.important_contacts.address
      : "") || "";
  const importantContactsList = Array.isArray(data?.important_contacts)
    ? data.important_contacts
    : [];

  const activeTabData = tabByKey[activeTab] || {};
  const contactItems = Array.isArray(activeTabData.contact)
    ? activeTabData.contact
    : [];
  const admissionItems = Array.isArray(activeTabData.admission)
    ? activeTabData.admission
    : [];
  const activeHospital = hospitalByKey[activeTab] || {};

  return (
    <>
      {/* ================= 1. CONTACT TABS ================= */}
      <div className="contact-tabs-wrapper">
        <div className="contact-tabs-row">
          <div className="contact-tabs-inner">
            <button
              onClick={() => setActiveTab("main")}
              className={`contact-tab-btn ${
                activeTab === "main"
                  ? "contact-tab-active"
                  : "contact-tab-inactive"
              }`}
            >
              Main Campus
            </button>
            <button
              onClick={() => setActiveTab("off")}
              className={`contact-tab-btn ${
                activeTab === "off"
                  ? "contact-tab-active"
                  : "contact-tab-inactive"
              }`}
            >
              Off Campus
            </button>
          </div>
        </div>

        <div className="contact-tab-content">
          <div className="contact-info-grid">
            {contactItems.slice(0, 3).map((item, idx) => (
              <ContactCard
                key={`contact-${activeTab}-${idx}`}
                item={item}
                index={idx}
                variant="info"
              />
            ))}
          </div>

          {(() => {
            const embedSrc = toMapEmbedUrl(activeTabData.map_url);
            if (!embedSrc) return null;
            return (
              <div className="contact-map-wrap">
                <iframe
                  src={embedSrc}
                  width="100%"
                  height="100%"
                  style={{ border: 0 }}
                  className="contact-map-iframe"
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                  allowFullScreen
                  title={`map-${activeTab}`}
                />
              </div>
            );
          })()}
        </div>
      </div>

      {/* ================= 2. ADMISSION ================= */}
      {admissionItems.length > 0 && (
        <div className="contact-admission-section">
          <div className="contact-admission-inner">
            <div className="contact-admission-heading-wrap">
              <SectionHeading>ADMISSION</SectionHeading>
            </div>

            <div className="contact-admission-grid">
              {admissionItems.slice(0, 3).map((item, idx) => (
                <ContactCard
                  key={`admission-${activeTab}-${idx}`}
                  item={item}
                  index={idx}
                  variant="admission"
                />
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ================= 3. IMPORTANT CONTACTS ================= */}
      {(importantContactsHtml || importantContactsList.length > 0) && (
        <div className="contact-important-section">
          <SectionHeading>IMPORTANT CONTACTS</SectionHeading>

          {importantContactsHtml ? (
            <div
              className="contact-important-html"
              dangerouslySetInnerHTML={renderHtml(importantContactsHtml)}
            />
          ) : (
            <>
              <div className="contact-important-grid-desktop">
                <div className="contact-important-names">
                  {importantContactsList.map((item, i) => (
                    <p key={i}>{item.name}</p>
                  ))}
                </div>
                <div className="contact-important-emails">
                  {importantContactsList.map((item, i) => (
                    <p key={i}>{item.email}</p>
                  ))}
                </div>
              </div>
              <div className="contact-important-grid-mobile">
                {importantContactsList.map((person, idx) => (
                  <div key={idx} className="contact-important-mobile-item">
                    <p>{person.name}</p>
                    <p className="contact-important-mobile-email">
                      {person.email}
                    </p>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      )}

      {/* ================= 4. HOSPITALS ================= */}
      {(activeHospital.heading || activeHospital.address) && (
        <div className="contact-hospital-section">
          <SectionHeading>
            {activeHospital.heading || "HOSPITALS"}
          </SectionHeading>

          {isHtml(activeHospital.address) ? (
            <div
              className="contact-hospital-text"
              dangerouslySetInnerHTML={renderHtml(activeHospital.address)}
            />
          ) : (
            <p className="contact-hospital-text">{activeHospital.address}</p>
          )}
        </div>
      )}
    </>
  );
}
