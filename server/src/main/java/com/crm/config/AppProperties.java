package com.crm.config;

import lombok.Getter;
import lombok.Setter;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.stereotype.Component;

import java.util.List;

/**
 * Typed configuration properties bound from the {@code app.*} namespace in application.yml.
 */
@Getter
@Setter
@Component
@ConfigurationProperties(prefix = "app")
public class AppProperties {

    private final Jwt jwt = new Jwt();
    private final Cors cors = new Cors();
    private final Encryption encryption = new Encryption();
    /** WhatsApp Business API credentials for dev mode. Loaded from WA_* env vars. */
    private final WhatsApp whatsApp = new WhatsApp();

    @Getter
    @Setter
    public static class Jwt {
        private String secret;
        private long accessTokenExpiry;
        private long refreshTokenExpiry;
    }

    @Getter
    @Setter
    public static class Cors {
        private List<String> allowedOrigins;
    }

    @Getter
    @Setter
    public static class Encryption {
        private String key;
    }

    /**
     * WhatsApp Business API credentials for development mode.
     * Loaded from WA_* env vars in .env file.
     */
    @Getter
    @Setter
    public static class WhatsApp {
        private String accessToken;
        private String phoneNumberId;
        private String wabaId;
        private String appSecret;
        private String webhookVerifyToken;
    }
}
