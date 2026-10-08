# Phase 1: Summary & Detailed Testing Guide

Is document mein Phase 1 (Project Setup & Authentication) mein jo bhi complete hua hai, uski saari details hain. Sath hi Backend (Postman ke through) aur Frontend ko test karne ka step-by-step guide bhi diya gaya hai.

---

## 1. Phase 1 mein kya kya banaya gaya (Detailed Summary)

### Backend (Spring Boot 3.x, Java 21)
1. **Core Structure**: Maven project banaya jisme saari zaroori dependencies hain (`Spring Security`, `JWT`, `MySQL`, `Redis`, `Mail`, `Cloudinary`).
2. **Database Entities**: JPA entities design aur map kiye: `User`, `DriverProfile`, `Ride`, `Booking`, `Rating`, `Message`, `DriverLocation`, `Notification`, aur `OtpVerification`. Sab strict soft-delete (`is_active`) aur audit (`created_at`) rules follow karte hain.
3. **Security Configuration**: 
   - `SecurityConfig`: `/api/v1/auth/**` chhod ke baaki saare endpoints block kar diye.
   - `JwtUtil` & `JwtAuthFilter`: Stateless token-based authentication implement kiya.
4. **Authentication Module**:
   - `OtpService`: 6-digit OTPs generate karta hai, unhe DB mein cache karta hai, `JavaMailSender` ke through emails bhejta hai, aur Redis-based rate limiting enforce karta hai (max 3/hour/email).
   - `AuthService`: Registration, OTP Verification, aur Login logic handle karta hai. Passwords ko `BCrypt` use karke hash kiya gaya hai.
   - `AuthController`: Auth flows ke liye REST endpoints expose kiye gaye hain jo strictly typed `ResponseEntity<ApiResponse<T>>` return karte hain.
5. **Exception Handling**: `GlobalExceptionHandler` banaya jo bad requests, validation errors, aur unauthorized access ko catch karta hai, jisse responses clean rehte hain.

### Frontend (React 18.x, Vite)
1. **Setup**: Vite, React Router, aur Tailwind CSS configure kiya.
2. **Design System**: `tailwind.config.js` aur `index.css` ko `Design.md` ke hisaab se set kiya, jisme Dark/Light mode tokens aur fonts (`Syne`, `Inter`) shamil hain.
3. **State & API**: Ek `Axios` instance banaya jisme interceptors lagaye hain JWT inject karne aur 401 logouts handle karne ke liye. User state ko persist karne ke liye ek `Zustand` store (`authStore.js`) banaya.
4. **UI Pages**: Tailwind use karke `RegisterPage`, `LoginPage`, aur `OtpVerifyPage` banaye. `/dashboard` ka access restrict karne ke liye `ProtectedRoute` component add kiya.

---

## 2. Testing Start Karne Se Pehle (Prerequisites)

1. **MySQL Database**: Ensure karo ki MySQL port `3306` pe run ho raha hai.
   - Credentials: Username = `root`, Password = `Soham@1234`.
2. **Redis**: Ensure karo ki Redis port `6379` pe run ho raha hai.
   - Agar Docker hai, toh run karo: `docker run -d -p 6379:6379 redis`
3. **Gmail SMTP**:
   - `application-dev.properties` open karo.
   - `GMAIL_USERNAME` aur `GMAIL_APP_PASSWORD` mein apna real Gmail aur Google App Password daalo. Iske bina OTP emails fail ho jayenge.

---

## 3. Application Kaise Start Karein

### Start Backend
1. Terminal open karo aur backend folder mein jao: `cd E:\PodGo\podgo-backend`
2. Maven se application run karo: `mvn spring-boot:run`
3. Console mein `Started PodGoApplication` aane ka wait karo.

### Start Frontend
1. Ek naya terminal open karo aur frontend folder mein jao: `cd E:\PodGo\podgo-frontend`
2. Vite development server start karo: `npm run dev`
3. App `http://localhost:5173` pe available hogi.

---

## 4. Frontend Testing Guide (Browser mein)

1. **Browser Open karo**: `http://localhost:5173` pe jao.
2. **Registration Flow**:
   - Tum `/login` page pe redirect ho jaoge. **"Create an account"** pe click karo.
   - Apna Name, Email, aur Password daalo. **Create Account** pe click karo.
   - Tum `/verify-otp` page pe redirect ho jaoge.
3. **Verification Flow**:
   - Apne email inbox mein OTP check karo.
   - 6 digits daalo aur **Verify Email** pe click karo.
   - Success pe, global Zustand state tumhara token save kar lega aur tumhe `/dashboard` pe redirect kar dega.
4. **Dashboard**:
   - Tumhe "Welcome to Dashboard" dikhna chahiye. Iska matlab `ProtectedRoute` kaam kar raha hai aur tum authenticated ho.

---

## 5. Troubleshooting (Redis Deep Dive)

Testing ke dauran kuch issues aaye the jo solve ho gaye:

- **Redis Kyu Use Kiya?**: `OtpService` mein rate limiting ke liye. Koi spam na kare OTP api ko (max 3 per hour). 
- **500 Error Fix**: Pehle Redis connect nahi ho raha tha, fir Docker start karne se `localhost:6379` map ho gaya aur chalne laga.
- **400 Error Fix**: MailSender error tab deta tha jab 'From' address missing tha, `application-dev.properties` se Gmail auth dalne se yeh theek ho gaya.
