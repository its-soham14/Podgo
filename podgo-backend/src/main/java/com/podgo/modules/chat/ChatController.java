package com.podgo.modules.chat;

import com.podgo.exception.ResourceNotFoundException;
import com.podgo.modules.booking.Booking;
import com.podgo.modules.booking.BookingRepository;
import com.podgo.modules.chat.dto.ChatMessageDto;
import com.podgo.modules.user.User;
import com.podgo.modules.user.UserRepository;
import com.podgo.modules.chat.dto.ChatSendRequest;
import com.podgo.modules.notification.NotificationService;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.messaging.handler.annotation.DestinationVariable;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.Payload;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Controller;
import org.springframework.transaction.annotation.Transactional;
import lombok.extern.slf4j.Slf4j;

@Slf4j
@Controller
public class ChatController {

    private final MessageRepository messageRepository;
    private final BookingRepository bookingRepository;
    private final UserRepository userRepository;
    private final SimpMessagingTemplate messagingTemplate;
    private final NotificationService notificationService;
    private final ObjectMapper objectMapper;

    public ChatController(MessageRepository messageRepository, BookingRepository bookingRepository, UserRepository userRepository, SimpMessagingTemplate messagingTemplate, NotificationService notificationService, ObjectMapper objectMapper) {
        this.messageRepository = messageRepository;
        this.bookingRepository = bookingRepository;
        this.userRepository = userRepository;
        this.messagingTemplate = messagingTemplate;
        this.notificationService = notificationService;
        this.objectMapper = objectMapper;
    }

    @MessageMapping("/chat.sendMessage/{bookingId}")
    @Transactional
    public void sendMessage(@DestinationVariable Long bookingId, @Payload ChatSendRequest request) {
        try {
            User sender = userRepository.findById(request.senderId())
                    .orElseThrow(() -> new ResourceNotFoundException("Sender not found"));
            Booking booking = bookingRepository.findByIdWithRideAndUsers(bookingId)
                    .orElseThrow(() -> new ResourceNotFoundException("Booking not found"));
            
            Message message = new Message();
            message.setBooking(booking);
            message.setSender(sender);
            message.setContent(request.content());
            
            Message saved = messageRepository.saveAndFlush(message);
        
            ChatMessageDto dto = new ChatMessageDto(
                    saved.getId(),
                    booking.getId(),
                    sender.getId(),
                    sender.getName(),
                    saved.getContent(),
                    saved.getSentAt()
            );
            
            // Broadcast to the booking room
            messagingTemplate.convertAndSend("/topic/booking/" + bookingId, dto);
            
            try {
                // Determine the receiver
                User receiver;
                if (sender.getId().equals(booking.getRider().getId())) {
                    receiver = booking.getRide().getDriver();
                } else {
                    receiver = booking.getRider();
                }
                
                // Send Notification to the receiver
                notificationService.sendNotification(
                    receiver,
                    "New message from " + sender.getName(),
                    request.content(),
                    com.podgo.modules.notification.Notification.NotificationType.GENERAL,
                    bookingId
                );
            } catch (Exception innerE) {
                log.error("Failed to send notification for bookingId: {}", bookingId, innerE);
            }
        } catch (Exception e) {
            log.error("Error processing chat message for bookingId: {}", bookingId, e);
        }
    }
}
