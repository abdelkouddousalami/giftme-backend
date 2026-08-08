package com.giftme.service;

import com.giftme.common.response.PagedResponse;
import com.giftme.domain.enums.OrderStatus;
import com.giftme.dto.order.AdminOrderSummaryResponse;
import com.giftme.dto.order.OrderResponse;
import com.giftme.dto.order.OrderStatusUpdateRequest;
import com.giftme.dto.order.TrackingEventRequest;
import com.giftme.dto.tracking.TrackingResponse;
import java.time.Instant;
import org.springframework.data.domain.Pageable;

public interface AdminOrderService {

    PagedResponse<AdminOrderSummaryResponse> search(String search, OrderStatus status, Instant from, Instant to, Pageable pageable);

    OrderResponse getById(Long id);

    OrderResponse updateStatus(Long id, OrderStatusUpdateRequest request);

    TrackingResponse getTracking(Long id);

    TrackingResponse addTrackingEvent(Long id, TrackingEventRequest request);
}
