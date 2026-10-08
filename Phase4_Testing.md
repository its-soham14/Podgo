# Phase 4 Testing Guide

Yeh testing guide tumhe step-by-step batayegi ki Phase 4 ke naye features (WebSockets aur Haversine Search) ko kaise verify karna hai.

## Pre-requisites
1. Frontend mein nayi dependencies install hui hain, isliye ek baar frontend ko restart kar lena (`npm run dev`).
2. Backend mein WebSocket dependency aur naye tables add hue hain, toh backend ko bhi ek baar stop karke `mvn spring-boot:run` se start karna zaroori hai.

## Test 1: Haversine Proximity Search
Ab text match nahi hota, exact location match hoti hai 5km ke radius mein.

1. **Driver Mode**: 
   - Post a ride from "Kothrud, Pune" to "Hinjawadi, Pune". (LocationInput autocomplete use karke proper lat/lng set hone do).
2. **Rider Mode**:
   - Kisi aur account se login karo.
   - Search mein origin daalo "Bhusari Colony, Kothrud" (jo ki Kothrud ke 5km radius mein aata hai) aur destination "Wipro Circle, Hinjawadi".
   - **Result**: Ride list mein Driver ki ride show honi chahiye. (Kyunki coordinates 5km limit mein hain).
   - Ab search change karke origin mein "Mumbai" daalo.
   - **Result**: "No rides found" aana chahiye, kyunki distance 5km se bohot zyada hai.

## Test 2: Real-time Notifications (Magic Test)
Is test ke liye tumhein 2 alag browsers (e.g., Chrome aur Edge) ya 1 regular aur 1 incognito window open karni hogi.

1. **Window A (Driver Dashboard)**: 
   - Driver account se login karke Dashboard khol ke rakho. (Page refresh mat karna).
2. **Window B (Rider)**:
   - Rider account se login karo, ride search karo, aur "Request Seat" pe click karo.
3. **Magic**:
   - Jaise hi Rider request karega, **Window A (Driver)** par turant ek browser alert / notification aayega: "New Booking Request" bina page refresh kiye!

## Test 3: Real-time Chat
1. **Driver Dashboard** mein jakar Rider ki request ko "ACCEPT" (Check mark) karo.
2. Accept karte hi **Rider** ko notification aayega ki booking confirm ho gayi.
3. Dono taraf (Driver aur Rider dashboard mein) uss booking ke samne ek naya button aayega: **Chat**.
4. Dono screens pe Chat widget open karo.
5. Ek screen se message type karke send karo. Dusri screen par message instantly appear hoga, bilkul WhatsApp ki tarah! Aur close karke dubara open karoge toh purani history bhi load hogi.

**Done!** PodGo ab officially ek Real-time carpooling platform ban chuka hai. 🔥
