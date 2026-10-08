package com.podgo.modules.rating;

import com.podgo.exception.BadRequestException;
import com.podgo.exception.ResourceNotFoundException;
import com.podgo.modules.booking.Booking;
import com.podgo.modules.booking.BookingRepository;
import com.podgo.modules.driver.DriverProfile;
import com.podgo.modules.driver.DriverRepository;
import com.podgo.modules.notification.NotificationService;
import com.podgo.modules.rating.dto.RatingRequestDto;
import com.podgo.modules.rating.dto.RatingResponseDto;
import com.podgo.modules.user.User;
import com.podgo.modules.user.UserRepository;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.List;
import java.util.stream.Collectors;

@Slf4j
@Service
public class RatingService {

    private final RatingRepository ratingRepository;
    private final BookingRepository bookingRepository;
    private final UserRepository userRepository;
    private final DriverRepository driverRepository;
    private final NotificationService notificationService;

    public RatingService(RatingRepository ratingRepository, BookingRepository bookingRepository,
                         UserRepository userRepository, DriverRepository driverRepository,
                         NotificationService notificationService) {
        this.ratingRepository = ratingRepository;
        this.bookingRepository = bookingRepository;
        this.userRepository = userRepository;
        this.driverRepository = driverRepository;
        this.notificationService = notificationService;
    }

    @Transactional
    public RatingResponseDto submitRating(RatingRequestDto request, String raterEmail) {
        User rater = userRepository.findByEmail(raterEmail)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));
        
        Booking booking = bookingRepository.findById(request.bookingId())
                .orElseThrow(() -> new ResourceNotFoundException("Booking not found"));
                
        if (booking.getStatus() != Booking.BookingStatus.COMPLETED) {
            throw new BadRequestException("Rating is only allowed after ride completion");
        }
        
        boolean isRider = booking.getRider().getId().equals(rater.getId());
        boolean isDriver = booking.getRide().getDriver().getId().equals(rater.getId());
        
        if (!isRider && !isDriver) {
            throw new BadRequestException("You are not authorized to rate this booking");
        }
        
        User ratedUser = userRepository.findById(request.ratedUserId())
                .orElseThrow(() -> new ResourceNotFoundException("Rated user not found"));
                
        if (rater.getId().equals(ratedUser.getId())) {
            throw new BadRequestException("You cannot rate yourself");
        }
        
        if (ratingRepository.existsByBookingAndRatedBy(booking, rater)) {
            throw new BadRequestException("You have already rated this booking");
        }
        
        Rating rating = new Rating();
        rating.setBooking(booking);
        rating.setRatedBy(rater);
        rating.setRatedUser(ratedUser);
        rating.setRating(request.rating());
        rating.setComment(request.comment());
        
        Rating savedRating = ratingRepository.save(rating);
        
        driverRepository.findByUser(ratedUser).ifPresent(driverProfile -> {
            Double avg = ratingRepository.findAvgRatingByRatedUser(ratedUser);
            if (avg != null) {
                driverProfile.setAvgRating(BigDecimal.valueOf(avg).setScale(1, RoundingMode.HALF_UP));
                driverRepository.save(driverProfile);
            }
        });
        
        notificationService.sendNotification(
            ratedUser,
            "New Rating Received",
            "You received a " + savedRating.getRating() + "⭐ rating from " + rater.getName(),
            com.podgo.modules.notification.Notification.NotificationType.GENERAL
        );
        
        log.info("User {} rated user {} with {} stars for booking {}", rater.getId(), ratedUser.getId(), savedRating.getRating(), booking.getId());
        
        return mapToDto(savedRating);
    }

    public List<RatingResponseDto> getUserRatings(Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));
                
        return ratingRepository.findByRatedUserOrderByCreatedAtDesc(user).stream()
                .map(this::mapToDto)
                .collect(Collectors.toList());
    }

    private RatingResponseDto mapToDto(Rating rating) {
        return new RatingResponseDto(
            rating.getId(),
            rating.getBooking().getId(),
            rating.getRatedBy().getId(),
            rating.getRatedBy().getName(),
            rating.getRatedBy().getProfilePhotoUrl(),
            rating.getRatedUser().getId(),
            rating.getRatedUser().getName(),
            rating.getRating(),
            rating.getComment(),
            rating.getCreatedAt()
        );
    }
}
