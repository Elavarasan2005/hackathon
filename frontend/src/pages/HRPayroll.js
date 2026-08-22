import React, { useEffect, useState } from "react";
import { collection, getDocs, updateDoc, doc } from "firebase/firestore";
import { db } from "../firebase";

const HRPayroll = () => {
  const [employees, setEmployees] = useState([]);
  const [filteredEmployees, setFilteredEmployees] = useState([]);

  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  const [editingEmployee, setEditingEmployee] = useState(null);
  const [salary, setSalary] = useState("");
  const [jobTitle, setJobTitle] = useState("");

  const loadPayroll = async () => {
    try {
      setLoading(true);

      const snapshot = await getDocs(collection(db, "employees"));

      const employeeData = snapshot.docs.map((item) => ({
        id: item.id,
        ...item.data(),
      }));

      setEmployees(employeeData);
      setFilteredEmployees(employeeData);
    } catch (error) {
      console.error("Payroll loading error:", error);

      alert(
        "Unable to load payroll data. Please check your Firebase connection."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPayroll();
  }, []);

  useEffect(() => {
    const result = employees.filter((employee) => {
      const name = employee.name || "";
      const email = employee.email || "";
      const employeeId = employee.employeeId || "";

      const searchText = search.toLowerCase();

      return (
        name.toLowerCase().includes(searchText) ||
        email.toLowerCase().includes(searchText) ||
        employeeId.toLowerCase().includes(searchText)
      );
    });

    setFilteredEmployees(result);
  }, [search, employees]);

  const openEdit = (employee) => {
    setEditingEmployee(employee);

    setSalary(employee.salary || "");
    setJobTitle(employee.jobTitle || employee.position || "");
  };

  const closeEdit = () => {
    setEditingEmployee(null);
    setSalary("");
    setJobTitle("");
  };

  const updatePayroll = async () => {
    if (!editingEmployee) return;

    if (salary === "" || Number(salary) < 0) {
      alert("Please enter a valid salary.");
      return;
    }

    try {
      await updateDoc(doc(db, "employees", editingEmployee.id), {
        salary: Number(salary),
        jobTitle: jobTitle,
      });

      alert("Payroll information updated successfully.");

      closeEdit();

      await loadPayroll();
    } catch (error) {
      console.error("Payroll update error:", error);
      alert("Unable to update payroll information.");
    }
  };

  const totalEmployees = employees.length;

  const totalPayroll = employees.reduce((total, employee) => {
    return total + Number(employee.salary || 0);
  }, 0);

  const averageSalary =
    totalEmployees > 0 ? totalPayroll / totalEmployees : 0;

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0,
    }).format(amount);
  };

  return (
    <div className="hr-layout">

      {/* SIDEBAR */}
      <aside className="hr-sidebar">

        <div className="brand">
          <div className="brand-logo">D</div>

          <div>
            <h2>Dayflow</h2>
            <p>HR Management</p>
          </div>
        </div>

        <nav className="sidebar-menu">

          <a href="/hr-dashboard">
            🏠 <span>Dashboard</span>
          </a>

          <a href="/employees">
            👥 <span>Employees</span>
          </a>

          <a href="/hr-attendance">
            📊 <span>Attendance</span>
          </a>

          <a href="/leave-management">
            🗓️ <span>Leave Management</span>
          </a>

          <a
            href="/payroll"
            className="active"
          >
            💰 <span>Payroll</span>
          </a>

        </nav>

        <button
          className="logout-button"
          onClick={() => {
            localStorage.clear();
            window.location.href = "/login";
          }}
        >
          🚪 Logout
        </button>

      </aside>

      {/* MAIN CONTENT */}
      <main className="hr-main">

        {/* TOP BAR */}
        <header className="topbar">

          <div>
            <h1>Dayflow HRMS</h1>
            <p>Human Resource Management System</p>
          </div>

          <div className="profile">

            <div className="profile-circle">
              H
            </div>

            <div>
              <strong>HR Admin</strong>
              <span>HR</span>
            </div>

          </div>

        </header>

        {/* PAGE */}
        <section className="payroll-page">

          <div className="page-heading">

            <div>
              <h1>Payroll Management</h1>
              <p>
                Manage employee salaries and payroll information.
              </p>
            </div>

          </div>

          {/* STATISTICS */}
          <div className="payroll-stats">

            <div className="stat-card">

              <div className="stat-icon employees-icon">
                👥
              </div>

              <div>
                <p>Employees</p>
                <h2>{totalEmployees}</h2>
              </div>

            </div>

            <div className="stat-card">

              <div className="stat-icon salary-icon">
                ₹
              </div>

              <div>
                <p>Monthly Payroll</p>
                <h2>{formatCurrency(totalPayroll)}</h2>
              </div>

            </div>

            <div className="stat-card">

              <div className="stat-icon average-icon">
                📈
              </div>

              <div>
                <p>Average Salary</p>
                <h2>{formatCurrency(averageSalary)}</h2>
              </div>

            </div>

          </div>

          {/* PAYROLL TABLE */}
          <div className="payroll-container">

            <div className="table-header">

              <div>
                <h2>Employee Payroll</h2>
                <p>
                  Update salary and job information.
                </p>
              </div>

              <input
                type="text"
                placeholder="🔍 Search employee..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />

            </div>

            {loading ? (

              <div className="loading">
                Loading payroll...
              </div>

            ) : filteredEmployees.length === 0 ? (

              <div className="empty-state">

                <div className="empty-icon">
                  👥
                </div>

                <h3>No employees found</h3>

                <p>
                  Create employees first to manage payroll.
                </p>

              </div>

            ) : (

              <div className="table-wrapper">

                <table>

                  <thead>

                    <tr>
                      <th>Employee</th>
                      <th>Employee ID</th>
                      <th>Email</th>
                      <th>Job Title</th>
                      <th>Monthly Salary</th>
                      <th>Action</th>
                    </tr>

                  </thead>

                  <tbody>

                    {filteredEmployees.map((employee) => (

                      <tr key={employee.id}>

                        <td>

                          <div className="employee-cell">

                            <div className="employee-avatar">
                              {(employee.name || "E")
                                .charAt(0)
                                .toUpperCase()}
                            </div>

                            <strong>
                              {employee.name || "Unknown Employee"}
                            </strong>

                          </div>

                        </td>

                        <td>
                          {employee.employeeId || employee.id}
                        </td>

                        <td>
                          {employee.email || "-"}
                        </td>

                        <td>
                          {employee.jobTitle ||
                            employee.position ||
                            "Employee"}
                        </td>

                        <td className="salary">

                          {formatCurrency(
                            Number(employee.salary || 0)
                          )}

                        </td>

                        <td>

                          <button
                            className="edit-button"
                            onClick={() =>
                              openEdit(employee)
                            }
                          >
                            ✏️ Edit
                          </button>

                        </td>

                      </tr>

                    ))}

                  </tbody>

                </table>

              </div>

            )}

          </div>

        </section>

      </main>

      {/* EDIT MODAL */}
      {editingEmployee && (

        <div className="modal-overlay">

          <div className="modal">

            <div className="modal-header">

              <div>
                <h2>Edit Payroll</h2>
                <p>
                  {editingEmployee.name}
                </p>
              </div>

              <button
                className="close-button"
                onClick={closeEdit}
              >
                ×
              </button>

            </div>

            <div className="modal-body">

              <label>
                Employee Name
              </label>

              <input
                type="text"
                value={editingEmployee.name || ""}
                disabled
              />

              <label>
                Job Title
              </label>

              <input
                type="text"
                value={jobTitle}
                onChange={(e) =>
                  setJobTitle(e.target.value)
                }
                placeholder="Enter job title"
              />

              <label>
                Monthly Salary
              </label>

              <input
                type="number"
                value={salary}
                onChange={(e) =>
                  setSalary(e.target.value)
                }
                placeholder="Enter salary"
              />

            </div>

            <div className="modal-footer">

              <button
                className="cancel-button"
                onClick={closeEdit}
              >
                Cancel
              </button>

              <button
                className="save-button"
                onClick={updatePayroll}
              >
                Save Changes
              </button>

            </div>

          </div>

        </div>

      )}

    </div>
  );
};

export default HRPayroll;