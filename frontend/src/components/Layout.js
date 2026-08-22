import React from "react";
import { NavLink, Outlet } from "react-router-dom";

function Layout() {
  const menuItems = [
    {
      path: "/hr-dashboard",
      label: "Dashboard",
      icon: "🏠",
    },
    {
      path: "/employees",
      label: "Employees",
      icon: "👥",
    },
    {
      path: "/attendance-overview",
      label: "Attendance",
      icon: "📊",
    },
    {
      path: "/leave-management",
      label: "Leave Management",
      icon: "🗓️",
    },
    {
      path: "/payroll",
      label: "Payroll",
      icon: "💰",
    },
  ];

  return (
    <div style={styles.app}>

      {/* ================= SIDEBAR ================= */}

      <aside style={styles.sidebar}>

        {/* LOGO */}

        <div style={styles.logoSection}>

          <div style={styles.logo}>
            D
          </div>

          <div>
            <div style={styles.brand}>
              Dayflow
            </div>

            <div style={styles.brandSubtitle}>
              HR Management
            </div>
          </div>

        </div>

        {/* MENU */}

        <nav style={styles.navigation}>

          {menuItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              style={({ isActive }) => ({
                ...styles.navItem,
                ...(isActive
                  ? styles.navItemActive
                  : {}),
              })}
            >

              <span style={styles.navIcon}>
                {item.icon}
              </span>

              <span>
                {item.label}
              </span>

            </NavLink>
          ))}

        </nav>

        {/* LOGOUT */}

        <div style={styles.sidebarBottom}>

          <button
            style={styles.logoutButton}
            onClick={() => {
              const confirmLogout =
                window.confirm(
                  "Are you sure you want to logout?"
                );

              if (confirmLogout) {
                window.location.href = "/";
              }
            }}
          >

            <span style={styles.logoutIcon}>
              🚪
            </span>

            <span>
              Logout
            </span>

          </button>

        </div>

      </aside>

      {/* ================= MAIN AREA ================= */}

      <main style={styles.main}>

        <div style={styles.content}>
          <Outlet />
        </div>

      </main>

    </div>
  );
}

/* =========================================================
   STYLES
========================================================= */

const styles = {

  /* Whole application */

  app: {
    minHeight: "100vh",
    display: "flex",
    background: "#f5f7fb",
    fontFamily:
      "-apple-system, BlinkMacSystemFont, 'Segoe UI', Arial, sans-serif",
  },

  /* =======================================================
     SIDEBAR
  ======================================================= */

  sidebar: {
    width: "280px",
    minWidth: "280px",
    height: "100vh",
    position: "fixed",
    left: 0,
    top: 0,
    background: "#ffffff",
    borderRight: "1px solid #e5e7eb",
    display: "flex",
    flexDirection: "column",
    zIndex: 100,
  },

  /* =======================================================
     LOGO
  ======================================================= */

  logoSection: {
    height: "148px",
    padding: "0 30px",
    display: "flex",
    alignItems: "center",
    gap: "14px",
    borderBottom: "1px solid #eef0f4",
    boxSizing: "border-box",
  },

  logo: {
    width: "54px",
    height: "54px",
    borderRadius: "15px",
    background:
      "linear-gradient(135deg, #4f46e5, #6366f1)",
    color: "#ffffff",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: "26px",
    fontWeight: "800",
    boxShadow:
      "0 8px 20px rgba(79,70,229,0.25)",
  },

  brand: {
    fontSize: "22px",
    fontWeight: "800",
    color: "#111827",
    lineHeight: "1.1",
  },

  brandSubtitle: {
    marginTop: "5px",
    fontSize: "12px",
    color: "#94a3b8",
  },

  /* =======================================================
     NAVIGATION
  ======================================================= */

  navigation: {
    padding: "28px 16px",
    display: "flex",
    flexDirection: "column",
    gap: "7px",
  },

  navItem: {
    textDecoration: "none",
    color: "#64748b",
    padding: "13px 15px",
    borderRadius: "10px",
    display: "flex",
    alignItems: "center",
    gap: "13px",
    fontSize: "15px",
    fontWeight: "500",
    transition:
      "all 0.2s ease",
  },

  navItemActive: {
    background: "#eef4ff",
    color: "#2563eb",
    fontWeight: "700",
  },

  navIcon: {
    width: "24px",
    textAlign: "center",
    fontSize: "17px",
  },

  /* =======================================================
     BOTTOM
  ======================================================= */

  sidebarBottom: {
    marginTop: "auto",
    padding: "16px",
    borderTop: "1px solid #eef0f4",
  },

  logoutButton: {
    width: "100%",
    border: "none",
    background: "#fff1f2",
    color: "#ef4444",
    padding: "13px 15px",
    borderRadius: "10px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: "10px",
    fontSize: "14px",
    fontWeight: "600",
    cursor: "pointer",
  },

  logoutIcon: {
    fontSize: "16px",
  },

  /* =======================================================
     MAIN
  ======================================================= */

  main: {
    marginLeft: "280px",
    width: "calc(100% - 280px)",
    minHeight: "100vh",
    boxSizing: "border-box",
  },

  /* =======================================================
     CONTENT
  ======================================================= */

  content: {
    width: "100%",
    minHeight: "100vh",
    padding: "42px",
    boxSizing: "border-box",
  },
};

export default Layout;