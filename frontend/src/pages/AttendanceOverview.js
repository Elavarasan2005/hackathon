import React, {
  useCallback,
  useEffect,
  useMemo,
  useState
} from "react";

import {
  collection,
  getDocs,
  query,
  orderBy
} from "firebase/firestore";

import { db } from "../firebase";

function AttendanceOverview() {
  const [employees, setEmployees] = useState([]);
  const [attendance, setAttendance] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [selectedDate, setSelectedDate] = useState(
    new Date().toISOString().split("T")[0]
  );

  // ============================================================
  // LOAD EMPLOYEES
  // ============================================================

  const loadEmployees = useCallback(async () => {
    try {
      const snapshot = await getDocs(collection(db, "employees"));

      const employeeList = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data()
      }));

      setEmployees(employeeList);
    } catch (error) {
      console.error("Error loading employees:", error);
      setEmployees([]);
    }
  }, []);

  // ============================================================
  // LOAD ATTENDANCE
  // ============================================================

  const loadAttendance = useCallback(async () => {
    try {
      const attendanceQuery = query(
        collection(db, "attendance"),
        orderBy("date", "desc")
      );

      const snapshot = await getDocs(attendanceQuery);

      const attendanceList = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data()
      }));

      setAttendance(attendanceList);
    } catch (error) {
      console.error("Error loading attendance:", error);

      // Fallback without orderBy
      try {
        const snapshot = await getDocs(
          collection(db, "attendance")
        );

        const attendanceList = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data()
        }));

        setAttendance(attendanceList);
      } catch (secondError) {
        console.error(
          "Unable to load attendance:",
          secondError
        );

        setAttendance([]);
      }
    }
  }, []);

  // ============================================================
  // LOAD ALL DATA
  // ============================================================

  const loadData = useCallback(async () => {
    setLoading(true);

    await Promise.all([
      loadEmployees(),
      loadAttendance()
    ]);

    setLoading(false);
  }, [loadEmployees, loadAttendance]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // ============================================================
  // GET ATTENDANCE FOR EMPLOYEE
  // ============================================================

  const getAttendanceForEmployee = useCallback(
    (employee) => {
      return attendance.find((record) => {
        const employeeId =
          record.employeeId ||
          record.employeeID ||
          record.empId ||
          record.employee;

        const recordDate =
          record.date ||
          record.attendanceDate;

        return (
          String(employeeId) === String(employee.id) &&
          String(recordDate) === String(selectedDate)
        );
      });
    },
    [attendance, selectedDate]
  );

  // ============================================================
  // FILTER EMPLOYEES
  // ============================================================

  const filteredEmployees = useMemo(() => {
    const searchText = search.trim().toLowerCase();

    if (!searchText) {
      return employees;
    }

    return employees.filter((employee) => {
      const name =
        employee.name ||
        employee.fullName ||
        employee.employeeName ||
        "";

      const email = employee.email || "";

      const employeeId =
        employee.employeeId ||
        employee.empId ||
        employee.id ||
        "";

      const department =
        employee.department || "";

      return (
        String(name).toLowerCase().includes(searchText) ||
        String(email).toLowerCase().includes(searchText) ||
        String(employeeId).toLowerCase().includes(searchText) ||
        String(department).toLowerCase().includes(searchText)
      );
    });
  }, [employees, search]);

  // ============================================================
  // ATTENDANCE STATISTICS
  // ============================================================

  const statistics = useMemo(() => {
    let present = 0;
    let absent = 0;
    let leave = 0;
    let notMarked = 0;

    employees.forEach((employee) => {
      const record = getAttendanceForEmployee(employee);

      if (!record) {
        notMarked++;
        return;
      }

      const status = String(
        record.status || ""
      ).toLowerCase();

      if (
        status === "present" ||
        status === "p" ||
        status === "checked-in" ||
        status === "check-in"
      ) {
        present++;
      } else if (
        status === "absent" ||
        status === "a"
      ) {
        absent++;
      } else if (
        status === "leave" ||
        status === "on leave"
      ) {
        leave++;
      } else {
        notMarked++;
      }
    });

    return {
      total: employees.length,
      present,
      absent,
      leave,
      notMarked
    };
  }, [employees, getAttendanceForEmployee]);

  // ============================================================
  // GET EMPLOYEE DISPLAY NAME
  // ============================================================

  const displayName = (employee) => {
    return (
      employee.name ||
      employee.fullName ||
      employee.employeeName ||
      "Unknown Employee"
    );
  };

  // ============================================================
  // GET EMPLOYEE ID
  // ============================================================

  const displayEmployeeId = (employee) => {
    return (
      employee.employeeId ||
      employee.empId ||
      employee.id ||
      "-"
    );
  };

  // ============================================================
  // GET STATUS
  // ============================================================

  const getStatus = (employee) => {
    const record = getAttendanceForEmployee(employee);

    if (!record) {
      return "Not Marked";
    }

    return record.status || "Not Marked";
  };

  // ============================================================
  // STATUS STYLE
  // ============================================================

  const getStatusStyle = (status) => {
    const value = String(status).toLowerCase();

    if (
      value === "present" ||
      value === "p" ||
      value === "checked-in" ||
      value === "check-in"
    ) {
      return styles.present;
    }

    if (
      value === "absent" ||
      value === "a"
    ) {
      return styles.absent;
    }

    if (
      value === "leave" ||
      value === "on leave"
    ) {
      return styles.leave;
    }

    return styles.notMarked;
  };

  // ============================================================
  // TIME FORMAT
  // ============================================================

  const getTime = (employee) => {
    const record = getAttendanceForEmployee(employee);

    if (!record) {
      return "-";
    }

    return (
      record.checkIn ||
      record.checkInTime ||
      record.inTime ||
      "-"
    );
  };

  // ============================================================
  // UI
  // ============================================================

  return (
    <div style={styles.page}>

      {/* HEADER */}
      <div style={styles.header}>
        <div>
          <p style={styles.smallTitle}>
            DAYFLOW HRMS
          </p>

          <h1 style={styles.title}>
            Attendance Overview
          </h1>

          <p style={styles.subtitle}>
            Monitor employee attendance and daily status.
          </p>
        </div>

        <button
          style={styles.refreshButton}
          onClick={loadData}
        >
          ↻ Refresh
        </button>
      </div>

      {/* STATISTICS */}
      <div style={styles.statsGrid}>

        <div style={styles.statCard}>
          <div
            style={{
              ...styles.iconBox,
              ...styles.purple
            }}
          >
            👥
          </div>

          <div>
            <p style={styles.statLabel}>
              Total Employees
            </p>

            <h2 style={styles.statValue}>
              {statistics.total}
            </h2>
          </div>
        </div>

        <div style={styles.statCard}>
          <div
            style={{
              ...styles.iconBox,
              ...styles.green
            }}
          >
            ✓
          </div>

          <div>
            <p style={styles.statLabel}>
              Present Today
            </p>

            <h2 style={styles.statValue}>
              {statistics.present}
            </h2>
          </div>
        </div>

        <div style={styles.statCard}>
          <div
            style={{
              ...styles.iconBox,
              ...styles.red
            }}
          >
            !
          </div>

          <div>
            <p style={styles.statLabel}>
              Absent
            </p>

            <h2 style={styles.statValue}>
              {statistics.absent}
            </h2>
          </div>
        </div>

        <div style={styles.statCard}>
          <div
            style={{
              ...styles.iconBox,
              ...styles.yellow
            }}
          >
            📅
          </div>

          <div>
            <p style={styles.statLabel}>
              On Leave
            </p>

            <h2 style={styles.statValue}>
              {statistics.leave}
            </h2>
          </div>
        </div>

      </div>

      {/* FILTER SECTION */}
      <div style={styles.filterCard}>

        <div style={styles.searchContainer}>
          <span style={styles.searchIcon}>
            🔍
          </span>

          <input
            type="text"
            placeholder="Search employee..."
            value={search}
            onChange={(e) =>
              setSearch(e.target.value)
            }
            style={styles.searchInput}
          />
        </div>

        <div style={styles.dateContainer}>
          <label style={styles.dateLabel}>
            Date
          </label>

          <input
            type="date"
            value={selectedDate}
            onChange={(e) =>
              setSelectedDate(e.target.value)
            }
            style={styles.dateInput}
          />
        </div>

      </div>

      {/* TABLE */}
      <div style={styles.tableCard}>

        <div style={styles.tableHeader}>
          <div>
            <h2 style={styles.tableTitle}>
              Employee Attendance
            </h2>

            <p style={styles.tableSubtitle}>
              {filteredEmployees.length} employees found
            </p>
          </div>
        </div>

        {loading ? (

          <div style={styles.loading}>
            <div style={styles.spinner}></div>

            <p>
              Loading attendance...
            </p>
          </div>

        ) : filteredEmployees.length === 0 ? (

          <div style={styles.empty}>
            <div style={styles.emptyIcon}>
              👥
            </div>

            <h3>
              No employees found
            </h3>

            <p>
              There are no employees matching your search.
            </p>
          </div>

        ) : (

          <div style={styles.tableWrapper}>

            <table style={styles.table}>

              <thead>
                <tr>

                  <th style={styles.th}>
                    Employee
                  </th>

                  <th style={styles.th}>
                    Employee ID
                  </th>

                  <th style={styles.th}>
                    Department
                  </th>

                  <th style={styles.th}>
                    Date
                  </th>

                  <th style={styles.th}>
                    Check In
                  </th>

                  <th style={styles.th}>
                    Status
                  </th>

                </tr>
              </thead>

              <tbody>

                {filteredEmployees.map((employee) => {

                  const status =
                    getStatus(employee);

                  return (
                    <tr
                      key={employee.id}
                      style={styles.tr}
                    >

                      <td style={styles.td}>

                        <div style={styles.employeeCell}>

                          <div style={styles.avatar}>
                            {displayName(employee)
                              .charAt(0)
                              .toUpperCase()}
                          </div>

                          <div>
                            <strong
                              style={
                                styles.employeeName
                              }
                            >
                              {displayName(employee)}
                            </strong>

                            <p
                              style={
                                styles.employeeEmail
                              }
                            >
                              {employee.email || "-"}
                            </p>
                          </div>

                        </div>

                      </td>

                      <td style={styles.td}>
                        {displayEmployeeId(employee)}
                      </td>

                      <td style={styles.td}>
                        {employee.department ||
                          "Not Assigned"}
                      </td>

                      <td style={styles.td}>
                        {selectedDate}
                      </td>

                      <td style={styles.td}>
                        {getTime(employee)}
                      </td>

                      <td style={styles.td}>

                        <span
                          style={{
                            ...styles.status,
                            ...getStatusStyle(status)
                          }}
                        >
                          {status}
                        </span>

                      </td>

                    </tr>
                  );
                })}

              </tbody>

            </table>

          </div>

        )}

      </div>

    </div>
  );
}

