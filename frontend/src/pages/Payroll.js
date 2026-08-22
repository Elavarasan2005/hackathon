import React, {
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  collection,
  deleteDoc,
  doc,
  getDocs,
  setDoc,
} from "firebase/firestore";

import { db } from "../firebase";

function Payroll() {
  // =========================================================
  // STATE
  // =========================================================

  const [employees, setEmployees] = useState([]);
  const [payrolls, setPayrolls] = useState([]);

  const [loading, setLoading] = useState(true);

  const [showModal, setShowModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  const [editingId, setEditingId] = useState(null);
  const [deleteId, setDeleteId] = useState(null);

  const [search, setSearch] = useState("");

  const [popup, setPopup] = useState({
    show: false,
    type: "success",
    title: "",
    message: "",
  });

  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const currentMonth = new Date()
    .toISOString()
    .slice(0, 7);

  const [form, setForm] = useState({
    employeeId: "",
    employeeName: "",
    month: currentMonth,
    basicSalary: "",
    allowances: "",
    deductions: "",
    status: "Pending",
  });

  // =========================================================
  // POPUP
  // =========================================================

  const showPopup = (type, title, message) => {
    setPopup({
      show: true,
      type,
      title,
      message,
    });
  };

  const closePopup = () => {
    setPopup({
      show: false,
      type: "success",
      title: "",
      message: "",
    });
  };

  // =========================================================
  // LOAD EMPLOYEES
  // =========================================================

  const loadEmployees = useCallback(async () => {
    try {
      const snapshot = await getDocs(
        collection(db, "employees")
      );

      const data = snapshot.docs.map((item) => ({
        id: item.id,
        ...item.data(),
      }));

      setEmployees(data);
    } catch (error) {
      console.error(
        "Employees could not be loaded:",
        error
      );

      setEmployees([]);
    }
  }, []);

  // =========================================================
  // LOAD PAYROLL
  // =========================================================

  const loadPayroll = useCallback(async () => {
    try {
      const snapshot = await getDocs(
        collection(db, "payroll")
      );

      const data = snapshot.docs.map((item) => ({
        id: item.id,
        ...item.data(),
      }));

      setPayrolls(data);
    } catch (error) {
      console.error(
        "Payroll could not be loaded:",
        error
      );

      setPayrolls([]);
    }
  }, []);

  // =========================================================
  // INITIAL LOAD
  // =========================================================

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);

      await Promise.all([
        loadEmployees(),
        loadPayroll(),
      ]);

      setLoading(false);
    };

    loadData();
  }, [loadEmployees, loadPayroll]);

  // =========================================================
  // FORM CHANGE
  // =========================================================

  const handleChange = (e) => {
    const { name, value } = e.target;

    setForm((previous) => ({
      ...previous,
      [name]: value,
    }));
  };

  // =========================================================
  // EMPLOYEE CHANGE
  // =========================================================

  const handleEmployeeChange = (e) => {
    const employeeId = e.target.value;

    const employee = employees.find(
      (item) => item.id === employeeId
    );

    const employeeName =
      employee?.name ||
      employee?.employeeName ||
      employee?.fullName ||
      employee?.displayName ||
      employee?.email ||
      "Employee";

    setForm((previous) => ({
      ...previous,
      employeeId,
      employeeName,
    }));
  };

  // =========================================================
  // NET SALARY
  // =========================================================

  const calculateNetSalary = () => {
    const basic =
      Number(form.basicSalary) || 0;

    const allowances =
      Number(form.allowances) || 0;

    const deductions =
      Number(form.deductions) || 0;

    return (
      basic +
      allowances -
      deductions
    );
  };

  // =========================================================
  // MONEY FORMAT
  // =========================================================

  const money = (value) => {
    return (
      "₹" +
      Number(value || 0).toLocaleString(
        "en-IN"
      )
    );
  };

  // =========================================================
  // SAVE PAYROLL
  // =========================================================

  const savePayroll = async (e) => {
    e.preventDefault();

    if (!form.employeeId && !form.employeeName) {
      showPopup(
        "error",
        "Employee Required",
        "Please select or enter an employee."
      );
      return;
    }

    if (!form.basicSalary) {
      showPopup(
        "error",
        "Salary Required",
        "Please enter the basic salary."
      );
      return;
    }

    if (Number(form.basicSalary) < 0) {
      showPopup(
        "error",
        "Invalid Salary",
        "Basic salary cannot be negative."
      );
      return;
    }

    try {
      setSaving(true);

      const basicSalary =
        Number(form.basicSalary) || 0;

      const allowances =
        Number(form.allowances) || 0;

      const deductions =
        Number(form.deductions) || 0;

      const netSalary =
        basicSalary +
        allowances -
        deductions;

      const id =
        editingId ||
        `${form.employeeId || "employee"}_${form.month}`;

      const payrollData = {
        employeeId: form.employeeId,
        employeeName: form.employeeName,
        month: form.month,
        basicSalary,
        allowances,
        deductions,
        netSalary,
        status: form.status,
        updatedAt: new Date().toISOString(),
      };

      await setDoc(
        doc(db, "payroll", id),
        payrollData
      );

      const newRecord = {
        id,
        ...payrollData,
      };

      if (editingId) {
        setPayrolls((previous) =>
          previous.map((item) =>
            item.id === editingId
              ? newRecord
              : item
          )
        );
      } else {
        setPayrolls((previous) => [
          ...previous,
          newRecord,
        ]);
      }

      setSaving(false);

      setShowModal(false);
      resetForm();

      showPopup(
        "success",
        editingId
          ? "Payroll Updated"
          : "Payroll Added",
        editingId
          ? "Payroll information has been updated successfully."
          : "Payroll record has been added successfully."
      );
    } catch (error) {
      console.error(
        "Error saving payroll:",
        error
      );

      setSaving(false);

      showPopup(
        "error",
        "Save Failed",
        error.message ||
          "Could not save payroll information."
      );
    }
  };

  // =========================================================
  // OPEN ADD MODAL
  // =========================================================

  const openAddModal = () => {
    setEditingId(null);

    setForm({
      employeeId: "",
      employeeName: "",
      month: currentMonth,
      basicSalary: "",
      allowances: "",
      deductions: "",
      status: "Pending",
    });

    setShowModal(true);
  };

  // =========================================================
  // EDIT PAYROLL
  // =========================================================

  const editPayroll = (item) => {
    setEditingId(item.id);

    setForm({
      employeeId: item.employeeId || "",
      employeeName: item.employeeName || "",
      month: item.month || currentMonth,
      basicSalary:
        item.basicSalary ?? "",
      allowances:
        item.allowances ?? "",
      deductions:
        item.deductions ?? "",
      status:
        item.status || "Pending",
    });

    setShowModal(true);
  };

  // =========================================================
  // RESET FORM
  // =========================================================

  const resetForm = () => {
    setEditingId(null);

    setForm({
      employeeId: "",
      employeeName: "",
      month: currentMonth,
      basicSalary: "",
      allowances: "",
      deductions: "",
      status: "Pending",
    });
  };

  // =========================================================
  // CLOSE FORM
  // =========================================================

  const closeFormModal = () => {
    if (saving) return;

    setShowModal(false);
    resetForm();
  };

  // =========================================================
  // OPEN DELETE MODAL
  // =========================================================

  const openDeleteModal = (id) => {
    setDeleteId(id);
    setShowDeleteModal(true);
  };

  // =========================================================
  // DELETE PAYROLL
  // =========================================================

  const confirmDelete = async () => {
    if (!deleteId) return;

    try {
      setDeleting(true);

      await deleteDoc(
        doc(db, "payroll", deleteId)
      );

      setPayrolls((previous) =>
        previous.filter(
          (item) => item.id !== deleteId
        )
      );

      setDeleting(false);
      setDeleteId(null);
      setShowDeleteModal(false);

      showPopup(
        "success",
        "Payroll Deleted",
        "The payroll record has been deleted successfully."
      );
    } catch (error) {
      console.error(
        "Delete payroll error:",
        error
      );

      setDeleting(false);

      showPopup(
        "error",
        "Delete Failed",
        error.message ||
          "Could not delete payroll."
      );
    }
  };

  // =========================================================
  // SEARCH
  // =========================================================

  const filteredPayroll = useMemo(() => {
    const value =
      search.toLowerCase().trim();

    if (!value) {
      return payrolls;
    }

    return payrolls.filter((item) => {
      return (
        String(
          item.employeeName || ""
        )
          .toLowerCase()
          .includes(value) ||
        String(
          item.employeeId || ""
        )
          .toLowerCase()
          .includes(value) ||
        String(item.month || "")
          .toLowerCase()
          .includes(value) ||
        String(item.status || "")
          .toLowerCase()
          .includes(value)
      );
    });
  }, [payrolls, search]);

  // =========================================================
  // STATISTICS
  // =========================================================

  const totalPayroll = payrolls.reduce(
    (total, item) =>
      total +
      Number(item.netSalary || 0),
    0
  );

  const paidPayroll = payrolls
    .filter(
      (item) =>
        String(item.status)
          .toLowerCase() === "paid"
    )
    .reduce(
      (total, item) =>
        total +
        Number(item.netSalary || 0),
      0
    );

  const pendingPayroll = payrolls
    .filter(
      (item) =>
        String(item.status)
          .toLowerCase() !== "paid"
    )
    .reduce(
      (total, item) =>
        total +
        Number(item.netSalary || 0),
      0
    );

  // =========================================================
  // EMPLOYEE DISPLAY NAME
  // =========================================================

  const getEmployeeName = (employee) => {
    return (
      employee?.name ||
      employee?.employeeName ||
      employee?.fullName ||
      employee?.displayName ||
      employee?.email ||
      employee?.id ||
      "Employee"
    );
  };

  // =========================================================
  // RENDER
  // =========================================================

  return (
    <div style={styles.page}>

      {/* =====================================================
          HEADER
      ====================================================== */}

      <div style={styles.header}>

        <div>
          <div style={styles.brand}>
            DAYFLOW HRMS
          </div>

          <h1 style={styles.pageTitle}>
            Payroll
          </h1>

          <p style={styles.pageSubtitle}>
            Manage employee salaries,
            payments and payroll.
          </p>
        </div>

        <button
          style={styles.primaryButton}
          onClick={openAddModal}
        >
          <span style={styles.buttonPlus}>
            +
          </span>

          Add Payroll
        </button>

      </div>

      {/* =====================================================
          STATISTICS
      ====================================================== */}

      <div style={styles.statsGrid}>

        {/* TOTAL */}

        <div style={styles.statCard}>

          <div
            style={{
              ...styles.statIcon,
              background: "#eee9ff",
              color: "#6941c6",
            }}
          >
            ₹
          </div>

          <div>
            <div style={styles.statLabel}>
              Total Payroll
            </div>

            <div style={styles.statNumber}>
              {money(totalPayroll)}
            </div>

            <div style={styles.statSmall}>
              All payroll records
            </div>
          </div>

        </div>

        {/* PAID */}

        <div style={styles.statCard}>

          <div
            style={{
              ...styles.statIcon,
              background: "#dcfae6",
              color: "#039855",
            }}
          >
            ✓
          </div>

          <div>
            <div style={styles.statLabel}>
              Paid
            </div>

            <div style={styles.statNumber}>
              {money(paidPayroll)}
            </div>

            <div style={styles.statSmall}>
              Completed payments
            </div>
          </div>

        </div>

        {/* PENDING */}

        <div style={styles.statCard}>

          <div
            style={{
              ...styles.statIcon,
              background: "#fff3cd",
              color: "#b54708",
            }}
          >
            ⏳
          </div>

          <div>
            <div style={styles.statLabel}>
              Pending
            </div>

            <div style={styles.statNumber}>
              {money(pendingPayroll)}
            </div>

            <div style={styles.statSmall}>
              Waiting for payment
            </div>
          </div>

        </div>

        {/* RECORDS */}

        <div style={styles.statCard}>

          <div
            style={{
              ...styles.statIcon,
              background: "#e0ecff",
              color: "#155eef",
            }}
          >
            👥
          </div>

          <div>
            <div style={styles.statLabel}>
              Records
            </div>

            <div style={styles.statNumber}>
              {payrolls.length}
            </div>

            <div style={styles.statSmall}>
              Payroll records
            </div>
          </div>

        </div>

      </div>

      {/* =====================================================
          MAIN CARD
      ====================================================== */}

      <div style={styles.mainCard}>

        {/* SEARCH HEADER */}

        <div style={styles.cardHeader}>

          <div>
            <h2 style={styles.sectionTitle}>
              Payroll Records
            </h2>

            <p style={styles.sectionSubtitle}>
              View and manage employee
              payroll information.
            </p>
          </div>

          <div style={styles.searchWrapper}>

            <span style={styles.searchIcon}>
              ⌕
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

        </div>

        {/* =================================================
            LOADING
        ================================================== */}

        {loading ? (

          <div style={styles.loadingContainer}>

            <div style={styles.spinner} />

            <p>
              Loading payroll records...
            </p>

          </div>

        ) : filteredPayroll.length === 0 ? (

          /* =================================================
             EMPTY
          ================================================== */

          <div style={styles.emptyContainer}>

            <div style={styles.emptyIcon}>
              💰
            </div>

            <h3 style={styles.emptyTitle}>
              No Payroll Records
            </h3>

            <p style={styles.emptyText}>
              Start by adding a payroll
              record for an employee.
            </p>

            <button
              style={styles.emptyButton}
              onClick={openAddModal}
            >
              + Add Payroll
            </button>

          </div>

        ) : (

          /* =================================================
             TABLE
          ================================================== */

          <div style={styles.tableWrapper}>

            <table style={styles.table}>

              <thead>

                <tr>

                  <th style={styles.th}>
                    EMPLOYEE
                  </th>

                  <th style={styles.th}>
                    MONTH
                  </th>

                  <th style={styles.th}>
                    BASIC
                  </th>

                  <th style={styles.th}>
                    ALLOWANCES
                  </th>

                  <th style={styles.th}>
                    DEDUCTIONS
                  </th>

                  <th style={styles.th}>
                    NET SALARY
                  </th>

                  <th style={styles.th}>
                    STATUS
                  </th>

                  <th style={styles.th}>
                    ACTION
                  </th>

                </tr>

              </thead>

              <tbody>

                {filteredPayroll.map(
                  (item) => {

                    const employeeName =
                      item.employeeName ||
                      "Employee";

                    return (
                      <tr
                        key={item.id}
                        style={styles.tableRow}
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

                              <div
                                style={
                                  styles.employeeName
                                }
                              >
                                {employeeName}
                              </div>

                              <div
                                style={
                                  styles.employeeId
                                }
                              >
                                {item.employeeId ||
                                  "Employee ID"}
                              </div>

                            </div>

                          </div>

                        </td>

                        {/* MONTH */}

                        <td style={styles.td}>
                          {item.month || "-"}
                        </td>

                        {/* BASIC */}

                        <td style={styles.td}>
                          {money(
                            item.basicSalary
                          )}
                        </td>

                        {/* ALLOWANCES */}

                        <td style={styles.td}>
                          {money(
                            item.allowances
                          )}
                        </td>

                        {/* DEDUCTIONS */}

                        <td style={styles.td}>
                          {money(
                            item.deductions
                          )}
                        </td>

                        {/* NET */}

                        <td
                          style={
                            styles.netSalary
                          }
                        >
                          {money(
                            item.netSalary
                          )}
                        </td>

                        {/* STATUS */}

                        <td style={styles.td}>

                          <span
                            style={{
                              ...styles.status,
                              background:
                                String(
                                  item.status
                                ).toLowerCase() ===
                                "paid"
                                  ? "#dcfae6"
                                  : "#fff3cd",
                              color:
                                String(
                                  item.status
                                ).toLowerCase() ===
                                "paid"
                                  ? "#027a48"
                                  : "#b54708",
                            }}
                          >
                            {item.status ||
                              "Pending"}
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
                                styles.editButton
                              }
                              onClick={() =>
                                editPayroll(item)
                              }
                            >
                              Edit
                            </button>

                            <button
                              style={
                                styles.deleteButton
                              }
                              onClick={() =>
                                openDeleteModal(
                                  item.id
                                )
                              }
                            >
                              Delete
                            </button>

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
          ADD / EDIT MODAL
      ====================================================== */}

      {showModal && (

        <div
          style={styles.overlay}
          onMouseDown={(e) => {
            if (
              e.target === e.currentTarget
            ) {
              closeFormModal();
            }
          }}
        >

          <div style={styles.modal}>

            {/* MODAL HEADER */}

            <div style={styles.modalHeader}>

              <div>

                <div style={styles.modalIcon}>
                  ₹
                </div>

              </div>

              <div style={styles.modalHeadingArea}>

                <h2
                  style={
                    styles.modalTitle
                  }
                >
                  {editingId
                    ? "Edit Payroll"
                    : "Add Payroll"}
                </h2>

                <p
                  style={
                    styles.modalSubtitle
                  }
                >
                  {editingId
                    ? "Update employee salary information."
                    : "Enter employee salary information."}
                </p>

              </div>

              <button
                type="button"
                style={styles.closeButton}
                onClick={closeFormModal}
                disabled={saving}
              >
                ×
              </button>

            </div>

            {/* FORM */}

            <form onSubmit={savePayroll}>

              {/* EMPLOYEE */}

              <label style={styles.label}>
                Employee
              </label>

              {employees.length > 0 ? (

                <select
                  name="employeeId"
                  value={form.employeeId}
                  onChange={
                    handleEmployeeChange
                  }
                  style={styles.input}
                >

                  <option value="">
                    Select Employee
                  </option>

                  {employees.map(
                    (employee) => (

                      <option
                        key={employee.id}
                        value={employee.id}
                      >
                        {getEmployeeName(
                          employee
                        )}
                      </option>

                    )
                  )}

                </select>

              ) : (

                <input
                  type="text"
                  name="employeeName"
                  value={
                    form.employeeName
                  }
                  onChange={handleChange}
                  placeholder="Enter employee name"
                  style={styles.input}
                />

              )}

              {/* MONTH */}

              <label style={styles.label}>
                Payroll Month
              </label>

              <input
                type="month"
                name="month"
                value={form.month}
                onChange={handleChange}
                style={styles.input}
              />

              {/* SALARY GRID */}

              <div style={styles.formGrid}>

                <div>

                  <label style={styles.label}>
                    Basic Salary
                  </label>

                  <div
                    style={
                      styles.moneyInput
                    }
                  >
                    <span>₹</span>

                    <input
                      type="number"
                      name="basicSalary"
                      value={
                        form.basicSalary
                      }
                      onChange={handleChange}
                      placeholder="0"
                      min="0"
                      style={
                        styles.moneyField
                      }
                    />
                  </div>

                </div>

                <div>

                  <label style={styles.label}>
                    Allowances
                  </label>

                  <div
                    style={
                      styles.moneyInput
                    }
                  >
                    <span>₹</span>

                    <input
                      type="number"
                      name="allowances"
                      value={
                        form.allowances
                      }
                      onChange={handleChange}
                      placeholder="0"
                      min="0"
                      style={
                        styles.moneyField
                      }
                    />
                  </div>

                </div>

              </div>

              {/* DEDUCTIONS */}

              <label style={styles.label}>
                Deductions
              </label>

              <div style={styles.moneyInput}>

                <span>₹</span>

                <input
                  type="number"
                  name="deductions"
                  value={
                    form.deductions
                  }
                  onChange={handleChange}
                  placeholder="0"
                  min="0"
                  style={styles.moneyField}
                />

              </div>

              {/* STATUS */}

              <label style={styles.label}>
                Payment Status
              </label>

              <select
                name="status"
                value={form.status}
                onChange={handleChange}
                style={styles.input}
              >

                <option value="Pending">
                  Pending
                </option>

                <option value="Paid">
                  Paid
                </option>

              </select>

              {/* NET SALARY */}

              <div style={styles.calculationBox}>

                <div>

                  <div
                    style={
                      styles.calculationLabel
                    }
                  >
                    Net Salary
                  </div>

                  <div
                    style={
                      styles.calculationDescription
                    }
                  >
                    Basic + Allowances -
                    Deductions
                  </div>

                </div>

                <strong
                  style={
                    styles.calculationAmount
                  }
                >
                  {money(
                    calculateNetSalary()
                  )}
                </strong>

              </div>

              {/* MODAL BUTTONS */}

              <div
                style={
                  styles.modalActions
                }
              >

                <button
                  type="button"
                  style={
                    styles.cancelButton
                  }
                  onClick={
                    closeFormModal
                  }
                  disabled={saving}
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  style={
                    styles.saveButton
                  }
                  disabled={saving}
                >

                  {saving ? (
                    <>
                      <span
                        style={
                          styles.buttonSpinner
                        }
                      />

                      Saving...
                    </>
                  ) : (
                    editingId
                      ? "Update Payroll"
                      : "Save Payroll"
                  )}

                </button>

              </div>

            </form>

          </div>

        </div>

      )}

      {/* =====================================================
          DELETE CONFIRMATION
      ====================================================== */}

      {showDeleteModal && (

        <div
          style={styles.overlay}
          onMouseDown={(e) => {
            if (
              e.target === e.currentTarget &&
              !deleting
            ) {
              setShowDeleteModal(false);
              setDeleteId(null);
            }
          }}
        >

          <div
            style={
              styles.confirmModal
            }
          >

            <div
              style={
                styles.deleteIcon
              }
            >
              !
            </div>

            <h2
              style={
                styles.confirmTitle
              }
            >
              Delete Payroll?
            </h2>

            <p
              style={
                styles.confirmText
              }
            >
              Are you sure you want to
              delete this payroll record?
              This action cannot be undone.
            </p>

            <div
              style={
                styles.confirmActions
              }
            >

              <button
                style={
                  styles.cancelButton
                }
                onClick={() => {
                  setShowDeleteModal(
                    false
                  );
                  setDeleteId(null);
                }}
                disabled={deleting}
              >
                Cancel
              </button>

              <button
                style={
                  styles.confirmDeleteButton
                }
                onClick={confirmDelete}
                disabled={deleting}
              >
                {deleting
                  ? "Deleting..."
                  : "Yes, Delete"}
              </button>

            </div>

          </div>

        </div>

      )}

      {/* =====================================================
          SUCCESS / ERROR POPUP
      ====================================================== */}

      {popup.show && (

        <div style={styles.toastOverlay}>

          <div
            style={{
              ...styles.toast,
              borderLeft:
                popup.type === "success"
                  ? "5px solid #12b76a"
                  : "5px solid #f04438",
            }}
          >

            <div
              style={{
                ...styles.toastIcon,
                background:
                  popup.type === "success"
                    ? "#dcfae6"
                    : "#fee4e2",
                color:
                  popup.type === "success"
                    ? "#039855"
                    : "#d92d20",
              }}
            >
              {popup.type === "success"
                ? "✓"
                : "!"}
            </div>

            <div style={styles.toastContent}>

              <strong
                style={
                  styles.toastTitle
                }
              >
                {popup.title}
              </strong>

              <p
                style={
                  styles.toastMessage
                }
              >
                {popup.message}
              </p>

            </div>

            <button
              style={
                styles.toastClose
              }
              onClick={closePopup}
            >
              ×
            </button>

          </div>

        </div>

      )}

    </div>
  );
}

// =========================================================
// STYLES
// =========================================================

const styles = {
  // PAGE

  page: {
    minHeight: "100vh",
    background: "#f5f7fb",
    padding: "44px 36px 60px",
    boxSizing: "border-box",
    fontFamily:
      "-apple-system, BlinkMacSystemFont, 'Segoe UI', Arial, sans-serif",
    color: "#101828",
  },

  // HEADER

  header: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: "30px",
  },

  brand: {
    color: "#6246ea",
    fontSize: "14px",
    fontWeight: "800",
    letterSpacing: "3px",
    marginBottom: "10px",
  },

  pageTitle: {
    margin: 0,
    fontSize: "42px",
    lineHeight: "1.1",
    fontWeight: "800",
    letterSpacing: "-1px",
    color: "#101828",
  },

  pageSubtitle: {
    margin: "10px 0 0",
    color: "#667085",
    fontSize: "16px",
  },

  primaryButton: {
    border: "none",
    background:
      "linear-gradient(135deg, #6845e8, #4f46e5)",
    color: "#ffffff",
    padding: "14px 20px",
    borderRadius: "10px",
    cursor: "pointer",
    fontSize: "14px",
    fontWeight: "700",
    boxShadow:
      "0 7px 18px rgba(79,70,229,0.20)",
    display: "flex",
    alignItems: "center",
    gap: "8px",
  },

  buttonPlus: {
    fontSize: "20px",
    lineHeight: 1,
  },

  // STATS

  statsGrid: {
    display: "grid",
    gridTemplateColumns:
      "repeat(4, minmax(0, 1fr))",
    gap: "22px",
    marginBottom: "28px",
  },

  statCard: {
    background: "#ffffff",
    border: "1px solid #eaecf0",
    borderRadius: "16px",
    padding: "24px",
    minHeight: "105px",
    boxSizing: "border-box",
    display: "flex",
    alignItems: "center",
    gap: "17px",
    boxShadow:
      "0 4px 14px rgba(16,24,40,0.04)",
  },

  statIcon: {
    width: "54px",
    height: "54px",
    borderRadius: "14px",
    flexShrink: 0,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: "22px",
    fontWeight: "800",
  },

  statLabel: {
    color: "#667085",
    fontSize: "14px",
    marginBottom: "5px",
  },

  statNumber: {
    color: "#101828",
    fontSize: "23px",
    fontWeight: "800",
  },

  statSmall: {
    color: "#98a2b3",
    fontSize: "11px",
    marginTop: "4px",
  },

  // MAIN CARD

  mainCard: {
    background: "#ffffff",
    border: "1px solid #eaecf0",
    borderRadius: "17px",
    overflow: "hidden",
    boxShadow:
      "0 4px 16px rgba(16,24,40,0.04)",
  },

  cardHeader: {
    padding: "22px 26px",
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    gap: "25px",
    borderBottom:
      "1px solid #eaecf0",
  },

  sectionTitle: {
    margin: 0,
    fontSize: "20px",
    fontWeight: "750",
    color: "#101828",
  },

  sectionSubtitle: {
    margin: "5px 0 0",
    color: "#98a2b3",
    fontSize: "13px",
  },

  searchWrapper: {
    width: "285px",
    height: "42px",
    border: "1px solid #d0d5dd",
    borderRadius: "9px",
    display: "flex",
    alignItems: "center",
    padding: "0 12px",
    boxSizing: "border-box",
    background: "#ffffff",
  },

  searchIcon: {
    color: "#98a2b3",
    fontSize: "22px",
    marginRight: "7px",
  },

  searchInput: {
    border: "none",
    outline: "none",
    width: "100%",
    fontSize: "13px",
    color: "#344054",
    background: "transparent",
  },

  // TABLE

  tableWrapper: {
    width: "100%",
    overflowX: "auto",
  },

  table: {
    width: "100%",
    minWidth: "1050px",
    borderCollapse: "collapse",
  },

  th: {
    background: "#f8f9fc",
    color: "#667085",
    fontSize: "11px",
    fontWeight: "800",
    letterSpacing: "0.6px",
    textAlign: "left",
    padding: "15px 18px",
    whiteSpace: "nowrap",
  },

  tableRow: {
    borderTop:
      "1px solid #f2f4f7",
  },

  td: {
    padding: "17px 18px",
    fontSize: "13px",
    color: "#475467",
    whiteSpace: "nowrap",
  },

  employeeCell: {
    display: "flex",
    alignItems: "center",
    gap: "11px",
  },

  avatar: {
    width: "40px",
    height: "40px",
    borderRadius: "11px",
    background:
      "linear-gradient(135deg, #7048e8, #5b3fd1)",
    color: "#ffffff",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontWeight: "800",
    fontSize: "14px",
  },

  employeeName: {
    color: "#101828",
    fontWeight: "700",
    fontSize: "13px",
  },

  employeeId: {
    color: "#98a2b3",
    fontSize: "10px",
    marginTop: "3px",
  },

  netSalary: {
    padding: "17px 18px",
    fontSize: "13px",
    fontWeight: "800",
    color: "#101828",
    whiteSpace: "nowrap",
  },

  status: {
    display: "inline-flex",
    alignItems: "center",
    padding: "6px 11px",
    borderRadius: "20px",
    fontSize: "11px",
    fontWeight: "700",
  },

  actionGroup: {
    display: "flex",
    gap: "7px",
  },

  editButton: {
    border: "1px solid #d6bbfb",
    background: "#f9f5ff",
    color: "#6941c6",
    padding: "7px 11px",
    borderRadius: "7px",
    cursor: "pointer",
    fontSize: "11px",
    fontWeight: "700",
  },

  deleteButton: {
    border: "1px solid #fecdca",
    background: "#fff5f4",
    color: "#d92d20",
    padding: "7px 11px",
    borderRadius: "7px",
    cursor: "pointer",
    fontSize: "11px",
    fontWeight: "700",
  },

  // EMPTY

  loadingContainer: {
    minHeight: "330px",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    color: "#667085",
    fontSize: "14px",
  },

  spinner: {
    width: "30px",
    height: "30px",
    borderRadius: "50%",
    border:
      "3px solid #e4e7ec",
    borderTop:
      "3px solid #6941c6",
    marginBottom: "15px",
  },

  emptyContainer: {
    minHeight: "350px",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    textAlign: "center",
    padding: "30px",
    boxSizing: "border-box",
  },

  emptyIcon: {
    width: "68px",
    height: "68px",
    borderRadius: "18px",
    background: "#f4f3ff",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: "34px",
    marginBottom: "16px",
  },

  emptyTitle: {
    margin: 0,
    fontSize: "20px",
    fontWeight: "750",
    color: "#101828",
  },

  emptyText: {
    margin: "8px 0 20px",
    color: "#98a2b3",
    fontSize: "14px",
  },

  emptyButton: {
    border: "none",
    background:
      "linear-gradient(135deg, #6845e8, #4f46e5)",
    color: "#ffffff",
    padding: "11px 18px",
    borderRadius: "9px",
    cursor: "pointer",
    fontWeight: "700",
    fontSize: "13px",
  },

  // OVERLAY

  overlay: {
    position: "fixed",
    inset: 0,
    background:
      "rgba(16,24,40,0.58)",
    backdropFilter: "blur(3px)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    zIndex: 2000,
    padding: "20px",
    boxSizing: "border-box",
  },

  // FORM MODAL

  modal: {
    width: "100%",
    maxWidth: "530px",
    maxHeight: "92vh",
    overflowY: "auto",
    background: "#ffffff",
    borderRadius: "18px",
    padding: "27px",
    boxSizing: "border-box",
    boxShadow:
      "0 25px 70px rgba(16,24,40,0.25)",
  },

  modalHeader: {
    display: "flex",
    alignItems: "flex-start",
    gap: "13px",
    marginBottom: "22px",
  },

  modalIcon: {
    width: "43px",
    height: "43px",
    borderRadius: "12px",
    background: "#eee9ff",
    color: "#6941c6",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: "19px",
    fontWeight: "800",
  },

  modalHeadingArea: {
    flex: 1,
  },

  modalTitle: {
    margin: 0,
    fontSize: "21px",
    fontWeight: "800",
    color: "#101828",
  },

  modalSubtitle: {
    margin: "5px 0 0",
    color: "#98a2b3",
    fontSize: "12px",
  },

  closeButton: {
    width: "34px",
    height: "34px",
    border: "none",
    borderRadius: "8px",
    background: "#f2f4f7",
    color: "#667085",
    fontSize: "22px",
    cursor: "pointer",
    lineHeight: 1,
  },

  label: {
    display: "block",
    color: "#344054",
    fontSize: "12px",
    fontWeight: "700",
    marginBottom: "7px",
    marginTop: "15px",
  },

  input: {
    width: "100%",
    height: "44px",
    boxSizing: "border-box",
    padding: "0 12px",
    border: "1px solid #d0d5dd",
    borderRadius: "8px",
    outline: "none",
    fontSize: "13px",
    color: "#344054",
    background: "#ffffff",
  },

  formGrid: {
    display: "grid",
    gridTemplateColumns:
      "1fr 1fr",
    gap: "14px",
  },

  moneyInput: {
    height: "44px",
    display: "flex",
    alignItems: "center",
    border: "1px solid #d0d5dd",
    borderRadius: "8px",
    padding: "0 12px",
    boxSizing: "border-box",
    color: "#667085",
    fontSize: "13px",
  },

  moneyField: {
    border: "none",
    outline: "none",
    flex: 1,
    width: "100%",
    marginLeft: "6px",
    fontSize: "13px",
    color: "#344054",
  },

  calculationBox: {
    marginTop: "20px",
    padding: "15px",
    borderRadius: "11px",
    background:
      "linear-gradient(135deg, #f6f3ff, #f8f7ff)",
    border:
      "1px solid #e9dfff",
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
  },

  calculationLabel: {
    color: "#6941c6",
    fontWeight: "800",
    fontSize: "14px",
  },

  calculationDescription: {
    color: "#98a2b3",
    fontSize: "10px",
    marginTop: "3px",
  },

  calculationAmount: {
    color: "#5533b5",
    fontSize: "18px",
  },

  modalActions: {
    display: "flex",
    justifyContent: "flex-end",
    gap: "10px",
    marginTop: "23px",
  },

  cancelButton: {
    border: "1px solid #d0d5dd",
    background: "#ffffff",
    color: "#344054",
    padding: "10px 17px",
    borderRadius: "8px",
    cursor: "pointer",
    fontWeight: "700",
    fontSize: "12px",
  },

  saveButton: {
    border: "none",
    background:
      "linear-gradient(135deg, #6845e8, #4f46e5)",
    color: "#ffffff",
    padding: "10px 18px",
    borderRadius: "8px",
    cursor: "pointer",
    fontWeight: "700",
    fontSize: "12px",
    display: "flex",
    alignItems: "center",
    gap: "7px",
  },

  buttonSpinner: {
    width: "13px",
    height: "13px",
    border:
      "2px solid rgba(255,255,255,0.4)",
    borderTop:
      "2px solid #ffffff",
    borderRadius: "50%",
  },

  // DELETE MODAL

  confirmModal: {
    width: "100%",
    maxWidth: "400px",
    background: "#ffffff",
    borderRadius: "18px",
    padding: "30px",
    boxSizing: "border-box",
    textAlign: "center",
    boxShadow:
      "0 25px 70px rgba(16,24,40,0.25)",
  },

  deleteIcon: {
    width: "55px",
    height: "55px",
    margin: "0 auto 15px",
    borderRadius: "50%",
    background: "#fee4e2",
    color: "#d92d20",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: "25px",
    fontWeight: "800",
  },

  confirmTitle: {
    margin: 0,
    color: "#101828",
    fontSize: "21px",
    fontWeight: "800",
  },

  confirmText: {
    margin: "9px 0 22px",
    color: "#667085",
    fontSize: "13px",
    lineHeight: "1.6",
  },

  confirmActions: {
    display: "flex",
    justifyContent: "center",
    gap: "10px",
  },

  confirmDeleteButton: {
    border: "none",
    background: "#d92d20",
    color: "#ffffff",
    padding: "10px 18px",
    borderRadius: "8px",
    cursor: "pointer",
    fontWeight: "700",
    fontSize: "12px",
  },

  // TOAST

  toastOverlay: {
    position: "fixed",
    top: "25px",
    right: "25px",
    zIndex: 5000,
  },

  toast: {
    minWidth: "340px",
    maxWidth: "440px",
    background: "#ffffff",
    borderRadius: "12px",
    padding: "15px",
    display: "flex",
    alignItems: "flex-start",
    gap: "12px",
    boxSizing: "border-box",
    boxShadow:
      "0 12px 35px rgba(16,24,40,0.18)",
  },

  toastIcon: {
    width: "35px",
    height: "35px",
    borderRadius: "50%",
    flexShrink: 0,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontWeight: "800",
  },

  toastContent: {
    flex: 1,
  },

  toastTitle: {
    display: "block",
    color: "#101828",
    fontSize: "13px",
    marginBottom: "3px",
  },

  toastMessage: {
    margin: 0,
    color: "#667085",
    fontSize: "11px",
    lineHeight: "1.5",
  },

  toastClose: {
    border: "none",
    background: "transparent",
    color: "#98a2b3",
    fontSize: "19px",
    cursor: "pointer",
  },
};

export default Payroll;