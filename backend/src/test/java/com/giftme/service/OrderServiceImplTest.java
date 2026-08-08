package com.giftme.service;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyInt;
import static org.mockito.ArgumentMatchers.anyLong;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.lenient;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import com.giftme.common.exception.InsufficientStockException;
import com.giftme.config.GiftMeProperties;
import com.giftme.domain.Customer;
import com.giftme.domain.Product;
import com.giftme.domain.enums.PaymentMethod;
import com.giftme.dto.order.CreateOrderRequest;
import com.giftme.dto.order.CustomerInfoRequest;
import com.giftme.dto.order.CustomizationRequest;
import com.giftme.dto.order.OrderItemRequest;
import com.giftme.dto.order.OrderResponse;
import com.giftme.dto.order.ShippingInfoRequest;
import com.giftme.repository.CustomerRepository;
import com.giftme.repository.MemoryRepository;
import com.giftme.repository.OrderRepository;
import com.giftme.repository.ProductRepository;
import com.giftme.repository.UserRepository;
import com.giftme.service.impl.OrderServiceImpl;
import java.math.BigDecimal;
import java.util.Optional;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

@ExtendWith(MockitoExtension.class)
class OrderServiceImplTest {

    @Mock
    private ProductRepository productRepository;
    @Mock
    private CustomerRepository customerRepository;
    @Mock
    private UserRepository userRepository;
    @Mock
    private OrderRepository orderRepository;
    @Mock
    private MemoryRepository memoryRepository;

    private OrderServiceImpl orderService;

    private GiftMeProperties properties;

    @BeforeEach
    void setUp() {
        properties = new GiftMeProperties(
                new GiftMeProperties.Jwt("secret", 900000, 1209600000),
                new GiftMeProperties.Cors(java.util.List.of("http://localhost:3000")),
                new GiftMeProperties.Storage("local", new GiftMeProperties.Storage.Local("./storage"), "/uploads",
                        new GiftMeProperties.Storage.Limits(5_000_000, 50_000_000, 20_000_000)),
                new GiftMeProperties.Order(new BigDecimal("30.00"), new BigDecimal("500.00")),
                "https://giftme.ma"
        );
        orderService = new OrderServiceImpl(productRepository, customerRepository, userRepository,
                orderRepository, memoryRepository, properties);

        // Default: no existing customer. Marked lenient because the one test that stubs a more
        // specific phone number shadows this default entirely, which strict stubbing would
        // otherwise flag as unused in that test.
        lenient().when(customerRepository.findByPhone(anyString())).thenReturn(Optional.empty());
    }

    private Product buildProduct(long id, String name, String price, int stock, boolean active) {
        Product product = Product.builder()
                .name(name).slug(name.toLowerCase()).price(new BigDecimal(price))
                .stock(stock).active(active).build();
        setId(product, id);
        return product;
    }

    private void setId(Object entity, long id) {
        try {
            var field = com.giftme.domain.BaseEntity.class.getDeclaredField("id");
            field.setAccessible(true);
            field.set(entity, id);
        } catch (ReflectiveOperationException e) {
            throw new RuntimeException(e);
        }
    }

    private CreateOrderRequest baseRequest(long productId, int quantity, CustomizationRequest customization) {
        return new CreateOrderRequest(
                new CustomerInfoRequest("Amina Idrissi", "+212600000000", "amina@example.com"),
                new ShippingInfoRequest("Casablanca", "123 Rue Test", null),
                java.util.List.of(new OrderItemRequest(productId, quantity, customization)),
                PaymentMethod.COD
        );
    }

    @Test
    void createOrder_calculatesTotalsServerSide_neverFromClient() {
        Product product = buildProduct(1L, "Personalized Mug", "99.00", 10, true);
        when(productRepository.findById(1L)).thenReturn(Optional.of(product));
        when(productRepository.decreaseStock(1L, 2)).thenReturn(1);
        when(customerRepository.save(any(Customer.class))).thenAnswer(inv -> inv.getArgument(0));
        when(orderRepository.existsByOrderNumber(any())).thenReturn(false);
        when(orderRepository.existsByTrackingCode(any())).thenReturn(false);

        OrderResponse response = orderService.createOrder(baseRequest(1L, 2, null), null);

        // subtotal = 99.00 * 2 = 198.00; below the 500.00 free-delivery threshold -> 30.00 fee
        assertThat(response.subtotal()).isEqualByComparingTo("198.00");
        assertThat(response.deliveryFee()).isEqualByComparingTo("30.00");
        assertThat(response.total()).isEqualByComparingTo("228.00");
        assertThat(response.items()).hasSize(1);
        assertThat(response.items().get(0).unitPrice()).isEqualByComparingTo("99.00");
        verify(productRepository).decreaseStock(1L, 2);
    }

    @Test
    void createOrder_waivesDeliveryFee_whenSubtotalMeetsFreeThreshold() {
        Product product = buildProduct(1L, "Bulk Item", "600.00", 10, true);
        when(productRepository.findById(1L)).thenReturn(Optional.of(product));
        when(productRepository.decreaseStock(1L, 1)).thenReturn(1);
        when(customerRepository.save(any(Customer.class))).thenAnswer(inv -> inv.getArgument(0));
        when(orderRepository.existsByOrderNumber(any())).thenReturn(false);
        when(orderRepository.existsByTrackingCode(any())).thenReturn(false);

        OrderResponse response = orderService.createOrder(baseRequest(1L, 1, null), null);

        assertThat(response.deliveryFee()).isEqualByComparingTo("0.00");
        assertThat(response.total()).isEqualByComparingTo("600.00");
    }

