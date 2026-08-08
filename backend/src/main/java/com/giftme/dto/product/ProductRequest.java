package com.giftme.dto.product;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.PositiveOrZero;
import jakarta.validation.constraints.Size;
import java.math.BigDecimal;
import java.util.List;

public record ProductRequest(
        @NotBlank(message = "Name is required")
        @Size(max = 255)
        String name,

        @Size(max = 255, message = "Slug must be at most 255 characters")
        String slug,

        String description,

        @Size(max = 500)
        String shortDescription,

        @NotNull(message = "Price is required")
        @DecimalMin(value = "0.0", message = "Price must not be negative")
        BigDecimal price,

        @Size(max = 100)
        String category,

        @NotNull(message = "Stock is required")
        @PositiveOrZero(message = "Stock must not be negative")
        Integer stock,

        Boolean active,

        String mainImage,

        List<String> galleryImages,

        Boolean customizationEnabled
) {
}
