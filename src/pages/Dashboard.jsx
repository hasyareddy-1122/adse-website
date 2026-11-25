/* Role-adaptive dashboard.
-  STUDENT     → own status tracking (read-only)
-  FACULTY     → own profile editor
-  ADMIN (HOD) → invite/remove faculties, manage users, directory,
-                newsletter, service-learning & department activities
-  SUPER_ADMIN → everything above + full event management + site content editor + admin invites */
import { useCallback, useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  apiRequest,
  getStoredUser,
  isLoggedIn,
  ROLE_LABELS,
  fmtDate,
  getApiUrl,
} from "../lib/api.js";
import Navbar from "../components/Navbar.jsx";
import "./Dashboard.css";

const EMPTY_FACULTY_PROFILE = {
  name: "",
  designation: "",
  qualification: "",
  image: "",
  publicEmail: "",
  researchGate: "",
  googleScholar: "",
  orcid: "",
  website: "",
  cabinLocation: "",
};

const EMPTY_EVENT_FORM = {
  title: "",
  description: "",
  imageUrl: "",
  eventDate: "",
  startTime: "",
  endTime: "",
  venue: "",
  status: "DRAFT",
  isFeatured: false,
};

function toDateInputValue(rawDate) {
  if (!rawDate) return "";
  const parsed = new Date(rawDate);
  if (Number.isNaN(parsed.getTime())) return "";
  return parsed.toISOString().slice(0, 10);
}

