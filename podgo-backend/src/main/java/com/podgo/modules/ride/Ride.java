package com.podgo.modules.ride;

import com.podgo.modules.user.User;
import com.podgo.modules.driver.DriverProfile;
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
@Table(name = "rides")
public class Ride {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "driver_id", nullable = false)
    private User driver;

    @Column(nullable = false, length = 255)
    private String origin;

    @Column(nullable = false, precision = 10, scale = 8)
    private BigDecimal originLat;

    @Column(nullable = false, precision = 11, scale = 8)
    private BigDecimal originLng;

    @Column(nullable = false, length = 255)
    private String destination;

    @Column(nullable = false, precision = 10, scale = 8)
    private BigDecimal destinationLat;

    @Column(nullable = false, precision = 11, scale = 8)
    private BigDecimal destinationLng;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private RideType rideType;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private RideStatus status;

    @Column(nullable = false)
    private LocalDateTime departureTime;

    @Column(nullable = false)
    private int availableSeats;

    @Column(nullable = false)
    private int totalSeats;

    @Column(nullable = false, precision = 8, scale = 2)
    private BigDecimal distanceKm;

    @Column(nullable = false, precision = 8, scale = 2)
    private BigDecimal farePerSeat;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private DriverProfile.VehicleType vehicleType;

    @Column(nullable = false, columnDefinition = "BOOLEAN DEFAULT TRUE")
    private boolean isActive = true;
    
    @OneToMany(mappedBy = "ride", cascade = CascadeType.ALL, orphanRemoval = true)
    private java.util.List<RideWaypoint> waypoints;

    @CreationTimestamp
    @Column(updatable = false)
    private LocalDateTime createdAt;

    @UpdateTimestamp
    private LocalDateTime updatedAt;

    public enum RideType {
        PREPLANNED, INSTANT
    }

    public enum RideStatus {
        SCHEDULED, ACTIVE, COMPLETED, CANCELLED
    }
}