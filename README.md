# LoanSphere — Personal Loan Management System

A full-stack personal loan management platform where users can apply for loans and admins can review, approve, or reject applications with automated EMI schedule generation.

**Live Demo:** https://capstone-personal-loan.github.io/management/

---

## Table of Contents

- [About the Project](#about-the-project)
- [Features](#features)
- [Tech Stack](#tech-stack)
- [Getting Started](#getting-started)
- [How to Test the App](#how-to-test-the-app)
- [Loan Eligibility Criteria](#loan-eligibility-criteria)
- [Project Structure](#project-structure)

---

## About the Project

LoanSphere is a capstone project simulating a real-world personal loan system. It supports two distinct roles — **User** and **Admin** — each with their own dashboard and workflows. Users can apply for loans, track their application status, and pay EMIs. Admins can review pending applications and approve or reject them, triggering automatic loan account creation and EMI schedule generation at 12% p.a.

---

## Features

### User
- Register and log in securely
- Apply for a personal loan with instant eligibility check
- Track application status — Pending, Approved, or Rejected
- View full EMI breakdown for approved loans
- Make EMI payments directly from the dashboard
- View complete payment history per loan

### Admin
- View all loan applications across all users
- Filter applications by status: All, Pending, Approved, Rejected
- Review applicant details before making a decision
- Approve a loan — automatically creates a loan account and generates the full EMI schedule at 12% p.a.
- Reject a loan with a custom rejection reason visible to the user

---

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React |
| Styling | Custom CSS (ud-* design system) |
| Icons | Lucide React |
| Fonts | Geist, Geist Mono (Google Fonts) |
| Hosting | GitHub Pages |

---

## Getting Started

### Prerequisites
- Node.js v18+
- npm or yarn

### Installation

```bash
git clone https://github.com/capstone-personal-loan/management.git
cd management
npm install
npm run dev
```

The app will be available at `http://localhost:3000`.

---

## How to Test the App

Follow these steps to walk through the full loan lifecycle from application to EMI payment.

### Step 1 — Create a User Account

1. Open the app at https://capstone-personal-loan.github.io/management/
2. Click **Register** and create a new account with any email and password
3. Log in with those credentials
4. You will land on the **User Dashboard**

### Step 2 — Apply for a Loan

1. Click **New Loan** in the top right, or **Apply for a Loan** in the dashboard
2. Fill in the loan application form:
   - Monthly Income (e.g. 75,000)
   - Loan Amount (e.g. 3,00,000)
   - Tenure in months (e.g. 24)
   - Purpose (select from the dropdown)
3. Click **Submit Application**
4. Your application will appear in the **Application History** table with status `PENDING`
5. **Sign Out**

### Step 3 — Create an Admin Account

1. Register a **new account** with a different email
2. Log in — the system will detect admin privileges and redirect you to the **Admin Dashboard**



### Step 4 — Review the Application

1. On the Admin Dashboard, locate the pending application in the **All Applications** table
2. Click the **Review** button on the application row
3. In the Review modal, you will see the applicant's details — name, income, loan amount, tenure, and purpose
4. Select a decision from the dropdown:
   - **Approve** — creates a loan account at 12% p.a. and auto-generates the EMI schedule
   - **Reject** — declines the application; optionally provide a rejection reason
5. Click **Approve Loan** or **Reject Application**
6. **Sign Out**

### Step 5 — Pay an EMI (if approved)

1. Log back in with the **User account**
2. The application status will now show `APPROVED` or `REJECTED`
3. If approved, click **View EMI** on the application row
4. The EMI Schedule tab shows each installment with due date, principal, interest, and status
5. Click **Pay Now** on any pending installment to make a payment
6. Switch to the **Payment History** tab to confirm the transaction

---

## Loan Eligibility Criteria

| Criteria | Requirement |
|---|---|
| Minimum Monthly Income | Rs. 15,000 |
| Maximum Loan Amount | 10x monthly income |
| EMI Cap | Must not exceed 50% of monthly income |
| Tenure Range | 6 to 60 months |
| Interest Rate | 12% per annum (flat reducing balance) |

Applications that do not meet these criteria will be automatically rejected at submission.

---

## Project Structure

```
src/
  pages/
    AuthPage.jsx          # Login and registration
    UserDashboard.jsx     # User portal — apply, track, pay EMIs
    AdminDashboard.jsx    # Admin portal — review and manage applications
  services/
    api.js                # Axios API calls to the backend
  styles/
    UserDashboard.css     # Shared ud-* design system (covers both dashboards)
  App.jsx                 # Root — session management and role-based routing
```

---

