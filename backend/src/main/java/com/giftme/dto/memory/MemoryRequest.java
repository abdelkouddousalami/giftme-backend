package com.giftme.dto.memory;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import java.util.List;

public record MemoryRequest(
        @NotBlank(message = "Title is required")
        @Size(max = 255)
        String title,

        String message,

        String mainImage,

        List<String> gallery,

        String videoUrl,

        String audioUrl,

        String musicUrl,

        Boolean active
) {
}
