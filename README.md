# Frontend-End of sem

#  Campus Hostel Management System

## Overview
The **Campus Hostel Management System** is a web application that enables students to apply for hostel rooms and allows admins to manage hostel room availability and student applications. The system supports user registration, login, role-based dashboards, hostel browsing and application submission, and admin-side approval/rejection of applications.

- **GitHub pages:** https://j-uly67.github.io/Frontend-End-of-sem/
- **Render** [https://frontend-end-of-sem.onrender.com](https://frontend-end-of-sem.onrender.com)

- ## Login Details (for testing)

> Use the following test accounts to log in:

**Student**
- **Email:** `nk@123`
- **Password:** `nk123`

**Admin**
- **Email:** `ad@123`
- **Password:** `ad123`

---

## ✅ Feature Checklist

| Feature | Implemented |
|--------|-------------|
| Student Registration & Login | ✅ |
| Admin Registration & Login | ✅ |
| Role-based Dashboard Redirect | ✅ |
| Hostel Room Listings with Type & Capacity | ✅ |
| Student Hostel Room Application | ✅ |
| View Application Status (Student) | ✅ |
| Admin Review & Manage Applications | ✅ |
| Admin Hostel Room Management (Add/Delete) | ✅ |
| Filter Applications by Email | ✅ |
| Persistent Auth via localStorage | ✅ |


1. Clone the frontend repo:

   git clone https://github.com/yourusername/student-housing-frontend.git
   cd student-housing-frontend
   
2. Install dependencies:
   
   npm install
   
3. Start the frontend server (for local testing):
   
   npm start/ node server.js
   
4. Open [http://localhost:3000](http://localhost:3000) in your browser.

---

##  Notes

- Ensure the backend is running on `http://localhost:5000` when testing locally.
- The frontend expects API responses from that port (`API_BASE` is hardcoded as `http://localhost:5000/api` in `script.js`).

 
