import React from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { signOut } from "firebase/auth";
import { auth } from "../firebase";

const EmployeeLayout = ({ children, employee }) => {
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = async () => {
    try {
      await signOut(auth);
      localStorage.removeItem("employee");
      localStorage.removeItem("user");
      navigate("/login");
    } catch (error) {
      console.error("Logout error:", error);
    }
  };

  const menuItems = [
    {
      name: "Dashboard",
      icon: "🏠",
      path: "/dashboard",
    },
    {
      name: "Attendance",
      icon: "🕐",
      path: "/attendance",
    },
    {
      name: "Leave",
      icon: "📅",
      path: "/leave",
    },
  ];

  return (
    <div style={styles.app}>
      {/* SIDEBAR */}
      <aside style={styles.sidebar}>
        <div>
          <div style={styles.logo}>Dayflow</div>
          <div style={styles.logoSubtitle}>Employee Portal</div>
        </div>

        <nav style={styles.nav}>
          {menuItems.map((item) => {
            const active = location.pathname === item.path;

            return (
              <button
                key={item.path}
                onClick={() => navigate(item.path)}
                style={{
                  ...styles.navButton,
                  ...(active ? styles.activeNavButton : {}),
                }}
              >
                <span style={styles.navIcon}>{item.icon}</span>
                <span>{item.name}</span>
              </button>
            );
          })}
        </nav>

        <button onClick={handleLogout} style={styles.logoutButton}>
          <span>🚪</span>
          Logout
        </button>
      </aside>

      {/* MAIN */}
      <main style={styles.main}>
        {/* TOP BAR */}
        <header style={styles.header}>
          <div>
            <h2 style={styles.headerTitle}>Dayflow HRMS</h2>
            <p style={styles.headerSubtitle}>
              Human Resource Management System
            </p>
          </div>

          <div style={styles.profile}>
            <div style={styles.avatar}>
              {(employee?.name || "E").charAt(0).toUpperCase()}
            </div>

            <div>
              <div style={styles.profileName}>
                {employee?.name || "Employee"}
              </div>

              <div style={styles.profileRole}>
                {employee?.role || "Employee"}
              </div>
            </div>
          </div>
        </header>

        {/* PAGE CONTENT */}
        <section style={styles.content}>{children}</section>
      </main>
    </div>
  );
};

const styles = {
  app: {
    minHeight: "100vh",
    display: "flex",
    background: "#f4f7fb",
    fontFamily:
      '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Arial, sans-serif',
  },

  sidebar: {
    width: "245px",
    minHeight: "100vh",
    background: "#101827",
    color: "white",
    display: "flex",
    flexDirection: "column",
    padding: "28px 18px",
    boxSizing: "border-box",
    position: "fixed",
    left: 0,
    top: 0,
    bottom: 0,
  },

  logo: {
    fontSize: "30px",
    fontWeight: "800",
    letterSpacing: "-1px",
  },

  logoSubtitle: {
    color: "#94a3b8",
    marginTop: "5px",
    fontSize: "14px",
  },

  nav: {
    marginTop: "50px",
    display: "flex",
    flexDirection: "column",
    gap: "8px",
  },

  navButton: {
    border: "none",
    background: "transparent",
    color: "#cbd5e1",
    padding: "14px 15px",
    borderRadius: "10px",
    display: "flex",
    alignItems: "center",
    gap: "13px",
    fontSize: "15px",
    cursor: "pointer",
    textAlign: "left",
    width: "100%",
  },

  activeNavButton: {
    background: "#2563eb",
    color: "white",
    fontWeight: "600",
  },

  navIcon: {
    fontSize: "19px",
    width: "24px",
  },

  logoutButton: {
    marginTop: "auto",
    border: "none",
    background: "transparent",
    color: "#cbd5e1",
    padding: "14px 15px",
    borderRadius: "10px",
    display: "flex",
    alignItems: "center",
    gap: "13px",
    fontSize: "15px",
    cursor: "pointer",
  },

  main: {
    marginLeft: "245px",
    width: "calc(100% - 245px)",
    minHeight: "100vh",
  },

  header: {
    height: "88px",
    background: "white",
    borderBottom: "1px solid #e2e8f0",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    padding: "0 38px",
    boxSizing: "border-box",
  },

  headerTitle: {
    margin: 0,
    fontSize: "22px",
    color: "#172033",
  },

  headerSubtitle: {
    margin: "4px 0 0",
    color: "#64748b",
    fontSize: "14px",
  },

  profile: {
    display: "flex",
    alignItems: "center",
    gap: "12px",
  },

  avatar: {
    width: "48px",
    height: "48px",
    borderRadius: "50%",
    background: "#2563eb",
    color: "white",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    fontSize: "20px",
    fontWeight: "700",
  },

  profileName: {
    fontWeight: "700",
    color: "#172033",
  },

  profileRole: {
    fontSize: "13px",
    color: "#64748b",
    marginTop: "3px",
  },

  content: {
    padding: "40px",
  },
};

export default EmployeeLayout;