package com.podgo.modules.rating;

import com.podgo.modules.booking.Booking;
import com.podgo.modules.user.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface RatingRepository extends JpaRepository<Rating, Long> {
    boolean existsByBookingAndRatedBy(Booking booking, User ratedBy);
    
    List<Rating> findByRatedUserOrderByCreatedAtDesc(User ratedUser);
    
    @Query("SELECT AVG(r.rating) FROM Rating r WHERE r.ratedUser = :user")
    Double findAvgRatingByRatedUser(@Param("user") User user);
}
