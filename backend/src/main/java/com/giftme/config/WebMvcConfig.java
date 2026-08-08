package com.giftme.config;

import java.nio.file.Path;
import lombok.RequiredArgsConstructor;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.ResourceHandlerRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

/** Serves locally-stored uploads (product/customization/memory media) as static files under /uploads/**. */
@Configuration
@RequiredArgsConstructor
public class WebMvcConfig implements WebMvcConfigurer {

    private final GiftMeProperties properties;

    @Override
    public void addResourceHandlers(ResourceHandlerRegistry registry) {
        Path basePath = Path.of(properties.storage().local().basePath()).toAbsolutePath().normalize();
        registry.addResourceHandler("/uploads/**")
                .addResourceLocations("file:" + basePath + "/");
    }
}
