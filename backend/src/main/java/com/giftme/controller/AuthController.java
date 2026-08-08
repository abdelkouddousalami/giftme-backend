package com.giftme.controller;

import com.giftme.common.response.ApiResponse;
import com.giftme.dto.auth.AuthResponse;
import com.giftme.dto.auth.LoginRequest;
import com.giftme.dto.auth.RefreshRequest;
import com.giftme.dto.auth.RegisterRequest;
import com.giftme.dto.auth.UserResponse;
import com.giftme.security.UserPrincipal;
import com.giftme.service.AuthService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
@Tag(name = "Authentication", description = "Registration, login and JWT session management for both admins and customers")
public class AuthController {

    private final AuthService authService;

    @PostMapping("/register")
    @ResponseStatus(HttpStatus.CREATED)
    @Operation(summary = "Register a customer account", description = "Always creates a CUSTOMER account; admin accounts are seeded, never self-registered.")
    public ApiResponse<AuthResponse> register(@Valid @RequestBody RegisterRequest request) {
        return ApiResponse.success(authService.register(request), "Account created");
    }

    @PostMapping("/login")
    @Operation(summary = "Log in", description = "Works for both ADMIN and CUSTOMER accounts; the returned JWT carries the role.")
    public ApiResponse<AuthResponse> login(@Valid @RequestBody LoginRequest request) {
        return ApiResponse.success(authService.login(request), "Login successful");
    }

    @PostMapping("/refresh")
    @Operation(summary = "Exchange a refresh token for a new access token", description = "Rotates the refresh token; the old one is revoked.")
    public ApiResponse<AuthResponse> refresh(@Valid @RequestBody RefreshRequest request) {
        return ApiResponse.success(authService.refresh(request), "Token refreshed");
    }

    @GetMapping("/me")
    @Operation(summary = "Get the current authenticated user")
    public ApiResponse<UserResponse> me(@AuthenticationPrincipal UserPrincipal principal) {
        return ApiResponse.success(authService.getCurrentUser(principal.getId()));
    }
}
