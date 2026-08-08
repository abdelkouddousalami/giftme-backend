package com.giftme.dto.customer;

import java.math.BigDecimal;
import java.time.Instant;

public record CustomerResponse(
        Long id,
        String name,
        String phone,
        String email,
        long totalOrders,
        BigDecimal totalSpent,
        Instant createdAt
) {
}
