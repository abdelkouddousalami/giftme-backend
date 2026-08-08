package com.giftme.controller;

import com.giftme.common.response.ApiResponse;
import com.giftme.dto.upload.UploadResponse;
import com.giftme.service.UploadService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

/**
 * Public (rate-limited) so guests can attach personalization media before placing an order -
 * see SecurityConfig and RateLimitFilter. Every file is validated by content, not by the
 * client-declared extension or Content-Type (see FileValidator).
 */
@RestController
@RequestMapping("/api/uploads")
@RequiredArgsConstructor
@Tag(name = "Uploads", description = "Media upload for product customization, memories, etc. Rate-limited; content-validated regardless of the declared file type.")
public class UploadController {

    private final UploadService uploadService;

    @PostMapping(value = "/image", consumes = "multipart/form-data")
    @Operation(summary = "Upload an image (jpg, jpeg, png, webp, gif)")
    public ApiResponse<UploadResponse> uploadImage(@RequestParam("file") MultipartFile file) {
        return ApiResponse.success(uploadService.uploadImage(file), "Image uploaded");
    }

    @PostMapping(value = "/video", consumes = "multipart/form-data")
    @Operation(summary = "Upload a video (mp4, mov, webm)")
    public ApiResponse<UploadResponse> uploadVideo(@RequestParam("file") MultipartFile file) {
        return ApiResponse.success(uploadService.uploadVideo(file), "Video uploaded");
    }

    @PostMapping(value = "/audio", consumes = "multipart/form-data")
    @Operation(summary = "Upload an audio file (mp3, wav, ogg, m4a)")
    public ApiResponse<UploadResponse> uploadAudio(@RequestParam("file") MultipartFile file) {
        return ApiResponse.success(uploadService.uploadAudio(file), "Audio uploaded");
    }
}
