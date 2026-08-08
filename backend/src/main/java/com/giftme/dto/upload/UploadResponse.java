package com.giftme.dto.upload;

public record UploadResponse(
        String url,
        String fileName,
        long size,
        String type
) {
}
