package com.giftme.dto.auth;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

/**
 * Public self-registration always creates a CUSTOMER account - there is deliberately
 * no "role" field here, so a crafted request can never self-elevate to ADMIN.
 */
public record RegisterRequest(
        @NotBlank(message = "Full name is required")
        @Size(max = 255)
        String fullName,

        @NotBlank(message = "Email is required")
        @Email(message = "Email must be valid")
        String email,

        @Size(max = 30)
        String phone,

        @NotBlank(message = "Password is required")
        @Size(min = 8, max = 100, message = "Password must be at least 8 characters")
        String password
) {
}
