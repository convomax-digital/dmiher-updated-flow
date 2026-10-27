import React from "react";
import RichTextRenderer from "../../../../components/RichTextRenderer";
import { renderIcon } from "../../../../utils/renderIcon";

/**
 * Shared primitives for the Controller-of-Examination (COE) dedicated subpages
 * (Code of Conduct, Form Submission Process, Student Enrollment Process).
 *
 * Markup + classes mirror the live-site Examinations pages 1:1
 * (live: src/pages/MicroPages/Examinations/*.jsx) so the dynamic pages are a
 * visual carbon copy; only the content is backend-driven. String icon names
 * resolve to lucide via renderIcon; HTML fields render through RichTextRenderer.
 */

export const arr = (v) => (Array.isArray(v) ? v : []);

/* Navy header banner — icon + heading + subtitle (live-site "Header Section"). */
export function CoeHero({ hero = {} }) {
  if (!hero.heading && !hero.subtitle) return null;
  return (
    <div className="bg-[#132F5C] text-white py-12 px-4">
      <div className="max-w-4xl mx-auto text-center">
        <div className="flex items-center justify-center mb-4">
          {hero.icon && (
            <span className="mr-4 shrink-0">{renderIcon(hero.icon, 48, "")}</span>
          )}
          {hero.heading && (
            <h1 className="text-4xl md:text-5xl font-bold">{hero.heading}</h1>
          )}
        </div>
        {hero.subtitle && <p className="text-xl opacity-90">{hero.subtitle}</p>}
      </div>
    </div>
  );
}

/* Navy section heading with an accent icon (live-site "text-2xl font-bold" h2). */
export function SectionTitle({ title, icon, big = false }) {
  if (!title) return null;
  const size = big ? "text-3xl" : "text-2xl";
  const iconPx = big ? 32 : 24;
  return (
    <h2
      className={`${size} font-bold text-[#132F5C] mb-6 flex items-center`}
    >
      {icon && <span className="mr-2 shrink-0">{renderIcon(icon, iconPx, "")}</span>}
      {title}
    </h2>
  );
}

/* Gray callout with a navy left border — used for overview / definition boxes. */
export function GrayCallout({ title, icon, description, html = true, big = false }) {
  if (!title && !description) return null;
  const size = big ? "text-3xl" : "text-2xl";
  const iconPx = big ? 32 : 24;
  return (
    <div className="bg-gray-50 rounded-lg p-8 border-l-4 border-[#132F5C]">
      {title && (
        <h2 className={`${size} font-bold text-[#132F5C] mb-4 flex items-center`}>
          {icon && (
            <span className="mr-3 shrink-0">{renderIcon(icon, iconPx, "")}</span>
          )}
          {title}
        </h2>
      )}
      {description &&
        (html ? (
          <RichTextRenderer
            className="text-gray-700 leading-relaxed text-lg"
            html={description}
          />
        ) : (
          <p className="text-gray-700 leading-relaxed text-lg">{description}</p>
        ))}
    </div>
  );
}

/* White card with a bold navy title + HTML/child body (live-site card). */
export function WhiteCard({ title, icon, children }) {
  return (
    <div className="bg-white rounded-lg shadow-md p-6 border hover:shadow-lg transition-shadow duration-300">
      {title && (
        <h3 className="text-lg font-semibold text-[#132F5C] mb-3 flex items-center">
          {icon && <span className="mr-2 shrink-0">{renderIcon(icon, 20, "")}</span>}
          {title}
        </h3>
      )}
      {children}
    </div>
  );
}

/* Contact-note box (gray, navy left border) — live-site "Need Help/Clarification". */
export function ContactNote({ note = {} }) {
  if (!note.title && !note.description) return null;
  return (
    <div className="bg-gray-50 rounded-lg p-6 border-l-4 border-[#132F5C]">
      {note.title && (
        <h3 className="text-lg font-semibold text-[#132F5C] mb-3">{note.title}</h3>
      )}
      {note.description && <p className="text-gray-700">{note.description}</p>}
    </div>
  );
}
