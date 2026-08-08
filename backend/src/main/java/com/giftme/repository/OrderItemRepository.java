package com.giftme.repository;

import com.giftme.domain.OrderItem;
import java.util.List;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

public interface OrderItemRepository extends JpaRepository<OrderItem, Long> {

    @Query("SELECT oi.product.id AS productId, oi.productNameSnapshot AS productName, "
            + "SUM(oi.quantity) AS totalQuantity, SUM(oi.totalPrice) AS totalRevenue "
            + "FROM OrderItem oi WHERE oi.order.orderStatus <> com.giftme.domain.enums.OrderStatus.CANCELLED "
            + "GROUP BY oi.product.id, oi.productNameSnapshot "
            + "ORDER BY SUM(oi.quantity) DESC")
    List<TopProductProjection> findTopProducts(Pageable pageable);
}
