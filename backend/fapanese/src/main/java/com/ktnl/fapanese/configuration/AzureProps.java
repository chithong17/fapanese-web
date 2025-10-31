package com.ktnl.fapanese.configuration;

import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.context.annotation.Configuration;

@Configuration
@ConfigurationProperties(prefix = "azure")
@lombok.Getter @lombok.Setter
public class AzureProps {
    private Speech speech = new Speech();
    private OpenAI openai = new OpenAI();

    @lombok.Getter @lombok.Setter
    public static class Speech { private String key; private String region; }

    @lombok.Getter @lombok.Setter
    public static class OpenAI {
        private String endpoint;
        private String key;
        private String deploymentName; // map từ deployment-name trong YAML
    }
}
