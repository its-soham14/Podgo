package com.podgo.modules.ride.dto;

import java.time.LocalDate;
import java.math.BigDecimal;

public record RideSearchRequestDto(
    String origin,
    BigDecimal originLat,
    BigDecimal originLng,
    String destination,
    BigDecimal destLat,
    BigDecimal destLng,
    LocalDate date,
    Integer seatsRequired
) {}
