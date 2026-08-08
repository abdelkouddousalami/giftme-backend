package com.giftme.controller;

import com.giftme.common.response.ApiResponse;
import com.giftme.dto.product.ProductRequest;
import com.giftme.dto.product.ProductResponse;
import com.giftme.dto.product.ProductStatusRequest;
import com.giftme.service.ProductService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/admin/products")
@RequiredArgsConstructor
@Tag(name = "Admin - Products", description = "Product management - requires ADMIN role")
@SecurityRequirement(name = "bearerAuth")
public class AdminProductController {

    private final ProductService productService;

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    @Operation(summary = "Create a product")
    public ApiResponse<ProductResponse> create(@Valid @RequestBody ProductRequest request) {
        return ApiResponse.success(productService.create(request), "Product created");
    }

    @PutMapping("/{id}")
    @Operation(summary = "Replace a product")
    public ApiResponse<ProductResponse> update(@PathVariable Long id, @Valid @RequestBody ProductRequest request) {
        return ApiResponse.success(productService.update(id, request), "Product updated");
    }

    @DeleteMapping("/{id}")
    @Operation(summary = "Delete a product", description = "Blocked at the database level if the product has order history; deactivate it instead.")
    public ApiResponse<Void> delete(@PathVariable Long id) {
        productService.delete(id);
        return ApiResponse.success(null, "Product deleted");
    }

    @PatchMapping("/{id}/status")
    @Operation(summary = "Activate or deactivate a product")
    public ApiResponse<ProductResponse> updateStatus(@PathVariable Long id, @Valid @RequestBody ProductStatusRequest request) {
        return ApiResponse.success(productService.updateStatus(id, request), "Product status updated");
    }
}
