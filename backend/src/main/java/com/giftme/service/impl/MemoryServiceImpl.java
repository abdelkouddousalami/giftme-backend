package com.giftme.service.impl;

import com.giftme.common.exception.ErrorCode;
import com.giftme.common.exception.ResourceNotFoundException;
import com.giftme.common.response.PagedResponse;
import com.giftme.common.util.RandomCodeGenerator;
import com.giftme.config.GiftMeProperties;
import com.giftme.domain.Memory;
import com.giftme.dto.memory.MemoryRequest;
import com.giftme.dto.memory.MemoryResponse;
import com.giftme.dto.memory.PublicMemoryResponse;
import com.giftme.mapper.MemoryMapper;
import com.giftme.repository.MemoryRepository;
import com.giftme.service.MemoryService;
import java.util.ArrayList;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class MemoryServiceImpl implements MemoryService {

    private static final int MAX_CODE_ATTEMPTS = 10;

    private final MemoryRepository memoryRepository;
    private final GiftMeProperties properties;

    @Override
    @Transactional(readOnly = true)
    public PublicMemoryResponse getPublicByCode(String publicCode) {
        Memory memory = memoryRepository.findByPublicCode(publicCode)
                .filter(Memory::isActive)
                .orElseThrow(() -> new ResourceNotFoundException(ErrorCode.MEMORY_NOT_FOUND, "Memory not found"));
        return MemoryMapper.toPublicResponse(memory);
    }

    @Override
    @Transactional(readOnly = true)
    public PagedResponse<MemoryResponse> list(Pageable pageable) {
        Page<Memory> page = memoryRepository.findAll(pageable);
        return PagedResponse.of(page, memory -> MemoryMapper.toResponse(memory, properties.publicBaseUrl()));
    }

    @Override
    @Transactional(readOnly = true)
    public MemoryResponse getById(Long id) {
        return MemoryMapper.toResponse(findById(id), properties.publicBaseUrl());
    }

    @Override
    @Transactional
    public MemoryResponse create(MemoryRequest request) {
        Memory memory = Memory.builder()
                .publicCode(generateUniqueCode())
                .title(request.title())
                .message(request.message())
                .mainImage(request.mainImage())
                .gallery(request.gallery() != null ? new ArrayList<>(request.gallery()) : new ArrayList<>())
                .videoUrl(request.videoUrl())
                .audioUrl(request.audioUrl())
                .musicUrl(request.musicUrl())
                .active(request.active() == null || request.active())
                .build();

        memoryRepository.save(memory);
        return MemoryMapper.toResponse(memory, properties.publicBaseUrl());
    }

    @Override
    @Transactional
    public MemoryResponse update(Long id, MemoryRequest request) {
        Memory memory = findById(id);

        memory.setTitle(request.title());
        memory.setMessage(request.message());
        memory.setMainImage(request.mainImage());
        if (request.gallery() != null) {
            memory.setGallery(new ArrayList<>(request.gallery()));
        }
        memory.setVideoUrl(request.videoUrl());
        memory.setAudioUrl(request.audioUrl());
        memory.setMusicUrl(request.musicUrl());
        if (request.active() != null) {
            memory.setActive(request.active());
        }

        return MemoryMapper.toResponse(memory, properties.publicBaseUrl());
    }

    @Override
    @Transactional
    public void delete(Long id) {
        memoryRepository.delete(findById(id));
    }

    private Memory findById(Long id) {
        return memoryRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException(ErrorCode.MEMORY_NOT_FOUND, "Memory not found: " + id));
    }

    private String generateUniqueCode() {
        for (int i = 0; i < MAX_CODE_ATTEMPTS; i++) {
            String candidate = RandomCodeGenerator.memoryPublicCode();
            if (!memoryRepository.existsByPublicCode(candidate)) {
                return candidate;
            }
        }
        throw new IllegalStateException("Unable to generate a unique memory public code");
    }
}
