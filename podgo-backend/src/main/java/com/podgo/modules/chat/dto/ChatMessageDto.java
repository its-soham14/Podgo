package com.podgo.modules.chat.dto;

import java.time.LocalDateTime;

public record ChatMessageDto(
        Long id,
        Long bookingId,
        Long senderId,
        String senderName,
        String content,
        LocalDateTime sentAt
) {}
