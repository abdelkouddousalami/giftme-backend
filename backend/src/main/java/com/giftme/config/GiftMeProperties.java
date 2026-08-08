package com.giftme.config;

import java.math.BigDecimal;
import java.util.List;
import org.springframework.boot.context.properties.ConfigurationProperties;

@ConfigurationProperties(prefix = "giftme")
public record GiftMeProperties(
        Jwt jwt,
        Cors cors,
        Storage storage,
        Order order,
        String publicBaseUrl
) {

    public record Jwt(String secret, long accessTokenExpirationMs, long refreshTokenExpirationMs) {
    }

    public record Cors(List<String> allowedOrigins) {
    }

    public record Storage(String provider, Local local, String publicBaseUrl, Limits limits) {
        public record Local(String basePath) {
        }

        public record Limits(long imageMaxBytes, long videoMaxBytes, long audioMaxBytes) {
        }
    }

    public record Order(BigDecimal deliveryFeeDefault, BigDecimal deliveryFeeFreeThreshold) {
    }
}
