package com.giftme.dto.order;

import java.math.BigDecimal;
import java.time.Instant;

public record AdminOrderSummaryResponse(
        Long id,
        String orderNumber,
        String trackingCode,
        String customerName,
        String phone,
        String city,
        int itemCount,
        BigDecimal total,
        String paymentMethod,
        String paymentStatus,
        String orderStatus,
        Instant createdAt
) {
}
