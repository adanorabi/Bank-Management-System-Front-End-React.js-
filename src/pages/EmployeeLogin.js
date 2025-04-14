import { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
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
  InputGroupAddon,
  InputGroupText,
  InputGroup,
} from "reactstrap";
import logo from "../assets/img/logo.png";

const API_BASE_URL = "http://localhost:8080";

const EmployeeLogin = () => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
        const response = await axios.get(`${API_BASE_URL}/login`, {
            params: { username, password },
        });

        const { token } = response.data;
        if (token) {
            localStorage.setItem("token", token);
            localStorage.setItem("username", username);
            navigate("/admin/employee-dashboard"); // Redirect employee
        }
    } catch (error) {
        console.error("Login error:", error);
        setErrorMessage("Invalid username or password");
    }
};


  return (
    <div style={{
      background: 'linear-gradient(135deg, rgb(193, 251, 255) 0%, rgb(73, 158, 255) 70%)',
      height: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      paddingTop: '100px'
    }}>
      <Container className="mt--7" fluid>
        <Row className="justify-content-center">
          <Col lg="4" md="6">
            <Card className="bg-secondary border-0">
              <CardHeader className="bg-transparent text-center pb-5">
                <h2 className="text-dark">Employee Login</h2>
                <img src={logo} alt="Logo" style={{ width: "150px", marginTop: "30px" }} />
              </CardHeader>
              <CardBody className="px-lg-5 py-lg-5">
                <div className="text-center text-muted mb-4">
                  <small>Enter your employee credentials</small>
                </div>
                <Form role="form" onSubmit={handleLogin}>
                  <FormGroup className="mb-3">
                    <InputGroup className="input-group-alternative">
                      <InputGroupAddon addonType="prepend">
                        <InputGroupText>
                          <i className="ni ni-circle-08" />
                        </InputGroupText>
                      </InputGroupAddon>
                      <Input
                        placeholder="Username"
                        type="text"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        required
                      />
                    </InputGroup>
                  </FormGroup>
                  <FormGroup>
                    <InputGroup className="input-group-alternative">
                      <InputGroupAddon addonType="prepend">
                        <InputGroupText>
                          <i className="ni ni-lock-circle-open" />
                        </InputGroupText>
                      </InputGroupAddon>
                      <Input
                        placeholder="Password"
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                      />
                    </InputGroup>
                  </FormGroup>
                  <div className="text-center">
                    <Button className="my-4" color="primary" type="submit">
                      Log in
                    </Button>
                  </div>
                </Form>
                {errorMessage && <p style={{ color: "red", textAlign: "center" }}>{errorMessage}</p>}
              </CardBody>
            </Card>
          </Col>
        </Row>
      </Container>
    </div>
  );
};

export default EmployeeLogin;
