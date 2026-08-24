import { useState } from "react";
import { Link, NavLink, useNavigate } from "react-router-dom";
import { Menu, X } from "./icons";
import { useQuery } from "@tanstack/react-query";
import MegaMenu from "./NavbarMegaMenu";
import api from "../config/api";
import "../styles/components/navbar.css";

const fetchNavMenu = async () => {
  const { data } = await api.get("/menus/Header");
  return data;
};

const Navbar = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [openSection, setOpenSection] = useState(null);
  const [activeMega, setActiveMega] = useState(null);
  const [closeTimeout, setCloseTimeout] = useState(null);
  const navigate = useNavigate();

  /* ================= SECTION LINK HANDLING =================
     A "#<section-id>" slug (Link Type = Section in admin) should scroll to
     that section, not route. Scroll if it's on the current page; otherwise
     go to the home page and let PageView pick up the pending scroll. */
  const isSectionLink = (slug) =>
    typeof slug === "string" && slug.startsWith("#") && slug.length > 1;

  const handleSectionClick = (e, slug) => {
    e.preventDefault();
    const id = slug.slice(1);
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: "smooth", block: "start" });
    } else {
      sessionStorage.setItem("dm_pending_scroll", id);
      navigate("/");
    }
    setMobileMenuOpen(false);
    setActiveMega(null);
  };

  const { data: menuData } = useQuery({
    queryKey: ["menu", "header"],
    queryFn: fetchNavMenu,
  });

  const menu = menuData?.menu || [];
  const mainMenu = menu.filter((i) => i.position === "Main");
  const topLinks = menu.filter((i) => i.position === "Top");
  const logo = menu.find((i) => i.position === "Logo");

  /* ================= MEGA MENU HANDLERS ================= */
  const handleMouseEnter = (id) => {
    if (closeTimeout) {
      clearTimeout(closeTimeout);
      setCloseTimeout(null);
    }
    setActiveMega(id);
  };

  const handleMouseLeave = () => {
    const timeout = setTimeout(() => {
      setActiveMega(null);
    }, 300);
    setCloseTimeout(timeout);
  };

  const handleMegaItemClick = (e, slug) => {
    if (closeTimeout) {
      clearTimeout(closeTimeout);
      setCloseTimeout(null);
    }
    if (isSectionLink(slug)) {
      handleSectionClick(e, slug);
    }
    setActiveMega(null);
  };

  return (
    <div className="navbar">
      <div className="navbar-inner">
        {/* ================= LOGO ================= */}
        <Link to="/">
          {logo?.image && (
            <img
              src={logo.image}
              alt={logo.title || "Logo"}
              className="navbar-logo"
              // Intrinsic dimensions so the browser reserves the logo's box
              // before it loads (no CLS). CSS (w-[200px]) still controls the
              // rendered size; these only set the aspect ratio.
              width="1048"
              height="354"
            />
          )}
        </Link>

        {/* ================= DESKTOP ================= */}
        <div className="navbar-desktop">
          {/* ================= TOP LINKS ================= */}
          <div className="navbar-top-links">
            {topLinks.map((item) => {
              const isParentMenu = item.type === "parent_menu";

              if (isParentMenu && item.children?.length) {
                return (
                  <div
                    key={item.id}
                    className="relative top-links"
                    onMouseEnter={() => handleMouseEnter(item.id)}
                    onMouseLeave={handleMouseLeave}
                  >
                    <Link to={item.slug || "#"} className="cursor-pointer">
                      {item.title}
                    </Link>

                    {activeMega === item.id && (
                      <div className="absolute top-full left-1/2 -translate-x-1/2 mt-3 bg-white border shadow-lg p-4 z-[9999] w-[300px] transition-all duration-200">
                        {item.children.map((child) =>
                          child.items?.map((subItem) => (
                            <Link
                              key={subItem.id}
                              to={subItem.slug}
                              onClick={(e) => handleMegaItemClick(e, subItem.slug)}
                              className="block py-1 text-sm hover:text-[#F04E30]"
                            >
                              {subItem.title}
                            </Link>
                          ))
                        )}
                      </div>
                    )}
                  </div>
                );
              }

              const inner = item.image ? (
                <div className="navbar-icon-row">
                  <img src={item.image} alt="icon" />
                  <span>{item.title}</span>
                </div>
              ) : (
                item.title
              );

              // Section link → scroll instead of route.
              if (isSectionLink(item.slug)) {
                return (
                  <a
                    key={item.id}
                    href={item.slug}
                    className="top-links"
                    onClick={(e) => handleSectionClick(e, item.slug)}
                  >
                    {inner}
                  </a>
                );
              }

              return (
                <Link key={item.id} to={item.slug} className="top-links">
                  {inner}
                </Link>
              );
            })}
          </div>

          {/* ================= MAIN MENU ================= */}
          <div className="navbar-main">
            {mainMenu.map((item) => {
              const isMega = item.type === "parent_menu";

              return (
                <div
                  key={item.id}
                  className="relative"
                  onMouseEnter={() => handleMouseEnter(item.id)}
                  onMouseLeave={handleMouseLeave}
                >
                  {isMega ? (
                    <Link
                      to={item.slug || "#"}
                      className="nav-link nav-link-disabled"
                    >
                      {item.title}
                    </Link>
                  ) : (
                    <NavLink
                      to={item.slug || "#"}
                      end
                      className={({ isActive }) =>
                        `nav-link ${isActive ? "nav-link-active" : ""}`
                      }
                    >
                      {item.title}
                    </NavLink>
                  )}

                  {isMega && activeMega === item.id && (
                    <div className="absolute left-0 top-full bg-white shadow-lg z-50 transition-all duration-200">
                      <MegaMenu
                        sections={item.children}
                        onItemClick={handleMegaItemClick}
                      />
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* ================= MOBILE BUTTON ================= */}
        <button
          className="mobile-btn"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
        >
          {mobileMenuOpen ? <X /> : <Menu />}
        </button>

        {/* ================= MOBILE MENU ================= */}
        {mobileMenuOpen && (
          <div className="mobile-menu-full">
            <button
              className="mobile-close-btn"
              onClick={() => setMobileMenuOpen(false)}
            >
              <X size={28} />
            </button>

            <div className="mobile-content-container">
              {mainMenu.map((item) => {
                const isMega = item.type === "parent_menu";

                return (
                  <div key={item.id} className="mobile-section">
                    {isMega ? (
                      <button
                        className="mobile-heading-btn-mega"
                        onClick={() =>
                          setOpenSection(
                            openSection === item.id ? null : item.id
                          )
                        }
                      >
                        {item.title}
                      </button>
                    ) : (
                      <Link
                        to={item.slug}
                        className="mobile-heading-btn"
                        onClick={() => setMobileMenuOpen(false)}
                      >
                        {item.title}
                      </Link>
                    )}

                    {isMega && openSection === item.id && (
                      <div className="pl-4 mt-3 space-y-3">
                        {item.children?.map((campus, i) => (
                          <div key={i}>
                            {campus.campus && (
                              <p className="font-semibold text-sm">
                                {campus.campus}
                              </p>
                            )}

                            {campus.items?.map((col, j) => (
                              <Link
                                key={j}
                                to={col.slug}
                                className="mobile-link"
                                onClick={() => setMobileMenuOpen(false)}
                              >
                                {col.title}
                              </Link>
                            ))}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            <div className="mobile-bottom-links">
              {topLinks.map((item) => {
                const isParentMenu = item.type === "parent_menu";

                // Parent-menu top links (e.g. Admission) open a dropdown on
                // desktop hover; on mobile there was no way to reach their
                // children, so make them tap-to-expand.
                if (isParentMenu && item.children?.length) {
                  return (
                    <div key={item.id}>
                      <button
                        type="button"
                        className="mobile-link w-full text-left"
                        onClick={() =>
                          setOpenSection(
                            openSection === item.id ? null : item.id
                          )
                        }
                      >
                        {item.title}
                      </button>

                      {openSection === item.id && (
                        <div className="pl-4 mt-1 space-y-1">
                          {item.children.map((child, i) =>
                            (child.items || []).map((subItem, j) =>
                              isSectionLink(subItem.slug) ? (
                                <a
                                  key={`${i}-${j}`}
                                  href={subItem.slug}
                                  className="mobile-link"
                                  onClick={(e) =>
                                    handleSectionClick(e, subItem.slug)
                                  }
                                >
                                  {subItem.title}
                                </a>
                              ) : (
                                <Link
                                  key={`${i}-${j}`}
                                  to={subItem.slug}
                                  className="mobile-link"
                                  onClick={() => setMobileMenuOpen(false)}
                                >
                                  {subItem.title}
                                </Link>
                              )
                            )
                          )}
                        </div>
                      )}
                    </div>
                  );
                }

                return isSectionLink(item.slug) ? (
                  <a
                    key={item.id}
                    href={item.slug}
                    className="mobile-link"
                    onClick={(e) => handleSectionClick(e, item.slug)}
                  >
                    {item.title}
                  </a>
                ) : (
                  <Link
                    key={item.id}
                    to={item.slug}
                    className="mobile-link"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    {item.title}
                  </Link>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Navbar;
