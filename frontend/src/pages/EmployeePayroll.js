import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import {
  doc,
  getDoc
} from "firebase/firestore";

import { db } from "../firebase";

function EmployeePayroll() {

  const navigate = useNavigate();

  const [employee, setEmployee] = useState(null);
  const [payroll, setPayroll] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {

    const loadPayroll = async () => {

      try {

        const savedUser =
          localStorage.getItem("user");

        if (!savedUser) {
          navigate("/login");
          return;
        }

        const user =
          JSON.parse(savedUser);

        setEmployee(user);

        const payrollRef =
          doc(
            db,
            "payroll",
            user.uid || user.id
          );

        const payrollSnapshot =
          await getDoc(payrollRef);

        if (payrollSnapshot.exists()) {

          setPayroll(
            payrollSnapshot.data()
          );

        } else {

          setPayroll(null);

        }

      } catch (error) {

        console.error(
          "Error loading payroll:",
          error
        );

      } finally {

        setLoading(false);

      }

    };

    loadPayroll();

  }, [navigate]);


  const logout = () => {

    localStorage.removeItem("user");

    navigate(
      "/login",
      {
        replace: true
      }
    );

  };


  if (loading) {

    return (
      <div style={styles.loading}>
        Loading payroll...
      </div>
    );

  }


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
              Employee Portal
            </div>

          </div>

        </div>


        <div style={styles.menu}>

          <button
            style={styles.menuItem}
            onClick={() =>
              navigate("/dashboard")
            }
          >
            🏠 Dashboard
          </button>


          <button
            style={styles.menuItem}
            onClick={() =>
              navigate("/attendance")
            }
          >
            📊 Attendance
          </button>


          <button
            style={styles.menuItem}
            onClick={() =>
              navigate("/leave")
            }
          >
            🗓️ Leave
          </button>


          <button
            style={{
              ...styles.menuItem,
              ...styles.active
            }}
          >
            💰 Payroll
          </button>

        </div>


        <div style={styles.bottom}>

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

        <div style={styles.header}>

          <h1 style={styles.title}>
            My Payroll
          </h1>

          <p style={styles.subtitle}>
            View your salary and payroll details
          </p>

        </div>


        {payroll ? (

          <>

            {/* PROFILE */}

            <div style={styles.profile}>

              <div style={styles.avatar}>
                {(employee?.name || "E")
                  .charAt(0)
                  .toUpperCase()}
              </div>

              <div>

                <h2 style={styles.name}>
                  {payroll.employeeName ||
                    employee?.name ||
                    "Employee"}
                </h2>

                <p style={styles.employeeId}>
                  Employee ID:{" "}
                  {payroll.employeeId ||
                    employee?.employeeId ||
                    "-"}
                </p>

              </div>

            </div>


            {/* MONTH */}

            <div style={styles.monthCard}>

              <div>

                <div style={styles.monthLabel}>
                  Payroll Period
                </div>

                <div style={styles.month}>
                  {payroll.month ||
                    "Current Month"}
                </div>

              </div>

              <div style={styles.processed}>
                ✓ Processed
              </div>

            </div>


            {/* SALARY CARDS */}

            <div style={styles.cards}>

              <div style={styles.card}>

                <div style={styles.icon}>
                  ₹
                </div>

                <div>

                  <div style={styles.label}>
                    Basic Salary
                  </div>

                  <div style={styles.value}>
                    ₹
                    {Number(
                      payroll.basicSalary || 0
                    ).toLocaleString("en-IN")}
                  </div>

                </div>

              </div>


              <div style={styles.card}>

                <div
                  style={{
                    ...styles.icon,
                    background: "#dcfce7",
                    color: "#15803d"
                  }}
                >
                  +
                </div>

                <div>

                  <div style={styles.label}>
                    Allowances
                  </div>

                  <div style={styles.value}>
                    ₹
                    {Number(
                      payroll.allowances || 0
                    ).toLocaleString("en-IN")}
                  </div>

                </div>

              </div>


              <div style={styles.card}>

                <div
                  style={{
                    ...styles.icon,
                    background: "#fee2e2",
                    color: "#dc2626"
                  }}
                >
                  -
                </div>

                <div>

                  <div style={styles.label}>
                    Deductions
                  </div>

                  <div style={styles.value}>
                    ₹
                    {Number(
                      payroll.deductions || 0
                    ).toLocaleString("en-IN")}
                  </div>

                </div>

              </div>

            </div>


            {/* NET SALARY */}

            <div style={styles.netCard}>

              <div>

                <div style={styles.netLabel}>
                  Net Salary
                </div>

                <div style={styles.netDescription}>
                  Amount payable after deductions
                </div>

              </div>

              <div style={styles.netSalary}>
                ₹
                {Number(
                  payroll.netSalary || 0
                ).toLocaleString("en-IN")}
              </div>

            </div>


            {/* BREAKDOWN */}

            <div style={styles.breakdown}>

              <h2 style={styles.sectionTitle}>
                Salary Breakdown
              </h2>


              <div style={styles.row}>

                <span>
                  Basic Salary
                </span>

                <strong>
                  ₹
                  {Number(
                    payroll.basicSalary || 0
                  ).toLocaleString("en-IN")}
                </strong>

              </div>


              <div style={styles.row}>

                <span>
                  Allowances
                </span>

                <strong style={{
                  color: "#15803d"
                }}>
                  + ₹
                  {Number(
                    payroll.allowances || 0
                  ).toLocaleString("en-IN")}
                </strong>

              </div>


              <div style={styles.row}>

                <span>
                  Deductions
                </span>

                <strong style={{
                  color: "#dc2626"
                }}>
                  - ₹
                  {Number(
                    payroll.deductions || 0
                  ).toLocaleString("en-IN")}
                </strong>

              </div>


              <div style={styles.totalRow}>

                <span>
                  Net Salary
                </span>

                <strong>
                  ₹
                  {Number(
                    payroll.netSalary || 0
                  ).toLocaleString("en-IN")}
                </strong>

              </div>

            </div>

          </>

        ) : (

          <div style={styles.noPayroll}>

            <div style={styles.noPayrollIcon}>
              💰
            </div>

            <h2>
              Payroll Not Available
            </h2>

            <p>
              Your payroll has not been processed
              by HR yet.
            </p>

          </div>

        )}

      </main>

    </div>

  );
}


