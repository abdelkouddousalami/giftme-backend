package com.giftme.service;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.Mockito.when;

import com.giftme.common.exception.ConflictException;
import com.giftme.domain.Order;
import com.giftme.domain.enums.OrderStatus;
import com.giftme.domain.enums.PaymentMethod;
import com.giftme.domain.enums.PaymentStatus;
import com.giftme.dto.order.OrderResponse;
import com.giftme.dto.order.OrderStatusUpdateRequest;
import com.giftme.repository.OrderRepository;
import com.giftme.service.impl.AdminOrderServiceImpl;
import java.math.BigDecimal;
import java.util.Optional;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

@ExtendWith(MockitoExtension.class)
class AdminOrderServiceImplTest {

    @Mock
    private OrderRepository orderRepository;

    private AdminOrderServiceImpl adminOrderService;

    @BeforeEach
    void setUp() {
        adminOrderService = new AdminOrderServiceImpl(orderRepository);
    }

    private Order buildOrder(OrderStatus status) {
        return Order.builder()
                .orderNumber("ORD-20260808-ABCDE")
                .trackingCode("GM-ABCDEF")
                .customerName("Test Customer")
                .phone("+212600000000")
                .city("Rabat")
                .address("Somewhere")
                .subtotal(new BigDecimal("100.00"))
                .deliveryFee(new BigDecimal("30.00"))
                .total(new BigDecimal("130.00"))
                .paymentMethod(PaymentMethod.COD)
                .paymentStatus(PaymentStatus.PENDING)
                .orderStatus(status)
                .build();
    }

    @Test
    void updateStatus_validTransition_appendsTrackingEvent() {
        Order order = buildOrder(OrderStatus.PENDING);
        when(orderRepository.findById(1L)).thenReturn(Optional.of(order));

        OrderResponse response = adminOrderService.updateStatus(1L, new OrderStatusUpdateRequest(OrderStatus.CONFIRMED, "Looks good"));

        assertThat(response.orderStatus()).isEqualTo("CONFIRMED");
        assertThat(order.getTrackingEvents()).hasSize(1);
        assertThat(order.getTrackingEvents().get(0).getStatus()).isEqualTo(OrderStatus.CONFIRMED);
        assertThat(order.getTrackingEvents().get(0).getAdminNote()).isEqualTo("Looks good");
    }

    @Test
    void updateStatus_toDelivered_marksPaymentAsPaid() {
        Order order = buildOrder(OrderStatus.OUT_FOR_DELIVERY);
        when(orderRepository.findById(1L)).thenReturn(Optional.of(order));

        adminOrderService.updateStatus(1L, new OrderStatusUpdateRequest(OrderStatus.DELIVERED, null));

        assertThat(order.getPaymentStatus()).isEqualTo(PaymentStatus.PAID);
    }

    @Test
    void updateStatus_fromCancelled_isRejected_terminalStateRule() {
        Order order = buildOrder(OrderStatus.CANCELLED);
        when(orderRepository.findById(1L)).thenReturn(Optional.of(order));

        assertThatThrownBy(() -> adminOrderService.updateStatus(1L, new OrderStatusUpdateRequest(OrderStatus.DELIVERED, null)))
                .isInstanceOf(ConflictException.class);
    }

    @Test
    void updateStatus_fromDelivered_isRejected_terminalStateRule() {
        Order order = buildOrder(OrderStatus.DELIVERED);
        when(orderRepository.findById(1L)).thenReturn(Optional.of(order));

        assertThatThrownBy(() -> adminOrderService.updateStatus(1L, new OrderStatusUpdateRequest(OrderStatus.SHIPPED, null)))
                .isInstanceOf(ConflictException.class);
        assertThat(order.getOrderStatus()).isEqualTo(OrderStatus.DELIVERED);
    }
}
