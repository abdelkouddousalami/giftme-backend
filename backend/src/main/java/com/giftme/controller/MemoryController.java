package com.giftme.controller;

import com.giftme.common.response.ApiResponse;
import com.giftme.dto.memory.PublicMemoryResponse;
import com.giftme.service.MemoryService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/memories")
@RequiredArgsConstructor
@Tag(name = "Memories", description = "Public QR memory pages - no authentication required. Reachable only via the unguessable publicCode.")
public class MemoryController {

    private final MemoryService memoryService;

    @GetMapping("/{publicCode}")
    @Operation(summary = "Get a public memory page by its public code")
    public ApiResponse<PublicMemoryResponse> getByPublicCode(@PathVariable String publicCode) {
        return ApiResponse.success(memoryService.getPublicByCode(publicCode));
    }
}
