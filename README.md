# 🏦 Bank Management System – Front End (React.js)

## 📄 Description
This project is the front-end for a Bank Management System built with React.js. The application allows employees to log in and view financial data such as transaction history, account balances, and loan details. It connects to a backend API for data retrieval and updates.

The front-end was developed with React.js, and the backend is housed in a separate repository. You can connect the two by following the instructions below.

## 🎥 Video Demo
https://drive.google.com/file/d/1jk_9iyIPoyBeOTzkMQ8w1HoY5Gcorvis/view?usp=sharing

## 🛠️ Features
Employee Login: Allows users to log in securely and access the bank’s dashboard.

Transaction History: View all transactions, deposits, and withdrawals.

Account Balances: Displays account balances and updates them in real-time.

Loan Management: Tracks loans and their payments.

Chart Visualization: A dynamic line chart displays account balances over time.

Responsive UI: Built with responsive design using React and reactstrap.

## 💻 Tech Stack
Front-End: React.js, Axios, Chart.js, React Router, Reactstrap

Backend: Java Spring Boot (separate repository)

Authentication: JSON Web Token (JWT)

State Management: React Hooks (useState, useEffect)

## 🔗 How to Connect Frontend with Backend
The front-end connects to the backend API hosted on a local server (http://localhost:8080). If you wish to connect this front-end with your own backend, follow these steps:

Clone the back-end repository from GitHub (ensure it’s running on localhost:8080).

Make sure the CORS policy on your backend allows requests from the React front-end.

In the src/axios.js file, change the API_BASE_URL to point to your backend URL:

js
Copy
const API_BASE_URL = "http://localhost:8080";  // Update this URL if needed
Install dependencies for both the frontend and backend:

Frontend: Run npm install in the React project.

Backend: Set up and run the Spring Boot application as per the backend's instructions.

Run both servers locally, and the front-end should interact with the backend for transactions, loan management, and authentication.

## ⚙️ Installation
Clone the repository:

bash
Copy
git clone https://github.com/yourusername/Bank-Management-System-Front-End-React.js-.git
cd Bank-Management-System-Front-End-React.js
Install dependencies:

bash
Copy
npm install
Start the development server:

bash
Copy
npm start
Open your browser and navigate to http://localhost:3000.

## 📝 License
This project is licensed under the MIT License - see the LICENSE file for details.

### 🤝 Acknowledgements
Creative Tim for the free UI components used in this project.

The backend code has been reused from an existing repository, with customizations made to fit the needs of this front-end.
