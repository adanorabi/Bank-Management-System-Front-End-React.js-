import { useState, useEffect } from "react";
import { Card, CardHeader, CardBody, Container, Row, Col, Table } from "reactstrap";
import Header from "components/Headers/Header.js";
import Sidebar from "components/Sidebar/Sidebar";
import AdminNavbar from "components/Navbars/AdminNavbar";
import { Pie } from "react-chartjs-2";
import axios from "axios";
import './styles.css';

const API_BASE_URL = "http://localhost:8080"; // Backend URL

const LoanPage = () => {
  const [loanDetails, setLoanDetails] = useState(null);
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchLoans = async () => {
      const selectedAccountId = localStorage.getItem("selectedAccountId");
      if (!selectedAccountId) {
        setError("No account selected.");
        setLoading(false);
        return;
      }

      try {
        const token = localStorage.getItem("token");
        console.log(`🔄 Fetching loans for account ID: ${selectedAccountId}`);

        const response = await axios.get(
          `${API_BASE_URL}/loans/account/${selectedAccountId}`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );

        if (response.data.length === 0) {
          throw new Error("No loans found for this account.");
        }

        setLoanDetails(response.data[0]); // ✅ Assuming one loan per account
        setError("");
      } catch (err) {
        console.error("❌ Error fetching loan details:", err.response?.data || err.message);
        setError("Failed to fetch loan details.");
      } finally {
        setLoading(false);
      }
    };

    fetchLoans();
  }, []);

  useEffect(() => {
    if (!loanDetails) return;

    const fetchPayments = async () => {
      try {
        const token = localStorage.getItem("token");
        console.log(`🔄 Fetching payments for loan ID: ${loanDetails.transactionId}`);

        const response = await axios.get(
          `${API_BASE_URL}/payments/loan/${loanDetails.transactionId}`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );

        setPayments(response.data);
      } catch (err) {
        console.error("❌ Error fetching loan payments:", err.response?.data || err.message);
        setError("Failed to fetch loan payments.");
      }
    };

    fetchPayments();
  }, [loanDetails]);

  if (loading) {
    return <p className="text-center">Loading loan details...</p>;
  }

  if (error) {
    return <p className="text-center text-danger">{error}</p>;
  }

  const paidAmount = payments.reduce((acc, payment) => acc + payment.paymentAmount, 0);
  const remainingAmount = loanDetails.loanAmount - paidAmount;

  // ✅ Pie Chart Data
  const chartData = {
    labels: ["Paid (₪)", "Remaining (₪)"],
    datasets: [
      {
        data: [paidAmount, remainingAmount],
        backgroundColor: ["#2dce89", "#f5365c"], // Green for paid, red for remaining
      },
    ],
  };

  return (
    <>
      <Sidebar />
      <div className="main-content">
        <AdminNavbar brandText="Loan Overview" />
        <Header />
        <Container className="mt--7" fluid>
          <Row style={{ marginTop: "100px", marginBottom: "30px" }}>
            {/* Loan Info and Pie Chart Section */}
            <Col lg="6">
              <Card className="card-stats mb-4 mb-xl-0">
                <CardBody>
                  <Row>
                    {/* Loan Info */}
                    <Col md="6" style={{ color: "black" }}>
                      <h6 className="text-uppercase text-muted ls-1 mb-1">Loan Info</h6>
                      <ul>
  <li><strong>Loan Name:</strong> {loanDetails.loanName}</li>
  <li><strong>Type:</strong> {loanDetails.loanType || "N/A"}</li>  {/* ✅ Added Loan Type */}
  <li><strong>Loan Amount:</strong> ₪{loanDetails.loanAmount.toLocaleString()}</li>
  <li><strong>Remaining Balance:</strong> ₪{remainingAmount.toLocaleString()}</li>
  <li><strong>Interest Rate:</strong> {loanDetails.interestRate}%</li>
  <li><strong>Start Payment Date:</strong> {new Date(loanDetails.startPaymentDate).toLocaleDateString()}</li>
  <li><strong>End Payment Date:</strong> {new Date(loanDetails.endPaymentDate).toLocaleDateString()}</li>
  <li><strong>Number of Payments:</strong> {loanDetails.numberOfPayments}</li>
</ul>

                    </Col>
                    {/* Pie Chart */}
                    <Col md="6">
                      <div className="chart-container" style={{ height: "300px" }}>
                        <Pie data={chartData} options={{ responsive: true, maintainAspectRatio: false }} />
                      </div>
                    </Col>
                  </Row>
                </CardBody>
              </Card>
            </Col>

            {/* Payments Table Section */}
            <Col lg="6">
              <Card className="shadow">
                <CardHeader className="border-0">
                  <h3 className="mb-0">Loan Payments</h3>
                </CardHeader>
                <Table className="align-items-center table-flush" responsive>
                  <thead className="thead-light">
                    <tr>
                      <th scope="col">Payment Amount (₪)</th>
                      <th scope="col">Payment Date</th>
                    </tr>
                  </thead>
                  <tbody>
                    {payments.length === 0 ? (
                      <tr>
                        <td colSpan="2" className="text-center">No payments found.</td>
                      </tr>
                    ) : (
                      payments.map((payment, index) => (
                        <tr key={index}>
                          <td>₪{payment.paymentAmount.toLocaleString()}</td>
                          <td>{new Date(payment.paymentDateTime).toLocaleDateString()}</td>
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

export default LoanPage;
