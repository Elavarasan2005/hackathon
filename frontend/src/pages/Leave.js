import React, { useCallback, useEffect, useState } from "react";
import {
  addDoc,
  collection,
  getDocs,
  query,
  where,
  orderBy,
  serverTimestamp,
} from "firebase/firestore";
import { onAuthStateChanged } from "firebase/auth";
import { auth, db } from "../firebase";

function Leave() {
  const [user, setUser] = useState(null);
  const [leaves, setLeaves] = useState([]);

  const [leaveType, setLeaveType] = useState("Casual Leave");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [reason, setReason] = useState("");

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  // =========================================================
  // GET CURRENT USER
  // =========================================================

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(
      auth,
      (currentUser) => {
        setUser(currentUser);
      }
    );

    return () => unsubscribe();
  }, []);

  // =========================================================
  // LOAD EMPLOYEE LEAVES
  // =========================================================

  const loadLeaves = useCallback(async () => {
    if (!auth.currentUser) {
      setLeaves([]);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);

      const leavesQuery = query(
        collection(db, "leaves"),
        where(
          "employeeUid",
          "==",
          auth.currentUser.uid
        ),
        orderBy("createdAt", "desc")
      );

      const snapshot = await getDocs(
        leavesQuery
      );

      const data = snapshot.docs.map((item) => ({
        id: item.id,
        ...item.data(),
      }));

      setLeaves(data);
    } catch (error) {
      console.error(
        "Error loading leaves:",
        error
      );

      /*
        If Firestore asks for an index or the
        collection is not indexed yet, use a
        simple query as fallback.
      */

      try {
        const snapshot = await getDocs(
          collection(db, "leaves")
        );

        const data = snapshot.docs
          .map((item) => ({
            id: item.id,
            ...item.data(),
          }))
          .filter(
            (item) =>
              item.employeeUid ===
              auth.currentUser?.uid
          );

        setLeaves(data);
      } catch (fallbackError) {
        console.error(
          "Fallback error:",
          fallbackError
        );

        setLeaves([]);
      }
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (user) {
      loadLeaves();
    }
  }, [user, loadLeaves]);

  // =========================================================
  // SUBMIT LEAVE
  // =========================================================

  const submitLeave = async (e) => {
    e.preventDefault();

    if (!auth.currentUser) {
      alert(
        "Please login before applying for leave."
      );
      return;
    }

    if (!startDate || !endDate) {
      alert(
        "Please select start and end dates."
      );
      return;
    }

    if (new Date(endDate) < new Date(startDate)) {
      alert(
        "End date cannot be before start date."
      );
      return;
    }

    if (!reason.trim()) {
      alert("Please enter a reason.");
      return;
    }

    try {
      setSubmitting(true);

      const currentUser =
        auth.currentUser;

      await addDoc(
        collection(db, "leaves"),
        {
          employeeUid: currentUser.uid,

          employeeId:
            currentUser.uid,

          employeeName:
            currentUser.displayName ||
            currentUser.email ||
            "Employee",

          employeeEmail:
            currentUser.email || "",

          leaveType: leaveType,

          startDate: startDate,

          endDate: endDate,

          reason: reason.trim(),

          status: "Pending",

          createdAt:
            serverTimestamp(),

          updatedAt:
            serverTimestamp(),
        }
      );

      alert(
        "Leave request submitted successfully."
      );

      // Clear form
      setLeaveType("Casual Leave");
      setStartDate("");
      setEndDate("");
      setReason("");

      await loadLeaves();
    } catch (error) {
      console.error(
        "Error submitting leave:",
        error
      );

      alert(
        "Unable to submit leave request.\n\n" +
          error.message
      );
    } finally {
      setSubmitting(false);
    }
  };

  // =========================================================
  // FORMAT DATE
  // =========================================================

  const formatDate = (date) => {
    if (!date) {
      return "-";
    }

    const parsed = new Date(date);

    if (Number.isNaN(parsed.getTime())) {
      return date;
    }

    return parsed.toLocaleDateString(
      "en-IN",
      {
        day: "2-digit",
        month: "short",
        year: "numeric",
      }
    );
  };

  // =========================================================
  // STATUS STYLE
  // =========================================================

  const getStatusStyle = (status) => {
    const value =
      String(
        status || "Pending"
      ).toLowerCase();

    if (value === "approved") {
      return {
        background: "#dcfce7",
        color: "#15803d",
      };
    }

    if (value === "rejected") {
      return {
        background: "#fee2e2",
        color: "#dc2626",
      };
    }

    return {
      background: "#fef3c7",
      color: "#b45309",
    };
  };

  // =========================================================
  // PAGE
  // =========================================================

  return (
    <div style={styles.page}>

      {/* HEADER */}

      <div style={styles.header}>
        <div>
          <h1 style={styles.title}>
            Leave
          </h1>

          <p style={styles.subtitle}>
            Apply for leave and track
            your requests
          </p>
        </div>
      </div>

      {/* APPLY LEAVE */}

      <div style={styles.card}>

        <h2 style={styles.cardTitle}>
          Apply for Leave
        </h2>

        <p style={styles.cardSubtitle}>
          Submit a new leave request
        </p>

        <form
          onSubmit={submitLeave}
          style={styles.form}
        >

          <div style={styles.formGrid}>

            {/* LEAVE TYPE */}

            <div style={styles.field}>
              <label style={styles.label}>
                Leave Type
              </label>

              <select
                value={leaveType}
                onChange={(e) =>
                  setLeaveType(
                    e.target.value
                  )
                }
                style={styles.input}
              >
                <option>
                  Casual Leave
                </option>

                <option>
                  Sick Leave
                </option>

                <option>
                  Earned Leave
                </option>

                <option>
                  Emergency Leave
                </option>

                <option>
                  Other
                </option>
              </select>
            </div>

            {/* START DATE */}

            <div style={styles.field}>
              <label style={styles.label}>
                Start Date
              </label>

              <input
                type="date"
                value={startDate}
                onChange={(e) =>
                  setStartDate(
                    e.target.value
                  )
                }
                style={styles.input}
              />
            </div>

            {/* END DATE */}

            <div style={styles.field}>
              <label style={styles.label}>
                End Date
              </label>

              <input
                type="date"
                value={endDate}
                min={startDate}
                onChange={(e) =>
                  setEndDate(
                    e.target.value
                  )
                }
                style={styles.input}
              />
            </div>

          </div>

          {/* REASON */}

          <div style={styles.field}>
            <label style={styles.label}>
              Reason
            </label>

            <textarea
              value={reason}
              onChange={(e) =>
                setReason(e.target.value)
              }
              placeholder="Enter the reason for your leave..."
              rows="4"
              style={styles.textarea}
            />
          </div>

          {/* SUBMIT */}

          <button
            type="submit"
            disabled={submitting}
            style={{
              ...styles.submitButton,
              opacity: submitting
                ? 0.7
                : 1,
            }}
          >
            {submitting
              ? "Submitting..."
              : "Submit Leave Request"}
          </button>

        </form>

      </div>

      {/* MY REQUESTS */}

      <div style={styles.card}>

        <div style={styles.requestsHeader}>

          <div>
            <h2 style={styles.cardTitle}>
              My Leave Requests
            </h2>

            <p style={styles.cardSubtitle}>
              Track the status of your
              applications
            </p>
          </div>

          <button
            onClick={loadLeaves}
            style={styles.refreshButton}
          >
            ↻ Refresh
          </button>

        </div>

        {loading ? (

          <div style={styles.message}>
            Loading leave requests...
          </div>

        ) : leaves.length === 0 ? (

          <div style={styles.empty}>
            <div style={styles.emptyIcon}>
              🗓️
            </div>

            <h3>
              No Leave Requests
            </h3>

            <p>
              You haven't submitted any
              leave requests yet.
            </p>
          </div>

        ) : (

          <div style={styles.tableWrapper}>

            <table style={styles.table}>

              <thead>
                <tr>

                  <th style={styles.th}>
                    Leave Type
                  </th>

                  <th style={styles.th}>
                    Start Date
                  </th>

                  <th style={styles.th}>
                    End Date
                  </th>

                  <th style={styles.th}>
                    Reason
                  </th>

                  <th style={styles.th}>
                    Status
                  </th>

                </tr>
              </thead>

              <tbody>

                {leaves.map((leave) => (

                  <tr key={leave.id}>

                    <td style={styles.td}>
                      {leave.leaveType ||
                        "Leave"}
                    </td>

                    <td style={styles.td}>
                      {formatDate(
                        leave.startDate
                      )}
                    </td>

                    <td style={styles.td}>
                      {formatDate(
                        leave.endDate
                      )}
                    </td>

                    <td style={styles.td}>
                      {leave.reason ||
                        "-"}
                    </td>

                    <td style={styles.td}>

                      <span
                        style={{
                          ...styles.status,
                          ...getStatusStyle(
                            leave.status
                          ),
                        }}
                      >
                        {leave.status ||
                          "Pending"}
                      </span>

                    </td>

                  </tr>

                ))}

              </tbody>

            </table>

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
    minHeight: "100vh",
    background: "#f8fafc",
    padding: "30px",
    fontFamily:
      "-apple-system, BlinkMacSystemFont, 'Segoe UI', Arial, sans-serif",
  },

  header: {
    marginBottom: "25px",
  },

  title: {
    margin: 0,
    fontSize: "30px",
    fontWeight: "700",
    color: "#111827",
  },

  subtitle: {
    margin: "7px 0 0",
    color: "#6b7280",
    fontSize: "14px",
  },

  card: {
    background: "#ffffff",
    borderRadius: "15px",
    padding: "25px",
    marginBottom: "25px",
    boxShadow:
      "0 2px 10px rgba(15,23,42,0.05)",
  },

  cardTitle: {
    margin: 0,
    fontSize: "20px",
    color: "#111827",
  },

  cardSubtitle: {
    margin: "6px 0 22px",
    color: "#9ca3af",
    fontSize: "13px",
  },

  form: {
    width: "100%",
  },

  formGrid: {
    display: "grid",
    gridTemplateColumns:
      "repeat(auto-fit, minmax(220px, 1fr))",
    gap: "18px",
    marginBottom: "18px",
  },

  field: {
    display: "flex",
    flexDirection: "column",
    gap: "7px",
    marginBottom: "17px",
  },

  label: {
    fontSize: "13px",
    fontWeight: "600",
    color: "#374151",
  },

  input: {
    width: "100%",
    boxSizing: "border-box",
    padding: "11px 12px",
    border: "1px solid #d1d5db",
    borderRadius: "8px",
    outline: "none",
    fontSize: "13px",
    background: "#fff",
  },

  textarea: {
    width: "100%",
    boxSizing: "border-box",
    padding: "12px",
    border: "1px solid #d1d5db",
    borderRadius: "8px",
    outline: "none",
    resize: "vertical",
    fontFamily: "inherit",
    fontSize: "13px",
  },

  submitButton: {
    border: "none",
    background: "#4f46e5",
    color: "#fff",
    padding: "11px 18px",
    borderRadius: "8px",
    cursor: "pointer",
    fontSize: "13px",
    fontWeight: "600",
  },

  requestsHeader: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: "10px",
  },

  refreshButton: {
    border: "1px solid #d1d5db",
    background: "#fff",
    color: "#374151",
    padding: "9px 14px",
    borderRadius: "8px",
    cursor: "pointer",
    fontSize: "12px",
    fontWeight: "600",
  },

  tableWrapper: {
    overflowX: "auto",
  },

  table: {
    width: "100%",
    borderCollapse: "collapse",
    minWidth: "700px",
  },

  th: {
    background: "#f8fafc",
    padding: "13px",
    textAlign: "left",
    fontSize: "12px",
    color: "#64748b",
    fontWeight: "600",
  },

  td: {
    padding: "15px 13px",
    borderTop:
      "1px solid #f1f5f9",
    fontSize: "13px",
    color: "#374151",
  },

  status: {
    display: "inline-block",
    padding: "5px 10px",
    borderRadius: "20px",
    fontSize: "11px",
    fontWeight: "600",
  },

  message: {
    padding: "50px",
    textAlign: "center",
    color: "#6b7280",
  },

  empty: {
    padding: "50px",
    textAlign: "center",
    color: "#9ca3af",
  },

  emptyIcon: {
    fontSize: "45px",
    marginBottom: "10px",
  },
};

export default Leave;