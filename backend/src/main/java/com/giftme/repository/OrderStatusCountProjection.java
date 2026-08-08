package com.giftme.repository;

import com.giftme.domain.enums.OrderStatus;

public interface OrderStatusCountProjection {
    OrderStatus getStatus();
    long getCount();
}
