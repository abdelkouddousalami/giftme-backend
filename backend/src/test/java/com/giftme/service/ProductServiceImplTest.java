package com.giftme.service;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyLong;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.times;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import com.giftme.common.exception.ResourceNotFoundException;
import com.giftme.common.response.PagedResponse;
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
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.jpa.domain.Specification;

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
    void adminList_returnsProductsRegardlessOfActiveFlag() {
        Product inactive = Product.builder().name("Old Item").slug("old-item").price(BigDecimal.TEN)
                .stock(0).active(false).build();
        @SuppressWarnings("unchecked")
        Specification<Product> anySpec = any(Specification.class);
        when(productRepository.findAll(anySpec, eq(PageRequest.of(0, 20))))
                .thenReturn(new PageImpl<>(java.util.List.of(inactive), PageRequest.of(0, 20), 1));

        PagedResponse<ProductResponse> response = productService.adminList(null, null, PageRequest.of(0, 20));

        assertThat(response.getContent()).hasSize(1);
        assertThat(response.getContent().get(0).active()).isFalse();
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
