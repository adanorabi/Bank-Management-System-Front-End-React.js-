import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  Collapse,
  NavbarBrand,
  Navbar,
  NavItem,
  NavLink,
  Nav,
  Container,
} from "reactstrap";

const Sidebar = (props) => {
  const [collapseOpen, setCollapseOpen] = useState(false);
  const [collapseTransactions, setCollapseTransactions] = useState(false);
  const navigate = useNavigate();

  // Toggle collapses
  const toggleCollapse = () => setCollapseOpen(!collapseOpen);
  const toggleTransactions = () => setCollapseTransactions(!collapseTransactions);

  // Logout handler
  const handleLogout = () => {
    localStorage.removeItem("token"); // ✅ Clear the token
    navigate("/auth/login"); // ✅ Redirect to the login page
  };

  return (
    <Navbar
      className="navbar-vertical fixed-left navbar-light bg-white"
      expand="md"
      id="sidenav-main"
    >
      <Container fluid>
        <button className="navbar-toggler" type="button" onClick={toggleCollapse}>
          <span className="navbar-toggler-icon" />
        </button>
        {props.logo ? (
          <NavbarBrand className="pt-0" {...props.logo}>
            <img alt={props.logo.imgAlt} className="navbar-brand-img" src={props.logo.imgSrc} />
          </NavbarBrand>
        ) : null}
        <Collapse navbar isOpen={collapseOpen}>
          <Nav navbar>
            <NavItem>
              <NavLink
                to="/admin/user-profile"
                tag={Link}
                onClick={() => setCollapseOpen(false)}
                style={{ color: "#007bff" }} // Blue for User Profile
              >
                <i className="ni ni-single-02" />
                User Profile
              </NavLink>
            </NavItem>
            <NavItem>
              <NavLink
                to="/admin/home"
                tag={Link}
                onClick={() => setCollapseOpen(false)}
                style={{ color: "#6f42c1" }} // 💜 Purple for Home
              >
                <i className="fas fa-home" />
                Home
              </NavLink>
            </NavItem>
            <NavItem>
              <NavLink
                onClick={toggleTransactions}
                style={{ cursor: "pointer", color: "#28a745" }} // ✅ Green for Transactions
              >
                <i className="fas fa-money-bill-wave" />
                Transactions
              </NavLink>
              <Collapse isOpen={collapseTransactions}>
                <Nav vertical>
                  <NavItem>
                    <NavLink
                      to="/admin/transactions/deposit"
                      tag={Link}
                      style={{ color: "#28a745" }} // ✅ Green for Deposit
                    >
                      <i className="fas fa-plus-circle" />
                      Deposit
                    </NavLink>
                  </NavItem>
                  <NavItem>
                    <NavLink
                      to="/admin/transactions/loan"
                      tag={Link}
                      style={{ color: "#fd7e14" }} // 🟠 Orange for Loan
                    >
                      <i className="fas fa-credit-card" />
                      Loan
                    </NavLink>
                  </NavItem>
                  <NavItem>
                    <NavLink
                      to="/admin/transactions/transfer"
                      tag={Link}
                      style={{ color: "#6c757d" }} // Gray for Transfer
                    >
                      <i className="fas fa-exchange-alt" />
                      Transfer
                    </NavLink>
                  </NavItem>
                  <NavItem>
                    <NavLink
                      to="/admin/transactions/withdrawals"
                      tag={Link}
                      style={{ color: "#dc3545" }} // 🔴 Red for Withdrawal
                    >
                      <i className="fas fa-minus-circle" />
                      Withdrawal
                    </NavLink>
                  </NavItem>
                  {/* ✅ Added Create New Transaction */}
                  <NavItem>
                    <NavLink
                      to="/admin/transactions/addnew"
                      tag={Link}
                      style={{ color: "#17a2b8" }} // 🟦 Teal for Create New Transaction
                    >
                      <i className="fas fa-plus-square" />
                      Create New Withdrawal and deposit
                     
                    </NavLink>
                  </NavItem>
                  {/* ✅ Added Create New Transfer */}
                  <NavItem>
                    <NavLink
                      to="/admin/transactions/create-transfer"
                      tag={Link}
                      style={{ color: "#17a2b8" }} // 🟦 Teal for Create New Transfer
                    >
                      <i className="fas fa-exchange-alt" />
                      Create New Transfer
                    </NavLink>
                  </NavItem>
                  {/* ✅ Added Create New Loan */}
                  <NavItem>
                    <NavLink
                      to="/admin/transactions/create-loan"
                      tag={Link}
                      style={{ color: "#007bff" }} // 🔵 Blue for Create New Loan
                    >
                      <i className="fas fa-hand-holding-usd" />
                      Create New Loan
                    </NavLink>
                  </NavItem>
                </Nav>
              </Collapse>
            </NavItem>
            <NavItem>
              <NavLink
                to="/admin/currency-exchange"
                tag={Link}
                onClick={() => setCollapseOpen(false)}
                style={{ color: "#f4b400" }} // 🟡 Yellow-gold for Currency Exchange
              >
                <i className="fas fa-coins" />
                Currency Exchange
              </NavLink>
            </NavItem>
            <NavItem>
              <NavLink
                onClick={handleLogout}
                style={{ cursor: "pointer", color: "#dc3545" }} // 🔴 Red for Log Out
                className="text-danger"
              >
                <i className="ni ni-user-run" />
                Log Out
              </NavLink>
            </NavItem>
          </Nav>
        </Collapse>
      </Container>
    </Navbar>
  );
};

export default Sidebar;
