package com.giftme.dto.auth;

import jakarta.validation.constraints.NotBlank;

/**
 * Not @Email-validated on purpose: the stored identifier (User.email) is usually a real
 * email for self-registered customers, but admin accounts are seeded directly and don't
 * need to look like one (e.g. a short login name). Login just needs to match whatever
 * string is on file - registration (RegisterRequest) still enforces a real email format,
 * since a customer's email may be used for future order notifications.
 */
public record LoginRequest(
        @NotBlank(message = "Email is required")
        String email,

        @NotBlank(message = "Password is required")
        String password
) {
}
