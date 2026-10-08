# Dev Mode Testing Guide

Bhai, humne `verification.dev-mode` flag implement kar diya hai taaki development ke time pe Google Vision API baar baar call na ho aur paise/credits waste na ho. App ka behavior dev vs prod environments ke beech dynamically switch karega.

## Yeh Kaise Kaam Karta Hai?

1. **application-dev.properties** mein `verification.dev-mode=true` set kiya hua hai. Iska matlab jab hum local pe app run karenge (kyunki `application.properties` mein default profile `dev` hai), toh Google Vision API automatically bypass ho jayegi.
2. **VerificationService.java** aur **DriverService.java** mein `@Value` ke through `devMode` flag inject kiya hai. Agar flag `true` hai, toh ye services actual HTTP calls karne ki bajaye dummy/mock data return kar deti hain aur RC registration mismatch errors ko ignore kar deti hain. Jisse har document upload turant bina fail hue `VERIFIED` ho jata hai.
3. **Production Safety**: `application.properties` (jo base hai) aur naye `application-prod.properties` dono mein yeh flag `false` hai. Iska matlab live server pe bina asli check ke koi pass nahi hoga, yeh safe defaults follow karta hai.

## Kaise Test Karein (Step by Step)?

### Step 1: Backend Restart Karo
Kyunki properties files change hui hain, backend server ko stop karke wapas start karo (`mvn spring-boot:run`).

### Step 2: Frontend pe jao
1. `http://localhost:5173` kholo aur login karo.
2. "Offer a Ride" pe click karo (Driver Setup khulega).
3. Basic details mein RC number `MH12AB1234` daalo (ya kuch bhi random daalo, ab fark nahi padta kyunki match skip ho jayega).
4. Documents waale step mein, asli IDs upload karne ki zaroorat nahi hai. Tum internet se download ki hui **koi bhi simple photo (jaise kitten.jpg ya sunset.png)** upload kar sakte ho saare 7 fields mein!
5. Selfie waale step mein bhi kuch bhi random capture karo.
6. Submit pe click karo.

### Step 3: Magic Dekho (Logs & Result)
- Backend console (terminal) check karo. Tumhe wahan aise logs dikhenge:
  ```
  INFO  - DEV MODE: Skipping Google Vision API call for URL: ...
  INFO  - DEV MODE: Government ID verification auto-passed
  INFO  - DEV MODE: Driving licence verification auto-passed
  INFO  - DEV MODE: Returning mock registration number
  INFO  - DEV MODE: RC registration number match check skipped
  ```
- Google API ka ek bhi call nahi hoga, par tumhari frontend turant **"Verified Driver"** state mein badal jayegi.
- Yeh isliye hua kyunki backend ne sab kuch mock karke bypass kar diya.

### Step 4: Prod Mode Test (Optional)
Agar tumhe real testing karni hai (ki kya prod pe ye band ho jata hai?):
1. Backend band karo.
2. `application.properties` mein `spring.profiles.active=prod` kardo aur server start karo.
3. Ab agar tum wapas se cat images upload karoge, toh backend profile reject kar dega kyunki ab flag `false` ho jayega aur asal mein Google Vision AI text dhoondhne ki koshish karega jo use nahi milega!
