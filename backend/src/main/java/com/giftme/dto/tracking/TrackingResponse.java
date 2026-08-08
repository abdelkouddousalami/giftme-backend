package com.giftme.dto.tracking;

import java.time.Instant;
import java.time.LocalDate;
import java.util.List;

public record TrackingResponse(
        String orderNumber,
        String trackingCode,
        String currentStatus,
        Instant createdAt,
        LocalDate estimatedDelivery,
        List<TrackingEventResponse> trackingEvents
) {
}
