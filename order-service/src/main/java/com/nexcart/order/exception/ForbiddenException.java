package com.nexcart.order.exception;

/** Thrown on illegal order state transitions - mapped to HTTP 403. */
public class ForbiddenException extends RuntimeException {

    public ForbiddenException(String message) {
        super(message);
    }
}
