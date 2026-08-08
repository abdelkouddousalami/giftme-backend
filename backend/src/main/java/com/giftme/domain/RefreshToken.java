package com.giftme.domain;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import java.time.Instant;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.EqualsAndHashCode;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import lombok.ToString;

/**
 * Opaque refresh tokens are stored server-side as a SHA-256 hash (never the raw
 * value) so a compromised database dump cannot be replayed as a valid token, and
 * individual tokens can be revoked (logout, rotation) without invalidating a JWT
 * signing key used by every session.
 */
@Entity
@Table(name = "refresh_tokens", indexes = {
        @jakarta.persistence.Index(name = "idx_refresh_token_hash", columnList = "token_hash", unique = true)
})
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@EqualsAndHashCode(callSuper = true)
@ToString(of = {"expiresAt", "revoked"})
public class RefreshToken extends BaseEntity {

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @Column(name = "token_hash", nullable = false, unique = true)
    private String tokenHash;

    @Column(nullable = false)
    private Instant expiresAt;

    @Builder.Default
    @Column(nullable = false)
    private boolean revoked = false;

    public boolean isValid() {
        return !revoked && expiresAt.isAfter(Instant.now());
    }
}
