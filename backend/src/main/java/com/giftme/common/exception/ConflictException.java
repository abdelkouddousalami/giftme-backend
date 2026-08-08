package com.giftme.common.exception;

import org.springframework.http.HttpStatus;

public class ConflictException extends ApiException {

    public ConflictException(ErrorCode code, String message) {
        super(HttpStatus.CONFLICT, code, message);
    }
}
