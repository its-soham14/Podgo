# Phase 2: Summary & Detailed Testing Guide

Is document mein Phase 2 (Homepage 3D + Driver Setup) mein jo kuch bhi banaya gaya hai, uski saari details hain. Saath hi Cloudinary, Google Vision AI aur 3D features kaise kaam karte hain, uska deep technical breakdown aur unhe test karne ka tareeka bhi diya gaya hai.

---

## 1. Deep Technical Breakdown: Yeh sab kaise kaam karta hai

### A. Cloudinary Integration (Image & Document Storage)

**Kyu kiya**: Database mein badi images store karne se app slow ho jati hai. Isliye humne Cloudinary ko as an external CDN (Content Delivery Network) use kiya hai.

**Kaise code kiya**:
1. `CloudinaryConfig.java` banaya jo `.env` (properties) file se securely `CLOUD_NAME`, `API_KEY` aur `API_SECRET` inject karke ek Cloudinary object banata hai.
2. Backend mein hum `MultipartFile` ko accept karte hain, uska size aur type check karte hain (5MB se kam hona chahiye) aur usko directly Cloudinary ke servers pe upload karte hain.
3. Cloudinary ek optimized `secure_url` (HTTPS link) wapas bhejta hai, jisko hum apne database ke `DriverProfile` table mein save kar lete hain.

### B. Google Vision API (AI-Powered ID Verification)

**Kyu kiya**: Driver ke Govt ID (Aadhaar, PAN, DL) ko manual human intervention ke bina automatically verify karne ke liye.

**Kaise code kiya (`VerificationService.java`)**:
1. Google SDK ki jagah humne lightweight `RestTemplate` use karke seedha `POST` request bheja: `https://vision.googleapis.com/v1/images:annotate?key=API_KEY`.
2. Humne Cloudinary ka image URL bheja aur Google AI ko `TEXT_DETECTION` (OCR) karne ko bola.
3. Google AI text read karke JSON deta hai, jise backend parse karta hai aur specific keywords check karta hai (jaise `GOVERNMENT`, `INDIA`, `DOB`, `PAN`, `AADHAAR`). Agar document mein ye sab valid hain, toh verification pass ho jata hai.
4. Agar sab theek hai toh `VERIFIED` mark ho jata hai, nahi toh `REJECTED`.

### C. Three.js (Immersive 3D Homepage)

**Kyu kiya**: Ekdum premium, engaging aur futuristic landing page banane ke liye, bina heavy videos lagaye jisse website slow na ho.

**Kaise code kiya (`ThreeJSScene.jsx`)**:
1. Ek WebGL Renderer aur Scene setup kiya deep dark fog ke sath.
2. GridHelper se glowing neon roads banaye aur 500 points (particles) se space jaisa dynamic background banaya.
3. Floating 3D Octahedrons banaye jo pickup/drop locations lagte hain.
4. `requestAnimationFrame` use karke smooth 60fps cinematic animation di.

---

## 2. Testing Guide (Browser mein kaise test karein)

### Backend aur Frontend Start Karo
- Ensure MySQL & Redis chal rahe hain.
- Backend: `cd podgo-backend` -> `mvn spring-boot:run`
- Frontend: `cd podgo-frontend` -> `npm run dev`

### Frontend ka Walkthrough
1. **View 3D Scene**: `http://localhost:5173/` pe jao. Mast animated 3D homepage dikhega.
2. **Login**: "Find a Ride" pe click karke Phase 1 wale account se login karo.
3. **Driver Onboarding (Cloudinary & AI Test)**:
   - Dashboard pe jaake **"Offer a Ride"** (ya unlock mode toggle) pe click karo. 5-step form khulega.
   - **Step 1 & 2**: Basic details aur gaadi ki details dalo ("Honda City", "MH 12 AB 1234").
   - **Step 3**: Apne laptop se photos upload karo (Profile, Vehicle, RC, DL, ID Proof). *(Tip: Sahi AI pass karne ke liye Google se sample Aadhaar/PAN ki photo dal dena)*.
   - **Step 4 (Live Selfie)**: Webcam on hoga, wahan se real-time selfie capture karo.
   - **Step 5**: Review karke submit kardo.
4. **Result**:
   - Tu waapis dashboard par aayega, agar images sahi hain toh backend usko verify karke `VERIFIED` kar dega, aur tujhe Mode Toggle (Rider/Driver switch) dikhne lagega. 

Everything in Phase 2 is now complete and strictly aligned with your PRD!
