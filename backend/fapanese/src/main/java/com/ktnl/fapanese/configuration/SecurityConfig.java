package com.ktnl.fapanese.configuration;


import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.web.SecurityFilterChain;

@Configuration // Đây là class cấu hình cho Spring
@EnableWebSecurity // Bật tính năng bảo mật web của Spring Security
@EnableMethodSecurity // Cho phép dùng @PreAuthorize, @PostAuthorize ở Controller/Service
public class SecurityConfig {
    private final String[] PUBLIC_ENDPOINT ={"/api/auth/login"};

    @Autowired
    private CustomJwtDecoder customJwtDecoder;


    public SecurityFilterChain filterChain(HttpSecurity httpSecurity) throws Exception {
        httpSecurity.authorizeHttpRequests(request ->
                request.requestMatchers(HttpMethod.POST, PUBLIC_ENDPOINT)
                        .permitAll()
                        .anyRequest()
                        .authenticated());


    }
}
