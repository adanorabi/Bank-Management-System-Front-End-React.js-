import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter, Route, Routes, Navigate } from "react-router-dom";

import "assets/plugins/nucleo/css/nucleo.css";
import "@fortawesome/fontawesome-free/css/all.min.css";
import "assets/scss/argon-dashboard-react.scss";

import AdminLayout from "layouts/Admin.js";
import DepositPage from "./pages/DepositPage";
import WithdrawalsPage from "./pages/withdrawals";
import LoanPage from "./pages/Loan";
import Transfer from "./pages/Transfer";
import AddNewTransaction from "./pages/AddNewTransaction";
import CreateTransferPage from "./pages/CreateTransferPage";
import Login from "./pages/Signin";
import Signup from "./pages/SignUp";
import Dashboard from "./pages/Dashboard";
import EmployeeDashboard from "./pages/EmployeeDashboard";
import EmployeeCustomers from "./pages/EmployeeCustomers";
import EmployeeAccounts from "./pages/EmployeeAccounts";
import Home from "./views/Index";
import UserProfile from "./pages/UserProfile";
import CurrencyExchange from "./pages/CurrencyExchange";
import CreateLoanPage from "./pages/CreateLoanPage";

// Utility to check authentication
const getAuthData = () => {
  const token = localStorage.getItem("token");
  const role = localStorage.getItem("role");
  return { token, role };
};

// Protected route component
const ProtectedRoute = ({ children, allowedRoles }) => {
  const { token, role } = getAuthData();

  if (!token) {
    return <Navigate to="/auth/login" replace />;
  }

  if (!allowedRoles.includes(role)) {
    return <Navigate to="/auth/login" replace />;
  }

  return children;
};

// Render the app
const root = ReactDOM.createRoot(document.getElementById("root"));

root.render(
  <BrowserRouter>
    <Routes>
      {/* Redirect "/" to Login */}
      <Route path="/" element={<Navigate to="/auth/login" replace />} />

      {/* Protected Routes for Customers */}
      <Route
        path="/admin/*"
        element={
          <ProtectedRoute allowedRoles={["customer"]}>
            <AdminLayout />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/home"
        element={
          <ProtectedRoute allowedRoles={["customer"]}>
            <Home />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/transactions/deposit"
        element={
          <ProtectedRoute allowedRoles={["customer"]}>
            <DepositPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/transactions/withdrawals"
        element={
          <ProtectedRoute allowedRoles={["customer"]}>
            <WithdrawalsPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/transactions/loan"
        element={
          <ProtectedRoute allowedRoles={["customer"]}>
            <LoanPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/transactions/transfer"
        element={
          <ProtectedRoute allowedRoles={["customer"]}>
            <Transfer />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/transactions/addnew"
        element={
          <ProtectedRoute allowedRoles={["customer"]}>
            <AddNewTransaction />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/transactions/create-transfer"
        element={
          <ProtectedRoute allowedRoles={["customer"]}>
            <CreateTransferPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin"
        element={
          <ProtectedRoute allowedRoles={["customer"]}>
            <Dashboard />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/currency-exchange"
        element={
          <ProtectedRoute allowedRoles={["customer"]}>
            <CurrencyExchange />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/user-profile"
        element={
          <ProtectedRoute allowedRoles={["customer"]}>
            <UserProfile />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/transactions/create-loan"
        element={
          <ProtectedRoute allowedRoles={["customer"]}>
            <CreateLoanPage />
          </ProtectedRoute>
        }
      />

      {/* Protected Routes for Employees */}
      <Route
        path="/employee/dashboard"
        element={
          <ProtectedRoute allowedRoles={["employee"]}>
            <EmployeeDashboard />
          </ProtectedRoute>
        }
      />
      <Route
        path="/employee/customers"
        element={
          <ProtectedRoute allowedRoles={["employee"]}>
            <EmployeeCustomers />
          </ProtectedRoute>
        }
      />
      <Route
        path="/employee/accounts"
        element={
          <ProtectedRoute allowedRoles={["employee"]}>
            <EmployeeAccounts />
          </ProtectedRoute>
        }
      />

      {/* Auth Routes */}
      <Route path="/auth/login" element={<Login />} />
      <Route path="/auth/signup" element={<Signup />} />

      {/* Catch-All Route - Redirect to Login */}
      <Route path="*" element={<Navigate to="/auth/login" replace />} />
    </Routes>
  </BrowserRouter>
);
