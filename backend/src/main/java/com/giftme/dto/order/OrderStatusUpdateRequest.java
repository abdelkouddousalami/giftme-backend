package com.giftme.dto.order;

import com.giftme.domain.enums.OrderStatus;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

public record OrderStatusUpdateRequest(
        @NotNull(message = "status is required")
        OrderStatus status,

        @Size(max = 500)
        String adminNote
) {
}
