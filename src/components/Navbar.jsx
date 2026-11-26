import OptimizedImage from "./OptimizedImage.jsx";
import { useEffect, useState } from "react";
import { Link, NavLink, useLocation } from "react-router-dom";
import { isLoggedIn, logout, getStoredUser } from "../lib/api.js";

const NAV_ITEMS = [
  { to: "/", label: "Home" },
  { to: "/about", label: "About Us" },
  { to: "/contact", label: "Contact Us" },
  { to: "/newsletter", label: "Newsletter" },
  { to: "/service-learning", label: "Service Learning" },
];

export default function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false);
  const { pathname } = useLocation();
  const loggedIn = isLoggedIn();
  const user = getStoredUser();

  const linkClass = ({ isActive }) => (isActive ? "active" : undefined);

  useEffect(() => {
    setMenuOpen(false);
  }, [pathname]);

  useEffect(() => {
    if (!menuOpen) return;

    function handleKeyDown(e) {
      if (e.key === "Escape") {
        setMenuOpen(false);
      }
    }

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [menuOpen]);

  function handleLogoutClick(e) {
    e.preventDefault();
    logout();
    setMenuOpen(false);
    window.location.href = "/";
  }

  return (
    <header className="navbar">
      <div className="navbar-inner">
        <Link to="/" onClick={() => setMenuOpen(false)}>
          <OptimizedImage
            src="https://cdn.builder.io/api/v1/image/assets/TEMP/c6cfcd55332049a9408582f69ed157d9eecf76f0?width=304"
            alt="CHRIST University Logo"
            className="navbar-logo"
            priority
          />
        </Link>

        <div className="navbar-center">
          <div className="navbar-links">
            <nav className="nav-menu" aria-label="Primary navigation">
              {NAV_ITEMS.map((item) => (
                <NavLink
                  key={item.to}
                  to={item.to}
                  className={linkClass}
                  end={item.to === "/"}>
                  {item.label}
                </NavLink>
              ))}
              {loggedIn ? (
                <>
                  <NavLink
                    to="/dashboard"
                    className={({ isActive }) =>
                      `account-link${isActive ? " active" : ""}`
                    }>
                    Dashboard
                  </NavLink>
                  <a
                    href="/login"
                    className="account-logout"
                    onClick={handleLogoutClick}
                    title={user ? `Signed in as ${user.email}` : undefined}>
                    Logout
                  </a>
                </>
              ) : (
                <Link to="/login" className="account-link">
                  Login
                </Link>
              )}
            </nav>
          </div>
        </div>

        <button
          type="button"
          className={`hamburger${menuOpen ? " open active" : ""}`}
          aria-label={
            menuOpen ? "Close navigation menu" : "Open navigation menu"
          }
          aria-expanded={menuOpen}
          aria-controls="mobile-nav-drawer"
          onClick={() => setMenuOpen((o) => !o)}>
          <span></span>
          <span></span>
          <span></span>
        </button>
      </div>

      <nav
        id="mobile-nav-drawer"
        aria-label="Mobile navigation"
        className={`mobile-menu${menuOpen ? " open active" : ""}`}>
        {NAV_ITEMS.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            className={linkClass}
            end={item.to === "/"}
            onClick={() => setMenuOpen(false)}>
            {item.label}
          </NavLink>
        ))}

        {loggedIn ? (
          <>
            <NavLink
              to="/dashboard"
              className={({ isActive }) =>
                `account-link${isActive ? " active" : ""}`
              }
              onClick={() => setMenuOpen(false)}>
              Dashboard
            </NavLink>

            <a href="/" className="account-logout" onClick={handleLogoutClick}>
              Logout
            </a>
          </>
        ) : (
          <Link
            to="/login"
            className="account-link"
            onClick={() => setMenuOpen(false)}>
            Login
          </Link>
        )}
      </nav>
    </header>
  );
}
