package com.giftme.service;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;

import com.giftme.common.exception.ResourceNotFoundException;
import com.giftme.config.GiftMeProperties;
import com.giftme.domain.Memory;
import com.giftme.dto.memory.MemoryRequest;
import com.giftme.dto.memory.MemoryResponse;
import com.giftme.dto.memory.PublicMemoryResponse;
import com.giftme.repository.MemoryRepository;
import com.giftme.service.impl.MemoryServiceImpl;
import java.math.BigDecimal;
import java.util.List;
import java.util.Optional;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

@ExtendWith(MockitoExtension.class)
class MemoryServiceImplTest {

    @Mock
    private MemoryRepository memoryRepository;

    private MemoryServiceImpl memoryService;

    @BeforeEach
    void setUp() {
        GiftMeProperties properties = new GiftMeProperties(
                new GiftMeProperties.Jwt("secret", 900000, 1209600000),
                new GiftMeProperties.Cors(List.of("http://localhost:3000")),
                new GiftMeProperties.Storage("local", new GiftMeProperties.Storage.Local("./storage"), "/uploads",
                        new GiftMeProperties.Storage.Limits(5_000_000, 50_000_000, 20_000_000)),
                new GiftMeProperties.Order(new BigDecimal("30.00"), new BigDecimal("500.00")),
                "https://giftme.ma"
        );
        memoryService = new MemoryServiceImpl(memoryRepository, properties);
    }

    @Test
    void getPublicByCode_activeMemory_returnsPublicView() {
        Memory memory = Memory.builder().publicCode("abc123").title("A Memory").active(true).build();
        when(memoryRepository.findByPublicCode("abc123")).thenReturn(Optional.of(memory));

        PublicMemoryResponse response = memoryService.getPublicByCode("abc123");

        assertThat(response.publicCode()).isEqualTo("abc123");
        assertThat(response.title()).isEqualTo("A Memory");
    }

    @Test
    void getPublicByCode_inactiveMemory_isTreatedAsNotFound() {
        Memory memory = Memory.builder().publicCode("abc123").title("Hidden").active(false).build();
        when(memoryRepository.findByPublicCode("abc123")).thenReturn(Optional.of(memory));

        assertThatThrownBy(() -> memoryService.getPublicByCode("abc123"))
                .isInstanceOf(ResourceNotFoundException.class);
    }

    @Test
    void getPublicByCode_unknownCode_isNotFound() {
        when(memoryRepository.findByPublicCode("nope")).thenReturn(Optional.empty());

        assertThatThrownBy(() -> memoryService.getPublicByCode("nope"))
                .isInstanceOf(ResourceNotFoundException.class);
    }

    @Test
    void create_retriesGeneratedCodeOnCollision_untilUnique() {
        when(memoryRepository.existsByPublicCode(any())).thenReturn(true, true, false);

        MemoryRequest request = new MemoryRequest("Title", "Message", null, null, null, null, null, true);
        MemoryResponse response = memoryService.create(request);

        assertThat(response.publicCode()).isNotBlank();
        assertThat(response.publicUrl()).isEqualTo("https://giftme.ma/m/" + response.publicCode());
    }

    @Test
    void update_appliesPartialChanges() {
        Memory memory = Memory.builder().publicCode("abc123").title("Old").message("Old message").active(true).build();
        when(memoryRepository.findById(1L)).thenReturn(Optional.of(memory));

        MemoryResponse response = memoryService.update(1L, new MemoryRequest("New Title", "New message", null, null, null, null, null, false));

        assertThat(response.title()).isEqualTo("New Title");
        assertThat(response.message()).isEqualTo("New message");
        assertThat(response.active()).isFalse();
    }
}
