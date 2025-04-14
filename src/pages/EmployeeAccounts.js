import React, { useEffect, useState } from "react";
import axios from "axios";
import { 
  Container, Row, Col, Card, CardHeader, CardBody, Button, Badge 
} from "reactstrap";

const API_BASE_URL = "http://localhost:8080";

const EmployeeAccounts = () => {
  const [accounts, setAccounts] = useState([]);
  const employeeId = localStorage.getItem("employeeId");
  const token = localStorage.getItem("token");

  // Check if employeeId is available
  if (!employeeId) {
    console.error("❌ Employee ID is missing in localStorage.");
    alert("Employee ID is missing. Please log in again.");
  }

  // ✅ Create Axios instance with headers
  const axiosInstance = axios.create({
    baseURL: API_BASE_URL,
    headers: { Authorization: `Bearer ${token}` },
  });

  // ✅ Fetch Bank Accounts
  useEffect(() => {
    if (employeeId) {
      axiosInstance.get("/bankAccounts/getAll")
        .then(res => setAccounts(res.data))
        .catch(err => console.error("Error fetching bank accounts:", err.response?.data || err.message));
    }
  }, [employeeId]);

  // ✅ Toggle Account Status (Activate / Suspend)
  const toggleAccountStatus = (accountId, currentStatus) => {
    if (!employeeId) return;

    const action = currentStatus === "ACTIVE" ? "suspend" : "activate";

    axiosInstance.put(`/employees/${employeeId}/${action}BankAccount/${accountId}`)
      .then(() => {
        setAccounts(prevAccounts =>
          prevAccounts.map(acc =>
            acc.id === accountId
              ? { ...acc, status: action === "activate" ? "ACTIVE" : "SUSPENDED" }
              : acc
          )
        );
      })
      .catch(err => alert("Error: " + (err.response?.data || "Failed to update account")));
  };

  // ✅ Toggle Restrict Status
  const toggleRestrictStatus = (accountId) => {
    if (!employeeId) return;

    axiosInstance.put(`/employees/${employeeId}/restrictBankAccount/${accountId}`)
      .then(() => {
        setAccounts(prevAccounts =>
          prevAccounts.map(acc =>
            acc.id === accountId
              ? { ...acc, status: "RESTRICTED" }
              : acc
          )
        );
      })
      .catch(err => alert("Error: " + (err.response?.data || "Failed to restrict account")));
  };

  return (
    <Container className="mt-4">
      <h2 className="text-primary text-center">🏦 Manage Bank Accounts</h2>

      {accounts.length === 0 ? (
        <div className="text-center text-muted mt-4">No bank accounts found.</div>
      ) : (
        <Row>
          {accounts.map((acc) => (
            <Col md="6" lg="4" key={acc.id} className="mb-4">
              <Card className="shadow-sm">
                <CardHeader className="bg-secondary text-black text-center">
                  <strong>Bank Account ID: {acc.id}</strong>
                </CardHeader>
                <CardBody className="text-center">
                  <h5>Customer: <strong>{acc.customerName || "N/A"}</strong></h5>
                  <p>Balance: <strong>{acc.balance} {acc.currencyCode}</strong></p>
                  <p>Created On: <strong>{new Date(acc.createdDate).toLocaleDateString()}</strong></p>
  
                  {/* Status Badge */}
                  <Badge color={acc.status === "ACTIVE" ? "success" : acc.status === "SUSPENDED" ? "warning" : "danger"} className="mb-2">
                    {acc.status}
                  </Badge>
  
                  {/* ✅ Buttons only appear if account is NOT closed */}
                  {acc.status !== "CLOSED" && (
                    <div className="mt-3">
                      <Button
                        color={acc.status === "ACTIVE" ? "warning" : "success"}
                        size="sm"
                        className="m-1"
                        onClick={() => toggleAccountStatus(acc.id, acc.status)}
                      >
                        {acc.status === "ACTIVE" ? "Suspend" : "Activate"}
                      </Button>
                      <Button
                        color="danger"
                        size="sm"
                        className="m-1"
                        onClick={() => toggleRestrictStatus(acc.id)}
                      >
                        Restrict
                      </Button>
                    </div>
                  )}
                </CardBody>
              </Card>
            </Col>
          ))}
        </Row>
      )}
    </Container>
  );
};

export default EmployeeAccounts;
