package com.giftme.dto.tracking;

import java.time.Instant;

public record TrackingEventResponse(
        Long id,
        String status,
        String description,
        Instant createdAt
) {
}
