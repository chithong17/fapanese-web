package com.ktnl.fapanese.configuration;

import io.swagger.v3.oas.models.Operation;
import org.springdoc.core.customizers.OperationCustomizer;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.method.HandlerMethod;

@Configuration
public class SwaggerSecuritySummaryCustomizer {

    @Bean
    public OperationCustomizer addPreAuthorizeToSummary() {
        return (Operation operation, HandlerMethod handlerMethod) -> {
            PreAuthorize preAuthorize = handlerMethod.getMethodAnnotation(PreAuthorize.class);

            if (preAuthorize != null) {
                String value = preAuthorize.value();

                // Rút gọn chuỗi: chỉ giữ lại các ROLE bên trong dấu nháy đơn
                String roles = value.replaceAll(".*\\('([^)]*)'\\).*", "$1")
                        .replaceAll("'", "")
                        .replaceAll("\\s*,\\s*", ", ");

                // Xử lý nếu có nhiều role
                if (roles.contains(",")) {
                    roles = "(" + roles + ")";
                } else {
                    roles = "(" + roles + ")";
                }

                String existingSummary = operation.getSummary() != null ? operation.getSummary() : "";
                operation.setSummary(existingSummary + " 🔒 Access: " + roles);
            }

            return operation;
        };
    }
}
