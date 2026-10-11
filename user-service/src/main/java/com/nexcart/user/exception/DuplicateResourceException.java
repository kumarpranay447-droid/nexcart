package com.nexcart.user.exception;

/** Thrown on duplicate username/email registration - mapped to HTTP 409. */
public class DuplicateResourceException extends RuntimeException {

    public DuplicateResourceException(String message) {
        super(message);
    }
}
