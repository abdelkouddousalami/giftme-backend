package com.giftme.dto.order;

import jakarta.validation.constraints.Size;

public record CustomizationRequest(
        String imageUrl,
        String imagePosition,
        Double imageScale,
        Double imageRotation,
        @Size(max = 2000) String text,
        String textStyle,
        String font,
        String textColor,
        @Size(max = 100) String occasion,
        @Size(max = 255) String recipientName,
        @Size(max = 2000) String giftMessage,
        String videoUrl,
        String audioUrl,
        boolean qrMemoryEnabled
) {
}
