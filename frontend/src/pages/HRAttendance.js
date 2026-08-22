import React, { useEffect, useState } from "react";

import {
    collection,
    getDocs
} from "firebase/firestore";

import { db } from "../firebase";

import HRLayout from "../components/HRLayout";


function HRAttendance() {

    const [attendance, setAttendance] = useState([]);

    const [loading, setLoading] = useState(true);

    const [search, setSearch] = useState("");

    const [statusFilter, setStatusFilter] = useState("All");


    useEffect(() => {
        loadAttendance();
    }, []);


    // =========================
    // LOAD ATTENDANCE
    // =========================

    const loadAttendance = async () => {

        try {

            setLoading(true);

            const snapshot = await getDocs(
                collection(db, "attendance")
            );

            const data = snapshot.docs.map((item) => ({
                id: item.id,
                ...item.data()
            }));


            // Newest records first
            data.sort((a, b) => {

                const dateA = new Date(a.date || 0);

                const dateB = new Date(b.date || 0);

                return dateB - dateA;

            });


            setAttendance(data);

        } catch (error) {

            console.error(
                "Attendance loading error:",
                error
            );

        } finally {

            setLoading(false);

        }

    };


    // =========================
    // COUNTS
    // =========================

    const presentCount = attendance.filter(
        (item) =>
            (item.status || "").toLowerCase() ===
            "present"
    ).length;


    const absentCount = attendance.filter(
        (item) =>
            (item.status || "").toLowerCase() ===
            "absent"
    ).length;


    const lateCount = attendance.filter(
        (item) =>
            (item.status || "").toLowerCase() ===
            "late"
    ).length;


    // =========================
    // SEARCH + FILTER
    // =========================

    const filteredAttendance = attendance.filter(
        (item) => {

            const searchText =
                search.toLowerCase();


            const employeeName = (
                item.employeeName ||
                item.name ||
                ""
            ).toLowerCase();


            const employeeId = (
                item.employeeId ||
                ""
            ).toLowerCase();


            const email = (
                item.email ||
                ""
            ).toLowerCase();


            const status = (
                item.status ||
                ""
            ).toLowerCase();


            const matchesSearch =
                employeeName.includes(searchText) ||
                employeeId.includes(searchText) ||
                email.includes(searchText);


            const matchesStatus =
                statusFilter === "All" ||
                status ===
                    statusFilter.toLowerCase();


            return (
                matchesSearch &&
                matchesStatus
            );

        }
    );


    // =========================
    // STATUS STYLE
    // =========================

    const getStatusStyle = (status) => {

        const value =
            (status || "").toLowerCase();


        if (value === "present") {

            return {
                color: "green",
                fontWeight: "bold"
            };

        }


        if (value === "absent") {

            return {
                color: "red",
                fontWeight: "bold"
            };

        }


        if (value === "late") {

            return {
                color: "orange",
                fontWeight: "bold"
            };

        }


        return {
            fontWeight: "bold"
        };

    };


    return (

        <HRLayout>

            <div>

                {/* =========================
                    TITLE
                ========================= */}

                <div className="page-title">

                    <h1>
                        Attendance Overview
                    </h1>

                    <p>
                        Monitor employee attendance
                        records
                    </p>

                </div>


                {/* =========================
                    STATISTICS
                ========================= */}

                <div className="cards">

                    <div className="card">

                        <div className="card-icon">
                            🕒
                        </div>

                        <h4>
                            Total Records
                        </h4>

                        <h2>
                            {attendance.length}
                        </h2>

                    </div>


                    <div className="card">

                        <div className="card-icon">
                            ✅
                        </div>

                        <h4>
                            Present
                        </h4>

                        <h2>
                            {presentCount}
                        </h2>

                    </div>


                    <div className="card">

                        <div className="card-icon">
                            ❌
                        </div>

                        <h4>
                            Absent
                        </h4>

                        <h2>
                            {absentCount}
                        </h2>

                    </div>


                    <div className="card">

                        <div className="card-icon">
                            ⏰
                        </div>

                        <h4>
                            Late
                        </h4>

                        <h2>
                            {lateCount}
                        </h2>

                    </div>

                </div>


                <br />
                <br />


                {/* =========================
                    SEARCH
                ========================= */}

                <div
                    className="card"
                    style={{
                        display: "flex",
                        gap: "15px",
                        alignItems: "center",
                        flexWrap: "wrap"
                    }}
                >

                    <input
                        type="text"
                        placeholder="Search employee..."
                        value={search}
                        onChange={(e) =>
                            setSearch(e.target.value)
                        }
                        style={{
                            width: "300px",
                            padding: "10px"
                        }}
                    />


                    <select
                        value={statusFilter}
                        onChange={(e) =>
                            setStatusFilter(
                                e.target.value
                            )
                        }
                        style={{
                            padding: "10px"
                        }}
                    >

                        <option value="All">
                            All Status
                        </option>

                        <option value="Present">
                            Present
                        </option>

                        <option value="Absent">
                            Absent
                        </option>

                        <option value="Late">
                            Late
                        </option>

                    </select>


                    <button
                        className="primary-button"
                        onClick={loadAttendance}
                    >
                        Refresh
                    </button>

                </div>


                <br />


                {/* =========================
                    TABLE
                ========================= */}

                <div className="table-container">

                    {loading && (

                        <p>
                            Loading attendance...
                        </p>

                    )}


                    {!loading &&
                        filteredAttendance.length === 0 && (

                            <div>

                                <h3>
                                    No attendance records
                                    found
                                </h3>

                                <p>
                                    Employee attendance
                                    records will appear
                                    here.
                                </p>

                            </div>

                        )}


                    {!loading &&
                        filteredAttendance.length > 0 && (

                            <table>

                                <thead>

                                    <tr>

                                        <th>
                                            Employee ID
                                        </th>

                                        <th>
                                            Employee
                                        </th>

                                        <th>
                                            Date
                                        </th>

                                        <th>
                                            Check In
                                        </th>

                                        <th>
                                            Check Out
                                        </th>

                                        <th>
                                            Status
                                        </th>

                                    </tr>

                                </thead>


                                <tbody>

                                    {filteredAttendance.map(
                                        (record) => (

                                            <tr
                                                key={
                                                    record.id
                                                }
                                            >

                                                <td>
                                                    {
                                                        record.employeeId ||
                                                        "-"
                                                    }
                                                </td>


                                                <td>

                                                    <strong>
                                                        {
                                                            record.employeeName ||
                                                            record.name ||
                                                            "-"
                                                        }
                                                    </strong>

                                                    {record.email && (
                                                        <>
                                                            <br />

                                                            <small>
                                                                {
                                                                    record.email
                                                                }
                                                            </small>
                                                        </>
                                                    )}

                                                </td>


                                                <td>
                                                    {
                                                        record.date ||
                                                        "-"
                                                    }
                                                </td>


                                                <td>
                                                    {
                                                        record.checkIn ||
                                                        "-"
                                                    }
                                                </td>


                                                <td>
                                                    {
                                                        record.checkOut ||
                                                        "-"
                                                    }
                                                </td>


                                                <td>

                                                    <span
                                                        style={
                                                            getStatusStyle(
                                                                record.status
                                                            )
                                                        }
                                                    >
                                                        {
                                                            record.status ||
                                                            "Unknown"
                                                        }
                                                    </span>

                                                </td>

                                            </tr>

                                        )
                                    )}

                                </tbody>

                            </table>

                        )}

                </div>

            </div>

        </HRLayout>

    );

}


export default HRAttendance;