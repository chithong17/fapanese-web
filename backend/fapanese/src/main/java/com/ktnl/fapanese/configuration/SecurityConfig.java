package com.ktnl.fapanese.configuration;


import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.annotation.web.configurers.AbstractHttpConfigurer;
import org.springframework.security.core.AuthenticationException;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.oauth2.server.resource.authentication.JwtAuthenticationConverter;
import org.springframework.security.oauth2.server.resource.authentication.JwtGrantedAuthoritiesConverter;
import org.springframework.security.web.AuthenticationEntryPoint;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;
import org.springframework.web.filter.CorsFilter;

import java.io.IOException;

@Configuration // Đây là class cấu hình cho Spring
@EnableWebSecurity // Bật tính năng bảo mật web của Spring Security
@EnableMethodSecurity // Cho phép dùng @PreAuthorize, @PostAuthorize ở Controller/Service
public class SecurityConfig {
    private final String[] PUBLIC_ENDPOINT ={"/api/auth/login","/api/users/register"};

    @Autowired
    private CustomJwtDecoder customJwtDecoder;

    @Bean
    public SecurityFilterChain filterChain(HttpSecurity httpSecurity) throws Exception {
        httpSecurity.authorizeHttpRequests(request ->
                request.requestMatchers(HttpMethod.POST, PUBLIC_ENDPOINT)
                        .permitAll()
                        .anyRequest()
                        .authenticated());

        // Cấu hình cho việc xác thực bằng JWT
        httpSecurity.oauth2ResourceServer(oauth2 ->
                oauth2.jwt(jwtConfigurer ->
                                // Dùng CustomJwtDecoder để giải mã + verify chữ ký JWT
                                jwtConfigurer.decoder(customJwtDecoder)
                                        // Chuyển "scope/role" trong JWT thành quyền trong Spring Security
                                        .jwtAuthenticationConverter(jwtAuthenticationConverter()))
                        // Nếu token không hợp lệ (sai chữ ký, hết hạn, nằm trong blacklist)
                        // → Spring Security sẽ gọi vào JwtAuthenticationEntryPoint để trả về JSON lỗi
                        .authenticationEntryPoint(new JwtAuthenticationEntryPoint())
        );

        // Tắt CSRF (thường chỉ bật cho ứng dụng web dùng session; REST API thì tắt đi)
        httpSecurity.csrf(AbstractHttpConfigurer::disable);

        return httpSecurity.build();
    }


    /**
     * Cách đọc thông tin quyền (role/permission) từ trong JWT
     */
    @Bean
    JwtAuthenticationConverter jwtAuthenticationConverter(){
        JwtGrantedAuthoritiesConverter jwtGrantedAuthoritiesConverter = new JwtGrantedAuthoritiesConverter();

        // Mặc định Spring sẽ gắn prefix "SCOPE_" vào role
        // Ví dụ "ADMIN" -> "SCOPE_ADMIN"
        // Nhưng do token của mình đã lưu sẵn "ROLE_ADMIN" rồi, nên bỏ prefix đi
        jwtGrantedAuthoritiesConverter.setAuthorityPrefix("");

        // Trả về converter sau khi đã custom
        JwtAuthenticationConverter jwtAuthenticationConverter = new JwtAuthenticationConverter();
        jwtAuthenticationConverter.setJwtGrantedAuthoritiesConverter(jwtGrantedAuthoritiesConverter);

        return jwtAuthenticationConverter;
    }

    @Bean
    PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder(10);
    }

    @Bean
    public CorsFilter corsFilter() {
        CorsConfiguration corsConfiguration = new CorsConfiguration();

        corsConfiguration.addAllowedOrigin("*");
        corsConfiguration.addAllowedMethod("*");
        corsConfiguration.addAllowedHeader("*");

        UrlBasedCorsConfigurationSource urlBasedCorsConfigurationSource = new UrlBasedCorsConfigurationSource();
        urlBasedCorsConfigurationSource.registerCorsConfiguration("/**", corsConfiguration);

        return new CorsFilter(urlBasedCorsConfigurationSource);
    }
}