function resolvePreviewUrl(url) {
  if (!url) return "";
  if (/^https?:\/\//i.test(url)) return url;
  return getApiUrl(url.startsWith("/") ? url : `/${url}`);
}

/* ─── STUDENT ─────────────────────────────────────────────────────────────── */

function StudentStatuses({ onErr }) {
  const [statuses, setStatuses] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadStatuses = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const d = await onErr(apiRequest("/api/statuses"));
      setStatuses(d.statuses ?? []);
    } catch (err) {
      setError(err?.message || "Failed to load status records.");
    } finally {
      setLoading(false);
    }
  }, [onErr]);

  useEffect(() => {
    loadStatuses();
  }, [loadStatuses]);

  return (
    <section className="panel">
      <h2>My statuses</h2>
      {loading ? (
        <p className="empty">Loading…</p>
      ) : error ? (
        <div>
          <div className="alert error" role="alert">
            {error}
          </div>
          <button type="button" className="btn" onClick={loadStatuses}>
            Retry
          </button>
        </div>
      ) : statuses.length === 0 ? (
        <p className="empty">
          No status entries yet. Your department will add items here.
        </p>
      ) : (
        <table className="data">
          <thead>
            <tr>
              <th>Item</th>
              <th>Status</th>
              <th>Remark</th>
              <th>Last updated</th>
            </tr>
          </thead>
          <tbody>
            {statuses.map((s) => (
              <tr key={s.id}>
                <td>{s.title}</td>
                <td>
                  <span className={`pill pill-${s.status}`}>
                    {s.status ? String(s.status).replaceAll("_", " ") : ""}
                  </span>
                </td>
                <td>{s.remark || "—"}</td>
                <td className="muted">{fmtDate(s.updatedAt)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </section>
  );
}

/* ─── FACULTY: My Profile ────────────────────────────────────────────────── */

function FacultyProfileEditor({ onErr, flashFn }) {
  const [profile, setProfile] = useState(EMPTY_FACULTY_PROFILE);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState("");
  const [saving, setSaving] = useState(false);

  const updateField = (e) => {
    setProfile((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const loadProfile = useCallback(async () => {
    setLoading(true);
    setLoadError("");

    try {
      const data = await apiRequest("/api/faculties/me");

      if (!data?.faculty) {
        throw new Error(
          "The server did not return a faculty profile. Please try again.",
        );
      }

      setProfile({ ...EMPTY_FACULTY_PROFILE, ...data.faculty });
    } catch (err) {
      setLoadError(
        err?.message ||
          "Unable to load your faculty profile. Please try again.",
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadProfile();
  }, [loadProfile]);

  async function saveProfile(e) {
    e.preventDefault();

    if (loading || loadError) return;

    setSaving(true);

    try {
      const data = await onErr(
        apiRequest("/api/faculties/me", {
          method: "PUT",
          body: profile,
        }),
      );

      if (!data?.faculty) {
        throw new Error("The server did not return the updated profile.");
      }

      setProfile({ ...EMPTY_FACULTY_PROFILE, ...data.faculty });
      flashFn("Your faculty profile has been updated.");
    } catch {
      // Shared error handler displays API errors.
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <section className="panel">
        <h2>My Faculty Profile</h2>
        <p className="empty">Loading profile…</p>
      </section>
    );
  }

  if (loadError) {
    return (
      <section className="panel">
        <h2>My Faculty Profile</h2>
        <div className="alert error" role="alert">
          {loadError}
        </div>
        <button
          type="button"
          className="btn"
          onClick={loadProfile}
          disabled={loading}>
          Retry
        </button>
      </section>
    );
  }

  const fields = [
    ["name", "Full name"],
    ["designation", "Designation"],
    ["qualification", "Qualifications"],
    ["image", "Profile image URL"],
    ["publicEmail", "Public academic email"],
    ["cabinLocation", "Cabin / office location"],
    ["researchGate", "ResearchGate URL"],
    ["googleScholar", "Google Scholar URL"],
    ["orcid", "ORCID URL or identifier"],
    ["website", "Personal / academic website"],
  ];

  return (
    <section className="panel">
      <h2>My Faculty Profile</h2>
      <p className="muted">
        Update the details displayed on your public faculty profile.
      </p>

      <form onSubmit={saveProfile} className="inline">
        <div className="grid-2">
          {fields.map(([name, label]) => (
            <div className="field" key={name}>
              <label htmlFor={`faculty-my-${name}`}>{label}</label>
              <input
                id={`faculty-my-${name}`}
                name={name}
                value={profile[name] ?? ""}
                onChange={updateField}
                type={name === "publicEmail" ? "email" : "text"}
                maxLength={500}
              />
            </div>
          ))}
        </div>

        <button
          type="submit"
          className="btn"
          disabled={saving || loading || Boolean(loadError)}>
          {saving ? "Saving…" : "Save Profile"}
        </button>
      </form>
    </section>
  );
}

/* ─── STAFF: Invitations ──────────────────────────────────────────────────── */

function InvitationsPanel({ user, onErr, flashFn }) {
  const [invites, setInvites] = useState(null);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState("");

  const [form, setForm] = useState({ name: "", email: "", role: "FACULTY" });
  const [resultUrl, setResultUrl] = useState("");
  const [formError, setFormError] = useState("");
  const [sendingInvite, setSendingInvite] = useState(false);

  const refreshInvites = useCallback(async () => {
    setLoading(true);
    setLoadError("");
    try {
      const d = await onErr(apiRequest("/api/users/invites"));
      setInvites(d.invitations ?? []);
    } catch (err) {
      setLoadError(err?.message || "Failed to load invitations.");
    } finally {
      setLoading(false);
    }
  }, [onErr]);

  useEffect(() => {
    refreshInvites();
  }, [refreshInvites]);

  async function handleInvite(e) {
    e.preventDefault();

    if (sendingInvite) return;

    setFormError("");
    setResultUrl("");
    setSendingInvite(true);

    try {
      const data = await onErr(
        apiRequest("/api/users/invite", {
          method: "POST",
          body: form,
        }),
      );

      setResultUrl(new URL(data.inviteUrl, window.location.href).href);
      flashFn(`Invitation created for ${data.invitation.email}.`);
      setForm({ name: "", email: "", role: "FACULTY" });
      await refreshInvites();
    } catch (err) {
      setFormError(err?.message || "Failed to create invitation.");
    } finally {
      setSendingInvite(false);
    }
  }

  async function revoke(id) {
    if (!confirm("Revoke this invitation?")) return;
    try {
      await onErr(apiRequest(`/api/users/invites/${id}`, { method: "DELETE" }));
      flashFn("Invitation revoked.");
      await refreshInvites();
    } catch {
      /* handled */
    }
  }

  return (
    <section className="panel">
      <h2>Add / remove faculties (email invitation)</h2>
      {formError && <div className="alert error">{formError}</div>}
      {resultUrl && (
        <div className="alert ok">
          Share this link (also emailed/logged):
          <br />
          <input
            type="text"
            readOnly
            value={resultUrl}
            onFocus={(e) => e.target.select()}
            style={{ marginTop: 6 }}
          />
        </div>
      )}
      <form onSubmit={handleInvite} className="inline cols-4">
        <div className="field">
          <label htmlFor="invite-name">Name</label>
          <input
            id="invite-name"
            type="text"
            required
            placeholder="Dr. Jane Doe"
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
          />
        </div>
        <div className="field">
          <label htmlFor="invite-email">Email</label>
          <input
            id="invite-email"
            type="email"
            required
            placeholder="jane@christ.example.com"
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
          />
        </div>
        <div className="field">
          <label htmlFor="invite-role">Role</label>
          <select
            id="invite-role"
            value={form.role}
            onChange={(e) => setForm({ ...form, role: e.target.value })}>
            <option value="FACULTY">Faculty</option>
            {user.role === "SUPER_ADMIN" && (
              <option value="ADMIN">Admin (HOD)</option>
            )}
          </select>
        </div>

        <button type="submit" className="btn" disabled={sendingInvite}>
          {sendingInvite ? "Sending…" : "Send invite"}
        </button>
      </form>

      <h2 style={{ marginTop: 20, fontSize: ".9rem" }}>Pending invitations</h2>
      {loading ? (
        <p className="empty">Loading invitations…</p>
      ) : loadError ? (
        <div>
          <div className="alert error">{loadError}</div>
          <button type="button" className="btn btn-sm" onClick={refreshInvites}>
            Retry
          </button>
        </div>
      ) : !invites || !invites.length ? (
        <p className="empty">No pending invitations.</p>
      ) : (
        <table className="data">
          <thead>
            <tr>
              <th>Email</th>
              <th>Role</th>
              <th>Expires</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {invites.map((i) => (
              <tr key={i.id}>
                <td>
                  {i.email}
                  <br />
                  <span className="muted">{i.name}</span>
                </td>
                <td>{i.role}</td>
                <td className="muted">{fmtDate(i.expiresAt)}</td>
                <td className="actions">
                  <button
                    className="btn btn-danger btn-sm"
                    onClick={() => revoke(i.id)}>
                    Revoke
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </section>
  );
}

/* ─── STAFF: Users ────────────────────────────────────────────────────────── */

function UsersPanel({ user, onErr, flashFn }) {
  const [users, setUsers] = useState(null);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState("");

  const refreshUsers = useCallback(async () => {
    setLoading(true);
    setLoadError("");
    try {
      const d = await onErr(apiRequest("/api/users"));
      setUsers(d.users);
    } catch (err) {
      setLoadError(err?.message || "Failed to load user accounts.");
    } finally {
      setLoading(false);
    }
  }, [onErr]);

  useEffect(() => {
    refreshUsers();
  }, [refreshUsers]);

  async function toggle(u) {
    try {
      const r = await onErr(
        apiRequest(`/api/users/${u.id}`, {
          method: "PATCH",
          body: { isActive: !u.isActive },
        }),
      );
      flashFn(r.note || "User updated.");
      await refreshUsers();
    } catch {
      /* handled */
    }
  }

  async function remove(u) {
    if (
      !confirm(
        "Remove this account? If they have dependent records it will be deactivated instead of deleted.",
      )
    )
      return;
    try {
      const r = await onErr(
        apiRequest(`/api/users/${u.id}`, { method: "DELETE" }),
      );
      flashFn(r.message);
      await refreshUsers();
    } catch {
      /* handled */
    }
  }

  if (loading)
    return (
      <section className="panel">
        <h2>User accounts</h2>
        <p className="empty">Loading…</p>
      </section>
    );

  if (loadError)
    return (
      <section className="panel">
        <h2>User accounts</h2>
        <div className="alert error">{loadError}</div>
        <button type="button" className="btn" onClick={refreshUsers}>
          Retry
        </button>
      </section>
    );

  return (
    <section className="panel">
      <h2>User accounts</h2>
      <table className="data">
        <thead>
          <tr>
            <th>Name</th>
            <th>Email</th>
            <th>Role</th>
            <th>State</th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          {users.map((u) => (
            <tr key={u.id} style={!u.isActive ? { opacity: 0.55 } : undefined}>
              <td>
                {u.name}
                {u.id === user.id && " (you)"}
              </td>
              <td className="muted">{u.email}</td>
              <td>{ROLE_LABELS[u.role] || u.role}</td>
              <td>
                {u.isActive ? (
                  <span className="pill pill-APPROVED">Active</span>
                ) : (
                  <span className="pill pill-REJECTED">Deactivated</span>
                )}
              </td>
              <td className="actions">
                <button
                  className="btn btn-ghost btn-sm"
                  onClick={() => toggle(u)}>
                  {u.isActive ? "Deactivate" : "Activate"}
                </button>
                {u.id !== user.id && (
                  <button
                    className="btn btn-danger btn-sm"
                    onClick={() => remove(u)}>
                    Remove
                  </button>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </section>
  );
}

/* ─── STAFF: Faculty Directory ────────────────────────────────────────────── */

function DirectoryPanel({ onErr, flashFn }) {
  const [faculties, setFaculties] = useState(null);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState("");
  const [form, setForm] = useState(EMPTY_FACULTY_PROFILE);
  const [editingFaculty, setEditingFaculty] = useState(null);

  const refreshDirectory = useCallback(async () => {
    setLoading(true);
    setLoadError("");
    try {
      const d = await onErr(apiRequest("/api/faculties"));
      setFaculties(d.faculties);
    } catch (err) {
      setLoadError(err?.message || "Failed to load directory.");
    } finally {
      setLoading(false);
    }
  }, [onErr]);

  useEffect(() => {
    refreshDirectory();
  }, [refreshDirectory]);

  async function saveFacultyEntry(e) {
    e.preventDefault();
    try {
      if (editingFaculty) {
        await onErr(
          apiRequest(`/api/faculties/${editingFaculty.id}`, {
            method: "PUT",
            body: form,
          }),
        );
        flashFn("Faculty member updated.");
      } else {
        await onErr(
          apiRequest("/api/faculties", { method: "POST", body: form }),
        );
        flashFn("Directory entry added.");
      }
      setForm(EMPTY_FACULTY_PROFILE);
      setEditingFaculty(null);
      await refreshDirectory();
    } catch {
      /* handled */
    }
  }

  function startEdit(f) {
    setEditingFaculty(f);
    setForm({ ...EMPTY_FACULTY_PROFILE, ...f });
  }

  function cancelEdit() {
    setEditingFaculty(null);
    setForm(EMPTY_FACULTY_PROFILE);
  }

  async function removeEntry(id) {
    if (!confirm("Remove this faculty from the public directory?")) return;
    try {
      await onErr(apiRequest(`/api/faculties/${id}`, { method: "DELETE" }));
      flashFn("Directory entry removed.");
      await refreshDirectory();
    } catch {
      /* handled */
    }
  }

  if (loading) {
    return (
      <section className="panel">
        <h2>Faculty directory (public page)</h2>
        <p className="empty">Loading…</p>
      </section>
    );
  }

  if (loadError) {
    return (
      <section className="panel">
        <h2>Faculty directory (public page)</h2>
        <div className="alert error">{loadError}</div>
        <button type="button" className="btn" onClick={refreshDirectory}>
          Retry
        </button>
      </section>
    );
  }

  const fields = [
    ["name", "Full name"],
    ["designation", "Designation"],
    ["qualification", "Qualifications"],
    ["image", "Image URL"],
    ["publicEmail", "Public email"],
    ["cabinLocation", "Cabin location"],
    ["researchGate", "ResearchGate"],
    ["googleScholar", "Google Scholar"],
    ["orcid", "ORCID"],
    ["website", "Website"],
  ];

  return (
    <section className="panel">
      <h2>Faculty directory (public page)</h2>
      <h3>
        {editingFaculty
          ? `Edit ${editingFaculty.name}`
          : "Add new faculty member"}
      </h3>
      <form onSubmit={saveFacultyEntry} className="inline">
        <div className="grid-2">
          {fields.map(([name, label]) => (
            <div className="field" key={name}>
              <label htmlFor={`dir-field-${name}`}>{label}</label>
              <input
                id={`dir-field-${name}`}
                type={name === "publicEmail" ? "email" : "text"}
                required={name === "name"}
                value={form[name] ?? ""}
                onChange={(e) => setForm({ ...form, [name]: e.target.value })}
              />
            </div>
          ))}
        </div>
        <div style={{ display: "flex", gap: 8, marginTop: 10 }}>
          <button type="submit" className="btn">
            {editingFaculty ? "Save changes" : "Add entry"}
          </button>
          {editingFaculty && (
            <button
              type="button"
              className="btn btn-ghost"
              onClick={cancelEdit}>
              Cancel
            </button>
          )}
        </div>
      </form>
      <table className="data" style={{ marginTop: 20 }}>
        <thead>
          <tr>
            <th>Name</th>
            <th>Designation</th>
            <th>Account</th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          {faculties.map((f) => (
            <tr key={f.id}>
              <td>
                {f.image && (
                  <img className="thumb" src={getApiUrl(f.image)} alt="" />
                )}
                {f.name}
              </td>

              <td>{f.designation || "—"}</td>

              <td>
                {f.hasAccount ? (
                  <span className="pill pill-APPROVED">Linked</span>
                ) : (
                  <span className="muted">—</span>
                )}
              </td>

              <td className="actions">
                <button
                  className="btn btn-ghost btn-sm"
                  onClick={() => startEdit(f)}>
                  Edit
                </button>
                <button
                  className="btn btn-danger btn-sm"
                  onClick={() => removeEntry(f.id)}>
                  Delete
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </section>
  );
}

/* ─── SUPER ADMIN: Event Management ───────────────────────────────────────── */

function EventsManagementPanel({ onErr, flashFn }) {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState("");
  const [formError, setFormError] = useState("");
  const [form, setForm] = useState(EMPTY_EVENT_FORM);
  const [editingId, setEditingId] = useState(null);
  const [saving, setSaving] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
  const fileInputRef = useRef(null);

  const refreshEvents = useCallback(async () => {
    setLoading(true);
    setLoadError("");
    try {
      const data = await onErr(apiRequest("/api/events?includeDrafts=true"));
      setEvents(Array.isArray(data?.events) ? data.events : []);
    } catch (err) {
      setLoadError(err?.message || "Failed to load events.");
    } finally {
      setLoading(false);
    }
  }, [onErr]);

  useEffect(() => {
    refreshEvents();
  }, [refreshEvents]);

  function resetForm() {
    setEditingId(null);
    setForm(EMPTY_EVENT_FORM);
    setFormError("");
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  }

  function startEdit(ev) {
    setEditingId(ev.id);
    setFormError("");
    setForm({
      title: ev.title ?? "",
      description: ev.description ?? "",
      imageUrl: ev.imageUrl ?? "",
      eventDate: toDateInputValue(ev.eventDate),
      startTime: ev.startTime ?? "",
      endTime: ev.endTime ?? "",
      venue: ev.venue ?? "",
      status: ev.status ?? "DRAFT",
      isFeatured: Boolean(ev.isFeatured),
    });
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  }

  async function handleImageFileChange(e) {
    const selectedFile = e.target.files?.[0];
    if (!selectedFile) return;

    setFormError("");
    setUploadingImage(true);
    try {
      const fd = new FormData();
      fd.append("image", selectedFile);
      const res = await onErr(
        apiRequest("/api/events/upload", {
          method: "POST",
          formData: fd,
        }),
      );
      if (res?.imageUrl) {
        setForm((prev) => ({ ...prev, imageUrl: res.imageUrl }));
        flashFn("Event banner image uploaded.");
      }
    } catch (err) {
      setFormError(err?.message || "Image upload failed.");
    } finally {
      setUploadingImage(false);
    }
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setFormError("");

    if (!form.title.trim()) {
      setFormError("Event title is required.");
      return;
    }
    if (!form.description.trim()) {
      setFormError("Event description is required.");
      return;
    }
    if (!form.eventDate) {
      setFormError("Event date is required.");
      return;
    }
    if (!form.venue.trim()) {
      setFormError("Event venue is required.");
      return;
    }

    setSaving(true);
    try {
      const payload = {
        title: form.title.trim(),
        description: form.description.trim(),
        imageUrl: form.imageUrl.trim() || null,
        eventDate: form.eventDate,
        startTime: form.startTime.trim() || null,
        endTime: form.endTime.trim() || null,
        venue: form.venue.trim(),
        status: form.status,
        isFeatured: Boolean(form.isFeatured),
      };

      if (editingId) {
        await onErr(
          apiRequest(`/api/events/${editingId}`, {
            method: "PUT",
            body: payload,
          }),
        );
        flashFn("Event updated successfully.");
      } else {
        await onErr(
          apiRequest("/api/events", {
            method: "POST",
            body: payload,
          }),
        );
        flashFn(
          payload.status === "PUBLISHED"
            ? "Event created and published."
            : "Event saved as draft.",
        );
      }

      resetForm();
      await refreshEvents();
    } catch (err) {
      setFormError(err?.message || "Failed to save event.");
    } finally {
      setSaving(false);
    }
  }

  async function togglePublish(ev) {
    const nextStatus = ev.status === "PUBLISHED" ? "DRAFT" : "PUBLISHED";
    try {
      await onErr(
        apiRequest(`/api/events/${ev.id}/status`, {
          method: "PATCH",
          body: { status: nextStatus },
        }),
      );
      flashFn(
        nextStatus === "PUBLISHED"
          ? `"${ev.title}" published.`
          : `"${ev.title}" moved to draft.`,
      );
      await refreshEvents();
    } catch {
      /* handled */
    }
  }

  async function toggleFeatured(ev) {
    const nextFeatured = !ev.isFeatured;
    try {
      await onErr(
        apiRequest(`/api/events/${ev.id}/featured`, {
          method: "PATCH",
          body: { isFeatured: nextFeatured },
        }),
      );
      flashFn(
        nextFeatured
          ? `"${ev.title}" marked as featured.`
          : `"${ev.title}" removed from featured.`,
      );
      await refreshEvents();
    } catch {
      /* handled */
    }
  }

  async function deleteEvent(ev) {
    if (!confirm(`Delete event "${ev.title}" permanently?`)) return;
    try {
      await onErr(apiRequest(`/api/events/${ev.id}`, { method: "DELETE" }));
      if (editingId === ev.id) {
        resetForm();
      }
      flashFn("Event deleted.");
      await refreshEvents();
    } catch {
      /* handled */
    }
  }

  return (
    <section className="panel">
      <h2>Department Event Management (Super Admin)</h2>
      <p className="muted">
        Create, schedule, publish, feature, and manage all department events.
        Only published events appear on the public website.
      </p>

      {formError && (
        <div className="alert error" role="alert">
          {formError}
        </div>
      )}

      <form onSubmit={handleSubmit} className="inline">
        <h3>{editingId ? "Edit Event" : "Create New Event"}</h3>
        <div className="grid-2">
          <div className="field">
            <label htmlFor="ev-title">Event Title *</label>
            <input
              id="ev-title"
              type="text"
              required
              disabled={saving}
              placeholder="National Conference on Generative AI"
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
            />
          </div>

          <div className="field">
            <label htmlFor="ev-venue">Venue *</label>
            <input
              id="ev-venue"
              type="text"
              required
              disabled={saving}
              placeholder="Main Auditorium, Block II, Kengeri Campus"
              value={form.venue}
              onChange={(e) => setForm({ ...form, venue: e.target.value })}
            />
          </div>

          <div className="field">
            <label htmlFor="ev-date">Event Date *</label>
            <input
              id="ev-date"
              type="date"
              required
              disabled={saving}
              value={form.eventDate}
              onChange={(e) => setForm({ ...form, eventDate: e.target.value })}
            />
          </div>

          <div className="field">
            <label htmlFor="ev-status">Publication Status</label>
            <select
              id="ev-status"
              disabled={saving}
              value={form.status}
              onChange={(e) => setForm({ ...form, status: e.target.value })}>
              <option value="DRAFT">Draft (Hidden from public)</option>
              <option value="PUBLISHED">Published (Visible on site)</option>
            </select>
          </div>

          <div className="field">
            <label htmlFor="ev-start-time">Start Time</label>
            <input
              id="ev-start-time"
              type="text"
              disabled={saving}
              placeholder="09:30 AM"
              value={form.startTime}
              onChange={(e) => setForm({ ...form, startTime: e.target.value })}
            />
          </div>

          <div className="field">
            <label htmlFor="ev-end-time">End Time</label>
            <input
              id="ev-end-time"
              type="text"
              disabled={saving}
              placeholder="04:30 PM"
              value={form.endTime}
              onChange={(e) => setForm({ ...form, endTime: e.target.value })}
            />
          </div>

          <div className="field">
            <label htmlFor="ev-image-file">
              Upload Event Banner (PNG, JPEG, WEBP, AVIF · max 10 MB)
            </label>
            <input
              ref={fileInputRef}
              id="ev-image-file"
              type="file"
              accept="image/png,image/jpeg,image/webp,image/avif,image/gif"
              disabled={saving || uploadingImage}
              onChange={handleImageFileChange}
            />
          </div>

          <div className="field">
            <label htmlFor="ev-image-url">Or Event Image URL</label>
            <input
              id="ev-image-url"
              type="text"
              disabled={saving || uploadingImage}
              placeholder="/api/events/images/... or https://..."
              value={form.imageUrl}
              onChange={(e) => setForm({ ...form, imageUrl: e.target.value })}
            />
          </div>
        </div>

        {form.imageUrl && (
          <div style={{ margin: "10px 0" }}>
            <img
              src={resolvePreviewUrl(form.imageUrl)}
              alt="Event banner preview"
              style={{
                maxWidth: 260,
                maxHeight: 150,
                objectFit: "cover",
                borderRadius: 6,
                border: "1px solid #d4d4d4",
              }}
            />
          </div>
        )}

        <div className="field">
          <label htmlFor="ev-description">Event Description *</label>
          <textarea
            id="ev-description"
            rows={4}
            required
            disabled={saving}
            placeholder="Describe the event objectives, speakers, target audience, and schedule."
            value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
          />
        </div>

        <div
          style={{
            display: "flex",
            gap: 8,
            alignItems: "center",
            marginBottom: 12,
          }}>
          <input
            id="ev-featured"
            type="checkbox"
            checked={form.isFeatured}
            disabled={saving}
            onChange={(e) => setForm({ ...form, isFeatured: e.target.checked })}
          />
          <label htmlFor="ev-featured">
            Feature this event on the Home page
          </label>
        </div>

        <div style={{ display: "flex", gap: 8 }}>
          <button
            type="submit"
            className="btn"
            disabled={saving || uploadingImage}>
            {uploadingImage
              ? "Uploading image…"
              : saving
                ? "Saving…"
                : editingId
                  ? "Update Event"
                  : "Save Event"}
          </button>
          {editingId && (
            <button
              type="button"
              className="btn btn-ghost"
              disabled={saving}
              onClick={resetForm}>
              Cancel Edit
            </button>
          )}
        </div>
      </form>

      <h3 style={{ marginTop: 24 }}>All Events ({events.length})</h3>
      {loading ? (
        <p className="empty">Loading events…</p>
      ) : loadError ? (
        <div>
          <div className="alert error" role="alert">
            {loadError}
          </div>
          <button type="button" className="btn btn-sm" onClick={refreshEvents}>
            Retry
          </button>
        </div>
      ) : events.length === 0 ? (
        <p className="empty">No events created yet.</p>
      ) : (
        <table className="data">
          <thead>
            <tr>
              <th>Event</th>
              <th>Date &amp; Time</th>
              <th>Venue</th>
              <th>Status</th>
              <th>Featured</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {events.map((ev) => {
              const timeStr =
                ev.startTime && ev.endTime
                  ? `${ev.startTime} – ${ev.endTime}`
                  : ev.startTime || "—";

              return (
                <tr key={ev.id}>
                  <td>
                    {ev.imageUrl && (
                      <img
                        className="thumb"
                        src={resolvePreviewUrl(ev.imageUrl)}
                        alt=""
                      />
                    )}
                    <strong>{ev.title}</strong>
                    <br />
                    <span className="muted">
                      {ev.description.length > 80
                        ? `${ev.description.slice(0, 80)}…`
                        : ev.description}
                    </span>
                  </td>
                  <td>
                    {fmtDate(ev.eventDate)}
                    <br />
                    <span className="muted">{timeStr}</span>
                  </td>
                  <td>{ev.venue}</td>
                  <td>
                    <span
                      className={`pill ${
                        ev.status === "PUBLISHED"
                          ? "pill-APPROVED"
                          : "pill-PENDING"
                      }`}>
                      {ev.status}
                    </span>
                  </td>
                  <td>
                    <button
                      type="button"
                      className="btn btn-ghost btn-sm"
                      onClick={() => toggleFeatured(ev)}>
                      {ev.isFeatured ? "★ Featured" : "☆ Standard"}
                    </button>
                  </td>
                  <td className="actions">
                    <button
                      type="button"
                      className="btn btn-ghost btn-sm"
                      onClick={() => togglePublish(ev)}>
                      {ev.status === "PUBLISHED" ? "Unpublish" : "Publish"}
                    </button>
                    <button
                      type="button"
                      className="btn btn-ghost btn-sm"
                      onClick={() => startEdit(ev)}>
                      Edit
                    </button>
                    <button
                      type="button"
                      className="btn btn-danger btn-sm"
                      onClick={() => deleteEvent(ev)}>
                      Delete
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      )}
    </section>
  );
}

/* ─── SUPER ADMIN / HOD: Content Editor ──────────────────────────────────── */

function DepartmentActivitiesEditor({ value, onChange }) {
  let activities = [];

  try {
    const parsed = JSON.parse(value || "[]");
    activities = Array.isArray(parsed) ? parsed : [];
  } catch {
    return (
      <p className="alert error">The saved activities data is invalid JSON.</p>
    );
  }

  function updateActivity(index, field, nextValue) {
    const updated = activities.map((activity, i) =>
      i === index ? { ...activity, [field]: nextValue } : activity,
    );

    onChange(JSON.stringify(updated, null, 2));
  }

  function addActivity() {
    const updated = [
      ...activities,
      {
        id: Date.now(),
        title: "",
        description: "",
        link: "",
      },
    ];

    onChange(JSON.stringify(updated, null, 2));
  }

  function deleteActivity(index) {
    const updated = activities.filter((_, i) => i !== index);
    onChange(JSON.stringify(updated, null, 2));
  }

  return (
    <div className="department-activities-editor">
      {activities.map((activity, index) => (
        <fieldset key={activity.id ?? index} className="content-key">
          <legend>Activity {index + 1}</legend>

          <div className="field">
            <label htmlFor={`activity-${index}-title`}>Activity Name</label>
            <input
              id={`activity-${index}-title`}
              type="text"
              value={activity.title ?? ""}
              onChange={(e) => updateActivity(index, "title", e.target.value)}
            />
          </div>

          <div className="field">
            <label htmlFor={`activity-${index}-description`}>Description</label>
            <textarea
              id={`activity-${index}-description`}
              rows={3}
              value={activity.description ?? ""}
              onChange={(e) =>
                updateActivity(index, "description", e.target.value)
              }
            />
          </div>

          <div className="field">
            <label htmlFor={`activity-${index}-link`}>Page Link</label>
            <input
              id={`activity-${index}-link`}
              type="text"
              placeholder="/caads"
              value={activity.link ?? ""}
              onChange={(e) => updateActivity(index, "link", e.target.value)}
            />
          </div>

          <button
            type="button"
            className="btn btn-danger btn-sm"
            onClick={() => deleteActivity(index)}>
            Delete Activity
          </button>
        </fieldset>
      ))}

      <button type="button" className="btn" onClick={addActivity}>
        + Add Activity
      </button>
    </div>
  );
}

function ContentEditor({ onErr, flashFn, userRole }) {
  const [content, setContent] = useState(null);
  const [drafts, setDrafts] = useState({});
  const [newKey, setNewKey] = useState("");
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState("");
  const [jsonError, setJsonError] = useState("");

  const refreshContent = useCallback(async () => {
    setLoading(true);
    setLoadError("");
    try {
      const d = await onErr(apiRequest("/api/content"));
      setContent(d.content);
      setDrafts(
        Object.fromEntries(
          Object.entries(d.content).map(([k, v]) => [
            k,
            typeof v === "string" ? v : JSON.stringify(v, null, 2),
          ]),
        ),
      );
    } catch (err) {
      setLoadError(err?.message || "Failed to load site content.");
    } finally {
      setLoading(false);
    }
  }, [onErr]);

  useEffect(() => {
    refreshContent();
  }, [refreshContent]);

  function getContentFieldType(key, value) {
    const normalizedKey = key.toLowerCase();

    if (normalizedKey.includes("title")) return "title";
    if (
      normalizedKey.includes("description") ||
      normalizedKey.includes("subtitle")
    ) {
      return "description";
    }

    if (typeof value === "string") return "text";

    return "json";
  }

  function NewsletterCardsEditor({ value, onChange }) {
    let cards = [];

    try {
      const parsed = JSON.parse(value || "[]");
      cards = Array.isArray(parsed) ? parsed : [];
    } catch {
      return (
        <p className="alert error">
          The saved newsletter data is invalid JSON. Correct it before editing.
        </p>
      );
    }

    function updateCard(index, field, nextValue) {
      const updated = cards.map((card, i) =>
        i === index ? { ...card, [field]: nextValue } : card,
      );

      onChange(JSON.stringify(updated, null, 2));
    }

    return (
      <div className="newsletter-card-editor">
        {cards.map((card, index) => (
          <fieldset key={card.id ?? index} className="content-key">
            <legend>Newsletter card {index + 1}</legend>

            {[
              ["date", "Month and year"],
              ["category", "Section"],
              ["title", "Title"],
              ["subtitle", "Subtitle"],
              ["alt", "Image alt text"],
              ["img", "Image URL"],
              ["readMore", "Read More URL"],
              ["downloadPdf", "Download PDF URL"],
            ].map(([field, label]) => (
              <div className="field" key={field}>
                <label htmlFor={`newsletter-${index}-${field}`}>{label}</label>
                <input
                  id={`newsletter-${index}-${field}`}
                  type="text"
                  value={card[field] ?? ""}
                  onChange={(e) => updateCard(index, field, e.target.value)}
                />
              </div>
            ))}

            <div className="field">
              <label htmlFor={`newsletter-${index}-desc`}>Description</label>
              <textarea
                id={`newsletter-${index}-desc`}
                rows={4}
                value={card.desc ?? ""}
                onChange={(e) => updateCard(index, "desc", e.target.value)}
              />
            </div>

            {card.img && (
              <img
                src={card.img}
                alt={card.alt || ""}
                style={{
                  display: "block",
                  maxWidth: 220,
                  maxHeight: 140,
                  objectFit: "contain",
                  marginTop: 8,
                }}
              />
            )}
          </fieldset>
        ))}
      </div>
    );
  }

  async function saveKey(key) {
    setJsonError("");
    let value;
    const rawValue = drafts[key];
    const trimmedValue = rawValue.trim();

    if (trimmedValue.startsWith("{") || trimmedValue.startsWith("[")) {
      try {
        value = JSON.parse(trimmedValue);
      } catch {
        setJsonError(`Invalid JSON for key "${key}". Please check syntax.`);
        return;
      }
    } else {
      value = rawValue;
    }

    try {
      await onErr(
        apiRequest(`/api/content/${encodeURIComponent(key)}`, {
          method: "PUT",
          body: { value },
        }),
      );
      flashFn(`Saved "${key}".`);
      await refreshContent();
    } catch {
      /* handled */
    }
  }

  async function deleteKey(key) {
    if (!confirm(`Delete content key "${key}"?`)) return;
    try {
      await onErr(
        apiRequest(`/api/content/${encodeURIComponent(key)}`, {
          method: "DELETE",
        }),
      );
      flashFn("Key deleted.");
      await refreshContent();
    } catch {
      /* handled */
    }
  }

  async function addKey(e) {
    e.preventDefault();
    const key = newKey.trim();

    if (!key) return;

    if (
      userRole !== "SUPER_ADMIN" &&
      !key.startsWith("newsletter.") &&
      !key.startsWith("service-learning.") &&
      !key.startsWith("department.activities")
    ) {
      setJsonError(
        "HoD can create only newsletter.*, service-learning.*, and department.activities* keys.",
      );
      return;
    }

    setJsonError("");
    try {
      await onErr(
        apiRequest(`/api/content/${encodeURIComponent(key)}`, {
          method: "PUT",
          body: { value: "" },
        }),
      );
      flashFn(`Key "${newKey}" created.`);
      setNewKey("");
      await refreshContent();
    } catch {
      /* handled */
    }
  }

  if (loading)
    return (
      <section className="panel">
        <h2>Site content (controls text/data shown on public pages)</h2>
        <p className="empty">Loading…</p>
      </section>
    );

  if (loadError)
    return (
      <section className="panel">
        <h2>Site content (controls text/data shown on public pages)</h2>
        <div className="alert error">{loadError}</div>
        <button type="button" className="btn" onClick={refreshContent}>
          Retry
        </button>
      </section>
    );

  const allKeys = Object.keys(content || {}).filter(
    (key) => !key.startsWith("department.events"),
  );

  const keys =
    userRole === "SUPER_ADMIN"
      ? allKeys
      : allKeys.filter(
          (key) =>
            key.startsWith("newsletter.") ||
            key.startsWith("service-learning.") ||
            key.startsWith("department.activities"),
        );

  return (
    <section className="panel">
      <h2>Site content (controls text/data shown on public pages)</h2>
      {jsonError && <div className="alert error">{jsonError}</div>}
      {userRole === "SUPER_ADMIN" && (
        <form onSubmit={addKey} className="inline cols">
          <div className="field">
            <label htmlFor="new-content-key">New key</label>
            <input
              id="new-content-key"
              type="text"
              placeholder="home.hero.title"
              value={newKey}
              onChange={(e) => setNewKey(e.target.value)}
            />
          </div>
          <button type="submit" className="btn">
            Add key
          </button>
        </form>
      )}
      {!keys.length && <p className="empty">No content keys defined.</p>}
      {keys.map((k) => (
        <div className="content-key" key={k}>
          <header>
            <code className="keyname">{k}</code>
            <span>
              <button className="btn btn-sm" onClick={() => saveKey(k)}>
                Save
              </button>{" "}
              <button
                className="btn btn-danger btn-sm"
                onClick={() => deleteKey(k)}>
                Delete
              </button>
            </span>
          </header>
          {k === "newsletter.cards" ? (
            <NewsletterCardsEditor
              value={drafts[k] ?? "[]"}
              onChange={(nextValue) =>
                setDrafts((prev) => ({ ...prev, [k]: nextValue }))
              }
            />
          ) : k === "department.activities" ? (
            <DepartmentActivitiesEditor
              value={drafts[k] ?? "[]"}
              onChange={(nextValue) =>
                setDrafts((prev) => ({ ...prev, [k]: nextValue }))
              }
            />
          ) : getContentFieldType(k, content[k]) === "title" ? (
            <div className="field">
              <label htmlFor={`content-${k}`}>Title</label>
              <input
                id={`content-${k}`}
                type="text"
                value={drafts[k] ?? ""}
                onChange={(e) => setDrafts({ ...drafts, [k]: e.target.value })}
              />
            </div>
          ) : getContentFieldType(k, content[k]) === "description" ? (
            <div className="field">
              <label htmlFor={`content-${k}`}>Description</label>
              <textarea
                id={`content-${k}`}
                rows={5}
                value={drafts[k] ?? ""}
                onChange={(e) => setDrafts({ ...drafts, [k]: e.target.value })}
              />
            </div>
          ) : getContentFieldType(k, content[k]) === "json" ? (
            <textarea
              aria-label={`JSON content for ${k}`}
              value={drafts[k] ?? ""}
              onChange={(e) => setDrafts({ ...drafts, [k]: e.target.value })}
            />
          ) : (
            <div className="field">
              <label htmlFor={`content-${k}`}>Text</label>
              <input
                id={`content-${k}`}
                type="text"
                value={drafts[k] ?? ""}
                onChange={(e) => setDrafts({ ...drafts, [k]: e.target.value })}
              />
            </div>
          )}
        </div>
      ))}
    </section>
  );
}

/* ─── Dashboard shell ─────────────────────────────────────────────────────── */

export default function Dashboard() {
  const navigate = useNavigate();
  const user = getStoredUser();

  const [ready, setReady] = useState(false);
  const [flashMsg, setFlashMsg] = useState(null); // { text, ok }
  const timerRef = useRef(null);

  const userId = user?.id;
  const userRole = user?.role;

  useEffect(() => {
    if (!isLoggedIn() || !userId) {
      navigate("/login");
      return;
    }
    apiRequest("/api/auth/me")
      .then(() => setReady(true))
      .catch(() => navigate("/login"));
  }, [navigate, userId, userRole]);

  const flashFn = useCallback((text, ok = true) => {
    setFlashMsg({ text, ok });
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => setFlashMsg(null), 4000);
  }, []);

  useEffect(() => {
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, []);

  const onErr = useCallback(
    async (promise) => {
      try {
        return await promise;
      } catch (err) {
        flashFn(err.message, false);
        throw err;
      }
    },
    [flashFn],
  );

  if (!ready || !user) return null;

  const isStaff = user.role === "ADMIN" || user.role === "SUPER_ADMIN";

  return (
    <div className="dash-shell">
      <Navbar />
      <main className="wrap">
        <h1 className="page-title">{ROLE_LABELS[user.role]} workspace</h1>
        <p className="page-sub">
          {
            {
              SUPER_ADMIN:
                "Full control over site data, events, users and content.",
              ADMIN:
                "Manage faculties via email invitations, directory, newsletter, service-learning and department activities.",
              FACULTY: "Manage your public faculty profile.",
              STUDENT: "Track your application and project statuses.",
            }[user.role]
          }
        </p>
        {flashMsg && (
          <div className={`alert ${flashMsg.ok ? "ok" : "error"}`}>
            {flashMsg.text}
          </div>
        )}

        {user.role === "STUDENT" && <StudentStatuses onErr={onErr} />}
        {user.role === "FACULTY" && (
          <FacultyProfileEditor onErr={onErr} flashFn={flashFn} />
        )}
        {isStaff && (
          <InvitationsPanel user={user} onErr={onErr} flashFn={flashFn} />
        )}
        {isStaff && <UsersPanel user={user} onErr={onErr} flashFn={flashFn} />}
        {isStaff && <DirectoryPanel onErr={onErr} flashFn={flashFn} />}

        {user.role === "SUPER_ADMIN" && (
          <EventsManagementPanel onErr={onErr} flashFn={flashFn} />
        )}

        {(user.role === "SUPER_ADMIN" || user.role === "ADMIN") && (
          <ContentEditor onErr={onErr} flashFn={flashFn} userRole={user.role} />
        )}
      </main>
    </div>
  );
}
