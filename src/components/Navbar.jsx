import { useState } from "react";
import { Link, NavLink } from "react-router-dom";
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
  const loggedIn = isLoggedIn();
  const user = getStoredUser();

  const linkClass = ({ isActive }) => (isActive ? "active" : undefined);

  function handleAccountClick() {
    if (loggedIn) logout(); // "Logout" action lives next to Dashboard entry
  }

  return (
    <header className="navbar">
      <div className="navbar-inner">
        <Link to="/">
          <img
            src="https://cdn.builder.io/api/v1/image/assets/TEMP/c6cfcd55332049a9408582f69ed157d9eecf76f0?width=304"
            alt="CHRIST University Logo"
            className="navbar-logo"
          />
        </Link>
        <div className="navbar-center">
          <div className="navbar-links">
            <nav className="nav-menu">
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
                    onClick={(e) => {
                      e.preventDefault();
                      handleAccountClick();
                      window.location.href = "/";
                    }}
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
      </div>
      <div className="hamburger" onClick={() => setMenuOpen((o) => !o)}>
        <span></span>
        <span></span>
        <span></span>
      </div>
      <div className={`mobile-menu${menuOpen ? " active" : ""}`}>
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

            <a
              href="/"
              className="account-logout"
              onClick={(e) => {
                e.preventDefault();
                logout();
                setMenuOpen(false);
                window.location.href = "/";
              }}>
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
      </div>
    </header>
  );
}
