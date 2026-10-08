package com.podgo.modules.auth.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;

public record OtpRequest(
        @NotBlank(message = "Email is required")
        @Email(message = "Email is invalid")
        String email
) {}
