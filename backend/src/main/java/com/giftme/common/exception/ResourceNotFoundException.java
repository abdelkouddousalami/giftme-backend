package com.giftme.common.exception;

import org.springframework.http.HttpStatus;

public class ResourceNotFoundException extends ApiException {

    public ResourceNotFoundException(ErrorCode code, String message) {
        super(HttpStatus.NOT_FOUND, code, message);
    }

    public static ResourceNotFoundException of(String resource, Object identifier) {
        return new ResourceNotFoundException(ErrorCode.RESOURCE_NOT_FOUND,
                resource + " not found: " + identifier);
    }
}
