package com.giftme.service;

import com.giftme.common.response.PagedResponse;
import com.giftme.dto.customer.CustomerResponse;
import com.giftme.dto.order.AdminOrderSummaryResponse;
import org.springframework.data.domain.Pageable;

public interface CustomerService {

    PagedResponse<CustomerResponse> list(Pageable pageable);

    CustomerResponse getById(Long id);

    PagedResponse<AdminOrderSummaryResponse> getOrders(Long id, Pageable pageable);
}
