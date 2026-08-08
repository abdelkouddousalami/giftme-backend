package com.giftme.common.exception;

import com.giftme.common.response.ApiResponse;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.ConstraintViolationException;
import java.util.stream.Collectors;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.HttpStatusCode;
import org.springframework.http.ResponseEntity;
import org.springframework.http.converter.HttpMessageNotReadableException;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.DisabledException;
import org.springframework.security.core.AuthenticationException;
import org.springframework.validation.FieldError;
import org.springframework.web.HttpRequestMethodNotSupportedException;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.MissingServletRequestParameterException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;
import org.springframework.web.context.request.WebRequest;
import org.springframework.web.method.annotation.HandlerMethodValidationException;
import org.springframework.web.method.annotation.MethodArgumentTypeMismatchException;
import org.springframework.web.multipart.MaxUploadSizeExceededException;
import org.springframework.web.servlet.mvc.method.annotation.ResponseEntityExceptionHandler;

@RestControllerAdvice
public class GlobalExceptionHandler extends ResponseEntityExceptionHandler {

    private static final Logger log = LoggerFactory.getLogger(GlobalExceptionHandler.class);

    @ExceptionHandler(ApiException.class)
    public ResponseEntity<ApiResponse<Void>> handleApiException(ApiException ex, HttpServletRequest request) {
        return build(ex.getStatus(), ex.getCode().name(), ex.getMessage(), request);
    }

    @ExceptionHandler(ConstraintViolationException.class)
    public ResponseEntity<ApiResponse<Void>> handleConstraintViolation(ConstraintViolationException ex, HttpServletRequest request) {
        String message = ex.getConstraintViolations().stream()
                .map(v -> v.getPropertyPath() + ": " + v.getMessage())
                .collect(Collectors.joining("; "));
        return build(HttpStatus.BAD_REQUEST, ErrorCode.VALIDATION_ERROR.name(), message, request);
    }

    @ExceptionHandler(DataIntegrityViolationException.class)
    public ResponseEntity<ApiResponse<Void>> handleDataIntegrityViolation(DataIntegrityViolationException ex, HttpServletRequest request) {
        log.warn("Data integrity violation on {}: {}", request.getRequestURI(), ex.getMessage());
        return build(HttpStatus.CONFLICT, ErrorCode.RESOURCE_NOT_FOUND.name(),
                "The request conflicts with existing data", request);
    }

    @ExceptionHandler(AccessDeniedException.class)
    public ResponseEntity<ApiResponse<Void>> handleAccessDenied(AccessDeniedException ex, HttpServletRequest request) {
        return build(HttpStatus.FORBIDDEN, ErrorCode.ACCESS_DENIED.name(),
                "You do not have permission to perform this action", request);
    }

    @ExceptionHandler(BadCredentialsException.class)
    public ResponseEntity<ApiResponse<Void>> handleBadCredentials(BadCredentialsException ex, HttpServletRequest request) {
        return build(HttpStatus.UNAUTHORIZED, ErrorCode.INVALID_CREDENTIALS.name(), "Invalid email or password", request);
    }

    @ExceptionHandler(DisabledException.class)
    public ResponseEntity<ApiResponse<Void>> handleDisabled(DisabledException ex, HttpServletRequest request) {
        return build(HttpStatus.UNAUTHORIZED, ErrorCode.ACCOUNT_DISABLED.name(), "This account has been disabled", request);
    }

    @ExceptionHandler(AuthenticationException.class)
    public ResponseEntity<ApiResponse<Void>> handleAuthentication(AuthenticationException ex, HttpServletRequest request) {
        return build(HttpStatus.UNAUTHORIZED, ErrorCode.AUTHENTICATION_REQUIRED.name(), "Authentication is required", request);
    }

    @ExceptionHandler(Exception.class)
    public ResponseEntity<ApiResponse<Void>> handleUnexpected(Exception ex, HttpServletRequest request) {
        log.error("Unhandled exception on {}", request.getRequestURI(), ex);
        return build(HttpStatus.INTERNAL_SERVER_ERROR, ErrorCode.INTERNAL_ERROR.name(),
                "An unexpected error occurred", request);
    }

    // --- Overrides for exceptions Spring MVC's base handler already intercepts before they reach @ExceptionHandler ---

    @Override
    protected ResponseEntity<Object> handleMethodArgumentNotValid(MethodArgumentNotValidException ex,
            HttpHeaders headers, HttpStatusCode status, WebRequest request) {
        String message = ex.getBindingResult().getFieldErrors().stream()
                .map(fe -> fe.getField() + ": " + fe.getDefaultMessage())
                .collect(Collectors.joining("; "));
        if (message.isBlank()) {
            message = "Validation failed";
        }
        return toEntity(HttpStatus.BAD_REQUEST, ErrorCode.VALIDATION_ERROR.name(), message, request);
    }

    @Override
    protected ResponseEntity<Object> handleHandlerMethodValidationException(HandlerMethodValidationException ex,
            HttpHeaders headers, HttpStatusCode status, WebRequest request) {
        return toEntity(HttpStatus.BAD_REQUEST, ErrorCode.VALIDATION_ERROR.name(), "Validation failed", request);
    }

    @Override
    protected ResponseEntity<Object> handleHttpMessageNotReadable(HttpMessageNotReadableException ex,
            HttpHeaders headers, HttpStatusCode status, WebRequest request) {
        return toEntity(HttpStatus.BAD_REQUEST, ErrorCode.VALIDATION_ERROR.name(), "Malformed request body", request);
    }

    @Override
    protected ResponseEntity<Object> handleMissingServletRequestParameter(MissingServletRequestParameterException ex,
            HttpHeaders headers, HttpStatusCode status, WebRequest request) {
        return toEntity(HttpStatus.BAD_REQUEST, ErrorCode.VALIDATION_ERROR.name(),
                "Missing required parameter: " + ex.getParameterName(), request);
    }

    @Override
    protected ResponseEntity<Object> handleHttpRequestMethodNotSupported(HttpRequestMethodNotSupportedException ex,
            HttpHeaders headers, HttpStatusCode status, WebRequest request) {
        return toEntity(HttpStatus.METHOD_NOT_ALLOWED, ErrorCode.VALIDATION_ERROR.name(), ex.getMessage(), request);
    }

    @Override
    protected ResponseEntity<Object> handleMaxUploadSizeExceededException(MaxUploadSizeExceededException ex,
            HttpHeaders headers, HttpStatusCode status, WebRequest request) {
        return toEntity(HttpStatus.PAYLOAD_TOO_LARGE, ErrorCode.FILE_VALIDATION_ERROR.name(),
                "Uploaded file exceeds the maximum allowed size", request);
    }

    @ExceptionHandler(MethodArgumentTypeMismatchException.class)
    public ResponseEntity<ApiResponse<Void>> handleTypeMismatch(MethodArgumentTypeMismatchException ex, HttpServletRequest request) {
        String message = "Invalid value for parameter '%s': %s".formatted(ex.getName(), ex.getValue());
        return build(HttpStatus.BAD_REQUEST, ErrorCode.VALIDATION_ERROR.name(), message, request);
    }

    private ResponseEntity<Object> toEntity(HttpStatus status, String code, String message, WebRequest request) {
        String path = request.getDescription(false).replace("uri=", "");
        return ResponseEntity.status(status).body(ApiResponse.error(message, code, path));
    }

    private ResponseEntity<ApiResponse<Void>> build(HttpStatus status, String code, String message, HttpServletRequest request) {
        return ResponseEntity.status(status).body(ApiResponse.error(message, code, request.getRequestURI()));
    }
}
