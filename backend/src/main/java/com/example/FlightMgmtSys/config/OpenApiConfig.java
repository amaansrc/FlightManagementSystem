package com.example.FlightMgmtSys.config;

import org.springdoc.core.models.GroupedOpenApi;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.access.prepost.PreAuthorize;

import io.swagger.v3.oas.models.Components;
import io.swagger.v3.oas.models.OpenAPI;
import io.swagger.v3.oas.models.security.SecurityRequirement;
import io.swagger.v3.oas.models.security.SecurityScheme;

@Configuration
public class OpenApiConfig {

    private final String[] publicPaths = {
            "/api/users/register",
            "/api/users/login",
            "/api/airports/**",
            "/api/airports",
            "/api/scheduled-flights/search"
    };

    @Bean
    public GroupedOpenApi publicApi() {
        return GroupedOpenApi.builder()
                .group("1. Public API")
                .pathsToMatch(publicPaths)
                .build();
    }

    @Bean
    public GroupedOpenApi adminApi() {
        return GroupedOpenApi.builder()
                .group("2. Admin API")
                .pathsToMatch("/api/**")
                .addOpenApiMethodFilter(method -> 
                        method.isAnnotationPresent(PreAuthorize.class) && 
                        method.getAnnotation(PreAuthorize.class).value().contains("ADMIN"))
                .build();
    }

    @Bean
    public GroupedOpenApi customerApi() {
        return GroupedOpenApi.builder()
                .group("3. Customer API")
                .pathsToMatch("/api/**")
                .pathsToExclude(publicPaths)
                .addOpenApiMethodFilter(method -> 
                        !(method.isAnnotationPresent(PreAuthorize.class) && 
                          method.getAnnotation(PreAuthorize.class).value().contains("ADMIN")))
                .build();
    }

    @Bean
    public OpenAPI customOpenAPI() {
        final String securitySchemeName = "bearerAuth";
        return new OpenAPI()
                .addSecurityItem(new SecurityRequirement().addList(securitySchemeName))
                .components(
                    new Components()
                        .addSecuritySchemes(securitySchemeName,
                            new SecurityScheme()
                                .name(securitySchemeName)
                                .type(SecurityScheme.Type.HTTP)
                                .scheme("bearer")
                                .bearerFormat("JWT")
                        )
                );
    }
}
