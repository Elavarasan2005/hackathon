import React from "react";
import { useNavigate } from "react-router-dom";

const EmployeeDashboard = ({ employee }) => {
  const navigate = useNavigate();

  // Get employee details from localStorage if not passed as prop
  let storedEmployee = null;

  try {
    storedEmployee = JSON.parse(localStorage.getItem("employee")) || {};
  } catch (error) {
    storedEmployee = {};
  }

  const currentEmployee = employee || storedEmployee;

  const employeeName = currentEmployee?.name || "Employee";
  const employeeEmail =
    currentEmployee?.email || "employee@dayflow.com";

  const firstLetter = employeeName.charAt(0).toUpperCase();

  return (
    <div style={styles.page}>
      {/* =========================================
          TOP HEADER
      ========================================= */}
      <div style={styles.topHeader}>
        <div>
          <h1 style={styles.greeting}>
            Good Morning, {employeeName} 👋
          </h1>

          <p style={styles.greetingText}>
            Here's what's happening with your work today.
          </p>
        </div>

        <div style={styles.profileCard}>
          <div style={styles.profileAvatar}>
            {firstLetter}
          </div>

          <div>
            <div style={styles.profileName}>
              {employeeName}
            </div>

            <div style={styles.profileEmail}>
              {employeeEmail}
            </div>
          </div>
        </div>
      </div>

      {/* =========================================
          WELCOME BANNER
      ========================================= */}
      <div style={styles.welcomeBanner}>
        <div>
          <div style={styles.bannerLabel}>
            EMPLOYEE DASHBOARD
          </div>

          <h2 style={styles.bannerTitle}>
            Welcome to Dayflow
          </h2>

          <p style={styles.bannerText}>
            Manage your attendance, leave requests and payroll
            from one place.
          </p>
        </div>

        <div style={styles.bannerIcon}>
          📋
        </div>
      </div>

      {/* =========================================
          OVERVIEW
      ========================================= */}
      <h2 style={styles.sectionTitle}>
        Overview
      </h2>

      <div style={styles.statsGrid}>
        {/* Attendance */}
        <div style={styles.statCard}>
          <div style={styles.iconBlue}>
            📊
          </div>

          <div>
            <p style={styles.statLabel}>
              Attendance
            </p>

            <h3 style={styles.statNumber}>
              0
            </h3>

            <p style={styles.statDescription}>
              Present today
            </p>
          </div>
        </div>

        {/* Leave Requests */}
        <div style={styles.statCard}>
          <div style={styles.iconYellow}>
            📅
          </div>

          <div>
            <p style={styles.statLabel}>
              Leave Requests
            </p>

            <h3 style={styles.statNumber}>
              0
            </h3>

            <p style={styles.statDescription}>
              Total requests
            </p>
          </div>
        </div>

        {/* Approved Leave */}
        <div style={styles.statCard}>
          <div style={styles.iconGreen}>
            ✓
          </div>

          <div>
            <p style={styles.statLabel}>
              Approved Leave
            </p>

            <h3 style={styles.statNumber}>
              0
            </h3>

            <p style={styles.statDescription}>
              Approved requests
            </p>
          </div>
        </div>

        {/* Pending Leave */}
        <div style={styles.statCard}>
          <div style={styles.iconPurple}>
            ⏳
          </div>

          <div>
            <p style={styles.statLabel}>
              Pending Leave
            </p>

            <h3 style={styles.statNumber}>
              0
            </h3>

            <p style={styles.statDescription}>
              Awaiting approval
            </p>
          </div>
        </div>
      </div>

      {/* =========================================
          QUICK ACTIONS
      ========================================= */}
      <h2 style={styles.sectionTitle}>
        Quick Actions
      </h2>

      <div style={styles.actionGrid}>
        {/* Attendance */}
        <div
          style={styles.actionCard}
          onClick={() => navigate("/attendance")}
        >
          <div style={styles.actionIconBlue}>
            📊
          </div>

          <div style={styles.actionContent}>
            <h3 style={styles.actionTitle}>
              Attendance
            </h3>

            <p style={styles.actionCardP}>
              View attendance
            </p>
          </div>

          <div style={styles.arrow}>
            →
          </div>
        </div>

        {/* Leave */}
        <div
          style={styles.actionCard}
          onClick={() => navigate("/leave")}
        >
          <div style={styles.actionIconYellow}>
            📅
          </div>

          <div style={styles.actionContent}>
            <h3 style={styles.actionTitle}>
              Leave
            </h3>

            <p style={styles.actionCardP}>
              Apply and track leave
            </p>
          </div>

          <div style={styles.arrow}>
            →
          </div>
        </div>

        {/* Payroll */}
        <div
          style={styles.actionCard}
          onClick={() => navigate("/employee-payroll")}
        >
          <div style={styles.actionIconGreen}>
            💰
          </div>

          <div style={styles.actionContent}>
            <h3 style={styles.actionTitle}>
              Payroll
            </h3>

            <p style={styles.actionCardP}>
              View salary details
            </p>
          </div>

          <div style={styles.arrow}>
            →
          </div>
        </div>
      </div>

      {/* =========================================
          INFORMATION CARD
      ========================================= */}
      <div style={styles.infoCard}>
        <div style={styles.infoIcon}>
          💡
        </div>

        <div>
          <h3 style={styles.infoTitle}>
            Employee Portal
          </h3>

          <p style={styles.infoText}>
            Use the menu on the left to manage your
            attendance and leave requests.
          </p>
        </div>
      </div>
    </div>
  );
};

