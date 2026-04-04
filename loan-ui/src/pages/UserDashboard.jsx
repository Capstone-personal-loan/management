import { useState, useEffect } from 'react';
import { getMyApplications, applyForLoan, getEmiSchedule, getLoanAccount, makePayment, getPaymentHistory } from '../services/api';

function ApplyModal({ onClose, onSuccess }) {
  const [form, setForm] = useState({ monthlyIncome: '', requestedAmount: '', tenureMonths: '', purpose: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handle = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const submit = async () => {
    setError(''); setLoading(true);
    try {
      await applyForLoan({
        monthlyIncome: parseFloat(form.monthlyIncome),
        requestedAmount: parseFloat(form.requestedAmount),
        tenureMonths: parseInt(form.tenureMonths),
        purpose: form.purpose
      });
      onSuccess();
      onClose();
    } catch (err) {
      setError(err.response?.data || 'Application failed');
    } finally { setLoading(false); }
  };

  return (
    <div className="modal-overlay">
      <div className="modal">
        <div className="modal-header">
          <h3>Apply for Loan</h3>
          <button className="modal-close" onClick={onClose}>✕</button>
        </div>
        {error && <div className="error-msg" style={{marginBottom:'16px'}}>{error}</div>}
        <div className="form-grid">
          <div className="form-group">
            <label>Monthly Income (₹)</label>
            <input name="monthlyIncome" type="number" placeholder="75000" value={form.monthlyIncome} onChange={handle} />
          </div>
          <div className="form-group">
            <label>Loan Amount (₹)</label>
            <input name="requestedAmount" type="number" placeholder="500000" value={form.requestedAmount} onChange={handle} />
          </div>
          <div className="form-group">
            <label>Tenure (Months)</label>
            <input name="tenureMonths" type="number" placeholder="24" value={form.tenureMonths} onChange={handle} />
          </div>
          <div className="form-group">
            <label>Purpose</label>
            <select name="purpose" value={form.purpose} onChange={handle}>
              <option value="">Select purpose</option>
              <option value="Home Renovation">Home Renovation</option>
              <option value="Wedding Expenses">Wedding Expenses</option>
              <option value="Medical Emergency">Medical Emergency</option>
              <option value="Education">Education</option>
              <option value="Business">Business</option>
              <option value="Travel">Travel</option>
              <option value="Other">Other</option>
            </select>
          </div>
        </div>
        <div style={{marginTop:'8px', padding:'12px', background:'#faf8f3', borderRadius:'8px', fontSize:'0.8rem', color:'#7a7065'}}>
          <strong>Eligibility:</strong> Min income ₹15,000 · Max loan 10× income · EMI ≤ 50% income · Tenure 6–60 months
        </div>
        <div style={{display:'flex', gap:'12px', marginTop:'24px'}}>
          <button className="btn btn-outline" onClick={onClose}>Cancel</button>
          <button className="btn btn-primary" onClick={submit} disabled={loading}>{loading ? 'Submitting...' : 'Submit Application'}</button>
        </div>
      </div>
    </div>
  );
}

function EmiModal({ application, onClose }) {
  const [emis, setEmis] = useState([]);
  const [account, setAccount] = useState(null);
  const [history, setHistory] = useState([]);
  const [tab, setTab] = useState('schedule');
  const [loading, setLoading] = useState(true);
  const [payLoading, setPayLoading] = useState(false);
  const [payError, setPayError] = useState('');

  useEffect(() => {
    const load = async () => {
      try {
        const [emiRes, accRes, histRes] = await Promise.all([
          getEmiSchedule(application.id),
          getLoanAccount(application.id),
          getPaymentHistory(application.id)
        ]);
        setEmis(emiRes.data);
        setAccount(accRes.data);
        setHistory(histRes.data);
      } catch (e) { } finally { setLoading(false); }
    };
    load();
  }, [application.id]);

  const pay = async (emi) => {
    setPayError(''); setPayLoading(true);
    try {
      await makePayment({ emiScheduleId: emi.id, paidAmount: emi.emiAmount, remarks: 'Paid via LoanSphere' });
      const [emiRes, accRes, histRes] = await Promise.all([
        getEmiSchedule(application.id), getLoanAccount(application.id), getPaymentHistory(application.id)
      ]);
      setEmis(emiRes.data); setAccount(accRes.data); setHistory(histRes.data);
    } catch (e) { setPayError('Payment failed. Try again.'); } finally { setPayLoading(false); }
  };

  const fmt = (n) => n ? '₹' + Number(n).toLocaleString('en-IN', { maximumFractionDigits: 2 }) : '₹0';

  return (
    <div className="modal-overlay">
      <div className="modal" style={{maxWidth:'700px'}}>
        <div className="modal-header">
          <h3>Loan Details — #{application.id}</h3>
          <button className="modal-close" onClick={onClose}>✕</button>
        </div>

        {loading ? <div className="loading"><div className="spinner"></div></div> : (
          <>
            {account && (
              <div className="emi-summary">
                <div className="emi-summary-item">
                  <div className="label">Outstanding</div>
                  <div className="value" style={{color:'#c44b2b'}}>{fmt(account.outstandingBalance)}</div>
                </div>
                <div className="emi-summary-item">
                  <div className="label">Monthly EMI</div>
                  <div className="value" style={{color:'#3d6b55'}}>{fmt(account.emiAmount)}</div>
                </div>
                <div className="emi-summary-item">
                  <div className="label">Total Payable</div>
                  <div className="value">{fmt(account.totalPayable)}</div>
                </div>
              </div>
            )}

            <div className="tabs">
              <button className={`tab ${tab==='schedule'?'active':''}`} onClick={() => setTab('schedule')}>EMI Schedule</button>
              <button className={`tab ${tab==='history'?'active':''}`} onClick={() => setTab('history')}>Payment History</button>
            </div>

            {payError && <div className="error-msg" style={{marginBottom:'12px'}}>{payError}</div>}

            {tab === 'schedule' && (
              <div className="table-wrapper">
                <table>
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
                    {emis.map(e => (
                      <tr key={e.id}>
                        <td>{e.installmentNumber}</td>
                        <td>{e.dueDate}</td>
                        <td>{fmt(e.emiAmount)}</td>
                        <td>{fmt(e.principalComponent)}</td>
                        <td>{fmt(e.interestComponent)}</td>
                        <td><span className={`badge badge-${e.status?.toLowerCase()}`}>{e.status}</span></td>
                        <td>
                          {e.status === 'PENDING' && (
                            <button className="btn btn-success" style={{padding:'6px 14px', fontSize:'0.78rem'}} onClick={() => pay(e)} disabled={payLoading}>
                              Pay
                            </button>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {tab === 'history' && (
              history.length === 0 ? (
                <div className="empty-state">
                  <div className="empty-icon">💸</div>
                  <h3>No payments yet</h3>
                  <p>Your payment history will appear here.</p>
                </div>
              ) : (
                <div className="table-wrapper">
                  <table>
                    <thead>
                      <tr>
                        <th>Installment</th>
                        <th>Amount Paid</th>
                        <th>Date</th>
                        <th>Remarks</th>
                      </tr>
                    </thead>
                    <tbody>
                      {history.map(h => (
                        <tr key={h.id}>
                          <td>#{h.installmentNumber}</td>
                          <td>{fmt(h.paidAmount)}</td>
                          <td>{new Date(h.paidAt).toLocaleDateString('en-IN')}</td>
                          <td>{h.remarks}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )
            )}
          </>
        )}
      </div>
    </div>
  );
}

export default function UserDashboard() {
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showApply, setShowApply] = useState(false);
  const [selectedApp, setSelectedApp] = useState(null);

  const load = async () => {
    setLoading(true);
    try {
      const res = await getMyApplications();
      setApplications(res.data);
    } catch (e) {} finally { setLoading(false); }
  };

  useEffect(() => { load(); }, []);

  const fmt = (n) => '₹' + Number(n).toLocaleString('en-IN', { maximumFractionDigits: 0 });
  const total = applications.length;
  const approved = applications.filter(a => a.status === 'APPROVED').length;
  const pending = applications.filter(a => a.status === 'PENDING').length;
  const totalBorrowed = applications.filter(a => a.status === 'APPROVED').reduce((s, a) => s + a.requestedAmount, 0);

  return (
    <>
      {showApply && <ApplyModal onClose={() => setShowApply(false)} onSuccess={load} />}
      {selectedApp && <EmiModal application={selectedApp} onClose={() => setSelectedApp(null)} />}

      <div className="page-header" style={{display:'flex', justifyContent:'space-between', alignItems:'flex-start'}}>
        <div>
          <h2>My Loans</h2>
          <p>Track your applications, EMI schedules, and repayments</p>
        </div>
        <button className="btn btn-gold" onClick={() => setShowApply(true)}>+ Apply for Loan</button>
      </div>

      <div className="card-grid">
        <div className="stat-card gold">
          <div className="stat-label">Total Applications</div>
          <div className="stat-value">{total}</div>
          <div className="stat-sub">All time</div>
        </div>
        <div className="stat-card sage">
          <div className="stat-label">Approved</div>
          <div className="stat-value">{approved}</div>
          <div className="stat-sub">Active loans</div>
        </div>
        <div className="stat-card rust">
          <div className="stat-label">Pending Review</div>
          <div className="stat-value">{pending}</div>
          <div className="stat-sub">Awaiting admin</div>
        </div>
        <div className="stat-card ink">
          <div className="stat-label">Total Borrowed</div>
          <div className="stat-value" style={{fontSize:'1.5rem'}}>{fmt(totalBorrowed)}</div>
          <div className="stat-sub">Approved loans</div>
        </div>
      </div>

      <div className="card">
        <h3 style={{marginBottom:'20px', fontSize:'1.2rem'}}>Application History</h3>
        {loading ? (
          <div className="loading"><div className="spinner"></div></div>
        ) : applications.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">📋</div>
            <h3>No applications yet</h3>
            <p>Click "Apply for Loan" to get started</p>
          </div>
        ) : (
          <div className="table-wrapper">
            <table>
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Purpose</th>
                  <th>Amount</th>
                  <th>Income</th>
                  <th>Tenure</th>
                  <th>Applied On</th>
                  <th>Status</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {applications.map(app => (
                  <tr key={app.id}>
                    <td>#{app.id}</td>
                    <td>{app.purpose}</td>
                    <td>{fmt(app.requestedAmount)}</td>
                    <td>{fmt(app.monthlyIncome)}/mo</td>
                    <td>{app.tenureMonths} mo</td>
                    <td>{new Date(app.appliedAt).toLocaleDateString('en-IN')}</td>
                    <td>
                      <span className={`badge badge-${app.status?.toLowerCase()}`}>{app.status}</span>
                      {app.status === 'REJECTED' && app.rejectionReason && (
                        <div style={{fontSize:'0.72rem', color:'#842029', marginTop:'4px'}}>{app.rejectionReason}</div>
                      )}
                    </td>
                    <td>
                      {app.status === 'APPROVED' && (
                        <button className="btn btn-outline" style={{padding:'6px 14px', fontSize:'0.78rem'}} onClick={() => setSelectedApp(app)}>
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
    </>
  );
}
