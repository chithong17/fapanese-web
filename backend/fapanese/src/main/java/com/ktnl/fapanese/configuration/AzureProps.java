package com.ktnl.fapanese.configuration;

import lombok.Getter;
import lombok.Setter;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.context.annotation.Configuration;

@Configuration
@ConfigurationProperties(prefix = "azure")
@Getter
@Setter
public class AzureProps {
    private Speech speech = new Speech();
    private OpenAI openai = new OpenAI();

    @Getter
    @Setter
    public static class Speech {
        private String key;
        private String region;
    }

    @Getter
    @Setter
    public static class OpenAI {
        private String endpoint;
        private String key;
        private String deploymentName; // map từ deployment-name trong YAML
    }


}
