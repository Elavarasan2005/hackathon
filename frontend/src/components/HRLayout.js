import React from "react";
import { signOut } from "firebase/auth";
import { auth } from "../firebase";
import { useNavigate } from "react-router-dom";
import "./HRLayout.css";

function HRLayout({ children }) {

    const navigate = useNavigate();

    const employee = JSON.parse(
        localStorage.getItem("employee")
    );

    const logout = async () => {

        try {

            await signOut(auth);

            localStorage.removeItem("employee");

            navigate("/");

        } catch (error) {

            console.error("Logout error:", error);

        }
    };

    if (!employee || employee.role !== "HR") {

        return null;
    }

    return (

        <div className="hr-layout">

            {/* SIDEBAR */}

            <aside className="sidebar">

                <div>

                    <h1 className="logo">
                        Dayflow
                    </h1>

                    <p className="hr-label">
                        HR Management
                    </p>


                    <nav className="sidebar-nav">

                        <button
                            onClick={() =>
                                navigate("/dashboard")
                            }
                        >
                            🏠 Dashboard
                        </button>


                        <button
                            onClick={() =>
                                navigate("/hr/employees")
                            }
                        >
                            👥 Employees
                        </button>


                        <button
                            onClick={() =>
                                navigate("/hr/attendance")
                            }
                        >
                            🕒 Attendance
                        </button>


                        <button
                            onClick={() =>
                                navigate("/hr/leaves")
                            }
                        >
                            📅 Leave Management
                        </button>


                        <button
                            onClick={() =>
                                navigate("/hr/payroll")
                            }
                        >
                            💰 Payroll
                        </button>

                    </nav>

                </div>


                <div className="sidebar-bottom">

                    <button
                        onClick={logout}
                        className="logout-button"
                    >
                        🚪 Logout
                    </button>

                </div>

            </aside>


            {/* MAIN */}

            <main className="main-content">

                <header className="topbar">

                    <div>

                        <h2>
                            Dayflow HRMS
                        </h2>

                        <p>
                            Human Resource Management System
                        </p>

                    </div>


                    <div className="profile">

                        <div className="avatar">

                            {
                                employee.name
                                    ? employee.name
                                        .charAt(0)
                                        .toUpperCase()
                                    : "H"
                            }

                        </div>


                        <div>

                            <strong>
                                {employee.name}
                            </strong>

                            <small>
                                HR
                            </small>

                        </div>

                    </div>

                </header>


                <section className="page-content">

                    {children}

                </section>

            </main>

        </div>
    );
}

export default HRLayout;