package com.podgo.modules.admin.dto;

import java.time.LocalDateTime;

public record AdminUserDto(
    Long id,
    String name,
    String email,
    String phone,
    String role,
    boolean isEmailVerified,
    boolean isActive,
    LocalDateTime createdAt
) {}
