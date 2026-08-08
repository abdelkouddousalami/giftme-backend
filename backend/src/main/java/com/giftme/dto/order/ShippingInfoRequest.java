package com.giftme.dto.order;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record ShippingInfoRequest(
        @NotBlank(message = "City is required")
        @Size(max = 120)
        String city,

        @NotBlank(message = "Address is required")
        String address,

        String notes
) {
}
