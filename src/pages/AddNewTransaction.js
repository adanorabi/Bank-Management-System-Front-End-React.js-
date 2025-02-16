import { useState, useEffect } from "react";
import axios from "axios";
import {
  Container,
  Row,
  Col,
  Card,
  CardHeader,
  CardBody,
  Button,
  Input,
  Label,
  Modal,
  ModalHeader,
  ModalBody,
  ModalFooter,
} from "reactstrap";
import Sidebar from "./../components/Sidebar/Sidebar";
import AdminNavbar from "components/Navbars/AdminNavbar";
import Header from "components/Headers/Header.js";

const API_BASE_URL = "http://localhost:8080"; // Backend URL

const CreateTransactionPage = () => {
  const [transactionType, setTransactionType] = useState(null);
  const [amount, setAmount] = useState("");
  const [currency, setCurrency] = useState("ILS"); // Default currency
  const [currencies, setCurrencies] = useState([]); // Available currencies
  const [errorMessage, setErrorMessage] = useState("");
  const [confirmDialog, setConfirmDialog] = useState(false);
  const [confirmationType, setConfirmationType] = useState("");

  useEffect(() => {
    // ✅ Fetch available currencies
    const fetchCurrencies = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) return;

        const response = await axios.get(`${API_BASE_URL}/currency-rates/getAll`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        let sortedCurrencies = response.data.map((rate) => rate.currencyCode);
        sortedCurrencies.sort((a, b) => {
          const preferred = ["ILS", "USD", "EUR"];
          if (preferred.includes(a) && !preferred.includes(b)) return -1;
          if (!preferred.includes(a) && preferred.includes(b)) return 1;
          return 0;
        });

        setCurrencies(sortedCurrencies);
      } catch (err) {
        console.error("❌ Error fetching currencies.");
      }
    };

    fetchCurrencies();
  }, []);

  // ✅ Handles transaction type selection
  const handleTransactionChange = (type) => {
    setTransactionType(type);
    setAmount("");
    setCurrency("ILS");
    setErrorMessage("");
  };

  // ✅ Handles deposit or withdrawal submission
  const handleTransactionSubmit = async () => {
    const selectedAccountId = localStorage.getItem("selectedAccountId");
    if (!selectedAccountId) {
      setErrorMessage("No account selected.");
      return;
    }
  
    if (!amount || parseFloat(amount) <= 0) {
      setErrorMessage("Please enter a valid amount.");
      return;
    }
  
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        setErrorMessage("Unauthorized: Please log in again.");
        return;
      }
  
      const isDeposit = transactionType === "deposit";
      const apiEndpoint = isDeposit ? "deposits" : "withdrawals";
      const amountKey = isDeposit ? "despositAmount" : "withdrawalAmount"; // ✅ Correct field name
  
      // ✅ Step 1: Add the transaction
      const response = await axios.post(
        `${API_BASE_URL}/${apiEndpoint}/add`,
        { [amountKey]: parseFloat(amount), currencyCode: currency, description: `User ${transactionType}` },
        { headers: { Authorization: `Bearer ${token}` } }
      );
  
      console.log(`✅ ${transactionType} API Response:`, response.data);
  
      // ✅ Extract transactionId
      const transactionId = response.data.transactionId;
      if (!transactionId) {
        throw new Error("Transaction ID is missing from response.");
      }
  
      // ✅ Step 2: Link transaction to bank account
      await axios.put(
        `${API_BASE_URL}/${apiEndpoint}/connect/${transactionId}/${selectedAccountId}`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
  
      alert(`${transactionType} added and linked successfully!`);
      window.location.reload();
    } catch (err) {
      setErrorMessage("Failed to process transaction. Please try again.");
    }
  };
  
  // ✅ Handle transaction submission
  const handleSubmit = () => {
    setConfirmationType(transactionType);
    setConfirmDialog(true);
  };

  // ✅ Confirm transaction execution
  const confirmAction = (confirm) => {
    if (confirm && (transactionType === "deposit" || transactionType === "withdrawal")) {
      handleTransactionSubmit();
    }
    setConfirmDialog(false);
  };

  return (
    <>
      <Sidebar />
      <div className="main-content">
        <AdminNavbar brandText="Create Transaction" />
        <Header />
        <Container className="mt--7" fluid>
          <Row style={{ marginTop: "100px" }}>
            {/* Deposit Card */}
            <Col lg="3" md="6">
              <Card className="shadow">
                <CardHeader className="text-center">
                  <h2 className="mb-0">Deposit</h2>
                </CardHeader>
                <CardBody className="text-center">
                  <i className="fas fa-plus-circle" style={{ fontSize: "50px", marginBottom: "20px", color: "green" }} />
                  <Button color="success" onClick={() => handleTransactionChange("deposit")}>
                    Create Deposit
                  </Button>
                </CardBody>
              </Card>
            </Col>

            {/* Withdrawal Card */}
            <Col lg="3" md="6">
              <Card className="shadow">
                <CardHeader className="text-center">
                  <h2 className="mb-0">Withdrawal</h2>
                </CardHeader>
                <CardBody className="text-center">
                  <i className="fas fa-minus-circle" style={{ fontSize: "50px", marginBottom: "20px", color: "red" }} />
                  <Button color="danger" onClick={() => handleTransactionChange("withdrawal")}>
                    Create Withdrawal
                  </Button>
                </CardBody>
              </Card>
            </Col>
          </Row>

          {/* Deposit & Withdrawal Form */}
          {transactionType && (
            <Row style={{ marginTop: "30px", marginBottom: "30px" }}>
              <Col lg="6" md="8" className="mx-auto">
                <Card className="shadow">
                  <CardHeader className="text-center">
                    <h5>{transactionType.charAt(0).toUpperCase() + transactionType.slice(1)} Information</h5>
                  </CardHeader>
                  <CardBody>
                    {errorMessage && <div className="alert alert-danger">{errorMessage}</div>}
                    <Label for="amount">Amount</Label>
                    <Input
                      type="number"
                      id="amount"
                      value={amount}
                      onChange={(e) => setAmount(e.target.value)}
                      placeholder="Enter Amount"
                      required
                    />
                    <Label for="currency" className="mt-3">Currency</Label>
                    <Input type="select" id="currency" value={currency} onChange={(e) => setCurrency(e.target.value)}>
                      {currencies.map((cur) => <option key={cur} value={cur}>{cur}</option>)}
                    </Input>
                    <div className="d-flex justify-content-center mt-3">
                      <Button color="primary" onClick={handleSubmit}>
                        Submit {transactionType}
                      </Button>
                    </div>
                  </CardBody>
                </Card>
              </Col>
            </Row>
          )}
        </Container>
      </div>

      {/* Confirmation Modal */}
      <Modal isOpen={confirmDialog} toggle={() => setConfirmDialog(false)}>
        <ModalHeader toggle={() => setConfirmDialog(false)}>Confirm Transaction</ModalHeader>
        <ModalBody>
          <h4>Are you sure you want to {confirmationType}?</h4>
        </ModalBody>
        <ModalFooter>
          <Button color="success" onClick={() => confirmAction(true)}>Yes</Button>
          <Button color="danger" onClick={() => confirmAction(false)}>No</Button>
        </ModalFooter>
      </Modal>
    </>
  );
};

export default CreateTransactionPage;
