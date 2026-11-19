/**
 * Flattens the header fields of an "intro" / "difference" block.
 *
 * These are non-repeatable groups, so the dashboard reads and writes their
 * scalar fields directly on the group (`intro.heading`). Older stored content
 * had them one level deeper, under a numeric key, and sometimes split across
 * SEVERAL numeric keys — on the off-campus tab `"0"` held heading+description
 * while `"1"` held bg_color. Picking just the first numeric block, as this
 * helper used to, silently dropped the rest.
 *
 * So: merge every numeric sub-block, then let the group's own scalar fields
 * win, which keeps both the current and the legacy shape rendering.
 */
export function pickIndexedBlock(obj) {
  if (!obj || typeof obj !== "object" || Array.isArray(obj)) return {};

  const out = {};

  for (const [key, value] of Object.entries(obj)) {
    if (/^\d+$/.test(key) && value && typeof value === "object" && !Array.isArray(value)) {
      Object.assign(out, value);
    }
  }

  for (const [key, value] of Object.entries(obj)) {
    if (!/^\d+$/.test(key) && (value === null || typeof value !== "object")) {
      out[key] = value;
    }
  }

  return out;
}
