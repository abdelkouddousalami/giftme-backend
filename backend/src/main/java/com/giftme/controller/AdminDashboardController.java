package com.giftme.controller;

import com.giftme.common.response.ApiResponse;
import com.giftme.dto.dashboard.DashboardStatsResponse;
import com.giftme.dto.dashboard.OrdersChartPointResponse;
import com.giftme.dto.dashboard.TopProductResponse;
import com.giftme.service.DashboardService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import java.time.LocalDate;
import java.util.List;
import lombok.RequiredArgsConstructor;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/admin/dashboard")
@RequiredArgsConstructor
@Validated
@Tag(name = "Admin - Dashboard", description = "Aggregate statistics - requires ADMIN role")
@SecurityRequirement(name = "bearerAuth")
public class AdminDashboardController {

    private final DashboardService dashboardService;

    @GetMapping("/stats")
    @Operation(summary = "Get headline order/revenue/customer/product counters")
    public ApiResponse<DashboardStatsResponse> stats() {
        return ApiResponse.success(dashboardService.getStats());
    }

    @GetMapping("/orders-chart")
    @Operation(summary = "Get daily order counts and revenue", description = "Defaults to the trailing 30 days if from/to are omitted.")
    public ApiResponse<List<OrdersChartPointResponse>> ordersChart(
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate from,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate to) {
        return ApiResponse.success(dashboardService.getOrdersChart(from, to));
    }

    @GetMapping("/top-products")
    @Operation(summary = "Get best-selling products by quantity sold")
    public ApiResponse<List<TopProductResponse>> topProducts(
            @RequestParam(defaultValue = "5") @Min(1) @Max(50) int limit) {
        return ApiResponse.success(dashboardService.getTopProducts(limit));
    }
}
