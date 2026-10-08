package com.podgo.modules.driver;

import com.podgo.modules.user.User;
import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;
import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@Entity
@Table(name = "driver_profiles")
public class DriverProfile {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", unique = true, nullable = false)
    private User user;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private VehicleType vehicleType;

    @Column(nullable = false, length = 20)
    private String vehicleNumber;

    @Column(nullable = false, length = 100)
    private String vehicleModel;

    @Column(nullable = false, length = 500)
    private String vehiclePhotoUrl;

    @Column(nullable = false, length = 500)
    private String idProofUrl;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private VerificationStatus verificationStatus = VerificationStatus.PENDING;

    @Column(columnDefinition = "TEXT")
    private String verificationNote;

    @Column(precision = 3, scale = 2, columnDefinition = "DECIMAL(3,2) DEFAULT 0.0")
    private BigDecimal avgRating = BigDecimal.ZERO;

    @Column(columnDefinition = "INT DEFAULT 0")
    private int totalRides = 0;

    private LocalDateTime verifiedAt;

    @CreationTimestamp
    @Column(updatable = false)
    private LocalDateTime createdAt;

    @UpdateTimestamp
    private LocalDateTime updatedAt;

    // RC Details
    @Column(name = "rc_front_url", length = 500)
    private String rcFrontUrl;

    @Column(name = "rc_back_url", length = 500)
    private String rcBackUrl;

    @Column(name = "rc_extracted_reg_number", length = 20)
    private String rcExtractedRegNumber;

    @Column(name = "rc_verification_passed")
    private Boolean rcVerificationPassed;

    // Driving Licence
    @Column(name = "driving_licence_url", length = 500)
    private String drivingLicenceUrl;

    @Column(name = "dl_verification_passed")
    private Boolean dlVerificationPassed;

    // Selfie
    @Column(name = "selfie_url", length = 500)
    private String selfieUrl;

    // Individual verification flags
    @Column(name = "govt_id_verified")
    private Boolean govtIdVerified;

    @Column(name = "verification_score")
    private Integer verificationScore;

    public enum VehicleType {
        CAR, BIKE
    }

    public enum VerificationStatus {
        PENDING, VERIFIED, REJECTED
    }

    // Getters and setters removed in favor of Lombok @Data
}