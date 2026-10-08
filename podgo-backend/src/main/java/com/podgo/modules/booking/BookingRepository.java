package com.podgo.modules.booking;

import com.podgo.modules.user.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import java.util.List;

public interface BookingRepository extends JpaRepository<Booking, Long> {
    @Query("SELECT b FROM Booking b JOIN FETCH b.ride r JOIN FETCH r.driver JOIN FETCH b.rider WHERE b.rider = :rider ORDER BY b.createdAt DESC")
    List<Booking> findByRiderOrderByCreatedAtDesc(@Param("rider") User rider);
    
    @Query("SELECT b FROM Booking b JOIN FETCH b.ride r JOIN FETCH r.driver JOIN FETCH b.rider WHERE r.id = :rideId")
    List<Booking> findByRideId(@Param("rideId") Long rideId);
    boolean existsByRideAndRiderAndStatusIn(com.podgo.modules.ride.Ride ride, User rider, List<Booking.BookingStatus> statuses);
    
    @org.springframework.data.jpa.repository.Query(value = "SELECT b.rider_id, r.driver_id FROM bookings b JOIN rides r ON b.ride_id = r.id WHERE b.id = :bookingId", nativeQuery = true)
    List<Object[]> findRiderAndDriverIds(@org.springframework.data.repository.query.Param("bookingId") Long bookingId);

    @org.springframework.data.jpa.repository.Query("SELECT b FROM Booking b JOIN FETCH b.ride r JOIN FETCH r.driver JOIN FETCH b.rider WHERE b.id = :bookingId")
    java.util.Optional<Booking> findByIdWithRideAndUsers(@org.springframework.data.repository.query.Param("bookingId") Long bookingId);
}
