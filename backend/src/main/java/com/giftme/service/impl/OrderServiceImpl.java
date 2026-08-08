package com.giftme.service.impl;

import com.giftme.common.exception.BadRequestException;
import com.giftme.common.exception.ErrorCode;
import com.giftme.common.exception.InsufficientStockException;
import com.giftme.common.exception.ResourceNotFoundException;
import com.giftme.common.util.RandomCodeGenerator;
import com.giftme.config.GiftMeProperties;
import com.giftme.domain.Customer;
import com.giftme.domain.Customization;
import com.giftme.domain.Memory;
import com.giftme.domain.Order;
import com.giftme.domain.OrderItem;
import com.giftme.domain.Product;
import com.giftme.domain.TrackingEvent;
import com.giftme.domain.enums.OrderStatus;
import com.giftme.domain.enums.PaymentStatus;
import com.giftme.dto.order.CreateOrderRequest;
import com.giftme.dto.order.CustomerInfoRequest;
import com.giftme.dto.order.CustomizationRequest;
import com.giftme.dto.order.OrderItemRequest;
import com.giftme.dto.order.OrderResponse;
import com.giftme.mapper.OrderMapper;
import com.giftme.repository.CustomerRepository;
import com.giftme.repository.MemoryRepository;
import com.giftme.repository.OrderRepository;
import com.giftme.repository.ProductRepository;
import com.giftme.repository.UserRepository;
import com.giftme.service.OrderService;
import java.math.BigDecimal;
import java.time.LocalDate;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;

@Service
@RequiredArgsConstructor
public class OrderServiceImpl implements OrderService {

    private static final int MAX_CODE_ATTEMPTS = 10;
    /** No SLA was specified in the brief; 5 days is a reasonable default for a COD gifting business. */
    private static final int ESTIMATED_DELIVERY_DAYS = 5;

    private final ProductRepository productRepository;
    private final CustomerRepository customerRepository;
    private final UserRepository userRepository;
    private final OrderRepository orderRepository;
    private final MemoryRepository memoryRepository;
    private final GiftMeProperties properties;

    @Override
    @Transactional
    public OrderResponse createOrder(CreateOrderRequest request, Long authenticatedUserId) {
        Customer customer = findOrCreateCustomer(request.customer());

        Order order = Order.builder()
                .orderNumber(generateUniqueOrderNumber())
                .trackingCode(generateUniqueTrackingCode())
                .user(authenticatedUserId != null ? userRepository.findById(authenticatedUserId).orElse(null) : null)
                .customer(customer)
                .customerName(request.customer().name())
                .phone(request.customer().phone())
                .email(request.customer().email())
                .city(request.shipping().city())
                .address(request.shipping().address())
                .notes(request.shipping().notes())
                .paymentMethod(request.paymentMethod())
                .paymentStatus(PaymentStatus.PENDING)
                .orderStatus(OrderStatus.PENDING)
                .estimatedDelivery(LocalDate.now().plusDays(ESTIMATED_DELIVERY_DAYS))
                .subtotal(BigDecimal.ZERO)
                .deliveryFee(BigDecimal.ZERO)
                .total(BigDecimal.ZERO)
                .build();

        BigDecimal subtotal = BigDecimal.ZERO;
        for (OrderItemRequest itemRequest : request.items()) {
            subtotal = subtotal.add(addOrderItem(order, itemRequest));
        }

        BigDecimal deliveryFee = calculateDeliveryFee(subtotal);
        order.setSubtotal(subtotal);
        order.setDeliveryFee(deliveryFee);
        order.setTotal(subtotal.add(deliveryFee));

        order.addTrackingEvent(TrackingEvent.builder()
                .status(OrderStatus.PENDING)
                .description("Order created")
                .build());

        orderRepository.save(order);
        return OrderMapper.toResponse(order);
    }

