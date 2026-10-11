package com.nexcart.order.controller;

import com.nexcart.order.dto.CreateOrderRequest;
import com.nexcart.order.dto.OrderDto;
import com.nexcart.order.dto.UpdateStatusRequest;
import com.nexcart.order.service.OrderService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

/**
 * Order endpoints. The gateway forwards the caller's {@code Authorization}
 * header; order-service validates it against user-service before doing
 * anything, so all data access is scoped to the authenticated user.
 */
@RestController
@RequestMapping("/api/orders")
public class OrderController {

    private final OrderService orderService;

    public OrderController(OrderService orderService) {
        this.orderService = orderService;
    }

    @PostMapping
    public ResponseEntity<OrderDto> createOrder(
            @RequestHeader("Authorization") String authorizationHeader,
            @Valid @RequestBody CreateOrderRequest request) {
        OrderDto created = orderService.createOrder(authorizationHeader, request);
        return ResponseEntity.status(HttpStatus.CREATED).body(created);
    }

    @GetMapping
    public ResponseEntity<List<OrderDto>> getMyOrders(
            @RequestHeader("Authorization") String authorizationHeader) {
        return ResponseEntity.ok(orderService.getMyOrders(authorizationHeader));
    }

    @GetMapping("/{id}")
    public ResponseEntity<OrderDto> getOrderById(
            @RequestHeader("Authorization") String authorizationHeader,
            @PathVariable Long id) {
        return ResponseEntity.ok(orderService.getOrderById(authorizationHeader, id));
    }

    @PutMapping("/{id}/status")
    public ResponseEntity<OrderDto> updateStatus(
            @RequestHeader("Authorization") String authorizationHeader,
            @PathVariable Long id,
            @Valid @RequestBody UpdateStatusRequest request) {
        return ResponseEntity.ok(orderService.updateStatus(authorizationHeader, id, request));
    }
}
