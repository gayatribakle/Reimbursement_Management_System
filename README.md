# Reimbursement_Management_System

```markdown
# 💰 Reimbursement Management System

A full-stack web application that streamlines the reimbursement process by allowing employees to submit reimbursement requests online while enabling administrators to review, approve, or reject them efficiently.

---

## 📌 Overview

The Reimbursement Management System digitizes the traditional reimbursement workflow. Employees can submit reimbursement requests along with the required details, track the status of their requests, and receive updates. Administrators can manage requests from a centralized dashboard, making the approval process faster, organized, and transparent.

---

## ✨ Features

### Employee
- User Registration & Login
- Secure Authentication
- Submit reimbursement requests
- View reimbursement history
- Track request status
- Update profile information

### Admin
- Secure Admin Login
- View all reimbursement requests
- Approve or Reject requests
- Manage employee records
- View reimbursement statistics
- Dashboard for request management

---

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

### Other Tools
- Git
- GitHub
- REST API
- npm

---

## 📂 Project Structure

```

Reimbursement_Management_System/
│
├── client/                 # React Frontend
│   ├── public/
│   ├── src/
│   └── package.json
│
├── server/                 # Node.js Backend
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

````

---

## 🚀 Installation

### 1. Clone the repository

```bash
git clone https://github.com/gayatribakle/Reimbursement_Management_System.git
````

### 2. Navigate into the project

```bash
cd Reimbursement_Management_System
```

---

## Backend Setup

Navigate to the backend folder.

```bash
cd server
```

Install dependencies.

```bash
npm install
```

Create a `.env` file.

Example:

```env
PORT=5000

MONGO_URI=your_mongodb_connection_string

JWT_SECRET=your_secret_key
```

Start the backend server.

```bash
npm start
```

or

```bash
npm run dev
```

---

## Frontend Setup

Open another terminal.

```bash
cd client
```

Install dependencies.

```bash
npm install
```

Start the React application.

```bash
npm start
```

The application will run at:

```
http://localhost:3000
```

Backend:

```
http://localhost:5000
```

---

## 📡 API Modules

* Authentication
* User Management
* Reimbursement Requests
* Approval Management
* Profile Management

---

## 🔐 Authentication

* JWT Authentication
* Protected Routes
* Password Encryption
* Authorization Middleware

---

## 🗃️ Database Collections

* Users
* Reimbursements
* Admins

---

## 🔄 Workflow

```
Employee Login
      │
      ▼
Submit Reimbursement Request
      │
      ▼
Stored in MongoDB
      │
      ▼
Admin Dashboard
      │
      ▼
Approve / Reject
      │
      ▼
Status Updated
      │
      ▼
Employee Can Track Status
```

---

## 📸 Screenshots

You can add screenshots here.

Example:

```
screenshots/
    login.png
    dashboard.png
    reimbursement-form.png
    admin-dashboard.png
```

```markdown
![Login](screenshots/login.png)

![Dashboard](screenshots/dashboard.png)
```

---

## 🔮 Future Enhancements

* Email Notifications
* PDF Receipt Upload
* Expense Analytics Dashboard
* Multi-level Approval Workflow
* Role-Based Access Control
* Search & Filter Requests
* Export Reports (PDF/Excel)
* Mobile Responsive UI

---

## 🤝 Contributing

Contributions are welcome.

1. Fork the repository
2. Create a new branch

```bash
git checkout -b feature-name
```

3. Commit changes

```bash
git commit -m "Add new feature"
```

4. Push changes

```bash
git push origin feature-name
```

5. Open a Pull Request

---

## 📄 License

This project is intended for educational and learning purposes.

---

## 👩‍💻 Author

**Gayatri Bakale**

GitHub:
https://github.com/gayatribakle

---

⭐ If you found this project useful, consider giving it a Star on GitHub!

```
```
