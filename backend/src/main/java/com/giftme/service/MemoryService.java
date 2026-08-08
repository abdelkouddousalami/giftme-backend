package com.giftme.service;

import com.giftme.common.response.PagedResponse;
import com.giftme.dto.memory.MemoryRequest;
import com.giftme.dto.memory.MemoryResponse;
import com.giftme.dto.memory.PublicMemoryResponse;
import org.springframework.data.domain.Pageable;

public interface MemoryService {

    PublicMemoryResponse getPublicByCode(String publicCode);

    PagedResponse<MemoryResponse> list(Pageable pageable);

    MemoryResponse getById(Long id);

    MemoryResponse create(MemoryRequest request);

    MemoryResponse update(Long id, MemoryRequest request);

    void delete(Long id);
}
