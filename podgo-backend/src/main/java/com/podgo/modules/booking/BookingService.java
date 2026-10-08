package com.podgo.modules.booking;

import com.podgo.exception.BadRequestException;
import com.podgo.exception.ResourceNotFoundException;
import com.podgo.modules.booking.dto.BookingRequestDto;
import com.podgo.modules.booking.dto.BookingResponseDto;
import com.podgo.modules.driver.DriverProfile;
import com.podgo.modules.driver.DriverRepository;
import com.podgo.modules.ride.Ride;
import com.podgo.modules.ride.RideRepository;
import com.podgo.modules.ride.dto.RideResponseDto;
import com.podgo.modules.user.User;
import com.podgo.modules.user.UserRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class BookingService {

    private final BookingRepository bookingRepository;
    private final RideRepository rideRepository;
    private final UserRepository userRepository;
    private final DriverRepository driverRepository;
    private final com.podgo.modules.notification.NotificationService notificationService;
    private final com.podgo.modules.rating.RatingRepository ratingRepository;

    public BookingService(BookingRepository bookingRepository, RideRepository rideRepository, 
                          UserRepository userRepository, DriverRepository driverRepository,
                          com.podgo.modules.notification.NotificationService notificationService,
                          com.podgo.modules.rating.RatingRepository ratingRepository) {
        this.bookingRepository = bookingRepository;
        this.rideRepository = rideRepository;
        this.userRepository = userRepository;
        this.driverRepository = driverRepository;
        this.notificationService = notificationService;
        this.ratingRepository = ratingRepository;
    }

    @Transactional
    public BookingResponseDto requestBooking(BookingRequestDto request, String email) {
        User rider = userRepository.findByEmail(email).orElseThrow(() -> new ResourceNotFoundException("User not found"));
        Ride ride = rideRepository.findById(request.rideId()).orElseThrow(() -> new ResourceNotFoundException("Ride not found"));
        
        if (ride.getDriver().getId().equals(rider.getId())) {
            throw new BadRequestException("You cannot book your own ride");
        }
        
        if (ride.getAvailableSeats() < 1) {
            throw new BadRequestException("No seats available for this ride");
        }
        
        if (ride.getStatus() != Ride.RideStatus.SCHEDULED) {
            throw new BadRequestException("Ride is no longer available for booking");
        }

        boolean alreadyBooked = bookingRepository.existsByRideAndRiderAndStatusIn(
            ride, rider, 
            List.of(Booking.BookingStatus.PENDING, Booking.BookingStatus.CONFIRMED)
        );
        if (alreadyBooked) {
            throw new BadRequestException("You have already requested or confirmed a seat on this ride");
        }

        Booking booking = new Booking();
        booking.setRide(ride);
        booking.setRider(rider);
        booking.setStatus(Booking.BookingStatus.PENDING);
        booking.setPaymentMethod(request.paymentMethod());
        booking.setPaymentStatus(Booking.PaymentStatus.PENDING);
        booking.setFareAmount(ride.getFarePerSeat());
        booking.setPickupPoint(request.pickupPoint());
        booking.setPickupLat(request.pickupLat());
        booking.setPickupLng(request.pickupLng());
        
        Booking saved = bookingRepository.save(booking);
        
        notificationService.sendNotification(
            ride.getDriver(), 
            "New Booking Request", 
            rider.getName() + " requested a seat on your ride from " + ride.getOrigin(),
            com.podgo.modules.notification.Notification.NotificationType.BOOKING_REQUEST
        );
        
        return mapToDto(saved, rider);
    }

    @Transactional
    public BookingResponseDto updateBookingStatus(Long bookingId, String action, String driverEmail) {
        Booking booking = bookingRepository.findById(bookingId).orElseThrow(() -> new ResourceNotFoundException("Booking not found"));
        User driver = userRepository.findByEmail(driverEmail).orElseThrow(() -> new ResourceNotFoundException("Driver not found"));
        
        Ride ride = booking.getRide();
        if (!ride.getDriver().getId().equals(driver.getId())) {
            throw new BadRequestException("You are not authorized to update this booking");
        }
        
        if (booking.getStatus() != Booking.BookingStatus.PENDING) {
            throw new BadRequestException("Only pending bookings can be updated");
        }

        if ("ACCEPT".equalsIgnoreCase(action)) {
            if (ride.getAvailableSeats() < 1) {
                throw new BadRequestException("No seats available to accept this booking");
            }
            booking.setStatus(Booking.BookingStatus.CONFIRMED);
            ride.setAvailableSeats(ride.getAvailableSeats() - 1);
            rideRepository.save(ride);
            
            notificationService.sendNotification(
                booking.getRider(),
                "Booking Confirmed",
                driver.getName() + " confirmed your seat!",
                com.podgo.modules.notification.Notification.NotificationType.BOOKING_CONFIRMED
            );
        } else if ("REJECT".equalsIgnoreCase(action)) {
            booking.setStatus(Booking.BookingStatus.REJECTED);
            
            notificationService.sendNotification(
                booking.getRider(),
                "Booking Rejected",
                driver.getName() + " rejected your seat request.",
                com.podgo.modules.notification.Notification.NotificationType.BOOKING_REJECTED
            );
        } else {
            throw new BadRequestException("Invalid action. Use ACCEPT or REJECT");
        }
        
        Booking updated = bookingRepository.save(booking);
        return mapToDto(updated, driver);
    }

    @Transactional
    public BookingResponseDto cancelBooking(Long bookingId, String cancellerEmail) {
        Booking booking = bookingRepository.findById(bookingId).orElseThrow(() -> new ResourceNotFoundException("Booking not found"));
        User canceller = userRepository.findByEmail(cancellerEmail).orElseThrow(() -> new ResourceNotFoundException("User not found"));
        
        Ride ride = booking.getRide();
        boolean isRider = booking.getRider().getId().equals(canceller.getId());
        boolean isDriver = ride.getDriver().getId().equals(canceller.getId());
        
        if (!isRider && !isDriver) {
            throw new BadRequestException("You are not authorized to cancel this booking");
        }
        
        Booking.BookingStatus oldStatus = booking.getStatus();
        if (oldStatus != Booking.BookingStatus.PENDING && oldStatus != Booking.BookingStatus.CONFIRMED) {
            throw new BadRequestException("Booking cannot be cancelled in its current state");
        }
        
        if (isRider && oldStatus == Booking.BookingStatus.CONFIRMED) {
            if (ride.getDepartureTime().minusHours(1).isBefore(java.time.LocalDateTime.now())) {
                throw new BadRequestException("Cannot cancel within 1 hour of departure");
            }
        }
        
        booking.setStatus(Booking.BookingStatus.CANCELLED);
        if (oldStatus == Booking.BookingStatus.CONFIRMED) {
            ride.setAvailableSeats(ride.getAvailableSeats() + 1);
            rideRepository.save(ride);
        }
        
        bookingRepository.save(booking);
        
        if (isRider) {
            notificationService.sendNotification(
                ride.getDriver(),
                "Booking Cancelled",
                canceller.getName() + " has cancelled their booking",
                com.podgo.modules.notification.Notification.NotificationType.BOOKING_UPDATE
            );
        } else {
            notificationService.sendNotification(
                booking.getRider(),
                "Booking Cancelled",
                "Driver has cancelled your booking",
                com.podgo.modules.notification.Notification.NotificationType.BOOKING_UPDATE
            );
        }
        
        // Use SLF4J log directly
        org.slf4j.LoggerFactory.getLogger(BookingService.class).info("Booking {} cancelled by {}", bookingId, cancellerEmail);
        
        return mapToDto(booking, canceller);
    }

    @Transactional(readOnly = true)
    public List<BookingResponseDto> getRiderBookings(String email) {
        User rider = userRepository.findByEmail(email).orElseThrow(() -> new ResourceNotFoundException("User not found"));
        return bookingRepository.findByRiderOrderByCreatedAtDesc(rider)
                .stream().map(b -> mapToDto(b, rider)).collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<BookingResponseDto> getRideBookings(Long rideId, String driverEmail) {
        User driver = userRepository.findByEmail(driverEmail).orElseThrow(() -> new ResourceNotFoundException("Driver not found"));
        Ride ride = rideRepository.findById(rideId).orElseThrow(() -> new ResourceNotFoundException("Ride not found"));
        
        if (!ride.getDriver().getId().equals(driver.getId())) {
            throw new BadRequestException("You are not authorized to view bookings for this ride");
        }
        
        return bookingRepository.findByRideId(rideId)
                .stream().map(b -> mapToDto(b, driver)).collect(Collectors.toList());
    }

    private BookingResponseDto mapToDto(Booking booking, User currentUser) {
        Ride ride = booking.getRide();
        DriverProfile profile = driverRepository.findByUser(ride.getDriver()).orElse(null);
        
        RideResponseDto rideDto = new RideResponseDto(
                ride.getId(),
                ride.getDriver().getId(),
                ride.getDriver().getName(),
                ride.getDriver().getProfilePhotoUrl(),
                ride.getDriver().getPhone(),
                profile != null ? profile.getAvgRating() : BigDecimal.ZERO,
                profile != null ? profile.getVehicleModel() : "Unknown",
                profile != null ? profile.getVehicleNumber() : "Unknown",
                ride.getOrigin(),
                ride.getDestination(),
                ride.getDepartureTime(),
                ride.getAvailableSeats(),
                ride.getTotalSeats(),
                ride.getDistanceKm(),
                ride.getFarePerSeat(),
                ride.getRideType(),
                ride.getStatus(),
                ride.getVehicleType()
        );

        boolean hasRated = false;
        if (currentUser != null && ratingRepository != null) {
            hasRated = ratingRepository.existsByBookingAndRatedBy(booking, currentUser);
        }

        return new BookingResponseDto(
                booking.getId(),
                rideDto,
                booking.getRider().getId(),
                booking.getRider().getName(),
                booking.getRider().getProfilePhotoUrl(),
                booking.getRider().getPhone(),
                booking.getStatus(),
                booking.getPaymentMethod(),
                booking.getPaymentStatus(),
                booking.getFareAmount(),
                booking.getPickupPoint(),
                booking.getCreatedAt(),
                hasRated
        );
    }
}

