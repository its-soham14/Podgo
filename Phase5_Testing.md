# Phase 5 Testing Guide 🧪

Yeh document ensure karega ki tum naye Map UI aur complex Sub-Route matching (Kothrud -> Wagholi) wali functionality ko step-by-step kaise verify kar sakte ho.

## ⚠️ Pre-Requisites (Must Read)
1. **Frontend dependencies:** Maine naye packages (`leaflet`, `react-leaflet`, `leaflet-routing-machine`) install kiye hain. Agar local server chal raha tha toh usko band karke dobara `npm run dev` chalana hoga.
2. **Backend Database:** Backend mein ek naya table `ride_waypoints` add hua hai. Apna Spring Boot server IDE se band karke wapas start karo taaki Hibernate naya table automatically create kar le.

---

## Test 1: Driver "Post a Ride" & Route Drawing
1. **Driver account** se login karo aur **Offer a Ride** page par jao.
2. Form mein **Leaving from** par click karo.
   - GPS permission allow karo.
   - Dekho ki dropdown mein sabse upar **"Fetching..."** aata hai aur thodi der mein tumhara actual address dikhna chahiye. Uspe click karke select karo.
3. Ab **Going to** mein type karo "Wagholi, Pune".
4. **Magic Moment:** Jaise hi dono points set honge, Map par automatically ek route line draw hogi (From A to B). 
5. Form ko poora fill karo (Date, Time, Seats, Fare) aur **Publish Ride** par click karo.
6. Backend terminal/database mein verify karo ki `rides` ke saath `ride_waypoints` table mein bhi 5-10 row entry aayi hain (jo route ka path define karti hain).

---

## Test 2: Sub-Route Matching (The Real Test 🔥)
Hum verify karenge ki kya route ke **beech mein (on the way)** aane wale riders ko driver dikhta hai ya nahi.

1. **New Browser / Incognito window** open karo.
2. Ek **Rider account** se login karo aur **Find a Ride** page par aao.
3. **Scenario A (Perfect Match on Route):**
   - **Leaving from:** "Shivajinagar, Pune" (Yeh jagah Kothrud aur Wagholi ke route ke beech aati hai).
   - **Going to:** "Chandan Nagar, Pune" (Yeh Wagholi se pehle aur Shivajinagar ke baad aata hai).
   - Search par click karo. 
   - **Result:** Tumhe Test 1 wala Driver search results mein milna chahiye!
4. **Scenario B (Out of Route):**
   - Ab search ko change karke aisi jagah daalo jo us route par na padti ho (e.g., Leaving from "Swargate", Going to "Hadapsar").
   - Search par click karo.
   - **Result:** "No rides found" aana chahiye, kyunki Driver idhar se nahi ja raha hai.

---

## Test 3: Interactive Pin Dragging
1. Find a Ride (Rider side) par wapas jao.
2. **Leaving from** input box par click karo.
3. Dropdown se **"Set location on map"** select karo.
4. Tumhe left side map par pin dikhega. Usko mouse/finger se thoda drag karke kisi aur chowk/building par le jao aur chhod do.
5. **Result:** Input box ke andar ka text "Selected on map" se automatically change hokar us nayi jagah ke address mein update ho jana chahiye (via Reverse Geocoding).

---

## Test 4: Driver Dashboard Contact Actions
1. Rider se kisi existing ride par "Request Seat" karo.
2. Driver dashboard par wapas jao, wahan nayi request notification dikhegi.
3. Request ko **Accept (✓)** karo.
4. **Result:** Request 'CONFIRMED' hote hi wahan do buttons aayenge:
   - **Phone Icon (Green):** Ispe click karne se agar phone par ho toh seedha dialer app khul jana chahiye.
   - **Message Icon (Blue):** Ispe click karne se Chat Widget screen pe pop-up hona chahiye.

Done! Agar yeh sab theek se chala, toh hamara Phase 5 ekdum successful hai! 💯