// ============================================================
// STYLES
// ============================================================

const styles = {

  page: {
    minHeight: "100vh",
    background: "#f5f7fb",
    padding: "40px 50px",
    boxSizing: "border-box",
    fontFamily:
      "-apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
    color: "#172033"
  },

  header: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: "35px"
  },

  smallTitle: {
    margin: "0 0 10px",
    color: "#5542e8",
    fontSize: "14px",
    fontWeight: "800",
    letterSpacing: "3px"
  },

  title: {
    margin: "0",
    fontSize: "42px",
    fontWeight: "800",
    color: "#101828"
  },

  subtitle: {
    marginTop: "8px",
    color: "#667085",
    fontSize: "17px"
  },

  refreshButton: {
    border: "1px solid #d0d5dd",
    background: "#ffffff",
    borderRadius: "12px",
    padding: "13px 20px",
    fontSize: "15px",
    fontWeight: "600",
    cursor: "pointer",
    color: "#344054"
  },

  statsGrid: {
    display: "grid",
    gridTemplateColumns:
      "repeat(4, minmax(0, 1fr))",
    gap: "22px",
    marginBottom: "30px"
  },

  statCard: {
    background: "#ffffff",
    borderRadius: "18px",
    padding: "25px",
    display: "flex",
    alignItems: "center",
    gap: "20px",
    boxShadow:
      "0 5px 20px rgba(16, 24, 40, 0.06)"
  },

  iconBox: {
    width: "60px",
    height: "60px",
    borderRadius: "16px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: "25px",
    flexShrink: 0
  },

  purple: {
    background: "#eee9ff",
    color: "#5535d8"
  },

  green: {
    background: "#dcfae6",
    color: "#039855"
  },

  red: {
    background: "#fee4e2",
    color: "#d92d20"
  },

  yellow: {
    background: "#fff4cc",
    color: "#b54708"
  },

  statLabel: {
    margin: "0 0 6px",
    color: "#667085",
    fontSize: "14px",
    fontWeight: "600"
  },

  statValue: {
    margin: 0,
    fontSize: "28px",
    color: "#101828"
  },

  filterCard: {
    background: "#ffffff",
    borderRadius: "18px",
    padding: "20px",
    marginBottom: "28px",
    display: "flex",
    gap: "18px",
    alignItems: "center",
    boxShadow:
      "0 5px 20px rgba(16, 24, 40, 0.05)"
  },

  searchContainer: {
    flex: 1,
    position: "relative"
  },

  searchIcon: {
    position: "absolute",
    left: "17px",
    top: "13px",
    fontSize: "18px"
  },

  searchInput: {
    width: "100%",
    height: "48px",
    boxSizing: "border-box",
    border: "1px solid #d0d5dd",
    borderRadius: "12px",
    padding:
      "0 15px 0 45px",
    fontSize: "15px",
    outline: "none"
  },

  dateContainer: {
    display: "flex",
    alignItems: "center",
    gap: "10px"
  },

  dateLabel: {
    fontWeight: "600",
    color: "#344054"
  },

  dateInput: {
    height: "48px",
    border: "1px solid #d0d5dd",
    borderRadius: "12px",
    padding: "0 12px",
    fontSize: "14px",
    color: "#344054"
  },

  tableCard: {
    background: "#ffffff",
    borderRadius: "18px",
    overflow: "hidden",
    boxShadow:
      "0 5px 20px rgba(16, 24, 40, 0.05)"
  },

  tableHeader: {
    padding: "25px 30px",
    borderBottom:
      "1px solid #eaecf0"
  },

  tableTitle: {
    margin: 0,
    fontSize: "22px",
    color: "#101828"
  },

  tableSubtitle: {
    margin: "6px 0 0",
    color: "#667085",
    fontSize: "14px"
  },

  tableWrapper: {
    width: "100%",
    overflowX: "auto"
  },

  table: {
    width: "100%",
    borderCollapse: "collapse",
    minWidth: "900px"
  },

  th: {
    textAlign: "left",
    padding: "16px 20px",
    background: "#f9fafb",
    color: "#475467",
    fontSize: "13px",
    fontWeight: "700",
    borderBottom:
      "1px solid #eaecf0"
  },

  tr: {
    borderBottom:
      "1px solid #eaecf0"
  },

  td: {
    padding: "18px 20px",
    color: "#344054",
    fontSize: "14px"
  },

  employeeCell: {
    display: "flex",
    alignItems: "center",
    gap: "12px"
  },

  avatar: {
    width: "42px",
    height: "42px",
    borderRadius: "50%",
    background:
      "linear-gradient(135deg, #5542e8, #7c3aed)",
    color: "#ffffff",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontWeight: "700"
  },

  employeeName: {
    color: "#101828",
    fontSize: "14px"
  },

  employeeEmail: {
    margin: "4px 0 0",
    color: "#667085",
    fontSize: "12px"
  },

  status: {
    display: "inline-block",
    padding: "6px 12px",
    borderRadius: "20px",
    fontSize: "12px",
    fontWeight: "700"
  },

  present: {
    background: "#dcfae6",
    color: "#027a48"
  },

  absent: {
    background: "#fee4e2",
    color: "#b42318"
  },

  leave: {
    background: "#fff4cc",
    color: "#b54708"
  },

  notMarked: {
    background: "#f2f4f7",
    color: "#667085"
  },

  loading: {
    minHeight: "300px",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    color: "#667085"
  },

  spinner: {
    width: "40px",
    height: "40px",
    border:
      "4px solid #e4e7ec",
    borderTop:
      "4px solid #5542e8",
    borderRadius: "50%",
    marginBottom: "15px",
    animation:
      "spin 1s linear infinite"
  },

  empty: {
    minHeight: "300px",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    color: "#667085"
  },

  emptyIcon: {
    fontSize: "45px",
    marginBottom: "10px"
  }
};

export default AttendanceOverview;