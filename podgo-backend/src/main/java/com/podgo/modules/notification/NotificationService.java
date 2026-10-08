package com.podgo.modules.notification;

import com.podgo.modules.notification.dto.NotificationDto;
import com.podgo.modules.user.User;
import com.podgo.modules.user.UserRepository;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class NotificationService {

    private final NotificationRepository notificationRepository;
    private final SimpMessagingTemplate messagingTemplate;
    private final UserRepository userRepository;

    public NotificationService(NotificationRepository notificationRepository, SimpMessagingTemplate messagingTemplate, UserRepository userRepository) {
        this.notificationRepository = notificationRepository;
        this.messagingTemplate = messagingTemplate;
        this.userRepository = userRepository;
    }

    @Transactional(propagation = org.springframework.transaction.annotation.Propagation.REQUIRES_NEW)
    public void sendNotification(User user, String title, String message, Notification.NotificationType type) {
        sendNotification(user, title, message, type, null);
    }

    @Transactional(propagation = org.springframework.transaction.annotation.Propagation.REQUIRES_NEW)
    public void sendNotification(User user, String title, String message, Notification.NotificationType type, Long entityId) {
        Notification notification = new Notification();
        notification.setUser(user);
        notification.setTitle(title);
        notification.setMessage(message);
        notification.setType(type);
        notification.setEntityId(entityId);
        
        Notification saved = notificationRepository.saveAndFlush(notification);
        
        NotificationDto dto = new NotificationDto(
                saved.getId(), saved.getTitle(), saved.getMessage(), 
                saved.getType().name(), saved.isRead(), saved.getCreatedAt(), saved.getEntityId()
        );
        
        // Push real-time notification to user's specific topic
        messagingTemplate.convertAndSend("/topic/notifications/" + user.getId(), dto);
    }
    
    public List<NotificationDto> getUserNotifications(String email) {
        User user = userRepository.findByEmail(email).orElseThrow();
        return notificationRepository.findByUserOrderByCreatedAtDesc(user).stream()
                .map(n -> new NotificationDto(n.getId(), n.getTitle(), n.getMessage(), n.getType().name(), n.isRead(), n.getCreatedAt(), n.getEntityId()))
                .collect(Collectors.toList());
    }

    @Transactional
    public void markAsRead(Long notificationId) {
        notificationRepository.findById(notificationId).ifPresent(n -> {
            n.setRead(true);
            notificationRepository.save(n);
        });
    }
}
