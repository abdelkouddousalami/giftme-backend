package com.giftme.mapper;

import com.giftme.domain.Customization;
import com.giftme.domain.Order;
import com.giftme.domain.OrderItem;
import com.giftme.dto.order.AdminOrderSummaryResponse;
import com.giftme.dto.order.CustomizationResponse;
import com.giftme.dto.order.OrderItemResponse;
import com.giftme.dto.order.OrderResponse;
import com.giftme.dto.tracking.TrackingEventResponse;
import com.giftme.dto.tracking.TrackingResponse;

public final class OrderMapper {

    private OrderMapper() {
    }

    public static OrderResponse toResponse(Order order) {
        return new OrderResponse(
                order.getId(),
                order.getOrderNumber(),
                order.getTrackingCode(),
                order.getCustomerName(),
                order.getPhone(),
                order.getEmail(),
                order.getCity(),
                order.getAddress(),
                order.getNotes(),
                order.getItems().stream().map(OrderMapper::toItemResponse).toList(),
                order.getSubtotal(),
                order.getDeliveryFee(),
                order.getTotal(),
                order.getPaymentMethod().name(),
                order.getPaymentStatus().name(),
                order.getOrderStatus().name(),
                order.getEstimatedDelivery(),
                order.getCreatedAt(),
                order.getUpdatedAt()
        );
    }

    public static OrderItemResponse toItemResponse(OrderItem item) {
        return new OrderItemResponse(
                item.getId(),
                item.getProduct().getId(),
                item.getProductNameSnapshot(),
                item.getUnitPrice(),
                item.getQuantity(),
                item.getTotalPrice(),
                item.getCustomization() != null ? toCustomizationResponse(item.getCustomization()) : null
        );
    }

    public static CustomizationResponse toCustomizationResponse(Customization c) {
        return new CustomizationResponse(
                c.getImageUrl(),
                c.getImagePosition(),
                c.getImageScale(),
                c.getImageRotation(),
                c.getText(),
                c.getTextStyle(),
                c.getFont(),
                c.getTextColor(),
                c.getOccasion(),
                c.getRecipientName(),
                c.getGiftMessage(),
                c.getVideoUrl(),
                c.getAudioUrl(),
                c.isQrMemoryEnabled(),
                c.getMemory() != null ? c.getMemory().getPublicCode() : null
        );
    }

    public static AdminOrderSummaryResponse toSummary(Order order) {
        return new AdminOrderSummaryResponse(
                order.getId(),
                order.getOrderNumber(),
                order.getTrackingCode(),
                order.getCustomerName(),
                order.getPhone(),
                order.getCity(),
                order.getItems().size(),
                order.getTotal(),
                order.getPaymentMethod().name(),
                order.getPaymentStatus().name(),
                order.getOrderStatus().name(),
                order.getCreatedAt()
        );
    }

    public static TrackingResponse toTrackingResponse(Order order) {
        return new TrackingResponse(
                order.getOrderNumber(),
                order.getTrackingCode(),
                order.getOrderStatus().name(),
                order.getCreatedAt(),
                order.getEstimatedDelivery(),
                order.getTrackingEvents().stream().map(e -> new TrackingEventResponse(
                        e.getId(), e.getStatus().name(), e.getDescription(), e.getCreatedAt()
                )).toList()
        );
    }
}
