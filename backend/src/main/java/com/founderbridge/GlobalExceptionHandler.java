package com.founderbridge;

import com.founderbridge.auth.dto.ProblemDetail;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.*;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.core.AuthenticationException;
import org.springframework.validation.FieldError;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.*;

import java.util.stream.Collectors;

@Slf4j
@RestControllerAdvice
public class GlobalExceptionHandler {

    /** Validation errors (400) */
    @ExceptionHandler(MethodArgumentNotValidException.class)
    @ResponseStatus(HttpStatus.BAD_REQUEST)
    public ProblemDetail handleValidation(MethodArgumentNotValidException ex) {
        String detail = ex.getBindingResult().getFieldErrors().stream()
                .map(FieldError::getDefaultMessage)
                .collect(Collectors.joining("; "));
        return ProblemDetail.of(400, "Validation Error", detail, "VALIDATION_ERROR");
    }

    /** Auth errors (401) */
    @ExceptionHandler(AuthenticationException.class)
    @ResponseStatus(HttpStatus.UNAUTHORIZED)
    public ProblemDetail handleAuth(AuthenticationException ex) {
        return ProblemDetail.of(401, "Unauthorized", "Authentication required.", "UNAUTHORIZED");
    }

    /** Access denied (403) */
    @ExceptionHandler(AccessDeniedException.class)
    @ResponseStatus(HttpStatus.FORBIDDEN)
    public ProblemDetail handleForbidden(AccessDeniedException ex) {
        return ProblemDetail.of(403, "Forbidden", "You do not have permission to access this resource.", "FORBIDDEN");
    }

    /** Unimplemented Phase 1+ stubs (501) */
    @ExceptionHandler(UnsupportedOperationException.class)
    @ResponseStatus(HttpStatus.NOT_IMPLEMENTED)
    public ProblemDetail handleNotImplemented(UnsupportedOperationException ex) {
        return ProblemDetail.of(501, "Not Implemented", ex.getMessage(), "NOT_IMPLEMENTED");
    }

    /** Catch-all (500) */
    @ExceptionHandler(Exception.class)
    @ResponseStatus(HttpStatus.INTERNAL_SERVER_ERROR)
    public ProblemDetail handleAll(Exception ex) {
        log.error("Unhandled exception", ex);
        return ProblemDetail.of(500, "Internal Server Error", "An unexpected error occurred.", "INTERNAL_ERROR");
    }
}
