package com.giftme.repository;

import com.giftme.domain.Customer;
import com.giftme.domain.Order;
import java.math.BigDecimal;
import java.time.Instant;
import java.util.List;
import java.util.Optional;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface OrderRepository extends JpaRepository<Order, Long>, JpaSpecificationExecutor<Order> {

    Optional<Order> findByOrderNumber(String orderNumber);

    Optional<Order> findByTrackingCode(String trackingCode);

    boolean existsByOrderNumber(String orderNumber);

    boolean existsByTrackingCode(String trackingCode);

    Page<Order> findByCustomer(Customer customer, Pageable pageable);

    @Query("SELECT o.orderStatus AS status, COUNT(o) AS count FROM Order o GROUP BY o.orderStatus")
    List<OrderStatusCountProjection> countGroupedByStatus();

    @Query("SELECT COALESCE(SUM(o.total), 0) FROM Order o WHERE o.orderStatus <> com.giftme.domain.enums.OrderStatus.CANCELLED")
    BigDecimal sumRevenueExcludingCancelled();

    @Query("SELECT COALESCE(SUM(o.total), 0) FROM Order o WHERE o.orderStatus <> com.giftme.domain.enums.OrderStatus.CANCELLED "
            + "AND o.createdAt >= :from AND o.createdAt < :to")
    BigDecimal sumRevenueExcludingCancelledBetween(@Param("from") Instant from, @Param("to") Instant to);

    long countByCreatedAtBetween(Instant from, Instant to);

    /**
     * Grouped-by-day order counts and revenue over a window. Uses Postgres' date_trunc, so
     * it targets the production database only - covered by service-layer unit tests with a
     * mocked repository rather than an integration test against this native query.
     *
     * <p>The double {@code AT TIME ZONE 'UTC'} is deliberate, not redundant: a bare
     * {@code date_trunc('day', o.created_at)} truncates in the DB session's timezone (whatever
     * that happens to be configured as - not necessarily UTC), so "day" boundaries silently
     * drift by the session's UTC offset and can land results on the wrong calendar date. The
     * first cast converts to UTC wall-clock time before truncating; the second casts the
     * truncated plain timestamp back to a timestamptz so the JDBC/Hibernate mapping (and the
     * Instant parsing on the Java side) is unaffected.
     */
    @Query(value = "SELECT date_trunc('day', o.created_at AT TIME ZONE 'UTC') AT TIME ZONE 'UTC' AS day, "
            + "COUNT(*) AS order_count, COALESCE(SUM(o.total), 0) AS revenue "
            + "FROM orders o WHERE o.created_at >= :from AND o.created_at < :to "
            + "AND o.order_status <> 'CANCELLED' GROUP BY day ORDER BY day",
            nativeQuery = true)
    List<Object[]> findOrdersChartData(@Param("from") Instant from, @Param("to") Instant to);

    long countByCustomer(Customer customer);

    @Query("SELECT COALESCE(SUM(o.total), 0) FROM Order o WHERE o.customer = :customer AND o.orderStatus <> com.giftme.domain.enums.OrderStatus.CANCELLED")
    BigDecimal sumTotalByCustomerExcludingCancelled(@Param("customer") Customer customer);
}
