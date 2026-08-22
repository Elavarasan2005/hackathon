import React from "react";
import {
  BrowserRouter,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";

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

        {/* All modules share the same sidebar */}

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

        {/* Default */}

        <Route
          path="/"
          element={
            <Navigate
              to="/hr-dashboard"
              replace
            />
          }
        />

        <Route
          path="*"
          element={
            <Navigate
              to="/hr-dashboard"
              replace
            />
          }
        />

      </Routes>

    </BrowserRouter>
  );
}

export default App;