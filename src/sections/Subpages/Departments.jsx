import { useState } from "react";
import { useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import DropdownButton from "../../components/DropDownButton";
import { GalleryWithPopup } from "../../components/GalleryWithPopup";
import { renderIcon } from "../../utils/renderIcon";
import api from "../../config/api";
import PageSkeleton from "../../components/Skeletons/PageSkeleton";
import RichTextRenderer from "../../components/RichTextRenderer";
import SafeImage from "../../components/SafeImage";

const fetchDepartments = async (college) => {
  const { data } = await api.get(`/departments/${college}`);
  return data.data || [];
};

/* Staff tables vary by institute — some carry only name + designation, others
   (e.g. DMCP) add department, qualification, teaching/industry experience.
   The table renders columns dynamically from whatever fields the data holds,
   so extra columns appear automatically without any code change. */
const STAFF_COLUMN_LABELS = {
  name: "Name",
  designation: "Designation",
  department: "Department",
  qualification: "Qualification",
  totalTeachingExperience: "Teaching Experience",
  totalIndustryExperience: "Industry Experience",
  email: "Email",
};

// Preferred left-to-right order; any other keys present in the data are
// appended after these (alphabetically) so new fields still render.
const STAFF_COLUMN_ORDER = [
  "name",
  "designation",
  "department",
  "qualification",
  "totalTeachingExperience",
  "totalIndustryExperience",
];

const humanizeKey = (k) =>
  k
    .replace(/([a-z0-9])([A-Z])/g, "$1 $2")
    .replace(/[_-]+/g, " ")
    .replace(/\b\w/g, (c) => c.toUpperCase())
    .trim();

// Only columns with at least one non-empty value are shown, so a
// name+designation-only department stays a compact table while a richer one
// grows extra columns. name + designation are always kept as core columns.
const getStaffColumns = (staff = []) => {
  const present = new Set(["name", "designation"]);
  staff.forEach((m) =>
    Object.entries(m || {}).forEach(([k, v]) => {
      if (v !== null && v !== undefined && String(v).trim() !== "") present.add(k);
    })
  );
  const known = STAFF_COLUMN_ORDER.filter((k) => present.has(k));
  const extras = [...present]
    .filter((k) => !STAFF_COLUMN_ORDER.includes(k))
    .sort();
  return [...known, ...extras];
};

function DepartmentsSubpage() {
  const { college, deptSlug } = useParams();

  const { data: departments = [], isLoading } = useQuery({
    queryKey: ["departments", college],
    queryFn: () => fetchDepartments(college),
    enabled: !!college,
  });

  const [selectedKey, setSelectedKey] = useState(null);
  const [activeDeptIndex, setActiveDeptIndex] = useState(0);

  const effectiveKey = selectedKey ?? deptSlug;
  const selected = departments.find((d) => d.slug === effectiveKey);
  const currentDeptList = selected?.data?.departments || [];
  const currentDept = currentDeptList[activeDeptIndex];

  const handleChange = (slug) => {
    setSelectedKey(slug);
    setActiveDeptIndex(0);
  };

  if (isLoading) return <PageSkeleton />;

  if (!currentDept) {
    return (
      <div className="deptpage-empty">
        No department data available.
      </div>
    );
  }

  const options = departments.map((d) => ({
    key: d.slug,
    label: d.name,
  }));

  // In-charge(s): institutes like SAHS list multiple heads (one per program),
  // each with their own photo/name/designation/qualification/email. Older
  // records use the single dean_image + dean_details (HTML) shape, which the
  // block below still falls back to.
  const heads = Array.isArray(currentDept.heads)
    ? currentDept.heads.filter(Boolean)
    : [];

  // Programs can be a single string ("B.Sc./M.Sc. MRIT"), an array of
  // strings, or the CMS shape [{ name }] — normalize all three.
  const programsList = (Array.isArray(currentDept.programs)
    ? currentDept.programs
    : currentDept.programs
      ? [currentDept.programs]
      : []
  )
    .map((p) => (typeof p === "string" ? p : p?.name))
    .filter((n) => n && String(n).trim() !== "");

  return (
    <div className="deptpage-root fade-in">
      {/* Header */}
      <header className="deptpage-header">
        <h1 className="deptpage-college-name">
          {currentDept.college_name || "Department"}
        </h1>
        <p className="deptpage-college-info">{currentDept.college_info || ""}</p>
      </header>

      <div className="deptpage-content">
        {/* Dropdown */}
        <DropdownButton
          options={options}
          selectedKey={effectiveKey}
          onChange={handleChange}
          placeholder="Select Department"
        />

        {/* Dept Header */}
        <div className="deptpage-dept-card">
          <div className="deptpage-dept-row">
            {renderIcon(currentDept.icon, 30)}
            <h2 className="deptpage-dept-name">{currentDept.name}</h2>
          </div>
          <p className="deptpage-dept-info">
            {currentDept.info || programsList.join(" • ")}
          </p>
        </div>

        {/* In-charge(s) of Department — a department can have several heads
            (e.g. one per program), each with their own photo + details. When
            the record carries a `heads` array we render every entry; older
            single-HOD records fall back to dean_image + dean_details (HTML). */}
        {heads.length > 0 ? (
          <div className="deptpage-hod-card">
            <h3 className="deptpage-hod-title">
              {heads.length > 1 ? "In-charge of Department" : "Head of Department"}
            </h3>

            <div className="deptpage-heads-grid">
              {heads.map((head, i) => (
                <div key={i} className="deptpage-head">
                  <SafeImage
                    src={head.image}
                    alt={head.name || "In-charge"}
                    className="deptpage-hod-image"
                  />
                  <div className="deptpage-head-info">
                    {head.name && (
                      <p className="deptpage-head-name">{head.name}</p>
                    )}
                    {head.designation && (
                      <p className="deptpage-head-desig">{head.designation}</p>
                    )}
                    {head.qualification && (
                      <p className="deptpage-head-qual">
                        <span className="deptpage-head-qual-label">
                          Qualification:
                        </span>{" "}
                        {head.qualification}
                      </p>
                    )}
                    {head.email && (
                      <a
                        href={`mailto:${head.email}`}
                        className="deptpage-head-email"
                      >
                        {head.email}
                      </a>
                    )}
                    {/* Legacy/CMS shape: a head may carry a `details` HTML
                        blob instead of the discrete fields above. */}
                    {!head.name && head.details && (
                      <div className="deptpage-hod-details text-center sm:text-left">
                        <RichTextRenderer html={head.details} />
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : (
          (currentDept.dean_image || currentDept.dean_details) && (
            <div className="deptpage-hod-card">
              <h3 className="deptpage-hod-title">Head of Department</h3>

              <div className="deptpage-hod-row">
                {/* Always render the HOD image slot. When dean_image is empty,
                    SafeImage shows the "No image available" fallback — keeping
                    the space reserved so an admin-uploaded photo appears here
                    later without any layout change. */}
                <SafeImage
                  src={currentDept.dean_image}
                  alt="Head of Department"
                  className="deptpage-hod-image"
                />
                {currentDept.dean_details && (
                  <div className="deptpage-hod-details text-center md:text-left">
                    <RichTextRenderer html={currentDept.dean_details} />
                  </div>
                )}
              </div>
            </div>
          )
        )}

        {/* Programs offered by the department */}
        {programsList.length > 0 && (
          <div className="deptpage-programs-card">
            <h3 className="deptpage-programs-title">Programs</h3>
            <ul className="deptpage-programs-list">
              {programsList.map((p, i) => (
                <li key={i} className="deptpage-programs-item">
                  {renderIcon("BookOpen", 20)}
                  <span>{p}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Staff Table — the CMS now sends { columns: [{key,label}], rows: [...] }
            so the admin controls both the columns and their labels (keys can be
            generated ids like "col_e69676"). The legacy flat-array shape keeps
            working via getStaffColumns. */}
        {(() => {
          const staffRaw = currentDept.staff;
          const staffRows = Array.isArray(staffRaw)
            ? staffRaw
            : Array.isArray(staffRaw?.rows)
              ? staffRaw.rows
              : [];
          if (!staffRows.length) return null;

          const staffColumns =
            !Array.isArray(staffRaw) && Array.isArray(staffRaw?.columns) && staffRaw.columns.length
              ? staffRaw.columns
                  .filter((c) => c?.key)
                  .map((c) => ({ key: c.key, label: c.label || humanizeKey(c.key) }))
              : getStaffColumns(staffRows).map((k) => ({
                  key: k,
                  label: STAFF_COLUMN_LABELS[k] || humanizeKey(k),
                }));

          return (
            <div className="deptpage-staff-card">
              <h3 className="deptpage-staff-title">
                Department Staff ({staffRows.length})
              </h3>
              <div className="deptpage-staff-table-wrap">
                <table className="deptpage-staff-table">
                  <thead>
                    <tr className="deptpage-staff-thead-row">
                      <th className="deptpage-staff-th">Sr. No.</th>
                      {staffColumns.map((col) => (
                        <th key={col.key} className="deptpage-staff-th">
                          {col.label}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {staffRows.map((member, index) => (
                      <tr
                        key={index}
                        className="deptpage-staff-tbody-row"
                      >
                        <td className="deptpage-staff-td">{index + 1}</td>
                        {staffColumns.map((col) => (
                          <td
                            key={col.key}
                            className={
                              col.key === "name"
                                ? "deptpage-staff-td-name"
                                : "deptpage-staff-td"
                            }
                          >
                            {col.key === "department"
                              ? member.department ||
                                (currentDept.name || "").replace(
                                  "Department of ",
                                  ""
                                )
                              : member[col.key] ?? ""}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          );
        })()}

        {/* Programs — the CMS/API sends programs as [{ name }]. Some legacy
            imports still send a bare string, so normalize both into a plain
            list of names before rendering. */}
        {(() => {
          const raw = currentDept.programs;
          const programs = Array.isArray(raw)
            ? raw
                .map((p) => (typeof p === "string" ? p : p?.name))
                .filter((n) => n && String(n).trim() !== "")
            : typeof raw === "string" && raw.trim() !== ""
              ? [raw.trim()]
              : [];

          if (!programs.length) return null;

          return (
            <div className="deptpage-programs-card">
              <h3 className="deptpage-programs-title">Programs</h3>
              <ul className="deptpage-programs-list">
                {programs.map((name, idx) => (
                  <li className="deptpage-programs-item" key={idx}>
                    {renderIcon("book-open", 20, "deptpage-programs-icon")}
                    <span className="deptpage-programs-name">{name}</span>
                  </li>
                ))}
              </ul>
            </div>
          );
        })()}

        {/* USP / Department Info — grouped. The CMS/API sends `usp_groups`,
            each with a heading and its own points, so each group renders under
            its own subheading with numbering that restarts per group. Falls
            back to the legacy flat `usp` array (one heading-less group) for
            older payloads. */}
        {(() => {
          const groups =
            Array.isArray(currentDept.usp_groups) && currentDept.usp_groups.length
              ? currentDept.usp_groups
              : Array.isArray(currentDept.usp) && currentDept.usp.length
                ? [{ heading: "", points: currentDept.usp }]
                : [];

          // Keep only groups that actually have non-empty points.
          const cleanGroups = groups
            .map((g) => ({
              heading: g?.heading || "",
              points: (g?.points || []).filter(
                (p) => (p?.point ?? "").trim() !== ""
              ),
            }))
            .filter((g) => g.points.length);

          if (!cleanGroups.length) return null;

          return (
            <div className="deptpage-usp-card">
              <h3 className="deptpage-usp-title">Department's Information</h3>

              {cleanGroups.map((group, gi) => (
                <div className="deptpage-usp-group" key={gi}>
                  {group.heading && (
                    <h4 className="deptpage-usp-group-heading">
                      {group.heading}
                    </h4>
                  )}
                  <div className="deptpage-usp-grid">
                    {group.points.map((u, i) => (
                      <div key={i} className="deptpage-usp-item">
                        <div className="deptpage-usp-num">{i + 1}</div>
                        <p className="deptpage-usp-text">{u.point}</p>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          );
        })()}

        {/* Gallery */}
        {currentDept.gallery?.length > 0 && (
          <GalleryWithPopup
            data={{
              gallery: currentDept.gallery,
              header: { heading: "Gallery" },
            }}
          />
        )}
      </div>
    </div>
  );
}

export default DepartmentsSubpage;
