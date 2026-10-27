import React, { useState } from "react";
import { resolveImage } from "../../../utils/resolveImage";
import RichTextRenderer from "../../../components/RichTextRenderer";

const firstOf = (val) => {
  if (Array.isArray(val)) return val[0] || {};
  return val || {};
};

const TabContent = ({ content }) => {
  const description = content?.description || "";
  const programs_intro = content?.programs_intro || "";
  const program_counts = content?.program_counts || [];
  const features = content?.features || [];
  const additional_sections = content?.additional_sections || [];
  const faculty_tables = content?.faculty_tables || [];
  const details_link = firstOf(content?.details_link);
  const director = firstOf(content?.director);
  const contact_persons = content?.contact_persons || [];
  const core_committee = content?.core_committee || [];
  const html = content?.html || "";

  return (
    <div className="text-[#555555]">
      {description && (
        <div className="text-base">
          <RichTextRenderer html={description} />
        </div>
      )}

      {programs_intro && (
        <h3 className="text-2xl font-semibold mt-5">{programs_intro}</h3>
      )}

      {program_counts.length > 0 && (
        <ul className="list-disc ml-5 text-base mt-2">
          {program_counts.map((item, i) => (
            <li key={i}>{item.text}</li>
          ))}
        </ul>
      )}

      {features.length > 0 && (
        <ul className="list-disc ml-5 text-base mt-4">
          {features.map((item, i) => (
            <li key={i}>{item.text}</li>
          ))}
        </ul>
      )}

      {additional_sections.map((section, i) => (
        <div key={i}>
          <h3 className="text-2xl font-semibold mt-5">{section.title}</h3>
          <div className="text-base my-4">
            <RichTextRenderer html={section.content} />
          </div>
        </div>
      ))}

      {faculty_tables.map((table, i) => (
        <table
          key={i}
          className="min-w-full text-left text-gray-700 text-sm md:text-base mb-6 rounded-xl overflow-hidden mt-4"
        >
          <thead>
            <tr className="bg-[#facc15] text-black font-semibold">
              <th className="px-4 py-3 border border-gray-200 whitespace-nowrap">
                {table.heading}
              </th>
            </tr>
          </thead>
          <tbody>
            <tr className="hover:bg-gray-50">
              <td className="px-4 py-3 border border-gray-200">
                {table.link ? (
                  <a
                    href={table.link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="hover:underline hover:text-sky-500 font-semibold text-gray-600"
                  >
                    {table.link_label || "Click Here"}
                  </a>
                ) : (
                  <ol className="list-decimal ml-5 space-y-1">
                    {(table.items || []).map((item, j) => (
                      <li key={j}>{item}</li>
                    ))}
                  </ol>
                )}
              </td>
            </tr>
          </tbody>
        </table>
      ))}

      {details_link.url && (
        <table className="min-w-full text-left text-gray-700 text-sm md:text-base mb-6 rounded-xl overflow-hidden">
          <thead>
            <tr className="bg-[#facc15] text-black font-semibold">
              <th className="px-4 py-3 border border-gray-200">
                {details_link.heading || "Details"}
              </th>
            </tr>
          </thead>
          <tbody>
            <tr className="hover:bg-gray-50">
              <td className="px-4 py-3 border border-gray-200">
                <a
                  href={details_link.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:underline hover:text-sky-500 font-semibold text-gray-600"
                >
                  {details_link.label || "Click Here"}
                </a>
              </td>
            </tr>
          </tbody>
        </table>
      )}

      {director.name && (
        <div className="border border-gray-300 mb-6">
          <div className="bg-[#facc15] text-black font-semibold px-4 py-2">
            {director.name}, {director.role}
          </div>
          <div className="p-4 md:flex gap-6">
            {director.image && (
              <div className="md:w-1/4 w-full mb-4 md:mb-0">
                <img
                  src={resolveImage(director.image)}
                  alt={director.name}
                  className="border border-gray-300"
                />
              </div>
            )}
            <div className="md:w-3/4 space-y-2">
              {(director.details || []).map((d, i) => (
                <p key={i}>
                  <strong className="text-gray-800">{d.label}:</strong>{" "}
                  {d.label === "Email" ? (
                    <a
                      href={`mailto:${d.value}`}
                      className="text-blue-600 underline"
                    >
                      {d.value}
                    </a>
                  ) : (
                    d.value
                  )}
                </p>
              ))}
            </div>
          </div>
        </div>
      )}

      {contact_persons.length > 0 && (
        <table className="min-w-full text-left text-gray-700 text-sm md:text-base mb-6 rounded-xl overflow-hidden">
          <thead>
            <tr className="bg-[#facc15] text-black font-semibold">
              <th className="px-4 py-3 border border-gray-200">Sr. No.</th>
              <th className="px-4 py-3 border border-gray-200">Name of the Member</th>
              <th className="px-4 py-3 border border-gray-200">Designation</th>
              <th className="px-4 py-3 border border-gray-200">Email</th>
            </tr>
          </thead>
          <tbody>
            {contact_persons.map((person, i) => (
              <tr key={i} className="hover:bg-gray-50">
                <td className="px-4 py-3 border border-gray-200">{i + 1}</td>
                <td className="px-4 py-3 border border-gray-200">{person.name}</td>
                <td className="px-4 py-3 border border-gray-200">{person.designation}</td>
                <td className="px-4 py-3 border border-gray-200">
                  <a href={`mailto:${person.email}`} className="text-blue-600 underline">
                    {person.email}
                  </a>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      {core_committee.length > 0 && (
        <>
          <h2 className="text-2xl font-bold mb-4 mt-6">Core Committee SOAS</h2>
          <table className="min-w-full text-left text-gray-700 text-sm md:text-base rounded-xl overflow-hidden">
            <thead>
              <tr className="bg-[#facc15] text-black font-semibold">
                <th className="px-4 py-3 border border-gray-200">Sr. No.</th>
                <th className="px-4 py-3 border border-gray-200">Name of the Member</th>
                <th className="px-4 py-3 border border-gray-200">Designation</th>
              </tr>
            </thead>
            <tbody>
              {core_committee.map((member, i) => (
                <tr key={i} className="hover:bg-gray-50">
                  <td className="px-4 py-3 border border-gray-200">{i + 1}</td>
                  <td className="px-4 py-3 border border-gray-200">{member.name}</td>
                  <td className="px-4 py-3 border border-gray-200 whitespace-pre-line">
                    {member.designation}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </>
      )}

      {html && (
        <div className="text-base mt-4">
          <RichTextRenderer html={html} />
        </div>
      )}
    </div>
  );
};

const DALFellowship = ({ data }) => {
  const header = firstOf(data?.header);
  const tabs = data?.tabs || [];
  const [activeIdx, setActiveIdx] = useState(0);

  if (!tabs.length) return null;
  const activeTab = tabs[activeIdx] || {};

  return (
    <div className="my-10 max-w-7xl mx-auto px-4 md:px-0">
      {/* Heading */}
      <h2 className="text-3xl md:text-4xl font-[500] text-[#555555] mb-6 tracking-wide uppercase font-oswald-medium">
        <hr className="w-16 sm:w-20 border-[#91288D] mb-3 border-t-4" />
        {header.title || "Fellowship Courses at (SOAS)"}
      </h2>

      {/* Tabs Nav */}
      <div className="border-b border-gray-300 flex flex-wrap gap-2 mb-6">
        {tabs.map((tab, i) => (
          <button
            key={i}
            onClick={() => setActiveIdx(i)}
            className={`px-5 py-2 text-sm md:text-base font-medium transition-colors border-b-2 ${
              activeIdx === i
                ? "border-[#91288D] text-[#91288D]"
                : "border-transparent text-[#555555] hover:text-[#91288D]"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Active Tab Content */}
      <TabContent content={activeTab.content || {}} />
    </div>
  );
};

export default DALFellowship;
