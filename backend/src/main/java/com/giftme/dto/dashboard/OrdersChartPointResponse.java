package com.giftme.dto.dashboard;

import java.math.BigDecimal;
import java.time.LocalDate;

public record OrdersChartPointResponse(
        LocalDate date,
        long orderCount,
        BigDecimal revenue
) {
}
