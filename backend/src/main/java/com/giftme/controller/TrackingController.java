package com.giftme.controller;

import com.giftme.common.response.ApiResponse;
import com.giftme.dto.tracking.TrackingResponse;
import com.giftme.service.TrackingService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/tracking")
@RequiredArgsConstructor
@Tag(name = "Tracking", description = "Public order tracking - no authentication required")
public class TrackingController {

    private final TrackingService trackingService;

    @GetMapping("/{trackingCode}")
    @Operation(summary = "Track an order by its public tracking code (e.g. GM-8X4K2Q)")
    public ApiResponse<TrackingResponse> track(@PathVariable String trackingCode) {
        return ApiResponse.success(trackingService.getByTrackingCode(trackingCode));
    }
}
