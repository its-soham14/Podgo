# Phase 1 & 2: Issues and Fixes

Phase 1 aur Phase 2 ki development aur testing ke dauran kuch critical security, architectural aur logical issues mile the. Niche un issues ka detailed breakdown hai ki kya problem thi aur unhe kaise fix kiya gaya.

---

## Issue 2: JWT Stored in localStorage (Security Risk)
- **Problem**: `authStore.js` mein JSON Web Token (JWT) seedha browser ke `localStorage` mein save ho raha tha. `localStorage` JavaScript se access ho sakta hai, jisse token Cross-Site Scripting (XSS) attacks ka shikar ho sakta hai. Agar page pe koi malicious script run ho, toh vo aasani se token chura ke user ko impersonate kar sakti hai.
- **Fix**: Token persistence ko `localStorage` se hata diya. Ab token strictly Zustand ki memory state (`token: null`) mein rehta hai. Page refresh karne pe user ko re-login karna padega, jo MVP ke liye ek safer default behavior hai. Non-sensitive `user` object (name, email) abhi bhi `localStorage` mein persist karta hai UI continuity ke liye.

## Issue 3: Business Logic in Controller (SRP Violation)
- **Problem**: `DriverController.java` mein heavy business logic tha (Cloudinary file uploads, database profile checks, Vision API calls, aur user role updates). Yeh Single Responsibility Principle (SRP) ko violate karta tha aur controller ko bloated, test karne mein hard aur maintain karne mein mushkil banata tha.
- **Fix**: Ek naya `DriverService.java` class banaya. Document upload karne aur profile verify/save karne ka saara business logic service layer mein move kar diya. `DriverController.java` ko refactor kiya taaki vo sirf incoming HTTP requests handle kare, Constructor Injection ke through service methods ko call kare, aur standard `ResponseEntity<ApiResponse<T>>` return kare.

## Issue 4: Manual Getters/Setters in Entities (Boilerplate)
- **Problem**: Entity classes jaise `User.java`, `DriverProfile.java`, etc., mein getters, setters aur constructors ki hundreds of lines manually likhi hui thi. Isse codebase clutter hota tha, readability kam hoti thi, aur naye fields add karte waqt human error ke chances badh jate the.
- **Fix**: `pom.xml` mein `Lombok` dependency add ki. Saare JPA entities se manually likhe hue getters, setters aur constructors hata diye aur unhe Lombok ke concise `@Data` aur `@NoArgsConstructor` annotations se replace kar diya.

## Issue 5: Weak OTP Generation
- **Problem**: `OtpService.java` mein 6-digit OTP generate karne ke liye `java.util.Random` use kiya tha. Standard `Random` deterministic aur predictable hota hai, jisse brute-force ya prediction attacks ka khatra hota hai.
- **Fix**: `java.util.Random` ko `java.security.SecureRandom` se replace kar diya, jo ek cryptographically strong random number generator provide karta hai, taaki OTPs predict na ho sakein.

## Issue 6: Weak Vision API Heuristics
- **Problem**: `VerificationService.java` mein ek condition thi `responseBody.length() > 500`. Iska matlab koi bhi aisi image jisme kaafi text ho (jaise kisi book ka random page), vo automatically ID verification pass kar leti, jisse AI security useless ho jati.
- **Fix**: Length condition ko puri tarah hata diya. Keyword list ko badhaya: `GOVERNMENT, INDIA, DOB, PAN, AADHAAR, VOTER, DRIVING, LICENSE, BIRTH, MALE, FEMALE, ADDRESS`. Ek counting mechanism implement kiya jisme document mein inme se **kam se kam 2** alag keywords match hona zaroori hai verification pass karne ke liye, jisse false positives kaafi kam ho gaye.
