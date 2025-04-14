import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { Container, Row, Col } from "reactstrap";

const API_BASE_URL = "http://localhost:8080";

const UserHeader = () => {
  const [userProfile, setUserProfile] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const username = localStorage.getItem("username");
        const token = localStorage.getItem("token");

        if (!username || !token) throw new Error("User not logged in.");

        const headers = { Authorization: `Bearer ${token}` };

        // Fetch user profile
        const profileResponse = await axios.get(`${API_BASE_URL}/customers/get/username/${username}`, { headers });
        setUserProfile(profileResponse.data);
      } catch (err) {
        console.error("Error fetching profile:", err.response?.data || err.message);
      }
    };

    fetchUserData();
  }, []);

  return (
    <div
      className="header pb-8 pt-5 pt-lg-8 d-flex align-items-center"
      style={{
        minHeight: "600px",
        backgroundImage:
          "url(" + require("../../assets/img/theme/profile-cover.png") + ")",
        backgroundSize: "cover",
        backgroundPosition: "center top",
      }}
    >
      {/* Mask */}
      <span className="mask bg-gradient-default opacity-8" />
      {/* Header container */}
      <Container className="d-flex align-items-center" fluid>
        <Row>
          <Col lg="7" md="10">
            <h1 className="display-2 text-white">
              Hello, {userProfile?.name || "Valued Customer"}
            </h1>
            <p className="text-white mt-0 mb-5">
              Welcome to your banking dashboard. Here, you can see all of your accounts, track your financial transactions, and ensure your finances are in order.
              Stay updated on your balances, recent transactions, and banking activities.
            </p>
          </Col>
        </Row>
      </Container>
    </div>
  );
};

export default UserHeader;
