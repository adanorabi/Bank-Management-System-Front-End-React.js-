import { useState, useEffect } from "react";
import { Card, CardHeader, CardBody, Container, Row, Col, Table, Input } from "reactstrap";
import Header from "components/Headers/Header.js";
import Sidebar from "components/Sidebar/Sidebar";
import AdminNavbar from "components/Navbars/AdminNavbar";
import { Pie } from "react-chartjs-2";
import axios from "axios";
import "./styles.css";

const API_BASE_URL = "http://localhost:8080"; // ✅ Backend URL

const LoanPage = () => {
  const [loans, setLoans] = useState([]); // ✅ Store multiple loans
  const [selectedLoanId, setSelectedLoanId] = useState(null); // ✅ Track selected loan
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchLoans = async () => {
      try {
        const token = localStorage.getItem("token");
        const selectedAccountId = localStorage.getItem("selectedAccountId");

        if (!token) {
          setError("❌ Unauthorized: Please log in again.");
          return;
        }

        if (!selectedAccountId) {
          setError("❌ No account selected.");
          return;
        }

        console.log(`🔄 Fetching loans for account ID: ${selectedAccountId}`);

        const response = await axios.get(`${API_BASE_URL}/loans/account/${selectedAccountId}`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (!response.data || response.data.length === 0) {
          setError("⚠️ No loans found for this account.");
          return;
        }

        console.log("✅ Loans received:", response.data);
        setLoans(response.data);
        setSelectedLoanId(response.data[0]?.transactionId); // ✅ Select first loan by default

      } catch (err) {
        console.error("❌ Error fetching loans:", err.response?.data || err.message);
        setError("❌ Failed to fetch loans.");
      }
    };

    fetchLoans();
  }, []);

  // ✅ Get details of selected loan
  const selectedLoan = loans.find(loan => loan.transactionId === selectedLoanId) || {};

  const remainingAmount = selectedLoan?.remainingBalance ?? 0;
  const paidAmount = selectedLoan?.payments?.reduce((acc, payment) => acc + (payment.paymentAmount || 0), 0) || 0;

  const chartData = {
    labels: ["Paid (₪)", "Remaining (₪)"],
    datasets: [
      {
        data: [paidAmount, remainingAmount],
        backgroundColor: ["#2dce89", "#f5365c"],
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
          <Row>
            <Col lg="6">
              <Card className="shadow">
                <CardHeader className="border-0">
                  <h3 className="mb-0">Select Loan</h3>
                  <Input 
                    type="select" 
                    value={selectedLoanId} 
                    onChange={(e) => setSelectedLoanId(parseInt(e.target.value))} 
                    className="mt-2"
                  >
                    {loans.map((loan) => (
                      <option key={loan.transactionId} value={loan.transactionId}>
                        {loan.loanName} (₪{loan.loanAmount.toLocaleString()})
                      </option>
                    ))}
                  </Input>
                </CardHeader>
              </Card>
            </Col>
          </Row>

          {selectedLoanId && (
            <Row style={{ marginTop: "30px" }}>
              <Col lg="6">
                <Card className="card-stats mb-4 mb-xl-0">
                  <CardBody>
                    <Row>
                      <Col md="6" style={{ color: "black" }}>
                        <h6 className="text-uppercase text-muted ls-1 mb-1">Loan Info</h6>
                        {selectedLoan ? (
                          <ul>
                            <li><strong>Loan Name:</strong> {selectedLoan.loanName}</li>
                            <li><strong>Loan Amount:</strong> ₪{selectedLoan.loanAmount?.toLocaleString()}</li>
                            <li><strong>Remaining Balance:</strong> ₪{remainingAmount?.toLocaleString()}</li>
                            <li><strong>Transaction Date:</strong> 
                              {selectedLoan.transactionDateTime 
                                ? new Date(selectedLoan.transactionDateTime).toLocaleDateString() 
                                : "Invalid Date"}
                            </li>
                            <li><strong>Number of Payments:</strong> {selectedLoan.numberOfPayments}</li>
                            <li><strong>Remaining Payments:</strong> {selectedLoan.remainingPaymentsNum}</li>
                            <li><strong>Interest Rate:</strong> {selectedLoan.interestRate ? `${selectedLoan.interestRate}%` : "N/A"}</li>
                          </ul>
                        ) : (
                          <p>🔄 Loading loan details...</p>
                        )}
                      </Col>
                      <Col md="6">
                        <div className="chart-container" style={{ height: "300px" }}>
                          <Pie data={chartData} options={{ responsive: true, maintainAspectRatio: false }} />
                        </div>
                      </Col>
                    </Row>
                  </CardBody>
                </Card>
              </Col>

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
                      {selectedLoan?.payments?.length === 0 ? (
                        <tr>
                          <td colSpan="2" className="text-center">🔄 No payments found.</td>
                        </tr>
                      ) : (
                        selectedLoan.payments?.map((payment, index) => (
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
          )}
        </Container>
      </div>
    </>
  );
};

export default LoanPage;
