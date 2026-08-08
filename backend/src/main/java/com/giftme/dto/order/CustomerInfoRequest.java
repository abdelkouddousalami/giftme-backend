package com.giftme.dto.order;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record CustomerInfoRequest(
        @NotBlank(message = "Customer name is required")
        @Size(max = 255)
        String name,

        @NotBlank(message = "Phone is required")
        @Size(max = 30)
        String phone,

        @Email(message = "Email must be valid")
        String email
) {
}
