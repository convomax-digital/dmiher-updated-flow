import React, { useMemo, useState } from "react";
import { useFormDefinition, useSubmitForm } from "../../hooks/useForm";
import RichTextEditor from "./RichTextEditor";
import "./DynamicForm.css";

/**
 * Backend-driven form renderer for the standalone Forms module.
 *
 * Fetches a form definition by `slug` and renders each field from a type→input
 * switch. Fields are laid out on a 12-column grid; each field's `width`
 * (12=full, 6=half, 4=third) controls how many sit in one row — all managed
 * from the dashboard. Submits to /api/forms/{slug}/submit.
 */
const BRAND = { orange: "#91288D", navy: "#132F5C" };

const inputClass =
  "w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#91288D]";

export default function DynamicForm({ slug }) {
  const { data: form, isLoading, isError } = useFormDefinition(slug);
  const { mutateAsync, isPending } = useSubmitForm(slug);

  const [values, setValues] = useState({});
  const [errors, setErrors] = useState({});
  const [hp, setHp] = useState(""); // honeypot — real users never fill this
  const [submitted, setSubmitted] = useState(null); // success message on done

  const fields = useMemo(() => form?.fields || [], [form]);

  if (isLoading) {
    return <div className="max-w-7xl mx-auto my-10 text-gray-500">Loading form…</div>;
  }
  if (isError || !form) {
    return (
      <div className="max-w-7xl mx-auto my-10 text-gray-500">
        This form is unavailable.
      </div>
    );
  }

  // Optional per-form width (e.g. "60%" / "800px"), always centered. Blank =
  // the default max-w-7xl full width.
  const formWidth =
    typeof form.form_width === "string" ? form.form_width.trim() : "";
  const containerCls = formWidth
    ? "px-6 bg-white mx-auto my-8"
    : "px-6 bg-white max-w-7xl mx-auto my-8";
  const containerStyle = formWidth ? { maxWidth: formWidth } : undefined;

  const setValue = (key, val) => {
    setValues((v) => ({ ...v, [key]: val }));
    if (errors[key]) setErrors((e) => ({ ...e, [key]: undefined }));
  };

  const toggleMulti = (key, option) => {
    setValues((v) => {
      const cur = Array.isArray(v[key]) ? v[key] : [];
      const next = cur.includes(option)
        ? cur.filter((o) => o !== option)
        : [...cur, option];
      return { ...v, [key]: next };
    });
    if (errors[key]) setErrors((e) => ({ ...e, [key]: undefined }));
  };

  // Human-readable label for messages, even when a field has no label.
  const labelOf = (f) =>
    f.label ||
    (f.key || "field").replace(/[_-]/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());

  const validate = () => {
    const next = {};
    const emailRe = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    for (const f of fields) {
      if (f.type === "heading") continue;
      const val = values[f.key];
      const empty =
        val === undefined ||
        val === "" ||
        val === null ||
        (Array.isArray(val) && val.length === 0);

      if (f.required && empty) {
        next[f.key] = `${labelOf(f)} is required.`;
        continue;
      }
      if (empty) continue;

      if (f.type === "email" && !emailRe.test(String(val))) {
        next[f.key] = "Please enter a valid email address.";
      } else if (f.type === "number" && isNaN(Number(val))) {
        next[f.key] = "Please enter a valid number.";
      }
    }
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;
    try {
      const res = await mutateAsync({ values, _hp: hp });
      if (res?.success) {
        setSubmitted(res.message || form.success_message);
        setValues({});
      } else if (res?.errors) {
        const mapped = {};
        Object.entries(res.errors).forEach(([k, msgs]) => {
          mapped[k.replace(/^values\./, "")] = Array.isArray(msgs) ? msgs[0] : msgs;
        });
        setErrors(mapped);
      }
    } catch (err) {
      const server = err?.response?.data;
      if (server?.errors) {
        const mapped = {};
        Object.entries(server.errors).forEach(([k, msgs]) => {
          mapped[k.replace(/^values\./, "")] = Array.isArray(msgs) ? msgs[0] : msgs;
        });
        setErrors(mapped);
      } else {
        setErrors({ _form: "Something went wrong. Please try again later." });
      }
    }
  };

  if (submitted) {
    return (
      <div
        className={formWidth ? "mx-auto my-10 px-6" : "max-w-7xl mx-auto my-10 px-6"}
        style={containerStyle}
      >
        <div className="rounded-lg border border-green-200 bg-green-50 p-6 text-center">
          <p className="text-lg text-green-800 font-medium">{submitted}</p>
        </div>
      </div>
    );
  }

  const titleSpan = [12, 6, 4].includes(form.title_width) ? form.title_width : 12;
  const descSpan = [12, 6, 4].includes(form.description_width) ? form.description_width : 12;

  return (
    <div className={containerCls} style={containerStyle}>
      <form onSubmit={handleSubmit} noValidate>
        {/* Honeypot — off-screen, not tab-focusable */}
        <input
          type="text"
          tabIndex={-1}
          autoComplete="off"
          value={hp}
          onChange={(e) => setHp(e.target.value)}
          style={{ position: "absolute", left: "-9999px", width: 1, height: 1, opacity: 0 }}
          aria-hidden="true"
        />

        <div className="dyn-grid">
          {/* Form title + description are grid items too, so their width
              (set in the dashboard) controls how much space they take. */}
          <div style={{ gridColumn: `span ${titleSpan}` }} className="mb-1">
            <h2 className="text-3xl md:text-4xl font-[500] text-[#555555] tracking-wide uppercase">
              <hr className="w-16 sm:w-20 border-[#91288D] mb-3 border-t-4" />
              {form.title}
            </h2>
          </div>
          {form.description && (
            <div style={{ gridColumn: `span ${descSpan}` }} className="mb-1">
              <p className="text-gray-600 leading-relaxed">{form.description}</p>
            </div>
          )}

          {fields.map((f, idx) => {
            if (f.type === "heading") {
              const hspan = [12, 6, 4].includes(f.width) ? f.width : 12;
              return (
                <div
                  key={`h-${idx}`}
                  style={{ gridColumn: `span ${hspan}` }}
                  className="mt-6"
                >
                  <h3 className="text-2xl font-[500] text-[#393939] mb-1">
                    {f.label}
                  </h3>
                  {f.description && (
                    <p className="text-gray-600 leading-relaxed">{f.description}</p>
                  )}
                </div>
              );
            }

            const span = [12, 6, 4].includes(f.width) ? f.width : 12;
            const optSpan = [12, 6, 4].includes(f.option_width) ? f.option_width : 12;
            const optCols = optSpan === 6 ? 2 : optSpan === 4 ? 3 : 1;
            const err = errors[f.key];
            const label = f.label ? (
              <label className="block text-gray-700 text-sm font-semibold mb-1">
                {f.label}
                {f.required && <span className="text-red-500"> *</span>}
              </label>
            ) : null;

            return (
              <div key={f.key} style={{ gridColumn: `span ${span}` }}>
                {f.type !== "checkbox" && f.type !== "radio" && label}

                {(() => {
                  switch (f.type) {
                    case "textarea":
                      return (
                        <RichTextEditor
                          value={values[f.key] || ""}
                          placeholder={f.placeholder || ""}
                          onChange={(html) => setValue(f.key, html)}
                        />
                      );
                    case "select":
                      return (
                        <select
                          name={f.key}
                          id={f.key}
                          className={inputClass}
                          value={values[f.key] || ""}
                          onChange={(e) => setValue(f.key, e.target.value)}
                        >
                          <option value="">— Select —</option>
                          {(f.options || []).map((o) => (
                            <option key={o} value={o}>{o}</option>
                          ))}
                        </select>
                      );
                    case "radio":
                      return (
                        <>
                          {label}
                          <div className={`opt-grid opt-cols-${optCols}`}>
                            {(f.options || []).map((o) => (
                              <label key={o} className="flex items-center">
                                <input
                                  type="radio"
                                  name={f.key}
                                  value={o}
                                  checked={values[f.key] === o}
                                  onChange={() => setValue(f.key, o)}
                                  className="h-4 w-4 text-[#91288D] focus:ring-[#91288D] border-gray-300"
                                />
                                <span className="ml-2 text-gray-700">{o}</span>
                              </label>
                            ))}
                          </div>
                        </>
                      );
                    case "checkbox":
                      return (
                        <>
                          {label}
                          <div className={`opt-grid opt-cols-${optCols}`}>
                            {(f.options || []).map((o) => (
                              <label key={o} className="flex items-center">
                                <input
                                  type="checkbox"
                                  name={f.key}
                                  value={o}
                                  checked={
                                    Array.isArray(values[f.key]) &&
                                    values[f.key].includes(o)
                                  }
                                  onChange={() => toggleMulti(f.key, o)}
                                  className="h-4 w-4 text-[#91288D] focus:ring-[#91288D] border-gray-300 rounded"
                                />
                                <span className="ml-2 text-gray-700">{o}</span>
                              </label>
                            ))}
                          </div>
                        </>
                      );
                    case "file":
                      return (
                        <input
                          type="file"
                          className={inputClass}
                          onChange={(e) =>
                            setValue(f.key, e.target.files?.[0] || null)
                          }
                        />
                      );
                    default:
                      return (
                        <input
                          name={f.key}
                          id={f.key}
                          type={
                            ["email", "tel", "number", "date"].includes(f.type)
                              ? f.type
                              : "text"
                          }
                          className={inputClass}
                          placeholder={f.placeholder || ""}
                          value={values[f.key] || ""}
                          onChange={(e) => setValue(f.key, e.target.value)}
                        />
                      );
                  }
                })()}

                {f.help && <p className="text-xs text-gray-400 mt-1">{f.help}</p>}
                {err && <p className="text-sm text-red-500 mt-1">{err}</p>}
              </div>
            );
          })}
        </div>

        {errors._form && <p className="text-sm text-red-500 mt-4">{errors._form}</p>}

        <button
          type="submit"
          disabled={isPending}
          className="mt-6 text-white px-6 py-2.5 rounded font-semibold transition-all disabled:opacity-60"
          style={{ backgroundColor: BRAND.orange }}
        >
          {isPending ? "Sending…" : (form.submit_text || "Submit")}
        </button>
      </form>
    </div>
  );
}
