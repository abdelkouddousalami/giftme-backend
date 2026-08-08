package com.giftme.dto.dashboard;

import java.math.BigDecimal;

public record TopProductResponse(
        Long productId,
        String productName,
        long totalQuantitySold,
        BigDecimal totalRevenue
) {
}
