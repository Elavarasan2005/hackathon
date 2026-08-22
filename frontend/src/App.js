import React from "react";
import {
  BrowserRouter,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";

import Login from "./pages/Login";
import Register from "./pages/Register";

import Layout from "./components/Layout";

import Dashboard from "./pages/Dashboard";
import Employees from "./pages/Employees";
import AttendanceOverview from "./pages/AttendanceOverview";
import LeaveManagement from "./pages/LeaveManagement";
import Payroll from "./pages/Payroll";

function App() {
  return (
    <BrowserRouter>
      <Routes>

        {/* =========================
            AUTHENTICATION PAGES
        ========================= */}

        <Route
          path="/login"
          element={<Login />}
        />

        <Route
          path="/register"
          element={<Register />}
        />

        {/* =========================
            HR MODULES
            All modules use Layout
            and the same left sidebar
        ========================= */}

        <Route element={<Layout />}>

          <Route
            path="/hr-dashboard"
            element={<Dashboard />}
          />

          <Route
            path="/employees"
            element={<Employees />}
          />

          <Route
            path="/attendance-overview"
            element={<AttendanceOverview />}
          />

          <Route
            path="/leave-management"
            element={<LeaveManagement />}
          />

          <Route
            path="/payroll"
            element={<Payroll />}
          />

        </Route>

        {/* =========================
            DEFAULT PAGE
        ========================= */}

        <Route
          path="/"
          element={
            <Navigate
              to="/login"
              replace
            />
          }
        />

        {/* =========================
            INVALID URL
        ========================= */}

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