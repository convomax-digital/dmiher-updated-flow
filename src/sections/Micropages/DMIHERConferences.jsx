import React from "react";
import {
  Calendar,
  Camera,
  CheckCircle,
  Clock,
  FileDown,
  FileText,
  Globe,
  Mail,
  MapPin,
  Phone,
  Users,
} from "lucide-react";
import resolveImage from "../../utils/resolveImage";

const TIMELINE_STYLE = {
  "Full Length Paper Submission": { icon: FileText, bg: "bg-rose-100",  border: "border-rose-300",  text: "text-rose-800"  },
  "Acceptance Notification":      { icon: CheckCircle, bg: "bg-green-100", border: "border-green-300", text: "text-green-800" },
  "Early Registration":           { icon: Users,       bg: "bg-rose-100",  border: "border-rose-300",  text: "text-rose-800"  },
  "Late Registration":            { icon: Clock,       bg: "bg-rose-100",  border: "border-rose-300",  text: "text-rose-800"  },
  "Camera Ready Submission":      { icon: Camera,      bg: "bg-yellow-100",border: "border-yellow-300",text: "text-yellow-800"},
  "Conference Dates":             { icon: Calendar,    bg: "bg-purple-100",border: "border-purple-300",text: "text-purple-800"},
};

const Banner = ({ children, theme = "navy" }) => {
  const cls = theme === "gold"
    ? "bg-gradient-to-r from-[#91288D] to-[#91288D] text-[#555555]"
    : "bg-gradient-to-r from-[#132F5C] to-[#2E57AA] text-white";
  return (
    <section className={`${cls} rounded-xl shadow-lg p-8`}>
      {children}
    </section>
  );
};

