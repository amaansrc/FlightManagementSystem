package com.example.FlightMgmtSys.annotation;

import java.lang.annotation.ElementType;
import java.lang.annotation.Retention;
import java.lang.annotation.RetentionPolicy;
import java.lang.annotation.Target;

/**
 * Marker annotation for controller methods that require ADMIN privileges.
 * Methods annotated with {@code @AdminOnly} will be rejected with HTTP 403
 * if the logged-in user's {@code userType} is not "ADMIN".
 *
 * @see com.example.FlightMgmtSys.interceptor.AuthInterceptor
 */
@Target(ElementType.METHOD)
@Retention(RetentionPolicy.RUNTIME)
public @interface AdminOnly {
}
