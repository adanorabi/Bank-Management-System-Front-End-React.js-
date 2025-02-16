import { Navigate } from "react-router-dom";
import Dashboard from "views/Index.js";
import Profile from "views/examples/Profile.js";
import CurrencyExchange from "pages/CurrencyExchange";
import Tables from "views/examples/Tables.js";
import Login from "pages/Signin";
import Signup from "pages/SignUp";

const isAuthenticated = () => !!localStorage.getItem("token");

const ProtectedRoute = ({ children }) => {
  return isAuthenticated() ? children : <Navigate to="/auth/login" replace />;
};

const routes = [
  {
    path: "/index",
    name: "Dashboard",
    icon: "ni ni-tv-2 text-primary",
    component: (
      <ProtectedRoute>
        <Dashboard />
      </ProtectedRoute>
    ),
    layout: "/admin",
  },
  {
    path: "/user-profile",
    name: "User Profile",
    icon: "ni ni-single-02 text-yellow",
    component: (
      <ProtectedRoute>
        <Profile />
      </ProtectedRoute>
    ),
    layout: "/admin",
  },
  {
    path: "/currency-exchange",
    name: "Currency Exchange",
    icon: "ni ni-money-coins text-blue",
    component: (
      <ProtectedRoute>
        <CurrencyExchange />
      </ProtectedRoute>
    ),
    layout: "/admin",
  },
  {
    path: "/tables",
    name: "Tables",
    icon: "ni ni-bullet-list-67 text-red",
    component: (
      <ProtectedRoute>
        <Tables />
      </ProtectedRoute>
    ),
    layout: "/admin",
  },
  {
    path: "/login",
    name: "Login",
    icon: "ni ni-key-25 text-info",
    component: <Login />,
    layout: "/auth",
  },
  {
    path: "/register",
    name: "Signup",
    icon: "ni ni-circle-08 text-pink",
    component: <Signup />, // ✅ No token required
    layout: "/auth",
  },
];

export default routes;
