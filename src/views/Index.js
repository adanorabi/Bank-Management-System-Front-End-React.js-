import { useState, useEffect } from "react";
import axios from "axios";
import classnames from "classnames";
import Chart from "chart.js";
import { Line } from "react-chartjs-2";
import {
  Card,
  CardHeader,
  CardBody,
  Table,
  Container,
  Row,
  Col,
} from "reactstrap";

// Core components
import { chartOptions, parseOptions } from "variables/charts.js";

import Sidebar from "components/Sidebar/Sidebar";  
import AdminNavbar from "components/Navbars/AdminNavbar";  
import Header from "components/Headers/Header.js";

const API_BASE_URL = "http://localhost:8080"; // Backend URL

const Index = () => {
  const [transactions, setTransactions] = useState([]);
  const [chartData, setChartData] = useState({ labels: [], datasets: [] });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  if (window.Chart) {
    parseOptions(Chart, chartOptions());
  }

  useEffect(() => {
    const fetchTransactionsAndPayments = async () => {
      const selectedAccountId = localStorage.getItem("selectedAccountId");
      if (!selectedAccountId) {
        console.warn("⚠️ No selectedAccountId found in localStorage");
        return;
      }

      try {
        const token = localStorage.getItem("token");
        console.log(`🔄 Fetching transactions & payments for account: ${selectedAccountId}`);

        // ✅ Fetch Transactions
        const transactionResponse = await axios.get(
          `${API_BASE_URL}/transactions/get/${selectedAccountId}`,
          { headers: { Authorization: `Bearer ${token}` } }
        );

        console.log("✅ Transactions received:", transactionResponse.data);
        let transactionsData = transactionResponse.data || [];

        // ✅ REMOVE LOANS from the transactions list
        transactionsData = transactionsData.filter(txn => !txn.hasOwnProperty("loanAmount"));

        // ✅ Fetch Loans for this Account
        let loans = [];
        try {
          const loanResponse = await axios.get(
            `${API_BASE_URL}/loans/account/${selectedAccountId}`,
            { headers: { Authorization: `Bearer ${token}` } }
          );
          console.log("✅ Loans received:", loanResponse.data);
          loans = loanResponse.data || [];
        } catch (error) {
          if (error.response && error.response.status === 404) {
            console.warn(`⚠️ No loans found for account ID ${selectedAccountId} (This is OK)`);
            loans = [];
          } else {
            console.error("❌ Error fetching loans:", error);
            setError("Failed to fetch loans.");
          }
        }

        // ✅ Fetch Loan Payments for each Loan
        let allLoanPayments = {};
        for (const loan of loans) {
          const loanId = loan.transactionId;
          try {
            const paymentResponse = await axios.get(
              `${API_BASE_URL}/payments/loan/${loanId}`,
              { headers: { Authorization: `Bearer ${token}` } }
            );

            console.log(`✅ Payments for Loan ${loanId}:`, paymentResponse.data);
            allLoanPayments[loanId] = paymentResponse.data || [];
          } catch (paymentErr) {
            console.warn(`⚠️ No payments found for loan ${loanId}`, paymentErr.response?.data || paymentErr);
            allLoanPayments[loanId] = [];
          }
        }

        // ✅ Merge Transactions, Loans, and Payments
        let formattedTransactions = [];
        let runningBalance = 0;

        transactionsData.forEach((transaction) => {
          let convertedAmount = transaction.despositAmount ||
                                -Math.abs(transaction.withdrawalAmount) ||
                                transaction.amount || 0;

          let type = "Unknown";
          let isNegative = convertedAmount < 0;

          if (transaction.hasOwnProperty("despositAmount")) {
            type = "Deposit";
          } else if (transaction.hasOwnProperty("withdrawalAmount")) {
            type = "Withdrawal";
            isNegative = true;
          } else if (transaction.hasOwnProperty("receiverAccountNum")) {
            type = "Transfer";
            isNegative = true;
            convertedAmount = -Math.abs(convertedAmount); // Ensure Transfer is always negative
          }

          runningBalance += convertedAmount;

          formattedTransactions.push({
            id: transaction.transactionId,
            type: type,
            date: transaction.transactionDateTime
              ? new Date(transaction.transactionDateTime).toISOString()
              : "-",
            description: transaction.description || "-",
            amount: convertedAmount,
            balanceAfter: runningBalance,
            status: transaction.status || "COMPLETED",
            isNegative: isNegative,
          });
        });

        // ✅ Add Loans and Nest Loan Payments Under Each Loan
        loans.forEach((loan) => {
          let loanItem = {
            id: loan.transactionId,
            type: "Loan",
            date: loan.transactionDateTime
              ? new Date(loan.transactionDateTime).toISOString()
              : "-",
            description: `Loan: ${loan.loanName}`,
            amount: loan.loanAmount,
            balanceAfter: runningBalance + loan.loanAmount,
            status: "ACTIVE",
            isLoan: true,
            isNegative: false,
            payments: allLoanPayments[loan.transactionId] || []
          };

          formattedTransactions.push(loanItem);
          runningBalance += loan.loanAmount;

          // ✅ Nest Payments Under the Loan
          loanItem.payments.forEach((payment) => {
            runningBalance -= payment.paymentAmount;
            formattedTransactions.push({
              id: payment.paymentId,
              type: "Loan Payment",
              date: new Date(payment.paymentDateTime).toISOString(),
              description: "Loan Payment",
              amount: -Math.abs(payment.paymentAmount),
              balanceAfter: runningBalance,
              status: "COMPLETED",
              isNegative: true,
            });
          });
        });

        // ✅ Sort transactions by date (oldest to newest)
        formattedTransactions.sort((a, b) => new Date(a.date) - new Date(b.date));

        setTransactions(formattedTransactions);
        console.log("🚀 Final Transactions State:", formattedTransactions);

        // ✅ Update Chart with Correct Running Balance
        let labels = formattedTransactions.map((tx) => `${tx.date} - ${tx.type}`);
        let cumulativeAmounts = formattedTransactions.map((tx) => tx.balanceAfter);

        setChartData({
          labels,
          datasets: [
            {
              label: "Account Balance Over Time (₪)",
              data: cumulativeAmounts,
              backgroundColor: "rgba(75, 192, 192, 0.2)",
              borderColor: "rgba(75, 192, 192, 1)",
              borderWidth: 2,
            },
          ],
        });

        setError("");
      } catch (err) {
        console.error("❌ Error fetching transactions:", err.response?.data || err);
        setError("Failed to fetch transactions.");
      } finally {
        setLoading(false);
      }
    };

    fetchTransactionsAndPayments();
  }, []);

  return (
    <>
      <Sidebar />
      <div className="main-content">
        <AdminNavbar brandText="Dashboard Overview" />
        <Header />

        <Container className="mt--7" fluid>
          <Row className="mt-5">
            <Col xl="12">
              <Card className="bg-gradient-default shadow">
                <CardHeader className="bg-transparent">
                  <h2 className="text-white mb-0">Transaction History</h2>
                </CardHeader>
                <CardBody>
                  <div className="chart">
                    <Line data={chartData} options={chartOptions} />
                  </div>
                </CardBody>
              </Card>
            </Col>
          </Row>

          <Row className="mt-5">
            <Col xl="12">
              <Card className="shadow">
                <CardHeader className="border-0">
                  <h3 className="mb-0">Bank Account Activities</h3>
                </CardHeader>
                <Table className="align-items-center table-flush" responsive>
                  <thead className="thead-light">
                    <tr>
                      <th>Transaction Type</th>
                      <th>Date</th>
                      <th>Description</th>
                      <th>Amount (₪)</th>
                      <th>Balance After</th>
                      <th>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {transactions.map((transaction, index) => (
                      <tr key={index}>
                        <td>{transaction.type}</td>
                        <td>{new Date(transaction.date).toLocaleDateString()}</td>
                        <td>{transaction.description}</td>
                        <td style={{ color: transaction.isNegative ? "red" : "green" }}>
                          ₪{transaction.amount.toLocaleString()}
                        </td>
                        <td>₪{transaction.balanceAfter.toLocaleString()}</td>
                        <td>{transaction.status}</td>
                      </tr>
                    ))}
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

export default Index;
