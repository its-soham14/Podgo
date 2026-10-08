package com.podgo.modules.booking.dto;

import com.podgo.modules.booking.Booking.BookingStatus;
import com.podgo.modules.booking.Booking.PaymentMethod;
import com.podgo.modules.booking.Booking.PaymentStatus;
import com.podgo.modules.ride.dto.RideResponseDto;
import java.math.BigDecimal;
import java.time.LocalDateTime;

public record BookingResponseDto(
    Long id,
    RideResponseDto ride,
    Long riderId,
    String riderName,
    String riderPhotoUrl,
    String riderPhone,
    BookingStatus status,
    PaymentMethod paymentMethod,
    PaymentStatus paymentStatus,
    BigDecimal fareAmount,
    String pickupPoint,
    LocalDateTime createdAt,
    boolean hasRated
) {}
