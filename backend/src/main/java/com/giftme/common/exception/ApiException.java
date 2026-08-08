package com.giftme.common.exception;

import lombok.Getter;
import org.springframework.http.HttpStatus;

@Getter
public abstract class ApiException extends RuntimeException {

    private final HttpStatus status;
    private final ErrorCode code;

    protected ApiException(HttpStatus status, ErrorCode code, String message) {
        super(message);
        this.status = status;
        this.code = code;
    }
}
