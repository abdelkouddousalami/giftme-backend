package com.giftme.mapper;

import com.giftme.domain.Memory;
import com.giftme.dto.memory.MemoryResponse;
import com.giftme.dto.memory.PublicMemoryResponse;
import java.util.List;

public final class MemoryMapper {

    private MemoryMapper() {
    }

    public static MemoryResponse toResponse(Memory memory, String publicBaseUrl) {
        return new MemoryResponse(
                memory.getId(),
                memory.getPublicCode(),
                publicBaseUrl + "/m/" + memory.getPublicCode(),
                memory.getTitle(),
                memory.getMessage(),
                memory.getMainImage(),
                // Copy out of the Hibernate-managed PersistentBag - Jackson can't serialize it directly.
                List.copyOf(memory.getGallery()),
                memory.getVideoUrl(),
                memory.getAudioUrl(),
                memory.getMusicUrl(),
                memory.isActive(),
                memory.getCreatedAt(),
                memory.getUpdatedAt()
        );
    }

    public static PublicMemoryResponse toPublicResponse(Memory memory) {
        return new PublicMemoryResponse(
                memory.getPublicCode(),
                memory.getTitle(),
                memory.getMessage(),
                memory.getMainImage(),
                List.copyOf(memory.getGallery()),
                memory.getVideoUrl(),
                memory.getAudioUrl(),
                memory.getMusicUrl()
        );
    }
}
