import React, { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { Swiper, SwiperSlide } from "swiper/react";
import { Grid, Pagination, Navigation } from "swiper/modules";
import "swiper/css";
import "swiper/css/grid";
import "swiper/css/pagination";
import "swiper/css/navigation";
import RichTextRenderer from "../../components/RichTextRenderer";
import SafeImage from "../../components/SafeImage";
import ViewMoreButton from "../../components/UI/Buttons";
// Centralised resolver — handles both new "assets/..." paths and
// legacy "storage/..." records so old data keeps rendering during
// the rollout.
import resolveImage from "../../utils/resolveImage";
import { sortByDisplayOrder } from "../../utils/displayOrder";

/* Get renderable items from either the new (block) or legacy (content_flow) shape */
const getRenderItems = (data) => {
  if (Array.isArray(data?.block)) return data.block;
  return data?.sections?.[0]?.content_flow || [];
};

/* Collect image path strings from every shape the CMS emits for image blocks:
     - legacy single string            item.value / item.image  ("assets/..")
     - single_img tab_type             item.image (string)
     - repeatable gallery (1 level)    item.image: [ { image: "..." } ]
     - repeatable gallery (2 levels)   item.image: [ { image: [ { image: "..." } ] } ]
   Certificate blocks repeat the exact same nesting under the `certificate`
   key, so the field name is a parameter.
   Returns a flat list of strings so callers can render one image or a grid. */
const collectImageSrcs = (item, field = "image") => {
  const out = [];
  const push = (v) => {
    if (typeof v === "string" && v.trim()) out.push(v.trim());
  };

  push(item?.value);
  if (typeof item?.[field] === "string") push(item[field]);

  if (Array.isArray(item?.[field])) {
    item[field].forEach((entry) => {
      if (typeof entry === "string") return push(entry);
      const inner = entry?.[field];
      if (typeof inner === "string") return push(inner);
      if (Array.isArray(inner)) {
        inner.forEach((x) => push(typeof x === "string" ? x : x?.[field]));
      }
    });
  }

  return out;
};

/* ================= IMAGE BLOCK =================
   All counts render as a wrapping grid (3 per row desktop / 2 tablet /
   1 mobile via .mp-gallery-img media widths) — no slider, so 4+ images
   simply flow onto the next row. */
const GalleryImage = ({ src }) => (
  <SafeImage src={src} alt="" className="mp-gallery-img" />
);

const ImageBlock = ({ item }) => {
  const srcs = collectImageSrcs(item);
  if (!srcs.length) return null;

  return (
    <div className={`mp-gallery mp-gallery--${Math.min(srcs.length, 3)} mb-6`}>
      {srcs.map((s, i) => (
        <GalleryImage key={i} src={s} />
      ))}
    </div>
  );
};

/* ================= CERTIFICATE BLOCK =================
   Same wrapping grid as ImageBlock, but the images render FULL SIZE —
   natural aspect ratio, no 380px cap or 16:9 crop — since certificates
   are documents that must stay readable. Widths split by count
   (1 → full row, 2 → halves, 3+ → thirds, wrapping onto new rows). */
const CertificateBlock = ({ item }) => {
  const srcs = collectImageSrcs(item, "certificate");
  if (!srcs.length) return null;

  return (
    <div
      className={`mp-gallery mp-cert-gallery mp-gallery--${Math.min(
        srcs.length,
        3
      )} mb-6`}
    >
      {srcs.map((s, i) => (
        <SafeImage key={i} src={s} alt="Certificate" className="mp-cert-img" />
      ))}
    </div>
  );
};

/* ================= DEAN BLOCK (new shape) ================= */
const DeanEntry = ({ d }) => {
  // `view_more` holds the collapsed-away tail of the message (e.g. the About
  // "Key Functionaries" Chancellor bio). It stays hidden behind a Read More /
  // Read Less toggle; entries without it render exactly as before.
  const [expanded, setExpanded] = useState(false);
  const hasViewMore =
    typeof d?.view_more === "string" && d.view_more.trim().length > 0;

  return (
    <div className="knowmore-dean-layout">
      {d?.img && (
        <div className="knowmore-dean-profile">
          <SafeImage
            src={resolveImage(d.img)}
            alt={d?.name || "Dean"}
            className="knowmore-dean-image"
          />
          {(d?.name ||
            d?.designation ||
            d?.qualifications ||
            d?.qualification ||
            d?.email) && (
            <div className="knowmore-dean-info">
              {/* Key-Officials / Dean-message pages store the name +
                  designation + qualifications + email together as an HTML
                  `qualification` block; render it as-is. Older pages that
                  supply the discrete plain-text fields keep working. */}
              {d?.qualification ? (
                <RichTextRenderer html={d.qualification} />
              ) : (
                <>
                  {d?.name && <p className="knowmore-dean-name">{d.name}</p>}
                  {(d?.designation || d?.qualifications) && (
                    <p>
                      {d?.designation}
                      {d?.designation && d?.qualifications && <br />}
                      {d?.qualifications}
                    </p>
                  )}
                  {d?.email && <p>{d.email}</p>}
                </>
              )}
            </div>
          )}
        </div>
      )}
      {(d?.desc || hasViewMore) && (
        <div className="knowmore-dean-message">
          {d?.desc && <RichTextRenderer html={d.desc} />}
          {hasViewMore && expanded && <RichTextRenderer html={d.view_more} />}
          {hasViewMore && (
            <ViewMoreButton
              onClick={() => setExpanded((v) => !v)}
              label={expanded ? "Read Less" : "Read More"}
            />
          )}
        </div>
      )}
    </div>
  );
};

const DeanBlock = ({ entries }) => {
  if (!Array.isArray(entries) || !entries.length) return null;
  return (
    <>
      {entries.map((d, i) => (
        <DeanEntry key={i} d={d} />
      ))}
    </>
  );
};

/* ================= DEAN CARDS GRID (new shape) =================
   When the dean block carries a `per_row` count (or has more than one entry),
   the deans render as a responsive card grid — image on top, details below —
   instead of the single profile + message layout. `--dean-cols` drives how many
   cards sit in a row on desktop (from the CMS, default 3). Mirrors the live-site
   Key Functionaries card grid. */
const DeanCardsGrid = ({ entries, cols = 3 }) => {
  // A dean whose entry carries a micro-page CTA (has_micro_page + cta_key) links
  // to its own nested page — the person's card (name + photo) becomes the link.
  // The href is built RELATIVE to the current path so /{college}/{page} grows to
  // /{college}/{page}/{cta_key}, matching the nested slug the API exposes
  // (e.g. about/key-functionaries/dr-lalitbhushan-s-waghmare). Mirrors the
  // NormalCardsBlock linking pattern. Deans without a CTA stay non-clickable.
  const { pathname } = useLocation();
  const base = pathname.replace(/\/+$/, "");
  if (!Array.isArray(entries) || !entries.length) return null;

  const getCtaKey = (d) => {
    const cta = Array.isArray(d?.cta) ? d.cta[0] : null;
    return cta?.has_micro_page && cta?.cta_key ? cta.cta_key : null;
  };

  return (
    <div className="dean-cards-grid" style={{ "--dean-cols": cols }}>
      {entries.map((d, i) => {
        const body = (
          <>
            <SafeImage
              src={resolveImage(d?.img)}
              alt={d?.name || ""}
              className="dean-card-image"
            />
            <div className="dean-card-body">
              {(d?.desc || d?.qualification) && (
                <RichTextRenderer html={d.desc || d.qualification} />
              )}
            </div>
          </>
        );

        const ctaKey = getCtaKey(d);
        if (ctaKey) {
          const href = base ? `${base}/${ctaKey}` : `/${ctaKey}`;
          return (
            <Link key={i} to={href} className="dean-card dean-card--link">
              {body}
            </Link>
          );
        }

        return (
          <div key={i} className="dean-card">
            {body}
          </div>
        );
      })}
    </div>
  );
};

/* ================= TEAM BLOCK (new shape: block.management_team[]) ================= */
const TeamBlock = ({ members, cols = 3 }) => {
  // A member whose entry carries a micro-page CTA (cta: [{ has_micro_page,
  // cta_key }]) links to its own nested page — the whole card (photo + name)
  // becomes the link. Members with a disabled/absent CTA (cta: { _section_disabled
  // } or none) stay non-clickable. The href is built RELATIVE to the current path
  // so /{college}/{page} grows to /{college}/{page}/{cta_key}, matching the nested
  // slug the API exposes (e.g. about/key-functionaries/dr-lalitbhushan-s-waghmare).
  const { pathname } = useLocation();
  const base = pathname.replace(/\/+$/, "");
  if (!Array.isArray(members) || !members.length) return null;

  const getCtaKey = (m) => {
    const cta = Array.isArray(m?.cta) ? m.cta[0] : null;
    return cta?.has_micro_page && cta?.cta_key ? cta.cta_key : null;
  };

  // The stored array is NOT in display order — the API returns it in whatever
  // sequence the CMS saved — so this sort is what puts the grid in the order
  // set in the admin panel. Shared with the mandatory-disclosure mapper so
  // both sections order their items by exactly the same rules.
  const sorted = sortByDisplayOrder(members);
  return (
    <div className="management-team-wrapper" style={{ "--team-cols": cols }}>
      {sorted.map((m, i) => {
        const inner = (
          <>
            {m?.img && (
              <SafeImage
                src={resolveImage(m.img)}
                alt=""
                className="management-team-image"
              />
            )}
            {m?.desc && (
              <div className="management-team-info">
                <RichTextRenderer html={m.desc} />
              </div>
            )}
          </>
        );

        const ctaKey = getCtaKey(m);
        if (ctaKey) {
          const href = base ? `${base}/${ctaKey}` : `/${ctaKey}`;
          return (
            <Link
              key={i}
              to={href}
              className="management-team-card management-team-card--link"
            >
              {inner}
            </Link>
          );
        }

        return (
          <div key={i} className="management-team-card">
            {inner}
          </div>
        );
      })}
    </div>
  );
};

/* ================= SLIDER BLOCK (new shape: block.slider[]) ================= */
const SliderBlock = ({ sliders }) => {
  if (!Array.isArray(sliders) || !sliders.length) return null;
  return (
    <>
      {sliders.map((s, si) => {
        const slides = Array.isArray(s?.slides) ? s.slides : [];
        if (!slides.length) return null;
        const desktop = Number(s?.desktop_items) > 0 ? Number(s.desktop_items) : 3;
        const mobile = Number(s?.mobile_items) > 0 ? Number(s.mobile_items) : 1;
        return (
          <div
            key={si}
            className="micropage-slider"
            style={{
              "--mp-slider-desktop": desktop,
              "--mp-slider-mobile": mobile,
            }}
          >
            {slides.map((slide, i) => (
              <figure key={i} className="micropage-slide">
                {slide?.image && (
                  <SafeImage
                    src={resolveImage(slide.image)}
                    alt={slide?.heading || ""}
                    className="micropage-slide-image"
                  />
                )}
                {slide?.heading && (
                  <figcaption className="micropage-slide-caption">
                    {slide.heading}
                  </figcaption>
                )}
              </figure>
            ))}
          </div>
        );
      })}
    </>
  );
};

/* ================= BUTTONS BLOCK (new shape: block.buttons[]) =================
   Renders a responsive grid of download cards (icon + label) — used by
   E-Tender, Digilocker NAD, and any other page that lists downloadable docs. */
const ButtonsBlock = ({ items }) => {
  if (!Array.isArray(items) || !items.length) return null;
  return (
    <div className="micropage-buttons-grid">
      {items.map((b, i) => {
        const linkType = b?.link_type || (b?.pdf ? "pdf" : "url");
        const href =
          linkType === "pdf"
            ? resolveImage(b?.pdf) || "#"
            : (b?.url || "#");
        const label = b?.label || "Download";
        return (
          <a
            key={i}
            href={href}
            target="_blank"
            rel="noopener noreferrer"
            className="micropage-button-card"
            title={label}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="micropage-button-icon"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth="2"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"
              />
            </svg>
            <span className="micropage-button-label">{label}</span>
          </a>
        );
      })}
    </div>
  );
};

/* ================= SINGLE BUTTON BLOCK (block.btn[]) =================
   Solid orange link buttons in a 2-per-row grid (1 on mobile); an odd
   count centers the last button across both columns. */
const SingleButtonBlock = ({ items }) => {
  if (!Array.isArray(items) || !items.length) return null;
  return (
    <div className="mp-single-btn-grid">
      {items.map((b, i) => (
        <a
          key={i}
          href={b?.link || "#"}
          target="_blank"
          rel="noopener noreferrer"
          className="mp-single-btn"
          title={b?.label}
        >
          {b?.label}
        </a>
      ))}
    </div>
  );
};

const PdfButtonBlock = ({ items }) => {
  if (!Array.isArray(items) || !items.length) return null;
  return (
    <div className="pdf-btn-list">
      {items.map((b, i) => {
        const href = resolveImage(b?.pdf) || "#";
        const label = b?.label || "Download";
        return (
          <a
            key={i}
            href={href}
            target="_blank"
            rel="noopener noreferrer"
            className="pdf-btn-item"
            title={label}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="pdf-btn-icon"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.5"
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m2.25 0H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
            </svg>
            <span className="pdf-btn-label">{label}</span>
          </a>
        );
      })}
    </div>
  );
};

/* ================= NORMAL CARDS BLOCK (block.cards[]) =================
   Grid of navy cards (carousel: 4 cols × 2 rows per page + dots). Each card
   links by action_type: page → micro page (cta_key), url → external, pdf. */
const NormalCardsBlock = ({ cards }) => {
  // Build page links RELATIVE to the current path so depth grows correctly:
  //   on a micro page  /{college}/{page}  -> card -> /{college}/{page}/{cta}
  // i.e. a nested page stays dependent on its parent micro page rather than
  // collapsing to a flat /{college}/{cta}.
  const { pathname } = useLocation();
  const base = pathname.replace(/\/+$/, "");
  const list = Array.isArray(cards) ? cards : [];
  if (!list.length) return null;

  const resolveCard = (card) => {
    if (card?.action_type === "url" && card?.url) {
      return { href: card.url, external: true };
    }
    if (card?.action_type === "pdf" && card?.pdf) {
      return { href: resolveImage(card.pdf), external: true };
    }
    const ctaKey = card?.cta?.[0]?.cta_key || card?.cta_key;
    if (ctaKey) {
      return {
        href: base ? `${base}/${ctaKey}` : `/${ctaKey}`,
        external: false,
      };
    }
    return { href: null };
  };

  const Card = ({ title }) => (
    <div className="flex items-center justify-center text-center bg-[#122E5E] hover:bg-[#0d2147] text-white rounded-lg h-40 px-5 font-semibold leading-snug transition-colors cursor-pointer">
      {title}
    </div>
  );

  return (
    <Swiper
      modules={[Grid, Pagination]}
      slidesPerView={4}
      grid={{ rows: 2, fill: "row" }}
      spaceBetween={20}
      pagination={{ clickable: true }}
      breakpoints={{
        0: { slidesPerView: 1, grid: { rows: 2 } },
        640: { slidesPerView: 2, grid: { rows: 2 } },
        1024: { slidesPerView: 4, grid: { rows: 2 } },
      }}
      className="micropage-normal-swiper mb-6"
      style={{ paddingBottom: 40 }}
    >
      {list.map((card, i) => {
        const { href, external } = resolveCard(card);
        return (
          <SwiperSlide key={i}>
            {href ? (
              external ? (
                <a
                  href={href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block h-full"
                >
                  <Card title={card.title} />
                </a>
              ) : (
                <Link to={href} className="block h-full">
                  <Card title={card.title} />
                </Link>
              )
            ) : (
              <Card title={card.title} />
            )}
          </SwiperSlide>
        );
      })}
    </Swiper>
  );
};

/* ================= TABLE BLOCK (new shape: block.excel[]) ================= */
const TableBlock = ({ block }) => {
  const tables = Array.isArray(block?.excel) ? block.excel : [];
  if (!tables.length) return null;
  return (
    <>
      {tables.map((t, ti) => {
        const rows = t?.["excel-file"]?.rows || [];
        if (!rows.length) return null;
        const [thead, ...tbody] = rows;
        const name = t?.title || t?.name;
        return (
          <div key={ti} className="micropage-table-wrapper">
            {name && <h2 className="sub-heading">{name}</h2>}
            <table className="micropage-table">
              <thead>
                <tr>
                  {thead.map((h, i) => (
                    <th key={i} className="micropage-th">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {tbody.map((row, r) => {
                  // Category / department separator row: only the first cell
                  // has content and the rest are empty (e.g. "ANATOMY"). Match
                  // the live site — render it as a full-width bar spanning all
                  // columns, centred, in the header colour.
                  const restEmpty = thead
                    .slice(1)
                    .every((_, i) => !String(row[i + 1] ?? "").trim());
                  const isSeparator =
                    String(row[0] ?? "").trim() !== "" && restEmpty;

                  if (isSeparator) {
                    return (
                      <tr key={r} className="micropage-tr">
                        <td
                          className="micropage-th"
                          colSpan={thead.length}
                          style={{ textAlign: "center" }}
                        >
                          {row[0]}
                        </td>
                      </tr>
                    );
                  }

                  return (
                    <tr key={r} className="micropage-tr">
                      {row.map((cell, c) => (
                        <td key={c} className="micropage-td">{cell ?? ""}</td>
                      ))}
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        );
      })}
    </>
  );
};

/* ================= MAIN ================= */
const MainMicropage = ({ data }) => {
  if (!data) return null;
  const items = getRenderItems(data);
  if (!items.length) return <div>No content available</div>;

  return (
    <section className="micropage-wrapper">
      <div className="micropage-container">
        {items.map((item, index) => {
          /* ---------- NEW SHAPE: dispatch on tab_type ---------- */
          if (item?.tab_type) {
            const key = `${item.tab_type}-${index}`;
            switch (item.tab_type) {
              case "title":
              case "heading":
                return (
                  <h2 key={key} className="heading">
                    <hr className="heading-line" />
                    {item.heading || item.value?.value || item.value || ""}
                  </h2>
                );

              case "paragraph":
                return (
                  <RichTextRenderer
                    key={key}
                    className="mb-4"
                    html={item.desc || item.value || item.paragraph || item.text || ""}
                  />
                );

              case "image":
              case "single_img":
                return <ImageBlock key={key} item={item} />;

              case "certificate":
                return <CertificateBlock key={key} item={item} />;

              case "table":
                return <TableBlock key={key} block={item} />;

              case "dean":
              case "dean_section": {
                const deanEntries = Array.isArray(item.dean) ? item.dean : [];
                // The heading is managed by the heading type — not the dean
                // profile. Some pages carry it on the block (item.heading), some
                // on the first dean entry (e.g. About "Key Functionaries" stores
                // "Key Functionaries" on dean[0].heading). Render it once with
                // the shared heading style. Pages that instead supply a separate
                // `title` block leave the dean entries heading-less, so there's
                // no duplication.
                const deanHeading =
                  item.heading ||
                  deanEntries.find((e) => e && e.heading)?.heading ||
                  "";
                // Cards-per-row comes from the CMS (per_row / aliases). When set
                // — or when the block holds more than one person — the deans
                // render as a card grid N-per-row (default 3); otherwise a single
                // dean keeps the profile + message layout (e.g. Key Officials).
                const perRowRaw = Number(
                  item.per_row ?? item.deans_per_row ?? item.cards_per_row
                );
                const perRow =
                  Number.isFinite(perRowRaw) && perRowRaw > 0
                    ? Math.min(Math.round(perRowRaw), 6)
                    : 0;
                const useGrid = perRow > 0 || deanEntries.length > 1;
                return (
                  <React.Fragment key={key}>
                    {deanHeading && (
                      <h2 className="heading">
                        <hr className="heading-line" />
                        {deanHeading}
                      </h2>
                    )}
                    {useGrid ? (
                      <DeanCardsGrid
                        entries={deanEntries}
                        cols={perRow || 3}
                      />
                    ) : (
                      <DeanBlock entries={deanEntries} />
                    )}
                  </React.Fragment>
                );
              }

              case "team": {
                // Desktop cards-per-row from the CMS ("columns" arrives as a
                // string, e.g. "4"); fall back to the historical 3-per-row.
                const teamColsRaw = Number(item.columns ?? item.per_row);
                const teamCols =
                  Number.isFinite(teamColsRaw) && teamColsRaw > 0
                    ? Math.min(Math.round(teamColsRaw), 6)
                    : 3;
                return (
                  <TeamBlock
                    key={key}
                    members={item.management_team || []}
                    cols={teamCols}
                  />
                );
              }

              case "slider":
                return <SliderBlock key={key} sliders={item.slider || []} />;

              case "buttons":
                return <ButtonsBlock key={key} items={item.buttons || []} />;

              case "normal":
                return <NormalCardsBlock key={key} cards={item.cards || []} />;

              case "pdf_button":
                return <PdfButtonBlock key={key} items={item.pdf_btn || []} />;

              case "single_button":
                return <SingleButtonBlock key={key} items={item.btn || []} />;

              default:
                return null;
            }
          }

          /* ---------- LEGACY SHAPE: dispatch on type ---------- */
          const key = `${item.type}-${index}`;
          switch (item.type) {
            case "heading":
              return (
                <h2 key={key} className="heading">
                  <hr className="heading-line" />
                  {item.value?.value}
                </h2>
              );

            case "paragraph":
              return (
                <RichTextRenderer
                  key={key}
                  className="mb-4"
                  html={item.value}
                />
              );

            case "image":
              return (
                <SafeImage
                  key={key}
                  src={resolveImage(item.value)}
                  alt=""
                  className="mb-4 rounded"
                />
              );

            case "table": {
              const excel = item.value?.[0]?.["excel-file"];
              const rows = excel?.rows || [];
              const name = item.value?.[0]?.name;
              if (!rows.length) return null;
              const [thead, ...tbody] = rows;

              return (
                <div key={key} className="micropage-table-wrapper">
                  {name && <h2 className="sub-heading">{name}</h2>}
                  <table className="micropage-table">
                    <thead>
                      <tr>
                        {thead.map((h, i) => (
                          <th key={i} className="micropage-th">{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {tbody.map((row, r) => (
                        <tr key={r} className="micropage-tr">
                          {row.map((cell, c) => (
                            <td key={c} className="micropage-td">{cell ?? ""}</td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              );
            }

            case "dean_section": {
              const dean = item.value?.dean || {};
              const message = dean.value || "";
              return (
                <div key={key} className="knowmore-dean-layout">
                  <div className="knowmore-dean-profile">
                    <SafeImage
                      src={resolveImage(dean.image)}
                      alt={dean.name}
                      className="knowmore-dean-image"
                    />
                    <div className="knowmore-dean-info">
                      <p className="knowmore-dean-name">{dean.name}</p>
                      <p>
                        {dean.designation}
                        <br />
                        {dean.qualifications}
                      </p>
                      <p>{dean.email}</p>
                    </div>
                  </div>
                  <div className="knowmore-dean-message">
                    <RichTextRenderer html={message} />
                  </div>
                </div>
              );
            }

            case "management_team_box": {
              const team = item.value || [];
              if (!team.length) return null;
              return (
                <div key={key} className="management-team-wrapper">
                  {team.map((member, i) => (
                    <div key={i} className="management-team-card">
                      <SafeImage
                        src={resolveImage(member.image)}
                        alt={member.name}
                        className="management-team-image"
                      />
                      <div className="management-team-info">
                        <p className="management-team-name">{member.name}</p>
                        <p>
                          {member.designation}
                          <br />
                          {member.qualification}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              );
            }

            default:
              return null;
          }
        })}
      </div>
    </section>
  );
};

export default MainMicropage;
