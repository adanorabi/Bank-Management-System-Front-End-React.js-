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

const CreateTransferPage = () => {
  const [transferName, setTransferName] = useState("");
  const [receiverAccountNum, setReceiverAccountNum] = useState("");
  const [transferBranchCode, setTransferBranchCode] = useState("");
  const [amount, setAmount] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState(""); // New state for success message
  const [confirmDialog, setConfirmDialog] = useState(false);
  const [selectedAccountId, setSelectedAccountId] = useState(null);

  // ✅ Get sender's bank account ID from localStorage
  useEffect(() => {
    const accountId = localStorage.getItem("selectedAccountId");
    if (!accountId) {
      setErrorMessage("❌ No sender account selected.");
      console.error("⚠️ No sender account ID found in localStorage.");
    } else {
      console.log(`✅ Sender's Account ID: ${accountId}`);
      setSelectedAccountId(parseInt(accountId));
    }
  }, []);

  // ✅ Handles form submission for creating a new transfer
  const handleTransferSubmit = async () => {
    setConfirmDialog(false); // Close confirmation modal

    if (!transferName || !receiverAccountNum || !transferBranchCode || !amount || !selectedAccountId) {
      setErrorMessage("❌ Please fill in all transfer details.");
      return;
    }

    try {
      const token = localStorage.getItem("token");
      if (!token) {
        setErrorMessage("❌ Unauthorized: Please log in again.");
        return;
      }

      // ✅ Get the current date in YYYY-MM-DD format
      const today = new Date().toISOString().split("T")[0];

      // ✅ Request payload (receiver is stored, but linking is for sender)
      const transferData = {
        transferName,
        receiverAccountNum: parseInt(receiverAccountNum), // ✅ Receiver's actual account
        transferBranchCode: parseInt(transferBranchCode),
        amount: parseFloat(amount),
        transferDate: today, // ✅ Adds today's date
        transferStatus: "PENDING",
      };

      console.log(`🔵 Sending Transfer request:`, transferData);

      // ✅ Step 1: Add the transfer
      const response = await axios.post(`${API_BASE_URL}/transfers/add`, transferData, {
        headers: { Authorization: `Bearer ${token}` },
      });

      console.log(`✅ Transfer API Response:`, response.data);

      const transferId = response.data.transactionId;
      if (!transferId) throw new Error("Transfer ID is missing from response.");

      // ✅ Step 2: Connect **only sender's** bank account (from storage)
      console.log(`🔄 Linking transfer ID: ${transferId} TO SENDER ${selectedAccountId}`);
      
      await axios.put(`${API_BASE_URL}/transfers/connect/${transferId}/${selectedAccountId}`, {}, {
        headers: { Authorization: `Bearer ${token}` },
      });

      window.location.reload();
    } catch (err) {
      console.error(`❌ Error processing transfer:`, err.response?.data || err.message);
      setErrorMessage("❌ Failed to process transfer. Please try again.");
    }
  };

  return (
    <>
      <Sidebar />
      <div className="main-content">
        <AdminNavbar brandText="Create Transfer" />
        <Header />
        <Container className="mt--7" fluid>
          <Row>
            <Col lg="6" md="8" className="mx-auto">
              <Card className="shadow">
                <CardHeader className="text-center">
                  <h5>Create New Transfer</h5>
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
                        borderRadius: "5px",
                        marginBottom: "20px",
                      }}
                    >
                      {successMessage}
                    </div>
                  )}

                  <Label>Transfer Name</Label>
                  <Input type="text" value={transferName} onChange={(e) => setTransferName(e.target.value)} required />

                  <Label className="mt-3">Receiver Account Number</Label>
                  <Input type="number" value={receiverAccountNum} onChange={(e) => setReceiverAccountNum(e.target.value)} required />

                  <Label className="mt-3">Branch Code</Label>
                  <Input type="number" value={transferBranchCode} onChange={(e) => setTransferBranchCode(e.target.value)} required />

                  <Label className="mt-3">Amount</Label>
                  <Input type="number" value={amount} onChange={(e) => setAmount(e.target.value)} required />

                  <Button color="primary" className="mt-3" onClick={() => setConfirmDialog(true)}>
                    Submit Transfer
                  </Button>
                </CardBody>
              </Card>
            </Col>
          </Row>
        </Container>
      </div>

      {/* ✅ Confirmation Modal */}
      <Modal isOpen={confirmDialog} toggle={() => setConfirmDialog(false)}>
        <ModalHeader>Confirm Transfer</ModalHeader>
        <ModalBody>Are you sure you want to proceed with this transfer?</ModalBody>
        <ModalFooter>
          <Button color="success" onClick={handleTransferSubmit}>Yes</Button>
          <Button color="danger" onClick={() => setConfirmDialog(false)}>No</Button>
        </ModalFooter>
      </Modal>
    </>
  );
};

export default CreateTransferPage;
