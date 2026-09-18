import React, { useState } from "react";
import { Link } from "react-router-dom";
import SafeImage from "../../components/SafeImage";
import RichTextRenderer from "../../components/RichTextRenderer";

/**
 * Wraps a gallery image in a link when the CMS gave that item one.
 *
 * Gallery items carry an optional `link` alongside `src` and `caption`
 * (e.g. "/photo-gallery-15"). Items without one — `link` absent, null or
 * blank — render exactly as before, with no anchor added, so galleries that
 * set no links are untouched.
 *
 * Internal paths go through react-router's <Link> so navigation stays inside
 * the SPA; absolute URLs (and mailto:/tel:) become a normal anchor opening in
 * a new tab. `display:block` keeps the wrapper from adding the inline
 * whitespace an <a> would otherwise introduce, so the layout is unchanged.
 */
const GalleryItemLink = ({ link, caption, children }) => {
  const href = typeof link === "string" ? link.trim() : "";
  if (!href) return children;

  const label = caption ? `Open ${caption}` : "Open linked page";
  const style = { display: "block", color: "inherit", textDecoration: "none" };
  const isExternal = /^(https?:)?\/\//i.test(href) || /^(mailto:|tel:)/i.test(href);

  if (isExternal) {
    return (
      <a
        href={href}
        target="_blank"
        rel="noopener noreferrer"
        style={style}
        aria-label={label}
      >
        {children}
      </a>
    );
  }

  return (
    <Link
      to={href.startsWith("/") ? href : `/${href}`}
      style={style}
      aria-label={label}
    >
      {children}
    </Link>
  );
};

