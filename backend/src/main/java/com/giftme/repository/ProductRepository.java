package com.giftme.repository;

import com.giftme.domain.Product;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface ProductRepository extends JpaRepository<Product, Long>, JpaSpecificationExecutor<Product> {

    Optional<Product> findBySlug(String slug);

    boolean existsBySlug(String slug);

    boolean existsBySlugAndIdNot(String slug, Long id);

    /**
     * Atomic, race-safe stock decrement: only applies if enough stock remains, so concurrent
     * orders for the last few units of a product can never drive stock negative (business rule
     * #12). Returns the number of rows updated (0 means insufficient stock - the caller must
     * treat that as a failure even if an earlier read-check looked fine).
     */
    @Modifying
    @Query("UPDATE Product p SET p.stock = p.stock - :qty WHERE p.id = :id AND p.stock >= :qty")
    int decreaseStock(@Param("id") Long id, @Param("qty") int qty);
}
