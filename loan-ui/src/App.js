import { useState, useEffect } from 'react';
import './index.css';
import AuthPage from './pages/AuthPage';
import UserDashboard from './pages/UserDashboard';
import AdminDashboard from './pages/AdminDashboard';
import { getMyApplications, getAllApplications } from './services/api';

function Sidebar({ user, role, activePage, setActivePage, onLogout }) {
  const initials = user?.name ? user.name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0,2) : 'U';

  const userNav = [
    { id: 'dashboard', icon: '🏠', label: 'My Dashboard' },
  ];

  const adminNav = [
    { id: 'dashboard', icon: '📊', label: 'Admin Dashboard' },
  ];

  const nav = role === 'ADMIN' ? adminNav : userNav;

  return (
    <div className="sidebar">
      <div className="sidebar-brand">
        <h1>LoanSphere</h1>
        <p>{role === 'ADMIN' ? 'Admin Portal' : 'User Portal'}</p>
      </div>
      <div className="sidebar-nav">
        {nav.map(item => (
          <button
            key={item.id}
            className={`nav-item ${activePage === item.id ? 'active' : ''}`}
            onClick={() => setActivePage(item.id)}
          >
            <span className="nav-icon">{item.icon}</span>
            {item.label}
          </button>
        ))}
      </div>
      <div className="sidebar-footer">
        <div className="user-chip">
          <div className="user-avatar">{initials}</div>
          <div className="user-info">
            <p>{user?.name || user?.email?.split('@')[0]}</p>
            <span>{role}</span>
          </div>
        </div>
        <button className="logout-btn" onClick={onLogout}>Sign Out</button>
      </div>
    </div>
  );
}

export default function App() {
  const [user, setUser] = useState(null);
  const [role, setRole] = useState(null);
  const [activePage, setActivePage] = useState('dashboard');
  const [detecting, setDetecting] = useState(false);

  // Restore session
  useEffect(() => {
    const stored = localStorage.getItem('loanUser');
    const storedRole = localStorage.getItem('loanRole');
    if (stored && storedRole) {
      setUser(JSON.parse(stored));
      setRole(storedRole);
    }
  }, []);

  const detectRole = async (userData) => {
    setDetecting(true);
    try {
      // Try admin endpoint first
      await getAllApplications();
      setRole('ADMIN');
      localStorage.setItem('loanRole', 'ADMIN');
    } catch (e) {
      try {
        await getMyApplications();
        setRole('USER');
        localStorage.setItem('loanRole', 'USER');
      } catch (e2) {
        setRole('USER');
        localStorage.setItem('loanRole', 'USER');
      }
    } finally {
      setDetecting(false);
    }
  };

  const handleLogin = async (userData) => {
    setUser(userData);
    localStorage.setItem('loanUser', JSON.stringify(userData));
    await detectRole(userData);
  };

  const handleLogout = () => {
    localStorage.removeItem('loanUser');
    localStorage.removeItem('loanRole');
    setUser(null);
    setRole(null);
    setActivePage('dashboard');
  };

  if (!user || !role) {
    return detecting ? (
      <div style={{display:'flex',alignItems:'center',justifyContent:'center',minHeight:'100vh'}}>
        <div className="spinner"></div>
      </div>
    ) : (
      <AuthPage onLogin={handleLogin} />
    );
  }

  return (
    <div className="app-layout">
      <Sidebar user={user} role={role} activePage={activePage} setActivePage={setActivePage} onLogout={handleLogout} />
      <main className="main-content">
        {role === 'ADMIN' ? <AdminDashboard /> : <UserDashboard />}
      </main>
    </div>
  );
}