    @Test
    void createOrder_insufficientStockPreCheck_throwsBeforeTouchingDatabase() {
        Product product = buildProduct(1L, "Rare Item", "50.00", 1, true);
        when(productRepository.findById(1L)).thenReturn(Optional.of(product));

        assertThatThrownBy(() -> orderService.createOrder(baseRequest(1L, 5, null), null))
                .isInstanceOf(InsufficientStockException.class);

        verify(productRepository, never()).decreaseStock(anyLong(), anyInt());
    }

    @Test
    void createOrder_concurrentStockLoss_atomicDecrementReturnsZero_throwsInsufficientStock() {
        // Read-check looks fine (stock=5) but a concurrent order wins the race - decreaseStock returns 0.
        Product product = buildProduct(1L, "Contested Item", "50.00", 5, true);
        when(productRepository.findById(1L)).thenReturn(Optional.of(product));
        when(productRepository.decreaseStock(1L, 3)).thenReturn(0);

        assertThatThrownBy(() -> orderService.createOrder(baseRequest(1L, 3, null), null))
                .isInstanceOf(InsufficientStockException.class);
    }

    @Test
    void createOrder_inactiveProduct_isRejected() {
        Product product = buildProduct(1L, "Discontinued", "20.00", 10, false);
        when(productRepository.findById(1L)).thenReturn(Optional.of(product));

        assertThatThrownBy(() -> orderService.createOrder(baseRequest(1L, 1, null), null))
                .isInstanceOf(com.giftme.common.exception.BadRequestException.class);
    }

    @Test
    void createOrder_generatesTrackingCodeAndOrderNumberInExpectedFormat() {
        Product product = buildProduct(1L, "Item", "10.00", 10, true);
        when(productRepository.findById(1L)).thenReturn(Optional.of(product));
        when(productRepository.decreaseStock(1L, 1)).thenReturn(1);
        when(customerRepository.save(any(Customer.class))).thenAnswer(inv -> inv.getArgument(0));
        when(orderRepository.existsByOrderNumber(any())).thenReturn(false);
        when(orderRepository.existsByTrackingCode(any())).thenReturn(false);

        OrderResponse response = orderService.createOrder(baseRequest(1L, 1, null), null);

        assertThat(response.trackingCode()).matches("GM-[A-Z0-9]{6}");
        assertThat(response.orderNumber()).matches("ORD-\\d{8}-[A-Z0-9]{5}");
        assertThat(response.orderStatus()).isEqualTo("PENDING");
        assertThat(response.paymentStatus()).isEqualTo("PENDING");
    }

    @Test
    void createOrder_qrMemoryEnabled_createsMemoryWithUniquePublicCode() {
        Product product = buildProduct(1L, "QR Memory Experience", "179.00", 10, true);
        when(productRepository.findById(1L)).thenReturn(Optional.of(product));
        when(productRepository.decreaseStock(1L, 1)).thenReturn(1);
        when(customerRepository.save(any(Customer.class))).thenAnswer(inv -> inv.getArgument(0));
        when(orderRepository.existsByOrderNumber(any())).thenReturn(false);
        when(orderRepository.existsByTrackingCode(any())).thenReturn(false);
        // First candidate collides, second is free - exercises the retry loop.
        when(memoryRepository.existsByPublicCode(any())).thenReturn(true).thenReturn(false);

        CustomizationRequest customization = new CustomizationRequest(
                "https://cdn.example.com/photo.jpg", "center", 1.0, 0.0, "Happy Birthday!",
                "bold", "Poppins", "#FFFFFF", "Birthday", "Youssef", "We love you!",
                null, null, true);

        OrderResponse response = orderService.createOrder(baseRequest(1L, 1, customization), null);

        var itemCustomization = response.items().get(0).customization();
        assertThat(itemCustomization).isNotNull();
        assertThat(itemCustomization.qrMemoryEnabled()).isTrue();
        assertThat(itemCustomization.memoryPublicCode()).isNotBlank();
        verify(memoryRepository).save(any(com.giftme.domain.Memory.class));
    }

    @Test
    void createOrder_findsExistingCustomerByPhone_insteadOfDuplicating() {
        Customer existing = Customer.builder().name("Old Name").phone("+212600000000").build();
        when(customerRepository.findByPhone("+212600000000")).thenReturn(Optional.of(existing));

        Product product = buildProduct(1L, "Item", "10.00", 10, true);
        when(productRepository.findById(1L)).thenReturn(Optional.of(product));
        when(productRepository.decreaseStock(1L, 1)).thenReturn(1);
        when(orderRepository.existsByOrderNumber(any())).thenReturn(false);
        when(orderRepository.existsByTrackingCode(any())).thenReturn(false);

        orderService.createOrder(baseRequest(1L, 1, null), null);

        verify(customerRepository, never()).save(any(Customer.class));
        assertThat(existing.getName()).isEqualTo("Amina Idrissi"); // refreshed from the new order
    }
}
