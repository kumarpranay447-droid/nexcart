package com.nexcart.order;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

/**
 * NexCart order service. Owns order lifecycle (create, read, status
 * updates). Every request is authenticated by calling user-service's
 * {@code GET /api/users/me} with the caller's JWT - a 200 response proves
 * the token is valid and identifies the owner of the order.
 */
@SpringBootApplication
public class OrderServiceApplication {

    public static void main(String[] args) {
        SpringApplication.run(OrderServiceApplication.class, args);
    }
}
