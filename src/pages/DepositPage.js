import { useState, useEffect } from "react";
import axios from "axios";
import {
  Card,
  CardHeader,
  CardBody,
  Container,
  Row,
  Col,
  Table,
} from "reactstrap";
import { Bar } from "react-chartjs-2"; 
import Header from "components/Headers/Header.js";
import Sidebar from "components/Sidebar/Sidebar";
import AdminNavbar from "components/Navbars/AdminNavbar"; 

const API_BASE_URL = "http://localhost:8080"; // Backend URL

const DepositPage = () => {
  const [deposits, setDeposits] = useState([]); // ✅ Default to an empty array
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchDeposits = async () => {
      const selectedAccountId = localStorage.getItem("selectedAccountId");
      if (!selectedAccountId) {
        console.warn("⚠️ No selectedAccountId found in localStorage");
        setError("No account selected.");
        setLoading(false);
        return;
      }

      try {
        const token = localStorage.getItem("token");
        console.log(`🔄 Fetching deposits for account ID: ${selectedAccountId}`);

        const response = await axios.get(
          `${API_BASE_URL}/deposits/account/${selectedAccountId}`, // ✅ Fixed spelling
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );

        console.log("✅ Deposits received:", response.data);

        if (!Array.isArray(response.data)) {
          console.warn("⚠️ API returned a single object. Converting to an array...");
          setDeposits([response.data]); // ✅ Convert to array if it's a single object
        } else {
          setDeposits(response.data);
        }

        setError("");
      } catch (err) {
        console.error("❌ Error fetching deposits:", err.response?.data || err);
        setError("Failed to fetch deposits.");
      } finally {
        setLoading(false);
      }
    };

    fetchDeposits();
  }, []);

  // ✅ Format Data for Chart (Ensure deposits is always an array)
  const chartData = {
    labels: deposits.map((d) =>
      new Date(d.transactionDateTime).toLocaleDateString()
    ),
    datasets: [
      {
        label: "Total Deposits (₪)",
        data: deposits.map((d) => d.despositAmount),
        backgroundColor: "#2dce89",
        maxBarThickness: 20,
      },
    ],
  };

  return (
    <>
      <Sidebar />
      <div className="main-content">
        <AdminNavbar brandText="Deposit Overview" />
        <Header />

        <Container className="mt--7" fluid>
          {/* ✅ Chart Section */}
          <Row className="mt-5" style={{ marginTop: "100px", marginBottom: "30px" }}>
            <Col lg="6" className="mx-auto">
              <Card className="bg-gradient-default shadow">
                <CardHeader className="bg-transparent">
                  <h6 className="text-uppercase text-light ls-1 mb-1">Overview</h6>
                  <h2 className="text-white mb-0">Total Deposits</h2>
                </CardHeader>
                <CardBody>
                  <div className="chart">
                    <Bar data={chartData} options={{ responsive: true }} />
                  </div>
                </CardBody>
              </Card>
            </Col>

            {/* ✅ Deposits Table */}
            <Col lg="6" className="mx-auto">
              <Card className="shadow">
                <CardHeader className="border-0">
                  <h3 className="mb-0">Deposit Details</h3>
                </CardHeader>
                <Table className="align-items-center table-flush" responsive>
                  <thead className="thead-light">
                    <tr>
                      <th scope="col">Date</th>
                      <th scope="col">Description</th>
                      <th scope="col">Amount (₪)</th>
                    </tr>
                  </thead>
                  <tbody>
                    {loading ? (
                      <tr>
                        <td colSpan="3" className="text-center">Loading...</td>
                      </tr>
                    ) : error ? (
                      <tr>
                        <td colSpan="3" className="text-center text-danger">{error}</td>
                      </tr>
                    ) : deposits.length === 0 ? (
                      <tr>
                        <td colSpan="3" className="text-center">No deposits found.</td>
                      </tr>
                    ) : (
                      deposits.map((deposit, index) => (
                        <tr key={index}>
                          <td>{new Date(deposit.transactionDateTime).toLocaleDateString()}</td>
                          <td>{deposit.description || "Deposit"}</td>
                          <td style={{ color: "green" }}>₪{deposit.despositAmount.toLocaleString()}</td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </Table>
              </Card>
            </Col>
          </Row>
        </Container>
      </div>
    </>
  );
};

export default DepositPage;
