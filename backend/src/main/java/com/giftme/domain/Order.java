package com.giftme.domain;

import com.giftme.domain.enums.OrderStatus;
import com.giftme.domain.enums.PaymentMethod;
import com.giftme.domain.enums.PaymentStatus;
import jakarta.persistence.CascadeType;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.FetchType;
import jakarta.persistence.Index;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.OneToMany;
import jakarta.persistence.OrderBy;
import jakarta.persistence.Table;
import jakarta.persistence.Version;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.EqualsAndHashCode;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import lombok.ToString;

@Entity
@Table(name = "orders", indexes = {
        @Index(name = "idx_order_number", columnList = "order_number", unique = true),
        @Index(name = "idx_order_tracking_code", columnList = "tracking_code", unique = true),
        @Index(name = "idx_order_phone", columnList = "phone"),
        @Index(name = "idx_order_status", columnList = "order_status"),
        @Index(name = "idx_order_created_at", columnList = "created_at")
})
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@EqualsAndHashCode(callSuper = true)
@ToString(of = {"orderNumber", "trackingCode", "orderStatus", "total"})
public class Order extends BaseEntity {

    @Column(name = "order_number", nullable = false, unique = true, updatable = false, length = 40)
    private String orderNumber;

    @Column(name = "tracking_code", nullable = false, unique = true, updatable = false, length = 20)
    private String trackingCode;

    /** Nullable: set only when the order was placed by an authenticated customer. */
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id")
    private User user;

    /** Always set: find-or-create by phone at order creation time, for admin customer analytics. */
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "customer_id")
    private Customer customer;

    @Column(nullable = false)
    private String customerName;

    @Column(nullable = false)
    private String phone;

    private String email;

    @Column(nullable = false)
    private String city;

    @Column(nullable = false, columnDefinition = "TEXT")
    private String address;

    @Column(columnDefinition = "TEXT")
    private String notes;

    @Column(nullable = false, precision = 10, scale = 2)
    private BigDecimal subtotal;

    @Column(name = "delivery_fee", nullable = false, precision = 10, scale = 2)
    private BigDecimal deliveryFee;

    @Column(nullable = false, precision = 10, scale = 2)
    private BigDecimal total;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private PaymentMethod paymentMethod;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private PaymentStatus paymentStatus;

    @Enumerated(EnumType.STRING)
    @Column(name = "order_status", nullable = false, length = 20)
    private OrderStatus orderStatus;

    private LocalDate estimatedDelivery;

    @Builder.Default
    @OneToMany(mappedBy = "order", cascade = CascadeType.ALL, orphanRemoval = true, fetch = FetchType.LAZY)
    private List<OrderItem> items = new ArrayList<>();

    @Builder.Default
    @OneToMany(mappedBy = "order", cascade = CascadeType.ALL, orphanRemoval = true, fetch = FetchType.LAZY)
    @OrderBy("createdAt ASC")
    private List<TrackingEvent> trackingEvents = new ArrayList<>();

    /** Optimistic locking guards concurrent admin status updates and stock adjustments. */
    @Version
    private Long version;

    public void addItem(OrderItem item) {
        items.add(item);
        item.setOrder(this);
    }

    public void addTrackingEvent(TrackingEvent event) {
        trackingEvents.add(event);
        event.setOrder(this);
    }
}
