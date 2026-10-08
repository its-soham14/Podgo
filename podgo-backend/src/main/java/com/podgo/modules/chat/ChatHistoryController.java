package com.podgo.modules.chat;

import com.podgo.exception.ResourceNotFoundException;
import com.podgo.modules.booking.Booking;
import com.podgo.modules.booking.BookingRepository;
import com.podgo.modules.chat.dto.ChatMessageDto;
import com.podgo.utils.ApiResponse;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/v1/chat")
public class ChatHistoryController {

    private final MessageRepository messageRepository;
    private final BookingRepository bookingRepository;

    public ChatHistoryController(MessageRepository messageRepository, BookingRepository bookingRepository) {
        this.messageRepository = messageRepository;
        this.bookingRepository = bookingRepository;
    }

    @GetMapping("/booking/{bookingId}")
    public ResponseEntity<ApiResponse<List<ChatMessageDto>>> getChatHistory(@PathVariable Long bookingId) {
        Booking booking = bookingRepository.findById(bookingId)
                .orElseThrow(() -> new ResourceNotFoundException("Booking not found"));
                
        List<ChatMessageDto> messages = messageRepository.findByBookingOrderBySentAtAsc(booking).stream()
                .map(m -> new ChatMessageDto(m.getId(), m.getBooking().getId(), m.getSender().getId(), m.getSender().getName(), m.getContent(), m.getSentAt()))
                .collect(Collectors.toList());
                
        return ResponseEntity.ok(ApiResponse.success("Chat history fetched", messages));
    }
}
