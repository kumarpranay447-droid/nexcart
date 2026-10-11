package com.nexcart.order.exception;

/** Thrown when the caller's JWT is invalid or expired - mapped to HTTP 401. */
public class UnauthorizedException extends RuntimeException {

    public UnauthorizedException(String message) {
        super(message);
    }
}
