import React, { useState, useEffect } from "react";
import { Form, FormGroup, Input, Label, Button } from "reactstrap";

const CustomerForm = ({ customer, onSave }) => {
  const [formData, setFormData] = useState({
    userName: "",
    email: "",
    address: "",
    employeeId: 1 // Replace with actual employee ID
  });

  useEffect(() => {
    if (customer) {
      setFormData({
        userName: customer.userName,
        email: customer.email,
        address: customer.address,
        employeeId: 1 // Replace with actual employee ID
      });
    }
  }, [customer]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave(formData);
  };

  return (
    <Form onSubmit={handleSubmit}>
      <FormGroup>
        <Label>Username</Label>
        <Input type="text" name="userName" value={formData.userName} onChange={handleChange} required />
      </FormGroup>
      <FormGroup>
        <Label>Email</Label>
        <Input type="email" name="email" value={formData.email} onChange={handleChange} required />
      </FormGroup>
      <FormGroup>
        <Label>Address</Label>
        <Input type="text" name="address" value={formData.address} onChange={handleChange} required />
      </FormGroup>
      <Button color="primary" type="submit">Save</Button>
    </Form>
  );
};

export default CustomerForm;
