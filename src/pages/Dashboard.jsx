/* Role-adaptive dashboard.
 *  STUDENT     → own status tracking (read-only)
 *  FACULTY     → upload/manage documents for subjects they teach
 *  ADMIN (HOD) → invite/remove faculties, manage users, directory,
 *                classes & subjects, all documents
 *  SUPER_ADMIN → everything above + site content editor + admin invites */
import { useCallback, useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  apiRequest,
  getStoredUser,
  isLoggedIn,
  ROLE_LABELS,
  fmtBytes,
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

/* ─── FACULTY ─────────────────────────────────────────────────────────────── */

function FacultyWorkspace({ user, onErr, flashFn, deleteDocument }) {
  const [docs, setDocs] = useState(null);
  const [docsLoading, setDocsLoading] = useState(true);
  const [docsError, setDocsError] = useState("");
  const [mySubjects, setMySubjects] = useState([]);
  const [subjectsLoading, setSubjectsLoading] = useState(true);
  const [subjectsError, setSubjectsError] = useState("");
  const [uploadError, setUploadError] = useState("");
  const [uploading, setUploading] = useState(false);

  const [title, setTitle] = useState("");
  const [subjectId, setSubjectId] = useState("");
  const [isPublic, setIsPublic] = useState(true);
  const [file, setFile] = useState(null);

  const refreshDocs = useCallback(async () => {
    setDocsLoading(true);
    setDocsError("");

    try {
      const d = await onErr(apiRequest("/api/documents?mine=1"));
      setDocs(d.documents ?? []);
    } catch (err) {
      setDocsError(err?.message || "Failed to load your documents.");
      throw err;
    } finally {
      setDocsLoading(false);
    }
  }, [onErr]);

  const loadSubjects = useCallback(async () => {
    setSubjectsLoading(true);
    setSubjectsError("");
    try {
      const { classes } = await apiRequest("/api/classes");
      const mine = classes.flatMap((c) =>
        c.subjects
          .filter((s) => s.teacher && s.teacher.id === user.id)
          .map((s) => ({ ...s, className: c.name })),
      );
      setMySubjects(mine);
      if (mine.length) {
        setSubjectId((prev) =>
          prev && mine.some((s) => String(s.id) === prev)
            ? prev
            : String(mine[0].id),
        );
      }
    } catch (err) {
      setSubjectsError(err?.message || "Failed to load subjects.");
    } finally {
      setSubjectsLoading(false);
    }
  }, [user.id]);

  useEffect(() => {
    loadSubjects();
    refreshDocs().catch(() => {});
  }, [loadSubjects, refreshDocs]);

  async function handleUpload(e) {
    e.preventDefault();
    setUploadError("");
    if (!mySubjects.length)
      return flashFn("You have no assigned subjects.", false);

    setUploading(true);
    const fd = new FormData();
    fd.append("title", title.trim());
    fd.append("subjectId", subjectId);
    fd.append("isPublic", String(isPublic));
    fd.append("file", file);
    try {
      await onErr(
        apiRequest("/api/documents", { method: "POST", formData: fd }),
      );
      flashFn("Document uploaded.");
      setTitle("");
      setFile(null);
      e.target.reset();
      await refreshDocs();
    } catch (err) {
      setUploadError(err.message);
    } finally {
      setUploading(false);
    }
  }

  return (
    <div className="grid-2">
      <section className="panel">
        <h2>Upload a document</h2>
        {uploadError && <div className="alert error">{uploadError}</div>}
        {subjectsError ? (
          <div>
            <div className="alert error">{subjectsError}</div>
            <button type="button" className="btn btn-sm" onClick={loadSubjects}>
              Retry loading subjects
            </button>
          </div>
        ) : (
          <form onSubmit={handleUpload} className="inline">
            <div className="field">
              <label htmlFor="upload-subject">Your subject</label>
              <select
                id="upload-subject"
                value={subjectId}
                onChange={(e) => setSubjectId(e.target.value)}
                disabled={
                  subjectsLoading || mySubjects.length === 0 || uploading
                }
                required>
                {subjectsLoading ? (
                  <option value="">Loading assigned subjects…</option>
                ) : mySubjects.length === 0 ? (
                  <option value="">No subjects assigned — ask your HOD</option>
                ) : (
                  mySubjects.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.code} — {s.title} ({s.className})
                    </option>
                  ))
                )}
              </select>
            </div>
            <div className="field">
              <label htmlFor="upload-title">Document title</label>
              <input
                id="upload-title"
                type="text"
                required
                disabled={uploading}
                placeholder="Unit-2 notes"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
              />
            </div>
            <div className="field">
              <label htmlFor="upload-file">
                File (PDF, docs, images… max 25 MB)
              </label>
              <input
                id="upload-file"
                type="file"
                required
                disabled={uploading}
                accept="application/pdf,image/*,.doc,.docx,.ppt,.pptx,.xls,.xlsx"
                onChange={(e) => setFile(e.target.files[0])}
              />
            </div>

            <div
              style={{
                display: "flex",
                gap: 8,
                alignItems: "center",
                fontSize: ".85rem",
                color: "#aaa",
              }}>
              <input
                id="upload-public"
                type="checkbox"
                checked={isPublic}
                disabled={uploading}
                onChange={(e) => setIsPublic(e.target.checked)}
              />
              <label htmlFor="upload-public">Visible to public visitors</label>
            </div>

            <button
              type="submit"
              className="btn"
              disabled={subjectsLoading || !mySubjects.length || uploading}>
              {uploading ? "Uploading…" : "Upload"}
            </button>
          </form>
        )}
      </section>

      <section className="panel">
        <h2>My documents</h2>
        {docsLoading ? (
          <p className="empty">Loading documents…</p>
        ) : docsError ? (
          <div>
            <div className="alert error" role="alert">
              {docsError}
            </div>
            <button
              type="button"
              className="btn btn-sm"
              onClick={() => refreshDocs().catch(() => {})}>
              Retry loading documents
            </button>
          </div>
        ) : !docs || docs.length === 0 ? (
          <p className="empty">You have not uploaded any documents yet.</p>
        ) : (
          <table className="data">
            <thead>
              <tr>
                <th>Title</th>
                <th>Subject</th>
                <th>Visibility</th>
                <th>Size</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {docs.map((d) => (
                <tr key={d.id}>
                  <td>
                    {d.title}
                    <br />
                    <span className="muted">{d.fileName}</span>
                  </td>
                  <td>
                    <code style={{ fontSize: ".78rem", color: "#9ec5ee" }}>
                      {d.subject.code}
                    </code>{" "}
                    {d.subject.className || ""}
                  </td>
                  <td>
                    <span
                      className={`pill ${d.isPublic ? "pill-public" : "pill-private"}`}>
                      {d.isPublic ? "Public" : "Private"}
                    </span>
                  </td>
                  <td className="muted">{fmtBytes(d.sizeBytes)}</td>
                  <td className="actions">
                    <a
                      className="btn btn-ghost btn-sm"
                      href={getApiUrl(d.downloadUrl)}
                      target="_blank"
                      rel="noopener">
                      View
                    </a>
                    <button
                      className="btn btn-danger btn-sm"
                      onClick={() => deleteDocument(d.id, refreshDocs)}>
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </section>
    </div>
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

function UsersPanel({ user, onErr, flashFn, onFacultyUsersChange }) {
  const [users, setUsers] = useState(null);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState("");

  const refreshUsers = useCallback(async () => {
    setLoading(true);
    setLoadError("");
    try {
      const d = await onErr(apiRequest("/api/users"));
      setUsers(d.users);
      onFacultyUsersChange(
        d.users.filter((u) => u.role === "FACULTY" && u.isActive),
      );
    } catch (err) {
      setLoadError(err?.message || "Failed to load user accounts.");
    } finally {
      setLoading(false);
    }
  }, [onErr, onFacultyUsersChange]);

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

/* ─── STAFF: Academics ────────────────────────────────────────────────────── */

function AcademicsPanel({ onErr, flashFn, facultyUsers }) {
  const [classes, setClasses] = useState(null);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState("");

  const refreshClasses = useCallback(async () => {
    setLoading(true);
    setLoadError("");
    try {
      const d = await onErr(apiRequest("/api/classes"));
      setClasses(d.classes);
    } catch (err) {
      setLoadError(err?.message || "Failed to load classes.");
    } finally {
      setLoading(false);
    }
  }, [onErr]);

  useEffect(() => {
    refreshClasses();
  }, [refreshClasses]);

  async function addClass(e) {
    e.preventDefault();
    const rawName = new FormData(e.target).get("name");
    const name = rawName ? rawName.trim() : "";
    if (!name) return;
    try {
      await onErr(
        apiRequest("/api/classes", { method: "POST", body: { name } }),
      );
      flashFn("Class added.");
      e.target.reset();
      await refreshClasses();
    } catch {
      /* handled */
    }
  }

  async function deleteClass(id) {
    if (!confirm("Delete this class AND all its subjects/documents?")) return;
    try {
      await onErr(apiRequest(`/api/classes/${id}`, { method: "DELETE" }));
      flashFn("Class removed.");
      await refreshClasses();
    } catch {
      /* handled */
    }
  }

  async function addSubject(e, classId) {
    e.preventDefault();
    const fd = new FormData(e.target);
    const title = fd.get("title") ? fd.get("title").trim() : "";
    const code = fd.get("code") ? fd.get("code").trim() : "";
    if (!title || !code) return;
    try {
      await onErr(
        apiRequest("/api/classes/subjects", {
          method: "POST",
          body: {
            title,
            code,
            classSectionId: Number(classId),
          },
        }),
      );
      flashFn("Subject added.");
      await refreshClasses();
    } catch {
      /* handled */
    }
  }

  async function assignTeacher(subjectId, teacherId) {
    try {
      await onErr(
        apiRequest(`/api/classes/subjects/${subjectId}`, {
          method: "PATCH",
          body: { teacherId: teacherId ? Number(teacherId) : null },
        }),
      );
      flashFn(teacherId ? "Teacher assigned." : "Teacher unassigned.");
      await refreshClasses();
    } catch {
      /* handled */
    }
  }

  async function deleteSubject(id) {
    if (!confirm("Delete this subject and its documents?")) return;
    try {
      await onErr(
        apiRequest(`/api/classes/subjects/${id}`, { method: "DELETE" }),
      );
      flashFn("Subject removed.");
      await refreshClasses();
    } catch {
      /* handled */
    }
  }

  if (loading) {
    return (
      <section className="panel">
        <h2>Classes &amp; subjects</h2>
        <p className="empty">Loading…</p>
      </section>
    );
  }

  if (loadError) {
    return (
      <section className="panel">
        <h2>Classes &amp; subjects</h2>
        <div className="alert error">{loadError}</div>
        <button type="button" className="btn" onClick={refreshClasses}>
          Retry
        </button>
      </section>
    );
  }

  return (
    <section className="panel">
      <h2>Classes &amp; subjects</h2>
      <form onSubmit={addClass} className="inline cols">
        <div className="field">
          <label htmlFor="new-class-name">New class name</label>
          <input
            id="new-class-name"
            type="text"
            name="name"
            required
            placeholder="VII Semester - Section B"
          />
        </div>
        <button type="submit" className="btn">
          Add class
        </button>
      </form>
      {!classes.length && <p className="empty">No classes yet.</p>}
      {classes.map((c) => (
        <div className="class-block" key={c.id}>
          <h3>
            {c.name}
            <button
              className="btn btn-danger btn-sm"
              onClick={() => deleteClass(c.id)}>
              Delete class
            </button>
          </h3>
          {c.subjects.length === 0 && (
            <p className="empty">No subjects in this class.</p>
          )}
          {c.subjects.map((s) => (
            <div className="subject-row" key={s.id}>
              <code>{s.code}</code>
              <strong style={{ fontSize: ".88rem" }}>{s.title}</strong>
              <select
                value={s.teacher?.id ?? ""}
                onChange={(e) => assignTeacher(s.id, e.target.value)}>
                <option value="">— unassigned —</option>
                {facultyUsers.map((fu) => (
                  <option key={fu.id} value={fu.id}>
                    {fu.name}
                  </option>
                ))}
              </select>
              <span className="muted">
                {s.documentCount} doc{s.documentCount === 1 ? "" : "s"}
              </span>
              <button
                className="btn btn-danger btn-sm"
                onClick={() => deleteSubject(s.id)}>
                ✕
              </button>
            </div>
          ))}
          <form
            className="inline cols"
            style={{ marginTop: 12 }}
            onSubmit={(e) => addSubject(e, c.id)}>
            <div className="field">
              <label htmlFor={`subj-title-${c.id}`}>Subject title</label>
              <input
                id={`subj-title-${c.id}`}
                type="text"
                name="title"
                required
                placeholder="Operating Systems"
              />
            </div>
            <div className="field">
              <label htmlFor={`subj-code-${c.id}`}>Code</label>
              <input
                id={`subj-code-${c.id}`}
                type="text"
                name="code"
                required
                placeholder="OS401"
              />
            </div>
            <button
              type="submit"
              className="btn btn-sm"
              style={{ alignSelf: "end", marginBottom: 2 }}>
              Add subject
            </button>
          </form>
        </div>
      ))}
    </section>
  );
}

/* ─── STAFF: All Documents ────────────────────────────────────────────────── */

function AllDocsPanel({ onErr, deleteDocument }) {
  const [documents, setDocuments] = useState(null);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState("");

  const refreshAllDocs = useCallback(async () => {
    setLoading(true);
    setLoadError("");
    try {
      const d = await onErr(apiRequest("/api/documents"));
      setDocuments(d.documents);
    } catch (err) {
      setLoadError(err?.message || "Failed to load documents.");
    } finally {
      setLoading(false);
    }
  }, [onErr]);

  useEffect(() => {
    refreshAllDocs();
  }, [refreshAllDocs]);

  if (loading) {
    return (
      <section className="panel">
        <h2>All documents</h2>
        <p className="empty">Loading…</p>
      </section>
    );
  }

  if (loadError) {
    return (
      <section className="panel">
        <h2>All documents</h2>
        <div className="alert error">{loadError}</div>
        <button type="button" className="btn" onClick={refreshAllDocs}>
          Retry
        </button>
      </section>
    );
  }

  return (
    <section className="panel">
      <h2>All documents</h2>
      {!documents.length ? (
        <p className="empty">No documents uploaded yet.</p>
      ) : (
        <table className="data">
          <thead>
            <tr>
              <th>Title</th>
              <th>Subject</th>
              <th>Uploaded by</th>
              <th>Visibility</th>
              <th>Date</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {documents.map((d) => (
              <tr key={d.id}>
                <td>
                  {d.title}
                  <br />
                  <span className="muted">
                    {d.fileName} · {fmtBytes(d.sizeBytes)}
                  </span>
                </td>
                <td>
                  <code style={{ fontSize: ".78rem", color: "#9ec5ee" }}>
                    {d.subject.code}
                  </code>{" "}
                  {d.subject.className || ""}
                </td>
                <td>{d.uploadedBy.name}</td>
                <td>
                  <span
                    className={`pill ${d.isPublic ? "pill-public" : "pill-private"}`}>
                    {d.isPublic ? "Public" : "Private"}
                  </span>
                </td>
                <td className="muted">{fmtDate(d.createdAt)}</td>
                <td className="actions">
                  <a
                    className="btn btn-ghost btn-sm"
                    href={getApiUrl(d.downloadUrl)}
                    target="_blank"
                    rel="noopener">
                    View
                  </a>
                  <button
                    className="btn btn-danger btn-sm"
                    onClick={() => deleteDocument(d.id, refreshAllDocs)}>
                    Delete
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

/* ─── SUPER ADMIN: Content Editor ────────────────────────────────────────── */

function DepartmentEventsEditor({ value, onChange }) {
  let events = [];

  try {
    const parsed = JSON.parse(value || "[]");
    events = Array.isArray(parsed) ? parsed : [];
  } catch {
    return (
      <p className="alert error">The saved events data is invalid JSON.</p>
    );
  }

  function updateEvent(index, field, nextValue) {
    const updated = events.map((event, i) =>
      i === index ? { ...event, [field]: nextValue } : event,
    );

    onChange(JSON.stringify(updated, null, 2));
  }

  function addEvent() {
    const updated = [
      ...events,
      {
        id: Date.now(),
        date: "",
        title: "",
        description: "",
      },
    ];

    onChange(JSON.stringify(updated, null, 2));
  }

  function deleteEvent(index) {
    const updated = events.filter((_, i) => i !== index);
    onChange(JSON.stringify(updated, null, 2));
  }

  return (
    <div className="department-events-editor">
      {events.map((event, index) => (
        <fieldset key={event.id ?? index} className="content-key">
          <legend>Event {index + 1}</legend>

          <div className="field">
            <label htmlFor={`event-${index}-date`}>Date</label>
            <input
              id={`event-${index}-date`}
              type="date"
              value={event.date ?? ""}
              onChange={(e) => updateEvent(index, "date", e.target.value)}
            />
          </div>

          <div className="field">
            <label htmlFor={`event-${index}-title`}>Title</label>
            <input
              id={`event-${index}-title`}
              type="text"
              value={event.title ?? ""}
              onChange={(e) => updateEvent(index, "title", e.target.value)}
            />
          </div>

          <div className="field">
            <label htmlFor={`event-${index}-description`}>Description</label>
            <textarea
              id={`event-${index}-description`}
              rows={3}
              value={event.description ?? ""}
              onChange={(e) =>
                updateEvent(index, "description", e.target.value)
              }
            />
          </div>

          <button
            type="button"
            className="btn btn-danger btn-sm"
            onClick={() => deleteEvent(index)}>
            Delete Event
          </button>
        </fieldset>
      ))}

      <button type="button" className="btn" onClick={addEvent}>
        + Add Event
      </button>
    </div>
  );
}

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

    // Keep structured content on the existing editor for now.
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
    console.log("[ContentEditor] Save clicked:", key);
    setJsonError("");
    let value;
    const rawValue = drafts[key];

    // Parse JSON only when the original value was structured data.
    // Parse JSON when the edited value contains a JSON object or array.
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
      !key.startsWith("department.events") &&
      !key.startsWith("department.activities")
    ) {
      setJsonError(
        "HoD can create only newsletter.*, service-learning.*, department.events* and department.activities* keys.",
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

  const allKeys = Object.keys(content || {});

  const keys =
    userRole === "SUPER_ADMIN"
      ? allKeys
      : allKeys.filter(
          (key) =>
            key.startsWith("newsletter.") ||
            key.startsWith("service-learning.") ||
            key.startsWith("department.events") ||
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
          ) : k === "department.events" ? (
            <DepartmentEventsEditor
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
  const [facultyUsers, setFacultyUsers] = useState([]);
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

  const handleFacultyUsersChange = useCallback((users) => {
    setFacultyUsers(users);
  }, []);

  const deleteDocument = useCallback(
    async (id, refresh) => {
      if (!confirm("Delete this document?")) return;
      try {
        await onErr(apiRequest(`/api/documents/${id}`, { method: "DELETE" }));
        flashFn("Document deleted.");
        await refresh();
      } catch {
        /* handled */
      }
    },
    [onErr, flashFn],
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
              SUPER_ADMIN: "Full control over site data, users and content.",
              ADMIN:
                "Manage faculties via email invitations, classes, subjects and the directory.",
              FACULTY: "Upload and manage documents for your subjects only.",
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
        {isStaff && (
          <UsersPanel
            user={user}
            onErr={onErr}
            flashFn={flashFn}
            onFacultyUsersChange={handleFacultyUsersChange}
          />
        )}
        {isStaff && <DirectoryPanel onErr={onErr} flashFn={flashFn} />}

        {(user.role === "SUPER_ADMIN" || user.role === "ADMIN") && (
          <ContentEditor onErr={onErr} flashFn={flashFn} userRole={user.role} />
        )}
      </main>
    </div>
  );
}
