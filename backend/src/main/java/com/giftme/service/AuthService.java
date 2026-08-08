package com.giftme.service;

import com.giftme.dto.auth.AuthResponse;
import com.giftme.dto.auth.LoginRequest;
import com.giftme.dto.auth.RefreshRequest;
import com.giftme.dto.auth.RegisterRequest;
import com.giftme.dto.auth.UserResponse;

public interface AuthService {

    AuthResponse register(RegisterRequest request);

    AuthResponse login(LoginRequest request);

    AuthResponse refresh(RefreshRequest request);

    UserResponse getCurrentUser(Long userId);
}
