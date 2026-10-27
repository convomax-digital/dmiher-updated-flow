import React, { useEffect, useRef } from "react";
import { API_BASE } from "../../config/api";
import { getNonce } from "../../context/NonceContext";

/**
 * Rich text field backed by the project's self-hosted TinyMCE (the same editor
 * the admin panel uses, served from the backend at /files/js/tinymce).
 *
 * Progressive enhancement: it renders a real <textarea> that stays fully
 * functional even if TinyMCE fails to load (CSP, offline, etc.) — so a public
 * form can never be blocked. When TinyMCE loads it takes over the textarea.
 */
const TINYMCE_BASE = `${API_BASE}/files/js/tinymce`;
const TINYMCE_SRC = `${TINYMCE_BASE}/tinymce.min.js`;

const inputClass =
  "w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#91288D]";

export default function RichTextEditor({ value, onChange, placeholder }) {
  const areaRef = useRef(null);
  const edRef = useRef(null);

  useEffect(() => {
    let cancelled = false;

    const init = () => {
      if (cancelled || !window.tinymce || !areaRef.current) return;
      try {
        window.tinymce.init({
          target: areaRef.current,
          menubar: false,
          plugins: "lists link autolink",
          toolbar:
            "bold italic underline | bullist numlist | link | removeformat",
          height: 220,
          branding: false,
          promotion: false,
          base_url: TINYMCE_BASE,
          suffix: ".min",
          setup: (ed) => {
            edRef.current = ed;
            ed.on("Change KeyUp Undo Redo", () => onChange(ed.getContent()));
          },
        });
      } catch {
        /* fall back to the plain textarea */
      }
    };

    if (window.tinymce) {
      init();
    } else {
      const s = document.createElement("script");
      s.src = TINYMCE_SRC;
      s.async = true;
      const nonce = getNonce?.();
      if (nonce) s.setAttribute("nonce", nonce);
      s.onload = init;
      document.body.appendChild(s);
    }

    return () => {
      cancelled = true;
      try {
        edRef.current?.remove();
      } catch {
        /* noop */
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <textarea
      ref={areaRef}
      className={inputClass}
      rows={5}
      defaultValue={value || ""}
      placeholder={placeholder || ""}
      onChange={(e) => onChange(e.target.value)}
    />
  );
}
