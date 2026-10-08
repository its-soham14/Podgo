# Phase 1 Walkthrough: Project Setup & Authentication

We have successfully completed **Phase 1** of PodGo, laying a robust foundation for both the backend and frontend.

## What Was Built

### 1. Spring Boot Backend Architecture
- **Structure**: Initialized a Java 21 monolithic project with all required dependencies (`Spring Security`, `JWT`, `MySQL`, `Redis`, `JPA`, `Mail`).
- **Database Schema**: Created all the core entities mapping directly to the `Architecture.md` document, including `User`, `Ride`, `Booking`, and `DriverProfile`.
- **Security**: 
  - Implemented `SecurityConfig` to protect all API endpoints except `/api/v1/auth/**`.
  - Configured `JwtUtil` and `JwtAuthFilter` for stateless authentication.
  - Implemented `GlobalExceptionHandler` to enforce consistent `ApiResponse<T>` wrappers.
- **Authentication Service**:
  - Implemented a complete registration flow.
  - Integrated an `OtpService` using `JavaMailSender` for email OTPs and `RedisTemplate` for TTL caching and rate limiting (max 3 per hour).

### 2. React + Vite Frontend Setup
- **Scaffolding**: Created the Vite app and set up routing with `react-router-dom`.
- **Styling**: Configured `Tailwind CSS` heavily relying on the provided Design System (Indigo primary, Teal accent, Syne/Inter fonts, Light/Dark mode).
- **State & API**:
  - Configured an `Axios` instance to automatically inject JWT tokens into headers and intercept 401 errors.
  - Set up a lightweight `Zustand` store (`authStore.js`) for global auth state.
- **Pages**:
  - Built out `RegisterPage`, `OtpVerifyPage`, and `LoginPage`.
  - Created a `ProtectedRoute` wrapper to gate authenticated content.

## Next Steps
We are now fully prepared to enter **Phase 2**, which introduces the immersive `Three.js` 3D homepage and the Driver Onboarding / Document Upload workflow.

> [!NOTE]
> Before you run the backend, ensure your local MySQL server is running on port 3306 and Redis on port 6379. Update `application-dev.properties` with your real Gmail SMTP credentials when you're ready to test live emails.
