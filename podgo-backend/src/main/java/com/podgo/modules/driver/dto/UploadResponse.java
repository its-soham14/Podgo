package com.podgo.modules.driver.dto;

public record UploadResponse(
        String profilePhotoUrl,
        String vehiclePhotoUrl,
        String idProofUrl,
        String rcFrontUrl,
        String rcBackUrl,
        String drivingLicenceUrl,
        String selfieUrl
) {}
