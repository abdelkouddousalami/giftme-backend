package com.giftme.controller;

import com.giftme.common.response.ApiResponse;
import com.giftme.common.response.PagedResponse;
import com.giftme.dto.customer.CustomerResponse;
import com.giftme.dto.order.AdminOrderSummaryResponse;
import com.giftme.service.CustomerService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/admin/customers")
@RequiredArgsConstructor
@Tag(name = "Admin - Customers", description = "Customer directory - requires ADMIN role")
@SecurityRequirement(name = "bearerAuth")
public class AdminCustomerController {

    private final CustomerService customerService;

    @GetMapping
    @Operation(summary = "List customers", description = "Customers are deduplicated by phone number, not email - see the Customer entity.")
    public ApiResponse<PagedResponse<CustomerResponse>> list(@PageableDefault(size = 20, sort = "createdAt") Pageable pageable) {
        return ApiResponse.success(customerService.list(pageable));
    }

    @GetMapping("/{id}")
    @Operation(summary = "Get a customer by id")
    public ApiResponse<CustomerResponse> getById(@PathVariable Long id) {
        return ApiResponse.success(customerService.getById(id));
    }

    @GetMapping("/{id}/orders")
    @Operation(summary = "List a customer's orders")
    public ApiResponse<PagedResponse<AdminOrderSummaryResponse>> getOrders(@PathVariable Long id,
            @PageableDefault(size = 20, sort = "createdAt") Pageable pageable) {
        return ApiResponse.success(customerService.getOrders(id, pageable));
    }
}
