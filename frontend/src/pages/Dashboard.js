import React, { useEffect, useState } from "react";
import { collection, getDocs } from "firebase/firestore";
import { db } from "../firebase";
import { useNavigate } from "react-router-dom";

function Dashboard() {
  const navigate = useNavigate();

  const [attendance, setAttendance] = useState([]);
  const [leaves, setLeaves] = useState([]);
  const [loading, setLoading] = useState(true);

  // =========================================================
  // LOAD DASHBOARD DATA
  // =========================================================

  useEffect(() => {
    const loadDashboard = async () => {
      try {
        setLoading(true);

        // -----------------------------
        // LOAD ATTENDANCE
        // -----------------------------

        try {
          const attendanceSnapshot = await getDocs(
            collection(db, "attendance")
          );

          const attendanceData = attendanceSnapshot.docs.map(
            (item) => ({
              id: item.id,
              ...item.data(),
            })
          );

          setAttendance(attendanceData);
        } catch (error) {
          console.log(
            "Attendance collection could not be loaded:",
            error.message
          );

          setAttendance([]);
        }

        // -----------------------------
        // LOAD LEAVES
        // -----------------------------

        try {
          const leaveSnapshot = await getDocs(
            collection(db, "leaves")
          );

          const leaveData = leaveSnapshot.docs.map(
            (item) => ({
              id: item.id,
              ...item.data(),
            })
          );

          setLeaves(leaveData);
        } catch (error) {
          console.log(
            "Leave collection could not be loaded:",
            error.message
          );

          setLeaves([]);
        }
      } catch (error) {
        console.error(
          "Dashboard loading error:",
          error
        );
      } finally {
        setLoading(false);
      }
    };

    loadDashboard();
  }, []);

  // =========================================================
  // TODAY
  // =========================================================

  const today = new Date()
    .toISOString()
    .slice(0, 10);

  // =========================================================
  // TODAY'S PRESENT ATTENDANCE
  // =========================================================

  const presentToday = attendance.filter((item) => {
    const itemDate =
      item.date ||
      item.attendanceDate ||
      item.day;

    const status = String(
      item.status || ""
    ).toLowerCase();

    return (
      itemDate === today &&
      (
        status === "present" ||
        item.present === true
      )
    );
  }).length;

  // =========================================================
  // PENDING LEAVES
  // =========================================================

  const pendingLeaves = leaves.filter(
    (item) =>
      String(item.status || "")
        .toLowerCase() === "pending"
  );

  // =========================================================
  // APPROVED LEAVES
  // =========================================================

  const approvedLeaves = leaves.filter(
    (item) =>
      String(item.status || "")
        .toLowerCase() === "approved"
  );

  // =========================================================
  // RECENT LEAVES
  // =========================================================

  const recentLeaves = [...leaves]
    .sort((a, b) => {
      const dateA = new Date(
        a.createdAt ||
          a.startDate ||
          a.date ||
          0
      ).getTime();

      const dateB = new Date(
        b.createdAt ||
          b.startDate ||
          b.date ||
          0
      ).getTime();

      return dateB - dateA;
    })
    .slice(0, 5);

  // =========================================================
  // EMPLOYEE NAME
  // =========================================================

  const getEmployeeName = (item) => {
    return (
      item.employeeName ||
      item.name ||
      item.fullName ||
      item.email ||
      "Employee"
    );
  };

  // =========================================================
  // FORMAT DATE
  // =========================================================

  const formatDate = (value) => {
    if (!value) {
      return "-";
    }

    try {
      const date = new Date(value);

      if (isNaN(date.getTime())) {
        return value;
      }

      return date.toLocaleDateString(
        "en-IN",
        {
          day: "2-digit",
          month: "short",
          year: "numeric",
        }
      );
    } catch {
      return value;
    }
  };

  // =========================================================
  // LOADING
  // =========================================================

  if (loading) {
    return (
      <div style={styles.loadingPage}>
        <div style={styles.loadingBox}>
          <div style={styles.spinner}></div>

          <p>
            Loading dashboard...
          </p>
        </div>
      </div>
    );
  }

  // =========================================================
  // DASHBOARD
  // =========================================================

  return (
    <div style={styles.page}>

      {/* =====================================================
          HEADER
      ===================================================== */}

      <div style={styles.header}>

        <div>
          <h1 style={styles.title}>
            Good Morning, HR Admin 👋
          </h1>

          <p style={styles.subtitle}>
            Here's what's happening with your
            work today.
          </p>
        </div>

        <div style={styles.profileCard}>

          <div style={styles.profileAvatar}>
            H
          </div>

          <div>
            <strong style={styles.profileName}>
              HR Admin
            </strong>

            <span style={styles.profileEmail}>
              hr@dayflow.com
            </span>
          </div>

        </div>

      </div>

      {/* =====================================================
          WELCOME CARD
      ===================================================== */}

      <div style={styles.welcomeCard}>

        <div>

          <div style={styles.welcomeSmall}>
            EMPLOYEE DASHBOARD
          </div>

          <h2 style={styles.welcomeTitle}>
            Welcome to Dayflow
          </h2>

          <p style={styles.welcomeText}>
            Manage your attendance, leave
            requests and payroll from one place.
          </p>

        </div>

        <div style={styles.welcomeIcon}>
          📋
        </div>

      </div>

      {/* =====================================================
          OVERVIEW
      ===================================================== */}

      <h2 style={styles.sectionTitle}>
        Overview
      </h2>

      <div style={styles.statsGrid}>

        {/* ATTENDANCE */}

        <div style={styles.statCard}>

          <div
            style={{
              ...styles.statIcon,
              background: "#dbeafe",
            }}
          >
            📊
          </div>

          <div style={styles.statContent}>

            <p style={styles.statLabel}>
              Attendance
            </p>

            <h3 style={styles.statValue}>
              {presentToday}
            </h3>

            <p style={styles.statDescription}>
              Present today
            </p>

          </div>

        </div>

        {/* LEAVE REQUESTS */}

        <div style={styles.statCard}>

          <div
            style={{
              ...styles.statIcon,
              background: "#fef3c7",
            }}
          >
            🗓️
          </div>

          <div style={styles.statContent}>

            <p style={styles.statLabel}>
              Leave Requests
            </p>

            <h3 style={styles.statValue}>
              {leaves.length}
            </h3>

            <p style={styles.statDescription}>
              Total requests
            </p>

          </div>

        </div>

        {/* APPROVED */}

        <div style={styles.statCard}>

          <div
            style={{
              ...styles.statIcon,
              background: "#dcfce7",
            }}
          >
            ✓
          </div>

          <div style={styles.statContent}>

            <p style={styles.statLabel}>
              Approved Leave
            </p>

            <h3 style={styles.statValue}>
              {approvedLeaves.length}
            </h3>

            <p style={styles.statDescription}>
              Approved requests
            </p>

          </div>

        </div>

        {/* PENDING */}

        <div style={styles.statCard}>

          <div
            style={{
              ...styles.statIcon,
              background: "#ede9fe",
            }}
          >
            ⏳
          </div>

          <div style={styles.statContent}>

            <p style={styles.statLabel}>
              Pending Leave
            </p>

            <h3 style={styles.statValue}>
              {pendingLeaves.length}
            </h3>

            <p style={styles.statDescription}>
              Awaiting approval
            </p>

          </div>

        </div>

      </div>

      {/* =====================================================
          QUICK ACTIONS
      ===================================================== */}

      <h2 style={styles.sectionTitle}>
        Quick Actions
      </h2>

      <div style={styles.actionsGrid}>

        {/* ATTENDANCE */}

        <button
          style={styles.actionCard}
          onClick={() =>
            navigate(
              "/attendance-overview"
            )
          }
        >

          <div
            style={{
              ...styles.actionIcon,
              background: "#dbeafe",
            }}
          >
            📊
          </div>

          <div style={styles.actionText}>

            <strong>
              Attendance
            </strong>

            <span>
              View attendance
            </span>

          </div>

          <span style={styles.arrow}>
            →
          </span>

        </button>

        {/* LEAVE */}

        <button
          style={styles.actionCard}
          onClick={() =>
            navigate(
              "/leave-management"
            )
          }
        >

          <div
            style={{
              ...styles.actionIcon,
              background: "#fef3c7",
            }}
          >
            🗓️
          </div>

          <div style={styles.actionText}>

            <strong>
              Leave
            </strong>

            <span>
              Apply and track leave
            </span>

          </div>

          <span style={styles.arrow}>
            →
          </span>

        </button>

        {/* PAYROLL */}

        <button
          style={styles.actionCard}
          onClick={() =>
            navigate("/payroll")
          }
        >

          <div
            style={{
              ...styles.actionIcon,
              background: "#dcfce7",
            }}
          >
            💰
          </div>

          <div style={styles.actionText}>

            <strong>
              Payroll
            </strong>

            <span>
              View salary details
            </span>

          </div>

          <span style={styles.arrow}>
            →
          </span>

        </button>

      </div>

      {/* =====================================================
          RECENT LEAVE REQUESTS
      ===================================================== */}

      <div style={styles.recentHeader}>

        <h2 style={styles.sectionTitle}>
          Recent Leave Requests
        </h2>

        <button
          style={styles.viewAll}
          onClick={() =>
            navigate(
              "/leave-management"
            )
          }
        >
          View All
        </button>

      </div>

      <div style={styles.recentCard}>

        {recentLeaves.length === 0 ? (

          <div style={styles.noRecords}>

            <div style={styles.noRecordsIcon}>
              🗓️
            </div>

            <h3>
              No leave requests
            </h3>

            <p>
              There are no recent leave
              requests.
            </p>

          </div>

        ) : (

          <div>

            {recentLeaves.map(
              (item, index) => (

                <div
                  key={item.id}
                  style={{
                    ...styles.leaveRow,
                    borderBottom:
                      index ===
                      recentLeaves.length - 1
                        ? "none"
                        : "1px solid #eef2f7",
                  }}
                >

                  <div
                    style={
                      styles.leaveEmployee
                    }
                  >

                    <div
                      style={
                        styles.leaveAvatar
                      }
                    >
                      {getEmployeeName(item)
                        .charAt(0)
                        .toUpperCase()}
                    </div>

                    <div>

                      <strong
                        style={
                          styles.leaveName
                        }
                      >
                        {getEmployeeName(
                          item
                        )}
                      </strong>

                      <span
                        style={
                          styles.leaveType
                        }
                      >
                        {item.leaveType ||
                          item.type ||
                          "Leave"}
                      </span>

                    </div>

                  </div>

                  <div
                    style={
                      styles.leaveDate
                    }
                  >
                    {formatDate(
                      item.startDate ||
                        item.date
                    )}
                  </div>

                  <span
                    style={{
                      ...styles.status,
                      background:
                        String(
                          item.status || ""
                        ).toLowerCase() ===
                        "approved"
                          ? "#dcfce7"
                          : String(
                              item.status || ""
                            ).toLowerCase() ===
                            "rejected"
                          ? "#fee2e2"
                          : "#fef3c7",

                      color:
                        String(
                          item.status || ""
                        ).toLowerCase() ===
                        "approved"
                          ? "#15803d"
                          : String(
                              item.status || ""
                            ).toLowerCase() ===
                            "rejected"
                          ? "#dc2626"
                          : "#b45309",
                    }}
                  >
                    {item.status ||
                      "Pending"}
                  </span>

                </div>

              )
            )}

          </div>

        )}

      </div>

    </div>
  );
}

