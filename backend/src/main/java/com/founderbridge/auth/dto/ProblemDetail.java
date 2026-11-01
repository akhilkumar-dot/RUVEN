package com.founderbridge.auth.dto;

/** RFC 7807 Problem JSON - returned for all API errors. */
public record ProblemDetail(
    String type,
    String title,
    int status,
    String detail,
    String code
) {
    public static ProblemDetail of(int status, String title, String detail, String code) {
        return new ProblemDetail("about:blank", title, status, detail, code);
    }
}
