# PodGo - "Skip the traffic. Share the pod."

Based on all 6 documents provided (`Architecture.md`, `Design.md`, `Memory.md`, `Phases.md`, `PRD.md`, and now `Rules.md`), I have comprehensively analyzed the requirements for PodGo. 

We will build a monolithic Spring Boot backend (Java 21) and a React + Vite frontend, with a focus on true peer-to-peer ride-sharing and cost-splitting. **I will strictly adhere to the AI Coding Rules & Boundaries**, ensuring zero deviation from the specified tech stack and design patterns.

## User Review Required

Before we begin writing code and scaffolding the project, please review the final plan below. Once you click **Proceed**, I will immediately start executing **Phase 1**.

## Proposed Approach & Strict Guidelines

1.  **Workspace Location**: The project will be initialized in `C:\Users\iamso\.gemini\antigravity\scratch\podgo`. It will contain two folders:
    *   `podgo-backend` (Spring Boot 3.x, Java 21, Spring Security 6.x)
    *   `podgo-frontend` (React.js 18.x, Vite, Tailwind CSS)
2.  **Tracking Progress**: I will create and maintain `Memory.md` in the root of the project to track our progress exactly as requested. We will update this at the end of every session.
3.  **Strict Coding Rules (from Rules.md)**: 
    *   **Backend**: Use Constructor Injection ONLY. Use `records` for DTOs. All controllers must return `ResponseEntity<ApiResponse<T>>`. Use `GlobalExceptionHandler.java`. No exposing Entities in REST responses. No `System.out.println` (use `@Slf4j`).
    *   **Frontend**: Functional components & hooks ONLY. No Redux (use `Zustand`). No `fetch()` (use `Axios`). No Create React App (use `Vite`). State fetching via `React Query`. Three.js strictly isolated to `ThreeJSScene.jsx`.
    *   **Security & DB**: Soft deletes (`is_active`). No N+1 queries (`@EntityGraph`). JWT stored in cookies/memory. Passwords hashed with BCrypt.
4.  **Database Strategy**: We will use MySQL 8.x and configure Hibernate for `auto DDL create` in the dev environment. Redis will be used for OTP storage (TTL).

### Phase 1 Execution Plan (To Be Started Upon Approval)

Once approved, I will complete **Phase 1 — Project Setup & Authentication**:
*   Initialize Spring Boot (Java 21, Maven).
*   Add dependencies: Spring Security, JWT, JPA, MySQL, Redis, Mail, Cloudinary, Validation.
*   Set up `application.properties` and `application-dev.properties` using the exact environment variables listed in `Rules.md`.
*   Create all entity classes (User, DriverProfile, Ride, Booking, Rating, Message, OtpVerification, DriverLocation, Notification) with `id`, `created_at`, `updated_at`.
*   Implement JWT utility, Auth Filter (SecurityFilterChain), and `ApiResponse` wrapper.
*   Create `/api/v1/auth/register`, `/verify-otp`, `/login`, and `/refresh-token` endpoints.
*   Initialize the React project using Vite.
*   Configure Tailwind CSS with the provided Design System tokens (`Design.md`).
*   Set up Axios interceptors, Zustand store, and basic authentication pages (`LoginPage`, `RegisterPage`, `OtpVerifyPage`).

## Open Questions

> [!IMPORTANT]
> Please answer these questions or confirm before I start:
> 1. Do you have MySQL and Redis already running locally on your Windows machine (port 3306 for MySQL, 6379 for Redis)?
> 2. For the initial setup, I will use placeholder credentials for Gmail SMTP, Redis, and MySQL in `application-dev.properties`. You can fill them in later. Is that okay?
> 3. Can I initialize the Spring Boot and Vite projects in the `scratch/podgo` folder upon your approval?

## Verification Plan

*   **Backend**: I will verify that the Spring Boot application compiles and starts successfully, and that the database schema is generated in MySQL.
*   **Frontend**: I will verify that the Vite server starts and the basic routing works.
*   **API**: We will ensure the Authentication APIs compile without errors and follow the strict `ApiResponse` format.
