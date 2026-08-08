package com.giftme.common.response;

import com.fasterxml.jackson.annotation.JsonInclude;
import java.time.Instant;
import lombok.Getter;

/**
 * Single response envelope for the whole API. Jackson is configured
 * (default-property-inclusion: non_null) to drop null fields, so this one
 * class naturally serializes to either the success shape (success, data,
 * message) or the error shape (success, message, code, timestamp, path)
 * without needing two separate classes.
 */
@Getter
@JsonInclude(JsonInclude.Include.NON_NULL)
public class ApiResponse<T> {

    private final boolean success;
    private final T data;
    private final String message;
    private final String code;
    private final Instant timestamp;
    private final String path;

    private ApiResponse(boolean success, T data, String message, String code, Instant timestamp, String path) {
        this.success = success;
        this.data = data;
        this.message = message;
        this.code = code;
        this.timestamp = timestamp;
        this.path = path;
    }

    public static <T> ApiResponse<T> success(T data) {
        return success(data, "Success");
    }

    public static <T> ApiResponse<T> success(T data, String message) {
        return new ApiResponse<>(true, data, message, null, null, null);
    }

    public static ApiResponse<Void> error(String message, String code, String path) {
        return new ApiResponse<>(false, null, message, code, Instant.now(), path);
    }
}
