package com.giftme.repository;

import com.giftme.domain.RefreshToken;
import com.giftme.domain.User;
import java.time.Instant;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface RefreshTokenRepository extends JpaRepository<RefreshToken, Long> {

    Optional<RefreshToken> findByTokenHash(String tokenHash);

    @Modifying
    @Query("UPDATE RefreshToken r SET r.revoked = true WHERE r.user = :user AND r.revoked = false")
    void revokeAllForUser(@Param("user") User user);

    @Modifying
    @Query("DELETE FROM RefreshToken r WHERE r.expiresAt < :cutoff")
    void deleteExpiredBefore(@Param("cutoff") Instant cutoff);
}
