package com.podgo.modules.booking.dto;

import com.podgo.modules.booking.Booking.PaymentMethod;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import java.math.BigDecimal;

public record BookingRequestDto(
    @NotNull Long rideId,
    @NotBlank String pickupPoint,
    @NotNull BigDecimal pickupLat,
    @NotNull BigDecimal pickupLng,
    @NotNull PaymentMethod paymentMethod
) {}
