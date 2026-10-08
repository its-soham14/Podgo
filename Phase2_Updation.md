# Phase 2 Updation Details

Is document mein Phase 2 Driver Verification aur Dashboard UI mein jo naye requirements ke hisaab se major updates kiye gaye hain, uski details hain.

## 1. Backend Updates: AI Verification Pipeline

**Kyu kiya (Why):** Pehle verification bohot simple tha, sirf ek document upload hota tha aur basic `matchCount >= 2` logic lagta tha. Lekin real-world carpooling app ke liye yeh kaafi nahi hai, fraud prevent karne ke liye RC, DL, aur Govt ID sab ache se check hona zaroori hai.

**Kya change kiya (What was changed):**
- **`VerificationService.java`**: 
  - `verifyIdProof` ko refactor karke ek naya reusable `verifyDocumentFromUrl` banaya jo OCR se raw text nikalta hai.
  - `verifyGovernmentId` mein ek mast 3-point scoring system dala jismein specific keywords (jaise `INDIA`, `DATE OF BIRTH`) aur document name (`AADHAAR`, `PAN`) hona zaroori hai.
  - DL ke keywords check karne ke liye `verifyDrivingLicence` add kiya.
  - RC se vehicle number nikalne ke liye `extractRegistrationNumber` banaya jo standard Indian number plate RegEx (jaise `MH12AB1234`) use karta hai.
- **`DriverProfile.java`**: Verification states track karne ke liye bohot saare naye fields add kiye (`rc_front_url`, `rc_extracted_reg_number`, `selfie_url`, `dl_verification_passed`, etc.).
- **`DriverService.java`**: Profile creation logic update kiya taaki teeno verifications ek saath independent run ho sakein. Yeh user ke manually dale gaye Registration Number ko RC image se nikle hue number se compare karta hai. Agar kuch match nahi hua toh directly `REJECTED` state set ho jati hai error note ke saath.
- **`DriverController.java`**: `POST /api/v1/drivers/upload-docs` endpoint ko bada banaya taaki vo ek saath 7 `MultipartFile` parameters accept kar sake.

## 2. Frontend Updates: Multi-Step Form & Dashboards

**Kyu kiya (Why):** Ek hi form mein 7 documents aur vehicle details upload karna user experience kharab karta hai. Iske alawa, verified users ko riding aur driving modes ke beech clear separation chahiye tha.

**Kya change kiya (What was changed):**
- **`DriverSetupPage.jsx`**: Isko poora tod ke ek state-driven 5-step wizard mein convert kar diya.
  - **Step 1 & 2**: Basic Details & Vehicle details glassmorphism UI ke saath.
  - **Step 3**: Document Upload jisme thumbnail previews aur drag-and-drop features hain.
  - **Step 4 (Live Selfie)**: Ek custom component `StepLiveSelfie.jsx` banaya jo directly `navigator.mediaDevices.getUserMedia` se browser ka camera access karta hai. Yeh circular KYC-style frame mein live feed dikhata hai aur photo click karke `File` object bana leta hai.
  - **Step 5**: Review step aur final Terms agreement checkbox.
- **`authStore.js` (Zustand)**: `activeMode` state (`RIDER` ya `DRIVER`) introduce kiya jo `localStorage` mein persist karta hai.
- **`DashboardPage.jsx`**: Isko ab ek router ki tarah kaam karne ke liye refactor kiya.
  - Agar user `VERIFIED` nahi hai, toh unhe sirf `RiderDashboard` dikhta hai aur ek banner unhe verification karne bolta hai.
  - Agar `VERIFIED` hai, toh ek premium `ModeToggle.jsx` component dikhta hai (animated sliding switch).
  - Dashboard logic ko do hisso mein tod diya: `RiderDashboard.jsx` (Search, upcoming trips) aur `DriverDashboard.jsx` (Go Live, Earnings, Active Rides).

---

## 3. Backend Testing Guide (Postman Se Kaise Test Karein)

Agar tumhe sirf APIs test karni hain (bina frontend ke), toh Postman open karo aur ye steps follow karo. Set Base URL: `http://localhost:8080`.

**Requirement:** Tumhare paas ek logged-in user ka **JWT Token** hona chahiye jisse tum `Authorization: Bearer <TOKEN>` header mein use kar sako.

### Step 1: Upload 7 Documents (Cloudinary Upload)
- **Method:** `POST`
- **URL:** `http://localhost:8080/api/v1/drivers/upload-docs`
- **Headers:** `Authorization: Bearer <TERA_JWT_TOKEN>`
- **Body:** `form-data` select karo.
- **Keys (sabki type Text se hatake `File` kardo):**
  - `profile_photo` -> (koi bhi profile image upload kar)
  - `vehicle_photo` -> (gaadi ki image)
  - `id_proof` -> (Aadhaar ya PAN image)
  - `rc_front` -> (RC aage ki image)
  - `rc_back` -> (RC peeche ki image)
  - `driving_licence` -> (DL image)
  - `selfie` -> (Live selfie image)
- **Result:** Status `200 OK`. Result mein tujhe 7 Cloudinary URLs milenge (jaise `profilePhotoUrl`, `idProofUrl`, etc.). In URLs ko agle step ke liye copy kar le.

### Step 2: Setup Driver Profile (AI Verification Run Hoga)
- **Method:** `POST`
- **URL:** `http://localhost:8080/api/v1/drivers/profile`
- **Headers:** `Authorization: Bearer <TERA_JWT_TOKEN>`
- **Body (raw JSON):**
  ```json
  {
      "vehicleType": "CAR",
      "vehicleNumber": "MH12AB1234",
      "vehicleModel": "Honda City 2020",
      "vehiclePhotoUrl": "https://res.cloudinary.com/.../vehicle.jpg",
      "idProofUrl": "https://res.cloudinary.com/.../aadhaar.jpg",
      "rcFrontUrl": "https://res.cloudinary.com/.../rc_front.jpg",
      "rcBackUrl": "https://res.cloudinary.com/.../rc_back.jpg",
      "drivingLicenceUrl": "https://res.cloudinary.com/.../dl.jpg",
      "selfieUrl": "https://res.cloudinary.com/.../selfie.jpg"
  }
  ```
- **Note:** Real photos honi chahiye warna Google Vision API keywords dhoondh nahi payegi aur profile reject kar degi. Aur dhyan rakhna `vehicleNumber` wahi dalna jo RC ki photo mein print ho, varna mismatch ki wajah se reject ho jayega.
- **Result:** Status `200 OK`. API chalti hai, photos check hoti hain, aur agar sab theek raha toh response mein `verificationStatus: "VERIFIED"` aayega. Agar fail hua toh `"REJECTED"` aayega aur `"verificationNote"` mein reason likha hoga (e.g., "RC Registration Number does not match").

### Step 3: Check My Profile Status
- **Method:** `GET`
- **URL:** `http://localhost:8080/api/v1/users/me`
- **Headers:** `Authorization: Bearer <TERA_JWT_TOKEN>`
- **Result:** Status `200 OK`. Ye dikhayega ki tera role kya hai, aur `driverProfile` object ke andar tera current `verificationStatus` kaisa hai.

---

## Summary
Ab hamara codebase ekdum production-ready KYC pipeline aur dual-mode dashboard architecture support karta hai, jisse Phase 2 ke saare advanced UI/UX requirements poore ho gaye hain. Ab hum Phase 3 (Ride creation aur booking) ke liye ready hain.
