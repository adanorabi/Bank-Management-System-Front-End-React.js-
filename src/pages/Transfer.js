import { useState, useEffect } from "react";
import { Button, Card, CardHeader, CardBody, Container, Row, Col, Table } from "reactstrap";
import Header from "components/Headers/Header.js";
import Sidebar from "components/Sidebar/Sidebar";
import AdminNavbar from "components/Navbars/AdminNavbar";
import { Bar } from "react-chartjs-2";
import axios from "axios";
import './styles.css';

const API_BASE_URL = "http://localhost:8080"; // ✅ Backend URL

const TransferPage = () => {
  const [transfers, setTransfers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchTransfers = async () => {
      const selectedAccountId = localStorage.getItem("selectedAccountId");
      if (!selectedAccountId) {
        console.warn("⚠️ No selectedAccountId found in localStorage");
        setError("No account selected.");
        setLoading(false);
        return;
      }
  
      const token = localStorage.getItem("token");
      if (!token) {
        console.error("❌ No authentication token found.");
        setError("Unauthorized: Please log in again.");
        setLoading(false);
        return;
      }
  
      console.log(`🔄 Fetching transfers for account ID: ${selectedAccountId}`);
  
      try {
        const response = await axios.get(
          `${API_BASE_URL}/transfers/account/${selectedAccountId}`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
  
        console.log("✅ Transfers received from API:", response.data);
  
        if (!Array.isArray(response.data)) {
          throw new Error("Invalid API response format.");
        }
  
        setTransfers(response.data); // ✅ Store all transfers in state
        setError("");
      } catch (err) {
        console.error("❌ Error fetching transfers:", err.response?.data || err.message);
        setError("Failed to fetch transfers. Please try again.");
      } finally {
        setLoading(false);
      }
    };
  
    fetchTransfers();
  }, []);
  

  if (loading) {
    return <p className="text-center">Loading transfer data...</p>;
  }

  if (error) {
    return <p className="text-center text-danger">{error}</p>;
  }

  // ✅ Chart Data for Sent Transfers
  const chartData = {
    labels: ["Sent (₪)"],
    datasets: [
      {
        label: "Transfer Amount (₪)",
        data: [
          transfers.reduce((acc, curr) => acc + (curr.amount || 0), 0),
        ],
        backgroundColor: ["#f5365c"], // Red for sent transfers
      },
    ],
  };

  return (
    <>
      <Sidebar />
      <div className="main-content">
        <AdminNavbar brandText="Transfer Overview" />
        <Header />
        <Container className="mt--7" fluid>
          {/* Table Section */}
          <Row style={{ marginTop: "100px", marginBottom: "30px" }}>
            <Col lg="12">
              <Card className="card-stats mb-4 mb-xl-0">
                <CardBody>
                  <h3 className="mb-4">Sent Transfers</h3>
                  {/* Transfer Table */}
                  <Table className="align-items-center table-flush" responsive>
                    <thead className="thead-light">
                      <tr>
                        <th scope="col">Transfer Name</th>
                        <th scope="col">Amount (₪)</th>
                        <th scope="col">Date</th>
                        <th scope="col">Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {transfers.length === 0 ? (
                        <tr>
                          <td colSpan="4" className="text-center">No transfers found.</td>
                        </tr>
                      ) : (
                        transfers.map((transfer, index) => (
                          <tr key={index}>
                            <td>{transfer.transferName || "-"}</td> {/* ✅ Show "-" if null */}
                            <td>₪{(transfer.amount || 0).toLocaleString()}</td> {/* ✅ Show ₪0 if null */}
                            <td>{transfer.transferDate ? new Date(transfer.transferDate).toLocaleDateString() : "-"}</td>
                            <td>
                              <span className={`badge ${transfer.transferStatus === "COMPLETED" ? "badge-success" : "badge-warning"}`}>
                                {transfer.transferStatus}
                              </span>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </Table>
                </CardBody>
              </Card>
            </Col>
          </Row>

          {/* Chart Section */}
          <Row style={{ marginTop: "30px" }}>
            <Col lg="6">
              <Card className="shadow">
                <CardHeader className="bg-transparent">
                  <h6 className="text-uppercase text-light ls-1 mb-1">Transfer Summary</h6>
                  <h2 className="text-white mb-0">Sent Transfers</h2>
                </CardHeader>
                <CardBody>
                  <div className="chart-container" style={{ height: "300px" }}>
                    <Bar data={chartData} options={{ responsive: true, maintainAspectRatio: false }} />
                  </div>
                </CardBody>
              </Card>
            </Col>
          </Row>
        </Container>
      </div>
    </>
  );
};

export default TransferPage;
