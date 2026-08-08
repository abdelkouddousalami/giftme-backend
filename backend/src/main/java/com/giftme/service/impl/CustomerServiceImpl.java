package com.giftme.service.impl;

import com.giftme.common.exception.ErrorCode;
import com.giftme.common.exception.ResourceNotFoundException;
import com.giftme.common.response.PagedResponse;
import com.giftme.domain.Customer;
import com.giftme.dto.customer.CustomerResponse;
import com.giftme.dto.order.AdminOrderSummaryResponse;
import com.giftme.mapper.OrderMapper;
import com.giftme.repository.CustomerRepository;
import com.giftme.repository.OrderRepository;
import com.giftme.service.CustomerService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class CustomerServiceImpl implements CustomerService {

    private final CustomerRepository customerRepository;
    private final OrderRepository orderRepository;

    @Override
    @Transactional(readOnly = true)
    public PagedResponse<CustomerResponse> list(Pageable pageable) {
        Page<Customer> page = customerRepository.findAll(pageable);
        return PagedResponse.of(page, this::toResponse);
    }

    @Override
    @Transactional(readOnly = true)
    public CustomerResponse getById(Long id) {
        return toResponse(findById(id));
    }

    @Override
    @Transactional(readOnly = true)
    public PagedResponse<AdminOrderSummaryResponse> getOrders(Long id, Pageable pageable) {
        Customer customer = findById(id);
        Page<com.giftme.domain.Order> page = orderRepository.findByCustomer(customer, pageable);
        return PagedResponse.of(page, OrderMapper::toSummary);
    }

    private CustomerResponse toResponse(Customer customer) {
        // totalOrders/totalSpent are computed here rather than stored, so they can never drift
        // from the orders table (e.g. after a cancellation) - see Customer's class comment.
        long totalOrders = orderRepository.countByCustomer(customer);
        var totalSpent = orderRepository.sumTotalByCustomerExcludingCancelled(customer);
        return new CustomerResponse(
                customer.getId(),
                customer.getName(),
                customer.getPhone(),
                customer.getEmail(),
                totalOrders,
                totalSpent,
                customer.getCreatedAt()
        );
    }

    private Customer findById(Long id) {
        return customerRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException(ErrorCode.CUSTOMER_NOT_FOUND, "Customer not found: " + id));
    }
}
