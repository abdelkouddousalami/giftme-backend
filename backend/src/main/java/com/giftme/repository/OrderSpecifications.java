package com.giftme.repository;

import com.giftme.domain.Order;
import com.giftme.domain.enums.OrderStatus;
import jakarta.persistence.criteria.Predicate;
import java.time.Instant;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.util.StringUtils;

public final class OrderSpecifications {

    private OrderSpecifications() {
    }

    /** Free-text match across order number, tracking code, customer name and phone. */
    public static Specification<Order> withFilters(String search, OrderStatus status, Instant from, Instant to) {
        return (root, query, cb) -> {
            Predicate predicate = cb.conjunction();

            if (StringUtils.hasText(search)) {
                String like = "%" + search.toLowerCase() + "%";
                predicate = cb.and(predicate, cb.or(
                        cb.like(cb.lower(root.get("orderNumber")), like),
                        cb.like(cb.lower(root.get("trackingCode")), like),
                        cb.like(cb.lower(root.get("customerName")), like),
                        cb.like(cb.lower(root.get("phone")), like)
                ));
            }
            if (status != null) {
                predicate = cb.and(predicate, cb.equal(root.get("orderStatus"), status));
            }
            if (from != null) {
                predicate = cb.and(predicate, cb.greaterThanOrEqualTo(root.get("createdAt"), from));
            }
            if (to != null) {
                predicate = cb.and(predicate, cb.lessThan(root.get("createdAt"), to));
            }
            return predicate;
        };
    }
}
