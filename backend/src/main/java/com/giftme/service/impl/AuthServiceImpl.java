package com.giftme.service.impl;

import com.giftme.common.exception.ConflictException;
import com.giftme.common.exception.ErrorCode;
import com.giftme.common.exception.UnauthorizedException;
import com.giftme.config.GiftMeProperties;
import com.giftme.domain.RefreshToken;
import com.giftme.domain.User;
import com.giftme.domain.enums.Role;
import com.giftme.dto.auth.AuthResponse;
import com.giftme.dto.auth.LoginRequest;
import com.giftme.dto.auth.RefreshRequest;
import com.giftme.dto.auth.RegisterRequest;
import com.giftme.dto.auth.UserResponse;
import com.giftme.mapper.UserMapper;
import com.giftme.repository.RefreshTokenRepository;
import com.giftme.repository.UserRepository;
import com.giftme.security.JwtService;
import com.giftme.security.UserPrincipal;
import com.giftme.service.AuthService;
import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import java.security.SecureRandom;
import java.time.Instant;
import java.util.Base64;
import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class AuthServiceImpl implements AuthService {

    private static final SecureRandom SECURE_RANDOM = new SecureRandom();

    private final UserRepository userRepository;
    private final RefreshTokenRepository refreshTokenRepository;
    private final PasswordEncoder passwordEncoder;
    private final AuthenticationManager authenticationManager;
    private final JwtService jwtService;
    private final GiftMeProperties properties;

    @Override
    @Transactional
    public AuthResponse register(RegisterRequest request) {
        if (userRepository.existsByEmailIgnoreCase(request.email())) {
            throw new ConflictException(ErrorCode.DUPLICATE_EMAIL, "An account with this email already exists");
        }

        User user = User.builder()
                .email(request.email().toLowerCase())
                .fullName(request.fullName())
                .phone(request.phone())
                .passwordHash(passwordEncoder.encode(request.password()))
                .role(Role.CUSTOMER)
                .enabled(true)
                .build();
        userRepository.save(user);

        return issueTokens(user);
    }

    @Override
    @Transactional
    public AuthResponse login(LoginRequest request) {
        authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(request.email(), request.password()));

        User user = userRepository.findByEmailIgnoreCase(request.email())
                .orElseThrow(() -> new UnauthorizedException(ErrorCode.INVALID_CREDENTIALS, "Invalid email or password"));

        return issueTokens(user);
    }

    @Override
    @Transactional
    public AuthResponse refresh(RefreshRequest request) {
        String hash = hash(request.refreshToken());
        RefreshToken existing = refreshTokenRepository.findByTokenHash(hash)
                .orElseThrow(() -> new UnauthorizedException(ErrorCode.INVALID_REFRESH_TOKEN, "Invalid refresh token"));

        if (!existing.isValid()) {
            throw new UnauthorizedException(ErrorCode.INVALID_REFRESH_TOKEN, "Refresh token has expired or was revoked");
        }

        // Rotate: revoke the presented token and issue a fresh pair, so a stolen-then-replayed
        // token is unusable once the legitimate client refreshes.
        existing.setRevoked(true);
        refreshTokenRepository.save(existing);

        return issueTokens(existing.getUser());
    }

    @Override
    @Transactional(readOnly = true)
    public UserResponse getCurrentUser(Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new UnauthorizedException(ErrorCode.USER_NOT_FOUND, "User not found"));
        return UserMapper.toResponse(user);
    }

    private AuthResponse issueTokens(User user) {
        UserPrincipal principal = new UserPrincipal(user);
        String accessToken = jwtService.generateAccessToken(principal);

        String rawRefreshToken = generateOpaqueToken();
        RefreshToken refreshToken = RefreshToken.builder()
                .user(user)
                .tokenHash(hash(rawRefreshToken))
                .expiresAt(Instant.now().plusMillis(properties.jwt().refreshTokenExpirationMs()))
                .revoked(false)
                .build();
        refreshTokenRepository.save(refreshToken);

        return AuthResponse.of(accessToken, rawRefreshToken, properties.jwt().accessTokenExpirationMs(), UserMapper.toResponse(user));
    }

    private String generateOpaqueToken() {
        byte[] bytes = new byte[48];
        SECURE_RANDOM.nextBytes(bytes);
        return Base64.getUrlEncoder().withoutPadding().encodeToString(bytes);
    }

    private String hash(String value) {
        try {
            MessageDigest digest = MessageDigest.getInstance("SHA-256");
            byte[] hashed = digest.digest(value.getBytes(StandardCharsets.UTF_8));
            return Base64.getUrlEncoder().withoutPadding().encodeToString(hashed);
        } catch (NoSuchAlgorithmException e) {
            throw new IllegalStateException("SHA-256 not available", e);
        }
    }
}
