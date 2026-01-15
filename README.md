## 🛒 KrishCart

KrishCart is a frontend-focused e-commerce web application built using React and Vite.
It covers basic e-commerce features like product listing, cart functionality, orders, and user authentication using client-side state management.

The project is mainly focused on clean UI design, reusable components, and a practical React structure.
It also uses JSON Server as a mock backend to simulate real-world API integration.
KrishCart is fully responsive and built to understand how a real e-commerce frontend works.

## 🚀 Features (Currently Implemented)

• Product listing with categories
• Fetch products from REST API
• Global state management using React Context API
• Add to cart functionality
• Product detail view
• Loading state handling
• Responsive UI for all screen sizes
• Mock backend using JSON Server

## 🧠 Project Overview

This project demonstrates how a modern React application interacts with backend APIs.

Product data is fetched from a mock REST API and displayed in a clean and user-friendly interface.
JSON Server is used to simulate backend behavior, which helps in frontend development without a real database.

The goal of this project is to understand:
• API-based data flow
• State management
• Component structure
• Real-world frontend patterns

## 🧑‍💻 Tech Stack

Frontend
• React.js
• Vite
• JavaScript (ES6+)
• HTML5
• Tailwind CSS

State Management
• React Context API

Backend (Mock)
• JSON Server

Tooling
• npm
• Axios
• ESLint

📂 Project Structure

```bash
react-ecommerce/
│
├── src/
│   ├── Components/
│   ├── Pages/
│   ├── Context/
│   ├── services/
│   ├── utils/
│   ├── App.jsx
│   └── main.jsx
│
├── db.json
├── package.json
├── README.md
└── vite.config.js

```

▶️ Getting Started

Prerequisites
• Node.js (v14+)
• npm

Installation

1.  Clone the repository

```bash
git clone https://github.com/Krishnayadav1908/E-Commerce-Website.git
cd react-ecommerce
```

2. Install dependencies

```bash
npm install
```

3. Start JSON Server 4. Run the React application

```bash
npm run server
```

4. Run the React application

```bash
npm run dev
```

5. Open in browser

```bash
http://localhost:5173
```

🔄 Application Flow
• React app initializes
• Context API sets up global state
• Product data is fetched from JSON Server using Axios
• Data is stored in Context
• Components consume data and render UI
• Loading state is shown until data is available

🖼️ Screenshots

1️⃣ Home Page – Product Listing

![Home](screenshots/Home.png)

Displays all products fetched from the mock REST API.

2️⃣ Category Filtering

![category](screenshots/category.png)
Products filtered by categories like Electronics, Furniture, Clothing, etc.

3️⃣ Product Detail View

![product-detail](screenshots/product-detail.png)
Shows detailed information of the selected product.

4️⃣ Cart / Checkout Side Menu
![cart](screenshots/cart.png)
Selected products added to cart with total price.

5️⃣ Authentication Screens
![signup](screenshots/signup.png)
![signin](screenshots/signin.png)
Sign In and Sign Up UI flow.

## 👨‍💻 Contribution

This project is built individually.

Key responsibilities:
• React component development
• API integration using Axios
• Global state management with Context API
• Handling loading states
• JSON Server setup and configuration
• Debugging API and port-related issues

## ⚠️ Limitations

• No real authentication
• Uses mock backend instead of a real database
• Payment gateway not implemented
• Not deployed (backend is local JSON Server)

## 📌 Future Improvements

    •	Integrate hosted API (DummyJSON or custom backend)
    •	Authentication with JWT
    •	Payment integration
    •	Deployment with hosted backend

## Note

This project was built to understand real-world frontend development practices and API-driven UI design using React.
