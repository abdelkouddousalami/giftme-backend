package com.giftme.service.impl;

import com.giftme.domain.enums.OrderStatus;
import com.giftme.dto.dashboard.DashboardStatsResponse;
import com.giftme.dto.dashboard.OrdersChartPointResponse;
import com.giftme.dto.dashboard.TopProductResponse;
import com.giftme.repository.CustomerRepository;
import com.giftme.repository.OrderItemRepository;
import com.giftme.repository.OrderRepository;
import com.giftme.repository.OrderStatusCountProjection;
import com.giftme.repository.ProductRepository;
import com.giftme.service.DashboardService;
import java.math.BigDecimal;
import java.sql.Timestamp;
import java.time.Instant;
import java.time.LocalDate;
import java.time.ZoneOffset;
import java.util.EnumMap;
import java.util.List;
import java.util.Map;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class DashboardServiceImpl implements DashboardService {

    private static final int DEFAULT_CHART_WINDOW_DAYS = 30;

    private final OrderRepository orderRepository;
    private final OrderItemRepository orderItemRepository;
    private final CustomerRepository customerRepository;
    private final ProductRepository productRepository;

    @Override
    @Transactional(readOnly = true)
    public DashboardStatsResponse getStats() {
        Map<OrderStatus, Long> counts = new EnumMap<>(OrderStatus.class);
        for (OrderStatus status : OrderStatus.values()) {
            counts.put(status, 0L);
        }
        for (OrderStatusCountProjection row : orderRepository.countGroupedByStatus()) {
            counts.put(row.getStatus(), row.getCount());
        }
        long totalOrders = counts.values().stream().mapToLong(Long::longValue).sum();

        Instant startOfToday = LocalDate.now(ZoneOffset.UTC).atStartOfDay(ZoneOffset.UTC).toInstant();
        Instant startOfTomorrow = startOfToday.plusSeconds(24 * 3600);

        return new DashboardStatsResponse(
                totalOrders,
                counts.get(OrderStatus.PENDING),
                counts.get(OrderStatus.CONFIRMED),
                counts.get(OrderStatus.PREPARING),
                counts.get(OrderStatus.SHIPPED),
                counts.get(OrderStatus.DELIVERED),
                counts.get(OrderStatus.CANCELLED),
                orderRepository.sumRevenueExcludingCancelled(),
                orderRepository.countByCreatedAtBetween(startOfToday, startOfTomorrow),
                orderRepository.sumRevenueExcludingCancelledBetween(startOfToday, startOfTomorrow),
                customerRepository.count(),
                productRepository.count()
        );
    }

    @Override
    @Transactional(readOnly = true)
    public List<OrdersChartPointResponse> getOrdersChart(LocalDate from, LocalDate to) {
        LocalDate effectiveTo = to != null ? to : LocalDate.now(ZoneOffset.UTC);
        LocalDate effectiveFrom = from != null ? from : effectiveTo.minusDays(DEFAULT_CHART_WINDOW_DAYS - 1L);

        Instant fromInstant = effectiveFrom.atStartOfDay(ZoneOffset.UTC).toInstant();
        Instant toInstant = effectiveTo.plusDays(1).atStartOfDay(ZoneOffset.UTC).toInstant();

        return orderRepository.findOrdersChartData(fromInstant, toInstant).stream()
                .map(this::toChartPoint)
                .toList();
    }

    @Override
    @Transactional(readOnly = true)
    public List<TopProductResponse> getTopProducts(int limit) {
        return orderItemRepository.findTopProducts(PageRequest.of(0, limit)).stream()
                .map(row -> new TopProductResponse(row.getProductId(), row.getProductName(), row.getTotalQuantity(), row.getTotalRevenue()))
                .toList();
    }

    private OrdersChartPointResponse toChartPoint(Object[] row) {
        LocalDate date = toInstant(row[0]).atZone(ZoneOffset.UTC).toLocalDate();
        long orderCount = ((Number) row[1]).longValue();
        BigDecimal revenue = (BigDecimal) row[2];
        return new OrdersChartPointResponse(date, orderCount, revenue);
    }

    /**
     * The native date_trunc(...) column comes back as java.time.Instant with this project's
     * Hibernate 6 + pgjdbc combination, but that mapping isn't part of any public contract -
     * defend against a java.sql.Timestamp too, since driver/Hibernate version upgrades have
     * changed this before.
     */
    private Instant toInstant(Object value) {
        if (value instanceof Instant instant) {
            return instant;
        }
        if (value instanceof Timestamp timestamp) {
            return timestamp.toInstant();
        }
        throw new IllegalStateException("Unexpected JDBC type for date_trunc result: " + value.getClass());
    }
}
