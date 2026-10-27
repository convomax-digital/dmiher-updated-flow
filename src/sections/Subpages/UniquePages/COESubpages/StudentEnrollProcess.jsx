import React from "react";
import { Download } from "lucide-react";
import { renderIcon } from "../../../../utils/renderIcon";
import RichTextRenderer from "../../../../components/RichTextRenderer";
import resolveImage from "../../../../utils/resolveImage";
import {
  arr,
  CoeHero,
  SectionTitle,
  GrayCallout,
  WhiteCard,
} from "./CoeBlocks";

/**
 * Student Enrollment Process — section_id `student_enroll_process`.
 * Backend-driven carbon copy of live-site Examinations/StudentEnrollProcess.jsx.
 */

/* Coloured notice box (yellow / red) — fixed per section like the live site. */
function NoticeBox({ tone, icon, title, description }) {
  const t =
    tone === "red"
      ? {
          box: "bg-red-50 border-red-400",
          icon: "text-red-600",
          head: "text-red-800",
          body: "text-red-700",
        }
      : {
          box: "bg-yellow-50 border-yellow-400",
          icon: "text-yellow-600",
          head: "text-yellow-800",
          body: "text-yellow-700",
        };
  return (
    <div className={`${t.box} border-l-4 p-6 rounded-lg`}>
      <div className="flex items-center mb-2">
        {icon && (
          <span className={`mr-2 shrink-0 ${t.icon}`}>
            {renderIcon(icon, 20, "")}
          </span>
        )}
        {title && (
          <h3 className={`text-lg font-semibold ${t.head}`}>{title}</h3>
        )}
      </div>
      {description &&
        (/[<][a-z]/i.test(description) ? (
          <RichTextRenderer className={t.body} html={description} />
        ) : (
          <p className={t.body}>{description}</p>
        ))}
    </div>
  );
}

// Save the file to the user's system instead of opening a tab. The files sit
// on the admin domain (cross-origin), where a plain `download` attribute is
// ignored — so fetch as a blob and trigger the save with the label as the
// filename. Falls back to opening in a new tab if the fetch fails.
const saveFile = async (e, url, label) => {
  e.preventDefault();
  try {
    const res = await fetch(url);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    let blob = await res.blob();

    // The file endpoint often sends a generic/wrong content-type (text/html,
    // octet-stream), which makes the browser save the file as .html. Sniff
    // the actual bytes: a real PDF always starts with "%PDF" — if so, force
    // the .pdf name and type regardless of what the server claimed.
    const head = new Uint8Array(await blob.slice(0, 5).arrayBuffer());
    const isPdf = String.fromCharCode(...head).startsWith("%PDF");

    const extMap = {
      "application/pdf": ".pdf",
      "image/jpeg": ".jpg",
      "image/png": ".png",
      "image/webp": ".webp",
    };
    let ext = extMap[blob.type] || "";
    if (isPdf) {
      ext = ".pdf";
      blob = new Blob([blob], { type: "application/pdf" });
    } else if (!ext && blob.type === "text/html") {
      // Not a PDF and the server sent an HTML page (viewer/error) — saving
      // it would give the user a junk .html file; open it instead.
      window.open(url, "_blank", "noopener");
      return;
    }

    const objectUrl = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = objectUrl;
    a.download = `${label || "download"}${ext}`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(objectUrl);
  } catch {
    window.open(url, "_blank", "noopener");
  }
};

