import React, { useEffect, useState } from "react";
import {
  collection,
  getDocs,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
} from "firebase/firestore";
import { db } from "../firebase";

const Employees = () => {
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);

  const [search, setSearch] = useState("");
  const [department, setDepartment] = useState("All");

  const [showAdd, setShowAdd] = useState(false);
  const [showView, setShowView] = useState(false);
  const [showEdit, setShowEdit] = useState(false);
  const [showDelete, setShowDelete] = useState(false);

  const [selectedEmployee, setSelectedEmployee] = useState(null);

  const [popup, setPopup] = useState({
    show: false,
    type: "success",
    title: "",
    message: "",
  });

  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    department: "",
    position: "",
    salary: "",
    joiningDate: "",
    status: "Active",
  });

  /* =====================================================
     POPUP
     ===================================================== */

  const showPopup = (type, title, message) => {
    setPopup({
      show: true,
      type,
      title,
      message,
    });

    setTimeout(() => {
      setPopup((prev) => ({
        ...prev,
        show: false,
      }));
    }, 3000);
  };

  /* =====================================================
     LOAD EMPLOYEES
     ===================================================== */

  const loadEmployees = async () => {
    try {
      setLoading(true);

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
        "Error loading employees:",
        error
      );

      showPopup(
        "error",
        "Unable to Load",
        "Unable to load employee data."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadEmployees();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  /* =====================================================
     FORM
     ===================================================== */

  const handleChange = (e) => {
    const { name, value } = e.target;

    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const resetForm = () => {
    setForm({
      name: "",
      email: "",
      phone: "",
      department: "",
      position: "",
      salary: "",
      joiningDate: "",
      status: "Active",
    });
  };

  /* =====================================================
     ADD
     ===================================================== */

  const handleAddEmployee = async (e) => {
    e.preventDefault();

    if (
      !form.name ||
      !form.email ||
      !form.department
    ) {
      showPopup(
        "error",
        "Missing Information",
        "Please fill in the required fields."
      );

      return;
    }

    try {
      await addDoc(
        collection(db, "employees"),
        {
          ...form,
          salary: Number(form.salary) || 0,
          createdAt: new Date().toISOString(),
        }
      );

      setShowAdd(false);
      resetForm();

      await loadEmployees();

      showPopup(
        "success",
        "Employee Added",
        "Employee has been added successfully."
      );
    } catch (error) {
      console.error(error);

      showPopup(
        "error",
        "Failed",
        "Unable to add employee."
      );
    }
  };

  /* =====================================================
     EDIT
     ===================================================== */

  const openEdit = (employee) => {
    setSelectedEmployee(employee);

    setForm({
      name: employee.name || "",
      email: employee.email || "",
      phone: employee.phone || "",
      department: employee.department || "",
      position: employee.position || "",
      salary: employee.salary || "",
      joiningDate:
        employee.joiningDate || "",
      status: employee.status || "Active",
    });

    setShowEdit(true);
  };

  const handleEditEmployee = async (e) => {
    e.preventDefault();

    if (!selectedEmployee) {
      return;
    }

    try {
      await updateDoc(
        doc(
          db,
          "employees",
          selectedEmployee.id
        ),
        {
          ...form,
          salary: Number(form.salary) || 0,
          updatedAt: new Date().toISOString(),
        }
      );

      setShowEdit(false);
      setSelectedEmployee(null);

      resetForm();

      await loadEmployees();

      showPopup(
        "success",
        "Employee Updated",
        "Employee details have been updated."
      );
    } catch (error) {
      console.error(error);

      showPopup(
        "error",
        "Update Failed",
        "Unable to update employee."
      );
    }
  };

  /* =====================================================
     DELETE
     ===================================================== */

  const openDelete = (employee) => {
    setSelectedEmployee(employee);
    setShowDelete(true);
  };

  const handleDeleteEmployee = async () => {
    if (!selectedEmployee) {
      return;
    }

    try {
      await deleteDoc(
        doc(
          db,
          "employees",
          selectedEmployee.id
        )
      );

      setShowDelete(false);
      setSelectedEmployee(null);

      await loadEmployees();

      showPopup(
        "success",
        "Employee Deleted",
        "Employee has been removed successfully."
      );
    } catch (error) {
      console.error(error);

      showPopup(
        "error",
        "Delete Failed",
        "Unable to delete employee."
      );
    }
  };

  /* =====================================================
     VIEW
     ===================================================== */

  const openView = (employee) => {
    setSelectedEmployee(employee);
    setShowView(true);
  };

  /* =====================================================
     FILTER
     ===================================================== */

  const departments = [
    "All",
    ...new Set(
      employees
        .map(
          (employee) =>
            employee.department
        )
        .filter(Boolean)
    ),
  ];

  const filteredEmployees =
    employees.filter((employee) => {
      const searchValue =
        search.toLowerCase();

      const matchesSearch =
        (employee.name || "")
          .toLowerCase()
          .includes(searchValue) ||
        (employee.email || "")
          .toLowerCase()
          .includes(searchValue) ||
        (employee.position || "")
          .toLowerCase()
          .includes(searchValue);

      const matchesDepartment =
        department === "All" ||
        employee.department ===
          department;

      return (
        matchesSearch &&
        matchesDepartment
      );
    });

  /* =====================================================
     STATS
     ===================================================== */

  const totalEmployees =
    employees.length;

  const activeEmployees =
    employees.filter(
      (employee) =>
        employee.status === "Active" ||
        !employee.status
    ).length;

  const inactiveEmployees =
    employees.filter(
      (employee) =>
        employee.status === "Inactive"
    ).length;

  const departmentsCount =
    new Set(
      employees
        .map(
          (employee) =>
            employee.department
        )
        .filter(Boolean)
    ).size;

  /* =====================================================
     INITIALS
     ===================================================== */

  const getInitials = (name) => {
    if (!name) {
      return "EM";
    }

    return name
      .split(" ")
      .map((word) => word[0])
      .join("")
      .substring(0, 2)
      .toUpperCase();
  };

  return (
    <div style={styles.page}>

      {/* HEADER */}

      <div style={styles.header}>
        <div>
          <h1 style={styles.title}>
            Employees
          </h1>

          <p style={styles.subtitle}>
            Manage your organization's
            employees and their information
          </p>
        </div>

        <button
          style={styles.primaryButton}
          onClick={() => {
            resetForm();
            setShowAdd(true);
          }}
        >
          <span style={styles.buttonIcon}>
            +
          </span>

          Add Employee
        </button>
      </div>

      {/* STATS */}

      <div style={styles.statsGrid}>

        <StatCard
          icon="👥"
          title="Total Employees"
          value={totalEmployees}
          color="#7c3aed"
        />

        <StatCard
          icon="✓"
          title="Active Employees"
          value={activeEmployees}
          color="#16a34a"
        />

        <StatCard
          icon="○"
          title="Inactive Employees"
          value={inactiveEmployees}
          color="#ef4444"
        />

        <StatCard
          icon="▦"
          title="Departments"
          value={departmentsCount}
          color="#2563eb"
        />

      </div>

      {/* MAIN CARD */}

      <div style={styles.card}>

        {/* TOOLBAR */}

        <div style={styles.toolbar}>

          <div
            style={styles.searchContainer}
          >
            <span
              style={styles.searchIcon}
            >
              ⌕
            </span>

            <input
              type="text"
              placeholder="Search employees..."
              value={search}
              onChange={(e) =>
                setSearch(e.target.value)
              }
              style={styles.searchInput}
            />
          </div>

          <select
            value={department}
            onChange={(e) =>
              setDepartment(
                e.target.value
              )
            }
            style={styles.select}
          >
            {departments.map(
              (item) => (
                <option
                  key={item}
                  value={item}
                >
                  {item === "All"
                    ? "All Departments"
                    : item}
                </option>
              )
            )}
          </select>

        </div>

        {/* DATA */}

        {loading ? (
          <div style={styles.loading}>
            <div
              style={styles.spinner}
            ></div>

            <p>
              Loading employees...
            </p>
          </div>
        ) : filteredEmployees.length ===
          0 ? (
          <div style={styles.empty}>

            <div
              style={styles.emptyIcon}
            >
              👥
            </div>

            <h3>
              No employees found
            </h3>

            <p>
              Add your first employee
              to get started.
            </p>

            <button
              style={
                styles.primaryButton
              }
              onClick={() => {
                resetForm();
                setShowAdd(true);
              }}
            >
              + Add Employee
            </button>

          </div>
        ) : (
          <div
            style={styles.tableWrapper}
          >

            <table style={styles.table}>

              <thead>
                <tr>
                  <th style={styles.th}>
                    Employee
                  </th>

                  <th style={styles.th}>
                    Department
                  </th>

                  <th style={styles.th}>
                    Position
                  </th>

                  <th style={styles.th}>
                    Phone
                  </th>

                  <th style={styles.th}>
                    Status
                  </th>

                  <th style={styles.th}>
                    Actions
                  </th>
                </tr>
              </thead>

              <tbody>

                {filteredEmployees.map(
                  (employee) => (
                    <tr
                      key={employee.id}
                      style={styles.tr}
                    >

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
                            {getInitials(
                              employee.name
                            )}
                          </div>

                          <div>

                            <div
                              style={
                                styles.employeeName
                              }
                            >
                              {employee.name ||
                                "Unnamed"}
                            </div>

                            <div
                              style={
                                styles.employeeEmail
                              }
                            >
                              {employee.email ||
                                "-"}
                            </div>

                          </div>

                        </div>

                      </td>

                      <td style={styles.td}>
                        {employee.department ||
                          "-"}
                      </td>

                      <td style={styles.td}>
                        {employee.position ||
                          "-"}
                      </td>

                      <td style={styles.td}>
                        {employee.phone ||
                          "-"}
                      </td>

                      <td style={styles.td}>

                        <span
                          style={
                            employee.status ===
                            "Inactive"
                              ? styles.inactiveBadge
                              : styles.activeBadge
                          }
                        >
                          ●{" "}
                          {employee.status ||
                            "Active"}
                        </span>

                      </td>

                      <td style={styles.td}>

                        <div
                          style={styles.actions}
                        >

                          <button
                            style={
                              styles.viewButton
                            }
                            onClick={() =>
                              openView(
                                employee
                              )
                            }
                          >
                            👁
                          </button>

                          <button
                            style={
                              styles.editButton
                            }
                            onClick={() =>
                              openEdit(
                                employee
                              )
                            }
                          >
                            ✎
                          </button>

                          <button
                            style={
                              styles.deleteButton
                            }
                            onClick={() =>
                              openDelete(
                                employee
                              )
                            }
                          >
                            🗑
                          </button>

                        </div>

                      </td>

                    </tr>
                  )
                )}

              </tbody>

            </table>

          </div>
        )}

      </div>

      {/* ADD */}

      {showAdd && (
        <EmployeeFormModal
          title="Add Employee"
          subtitle="Create a new employee profile"
          form={form}
          handleChange={handleChange}
          onClose={() =>
            setShowAdd(false)
          }
          onSubmit={
            handleAddEmployee
          }
          submitText="Add Employee"
        />
      )}

      {/* EDIT */}

      {showEdit && (
        <EmployeeFormModal
          title="Edit Employee"
          subtitle="Update employee information"
          form={form}
          handleChange={handleChange}
          onClose={() => {
            setShowEdit(false);
            setSelectedEmployee(
              null
            );
          }}
          onSubmit={
            handleEditEmployee
          }
          submitText="Save Changes"
        />
      )}

      {/* VIEW */}

      {showView &&
        selectedEmployee && (
          <ModalOverlay>

            <div
              style={styles.viewModal}
            >

              <div
                style={
                  styles.modalHeader
                }
              >

                <div>
                  <h2
                    style={
                      styles.modalTitle
                    }
                  >
                    Employee Details
                  </h2>

                  <p
                    style={
                      styles.modalSubtitle
                    }
                  >
                    Employee information
                  </p>
                </div>

                <button
                  style={
                    styles.closeButton
                  }
                  onClick={() =>
                    setShowView(false)
                  }
                >
                  ×
                </button>

              </div>

              <div
                style={
                  styles.profileHeader
                }
              >

                <div
                  style={
                    styles.largeAvatar
                  }
                >
                  {getInitials(
                    selectedEmployee.name
                  )}
                </div>

                <div>

                  <h2
                    style={
                      styles.profileName
                    }
                  >
                    {selectedEmployee.name ||
                      "Unnamed Employee"}
                  </h2>

                  <p
                    style={
                      styles.profilePosition
                    }
                  >
                    {selectedEmployee.position ||
                      "Employee"}
                  </p>

                  <span
                    style={
                      selectedEmployee.status ===
                      "Inactive"
                        ? styles.inactiveBadge
                        : styles.activeBadge
                    }
                  >
                    ●{" "}
                    {selectedEmployee.status ||
                      "Active"}
                  </span>

                </div>

              </div>

              <div
                style={
                  styles.detailsGrid
                }
              >

                <Detail
                  label="Email"
                  value={
                    selectedEmployee.email
                  }
                />

                <Detail
                  label="Phone"
                  value={
                    selectedEmployee.phone
                  }
                />

                <Detail
                  label="Department"
                  value={
                    selectedEmployee.department
                  }
                />

                <Detail
                  label="Position"
                  value={
                    selectedEmployee.position
                  }
                />

                <Detail
                  label="Salary"
                  value={
                    selectedEmployee.salary
                      ? `₹${Number(
                          selectedEmployee.salary
                        ).toLocaleString()}`
                      : "-"
                  }
                />

                <Detail
                  label="Joining Date"
                  value={
                    selectedEmployee.joiningDate
                  }
                />

              </div>

              <div
                style={
                  styles.modalFooter
                }
              >

                <button
                  style={
                    styles.secondaryButton
                  }
                  onClick={() =>
                    setShowView(false)
                  }
                >
                  Close
                </button>

                <button
                  style={
                    styles.primaryButton
                  }
                  onClick={() => {
                    setShowView(false);
                    openEdit(
                      selectedEmployee
                    );
                  }}
                >
                  ✎ Edit Employee
                </button>

              </div>

            </div>

          </ModalOverlay>
        )}

      {/* DELETE */}

      {showDelete &&
        selectedEmployee && (
          <ModalOverlay>

            <div
              style={
                styles.deleteModal
              }
            >

              <div
                style={
                  styles.deleteIcon
                }
              >
                🗑
              </div>

              <h2
                style={
                  styles.deleteTitle
                }
              >
                Delete Employee?
              </h2>

              <p
                style={
                  styles.deleteText
                }
              >
                Are you sure you want
                to delete{" "}
                <strong>
                  {
                    selectedEmployee.name
                  }
                </strong>
                ? This action cannot
                be undone.
              </p>

              <div
                style={
                  styles.modalFooter
                }
              >

                <button
                  style={
                    styles.secondaryButton
                  }
                  onClick={() =>
                    setShowDelete(false)
                  }
                >
                  Cancel
                </button>

                <button
                  style={
                    styles.dangerButton
                  }
                  onClick={
                    handleDeleteEmployee
                  }
                >
                  Delete Employee
                </button>

              </div>

            </div>

          </ModalOverlay>
        )}

      {/* TOAST */}

      {popup.show && (
        <div
          style={styles.toast}
        >

          <div
            style={
              popup.type === "success"
                ? styles.toastSuccessIcon
                : styles.toastErrorIcon
            }
          >
            {popup.type ===
            "success"
              ? "✓"
              : "!"}
          </div>

          <div>

            <div
              style={
                styles.toastTitle
              }
            >
              {popup.title}
            </div>

            <div
              style={
                styles.toastMessage
              }
            >
              {popup.message}
            </div>

          </div>

          <button
            style={
              styles.toastClose
            }
            onClick={() =>
              setPopup(
                (prev) => ({
                  ...prev,
                  show: false,
                })
              )
            }
          >
            ×
          </button>

        </div>
      )}

    </div>
  );
};

/* =====================================================
   STAT CARD
   ===================================================== */

const StatCard = ({
  icon,
  title,
  value,
  color,
}) => (
  <div style={styles.statCard}>

    <div
      style={{
        ...styles.statIcon,
        backgroundColor:
          `${color}15`,
        color,
      }}
    >
      {icon}
    </div>

    <div>
      <p style={styles.statLabel}>
        {title}
      </p>

      <h2 style={styles.statValue}>
        {value}
      </h2>
    </div>

  </div>
);

/* =====================================================
   DETAIL
   ===================================================== */

const Detail = ({
  label,
  value,
}) => (
  <div style={styles.detailItem}>

    <span
      style={styles.detailLabel}
    >
      {label}
    </span>

    <span
      style={styles.detailValue}
    >
      {value || "-"}
    </span>

  </div>
);

/* =====================================================
   OVERLAY
   ===================================================== */

const ModalOverlay = ({
  children,
}) => (
  <div style={styles.overlay}>
    {children}
  </div>
);

/* =====================================================
   FORM MODAL
   ===================================================== */

const EmployeeFormModal = ({
  title,
  subtitle,
  form,
  handleChange,
  onClose,
  onSubmit,
  submitText,
}) => (
  <ModalOverlay>

    <div
      style={styles.formModal}
    >

      <div
        style={styles.modalHeader}
      >

        <div>

          <h2
            style={styles.modalTitle}
          >
            {title}
          </h2>

          <p
            style={styles.modalSubtitle}
          >
            {subtitle}
          </p>

        </div>

        <button
          style={
            styles.closeButton
          }
          onClick={onClose}
        >
          ×
        </button>

      </div>

      <form onSubmit={onSubmit}>

        <div
          style={styles.formGrid}
        >

          <Input
            label="Full Name"
            name="name"
            value={form.name}
            onChange={
              handleChange
            }
            required
            placeholder="Enter full name"
          />

          <Input
            label="Email"
            name="email"
            type="email"
            value={form.email}
            onChange={
              handleChange
            }
            required
            placeholder="Enter email"
          />

          <Input
            label="Phone"
            name="phone"
            value={form.phone}
            onChange={
              handleChange
            }
            placeholder="Enter phone number"
          />

          <div style={styles.field}>

            <label
              style={styles.label}
            >
              Department
              <span
                style={
                  styles.required
                }
              >
                *
              </span>
            </label>

            <select
              name="department"
              value={
                form.department
              }
              onChange={
                handleChange
              }
              style={styles.input}
              required
            >
              <option value="">
                Select department
              </option>

              <option value="HR">
                HR
              </option>

              <option value="Engineering">
                Engineering
              </option>

              <option value="Finance">
                Finance
              </option>

              <option value="Marketing">
                Marketing
              </option>

              <option value="Sales">
                Sales
              </option>

              <option value="Operations">
                Operations
              </option>

              <option value="IT">
                IT
              </option>
            </select>

          </div>

          <Input
            label="Position"
            name="position"
            value={
              form.position
            }
            onChange={
              handleChange
            }
            placeholder="Enter job position"
          />

          <Input
            label="Salary"
            name="salary"
            type="number"
            value={
              form.salary
            }
            onChange={
              handleChange
            }
            placeholder="Enter salary"
          />

          <Input
            label="Joining Date"
            name="joiningDate"
            type="date"
            value={
              form.joiningDate
            }
            onChange={
              handleChange
            }
          />

          <div style={styles.field}>

            <label
              style={styles.label}
            >
              Status
            </label>

            <select
              name="status"
              value={form.status}
              onChange={
                handleChange
              }
              style={styles.input}
            >
              <option value="Active">
                Active
              </option>

              <option value="Inactive">
                Inactive
              </option>
            </select>

          </div>

        </div>

        <div
          style={styles.modalFooter}
        >

          <button
            type="button"
            style={
              styles.secondaryButton
            }
            onClick={onClose}
          >
            Cancel
          </button>

          <button
            type="submit"
            style={
              styles.primaryButton
            }
          >
            {submitText}
          </button>

        </div>

      </form>

    </div>

  </ModalOverlay>
);

/* =====================================================
   INPUT
   ===================================================== */

const Input = ({
  label,
  name,
  type = "text",
  value,
  onChange,
  required,
  placeholder,
}) => (
  <div style={styles.field}>

    <label style={styles.label}>
      {label}

      {required && (
        <span
          style={styles.required}
        >
          *
        </span>
      )}
    </label>

    <input
      type={type}
      name={name}
      value={value}
      onChange={onChange}
      required={required}
      placeholder={placeholder}
      style={styles.input}
    />

  </div>
);

/* =====================================================
   STYLES
   ===================================================== */

const styles = {
  page: {
    minHeight: "100vh",
    background: "#f7f8fc",
    padding: "30px",
    boxSizing: "border-box",
    fontFamily:
      "Inter, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
    color: "#1f2937",
  },

  header: {
    display: "flex",
    justifyContent:
      "space-between",
    alignItems: "center",
    marginBottom: "28px",
    gap: "20px",
  },

  title: {
    margin: 0,
    fontSize: "30px",
    fontWeight: 750,
    color: "#111827",
  },

  subtitle: {
    margin: "7px 0 0",
    color: "#6b7280",
    fontSize: "14px",
  },

  primaryButton: {
    border: "none",
    background: "#111827",
    color: "#ffffff",
    padding: "12px 18px",
    borderRadius: "10px",
    fontSize: "14px",
    fontWeight: 650,
    cursor: "pointer",
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    gap: "8px",
    boxShadow:
      "0 4px 12px rgba(17,24,39,.12)",
  },

  buttonIcon: {
    fontSize: "20px",
  },

  statsGrid: {
    display: "grid",
    gridTemplateColumns:
      "repeat(auto-fit,minmax(210px,1fr))",
    gap: "18px",
    marginBottom: "24px",
  },

  statCard: {
    background: "#ffffff",
    border:
      "1px solid #e5e7eb",
    borderRadius: "16px",
    padding: "20px",
    display: "flex",
    alignItems: "center",
    gap: "15px",
    boxShadow:
      "0 2px 8px rgba(15,23,42,.03)",
  },

  statIcon: {
    width: "48px",
    height: "48px",
    borderRadius: "13px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: "22px",
    fontWeight: 700,
  },

  statLabel: {
    margin: 0,
    color: "#6b7280",
    fontSize: "13px",
  },

  statValue: {
    margin: "4px 0 0",
    fontSize: "25px",
    color: "#111827",
  },

  card: {
    background: "#ffffff",
    border:
      "1px solid #e5e7eb",
    borderRadius: "16px",
    overflow: "hidden",
    boxShadow:
      "0 2px 8px rgba(15,23,42,.03)",
  },

  toolbar: {
    padding: "18px",
    display: "flex",
    alignItems: "center",
    gap: "12px",
    borderBottom:
      "1px solid #eef0f3",
  },

  searchContainer: {
    flex: 1,
    maxWidth: "430px",
    position: "relative",
  },

  searchIcon: {
    position: "absolute",
    left: "14px",
    top: "50%",
    transform:
      "translateY(-50%)",
    color: "#9ca3af",
    fontSize: "20px",
  },

  searchInput: {
    width: "100%",
    boxSizing: "border-box",
    border:
      "1px solid #e5e7eb",
    borderRadius: "9px",
    padding:
      "11px 14px 11px 40px",
    outline: "none",
    fontSize: "14px",
    background: "#fafafa",
  },

  select: {
    border:
      "1px solid #e5e7eb",
    borderRadius: "9px",
    padding: "11px 14px",
    background: "#ffffff",
    color: "#374151",
    outline: "none",
    fontSize: "14px",
    minWidth: "170px",
  },

  tableWrapper: {
    width: "100%",
    overflowX: "auto",
  },

  table: {
    width: "100%",
    borderCollapse:
      "collapse",
    minWidth: "900px",
  },

  th: {
    textAlign: "left",
    padding: "14px 18px",
    background: "#fafafa",
    color: "#6b7280",
    fontSize: "12px",
    fontWeight: 700,
    textTransform:
      "uppercase",
    letterSpacing: ".04em",
    borderBottom:
      "1px solid #eef0f3",
  },

  td: {
    padding: "16px 18px",
    borderBottom:
      "1px solid #f0f1f3",
    fontSize: "14px",
    color: "#4b5563",
  },

  tr: {
    transition:
      "background .2s ease",
  },

  employeeCell: {
    display: "flex",
    alignItems: "center",
    gap: "12px",
  },

  avatar: {
    width: "40px",
    height: "40px",
    borderRadius: "11px",
    background: "#ede9fe",
    color: "#6d28d9",
    display: "flex",
    alignItems: "center",
    justifyContent:
      "center",
    fontWeight: 750,
    fontSize: "13px",
  },

  largeAvatar: {
    width: "68px",
    height: "68px",
    borderRadius: "18px",
    background: "#ede9fe",
    color: "#6d28d9",
    display: "flex",
    alignItems: "center",
    justifyContent:
      "center",
    fontWeight: 750,
    fontSize: "22px",
  },

  employeeName: {
    fontWeight: 650,
    color: "#111827",
    marginBottom: "3px",
  },

  employeeEmail: {
    color: "#9ca3af",
    fontSize: "12px",
  },

  activeBadge: {
    display: "inline-flex",
    alignItems: "center",
    gap: "5px",
    background: "#ecfdf3",
    color: "#15803d",
    borderRadius: "20px",
    padding: "5px 9px",
    fontSize: "12px",
    fontWeight: 650,
  },

  inactiveBadge: {
    display: "inline-flex",
    alignItems: "center",
    gap: "5px",
    background: "#fef2f2",
    color: "#dc2626",
    borderRadius: "20px",
    padding: "5px 9px",
    fontSize: "12px",
    fontWeight: 650,
  },

  actions: {
    display: "flex",
    gap: "7px",
  },

  viewButton: {
    border:
      "1px solid #e5e7eb",
    background: "#ffffff",
    color: "#2563eb",
    width: "34px",
    height: "34px",
    borderRadius: "8px",
    cursor: "pointer",
  },

  editButton: {
    border:
      "1px solid #e5e7eb",
    background: "#ffffff",
    color: "#7c3aed",
    width: "34px",
    height: "34px",
    borderRadius: "8px",
    cursor: "pointer",
  },

  deleteButton: {
    border:
      "1px solid #fee2e2",
    background: "#fffafa",
    color: "#dc2626",
    width: "34px",
    height: "34px",
    borderRadius: "8px",
    cursor: "pointer",
  },

  loading: {
    minHeight: "350px",
    display: "flex",
    flexDirection:
      "column",
    justifyContent:
      "center",
    alignItems: "center",
    color: "#6b7280",
  },

  spinner: {
    width: "32px",
    height: "32px",
    borderRadius: "50%",
    border:
      "3px solid #e5e7eb",
    borderTop:
      "3px solid #111827",
  },

  empty: {
    minHeight: "350px",
    display: "flex",
    flexDirection:
      "column",
    justifyContent:
      "center",
    alignItems: "center",
    textAlign: "center",
    padding: "30px",
  },

  emptyIcon: {
    width: "64px",
    height: "64px",
    borderRadius: "18px",
    background: "#f3f4f6",
    display: "flex",
    alignItems: "center",
    justifyContent:
      "center",
    fontSize: "28px",
  },

  overlay: {
    position: "fixed",
    inset: 0,
    background:
      "rgba(15,23,42,.52)",
    display: "flex",
    alignItems: "center",
    justifyContent:
      "center",
    zIndex: 1000,
    padding: "20px",
    boxSizing: "border-box",
  },

  formModal: {
    width: "100%",
    maxWidth: "720px",
    maxHeight: "90vh",
    overflowY: "auto",
    background: "#ffffff",
    borderRadius: "18px",
    boxShadow:
      "0 25px 70px rgba(0,0,0,.18)",
  },

  viewModal: {
    width: "100%",
    maxWidth: "650px",
    background: "#ffffff",
    borderRadius: "18px",
    padding: "26px",
    boxSizing: "border-box",
  },

  deleteModal: {
    width: "100%",
    maxWidth: "430px",
    background: "#ffffff",
    borderRadius: "18px",
    padding: "30px",
    boxSizing: "border-box",
    textAlign: "center",
  },

  modalHeader: {
    display: "flex",
    justifyContent:
      "space-between",
    alignItems: "flex-start",
    padding: "24px 26px",
    borderBottom:
      "1px solid #eef0f3",
  },

  modalTitle: {
    margin: 0,
    fontSize: "21px",
    color: "#111827",
  },

  modalSubtitle: {
    margin: "5px 0 0",
    color: "#9ca3af",
    fontSize: "13px",
  },

  closeButton: {
    border: "none",
    background: "#f3f4f6",
    color: "#4b5563",
    width: "34px",
    height: "34px",
    borderRadius: "9px",
    fontSize: "22px",
    cursor: "pointer",
  },

  formGrid: {
    display: "grid",
    gridTemplateColumns:
      "repeat(2,minmax(0,1fr))",
    gap: "18px",
    padding: "24px 26px",
  },

  field: {
    display: "flex",
    flexDirection:
      "column",
    gap: "7px",
  },

  label: {
    color: "#374151",
    fontSize: "13px",
    fontWeight: 650,
  },

  required: {
    color: "#ef4444",
    marginLeft: "3px",
  },

  input: {
    width: "100%",
    boxSizing: "border-box",
    border:
      "1px solid #dfe3e8",
    borderRadius: "9px",
    padding: "11px 12px",
    outline: "none",
    fontSize: "14px",
    color: "#111827",
    background: "#ffffff",
  },

  modalFooter: {
    display: "flex",
    justifyContent:
      "flex-end",
    gap: "10px",
    padding: "18px 26px",
    borderTop:
      "1px solid #eef0f3",
  },

  secondaryButton: {
    border:
      "1px solid #dfe3e8",
    background: "#ffffff",
    color: "#374151",
    padding: "11px 17px",
    borderRadius: "9px",
    fontSize: "14px",
    fontWeight: 600,
    cursor: "pointer",
  },

  dangerButton: {
    border: "none",
    background: "#dc2626",
    color: "#ffffff",
    padding: "11px 17px",
    borderRadius: "9px",
    fontSize: "14px",
    fontWeight: 650,
    cursor: "pointer",
  },

  profileHeader: {
    display: "flex",
    alignItems: "center",
    gap: "17px",
    padding: "25px 0",
    borderBottom:
      "1px solid #eef0f3",
  },

  profileName: {
    margin: "0 0 4px",
    fontSize: "22px",
    color: "#111827",
  },

  profilePosition: {
    margin: "0 0 10px",
    color: "#6b7280",
    fontSize: "14px",
  },

  detailsGrid: {
    display: "grid",
    gridTemplateColumns:
      "repeat(2,minmax(0,1fr))",
    gap: "20px",
    padding: "25px 0",
  },

  detailItem: {
    display: "flex",
    flexDirection:
      "column",
    gap: "5px",
  },

  detailLabel: {
    color: "#9ca3af",
    fontSize: "12px",
  },

  detailValue: {
    color: "#111827",
    fontSize: "14px",
    fontWeight: 600,
  },

  deleteIcon: {
    width: "64px",
    height: "64px",
    borderRadius: "18px",
    background: "#fef2f2",
    display: "flex",
    alignItems: "center",
    justifyContent:
      "center",
    fontSize: "27px",
    margin:
      "0 auto 17px",
  },

  deleteTitle: {
    margin: 0,
    fontSize: "21px",
    color: "#111827",
  },

  deleteText: {
    color: "#6b7280",
    fontSize: "14px",
    lineHeight: 1.6,
    margin:
      "10px 0 24px",
  },

  toast: {
    position: "fixed",
    right: "25px",
    bottom: "25px",
    zIndex: 2000,
    minWidth: "310px",
    maxWidth: "400px",
    background: "#ffffff",
    border:
      "1px solid #e5e7eb",
    borderRadius: "13px",
    padding: "15px",
    display: "flex",
    alignItems: "center",
    gap: "12px",
    boxShadow:
      "0 12px 35px rgba(0,0,0,.13)",
  },

  toastSuccessIcon: {
    width: "36px",
    height: "36px",
    borderRadius: "50%",
    background: "#dcfce7",
    color: "#16a34a",
    display: "flex",
    alignItems: "center",
    justifyContent:
      "center",
    fontWeight: 800,
  },

  toastErrorIcon: {
    width: "36px",
    height: "36px",
    borderRadius: "50%",
    background: "#fee2e2",
    color: "#dc2626",
    display: "flex",
    alignItems: "center",
    justifyContent:
      "center",
    fontWeight: 800,
  },

  toastTitle: {
    fontWeight: 700,
    fontSize: "14px",
    color: "#111827",
  },

  toastMessage: {
    marginTop: "3px",
    fontSize: "12px",
    color: "#6b7280",
  },

  toastClose: {
    marginLeft: "auto",
    border: "none",
    background: "transparent",
    color: "#9ca3af",
    fontSize: "20px",
    cursor: "pointer",
  },
};

export default Employees;