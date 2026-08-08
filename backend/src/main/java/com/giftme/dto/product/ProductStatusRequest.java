package com.giftme.dto.product;

import jakarta.validation.constraints.NotNull;

public record ProductStatusRequest(
        @NotNull(message = "active is required")
        Boolean active
) {
}
