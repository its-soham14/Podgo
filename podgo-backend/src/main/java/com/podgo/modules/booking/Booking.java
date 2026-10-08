package com.podgo.modules.booking;

import com.podgo.modules.ride.Ride;
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
@Table(name = "bookings")
public class Booking {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "ride_id", nullable = false)
    private Ride ride;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "rider_id", nullable = false)
    private User rider;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private BookingStatus status;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private PaymentMethod paymentMethod;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private PaymentStatus paymentStatus;

    @Column(length = 100)
    private String razorpayOrderId;

    @Column(nullable = false, precision = 8, scale = 2)
    private BigDecimal fareAmount;

    @Column(nullable = false, length = 255)
    private String pickupPoint;

    @Column(nullable = false, precision = 10, scale = 8)
    private BigDecimal pickupLat;

    @Column(nullable = false, precision = 11, scale = 8)
    private BigDecimal pickupLng;

    @Column(nullable = false, columnDefinition = "BOOLEAN DEFAULT TRUE")
    private boolean isActive = true;

    @CreationTimestamp
    @Column(updatable = false)
    private LocalDateTime createdAt;

    @UpdateTimestamp
    private LocalDateTime updatedAt;

    public enum BookingStatus {
        PENDING, CONFIRMED, REJECTED, CANCELLED, COMPLETED
    }

    public enum PaymentMethod {
        CASH, UPI
    }

    public enum PaymentStatus {
        PENDING, PAID, REFUNDED
    }
}