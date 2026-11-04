import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { apiRequest, saveSession, isLoggedIn } from "../lib/api.js";
import Navbar from "../components/Navbar.jsx";
import "./Auth.css";

export default function Login() {
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (isLoggedIn()) {
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
          <h1>Sign in</h1>
          <p className="sub">Faculty, HOD and student portal access.</p>

          {error && <div className="alert error">{error}</div>}

          <form onSubmit={handleSubmit}>
            <div className="field">
              <label htmlFor="email">Email</label>
              <input
                type="email"
                id="email"
                autoComplete="username"
                required
                placeholder="you@example.com"
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

          <p className="alt-row">
            New student? <Link to="/register">Create a student account</Link>
            <br />
            Received an invite?{" "}
            <Link to="/accept-invite">Accept your invitation</Link>
          </p>

          <details className="demo-details">
            <summary>Demo accounts (dev only)</summary>
            <table>
              <tbody>
                <tr>
                  <td>Super admin</td>
                  <td>
                    <code>superadmin@adse.local</code>
                  </td>
                </tr>
                <tr>
                  <td>HOD (admin)</td>
                  <td>
                    <code>hod@christ.example.com</code>
                  </td>
                </tr>
                <tr>
                  <td>Faculty</td>
                  <td>
                    <code>faculty@christ.example.com</code>
                  </td>
                </tr>
                <tr>
                  <td>Student</td>
                  <td>
                    <code>student@christ.example.com</code>
                  </td>
                </tr>
              </tbody>
            </table>
          </details>
        </div>
      </main>
    </div>
  );
}
