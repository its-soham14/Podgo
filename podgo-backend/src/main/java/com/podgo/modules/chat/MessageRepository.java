package com.podgo.modules.chat;

import com.podgo.modules.booking.Booking;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface MessageRepository extends JpaRepository<Message, Long> {
    List<Message> findByBookingOrderBySentAtAsc(Booking booking);
}
