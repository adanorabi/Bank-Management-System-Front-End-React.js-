import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { Container, Row, Col, Card, CardHeader, CardBody, Button } from "reactstrap";

const API_BASE_URL = "http://localhost:8080";

const EmployeeDashboard = () => {
    const navigate = useNavigate();
    const [employee, setEmployee] = useState(null);
    const username = localStorage.getItem("username");
    const token = localStorage.getItem("token");
  
    const handleLogout = () => {
      localStorage.clear();
      navigate("/auth/employee-login");
    };
  
    // Fetch employee data by username
    useEffect(() => {
      if (!token || !username) {
        handleLogout();
        return;
      }
  
      axios
        .get(`${API_BASE_URL}/employees/get/username/${username}`, { headers: { Authorization: `Bearer ${token}` } })
        .then((res) => {
          console.log("Employee data response:", res.data); // Log employee data response
          setEmployee(res.data);
          
          // Store employee idCode in localStorage
          localStorage.setItem("employeeId", res.data.idCode);
        })
        .catch((err) => {
          console.error("Error fetching employee data:", err); // Log any error
          handleLogout();
        });
    }, [username, token]);
  
    return (
      <Container className="mt-5">
        <Row className="justify-content-center">
          <Col md="6">
            <Card className="shadow">
              <CardHeader className="text-center bg-info text-white">
                <h2>Employee Dashboard</h2>
              </CardHeader>
              <CardBody className="text-center">
                {employee === null ? (
                  <p>Loading...</p> // Loading state
                ) : (
                  <>
                    <h4>{employee.name}</h4>
                    <p>Username: {employee.userName}</p>
                    <p>Email: {employee.email}</p>
                    <p>Role: employee</p>
                  </>
                )}
                <hr />
                <Button color="primary" className="m-2" onClick={() => navigate("/employee/customers")}>
                  Manage Customers
                </Button>
                <Button color="info" className="m-2" onClick={() => navigate("/employee/accounts")}>
                  Manage Bank Accounts
                </Button>
                <hr />
                <Button color="danger" onClick={handleLogout}>Logout</Button>
              </CardBody>
            </Card>
          </Col>
        </Row>
      </Container>
    );
  };
  
export default EmployeeDashboard;