const BlockRenderer = ({ block }) => {
  const { type, props: p } = block;

  switch (type) {
    // Container → columns → children layout produced by the visual builder's
    // structure panel. Recurses back into BlockRenderer for column children.
    case "container":
      return <ContainerRenderer block={block} />;

    case "heading": {
      const level = p.level || "h2";
      const Tag = level;
      const defaultSizes = { h1: 36, h2: 26, h3: 22, h4: 18, h5: 16, h6: 14 };
      const size = p.fontSize || defaultSizes[level] || 24;
      const align = p.alignment || "left";
      const headingEl = (
        <Tag
          style={{
            fontSize: `${size}px`,
            color: p.color || "#333333",
            textAlign: align,
            fontWeight: p.fontWeight || "700",
            textTransform: p.uppercase ? "uppercase" : "none",
            lineHeight: 1.3,
            margin: 0,
          }}
        >
          {p.text || ""}
        </Tag>
      );
      if (p.topBorder) {
        const marginStyle =
          align === "center"
            ? { margin: "0 auto 10px" }
            : align === "right"
            ? { marginLeft: "auto", marginBottom: 10 }
            : { marginBottom: 10 };
        return (
          <div style={{ margin: "0.5rem 0" }}>
            <div
              style={{
                width: 60,
                height: 3,
                backgroundColor: p.topBorderColor || "#c8102e",
                ...marginStyle,
              }}
            />
            {headingEl}
          </div>
        );
      }
      return <div style={{ margin: "0.5rem 0" }}>{headingEl}</div>;
    }

    case "paragraph": {
      if (!p.text) return null;
      const style = {
        color: p.color || "#333",
        textAlign: p.alignment || "left",
        fontSize: `${p.fontSize || 16}px`,
        fontWeight: p.fontWeight || "400",
        lineHeight: p.lineHeight || 1.8,
        fontStyle: p.italic ? "italic" : "normal",
        textDecoration: p.underline ? "underline" : "none",
        margin: "0.5rem 0",
      };
      const looksLikeHtml = /<\/?[a-z][\s\S]*>/i.test(p.text);
      if (looksLikeHtml) {
        return (
          <div style={style}>
            <RichTextRenderer html={p.text} />
          </div>
        );
      }
      return <p style={style}>{p.text}</p>;
    }

    case "image":
      return (
        <figure style={{ margin: "1rem 0", textAlign: "center" }}>
          <SafeImage
            src={p.src}
            alt={p.alt || ""}
            style={{
              maxWidth: "100%",
              width: p.width || "100%",
              height: p.height || "auto",
              borderRadius: p.borderRadius || "0",
              objectFit: p.objectFit || "cover",
            }}
          />
          {p.caption && (
            <figcaption
              style={{
                fontSize: "0.85rem",
                color: "#666",
                marginTop: "0.5rem",
              }}
            >
              {p.caption}
            </figcaption>
          )}
        </figure>
      );

    case "image-content": {
      const isRight = p.layout === "right";
      const imgW = parseInt(p.imageWidth || "50", 10);
      const contentW = parseInt(p.contentWidth || String(100 - imgW), 10);
      const vMap = { top: "flex-start", center: "center", bottom: "flex-end" };
      return (
        <div
          style={{
            display: "flex",
            gap: "2rem",
            alignItems: vMap[p.verticalAlign] || "center",
            flexDirection: isRight ? "row-reverse" : "row",
            margin: "1.5rem 0",
            flexWrap: "wrap",
          }}
        >
          <div style={{ flex: `0 0 calc(${imgW}% - 1rem)`, minWidth: "200px" }}>
            <SafeImage
              src={p.image}
              alt=""
              style={{
                width: "100%",
                borderRadius: "8px",
                objectFit: "cover",
              }}
            />
          </div>
          <div style={{ flex: `0 0 calc(${contentW}% - 1rem)`, minWidth: "200px", textAlign: p.textAlign || "left" }}>
            {p.heading && (
              <h3
                style={{
                  fontSize: `${p.headingSize || 24}px`,
                  fontWeight: p.headingWeight || 700,
                  color: p.headingColor || "#1B2A4A",
                  marginBottom: "0.75rem",
                }}
              >
                {p.heading}
              </h3>
            )}
            {p.description && (
              <p style={{
                color: p.descColor || "#555",
                fontSize: `${p.descSize || 16}px`,
                fontWeight: p.descWeight || "400",
                lineHeight: p.descLineHeight || 1.8,
                fontStyle: p.descItalic ? "italic" : "normal",
                textDecoration: p.descUnderline ? "underline" : "none",
              }}>{p.description}</p>
            )}
            {p.buttonText && (
              <a
                href={p.buttonLink || "#"}
                style={{
                  display: "inline-block",
                  marginTop: "1rem",
                  padding: "0.6rem 1.5rem",
                  background: "#1B2A4A",
                  color: "#fff",
                  borderRadius: "6px",
                  textDecoration: "none",
                  fontWeight: 600,
                  fontSize: "0.9rem",
                }}
              >
                {p.buttonText}
              </a>
            )}
          </div>
        </div>
      );
    }

    case "button": {
      const baseStyle = {
        display: "inline-block",
        borderRadius: "6px",
        fontWeight: 600,
        textDecoration: "none",
        cursor: "pointer",
        border: "2px solid transparent",
        textAlign: "center",
      };
      const variants = {
        primary: {
          background: "#1B2A4A",
          color: "#fff",
          borderColor: "#1B2A4A",
        },
        secondary: {
          background: "#e5e7eb",
          color: "#333",
          borderColor: "#e5e7eb",
        },
        outline: {
          background: "transparent",
          color: "#1B2A4A",
          borderColor: "#1B2A4A",
        },
        ghost: {
          background: "transparent",
          color: "#1B2A4A",
          borderColor: "transparent",
          textDecoration: "underline",
        },
      };
      const sizes = {
        sm: { padding: "0.4rem 1rem", fontSize: "0.8rem" },
        md: { padding: "0.6rem 1.5rem", fontSize: "0.9rem" },
        lg: { padding: "0.8rem 2rem", fontSize: "1rem" },
      };
      return (
        <div
          style={{
            textAlign: p.alignment || "center",
            margin: "1rem 0",
          }}
        >
          <a
            href={p.link || "#"}
            target={p.openInNewTab ? "_blank" : undefined}
            rel={p.openInNewTab ? "noopener noreferrer" : undefined}
            style={{
              ...baseStyle,
              ...(variants[p.variant] || variants.primary),
              ...(sizes[p.size] || sizes.md),
            }}
          >
            {p.label || "Button"}
          </a>
        </div>
      );
    }

    case "cards": {
      const items = Array.isArray(p.items) ? p.items : [];
      const cols = parseInt(p.columns || "3", 10);
      return (
        <div
          style={{
            display: "grid",
            gridTemplateColumns: `repeat(${cols}, 1fr)`,
            gap: "1.5rem",
            margin: "1.5rem 0",
          }}
        >
          {items.map((item, i) => (
            <div
              key={i}
              style={{
                border: "1px solid #e5e7eb",
                borderRadius: "10px",
                overflow: "hidden",
                background: "#fff",
              }}
            >
              {item.image && (
                <SafeImage
                  src={item.image}
                  alt={item.title || ""}
                  style={{
                    width: "100%",
                    height: "180px",
                    objectFit: "cover",
                  }}
                />
              )}
              <div style={{ padding: "1rem" }}>
                <h4
                  style={{
                    fontSize: "1.1rem",
                    fontWeight: 600,
                    color: "#1B2A4A",
                    marginBottom: "0.5rem",
                  }}
                >
                  {item.title || ""}
                </h4>
                <p style={{ fontSize: "0.9rem", color: "#666", lineHeight: 1.6 }}>
                  {item.description || ""}
                </p>
              </div>
            </div>
          ))}
        </div>
      );
    }

    case "gallery": {
      const items = Array.isArray(p.items) ? p.items : [];
      const cols = parseInt(p.columns || "3", 10);
      const capBg = p.captionColor || "#1B2A4A";
      const capFg = p.captionTextColor || "#ffffff";
      // Image sizing / fit are prop-driven so a gallery can match the source
      // design (the live facility galleries use object-fit: contain, 400px
      // tall cells, 24px gaps). Defaults preserve the old look for existing
      // galleries that don't set these.
      const galGap = p.gap || "1.25rem";
      const imgFit = p.imageFit || "cover";
      if (p.layout === "slider") {
        return <GallerySlider items={items} perView={cols} />;
      }
      if (p.layout === "cards") {
        const imgH = Number(p.imageHeight) || 220;
        return (
          <div
            style={{
              display: "grid",
              gridTemplateColumns: `repeat(${cols}, 1fr)`,
              gap: galGap,
              margin: "1.5rem 0",
            }}
          >
            {items.map((item, i) => (
              <div
                key={i}
                style={{
                  overflow: "hidden",
                  border: "1px solid #e5e7eb",
                  background: "#fff",
                }}
              >
                {item.src && (
                  <GalleryItemLink link={item.link} caption={item.caption}>
                    <SafeImage
                      src={item.src}
                      alt={item.caption || ""}
                      style={{
                        width: "100%",
                        height: `${imgH}px`,
                        objectFit: imgFit,
                        display: "block",
                      }}
                    />
                  </GalleryItemLink>
                )}
                <div
                  style={{
                    background: capBg,
                    color: capFg,
                    textAlign: "center",
                    padding: "0.5rem 0.75rem",
                    fontSize: "1rem",
                    fontWeight: 600,
                  }}
                >
                  {item.caption || ""}
                </div>
              </div>
            ))}
          </div>
        );
      }
      const gridImgH = Number(p.imageHeight) || 200;
      const gridRadius = p.imageRadius != null ? p.imageRadius : "8px";
      return (
        <div
          style={{
            display: "grid",
            gridTemplateColumns: `repeat(${cols}, 1fr)`,
            gap: galGap === "1.25rem" ? "1rem" : galGap,
            margin: "1.5rem 0",
          }}
        >
          {items.map((item, i) => (
            <figure key={i} style={{ margin: 0 }}>
              {item.src && (
                <GalleryItemLink link={item.link} caption={item.caption}>
                  <SafeImage
                    src={item.src}
                    alt={item.caption || ""}
                    style={{
                      width: "100%",
                      height: `${gridImgH}px`,
                      objectFit: imgFit,
                      borderRadius: gridRadius,
                    }}
                  />
                </GalleryItemLink>
              )}
              {item.caption && (
                <figcaption
                  style={{
                    fontSize: "0.9rem",
                    color: "#333",
                    textAlign: "center",
                    padding: "0.6rem 0.25rem",
                    fontWeight: 500,
                  }}
                >
                  {item.caption}
                </figcaption>
              )}
            </figure>
          ))}
        </div>
      );
    }

    case "faq": {
      const items = Array.isArray(p.items) ? p.items : [];
      return (
        <div style={{ margin: "1.5rem 0", borderTop: "1px solid #e5e7eb" }}>
          {items.map((item, i) => (
            <FaqItem key={i} item={item} />
          ))}
        </div>
      );
    }

    case "accordion": {
      const items = Array.isArray(p.items) ? p.items : [];
      return (
        <div style={{ margin: "1.5rem 0" }}>
          {items.map((item, i) => (
            <AccordionItem key={i} item={item} defaultOpen={i === 0} />
          ))}
        </div>
      );
    }

    case "tabs": {
      const items = Array.isArray(p.items) ? p.items : [];
      return (
        <TabsBlock
          items={items}
          activeColor={p.activeColor}
          inactiveColor={p.inactiveColor}
          underlineColor={p.underlineColor}
          alignment={p.alignment}
        />
      );
    }

    case "notice-box": {
      const colors = {
        info: { bg: "#EFF6FF", border: "#3B82F6", text: "#1E40AF" },
        warning: { bg: "#FFFBEB", border: "#F59E0B", text: "#92400E" },
        success: { bg: "#F0FDF4", border: "#22C55E", text: "#166534" },
        error: { bg: "#FEF2F2", border: "#EF4444", text: "#991B1B" },
      };
      const c = colors[p.variant] || colors.info;
      return (
        <div
          style={{
            background: c.bg,
            borderLeft: `4px solid ${c.border}`,
            borderRadius: "8px",
            padding: "1.25rem 1.5rem",
            margin: "1rem 0",
          }}
        >
          <h4
            style={{
              fontSize: "1rem",
              fontWeight: 600,
              color: c.text,
              marginBottom: "0.3rem",
            }}
          >
            {p.title || "Notice"}
          </h4>
          <p style={{ fontSize: "0.9rem", color: c.text, opacity: 0.85 }}>
            {p.description || ""}
          </p>
        </div>
      );
    }

    case "faculty-table": {
      const items = Array.isArray(p.items) ? p.items : [];
      const headers = [
        "Sr No",
        "Name",
        "Designation",
        "Qualification",
        "Specialization",
        "Experience",
      ];
      return (
        <div style={{ margin: "1.5rem 0", overflowX: "auto" }}>
          {p.heading && (
            <h3
              style={{
                fontSize: "1.5rem",
                fontWeight: 700,
                color: "#1B2A4A",
                marginBottom: "1rem",
              }}
            >
              {p.heading}
            </h3>
          )}
          <table
            style={{
              width: "100%",
              borderCollapse: "collapse",
              fontSize: "0.9rem",
            }}
          >
            <thead>
              <tr style={{ background: "#1B2A4A", color: "#fff" }}>
                {headers.map((h, i) => (
                  <th
                    key={i}
                    style={{
                      padding: "0.75rem 1rem",
                      textAlign: "left",
                      fontWeight: 600,
                    }}
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {items.map((item, i) => (
                <tr
                  key={i}
                  style={{
                    background: i % 2 === 0 ? "#fff" : "#f9fafb",
                    borderBottom: "1px solid #e5e7eb",
                  }}
                >
                  <td style={{ padding: "0.6rem 1rem" }}>{i + 1}</td>
                  <td style={{ padding: "0.6rem 1rem" }}>{item.name || "-"}</td>
                  <td style={{ padding: "0.6rem 1rem" }}>{item.designation || "-"}</td>
                  <td style={{ padding: "0.6rem 1rem" }}>{item.qualification || "-"}</td>
                  <td style={{ padding: "0.6rem 1rem" }}>{item.specialization || "-"}</td>
                  <td style={{ padding: "0.6rem 1rem" }}>{item.experience || "-"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      );
    }

    case "hostel-table": {
      const items = Array.isArray(p.items) ? p.items : [];
      const headers = ["Hostel Name", "Type", "Capacity", "Amenities", "Warden"];
      return (
        <div style={{ margin: "1.5rem 0", overflowX: "auto" }}>
          {p.heading && (
            <h3
              style={{
                fontSize: "1.5rem",
                fontWeight: 700,
                color: "#1B2A4A",
                marginBottom: "1rem",
              }}
            >
              {p.heading}
            </h3>
          )}
          <table
            style={{
              width: "100%",
              borderCollapse: "collapse",
              fontSize: "0.9rem",
            }}
          >
            <thead>
              <tr style={{ background: "#1B2A4A", color: "#fff" }}>
                {headers.map((h, i) => (
                  <th
                    key={i}
                    style={{
                      padding: "0.75rem 1rem",
                      textAlign: "left",
                      fontWeight: 600,
                    }}
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {items.map((item, i) => (
                <tr
                  key={i}
                  style={{
                    background: i % 2 === 0 ? "#fff" : "#f9fafb",
                    borderBottom: "1px solid #e5e7eb",
                  }}
                >
                  <td style={{ padding: "0.6rem 1rem" }}>{item.name || "-"}</td>
                  <td style={{ padding: "0.6rem 1rem", textTransform: "capitalize" }}>
                    {item.type || "-"}
                  </td>
                  <td style={{ padding: "0.6rem 1rem" }}>{item.capacity || "-"}</td>
                  <td style={{ padding: "0.6rem 1rem" }}>{item.amenities || "-"}</td>
                  <td style={{ padding: "0.6rem 1rem" }}>{item.warden || "-"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      );
    }

    case "statistics": {
      const items = Array.isArray(p.items) ? p.items : [];
      return (
        <div
          style={{
            display: "flex",
            flexWrap: "wrap",
            gap: "1.5rem",
            justifyContent: "center",
            margin: "1.5rem 0",
          }}
        >
          {items.map((item, i) => (
            <div
              key={i}
              style={{
                flex: "1 1 180px",
                maxWidth: "220px",
                background: "#fff",
                border: "1px solid #e5e7eb",
                borderRadius: "10px",
                padding: "1.5rem",
                textAlign: "center",
              }}
            >
              <p
                style={{
                  fontSize: "2rem",
                  fontWeight: 700,
                  color: "#1B2A4A",
                }}
              >
                {item.value || "0"}
              </p>
              <p style={{ fontSize: "0.85rem", color: "#666", marginTop: "0.3rem" }}>
                {item.label || ""}
              </p>
            </div>
          ))}
        </div>
      );
    }

    case "download-section": {
      const items = Array.isArray(p.items) ? p.items : [];
      const typeColors = {
        pdf: { bg: "#FEF2F2", color: "#DC2626" },
        doc: { bg: "#EFF6FF", color: "#2563EB" },
        xls: { bg: "#F0FDF4", color: "#16A34A" },
        ppt: { bg: "#FFF7ED", color: "#EA580C" },
        zip: { bg: "#F3F4F6", color: "#4B5563" },
      };
      return (
        <div style={{ margin: "1.5rem 0" }}>
          {p.heading && (
            <h3
              style={{
                fontSize: "1.5rem",
                fontWeight: 700,
                color: "#1B2A4A",
                marginBottom: "1rem",
              }}
            >
              {p.heading}
            </h3>
          )}
          {items.map((item, i) => {
            const tc = typeColors[item.fileType] || typeColors.pdf;
            return (
              <a
                key={i}
                href={item.url || "#"}
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "1rem",
                  padding: "0.75rem 1rem",
                  border: "1px solid #e5e7eb",
                  borderRadius: "8px",
                  marginBottom: "0.5rem",
                  textDecoration: "none",
                  color: "#333",
                  transition: "background 0.15s",
                }}
              >
                <span style={{ fontSize: "1.25rem" }}>📄</span>
                <span style={{ flex: 1, fontSize: "0.95rem" }}>
                  {item.title || "Document"}
                </span>
                <span
                  style={{
                    padding: "0.2rem 0.6rem",
                    fontSize: "0.7rem",
                    fontWeight: 700,
                    textTransform: "uppercase",
                    borderRadius: "4px",
                    background: tc.bg,
                    color: tc.color,
                  }}
                >
                  {item.fileType || "pdf"}
                </span>
              </a>
            );
          })}
        </div>
      );
    }

    case "spacer":
      return <div style={{ height: `${p.height || 40}px` }} />;

    case "divider":
      return (
        <hr
          style={{
            border: "none",
            borderTop: `${p.thickness || 1}px ${p.style || "solid"} ${p.color || "#e5e7eb"}`,
            width: p.width || "100%",
            margin: "1rem auto",
          }}
        />
      );

    case "video": {
      if (!p.url) return null;
      const isYouTube = /youtu(\.be|be\.com)/i.test(p.url);
      if (isYouTube) {
        const match = p.url.match(
          /(?:youtu\.be\/|v=|\/embed\/)([a-zA-Z0-9_-]{11})/
        );
        const videoId = match?.[1] || "";
        return (
          <div
            style={{
              position: "relative",
              paddingBottom: "56.25%",
              height: 0,
              overflow: "hidden",
              borderRadius: "8px",
              margin: "1rem 0",
            }}
          >
            <iframe
              src={`https://www.youtube.com/embed/${videoId}`}
              style={{
                position: "absolute",
                top: 0,
                left: 0,
                width: "100%",
                height: "100%",
                border: 0,
              }}
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
              title="Video"
            />
          </div>
        );
      }
      return (
        <div style={{ margin: "1rem 0" }}>
          <video
            src={p.url}
            controls
            style={{ width: "100%", borderRadius: "8px" }}
          />
        </div>
      );
    }

    case "table": {
      const headers = Array.isArray(p.headers) ? p.headers : [];
      const rows = Array.isArray(p.rows) ? p.rows : [];
      if (!headers.length) return null;
      const border = p.borderColor || "#e5e7eb";
      const pad = `${p.cellPadding ?? 14}px`;
      const auto = !!p.autoSrNo;
      const srLabel = p.srNoLabel || "Sr. No.";
      const cellCss = {
        padding: pad,
        border: `1px solid ${border}`,
        textAlign: "left",
      };
      return (
        <div
          style={{
            margin: "1.5rem 0",
            overflowX: "auto",
            borderRadius: "12px",
            boxShadow:
              "0 10px 15px -3px rgba(0,0,0,0.1), 0 4px 6px -4px rgba(0,0,0,0.1)",
          }}
        >
          <table
            style={{
              width: "100%",
              borderCollapse: "collapse",
              fontSize: "0.95rem",
            }}
          >
            <thead>
              <tr
                style={{
                  background: p.headerColor || "#facc15",
                  color: p.headerTextColor || "#111111",
                }}
              >
                {auto && (
                  <th style={{ ...cellCss, fontWeight: 700, width: 90 }}>{srLabel}</th>
                )}
                {headers.map((h, i) => (
                  <th key={i} style={{ ...cellCss, fontWeight: 700 }}>
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {rows.map((row, ri) => {
                // Category / department separator row: only the first cell has
                // content and every other cell is empty (e.g. "ANATOMY",
                // "PHYSIOLOGY"). The live site renders these as a full-width
                // bar spanning all columns, centred, in the header colour.
                const firstCell = row[0];
                const restEmpty = headers
                  .slice(1)
                  .every((_, i) => !String(row[i + 1] ?? "").trim());
                const isSeparator =
                  String(firstCell ?? "").trim() !== "" && restEmpty;
                const totalCols = headers.length + (auto ? 1 : 0);

                if (isSeparator) {
                  return (
                    <tr key={ri}>
                      <td
                        colSpan={totalCols}
                        style={{
                          ...cellCss,
                          background: p.headerColor || "#facc15",
                          color: p.headerTextColor || "#111111",
                          fontWeight: 700,
                          textAlign: "center",
                        }}
                      >
                        {firstCell}
                      </td>
                    </tr>
                  );
                }

                return (
                  <tr
                    key={ri}
                    style={{
                      background:
                        p.striped && ri % 2 === 1 ? "#f9fafb" : "#fff",
                      color: "#1B2A4A",
                    }}
                  >
                    {auto && <td style={cellCss}>{ri + 1}</td>}
                    {headers.map((_, ci) => (
                      <td key={ci} style={cellCss}>
                        {row[ci] ?? ""}
                      </td>
                    ))}
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      );
    }

    default:
      return null;
  }
};

/* ================= CONTAINER / COLUMN LAYOUT =================
   Mirrors the builder's ContainerPreview + DroppableColumn rendering so
   published pages match what the admin sees on the canvas. Breakpoints:
   mobile < 768px, tablet < 1024px (SSR-safe — defaults to desktop). */
const useViewport = () => {
  const [vp, setVp] = useState("desktop");
  React.useEffect(() => {
    const handle = () => {
      const w = window.innerWidth;
      setVp(w < 768 ? "mobile" : w < 1024 ? "tablet" : "desktop");
    };
    handle();
    window.addEventListener("resize", handle);
    return () => window.removeEventListener("resize", handle);
  }, []);
  return vp;
};

const COLUMN_PRESETS = {
  card: {
    backgroundColor: "#ffffff",
    borderRadius: 12,
    boxShadow: "0 1px 3px rgba(0,0,0,0.1), 0 1px 2px rgba(0,0,0,0.06)",
    border: "1px solid #e5e7eb",
  },
  bordered: { border: "1px solid #e5e7eb", borderRadius: 8 },
  shadow: {
    boxShadow:
      "0 4px 6px -1px rgba(0,0,0,0.1), 0 2px 4px -2px rgba(0,0,0,0.1)",
    borderRadius: 8,
  },
};

const ColumnRenderer = ({ column, columnStyle, isStacked, viewport }) => {
  const s = column.settings || {};

  if (
    (viewport === "mobile" && s.hideOnMobile) ||
    (viewport === "desktop" && s.hideOnDesktop)
  ) {
    return null;
  }

  const vAlignMap = { top: "flex-start", center: "center", bottom: "flex-end" };
  const hAlignMap = { left: "flex-start", center: "center", right: "flex-end" };

  const style = {
    flex: isStacked ? "1 1 100%" : `${s.width || 12} 1 0%`,
    minWidth: 0,
    order: isStacked && s.mobileOrder ? s.mobileOrder : undefined,
    backgroundColor:
      s.bgColor && s.bgColor !== "transparent" ? s.bgColor : undefined,
    backgroundImage: s.bgImage ? `url(${s.bgImage})` : undefined,
    backgroundSize: s.bgImage ? "cover" : undefined,
    backgroundPosition: s.bgImage ? "center" : undefined,
    paddingTop: s.paddingTop,
    paddingBottom: s.paddingBottom,
    paddingLeft: s.paddingLeft,
    paddingRight: s.paddingRight,
    marginTop: s.marginTop,
    marginBottom: s.marginBottom,
    borderWidth: s.borderWidth || undefined,
    borderColor: s.borderWidth ? s.borderColor : undefined,
    borderStyle: s.borderWidth ? "solid" : undefined,
    borderRadius: s.borderRadius || undefined,
    display: "flex",
    flexDirection: "column",
    justifyContent: vAlignMap[s.verticalAlign] || "flex-start",
    alignItems: hAlignMap[s.horizontalAlign] || "stretch",
    ...(COLUMN_PRESETS[columnStyle] || {}),
    ...(s.bgColor && s.bgColor !== "transparent"
      ? { backgroundColor: s.bgColor }
      : {}),
  };

  return (
    <div style={style} className={s.cssClass || undefined}>
      <div style={{ width: "100%" }}>
        {(column.children || []).map((child) => (
          <BlockRenderer key={child.id} block={child} />
        ))}
      </div>
    </div>
  );
};

const ContainerRenderer = ({ block }) => {
  const p = block.props || {};
  const viewport = useViewport();

  if (
    (viewport === "mobile" && p.hideOnMobile) ||
    (viewport === "desktop" && p.hideOnDesktop)
  ) {
    return null;
  }

  const shouldStack =
    (viewport === "mobile" && (p.stackOnMobile ?? true)) ||
    (viewport === "tablet" && p.stackOnTablet);
  const shouldReverse =
    shouldStack && viewport === "mobile" && p.reverseOnMobile;

  // Outer div: background / border span the full row; inner div boxes the
  // columns when widthMode is "boxed" (matches the builder canvas at 1200px).
  const outerStyle = {
    backgroundColor:
      p.bgColor && p.bgColor !== "transparent" ? p.bgColor : undefined,
    backgroundImage: p.bgImage ? `url(${p.bgImage})` : undefined,
    backgroundSize: p.bgImage ? "cover" : undefined,
    backgroundPosition: p.bgImage ? "center" : undefined,
    paddingTop: p.paddingTop,
    paddingBottom: p.paddingBottom,
    paddingLeft: p.paddingLeft,
    paddingRight: p.paddingRight,
    marginTop: p.marginTop,
    marginBottom: p.marginBottom,
    borderWidth: p.borderWidth || undefined,
    borderColor: p.borderWidth ? p.borderColor : undefined,
    borderStyle: p.borderWidth ? p.borderStyle || "solid" : undefined,
    borderRadius: p.borderRadius || undefined,
    minHeight: p.minHeight || undefined,
  };

  const innerStyle = {
    display: "flex",
    flexWrap: shouldStack ? undefined : "wrap",
    flexDirection: shouldStack
      ? shouldReverse
        ? "column-reverse"
        : "column"
      : "row",
    gap: `${p.columnGap ?? 16}px`,
    ...(p.widthMode === "full"
      ? { width: "100%" }
      : { maxWidth: "1200px", margin: "0 auto" }),
  };

  return (
    <div style={outerStyle} className={p.cssClass || undefined}>
      <div style={innerStyle}>
        {(block.columns || []).map((column) => (
          <ColumnRenderer
            key={column.id}
            column={column}
            columnStyle={p.columnStyle || "plain"}
            isStacked={shouldStack}
            viewport={viewport}
          />
        ))}
      </div>
    </div>
  );
};

const FaqItem = ({ item }) => {
  const [open, setOpen] = useState(false);
  return (
    <div style={{ borderBottom: "1px solid #e5e7eb" }}>
      <button
        onClick={() => setOpen(!open)}
        style={{
          width: "100%",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          padding: "1rem 0.25rem",
          background: "transparent",
          border: "none",
          cursor: "pointer",
          textAlign: "left",
          fontSize: "0.95rem",
          fontWeight: 400,
          color: "#333",
        }}
      >
        <span>{item.question || "Question?"}</span>
        <span
          aria-hidden
          style={{
            fontSize: "1.25rem",
            lineHeight: 1,
            color: "#555",
            transition: "transform 0.2s",
            transform: open ? "rotate(45deg)" : "rotate(0deg)",
            display: "inline-block",
            marginLeft: "1rem",
          }}
        >
          +
        </span>
      </button>
      {open && (
        <div
          style={{
            padding: "0 0.25rem 1rem",
            fontSize: "0.9rem",
            color: "#555",
            lineHeight: 1.7,
          }}
        >
          {item.answer || ""}
        </div>
      )}
    </div>
  );
};

const AccordionItem = ({ item, defaultOpen }) => {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div
      style={{
        border: "1px solid #e5e7eb",
        borderRadius: "8px",
        marginBottom: "0.5rem",
        overflow: "hidden",
      }}
    >
      <button
        onClick={() => setOpen(!open)}
        style={{
          width: "100%",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          padding: "0.85rem 1.25rem",
          background: open ? "#f9fafb" : "#fff",
          border: "none",
          cursor: "pointer",
          textAlign: "left",
          fontSize: "0.95rem",
          fontWeight: 600,
          color: "#1B2A4A",
        }}
      >
        <span>{item.title || "Section"}</span>
        <span
          style={{
            transform: open ? "rotate(180deg)" : "rotate(0deg)",
            transition: "transform 0.2s",
            fontSize: "1.2rem",
          }}
        >
          ▾
        </span>
      </button>
      {open && (
        <div
          style={{
            padding: "1rem 1.25rem",
            fontSize: "0.9rem",
            color: "#555",
            lineHeight: 1.7,
            borderTop: "1px solid #e5e7eb",
          }}
        >
          {item.content || ""}
        </div>
      )}
    </div>
  );
};

const GallerySlider = ({ items, perView }) => {
  const [start, setStart] = useState(0);
  const [viewCols, setViewCols] = useState(perView || 5);

  React.useEffect(() => {
    const handle = () => {
      const w = window.innerWidth;
      if (w < 640) setViewCols(1);
      else if (w < 900) setViewCols(2);
      else if (w < 1200) setViewCols(Math.min(3, perView || 5));
      else setViewCols(perView || 5);
    };
    handle();
    window.addEventListener("resize", handle);
    return () => window.removeEventListener("resize", handle);
  }, [perView]);

  if (!items.length) return null;

  const maxStart = Math.max(0, items.length - viewCols);
  const clampedStart = Math.min(start, maxStart);
  const canPrev = clampedStart > 0;
  const canNext = clampedStart < maxStart;
  const slideWidth = 100 / viewCols;
  const translateX = -(clampedStart * slideWidth);

  const arrowStyle = {
    position: "absolute",
    top: "40%",
    transform: "translateY(-50%)",
    width: 36,
    height: 36,
    borderRadius: "50%",
    background: "#fff",
    border: "1px solid #e5e7eb",
    boxShadow: "0 2px 6px rgba(0,0,0,0.12)",
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: "1.1rem",
    color: "#333",
    zIndex: 2,
    userSelect: "none",
  };

  return (
    <div style={{ position: "relative", margin: "1.5rem 0", padding: "0 40px" }}>
      <button
        type="button"
        onClick={() => canPrev && setStart(clampedStart - 1)}
        disabled={!canPrev}
        style={{ ...arrowStyle, left: 0, opacity: canPrev ? 1 : 0.4 }}
        aria-label="Previous"
      >
        ‹
      </button>
      <div style={{ overflow: "hidden" }}>
        <div
          style={{
            display: "flex",
            transform: `translateX(${translateX}%)`,
            transition: "transform 0.35s ease",
          }}
        >
          {items.map((item, i) => (
            <figure
              key={i}
              style={{
                flex: `0 0 ${slideWidth}%`,
                margin: 0,
                padding: "0 8px",
                boxSizing: "border-box",
              }}
            >
              {item.src && (
                <GalleryItemLink link={item.link} caption={item.caption}>
                  <SafeImage
                    src={item.src}
                    alt={item.caption || ""}
                    style={{
                      width: "100%",
                      height: "180px",
                      objectFit: "cover",
                      borderRadius: "10px",
                      display: "block",
                    }}
                  />
                </GalleryItemLink>
              )}
              {item.caption && (
                <figcaption
                  style={{
                    fontSize: "0.9rem",
                    color: "#333",
                    textAlign: "center",
                    padding: "0.75rem 0.25rem 0",
                    fontWeight: 500,
                  }}
                >
                  {item.caption}
                </figcaption>
              )}
            </figure>
          ))}
        </div>
      </div>
      <button
        type="button"
        onClick={() => canNext && setStart(clampedStart + 1)}
        disabled={!canNext}
        style={{ ...arrowStyle, right: 0, opacity: canNext ? 1 : 0.4 }}
        aria-label="Next"
      >
        ›
      </button>
    </div>
  );
};

const TabsBlock = ({ items, activeColor, inactiveColor, underlineColor, alignment }) => {
  const [active, setActive] = useState(0);
  if (!items.length) return null;

  const activeCol = activeColor || "#1B2A4A";
  const inactiveCol = inactiveColor || "#888";
  const underline = underlineColor || "#c8102e";
  const justify =
    alignment === "left" ? "flex-start" : alignment === "right" ? "flex-end" : "center";
  const activeContent = items[active]?.content || "";
  const looksLikeHtml = /<\/?[a-z][\s\S]*>/i.test(activeContent);

  return (
    <div style={{ margin: "1.5rem 0" }}>
      <div
        style={{
          display: "flex",
          justifyContent: justify,
          gap: "3rem",
          overflowX: "auto",
        }}
      >
        {items.map((item, i) => {
          const isActive = i === active;
          return (
            <button
              key={i}
              onClick={() => setActive(i)}
              style={{
                padding: "0.6rem 1rem 0.9rem",
                border: "none",
                borderBottom: isActive
                  ? `3px solid ${underline}`
                  : "1px solid #c9cdd4",
                background: "transparent",
                cursor: "pointer",
                fontWeight: isActive ? 700 : 600,
                color: isActive ? activeCol : inactiveCol,
                fontSize: "1.05rem",
                whiteSpace: "pre-line",
                lineHeight: 1.25,
                textAlign: "center",
                transition: "color 0.15s, border-color 0.15s",
              }}
            >
              {item.label || `Tab ${i + 1}`}
            </button>
          );
        })}
      </div>
      <div
        style={{
          padding: "1.5rem 0.5rem",
          fontSize: "0.95rem",
          color: "#333",
          lineHeight: 1.7,
        }}
      >
        {looksLikeHtml ? (
          <RichTextRenderer html={activeContent} />
        ) : (
          activeContent
        )}
      </div>
    </div>
  );
};

function VisualPageBuilder({ data }) {
  const blocks = data?.blocks || [];

  if (!blocks.length) return null;

  // New builder format wraps everything in container blocks, which manage
  // their own boxed/full width — so the page wrapper stays full-bleed there.
  // Legacy flat block lists keep the old centered 1200px wrapper.
  const hasContainers = blocks.some((b) => b.type === "container");

  return (
    <div
      style={
        hasContainers
          ? { padding: "2rem 0" }
          : { maxWidth: "1200px", margin: "0 auto", padding: "2rem 1rem" }
      }
    >
      {blocks.map((block) => (
        <BlockRenderer key={block.id} block={block} />
      ))}
    </div>
  );
}

export default VisualPageBuilder;
