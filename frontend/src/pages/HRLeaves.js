import React, {
    useEffect,
    useState
} from "react";

import {
    collection,
    getDocs
} from "firebase/firestore";

import {
    db
} from "../firebase";

import HRLayout from "../components/HRLayout";


function HRAttendance() {

    const [attendance, setAttendance] =
        useState([]);

    const [loading, setLoading] =
        useState(true);


    useEffect(() => {

        loadAttendance();

    }, []);


    const loadAttendance = async () => {

        try {

            setLoading(true);

            const snapshot =
                await getDocs(
                    collection(
                        db,
                        "attendance"
                    )
                );


            const data = snapshot.docs.map(
                (item) => ({
                    id: item.id,
                    ...item.data()
                })
            );


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


    return (

        <HRLayout>

            <div>

                <div className="page-title">

                    <h1>
                        Attendance Overview
                    </h1>

                    <p>
                        Monitor employee attendance
                    </p>

                </div>


                <div className="card">

                    <h3>
                        Total Records:{" "}
                        {attendance.length}
                    </h3>

                </div>


                <br />


                <div className="table-container">

                    {loading && (

                        <p>
                            Loading attendance...
                        </p>

                    )}


                    {!loading &&
                        attendance.length === 0 && (

                        <p>
                            No attendance records found.
                        </p>

                    )}


                    {!loading &&
                        attendance.length > 0 && (

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

                                {attendance.map(
                                    (record) => (

                                    <tr
                                        key={record.id}
                                    >

                                        <td>
                                            {
                                                record.employeeId ||
                                                "-"
                                            }
                                        </td>

                                        <td>
                                            {
                                                record.employeeName ||
                                                "-"
                                            }
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
                                            {
                                                record.status ||
                                                "-"
                                            }
                                        </td>

                                    </tr>

                                ))}

                            </tbody>

                        </table>

                    )}

                </div>

            </div>

        </HRLayout>

    );
}


export default HRAttendance;