    /** Validates, prices and reserves stock for one line item; returns its line total. */
    private BigDecimal addOrderItem(Order order, OrderItemRequest itemRequest) {
        Product product = productRepository.findById(itemRequest.productId())
                .orElseThrow(() -> new ResourceNotFoundException(ErrorCode.PRODUCT_NOT_FOUND,
                        "Product not found: " + itemRequest.productId()));

        if (!product.isActive()) {
            throw new BadRequestException(ErrorCode.VALIDATION_ERROR,
                    "Product is not currently available: " + product.getName());
        }
        if (product.getStock() < itemRequest.quantity()) {
            throw new InsufficientStockException(product.getName(), itemRequest.quantity(), product.getStock());
        }

        int updatedRows = productRepository.decreaseStock(product.getId(), itemRequest.quantity());
        if (updatedRows == 0) {
            // Lost a race to a concurrent order between the check above and this atomic update.
            throw new InsufficientStockException(product.getName(), itemRequest.quantity(), product.getStock());
        }

        BigDecimal unitPrice = product.getPrice(); // Server-side price - the request never supplies one.
        BigDecimal lineTotal = unitPrice.multiply(BigDecimal.valueOf(itemRequest.quantity()));

        OrderItem orderItem = OrderItem.builder()
                .product(product)
                .productNameSnapshot(product.getName())
                .unitPrice(unitPrice)
                .quantity(itemRequest.quantity())
                .totalPrice(lineTotal)
                .build();

        if (itemRequest.customization() != null) {
            orderItem.setCustomization(buildCustomization(itemRequest.customization()));
        }

        order.addItem(orderItem);
        return lineTotal;
    }

    private Customization buildCustomization(CustomizationRequest request) {
        Customization customization = Customization.builder()
                .imageUrl(request.imageUrl())
                .imagePosition(request.imagePosition())
                .imageScale(request.imageScale())
                .imageRotation(request.imageRotation())
                .text(request.text())
                .textStyle(request.textStyle())
                .font(request.font())
                .textColor(request.textColor())
                .occasion(request.occasion())
                .recipientName(request.recipientName())
                .giftMessage(request.giftMessage())
                .videoUrl(request.videoUrl())
                .audioUrl(request.audioUrl())
                .qrMemoryEnabled(request.qrMemoryEnabled())
                .build();

        if (request.qrMemoryEnabled()) {
            Memory memory = Memory.builder()
                    .publicCode(generateUniqueMemoryCode())
                    .title(memoryTitle(request))
                    .message(request.giftMessage())
                    .mainImage(request.imageUrl())
                    .videoUrl(request.videoUrl())
                    .audioUrl(request.audioUrl())
                    .active(true)
                    .build();
            memoryRepository.save(memory);
            customization.setMemory(memory);
        }

        return customization;
    }

    private String memoryTitle(CustomizationRequest request) {
        if (StringUtils.hasText(request.recipientName())) {
            return "A memory for " + request.recipientName();
        }
        return "A GiftMe Memory";
    }

    private Customer findOrCreateCustomer(CustomerInfoRequest info) {
        return customerRepository.findByPhone(info.phone())
                .map(existing -> {
                    existing.setName(info.name());
                    if (StringUtils.hasText(info.email())) {
                        existing.setEmail(info.email());
                    }
                    return existing;
                })
                .orElseGet(() -> customerRepository.save(Customer.builder()
                        .name(info.name())
                        .phone(info.phone())
                        .email(info.email())
                        .build()));
    }

    private BigDecimal calculateDeliveryFee(BigDecimal subtotal) {
        BigDecimal freeThreshold = properties.order().deliveryFeeFreeThreshold();
        if (freeThreshold != null && subtotal.compareTo(freeThreshold) >= 0) {
            return BigDecimal.ZERO;
        }
        return properties.order().deliveryFeeDefault();
    }

    private String generateUniqueOrderNumber() {
        for (int i = 0; i < MAX_CODE_ATTEMPTS; i++) {
            String candidate = RandomCodeGenerator.orderNumber();
            if (!orderRepository.existsByOrderNumber(candidate)) {
                return candidate;
            }
        }
        throw new IllegalStateException("Unable to generate a unique order number");
    }

    private String generateUniqueTrackingCode() {
        for (int i = 0; i < MAX_CODE_ATTEMPTS; i++) {
            String candidate = RandomCodeGenerator.trackingCode();
            if (!orderRepository.existsByTrackingCode(candidate)) {
                return candidate;
            }
        }
        throw new IllegalStateException("Unable to generate a unique tracking code");
    }

    private String generateUniqueMemoryCode() {
        for (int i = 0; i < MAX_CODE_ATTEMPTS; i++) {
            String candidate = RandomCodeGenerator.memoryPublicCode();
            if (!memoryRepository.existsByPublicCode(candidate)) {
                return candidate;
            }
        }
        throw new IllegalStateException("Unable to generate a unique memory code");
    }
}
