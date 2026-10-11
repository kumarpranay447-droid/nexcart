package com.nexcart.user;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

/**
 * NexCart user service. Owns identity: registration, login, JWT issuance
 * and the authenticated {@code /me} profile endpoint that other services
 * (e.g. order-service) use to validate callers.
 */
@SpringBootApplication
public class UserServiceApplication {

    public static void main(String[] args) {
        SpringApplication.run(UserServiceApplication.class, args);
    }
}
