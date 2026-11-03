package com.founderbridge.auth;

import com.founderbridge.auth.service.*;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.context.properties.ConfigurationPropertiesScan;
import org.springframework.context.annotation.*;
import org.springframework.http.HttpMethod;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.argon2.Argon2PasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.web.cors.*;

import java.util.List;

@Configuration
@EnableWebSecurity
@ConfigurationPropertiesScan("com.founderbridge")
public class SecurityConfig {

    private final JwtAuthenticationFilter    jwtFilter;
    private final GoogleOAuth2SuccessHandler oauthSuccessHandler;

    @Value("${app.cors.allowed-origins:http://localhost:3000}")
    private String allowedOrigins;

    public SecurityConfig(JwtAuthenticationFilter jwtFilter,
                          GoogleOAuth2SuccessHandler oauthSuccessHandler) {
        this.jwtFilter          = jwtFilter;
        this.oauthSuccessHandler = oauthSuccessHandler;
    }

    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
        return http
            .cors(cors -> cors.configurationSource(corsConfigurationSource()))
            .csrf(csrf -> csrf.disable())
            .sessionManagement(s -> s.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
            .authorizeHttpRequests(auth -> auth
                .requestMatchers(HttpMethod.POST,
                    "/api/v1/auth/register",
                    "/api/v1/auth/login",
                    "/api/v1/auth/refresh",
                    "/api/v1/auth/forgot-password",
                    "/api/v1/auth/reset-password"
                ).permitAll()
                .requestMatchers(HttpMethod.GET,
                    "/api/v1/auth/verify-email",
                    "/api/v1/auth/oauth2/**",
                    "/api/v1/users/*/profile",
                    "/api/v1/companies/*/public",
                    "/api/v1/feed/public",
                    "/api/docs/**",
                    "/api/swagger-ui/**",
                    "/api/swagger-ui.html",
                    "/actuator/health"
                ).permitAll()
                .anyRequest().authenticated()
            )
            .oauth2Login(oauth -> oauth
                .authorizationEndpoint(ep ->
                    ep.baseUri("/api/v1/auth/oauth2/authorize"))
                .redirectionEndpoint(ep ->
                    ep.baseUri("/api/v1/auth/oauth2/*/callback"))
                .successHandler(oauthSuccessHandler)
            )
            .addFilterBefore(jwtFilter, UsernamePasswordAuthenticationFilter.class)
            .build();
    }

    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration config = new CorsConfiguration();
        List.of(allowedOrigins.split(",")).forEach(o -> config.addAllowedOrigin(o.trim()));
        config.addAllowedHeader("*");
        config.addAllowedMethod("*");
        config.setAllowCredentials(true);
        config.setMaxAge(3600L);

        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", config);
        return source;
    }

    @Bean
    public PasswordEncoder passwordEncoder() {
        return Argon2PasswordEncoder.defaultsForSpringSecurity_v5_8();
    }
}
