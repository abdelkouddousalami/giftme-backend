package com.giftme.service;

import com.giftme.dto.memory.MemoryRequest;
import com.giftme.dto.memory.MemoryResponse;
import com.giftme.dto.memory.PublicMemoryResponse;

public interface MemoryService {

    PublicMemoryResponse getPublicByCode(String publicCode);

    MemoryResponse getById(Long id);

    MemoryResponse create(MemoryRequest request);

    MemoryResponse update(Long id, MemoryRequest request);

    void delete(Long id);
}
