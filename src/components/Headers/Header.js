import { useEffect, useState } from "react";
import { Card, CardBody, CardTitle, Container, Row, Col } from "reactstrap";
import axios from "axios";

const API_BASE_URL = "http://localhost:8080"; // Backend URL

const Header = () => {
  const [selectedAccount, setSelectedAccount] = useState(null);

  useEffect(() => {
    const fetchAccountDetails = async () => {
      const selectedAccountId = localStorage.getItem("selectedAccountId");
      if (!selectedAccountId) {
        console.error("❌ No selected account found in local storage.");
        return;
      }

      try {
        const token = localStorage.getItem("token");
        if (!token) {
          console.error("❌ User is not authenticated.");
          return;
        }

        console.log(`🔍 Fetching account details for ID: ${selectedAccountId}`);

        // ✅ Fetch account details based on selectedAccountId
        const response = await axios.get(
          `${API_BASE_URL}/bankAccounts/get/${selectedAccountId}`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );

        if (response.data) {
          console.log("✅ Account Data Fetched:", response.data);
          setSelectedAccount(response.data); // Store the fetched account
        } else {
          console.error("❌ No account data returned from API.");
        }
      } catch (err) {
        console.error("❌ Error fetching selected account:", err.response?.data || err.message);
      }
    };

    fetchAccountDetails();
  }, []);

  return (
    <div className="header bg-gradient-info pb-8 pt-5 pt-md-8">
      <Container fluid>
        <div className="header-body">
          <Row>
            {/* Current Bank Balance */}
            <Col lg="6" xl="8">
              <Card className="card-stats mb-4 mb-xl-0" style={{ height: "calc(100% + 20px)" }}>
                <CardBody>
                  <Row>
                    <div className="col">
                      <CardTitle tag="h5" className="text-uppercase text-muted mb-0">
                        Current Bank Account
                      </CardTitle>
                      <span className="h2 font-weight-bold mb-0">
                        {selectedAccount
                          ? ` ₪${selectedAccount.balance.toLocaleString()}`
                          : "Loading..."}
                      </span>
                    </div>
                    <Col className="col-auto">
                      <div className="icon icon-shape bg-success text-white rounded-circle shadow">
                        <i className="fas fa-wallet" />
                      </div>
                    </Col>
                  </Row>
                </CardBody>
              </Card>
            </Col>
          </Row>
        </div>
      </Container>
    </div>
  );
};

export default Header;
