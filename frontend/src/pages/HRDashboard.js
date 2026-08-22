import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { collection, getDocs } from "firebase/firestore";
import { auth, db } from "../firebase";

function HRDashboard() {
  const navigate = useNavigate();

  const [employees, setEmployees] = useState([]);
  const [leaves, setLeaves] = useState([]);
  const [loading, setLoading] = useState(true);
  const [todayAttendance, setTodayAttendance] = useState(0);
  const [pendingLeaves, setPendingLeaves] = useState(0);

  useEffect(() => {
    const loadHRDashboard = async () => {
      try {
        const user = auth.currentUser;
        const savedUser = localStorage.getItem("user");

        if (!user && !savedUser) {
          navigate("/login", { replace: true });
          return;
        }

        // -----------------------------
        // EMPLOYEES
        // -----------------------------

        const employeeSnapshot = await getDocs(
          collection(db, "users")
        );

        const employeeData = [];

        employeeSnapshot.forEach((doc) => {
          employeeData.push({
            id: doc.id,
            ...doc.data()
          });
        });

        const employeeList = employeeData.filter(
          (employee) =>
            employee.role !== "hr" &&
            employee.role !== "HR"
        );

        setEmployees(employeeList);

        // -----------------------------
        // LEAVES
        // -----------------------------

        const leaveSnapshot = await getDocs(
          collection(db, "leaves")
        );

        const leaveData = [];

        leaveSnapshot.forEach((doc) => {
          leaveData.push({
            id: doc.id,
            ...doc.data()
          });
        });

        setLeaves(leaveData);

        const pending = leaveData.filter(
          (leave) =>
            String(leave.status || "").toLowerCase() ===
            "pending"
        ).length;

        setPendingLeaves(pending);

        // -----------------------------
        // ATTENDANCE
        // -----------------------------

        const attendanceSnapshot = await getDocs(
          collection(db, "attendance")
        );

        const attendanceData = [];

        attendanceSnapshot.forEach((doc) => {
          attendanceData.push({
            id: doc.id,
            ...doc.data()
          });
        });

        const today = new Date()
          .toISOString()
          .split("T")[0];

        const todayCount = attendanceData.filter(
          (item) => {
            const date =
              item.date ||
              item.attendanceDate ||
              "";

            return date === today;
          }
        ).length;

        setTodayAttendance(todayCount);
      } catch (error) {
        console.error(
          "HR dashboard error:",
          error
        );
      } finally {
        setLoading(false);
      }
    };

    loadHRDashboard();
  }, [navigate]);

  // -----------------------------
  // LOGOUT
  // -----------------------------

  const logout = async () => {
    try {
      await auth.signOut();
    } catch (error) {
      console.error(
        "Logout error:",
        error
      );
    }

    localStorage.removeItem("user");

    navigate("/login", {
      replace: true
    });
  };

  // -----------------------------
  // LOADING
  // -----------------------------

  if (loading) {
    return (
      <div style={styles.loadingPage}>
        <div style={styles.loadingLogo}>
          D
        </div>

        <p>
          Loading HR Dashboard...
        </p>
      </div>
    );
  }

  // -----------------------------
  // CALCULATIONS
  // -----------------------------

  const totalEmployees = employees.length;

  const presentToday = todayAttendance;

  const absentToday = Math.max(
    totalEmployees - presentToday,
    0
  );

  // -----------------------------
  // DASHBOARD
  // -----------------------------

  return (
    <div style={styles.page}>

      {/* SIDEBAR */}

      <aside style={styles.sidebar}>

        <div style={styles.logoContainer}>
          <div style={styles.logo}>
            D
          </div>

          <div>
            <div style={styles.logoText}>
              Dayflow
            </div>

            <div style={styles.logoSubtext}>
              HR Management
            </div>
          </div>
        </div>

        <nav style={styles.menu}>

          <button
            style={{
              ...styles.menuItem,
              ...styles.activeItem
            }}
            onClick={() =>
              navigate("/hr-dashboard")
            }
          >
            <span>🏠</span>
            Dashboard
          </button>

          <button
            style={styles.menuItem}
            onClick={() =>
              navigate("/employees")
            }
          >
            <span>👥</span>
            Employees
          </button>

          <button
            style={styles.menuItem}
            onClick={() =>
              navigate(
                "/attendance-overview"
              )
            }
          >
            <span>📊</span>
            Attendance
          </button>

          <button
            style={styles.menuItem}
            onClick={() =>
              navigate(
                "/leave-management"
              )
            }
          >
            <span>🗓️</span>
            Leave Management

            {pendingLeaves > 0 && (
              <span style={styles.badge}>
                {pendingLeaves}
              </span>
            )}
          </button>

          <button
            style={styles.menuItem}
            onClick={() =>
              navigate("/payroll")
            }
          >
            <span>💰</span>
            Payroll
          </button>

        </nav>

        <div style={styles.sidebarBottom}>

          <button
            style={styles.logout}
            onClick={logout}
          >
            🚪 Logout
          </button>

        </div>

      </aside>

      {/* MAIN */}

      <main style={styles.main}>

        {/* HEADER */}

        <header style={styles.header}>

          <div>
            <h1 style={styles.title}>
              HR Dashboard
            </h1>

            <p style={styles.subtitle}>
              Manage your workforce from one place.
            </p>
          </div>

          <div style={styles.hrProfile}>

            <div style={styles.hrAvatar}>
              HR
            </div>

            <div>
              <div style={styles.hrName}>
                HR Administrator
              </div>

              <div style={styles.hrRole}>
                Human Resources
              </div>
            </div>

          </div>

        </header>

        {/* WELCOME */}

        <section style={styles.welcomeCard}>

          <div>
            <div style={styles.welcomeSmall}>
              HUMAN RESOURCE MANAGEMENT
            </div>

            <h2 style={styles.welcomeTitle}>
              Welcome back, HR 👋
            </h2>

            <p style={styles.welcomeText}>
              Monitor employees, attendance,
              leave and payroll efficiently.
            </p>
          </div>

          <div style={styles.welcomeIcon}>
            👥
          </div>

        </section>

        {/* WORKFORCE */}

        <div style={styles.sectionHeader}>
          <h2 style={styles.sectionTitle}>
            Workforce Overview
          </h2>
        </div>

        <div style={styles.statsGrid}>

          {/* EMPLOYEES */}

          <div
            style={styles.statCard}
            onClick={() =>
              navigate("/employees")
            }
          >

            <div
              style={{
                ...styles.statIcon,
                background: "#dbeafe",
                color: "#2563eb"
              }}
            >
              👥
            </div>

            <div>
              <div style={styles.statLabel}>
                Total Employees
              </div>

              <div style={styles.statValue}>
                {totalEmployees}
              </div>

              <div style={styles.statDescription}>
                Active employees
              </div>
            </div>

          </div>

          {/* PRESENT */}

          <div
            style={styles.statCard}
            onClick={() =>
              navigate(
                "/attendance-overview"
              )
            }
          >

            <div
              style={{
                ...styles.statIcon,
                background: "#dcfce7",
                color: "#16a34a"
              }}
            >
              ✓
            </div>

            <div>
              <div style={styles.statLabel}>
                Present Today
              </div>

              <div style={styles.statValue}>
                {presentToday}
              </div>

              <div style={styles.statDescription}>
                Marked attendance
              </div>
            </div>

          </div>

          {/* ABSENT */}

          <div
            style={styles.statCard}
            onClick={() =>
              navigate(
                "/attendance-overview"
              )
            }
          >

            <div
              style={{
                ...styles.statIcon,
                background: "#fee2e2",
                color: "#dc2626"
              }}
            >
              !
            </div>

            <div>
              <div style={styles.statLabel}>
                Not Present
              </div>

              <div style={styles.statValue}>
                {absentToday}
              </div>

              <div style={styles.statDescription}>
                Not marked today
              </div>
            </div>

          </div>

          {/* LEAVES */}

          <div
            style={styles.statCard}
            onClick={() =>
              navigate(
                "/leave-management"
              )
            }
          >

            <div
              style={{
                ...styles.statIcon,
                background: "#fef3c7",
                color: "#d97706"
              }}
            >
              🗓️
            </div>

            <div>
              <div style={styles.statLabel}>
                Pending Leaves
              </div>

              <div style={styles.statValue}>
                {pendingLeaves}
              </div>

              <div style={styles.statDescription}>
                Need your approval
              </div>
            </div>

          </div>

        </div>

        {/* ACTIONS */}

        <div style={styles.sectionHeader}>
          <h2 style={styles.sectionTitle}>
            HR Actions
          </h2>
        </div>

        <div style={styles.actionsGrid}>

          <Action
            icon="👥"
            title="Employee Management"
            text="View and manage employees"
            color="#dbeafe"
            onClick={() =>
              navigate("/employees")
            }
          />

          <Action
            icon="📊"
            title="Attendance Overview"
            text="Monitor employee attendance"
            color="#dcfce7"
            onClick={() =>
              navigate(
                "/attendance-overview"
              )
            }
          />

          <Action
            icon="🗓️"
            title="Leave Management"
            text="Approve or reject requests"
            color="#fef3c7"
            onClick={() =>
              navigate(
                "/leave-management"
              )
            }
          />

          <Action
            icon="💰"
            title="Payroll"
            text="Manage employee salaries"
            color="#f3e8ff"
            onClick={() =>
              navigate("/payroll")
            }
          />

        </div>

        {/* RECENT LEAVES */}

        <div style={styles.sectionHeader}>

          <h2 style={styles.sectionTitle}>
            Recent Leave Requests
          </h2>

          <button
            style={styles.viewButton}
            onClick={() =>
              navigate(
                "/leave-management"
              )
            }
          >
            View All
          </button>

        </div>

        <div style={styles.leaveCard}>

          {leaves.length === 0 ? (

            <div style={styles.emptyState}>
              <div style={styles.emptyIcon}>
                🗓️
              </div>

              <h3>
                No leave requests
              </h3>

              <p>
                There are currently no
                leave requests.
              </p>
            </div>

          ) : (

            leaves
              .slice(0, 5)
              .map((leave) => {

                const status =
                  String(
                    leave.status || "Pending"
                  ).toLowerCase();

                return (
                  <div
                    key={leave.id}
                    style={styles.leaveRow}
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
                        {(
                          leave.employeeName ||
                          leave.name ||
                          "E"
                        )
                          .charAt(0)
                          .toUpperCase()}
                      </div>

                      <div>

                        <div
                          style={
                            styles.leaveName
                          }
                        >
                          {leave.employeeName ||
                            leave.name ||
                            "Employee"}
                        </div>

                        <div
                          style={
                            styles.leaveType
                          }
                        >
                          {leave.leaveType ||
                            leave.type ||
                            "Leave"}
                        </div>

                      </div>

                    </div>

                    <div
                      style={
                        styles.leaveDate
                      }
                    >
                      {leave.startDate ||
                        leave.fromDate ||
                        "-"}
                    </div>

                    <div>

                      <span
                        style={{
                          ...styles.status,
                          ...(status === "approved"
                            ? styles.approved
                            : status === "rejected"
                            ? styles.rejected
                            : styles.pending)
                        }}
                      >
                        {leave.status ||
                          "Pending"}
                      </span>

                    </div>

                  </div>
                );
              })

          )}

        </div>

        <div style={styles.footer}>
          Dayflow HRMS
          <span> • </span>
          Human Resource Management System
        </div>

      </main>

    </div>
  );
}


