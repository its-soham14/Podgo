package com.podgo.modules.rating.dto;

import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

public record RatingRequestDto(
    @NotNull Long bookingId,
    @NotNull Long ratedUserId,
    @NotNull @Min(1) @Max(5) Integer rating,
    @Size(max = 500) String comment
) {}
