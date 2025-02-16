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
  FormGroup,
  Form,
  Input,
  Button,
  Label,
  Alert,
} from "reactstrap";
import logo from "../assets/img/logo.png";

const API_BASE_URL = "http://localhost:8080";

const SignUp = () => {
  const [formData, setFormData] = useState({
    firstName: "",
    email: "",
    password: "",
    address: "",
    birthdate: "",
    userName: "",
    otp: "",
  });

  const [step, setStep] = useState(1); // Step 1: User details, Step 2: OTP verification
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [countdown, setCountdown] = useState(300); // 5 minutes (300 seconds)
  const [resendEnabled, setResendEnabled] = useState(false);
  const navigate = useNavigate();

  // Handle Input Change
  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value.trim(),
    });
  };

  // Timer effect for countdown
  useEffect(() => {
    if (step === 2 && countdown > 0) {
      const timer = setInterval(() => setCountdown((prev) => prev - 1), 1000);
      return () => clearInterval(timer);
    } else if (countdown === 0) {
      setResendEnabled(true);
    }
  }, [countdown, step]);

  // ✅ **Step 1: Validate User Info & Send OTP**
  const handleContinue = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErrorMessage("");
    setSuccessMessage("");

    try {
      const response = await axios.get(`${API_BASE_URL}/otp/generate`, {
        params: {
          email: formData.email,
          userName: formData.userName,
          firstName: formData.firstName,
          birthdate: formData.birthdate,
          password: formData.password,
          address: formData.address,
        },
      });

      console.log("✅ OTP Sent:", response.data);
      setSuccessMessage("OTP sent to your email. Please enter it below.");
      setStep(2); // Move to OTP step
      setCountdown(300); // Reset timer
      setResendEnabled(false);
    } catch (error) {
      console.error("❌ OTP Request Failed:", error.response ? error.response.data : error);
      setErrorMessage(error.response?.data || "Failed to send OTP. Try again.");
    } finally {
      setLoading(false);
    }
  };

  // ✅ **Step 2: Validate OTP & Register**
  const handleSignup = async (e) => {
    e.preventDefault();
    if (!formData.otp || formData.otp.length !== 6) {
      setErrorMessage("Please enter a valid 6-digit OTP.");
      return;
    }

    setLoading(true);
    setErrorMessage("");
    setSuccessMessage("");

    try {
      // Validate OTP
      await axios.get(`${API_BASE_URL}/otp/validate`, {
        params: { email: formData.email, otp: formData.otp },
      });

      // Register User
      await axios.post(`${API_BASE_URL}/customers/add`, {
        ...formData,
        otp: undefined, // Exclude OTP before sending data to backend
      });

      alert("Signup successful! Please log in.");
      navigate("/auth/login");
    } catch (error) {
      console.error("❌ Registration Failed:", error.response ? error.response.data : error);
      setErrorMessage(error.response?.data || "Invalid OTP or registration failed.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      style={{
        background: "linear-gradient(135deg, rgb(193, 251, 255) 0%, rgb(73, 158, 255) 70%)",
        height: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        paddingTop: "50px",
      }}
    >
      <Container>
        <Row className="justify-content-center">
          <Col lg="5" md="8">
            <Card className="bg-secondary border-0">
              <CardHeader className="bg-transparent text-center pb-3">
                <h2 className="text-dark">{step === 1 ? "Create a New Account" : "Verify OTP"}</h2>
                <img src={logo} alt="Logo" style={{ width: "120px", marginBottom: "10px" }} />
              </CardHeader>
              <CardBody className="px-lg-5 py-lg-4">
                {errorMessage && <Alert color="danger">{errorMessage}</Alert>}
                {successMessage && <Alert color="success">{successMessage}</Alert>}

                {step === 1 ? (
                  // Step 1: User Information
                  <Form role="form" onSubmit={handleContinue}>
                    <FormGroup>
                      <Input placeholder="Full Name" type="text" name="firstName" value={formData.firstName} onChange={handleChange} required />
                    </FormGroup>

                    <Row>
                      <Col md="6">
                        <FormGroup>
                          <Input type="date" name="birthdate" value={formData.birthdate} onChange={handleChange} required />
                        </FormGroup>
                      </Col>
                      <Col md="6">
                        <FormGroup>
                          <Input placeholder="Address" type="text" name="address" value={formData.address} onChange={handleChange} required />
                        </FormGroup>
                      </Col>
                    </Row>

                    <FormGroup>
                      <Input placeholder="Email" type="email" name="email" value={formData.email} onChange={handleChange} required />
                    </FormGroup>

                    <Row>
                      <Col md="6">
                        <FormGroup>
                          <Input placeholder="Username" type="text" name="userName" value={formData.userName} onChange={handleChange} required />
                        </FormGroup>
                      </Col>
                      <Col md="6">
                        <FormGroup>
                          <Input placeholder="Password" type="password" name="password" value={formData.password} onChange={handleChange} required />
                        </FormGroup>
                      </Col>
                    </Row>

                    <div className="text-center">
                      <Button color="primary" type="submit" disabled={loading}>
                        {loading ? "Processing..." : "Continue"}
                      </Button>
                    </div>

                    {/* ✅ Added "Already have an account?" link */}
                    <div className="text-center mt-3">
                      <a href="/auth/login" className="text-gray">
                        <small>Already have an account? Log in</small>
                      </a>
                    </div>
                  </Form>
                ) : (
                  // Step 2: OTP Verification
                  <Form role="form" onSubmit={handleSignup}>
                    <Label>Enter 6-digit OTP:</Label>
                    <FormGroup>
                      <Input
                        type="text"
                        name="otp"
                        value={formData.otp}
                        maxLength="6"
                        onChange={handleChange}
                        required
                        style={{
                          textAlign: "center",
                          fontSize: "20px",
                          fontWeight: "bold",
                        }}
                      />
                    </FormGroup>
                    <p className="text-center" style={{ fontSize: "18px", fontWeight: "bold" }}>
                      OTP expires in:{" "}
                      <span style={{ color: countdown < 60 ? "red" : "black" }}>
                        {Math.floor(countdown / 60)}:{String(countdown % 60).padStart(2, "0")}
                      </span>
                    </p>
                    {resendEnabled && (
                      <div className="text-center">
                        <Button color="link" onClick={handleContinue}>
                          Resend OTP
                        </Button>
                      </div>
                    )}
                    <div className="text-center">
                      <Button color="success" type="submit" disabled={loading}>
                        {loading ? "Verifying..." : "Confirm & Register"}
                      </Button>
                    </div>
                  </Form>
                )}
              </CardBody>
            </Card>
          </Col>
        </Row>
      </Container>
    </div>
  );
};

export default SignUp;
