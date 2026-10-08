package com.podgo.modules.auth;

import com.podgo.exception.BadRequestException;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.Optional;
import java.security.SecureRandom;
import java.util.concurrent.TimeUnit;

@Service
public class OtpService {

    private static final Logger log = LoggerFactory.getLogger(OtpService.class);
    private static final int MAX_OTP_REQUESTS_PER_HOUR = 3;
    private static final String RATE_LIMIT_PREFIX = "otp:ratelimit:";
    private static final int OTP_EXPIRY_MINUTES = 10;

    private final OtpVerificationRepository otpVerificationRepository;
    private final StringRedisTemplate redisTemplate;
    private final JavaMailSender mailSender;
    private final String fromEmail;

    public OtpService(OtpVerificationRepository otpVerificationRepository,
                      StringRedisTemplate redisTemplate,
                      JavaMailSender mailSender,
                      @org.springframework.beans.factory.annotation.Value("${spring.mail.username}") String fromEmail) {
        this.otpVerificationRepository = otpVerificationRepository;
        this.redisTemplate = redisTemplate;
        this.mailSender = mailSender;
        this.fromEmail = fromEmail;
    }

    public void generateAndSendOtp(String email) {
        checkRateLimit(email);

        String otp = String.format("%06d", new SecureRandom().nextInt(999999));
        
        OtpVerification verification = new OtpVerification();
        verification.setEmail(email);
        verification.setOtp(otp);
        verification.setExpiresAt(LocalDateTime.now().plusMinutes(OTP_EXPIRY_MINUTES));
        otpVerificationRepository.save(verification);

        sendEmail(email, otp);
        incrementRateLimit(email);
        log.info("OTP generated and sent to: {}", email);
    }

    public boolean verifyOtp(String email, String otp) {
        Optional<OtpVerification> optionalOtp = otpVerificationRepository.findTopByEmailOrderByCreatedAtDesc(email);
        
        if (optionalOtp.isEmpty()) {
            throw new BadRequestException("No OTP requested for this email");
        }

        OtpVerification verification = optionalOtp.get();

        if (verification.isUsed()) {
            throw new BadRequestException("OTP has already been used");
        }

        if (verification.getExpiresAt().isBefore(LocalDateTime.now())) {
            throw new BadRequestException("OTP has expired");
        }

        if (!verification.getOtp().equals(otp)) {
            throw new BadRequestException("Invalid OTP");
        }

        verification.setUsed(true);
        otpVerificationRepository.save(verification);
        return true;
    }

    private void checkRateLimit(String email) {
        String key = RATE_LIMIT_PREFIX + email;
        String countStr = redisTemplate.opsForValue().get(key);
        if (countStr != null && Integer.parseInt(countStr) >= MAX_OTP_REQUESTS_PER_HOUR) {
            throw new BadRequestException("Maximum OTP requests exceeded. Please try again later.");
        }
    }

    private void incrementRateLimit(String email) {
        String key = RATE_LIMIT_PREFIX + email;
        Long count = redisTemplate.opsForValue().increment(key);
        if (count != null && count == 1) {
            redisTemplate.expire(key, 1, TimeUnit.HOURS);
        }
    }

    private void sendEmail(String to, String otp) {
        try {
            SimpleMailMessage message = new SimpleMailMessage();
            message.setFrom(fromEmail);
            message.setTo(to);
            message.setSubject("PodGo - Verify Your Email");
            message.setText("Your verification code is: " + otp + "\nThis code will expire in 10 minutes.");
            mailSender.send(message);
        } catch (Exception e) {
            log.error("Failed to send OTP email", e);
            throw new BadRequestException("Failed to send verification email. Please check your email address.");
        }
    }
}
