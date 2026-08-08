package com.giftme.dto.memory;

import java.util.List;

/** Public view served at GET /api/memories/{publicCode} - no internal id, no auth required. */
public record PublicMemoryResponse(
        String publicCode,
        String title,
        String message,
        String mainImage,
        List<String> gallery,
        String videoUrl,
        String audioUrl,
        String musicUrl
) {
}
