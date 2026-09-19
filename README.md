# 📸 Mommenta

### A full-stack social media web application for sharing moments and connecting with people.

**Mommenta** is a full-stack social media platform built to provide users with a modern space to share posts, interact with other users, communicate in real time, and receive notifications.

The project was designed and developed as a complete full-stack application, covering the frontend experience, backend APIs, database management, authentication, media handling, and real-time communication.

🔗 **Live Application:** https://mommenta.vercel.app/

---

## ✨ Features

### 🔐 Authentication

* User registration and login
* Authentication and protected routes
* Persistent user sessions
* Profile management

### 📝 Posts & Social Interaction

* Create and share posts
* Upload images and videos
* Like and unlike posts
* Comment on posts
* Follow and unfollow users
* Hashtag support
* Responsive post feed

### 📱 Stories

* Share temporary visual content
* View user stories
* Story-based social interaction

### 💬 Real-Time Messaging

* Real-time conversations
* Socket-based communication
* Media sharing in conversations
* Message notifications

### 🔔 Notifications

* Activity notifications
* Unread notification indicators
* Mark notifications as read
* Real-time notification updates

### ☁️ Media Management

* Image and video uploads
* Cloud-based media storage using Cloudinary
* Media handling for posts and conversations

### 📱 Responsive Design

* Mobile-friendly interface
* Responsive desktop experience
* Reusable React components
* Modern social-media-inspired UI

---

## 🛠️ Tech Stack

### Frontend

* React
* JavaScript
* React Router
* Tailwind CSS
* Vite
* MDI Icons
* Swiper
* Emoji Picker

### Backend

* Node.js
* Express.js
* REST APIs
* Socket-based real-time communication

### Database

* MongoDB
* Mongoose

### Services & Deployment

* Cloudinary — media storage and management
* Vercel — frontend deployment
* Render — backend deployment

### Development Tools

* Git
* GitHub
* VS Code

---

## 🏗️ Application Architecture

Mommenta uses a separate frontend and backend architecture.

```text
                    MOMMENTA
                       │
          ┌────────────┴────────────┐
          │                         │
      Frontend                   Backend
       React                    Node.js
         │                      Express.js
         │                         │
         └────────── API ──────────┘
                                   │
                          ┌────────┴────────┐
                          │                 │
                       MongoDB          Cloudinary
                       Database           Media
                          │
                     Real-Time
                   Socket Connection
```

The React frontend communicates with the Express backend through REST APIs, while MongoDB handles persistent application data and Cloudinary manages uploaded media.

---

## 📂 Project Structure

```text
mommenta/
│
├── mommenta-frontend/
│   ├── src/
│   ├── public/
│   └── ...
│
├── mommenta-backend/
│   ├── controllers/
│   ├── models/
│   ├── routes/
│   ├── middleware/
│   └── ...
│
└── README.md
```

---

## 🚀 Getting Started

### Prerequisites

Make sure you have installed:

* Node.js
* npm
* MongoDB
* Git

You will also need a Cloudinary account if you want to use the media upload functionality.

### Clone the repository

```bash
git clone https://github.com/ismailhabeeb/mommenta.git

cd mommenta
```

### Frontend

```bash
cd mommenta-frontend
npm install
npm run dev
```

### Backend

Open another terminal:

```bash
cd mommenta-backend
npm install
npm run dev
```

### Environment Variables

Create the appropriate `.env` files for the frontend and backend and configure your required environment variables for:

* MongoDB
* Authentication
* Cloudinary
* Backend API URL
* Other application-specific configuration

**Do not commit your `.env` files or secret credentials to GitHub.**

---

## 🌐 Live Demo

**Frontend:**
https://mommenta.vercel.app/

**Backend:**
https://mommenta.onrender.com/

---

## 📌 Project Highlights

Mommenta demonstrates experience with:

* Full-stack application development
* React-based frontend architecture
* REST API development
* MongoDB database design
* Authentication and protected routes
* Real-time communication
* Cloud media management
* Responsive interface development
* Frontend and backend deployment

---

## 👨🏽‍💻 Developer

**Ismail Habeeb Oluwatobi**

Full-Stack Developer with a background in web development, graphic design, branding, and Mass Communication.

🔗 LinkedIn:
https://www.linkedin.com/in/habeeb-ismail-9547a7234

💻 GitHub:
https://github.com/ismailhabeeb

📧 Email:
[ismailhabeeboluwatobi995@gmail.com](mailto:ismailhabeeboluwatobi995@gmail.com)

---

## 📄 License

This project is available for learning and portfolio purposes.
