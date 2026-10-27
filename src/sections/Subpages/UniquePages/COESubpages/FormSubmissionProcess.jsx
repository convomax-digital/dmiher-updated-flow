import React from "react";
import { renderIcon } from "../../../../utils/renderIcon";
import RichTextRenderer from "../../../../components/RichTextRenderer";
import {
  arr,
  CoeHero,
  SectionTitle,
  GrayCallout,
  WhiteCard,
  ContactNote,
} from "./CoeBlocks";

/**
 * Exam Form Submission Process — section_id `form_submission_process`.
 * Backend-driven carbon copy of live-site Examinations/FomSubmissionProcess.jsx.
 */
export default function FormSubmissionProcess({ data = {} }) {
  const {
    hero = {},
    overview = {},
    steps = {},
    guidelines = {},
    timeline = {},
    contact_note = {},
  } = data;

  const stepItems = arr(steps.items);
  const guideCols = arr(guidelines.columns);
  const tlItems = arr(timeline.items);

  if (!data.hero && !data.overview && !data.steps) return null;

  return (
    <div className="min-h-screen bg-white">
      <CoeHero hero={hero} />

      <div className="container py-12">
        {/* Overview */}
        {(overview.title || overview.description) && (
          <section className="mb-12">
            <GrayCallout
              title={overview.title}
              icon={overview.icon}
              description={overview.description}
            />
          </section>
        )}

        {/* Step-by-step process */}
        {stepItems.length > 0 && (
          <section className="mb-12">
            <SectionTitle title={steps.section_title} icon={steps.section_icon} />
            <div className="space-y-6">
              {stepItems.map((step, i) => (
                <div
                  key={i}
                  className="bg-white rounded-lg shadow-md p-6 border hover:shadow-lg transition-all duration-300 transform hover:scale-[1.02]"
                >
                  <div className="flex items-start">
                    <div className="bg-[#132F5C] text-white rounded-full w-10 h-10 flex items-center justify-center font-bold text-lg mr-4 flex-shrink-0">
                      {i + 1}
                    </div>
                    <div className="flex-1 min-w-0">
                      {step.title && (
                        <h3 className="text-xl font-semibold text-[#132F5C] mb-3 flex items-center">
                          {step.icon && (
                            <span className="mr-2 shrink-0">
                              {renderIcon(step.icon, 20, "")}
                            </span>
                          )}
                          {step.title}
                        </h3>
                      )}
                      {step.description && (
                        <RichTextRenderer
                          className="text-gray-700 leading-relaxed"
                          html={step.description}
                        />
                      )}
                      {arr(step.notes).map((n, j) =>
                        n?.text ? (
                          <RichTextRenderer key={j} html={n.text} />
                        ) : null
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Important guidelines */}
        {guideCols.length > 0 && (
          <section className="mb-12">
            <SectionTitle
              title={guidelines.section_title}
              icon={guidelines.section_icon}
            />
            <div className="grid md:grid-cols-2 gap-6">
              {guideCols.map((col, i) => (
                <WhiteCard key={i}>
                  <RichTextRenderer html={col.title} />
                </WhiteCard>
              ))}
            </div>
          </section>
        )}

        {/* Process timeline */}
        {tlItems.length > 0 && (
          <section className="mb-12">
            <SectionTitle
              title={timeline.section_title}
              icon={timeline.section_icon}
            />
            <div className="bg-[#132F5C] rounded-lg p-6">
              <div className="coe-timeline-grid text-center text-black">
                {tlItems.map((t, i) => (
                  <div key={i} className="bg-white bg-opacity-20 rounded-lg p-4">
                    {t.label && (
                      <div className="text-2xl font-bold mb-2">{t.label}</div>
                    )}
                    {t.sublabel && <div className="text-sm">{t.sublabel}</div>}
                  </div>
                ))}
              </div>
            </div>
          </section>
        )}

        {/* Contact */}
        {(contact_note.title || contact_note.description) && (
          <section className="mb-12">
            <ContactNote note={contact_note} />
          </section>
        )}
      </div>
    </div>
  );
}
