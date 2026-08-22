import React from "react";
import {
  BrowserRouter,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";

// =====================================
// LOGIN / REGISTER
// =====================================

import Login from "./pages/Login";
import Register from "./pages/Register";

// =====================================
// HR LAYOUT
// =====================================

import Layout from "./components/Layout";

// =====================================
// EMPLOYEE LAYOUT
// =====================================

import EmployeeLayout from "./components/EmployeeLayout";

// =====================================
// HR PAGES
// =====================================

import Dashboard from "./pages/Dashboard";
import Employees from "./pages/Employees";
import AttendanceOverview from "./pages/AttendanceOverview";
import LeaveManagement from "./pages/LeaveManagement";
import Payroll from "./pages/Payroll";

// =====================================
// EMPLOYEE PAGES
// =====================================

import EmployeeDashboard from "./pages/EmployeeDashboard";
import Attendance from "./pages/Attendance";
import Leave from "./pages/Leave";
import EmployeePayroll from "./pages/EmployeePayroll";


function App() {
  return (
    <BrowserRouter>

      <Routes>

        {/* =====================================
            LOGIN
        ===================================== */}

        <Route
          path="/login"
          element={<Login />}
        />


        {/* =====================================
            REGISTER
        ===================================== */}

        <Route
          path="/register"
          element={<Register />}
        />


        {/* =====================================
            EMPLOYEE DASHBOARD
        ===================================== */}

        <Route
          path="/dashboard"
          element={
            <EmployeeLayout
              employee={{
                name: "Employee",
                role: "Employee",
              }}
            >
              <EmployeeDashboard />
            </EmployeeLayout>
          }
        />


        {/* =====================================
            EMPLOYEE ATTENDANCE
        ===================================== */}

        <Route
          path="/attendance"
          element={
            <EmployeeLayout
              employee={{
                name: "Employee",
                role: "Employee",
              }}
            >
              <Attendance />
            </EmployeeLayout>
          }
        />


        {/* =====================================
            EMPLOYEE LEAVE
        ===================================== */}

        <Route
          path="/leave"
          element={
            <EmployeeLayout
              employee={{
                name: "Employee",
                role: "Employee",
              }}
            >
              <Leave />
            </EmployeeLayout>
          }
        />


        {/* =====================================
            EMPLOYEE PAYROLL
        ===================================== */}

        <Route
          path="/employee-payroll"
          element={
            <EmployeeLayout
              employee={{
                name: "Employee",
                role: "Employee",
              }}
            >
              <EmployeePayroll />
            </EmployeeLayout>
          }
        />


        {/* =====================================
            HR PORTAL
        ===================================== */}

        <Route element={<Layout />}>

          {/* HR DASHBOARD */}

          <Route
            path="/hr-dashboard"
            element={<Dashboard />}
          />

          {/* EMPLOYEES */}

          <Route
            path="/employees"
            element={<Employees />}
          />

          {/* ATTENDANCE OVERVIEW */}

          <Route
            path="/attendance-overview"
            element={<AttendanceOverview />}
          />

          {/* LEAVE MANAGEMENT */}

          <Route
            path="/leave-management"
            element={<LeaveManagement />}
          />

          {/* PAYROLL */}

          <Route
            path="/payroll"
            element={<Payroll />}
          />

        </Route>


        {/* =====================================
            DEFAULT ROUTE
        ===================================== */}

        <Route
          path="/"
          element={
            <Navigate
              to="/login"
              replace
            />
          }
        />


        {/* =====================================
            INVALID ROUTE
        ===================================== */}

        <Route
          path="*"
          element={
            <Navigate
              to="/login"
              replace
            />
          }
        />

      </Routes>

    </BrowserRouter>
  );
}

export default App;