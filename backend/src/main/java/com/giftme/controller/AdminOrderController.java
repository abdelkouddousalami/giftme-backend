package com.giftme.controller;

import com.giftme.common.response.ApiResponse;
import com.giftme.common.response.PagedResponse;
import com.giftme.domain.enums.OrderStatus;
import com.giftme.dto.order.AdminOrderSummaryResponse;
import com.giftme.dto.order.OrderResponse;
import com.giftme.dto.order.OrderStatusUpdateRequest;
import com.giftme.dto.order.TrackingEventRequest;
import com.giftme.dto.tracking.TrackingResponse;
import com.giftme.service.AdminOrderService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import java.time.Instant;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/admin/orders")
@RequiredArgsConstructor
@Tag(name = "Admin - Orders", description = "Order management - requires ADMIN role")
@SecurityRequirement(name = "bearerAuth")
public class AdminOrderController {

    private final AdminOrderService adminOrderService;

    @GetMapping
    @Operation(summary = "Search orders", description = "Free-text search matches order number, tracking code, customer name or phone; combinable with status and date filters, pagination and sorting.")
    public ApiResponse<PagedResponse<AdminOrderSummaryResponse>> search(
            @RequestParam(required = false) String search,
            @RequestParam(required = false) OrderStatus status,
            @RequestParam(required = false) Instant from,
            @RequestParam(required = false) Instant to,
            @PageableDefault(size = 20, sort = "createdAt") Pageable pageable) {
        return ApiResponse.success(adminOrderService.search(search, status, from, to, pageable));
    }

    @GetMapping("/{id}")
    @Operation(summary = "Get full order detail")
    public ApiResponse<OrderResponse> getById(@PathVariable Long id) {
        return ApiResponse.success(adminOrderService.getById(id));
    }

    @PatchMapping("/{id}/status")
    @Operation(summary = "Change an order's status", description = "Creates a TrackingEvent automatically. CANCELLED and DELIVERED are terminal states.")
    public ApiResponse<OrderResponse> updateStatus(@PathVariable Long id, @Valid @RequestBody OrderStatusUpdateRequest request) {
        return ApiResponse.success(adminOrderService.updateStatus(id, request), "Order status updated");
    }

    @GetMapping("/{id}/tracking")
    @Operation(summary = "Get an order's tracking timeline")
    public ApiResponse<TrackingResponse> getTracking(@PathVariable Long id) {
        return ApiResponse.success(adminOrderService.getTracking(id));
    }

    @PostMapping("/{id}/tracking-events")
    @Operation(summary = "Add a tracking event", description = "Also updates the order's current status to match; use this instead of PATCH .../status when a custom description is needed.")
    public ApiResponse<TrackingResponse> addTrackingEvent(@PathVariable Long id, @Valid @RequestBody TrackingEventRequest request) {
        return ApiResponse.success(adminOrderService.addTrackingEvent(id, request), "Tracking event added");
    }
}
