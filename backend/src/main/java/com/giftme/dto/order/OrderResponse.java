package com.giftme.dto.order;

import java.math.BigDecimal;
import java.time.Instant;
import java.time.LocalDate;
import java.util.List;

public record OrderResponse(
        Long id,
        String orderNumber,
        String trackingCode,
        String customerName,
        String phone,
        String email,
        String city,
        String address,
        String notes,
        List<OrderItemResponse> items,
        BigDecimal subtotal,
        BigDecimal deliveryFee,
        BigDecimal total,
        String paymentMethod,
        String paymentStatus,
        String orderStatus,
        LocalDate estimatedDelivery,
        Instant createdAt,
        Instant updatedAt
) {
}
