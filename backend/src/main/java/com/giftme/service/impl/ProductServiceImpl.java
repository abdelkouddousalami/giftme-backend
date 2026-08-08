package com.giftme.service.impl;

import com.giftme.common.exception.ConflictException;
import com.giftme.common.exception.ErrorCode;
import com.giftme.common.exception.ResourceNotFoundException;
import com.giftme.common.response.PagedResponse;
import com.giftme.common.util.SlugUtils;
import com.giftme.domain.Product;
import com.giftme.dto.product.ProductRequest;
import com.giftme.dto.product.ProductResponse;
import com.giftme.dto.product.ProductStatusRequest;
import com.giftme.mapper.ProductMapper;
import com.giftme.repository.ProductRepository;
import com.giftme.repository.ProductSpecifications;
import com.giftme.service.ProductService;
import java.util.ArrayList;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;

@Service
@RequiredArgsConstructor
public class ProductServiceImpl implements ProductService {

    private final ProductRepository productRepository;

    @Override
    @Transactional(readOnly = true)
    public PagedResponse<ProductResponse> list(String category, String search, Pageable pageable) {
        // Public catalog listing only ever shows active products - inactive products are
        // still reachable by direct id/slug lookup (used by admin edit screens).
        Page<Product> page = productRepository.findAll(
                ProductSpecifications.withFilters(category, true, search), pageable);
        return PagedResponse.of(page, ProductMapper::toResponse);
    }

    @Override
    @Transactional(readOnly = true)
    public ProductResponse getById(Long id) {
        return ProductMapper.toResponse(findById(id));
    }

    @Override
    @Transactional(readOnly = true)
    public ProductResponse getBySlug(String slug) {
        Product product = productRepository.findBySlug(slug)
                .orElseThrow(() -> new ResourceNotFoundException(ErrorCode.PRODUCT_NOT_FOUND, "Product not found: " + slug));
        return ProductMapper.toResponse(product);
    }

    @Override
    @Transactional
    public ProductResponse create(ProductRequest request) {
        String slug = resolveSlug(request.slug(), request.name(), null);

        Product product = Product.builder()
                .name(request.name())
                .slug(slug)
                .description(request.description())
                .shortDescription(request.shortDescription())
                .price(request.price())
                .category(request.category())
                .stock(request.stock())
                .active(request.active() == null || request.active())
                .mainImage(request.mainImage())
                .galleryImages(request.galleryImages() != null ? new ArrayList<>(request.galleryImages()) : new ArrayList<>())
                .customizationEnabled(request.customizationEnabled() != null && request.customizationEnabled())
                .build();

        productRepository.save(product);
        return ProductMapper.toResponse(product);
    }

    @Override
    @Transactional
    public ProductResponse update(Long id, ProductRequest request) {
        Product product = findById(id);
        String slug = resolveSlug(request.slug(), request.name(), id);

        product.setName(request.name());
        product.setSlug(slug);
        product.setDescription(request.description());
        product.setShortDescription(request.shortDescription());
        product.setPrice(request.price());
        product.setCategory(request.category());
        product.setStock(request.stock());
        if (request.active() != null) {
            product.setActive(request.active());
        }
        product.setMainImage(request.mainImage());
        if (request.galleryImages() != null) {
            product.setGalleryImages(new ArrayList<>(request.galleryImages()));
        }
        if (request.customizationEnabled() != null) {
            product.setCustomizationEnabled(request.customizationEnabled());
        }

        return ProductMapper.toResponse(product);
    }

    @Override
    @Transactional
    public void delete(Long id) {
        Product product = findById(id);
        // Hard delete is intentionally blocked at the DB level (FK from order_items) if the
        // product was ever ordered - see V1__init_schema.sql. Admins should deactivate
        // (PATCH .../status) products with order history instead.
        productRepository.delete(product);
    }

    @Override
    @Transactional
    public ProductResponse updateStatus(Long id, ProductStatusRequest request) {
        Product product = findById(id);
        product.setActive(request.active());
        return ProductMapper.toResponse(product);
    }

    private Product findById(Long id) {
        return productRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException(ErrorCode.PRODUCT_NOT_FOUND, "Product not found: " + id));
    }

    private String resolveSlug(String requestedSlug, String name, Long excludeId) {
        String base = StringUtils.hasText(requestedSlug) ? SlugUtils.slugify(requestedSlug) : SlugUtils.slugify(name);
        if (!StringUtils.hasText(base)) {
            base = "product";
        }

        String candidate = base;
        int suffix = 1;
        while (excludeId == null ? productRepository.existsBySlug(candidate)
                : productRepository.existsBySlugAndIdNot(candidate, excludeId)) {
            suffix++;
            candidate = base + "-" + suffix;
        }
        return candidate;
    }
}
