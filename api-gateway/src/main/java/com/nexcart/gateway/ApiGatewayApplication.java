package com.nexcart.gateway;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

/**
 * NexCart API gateway. Single entry point for all clients (the React
 * frontend, mobile apps, etc.). Routes are resolved through Eureka using
 * the {@code lb://service-name} scheme, so downstream instances can scale
 * without any gateway configuration change.
 */
@SpringBootApplication
public class ApiGatewayApplication {

    public static void main(String[] args) {
        SpringApplication.run(ApiGatewayApplication.class, args);
    }
}
