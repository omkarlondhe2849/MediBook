# MediBook - Specialized Healthcare Access Platform

## 🎮 Project Overview
MediBook is a full-stack web application that transforms the healthcare booking experience. Built with a Spring Boot backend and React frontend, it provides a seamless platform for patients to find doctors, book appointments, and manage their health records, while offering doctors comprehensive tools to manage availability and patient interactions.

## ✨ Features
### 🔐 Authentication & User Management
- **JWT-based Authentication** - Secure login and registration for Patients, Doctors, and Admins.
- **User Profiles** - customized dashboards for different roles.
- **Session Management** - Persistent authentication.

### 🎯 Core Functionality
- **Smart Doctor Search** - Find specialists by category, location, or name.
- **Real-time Availability** - View doctor schedules and book instant appointments.
- **Appointment Management** - Book, reschedule, or cancel appointments with ease.
- **Doctor Dashboard** - Manage slots, view bookings, and set vacation days.
- **Admin Control** - Verify doctors, manage users, and oversee platform activity.

### 🎨 Modern UI/UX
- **Responsive Design** - Optimized for mobile and desktop.
- **Clean Interface** - Intuitive navigation for all age groups.
- **Interactive Elements** - Smooth transitions and user feedback.

## 🛠️ Technology Stack
### Backend
- **Spring Boot** - Robust Java framework for the backend.
- **MySQL** - Relational database for structured data.
- **Spring Security** - Enterprise-grade authentication.
- **JWT** - Stateless security token.
- **Maven** - Dependency management at scale.
- **Stripe** - Secure payment integration.

### Frontend
- **React** - Dynamic UI library.
- **Vite** - Lightning-fast build tool.
- **Tailwind CSS** - Modern, utility-first styling.
- **Axios** - Efficient API communication.

## 📁 Project Structure
```
MediBook/
├── localservice/
│   ├── backend/
│   │   ├── src/main/java/com/local/localservice/
│   │   │   ├── config/          # Security, Database config
│   │   │   ├── controller/      # REST Endpoints
│   │   │   ├── model/           # JPA Entities
│   │   │   ├── repository/      # DAO Layer
│   │   │   └── service/         # Business Logic
│   │   └── src/main/resources/
│   │       └── application.properties
│   │
│   └── frontend-react/
│       ├── src/
│       │   ├── components/      # Shared UI
│       │   ├── features/        # Feature-based modules (Auth, Appointments)
│       │   ├── pages/           # Route pages
│       │   └── services/        # API calls
│       └── package.json
```

## 🚀 Getting Started

### Prerequisites
- Java 17+
- Node.js 18+
- MySQL 8.0+
- Maven

### Backend Setup
1. Navigate to backend:
   ```bash
   cd localservice/backend
   ```
2. Configure `application.properties` with your credentials:
   ```properties
   spring.mail.password=${MAIL_PASSWORD}
   stripe.api.key=${STRIPE_API_KEY}
   gemini.api.key=${GEMINI_API_KEY}
   ```
3. Run the application:
   ```bash
   ./mvnw spring-boot:run
   ```
   Server starts on `http://localhost:8080`.

### Frontend Setup
1. Navigate to frontend:
   ```bash
   cd localservice/frontend-react
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Start dev server:
   ```bash
   npm run dev
   ```
   App opens at `http://localhost:5173`.

## 🎯 API Endpoints
### Authentication
- `POST /api/auth/register` - Create account
- `POST /api/auth/login` - Sign in

### Appointments
- `GET /api/appointments` - List user appointments
- `POST /api/appointments/book` - Book new slot
- `PUT /api/appointments/{id}/cancel` - Cancel booking

### Doctors
- `GET /api/doctors` - List all doctors
- `GET /api/doctors/{id}/slots` - Get availability

## 🤖 Gemini Copilot Assistant
MediBook integrates Google Gemini 2.0 Flash to assist users. The assistant helps with:
- Navigating the platform.
- Understanding medical terms (informational only).
- Explaining appointment procedures.

### Setup
Ensure `GEMINI_API_KEY` is set in your environment variables or `application.properties`.

## 🎨 Customization
### Modifying Themes
Tailwind configuration can be found in `frontend-react/tailwind.config.js`.

## 👥 Contributors
- **Omkar Londhe** - Lead Developer

## 📝 License
This project is created for educational purposes.
