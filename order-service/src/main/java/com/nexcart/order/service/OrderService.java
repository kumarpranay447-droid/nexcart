package com.nexcart.order.service;

import com.nexcart.order.client.UserServiceClient;
import com.nexcart.order.dto.CreateOrderRequest;
import com.nexcart.order.dto.OrderDto;
import com.nexcart.order.dto.OrderItemDto;
import com.nexcart.order.dto.OrderItemRequest;
import com.nexcart.order.dto.UpdateStatusRequest;
import com.nexcart.order.dto.UserDto;
import com.nexcart.order.entity.Order;
import com.nexcart.order.entity.OrderItem;
import com.nexcart.order.entity.OrderStatus;
import com.nexcart.order.exception.ForbiddenException;
import com.nexcart.order.exception.ResourceNotFoundException;
import com.nexcart.order.repository.OrderRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.List;

/**
 * Order lifecycle management. Users can only see and mutate their own
 * orders - ownership is established by validating the JWT against
 * user-service on every call.
 */
@Service
public class OrderService {

    private final OrderRepository orderRepository;
    private final UserServiceClient userServiceClient;

    public OrderService(OrderRepository orderRepository, UserServiceClient userServiceClient) {
        this.orderRepository = orderRepository;
        this.userServiceClient = userServiceClient;
    }

    @Transactional
    public OrderDto createOrder(String authorizationHeader, CreateOrderRequest request) {
        UserDto user = userServiceClient.validateAndGetUser(authorizationHeader);

        Order order = new Order();
        order.setUserId(user.getId());
        order.setUsername(user.getUsername());
        order.setStatus(OrderStatus.PENDING);

        List<OrderItem> items = request.getItems().stream()
                .map(this::toItemEntity)
                .toList();
        order.setItems(items);

        BigDecimal total = items.stream()
                .map(OrderItem::lineTotal)
                .reduce(BigDecimal.ZERO, BigDecimal::add);
        order.setTotalAmount(total);

        return toDto(orderRepository.save(order));
    }

    @Transactional(readOnly = true)
    public List<OrderDto> getMyOrders(String authorizationHeader) {
        UserDto user = userServiceClient.validateAndGetUser(authorizationHeader);
        return orderRepository.findByUserIdOrderByCreatedAtDesc(user.getId())
                .stream()
                .map(this::toDto)
                .toList();
    }

    @Transactional(readOnly = true)
    public OrderDto getOrderById(String authorizationHeader, Long orderId) {
        UserDto user = userServiceClient.validateAndGetUser(authorizationHeader);
        Order order = findOwnedOrder(orderId, user.getId());
        return toDto(order);
    }

    @Transactional
    public OrderDto updateStatus(String authorizationHeader, Long orderId, UpdateStatusRequest request) {
        UserDto user = userServiceClient.validateAndGetUser(authorizationHeader);
        Order order = findOwnedOrder(orderId, user.getId());
        validateTransition(order.getStatus(), request.getStatus());
        order.setStatus(request.getStatus());
        order.setUpdatedAt(Instant.now());
        return toDto(orderRepository.save(order));
    }

    private Order findOwnedOrder(Long orderId, Long userId) {
        return orderRepository.findByIdAndUserId(orderId, userId)
                .orElseThrow(() -> new ResourceNotFoundException("Order " + orderId + " not found"));
    }

    /**
     * Simple state machine: terminal states cannot be changed, and a
     * cancelled order stays cancelled.
     */
    private void validateTransition(OrderStatus current, OrderStatus next) {
        if (current == OrderStatus.DELIVERED || current == OrderStatus.CANCELLED) {
            throw new ForbiddenException(
                    "Order is already " + current + " and cannot be changed");
        }
        if (current == OrderStatus.SHIPPED && next == OrderStatus.PENDING) {
            throw new ForbiddenException("Cannot move a shipped order back to PENDING");
        }
    }

    private OrderItem toItemEntity(OrderItemRequest request) {
        return new OrderItem(request.getProductName(), request.getQuantity(), request.getUnitPrice());
    }

    private OrderDto toDto(Order order) {
        OrderDto dto = new OrderDto();
        dto.setId(order.getId());
        dto.setUserId(order.getUserId());
        dto.setUsername(order.getUsername());
        dto.setStatus(order.getStatus());
        dto.setTotalAmount(order.getTotalAmount());
        dto.setItems(order.getItems().stream()
                .map(item -> new OrderItemDto(
                        item.getId(), item.getProductName(), item.getQuantity(),
                        item.getUnitPrice(), item.lineTotal()))
                .toList());
        dto.setCreatedAt(order.getCreatedAt());
        dto.setUpdatedAt(order.getUpdatedAt());
        return dto;
    }
}
