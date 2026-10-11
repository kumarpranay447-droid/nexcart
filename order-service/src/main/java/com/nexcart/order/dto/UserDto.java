package com.nexcart.order.dto;

/**
 * Subset of the user-service {@code UserDto} - everything order-service
 * needs after validating the caller's token.
 */
public class UserDto {

    private Long id;
    private String username;
    private String email;
    private String role;

    public UserDto() {
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
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

    public String getRole() {
        return role;
    }

    public void setRole(String role) {
        this.role = role;
    }
}