// =====================================================
// ACTION COMPONENT
// =====================================================

function Action({
  icon,
  title,
  text,
  color,
  onClick
}) {
  return (
    <button
      style={styles.actionCard}
      onClick={onClick}
    >

      <div
        style={{
          ...styles.actionIcon,
          background: color
        }}
      >
        {icon}
      </div>

      <div style={styles.actionContent}>

        <div style={styles.actionTitle}>
          {title}
        </div>

        <div style={styles.actionText}>
          {text}
        </div>

      </div>

      <span style={styles.arrow}>
        →
      </span>

    </button>
  );
}


// =====================================================
// STYLES
// =====================================================

const styles = {

  page: {
    minHeight: "100vh",
    background: "#f5f7fb"
  },

  loadingPage: {
    minHeight: "100vh",
    background: "#f5f7fb",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    color: "#6b7280"
  },

  loadingLogo: {
    width: "55px",
    height: "55px",
    borderRadius: "13px",
    background:
      "linear-gradient(135deg,#2563eb,#4f46e5)",
    color: "#fff",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: "25px",
    fontWeight: "800"
  },

  sidebar: {
    width: "250px",
    minHeight: "100vh",
    position: "fixed",
    left: 0,
    top: 0,
    bottom: 0,
    background: "#fff",
    borderRight: "1px solid #e5e7eb",
    display: "flex",
    flexDirection: "column",
    zIndex: 10
  },

  logoContainer: {
    height: "85px",
    padding: "0 25px",
    display: "flex",
    alignItems: "center",
    gap: "12px",
    borderBottom: "1px solid #f0f0f0"
  },

  logo: {
    width: "40px",
    height: "40px",
    borderRadius: "10px",
    background:
      "linear-gradient(135deg,#2563eb,#4f46e5)",
    color: "#fff",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: "20px",
    fontWeight: "800"
  },

  logoText: {
    fontSize: "20px",
    fontWeight: "750",
    color: "#111827"
  },

  logoSubtext: {
    fontSize: "10px",
    color: "#9ca3af"
  },

  menu: {
    padding: "25px 15px",
    display: "flex",
    flexDirection: "column",
    gap: "7px"
  },

  menuItem: {
    width: "100%",
    border: "none",
    background: "transparent",
    borderRadius: "9px",
    padding: "13px 15px",
    display: "flex",
    alignItems: "center",
    gap: "12px",
    color: "#6b7280",
    fontSize: "13px",
    cursor: "pointer",
    textAlign: "left"
  },

  activeItem: {
    background: "#eff6ff",
    color: "#2563eb",
    fontWeight: "700"
  },

  badge: {
    marginLeft: "auto",
    minWidth: "20px",
    height: "20px",
    borderRadius: "10px",
    background: "#ef4444",
    color: "#fff",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: "9px",
    fontWeight: "700"
  },

  sidebarBottom: {
    marginTop: "auto",
    padding: "15px",
    borderTop: "1px solid #f0f0f0"
  },

  logout: {
    width: "100%",
    border: "none",
    background: "#fff1f2",
    color: "#e11d48",
    borderRadius: "9px",
    padding: "12px",
    cursor: "pointer",
    fontSize: "13px"
  },

  main: {
    marginLeft: "250px",
    minHeight: "100vh",
    padding: "35px 40px"
  },

  header: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: "25px"
  },

  title: {
    margin: 0,
    fontSize: "28px",
    fontWeight: "750",
    color: "#111827"
  },

  subtitle: {
    margin: "6px 0 0",
    fontSize: "13px",
    color: "#6b7280"
  },

  hrProfile: {
    display: "flex",
    alignItems: "center",
    gap: "10px",
    background: "#fff",
    border: "1px solid #e5e7eb",
    padding: "8px 13px",
    borderRadius: "10px"
  },

  hrAvatar: {
    width: "38px",
    height: "38px",
    borderRadius: "50%",
    background: "#ede9fe",
    color: "#7c3aed",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: "11px",
    fontWeight: "800"
  },

  hrName: {
    fontSize: "11px",
    fontWeight: "700",
    color: "#111827"
  },

  hrRole: {
    fontSize: "9px",
    color: "#9ca3af"
  },

  welcomeCard: {
    background:
      "linear-gradient(135deg,#2563eb,#4f46e5)",
    color: "#fff",
    borderRadius: "15px",
    padding: "28px 30px",
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: "30px"
  },

  welcomeSmall: {
    fontSize: "9px",
    letterSpacing: "1.5px",
    opacity: 0.75,
    fontWeight: "700"
  },

  welcomeTitle: {
    margin: "7px 0 0",
    fontSize: "24px"
  },

  welcomeText: {
    margin: "8px 0 0",
    fontSize: "12px",
    opacity: 0.85
  },

  welcomeIcon: {
    width: "80px",
    height: "80px",
    borderRadius: "20px",
    background:
      "rgba(255,255,255,0.15)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: "38px"
  },

  sectionHeader: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: "13px",
    marginTop: "5px"
  },

  sectionTitle: {
    margin: 0,
    fontSize: "17px",
    fontWeight: "700",
    color: "#111827"
  },

  statsGrid: {
    display: "grid",
    gridTemplateColumns:
      "repeat(4,minmax(0,1fr))",
    gap: "16px",
    marginBottom: "30px"
  },

  statCard: {
    background: "#fff",
    border: "1px solid #e5e7eb",
    borderRadius: "12px",
    padding: "18px",
    display: "flex",
    alignItems: "center",
    gap: "13px",
    cursor: "pointer"
  },

  statIcon: {
    width: "45px",
    height: "45px",
    borderRadius: "11px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: "18px",
    flexShrink: 0
  },

  statLabel: {
    color: "#6b7280",
    fontSize: "10px"
  },

  statValue: {
    color: "#111827",
    fontSize: "23px",
    fontWeight: "750",
    marginTop: "3px"
  },

  statDescription: {
    color: "#9ca3af",
    fontSize: "9px",
    marginTop: "2px"
  },

  actionsGrid: {
    display: "grid",
    gridTemplateColumns:
      "repeat(4,minmax(0,1fr))",
    gap: "16px",
    marginBottom: "30px"
  },

  actionCard: {
    border: "1px solid #e5e7eb",
    background: "#fff",
    borderRadius: "12px",
    padding: "17px",
    display: "flex",
    alignItems: "center",
    gap: "11px",
    cursor: "pointer",
    textAlign: "left"
  },

  actionIcon: {
    width: "40px",
    height: "40px",
    borderRadius: "10px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: "17px"
  },

  actionContent: {
    flex: 1
  },

  actionTitle: {
    fontSize: "11px",
    fontWeight: "700",
    color: "#111827"
  },

  actionText: {
    fontSize: "8px",
    color: "#9ca3af",
    marginTop: "3px"
  },

  arrow: {
    color: "#2563eb",
    fontSize: "16px"
  },

  viewButton: {
    border: "none",
    background: "transparent",
    color: "#2563eb",
    fontSize: "11px",
    cursor: "pointer",
    fontWeight: "650"
  },

  leaveCard: {
    background: "#fff",
    border: "1px solid #e5e7eb",
    borderRadius: "12px",
    overflow: "hidden",
    marginBottom: "30px"
  },

  leaveRow: {
    minHeight: "65px",
    padding: "12px 20px",
    display: "grid",
    gridTemplateColumns:
      "1fr 180px 100px",
    alignItems: "center",
    borderBottom:
      "1px solid #f1f5f9"
  },

  leaveEmployee: {
    display: "flex",
    alignItems: "center",
    gap: "10px"
  },

  leaveAvatar: {
    width: "35px",
    height: "35px",
    borderRadius: "50%",
    background: "#dbeafe",
    color: "#2563eb",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: "12px",
    fontWeight: "750"
  },

  leaveName: {
    fontSize: "11px",
    color: "#111827",
    fontWeight: "650"
  },

  leaveType: {
    fontSize: "9px",
    color: "#9ca3af"
  },

  leaveDate: {
    fontSize: "10px",
    color: "#6b7280"
  },

  status: {
    display: "inline-block",
    padding: "5px 9px",
    borderRadius: "15px",
    fontSize: "9px",
    fontWeight: "700"
  },

  pending: {
    background: "#fef3c7",
    color: "#b45309"
  },

  approved: {
    background: "#dcfce7",
    color: "#15803d"
  },

  rejected: {
    background: "#fee2e2",
    color: "#dc2626"
  },

  emptyState: {
    textAlign: "center",
    padding: "45px 20px",
    color: "#6b7280"
  },

  emptyIcon: {
    fontSize: "35px"
  },

  footer: {
    textAlign: "center",
    color: "#9ca3af",
    fontSize: "9px",
    padding: "15px"
  }
};

export default HRDashboard;