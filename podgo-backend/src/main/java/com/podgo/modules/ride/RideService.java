package com.podgo.modules.ride;

import com.podgo.exception.BadRequestException;
import com.podgo.exception.ResourceNotFoundException;
import com.podgo.modules.driver.DriverProfile;
import com.podgo.modules.driver.DriverRepository;
import com.podgo.modules.ride.dto.RideRequestDto;
import com.podgo.modules.ride.dto.RideResponseDto;
import com.podgo.modules.ride.dto.RideSearchRequestDto;
import com.podgo.modules.user.User;
import com.podgo.modules.user.UserRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class RideService {

    private final RideRepository rideRepository;
    private final UserRepository userRepository;
    private final DriverRepository driverRepository;
    private final com.podgo.modules.booking.BookingRepository bookingRepository;
    private final com.podgo.modules.notification.NotificationService notificationService;

    public RideService(RideRepository rideRepository, UserRepository userRepository, DriverRepository driverRepository, com.podgo.modules.booking.BookingRepository bookingRepository, com.podgo.modules.notification.NotificationService notificationService) {
        this.rideRepository = rideRepository;
        this.userRepository = userRepository;
        this.driverRepository = driverRepository;
        this.bookingRepository = bookingRepository;
        this.notificationService = notificationService;
    }

    @Transactional
    public RideResponseDto createRide(RideRequestDto request, String email) {
        User driver = userRepository.findByEmail(email).orElseThrow(() -> new ResourceNotFoundException("User not found"));
        
        DriverProfile profile = driverRepository.findByUser(driver)
                .orElseThrow(() -> new BadRequestException("Driver profile not found. Please setup profile first."));
                
        if (profile.getVerificationStatus() != DriverProfile.VerificationStatus.VERIFIED) {
            throw new BadRequestException("Driver is not verified. Please complete verification.");
        }

        BigDecimal distance = calculateDistance(request.originLat(), request.originLng(), request.destinationLat(), request.destinationLng());
        
        Ride ride = new Ride();
        ride.setDriver(driver);
        ride.setOrigin(request.origin());
        ride.setOriginLat(request.originLat());
        ride.setOriginLng(request.originLng());
        ride.setDestination(request.destination());
        ride.setDestinationLat(request.destinationLat());
        ride.setDestinationLng(request.destinationLng());
        ride.setDepartureTime(request.departureTime());
        ride.setTotalSeats(request.availableSeats());
        ride.setAvailableSeats(request.availableSeats());
        ride.setDistanceKm(distance);
        ride.setFarePerSeat(request.farePerSeat());
        ride.setVehicleType(profile.getVehicleType());
        ride.setRideType(Ride.RideType.PREPLANNED);
        ride.setStatus(Ride.RideStatus.SCHEDULED);
        
        if (request.waypoints() != null && !request.waypoints().isEmpty()) {
            List<RideWaypoint> waypoints = new java.util.ArrayList<>();
            int seq = 0;
            for (RideRequestDto.WaypointDto wDto : request.waypoints()) {
                RideWaypoint rw = new RideWaypoint();
                rw.setRide(ride);
                rw.setLat(wDto.lat());
                rw.setLng(wDto.lng());
                rw.setSequenceOrder(seq++);
                waypoints.add(rw);
            }
            ride.setWaypoints(waypoints);
        }
        
        Ride savedRide = rideRepository.save(ride);
        return mapToResponseDto(savedRide, profile);
    }

    @Transactional
    public RideResponseDto startRide(Long rideId, String driverEmail) {
        User driver = userRepository.findByEmail(driverEmail).orElseThrow(() -> new ResourceNotFoundException("Driver not found"));
        Ride ride = rideRepository.findById(rideId).orElseThrow(() -> new ResourceNotFoundException("Ride not found"));
        
        if (!ride.getDriver().getId().equals(driver.getId())) {
            throw new BadRequestException("You are not authorized to start this ride");
        }
        if (ride.getStatus() != Ride.RideStatus.SCHEDULED) {
            throw new BadRequestException("Ride can only be started when scheduled");
        }
        if (ride.getDepartureTime().minusMinutes(30).isBefore(LocalDateTime.now())) {
            throw new BadRequestException("Ride can only be started within 30 minutes of departure time");
        }
        
        ride.setStatus(Ride.RideStatus.ACTIVE);
        ride = rideRepository.save(ride);
        
        List<com.podgo.modules.booking.Booking> bookings = bookingRepository.findByRideId(rideId);
        for (com.podgo.modules.booking.Booking b : bookings) {
            if (b.getStatus() == com.podgo.modules.booking.Booking.BookingStatus.CONFIRMED) {
                notificationService.sendNotification(
                    b.getRider(),
                    "Ride Started",
                    "Your ride to " + ride.getDestination() + " has started! Driver is on the way.",
                    com.podgo.modules.notification.Notification.NotificationType.RIDE_UPDATE
                );
            }
        }
        
        org.slf4j.LoggerFactory.getLogger(RideService.class).info("Ride {} started by driver {}", rideId, driverEmail);
        DriverProfile profile = driverRepository.findByUser(driver).orElse(null);
        return mapToResponseDto(ride, profile);
    }

    @Transactional
    public RideResponseDto completeRide(Long rideId, String driverEmail) {
        User driver = userRepository.findByEmail(driverEmail).orElseThrow(() -> new ResourceNotFoundException("Driver not found"));
        Ride ride = rideRepository.findById(rideId).orElseThrow(() -> new ResourceNotFoundException("Ride not found"));
        
        if (!ride.getDriver().getId().equals(driver.getId())) {
            throw new BadRequestException("You are not authorized to complete this ride");
        }
        if (ride.getStatus() != Ride.RideStatus.ACTIVE) {
            throw new BadRequestException("Ride must be active to complete");
        }
        
        ride.setStatus(Ride.RideStatus.COMPLETED);
        ride = rideRepository.save(ride);
        
        List<com.podgo.modules.booking.Booking> bookings = bookingRepository.findByRideId(rideId);
        for (com.podgo.modules.booking.Booking b : bookings) {
            if (b.getStatus() == com.podgo.modules.booking.Booking.BookingStatus.CONFIRMED) {
                b.setStatus(com.podgo.modules.booking.Booking.BookingStatus.COMPLETED);
                bookingRepository.save(b);
                notificationService.sendNotification(
                    b.getRider(),
                    "Ride Completed",
                    "Ride completed! Please rate your driver.",
                    com.podgo.modules.notification.Notification.NotificationType.RIDE_UPDATE,
                    b.getId()
                );
            }
        }
        
        org.slf4j.LoggerFactory.getLogger(RideService.class).info("Ride {} completed by driver {}", rideId, driverEmail);
        DriverProfile profile = driverRepository.findByUser(driver).orElse(null);
        return mapToResponseDto(ride, profile);
    }

    @Transactional
    public RideResponseDto cancelRide(Long rideId, String driverEmail) {
        User driver = userRepository.findByEmail(driverEmail).orElseThrow(() -> new ResourceNotFoundException("Driver not found"));
        Ride ride = rideRepository.findById(rideId).orElseThrow(() -> new ResourceNotFoundException("Ride not found"));
        
        if (!ride.getDriver().getId().equals(driver.getId())) {
            throw new BadRequestException("You are not authorized to cancel this ride");
        }
        if (ride.getStatus() != Ride.RideStatus.SCHEDULED) {
            throw new BadRequestException("Active ride cannot be cancelled");
        }
        if (ride.getDepartureTime().minusHours(2).isBefore(LocalDateTime.now())) {
            throw new BadRequestException("Cannot cancel ride within 2 hours of departure");
        }
        
        ride.setStatus(Ride.RideStatus.CANCELLED);
        ride.setActive(false);
        ride = rideRepository.save(ride);
        
        List<com.podgo.modules.booking.Booking> bookings = bookingRepository.findByRideId(rideId);
        for (com.podgo.modules.booking.Booking b : bookings) {
            if (b.getStatus() == com.podgo.modules.booking.Booking.BookingStatus.CONFIRMED || b.getStatus() == com.podgo.modules.booking.Booking.BookingStatus.PENDING) {
                b.setStatus(com.podgo.modules.booking.Booking.BookingStatus.CANCELLED);
                bookingRepository.save(b);
                notificationService.sendNotification(
                    b.getRider(),
                    "Ride Cancelled",
                    "Your ride to " + ride.getDestination() + " has been cancelled by the driver.",
                    com.podgo.modules.notification.Notification.NotificationType.RIDE_UPDATE
                );
            }
        }
        
        org.slf4j.LoggerFactory.getLogger(RideService.class).info("Ride {} cancelled by driver {}", rideId, driverEmail);
        DriverProfile profile = driverRepository.findByUser(driver).orElse(null);
        return mapToResponseDto(ride, profile);
    }

    public List<RideResponseDto> searchRides(RideSearchRequestDto searchDto) {
        LocalDateTime startOfDay = searchDto.date().atStartOfDay();
        LocalDateTime endOfDay = searchDto.date().atTime(LocalTime.MAX);
        
        List<Ride> rides = rideRepository.searchRidesSubRoute(
                searchDto.originLat().doubleValue(),
                searchDto.originLng().doubleValue(),
                searchDto.destLat().doubleValue(),
                searchDto.destLng().doubleValue(),
                startOfDay, 
                endOfDay, 
                searchDto.seatsRequired(), 
                Ride.RideStatus.SCHEDULED.name()
        );
        
        return rides.stream()
                .map(ride -> {
                    DriverProfile profile = driverRepository.findByUser(ride.getDriver()).orElse(null);
                    return mapToResponseDto(ride, profile);
                }).collect(Collectors.toList());
    }

    public List<RideResponseDto> getDriverRides(String email) {
        User driver = userRepository.findByEmail(email).orElseThrow(() -> new ResourceNotFoundException("User not found"));
        return rideRepository.findByDriverOrderByDepartureTimeDesc(driver).stream().map(ride -> {
            DriverProfile profile = driverRepository.findByUser(ride.getDriver()).orElse(null);
            return mapToResponseDto(ride, profile);
        }).collect(Collectors.toList());
    }
    
    public BigDecimal calculateRecommendedFare(BigDecimal originLat, BigDecimal originLng, BigDecimal destLat, BigDecimal destLng) {
        BigDecimal distance = calculateDistance(originLat, originLng, destLat, destLng);
        // Base rate of 4 Rs per KM
        return distance.multiply(new BigDecimal("4")).setScale(0, RoundingMode.HALF_UP);
    }

    private BigDecimal calculateDistance(BigDecimal lat1, BigDecimal lon1, BigDecimal lat2, BigDecimal lon2) {
        final int R = 6371; // Radius of the earth in km
        double latDistance = Math.toRadians(lat2.doubleValue() - lat1.doubleValue());
        double lonDistance = Math.toRadians(lon2.doubleValue() - lon1.doubleValue());
        double a = Math.sin(latDistance / 2) * Math.sin(latDistance / 2)
                + Math.cos(Math.toRadians(lat1.doubleValue())) * Math.cos(Math.toRadians(lat2.doubleValue()))
                * Math.sin(lonDistance / 2) * Math.sin(lonDistance / 2);
        double c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        double distance = R * c; 
        return BigDecimal.valueOf(distance).setScale(2, RoundingMode.HALF_UP);
    }

    private RideResponseDto mapToResponseDto(Ride ride, DriverProfile profile) {
        return new RideResponseDto(
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
    }
}
