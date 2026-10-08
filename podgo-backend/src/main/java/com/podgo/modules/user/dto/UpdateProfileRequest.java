package com.podgo.modules.user.dto;

import jakarta.validation.constraints.Size;

public record UpdateProfileRequest(
        @Size(max = 100, message = "Name cannot exceed 100 characters")
        String name,
        
        @Size(max = 15, message = "Phone cannot exceed 15 characters")
        String phone,
        
        String profilePhotoUrl
) {}
