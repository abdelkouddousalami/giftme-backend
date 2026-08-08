package com.giftme.repository;

import com.giftme.domain.Memory;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;

public interface MemoryRepository extends JpaRepository<Memory, Long> {

    Optional<Memory> findByPublicCode(String publicCode);

    boolean existsByPublicCode(String publicCode);
}
