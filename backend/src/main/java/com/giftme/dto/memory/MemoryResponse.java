package com.giftme.dto.memory;

import java.time.Instant;
import java.util.List;

/** Admin view - includes the internal id and active flag. */
public record MemoryResponse(
        Long id,
        String publicCode,
        String publicUrl,
        String title,
        String message,
        String mainImage,
        List<String> gallery,
        String videoUrl,
        String audioUrl,
        String musicUrl,
        boolean active,
        Instant createdAt,
        Instant updatedAt
) {
}
