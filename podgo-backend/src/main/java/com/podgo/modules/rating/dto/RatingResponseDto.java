package com.podgo.modules.rating.dto;

import java.time.LocalDateTime;

public record RatingResponseDto(
    Long id,
    Long bookingId,
    Long ratedById,
    String ratedByName,
    String ratedByPhotoUrl,
    Long ratedUserId,
    String ratedUserName,
    Integer rating,
    String comment,
    LocalDateTime createdAt
) {}