export default function StudentEnrollProcess({ data = {} }) {
  const {
    hero = {},
    student_definition = {},
    eligibility = {},
    application_process = {},
    important_notice = {},
    submission_procedure = {},
    late_application_policy = {},
    enrollment_restrictions = {},
    fee_structure = {},
    contact_note = {},
    downloads,
  } = data;

  const appCards = arr(application_process.cards);
  const subCols = arr(submission_procedure.columns);
  const feeCards = arr(fee_structure.cards);
  const dls = arr(downloads);

  if (!data.hero && !data.student_definition && !data.eligibility) return null;

  return (
    <div className="min-h-screen bg-white">
      <CoeHero hero={hero} />

      <div className="container py-12">
        {/* Definition */}
        {(student_definition.title || student_definition.description) && (
          <section className="mb-12">
            <GrayCallout
              title={student_definition.title}
              icon={student_definition.icon}
              description={student_definition.description}
            />
          </section>
        )}

        {/* Eligibility */}
        {(eligibility.title || eligibility.description) && (
          <section className="mb-12">
            <SectionTitle title={eligibility.title} icon={eligibility.icon} />
            {eligibility.description && (
              <WhiteCard>
                <RichTextRenderer
                  className="text-gray-700 leading-relaxed"
                  html={eligibility.description}
                />
              </WhiteCard>
            )}
          </section>
        )}

        {/* Application process */}
        {appCards.length > 0 && (
          <section className="mb-12">
            <SectionTitle
              title={application_process.section_title}
              icon={application_process.section_icon}
            />
            <div className="space-y-6">
              {appCards.map((c, i) => (
                <WhiteCard key={i}>
                  <RichTextRenderer html={c.description} />
                </WhiteCard>
              ))}
            </div>
          </section>
        )}

        {/* Important notice (yellow) */}
        {(important_notice.title || important_notice.description) && (
          <section className="mb-12">
            <NoticeBox
              tone="yellow"
              icon={important_notice.icon}
              title={important_notice.title}
              description={important_notice.description}
            />
          </section>
        )}

        {/* Submission procedure */}
        {subCols.length > 0 && (
          <section className="mb-12">
            <SectionTitle
              title={submission_procedure.section_title}
              icon={submission_procedure.section_icon}
            />
            <div className="grid md:grid-cols-2 gap-6">
              {subCols.map((col, i) => (
                <WhiteCard key={i} title={col.title}>
                  {col.text && <RichTextRenderer html={col.text} />}
                </WhiteCard>
              ))}
            </div>
          </section>
        )}

        {/* Late application policy (red) */}
        {(late_application_policy.title || late_application_policy.text) && (
          <section className="mb-12">
            <NoticeBox
              tone="red"
              icon={late_application_policy.icon}
              title={late_application_policy.title}
              description={late_application_policy.text}
            />
          </section>
        )}

        {/* Enrollment restrictions */}
        {(enrollment_restrictions.title || enrollment_restrictions.subtitle) && (
          <section className="mb-12">
            <SectionTitle title={enrollment_restrictions.title} />
            {enrollment_restrictions.subtitle && (
              <WhiteCard>
                <RichTextRenderer html={enrollment_restrictions.subtitle} />
              </WhiteCard>
            )}
          </section>
        )}

        {/* Fee structure */}
        {feeCards.length > 0 && (
          <section className="mb-12">
            <SectionTitle title={fee_structure.section_title} />
            <div className="grid md:grid-cols-2 gap-6">
              {feeCards.map((c, i) => (
                <WhiteCard key={i}>
                  <RichTextRenderer html={c.description} />
                </WhiteCard>
              ))}
            </div>
          </section>
        )}
      </div>

      {/* Footer — contact note + downloads */}
      {(contact_note.title || contact_note.description || dls.length > 0) && (
        <footer className="bg-[#F8F8F8] text-gray-800 py-8">
          <div className="max-w-4xl mx-auto text-center px-4">
            {contact_note.title && (
              <p className="text-lg font-semibold mb-2">{contact_note.title}</p>
            )}
            {contact_note.description && (
              <p className="opacity-75">{contact_note.description}</p>
            )}
            {dls.length > 0 && (
              <div className="mt-6 flex flex-col sm:flex-row gap-4 justify-center">
                {dls.map((d, i) =>
                  d?.file ? (
                    <a
                      key={i}
                      href={resolveImage(d.file)}
                      onClick={(e) => saveFile(e, resolveImage(d.file), d.label)}
                      className="bg-transparent border-2 border-gray-800 text-gray-800 px-6 py-2 rounded-lg font-semibold flex items-center justify-center hover:bg-[#91288D] hover:border-[#91288D] hover:text-white transition-all duration-300"
                    >
                      <Download className="w-4 h-4 mr-2" />
                      {d.label || "Download"}
                    </a>
                  ) : null
                )}
              </div>
            )}
          </div>
        </footer>
      )}
    </div>
  );
}
