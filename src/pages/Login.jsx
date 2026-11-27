import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  apiRequest,
  saveSession,
  isLoggedIn,
  getStoredUser,
  logout,
} from "../lib/api.js";
import Navbar from "../components/Navbar.jsx";
import "./Auth.css";

const ALLOWED_ROLES = new Set(["SUPER_ADMIN", "ADMIN"]);

export default function Login() {
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    const existingUser = getStoredUser();
    if (isLoggedIn() && existingUser && ALLOWED_ROLES.has(existingUser.role)) {
      navigate("/dashboard", { replace: true });
    }
  }, [navigate]);

  async function handleSubmit(e) {
    e.preventDefault();

    if (busy) return;

    setError("");
    setBusy(true);

    try {
      const data = await apiRequest("/api/auth/login", {
        method: "POST",
        body: {
          email: email.trim(),
          password,
        },
      });

      if (!data?.user || !ALLOWED_ROLES.has(data.user.role)) {
        logout();
        setError("Access restricted to authorized department administrators.");
        setBusy(false);
        return;
      }

      saveSession(data.token, data.user);
      navigate("/dashboard", { replace: true });
    } catch (err) {
      setError(err?.message || "Unable to sign in. Please try again.");
      setBusy(false);
    }
  }

  return (
    <div className="auth-shell">
      <Navbar />

      <main className="auth-main">
        <div className="card">
          <h1>Department Admin Portal</h1>
          <p className="sub">
            Restricted access for Head of Department and authorized
            administrators.
          </p>

          {error && <div className="alert error">{error}</div>}

          <form onSubmit={handleSubmit}>
            <div className="field">
              <label htmlFor="email">Email</label>
              <input
                type="email"
                id="email"
                autoComplete="username"
                required
                placeholder="admin@christuniversity.in"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>

            <div className="field">
              <label htmlFor="password">Password</label>
              <input
                type="password"
                id="password"
                autoComplete="current-password"
                required
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>

            <button type="submit" className="btn full" disabled={busy}>
              {busy ? "Signing in..." : "Sign in"}
            </button>
          </form>
        </div>
      </main>
    </div>
  );
}
