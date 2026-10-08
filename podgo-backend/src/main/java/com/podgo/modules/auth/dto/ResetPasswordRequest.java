package com.podgo.modules.auth.dto;

public record ResetPasswordRequest(String email, String otp, String newPassword) {}
