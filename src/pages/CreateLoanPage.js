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

const API_BASE_URL = "http://localhost:8080"; // ✅ Backend URL

const CreateLoanPage = () => {
  const [loanName, setLoanName] = useState("");
  const [loanAmount, setLoanAmount] = useState("");
  const [loanTerm, setLoanTerm] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState(""); // New state for success message
  const [confirmDialog, setConfirmDialog] = useState(false);
  const [selectedAccountId, setSelectedAccountId] = useState(null);

  // ✅ Get selected bank account ID from localStorage
  useEffect(() => {
    const accountId = localStorage.getItem("selectedAccountId");
    if (!accountId) {
      setErrorMessage("❌ No bank account selected.");
      console.error("⚠️ No sender account ID found in localStorage.");
    } else {
      console.log(`✅ Sender's Account ID: ${accountId}`);
      setSelectedAccountId(parseInt(accountId));
    }
  }, []);

  // ✅ Handles form submission for creating a new loan
  const handleLoanSubmit = async () => {
    setConfirmDialog(false);

    if (!loanName || !loanAmount || !loanTerm || !selectedAccountId) {
      setErrorMessage("❌ Please fill in all loan details.");
      console.error("❌ Missing fields:", { loanName, loanAmount, loanTerm, selectedAccountId });
      return;
    }

    try {
      const token = localStorage.getItem("token");
      if (!token) {
        setErrorMessage("❌ Unauthorized: Please log in again.");
        return;
      }

      console.log("🔑 Token found:", token);
      console.log("🏦 Selected Bank Account ID:", selectedAccountId);

      // ✅ Ensure `loanTerm` is a number
      const term = parseInt(loanTerm, 10);
      if (isNaN(term)) {
        setErrorMessage("❌ Loan term must be a valid number.");
        return;
      }

      // ✅ Loan Data (With Description)
      const loanData = {
        loanName,
        description: loanName, // ✅ Using Loan Name as Description
        loanAmount: parseFloat(loanAmount),
        numberOfPayments: term,
      };

      console.log("📩 Loan Request Payload:", JSON.stringify(loanData, null, 2)); // ✅ Debugging

      // ✅ Step 1: Add Loan
      const response = await axios.post(`${API_BASE_URL}/loans/add`, loanData, {
        headers: { Authorization: `Bearer ${token}` },
      });

      console.log("✅ Loan API Response:", response.data);

      const loanId = response.data.loanId;
      if (!loanId) throw new Error("Loan ID is missing from response.");

      // ✅ Step 2: Connect Loan to Bank Account
      console.log(`🚀 Linking loan ID: ${loanId} to Account ID: ${selectedAccountId}`);
      await axios.put(`${API_BASE_URL}/loans/connect/${loanId}/${selectedAccountId}`, {}, {
        headers: { Authorization: `Bearer ${token}` },
      });

      window.location.reload();
    } catch (err) {
      console.error(`❌ Error processing loan:`, err.response?.data || err.message);
      setErrorMessage("❌ Failed to process loan. Please try again.");
    }
  };

  return (
    <>
      <Sidebar />
      <div className="main-content">
        <AdminNavbar brandText="Create Loan" />
        <Header />
        <Container className="mt--7" fluid>
          <Row>
            <Col lg="6" md="8" className="mx-auto">
              <Card className="shadow">
                <CardHeader className="text-center">
                  <h5>Create New Loan</h5>
                </CardHeader>
                <CardBody>
                  {errorMessage && <div className="alert alert-danger">{errorMessage}</div>}

                  {/* Success Message */}
                  {successMessage && (
                    <div
                      style={{
                        backgroundColor: "green",
                        color: "white",
                        padding: "10px",
                        marginBottom: "20px",
                        borderRadius: "5px",
                        textAlign: "center",
                      }}
                    >
                      {successMessage}
                    </div>
                  )}

                  <Label>Loan Name</Label>
                  <Input type="text" value={loanName} onChange={(e) => setLoanName(e.target.value)} required />

                  <Label className="mt-3">Loan Amount</Label>
                  <Input type="number" value={loanAmount} onChange={(e) => setLoanAmount(e.target.value)} required />

                  <Label className="mt-3">Loan Term (Months)</Label>
                  <Input 
                    type="number" 
                    value={loanTerm} 
                    onChange={(e) => {
                      setLoanTerm(e.target.value);
                      console.log("Loan Term Input:", e.target.value); // ✅ Debugging
                    }} 
                    required 
                  />

                  <Button color="primary" className="mt-3" onClick={() => setConfirmDialog(true)}>
                    Submit Loan
                  </Button>
                </CardBody>
              </Card>
            </Col>
          </Row>
        </Container>
      </div>

      {/* ✅ Confirmation Modal */}
      <Modal isOpen={confirmDialog} toggle={() => setConfirmDialog(false)}>
        <ModalHeader>Confirm Loan</ModalHeader>
        <ModalBody>Are you sure you want to proceed with this loan?</ModalBody>
        <ModalFooter>
          <Button color="success" onClick={handleLoanSubmit}>Yes</Button>
          <Button color="danger" onClick={() => setConfirmDialog(false)}>No</Button>
        </ModalFooter>
      </Modal>
    </>
  );
};

export default CreateLoanPage;
