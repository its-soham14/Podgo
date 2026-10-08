package com.podgo.modules.user.dto;

public record UserProfileResponse(
        Long id,
        String name,
        String email,
        String phone,
        String profilePhotoUrl,
        String role,
        boolean isEmailVerified
) {}
