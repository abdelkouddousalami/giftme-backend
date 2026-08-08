package com.giftme;

import com.giftme.config.GiftMeProperties;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.boot.context.properties.EnableConfigurationProperties;
import org.springframework.data.jpa.repository.config.EnableJpaAuditing;

@SpringBootApplication
@EnableJpaAuditing
@EnableConfigurationProperties(GiftMeProperties.class)
public class GiftMeApplication {

    public static void main(String[] args) {
        SpringApplication.run(GiftMeApplication.class, args);
    }
}
