package com.podgo.modules.notification.dto;

import java.time.LocalDateTime;

public record NotificationDto(
        Long id,
        String title,
        String message,
        String type,
        boolean isRead,
        LocalDateTime createdAt,
        Long entityId
) {}
