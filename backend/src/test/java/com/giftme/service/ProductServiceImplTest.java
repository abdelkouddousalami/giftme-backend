package com.giftme.service;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyLong;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.times;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import com.giftme.common.exception.ResourceNotFoundException;
import com.giftme.domain.Product;
import com.giftme.dto.product.ProductRequest;
import com.giftme.dto.product.ProductResponse;
import com.giftme.dto.product.ProductStatusRequest;
import com.giftme.repository.ProductRepository;
import com.giftme.service.impl.ProductServiceImpl;
import java.math.BigDecimal;
import java.util.Optional;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

@ExtendWith(MockitoExtension.class)
class ProductServiceImplTest {

    @Mock
    private ProductRepository productRepository;

    private ProductServiceImpl productService;

    @BeforeEach
    void setUp() {
        productService = new ProductServiceImpl(productRepository);
    }

    @Test
    void create_generatesSlugFromName_whenSlugNotProvided() {
        ProductRequest request = new ProductRequest("Personalized Puzzle", null, "desc", "short",
                new BigDecimal("149.00"), "Puzzles", 100, true, null, null, true);
        when(productRepository.existsBySlug("personalized-puzzle")).thenReturn(false);

        ProductResponse response = productService.create(request);

        assertThat(response.slug()).isEqualTo("personalized-puzzle");
        assertThat(response.name()).isEqualTo("Personalized Puzzle");
        verify(productRepository).save(any(Product.class));
    }

    @Test
    void create_appendsSuffix_whenGeneratedSlugAlreadyExists() {
        ProductRequest request = new ProductRequest("Mug", null, null, null,
                new BigDecimal("99.00"), "Mugs", 10, true, null, null, false);
        when(productRepository.existsBySlug("mug")).thenReturn(true);
        when(productRepository.existsBySlug("mug-2")).thenReturn(false);

        ProductResponse response = productService.create(request);

        assertThat(response.slug()).isEqualTo("mug-2");
    }

    @Test
    void getById_missing_throwsResourceNotFound() {
        when(productRepository.findById(99L)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> productService.getById(99L))
                .isInstanceOf(ResourceNotFoundException.class);
    }

    @Test
    void update_changesFieldsOnExistingEntity() {
        Product existing = Product.builder()
                .name("Old Name").slug("old-name").price(new BigDecimal("10.00"))
                .stock(5).active(true).customizationEnabled(false).build();
        when(productRepository.findById(1L)).thenReturn(Optional.of(existing));
        when(productRepository.existsBySlugAndIdNot(anyString(), anyLong())).thenReturn(false);

        ProductRequest request = new ProductRequest("New Name", null, "new desc", null,
                new BigDecimal("20.00"), "Cat", 15, false, null, null, true);

        ProductResponse response = productService.update(1L, request);

        assertThat(response.name()).isEqualTo("New Name");
        assertThat(response.price()).isEqualByComparingTo("20.00");
        assertThat(response.stock()).isEqualTo(15);
        assertThat(response.active()).isFalse();
    }

    @Test
    void updateStatus_flipsActiveFlagOnly() {
        Product existing = Product.builder().name("X").slug("x").price(BigDecimal.ONE).stock(1).active(true).build();
        when(productRepository.findById(1L)).thenReturn(Optional.of(existing));

        ProductResponse response = productService.updateStatus(1L, new ProductStatusRequest(false));

        assertThat(response.active()).isFalse();
    }

    @Test
    void delete_removesProduct() {
        Product existing = Product.builder().name("X").slug("x").price(BigDecimal.ONE).stock(1).build();
        when(productRepository.findById(1L)).thenReturn(Optional.of(existing));

        productService.delete(1L);

        ArgumentCaptor<Product> captor = ArgumentCaptor.forClass(Product.class);
        verify(productRepository, times(1)).delete(captor.capture());
        assertThat(captor.getValue()).isEqualTo(existing);
        verify(productRepository, never()).deleteById(anyLong());
    }
}
