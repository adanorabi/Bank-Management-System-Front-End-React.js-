import { useState, useEffect } from "react";
import { Container, Row, Col, Card, CardHeader, Table } from "reactstrap";
import Sidebar from "components/Sidebar/Sidebar"; 
import AdminNavbar from "components/Navbars/AdminNavbar"; 
import Header from "components/Headers/Header.js"; 
import axios from "axios"; 

const API_BASE_URL = "http://localhost:8080"; // Backend URL

const CurrencyExchange = () => {
  const [exchangeRates, setExchangeRates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchExchangeRates = async () => {
      const token = localStorage.getItem("token");

      if (!token) {
        console.error("⚠️ No authentication token found!");
        setError("Unauthorized: Please log in.");
        setLoading(false);
        return;
      }

      try {
        console.log("🔄 Fetching exchange rates...");

        const response = await axios.get(`${API_BASE_URL}/currency-rates/getAll`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        console.log("✅ Exchange rates received:", response.data);

        let rates = response.data || [];

        // ✅ Move USD, ILS, and EUR to the top
        const preferredCurrencies = ["USD", "ILS", "EUR"];
        rates.sort((a, b) => {
          if (preferredCurrencies.includes(a.currencyCode) && !preferredCurrencies.includes(b.currencyCode)) {
            return -1; // Move preferred currencies up
          }
          if (!preferredCurrencies.includes(a.currencyCode) && preferredCurrencies.includes(b.currencyCode)) {
            return 1; // Move non-preferred currencies down
          }
          return 0; // Keep order otherwise
        });

        setExchangeRates(rates);
        setError("");
      } catch (err) {
        console.error("❌ Error fetching exchange rates:", err);
        setError("Failed to fetch exchange rates.");
      } finally {
        setLoading(false);
      }
    };

    fetchExchangeRates(); 
  }, []);

  return (
    <>
      <Sidebar />
      <div className="main-content">
        <AdminNavbar brandText="Currency Exchange" />
        <Header />

        <Container className="mt--7" fluid>
          <Row className="mt-5" style={{ marginTop: "100px", marginBottom: "30px" }}>
            <Col lg="8" className="mx-auto">
              <Card className="shadow">
                <CardHeader className="border-0">
                  <h3 className="mb-0">Current Exchange Rates</h3>
                </CardHeader>
                <Table className="align-items-center table-flush" responsive>
                  <thead className="thead-light">
                    <tr>
                      <th scope="col">Currency</th>
                      <th scope="col">Exchange Rate</th>
                    </tr>
                  </thead>
                  <tbody>
                    {loading ? (
                      <tr>
                        <td colSpan="2" className="text-center">Loading...</td>
                      </tr>
                    ) : error ? (
                      <tr>
                        <td colSpan="2" className="text-center text-danger">{error}</td>
                      </tr>
                    ) : exchangeRates.length === 0 ? (
                      <tr>
                        <td colSpan="2" className="text-center">No data available.</td>
                      </tr>
                    ) : (
                      exchangeRates.map((rate, index) => (
                        <tr key={index}>
                          <td>{rate.currencyCode}</td>
                          <td>{rate.rate}</td> {/* ✅ Ensure the correct field is used */}
                        </tr>
                      ))
                    )}
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

export default CurrencyExchange;