// =========================================================
// STYLES
// =========================================================

const styles = {

  page: {
    width: "100%",
    maxWidth: "none",
    margin: 0,
    padding: 0,
    boxSizing: "border-box",
  },

  header: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    gap: "30px",
    marginBottom: "32px",
  },

  title: {
    margin: 0,
    color: "#111827",
    fontSize: "36px",
    lineHeight: "1.2",
    fontWeight: "800",
    letterSpacing: "-1px",
  },

  subtitle: {
    margin: "10px 0 0",
    color: "#718096",
    fontSize: "16px",
  },

  profileCard: {
    display: "flex",
    alignItems: "center",
    gap: "12px",
    padding: "10px 16px",
    background: "#ffffff",
    border: "1px solid #e2e8f0",
    borderRadius: "15px",
    minWidth: "180px",
  },

  profileAvatar: {
    width: "48px",
    height: "48px",
    borderRadius: "50%",
    background: "#dbeafe",
    color: "#2563eb",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontWeight: "700",
    fontSize: "18px",
  },

  profileName: {
    display: "block",
    color: "#111827",
    fontSize: "14px",
  },

  profileEmail: {
    display: "block",
    marginTop: "3px",
    color: "#94a3b8",
    fontSize: "12px",
  },

  welcomeCard: {
    minHeight: "170px",
    borderRadius: "20px",
    padding: "30px 38px",
    boxSizing: "border-box",
    background:
      "linear-gradient(135deg, #2563eb 0%, #4f46e5 100%)",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    color: "#ffffff",
    marginBottom: "38px",
    boxShadow:
      "0 12px 30px rgba(37,99,235,0.18)",
  },

  welcomeSmall: {
    fontSize: "12px",
    fontWeight: "800",
    letterSpacing: "2px",
    opacity: 0.85,
    marginBottom: "10px",
  },

  welcomeTitle: {
    margin: 0,
    fontSize: "30px",
    fontWeight: "800",
  },

  welcomeText: {
    margin: "9px 0 0",
    fontSize: "15px",
    opacity: 0.92,
  },

  welcomeIcon: {
    width: "90px",
    height: "90px",
    borderRadius: "24px",
    background:
      "rgba(255,255,255,0.18)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: "45px",
  },

  sectionTitle: {
    margin: "0 0 18px",
    color: "#111827",
    fontSize: "22px",
    fontWeight: "800",
  },

  statsGrid: {
    display: "grid",
    gridTemplateColumns:
      "repeat(4, minmax(0, 1fr))",
    gap: "20px",
    marginBottom: "38px",
  },

  statCard: {
    minHeight: "150px",
    background: "#ffffff",
    border: "1px solid #e2e8f0",
    borderRadius: "17px",
    padding: "22px",
    boxSizing: "border-box",
    display: "flex",
    alignItems: "center",
    gap: "18px",
    boxShadow:
      "0 3px 12px rgba(15,23,42,0.04)",
  },

  statIcon: {
    width: "58px",
    height: "58px",
    minWidth: "58px",
    borderRadius: "15px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: "25px",
  },

  statContent: {
    minWidth: 0,
  },

  statLabel: {
    margin: 0,
    color: "#64748b",
    fontSize: "14px",
  },

  statValue: {
    margin: "6px 0 4px",
    color: "#0f172a",
    fontSize: "28px",
    fontWeight: "800",
  },

  statDescription: {
    margin: 0,
    color: "#94a3b8",
    fontSize: "12px",
  },

  actionsGrid: {
    display: "grid",
    gridTemplateColumns:
      "repeat(3, minmax(0, 1fr))",
    gap: "20px",
    marginBottom: "38px",
  },

  actionCard: {
    border: "1px solid #e2e8f0",
    background: "#ffffff",
    borderRadius: "17px",
    padding: "20px",
    display: "flex",
    alignItems: "center",
    gap: "15px",
    cursor: "pointer",
    textAlign: "left",
    boxShadow:
      "0 3px 12px rgba(15,23,42,0.04)",
  },

  actionIcon: {
    width: "55px",
    height: "55px",
    minWidth: "55px",
    borderRadius: "14px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: "24px",
  },

  actionText: {
    flex: 1,
    minWidth: 0,
  },

  arrow: {
    color: "#2563eb",
    fontSize: "24px",
    fontWeight: "700",
  },

  recentHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "18px",
  },

  viewAll: {
    border: "none",
    background: "transparent",
    color: "#2563eb",
    fontSize: "14px",
    fontWeight: "700",
    cursor: "pointer",
  },

  recentCard: {
    background: "#ffffff",
    border: "1px solid #e2e8f0",
    borderRadius: "17px",
    overflow: "hidden",
    boxShadow:
      "0 3px 12px rgba(15,23,42,0.04)",
  },

  leaveRow: {
    minHeight: "82px",
    padding: "15px 22px",
    boxSizing: "border-box",
    display: "grid",
    gridTemplateColumns:
      "1fr 180px 110px",
    alignItems: "center",
    gap: "20px",
  },

  leaveEmployee: {
    display: "flex",
    alignItems: "center",
    gap: "12px",
  },

  leaveAvatar: {
    width: "42px",
    height: "42px",
    borderRadius: "50%",
    background: "#dbeafe",
    color: "#2563eb",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontWeight: "700",
  },

  leaveName: {
    display: "block",
    color: "#111827",
    fontSize: "14px",
  },

  leaveType: {
    display: "block",
    marginTop: "4px",
    color: "#94a3b8",
    fontSize: "12px",
  },

  leaveDate: {
    color: "#64748b",
    fontSize: "13px",
  },

  status: {
    justifySelf: "start",
    padding: "6px 12px",
    borderRadius: "20px",
    fontSize: "11px",
    fontWeight: "700",
  },

  noRecords: {
    padding: "55px 20px",
    textAlign: "center",
    color: "#64748b",
  },

  noRecordsIcon: {
    fontSize: "38px",
    marginBottom: "10px",
  },

  loadingPage: {
    width: "100%",
    minHeight: "70vh",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },

  loadingBox: {
    textAlign: "center",
    color: "#64748b",
  },

  spinner: {
    width: "35px",
    height: "35px",
    borderRadius: "50%",
    border:
      "4px solid #e2e8f0",
    borderTop:
      "4px solid #4f46e5",
    animation:
      "spin 1s linear infinite",
    margin: "0 auto 12px",
  },
};

export default Dashboard;