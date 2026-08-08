package com.giftme.domain.enums;

import java.util.EnumSet;
import java.util.Set;

/**
 * Lifecycle of an order. Transitions are enforced in OrderStatusTransitionValidator:
 * CANCELLED and DELIVERED are terminal states.
 */
public enum OrderStatus {
    PENDING,
    CONFIRMED,
    PREPARING,
    READY,
    SHIPPED,
    OUT_FOR_DELIVERY,
    DELIVERED,
    CANCELLED;

    private static final Set<OrderStatus> TERMINAL = EnumSet.of(DELIVERED, CANCELLED);

    public boolean isTerminal() {
        return TERMINAL.contains(this);
    }
}
