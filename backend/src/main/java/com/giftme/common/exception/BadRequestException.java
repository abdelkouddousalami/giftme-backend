package com.giftme.common.exception;

import org.springframework.http.HttpStatus;

public class BadRequestException extends ApiException {

    public BadRequestException(ErrorCode code, String message) {
        super(HttpStatus.BAD_REQUEST, code, message);
    }

    public BadRequestException(String message) {
        this(ErrorCode.VALIDATION_ERROR, message);
    }
}
