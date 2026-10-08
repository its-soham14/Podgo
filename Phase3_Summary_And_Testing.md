# Phase 3: Summary & Detailed Testing Guide

Is document mein Phase 3 (Pre-Planned Rides & Booking Engine) ki saari details aur testing instructions hain, jisme Frontend aur Postman dono ke tareeqe shamil hain.

---

## 1. Deep Technical Breakdown: Phase 3 Kaise Kaam Karta Hai

### A. Google Maps Integration (Autocomplete)
**Kyu kiya:** Addresses khud type karne se spelling errors hote hain, jisse location match hona mushkil ho jata hai.
**Kaise kiya:**
- Humne `.env` file mein Google Maps Places API key configure ki.
- `index.html` mein API script dynamically load karwayi.
- Ek naya React component `LocationInput.jsx` banaya jo `window.google.maps.places.Autocomplete` use karta hai. Jab user koi jagah type karta hai toh ye real-time mein suggestions deta hai aur us exact jagah ke `latitude` aur `longitude` coordinates nikal leta hai.

### B. Haversine Formula (Fare Calculation)
**Kyu kiya:** Jab driver origin aur destination dale, toh use apne aap ek "Recommended Fare" (sahi price) milna chahiye taaki vo overcharge na kare.
**Kaise kiya:**
- Backend ke `RideService.java` mein ek `calculateDistance` method banaya jo **Haversine formula** ka use karke do Lat/Lng points ke beech ka straight-line distance nikalta hai (Earth ke curve ko dhyan mein rakhte hue).
- Uss distance (KMs mein) ko hum ₹4 ke base rate se multiply karte hain ek recommended fair price nikalne ke liye.

### C. Ride & Booking Logic
**Kyu kiya:** Carpooling ka core engine yahi hai, jahan ek user gaadi chalata hai aur dusra seat book karta hai.
**Kaise kiya:**
- **Ride Posting:** Driver frontend pe dates, time, seats aur fare dalta hai. Backend pe check hota hai ki kya vo verified driver hai, uske baad uski Ride `SCHEDULED` status ke sath MySQL mein save ho jati hai.
- **Search System:** Jab Rider search karta hai, backend ek JPA Query run karta hai jo locations ko text se match karti hai, seats check karti hai, aur date/time filter karti hai.
- **Booking Flow:** Rider jab "Request Seat" click karta hai, ek `PENDING` booking banti hai. Driver ke dashboard par ye request aati hai. Jaise hi driver `ACCEPT` karta hai, backend booking ko `CONFIRMED` mark karta hai aur uss Ride mein se 1 seat kam kar deta hai. Agar seats khatam ho jayein toh koi aur book nahi kar payega.

---

## 2. Frontend Testing Guide (Browser se)

App test karne ke liye hume do accounts lagenge (ek Driver ke liye, ek Rider ke liye).

### Step 1: Apps Start Karo
- Ensure MySQL & Redis chal rahe hain.
- Backend: `cd podgo-backend` -> `mvn spring-boot:run`
- Frontend: `cd podgo-frontend` -> `npm run dev`

### Step 2: Driver Account (Ride Offer Karo)
1. Browser mein `http://localhost:5173` kholo.
2. Apne verified driver account se login karo (jiski Phase 2 mein verification pass ho chuki hai).
3. Dashboard par **Driver Mode** on rakho aur **"Post a Ride"** pe click karo.
4. Google Maps se "Leaving from" aur "Going to" locations select karo.
5. Date kal ki dalo aur koi time select karo.
6. Available Seats mein '3' dalo.
7. Note karo ki "Fare per seat" automatically Google Maps ke coordinates se distance calculate hoke fill ho gaya hai! (Haversine magic ✨).
8. **Publish Ride** pe click karo. 
9. Waapis Dashboard pe aake dekho, "Active Rides" mein tumhari ride dikh rahi hogi.

### Step 3: Rider Account (Seat Book Karo)
1. Ek doosre browser (ya incognito window) mein `http://localhost:5173` kholo.
2. Ek naye account se register karke login karo (OTP wagerah verify karke).
3. Dashboard par **"Find a Ride"** pe click karo.
4. Wahi origin, destination, aur kal ki date dalo jo driver ne dali thi.
5. **Search Rides** pe click karo.
6. Ek sundar search result page aayega jisme driver ki detail aur fare dikhega. Us ride pe click karo.
7. **"Request Seat"** modal khulega, `CASH` ya `UPI` select karke **Confirm** dabao.
8. Dashboard pe wapas aake "Upcoming Trips" mein dekho, tumhari ride wahan **PENDING** status ke sath dikhegi.

### Step 4: Driver Booking Accept Karega
1. Wapas Driver wale browser mein jao.
2. Dashboard par apni active ride ke niche "View Booking Requests" pe click karo.
3. Wahan pe naye rider ka naam aur `PENDING` request aayi hogi.
4. Uske aage bane Green Check (✔️) pe click karke request accept karo.
5. Seat count apne aap 1 kam ho jayega!

### Step 5: Final Result Check
1. Wapas Rider wale browser mein jao aur page refresh karo.
2. Dashboard par tumhara PENDING status ab **CONFIRMED** ho chuka hoga!

---

## 3. Backend Testing Guide (Postman Se Kaise Test Karein)

