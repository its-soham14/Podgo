package com.podgo.modules.ride;

import com.podgo.modules.user.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDateTime;
import java.util.List;

public interface RideRepository extends JpaRepository<Ride, Long> {
    
    List<Ride> findByDriverOrderByDepartureTimeDesc(User driver);
    
    @Query(value = "SELECT r.* FROM rides r " +
           "JOIN ride_waypoints w1 ON r.id = w1.ride_id " +
           "JOIN ride_waypoints w2 ON r.id = w2.ride_id " +
           "WHERE r.departure_time >= :dateStart AND r.departure_time < :dateEnd " +
           "AND r.available_seats >= :seats " +
           "AND r.status = :status AND r.is_active = true " +
           "AND w1.sequence_order < w2.sequence_order " +
           "AND (6371 * acos(cos(radians(:originLat)) * cos(radians(w1.lat)) * cos(radians(w1.lng) - radians(:originLng)) + sin(radians(:originLat)) * sin(radians(w1.lat)))) <= 5.0 " +
           "AND (6371 * acos(cos(radians(:destLat)) * cos(radians(w2.lat)) * cos(radians(w2.lng) - radians(:destLng)) + sin(radians(:destLat)) * sin(radians(w2.lat)))) <= 5.0 " +
           "GROUP BY r.id " +
           "ORDER BY r.departure_time ASC", nativeQuery = true)
    List<Ride> searchRidesSubRoute(
           @Param("originLat") double originLat, 
           @Param("originLng") double originLng, 
           @Param("destLat") double destLat, 
           @Param("destLng") double destLng, 
           @Param("dateStart") LocalDateTime dateStart,
           @Param("dateEnd") LocalDateTime dateEnd,
           @Param("seats") int seats,
           @Param("status") String status);
}
