import { useState } from "react";
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

const CreateLoanPage = () => {
  const [loanName, setLoanName] = useState("");
  const [loanAmount, setLoanAmount] = useState("");
  const [loanTerm, setLoanTerm] = useState("");
  const [loanType, setLoanType] = useState("SHPITZER"); // Default type
  const [interestRate, setInterestRate] = useState("5"); // Default interest rate (5%)
  const [startPaymentDate, setStartPaymentDate] = useState(""); // Date input
  const [errorMessage, setErrorMessage] = useState("");
  const [confirmDialog, setConfirmDialog] = useState(false);

  // ✅ Handles form submission for creating a new loan
  const handleLoanSubmit = async () => {
    setConfirmDialog(false);
  
    if (!loanName || !loanAmount || !loanTerm || !startPaymentDate) {
      setErrorMessage("❌ Please fill in all loan details.");
      return;
    }
  
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        setErrorMessage("❌ Unauthorized: Please log in again.");
        return;
      }
  
      // ✅ Retrieve selected bank account ID
      const bankAccountId = localStorage.getItem("selectedAccountId");
      if (!bankAccountId) {
        setErrorMessage("❌ No bank account selected.");
        return;
      }
  
      console.log("🔑 Token found:", token);
      console.log("🏦 Selected Bank Account ID:", bankAccountId);
  
      // ✅ Calculate `endPaymentDate`
      const startDate = new Date(startPaymentDate);
      const endDate = new Date(startDate);
      endDate.setMonth(endDate.getMonth() + parseInt(loanTerm)); // Add loanTerm months
  
      // ✅ Loan Data (DO NOT include interestRate)
      const loanData = {
        loanName,
        loanAmount: parseFloat(loanAmount),
        loanTerm: parseInt(loanTerm),
        loanType,
        startPaymentDate,
        endPaymentDate: endDate.toISOString().split("T")[0], // Send formatted date
      };
  
      console.log(`🔵 Sending Loan request:`, loanData);
  
      // ✅ Step 1: Add Loan
      const response = await axios.post(`${API_BASE_URL}/loans/add`, loanData, {
        headers: { Authorization: `Bearer ${token}` },
      });
  
      console.log(`✅ Loan API Response:`, response.data);
  
      const loanId = response.data.loanId;
      if (!loanId) throw new Error("Loan ID is missing from response.");
  
      // ✅ Step 2: Connect Loan to Bank Account
      await axios.put(`${API_BASE_URL}/loans/connect/${loanId}/${bankAccountId}`, {}, {
        headers: { Authorization: `Bearer ${token}` },
      });
  
      alert("Loan added and linked successfully!");
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

                  <Label>Loan Name</Label>
                  <Input type="text" value={loanName} onChange={(e) => setLoanName(e.target.value)} required />

                  <Label className="mt-3">Loan Amount</Label>
                  <Input type="number" value={loanAmount} onChange={(e) => setLoanAmount(e.target.value)} required />

                  <Label className="mt-3">Loan Term (Months)</Label>
                  <Input type="number" value={loanTerm} onChange={(e) => setLoanTerm(e.target.value)} required />

                  <Label className="mt-3">Interest Rate (%)</Label>
                  <Input type="number" value={interestRate} onChange={(e) => setInterestRate(e.target.value)} required />

                  <Label className="mt-3">Loan Type</Label>
                  <Input type="select" value={loanType} onChange={(e) => setLoanType(e.target.value)}>
                    <option value="SHPITZER">Shpitzer (Fixed Monthly Payment)</option>
                    <option value="EQUAL_PRINCIPAL">Equal Principal (קרן שווה)</option>
                  </Input>

                  <Label className="mt-3">Start Payment Date</Label>
                  <Input type="date" value={startPaymentDate} onChange={(e) => setStartPaymentDate(e.target.value)} required />

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
