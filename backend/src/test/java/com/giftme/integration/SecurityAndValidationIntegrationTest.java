package com.giftme.integration;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.giftme.domain.User;
import com.giftme.domain.enums.Role;
import com.giftme.dto.auth.LoginRequest;
import com.giftme.repository.UserRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.MvcResult;
import org.springframework.transaction.annotation.Transactional;

/**
 * End-to-end coverage across the real Spring Security filter chain and
 * GlobalExceptionHandler - things Mockito-based service unit tests can't verify:
 * that /api/admin/** actually rejects anonymous/wrong-role callers with the right
 * status codes, that public endpoints stay public, and that bad input produces the
 * documented ApiResponse error envelope end to end.
 */
@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
@Transactional
class SecurityAndValidationIntegrationTest {

    private static final String ADMIN_EMAIL = "admin@test.giftme.ma";
    private static final String ADMIN_PASSWORD = "Admin@12345";
    private static final String CUSTOMER_EMAIL = "customer@test.giftme.ma";
    private static final String CUSTOMER_PASSWORD = "Customer@12345";

    @Autowired
    private MockMvc mockMvc;
    @Autowired
    private UserRepository userRepository;
    @Autowired
    private PasswordEncoder passwordEncoder;
    @Autowired
    private ObjectMapper objectMapper;

    @BeforeEach
    void seedUsers() {
        userRepository.save(User.builder()
                .email(ADMIN_EMAIL).fullName("Test Admin")
                .passwordHash(passwordEncoder.encode(ADMIN_PASSWORD))
                .role(Role.ADMIN).enabled(true).build());
        userRepository.save(User.builder()
                .email(CUSTOMER_EMAIL).fullName("Test Customer")
                .passwordHash(passwordEncoder.encode(CUSTOMER_PASSWORD))
                .role(Role.CUSTOMER).enabled(true).build());
    }

    @Test
    void adminEndpoint_withoutToken_returns401() throws Exception {
        mockMvc.perform(get("/api/admin/dashboard/stats"))
                .andExpect(status().isUnauthorized())
                .andExpect(jsonPath("$.success").value(false))
                .andExpect(jsonPath("$.code").value("AUTHENTICATION_REQUIRED"));
    }

    @Test
    void adminEndpoint_withCustomerToken_returns403() throws Exception {
        String token = loginAndGetAccessToken(CUSTOMER_EMAIL, CUSTOMER_PASSWORD);

        mockMvc.perform(get("/api/admin/dashboard/stats").header("Authorization", "Bearer " + token))
                .andExpect(status().isForbidden())
                .andExpect(jsonPath("$.success").value(false))
                .andExpect(jsonPath("$.code").value("ACCESS_DENIED"));
    }

    @Test
    void adminEndpoint_withAdminToken_succeeds() throws Exception {
        String token = loginAndGetAccessToken(ADMIN_EMAIL, ADMIN_PASSWORD);

        mockMvc.perform(get("/api/admin/dashboard/stats").header("Authorization", "Bearer " + token))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.totalProducts").isNumber());
    }

    @Test
    void productCatalog_isPubliclyReachable_withoutAnyToken() throws Exception {
        mockMvc.perform(get("/api/products"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true));
    }

    @Test
    void unknownProductId_returns404WithApiErrorEnvelope() throws Exception {
        mockMvc.perform(get("/api/products/999999"))
                .andExpect(status().isNotFound())
                .andExpect(jsonPath("$.success").value(false))
                .andExpect(jsonPath("$.code").value("PRODUCT_NOT_FOUND"))
                .andExpect(jsonPath("$.timestamp").exists())
                .andExpect(jsonPath("$.path").value("/api/products/999999"));
    }

    @Test
    void createOrder_missingRequiredFields_returns400WithValidationError() throws Exception {
        // Empty body: fails @NotNull/@NotEmpty on customer/shipping/items/paymentMethod.
        mockMvc.perform(post("/api/orders")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{}"))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.success").value(false))
                .andExpect(jsonPath("$.code").value("VALIDATION_ERROR"));
    }

    @Test
    void register_passwordTooShort_returns400() throws Exception {
        String body = """
                {"fullName":"Test User","email":"newuser@test.giftme.ma","phone":"+212600000000","password":"short"}
                """;

        mockMvc.perform(post("/api/auth/register")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(body))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.code").value("VALIDATION_ERROR"));
    }

    @Test
    void login_wrongPassword_returns401WithInvalidCredentialsCode() throws Exception {
        mockMvc.perform(post("/api/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(new LoginRequest(ADMIN_EMAIL, "wrong-password"))))
                .andExpect(status().isUnauthorized())
                .andExpect(jsonPath("$.code").value("INVALID_CREDENTIALS"));
    }

    private String loginAndGetAccessToken(String email, String password) throws Exception {
        MvcResult result = mockMvc.perform(post("/api/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(new LoginRequest(email, password))))
                .andExpect(status().isOk())
                .andReturn();

        JsonNode json = objectMapper.readTree(result.getResponse().getContentAsString());
        return json.get("data").get("accessToken").asText();
    }
}
