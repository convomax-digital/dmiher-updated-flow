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
 * Examination Code of Conduct — section_id `code_of_conduct`.
 * Backend-driven carbon copy of live-site Examinations/CodeOfConduct.jsx.
 */
export default function CodeOfConduct({ data = {} }) {
  const {
    hero = {},
    intro = {},
    bell_schedule = {},
    guideline_cards,
    prohibited_items = {},
    movement_restrictions = {},
    dress_code = {},
    punishment = {},
    governing_bylaw = {},
    reporting_process = {},
    important_warning = {},
    contact_note = {},
  } = data;

  const bellItems = arr(bell_schedule.items);
  const guideCards = arr(guideline_cards);
  const prohibitedCols = arr(prohibited_items.columns);
  const dressCards = arr(dress_code.cards);
  const dressNotes = arr(dress_code.notes);
  const reportSteps = arr(reporting_process.steps);

  if (!data.hero && !data.intro) return null;

  return (
    <div className="min-h-screen bg-white">
      <CoeHero hero={hero} />

      <div className="container px-4 py-12">
        {/* ===== Code of Conduct + Dress Code ===== */}
        <section className="mb-16">
          {/* Intro */}
          {(intro.title || intro.description) && (
            <div className="mb-8">
              <GrayCallout
                title={intro.title}
                icon={intro.icon}
                description={intro.description}
                html={false}
                big
              />
            </div>
          )}

          {/* Instructions to examinees */}
          {(bellItems.length > 0 ||
            guideCards.length > 0 ||
            prohibitedCols.length > 0 ||
            movement_restrictions.title) && (
            <div className="mb-12">
              <SectionTitle
                title={bell_schedule.section_title}
                icon={bell_schedule.section_icon}
              />

              {/* Bell schedule */}
              {bellItems.length > 0 && (
                <div className="bg-white rounded-lg shadow-md p-6 border mb-6 hover:shadow-lg transition-all duration-300">
                  {bell_schedule.card_title && (
                    <h4 className="text-xl font-semibold text-[#132F5C] mb-4 flex items-center">
                      {bell_schedule.card_icon && (
                        <span className="mr-2 shrink-0">
                          {renderIcon(bell_schedule.card_icon, 20, "")}
                        </span>
                      )}
                      {bell_schedule.card_title}
                    </h4>
                  )}
                  <div className="grid md:grid-cols-2 gap-4">
                    {bellItems.map((b, i) => (
                      <div
                        key={i}
                        className="coe-bell-item"
                        style={
                          b.bell_color ? { "--bell-bg": b.bell_color } : undefined
                        }
                      >
                        {b.description && (
                          <RichTextRenderer html={b.description} />
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Guideline cards */}
              {guideCards.length > 0 && (
                <div className="grid md:grid-cols-2 gap-6 mb-8">
                  {guideCards.map((c, i) => (
                    <div
                      key={i}
                      className="bg-white rounded-lg shadow-md p-6 border hover:shadow-lg transition-all duration-300"
                    >
                      {c.title && (
                        <h4 className="text-lg font-semibold text-[#132F5C] mb-4 flex items-center">
                          {c.icon && (
                            <span className="mr-2 shrink-0">
                              {renderIcon(c.icon, 20, "")}
                            </span>
                          )}
                          {c.title}
                        </h4>
                      )}
                      {c.text && <RichTextRenderer html={c.text} />}
                    </div>
                  ))}
                </div>
              )}

              {/* Prohibited items */}
              {prohibitedCols.length > 0 && (
                <div className="bg-red-50 rounded-lg p-6 border-l-4 border-red-500 mb-8">
                  {prohibited_items.title && (
                    <h4 className="text-lg font-semibold text-red-800 mb-4 flex items-center">
                      {prohibited_items.icon && (
                        <span className="mr-2 shrink-0">
                          {renderIcon(prohibited_items.icon, 20, "")}
                        </span>
                      )}
                      {prohibited_items.title}
                    </h4>
                  )}
                  <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 text-sm">
                    {prohibitedCols.map((col, i) => (
                      <div key={i}>
                        {col.heading && (
                          <p className="font-medium text-red-700 mb-2">
                            {col.heading}
                          </p>
                        )}
                        {col.text && <RichTextRenderer html={col.text} />}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Movement restrictions */}
              {(movement_restrictions.title ||
                movement_restrictions.description) && (
                <div className="bg-yellow-50 rounded-lg p-6 border-l-4 border-yellow-500">
                  {movement_restrictions.title && (
                    <h4 className="text-lg font-semibold text-yellow-800 mb-3 flex items-center">
                      {movement_restrictions.icon && (
                        <span className="mr-2 shrink-0">
                          {renderIcon(movement_restrictions.icon, 20, "")}
                        </span>
                      )}
                      {movement_restrictions.title}
                    </h4>
                  )}
                  {movement_restrictions.description && (
                    <RichTextRenderer
                      className="text-yellow-700"
                      html={movement_restrictions.description}
                    />
                  )}
                </div>
              )}
            </div>
          )}

          {/* Dress code */}
          {(dressCards.length > 0 || dressNotes.length > 0) && (
            <div className="mb-12">
              <SectionTitle
                title={dress_code.section_title}
                icon={dress_code.section_icon}
              />
              {dressCards.length > 0 && (
                <div className="grid md:grid-cols-2 gap-6">
                  {dressCards.map((c, i) => (
                    <div
                      key={i}
                      className="bg-white rounded-lg shadow-md p-6 border hover:shadow-lg transition-all duration-300"
                    >
                      {c.title && (
                        <h4 className="text-lg font-semibold text-[#132F5C] mb-4 flex items-center">
                          {c.icon && (
                            <span className="mr-2 shrink-0">
                              {renderIcon(c.icon, 20, "")}
                            </span>
                          )}
                          {c.title}
                        </h4>
                      )}
                      {c.text && <RichTextRenderer html={c.text} />}
                    </div>
                  ))}
                </div>
              )}
              {dressNotes.length > 0 && (
                <div className="mt-6 grid md:grid-cols-2 gap-6">
                  {dressNotes.map((n, i) => (
                    <div
                      key={i}
                      className="coe-dress-note"
                      style={
                        n.bg_color ? { "--note-bg": n.bg_color } : undefined
                      }
                    >
                      {n.description && (
                        <RichTextRenderer html={n.description} />
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </section>

        {/* ===== Punishment for unfair means ===== */}
        {(punishment.title ||
          governing_bylaw.title ||
          reportSteps.length > 0 ||
          important_warning.title) && (
          <section className="mb-12">
            {(punishment.title || punishment.description) && (
              <div className="bg-red-50 rounded-lg p-8 border-l-4 border-red-500 mb-8">
                {punishment.title && (
                  <h2 className="text-3xl font-bold text-red-800 mb-4 flex items-center">
                    {punishment.icon && (
                      <span className="mr-3 shrink-0">
                        {renderIcon(punishment.icon, 32, "")}
                      </span>
                    )}
                    {punishment.title}
                  </h2>
                )}
                {punishment.description && (
                  <RichTextRenderer
                    className="text-red-700 leading-relaxed text-lg"
                    html={punishment.description}
                  />
                )}
              </div>
            )}

            <div className="space-y-6">
              {/* Governing bylaw */}
              {(governing_bylaw.title || governing_bylaw.description) && (
                <WhiteCard title={governing_bylaw.title} icon={governing_bylaw.icon}>
                  {governing_bylaw.description && (
                    <div className="bg-gray-50 rounded-lg p-4 border-l-4 border-[#132F5C]">
                      <RichTextRenderer html={governing_bylaw.description} />
                    </div>
                  )}
                </WhiteCard>
              )}

              {/* Reporting process */}
              {reportSteps.length > 0 && (
                <WhiteCard
                  title={reporting_process.title}
                  icon={reporting_process.icon}
                >
                  <div className="space-y-4">
                    {reportSteps.map((s, i) => (
                      <div key={i} className="flex items-start">
                        <div className="bg-[#132F5C] text-white rounded-full w-8 h-8 flex items-center justify-center font-bold text-sm mr-4 flex-shrink-0 mt-1">
                          {i + 1}
                        </div>
                        <p className="text-gray-700">
                          {s.title && (
                            <strong>{s.title}</strong>
                          )}
                          {s.description}
                        </p>
                      </div>
                    ))}
                  </div>
                </WhiteCard>
              )}

              {/* Important warning */}
              {(important_warning.title || important_warning.description) && (
                <div className="bg-gradient-to-r from-red-500 to-red-600 rounded-lg p-6 text-white">
                  <div className="flex items-center mb-4">
                    {important_warning.icon && (
                      <span className="mr-3 shrink-0">
                        {renderIcon(important_warning.icon, 32, "")}
                      </span>
                    )}
                    {important_warning.title && (
                      <h3 className="text-xl font-bold">
                        {important_warning.title}
                      </h3>
                    )}
                  </div>
                  {important_warning.description && (
                    <RichTextRenderer
                      className="text-lg leading-relaxed [&_*]:text-white"
                      html={important_warning.description}
                    />
                  )}
                </div>
              )}
            </div>
          </section>
        )}

        {/* ===== Contact ===== */}
        {(contact_note.title || contact_note.description) && (
          <section className="mb-12">
            <ContactNote note={contact_note} />
          </section>
        )}
      </div>
    </div>
  );
}
