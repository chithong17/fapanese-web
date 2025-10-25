package com.ktnl.fapanese.configuration;

import com.cloudinary.Cloudinary;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import java.util.HashMap;
import java.util.Map;

@Configuration // Báo cho Spring biết đây là file cấu hình
public class CloudinaryConfig {

    // 1. Tự động đọc "chìa khóa" từ file application.properties
    @Value("${cloudinary.cloud-name}")
    private String cloudName;

    @Value("${cloudinary.api-key}")
    private String apiKey;

    @Value("${cloudinary.api-secret}")
    private String apiSecret;

    // 2. Tạo một Bean (đối tượng) Cloudinary duy nhất cho toàn ứng dụng
    @Bean
    public Cloudinary cloudinary() {
        Map<String, String> configMap = new HashMap<>();
        configMap.put("cloud_name", cloudName);
        configMap.put("api_key", apiKey);
        configMap.put("api_secret", apiSecret);

        // Trả về đối tượng Cloudinary đã được "đăng nhập"
        return new Cloudinary(configMap);
    }
}
