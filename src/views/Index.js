import { useState, useEffect } from "react";
import axios from "axios";
import classnames from "classnames";
import Chart from "chart.js";
import { Line } from "react-chartjs-2";
import {
  Card,
  CardHeader,
  CardBody,
  NavItem,
  NavLink,
  Nav,
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
  const [activeNav, setActiveNav] = useState(1);
  const [transactions, setTransactions] = useState([]);
  const [chartData, setChartData] = useState({ labels: [], datasets: [] });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
 

  if (window.Chart) {
    parseOptions(Chart, chartOptions());
  }useEffect(() => {
    const fetchTransactions = async () => {
        const selectedAccountId = localStorage.getItem("selectedAccountId");
        if (!selectedAccountId) {
            console.warn("⚠️ No selectedAccountId found in localStorage");
            return;
        }

        try {
            const token = localStorage.getItem("token");
            console.log(`🔄 Fetching transactions for account: ${selectedAccountId}`);

            const response = await axios.get(
                `${API_BASE_URL}/transactions/get/${selectedAccountId}`,
                {
                    headers: { Authorization: `Bearer ${token}` },
                }
            );

            console.log("✅ Transactions received:", response.data);

            let transactionsData = response.data || [];
            let formattedTransactions = [];
            let runningBalance = 0; // ✅ Track cumulative balance

            transactionsData.forEach((transaction) => {
              let convertedAmount = transaction.despositAmount || 
                                    -Math.abs(transaction.withdrawalAmount) || 
                                    transaction.amount || 
                                    transaction.loanAmount || 0; // ✅ Ensuring loanAmount is used
          
              let type = "Unknown";
          
              if (transaction.hasOwnProperty("despositAmount")) {
                  type = "Deposit";
              } else if (transaction.hasOwnProperty("withdrawalAmount")) {
                  type = "Withdrawal";
              } else if (transaction.hasOwnProperty("receiverAccountNum")) {
                  type = "Transfer";
              } else if (transaction.hasOwnProperty("paymentAmount")) {
                  type = "Loan Payment";  
              } else if (transaction.hasOwnProperty("loanAmount") || transaction.hasOwnProperty("number_of_payments")) {
                  type = "Loan";  // ✅ Detect Loans
              }
          
              formattedTransactions.push({
                  id: transaction.transactionId,
                  type: type,
                  date: transaction.transactionDateTime
                      ? new Date(transaction.transactionDateTime).toLocaleDateString()
                      : "-",
                  description: transaction.description || "-",
                  amount: convertedAmount, 
                  status: transaction.status || "COMPLETED", 
              });
          
              runningBalance += convertedAmount;
          });
          
            setTransactions(formattedTransactions);
            console.log("🚀 Final Transactions State:", formattedTransactions);

            // ✅ Update Chart with Cumulative Balance
            const labels = formattedTransactions.map((tx) => tx.date);
            let cumulativeAmounts = [];
            let cumulativeSum = 0;

            formattedTransactions.forEach((tx) => {
                cumulativeSum += tx.amount;
                cumulativeAmounts.push(cumulativeSum);
            });

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

    fetchTransactions();
}, []);


  const toggleNavs = (e, index) => {
    e.preventDefault();
    setActiveNav(index);
  };

  return (
    <>
      <Sidebar />
      <div className="main-content">
        <AdminNavbar brandText="Dashboard Overview" />
        <Header />

        <Container className="mt--7" fluid>
          {/* ✅ Current Balance Display in ILS */}
       

          {/* ✅ Chart */}
          <Row className="mt-5">
            <Col xl="12">
              <Card className="bg-gradient-default shadow">
                <CardHeader className="bg-transparent">
                  <Row className="align-items-center">
                    <div className="col">
                      <h6 className="text-uppercase text-light ls-1 mb-1">Overview</h6>
                      <h2 className="text-white mb-0">Bank Account Transactions</h2>
                    </div>
                    <div className="col">
                      <Nav className="justify-content-end" pills>
                        <NavItem>
                          <NavLink
                            className={classnames("py-2 px-3", { active: activeNav === 1 })}
                            href="#pablo"
                            onClick={(e) => toggleNavs(e, 1)}
                          >
                            <span className="d-none d-md-block">Month</span>
                            <span className="d-md-none">M</span>
                          </NavLink>
                        </NavItem>
                        <NavItem>
                          <NavLink
                            className={classnames("py-2 px-3", { active: activeNav === 2 })}
                            href="#pablo"
                            onClick={(e) => toggleNavs(e, 2)}
                          >
                            <span className="d-none d-md-block">Week</span>
                            <span className="d-md-none">W</span>
                          </NavLink>
                        </NavItem>
                      </Nav>
                    </div>
                  </Row>
                </CardHeader>
                <CardBody>
                  <div className="chart">
                    <Line data={chartData} options={chartOptions} />
                  </div>
                </CardBody>
              </Card>
            </Col>
          </Row>

          {/* ✅ Transaction Table in ILS */}
          <Row className="mt-5">
            <Col xl="12">
              <Card className="shadow">
                <CardHeader className="border-0">
                  <h3 className="mb-0">Bank Account Activities</h3>
                </CardHeader>
                <Table className="align-items-center table-flush" responsive>
                  <thead className="thead-light">
                    <tr>
                      <th scope="col">Transaction Type</th>
                      <th scope="col">Date</th>
                      <th scope="col">Description</th>
                      <th scope="col">Amount (₪)</th>
                      <th scope="col">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {transactions.map((transaction, index) => (
                      <tr key={index}>
                        <td>{transaction.type}</td>
                        <td>{transaction.date}</td>
                        <td>{transaction.description}</td>
                        <td style={{ color: transaction.amount < 0 ? "red" : "green" }}>
                          ₪{transaction.amount.toLocaleString()}
                        </td>
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
