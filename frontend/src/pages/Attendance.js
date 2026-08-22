import React, { useCallback, useEffect, useState } from "react";
import {
  collection,
  getDocs,
  addDoc,
  query,
  where,
} from "firebase/firestore";
import { auth, db } from "../firebase";
import { useNavigate } from "react-router-dom";

function Attendance() {
  const navigate = useNavigate();

  const [employee, setEmployee] = useState(null);
  const [attendance, setAttendance] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [error, setError] = useState("");

  // ============================================================
  // GET TODAY
  // ============================================================

  const getToday = () => {
    const date = new Date();

    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");

    return `${year}-${month}-${day}`;
  };

  // ============================================================
  // LOAD EMPLOYEE
  // ============================================================

  const loadEmployee = useCallback(async () => {
    const currentUser = auth.currentUser;

    if (!currentUser) {
      setError("Please login to view attendance.");
      return null;
    }

    try {
      // --------------------------------------------------------
      // 1. First check users collection using Firebase UID
      // --------------------------------------------------------

      try {
        const userQuery = query(
          collection(db, "users"),
          where("uid", "==", currentUser.uid)
        );

        const userSnapshot = await getDocs(userQuery);

        if (!userSnapshot.empty) {
          const userDoc = userSnapshot.docs[0];

          const userData = {
            id: userDoc.id,
            ...userDoc.data()
          };

          setEmployee(userData);

          return userData;
        }
      } catch (error) {
        console.log("UID user search failed:", error);
      }

      // --------------------------------------------------------
      // 2. Check users document using Firebase UID as ID
      // --------------------------------------------------------

      try {
        const { doc, getDoc } = await import("firebase/firestore");

        const userRef = doc(
          db,
          "users",
          currentUser.uid
        );

        const userSnapshot = await getDoc(userRef);

        if (userSnapshot.exists()) {
          const userData = {
            id: userSnapshot.id,
            ...userSnapshot.data()
          };

          setEmployee(userData);

          return userData;
        }
      } catch (error) {
        console.log("Direct user lookup failed:", error);
      }

      // --------------------------------------------------------
      // 3. Search users collection using email
      // --------------------------------------------------------

      if (currentUser.email) {
        try {
          const emailQuery = query(
            collection(db, "users"),
            where("email", "==", currentUser.email)
          );

          const emailSnapshot = await getDocs(emailQuery);

          if (!emailSnapshot.empty) {
            const userDoc = emailSnapshot.docs[0];

            const userData = {
              id: userDoc.id,
              ...userDoc.data()
            };

            setEmployee(userData);

            return userData;
          }
        } catch (error) {
          console.log("Email user search failed:", error);
        }
      }

      // --------------------------------------------------------
      // 4. Search employees collection using UID
      // --------------------------------------------------------

      try {
        const employeeUidQuery = query(
          collection(db, "employees"),
          where("uid", "==", currentUser.uid)
        );

        const employeeSnapshot = await getDocs(
          employeeUidQuery
        );

        if (!employeeSnapshot.empty) {
          const employeeDoc = employeeSnapshot.docs[0];

          const employeeData = {
            id: employeeDoc.id,
            ...employeeDoc.data()
          };

          setEmployee(employeeData);

          return employeeData;
        }
      } catch (error) {
        console.log(
          "Employee UID search failed:",
          error
        );
      }

      // --------------------------------------------------------
      // 5. Search employees using email
      // --------------------------------------------------------

      if (currentUser.email) {
        try {
          const employeeEmailQuery = query(
            collection(db, "employees"),
            where(
              "email",
              "==",
              currentUser.email
            )
          );

          const employeeSnapshot = await getDocs(
            employeeEmailQuery
          );

          if (!employeeSnapshot.empty) {
            const employeeDoc =
              employeeSnapshot.docs[0];

            const employeeData = {
              id: employeeDoc.id,
              ...employeeDoc.data()
            };

            setEmployee(employeeData);

            return employeeData;
          }
        } catch (error) {
          console.log(
            "Employee email search failed:",
            error
          );
        }
      }

      return null;
    } catch (error) {
      console.error(
        "Employee loading error:",
        error
      );

      return null;
    }
  }, []);

  // ============================================================
  // LOAD ATTENDANCE
  // ============================================================

  const loadAttendance = useCallback(
    async (employeeData) => {
      if (!employeeData) {
        setAttendance([]);
        return;
      }

      try {
        const currentUser = auth.currentUser;

        const employeeIds = [
          employeeData.id,
          employeeData.uid,
          employeeData.employeeId,
          employeeData.empId,
          currentUser?.uid,
          currentUser?.email,
          employeeData.email
        ]
          .filter(Boolean)
          .map(String);

        const snapshot = await getDocs(
          collection(db, "attendance")
        );

        const records = snapshot.docs
          .map((item) => ({
            id: item.id,
            ...item.data()
          }))
          .filter((record) => {
            const recordEmployeeId =
              record.employeeId ??
              record.employeeID ??
              record.empId ??
              record.uid ??
              record.employeeUid ??
              record.userId ??
              record.email;

            if (!recordEmployeeId) {
              return false;
            }

            return employeeIds.includes(
              String(recordEmployeeId)
            );
          });

        // Newest first
        records.sort((a, b) => {
          const dateA =
            String(
              a.date ||
                a.attendanceDate ||
                ""
            );

          const dateB =
            String(
              b.date ||
                b.attendanceDate ||
                ""
            );

          return dateB.localeCompare(dateA);
        });

        setAttendance(records);
      } catch (error) {
        console.error(
          "Attendance loading error:",
          error
        );

        setAttendance([]);
      }
    },
    []
  );

  // ============================================================
  // LOAD ALL DATA
  // ============================================================

  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      setError("");

      const employeeData =
        await loadEmployee();

      if (!employeeData) {
        setError(
          "Your employee account could not be found."
        );
        setLoading(false);
        return;
      }

      await loadAttendance(employeeData);
    } catch (error) {
      console.error(
        "Attendance page error:",
        error
      );

      setError(
        "Unable to load attendance data."
      );
    } finally {
      setLoading(false);
    }
  }, [loadEmployee, loadAttendance]);

  // ============================================================
  // INITIAL LOAD
  // ============================================================

  useEffect(() => {
    loadData();
  }, [loadData]);

  // ============================================================
  // CHECK TODAY'S RECORD
  // ============================================================

  const today = getToday();

  const todayRecord = attendance.find(
    (record) => {
      const recordDate =
        record.date ||
        record.attendanceDate;

      return (
        String(recordDate) ===
        String(today)
      );
    }
  );

  // ============================================================
  // CHECK IN
  // ============================================================

  const handleCheckIn = async () => {
    if (!employee) {
      alert("Employee information not found.");
      return;
    }

    if (todayRecord) {
      alert(
        "You have already marked attendance today."
      );
      return;
    }

    try {
      setActionLoading(true);

      const currentUser = auth.currentUser;

      const now = new Date();

      const time = now.toLocaleTimeString(
        "en-IN",
        {
          hour: "2-digit",
          minute: "2-digit",
          second: "2-digit"
        }
      );

      await addDoc(
        collection(db, "attendance"),
        {
          employeeId:
            employee.id ||
            employee.uid ||
            currentUser?.uid,

          uid:
            employee.uid ||
            currentUser?.uid,

          email:
            employee.email ||
            currentUser?.email ||
            "",

          employeeName:
            employee.name ||
            employee.fullName ||
            employee.employeeName ||
            currentUser?.displayName ||
            currentUser?.email ||
            "Employee",

          date: today,

          checkIn: time,

          checkOut: "",

          status: "Present",

          createdAt: new Date()
        }
      );

      alert(
        "Attendance marked successfully."
      );

      await loadData();
    } catch (error) {
      console.error(
        "Check-in error:",
        error
      );

      alert(
        "Unable to mark attendance."
      );
    } finally {
      setActionLoading(false);
    }
  };

  // ============================================================
  // LOGOUT
  // ============================================================

  const handleLogout = async () => {
    try {
      await auth.signOut();

      localStorage.removeItem("user");

      navigate("/login");
    } catch (error) {
      console.error(
        "Logout error:",
        error
      );
    }
  };

  // ============================================================
  // EMPLOYEE NAME
  // ============================================================

  const employeeName =
    employee?.name ||
    employee?.fullName ||
    employee?.employeeName ||
    auth.currentUser?.displayName ||
    auth.currentUser?.email ||
    "Employee";

  // ============================================================
  // STATISTICS
  // ============================================================

  const presentCount =
    attendance.filter(
      (item) =>
        String(
          item.status || ""
        ).toLowerCase() ===
        "present"
    ).length;

  const absentCount =
    attendance.filter(
      (item) =>
        String(
          item.status || ""
        ).toLowerCase() ===
        "absent"
    ).length;

  const leaveCount =
    attendance.filter(
      (item) =>
        String(
          item.status || ""
        ).toLowerCase() ===
        "leave"
    ).length;

  // ============================================================
  // LOADING
  // ============================================================

  if (loading) {
    return (
      <div style={styles.loadingPage}>
        <div style={styles.spinner}></div>

        <p>
          Loading attendance...
        </p>
      </div>
    );
  }

  // ============================================================
  // ERROR
  // ============================================================

  if (error) {
    return (
      <div style={styles.page}>
        <div style={styles.errorCard}>
          <h2>
            Employee Not Found
          </h2>

          <p>
            {error}
          </p>

          <button
            style={styles.logoutButton}
            onClick={handleLogout}
          >
            Logout
          </button>
        </div>
      </div>
    );
  }

  // ============================================================
  // MAIN PAGE
  // ============================================================

  return (
    <div style={styles.page}>

      {/* SIDEBAR */}

      <aside style={styles.sidebar}>

        <div>

          <div style={styles.logoArea}>

            <div style={styles.logoIcon}>
              D
            </div>

            <div>
              <h2 style={styles.logo}>
                Dayflow
              </h2>

              <p style={styles.logoSubtitle}>
                Employee Portal
              </p>
            </div>

          </div>

          <nav style={styles.navigation}>

            <button
              style={styles.navButton}
              onClick={() =>
                navigate("/dashboard")
              }
            >
              🏠 Dashboard
            </button>

            <button
              style={{
                ...styles.navButton,
                ...styles.activeNavButton
              }}
              onClick={() =>
                navigate("/attendance")
              }
            >
              📊 Attendance
            </button>

            <button
              style={styles.navButton}
              onClick={() =>
                navigate("/leave")
              }
            >
              📅 Leave
            </button>

            <button
              style={styles.navButton}
              onClick={() =>
                navigate("/payroll")
              }
            >
              💰 Payroll
            </button>

          </nav>

        </div>

        <button
          style={styles.sidebarLogout}
          onClick={handleLogout}
        >
          🚪 Logout
        </button>

      </aside>

      {/* MAIN */}

      <main style={styles.main}>

        {/* HEADER */}

        <div style={styles.header}>

          <div>

            <p style={styles.smallHeading}>
              DAYFLOW HRMS
            </p>

            <h1 style={styles.title}>
              Attendance
            </h1>

            <p style={styles.subtitle}>
              Track your daily attendance
              and working status.
            </p>

          </div>

          <div style={styles.profile}>

            <div style={styles.profileCircle}>
              {employeeName
                .charAt(0)
                .toUpperCase()}
            </div>

            <div>
              <strong>
                {employeeName}
              </strong>

              <p style={styles.profileEmail}>
                {employee?.email ||
                  auth.currentUser?.email ||
                  ""}
              </p>
            </div>

          </div>

        </div>

        {/* TODAY CARD */}

        <section style={styles.todayCard}>

          <div>

            <p style={styles.cardLabel}>
              TODAY
            </p>

            <h2 style={styles.todayDate}>
              {new Date().toLocaleDateString(
                "en-IN",
                {
                  day: "2-digit",
                  month: "long",
                  year: "numeric"
                }
              )}
            </h2>

            <p style={styles.todayStatus}>

              {todayRecord
                ? `Status: ${
                    todayRecord.status ||
                    "Present"
                  }`
                : "Attendance not marked yet"}

            </p>

          </div>

          <div style={styles.actionArea}>

            {todayRecord ? (

              <div style={styles.markedBadge}>
                ✓ Attendance Marked
              </div>

            ) : (

              <button
                style={styles.checkInButton}
                onClick={handleCheckIn}
                disabled={actionLoading}
              >
                {actionLoading
                  ? "Marking..."
                  : "✓ Check In"}
              </button>

            )}

          </div>

        </section>

        {/* STATISTICS */}

        <section style={styles.statsGrid}>

          <div style={styles.statCard}>

            <div style={styles.statIconBlue}>
              📊
            </div>

            <div>

              <p style={styles.statLabel}>
                Total Records
              </p>

              <h2 style={styles.statNumber}>
                {attendance.length}
              </h2>

            </div>

          </div>

          <div style={styles.statCard}>

            <div style={styles.statIconGreen}>
              ✓
            </div>

            <div>

              <p style={styles.statLabel}>
                Present
              </p>

              <h2 style={styles.statNumber}>
                {presentCount}
              </h2>

            </div>

          </div>

          <div style={styles.statCard}>

            <div style={styles.statIconRed}>
              !
            </div>

            <div>

              <p style={styles.statLabel}>
                Absent
              </p>

              <h2 style={styles.statNumber}>
                {absentCount}
              </h2>

            </div>

          </div>

          <div style={styles.statCard}>

            <div style={styles.statIconYellow}>
              📅
            </div>

            <div>

              <p style={styles.statLabel}>
                Leave
              </p>

              <h2 style={styles.statNumber}>
                {leaveCount}
              </h2>

            </div>

          </div>

        </section>

        {/* ATTENDANCE TABLE */}

        <section style={styles.tableCard}>

          <div style={styles.tableHeader}>

            <div>

              <h2 style={styles.tableTitle}>
                My Attendance
              </h2>

              <p style={styles.tableSubtitle}>
                Your attendance history
              </p>

            </div>

            <button
              style={styles.refreshButton}
              onClick={loadData}
            >
              ↻ Refresh
            </button>

          </div>

          {attendance.length === 0 ? (

            <div style={styles.emptyState}>

              <div style={styles.emptyIcon}>
                📊
              </div>

              <h3>
                No attendance records
              </h3>

              <p>
                Your attendance records
                will appear here.
              </p>

            </div>

          ) : (

            <div style={styles.tableWrapper}>

              <table style={styles.table}>

                <thead>

                  <tr>

                    <th style={styles.th}>
                      Date
                    </th>

                    <th style={styles.th}>
                      Check In
                    </th>

                    <th style={styles.th}>
                      Check Out
                    </th>

                    <th style={styles.th}>
                      Status
                    </th>

                  </tr>

                </thead>

                <tbody>

                  {attendance.map(
                    (record) => {

                      const status =
                        record.status ||
                        "Present";

                      return (

                        <tr key={record.id}>

                          <td style={styles.td}>
                            {record.date ||
                              record.attendanceDate ||
                              "-"}
                          </td>

                          <td style={styles.td}>
                            {record.checkIn ||
                              record.checkInTime ||
                              "-"}
                          </td>

                          <td style={styles.td}>
                            {record.checkOut ||
                              record.checkOutTime ||
                              "-"}
                          </td>

                          <td style={styles.td}>

                            <span
                              style={{
                                ...styles.statusBadge,
                                ...(String(
                                  status
                                ).toLowerCase() ===
                                "present"
                                  ? styles.presentBadge
                                  : String(
                                      status
                                    ).toLowerCase() ===
                                    "absent"
                                  ? styles.absentBadge
                                  : styles.leaveBadge)
                              }}
                            >
                              {status}
                            </span>

                          </td>

                        </tr>

                      );
                    }
                  )}

                </tbody>

              </table>

            </div>

          )}

        </section>

      </main>

    </div>
  );
}

