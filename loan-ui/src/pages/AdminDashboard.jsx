import { useState, useEffect } from "react";
import {
  Landmark,
  LayoutDashboard,
  LogOut,
  Clock3,
  CheckCircle2,
  XCircle,
  IndianRupee,
  FileSearch,
  ThumbsUp,
  ThumbsDown,
  Inbox,
  X,
} from "lucide-react";
import { getAllApplications, reviewApplication } from "../services/api";

/* ════════════════════════════════
   REVIEW MODAL
════════════════════════════════ */
function ReviewModal({ application, onClose, onDone }) {
  const [form, setForm] = useState({ status: "APPROVED", rejectionReason: "" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const submit = async () => {
    setError("");
    setLoading(true);
    try {
      await reviewApplication(application.id, form);
      onDone();
      onClose();
    } catch (e) {
      setError(e.response?.data || "Review failed");
    } finally {
      setLoading(false);
    }
  };

  const fmt = (n) =>
    "₹" + Number(n).toLocaleString("en-IN", { maximumFractionDigits: 0 });

  return (
    <div className="ud-overlay">
      <div className="ud-modal">
        <div className="ud-modal-head">
          <h3>Review Application #{application.id}</h3>
          <button className="ud-modal-close" onClick={onClose}>
            <X size={12} />
          </button>
        </div>

        {/* Applicant details */}
        <div
          className="ud-emi-summary"
          style={{ gridTemplateColumns: "1fr 1fr", marginBottom: "16px" }}
        >
          <div className="ud-emi-sum" style={{ textAlign: "left" }}>
            <div className="ud-emi-sum-lbl">Applicant</div>
            <div className="ud-emi-sum-val" style={{ fontSize: "0.88rem" }}>
              {application.applicantName}
            </div>
          </div>
          <div className="ud-emi-sum" style={{ textAlign: "left" }}>
            <div className="ud-emi-sum-lbl">Monthly Income</div>
            <div className="ud-emi-sum-val" style={{ fontSize: "0.88rem" }}>
              {fmt(application.monthlyIncome)}
            </div>
          </div>
          <div className="ud-emi-sum" style={{ textAlign: "left" }}>
            <div className="ud-emi-sum-lbl">Loan Amount</div>
            <div
              className="ud-emi-sum-val"
              style={{ fontSize: "0.88rem", color: "#c0523a" }}
            >
              {fmt(application.requestedAmount)}
            </div>
          </div>
          <div className="ud-emi-sum" style={{ textAlign: "left" }}>
            <div className="ud-emi-sum-lbl">Tenure</div>
            <div className="ud-emi-sum-val" style={{ fontSize: "0.88rem" }}>
              {application.tenureMonths} months
            </div>
          </div>
          <div
            className="ud-emi-sum"
            style={{ textAlign: "left", gridColumn: "1 / -1" }}
          >
            <div className="ud-emi-sum-lbl">Purpose</div>
            <div className="ud-emi-sum-val" style={{ fontSize: "0.88rem" }}>
              {application.purpose}
            </div>
          </div>
        </div>

        {error && <div className="ud-error">{error}</div>}

        {/* Decision dropdown */}
        <div className="ud-fg" style={{ marginBottom: "12px" }}>
          <label>Decision</label>
          <select
            value={form.status}
            onChange={(e) => setForm({ ...form, status: e.target.value })}
          >
            <option value="APPROVED">Approve — Generate EMI Schedule</option>
            <option value="REJECTED">Reject — Decline Application</option>
          </select>
        </div>

        {/* Rejection reason */}
        {form.status === "REJECTED" && (
          <div className="ud-fg" style={{ marginBottom: "12px" }}>
            <label>Rejection Reason</label>
            <input
              placeholder="e.g. Low income, existing obligations..."
              value={form.rejectionReason}
              onChange={(e) =>
                setForm({ ...form, rejectionReason: e.target.value })
              }
            />
          </div>
        )}

        {/* Approval notice */}
        {form.status === "APPROVED" && (
          <div
            style={{
              background: "#e2f4ec",
              border: "1px solid #b8e4cc",
              borderRadius: "7px",
              padding: "10px 13px",
              fontSize: "0.78rem",
              color: "#1a6640",
              marginBottom: "14px",
              display: "flex",
              alignItems: "center",
              gap: "8px",
            }}
          >
            <CheckCircle2 size={14} style={{ flexShrink: 0 }} />
            Approving will create a loan account at <strong>
              12% p.a.
            </strong>{" "}
            and auto-generate the full EMI schedule.
          </div>
        )}

        {/* Actions */}
        <div className="ud-modal-actions">
          <button className="ud-btn-cancel" onClick={onClose}>
            Cancel
          </button>
          <button
            className="ud-btn-submit"
            style={{
              background: form.status === "APPROVED" ? "#1a9659" : "#c0523a",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: "6px",
            }}
            onClick={submit}
            disabled={loading}
          >
            {form.status === "APPROVED" ? (
              <ThumbsUp size={13} />
            ) : (
              <ThumbsDown size={13} />
            )}
            {loading
              ? "Processing..."
              : form.status === "APPROVED"
                ? "Approve Loan"
                : "Reject Application"}
          </button>
        </div>
      </div>
    </div>
  );
}

/* ════════════════════════════════
   MAIN DASHBOARD
════════════════════════════════ */
export default function AdminDashboard({ onLogout }) {
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState(null);
  const [filter, setFilter] = useState("ALL");

  const stored = JSON.parse(localStorage.getItem("loanUser") || "{}");
  const rawName = stored.name || stored.email?.split("@")[0] || "Admin";
  const displayName = rawName.charAt(0).toUpperCase() + rawName.slice(1);
  const initials = displayName.slice(0, 2).toUpperCase();

  const load = async () => {
    setLoading(true);
    try {
      const res = await getAllApplications();
      setApplications(res.data);
    } catch (e) {
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const fmt = (n) =>
    "₹" + Number(n).toLocaleString("en-IN", { maximumFractionDigits: 0 });

  const filtered =
    filter === "ALL"
      ? applications
      : applications.filter((a) => a.status === filter);

  const pending = applications.filter((a) => a.status === "PENDING").length;
  const approved = applications.filter((a) => a.status === "APPROVED").length;
  const rejected = applications.filter((a) => a.status === "REJECTED").length;
  const totalDisbursed = applications
    .filter((a) => a.status === "APPROVED")
    .reduce((s, a) => s + a.requestedAmount, 0);

  return (
    <div className="ud-root">
      {/* ── SIDEBAR ── */}
      <aside className="ud-sidebar">
        <div className="ud-brand">
          <div className="ud-brand-logo">
            <Landmark size={15} color="#f5f2ec" strokeWidth={1.8} />
          </div>
          <div className="ud-brand-text">
            <h2>LoanSphere</h2>
            <span>Admin Portal</span>
          </div>
        </div>

        <nav className="ud-nav">
          <button className="ud-nav-btn active">
            <LayoutDashboard size={14} />
            Dashboard
          </button>
        </nav>

        <div className="ud-sidebar-sep" />

        <div className="ud-sidebar-bottom">
          <div className="ud-user-row">
            <div className="ud-avatar">{initials}</div>
            <div className="ud-user-meta">
              <p>{displayName}</p>
              <span>Administrator</span>
            </div>
          </div>
          <button className="ud-signout" onClick={onLogout}>
            <LogOut size={13} />
            Sign Out
          </button>
        </div>
      </aside>

      {/* ── MAIN ── */}
      <div className="ud-main">
        <header className="ud-topbar">
          <div className="ud-topbar-title">
            <h1>Admin Dashboard</h1>
            <p>Review and manage all loan applications</p>
          </div>
        </header>

        <div className="ud-content">
          {/* Stat Cards */}
          <div className="ud-stats">
            <div className="ud-stat-card">
              <div className="ud-stat-top">
                <div className="ud-stat-icon amber">
                  <Clock3 size={15} />
                </div>
                <span className="ud-stat-pill amber">Pending</span>
              </div>
              <div className="ud-stat-val">{pending}</div>
              <div className="ud-stat-label">Pending Review</div>
            </div>
            <div className="ud-stat-card">
              <div className="ud-stat-top">
                <div className="ud-stat-icon green">
                  <CheckCircle2 size={15} />
                </div>
                <span className="ud-stat-pill green">Active</span>
              </div>
              <div className="ud-stat-val">{approved}</div>
              <div className="ud-stat-label">Approved Loans</div>
            </div>
            <div className="ud-stat-card">
              <div className="ud-stat-top">
                <div className="ud-stat-icon" style={{ background: "#f8ebe9" }}>
                  <XCircle size={15} color="#c0523a" />
                </div>
                <span
                  className="ud-stat-pill"
                  style={{ background: "#f8ebe9", color: "#c0523a" }}
                >
                  Declined
                </span>
              </div>
              <div className="ud-stat-val">{rejected}</div>
              <div className="ud-stat-label">Rejected</div>
            </div>
            <div className="ud-stat-card">
              <div className="ud-stat-top">
                <div className="ud-stat-icon violet">
                  <IndianRupee size={15} />
                </div>
                <span className="ud-stat-pill violet">Disbursed</span>
              </div>
              <div className="ud-stat-val" style={{ fontSize: "1.15rem" }}>
                {fmt(totalDisbursed)}
              </div>
              <div className="ud-stat-label">Total Disbursed</div>
            </div>
          </div>

          {/* Applications Table */}
          <div className="ud-card">
            <div className="ud-card-head">
              <h3>All Applications</h3>
              <div style={{ display: "flex", gap: "4px" }}>
                {["ALL", "PENDING", "APPROVED", "REJECTED"].map((f) => (
                  <button
                    key={f}
                    className={`ud-tab ${filter === f ? "active" : ""}`}
                    onClick={() => setFilter(f)}
                  >
                    {f === "ALL"
                      ? `All (${applications.length})`
                      : `${f.charAt(0) + f.slice(1).toLowerCase()} (${applications.filter((a) => a.status === f).length})`}
                  </button>
                ))}
              </div>
            </div>

            {loading ? (
              <div className="ud-spinner-wrap">
                <div className="ud-spinner" />
              </div>
            ) : filtered.length === 0 ? (
              <div className="ud-empty">
                <div className="ud-empty-icon">
                  <Inbox size={18} />
                </div>
                <h3>No applications found</h3>
                <p>No applications match this filter</p>
              </div>
            ) : (
              <div className="ud-table-wrap">
                <table className="ud-table">
                  <thead>
                    <tr>
                      <th>ID</th>
                      <th>Applicant</th>
                      <th>Purpose</th>
                      <th>Amount</th>
                      <th>Income</th>
                      <th>Tenure</th>
                      <th>Applied</th>
                      <th>Status</th>
                      <th>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filtered.map((app) => (
                      <tr key={app.id}>
                        <td className="sm">#{app.id}</td>
                        <td style={{ fontWeight: "500", color: "#1e1a16" }}>
                          {app.applicantName}
                        </td>
                        <td>{app.purpose}</td>
                        <td className="fw">{fmt(app.requestedAmount)}</td>
                        <td>{fmt(app.monthlyIncome)}/mo</td>
                        <td className="sm">{app.tenureMonths} mo</td>
                        <td className="sm">
                          {new Date(app.appliedAt).toLocaleDateString("en-IN")}
                        </td>
                        <td>
                          <span
                            className={`ud-badge ${app.status?.toLowerCase()}`}
                          >
                            {app.status}
                          </span>
                          {app.status === "REJECTED" && app.rejectionReason && (
                            <div
                              style={{
                                fontSize: "0.7rem",
                                color: "#c0523a",
                                marginTop: "3px",
                              }}
                            >
                              {app.rejectionReason}
                            </div>
                          )}
                        </td>
                        <td>
                          {app.status === "PENDING" && (
                            <button
                              className="ud-view-btn"
                              onClick={() => setSelected(app)}
                            >
                              <FileSearch size={12} />
                              Review
                            </button>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </div>

      {selected && (
        <ReviewModal
          application={selected}
          onClose={() => setSelected(null)}
          onDone={load}
        />
      )}
    </div>
  );
}
