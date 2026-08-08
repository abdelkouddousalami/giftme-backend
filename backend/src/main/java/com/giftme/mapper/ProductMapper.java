package com.giftme.mapper;

import com.giftme.domain.Product;
import com.giftme.dto.product.ProductResponse;
import java.util.List;

public final class ProductMapper {

    private ProductMapper() {
    }

    public static ProductResponse toResponse(Product product) {
        return new ProductResponse(
                product.getId(),
                product.getName(),
                product.getSlug(),
                product.getDescription(),
                product.getShortDescription(),
                product.getPrice(),
                product.getCategory(),
                product.getStock(),
                product.isActive(),
                product.getMainImage(),
                // Copy out of the Hibernate-managed PersistentBag - Jackson can't serialize it
                // directly (it isn't a plain List and carries a back-reference to the session).
                List.copyOf(product.getGalleryImages()),
                product.isCustomizationEnabled(),
                product.getCreatedAt(),
                product.getUpdatedAt()
        );
    }
}
