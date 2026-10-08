package com.podgo.modules.admin.dto;

public record AdminStatsDto(
    Long totalUsers,
    Long pendingDrivers,
    Long totalRides
) {}
