import { useState, useEffect } from "react";
import "./index.css";
import AuthPage from "./pages/AuthPage";
import UserDashboard from "./pages/UserDashboard";
import AdminDashboard from "./pages/AdminDashboard";
import { getMyApplications, getAllApplications } from "./services/api";

export default function App() {
  const [user, setUser] = useState(null);
  const [role, setRole] = useState(null);
  const [detecting, setDetecting] = useState(false);

  // Restore session
  useEffect(() => {
    const stored = localStorage.getItem("loanUser");
    const storedRole = localStorage.getItem("loanRole");
    if (stored && storedRole) {
      setUser(JSON.parse(stored));
      setRole(storedRole);
    }
  }, []);

  const detectRole = async (userData) => {
    setDetecting(true);
    try {
      await getAllApplications();
      setRole("ADMIN");
      localStorage.setItem("loanRole", "ADMIN");
    } catch (e) {
      try {
        await getMyApplications();
        setRole("USER");
        localStorage.setItem("loanRole", "USER");
      } catch (e2) {
        setRole("USER");
        localStorage.setItem("loanRole", "USER");
      }
    } finally {
      setDetecting(false);
    }
  };

  const handleLogin = async (userData) => {
    setUser(userData);
    localStorage.setItem("loanUser", JSON.stringify(userData));
    await detectRole(userData);
  };

  const handleLogout = () => {
    localStorage.removeItem("loanUser");
    localStorage.removeItem("loanRole");
    setUser(null);
    setRole(null);
  };

  if (detecting) {
    return (
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          minHeight: "100vh",
        }}
      >
        <div className="spinner"></div>
      </div>
    );
  }

  if (!user || !role) {
    return <AuthPage onLogin={handleLogin} />;
  }

  return role === "ADMIN" ? (
    <AdminDashboard onLogout={handleLogout} />
  ) : (
    <UserDashboard onLogout={handleLogout} />
  );
}
