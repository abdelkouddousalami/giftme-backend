package com.giftme.repository;

import java.math.BigDecimal;

public interface TopProductProjection {
    Long getProductId();
    String getProductName();
    Long getTotalQuantity();
    BigDecimal getTotalRevenue();
}
