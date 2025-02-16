import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom"; // ✅ Import useNavigate
import { Container, Row, Col, Card, CardHeader, CardBody } from "reactstrap";
import AdminNavbar from "components/Navbars/AdminNavbar"; // ✅ Added AdminNavbar
import axios from "axios";
import './Dashboard.css'; // Importing the Dashboard CSS

const API_BASE_URL = "http://localhost:8080"; // Replace with your backend URL

const Dashboard = () => {
    const [accounts, setAccounts] = useState([]);
    const [loading, setLoading] = useState(true); // ✅ Loading state
    const [error, setError] = useState(""); // ✅ Error state
    const navigate = useNavigate(); // ✅ Hook for navigation
  
    useEffect(() => {
      // Fetch user's bank accounts based on their username
      const fetchAccounts = async () => {
        try {
          const token = localStorage.getItem("token"); // Get JWT token
          const username = localStorage.getItem("username"); // Get username
          if (!token || !username) {
            throw new Error("User is not authenticated");
          }
  
          const response = await axios.get(`${API_BASE_URL}/customers/get/username/${username}/accounts`, {
            headers: {
              Authorization: `Bearer ${token}`, // ✅ Include JWT token in the request headers
            },
          });
  
          setAccounts(response.data);
          setError(""); // Clear any previous errors
        } catch (err) {
          console.error("❌ Error fetching accounts:", err.response?.data || err.message);
          setError("Failed to fetch accounts. Please try again later.");
        } finally {
          setLoading(false); // ✅ Stop loading
        }
      };
  
      fetchAccounts();
    }, []);
  
    const handleCardClick = (accountId) => {
        localStorage.setItem("selectedAccountId", accountId); // ✅ Store clicked account ID
        navigate("/admin/home"); // ✅ Navigate to the main home page
    };
      
    return (
      <>
        <AdminNavbar brandText="Dashboard Overview" />
        <div className="main-content">
          <Container className="mt-5" fluid>
            {loading ? (
              <p className="text-center">Loading accounts...</p>
            ) : error ? (
              <p className="text-center text-danger">{error}</p>
            ) : accounts.length === 0 ? (
              <p className="text-center">No accounts found.</p>
            ) : (
              <Row>
                {accounts.map((account) => (
                  <Col xl="4" md="6" key={account.id}>
                    <Card
                      className="rounded-lg custom-card-bg text-white card-hover"
                      onClick={() => handleCardClick(account.id)} // ✅ Store account ID on click
                      style={{ cursor: "pointer" }}
                    >
                      <CardHeader className="bg-transparent border-0">
                        <h5>{account.type}</h5>
                        <p>Balance: ₪{account.balance.toLocaleString()}</p> 
                        {/* ✅ Now displaying balance in ILS (₪) */}
                      </CardHeader>
                      <CardBody>
                        <p>Status: {account.status}</p>
                        <p>Created: {new Date(account.createdDate).toLocaleDateString()}</p>
                      </CardBody>
                    </Card>
                  </Col>
                ))}
              </Row>
            )}
          </Container>
        </div>
      </>
    );
};

export default Dashboard;
