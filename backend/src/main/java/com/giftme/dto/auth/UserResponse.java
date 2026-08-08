package com.giftme.dto.auth;

public record UserResponse(
        Long id,
        String fullName,
        String email,
        String phone,
        String role
) {
}