const styles = {
  page: {
    width: "100%",
    boxSizing: "border-box",
    fontFamily:
      '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Arial, sans-serif',
    color: "#172033",
  },

  // =========================================
  // TOP HEADER
  // =========================================

  topHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "35px",
    gap: "20px",
  },

  greeting: {
    margin: 0,
    fontSize: "36px",
    fontWeight: "800",
    color: "#0f172a",
  },

  greetingText: {
    margin: "10px 0 0",
    fontSize: "16px",
    color: "#64748b",
  },

  profileCard: {
    display: "flex",
    alignItems: "center",
    gap: "12px",
    background: "#ffffff",
    border: "1px solid #e2e8f0",
    borderRadius: "18px",
    padding: "12px 18px",
    minWidth: "200px",
  },

  profileAvatar: {
    width: "55px",
    height: "55px",
    borderRadius: "50%",
    background: "#dbeafe",
    color: "#2563eb",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    fontSize: "22px",
    fontWeight: "700",
  },

  profileName: {
    fontSize: "16px",
    fontWeight: "700",
    color: "#172033",
  },

  profileEmail: {
    marginTop: "4px",
    fontSize: "13px",
    color: "#64748b",
  },

  // =========================================
  // WELCOME BANNER
  // =========================================

  welcomeBanner: {
    width: "100%",
    minHeight: "190px",
    borderRadius: "24px",
    background:
      "linear-gradient(135deg, #2563eb 0%, #4f46e5 100%)",
    color: "white",
    padding: "38px 44px",
    boxSizing: "border-box",
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: "45px",
    boxShadow: "0 15px 35px rgba(37, 99, 235, 0.18)",
  },

  bannerLabel: {
    fontSize: "13px",
    fontWeight: "800",
    letterSpacing: "2px",
    opacity: 0.9,
    marginBottom: "12px",
  },

  bannerTitle: {
    margin: 0,
    fontSize: "36px",
    fontWeight: "800",
  },

  bannerText: {
    margin: "10px 0 0",
    fontSize: "17px",
    opacity: 0.95,
  },

  bannerIcon: {
    width: "100px",
    height: "100px",
    borderRadius: "30px",
    background: "rgba(255,255,255,0.18)",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    fontSize: "48px",
  },

  // =========================================
  // SECTION
  // =========================================

  sectionTitle: {
    fontSize: "25px",
    fontWeight: "800",
    color: "#0f172a",
    margin: "0 0 20px",
  },

  // =========================================
  // STATS
  // =========================================

  statsGrid: {
    display: "grid",
    gridTemplateColumns:
      "repeat(4, minmax(0, 1fr))",
    gap: "22px",
    marginBottom: "45px",
  },

  statCard: {
    background: "#ffffff",
    border: "1px solid #e2e8f0",
    borderRadius: "20px",
    padding: "28px 25px",
    display: "flex",
    alignItems: "center",
    gap: "20px",
    minHeight: "120px",
    boxSizing: "border-box",
    boxShadow: "0 4px 12px rgba(15, 23, 42, 0.04)",
  },

  iconBlue: {
    width: "64px",
    height: "64px",
    borderRadius: "18px",
    background: "#dbeafe",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    fontSize: "28px",
    flexShrink: 0,
  },

  iconYellow: {
    width: "64px",
    height: "64px",
    borderRadius: "18px",
    background: "#fef3c7",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    fontSize: "28px",
    flexShrink: 0,
  },

  iconGreen: {
    width: "64px",
    height: "64px",
    borderRadius: "18px",
    background: "#d1fae5",
    color: "#059669",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    fontSize: "32px",
    fontWeight: "700",
    flexShrink: 0,
  },

  iconPurple: {
    width: "64px",
    height: "64px",
    borderRadius: "18px",
    background: "#ede9fe",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    fontSize: "28px",
    flexShrink: 0,
  },

  statLabel: {
    margin: 0,
    color: "#64748b",
    fontSize: "15px",
  },

  statNumber: {
    margin: "5px 0",
    fontSize: "30px",
    fontWeight: "800",
    color: "#0f172a",
  },

  statDescription: {
    margin: 0,
    color: "#94a3b8",
    fontSize: "13px",
  },

  // =========================================
  // QUICK ACTIONS
  // =========================================

  actionGrid: {
    display: "grid",
    gridTemplateColumns:
      "repeat(3, minmax(0, 1fr))",
    gap: "22px",
    marginBottom: "40px",
  },

  actionCard: {
    background: "#ffffff",
    border: "1px solid #e2e8f0",
    borderRadius: "20px",
    padding: "22px",
    display: "flex",
    alignItems: "center",
    gap: "16px",
    cursor: "pointer",
    minHeight: "105px",
    boxSizing: "border-box",
    boxShadow: "0 4px 12px rgba(15, 23, 42, 0.04)",
  },

  actionIconBlue: {
    width: "58px",
    height: "58px",
    borderRadius: "16px",
    background: "#dbeafe",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    fontSize: "27px",
    flexShrink: 0,
  },

  actionIconYellow: {
    width: "58px",
    height: "58px",
    borderRadius: "16px",
    background: "#fef3c7",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    fontSize: "27px",
    flexShrink: 0,
  },

  actionIconGreen: {
    width: "58px",
    height: "58px",
    borderRadius: "16px",
    background: "#d1fae5",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    fontSize: "27px",
    flexShrink: 0,
  },

  actionContent: {
    flex: 1,
  },

  actionTitle: {
    margin: 0,
    fontSize: "16px",
    fontWeight: "700",
    color: "#0f172a",
  },

  actionCardP: {
    margin: "5px 0 0",
    color: "#64748b",
    fontSize: "14px",
  },

  arrow: {
    fontSize: "25px",
    color: "#2563eb",
    fontWeight: "500",
  },

  // =========================================
  // INFORMATION
  // =========================================

  infoCard: {
    background: "#ffffff",
    border: "1px solid #e2e8f0",
    borderRadius: "20px",
    padding: "25px",
    display: "flex",
    alignItems: "center",
    gap: "18px",
    marginBottom: "30px",
  },

  infoIcon: {
    width: "55px",
    height: "55px",
    borderRadius: "15px",
    background: "#fef3c7",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    fontSize: "25px",
    flexShrink: 0,
  },

  infoTitle: {
    margin: 0,
    fontSize: "17px",
    fontWeight: "700",
    color: "#0f172a",
  },

  infoText: {
    margin: "5px 0 0",
    fontSize: "14px",
    color: "#64748b",
  },
};

export default EmployeeDashboard;