Agar tumhe sirf APIs test karni hain bina frontend ke, toh Postman open karo aur ye steps follow karo. Set Base URL: `http://localhost:8080`.

**Requirement:** Pehle 2 alag accounts login karke unke **JWT Tokens** copy kar lo (Ek Verified Driver ka token, aur ek doosre user ka Rider token).

### Step 1: Driver Ride Create Karega
- **Method:** `POST`
- **URL:** `http://localhost:8080/api/v1/rides`
- **Headers:** `Authorization: Bearer <DRIVER_TOKEN>`
- **Body (raw JSON):**
  ```json
  {
      "origin": "Pune Station",
      "originLat": 18.5284,
      "originLng": 73.8739,
      "destination": "Hinjewadi IT Park",
      "destinationLat": 18.5913,
      "destinationLng": 73.7389,
      "departureTime": "2026-10-15T09:00:00",
      "availableSeats": 3,
      "farePerSeat": 80.00
  }
  ```
- **Result:** Status `201 Created`. Response mein Ride ki ID aayegi (maan lo `rideId` = 1 hai). Is ID ko note kar lo.

### Step 2: Rider Ride Search Karega
- **Method:** `POST`
- **URL:** `http://localhost:8080/api/v1/rides/search`
- **Headers:** `Authorization: Bearer <RIDER_TOKEN>`
- **Body (raw JSON):**
  ```json
  {
      "origin": "Pune",
      "destination": "Hinjewadi",
      "date": "2026-10-15T00:00:00",
      "seatsRequired": 1
  }
  ```
- **Result:** Status `200 OK`. Response mein jo ride create ki thi wo dikhegi.

### Step 3: Rider Seat Book (Request) Karega
- **Method:** `POST`
- **URL:** `http://localhost:8080/api/v1/bookings`
- **Headers:** `Authorization: Bearer <RIDER_TOKEN>`
- **Body (raw JSON):**
  ```json
  {
      "rideId": 1,
      "pickupPoint": "Pune Station Gate 1",
      "pickupLat": 18.5284,
      "pickupLng": 73.8739,
      "paymentMethod": "UPI"
  }
  ```
- **Result:** Status `201 Created`. Response mein ek Booking banegi jiska status `PENDING` hoga. Iski ID note kar lo (maan lo `bookingId` = 1 hai).

### Step 4: Driver Apni Ride Ki Bookings Check Karega
- **Method:** `GET`
- **URL:** `http://localhost:8080/api/v1/bookings/ride/1` *(Yahan '1' Ride ID hai)*
- **Headers:** `Authorization: Bearer <DRIVER_TOKEN>`
- **Result:** Status `200 OK`. Response mein Rider ki `PENDING` request dikhegi.

### Step 5: Driver Booking Accept Karega
- **Method:** `PUT`
- **URL:** `http://localhost:8080/api/v1/bookings/1/status?action=ACCEPT` *(Yahan '1' Booking ID hai)*
- **Headers:** `Authorization: Bearer <DRIVER_TOKEN>`
- **Result:** Status `200 OK`. Booking ka status `CONFIRMED` ho jayega aur Ride entity mein `availableSeats` 1 se kam (yani 2) ho jayega!

Sab kuch ekdum perfect chal raha hai, API backend successfully tested!

---

## 4. Hotfixes & Minor Issues Resolved (Before Phase 4)

Phase 4 mein enter karne se pehle humne kuch critical issues aur minor bugs fix kiye:

1. **Duplicate Booking Prevented (Critical Bug 1):** 
   Pehle ek rider same ride pe baar-baar "Request Seat" kar sakta tha. Ise fix karne ke liye `BookingRepository` mein `existsByRideAndRiderAndStatusIn` method banaya aur `BookingService` mein validation add ki. Ab agar `PENDING` ya `CONFIRMED` booking pehle se hai, toh API turant `BadRequestException` fekegi.

2. **Real Coordinates for Pickup (Bug 2):** 
   `SearchResultsPage.jsx` mein pehle pickupLat aur pickupLng hardcoded `0` the. Ab humne wahan `LocationInput` component add kar diya hai jisse rider map se apna exact pickup point search karke select karega, aur real coordinates DB mein save honge.

3. **Proximity Search Note (Bug 3):** 
   Abhi humara search basic text matching (`LIKE %origin%`) use kar raha hai jo weak hai. Is issue ko humne `Memory.md` mein log kar liya hai. Phase 4 mein ise Haversine/PostGIS coordinates-based search se replace kiya jayega.

4. **Security & Credentials (Minor 1):** 
   Saare real passwords, API keys (Google Vision, Cloudinary, Maps, DB, Email) ko `application-dev.properties` aur `.env` se hata kar `placeholder` se replace kar diya gaya hai taaki GitHub pe leaks na hon. Local testing ke liye inhe setup karna zaroori hoga.

5. **Proper Error Handling (Minor 2):** 
   `DriverDashboard.jsx` mein errors silently `console.error` ho rahe the. Unhe hata kar UI-facing error states (red banners/alerts) mein convert kar diya hai as per `Rules.md`.

6. **Go Live Banner Status (Minor 3):** 
   Driver dashboard ke `Go Live` toggle ke neeche ek naya badge lagaya hai: *"Instant matching coming in Phase 4"*, taaki drivers confuse na hon ki koi request kyu nahi aa rahi.

