
# 💰 Reimbursement Management System

A full-stack web application that streamlines the reimbursement process by allowing employees to submit reimbursement requests online while enabling administrators to review, approve, or reject requests efficiently.

## 📌 Overview

The Reimbursement Management System digitizes the traditional reimbursement workflow. Employees can submit reimbursement requests with the required details, track their request status, and view their reimbursement history.

Administrators can manage all requests through a centralized dashboard, making the approval process faster, more organized, and transparent.

## ✨ Features

### 👨‍💼 Employee Module
- User Registration and Login
- Secure Authentication
- Submit Reimbursement Requests
- View Reimbursement History
- Track Request Status
- Update Profile Information

### 🛡️ Admin Module
- Secure Admin Login
- View All Reimbursement Requests
- Approve or Reject Requests
- Manage Employee Records
- View Reimbursement Statistics
- Centralized Admin Dashboard

## 🛠️ Tech Stack

### Frontend
- React.js
- HTML5
- CSS3
- JavaScript

### Backend
- Node.js
- Express.js

### Database
- MongoDB

### Tools & Technologies
- REST APIs
- JWT Authentication
- Git and GitHub
- npm

## 📂 Project Structure

```text
Reimbursement_Management_System/
│
├── client/                  # React Frontend
│   ├── public/
│   ├── src/
│   └── package.json
│
├── server/                  # Node.js Backend
│   ├── config/
│   ├── controllers/
│   ├── middleware/
│   ├── models/
│   ├── routes/
│   ├── package.json
│   └── server.js
│
├── README.md
└── .gitignore
```

## 🚀 Installation and Setup

### 1. Clone the Repository

```bash
git clone https://github.com/gayatribakle/Reimbursement_Management_System.git
```

### 2. Navigate to the Project Directory

```bash
cd Reimbursement_Management_System
```

## ⚙️ Backend Setup

### 1. Navigate to the Server Directory

```bash
cd server
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Configure Environment Variables

Create a `.env` file inside the `server` directory and add the following:

```env
PORT=5000
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_secret_key
```

Replace the placeholder values with your actual MongoDB connection string and JWT secret.

### 4. Start the Backend Server

```bash
npm start
```

Or, if using nodemon:

```bash
npm run dev
```

## 💻 Frontend Setup

Open a new terminal.

### 1. Navigate to the Client Directory

```bash
cd client
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Start the React Application

```bash
npm start
```

## 🌐 Application URLs

| Component | URL |
|---|---|
| Frontend | http://localhost:3000 |
| Backend | http://localhost:5000 |

## 📡 API Modules

The application includes the following API modules:

- Authentication
- User Management
- Reimbursement Requests
- Approval Management
- Profile Management

## 🔐 Authentication and Security

- JWT-based Authentication
- Protected Routes
- Password Hashing
- Authorization Middleware

## 🗃️ Database Collections

The application uses MongoDB to store the following collections:

- Users
- Reimbursements
- Admins

## 🔄 Application Workflow

```text
Employee Login
      |
      v
Submit Reimbursement Request
      |
      v
Store Request in MongoDB
      |
      v
Admin Dashboard
      |
      v
Approve / Reject Request
      |
      v
Update Request Status
      |
      v
Employee Tracks Request Status
```

## 📸 Screenshots

Add screenshots of your application to showcase its interface.

```text
screenshots/
├── login.png
├── dashboard.png
├── reimbursement-form.png
└── admin-dashboard.png
```

### Login Page
![Login Page](screenshots/login.png)

### Employee Dashboard
![Employee Dashboard](screenshots/dashboard.png)

### Reimbursement Form
![Reimbursement Form](screenshots/reimbursement-form.png)

### Admin Dashboard
![Admin Dashboard](screenshots/admin-dashboard.png)

## 🔮 Future Enhancements

- Email Notifications
- PDF Receipt Upload
- Expense Analytics Dashboard
- Multi-Level Approval Workflow
- Role-Based Access Control
- Search and Filter Requests
- Export Reports in PDF/Excel
- Mobile-Responsive UI

## 🤝 Contributing

Contributions are welcome!

1. Fork the repository.
2. Create a new branch:

   ```bash
   git checkout -b feature-name
   ```

3. Commit your changes:

   ```bash
   git commit -m "Add new feature"
   ```

4. Push your changes:

   ```bash
   git push origin feature-name
   ```

5. Open a Pull Request.

## 📄 License

This project is intended for educational and learning purposes.

## 👩‍💻 Author

**Gayatri Bakale**

- GitHub: [gayatribakle](https://github.com/gayatribakle)

---

⭐ If you find this project useful, consider giving it a star on GitHub!
