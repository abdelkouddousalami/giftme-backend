package com.giftme.dto.order;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;

public record OrderItemRequest(
        @NotNull(message = "productId is required")
        Long productId,

        @NotNull(message = "quantity is required")
        @Positive(message = "quantity must be greater than zero")
        Integer quantity,

        @Valid
        CustomizationRequest customization
) {
}
