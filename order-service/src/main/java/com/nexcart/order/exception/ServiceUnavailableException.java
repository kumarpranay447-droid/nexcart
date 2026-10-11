package com.nexcart.order.exception;

/** Thrown when user-service cannot be reached - mapped to HTTP 503. */
public class ServiceUnavailableException extends RuntimeException {

    public ServiceUnavailableException(String message) {
        super(message);
    }
}
