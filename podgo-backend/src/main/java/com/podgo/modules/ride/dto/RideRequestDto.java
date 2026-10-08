package com.podgo.modules.ride.dto;

import jakarta.validation.constraints.Future;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import java.math.BigDecimal;
import java.time.LocalDateTime;

public record RideRequestDto(
    @NotBlank(message = "Origin is required")
    String origin,
    
    @NotNull
    BigDecimal originLat,
    
    @NotNull
    BigDecimal originLng,
    
    @NotBlank(message = "Destination is required")
    String destination,
    
    @NotNull
    BigDecimal destinationLat,
    
    @NotNull
    BigDecimal destinationLng,
    
    @NotNull
    @Future(message = "Departure time must be in the future")
    LocalDateTime departureTime,
    
    @Min(value = 1, message = "At least 1 seat is required")
    int availableSeats,
    
    @NotNull
    @Min(value = 0, message = "Fare cannot be negative")
    BigDecimal farePerSeat,
    
    java.util.List<WaypointDto> waypoints
) {
    public record WaypointDto(BigDecimal lat, BigDecimal lng) {}
}
