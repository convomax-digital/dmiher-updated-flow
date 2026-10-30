/**
 * Tiny inline-SVG icon set — a drop-in replacement for the handful of
 * lucide-react icons used on the home critical path (Navbar + home sections).
 *
 * Why this exists: elsewhere in the app icons are looked up dynamically by
 * CMS name (`import * as Icons from "lucide-react"`), which defeats
 * tree-shaking and forces the *entire* ~150 KB-gzipped lucide bundle to load.
 * By serving these five fixed icons locally, the lucide chunk is kept off
 * every page's initial load — it now only loads on the (lazy) pages that
 * genuinely need the dynamic icon set.
 *
 * Geometry is copied verbatim from lucide so the icons render identically.
 * Each accepts the same props we use from lucide: `size` and `className`
 * (plus any extra SVG props are spread through).
 */

function Icon({ size = 24, className, children, ...props }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
      {...props}
    >
      {children}
    </svg>
  );
}

export function Menu(props) {
  return (
    <Icon {...props}>
      <line x1="4" x2="20" y1="12" y2="12" />
      <line x1="4" x2="20" y1="6" y2="6" />
      <line x1="4" x2="20" y1="18" y2="18" />
    </Icon>
  );
}

export function X(props) {
  return (
    <Icon {...props}>
      <path d="M18 6 6 18" />
      <path d="m6 6 12 12" />
    </Icon>
  );
}

export function PlayCircle(props) {
  return (
    <Icon {...props}>
      <circle cx="12" cy="12" r="10" />
      <polygon points="10 8 16 12 10 16 10 8" />
    </Icon>
  );
}

export function ArrowLeft(props) {
  return (
    <Icon {...props}>
      <path d="m12 19-7-7 7-7" />
      <path d="M19 12H5" />
    </Icon>
  );
}

export function ArrowRight(props) {
  return (
    <Icon {...props}>
      <path d="M5 12h14" />
      <path d="m12 5 7 7-7 7" />
    </Icon>
  );
}

export function ArrowUpRight(props) {
  return (
    <Icon strokeWidth="2.5" {...props}>
      <path d="M7 7h10v10" />
      <path d="M7 17 17 7" />
    </Icon>
  );
}

export function ImageOff(props) {
  return (
    <Icon {...props}>
      <line x1="2" x2="22" y1="2" y2="22" />
      <path d="M10.41 10.41a2 2 0 1 1-2.83-2.83" />
      <line x1="13.5" x2="6" y1="13.5" y2="21" />
      <line x1="18" x2="21" y1="12" y2="15" />
      <path d="M3.59 3.59A1.99 1.99 0 0 0 3 5v14a2 2 0 0 0 2 2h14c.55 0 1.052-.22 1.41-.59" />
      <path d="M21 15V5a2 2 0 0 0-2-2H9" />
    </Icon>
  );
}
