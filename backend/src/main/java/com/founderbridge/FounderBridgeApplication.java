package com.founderbridge;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.boot.context.properties.EnableConfigurationProperties;
import org.springframework.scheduling.annotation.EnableScheduling;

@SpringBootApplication
@EnableScheduling
@EnableConfigurationProperties(AppConfig.class)
public class FounderBridgeApplication {
    public static void main(String[] args) {
        SpringApplication.run(FounderBridgeApplication.class, args);
    }
}
