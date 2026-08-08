package com.giftme.service.impl;

import com.giftme.common.exception.ErrorCode;
import com.giftme.common.exception.ResourceNotFoundException;
import com.giftme.domain.Order;
import com.giftme.dto.tracking.TrackingResponse;
import com.giftme.mapper.OrderMapper;
import com.giftme.repository.OrderRepository;
import com.giftme.service.TrackingService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class TrackingServiceImpl implements TrackingService {

    private final OrderRepository orderRepository;

    @Override
    @Transactional(readOnly = true)
    public TrackingResponse getByTrackingCode(String trackingCode) {
        Order order = orderRepository.findByTrackingCode(trackingCode)
                .orElseThrow(() -> new ResourceNotFoundException(ErrorCode.ORDER_NOT_FOUND,
                        "No order found for tracking code: " + trackingCode));
        return OrderMapper.toTrackingResponse(order);
    }
}
