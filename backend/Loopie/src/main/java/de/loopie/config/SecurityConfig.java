package de.loopie.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;

/**
 * Zentral Security config for Loopie.
 */
@Configuration
@EnableWebSecurity
public class SecurityConfig {

    /**
     * Encodes the Password set by USER.
     * @return a {@link BCryptPasswordEncoder} instance used for encoding and verifying passwords
     */
    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }

    /**
     * Defines the security filterchain.
     * @param http the {@link HttpSecurity} object to configure web-based security rules
     * @return the built {@link SecurityFilterChain} instance used by Spring Security
     * @throws Exception if an error occurs while constructing the filter chain
     */
    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
        http
                .csrf(csrf -> csrf.disable())
                .headers(headers -> headers
                        .frameOptions(frame -> frame.sameOrigin())
                )
                .authorizeHttpRequests(auth -> auth
                        .anyRequest().permitAll()
                );

        return http.build();
    }
}