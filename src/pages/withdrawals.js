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

const WithdrawalsPage = () => {
  const [withdrawals, setWithdrawals] = useState([]); // ✅ Default to an empty array
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchWithdrawals = async () => {
      const selectedAccountId = localStorage.getItem("selectedAccountId");
      if (!selectedAccountId) {
        console.warn("⚠️ No selectedAccountId found in localStorage");
        setError("No account selected.");
        setLoading(false);
        return;
      }
  
      try {
        const token = localStorage.getItem("token");
        console.log(`🔄 Fetching withdrawals for account ID: ${selectedAccountId}`);
  
        const response = await axios.get(
          `${API_BASE_URL}/withdrawals/account/${selectedAccountId}`,
          { headers: { Authorization: `Bearer ${token}` } }
        );
  
        console.log("✅ Withdrawals received:", response.data);
  
        if (response.status === 204) {
          console.warn("⚠️ No withdrawals found.");
          setWithdrawals([]);
          return;
        }
  
        if (!Array.isArray(response.data)) {
          console.warn("⚠️ API returned a single object. Converting to an array...");
          setWithdrawals([response.data]);
        } else {
          setWithdrawals(response.data);
        }
        
        setError("");
      } catch (err) {
        console.error("❌ Error fetching withdrawals:", err.response?.data || err);
        setError("Failed to fetch withdrawals. Please try again.");
      } finally {
        setLoading(false);
      }
    };
  
    fetchWithdrawals();
  }, []);
  

  // ✅ Format Data for Chart (Ensure withdrawals is always an array)
  const chartData = {
    labels: withdrawals.map((w) =>
      new Date(w.transactionDateTime).toLocaleDateString()
    ),
    datasets: [
      {
        label: "Total Withdrawals (₪)",
        data: withdrawals.map((w) => w.withdrawalAmount),
        backgroundColor: "#f5365c", // Red for withdrawals
        maxBarThickness: 20,
      },
    ],
  };

  return (
    <>
      <Sidebar />
      <div className="main-content">
        <AdminNavbar brandText="Withdrawals Overview" />
        <Header />

        <Container className="mt--7" fluid>
          {/* ✅ Chart Section */}
          <Row className="mt-5" style={{ marginTop: "100px", marginBottom: "30px" }}>
            <Col lg="6" className="mx-auto">
              <Card className="bg-gradient-default shadow">
                <CardHeader className="bg-transparent">
                  <h6 className="text-uppercase text-light ls-1 mb-1">Overview</h6>
                  <h2 className="text-white mb-0">Total Withdrawals</h2>
                </CardHeader>
                <CardBody>
                  <div className="chart">
                    <Bar data={chartData} options={{ responsive: true }} />
                  </div>
                </CardBody>
              </Card>
            </Col>

            {/* ✅ Withdrawals Table */}
            <Col lg="6" className="mx-auto">
              <Card className="shadow">
                <CardHeader className="border-0">
                  <h3 className="mb-0">Withdrawal Details</h3>
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
                    ) : withdrawals.length === 0 ? (
                      <tr>
                        <td colSpan="3" className="text-center">No withdrawals found.</td>
                      </tr>
                    ) : (
                      withdrawals.map((withdrawal, index) => (
                        <tr key={index}>
                          <td>{new Date(withdrawal.transactionDateTime).toLocaleDateString()}</td>
                          <td>{withdrawal.description || "Withdrawal"}</td>
                          <td style={{ color: "red" }}>₪{withdrawal.withdrawalAmount.toLocaleString()}</td>
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

export default WithdrawalsPage;
