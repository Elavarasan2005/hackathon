import React, { useEffect, useState } from "react";
import {
    collection,
    getDocs,
    doc,
    updateDoc,
    deleteDoc
} from "firebase/firestore";

import { db } from "../firebase";
import HRLayout from "../components/HRLayout";

function HREmployees() {

    const [employees, setEmployees] = useState([]);
    const [loading, setLoading] = useState(true);

    const [search, setSearch] = useState("");

    const [editingEmployee, setEditingEmployee] =
        useState(null);


    useEffect(() => {

        loadEmployees();

    }, []);


    const loadEmployees = async () => {

        try {

            setLoading(true);

            const snapshot =
                await getDocs(
                    collection(db, "users")
                );

            const data = snapshot.docs.map(
                (item) => ({
                    id: item.id,
                    ...item.data()
                })
            );

            setEmployees(data);

        } catch (error) {

            console.error(
                "Employee loading error:",
                error
            );

        } finally {

            setLoading(false);

        }
    };


    // =========================
    // DELETE EMPLOYEE
    // =========================

    const deleteEmployee = async (id) => {

        const confirmDelete =
            window.confirm(
                "Are you sure you want to delete this employee?"
            );

        if (!confirmDelete) {
            return;
        }

        try {

            await deleteDoc(
                doc(db, "users", id)
            );

            setEmployees(
                (previous) =>
                    previous.filter(
                        (employee) =>
                            employee.id !== id
                    )
            );

            alert(
                "Employee deleted successfully"
            );

        } catch (error) {

            console.error(error);

            alert(
                "Unable to delete employee"
            );
        }
    };


    // =========================
    // EDIT EMPLOYEE
    // =========================

    const openEdit = (employee) => {

        setEditingEmployee({
            ...employee
        });
    };


    const handleEditChange = (e) => {

        setEditingEmployee({
            ...editingEmployee,
            [e.target.name]: e.target.value
        });

    };


    const saveEmployee = async () => {

        try {

            await updateDoc(
                doc(
                    db,
                    "users",
                    editingEmployee.id
                ),
                {
                    name:
                        editingEmployee.name || "",

                    employeeId:
                        editingEmployee.employeeId || "",

                    email:
                        editingEmployee.email || "",

                    role:
                        editingEmployee.role || "Employee",

                    jobTitle:
                        editingEmployee.jobTitle || "",

                    phone:
                        editingEmployee.phone || "",

                    address:
                        editingEmployee.address || "",

                    salary:
                        Number(
                            editingEmployee.salary || 0
                        )
                }
            );


            setEmployees(
                (previous) =>
                    previous.map(
                        (employee) =>
                            employee.id ===
                            editingEmployee.id
                                ? editingEmployee
                                : employee
                    )
            );


            setEditingEmployee(null);

            alert(
                "Employee updated successfully"
            );

        } catch (error) {

            console.error(error);

            alert(
                "Unable to update employee"
            );
        }
    };


    // =========================
    // SEARCH
    // =========================

    const filteredEmployees =
        employees.filter((employee) => {

            const text =
                search.toLowerCase();

            return (

                (employee.name || "")
                    .toLowerCase()
                    .includes(text)

                ||

                (employee.employeeId || "")
                    .toLowerCase()
                    .includes(text)

                ||

                (employee.email || "")
                    .toLowerCase()
                    .includes(text)

                ||

                (employee.role || "")
                    .toLowerCase()
                    .includes(text)

            );

        });


    return (

        <HRLayout>

            <div>

                {/* =========================
                    TITLE
                ========================= */}

                <div className="page-title">

                    <h1>
                        Employee Management
                    </h1>

                    <p>
                        View and manage all employees
                    </p>

                </div>


                {/* =========================
                    TOP SECTION
                ========================= */}

                <div
                    style={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        marginBottom: "20px",
                        gap: "15px"
                    }}
                >

                    <div className="card">

                        <h3>
                            Total Employees
                        </h3>

                        <h2>
                            {employees.length}
                        </h2>

                    </div>


                    <input
                        type="text"
                        placeholder="Search employee..."
                        value={search}
                        onChange={(e) =>
                            setSearch(
                                e.target.value
                            )
                        }
                        style={{
                            width: "300px",
                            padding: "12px"
                        }}
                    />

                </div>


                {/* =========================
                    TABLE
                ========================= */}

                <div className="table-container">

                    {loading && (

                        <p>
                            Loading employees...
                        </p>

                    )}


                    {!loading &&
                        filteredEmployees.length === 0 && (

                        <p>
                            No employees found.
                        </p>

                    )}


                    {!loading &&
                        filteredEmployees.length > 0 && (

                        <table>

                            <thead>

                                <tr>

                                    <th>
                                        Employee ID
                                    </th>

                                    <th>
                                        Name
                                    </th>

                                    <th>
                                        Email
                                    </th>

                                    <th>
                                        Role
                                    </th>

                                    <th>
                                        Job Title
                                    </th>

                                    <th>
                                        Phone
                                    </th>

                                    <th>
                                        Salary
                                    </th>

                                    <th>
                                        Action
                                    </th>

                                </tr>

                            </thead>


                            <tbody>

                                {filteredEmployees.map(
                                    (employee) => (

                                    <tr
                                        key={
                                            employee.id
                                        }
                                    >

                                        <td>
                                            {
                                                employee.employeeId ||
                                                "-"
                                            }
                                        </td>


                                        <td>
                                            {
                                                employee.name ||
                                                "-"
                                            }
                                        </td>


                                        <td>
                                            {
                                                employee.email ||
                                                "-"
                                            }
                                        </td>


                                        <td>
                                            {
                                                employee.role ||
                                                "-"
                                            }
                                        </td>


                                        <td>
                                            {
                                                employee.jobTitle ||
                                                "-"
                                            }
                                        </td>


                                        <td>
                                            {
                                                employee.phone ||
                                                "-"
                                            }
                                        </td>


                                        <td>
                                            ₹
                                            {
                                                employee.salary ||
                                                0
                                            }
                                        </td>


                                        <td>

                                            <button
                                                className="action-button"
                                                onClick={() =>
                                                    openEdit(
                                                        employee
                                                    )
                                                }
                                            >
                                                Edit
                                            </button>


                                            <button
                                                className="action-button reject"
                                                onClick={() =>
                                                    deleteEmployee(
                                                        employee.id
                                                    )
                                                }
                                            >
                                                Delete
                                            </button>

                                        </td>

                                    </tr>

                                ))}

                            </tbody>

                        </table>

                    )}

                </div>


                {/* =========================
                    EDIT MODAL
                ========================= */}

                {editingEmployee && (

                    <div
                        style={{
                            position: "fixed",
                            inset: 0,
                            background:
                                "rgba(0,0,0,0.5)",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            zIndex: 1000
                        }}
                    >

                        <div
                            style={{
                                background: "white",
                                width: "500px",
                                maxWidth: "90%",
                                padding: "30px",
                                borderRadius: "12px"
                            }}
                        >

                            <h2>
                                Edit Employee
                            </h2>

                            <br />


                            <input
                                type="text"
                                name="employeeId"
                                placeholder="Employee ID"
                                value={
                                    editingEmployee.employeeId ||
                                    ""
                                }
                                onChange={
                                    handleEditChange
                                }
                                style={{
                                    width: "100%",
                                    marginBottom: "12px"
                                }}
                            />


                            <input
                                type="text"
                                name="name"
                                placeholder="Full Name"
                                value={
                                    editingEmployee.name ||
                                    ""
                                }
                                onChange={
                                    handleEditChange
                                }
                                style={{
                                    width: "100%",
                                    marginBottom: "12px"
                                }}
                            />


                            <input
                                type="email"
                                name="email"
                                placeholder="Email"
                                value={
                                    editingEmployee.email ||
                                    ""
                                }
                                onChange={
                                    handleEditChange
                                }
                                style={{
                                    width: "100%",
                                    marginBottom: "12px"
                                }}
                            />


                            <select
                                name="role"
                                value={
                                    editingEmployee.role ||
                                    "Employee"
                                }
                                onChange={
                                    handleEditChange
                                }
                                style={{
                                    width: "100%",
                                    marginBottom: "12px"
                                }}
                            >

                                <option value="Employee">
                                    Employee
                                </option>

                                <option value="HR">
                                    HR
                                </option>

                            </select>


                            <input
                                type="text"
                                name="jobTitle"
                                placeholder="Job Title"
                                value={
                                    editingEmployee.jobTitle ||
                                    ""
                                }
                                onChange={
                                    handleEditChange
                                }
                                style={{
                                    width: "100%",
                                    marginBottom: "12px"
                                }}
                            />


                            <input
                                type="text"
                                name="phone"
                                placeholder="Phone"
                                value={
                                    editingEmployee.phone ||
                                    ""
                                }
                                onChange={
                                    handleEditChange
                                }
                                style={{
                                    width: "100%",
                                    marginBottom: "12px"
                                }}
                            />


                            <input
                                type="text"
                                name="address"
                                placeholder="Address"
                                value={
                                    editingEmployee.address ||
                                    ""
                                }
                                onChange={
                                    handleEditChange
                                }
                                style={{
                                    width: "100%",
                                    marginBottom: "12px"
                                }}
                            />


                            <input
                                type="number"
                                name="salary"
                                placeholder="Salary"
                                value={
                                    editingEmployee.salary ||
                                    0
                                }
                                onChange={
                                    handleEditChange
                                }
                                style={{
                                    width: "100%",
                                    marginBottom: "20px"
                                }}
                            />


                            <button
                                className="primary-button"
                                onClick={
                                    saveEmployee
                                }
                            >
                                Save Changes
                            </button>


                            {" "}


                            <button
                                className="action-button"
                                onClick={() =>
                                    setEditingEmployee(
                                        null
                                    )
                                }
                            >
                                Cancel
                            </button>

                        </div>

                    </div>

                )}

            </div>

        </HRLayout>

    );
}


export default HREmployees;