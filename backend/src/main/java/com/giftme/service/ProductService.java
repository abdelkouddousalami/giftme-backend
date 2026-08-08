package com.giftme.service;

import com.giftme.common.response.PagedResponse;
import com.giftme.dto.product.ProductRequest;
import com.giftme.dto.product.ProductResponse;
import com.giftme.dto.product.ProductStatusRequest;
import org.springframework.data.domain.Pageable;

public interface ProductService {

    PagedResponse<ProductResponse> list(String category, String search, Pageable pageable);

    ProductResponse getById(Long id);

    ProductResponse getBySlug(String slug);

    ProductResponse create(ProductRequest request);

    ProductResponse update(Long id, ProductRequest request);

    void delete(Long id);

    ProductResponse updateStatus(Long id, ProductStatusRequest request);
}
