package com.podgo.modules.admin.dto;

import java.math.BigDecimal;
import java.time.LocalDateTime;

public record AdminRideDto(
    Long id,
    Long driverId,
    String driverName,
    String origin,
    String destination,
    LocalDateTime departureTime,
    int totalSeats,
    int availableSeats,
    BigDecimal farePerSeat,
    String status,
    LocalDateTime createdAt
) {}
