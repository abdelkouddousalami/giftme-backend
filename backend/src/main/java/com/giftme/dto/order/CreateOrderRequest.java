package com.giftme.dto.order;

import com.giftme.domain.enums.PaymentMethod;
import jakarta.validation.Valid;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import java.util.List;

public record CreateOrderRequest(
        @Valid @NotNull(message = "customer is required")
        CustomerInfoRequest customer,

        @Valid @NotNull(message = "shipping is required")
        ShippingInfoRequest shipping,

        @NotEmpty(message = "At least one item is required")
        @Valid
        List<OrderItemRequest> items,

        @NotNull(message = "paymentMethod is required")
        PaymentMethod paymentMethod
) {
}
