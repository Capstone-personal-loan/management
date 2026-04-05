import { useState, useEffect, useRef } from "react";
import {
  LayoutDashboard,
  Plus,
  Bell,
  Settings,
  LogOut,
  FileText,
  CircleDollarSign,
  CheckCircle2,
  Clock3,
  X,
  IndianRupee,
  Landmark,
  TrendingUp,
  ShieldCheck,
  Info,
} from "lucide-react";
import {
  getMyApplications,
  applyForLoan,
  getEmiSchedule,
  getLoanAccount,
  makePayment,
  getPaymentHistory,
} from "../services/api";
import "../styles/UserDashboard.css";

const fmt = (n) =>
  n != null
    ? "₹" + Number(n).toLocaleString("en-IN", { maximumFractionDigits: 0 })
    : "₹0";
const fmt2 = (n) =>
  n != null
    ? "₹" + Number(n).toLocaleString("en-IN", { maximumFractionDigits: 2 })
    : "₹0";

/* ════════════════════════════════
   APPLY MODAL
════════════════════════════════ */
function ApplyModal({ onClose, onSuccess }) {
  const [form, setForm] = useState({
    monthlyIncome: "",
    requestedAmount: "",
    tenureMonths: "",
    purpose: "",
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const h = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const submit = async () => {
    setError("");
    if (
      !form.monthlyIncome ||
      !form.requestedAmount ||
      !form.tenureMonths ||
      !form.purpose
    ) {
      setError("Please fill all fields");
      return;
    }
    setLoading(true);
    try {
      await applyForLoan({
        monthlyIncome: parseFloat(form.monthlyIncome),
        requestedAmount: parseFloat(form.requestedAmount),
        tenureMonths: parseInt(form.tenureMonths),
        purpose: form.purpose,
      });
      onSuccess();
      onClose();
    } catch (err) {
      setError(err.response?.data || "Application failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="ud-overlay">
      <div className="ud-modal">
        <div className="ud-modal-head">
          <h3>New Loan Application</h3>
          <button className="ud-modal-close" onClick={onClose}>
            <X size={12} />
          </button>
        </div>
        {error && <div className="ud-error">{error}</div>}
        <div className="ud-form-grid">
          <div className="ud-fg">
            <label>Monthly Income (₹)</label>
            <input
              name="monthlyIncome"
              type="number"
              placeholder="75,000"
              value={form.monthlyIncome}
              onChange={h}
            />
          </div>
          <div className="ud-fg">
            <label>Loan Amount (₹)</label>
            <input
              name="requestedAmount"
              type="number"
              placeholder="5,00,000"
              value={form.requestedAmount}
              onChange={h}
            />
          </div>
          <div className="ud-fg">
            <label>Tenure (Months)</label>
            <input
              name="tenureMonths"
              type="number"
              placeholder="24"
              value={form.tenureMonths}
              onChange={h}
            />
          </div>
          <div className="ud-fg">
            <label>Purpose</label>
            <select name="purpose" value={form.purpose} onChange={h}>
              <option value="">Select purpose</option>
              <option>Home Renovation</option>
              <option>Wedding Expenses</option>
              <option>Medical Emergency</option>
              <option>Education</option>
              <option>Business</option>
              <option>Travel</option>
              <option>Other</option>
            </select>
          </div>
        </div>
        <div className="ud-hint">
          <strong>Eligibility —</strong> Min income ₹15,000 &nbsp;·&nbsp; Max
          loan 10× income &nbsp;·&nbsp; EMI ≤ 50% income &nbsp;·&nbsp; Tenure
          6–60 months &nbsp;·&nbsp; 12% p.a.
        </div>
        <div className="ud-modal-actions">
          <button className="ud-btn-cancel" onClick={onClose}>
            Cancel
          </button>
          <button className="ud-btn-submit" onClick={submit} disabled={loading}>
            {loading ? "Submitting..." : "Submit Application"}
          </button>
        </div>
      </div>
    </div>
  );
}

/* ════════════════════════════════
   EMI MODAL
════════════════════════════════ */
function EmiModal({ application, onClose }) {
  const [emis, setEmis] = useState([]);
  const [account, setAccount] = useState(null);
  const [history, setHistory] = useState([]);
  const [tab, setTab] = useState("schedule");
  const [loading, setLoading] = useState(true);
  const [payLoad, setPayLoad] = useState(false);
  const [payErr, setPayErr] = useState("");

  const load = async () => {
    try {
      const [e, a, h] = await Promise.all([
        getEmiSchedule(application.id),
        getLoanAccount(application.id),
        getPaymentHistory(application.id),
      ]);
      setEmis(e.data);
      setAccount(a.data);
      setHistory(h.data);
    } catch (_) {
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, [application.id]);

  const pay = async (emi) => {
    setPayErr("");
    setPayLoad(true);
    try {
      await makePayment({
        emiScheduleId: emi.id,
        paidAmount: emi.emiAmount,
        remarks: "Paid via LoanSphere",
      });
      await load();
    } catch (_) {
      setPayErr("Payment failed. Try again.");
    } finally {
      setPayLoad(false);
    }
  };

  return (
    <div className="ud-overlay">
      <div className="ud-modal lg">
        <div className="ud-modal-head">
          <h3>
            Loan #{application.id} — {application.purpose}
          </h3>
          <button className="ud-modal-close" onClick={onClose}>
            <X size={12} />
          </button>
        </div>

        {loading ? (
          <div className="ud-spinner-wrap">
            <div className="ud-spinner" />
          </div>
        ) : (
          <>
            {account && (
              <div className="ud-emi-summary">
                <div className="ud-emi-sum">
                  <div className="ud-emi-sum-lbl">Outstanding</div>
                  <div className="ud-emi-sum-val" style={{ color: "#e53e3e" }}>
                    {fmt2(account.outstandingBalance)}
                  </div>
                </div>
                <div className="ud-emi-sum">
                  <div className="ud-emi-sum-lbl">Monthly EMI</div>
                  <div className="ud-emi-sum-val" style={{ color: "#18a865" }}>
                    {fmt2(account.emiAmount)}
                  </div>
                </div>
                <div className="ud-emi-sum">
                  <div className="ud-emi-sum-lbl">Total Payable</div>
                  <div className="ud-emi-sum-val">
                    {fmt2(account.totalPayable)}
                  </div>
                </div>
              </div>
            )}

            <div className="ud-tabs">
              <button
                className={`ud-tab ${tab === "schedule" ? "active" : ""}`}
                onClick={() => setTab("schedule")}
              >
                EMI Schedule
              </button>
              <button
                className={`ud-tab ${tab === "history" ? "active" : ""}`}
                onClick={() => setTab("history")}
              >
                Payment History
              </button>
            </div>

            {payErr && <div className="ud-error">{payErr}</div>}

            {tab === "schedule" && (
              <div className="ud-table-wrap">
                <table className="ud-table">
                  <thead>
                    <tr>
                      <th>#</th>
                      <th>Due Date</th>
                      <th>EMI</th>
                      <th>Principal</th>
                      <th>Interest</th>
                      <th>Status</th>
                      <th>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {emis.map((e) => (
                      <tr key={e.id}>
                        <td className="sm">{e.installmentNumber}</td>
                        <td>{e.dueDate}</td>
                        <td className="fw">{fmt2(e.emiAmount)}</td>
                        <td>{fmt2(e.principalComponent)}</td>
                        <td className="sm">{fmt2(e.interestComponent)}</td>
                        <td>
                          <span
                            className={`ud-badge ${e.status?.toLowerCase()}`}
                          >
                            {e.status}
                          </span>
                        </td>
                        <td>
                          {e.status === "PENDING" && (
                            <button
                              className="ud-btn-pay"
                              onClick={() => pay(e)}
                              disabled={payLoad}
                            >
                              Pay Now
                            </button>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {tab === "history" &&
              (history.length === 0 ? (
                <div className="ud-empty">
                  <div className="ud-empty-icon">
                    <CircleDollarSign size={18} />
                  </div>
                  <h3>No payments yet</h3>
                  <p>Your payment history will appear here</p>
                </div>
              ) : (
                <div className="ud-table-wrap">
                  <table className="ud-table">
                    <thead>
                      <tr>
                        <th>Installment</th>
                        <th>Amount Paid</th>
                        <th>Date</th>
                        <th>Remarks</th>
                      </tr>
                    </thead>
                    <tbody>
                      {history.map((h) => (
                        <tr key={h.id}>
                          <td className="sm">#{h.installmentNumber}</td>
                          <td className="fw">{fmt2(h.paidAmount)}</td>
                          <td>
                            {new Date(h.paidAt).toLocaleDateString("en-IN")}
                          </td>
                          <td className="sm">{h.remarks}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ))}
          </>
        )}
      </div>
    </div>
  );
}

/* ════════════════════════════════
   MAIN DASHBOARD
════════════════════════════════ */
export default function UserDashboard({ onLogout }) {
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showApply, setShowApply] = useState(false);
  const [selectedApp, setSelectedApp] = useState(null);
  const rootRef = useRef(null);

  useEffect(() => {
    const allSidebars = document.querySelectorAll("aside");
    allSidebars.forEach((el) => {
      if (!el.classList.contains("ud-sidebar")) {
        el.style.display = "none";
      }
    });
    const allFixed = document.querySelectorAll(
      '[style*="position: fixed"], [style*="position:fixed"]',
    );
    allFixed.forEach((el) => {
      if (!el.closest(".ud-root") && !el.closest(".ud-overlay")) {
        el.style.display = "none";
      }
    });
  }, []);

  const stored = JSON.parse(localStorage.getItem("loanUser") || "{}");
  const rawName = stored.name || stored.email?.split("@")[0] || "User";
  const displayName = rawName.charAt(0).toUpperCase() + rawName.slice(1);
  const initials = displayName.slice(0, 2).toUpperCase();

  const load = async () => {
    setLoading(true);
    try {
      const r = await getMyApplications();
      setApplications(r.data);
    } catch (_) {
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const total = applications.length;
  const approved = applications.filter((a) => a.status === "APPROVED").length;
  const pending = applications.filter((a) => a.status === "PENDING").length;
  const totalBorrowed = applications
    .filter((a) => a.status === "APPROVED")
    .reduce((s, a) => s + a.requestedAmount, 0);

  return (
    <div className="ud-root" ref={rootRef}>
      {/* ── SIDEBAR ── */}
      <aside className="ud-sidebar">
        {/* Brand */}
        <div className="ud-brand">
          <div className="ud-brand-logo">
            <Landmark size={15} color="#fff" strokeWidth={1.8} />
          </div>
          <div className="ud-brand-text">
            <h2>LoanSphere</h2>
            <span>User Portal</span>
          </div>
        </div>

        {/* Nav */}
        <nav className="ud-nav">
          <button className="ud-nav-btn active">
            <LayoutDashboard size={14} />
            Overview
          </button>
        </nav>

        <div className="ud-sidebar-sep" />

        {/* Footer */}
        <div className="ud-sidebar-bottom">
          <div className="ud-user-row">
            <div className="ud-avatar">{initials}</div>
            <div className="ud-user-meta">
              <p>{displayName}</p>
              <span>User Account</span>
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
        {/* Topbar */}
        <header className="ud-topbar">
          <div className="ud-topbar-title">
            <h1>Hello, {displayName}</h1>
            <p>Here's your loan overview</p>
          </div>
          <div className="ud-topbar-right">
            <button className="ud-icon-btn" title="Notifications">
              <Bell size={14} />
            </button>
            <button className="ud-icon-btn" title="Settings">
              <Settings size={14} />
            </button>
            <button
              className="ud-new-loan-btn"
              onClick={() => setShowApply(true)}
            >
              <Plus size={13} />
              New Loan
            </button>
          </div>
        </header>

        {/* Content */}
        <div className="ud-content">
          {/* Hero */}
          <div className="ud-hero">
            <div className="ud-hero-bg-circle1" />
            <div className="ud-hero-bg-circle2" />
            <div className="ud-hero-left">
              <div className="ud-hero-eyebrow">Total Borrowed</div>
              <div className="ud-hero-amount">
                <span className="currency">₹</span>
                {Number(totalBorrowed).toLocaleString("en-IN")}
              </div>
              <div className="ud-hero-tags">
                <div className="ud-hero-tag">12% p.a.</div>
                <div className="ud-hero-tag">
                  {approved} active loan{approved !== 1 ? "s" : ""}
                </div>
              </div>
            </div>
            <div className="ud-hero-right">
              <div className="ud-hero-right-label">Pending Review</div>
              <div className="ud-hero-right-val">{pending}</div>
              <div className="ud-hero-right-sub">awaiting admin</div>
            </div>
          </div>

          {/* Stat Cards */}
          <div className="ud-stats">
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
                <div className="ud-stat-icon amber">
                  <Clock3 size={15} />
                </div>
                <span className="ud-stat-pill amber">Review</span>
              </div>
              <div className="ud-stat-val">{pending}</div>
              <div className="ud-stat-label">Pending Applications</div>
            </div>
            <div className="ud-stat-card">
              <div className="ud-stat-top">
                <div className="ud-stat-icon blue">
                  <FileText size={15} />
                </div>
                <span className="ud-stat-pill blue">Total</span>
              </div>
              <div className="ud-stat-val">{total}</div>
              <div className="ud-stat-label">Total Applications</div>
            </div>
            <div className="ud-stat-card">
              <div className="ud-stat-top">
                <div className="ud-stat-icon violet">
                  <IndianRupee size={15} />
                </div>
                <span className="ud-stat-pill violet">Disbursed</span>
              </div>
              <div className="ud-stat-val" style={{ fontSize: "1.15rem" }}>
                {fmt(totalBorrowed)}
              </div>
              <div className="ud-stat-label">Total Disbursed</div>
            </div>
          </div>

          {/* Bottom Grid */}
          <div className="ud-grid">
            {/* Application History table */}
            <div className="ud-card">
              <div className="ud-card-head">
                <h3>Application History</h3>
                <button
                  className="ud-card-head-btn"
                  onClick={() => setShowApply(true)}
                >
                  <Plus size={12} style={{ marginRight: 4 }} />
                  Apply
                </button>
              </div>

              {loading ? (
                <div className="ud-spinner-wrap">
                  <div className="ud-spinner" />
                </div>
              ) : applications.length === 0 ? (
                <div className="ud-empty">
                  <div className="ud-empty-icon">
                    <FileText size={16} />
                  </div>
                  <h3>No applications yet</h3>
                  <p>Click "New Loan" to get started</p>
                </div>
              ) : (
                <div className="ud-table-wrap">
                  <table className="ud-table">
                    <thead>
                      <tr>
                        <th>ID</th>
                        <th>Purpose</th>
                        <th>Amount</th>
                        <th>Tenure</th>
                        <th>Applied</th>
                        <th>Status</th>
                        <th>Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {applications.map((app) => (
                        <tr key={app.id}>
                          <td className="sm">#{app.id}</td>
                          <td>{app.purpose}</td>
                          <td className="fw">{fmt(app.requestedAmount)}</td>
                          <td className="sm">{app.tenureMonths} mo</td>
                          <td className="sm">
                            {new Date(app.appliedAt).toLocaleDateString(
                              "en-IN",
                            )}
                          </td>
                          <td>
                            <span
                              className={`ud-badge ${app.status?.toLowerCase()}`}
                            >
                              {app.status}
                            </span>
                            {app.status === "REJECTED" &&
                              app.rejectionReason && (
                                <div
                                  style={{
                                    fontSize: "0.63rem",
                                    color: "#e53e3e",
                                    marginTop: "3px",
                                  }}
                                >
                                  {app.rejectionReason}
                                </div>
                              )}
                          </td>
                          <td>
                            {app.status === "APPROVED" && (
                              <button
                                className="ud-view-btn"
                                onClick={() => setSelectedApp(app)}
                              >
                                View EMI
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

            {/* Right Panel */}
            <div className="ud-right-panel">
              <div className="ud-cta-card">
                <div className="ud-cta-icon">
                  <TrendingUp size={20} />
                </div>
                <h3>Need funds?</h3>
                <p>
                  Apply for a personal loan in minutes with instant eligibility
                  check and quick approval.
                </p>
                <button
                  className="ud-cta-btn"
                  onClick={() => setShowApply(true)}
                >
                  Apply for a Loan
                </button>
              </div>

              <div className="ud-info-card">
                <div className="ud-info-card-head">
                  <ShieldCheck size={13} style={{ marginRight: 6 }} />
                  Eligibility Criteria
                </div>
                {[
                  ["Min. Income", "₹15,000 / mo"],
                  ["Max Loan", "10× income"],
                  ["EMI Limit", "50% of income"],
                  ["Tenure", "6 – 60 months"],
                  ["Interest Rate", "12% p.a."],
                ].map(([k, v]) => (
                  <div className="ud-info-row" key={k}>
                    <span className="k">{k}</span>
                    <span className="v">{v}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Modals */}
      {showApply && (
        <ApplyModal onClose={() => setShowApply(false)} onSuccess={load} />
      )}
      {selectedApp && (
        <EmiModal
          application={selectedApp}
          onClose={() => setSelectedApp(null)}
        />
      )}
    </div>
  );
}
