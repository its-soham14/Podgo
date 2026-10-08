package com.podgo.modules.driver;

import com.podgo.modules.driver.dto.DriverProfileRequest;
import com.podgo.modules.driver.dto.DriverVerificationStatusResponse;
import com.podgo.modules.driver.dto.UploadResponse;
import com.podgo.utils.ApiResponse;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

@RestController
@RequestMapping("/api/v1/drivers")
public class DriverController {

    private final DriverService driverService;

    public DriverController(DriverService driverService) {
        this.driverService = driverService;
    }

    @PostMapping(value = "/upload-docs", consumes = "multipart/form-data")
    public ResponseEntity<ApiResponse<UploadResponse>> uploadDocs(
            @RequestParam(value = "profile_photo", required = true) MultipartFile profilePhoto,
            @RequestParam(value = "vehicle_photo", required = true) MultipartFile vehiclePhoto,
            @RequestParam(value = "id_proof", required = true) MultipartFile idProof,
            @RequestParam(value = "rc_front", required = true) MultipartFile rcFront,
            @RequestParam(value = "rc_back", required = true) MultipartFile rcBack,
            @RequestParam(value = "driving_licence", required = true) MultipartFile drivingLicence,
            @RequestParam(value = "selfie", required = true) MultipartFile selfie,
            Authentication authentication) {

        UploadResponse response = driverService.uploadDocs(profilePhoto, vehiclePhoto, idProof, rcFront, rcBack, drivingLicence, selfie, authentication.getName());
        return ResponseEntity.ok(ApiResponse.success("Files uploaded successfully", response));
    }

    @PostMapping("/profile")
    public ResponseEntity<ApiResponse<Void>> createOrUpdateDriverProfile(
            @Valid @RequestBody DriverProfileRequest request,
            Authentication authentication) {
        
        driverService.createOrUpdateDriverProfile(request, authentication.getName());
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success("Driver profile saved successfully", null));
    }

    @GetMapping("/verification-status")
    public ResponseEntity<ApiResponse<DriverVerificationStatusResponse>> getVerificationStatus(
            Authentication authentication) {
            
        DriverVerificationStatusResponse response = driverService.getVerificationStatus(authentication.getName());
        return ResponseEntity.ok(ApiResponse.success("Verification status fetched", response));
    }
}