const TwoColTable = ({ caption, head = [], rows = [] }) => (
  <div className="mt-6">
    {caption && (
      <h3 className="text-xl md:text-2xl font-semibold mb-4 text-gray-800">
        {caption}
      </h3>
    )}
    <div className="overflow-x-auto rounded-xl">
      <table className="w-full text-sm text-left text-gray-950 border border-gray-200">
        {head.length > 0 && (
          <thead className="bg-[#facc15]">
            <tr>{head.map((h, i) => <th key={i} className="px-4 py-3 font-semibold">{h}</th>)}</tr>
          </thead>
        )}
        <tbody>
          {rows.map((row, i) => (
            <tr key={i}>
              {row.map((cell, j) => <td key={j} className="px-4 py-3">{cell}</td>)}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  </div>
);

function DMIHERConferences({ data }) {
  if (!data || typeof data !== "object") return null;

  const meta = data.conference_meta || {};
  const committee = data.committee || {};
  const submission = data.submission || {};
  const location = data.location || {};

  return (
    <main className="w-full">
      {/* Hero strip */}
      <div className="bg-[#132F5C] shadow-xl border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-6 py-6 text-center">
          <p className="text-5xl font-bold text-white">International Conference</p>
        </div>
      </div>

      {/* Intro banners */}
      <div className="max-w-6xl mx-auto px-4 py-12 space-y-12">
        {data.about_dmiher && (
          <Banner theme="navy">
            <h3 className="text-2xl font-bold mb-6">About DMIHER (DU)</h3>
            <p className="leading-relaxed">{data.about_dmiher}</p>
          </Banner>
        )}

        {data.about_feat && (
          <Banner theme="gold">
            <h3 className="text-2xl font-bold mb-6 text-gray-700">About FEAT</h3>
            <p className="leading-relaxed text-[#555555]" style={{ fontFamily: "Arial, sans-serif" }}>
              {data.about_feat}
            </p>
          </Banner>
        )}

        {data.about_conference && (
          <Banner theme="navy">
            <h3 className="text-2xl font-bold mb-6">About Conference</h3>
            <p className="leading-relaxed">{data.about_conference}</p>
          </Banner>
        )}
      </div>

      {/* Guidelines */}
      {Array.isArray(data.guidelines) && data.guidelines.length > 0 && (
        <>
          <div className="bg-slate-300 py-2 mb-8 flex flex-col items-center gap-4">
            <h3 className="font-bold md:text-3xl sm:text-2xl text-xl">
              Online Presentation Guidelines
            </h3>
          </div>
          <section className="bg-white rounded-3xl mb-8 p-6 md:p-10 text-left max-w-6xl mx-auto shadow-lg">
            <ol className="list-decimal pl-6 space-y-6 text-gray-800 leading-relaxed">
              {data.guidelines.map((item, i) => (
                <li key={i} className="font-medium">
                  <p>{item.text}</p>
                  {Array.isArray(item.sub_steps) && item.sub_steps.length > 0 && (
                    <ul className="list-disc pl-6 mt-3 space-y-2 text-gray-700 font-normal">
                      {item.sub_steps.map((step, j) => <li key={j}>{step}</li>)}
                    </ul>
                  )}
                </li>
              ))}
            </ol>
          </section>
        </>
      )}

      {/* PPT template download */}
      {submission.ppt_template_url && (
        <div className="bg-slate-300 py-2 mb-8 flex flex-col items-center gap-4">
          <a
            href={resolveImage(submission.ppt_template_url)}
            download
            className="bg-[#91288D] hover:bg-[#132F5C] text-white text-base sm:text-xl font-medium px-6 sm:px-8 py-2 min-w-[220px] rounded-md shadow-md inline-flex items-center justify-center gap-x-2"
          >
            <FileDown className="w-6 h-6 min-w-6" />
            {submission.ppt_template_label || "Template for PPT"}
          </a>
        </div>
      )}

      {/* Tracks */}
      {Array.isArray(data.tracks) && data.tracks.length > 0 && (
        <section className="max-w-6xl mx-auto py-8 px-4 md:px-0">
          <div className="text-center mb-8">
            <h3 className="text-2xl font-bold text-gray-800 mb-4">Tracks for Conference</h3>
            {(meta.acronym || meta.format) && (
              <p className="text-lg font-semibold text-gray-700">
                {meta.acronym && <><strong>Conference Acronym: {meta.acronym}</strong><br /></>}
                {meta.format  && <strong>Event Format: {meta.format}</strong>}
                {Array.isArray(meta.tracks) && meta.tracks.length > 0 && (
                  <><br /><br />{meta.tracks.map((t, i) => <span key={i}>{i + 1}) {t}&nbsp;&nbsp;&nbsp; </span>)}</>
                )}
              </p>
            )}
          </div>

          <div className="space-y-8">
            {data.tracks.map((track, i) => (
              <div key={i} className="border border-gray-200 rounded-lg p-6 shadow-lg">
                <h3 className="text-xl font-semibold text-gray-800 mb-4">{track.title}</h3>
                <ul className="list-disc pl-6 space-y-2 text-gray-700">
                  {(track.items || []).map((it, j) => (
                    <li key={j}>
                      <strong>{it.heading}</strong>:{" "}
                      <span
                        className="[&_p]:m-0 [&_p]:inline"
                        dangerouslySetInnerHTML={{ __html: it.desc || "" }}
                      />
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Committee two-column */}
      {(committee.left?.length || committee.right?.length) && (
        <section className="max-w-6xl mx-auto flex flex-col md:flex-row mb-8 gap-6 px-4 md:px-0">
          {[committee.left, committee.right].map((col, ci) => (
            <div key={ci} className="w-full md:w-1/2 space-y-6">
              {(col || []).map((section, i) => (
                <div key={i} className="p-6 rounded-2xl shadow-md border border-gray-200">
                  <h3 className="text-2xl font-semibold text-gray-900 mb-3 border-b pb-2">
                    {section.title}
                  </h3>
                  <ul className="text-base text-gray-700 leading-relaxed list-disc list-inside pl-2 space-y-2">
                    {(section.items || []).map((it, j) => <li key={j}>{it}</li>)}
                  </ul>
                </div>
              ))}
            </div>
          ))}
        </section>
      )}

      {/* Finance committee */}
      {Array.isArray(data.finance_committee) && data.finance_committee.length > 0 && (
        <div className="max-w-6xl mx-auto py-8 rounded-lg p-6 mb-8 shadow-lg">
          <h3 className="text-2xl font-semibold text-[#555555] mb-4">Finance Committee</h3>
          <div className="overflow-x-auto rounded-xl">
            <table className="w-full text-left border border-gray-200">
              <thead>
                <tr className="bg-[#facc15] text-black">
                  <th className="p-3 text-center">Sr. No</th>
                  <th className="p-3">Name of the Committee</th>
                  <th className="p-3">Responsible Persons</th>
                </tr>
              </thead>
              <tbody>
                {data.finance_committee.map((row, i) => (
                  <tr key={i}>
                    <td className="p-3 text-center">{row.sr_no}</td>
                    <td className="p-3">{row.committee}</td>
                    <td className="p-3">
                      {(row.persons || []).map((p, j) => (
                        <span key={j} className="block">• {p}</span>
                      ))}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Submission */}
      {(submission.paper_submission_url || submission.ieee_template_url || submission.contact_email) && (
        <section className="max-w-6xl mx-auto py-8 mb-8 border border-gray-200 shadow-md">
          <div className="px-4">
            <h3 className="text-2xl font-bold text-gray-800 text-center mb-8">
              Submission Author Guidelines
            </h3>
            <div className="text-center text-gray-700 leading-relaxed space-y-4">
              <p>Full-length research papers on the given themes are invited in softcopy for the presentation as well as for publishing in the conference proceedings.</p>
              {submission.paper_submission_url && (
                <p>
                  Submit papers at:{" "}
                  <a href={submission.paper_submission_url} target="_blank" rel="noopener noreferrer" className="text-blue-600 font-semibold hover:underline">
                    {submission.paper_submission_url}
                  </a>
                </p>
              )}
              <p className="font-semibold">
                All accepted and presented papers will be published as e-proceedings and submitted to IEEE Xplore for SCOPUS indexing. Papers must be in IEEE format, not exceeding 6 pages.
              </p>
              {submission.ieee_template_url && (
                <p>
                  <strong>Template:</strong>{" "}
                  <a href={submission.ieee_template_url} target="_blank" rel="noopener noreferrer" className="text-blue-600 font-semibold hover:underline">
                    {submission.ieee_template_url}
                  </a>
                </p>
              )}
              {submission.contact_email && (
                <p>
                  Queries:{" "}
                  <a href={`mailto:${submission.contact_email}`} className="text-red-600 font-semibold hover:underline">
                    {submission.contact_email}
                  </a>
                </p>
              )}
            </div>
          </div>
        </section>
      )}

      {/* Registration */}
      {(Array.isArray(data.registration_notes) || Array.isArray(data.early_bird_fees)) && (
        <section className="py-12 md:py-16 mb-10 max-w-6xl mx-auto shadow-lg px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-8">
            <h3 className="text-2xl md:text-3xl font-semibold text-gray-800">Registration</h3>
          </div>

          {Array.isArray(data.registration_notes) && (
            <ol className="list-decimal list-inside space-y-2 text-gray-700">
              {data.registration_notes.map((item, i) => (
                <li key={i}>
                  <strong>{item.title}:</strong>{" "}
                  <span
                    className="[&_p]:m-0 [&_p]:inline"
                    dangerouslySetInnerHTML={{ __html: item.description || "" }}
                  />
                </li>
              ))}
            </ol>
          )}

          {Array.isArray(data.early_bird_fees) && data.early_bird_fees.length > 0 && (
            <TwoColTable
              caption="Early Bird Registration Fees: 15 Sep, 2025"
              head={["Participants Type", "IEEE Member Registration", "Non-IEEE Member Registration"]}
              rows={data.early_bird_fees.map((f) => [f.type, f.ieee, f.non_ieee])}
            />
          )}

          {Array.isArray(data.late_fees) && data.late_fees.length > 0 && (
            <TwoColTable
              caption="Late Registration Fees"
              head={["Participants Type", "IEEE Member Registration", "Non-IEEE Member Registration"]}
              rows={data.late_fees.map((f) => [f.type, f.ieee, f.non_ieee])}
            />
          )}

          {Array.isArray(data.banking_details) && data.banking_details.length > 0 && (
            <>
              <p className="text-center mt-8 text-gray-800 mb-2">
                <strong>Banking details for registration:</strong>
                <br />
                <strong>*Mention your paper ID in the "Reference/Purpose" of the transaction.</strong>
              </p>
              <div className="overflow-x-auto rounded-xl">
                <table className="w-full text-sm text-left text-gray-950 border border-gray-200">
                  <tbody>
                    {data.banking_details.map((row, i) => (
                      <tr key={i}>
                        <td className="px-4 py-3 font-semibold">{row.field}</td>
                        <td className="px-4 py-3">{row.value}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </>
          )}

          {submission.registration_form && (
            <p className="mt-8 text-gray-700">
              Registration Form:{" "}
              <a href={submission.registration_form} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
                {submission.registration_form}
              </a>
            </p>
          )}

          {Array.isArray(data.upload_requirements) && (
            <ul className="list-disc list-inside mt-4 space-y-2 text-gray-700">
              {data.upload_requirements.map((req, i) => <li key={i}>{req}</li>)}
            </ul>
          )}
        </section>
      )}

      {/* Timeline */}
      {Array.isArray(data.timeline) && data.timeline.length > 0 && (
        <section className="max-w-6xl mx-auto px-4 mb-12">
          <h3 className="text-2xl font-bold text-gray-800 text-center mb-6">Important Dates</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {data.timeline.map((t, i) => {
              const style = TIMELINE_STYLE[t.title] || { icon: Calendar, bg: "bg-gray-100", border: "border-gray-300", text: "text-gray-800" };
              const Icon = style.icon;
              return (
                <div key={i} className={`${style.bg} ${style.border} border rounded-xl p-4 flex items-center gap-3`}>
                  <Icon className={`w-6 h-6 ${style.text}`} />
                  <div>
                    <p className={`text-sm font-semibold ${style.text}`}>{t.title}</p>
                    <p className="text-sm text-gray-700">{t.date}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      )}

      {/* Location + contacts */}
      {(location.address || location.map_embed) && (
        <div className="py-8 px-4 sm:px-6 lg:px-8">
          <div className="max-w-7xl mx-auto">
            <div className="text-center mb-8">
              <h2 className="text-sm font-medium text-gray-600 tracking-wide uppercase mb-2">REACHING OUR OFFICE</h2>
              <h3 className="text-3xl md:text-4xl font-bold text-gray-900">Find Our Location</h3>
            </div>

            <div className="bg-white rounded-3xl shadow-lg p-6 md:p-8 mb-8">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <div className="space-y-6">
                  <div className="flex justify-center lg:justify-start">
                    <div className="w-16 h-16 bg-yellow-400 rounded-full flex items-center justify-center">
                      <MapPin className="w-8 h-8 text-white" />
                    </div>
                  </div>
                  <div className="text-center lg:text-left space-y-4">
                    {location.name && <h3 className="text-2xl font-bold text-gray-900">{location.name}</h3>}
                    {location.org && <p className="text-lg font-semibold text-gray-800">{location.org}</p>}
                    {location.address && <p className="text-gray-800">{location.address}</p>}
                    <div className="space-y-3 pt-4">
                      {location.email && (
                        <div className="flex items-center justify-center lg:justify-start space-x-3">
                          <Mail className="w-5 h-5 text-gray-500" />
                          <span className="text-gray-700"><span className="font-medium">Email:</span> {location.email}</span>
                        </div>
                      )}
                      {location.website && (
                        <div className="flex items-center justify-center lg:justify-start space-x-3">
                          <Globe className="w-5 h-5 text-gray-500" />
                          <a href={location.website} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:text-blue-800 underline break-all">
                            {location.website}
                          </a>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {location.map_embed && (
                  <div className="h-80 lg:h-full min-h-[320px]">
                    <div className="w-full h-full bg-gray-200 rounded-2xl overflow-hidden">
                      <iframe
                        src={location.map_embed}
                        width="100%"
                        height="100%"
                        style={{ border: 0 }}
                        allowFullScreen=""
                        loading="lazy"
                        referrerPolicy="no-referrer-when-downgrade"
                        title="Conference Location Map"
                      />
                    </div>
                  </div>
                )}
              </div>
            </div>

            {Array.isArray(data.contacts) && data.contacts.length > 0 && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {data.contacts.map((c, i) => (
                  <div key={i} className="text-[#132F5C] bg-white rounded-3xl p-6 shadow-lg">
                    <h3 className="text-xl font-bold text-gray-900 mb-4 text-center">{c.name}</h3>
                    <div className="space-y-3">
                      {c.email && (
                        <div className="flex items-center justify-center space-x-3">
                          <Mail className="w-5 h-5 text-gray-600" />
                          <span className="text-gray-700"><span className="font-medium">Email:</span> {c.email}</span>
                        </div>
                      )}
                      {c.phone && (
                        <div className="flex items-center justify-center space-x-3">
                          <Phone className="w-5 h-5 text-gray-600" />
                          <span className="text-gray-700"><span className="font-medium">Phone:</span> {c.phone}</span>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </main>
  );
}

export default DMIHERConferences;
