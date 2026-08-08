package com.giftme.security;

import com.giftme.config.GiftMeProperties;
import io.jsonwebtoken.Claims;
import io.jsonwebtoken.JwtException;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;
import java.nio.charset.StandardCharsets;
import java.util.Date;
import javax.crypto.SecretKey;
import lombok.RequiredArgsConstructor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
public class JwtService {

    private static final Logger log = LoggerFactory.getLogger(JwtService.class);

    private final GiftMeProperties properties;

    private SecretKey signingKey;

    private SecretKey key() {
        if (signingKey == null) {
            signingKey = Keys.hmacShaKeyFor(properties.jwt().secret().getBytes(StandardCharsets.UTF_8));
        }
        return signingKey;
    }

    public String generateAccessToken(UserPrincipal principal) {
        Date now = new Date();
        Date expiry = new Date(now.getTime() + properties.jwt().accessTokenExpirationMs());
        return Jwts.builder()
                .subject(principal.getEmail())
                .claim("userId", principal.getId())
                .claim("role", principal.getRole())
                .issuedAt(now)
                .expiration(expiry)
                .signWith(key())
                .compact();
    }

    public boolean isValid(String token) {
        try {
            parseClaims(token);
            return true;
        } catch (JwtException | IllegalArgumentException ex) {
            log.debug("Rejected JWT: {}", ex.getMessage());
            return false;
        }
    }

    public String extractEmail(String token) {
        return parseClaims(token).getSubject();
    }

    public Long extractUserId(String token) {
        return parseClaims(token).get("userId", Long.class);
    }

    public String extractRole(String token) {
        return parseClaims(token).get("role", String.class);
    }

    private Claims parseClaims(String token) {
        return Jwts.parser()
                .verifyWith((javax.crypto.SecretKey) key())
                .build()
                .parseSignedClaims(token)
                .getPayload();
    }
}
