package com.giftme.dto.order;

public record CustomizationResponse(
        String imageUrl,
        String imagePosition,
        Double imageScale,
        Double imageRotation,
        String text,
        String textStyle,
        String font,
        String textColor,
        String occasion,
        String recipientName,
        String giftMessage,
        String videoUrl,
        String audioUrl,
        boolean qrMemoryEnabled,
        String memoryPublicCode
) {
}
