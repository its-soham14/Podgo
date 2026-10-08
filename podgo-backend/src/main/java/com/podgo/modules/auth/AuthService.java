package com.podgo.modules.auth;

import com.podgo.exception.BadRequestException;
import com.podgo.exception.UnauthorizedException;
import com.podgo.modules.auth.dto.AuthResponse;
import com.podgo.modules.auth.dto.LoginRequest;
import com.podgo.modules.auth.dto.RegisterRequest;
import com.podgo.modules.auth.dto.VerifyOtpRequest;
import com.podgo.modules.user.User;
import com.podgo.modules.user.UserRepository;
import com.podgo.security.JwtUtil;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class AuthService {

    private final UserRepository userRepository;
    private final OtpService otpService;
    private final PasswordEncoder passwordEncoder;
    private final JwtUtil jwtUtil;
    private final UserDetailsService userDetailsService;

    public AuthService(UserRepository userRepository, OtpService otpService, 
                       PasswordEncoder passwordEncoder, JwtUtil jwtUtil, 
                       UserDetailsService userDetailsService) {
        this.userRepository = userRepository;
        this.otpService = otpService;
        this.passwordEncoder = passwordEncoder;
        this.jwtUtil = jwtUtil;
        this.userDetailsService = userDetailsService;
    }

    @Transactional
    public void register(RegisterRequest request) {
        if (userRepository.existsByEmail(request.email())) {
            User existingUser = userRepository.findByEmail(request.email()).get();
            if (existingUser.isEmailVerified()) {
                throw new BadRequestException("Email is already registered and verified");
            }
            // If exists but not verified, we can resend OTP and update password/name
            existingUser.setName(request.name());
            existingUser.setPassword(passwordEncoder.encode(request.password()));
            userRepository.save(existingUser);
            otpService.generateAndSendOtp(request.email());
            return;
        }

        User user = new User();
        user.setName(request.name());
        user.setEmail(request.email());
        user.setPassword(passwordEncoder.encode(request.password()));
        user.setRole(User.Role.RIDER); // Default role
        userRepository.save(user);

        otpService.generateAndSendOtp(request.email());
    }

    @Transactional
    public AuthResponse verifyOtp(VerifyOtpRequest request) {
        otpService.verifyOtp(request.email(), request.otp());

        User user = userRepository.findByEmail(request.email())
                .orElseThrow(() -> new BadRequestException("User not found"));

        user.setEmailVerified(true);
        userRepository.save(user);

        UserDetails userDetails = userDetailsService.loadUserByUsername(user.getEmail());
        String token = jwtUtil.generateToken(userDetails);

        return new AuthResponse(token, user.getId(), user.getEmail(), user.getName(), user.getRole().name());
    }

    public AuthResponse login(LoginRequest request) {
        User user = userRepository.findByEmail(request.email())
                .orElseThrow(() -> new UnauthorizedException("Invalid email or password"));

        if (!passwordEncoder.matches(request.password(), user.getPassword())) {
            throw new UnauthorizedException("Invalid email or password");
        }

        if (!user.isEmailVerified()) {
            otpService.generateAndSendOtp(user.getEmail());
            throw new UnauthorizedException("Email not verified. A new OTP has been sent to your email.");
        }

        if (!user.isActive()) {
            throw new UnauthorizedException("Account is suspended");
        }

        UserDetails userDetails = userDetailsService.loadUserByUsername(user.getEmail());
        String token = jwtUtil.generateToken(userDetails);

        return new AuthResponse(token, user.getId(), user.getEmail(), user.getName(), user.getRole().name());
    }

    public void forgotPassword(com.podgo.modules.auth.dto.ForgotPasswordRequest request) {
        if (!userRepository.existsByEmail(request.email())) {
            throw new BadRequestException("User with this email does not exist");
        }
        otpService.generateAndSendOtp(request.email());
    }

    @Transactional
    public void resetPassword(com.podgo.modules.auth.dto.ResetPasswordRequest request) {
        otpService.verifyOtp(request.email(), request.otp());

        User user = userRepository.findByEmail(request.email())
                .orElseThrow(() -> new BadRequestException("User not found"));

        user.setPassword(passwordEncoder.encode(request.newPassword()));
        userRepository.save(user);
    }
}
