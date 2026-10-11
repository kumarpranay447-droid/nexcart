package com.nexcart.order.dto;

import com.nexcart.order.entity.OrderStatus;
import jakarta.validation.constraints.NotNull;

/** Payload for {@code PUT /api/orders/{id}/status}. */
public class UpdateStatusRequest {

    @NotNull(message = "Status is required")
    private OrderStatus status;

    public UpdateStatusRequest() {
    }

    public OrderStatus getStatus() {
        return status;
    }

    public void setStatus(OrderStatus status) {
        this.status = status;
    }
}
