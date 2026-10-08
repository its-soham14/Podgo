package com.podgo.modules.auth.dto;

public record AuthResponse(
        String token,
        Long id,
        String email,
        String name,
        String role
) {}
