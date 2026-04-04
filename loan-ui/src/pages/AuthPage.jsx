import { useState } from 'react';
import { loginUser, registerUser } from '../services/api';

export default function AuthPage({ onLogin }) {
  const [mode, setMode] = useState('login');
  const [form, setForm] = useState({ name: '', email: '', password: '', phone: '', role: 'USER' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handle = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const submit = async () => {
    setError(''); setLoading(true);
    try {
      if (mode === 'login') {
        await loginUser(form.email, form.password);
        localStorage.setItem('loanUser', JSON.stringify({ email: form.email, password: form.password }));
        // fetch role by registering a check — we store it after login
        const stored = { email: form.email, password: form.password, name: form.email.split('@')[0] };
        // Try to detect role from backend response or default to USER
        // We will detect it from the response message
        onLogin(stored);
      } else {
        await registerUser(form);
        setMode('login');
        setError('');
        alert('Registered successfully! Please login.');
      }
    } catch (err) {
      setError(err.response?.data || 'Something went wrong. Check credentials or server.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-left">
        <div className="auth-brand">
          <h1>LoanSphere</h1>
          <p>Personal Loan Management</p>
        </div>
        <div className="auth-tagline">
          <h2>Financial freedom, one step at a time.</h2>
          <p>Apply for personal loans, track your EMIs, and manage repayments — all in one elegant platform.</p>
        </div>
        <div className="auth-features">
          <div className="auth-feature">
            <div className="auth-feature-icon">💼</div>
            <span>Quick loan applications with instant eligibility check</span>
          </div>
          <div className="auth-feature">
            <div className="auth-feature-icon">📊</div>
            <span>Detailed EMI schedules with principal & interest breakdown</span>
          </div>
          <div className="auth-feature">
            <div className="auth-feature-icon">✅</div>
            <span>Real-time repayment tracking and payment history</span>
          </div>
        </div>
      </div>

      <div className="auth-right">
        <div className="auth-form-container">
          <h2>{mode === 'login' ? 'Welcome back' : 'Create account'}</h2>
          <p>{mode === 'login' ? 'Sign in to your LoanSphere account' : 'Start your loan journey today'}</p>

          {error && <div className="error-msg" style={{marginBottom:'16px'}}>{error}</div>}

          <div className="auth-form">
            {mode === 'register' && (
              <>
                <div className="form-group">
                  <label>Full Name</label>
                  <input name="name" placeholder="Rahul Sharma" value={form.name} onChange={handle} />
                </div>
                <div className="form-group">
                  <label>Phone Number</label>
                  <input name="phone" placeholder="9876543210" value={form.phone} onChange={handle} />
                </div>
              </>
            )}
            <div className="form-group">
              <label>Email Address</label>
              <input name="email" type="email" placeholder="rahul@gmail.com" value={form.email} onChange={handle} />
            </div>
            <div className="form-group">
              <label>Password</label>
              <input name="password" type="password" placeholder="••••••••" value={form.password} onChange={handle} />
            </div>
            {mode === 'register' && (
              <div className="form-group">
                <label>Account Type</label>
                <select name="role" value={form.role} onChange={handle}>
                  <option value="USER">User — Apply for loans</option>
                  <option value="ADMIN">Admin — Manage applications</option>
                </select>
              </div>
            )}
            <button className="btn btn-primary" style={{width:'100%', justifyContent:'center', padding:'14px'}} onClick={submit} disabled={loading}>
              {loading ? 'Please wait...' : mode === 'login' ? '→  Sign In' : '→  Create Account'}
            </button>
          </div>

          <div className="auth-switch">
            {mode === 'login' ? (
              <p>Don't have an account? <button onClick={() => setMode('register')}>Register here</button></p>
            ) : (
              <p>Already have an account? <button onClick={() => setMode('login')}>Sign in</button></p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
