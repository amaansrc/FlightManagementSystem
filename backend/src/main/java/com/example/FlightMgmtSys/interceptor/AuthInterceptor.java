package com.example.FlightMgmtSys.interceptor;

import com.example.FlightMgmtSys.annotation.AdminOnly;
import com.example.FlightMgmtSys.model.User;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import jakarta.servlet.http.HttpSession;

import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Component;
import org.springframework.web.method.HandlerMethod;
import org.springframework.web.servlet.HandlerInterceptor;

import java.time.LocalDateTime;

/**
 * Interceptor that enforces authentication and role-based access control.
 *
 * <p><b>Authentication:</b> Every request (except those excluded in
 * {@link com.example.FlightMgmtSys.config.WebMvcConfig}) must have a valid
 * {@code loggedInUser} in the HTTP session. If missing, returns HTTP 401.
 *
 * <p><b>Authorization:</b> If the target controller method is annotated with
 * {@link AdminOnly}, the logged-in user's {@code userType} must be "ADMIN".
 * If not, returns HTTP 403.
 */
@Component
public class AuthInterceptor implements HandlerInterceptor {

    @Override
    public boolean preHandle(HttpServletRequest request, HttpServletResponse response,
                             Object handler) throws Exception {
        // Only intercept actual controller methods, not static resources
        if (!(handler instanceof HandlerMethod handlerMethod)) {
            return true;
        }

        // --- Authentication check ---
        HttpSession session = request.getSession(false);
        User loggedInUser = null;
        if (session != null) {
            loggedInUser = (User) session.getAttribute("loggedInUser");
        }

        if (loggedInUser == null) {
            sendErrorResponse(response, HttpStatus.UNAUTHORIZED,
                    "You must be logged in to access this resource.");
            return false;
        }

        // --- Authorization check ---
        if (handlerMethod.hasMethodAnnotation(AdminOnly.class)) {
            if (!"ADMIN".equalsIgnoreCase(loggedInUser.getUserType())) {
                sendErrorResponse(response, HttpStatus.FORBIDDEN,
                        "Access denied. Administrator privileges are required.");
                return false;
            }
        }

        return true;
    }

    /**
     * Writes a structured JSON error response matching the format used by
     * {@link com.example.FlightMgmtSys.exception.GlobalExceptionHandler}.
     */
    private void sendErrorResponse(HttpServletResponse response, HttpStatus status,
                                   String message) throws Exception {
        String json = "{"
                + "\"timestamp\":\"" + LocalDateTime.now() + "\","
                + "\"status\":" + status.value() + ","
                + "\"error\":\"" + status.getReasonPhrase() + "\","
                + "\"message\":\"" + message + "\""
                + "}";

        response.setStatus(status.value());
        response.setContentType(MediaType.APPLICATION_JSON_VALUE);
        response.getWriter().write(json);
    }
}
