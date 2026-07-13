package com.example.FlightMgmtSys.config;

import com.example.FlightMgmtSys.interceptor.AuthInterceptor;

import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.InterceptorRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

/**
 * Web MVC configuration that registers the {@link AuthInterceptor}
 * for all API endpoints, excluding public routes (registration and login).
 */
@Configuration
public class WebMvcConfig implements WebMvcConfigurer {

    private final AuthInterceptor authInterceptor;

    public WebMvcConfig(AuthInterceptor authInterceptor) {
        this.authInterceptor = authInterceptor;
    }

    @Override
    public void addInterceptors(InterceptorRegistry registry) {
        registry.addInterceptor(authInterceptor)
                .addPathPatterns("/api/**")              // protect all API endpoints
                .excludePathPatterns(
                        "/api/users/register",           // public: customer registration
                        "/api/users/login",              // public: login
                        "/api/airports",                 // public: airport list for search
                        "/api/airports/**",              // public: single airport lookup
                        "/api/scheduled-flights/search"  // public: flight search
                );
    }
}
