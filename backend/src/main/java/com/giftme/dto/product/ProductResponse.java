package com.giftme.dto.product;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.List;

public record ProductResponse(
        Long id,
        String name,
        String slug,
        String description,
        String shortDescription,
        BigDecimal price,
        String category,
        Integer stock,
        boolean active,
        String mainImage,
        List<String> galleryImages,
        boolean customizationEnabled,
        Instant createdAt,
        Instant updatedAt
) {
}
