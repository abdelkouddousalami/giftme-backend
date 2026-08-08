package com.giftme.service;

import com.giftme.dto.dashboard.DashboardStatsResponse;
import com.giftme.dto.dashboard.OrdersChartPointResponse;
import com.giftme.dto.dashboard.TopProductResponse;
import java.time.LocalDate;
import java.util.List;

public interface DashboardService {

    DashboardStatsResponse getStats();

    /** from/to are inclusive; either may be null, in which case a trailing-30-day default window is used. */
    List<OrdersChartPointResponse> getOrdersChart(LocalDate from, LocalDate to);

    List<TopProductResponse> getTopProducts(int limit);
}
