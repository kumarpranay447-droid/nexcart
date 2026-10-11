package com.nexcart.order.entity;

/** Lifecycle states of an order. */
public enum OrderStatus {
    PENDING,
    CONFIRMED,
    SHIPPED,
    DELIVERED,
    CANCELLED
}
