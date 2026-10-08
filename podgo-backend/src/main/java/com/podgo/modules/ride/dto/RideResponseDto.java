package com.podgo.modules.ride.dto;

import com.podgo.modules.ride.Ride.RideStatus;
import com.podgo.modules.ride.Ride.RideType;
import com.podgo.modules.driver.DriverProfile.VehicleType;
import java.math.BigDecimal;
import java.time.LocalDateTime;

public record RideResponseDto(
    Long id,
    Long driverId,
    String driverName,
    String driverPhotoUrl,
    String driverPhone,
    BigDecimal driverRating,
    String vehicleModel,
    String vehicleNumber,
    String origin,
    String destination,
    LocalDateTime departureTime,
    int availableSeats,
    int totalSeats,
    BigDecimal distanceKm,
    BigDecimal farePerSeat,
    RideType rideType,
    RideStatus status,
    VehicleType vehicleType
) {}
