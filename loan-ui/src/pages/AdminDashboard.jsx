import { useState, useEffect } from 'react';
import { getAllApplications, reviewApplication } from '../services/api';

function ReviewModal({ application, onClose, onDone }) {
  const [form, setForm] = useState({ status: 'APPROVED', rejectionReason: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const submit = async () => {
    setError(''); setLoading(true);
    try {
      await reviewApplication(application.id, form);
      onDone(); onClose();
    } catch (e) {
      setError(e.response?.data || 'Review failed');
    } finally { setLoading(false); }
  };

  const fmt = (n) => '₹' + Number(n).toLocaleString('en-IN', { maximumFractionDigits: 0 });

  return (
    <div className="modal-overlay">
      <div className="modal">
        <div className="modal-header">
          <h3>Review Application #{application.id}</h3>
          <button className="modal-close" onClick={onClose}>✕</button>
        </div>

        <div style={{background:'#faf8f3', borderRadius:'12px', padding:'20px', marginBottom:'24px'}}>
          <div style={{display:'grid', gridTemplateColumns:'1fr 1fr', gap:'12px'}}>
            <div><div style={{fontSize:'0.72rem', textTransform:'uppercase', letterSpacing:'1px', color:'#7a7065', marginBottom:'4px'}}>Applicant</div><div style={{fontWeight:'600'}}>{application.applicantName}</div></div>
            <div><div style={{fontSize:'0.72rem', textTransform:'uppercase', letterSpacing:'1px', color:'#7a7065', marginBottom:'4px'}}>Monthly Income</div><div style={{fontWeight:'600'}}>{fmt(application.monthlyIncome)}</div></div>
            <div><div style={{fontSize:'0.72rem', textTransform:'uppercase', letterSpacing:'1px', color:'#7a7065', marginBottom:'4px'}}>Loan Amount</div><div style={{fontWeight:'600', color:'#c44b2b'}}>{fmt(application.requestedAmount)}</div></div>
            <div><div style={{fontSize:'0.72rem', textTransform:'uppercase', letterSpacing:'1px', color:'#7a7065', marginBottom:'4px'}}>Tenure</div><div style={{fontWeight:'600'}}>{application.tenureMonths} months</div></div>
            <div style={{gridColumn:'1/-1'}}><div style={{fontSize:'0.72rem', textTransform:'uppercase', letterSpacing:'1px', color:'#7a7065', marginBottom:'4px'}}>Purpose</div><div style={{fontWeight:'600'}}>{application.purpose}</div></div>
          </div>
        </div>

        {error && <div className="error-msg" style={{marginBottom:'16px'}}>{error}</div>}

        <div className="form-group" style={{marginBottom:'16px'}}>
          <label>Decision</label>
          <select value={form.status} onChange={e => setForm({...form, status: e.target.value})}>
            <option value="APPROVED">✅ Approve — Generate EMI Schedule</option>
            <option value="REJECTED">❌ Reject — Decline Application</option>
          </select>
        </div>

        {form.status === 'REJECTED' && (
          <div className="form-group" style={{marginBottom:'16px'}}>
            <label>Rejection Reason</label>
            <input
              placeholder="e.g. Low income, existing obligations..."
              value={form.rejectionReason}
              onChange={e => setForm({...form, rejectionReason: e.target.value})}
            />
          </div>
        )}

        {form.status === 'APPROVED' && (
          <div style={{background:'#d1e7dd', borderRadius:'8px', padding:'12px', fontSize:'0.82rem', color:'#0f5132', marginBottom:'16px'}}>
            ✅ Approving will create a loan account at <strong>12% p.a.</strong> and auto-generate the full EMI schedule.
          </div>
        )}

        <div style={{display:'flex', gap:'12px'}}>
          <button className="btn btn-outline" onClick={onClose}>Cancel</button>
          <button
            className={`btn ${form.status === 'APPROVED' ? 'btn-success' : 'btn-danger'}`}
            onClick={submit} disabled={loading}
          >
            {loading ? 'Processing...' : form.status === 'APPROVED' ? '✅ Approve Loan' : '❌ Reject Application'}
          </button>
        </div>
      </div>
    </div>
  );
}

export default function AdminDashboard() {
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState(null);
  const [filter, setFilter] = useState('ALL');

  const load = async () => {
    setLoading(true);
    try {
      const res = await getAllApplications();
      setApplications(res.data);
    } catch (e) {} finally { setLoading(false); }
  };

  useEffect(() => { load(); }, []);

  const fmt = (n) => '₹' + Number(n).toLocaleString('en-IN', { maximumFractionDigits: 0 });

  const filtered = filter === 'ALL' ? applications : applications.filter(a => a.status === filter);
  const pending = applications.filter(a => a.status === 'PENDING').length;
  const approved = applications.filter(a => a.status === 'APPROVED').length;
  const rejected = applications.filter(a => a.status === 'REJECTED').length;
  const totalDisbursed = applications.filter(a => a.status === 'APPROVED').reduce((s, a) => s + a.requestedAmount, 0);

  return (
    <>
      {selected && <ReviewModal application={selected} onClose={() => setSelected(null)} onDone={load} />}

      <div className="page-header">
        <h2>Admin Dashboard</h2>
        <p>Review and manage all loan applications</p>
      </div>

      <div className="card-grid">
        <div className="stat-card rust">
          <div className="stat-label">Pending Review</div>
          <div className="stat-value">{pending}</div>
          <div className="stat-sub">Needs attention</div>
        </div>
        <div className="stat-card sage">
          <div className="stat-label">Approved</div>
          <div className="stat-value">{approved}</div>
          <div className="stat-sub">Active loans</div>
        </div>
        <div className="stat-card ink">
          <div className="stat-label">Rejected</div>
          <div className="stat-value">{rejected}</div>
          <div className="stat-sub">Declined</div>
        </div>
        <div className="stat-card gold">
          <div className="stat-label">Total Disbursed</div>
          <div className="stat-value" style={{fontSize:'1.4rem'}}>{fmt(totalDisbursed)}</div>
          <div className="stat-sub">Approved amount</div>
        </div>
      </div>

      <div className="card">
        <div style={{display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'20px'}}>
          <h3 style={{fontSize:'1.2rem'}}>All Applications</h3>
          <div className="tabs" style={{marginBottom:'0'}}>
            {['ALL','PENDING','APPROVED','REJECTED'].map(f => (
              <button key={f} className={`tab ${filter===f?'active':''}`} onClick={() => setFilter(f)}>
                {f === 'ALL' ? `All (${applications.length})` : `${f.charAt(0)+f.slice(1).toLowerCase()} (${applications.filter(a=>a.status===f).length})`}
              </button>
            ))}
          </div>
        </div>

        {loading ? (
          <div className="loading"><div className="spinner"></div></div>
        ) : filtered.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">📭</div>
            <h3>No applications found</h3>
            <p>No applications match this filter</p>
          </div>
        ) : (
          <div className="table-wrapper">
            <table>
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
                {filtered.map(app => (
                  <tr key={app.id}>
                    <td>#{app.id}</td>
                    <td style={{fontWeight:'500'}}>{app.applicantName}</td>
                    <td>{app.purpose}</td>
                    <td style={{fontWeight:'600'}}>{fmt(app.requestedAmount)}</td>
                    <td>{fmt(app.monthlyIncome)}/mo</td>
                    <td>{app.tenureMonths} mo</td>
                    <td>{new Date(app.appliedAt).toLocaleDateString('en-IN')}</td>
                    <td>
                      <span className={`badge badge-${app.status?.toLowerCase()}`}>{app.status}</span>
                      {app.status === 'REJECTED' && app.rejectionReason && (
                        <div style={{fontSize:'0.7rem', color:'#842029', marginTop:'3px'}}>{app.rejectionReason}</div>
                      )}
                    </td>
                    <td>
                      {app.status === 'PENDING' && (
                        <button className="btn btn-gold" style={{padding:'6px 14px', fontSize:'0.78rem'}} onClick={() => setSelected(app)}>
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
    </>
  );
}
