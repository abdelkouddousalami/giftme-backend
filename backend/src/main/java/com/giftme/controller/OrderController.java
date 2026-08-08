package com.giftme.controller;

import com.giftme.common.response.ApiResponse;
import com.giftme.dto.order.CreateOrderRequest;
import com.giftme.dto.order.OrderResponse;
import com.giftme.security.UserPrincipal;
import com.giftme.service.OrderService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/orders")
@RequiredArgsConstructor
@Tag(name = "Orders", description = "Order creation - no authentication required (guest COD checkout)")
public class OrderController {

    private final OrderService orderService;

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    @Operation(summary = "Place an order", description = "Works with or without an account. All prices, delivery fee and totals are computed server-side and any client-supplied amounts are ignored.")
    public ApiResponse<OrderResponse> create(@Valid @RequestBody CreateOrderRequest request,
            @AuthenticationPrincipal UserPrincipal principal) {
        Long userId = (principal != null && "CUSTOMER".equals(principal.getRole())) ? principal.getId() : null;
        return ApiResponse.success(orderService.createOrder(request, userId), "Order placed successfully");
    }
}
