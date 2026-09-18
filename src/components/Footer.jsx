import { useMemo } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import api from "../config/api";
import resolveImage from "../utils/resolveImage";
import "../styles/components/footer.css";

const fetchFooter = async () => {
  const { data } = await api.get("/menus/Footer");
  return data;
};

/* A "#<section-id>" slug (Link Type = Section in admin) scrolls to that
   section rather than routing — same rule the navbar uses. A bare "#" is not
   a section link, it is the API's "no destination" placeholder. */
const isSectionLink = (slug) =>
  typeof slug === "string" && slug.startsWith("#") && slug.length > 1;

const SafeLink = ({ to, children }) => {
  const navigate = useNavigate();

  if (!to || to === "#") return <span className="cursor-default">{children}</span>;

  // Section link → scroll instead of route. Deliberately the same behaviour as
  // Navbar's handleSectionClick: scroll if the section is on the page we are
  // already on, otherwise leave the target id in sessionStorage and go home,
  // where PageView picks "dm_pending_scroll" up and scrolls once the (lazily
  // loaded) section has mounted.
  if (isSectionLink(to)) {
    const handleSectionClick = (e) => {
      e.preventDefault();
      const id = to.slice(1);
      const el = document.getElementById(id);
      if (el) {
        el.scrollIntoView({ behavior: "smooth", block: "start" });
      } else {
        sessionStorage.setItem("dm_pending_scroll", id);
        navigate("/");
      }
    };

    return (
      <a href={to} onClick={handleSectionClick}>
        {children}
      </a>
    );
  }

  // External links
  if (to.startsWith("http://") || to.startsWith("https://")) {
    return (
      <a href={to} target="_blank" rel="noopener noreferrer">
        {children}
      </a>
    );
  }

  return <Link to={to}>{children}</Link>;
};

/* ===== Social icon map (icon name → SVG) ===== */
const SOCIAL_ICONS = {
  instagram: (
    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
      <path d="M12 2.163c3.204 0 3.584.012 4.85.07 1.17.054 1.97.24 2.43.403a4.92 4.92 0 011.77 1.153 4.92 4.92 0 011.153 1.77c.163.46.35 1.26.403 2.43.058 1.266.07 1.646.07 4.85s-.012 3.584-.07 4.85c-.054 1.17-.24 1.97-.403 2.43a4.92 4.92 0 01-1.153 1.77 4.92 4.92 0 01-1.77 1.153c-.46.163-1.26.35-2.43.403-1.266.058-1.646.07-4.85.07s-3.584-.012-4.85-.07c-1.17-.054-1.97-.24-2.43-.403a4.92 4.92 0 01-1.77-1.153 4.92 4.92 0 01-1.153-1.77c-.163-.46-.35-1.26-.403-2.43C2.175 15.584 2.163 15.204 2.163 12s.012-3.584.07-4.85c.054-1.17.24-1.97.403-2.43A4.92 4.92 0 013.79 2.95a4.92 4.92 0 011.77-1.153c.46-.163 1.26-.35 2.43-.403C9.416 2.175 9.796 2.163 12 2.163M12 0C8.741 0 8.333.014 7.053.072 5.775.13 4.903.333 4.14.63a6.88 6.88 0 00-2.49 1.62A6.88 6.88 0 00.03 4.74C-.267 5.503-.47 6.375-.528 7.653-.586 8.933-.6 9.341-.6 12.6s.014 3.667.072 4.947c.058 1.278.261 2.15.558 2.913a6.88 6.88 0 001.62 2.49 6.88 6.88 0 002.49 1.62c.763.297 1.635.5 2.913.558C8.333 24.586 8.741 24.6 12 24.6s3.667-.014 4.947-.072c1.278-.058 2.15-.261 2.913-.558a6.88 6.88 0 002.49-1.62 6.88 6.88 0 001.62-2.49c.297-.763.5-1.635.558-2.913.058-1.28.072-1.688.072-4.947s-.014-3.667-.072-4.947c-.058-1.278-.261-2.15-.558-2.913a6.88 6.88 0 00-1.62-2.49A6.88 6.88 0 0019.86.63C19.097.333 18.225.13 16.947.072 15.667.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z" />
    </svg>
  ),
  facebook: (
    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
      <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
    </svg>
  ),
  linkedin: (
    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
      <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
    </svg>
  ),
  youtube: (
    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
      <path d="M23.498 6.186a3.016 3.016 0 00-2.122-2.136C19.505 3.546 12 3.546 12 3.546s-7.505 0-9.377.504A3.017 3.017 0 00.502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 002.122 2.136c1.871.504 9.376.504 9.376.504s7.505 0 9.377-.504a3.015 3.015 0 002.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
    </svg>
  ),
};

