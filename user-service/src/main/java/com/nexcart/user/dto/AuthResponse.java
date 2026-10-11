package com.nexcart.user.dto;

/** Returned by register/login - the client stores {@code token} and sends it as {@code Authorization: Bearer <token>}. */
public class AuthResponse {

    private String token;
    private String tokenType;
    private String username;
    private String email;

    public AuthResponse() {
    }

    public AuthResponse(String token, String tokenType, String username, String email) {
        this.token = token;
        this.tokenType = tokenType;
        this.username = username;
        this.email = email;
    }

    public String getToken() {
        return token;
    }

    public void setToken(String token) {
        this.token = token;
    }

    public String getTokenType() {
        return tokenType;
    }

    public void setTokenType(String tokenType) {
        this.tokenType = tokenType;
    }

    public String getUsername() {
        return username;
    }

    public void setUsername(String username) {
        this.username = username;
    }

    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }
}
