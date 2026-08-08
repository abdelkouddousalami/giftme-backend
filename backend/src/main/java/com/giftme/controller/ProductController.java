package com.giftme.controller;

import com.giftme.common.response.ApiResponse;
import com.giftme.common.response.PagedResponse;
import com.giftme.dto.product.ProductResponse;
import com.giftme.service.ProductService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/products")
@RequiredArgsConstructor
@Tag(name = "Products", description = "Public product catalog - no authentication required")
public class ProductController {

    private final ProductService productService;

    @GetMapping
    @Operation(summary = "List active products", description = "Supports pagination, sorting and optional category/search filters.")
    public ApiResponse<PagedResponse<ProductResponse>> list(
            @RequestParam(required = false) String category,
            @RequestParam(required = false) String search,
            @PageableDefault(size = 20, sort = "createdAt") Pageable pageable) {
        return ApiResponse.success(productService.list(category, search, pageable));
    }

    @GetMapping("/{id}")
    @Operation(summary = "Get a product by id")
    public ApiResponse<ProductResponse> getById(@PathVariable Long id) {
        return ApiResponse.success(productService.getById(id));
    }

    @GetMapping("/slug/{slug}")
    @Operation(summary = "Get a product by slug")
    public ApiResponse<ProductResponse> getBySlug(@PathVariable String slug) {
        return ApiResponse.success(productService.getBySlug(slug));
    }
}
