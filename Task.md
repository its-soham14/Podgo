# Phase 2: Homepage (3D) & Driver Setup

## Backend Tasks
- [x] Configure Cloudinary integration (`CloudinaryConfig.java`)
- [x] Implement `VerificationService.java` for Google Vision API logic
- [x] Create `UserController`: GET `/api/v1/users/me`
- [x] Create `UserController`: PUT `/api/v1/users/me`
- [x] Create `DriverController`: POST `/api/v1/drivers/upload-docs`
- [x] Create `DriverController`: POST `/api/v1/drivers/profile`
- [x] Create `DriverController`: GET `/api/v1/drivers/verification-status`
- [x] Update `application-dev.properties` with actual API keys

## Frontend Tasks
- [x] Create `ThreeJSScene.jsx` (3D animated homepage)
- [x] Create `HomePage.jsx` using `ThreeJSScene` + hero text
- [x] Create `DashboardPage.jsx` (post-login)
- [x] Create `ProfilePage.jsx`
- [x] Create `DriverSetupPage.jsx` (multi-step form with document upload)
- [x] Show verification status badge on driver dashboard
