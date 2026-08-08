package com.giftme.dto.dashboard;

import java.math.BigDecimal;

public record DashboardStatsResponse(
        long totalOrders,
        long pendingOrders,
        long confirmedOrders,
        long preparingOrders,
        long shippedOrders,
        long deliveredOrders,
        long cancelledOrders,
        BigDecimal totalRevenue,
        long todayOrders,
        BigDecimal todayRevenue,
        long totalCustomers,
        long totalProducts
) {
}
