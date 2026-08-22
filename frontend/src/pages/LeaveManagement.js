import React, {
  useCallback,
  useEffect,
  useMemo,
  useState
} from "react";

import {
  collection,
  getDocs,
  doc,
  updateDoc
} from "firebase/firestore";

import { db } from "../firebase";

function LeaveManagement() {
  const [leaves, setLeaves] = useState([]);
  const [loading, setLoading] = useState(true);

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");

  // Modal states
  const [modal, setModal] = useState({
    open: false,
    type: "",
    title: "",
    message: "",
    leave: null,
    action: null
  });

  // ============================================================
  // LOAD LEAVE REQUESTS
  // ============================================================

  const loadLeaves = useCallback(async () => {
    setLoading(true);

    try {
      const snapshot = await getDocs(
        collection(db, "leaves")
      );

      const list = snapshot.docs.map((item) => ({
        id: item.id,
        ...item.data()
      }));

      // Newest first
      list.sort((a, b) => {
        const dateA = a.createdAt?.seconds || 0;
        const dateB = b.createdAt?.seconds || 0;

        return dateB - dateA;
      });

      setLeaves(list);
    } catch (error) {
      console.error(
        "Error loading leave requests:",
        error
      );

      setLeaves([]);

      openMessageModal(
        "error",
        "Unable to Load",
        "We could not load the leave requests. Please try again."
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadLeaves();
  }, [loadLeaves]);

  // ============================================================
  // OPEN MESSAGE MODAL
  // ============================================================

  const openMessageModal = (
    type,
    title,
    message
  ) => {
    setModal({
      open: true,
      type,
      title,
      message,
      leave: null,
      action: null
    });
  };

  // ============================================================
  // CLOSE MODAL
  // ============================================================

  const closeModal = () => {
    setModal({
      open: false,
      type: "",
      title: "",
      message: "",
      leave: null,
      action: null
    });
  };

  // ============================================================
  // OPEN APPROVE / REJECT CONFIRMATION
  // ============================================================

  const openActionModal = (leave, newStatus) => {
    const employeeName =
      leave.employeeName ||
      leave.name ||
      "this employee";

    const isApprove =
      newStatus === "Approved";

    setModal({
      open: true,
      type: "confirm",
      title: isApprove
        ? "Approve Leave Request?"
        : "Reject Leave Request?",
      message: isApprove
        ? `Are you sure you want to approve the leave request from ${employeeName}?`
        : `Are you sure you want to reject the leave request from ${employeeName}?`,
      leave,
      action: newStatus
    });
  };

  // ============================================================
  // OPEN LEAVE DETAILS
  // ============================================================

  const openDetailsModal = (leave) => {
    setModal({
      open: true,
      type: "details",
      title: "Leave Request Details",
      message: "",
      leave,
      action: null
    });
  };

  // ============================================================
  // UPDATE LEAVE STATUS
  // ============================================================

  const updateLeaveStatus = async (
    leaveId,
    newStatus
  ) => {
    closeModal();

    try {
      await updateDoc(
        doc(db, "leaves", leaveId),
        {
          status: newStatus
        }
      );

      setLeaves((previous) =>
        previous.map((leave) =>
          leave.id === leaveId
            ? {
                ...leave,
                status: newStatus
              }
            : leave
        )
      );

      const message =
        newStatus === "Approved"
          ? "The leave request has been approved successfully."
          : "The leave request has been rejected successfully.";

      setTimeout(() => {
        openMessageModal(
          "success",
          newStatus === "Approved"
            ? "Leave Approved"
            : "Leave Rejected",
          message
        );
      }, 150);
    } catch (error) {
      console.error(
        "Error updating leave:",
        error
      );

      setTimeout(() => {
        openMessageModal(
          "error",
          "Update Failed",
          "Unable to update the leave request. Please try again."
        );
      }, 150);
    }
  };

  // ============================================================
  // FILTER
  // ============================================================

  const filteredLeaves = useMemo(() => {
    const text =
      search.trim().toLowerCase();

    return leaves.filter((leave) => {
      const employeeName =
        leave.employeeName ||
        leave.name ||
        "";

      const employeeId =
        leave.employeeId ||
        "";

      const leaveType =
        leave.leaveType ||
        leave.type ||
        "";

      const status =
        leave.status ||
        "Pending";

      const reason =
        leave.reason ||
        leave.description ||
        "";

      const matchesSearch =
        !text ||
        String(employeeName)
          .toLowerCase()
          .includes(text) ||
        String(employeeId)
          .toLowerCase()
          .includes(text) ||
        String(leaveType)
          .toLowerCase()
          .includes(text) ||
        String(reason)
          .toLowerCase()
          .includes(text);

      const matchesStatus =
        statusFilter === "All" ||
        String(status).toLowerCase() ===
          statusFilter.toLowerCase();

      return (
        matchesSearch &&
        matchesStatus
      );
    });
  }, [
    leaves,
    search,
    statusFilter
  ]);

  // ============================================================
  // STATISTICS
  // ============================================================

  const statistics = useMemo(() => {
    let pending = 0;
    let approved = 0;
    let rejected = 0;

    leaves.forEach((leave) => {
      const status = String(
        leave.status || "Pending"
      ).toLowerCase();

      if (status === "approved") {
        approved++;
      } else if (status === "rejected") {
        rejected++;
      } else {
        pending++;
      }
    });

    return {
      total: leaves.length,
      pending,
      approved,
      rejected
    };
  }, [leaves]);

  // ============================================================
  // STATUS STYLE
  // ============================================================

  const getStatusStyle = (status) => {
    const value = String(
      status || "Pending"
    ).toLowerCase();

    if (value === "approved") {
      return styles.approved;
    }

    if (value === "rejected") {
      return styles.rejected;
    }

    return styles.pending;
  };

  // ============================================================
  // DATE FORMAT
  // ============================================================

  const formatDate = (value) => {
    if (!value) {
      return "-";
    }

    try {
      if (
        typeof value === "object" &&
        value.seconds
      ) {
        return new Date(
          value.seconds * 1000
        ).toLocaleDateString("en-IN", {
          day: "2-digit",
          month: "short",
          year: "numeric"
        });
      }

      return new Date(
        value
      ).toLocaleDateString("en-IN", {
        day: "2-digit",
        month: "short",
        year: "numeric"
      });
    } catch {
      return String(value);
    }
  };

  // ============================================================
  // NUMBER OF DAYS
  // ============================================================

  const calculateDays = (leave) => {
    if (leave.days) {
      return leave.days;
    }

    const startValue =
      leave.startDate ||
      leave.fromDate ||
      leave.from;

    const endValue =
      leave.endDate ||
      leave.toDate ||
      leave.to;

    if (!startValue || !endValue) {
      return "-";
    }

    try {
      const start = new Date(startValue);
      const end = new Date(endValue);

      const difference =
        end.getTime() -
        start.getTime();

      return (
        Math.floor(
          difference /
            (1000 * 60 * 60 * 24)
        ) + 1
      );
    } catch {
      return "-";
    }
  };

  // ============================================================
  // EMPLOYEE NAME
  // ============================================================

  const getEmployeeName = (leave) => {
    return (
      leave.employeeName ||
      leave.name ||
      "Unknown Employee"
    );
  };

  // ============================================================
  // EMPLOYEE ID
  // ============================================================

  const getEmployeeId = (leave) => {
    return (
      leave.employeeId ||
      "-"
    );
  };

  // ============================================================
  // LEAVE TYPE
  // ============================================================

  const getLeaveType = (leave) => {
    return (
      leave.leaveType ||
      leave.type ||
      "Leave"
    );
  };

  // ============================================================
  // REASON
  // ============================================================

  const getReason = (leave) => {
    return (
      leave.reason ||
      leave.description ||
      "No reason provided"
    );
  };

  // ============================================================
  // UI
  // ============================================================

  return (
    <div style={styles.page}>

      {/* =====================================================
          HEADER
      ===================================================== */}

      <div style={styles.header}>

        <div>
          <div style={styles.brandRow}>
            <div style={styles.brandIcon}>
              D
            </div>

            <span style={styles.brandText}>
              DAYFLOW HRMS
            </span>
          </div>

          <h1 style={styles.title}>
            Leave Management
          </h1>

          <p style={styles.subtitle}>
            Review, approve and manage employee
            leave requests.
          </p>
        </div>

        <button
          style={styles.refreshButton}
          onClick={loadLeaves}
        >
          <span style={styles.refreshIcon}>
            ↻
          </span>
          Refresh
        </button>

      </div>

      {/* =====================================================
          STATISTICS
      ===================================================== */}

      <div style={styles.statsGrid}>

        {/* TOTAL */}

        <div style={styles.statCard}>
          <div
            style={{
              ...styles.iconBox,
              ...styles.blue
            }}
          >
            📋
          </div>

          <div>
            <p style={styles.statLabel}>
              Total Requests
            </p>

            <h2 style={styles.statValue}>
              {statistics.total}
            </h2>

            <p style={styles.statDescription}>
              All leave applications
            </p>
          </div>
        </div>

        {/* PENDING */}

        <div style={styles.statCard}>
          <div
            style={{
              ...styles.iconBox,
              ...styles.yellow
            }}
          >
            ⏳
          </div>

          <div>
            <p style={styles.statLabel}>
              Pending
            </p>

            <h2 style={styles.statValue}>
              {statistics.pending}
            </h2>

            <p style={styles.statDescription}>
              Waiting for approval
            </p>
          </div>
        </div>

        {/* APPROVED */}

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
              Approved
            </p>

            <h2 style={styles.statValue}>
              {statistics.approved}
            </h2>

            <p style={styles.statDescription}>
              Approved requests
            </p>
          </div>
        </div>

        {/* REJECTED */}

        <div style={styles.statCard}>
          <div
            style={{
              ...styles.iconBox,
              ...styles.red
            }}
          >
            ✕
          </div>

          <div>
            <p style={styles.statLabel}>
              Rejected
            </p>

            <h2 style={styles.statValue}>
              {statistics.rejected}
            </h2>

            <p style={styles.statDescription}>
              Rejected requests
            </p>
          </div>
        </div>

      </div>

      {/* =====================================================
          FILTER BAR
      ===================================================== */}

      <div style={styles.filterCard}>

        <div style={styles.searchBox}>

          <span style={styles.searchIcon}>
            🔍
          </span>

          <input
            type="text"
            placeholder="Search employee, ID, leave type or reason..."
            value={search}
            onChange={(event) =>
              setSearch(event.target.value)
            }
            style={styles.searchInput}
          />

          {search && (
            <button
              style={styles.clearSearch}
              onClick={() =>
                setSearch("")
              }
            >
              ×
            </button>
          )}

        </div>

        <div style={styles.filterGroup}>

          <span style={styles.filterLabel}>
            Status
          </span>

          <select
            value={statusFilter}
            onChange={(event) =>
              setStatusFilter(
                event.target.value
              )
            }
            style={styles.select}
          >
            <option value="All">
              All Status
            </option>

            <option value="Pending">
              Pending
            </option>

            <option value="Approved">
              Approved
            </option>

            <option value="Rejected">
              Rejected
            </option>
          </select>

        </div>

      </div>

      {/* =====================================================
          REQUESTS TABLE
      ===================================================== */}

      <div style={styles.tableCard}>

        <div style={styles.tableHeader}>

          <div>
            <h2 style={styles.tableTitle}>
              Leave Requests
            </h2>

            <p style={styles.tableSubtitle}>
              {filteredLeaves.length}{" "}
              {filteredLeaves.length === 1
                ? "request"
                : "requests"}{" "}
              found
            </p>
          </div>

          <div style={styles.tableHeaderBadge}>
            {statusFilter === "All"
              ? "All Requests"
              : statusFilter}
          </div>

        </div>

        {/* LOADING */}

        {loading && (
          <div style={styles.loading}>

            <div style={styles.spinner}></div>

            <h3 style={styles.loadingTitle}>
              Loading leave requests
            </h3>

            <p style={styles.loadingText}>
              Please wait while we fetch the latest
              requests.
            </p>

          </div>
        )}

        {/* EMPTY */}

        {!loading &&
          filteredLeaves.length === 0 && (
            <div style={styles.empty}>

              <div style={styles.emptyIcon}>
                📅
              </div>

              <h3 style={styles.emptyTitle}>
                No leave requests found
              </h3>

              <p style={styles.emptyText}>
                There are no leave requests matching
                your current filters.
              </p>

              {(search ||
                statusFilter !== "All") && (
                <button
                  style={styles.clearFilterButton}
                  onClick={() => {
                    setSearch("");
                    setStatusFilter("All");
                  }}
                >
                  Clear Filters
                </button>
              )}

            </div>
          )}

        {/* TABLE */}

        {!loading &&
          filteredLeaves.length > 0 && (
            <div style={styles.tableWrapper}>

              <table style={styles.table}>

                <thead>
                  <tr>

                    <th style={styles.th}>
                      Employee
                    </th>

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
                      Days
                    </th>

                    <th style={styles.th}>
                      Reason
                    </th>

                    <th style={styles.th}>
                      Status
                    </th>

                    <th style={styles.th}>
                      Action
                    </th>

                  </tr>
                </thead>

                <tbody>

                  {filteredLeaves.map(
                    (leave) => {

                      const status =
                        leave.status ||
                        "Pending";

                      const employeeName =
                        getEmployeeName(
                          leave
                        );

                      const employeeId =
                        getEmployeeId(
                          leave
                        );

                      const leaveType =
                        getLeaveType(
                          leave
                        );

                      const reason =
                        getReason(
                          leave
                        );

                      const isPending =
                        String(status)
                          .toLowerCase() ===
                        "pending";

                      return (
                        <tr
                          key={leave.id}
                          style={styles.tr}
                        >

                          {/* EMPLOYEE */}

                          <td style={styles.td}>

                            <div
                              style={
                                styles.employeeCell
                              }
                            >

                              <div
                                style={
                                  styles.avatar
                                }
                              >
                                {employeeName
                                  .charAt(0)
                                  .toUpperCase()}
                              </div>

                              <div>
                                <strong
                                  style={
                                    styles.employeeName
                                  }
                                >
                                  {employeeName}
                                </strong>

                                <p
                                  style={
                                    styles.employeeId
                                  }
                                >
                                  {employeeId}
                                </p>
                              </div>

                            </div>

                          </td>

                          {/* TYPE */}

                          <td style={styles.td}>

                            <span
                              style={
                                styles.leaveType
                              }
                            >
                              {leaveType}
                            </span>

                          </td>

                          {/* START */}

                          <td style={styles.td}>
                            {formatDate(
                              leave.startDate ||
                                leave.fromDate ||
                                leave.from
                            )}
                          </td>

                          {/* END */}

                          <td style={styles.td}>
                            {formatDate(
                              leave.endDate ||
                                leave.toDate ||
                                leave.to
                            )}
                          </td>

                          {/* DAYS */}

                          <td
                            style={{
                              ...styles.td,
                              fontWeight: "700"
                            }}
                          >
                            {calculateDays(
                              leave
                            )}
                          </td>

                          {/* REASON */}

                          <td
                            style={
                              styles.reasonCell
                            }
                          >
                            {reason}
                          </td>

                          {/* STATUS */}

                          <td style={styles.td}>

                            <span
                              style={{
                                ...styles.status,
                                ...getStatusStyle(
                                  status
                                )
                              }}
                            >
                              {status}
                            </span>

                          </td>

                          {/* ACTION */}

                          <td style={styles.td}>

                            <div
                              style={
                                styles.actionGroup
                              }
                            >

                              <button
                                style={
                                  styles.viewButton
                                }
                                onClick={() =>
                                  openDetailsModal(
                                    leave
                                  )
                                }
                              >
                                View
                              </button>

                              {isPending && (
                                <>
                                  <button
                                    style={
                                      styles.approveButton
                                    }
                                    onClick={() =>
                                      openActionModal(
                                        leave,
                                        "Approved"
                                      )
                                    }
                                  >
                                    ✓
                                  </button>

                                  <button
                                    style={
                                      styles.rejectButton
                                    }
                                    onClick={() =>
                                      openActionModal(
                                        leave,
                                        "Rejected"
                                      )
                                    }
                                  >
                                    ✕
                                  </button>
                                </>
                              )}

                            </div>

                          </td>

                        </tr>
                      );
                    }
                  )}

                </tbody>

              </table>

            </div>
          )}

      </div>

      {/* =====================================================
          MODAL
      ===================================================== */}

      {modal.open && (
        <div
          style={styles.modalOverlay}
          onClick={(event) => {
            if (
              event.target ===
              event.currentTarget
            ) {
              closeModal();
            }
          }}
        >

          <div style={styles.modal}>

            {/* CLOSE */}

            <button
              style={styles.modalClose}
              onClick={closeModal}
            >
              ×
            </button>

            {/* =================================================
                CONFIRM MODAL
            ================================================= */}

            {modal.type === "confirm" && (
              <>

                <div
                  style={{
                    ...styles.modalIcon,
                    ...(modal.action ===
                    "Approved"
                      ? styles.modalSuccessIcon
                      : styles.modalDangerIcon)
                  }}
                >
                  {modal.action ===
                  "Approved"
                    ? "✓"
                    : "!"}
                </div>

                <h2
                  style={styles.modalTitle}
                >
                  {modal.title}
                </h2>

                <p
                  style={styles.modalMessage}
                >
                  {modal.message}
                </p>

                {modal.leave && (
                  <div
                    style={
                      styles.modalPreview
                    }
                  >

                    <div
                      style={
                        styles.modalAvatar
                      }
                    >
                      {getEmployeeName(
                        modal.leave
                      )
                        .charAt(0)
                        .toUpperCase()}
                    </div>

                    <div>
                      <strong>
                        {getEmployeeName(
                          modal.leave
                        )}
                      </strong>

                      <p>
                        {getLeaveType(
                          modal.leave
                        )}
                      </p>
                    </div>

                  </div>
                )}

                <div
                  style={
                    styles.modalActions
                  }
                >

                  <button
                    style={
                      styles.cancelButton
                    }
                    onClick={closeModal}
                  >
                    Cancel
                  </button>

                  <button
                    style={
                      modal.action ===
                      "Approved"
                        ? styles.modalApproveButton
                        : styles.modalRejectButton
                    }
                    onClick={() =>
                      updateLeaveStatus(
                        modal.leave.id,
                        modal.action
                      )
                    }
                  >
                    {modal.action ===
                    "Approved"
                      ? "Approve Leave"
                      : "Reject Leave"}
                  </button>

                </div>

              </>
            )}

            {/* =================================================
                SUCCESS / ERROR MODAL
            ================================================= */}

            {(modal.type === "success" ||
              modal.type === "error") && (
              <>

                <div
                  style={{
                    ...styles.modalIcon,
                    ...(modal.type ===
                    "success"
                      ? styles.modalSuccessIcon
                      : styles.modalDangerIcon)
                  }}
                >
                  {modal.type ===
                  "success"
                    ? "✓"
                    : "!"}
                </div>

                <h2
                  style={styles.modalTitle}
                >
                  {modal.title}
                </h2>

                <p
                  style={styles.modalMessage}
                >
                  {modal.message}
                </p>

                <button
                  style={
                    modal.type ===
                    "success"
                      ? styles.modalPrimaryButton
                      : styles.modalDangerButton
                  }
                  onClick={closeModal}
                >
                  Done
                </button>

              </>
            )}

            {/* =================================================
                DETAILS MODAL
            ================================================= */}

            {modal.type === "details" &&
              modal.leave && (
                <>

                  <div
                    style={
                      styles.detailsHeader
                    }
                  >

                    <div
                      style={
                        styles.detailsAvatar
                      }
                    >
                      {getEmployeeName(
                        modal.leave
                      )
                        .charAt(0)
                        .toUpperCase()}
                    </div>

                    <div>
                      <h2
                        style={
                          styles.detailsName
                        }
                      >
                        {getEmployeeName(
                          modal.leave
                        )}
                      </h2>

                      <p
                        style={
                          styles.detailsId
                        }
                      >
                        Employee ID:{" "}
                        {getEmployeeId(
                          modal.leave
                        )}
                      </p>
                    </div>

                  </div>

                  <div
                    style={
                      styles.detailsGrid
                    }
                  >

                    <div
                      style={
                        styles.detailItem
                      }
                    >
                      <span>
                        Leave Type
                      </span>

                      <strong>
                        {getLeaveType(
                          modal.leave
                        )}
                      </strong>
                    </div>

                    <div
                      style={
                        styles.detailItem
                      }
                    >
                      <span>
                        Status
                      </span>

                      <strong
                        style={{
                          ...styles.status,
                          ...getStatusStyle(
                            modal.leave
                              .status
                          )
                        }}
                      >
                        {modal.leave.status ||
                          "Pending"}
                      </strong>
                    </div>

                    <div
                      style={
                        styles.detailItem
                      }
                    >
                      <span>
                        Start Date
                      </span>

                      <strong>
                        {formatDate(
                          modal.leave
                            .startDate ||
                            modal.leave
                              .fromDate ||
                            modal.leave
                              .from
                        )}
                      </strong>
                    </div>

                    <div
                      style={
                        styles.detailItem
                      }
                    >
                      <span>
                        End Date
                      </span>

                      <strong>
                        {formatDate(
                          modal.leave
                            .endDate ||
                            modal.leave
                              .toDate ||
                            modal.leave
                              .to
                        )}
                      </strong>
                    </div>

                    <div
                      style={
                        styles.detailItem
                      }
                    >
                      <span>
                        Number of Days
                      </span>

                      <strong>
                        {calculateDays(
                          modal.leave
                        )}
                      </strong>
                    </div>

                    <div
                      style={
                        styles.detailItem
                      }
                    >
                      <span>
                        Email
                      </span>

                      <strong>
                        {modal.leave.email ||
                          "-"}
                      </strong>
                    </div>

                  </div>

                  <div
                    style={
                      styles.reasonBox
                    }
                  >
                    <span>
                      Reason
                    </span>

                    <p>
                      {getReason(
                        modal.leave
                      )}
                    </p>
                  </div>

                  <div
                    style={
                      styles.modalActions
                    }
                  >

                    <button
                      style={
                        styles.cancelButton
                      }
                      onClick={closeModal}
                    >
                      Close
                    </button>

                    {String(
                      modal.leave.status ||
                        "Pending"
                    ).toLowerCase() ===
                      "pending" && (
                      <>
                        <button
                          style={
                            styles.modalApproveButton
                          }
                          onClick={() => {
                            closeModal();

                            setTimeout(() => {
                              openActionModal(
                                modal.leave,
                                "Approved"
                              );
                            }, 100);
                          }}
                        >
                          ✓ Approve
                        </button>

                        <button
                          style={
                            styles.modalRejectButton
                          }
                          onClick={() => {
                            closeModal();

                            setTimeout(() => {
                              openActionModal(
                                modal.leave,
                                "Rejected"
                              );
                            }, 100);
                          }}
                        >
                          ✕ Reject
                        </button>
                      </>
                    )}

                  </div>

                </>
              )}

          </div>

        </div>
      )}

    </div>
  );
}

// ============================================================
// STYLES
// ============================================================

const styles = {

  page: {
    minHeight: "100vh",
    background:
      "linear-gradient(135deg, #f7f8fc 0%, #f2f4f8 100%)",
    padding: "42px 48px",
    boxSizing: "border-box",
    fontFamily:
      "Inter, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
    color: "#101828"
  },

  // ==========================================================
  // HEADER
  // ==========================================================

  header: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: "34px"
  },

  brandRow: {
    display: "flex",
    alignItems: "center",
    gap: "10px",
    marginBottom: "15px"
  },

  brandIcon: {
    width: "34px",
    height: "34px",
    borderRadius: "10px",
    background:
      "linear-gradient(135deg, #4f46e5, #7c3aed)",
    color: "#ffffff",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontWeight: "800",
    fontSize: "18px",
    boxShadow:
      "0 7px 18px rgba(79,70,229,0.25)"
  },

  brandText: {
    color: "#5b43e8",
    fontSize: "13px",
    fontWeight: "800",
    letterSpacing: "3px"
  },

  title: {
    margin: 0,
    fontSize: "42px",
    lineHeight: "1.1",
    fontWeight: "800",
    letterSpacing: "-1px"
  },

  subtitle: {
    margin:
      "10px 0 0",
    color: "#667085",
    fontSize: "16px"
  },

  refreshButton: {
    border:
      "1px solid #d0d5dd",
    background: "#ffffff",
    borderRadius: "12px",
    padding: "12px 18px",
    fontSize: "14px",
    fontWeight: "700",
    cursor: "pointer",
    color: "#344054",
    display: "flex",
    alignItems: "center",
    gap: "8px",
    boxShadow:
      "0 4px 12px rgba(16,24,40,0.04)"
  },

  refreshIcon: {
    fontSize: "18px"
  },

  // ==========================================================
  // STATISTICS
  // ==========================================================

  statsGrid: {
    display: "grid",
    gridTemplateColumns:
      "repeat(4, minmax(0, 1fr))",
    gap: "20px",
    marginBottom: "26px"
  },

  statCard: {
    background: "#ffffff",
    border:
      "1px solid #eaecf0",
    borderRadius: "18px",
    padding: "23px",
    display: "flex",
    alignItems: "center",
    gap: "17px",
    boxShadow:
      "0 7px 22px rgba(16,24,40,0.05)"
  },

  iconBox: {
    width: "58px",
    height: "58px",
    borderRadius: "16px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: "24px",
    flexShrink: 0
  },

  blue: {
    background: "#e8e9ff",
    color: "#5145cd"
  },

  yellow: {
    background: "#fff2c7",
    color: "#b7791f"
  },

  green: {
    background: "#d9fbe7",
    color: "#079455"
  },

  red: {
    background: "#ffe2e0",
    color: "#d92d20"
  },

  statLabel: {
    margin:
      "0 0 4px",
    color: "#667085",
    fontSize: "13px",
    fontWeight: "600"
  },

  statValue: {
    margin: 0,
    fontSize: "27px",
    fontWeight: "800",
    color: "#101828"
  },

  statDescription: {
    margin:
      "4px 0 0",
    color: "#98a2b3",
    fontSize: "11px"
  },

  // ==========================================================
  // FILTER
  // ==========================================================

  filterCard: {
    background: "#ffffff",
    border:
      "1px solid #eaecf0",
    borderRadius: "18px",
    padding: "18px",
    marginBottom: "24px",
    display: "flex",
    alignItems: "center",
    gap: "18px",
    boxShadow:
      "0 6px 18px rgba(16,24,40,0.04)"
  },

  searchBox: {
    flex: 1,
    position: "relative"
  },

  searchIcon: {
    position: "absolute",
    left: "16px",
    top: "13px",
    fontSize: "17px"
  },

  searchInput: {
    width: "100%",
    height: "48px",
    boxSizing: "border-box",
    border:
      "1px solid #d0d5dd",
    borderRadius: "12px",
    padding:
      "0 45px 0 45px",
    fontSize: "14px",
    outline: "none",
    color: "#101828",
    background: "#ffffff"
  },

  clearSearch: {
    position: "absolute",
    right: "12px",
    top: "9px",
    width: "30px",
    height: "30px",
    border: "none",
    borderRadius: "50%",
    background: "#f2f4f7",
    color: "#667085",
    fontSize: "20px",
    cursor: "pointer"
  },

  filterGroup: {
    display: "flex",
    alignItems: "center",
    gap: "10px"
  },

  filterLabel: {
    fontSize: "13px",
    fontWeight: "700",
    color: "#344054"
  },

  select: {
    height: "48px",
    minWidth: "145px",
    border:
      "1px solid #d0d5dd",
    borderRadius: "12px",
    padding: "0 14px",
    fontSize: "14px",
    background: "#ffffff",
    color: "#344054",
    cursor: "pointer",
    outline: "none"
  },

  // ==========================================================
  // TABLE
  // ==========================================================

  tableCard: {
    background: "#ffffff",
    border:
      "1px solid #eaecf0",
    borderRadius: "20px",
    overflow: "hidden",
    boxShadow:
      "0 8px 25px rgba(16,24,40,0.05)"
  },

  tableHeader: {
    padding: "23px 27px",
    borderBottom:
      "1px solid #eaecf0",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center"
  },

  tableTitle: {
    margin: 0,
    fontSize: "21px",
    fontWeight: "800"
  },

  tableSubtitle: {
    margin:
      "5px 0 0",
    color: "#667085",
    fontSize: "13px"
  },

  tableHeaderBadge: {
    background: "#f0edff",
    color: "#5b43e8",
    padding:
      "7px 12px",
    borderRadius: "20px",
    fontSize: "12px",
    fontWeight: "700"
  },

  tableWrapper: {
    width: "100%",
    overflowX: "auto"
  },

  table: {
    width: "100%",
    minWidth: "1250px",
    borderCollapse: "collapse"
  },

  th: {
    textAlign: "left",
    padding:
      "15px 18px",
    background: "#f8f9fc",
    color: "#667085",
    fontSize: "12px",
    fontWeight: "800",
    borderBottom:
      "1px solid #eaecf0",
    textTransform: "uppercase",
    letterSpacing: "0.3px"
  },

  tr: {
    borderBottom:
      "1px solid #f0f2f5",
    transition:
      "background 0.2s ease"
  },

  td: {
    padding:
      "17px 18px",
    color: "#344054",
    fontSize: "13px",
    verticalAlign: "middle"
  },

  employeeCell: {
    display: "flex",
    alignItems: "center",
    gap: "11px"
  },

  avatar: {
    width: "42px",
    height: "42px",
    borderRadius: "13px",
    background:
      "linear-gradient(135deg, #5b43e8, #7c3aed)",
    color: "#ffffff",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontWeight: "800",
    flexShrink: 0
  },

  employeeName: {
    color: "#101828",
    fontSize: "13px"
  },

  employeeId: {
    margin:
      "4px 0 0",
    color: "#98a2b3",
    fontSize: "11px"
  },

  leaveType: {
    background: "#f0edff",
    color: "#5b43e8",
    padding:
      "6px 10px",
    borderRadius: "8px",
    fontSize: "11px",
    fontWeight: "800"
  },

  reasonCell: {
    padding:
      "17px 18px",
    color: "#667085",
    fontSize: "12px",
    maxWidth: "190px",
    overflow: "hidden",
    textOverflow: "ellipsis",
    whiteSpace: "nowrap"
  },

  status: {
    display: "inline-block",
    padding:
      "6px 11px",
    borderRadius: "20px",
    fontSize: "11px",
    fontWeight: "800"
  },

  pending: {
    background: "#fff3c4",
    color: "#a15c00"
  },

  approved: {
    background: "#d9fbe7",
    color: "#087443"
  },

  rejected: {
    background: "#ffe2e0",
    color: "#b42318"
  },

  // ==========================================================
  // ACTION BUTTONS
  // ==========================================================

  actionGroup: {
    display: "flex",
    alignItems: "center",
    gap: "6px"
  },

  viewButton: {
    border:
      "1px solid #d0d5dd",
    background: "#ffffff",
    color: "#344054",
    borderRadius: "8px",
    padding:
      "7px 10px",
    fontSize: "11px",
    fontWeight: "700",
    cursor: "pointer"
  },

  approveButton: {
    border: "none",
    background: "#12b76a",
    color: "#ffffff",
    borderRadius: "8px",
    width: "32px",
    height: "32px",
    fontSize: "14px",
    fontWeight: "800",
    cursor: "pointer"
  },

  rejectButton: {
    border: "none",
    background: "#f04438",
    color: "#ffffff",
    borderRadius: "8px",
    width: "32px",
    height: "32px",
    fontSize: "14px",
    fontWeight: "800",
    cursor: "pointer"
  },

  // ==========================================================
  // LOADING
  // ==========================================================

  loading: {
    minHeight: "350px",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    color: "#667085"
  },

  spinner: {
    width: "42px",
    height: "42px",
    border:
      "4px solid #e4e7ec",
    borderTop:
      "4px solid #5b43e8",
    borderRadius: "50%",
    animation:
      "spin 1s linear infinite",
    marginBottom: "18px"
  },

  loadingTitle: {
    margin:
      "0 0 5px",
    color: "#101828",
    fontSize: "16px"
  },

  loadingText: {
    margin: 0,
    fontSize: "13px"
  },

  // ==========================================================
  // EMPTY
  // ==========================================================

  empty: {
    minHeight: "350px",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    textAlign: "center",
    padding: "30px"
  },

  emptyIcon: {
    width: "70px",
    height: "70px",
    borderRadius: "20px",
    background: "#f0edff",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: "34px",
    marginBottom: "15px"
  },

  emptyTitle: {
    margin:
      "0 0 7px",
    fontSize: "18px",
    color: "#101828"
  },

  emptyText: {
    margin:
      "0 0 18px",
    color: "#667085",
    fontSize: "13px"
  },

  clearFilterButton: {
    border: "none",
    background:
      "linear-gradient(135deg, #5542e8, #7c3aed)",
    color: "#ffffff",
    padding:
      "10px 17px",
    borderRadius: "9px",
    fontWeight: "700",
    cursor: "pointer"
  },

  // ==========================================================
  // MODAL
  // ==========================================================

  modalOverlay: {
    position: "fixed",
    inset: 0,
    background:
      "rgba(15, 23, 42, 0.58)",
    backdropFilter: "blur(5px)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    zIndex: 9999,
    padding: "20px"
  },

  modal: {
    width: "100%",
    maxWidth: "520px",
    background: "#ffffff",
    borderRadius: "24px",
    padding: "32px",
    position: "relative",
    boxShadow:
      "0 25px 70px rgba(0,0,0,0.20)",
    animation:
      "modalIn 0.2s ease-out"
  },

  modalClose: {
    position: "absolute",
    top: "16px",
    right: "16px",
    width: "34px",
    height: "34px",
    border: "none",
    borderRadius: "50%",
    background: "#f2f4f7",
    color: "#667085",
    fontSize: "23px",
    cursor: "pointer",
    lineHeight: "1"
  },

  modalIcon: {
    width: "64px",
    height: "64px",
    borderRadius: "20px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: "30px",
    fontWeight: "800",
    margin:
      "5px auto 18px"
  },

  modalSuccessIcon: {
    background: "#d9fbe7",
    color: "#079455"
  },

  modalDangerIcon: {
    background: "#ffe2e0",
    color: "#d92d20"
  },

  modalTitle: {
    margin:
      "0 0 10px",
    textAlign: "center",
    fontSize: "22px",
    fontWeight: "800",
    color: "#101828"
  },

  modalMessage: {
    margin:
      "0 auto 22px",
    maxWidth: "420px",
    textAlign: "center",
    color: "#667085",
    fontSize: "14px",
    lineHeight: "1.6"
  },

  modalPreview: {
    display: "flex",
    alignItems: "center",
    gap: "12px",
    background: "#f8f9fc",
    border:
      "1px solid #eaecf0",
    borderRadius: "14px",
    padding: "13px",
    marginBottom: "23px"
  },

  modalAvatar: {
    width: "44px",
    height: "44px",
    borderRadius: "12px",
    background:
      "linear-gradient(135deg, #5542e8, #7c3aed)",
    color: "#ffffff",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontWeight: "800"
  },

  modalActions: {
    display: "flex",
    justifyContent: "flex-end",
    gap: "9px",
    flexWrap: "wrap",
    marginTop: "24px"
  },

  cancelButton: {
    border:
      "1px solid #d0d5dd",
    background: "#ffffff",
    color: "#344054",
    padding:
      "11px 17px",
    borderRadius: "10px",
    fontWeight: "700",
    cursor: "pointer"
  },

  modalApproveButton: {
    border: "none",
    background:
      "linear-gradient(135deg, #12b76a, #039855)",
    color: "#ffffff",
    padding:
      "11px 17px",
    borderRadius: "10px",
    fontWeight: "800",
    cursor: "pointer"
  },

  modalRejectButton: {
    border: "none",
    background:
      "linear-gradient(135deg, #f04438, #d92d20)",
    color: "#ffffff",
    padding:
      "11px 17px",
    borderRadius: "10px",
    fontWeight: "800",
    cursor: "pointer"
  },

  modalPrimaryButton: {
    display: "block",
    margin: "0 auto",
    border: "none",
    background:
      "linear-gradient(135deg, #5542e8, #7c3aed)",
    color: "#ffffff",
    padding:
      "11px 30px",
    borderRadius: "10px",
    fontWeight: "800",
    cursor: "pointer"
  },

  modalDangerButton: {
    display: "block",
    margin: "0 auto",
    border: "none",
    background:
      "linear-gradient(135deg, #f04438, #d92d20)",
    color: "#ffffff",
    padding:
      "11px 30px",
    borderRadius: "10px",
    fontWeight: "800",
    cursor: "pointer"
  },

  // ==========================================================
  // DETAILS MODAL
  // ==========================================================

  detailsHeader: {
    display: "flex",
    alignItems: "center",
    gap: "14px",
    marginBottom: "23px",
    paddingBottom: "20px",
    borderBottom:
      "1px solid #eaecf0"
  },

  detailsAvatar: {
    width: "56px",
    height: "56px",
    borderRadius: "16px",
    background:
      "linear-gradient(135deg, #5542e8, #7c3aed)",
    color: "#ffffff",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: "22px",
    fontWeight: "800"
  },

  detailsName: {
    margin: 0,
    fontSize: "19px",
    fontWeight: "800"
  },

  detailsId: {
    margin:
      "4px 0 0",
    color: "#98a2b3",
    fontSize: "12px"
  },

  detailsGrid: {
    display: "grid",
    gridTemplateColumns:
      "repeat(2, minmax(0, 1fr))",
    gap: "1px",
    background: "#eaecf0",
    border:
      "1px solid #eaecf0",
    borderRadius: "13px",
    overflow: "hidden"
  },

  detailItem: {
    background: "#ffffff",
    padding: "14px"
  },

  detailItemSpan: {
    color: "#98a2b3",
    fontSize: "11px"
  },

  reasonBox: {
    background: "#f8f9fc",
    border:
      "1px solid #eaecf0",
    borderRadius: "13px",
    padding: "15px",
    marginTop: "15px"
  },

  reasonBoxSpan: {
    color: "#98a2b3",
    fontSize: "11px",
    fontWeight: "700"
  },

  reasonBoxP: {
    margin:
      "7px 0 0",
    color: "#344054",
    fontSize: "13px",
    lineHeight: "1.5"
  }
};

export default LeaveManagement;