# Workplace Hub - Project & Order Management

A modern, minimal, and standard freelance agency project and order management system built with **Next.js (App Router)**, **NextAuth.js**, and **MongoDB Atlas**.

---

## 🚀 Features

- **📊 Revenue & KPI Analytics**: Real-time Gross revenue, 20% platform fee deduction, and 80% Net Take-Home earnings calculation.
- **📋 High-Density Table View**: Complete tracking of client usernames, freelance marketplace profiles, brief instruction sheets, staging subdomains, live client domains, deadlines, and 5-star review ratings.
- **📌 Drag-and-Drop Kanban Board**: Visual workflow organization (`Assigned` ➔ `In Progress (WIP)` ➔ `Issues / Blocked` ➔ `Delivered` ➔ `Completed`).
- **🔐 Secure Authentication**: GitHub OAuth Login via NextAuth.js.
- **🍃 MongoDB Atlas Database**: Real-time persistent cloud storage with Mongoose schemas and REST API endpoints.
- **🔍 Filtering & Search**: Instant search by client, profile, notes, and status, with monthly category tabs.
- **💾 CSV Export**: One-click download of all orders into CSV format.

---

## 🛠️ Tech Stack

- **Framework**: Next.js 14 (App Router)
- **Database**: MongoDB Atlas with Mongoose ODM
- **Authentication**: NextAuth.js (GitHub Provider)
- **Styling**: Minimalist Design System (Vercel & Linear inspired)
- **Icons**: Lucide React

---

## ⚙️ Getting Started

### 1. Clone the repository
```bash
git clone https://github.com/Alireja-khan/workplace-management-hub.git
cd workplace-management-hub
```

### 2. Install dependencies
```bash
npm install
```

### 3. Setup Environment Variables
Create a `.env.local` file in the root directory:
```env
MONGODB_URI=your_mongodb_connection_uri
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your_nextauth_secret
GITHUB_ID=your_github_client_id
GITHUB_SECRET=your_github_client_secret
```

### 4. Run the development server
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.
