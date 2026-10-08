package com.podgo.modules.admin;

import com.podgo.exception.BadRequestException;
import com.podgo.exception.ResourceNotFoundException;
import com.podgo.modules.admin.dto.AdminDriverProfileDto;
import com.podgo.modules.admin.dto.AdminRideDto;
import com.podgo.modules.admin.dto.AdminStatsDto;
import com.podgo.modules.admin.dto.AdminUserDto;
import com.podgo.modules.driver.DriverProfile;
import com.podgo.modules.driver.DriverRepository;
import com.podgo.modules.ride.RideRepository;
import com.podgo.modules.user.User;
import com.podgo.modules.user.UserRepository;
import com.podgo.modules.notification.NotificationService;
import com.podgo.modules.notification.Notification.NotificationType;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Slf4j
@Service
public class AdminService {

    private final UserRepository userRepository;
    private final DriverRepository driverRepository;
    private final RideRepository rideRepository;
    private final NotificationService notificationService;

    public AdminService(UserRepository userRepository, DriverRepository driverRepository, 
                        RideRepository rideRepository, NotificationService notificationService) {
        this.userRepository = userRepository;
        this.driverRepository = driverRepository;
        this.rideRepository = rideRepository;
        this.notificationService = notificationService;
    }

    public List<AdminUserDto> getAllUsers() {
        return userRepository.findAll().stream()
            .map(u -> new AdminUserDto(
                u.getId(), u.getName(), u.getEmail(), u.getPhone(), 
                u.getRole().name(), u.isEmailVerified(), u.isActive(), u.getCreatedAt()
            )).collect(Collectors.toList());
    }

    public AdminUserDto toggleSuspendUser(Long id) {
        User user = userRepository.findById(id).orElseThrow(() -> new ResourceNotFoundException("User not found"));
        user.setActive(!user.isActive());
        User saved = userRepository.save(user);
        
        AdminUserDto dto = new AdminUserDto(
            saved.getId(), saved.getName(), saved.getEmail(), saved.getPhone(), 
            saved.getRole().name(), saved.isEmailVerified(), saved.isActive(), saved.getCreatedAt()
        );
        String action = saved.isActive() ? "unbanned" : "suspended";
        log.info("User {} successfully {}", id, action);
        return dto;
    }

    public List<AdminDriverProfileDto> getPendingDrivers() {
        return driverRepository.findAll().stream()
            .filter(p -> p.getVerificationStatus() == DriverProfile.VerificationStatus.PENDING)
            .map(this::mapToAdminDriverProfileDto)
            .collect(Collectors.toList());
    }

    public AdminDriverProfileDto verifyDriver(Long id, String action) {
        DriverProfile profile = driverRepository.findById(id).orElseThrow(() -> new ResourceNotFoundException("Driver profile not found"));
        
        if ("APPROVE".equalsIgnoreCase(action)) {
            profile.setVerificationStatus(DriverProfile.VerificationStatus.VERIFIED);
            profile.setVerifiedAt(LocalDateTime.now());
            User user = profile.getUser();
            if (user.getRole() == User.Role.RIDER) {
                user.setRole(User.Role.BOTH);
                userRepository.save(user);
            }
            notificationService.sendNotification(user, "Verification Successful", "Your driver profile has been approved!", NotificationType.DRIVER_VERIFIED);
        } else if ("REJECT".equalsIgnoreCase(action)) {
            profile.setVerificationStatus(DriverProfile.VerificationStatus.REJECTED);
            notificationService.sendNotification(profile.getUser(), "Verification Rejected", "Your driver profile was rejected. Please re-upload clear documents.", NotificationType.SYSTEM_ALERT);
        } else {
            throw new BadRequestException("Action must be APPROVE or REJECT");
        }
        
        DriverProfile saved = driverRepository.save(profile);
        log.info("Driver {} verified with action: {}", id, action);
        return mapToAdminDriverProfileDto(saved);
    }

    public List<AdminRideDto> getAllRides() {
        return rideRepository.findAll().stream()
            .map(r -> new AdminRideDto(
                r.getId(), r.getDriver().getId(), r.getDriver().getName(),
                r.getOrigin(), r.getDestination(), r.getDepartureTime(),
                r.getTotalSeats(), r.getAvailableSeats(), r.getFarePerSeat(),
                r.getStatus().name(), r.getCreatedAt()
            )).collect(Collectors.toList());
    }

    public AdminStatsDto getStats() {
        long totalUsers = userRepository.count();
        long pendingDrivers = driverRepository.findAll().stream()
            .filter(p -> p.getVerificationStatus() == DriverProfile.VerificationStatus.PENDING)
            .count();
        long totalRides = rideRepository.count();
        
        return new AdminStatsDto(totalUsers, pendingDrivers, totalRides);
    }

    private AdminDriverProfileDto mapToAdminDriverProfileDto(DriverProfile p) {
        return new AdminDriverProfileDto(
            p.getId(), p.getUser().getId(), p.getUser().getName(), p.getUser().getEmail(), p.getUser().getPhone(),
            p.getVehicleType().name(), p.getVehicleNumber(), p.getVehicleModel(), p.getVehiclePhotoUrl(),
            p.getIdProofUrl(), p.getRcFrontUrl(), p.getRcBackUrl(), p.getDrivingLicenceUrl(), p.getSelfieUrl(),
            p.getVerificationStatus().name(), p.getVerificationScore(), p.getCreatedAt()
        );
    }
}
