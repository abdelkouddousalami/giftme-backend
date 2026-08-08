package com.giftme.config;

import io.swagger.v3.oas.models.Components;
import io.swagger.v3.oas.models.OpenAPI;
import io.swagger.v3.oas.models.info.Contact;
import io.swagger.v3.oas.models.info.Info;
import io.swagger.v3.oas.models.security.SecurityScheme;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class OpenApiConfig {

    private static final String BEARER_SCHEME = "bearerAuth";

    @Bean
    public OpenAPI giftMeOpenApi() {
        return new OpenAPI()
                .info(new Info()
                        .title("GiftMe API")
                        .description("REST API for the GiftMe personalized gifts e-commerce platform: "
                                + "catalog, guest/authenticated COD checkout, order tracking, QR memory pages and the admin dashboard.")
                        .version("v1")
                        .contact(new Contact().name("GiftMe").url("https://giftme.ma")))
                .components(new Components()
                        .addSecuritySchemes(BEARER_SCHEME, new SecurityScheme()
                                .name(BEARER_SCHEME)
                                .type(SecurityScheme.Type.HTTP)
                                .scheme("bearer")
                                .bearerFormat("JWT")
                                .description("Paste the accessToken returned by /api/auth/login or /api/auth/register.")));
    }
}
