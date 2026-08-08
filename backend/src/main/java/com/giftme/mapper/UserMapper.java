package com.giftme.mapper;

import com.giftme.domain.User;
import com.giftme.dto.auth.UserResponse;

public final class UserMapper {

    private UserMapper() {
    }

    public static UserResponse toResponse(User user) {
        return new UserResponse(
                user.getId(),
                user.getFullName(),
                user.getEmail(),
                user.getPhone(),
                user.getRole().name()
        );
    }
}
