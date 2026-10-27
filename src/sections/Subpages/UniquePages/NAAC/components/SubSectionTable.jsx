import React from "react";

const renderLink = (row) => {
  if (!row?.href) {
    return <span className="text-gray-400 text-sm">—</span>;
  }
  return (
    <a
      href={row.href}
      target="_blank"
      rel="noopener noreferrer"
      className="text-sky-500 underline text-sm sm:text-sm"
    >
      View Link
    </a>
  );
};

const SubSectionTable = ({ subSections = [] }) => {
  if (!subSections.length) {
    return (
      <div className="text-sm text-gray-500 italic px-3 py-4">
        No data available.
      </div>
    );
  }

  return (
    <div className="border-t border-x border-gray-300 mb-10">
      <table className="w-full border-collapse">
        <tbody>
          {subSections.map((section) => (
            <tr
              key={section.id || section.title}
              className="border-b border-gray-300"
            >
              <td className="align-top w-1/12 border-r border-gray-300 p-3 font-normal text-[#393939] text-center">
                {section.id}
              </td>
              <td className="p-0">
                <table className="w-full text-[#393939]">
                  <tbody>
                    {(section.rows || []).map((row, idx) => (
                      <tr
                        key={`${section.id}-${idx}`}
                        className="last:border-b-0 border-gray-200"
                      >
                        <td className="p-3 text-[#393939] text-sm sm:text-sm w-4/5">
                          {row.text}
                        </td>
                        <td className="align-top border-l border-gray-300 py-3 font-normal text-[#393939] text-center">
                          {renderLink(row)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default SubSectionTable;
