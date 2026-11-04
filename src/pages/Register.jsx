import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { apiRequest, saveSession, isLoggedIn } from "../lib/api.js";
import Navbar from "../components/Navbar.jsx";
import "./Auth.css";

export default function Register() {
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: "", email: "", password: "" });
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (isLoggedIn()) {
      navigate("/dashboard", { replace: true });
    }
  }, [navigate]);

  function update(key) {
    return (e) => setForm((f) => ({ ...f, [key]: e.target.value }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setBusy(true);

    try {
      const data = await apiRequest("/api/auth/register/student", {
        method: "POST",
        body: form,
      });

      saveSession(data.token, data.user);
      navigate("/dashboard", { replace: true });
    } catch (err) {
      setError(err.message || "Registration failed. Please try again.");
      setBusy(false);
    }
  }

  return (
    <div className="auth-shell">
      <Navbar />
      <main className="auth-main">
        <div className="card">
          <h1>Student registration</h1>
          <p className="sub">
            Create an account to track your application and project statuses.
          </p>

          {error && <div className="alert error">{error}</div>}

          <form onSubmit={handleSubmit}>
            <div className="field">
              <label htmlFor="name">Full name</label>
              <input
                type="text"
                id="name"
                required
                placeholder="Your name"
                autoComplete="name"
                value={form.name}
                onChange={update("name")}
              />
            </div>

            <div className="field">
              <label htmlFor="email">College email</label>
              <input
                type="email"
                id="email"
                required
                placeholder="you@christ.example.com"
                autoComplete="username"
                value={form.email}
                onChange={update("email")}
              />
            </div>

            <div className="field">
              <label htmlFor="password">Password (min. 8 characters)</label>
              <input
                type="password"
                id="password"
                minLength={8}
                required
                placeholder="••••••••"
                autoComplete="new-password"
                value={form.password}
                onChange={update("password")}
              />
            </div>

            <button type="submit" className="btn full" disabled={busy}>
              {busy ? "Creating account..." : "Create account"}
            </button>
          </form>

          <p className="alt-row">
            Already registered? <Link to="/login">Sign in</Link>
          </p>

          <p className="alt-row" style={{ fontSize: "0.8rem" }}>
            Faculty accounts are created via HOD invitation — ask your
            department office.
          </p>
        </div>
      </main>
    </div>
  );
}