const styles = {

  page: {
    minHeight: "100vh",
    background: "#f5f7fb"
  },

  loading: {
    minHeight: "100vh",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: "15px",
    color: "#6b7280"
  },

  sidebar: {
    width: "250px",
    minHeight: "100vh",
    position: "fixed",
    left: 0,
    top: 0,
    bottom: 0,
    background: "#ffffff",
    borderRight: "1px solid #e5e7eb",
    display: "flex",
    flexDirection: "column"
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
    color: "#ffffff",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontWeight: "800",
    fontSize: "20px"
  },

  logoText: {
    fontSize: "20px",
    fontWeight: "750",
    color: "#111827"
  },

  logoSubtext: {
    fontSize: "11px",
    color: "#9ca3af"
  },

  menu: {
    padding: "25px 15px",
    display: "flex",
    flexDirection: "column",
    gap: "7px"
  },

  menuItem: {
    border: "none",
    background: "transparent",
    borderRadius: "9px",
    padding: "13px 15px",
    color: "#6b7280",
    fontSize: "14px",
    cursor: "pointer",
    textAlign: "left"
  },

  active: {
    background: "#eff6ff",
    color: "#2563eb",
    fontWeight: "650"
  },

  bottom: {
    marginTop: "auto",
    padding: "15px",
    borderTop: "1px solid #f0f0f0"
  },

  logout: {
    width: "100%",
    border: "none",
    background: "#fff1f2",
    color: "#e11d48",
    padding: "12px",
    borderRadius: "9px",
    cursor: "pointer",
    fontSize: "14px"
  },

  main: {
    marginLeft: "250px",
    padding: "40px",
    minHeight: "100vh"
  },

  header: {
    marginBottom: "25px"
  },

  title: {
    margin: 0,
    fontSize: "30px",
    color: "#111827"
  },

  subtitle: {
    color: "#6b7280",
    fontSize: "14px",
    marginTop: "7px"
  },

  profile: {
    background: "#ffffff",
    border: "1px solid #e5e7eb",
    borderRadius: "14px",
    padding: "20px",
    display: "flex",
    alignItems: "center",
    gap: "15px",
    marginBottom: "20px"
  },

  avatar: {
    width: "55px",
    height: "55px",
    borderRadius: "50%",
    background: "#dbeafe",
    color: "#2563eb",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontWeight: "800",
    fontSize: "21px"
  },

  name: {
    margin: 0,
    fontSize: "18px",
    color: "#111827"
  },

  employeeId: {
    margin: "5px 0 0",
    color: "#9ca3af",
    fontSize: "11px"
  },

  monthCard: {
    background: "#ffffff",
    border: "1px solid #e5e7eb",
    borderRadius: "12px",
    padding: "18px 20px",
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: "20px"
  },

  monthLabel: {
    color: "#9ca3af",
    fontSize: "11px"
  },

  month: {
    color: "#111827",
    fontSize: "16px",
    fontWeight: "700",
    marginTop: "4px"
  },

  processed: {
    background: "#dcfce7",
    color: "#15803d",
    padding: "7px 12px",
    borderRadius: "20px",
    fontSize: "10px",
    fontWeight: "700"
  },

  cards: {
    display: "grid",
    gridTemplateColumns:
      "repeat(3,1fr)",
    gap: "18px",
    marginBottom: "20px"
  },

  card: {
    background: "#ffffff",
    border: "1px solid #e5e7eb",
    borderRadius: "12px",
    padding: "20px",
    display: "flex",
    alignItems: "center",
    gap: "14px"
  },

  icon: {
    width: "45px",
    height: "45px",
    borderRadius: "10px",
    background: "#e0ecff",
    color: "#2563eb",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: "19px",
    fontWeight: "700"
  },

  label: {
    color: "#6b7280",
    fontSize: "11px"
  },

  value: {
    color: "#111827",
    fontSize: "19px",
    fontWeight: "750",
    marginTop: "4px"
  },

  netCard: {
    background:
      "linear-gradient(135deg,#2563eb,#4f46e5)",
    color: "#ffffff",
    borderRadius: "14px",
    padding: "25px",
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: "20px"
  },

  netLabel: {
    fontSize: "18px",
    fontWeight: "700"
  },

  netDescription: {
    fontSize: "11px",
    opacity: 0.8,
    marginTop: "5px"
  },

  netSalary: {
    fontSize: "28px",
    fontWeight: "800"
  },

  breakdown: {
    background: "#ffffff",
    border: "1px solid #e5e7eb",
    borderRadius: "14px",
    padding: "25px"
  },

  sectionTitle: {
    margin: "0 0 20px",
    fontSize: "17px",
    color: "#111827"
  },

  row: {
    display: "flex",
    justifyContent: "space-between",
    padding: "13px 0",
    borderBottom:
      "1px solid #f1f5f9",
    fontSize: "12px",
    color: "#6b7280"
  },

  totalRow: {
    display: "flex",
    justifyContent: "space-between",
    paddingTop: "18px",
    fontSize: "15px",
    color: "#111827"
  },

  noPayroll: {
    background: "#ffffff",
    border: "1px solid #e5e7eb",
    borderRadius: "15px",
    padding: "80px 20px",
    textAlign: "center"
  },

  noPayrollIcon: {
    fontSize: "45px",
    marginBottom: "10px"
  }

};

export default EmployeePayroll;