/* ===== Helper: extract groups from a column (new format) ===== */
const extractGroups = (col) => {
  const parentItems = col.items || [];
  return parentItems.map((parent) => {
    const subData = col[String(parent.id)] || {};
    return {
      title: parent.title,
      slug: parent.slug,
      items: subData.items || [],
      campus: subData.campus || null,
    };
  });
};

const Footer = () => {
  const { data: rawData } = useQuery({
    queryKey: ["menu", "footer"],
    queryFn: fetchFooter,
  });

  const footer = useMemo(() => {
    if (!rawData?.data) return null;

    const data = rawData.data;
    const col1 = data.Footer?.COL1 || {};
    const col2 = data.Footer?.COL2 || {};
    const col3 = data.Footer?.COL3 || {};
    const col4 = data.Footer?.COL4 || {};
    const bottom = data.Bottom?.Bottom || {};

    // Detect new format: COL2.items array where parent IDs exist as keys
    const isNewFormat =
      Array.isArray(col2.items) &&
      col2.items.length > 0 &&
      col2[String(col2.items[0]?.id)];

    if (isNewFormat) {
      const col1Item = col1.items?.[0] || {};
      return {
        isNewFormat: true,
        // COL1
        logo: col1Item.image || null,
        addressTitle: col1Item.title || "",
        addressDesc: col1Item.description || "",
        // COL2 – COL4: generic groups
        col2Groups: extractGroups(col2),
        col3Groups: extractGroups(col3),
        col4Groups: extractGroups(col4),
        // Bottom: social media
        socials: bottom.items?.filter((i) => i.icon && i.slug) || [],
        copyright: bottom.items?.find((i) => !i.icon)?.description || "",
      };
    }

    // ===== OLD FORMAT FALLBACK =====
    return {
      isNewFormat: false,
      logo: col1.items?.[0]?.image || null,
      address: col1.items?.[0]?.description?.split("\n") || [],
      contactTitle: col1["Contact"]?.title || "",
      contactValue: col1["Contact"]?.items?.[0]?.description || "",
      emailTitle: col1["Email"]?.title || "",
      emailValue:
        col1["Email"]?.items?.find((i) => i.description)?.description?.trim() ||
        "",
      socials: col1["Email"]?.items?.filter((i) => i.icon && i.slug) || [],
      programs: col2["Programs"] || {},
      terms: col2["Terms & Conditions"] || {},
      colleges: col3["College"] || {},
      otherLinks: col3.items || [],
      importantLinks: col4["Important Links"] || {},
      copyright: bottom.items?.[0]?.description || "",
    };
  }, [rawData]);

  if (!footer) return null;

  /* ==================== COL1 ==================== */
  const renderCol1 = () => {
    if (footer.isNewFormat) {
      return (
        <div className="footer-col">
          {footer.logo && (
            <img
              src={footer.logo}
              alt="Logo"
              className="footer-logo footer-logo-mobile"
            />
          )}

          {footer.addressTitle && (
            <p className="footer-address footer-address-mobile">
              {footer.addressTitle}
            </p>
          )}

          {footer.addressDesc && (
            <p className="mt-2 text-gray-300 text-xs">
              {footer.addressDesc}
            </p>
          )}

          {footer.socials?.length > 0 && (
            <div className="footer-socials footer-socials-mobile mt-4">
              {footer.socials.map((item, index) => {
                const iconName = item.icon?.toLowerCase();
                const svg = SOCIAL_ICONS[iconName];
                return (
                  <a
                    key={`social-${item.id || index}`}
                    href={item.slug}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-white hover:text-yellow-400 transition-colors"
                    title={item.title}
                  >
                    {svg || (
                      <img
                        className="footer-icons"
                        src={resolveImage(item.icon)}
                        alt={item.title}
                      />
                    )}
                  </a>
                );
              })}
            </div>
          )}
        </div>
      );
    }

    // Old format
    return (
      <div className="footer-col">
        {footer.logo && (
          <img
            src={footer.logo}
            alt="Logo"
            className="footer-logo footer-logo-mobile"
          />
        )}

        {footer.address.length > 0 && (
          <div className="footer-address footer-address-mobile">
            {footer.address.map((line, i) => (
              <p key={`addr-${i}`}>{line}</p>
            ))}
          </div>
        )}

        {footer.contactValue && (
          <div className="footer-contact-mobile">
            <h3 className="footer-subtitle">{footer.contactTitle}</h3>
            <p>{footer.contactValue}</p>
          </div>
        )}

        {footer.emailValue && (
          <div className="footer-email-mobile">
            <h3 className="footer-subtitle">{footer.emailTitle}</h3>
            <p>{footer.emailValue}</p>
          </div>
        )}

        {footer.socials.length > 0 && (
          <div className="footer-socials footer-socials-mobile">
            {footer.socials.map((item, index) => {
              const iconName = item.icon?.toLowerCase();
              const svg = SOCIAL_ICONS[iconName];
              return (
                <a
                  key={`social-${item.id || index}`}
                  href={item.slug}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-white hover:text-yellow-400 transition-colors"
                  title={item.title}
                >
                  {svg || (
                    <img
                      className="footer-icons"
                      src={resolveImage(item.icon)}
                      alt={item.title}
                    />
                  )}
                </a>
              );
            })}
          </div>
        )}
      </div>
    );
  };

  /* ==================== GENERIC COLUMN RENDERER ==================== */
  const renderGroupColumn = (groups, colKey) => (
    <div className="footer-col">
      {groups.map((group, gIdx) => (
        <div key={`${colKey}-group-${gIdx}`} className="mb-4">
          {group.title && (
            <h3 className="footer-title">{group.title}</h3>
          )}

          {/* Campus grouped list */}
          {group.campus &&
            Object.entries(group.campus).map(
              ([campusName, list], campusIdx) => (
                <div
                  key={`${colKey}-campus-${campusIdx}`}
                  className="footer-campus"
                >
                  <strong className="mt-2">{campusName}</strong>
                  <ul className="list-disc ml-5">
                    {list
                      ?.sort((a, b) => a.sort_order - b.sort_order)
                      .map((item, idx) => (
                        <li
                          className="mt-1"
                          key={`${colKey}-ci-${item.id}-${idx}`}
                        >
                          <SafeLink to={item.slug}>
                            {item.title}
                          </SafeLink>
                        </li>
                      ))}
                  </ul>
                </div>
              )
            )}

          {/* Regular items list */}
          {group.items.length > 0 && (
            <ul className={!group.title ? "footer-subtitle footer-other-grid" : "mb-2"}>
              {group.items.map((item, idx) => (
                <li
                  className="mt-1"
                  key={`${colKey}-item-${item.id}-${idx}`}
                >
                  <SafeLink to={item.slug}>{item.title}</SafeLink>
                </li>
              ))}
            </ul>
          )}
        </div>
      ))}
    </div>
  );

  /* ==================== OLD FORMAT COL2-4 ==================== */
  const renderCol2Old = () => (
    <div className="footer-col">
      <h3 className="footer-title">{footer.programs?.title}</h3>
      <ul className="mb-2">
        {footer.programs?.items?.map((item, index) => (
          <li className="mt-1" key={`program-${item.id}-${index}`}>
            <SafeLink to={item.slug}>{item.title}</SafeLink>
          </li>
        ))}
      </ul>

      <h3 className="footer-title">{footer.terms?.title}</h3>
      <ul>
        {footer.terms?.items?.map((item, index) => (
          <li className="mt-1" key={`term-${item.id}-${index}`}>
            <SafeLink to={item.slug}>{item.title}</SafeLink>
          </li>
        ))}
      </ul>
    </div>
  );

  const renderCol3Old = () => (
    <div className="footer-col">
      <h3 className="footer-title">{footer.colleges?.title}</h3>

      {Object.entries(footer.colleges?.campus || {}).map(
        ([campus, list], campusIndex) => (
          <div key={`campus-${campusIndex}`} className="footer-campus">
            <strong className="mt-2">{campus}</strong>
            <ul className="list-disc ml-5">
              {list
                ?.sort((a, b) => a.sort_order - b.sort_order)
                .map((item, index) => (
                  <li className="mt-1" key={`college-${item.id}-${index}`}>
                    <SafeLink to={item.slug}>{item.title}</SafeLink>
                  </li>
                ))}
            </ul>
          </div>
        )
      )}

      {footer.otherLinks.length > 0 && (
        <ul className="footer-subtitle footer-other-grid">
          {footer.otherLinks.map((item, index) => (
            <li key={`other-${item.id}-${index}`}>
              <SafeLink to={item.slug}>{item.title}</SafeLink>
            </li>
          ))}
        </ul>
      )}
    </div>
  );

  const renderCol4Old = () => (
    <div className="footer-col">
      <h3 className="footer-title">{footer.importantLinks?.title}</h3>
      <ul>
        {footer.importantLinks?.items?.map((item, index) => (
          <li key={`important-${item.id}-${index}`}>
            <SafeLink to={item.slug}>{item.title}</SafeLink>
          </li>
        ))}
      </ul>
    </div>
  );

  /* ==================== SOCIAL BAR (new format Bottom) ==================== */
  const renderSocials = () => {
    if (!footer.socials?.length) return null;

    return (
      <div className="footer-socials-row">
        {footer.socials.map((item, index) => {
          const iconName = item.icon?.toLowerCase();
          const svg = SOCIAL_ICONS[iconName];

          return (
            <a
              key={`social-${item.id || index}`}
              href={item.slug}
              target="_blank"
              rel="noopener noreferrer"
              className="text-white hover:text-yellow-400 transition-colors"
              title={item.title}
            >
              {svg || (
                <img
                  className="footer-icons"
                  src={resolveImage(item.icon)}
                  alt={item.title}
                />
              )}
            </a>
          );
        })}
      </div>
    );
  };

  /* ==================== RENDER ==================== */
  const renderCol2 = () =>
    footer.isNewFormat
      ? renderGroupColumn(footer.col2Groups, "col2")
      : renderCol2Old();

  const renderCol3 = () =>
    footer.isNewFormat
      ? renderGroupColumn(footer.col3Groups, "col3")
      : renderCol3Old();

  const renderCol4 = () =>
    footer.isNewFormat
      ? renderGroupColumn(footer.col4Groups, "col4")
      : renderCol4Old();

  return (
    <>
      {/* ================= DESKTOP FOOTER ================= */}
      <footer className="footer footer-desktop">
        <div className="footer-grid footer-grid-4">
          {renderCol1()}
          {renderCol2()}
          {renderCol3()}
          {renderCol4()}
        </div>
        {footer.copyright && (
          <p className="footer-bottom">{footer.copyright}</p>
        )}
      </footer>

      {/* ================= MOBILE FOOTER ================= */}
      <footer className="footer footer-mobile">
        <div className="footer-mobile-grid">
          {renderCol1()}
          {renderCol2()}
          {renderCol3()}
          {renderCol4()}
        </div>
        {footer.copyright && (
          <p className="footer-bottom">{footer.copyright}</p>
        )}
      </footer>
    </>
  );
};

export default Footer;
