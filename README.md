# Fund Management and Application Tracking System

This project is a backend service for a **Fund Management and Application Tracking System** designed for admins, trustees, and users. It allows users to submit applications for funding, and admins/trustees to review, approve, and track funds with detailed reporting and history.

---

## Features

### **User Features**
- Submit new applications.
- View the status and history of submitted applications.

### **Admin Features**
- Approve/reject applications.
- Assign inquiry officers to applications.
- Add and manage funds for applications.
- View total spending within a specific date range (recurring and one-time).

### **Trustee Features**
- Review applications under committee review.
- Access transaction history and fund details.

---

## Project Structure

├── middleware/ │ ├── authorize.js # Role-based access control middleware ├── modals/ │ ├── Applications.js # Schema for application data │ ├── Documents.js # Schema for storing scanned documents │ ├── Fund.js # Schema for funds management │ ├── Transactions.js # Schema for tracking application history │ ├── Users.js # Schema for user data ├── routes/ │ ├── admin/ │ │ ├── application.js # Admin-specific application routes │ │ ├── funds.js # Admin-specific fund routes │ │ ├── user.js # Admin-specific user routes │ ├── user/ │ │ ├── application.js # User-specific application routes │ │ ├── user.js # User-specific user routes ├── utils/ │ ├── generateToken.js # Utility to generate JWT tokens ├── .env # Environment variables (e.g., database URL, secret keys) ├── index.js # Application entry point

yaml
Copy code

