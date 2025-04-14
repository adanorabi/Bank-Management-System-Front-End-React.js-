import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import {
  Container,
  Row,
  Col,
  Card,
  CardHeader,
  CardBody,
} from "reactstrap";
import Sidebar from "components/Sidebar/Sidebar";
import AdminNavbar from "components/Navbars/AdminNavbar";
import UserHeader from "components/Headers/UserHeader.js";

const API_BASE_URL = "http://localhost:8080";

const UserProfile = () => {
  const navigate = useNavigate();
  const [userProfile, setUserProfile] = useState(null);
  const [accounts, setAccounts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // ✅ Format birthdate nicely
  const formatDate = (isoDate) => {
    if (!isoDate) return "No birthdate available";
    const date = new Date(isoDate);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "long", // "April"
      day: "numeric", // "20"
    });
  };

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const username = localStorage.getItem("username");
        const token = localStorage.getItem("token");

        if (!username || !token) throw new Error("User not logged in.");

        const headers = { Authorization: `Bearer ${token}` };

        // Fetch user profile
        const profileResponse = await axios.get(`${API_BASE_URL}/customers/get/username/${username}`, { headers });

        // ✅ Ensure firstName is taken from `name`
        const userData = {
          ...profileResponse.data,
          firstName: profileResponse.data.name, // ✅ Corrected field mapping
        };

        setUserProfile(userData);

        // Fetch bank accounts
        const accountsResponse = await axios.get(`${API_BASE_URL}/customers/get/username/${username}/accounts`, { headers });
        setAccounts(accountsResponse.data);
      } catch (err) {
        console.error("Error fetching profile:", err.response?.data || err.message);
        setError("Failed to fetch profile. Please try again.");
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
  }, []);

  // ✅ Click to store selected account & navigate
  const handleAccountClick = (accountId) => {
    localStorage.setItem("selectedAccountId", accountId);
    navigate("/admin/home"); // ✅ Redirects to main home like in Dashboard
  };

  return (
    <>
      <Sidebar />
      <div className="main-content">
        <AdminNavbar brandText="User Profile" />
        <UserHeader />

        <Container className="mt--7" fluid>
          {loading ? (
            <p className="text-center">Loading profile...</p>
          ) : error ? (
            <p className="text-center text-danger">{error}</p>
          ) : userProfile ? (
            <Row className="mb-4">
              {/* ✅ User Info */}
              <Col lg="4">
                <Card className="card-profile shadow">
                  <CardBody className="text-center">
                    <div className="rounded-circle bg-light d-flex align-items-center justify-content-center"
                      style={{ width: "120px", height: "120px", margin: "0 auto" }}>
                      <i className="ni ni-single-02 text-primary" style={{ fontSize: "50px" }} />
                    </div>
                    <h3 className="mt-3">
                      {userProfile.firstName || "Valued Customer"} {/* ✅ Now using firstName correctly */}
                    </h3>
                    <p className="text-muted">{userProfile.email || "No email found"}</p>
                    <p className="text-dark"><strong>Username:</strong> {userProfile.userName || "No username"}</p>
                    <p><i className="ni location_pin mr-2" />{userProfile.address || "No address"}</p>
                    <p><i className="ni calendar-grid-58 mr-2" />Birthdate: {formatDate(userProfile.birthdate)}</p>
                  </CardBody>
                </Card>
              </Col>

              {/* ✅ User Bank Accounts */}
              <Col lg="8">
                <Card className="bg-secondary shadow">
                  <CardHeader className="bg-white border-0">
                    <h3 className="mb-0">My Bank Accounts</h3>
                  </CardHeader>
                  <CardBody>
                    {accounts.length === 0 ? (
                      <p className="text-center">No accounts found.</p>
                    ) : (
                      <Row>
                        {accounts.map((account) => (
                          <Col md="6" key={account.id} className="mb-3">
                            <Card
                              className="shadow border-0 text-center"
                              onClick={() => handleAccountClick(account.id)} // ✅ Navigates on click
                              style={{ cursor: "pointer", background: "#f7fafc" }}
                            >
                              <CardBody>
                                <h5 className="text-primary">{account.type}</h5>
                                <p className="text-dark">Balance: ₪{account.balance.toLocaleString()}</p>
                                <p className="text-muted">Status: {account.status}</p>
                              </CardBody>
                            </Card>
                          </Col>
                        ))}
                      </Row>
                    )}
                  </CardBody>
                </Card>
              </Col>
            </Row>
          ) : (
            <p className="text-center text-warning">User profile not found.</p>
          )}
        </Container>
      </div>
    </>
  );
};

export default UserProfile;
