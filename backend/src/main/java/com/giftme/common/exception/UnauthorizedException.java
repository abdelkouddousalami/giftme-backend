package com.giftme.common.exception;

import org.springframework.http.HttpStatus;

public class UnauthorizedException extends ApiException {

    public UnauthorizedException(ErrorCode code, String message) {
        super(HttpStatus.UNAUTHORIZED, code, message);
    }
}
