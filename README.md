Inventory Management System
The Inventory Management System is a full-stack web application built with React (frontend) and Spring Boot (backend) to manage inventory operations. It allows vendors to add products, customers to purchase from vendors, and administrators to oversee the system. The application features a modern, responsive UI with Tailwind-inspired styling and a secure backend with JWT authentication.
Table of Contents

Features
Tech Stack
Project Structure
Setup Instructions
Prerequisites
Backend Setup
Frontend Setup
Database Setup


API Endpoints
Usage
//Screenshots
Contributing

Features

Vendor Management:
Vendors can add multiple products with details (name, description, price, stock, category, image URL, status).
Products are validated and sent to the backend in bulk.

Customer Purchasing:
Customers can select a vendor and view their products.
Select products with quantities (validated against stock) and place orders.

Authentication & Authorization:
JWT-based authentication with role-based access (ADMIN, VENDOR, CUSTOMER).
Secure endpoints for vendors and admins.

Responsive UI:
Tailwind-inspired design with a clean, modern look.
Modal forms, dropdowns, and tables optimized for desktop and mobile.

Product Management:
View, edit, and remove products before publishing.
Real-time quantity validation during purchase.

Error Handling:
Client-side and server-side validation with user-friendly error messages.
API error handling for failed requests.

Tech Stack

Frontend:
React (v18.x)
Axios (for API calls)
Tailwind-inspired CSS (custom styles)
Inter font (Google Fonts)


Backend:
Spring Boot (v3.x)
Spring Data JPA (Hibernate)
Spring Security (JWT authentication)
MySQL (v8.x)


Tools:
Node.js (v18.x or later)
Maven (for backend build)
Git (version control)

Setup Instructions
Prerequisites

Node.js (v18.x or later)
Java (JDK 17 or later)
Maven (v3.8.x or later)
MySQL (v8.x)
Git (for cloning the repository)

Backend Setup

Clone the Repository:
git clone https://github.com/your-username/inventory-system.git
cd inventory-system/backend

Configure Database:

Update src/main/resources/application.properties with your MySQL credentials:spring.datasource.url=jdbc:mysql://localhost:3306/inventory
spring.datasource.username=your_username
spring.datasource.password=your_password
spring.jpa.properties.hibernate.dialect=org.hibernate.dialect.MySQL8Dialect
spring.jpa.hibernate.ddl-auto=update
jwt.secret=your_jwt_secret_key

Create the inventory database in MySQL:CREATE DATABASE inventory;

Build and Run:
mvn clean install
mvn spring-boot:run

The backend runs on http://localhost:8080.


Frontend Setup

Navigate to Frontend:
cd ../frontend

Install Dependencies:
npm install

Add Google Fonts:

Ensure index.html includes:<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap">

Run the Frontend:
npm start

The frontend runs on http://localhost:3000.

Database Setup
 tables are auto created refer sql.txt file for demo data in front end
