package com.podgo.modules.admin.dto;

import java.time.LocalDateTime;

public record AdminDriverProfileDto(
    Long id,
    Long userId,
    String userName,
    String userEmail,
    String userPhone,
    String vehicleType,
    String vehicleNumber,
    String vehicleModel,
    String vehiclePhotoUrl,
    String idProofUrl,
    String rcFrontUrl,
    String rcBackUrl,
    String drivingLicenceUrl,
    String selfieUrl,
    String verificationStatus,
    Integer verificationScore,
    LocalDateTime createdAt
) {}
