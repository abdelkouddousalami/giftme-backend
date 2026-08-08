package com.giftme.service.impl;

import com.giftme.common.exception.ConflictException;
import com.giftme.common.exception.ErrorCode;
import com.giftme.common.exception.ResourceNotFoundException;
import com.giftme.common.response.PagedResponse;
import com.giftme.domain.Order;
import com.giftme.domain.TrackingEvent;
import com.giftme.domain.enums.OrderStatus;
import com.giftme.domain.enums.PaymentStatus;
import com.giftme.dto.order.AdminOrderSummaryResponse;
import com.giftme.dto.order.OrderResponse;
import com.giftme.dto.order.OrderStatusUpdateRequest;
import com.giftme.dto.order.TrackingEventRequest;
import com.giftme.dto.tracking.TrackingResponse;
import com.giftme.mapper.OrderMapper;
import com.giftme.repository.OrderRepository;
import com.giftme.repository.OrderSpecifications;
import com.giftme.service.AdminOrderService;
import java.time.Instant;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class AdminOrderServiceImpl implements AdminOrderService {

    private final OrderRepository orderRepository;

    @Override
    @Transactional(readOnly = true)
    public PagedResponse<AdminOrderSummaryResponse> search(String search, OrderStatus status, Instant from, Instant to, Pageable pageable) {
        Page<Order> page = orderRepository.findAll(OrderSpecifications.withFilters(search, status, from, to), pageable);
        return PagedResponse.of(page, OrderMapper::toSummary);
    }

    @Override
    @Transactional(readOnly = true)
    public OrderResponse getById(Long id) {
        return OrderMapper.toResponse(findById(id));
    }

    @Override
    @Transactional
    public OrderResponse updateStatus(Long id, OrderStatusUpdateRequest request) {
        Order order = findById(id);
        applyStatusChange(order, request.status(), defaultDescriptionFor(request.status()), request.adminNote());
        return OrderMapper.toResponse(order);
    }

    @Override
    @Transactional(readOnly = true)
    public TrackingResponse getTracking(Long id) {
        return OrderMapper.toTrackingResponse(findById(id));
    }

    @Override
    @Transactional
    public TrackingResponse addTrackingEvent(Long id, TrackingEventRequest request) {
        Order order = findById(id);
        applyStatusChange(order, request.status(), request.description(), request.adminNote());
        return OrderMapper.toTrackingResponse(order);
    }

    /**
     * Shared by both admin mutation endpoints: validates the transition (rules #10/#11 - CANCELLED
     * and DELIVERED are terminal), applies the COD "paid on delivery" rule (section 5), and always
     * appends a TrackingEvent (rule #8 - every status change is logged).
     */
    private void applyStatusChange(Order order, OrderStatus newStatus, String description, String adminNote) {
        if (order.getOrderStatus().isTerminal()) {
            throw new ConflictException(ErrorCode.INVALID_STATUS_TRANSITION,
                    "Order " + order.getOrderNumber() + " is already " + order.getOrderStatus() + " and cannot be changed further");
        }

        order.setOrderStatus(newStatus);
        if (newStatus == OrderStatus.DELIVERED) {
            order.setPaymentStatus(PaymentStatus.PAID);
        }

        order.addTrackingEvent(TrackingEvent.builder()
                .status(newStatus)
                .description(description)
                .adminNote(adminNote)
                .build());
    }

    private String defaultDescriptionFor(OrderStatus status) {
        return switch (status) {
            case PENDING -> "Order created";
            case CONFIRMED -> "Order confirmed";
            case PREPARING -> "Preparing your order";
            case READY -> "Order ready";
            case SHIPPED -> "Order shipped";
            case OUT_FOR_DELIVERY -> "Out for delivery";
            case DELIVERED -> "Order delivered";
            case CANCELLED -> "Order cancelled";
        };
    }

    private Order findById(Long id) {
        return orderRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException(ErrorCode.ORDER_NOT_FOUND, "Order not found: " + id));
    }
}
