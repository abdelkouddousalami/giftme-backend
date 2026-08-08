package com.giftme.common.exception;

import org.springframework.http.HttpStatus;

public class InsufficientStockException extends ApiException {

    public InsufficientStockException(String productName, int requested, int available) {
        super(HttpStatus.CONFLICT, ErrorCode.INSUFFICIENT_STOCK,
                "Insufficient stock for '%s': requested %d, available %d".formatted(productName, requested, available));
    }
}
