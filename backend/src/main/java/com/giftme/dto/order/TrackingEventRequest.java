package com.giftme.dto.order;

import com.giftme.domain.enums.OrderStatus;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

public record TrackingEventRequest(
        @NotNull(message = "status is required")
        OrderStatus status,

        @NotBlank(message = "description is required")
        @Size(max = 500)
        String description,

        @Size(max = 500)
        String adminNote
) {
}
