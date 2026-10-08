package com.podgo.modules.booking;

import com.podgo.modules.booking.dto.BookingRequestDto;
import com.podgo.modules.booking.dto.BookingResponseDto;
import com.podgo.utils.ApiResponse;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/bookings")
public class BookingController {

    private final BookingService bookingService;

    public BookingController(BookingService bookingService) {
        this.bookingService = bookingService;
    }

    @PostMapping
    public ResponseEntity<ApiResponse<BookingResponseDto>> requestBooking(@Valid @RequestBody BookingRequestDto request, Authentication authentication) {
        BookingResponseDto response = bookingService.requestBooking(request, authentication.getName());
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success("Booking requested successfully", response));
    }

    @PutMapping("/{id}/status")
    public ResponseEntity<ApiResponse<BookingResponseDto>> updateBookingStatus(
            @PathVariable Long id, @RequestParam String action, Authentication authentication) {
        BookingResponseDto response = bookingService.updateBookingStatus(id, action, authentication.getName());
        return ResponseEntity.ok(ApiResponse.success("Booking status updated", response));
    }

    @PutMapping("/{id}/cancel")
    public ResponseEntity<ApiResponse<BookingResponseDto>> cancelBooking(
            @PathVariable Long id, Authentication authentication) {
        BookingResponseDto response = bookingService.cancelBooking(id, authentication.getName());
        return ResponseEntity.ok(ApiResponse.success("Booking cancelled successfully", response));
    }

    @GetMapping("/rider")
    public ResponseEntity<ApiResponse<List<BookingResponseDto>>> getRiderBookings(Authentication authentication) {
        List<BookingResponseDto> bookings = bookingService.getRiderBookings(authentication.getName());
        return ResponseEntity.ok(ApiResponse.success("Rider bookings fetched", bookings));
    }

    @GetMapping("/ride/{rideId}")
    public ResponseEntity<ApiResponse<List<BookingResponseDto>>> getRideBookings(@PathVariable Long rideId, Authentication authentication) {
        List<BookingResponseDto> bookings = bookingService.getRideBookings(rideId, authentication.getName());
        return ResponseEntity.ok(ApiResponse.success("Ride bookings fetched", bookings));
    }
}
