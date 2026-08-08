package com.giftme.service;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import com.giftme.common.exception.ConflictException;
import com.giftme.common.exception.UnauthorizedException;
import com.giftme.config.GiftMeProperties;
import com.giftme.domain.RefreshToken;
import com.giftme.domain.User;
import com.giftme.domain.enums.Role;
import com.giftme.dto.auth.AuthResponse;
import com.giftme.dto.auth.LoginRequest;
import com.giftme.dto.auth.RefreshRequest;
import com.giftme.dto.auth.RegisterRequest;
import com.giftme.repository.RefreshTokenRepository;
import com.giftme.repository.UserRepository;
import com.giftme.security.JwtService;
import com.giftme.service.impl.AuthServiceImpl;
import java.math.BigDecimal;
import java.time.Instant;
import java.util.List;
import java.util.Optional;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.crypto.password.PasswordEncoder;

@ExtendWith(MockitoExtension.class)
class AuthServiceImplTest {

    @Mock
    private UserRepository userRepository;
    @Mock
    private RefreshTokenRepository refreshTokenRepository;
    @Mock
    private PasswordEncoder passwordEncoder;
    @Mock
    private AuthenticationManager authenticationManager;
    @Mock
    private JwtService jwtService;

    private AuthServiceImpl authService;

    @BeforeEach
    void setUp() {
        GiftMeProperties properties = new GiftMeProperties(
                new GiftMeProperties.Jwt("secret", 900000, 1209600000),
                new GiftMeProperties.Cors(List.of("http://localhost:3000")),
                new GiftMeProperties.Storage("local", new GiftMeProperties.Storage.Local("./storage"), "/uploads",
                        new GiftMeProperties.Storage.Limits(5_000_000, 50_000_000, 20_000_000)),
                new GiftMeProperties.Order(new BigDecimal("30.00"), new BigDecimal("500.00")),
                "https://giftme.ma"
        );
        authService = new AuthServiceImpl(userRepository, refreshTokenRepository, passwordEncoder,
                authenticationManager, jwtService, properties);
    }

    @Test
    void register_duplicateEmail_isRejected() {
        when(userRepository.existsByEmailIgnoreCase("taken@example.com")).thenReturn(true);

        RegisterRequest request = new RegisterRequest("Someone", "taken@example.com", null, "password123");

        assertThatThrownBy(() -> authService.register(request)).isInstanceOf(ConflictException.class);
        verify(userRepository, org.mockito.Mockito.never()).save(any());
    }

    @Test
    void register_success_alwaysCreatesCustomerRole_neverAdmin() {
        when(userRepository.existsByEmailIgnoreCase(anyString())).thenReturn(false);
        when(passwordEncoder.encode("password123")).thenReturn("hashed");
        when(jwtService.generateAccessToken(any())).thenReturn("access-token");

        RegisterRequest request = new RegisterRequest("Sara Amrani", "sara@example.com", "+212600000001", "password123");
        AuthResponse response = authService.register(request);

        ArgumentCaptor<User> userCaptor = ArgumentCaptor.forClass(User.class);
        verify(userRepository).save(userCaptor.capture());
        assertThat(userCaptor.getValue().getRole()).isEqualTo(Role.CUSTOMER);
        assertThat(userCaptor.getValue().getPasswordHash()).isEqualTo("hashed");
        assertThat(response.accessToken()).isEqualTo("access-token");
        assertThat(response.user().role()).isEqualTo("CUSTOMER");
        verify(refreshTokenRepository).save(any(RefreshToken.class));
    }

    @Test
    void refresh_unknownToken_isRejected() {
        when(refreshTokenRepository.findByTokenHash(anyString())).thenReturn(Optional.empty());

        assertThatThrownBy(() -> authService.refresh(new RefreshRequest("does-not-exist")))
                .isInstanceOf(UnauthorizedException.class);
    }

    @Test
    void refresh_expiredToken_isRejected() {
        User user = User.builder().email("a@b.com").fullName("A").passwordHash("x").role(Role.CUSTOMER).enabled(true).build();
        RefreshToken expired = RefreshToken.builder().user(user).tokenHash("hash").expiresAt(Instant.now().minusSeconds(10)).revoked(false).build();
        when(refreshTokenRepository.findByTokenHash(anyString())).thenReturn(Optional.of(expired));

        assertThatThrownBy(() -> authService.refresh(new RefreshRequest("some-token")))
                .isInstanceOf(UnauthorizedException.class);
    }

    @Test
    void refresh_valid_rotatesToken_revokingThePresentedOne() {
        User user = User.builder().email("a@b.com").fullName("A").passwordHash("x").role(Role.CUSTOMER).enabled(true).build();
        RefreshToken existing = RefreshToken.builder().user(user).tokenHash("hash").expiresAt(Instant.now().plusSeconds(3600)).revoked(false).build();
        when(refreshTokenRepository.findByTokenHash(anyString())).thenReturn(Optional.of(existing));
        when(jwtService.generateAccessToken(any())).thenReturn("new-access-token");

        AuthResponse response = authService.refresh(new RefreshRequest("some-token"));

        assertThat(existing.isRevoked()).isTrue();
        assertThat(response.accessToken()).isEqualTo("new-access-token");
        assertThat(response.refreshToken()).isNotBlank();
        verify(refreshTokenRepository, org.mockito.Mockito.times(2)).save(any(RefreshToken.class)); // revoke old + save new
    }
}
