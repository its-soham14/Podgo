package com.podgo.modules.driver.dto;

import com.podgo.modules.driver.DriverProfile.VehicleType;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

public record DriverProfileRequest(
        @NotNull(message = "Vehicle type is required")
        VehicleType vehicleType,

        @NotBlank(message = "Vehicle number is required")
        @Size(max = 20, message = "Vehicle number cannot exceed 20 characters")
        String vehicleNumber,

        @NotBlank(message = "Vehicle model is required")
        @Size(max = 100, message = "Vehicle model cannot exceed 100 characters")
        String vehicleModel,

        @NotBlank(message = "Vehicle photo URL is required")
        String vehiclePhotoUrl,

        @NotBlank(message = "ID proof URL is required")
        String idProofUrl,

        @NotBlank(message = "RC Front URL is required")
        String rcFrontUrl,

        @NotBlank(message = "RC Back URL is required")
        String rcBackUrl,

        @NotBlank(message = "Driving Licence URL is required")
        String drivingLicenceUrl,

        @NotBlank(message = "Selfie URL is required")
        String selfieUrl
) {}
