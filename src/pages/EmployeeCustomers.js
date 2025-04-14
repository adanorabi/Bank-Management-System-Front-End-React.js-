import React, { useEffect, useState } from "react";
import axios from "axios";
import { 
  Container, Table, Button, Modal, ModalHeader, ModalBody, ModalFooter, 
  Form, FormGroup, Label, Input, Card, CardHeader, CardBody, Badge, Row, Col
} from "reactstrap";

const API_BASE_URL = "http://localhost:8080";

const EmployeeCustomers = () => {
  const [customers, setCustomers] = useState([]);
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [bankModalOpen, setBankModalOpen] = useState(false);
  const [bankAccounts, setBankAccounts] = useState([]);
  const [newBankAccount, setNewBankAccount] = useState({ type: "personal", currencyCode: "ILS" });

  const employeeId = localStorage.getItem("employeeId");
  const token = localStorage.getItem("token");

  if (!token) {
    console.error("❌ No token found. User is not authenticated.");
    alert("You are not authenticated. Please log in again.");
  }

  const axiosInstance = axios.create({
    baseURL: API_BASE_URL,
    headers: {
      Authorization: token ? `Bearer ${token}` : "",
      "Content-Type": "application/json",
    },
  });
  const [newCustomer, setNewCustomer] = useState({
    name: "",
    email: "",
    password: "",
    address: "",
    birthdate: "",
    userName: "",
  });
  // ✅ Fetch Customers and Refresh UI
const fetchCustomers = () => {
    axiosInstance.get("/customers/getAll")
      .then(res => setCustomers(res.data))
      .catch(err => console.error("❌ Error fetching customers:", err.response?.data || err.message));
  };
  
  useEffect(() => {
    fetchCustomers(); // ✅ Initial Load
  }, []);
  const handleEditCustomer = (customer) => {
    setSelectedCustomer(customer);
    
    // Convert ISO date to "yyyy-MM-dd" format
    const formattedDate = customer.birthdate ? customer.birthdate.split("T")[0] : "";
  
    setNewCustomer({
      name: customer.name || "",
      email: customer.email || "",
      address: customer.address || "",
      birthdate: formattedDate,  // ✅ Ensure the correct format
      userName: customer.userName || "", // Just for display, will be disabled
    });
  
    setModalOpen(true);
  };
  
  const handleSaveCustomer = async () => {
    if (!employeeId) {
      alert("Employee ID not found. Please log in again.");
      return;
    }
  
    // ✅ Ask for confirmation before saving changes
    const isConfirmed = window.confirm(
      selectedCustomer 
        ? "Are you sure you want to update this customer?" 
        : "Are you sure you want to add this customer?"
    );
    if (!isConfirmed) return;
  
    try {
      if (selectedCustomer) {
        // ✅ Editing an existing customer: Send only allowed fields
        const updatedFields = {
          name: newCustomer.name,
          address: newCustomer.address,
          email: newCustomer.email,
          birthdate: newCustomer.birthdate,
        };
  
        const response = await axiosInstance.put(
          `/employees/${employeeId}/updateCustomer/${selectedCustomer.idCode}`,
          updatedFields
        );
  
        // ✅ Update the customer list without refreshing
        setCustomers(prevCustomers => 
          prevCustomers.map(c => c.idCode === selectedCustomer.idCode ? { ...c, ...response.data } : c)
        );
      } else {
        // ✅ Adding a new customer
        const response = await axiosInstance.post(`/employees/${employeeId}/addCustomer`, newCustomer);
        setCustomers(prevCustomers => [...prevCustomers, response.data]);
      }
  
      // ✅ Reset the form and close modal
      setNewCustomer({ name: "", email: "", address: "", birthdate: "", userName: "" });
      setSelectedCustomer(null);
      setModalOpen(false);
    } catch (error) {
      console.error("❌ Error saving customer:", error.response?.data || error.message);
      alert("Failed to save customer.");
    }
  };
  
  const handleAddCustomer = async () => {
    if (!employeeId) {
      alert("Employee ID not found. Please log in again.");
      return;
    }
  
    // ✅ Confirmation before adding customer
    const isConfirmed = window.confirm("Are you sure you want to add this customer?");
    if (!isConfirmed) return;
  
    try {
      await axiosInstance.post(`/employees/${employeeId}/addCustomer`, newCustomer);
      
      fetchCustomers(); // ✅ Instead of manually adding to state, we fetch updated customers
  
      setNewCustomer({ name: "", email: "", password: "", address: "", birthdate: "", userName: "" });
      setModalOpen(false);
    } catch (error) {
      console.error("❌ Error adding customer:", error.response?.data || error.message);
      alert("Failed to add customer.");
    }
  };
  
  
  // ✅ Fetch Customers
  useEffect(() => {
    axiosInstance.get("/customers/getAll")
      .then(res => setCustomers(res.data))
      .catch(err => console.error("❌ Error fetching customers:", err.response?.data || err.message));
  }, []);
  // ✅ Handle Delete Customer
const handleDeleteCustomer = (customerId) => {
    if (!employeeId || !window.confirm("Are you sure you want to delete this customer?")) return;
  
    axiosInstance.delete(`/employees/${employeeId}/deleteCustomer/${customerId}`)
      .then(() => {
        setCustomers(prevCustomers => prevCustomers.filter(customer => customer.idCode !== customerId));
      })
      .catch(err => alert("Error: " + (err.response?.data || "Failed to delete customer")));
  };
  
  
  // ✅ Fetch Bank Accounts for a Customer
  const fetchBankAccounts = (customerId) => {
    axiosInstance.get(`/customers/get/${customerId}/accounts`)
      .then(res => setBankAccounts(res.data))
      .catch(err => console.error("❌ Error fetching bank accounts:", err.response?.data || err.message));
  };

  // ✅ Handle Creating a Bank Account (Fixed)
  const handleCreateBankAccount = async () => {
    if (!selectedCustomer || !selectedCustomer.idCode || !employeeId) {
      alert("Please select a customer first.");
      return;
    }
    if (!newBankAccount.type || !newBankAccount.currencyCode) {
      alert("Please fill in all fields before creating a bank account.");
      return;
    }

    try {
      console.log("📤 Sending request to create bank account...");
      const res = await axiosInstance.post(
        `/employees/${employeeId}/createBankAccount/customer/${selectedCustomer.idCode}/branch/1`,
        newBankAccount
      );
      console.log("✅ Bank account created successfully:", res.data);

      fetchBankAccounts(selectedCustomer.idCode); // Refresh account list
      setNewBankAccount({ type: "personal", currencyCode: "ILS" }); // Reset fields
      setBankModalOpen(false); // Close modal
    } catch (err) {
      console.error("❌ Error creating bank account:", err.response?.data || err.message);
      alert("Failed to create bank account.");
    }
  };

  // ✅ Toggle Account Status (Activate / Suspend)
  const toggleAccountStatus = (accountId, currentStatus) => {
    const action = currentStatus === "ACTIVE" ? "suspend" : "activate";

    axiosInstance.put(`/employees/${employeeId}/${action}BankAccount/${accountId}`)
      .then(() => {
        setBankAccounts(prevAccounts =>
          prevAccounts.map(acc =>
            acc.id === accountId
              ? { ...acc, status: action === "activate" ? "ACTIVE" : "SUSPENDED" }
              : acc
          )
        );
      })
      .catch(err => alert("❌ Error: " + (err.response?.data || "Failed to update account")));
  };

  // ✅ Toggle Restrict Status
  const toggleRestrictStatus = (accountId) => {
    axiosInstance.put(`/employees/${employeeId}/restrictBankAccount/${accountId}`)
      .then(() => {
        setBankAccounts(prevAccounts =>
          prevAccounts.map(acc =>
            acc.id === accountId
              ? { ...acc, status: "RESTRICTED" }
              : acc
          )
        );
      })
      .catch(err => alert("❌ Error: " + (err.response?.data || "Failed to restrict account")));
  };

  return (
    <Container className="mt-4">
      <h2 className="text-primary text-center">👥 Manage Customers</h2>

      <div className="text-end mb-3">
      <Button color="success" onClick={() => {
  setSelectedCustomer(null);
  setNewCustomer({ name: "", email: "", password: "", address: "", birthdate: "", userName: "" }); // ✅ Reset form
  setModalOpen(true);
}}>
  + Add Customer
</Button>

      </div>

      <Card className="shadow-sm">
        <CardHeader className="bg-primary text-white">Customer List</CardHeader>
        <CardBody>
          <Table responsive hover>
            <thead>
              <tr>
                <th>ID</th>
                <th>Username</th>
                <th>Email</th>
                <th style={{ width: "20%", whiteSpace: "nowrap", textAlign: "center" }}>Actions</th>

              </tr>
            </thead>
            <tbody>
              {customers.map(customer => (
                <tr key={customer.idCode}>
                  <td>{customer.idCode}</td>
                  <td>{customer.userName}</td>
                  <td>{customer.email}</td>
                  <td>
                    <Button color="info" size="sm" onClick={() => { setSelectedCustomer(customer); fetchBankAccounts(customer.idCode); }}>
                      Manage Accounts
                    </Button>{" "}
                    <Button 
  color="warning" 
  size="sm" 
  onClick={() => handleEditCustomer(customer)}
>
  Edit
</Button>

                    <Button color="danger" size="sm" onClick={() => handleDeleteCustomer(customer.idCode)}>
  Delete
</Button>

                  </td>
                </tr>
              ))}
            </tbody>
          </Table>
        </CardBody>
      </Card>

      {selectedCustomer && (
        <Card className="mt-4 shadow-sm">
          <CardHeader className="bg-secondary text-black">
            Bank Accounts for {selectedCustomer.userName}
          </CardHeader>
          <CardBody>
            <Button color="success" onClick={() => setBankModalOpen(true)}>+ Create Bank Account</Button>
            <Row className="mt-3">
              {bankAccounts.map(acc => (
                <Col md="6" lg="4" key={acc.id} className="mb-4">
                  <Card className="shadow-sm">
                    <CardHeader className="bg-secondary text-black text-center">
                      <strong>Bank Account ID: {acc.id}</strong>
                    </CardHeader>
                    <CardBody className="text-center">
                     
                      <p><strong>Balance:</strong> {acc.balance} {acc.currencyCode}</p>
                      <p><strong>Created On:</strong> {new Date(acc.createdDate).toLocaleDateString()}</p>
                      <Badge color={acc.status === "ACTIVE" ? "success" : acc.status === "SUSPENDED" ? "warning" : "danger"} className="mb-2">
                        {acc.status}
                      </Badge>
                      <div className="mt-3">
                        <Button color={acc.status === "ACTIVE" ? "warning" : "success"} size="sm" onClick={() => toggleAccountStatus(acc.id, acc.status)}>
                          {acc.status === "ACTIVE" ? "Suspend" : "Activate"}
                        </Button>{" "}
                        <Button color="danger" size="sm" onClick={() => toggleRestrictStatus(acc.id)}>
                          Restrict
                        </Button>
                      </div>
                    </CardBody>
                  </Card>
                </Col>
              ))}
            </Row>
          </CardBody>
        </Card>
      )}
{/* 🔹 Add Customer Modal */}
<Modal isOpen={modalOpen} toggle={() => setModalOpen(!modalOpen)}>
  <ModalHeader toggle={() => setModalOpen(!modalOpen)}>
    {selectedCustomer ? "Edit Customer" : "Add New Customer"}
  </ModalHeader>
  <ModalBody>
    <Form>
      <Row>
        <Col md="6">
          <FormGroup>
            <Label>Full Name</Label>
            <Input type="text" name="name" value={newCustomer.name} 
              onChange={(e) => setNewCustomer({ ...newCustomer, name: e.target.value })} />
          </FormGroup>
        </Col>
        <Col md="6">
          <FormGroup>
            <Label>Birthdate</Label>
            <Input type="date" name="birthdate" value={newCustomer.birthdate} 
              onChange={(e) => setNewCustomer({ ...newCustomer, birthdate: e.target.value })} />
          </FormGroup>
        </Col>
      </Row>
      <Row>
        <Col md="6">
          <FormGroup>
            <Label>Address</Label>
            <Input type="text" name="address" value={newCustomer.address} 
              onChange={(e) => setNewCustomer({ ...newCustomer, address: e.target.value })} />
          </FormGroup>
        </Col>
        <Col md="6">
          <FormGroup>
            <Label>Email</Label>
            <Input type="email" name="email" value={newCustomer.email} 
              onChange={(e) => setNewCustomer({ ...newCustomer, email: e.target.value })} />
          </FormGroup>
        </Col>
      </Row>
      <Row>
        <Col md="6">
          <FormGroup>
            <Label>Username</Label>
            <Input type="text" name="userName" value={newCustomer.userName} disabled />

          </FormGroup>
        </Col>
        <Col md="6">
          <FormGroup>
            <Label>Password</Label>
            <Input type="password" name="password" value={newCustomer.password} disabled />

          </FormGroup>
        </Col>
      </Row>
    </Form>
  </ModalBody>
  <ModalFooter>
  <Button color="success" onClick={handleSaveCustomer}>
    {selectedCustomer ? "Update Customer" : "Add Customer"}
  </Button>
</ModalFooter>

</Modal>

      {/* 🔹 Create Bank Account Modal (Fixed) */}
      <Modal isOpen={bankModalOpen} toggle={() => setBankModalOpen(!bankModalOpen)}>
        <ModalHeader toggle={() => setBankModalOpen(!bankModalOpen)}>Create New Bank Account</ModalHeader>
        <ModalBody>
          <Form>
            <FormGroup>
              <Label>Account Type</Label>
              <Input type="text" value={newBankAccount.type} onChange={(e) => setNewBankAccount({ ...newBankAccount, type: e.target.value })} />
            </FormGroup>
          </Form>
        </ModalBody>
        <ModalFooter>
          <Button color="success" onClick={handleCreateBankAccount}>Create</Button>
        </ModalFooter>
      </Modal>
    </Container>
  );
};

export default EmployeeCustomers;