// ============================================================
// STYLES
// ============================================================

const styles = {

  page: {
    minHeight: "100vh",
    background: "#f4f7fb",
    display: "flex",
    fontFamily:
      "Arial, Helvetica, sans-serif",
    color: "#10233f"
  },

  sidebar: {
    width: "260px",
    minHeight: "100vh",
    background: "#07101f",
    color: "#ffffff",
    display: "flex",
    flexDirection: "column",
    justifyContent: "space-between",
    padding: "28px 18px",
    boxSizing: "border-box",
    position: "fixed",
    left: 0,
    top: 0,
    bottom: 0
  },

  logoArea: {
    display: "flex",
    alignItems: "center",
    gap: "14px",
    padding: "5px 10px 35px"
  },

  logoIcon: {
    width: "48px",
    height: "48px",
    borderRadius: "13px",
    background: "#315bea",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: "25px",
    fontWeight: "bold"
  },

  logo: {
    margin: 0,
    fontSize: "23px"
  },

  logoSubtitle: {
    margin: "3px 0 0",
    color: "#94a3b8",
    fontSize: "13px"
  },

  navigation: {
    display: "flex",
    flexDirection: "column",
    gap: "8px"
  },

  navButton: {
    width: "100%",
    padding: "15px 18px",
    border: "none",
    borderRadius: "11px",
    background: "transparent",
    color: "#cbd5e1",
    textAlign: "left",
    fontSize: "16px",
    cursor: "pointer"
  },

  activeNavButton: {
    background: "#e9f1ff",
    color: "#2459db",
    fontWeight: "600"
  },

  sidebarLogout: {
    width: "100%",
    padding: "14px",
    border: "none",
    borderRadius: "10px",
    background: "#171321",
    color: "#f87171",
    fontSize: "15px",
    cursor: "pointer"
  },

  main: {
    marginLeft: "260px",
    width: "calc(100% - 260px)",
    padding: "45px 50px",
    boxSizing: "border-box"
  },

  header: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "30px"
  },

  smallHeading: {
    color: "#35229a",
    fontWeight: "700",
    letterSpacing: "3px",
    fontSize: "13px",
    margin: "0 0 10px"
  },

  title: {
    fontSize: "44px",
    margin: 0,
    color: "#071a35"
  },

  subtitle: {
    margin: "8px 0 0",
    color: "#64748b",
    fontSize: "17px"
  },

  profile: {
    display: "flex",
    alignItems: "center",
    gap: "12px",
    background: "#ffffff",
    padding: "10px 18px",
    borderRadius: "13px",
    boxShadow:
      "0 3px 15px rgba(15,23,42,0.06)"
  },

  profileCircle: {
    width: "42px",
    height: "42px",
    borderRadius: "50%",
    background: "#dbeafe",
    color: "#2563eb",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontWeight: "bold",
    fontSize: "17px"
  },

  profileEmail: {
    margin: "3px 0 0",
    color: "#94a3b8",
    fontSize: "12px"
  },

  todayCard: {
    background:
      "linear-gradient(110deg,#2563eb,#4f46e5)",
    borderRadius: "18px",
    padding: "30px 35px",
    color: "#ffffff",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "25px",
    boxShadow:
      "0 10px 30px rgba(37,99,235,0.18)"
  },

  cardLabel: {
    margin: 0,
    fontSize: "12px",
    fontWeight: "700",
    letterSpacing: "2px",
    opacity: 0.8
  },

  todayDate: {
    margin: "8px 0",
    fontSize: "27px"
  },

  todayStatus: {
    margin: 0,
    opacity: 0.9
  },

  actionArea: {
    display: "flex",
    alignItems: "center"
  },

  checkInButton: {
    border: "none",
    background: "#ffffff",
    color: "#2459db",
    padding: "14px 25px",
    borderRadius: "10px",
    fontWeight: "700",
    fontSize: "15px",
    cursor: "pointer"
  },

  markedBadge: {
    background: "#dcfce7",
    color: "#15803d",
    padding: "13px 20px",
    borderRadius: "10px",
    fontWeight: "700"
  },

  statsGrid: {
    display: "grid",
    gridTemplateColumns:
      "repeat(4, minmax(0, 1fr))",
    gap: "20px",
    marginBottom: "25px"
  },

  statCard: {
    background: "#ffffff",
    borderRadius: "15px",
    padding: "22px",
    display: "flex",
    alignItems: "center",
    gap: "15px",
    boxShadow:
      "0 4px 18px rgba(15,23,42,0.05)"
  },

  statIconBlue: {
    width: "52px",
    height: "52px",
    borderRadius: "13px",
    background: "#dbeafe",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: "23px"
  },

  statIconGreen: {
    width: "52px",
    height: "52px",
    borderRadius: "13px",
    background: "#dcfce7",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    color: "#16a34a",
    fontSize: "24px"
  },

  statIconRed: {
    width: "52px",
    height: "52px",
    borderRadius: "13px",
    background: "#fee2e2",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    color: "#dc2626",
    fontSize: "24px"
  },

  statIconYellow: {
    width: "52px",
    height: "52px",
    borderRadius: "13px",
    background: "#fef3c7",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: "23px"
  },

  statLabel: {
    margin: 0,
    color: "#64748b",
    fontSize: "13px"
  },

  statNumber: {
    margin: "5px 0 0",
    fontSize: "27px",
    color: "#0f172a"
  },

  tableCard: {
    background: "#ffffff",
    borderRadius: "18px",
    boxShadow:
      "0 4px 18px rgba(15,23,42,0.05)",
    overflow: "hidden"
  },

  tableHeader: {
    padding: "25px 28px",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    borderBottom:
      "1px solid #e2e8f0"
  },

  tableTitle: {
    margin: 0,
    fontSize: "22px"
  },

  tableSubtitle: {
    margin: "5px 0 0",
    color: "#94a3b8"
  },

  refreshButton: {
    background: "#ffffff",
    border: "1px solid #cbd5e1",
    padding: "10px 17px",
    borderRadius: "9px",
    cursor: "pointer",
    color: "#334155",
    fontWeight: "600"
  },

  tableWrapper: {
    width: "100%",
    overflowX: "auto"
  },

  table: {
    width: "100%",
    borderCollapse: "collapse"
  },

  th: {
    textAlign: "left",
    padding: "17px 25px",
    background: "#f8fafc",
    color: "#64748b",
    fontSize: "13px",
    fontWeight: "600"
  },

  td: {
    padding: "18px 25px",
    borderTop:
      "1px solid #eef2f7",
    color: "#334155",
    fontSize: "14px"
  },

  statusBadge: {
    display: "inline-block",
    padding: "6px 12px",
    borderRadius: "20px",
    fontSize: "12px",
    fontWeight: "700"
  },

  presentBadge: {
    background: "#dcfce7",
    color: "#15803d"
  },

  absentBadge: {
    background: "#fee2e2",
    color: "#b91c1c"
  },

  leaveBadge: {
    background: "#fef3c7",
    color: "#a16207"
  },

  emptyState: {
    textAlign: "center",
    padding: "65px 20px",
    color: "#64748b"
  },

  emptyIcon: {
    fontSize: "42px",
    marginBottom: "10px"
  },

  loadingPage: {
    minHeight: "100vh",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    background: "#f4f7fb",
    color: "#475569"
  },

  spinner: {
    width: "38px",
    height: "38px",
    borderRadius: "50%",
    border:
      "4px solid #e2e8f0",
    borderTop:
      "4px solid #315bea",
    animation:
      "spin 1s linear infinite",
    marginBottom: "15px"
  },

  errorCard: {
    width: "min(650px, 90%)",
    margin: "120px auto",
    background: "#ffffff",
    padding: "55px",
    borderRadius: "18px",
    textAlign: "center",
    boxShadow:
      "0 8px 30px rgba(15,23,42,0.08)"
  },

  logoutButton: {
    marginTop: "20px",
    border: "none",
    background: "#ef4444",
    color: "#ffffff",
    padding: "12px 25px",
    borderRadius: "9px",
    fontWeight: "700",
    cursor: "pointer"
  }
};

export default Attendance;