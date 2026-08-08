package com.giftme.controller;

import com.giftme.common.response.ApiResponse;
import com.giftme.common.response.PagedResponse;
import com.giftme.dto.memory.MemoryRequest;
import com.giftme.dto.memory.MemoryResponse;
import com.giftme.service.MemoryService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/admin/memories")
@RequiredArgsConstructor
@Tag(name = "Admin - Memories", description = "Memory management - requires ADMIN role")
@SecurityRequirement(name = "bearerAuth")
public class AdminMemoryController {

    private final MemoryService memoryService;

    @GetMapping
    @Operation(summary = "List memories", description = "Not in the original spec's endpoint list, but added since an admin memory management screen needs a way to list memories in the first place.")
    public ApiResponse<PagedResponse<MemoryResponse>> list(@PageableDefault(size = 20, sort = "createdAt") Pageable pageable) {
        return ApiResponse.success(memoryService.list(pageable));
    }

    @GetMapping("/{id}")
    @Operation(summary = "Get a memory by internal id", description = "Not in the original spec's endpoint list, but added since PUT/DELETE are unusable without a way to first fetch a memory's current data for an admin edit screen.")
    public ApiResponse<MemoryResponse> getById(@PathVariable Long id) {
        return ApiResponse.success(memoryService.getById(id));
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    @Operation(summary = "Create a memory")
    public ApiResponse<MemoryResponse> create(@Valid @RequestBody MemoryRequest request) {
        return ApiResponse.success(memoryService.create(request), "Memory created");
    }

    @PutMapping("/{id}")
    @Operation(summary = "Update a memory")
    public ApiResponse<MemoryResponse> update(@PathVariable Long id, @Valid @RequestBody MemoryRequest request) {
        return ApiResponse.success(memoryService.update(id, request), "Memory updated");
    }

    @DeleteMapping("/{id}")
    @Operation(summary = "Delete a memory")
    public ApiResponse<Void> delete(@PathVariable Long id) {
        memoryService.delete(id);
        return ApiResponse.success(null, "Memory deleted");
    }
}
