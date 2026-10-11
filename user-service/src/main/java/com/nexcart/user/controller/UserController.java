package com.nexcart.user.controller;

import com.nexcart.user.config.UserPrincipal;
import com.nexcart.user.dto.UserDto;
import com.nexcart.user.service.UserService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

/**
 * Authenticated user endpoints. {@code GET /me} is also used by
 * order-service to validate the caller's JWT (the gateway forwards the
 * {@code Authorization} header, and a 200 here means the token is valid).
 */
@RestController
@RequestMapping("/api/users")
public class UserController {

    private final UserService userService;

    public UserController(UserService userService) {
        this.userService = userService;
    }

    @GetMapping("/me")
    public ResponseEntity<UserDto> me(@AuthenticationPrincipal UserPrincipal principal) {
        return ResponseEntity.ok(userService.getByUsername(principal.getUsername()));
    }
}
