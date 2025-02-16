import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter, Route, Routes, Navigate } from "react-router-dom";

import "assets/plugins/nucleo/css/nucleo.css";
import "@fortawesome/fontawesome-free/css/all.min.css";
import "assets/scss/argon-dashboard-react.scss";

import AdminLayout from "layouts/Admin.js";
import DepositPage from "./pages/DepositPage";
import WithdrawalsPage from "./pages/withdrawals"; // Adjusted case
import LoanPage from "./pages/Loan";
import Transfer from "./pages/Transfer";
import AddNewTransaction from "./pages/AddNewTransaction";
import CreateTransferPage from "./pages/CreateTransferPage"; // ✅ Added Create Transfer Page
import Login from "./pages/Signin";
import Signup from "./pages/SignUp";
import Dashboard from "./pages/Dashboard";

import Home from "./views/Index";
import UserProfile from "./pages/UserProfile";
import CurrencyExchange from "./pages/CurrencyExchange";
import CreateLoanPage from "./pages/CreateLoanPage"; // ✅ Import Create Loan Page
// Utility to check authentication
const isAuthenticated = () => !!localStorage.getItem("token");

// Protected route component
const ProtectedRoute = ({ children }) => {
  return isAuthenticated() ? children : <Navigate to="/auth/login" replace />;
};

// Render the app
const root = ReactDOM.createRoot(document.getElementById("root"));

root.render(
  <BrowserRouter>
    <Routes>
      {/* Redirect "/" to Login */}
      <Route path="/" element={<Navigate to="/auth/login" replace />} />

      {/* Protected Routes */}
      <Route
        path="/admin/*"
        element={
          <ProtectedRoute>
            <AdminLayout />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/home"
        element={
          <ProtectedRoute>
            <Home />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/transactions/deposit"
        element={
          <ProtectedRoute>
            <DepositPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/transactions/withdrawals"
        element={
          <ProtectedRoute>
            <WithdrawalsPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/transactions/loan"
        element={
          <ProtectedRoute>
            <LoanPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/transactions/transfer"
        element={
          <ProtectedRoute>
            <Transfer />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/transactions/addnew"
        element={
          <ProtectedRoute>
            <AddNewTransaction />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/transactions/create-transfer"
        element={
          <ProtectedRoute>
            <CreateTransferPage />
          </ProtectedRoute>
        }
      /> {/* ✅ Added Create Transfer Page Route */}
      <Route
        path="/admin"
        element={
          <ProtectedRoute>
            <Dashboard />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/currency-exchange"
        element={
          <ProtectedRoute>
            <CurrencyExchange />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/user-profile"
        element={
          <ProtectedRoute>
            <UserProfile />
          </ProtectedRoute>
        }
      />
<Route
  path="/admin/transactions/create-loan"
  element={
    <ProtectedRoute>
      <CreateLoanPage />
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
