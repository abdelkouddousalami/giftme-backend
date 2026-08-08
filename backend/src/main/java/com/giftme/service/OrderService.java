package com.giftme.service;

import com.giftme.dto.order.CreateOrderRequest;
import com.giftme.dto.order.OrderResponse;

public interface OrderService {

    /**
     * Creates an order for either a guest or an authenticated customer.
     *
     * @param authenticatedUserId the current user's id if the request carried a valid customer
     *                            JWT, or null for a guest COD checkout
     */
    OrderResponse createOrder(CreateOrderRequest request, Long authenticatedUserId);
}
